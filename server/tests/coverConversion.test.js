const test = require("node:test");
const assert = require("node:assert/strict");
const sharp = require("sharp");
const { convertCover, validateCover, MAX_COVER_BYTES } = require("../services/coverConversion");

// Two pages with different fills prove that only page one is rendered.
function twoPagePdf() {
  const stream = content => `<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}endstream`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R 5 0 R] /Count 2 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 400] /Resources << >> /Contents 4 0 R >>",
    stream("1 0 0 rg 0 0 300 400 re f\n"),
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 600 300] /Resources << >> /Contents 6 0 R >>",
    stream("0 0 1 rg 0 0 600 300 re f\n"),
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => { offsets.push(Buffer.byteLength(pdf)); pdf += `${index + 1} 0 obj\n${object}\nendobj\n`; });
  const start = Buffer.byteLength(pdf);
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  pdf += offsets.slice(1).map(offset => `${String(offset).padStart(10, "0")} 00000 n \n`).join("");
  pdf += `trailer\n<< /Root 1 0 R /Size ${objects.length + 1} >>\nstartxref\n${start}\n%%EOF`;
  return Buffer.from(pdf);
}

test("PNG, JPG, JPEG, JEPG and WebP become PNG without cropping", async () => {
  for (const [extension, format] of [["png", "png"], ["jpg", "jpeg"], ["JPEG", "jpeg"], ["jepg", "jpeg"], ["webp", "webp"]]) {
    const input = await sharp({ create: { width: 60, height: 100, channels: 3, background: "#ff0000" } }).toFormat(format).toBuffer();
    const png = await convertCover(input, `my cover.${extension}`);
    const metadata = await sharp(png).metadata();
    assert.equal(metadata.format, "png");
    assert.equal(metadata.width, 60);
    assert.equal(metadata.height, 100);
  }
});

test("PDF renders the full first page with its original aspect ratio", async () => {
  const png = await convertCover(twoPagePdf(), "cover.PDF");
  const { data, info } = await sharp(png).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  assert.equal(info.width / info.height, 3 / 4);
  for (const [x, y] of [[1, 1], [info.width - 2, info.height - 2], [Math.floor(info.width / 2), Math.floor(info.height / 2)]]) {
    const index = (y * info.width + x) * info.channels;
    assert.deepEqual([...data.subarray(index, index + 3)], [255, 0, 0]);
  }
});

test("empty, oversized, unsupported and falsely named cover files are rejected", () => {
  assert.throws(() => validateCover(Buffer.alloc(0), "cover.png"), /non-empty/);
  assert.throws(() => validateCover(Buffer.alloc(MAX_COVER_BYTES + 1), "cover.pdf"), error => error.status === 413);
  for (const name of ["cover.pdf", "cover.doc", "cover.docx", "cover.png", "cover.jpg", "cover.webp", "cover.svg", "cover.exe"]) {
    assert.throws(() => validateCover(Buffer.from("<script>not an image</script>"), name));
  }
});

test("corrupt PDFs fail with a useful error instead of creating a broken image", async () => {
  await assert.rejects(convertCover(Buffer.from("%PDF-1.4\nnot a PDF"), "bad.pdf"), error => error.status === 422);
});

test("Word formats report missing LibreOffice without publishing a broken cover", async () => {
  const previous = process.env.LIBREOFFICE_PATH;
  process.env.LIBREOFFICE_PATH = require("node:path").join(__dirname, "nonexistent-office-executable");
  try {
    for (const [name, signature] of [["cover.doc", "d0cf11e0a1b11ae1"], ["cover.docx", "504b0304"]]) {
      await assert.rejects(convertCover(Buffer.from(signature, "hex"), name), error => error.status === 503 && /LibreOffice/.test(error.message));
    }
  } finally {
    if (previous === undefined) delete process.env.LIBREOFFICE_PATH;
    else process.env.LIBREOFFICE_PATH = previous;
  }
});

test("conversion concurrency is bounded and recovers after jobs finish", async () => {
  const first = convertCover(twoPagePdf(), "first.pdf");
  const second = convertCover(twoPagePdf(), "second.pdf");
  await assert.rejects(convertCover(twoPagePdf(), "third.pdf"), error => error.status === 429);
  await Promise.all([first, second]);
  assert.ok((await convertCover(twoPagePdf(), "retry.pdf")).length > 0);
});

test("browser picker accepts listed formats independent of browser MIME guessing", async () => {
  const { coverFileError, COVER_ACCEPT } = await import("../../client/lib/coverFiles.mjs");
  for (const extension of ["PDF", "DOC", "DOCX", "JPG", "JPEG", "JEPG", "PNG", "WEBP"]) {
    assert.equal(coverFileError({ name: `cover.${extension}`, type: "application/octet-stream", size: 200 }), "");
    assert.ok(COVER_ACCEPT.includes(extension.toLowerCase()));
  }
  assert.match(coverFileError({ name: "file.zip", size: 200 }), /Choose/);
  assert.match(coverFileError({ name: "file.pdf", size: MAX_COVER_BYTES + 1 }), /10 MB/);
});
