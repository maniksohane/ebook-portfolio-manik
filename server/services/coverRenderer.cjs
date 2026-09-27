// Runs in a bounded worker, never in the API's event loop.
const { parentPort, workerData } = require("node:worker_threads");
const path = require("node:path");
const sharp = require("sharp");

async function render() {
  const bytes = Buffer.from(workerData.bytes);
  if (workerData.format !== "pdf") {
    const source = sharp(bytes, { limitInputPixels: 40000000, failOn: "warning" });
    const metadata = await source.metadata();
    if (!["png", "jpeg", "webp"].includes(metadata.format)) throw new Error("Invalid image");
    return source.autoOrient().resize({ width: 1600, height: 2000, fit: "inside", withoutEnlargement: true }).png().toBuffer();
  }

  const { getDocument, AnnotationMode } = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const assets = path.dirname(require.resolve("pdfjs-dist/package.json")).replaceAll("\\", "/");
  const loading = getDocument({
    data: new Uint8Array(bytes),
    isEvalSupported: false,
    useSystemFonts: false,
    cMapUrl: `${assets}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${assets}/standard_fonts/`,
    wasmUrl: `${assets}/wasm/`,
    maxImageSize: 40000000,
    verbosity: 0,
  });
  try {
    const pdf = await loading.promise;
    const page = await pdf.getPage(1);
    const original = page.getViewport({ scale: 1 });
    if (!(original.width > 0 && original.height > 0)) throw new Error("Invalid page size");
    const viewport = page.getViewport({ scale: Math.min(1600 / original.width, 2000 / original.height, 3) });
    const target = pdf.canvasFactory.create(Math.ceil(viewport.width), Math.ceil(viewport.height));
    try {
      await page.render({ canvasContext: target.context, viewport, background: "rgb(255,255,255)", annotationMode: AnnotationMode.DISABLE }).promise;
      return target.canvas.toBuffer("image/png");
    } finally {
      pdf.canvasFactory.destroy(target);
      page.cleanup();
    }
  } finally {
    await loading.destroy();
  }
}

render().then(bytes => parentPort.postMessage({ bytes })).catch(() => {
  parentPort.postMessage({ error: "This cover could not be read. Use an undamaged image or an unprotected PDF/Word document." });
});
