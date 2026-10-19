import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { MAX_SUBMISSION_BYTES } from "@/lib/server/assignments";
import { CAPSTONE_TYPES, MAX_CAPSTONE_BYTES, capstoneProgress } from "@/lib/server/capstone";
import { lessonForStudent } from "@/lib/server/learning";
import { requireApiRole } from "@/lib/server/session";
import { FILE_TYPES } from "@/lib/files";

/**
 * Upload token for a student's file, limited to their own folder: an
 * assignment file (clientPayload = lessonId) or a capstone screenshot
 * (clientPayload = "capstone").
 */
export async function POST(request: Request) {
  const user = await requireApiRole(request, "student");
  if (user instanceof Response) return user;
  if (!process.env.BLOB_READ_WRITE_TOKEN) return Response.json({ error: "File uploads aren't available yet. Add a link instead." }, { status: 503 });
  const body = (await request.json()) as HandleUploadBody;
  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, lessonId) => {
        if (lessonId === "capstone") {
          if (!pathname.startsWith(`capstone/${user.id}/`) || !(await capstoneProgress(user.id)).unlocked) throw new Error("Not allowed.");
          return { allowedContentTypes: CAPSTONE_TYPES, maximumSizeInBytes: MAX_CAPSTONE_BYTES, addRandomSuffix: true };
        }
        const found = lessonId ? await lessonForStudent(user.id, lessonId) : null;
        if (!found?.lesson.assignment || !pathname.startsWith(`submissions/${found.lesson.id}/${user.id}/`)) throw new Error("Not allowed.");
        return { allowedContentTypes: Object.keys(FILE_TYPES), maximumSizeInBytes: MAX_SUBMISSION_BYTES, addRandomSuffix: true };
      },
    });
    return Response.json(result);
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : "Upload failed." }, { status: 400 });
  }
}
