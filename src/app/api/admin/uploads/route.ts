import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { getLesson } from "@/lib/server/courses";
import { requireApiRole } from "@/lib/server/session";
import { FILE_TYPES, MAX_FILE_BYTES } from "@/lib/files";

/**
 * Gives the admin's browser a short-lived token to upload a lesson file
 * straight to Vercel Blob (so large files skip our 4.5 MB request limit).
 * The file is then registered on the lesson by the attachments route.
 */
export async function POST(request: Request) {
  const admin = await requireApiRole(request, "admin");
  if (admin instanceof Response) return admin;
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json({ error: "File storage isn't connected yet. In Vercel: Storage → Create → Blob → connect it to this project." }, { status: 503 });
  }
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, lessonId) => {
        const lesson = lessonId ? await getLesson(lessonId) : null;
        if (!lesson || !pathname.startsWith(`lessons/${lesson.id}/`)) throw new Error("Unknown lesson.");
        return { allowedContentTypes: Object.keys(FILE_TYPES), maximumSizeInBytes: MAX_FILE_BYTES, addRandomSuffix: true };
      },
    });
    return Response.json(result);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Upload failed." }, { status: 400 });
  }
}
