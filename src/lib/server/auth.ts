import "server-only";
import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { APIError } from "better-auth/api";
import { ObjectId } from "mongodb";
import { db, mongoClient } from "./db";
import { sendEmail, siteOrigins, siteUrl } from "./email";

export type { Role } from "@/lib/roles";

/**
 * Accounts are only ever created by our own server code (enrollment, admin
 * adding a teacher, first-admin setup), so public sign-up is off. Role and
 * disabled flags can't be set from the browser (input: false).
 *
 * Built on first use, not at import, so `next build` works without the
 * database settings present.
 */
function createAuth() {
  return betterAuth({
    database: mongodbAdapter(db(), { client: mongoClient() }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: siteUrl(),
    trustedOrigins: siteOrigins(),
    emailAndPassword: {
      enabled: true,
      disableSignUp: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      revokeSessionsOnPasswordReset: true,
      resetPasswordTokenExpiresIn: 60 * 60 * 24, // a day, so teacher invites don't expire overnight
      sendResetPassword: async ({ user, url }) => {
        await sendEmail({
          to: user.email,
          subject: "Set your Exambites password",
          text: `Assalam o Alaikum ${user.name},\n\nUse this link to set your password (valid for 24 hours):\n${url}\n\nIf you didn't ask for this, ignore this email.\n\nExambites Creative Academy`,
        });
      },
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: false,
          defaultValue: "student",
          input: false,
        },
        phone: { type: "string", required: false, input: false },
        disabled: {
          type: "boolean",
          required: false,
          defaultValue: false,
          input: false,
        },
      },
    },
    session: {
      expiresIn: 60 * 60 * 24 * 30,
      updateAge: 60 * 60 * 24,
    },
    rateLimit: { enabled: true, window: 60, max: 30 },
    databaseHooks: {
      session: {
        create: {
          // Removed teachers and paused accounts can't start a session.
          before: async (session) => {
            const user = await db()
              .collection("user")
              .findOne({ _id: toId(session.userId) });
            if (user?.disabled) {
              throw new APIError("FORBIDDEN", {
                message:
                  "This account has been deactivated. Contact the academy.",
              });
            }
          },
        },
      },
    },
  });
}

let instance: { auth: ReturnType<typeof createAuth>; client: ReturnType<typeof mongoClient> } | undefined;
export function getAuth() {
  // Rebuilt when the database client was replaced after a lost connection.
  const client = mongoClient();
  if (instance?.client !== client) instance = { auth: createAuth(), client };
  return instance.auth;
}

/**
 * The Mongo adapter stores user ids as ObjectIds but hands them out as
 * strings. Converts back for queries; a non-ObjectId string matches nothing.
 */
export function toId(id: string): ObjectId {
  return ObjectId.isValid(id) && String(new ObjectId(id)) === id
    ? new ObjectId(id)
    : (id as unknown as ObjectId);
}
