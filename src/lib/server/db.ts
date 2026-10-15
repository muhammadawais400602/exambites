import "server-only";
import { type Db, MongoClient } from "mongodb";

// One client per server instance. In development, hot reload would otherwise
// open a new connection pool on every edit.
const globalForMongo = globalThis as unknown as { _mongo?: MongoClient };

export function mongoClient(): MongoClient {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (!globalForMongo._mongo) {
    const client = new MongoClient(uri, { maxPoolSize: 10 });
    // A failed first connection closes the client for good; drop it so the
    // next request starts a fresh one instead of failing until a restart.
    client.on("topologyClosed", () => {
      if (globalForMongo._mongo === client) globalForMongo._mongo = undefined;
    });
    globalForMongo._mongo = client;
  }
  return globalForMongo._mongo;
}

export function db(): Db {
  return mongoClient().db(process.env.MONGODB_DB || "exambites");
}

let indexesReady: Promise<void> | null = null;

/** Creates the app's indexes once per server instance. Safe to call often. */
export function ensureIndexes() {
  indexesReady ??= (async () => {
    const d = db();
    await Promise.all([
      d.collection("enrollments").createIndex({ userId: 1 }, { unique: true }),
      d.collection("enrollments").createIndex({ reference: 1 }, { unique: true }),
      d.collection("enrollments").createIndex({ status: 1, createdAt: -1 }),
      d.collection("referralCodes").createIndex({ code: 1 }, { unique: true }),
      d.collection("auditLogs").createIndex({ createdAt: -1 }),
    ]);
  })().catch((err) => {
    indexesReady = null;
    throw err;
  });
  return indexesReady;
}

/**
 * Plain-language cause for a failed database call, for screens where the
 * admin can fix it (setup). Returns null for errors that aren't about the
 * connection.
 */
export function describeDbError(err: unknown): string | null {
  const e = err as { name?: string; code?: number | string; message?: string };
  const msg = String(e?.message ?? "");
  if (msg.includes("MONGODB_URI is not set")) return "MONGODB_URI is missing in the Vercel settings. Add it and redeploy.";
  if (e?.name === "MongoParseError" || /Invalid scheme|URI must include|Invalid connection string/i.test(msg)) {
    return "MONGODB_URI is not a valid connection string. It must start with mongodb+srv:// and contain no < or >.";
  }
  if (e?.code === 18 || e?.code === 8000 || /bad auth|Authentication failed/i.test(msg)) {
    return "The database rejected the username or password in MONGODB_URI. Check both in Atlas → Database Access.";
  }
  if (/querySrv|ENOTFOUND/i.test(msg)) return "The database address in MONGODB_URI can't be found. Copy the connection string from Atlas again.";
  if (e?.name === "MongoServerSelectionError" || e?.name === "MongoNetworkError" || e?.name === "MongoTopologyClosedError" || /ECONNREFUSED|timed out|Server selection/i.test(msg)) {
    return "Can't reach the database. In Atlas → Network Access, allow access from anywhere (0.0.0.0/0).";
  }
  return null;
}
