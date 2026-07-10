/* ============================================================
   db.js — IndexedDB wrapper (no external libraries)
   Provides a tiny generic CRUD layer over a fixed set of stores.
   ============================================================ */

const DB = (() => {
  const DB_NAME = 'training_center_db';
  const DB_VERSION = 1;
  let dbInstance = null;

  const STORES = {
    students: { keyPath: 'id', indexes: [['courseId', 'courseId', false]] },
    courses: { keyPath: 'id', indexes: [] },
    schedule: { keyPath: 'id', indexes: [['day', 'day', false]] },
    attendance: { keyPath: 'id', indexes: [['studentId', 'studentId', false], ['date', 'date', false]] },
    payments: { keyPath: 'id', indexes: [['studentId', 'studentId', false]] },
    finance: { keyPath: 'id', indexes: [['type', 'type', false], ['date', 'date', false]] },
    materials: { keyPath: 'id', indexes: [['courseId', 'courseId', false]] },
    notes: { keyPath: 'id', indexes: [['type', 'type', false], ['studentId', 'studentId', false]] },
    tasks: { keyPath: 'id', indexes: [] },
    settings: { keyPath: 'key', indexes: [] },
  };

  function open() {
    return new Promise((resolve, reject) => {
      if (dbInstance) return resolve(dbInstance);
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        Object.entries(STORES).forEach(([name, cfg]) => {
          if (!db.objectStoreNames.contains(name)) {
            const store = db.createObjectStore(name, { keyPath: cfg.keyPath });
            cfg.indexes.forEach(([idxName, keyPath, unique]) => {
              store.createIndex(idxName, keyPath, { unique });
            });
          }
        });
      };

      req.onsuccess = (e) => {
        dbInstance = e.target.result;
        resolve(dbInstance);
      };
      req.onerror = (e) => reject(e.target.error);
    });
  }

  async function tx(storeName, mode = 'readonly') {
    const db = await open();
    const transaction = db.transaction(storeName, mode);
    return transaction.objectStore(storeName);
  }

  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  async function getAll(storeName) {
    const store = await tx(storeName);
    return new Promise((resolve, reject) => {
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function get(storeName, key) {
    const store = await tx(storeName);
    return new Promise((resolve, reject) => {
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function put(storeName, value) {
    const store = await tx(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const req = store.put(value);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function add(storeName, value) {
    if (STORES[storeName].keyPath === 'id' && !value.id) value.id = uuid();
    return put(storeName, value);
  }

  async function remove(storeName, key) {
    const store = await tx(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const req = store.delete(key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async function getByIndex(storeName, indexName, value) {
    const store = await tx(storeName);
    return new Promise((resolve, reject) => {
      const idx = store.index(indexName);
      const req = idx.getAll(value);
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }

  async function clearStore(storeName) {
    const store = await tx(storeName, 'readwrite');
    return new Promise((resolve, reject) => {
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async function exportAll() {
    const data = {};
    for (const name of Object.keys(STORES)) {
      data[name] = await getAll(name);
    }
    return data;
  }

  async function importAll(data) {
    for (const name of Object.keys(STORES)) {
      if (!data[name]) continue;
      await clearStore(name);
      const store = await tx(name, 'readwrite');
      for (const item of data[name]) {
        store.put(item);
      }
    }
  }

  return { open, getAll, get, put, add, remove, getByIndex, clearStore, exportAll, importAll, uuid, STORES };
})();
