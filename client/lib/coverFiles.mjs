export const COVER_ACCEPT = ".pdf,.doc,.docx,.png,.jpg,.jpeg,.jepg,.webp";
export const COVER_HELP = "PDF, DOC, DOCX, PNG, JPG, JPEG or WebP · Maximum 10 MB. Documents use their complete first page as the cover.";

export function coverFileError(file) {
  if (!file) return "";
  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!["pdf", "doc", "docx", "png", "jpg", "jpeg", "jepg", "webp"].includes(extension)) {
    return "Choose a PDF, DOC, DOCX, PNG, JPG, JPEG or WebP cover.";
  }
  if (!file.size) return "Choose a non-empty cover file.";
  if (file.size > 10 * 1024 * 1024) return "The cover file must be 10 MB or smaller.";
  // Browsers report inconsistent MIME types for Word documents. The API validates
  // the actual bytes, decodes the file and stores only a generated PNG.
  return "";
}
