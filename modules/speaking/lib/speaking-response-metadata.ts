import type { SpeakingLocalResponse } from "./speaking-response-state";

const DATABASE = "bandforge-speaking";
const STORE = "response-metadata";
const VERSION = 1;

export type StoredSpeakingResponseMetadata = Pick<
  SpeakingLocalResponse,
  | "questionId"
  | "part"
  | "sequence"
  | "status"
  | "durationSec"
  | "capturedAt"
  | "error"
  | "idempotencyKey"
  | "prepStartedAt"
> & {
  scope: string;
  updatedAt: string;
};

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: ["scope", "questionId"] });
        store.createIndex("scope", "scope");
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function persistSpeakingResponseMetadata(
  metadata: Omit<StoredSpeakingResponseMetadata, "updatedAt">,
): Promise<void> {
  if (typeof indexedDB === "undefined") return;
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, "readwrite");
    transaction.objectStore(STORE).put({
      ...metadata,
      updatedAt: new Date().toISOString(),
    });
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}

export async function readSpeakingResponseMetadata(
  scope: string,
): Promise<StoredSpeakingResponseMetadata[]> {
  if (typeof indexedDB === "undefined") return [];
  const db = await openDatabase();
  const values = await new Promise<StoredSpeakingResponseMetadata[]>((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).index("scope").getAll(scope);
    request.onsuccess = () => resolve(request.result as StoredSpeakingResponseMetadata[]);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return values;
}

export async function clearSpeakingResponseMetadata(scope: string): Promise<void> {
  const entries = await readSpeakingResponseMetadata(scope);
  if (entries.length === 0) return;
  const db = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, "readwrite");
    const store = transaction.objectStore(STORE);
    entries.forEach((entry) => store.delete([scope, entry.questionId]));
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  db.close();
}
