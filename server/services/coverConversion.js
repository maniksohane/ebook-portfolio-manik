const fs = require("node:fs/promises");
const { existsSync } = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { execFile } = require("node:child_process");
const { promisify } = require("node:util");
const { Worker } = require("node:worker_threads");

const MAX_COVER_BYTES = 10 * 1024 * 1024;
const COVER_EXTENSIONS = new Set(["png", "jpg", "jpeg", "jepg", "webp", "pdf", "doc", "docx"]);
const execFileAsync = promisify(execFile);
let activeConversions = 0;

function coverError(message, status = 400) {
  return Object.assign(new Error(message), { status });
}

function validateCover(bytes, filename) {
  const extension = typeof filename === "string" ? filename.split(".").pop().toLowerCase() : "";
  if (!COVER_EXTENSIONS.has(extension)) throw coverError("Choose a PDF, DOC, DOCX, PNG, JPG, JPEG or WebP cover.");
  if (!Buffer.isBuffer(bytes) || bytes.length === 0) throw coverError("Choose a non-empty cover file.");
  if (bytes.length > MAX_COVER_BYTES) throw coverError("The cover file must be 10 MB or smaller.", 413);
  const isPdf = bytes.subarray(0, 5).toString() === "%PDF-";
  const isDoc = bytes.subarray(0, 8).equals(Buffer.from("d0cf11e0a1b11ae1", "hex"));
  const isZip = bytes.subarray(0, 4).equals(Buffer.from("504b0304", "hex"));
  const isPng = bytes.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex"));
  const isJpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const isWebp = bytes.subarray(0, 4).toString() === "RIFF" && bytes.subarray(8, 12).toString() === "WEBP";
  const matches = extension === "pdf" ? isPdf : extension === "doc" ? isDoc : extension === "docx" ? isZip : extension === "png" ? isPng : extension === "webp" ? isWebp : isJpg;
  if (!matches) throw coverError("The cover contents do not match its file type. Export the file again instead of renaming its extension.");
  return extension;
}

function officeExecutable() {
  if (process.env.LIBREOFFICE_PATH) return process.env.LIBREOFFICE_PATH;
  if (process.platform === "win32") {
    for (const root of [process.env.ProgramFiles, process.env["ProgramFiles(x86)"]].filter(Boolean)) {
      const exe = path.join(root, "LibreOffice", "program", "soffice.exe");
      if (existsSync(exe)) return exe;
    }
  }
  if (process.platform === "darwin" && existsSync("/Applications/LibreOffice.app/Contents/MacOS/soffice")) return "/Applications/LibreOffice.app/Contents/MacOS/soffice";
  return "soffice";
}

async function wordToPdf(bytes, extension) {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "ebook-cover-"));
  try {
    const profile = path.join(directory, "profile");
    await fs.mkdir(path.join(profile, "user"), { recursive: true });
    // A fresh profile never inherits an administrator's trusted macro settings.
    await fs.writeFile(path.join(profile, "user", "registrymodifications.xcu"), '<?xml version="1.0"?><oor:items xmlns:oor="http://openoffice.org/2001/registry"><item oor:path="/org.openoffice.Office.Common/Security/Scripting"><prop oor:name="MacroSecurityLevel" oor:op="fuse"><value>3</value></prop></item><item oor:path="/org.openoffice.Office.Writer/Content/Update"><prop oor:name="Link" oor:op="fuse"><value>2</value></prop></item></oor:items>');
    const input = path.join(directory, `cover.${extension}`);
    await fs.writeFile(input, bytes);
    try {
      await execFileAsync(officeExecutable(), [
        `-env:UserInstallation=${pathToFileURL(profile).href}`,
        "--headless", "--nologo", "--nodefault", "--norestore",
        "--convert-to", 'pdf:writer_pdf_Export:{"PageRange":{"type":"string","value":"1"}}',
        "--outdir", directory, input,
      ], { timeout: 30000, windowsHide: true, maxBuffer: 1024 * 1024 });
    } catch (error) {
      if (error.code === "ENOENT") throw coverError("Word covers need LibreOffice on the API server. Install it or upload this cover as a PDF, PNG or JPG instead.", 503);
      throw coverError("Word cover conversion failed or timed out. Try exporting the first page as PDF.", 422);
    }
    const output = path.join(directory, "cover.pdf");
    const stat = await fs.stat(output).catch(() => null);
    if (!stat || stat.size > MAX_COVER_BYTES) throw coverError("The Word cover could not be converted. Try exporting its first page as PDF.", 422);
    return await fs.readFile(output);
  } finally {
    // Delete only this mkdtemp-created directory, never any user-provided path.
    const parent = path.resolve(os.tmpdir());
    const resolved = path.resolve(directory);
    if (path.dirname(resolved) === parent && path.basename(resolved).startsWith("ebook-cover-")) {
      await fs.rm(resolved, { recursive: true, force: true, maxRetries: 3 }).catch(() => {});
    }
  }
}

function renderInWorker(bytes, format) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const worker = new Worker(path.join(__dirname, "coverRenderer.cjs"), {
      workerData: { bytes, format },
      resourceLimits: { maxOldGenerationSizeMb: 256 },
    });
    const timeout = setTimeout(() => {
      settled = true;
      worker.terminate();
      reject(coverError("Cover conversion timed out. Try a simpler first-page PDF or an image.", 422));
    }, 30000);
    worker.once("message", result => {
      settled = true;
      clearTimeout(timeout);
      worker.terminate();
      if (result.error) reject(coverError(result.error, 422));
      else resolve(Buffer.from(result.bytes));
    });
    worker.once("error", () => { settled = true; clearTimeout(timeout); reject(coverError("Unable to render this cover. Try a PDF or image export.", 422)); });
    worker.once("exit", () => {
      clearTimeout(timeout);
      if (!settled) reject(coverError("Cover conversion stopped. Try a smaller cover file.", 422));
    });
  });
}

async function convertCover(bytes, filename) {
  const extension = validateCover(bytes, filename);
  if (activeConversions >= 2) throw coverError("Other covers are being processed. Please try again shortly.", 429);
  activeConversions++;
  try {
    const isWord = extension === "doc" || extension === "docx";
    const input = isWord ? await wordToPdf(bytes, extension) : bytes;
    return await renderInWorker(input, isWord || extension === "pdf" ? "pdf" : "image");
  } finally {
    activeConversions--;
  }
}

module.exports = { convertCover, validateCover, MAX_COVER_BYTES, coverError };
