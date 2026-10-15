import "server-only";
import { type Db, MongoClient } from "mongodb";

// One client per server instance. In development, hot reload would otherwise
// open a new connection pool on every edit.
const globalForMongo = globalThis as unknown as { _mongo?: MongoClient };

export function mongoClient(): MongoClient {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");
  if (!globalForMongo._mongo) {
    globalForMongo._mongo = new MongoClient(uri, { maxPoolSize: 10 });
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
