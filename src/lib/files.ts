/** Lesson attachments: what can be uploaded and how it's shown. Shared by server and browser. */
export const MAX_FILE_BYTES = 100 * 1024 * 1024;
export const MAX_FILES_PER_LESSON = 20;

export const FILE_TYPES: Record<string, string> = {
  "application/pdf": "PDF",
  "application/msword": "Word",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word",
  "application/vnd.ms-powerpoint": "PowerPoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PowerPoint",
  "application/vnd.ms-excel": "Excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel",
  "text/plain": "Text",
  "text/csv": "CSV",
  "application/zip": "ZIP",
  "application/x-zip-compressed": "ZIP",
  "image/png": "Image",
  "image/jpeg": "Image",
  "image/webp": "Image",
};

/** Extension fallback: some computers don't label Office files. */
const BY_EXT: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ppt: "application/vnd.ms-powerpoint",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  xls: "application/vnd.ms-excel",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  txt: "text/plain",
  csv: "text/csv",
  zip: "application/zip",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
};

export const ACCEPT = Object.keys(BY_EXT).map((e) => `.${e}`).join(",");

export function fileType(name: string, browserType: string) {
  if (FILE_TYPES[browserType]) return browserType;
  return BY_EXT[name.split(".").pop()?.toLowerCase() ?? ""] ?? null;
}

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(n < 10 * 1024 * 1024 ? 1 : 0)} MB`;
}

/** Safe file name for storage paths. */
export const safeName = (name: string) =>
  name.normalize("NFKD").replace(/[^\w.\- ]+/g, "").trim().replace(/\s+/g, "-").slice(-80) || "file";
