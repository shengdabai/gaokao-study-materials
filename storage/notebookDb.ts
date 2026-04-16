export interface NotebookItem {
  id: number;
  subject: string;
  image: string;
  analysis: string;
  date: string;
}

const DB_NAME = 'gaokao_review_storage';
const DB_VERSION = 1;
const STORE_NAME = 'error_notebook';
const LEGACY_NOTEBOOK_KEY = 'app_error_notebook';

function openNotebookDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function runReadonly<T>(db: IDBDatabase, runner: (store: IDBObjectStore) => Promise<T>): Promise<T> {
  const tx = db.transaction(STORE_NAME, 'readonly');
  const store = tx.objectStore(STORE_NAME);
  return runner(store);
}

function runReadwrite<T>(db: IDBDatabase, runner: (store: IDBObjectStore) => Promise<T>): Promise<T> {
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  return runner(store);
}

function requestToPromise<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function readAllFromDb(db: IDBDatabase): Promise<NotebookItem[]> {
  const items = await runReadonly(db, async (store) => {
    const req = store.getAll();
    return requestToPromise(req);
  });
  return (items as NotebookItem[]).sort((a, b) => b.id - a.id);
}

async function writeAllToDb(db: IDBDatabase, items: NotebookItem[]): Promise<void> {
  await runReadwrite(db, async (store) => {
    await requestToPromise(store.clear());
    for (const item of items) {
      await requestToPromise(store.put(item));
    }
    return Promise.resolve();
  });
}

async function migrateLegacyNotebook(db: IDBDatabase): Promise<void> {
  const existing = await readAllFromDb(db);
  if (existing.length > 0) return;

  const legacyRaw = localStorage.getItem(LEGACY_NOTEBOOK_KEY);
  if (!legacyRaw) return;

  try {
    const parsed = JSON.parse(legacyRaw);
    if (!Array.isArray(parsed)) return;
    const items = parsed.filter((x): x is NotebookItem =>
      typeof x?.id === 'number' &&
      typeof x?.subject === 'string' &&
      typeof x?.image === 'string' &&
      typeof x?.analysis === 'string' &&
      typeof x?.date === 'string',
    );
    if (items.length > 0) {
      await writeAllToDb(db, items);
    }
    localStorage.removeItem(LEGACY_NOTEBOOK_KEY);
  } catch {
    // keep legacy data if parse fails
  }
}

function loadLegacyNotebookFallback(): NotebookItem[] {
  const raw = localStorage.getItem(LEGACY_NOTEBOOK_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((x): x is NotebookItem =>
        typeof x?.id === 'number' &&
        typeof x?.subject === 'string' &&
        typeof x?.image === 'string' &&
        typeof x?.analysis === 'string' &&
        typeof x?.date === 'string',
      )
      .sort((a, b) => b.id - a.id);
  } catch {
    return [];
  }
}

export async function loadNotebook(): Promise<NotebookItem[]> {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
    return loadLegacyNotebookFallback();
  }

  try {
    const db = await openNotebookDb();
    await migrateLegacyNotebook(db);
    return await readAllFromDb(db);
  } catch {
    return loadLegacyNotebookFallback();
  }
}

export async function persistNotebook(items: NotebookItem[]): Promise<void> {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
    localStorage.setItem(LEGACY_NOTEBOOK_KEY, JSON.stringify(items));
    return;
  }

  try {
    const db = await openNotebookDb();
    await writeAllToDb(db, items);
    localStorage.removeItem(LEGACY_NOTEBOOK_KEY);
  } catch {
    localStorage.setItem(LEGACY_NOTEBOOK_KEY, JSON.stringify(items));
  }
}
