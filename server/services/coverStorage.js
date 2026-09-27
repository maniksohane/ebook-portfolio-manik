const { randomUUID } = require("node:crypto");
const supabase = require("../config/supabase");
const { convertCover, MAX_COVER_BYTES, coverError } = require("./coverConversion");

function validateStoragePath(value) {
  if (typeof value !== "string" || !value.trim() || value.length > 500 || /[:\\?#%\x00-\x1f]/.test(value) || value.split("/").some(part => !part || part === "." || part === "..")) {
    throw coverError("Enter the path inside ebook-covers, for example covers/my-cover.pdf, not a URL.");
  }
  return value;
}

async function saveCover(bytes, filename) {
  const png = await convertCover(bytes, filename);
  const coverPath = `covers/generated-${randomUUID()}.png`;
  const { error } = await supabase.storage.from("ebook-covers").upload(coverPath, png, { contentType: "image/png", cacheControl: "31536000", upsert: false });
  if (error) throw coverError("The converted cover could not be saved. Please try again.", 502);
  return { cover_path: coverPath, coverImage: supabase.storage.from("ebook-covers").getPublicUrl(coverPath).data.publicUrl };
}

async function downloadCover(storagePath) {
  const validPath = validateStoragePath(storagePath);
  // Fixed public bucket and configured Supabase origin: never fetch a supplied URL.
  const url = supabase.storage.from("ebook-covers").getPublicUrl(validPath).data.publicUrl;
  const response = await fetch(url, { signal: AbortSignal.timeout(20000), redirect: "error" });
  if (!response.ok) throw coverError("That cover was not found in ebook-covers. Check the full storage path.", 404);
  if (Number(response.headers.get("content-length")) > MAX_COVER_BYTES) {
    await response.body.cancel();
    throw coverError("The cover file must be 10 MB or smaller.", 413);
  }
  const chunks = [];
  let size = 0;
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > MAX_COVER_BYTES) throw coverError("The cover file must be 10 MB or smaller.", 413);
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

async function importStoredCover(storagePath) {
  const bytes = await downloadCover(storagePath);
  return saveCover(bytes, storagePath);
}

module.exports = { saveCover, importStoredCover, downloadCover, validateStoragePath };
