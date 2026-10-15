import { getAuth } from "@/lib/server/auth";

// Better Auth endpoints: sign in, sign out, session, password reset.
export const GET = (request: Request) => getAuth().handler(request);
export const POST = (request: Request) => getAuth().handler(request);
