const open = () => new Promise((res, rej) => {
  const r = indexedDB.open('jejak-kopi', 1);
  r.onupgradeneeded = () => r.result.createObjectStore('kv');
  r.onsuccess = () => res(r.result);
  r.onerror = () => rej(r.error);
});

export async function loadVisits() {
  try {
    const db = await open();
    return await new Promise(res => {
      const q = db.transaction('kv').objectStore('kv').get('visits');
      q.onsuccess = () => res(q.result || []);
      q.onerror = () => res([]);
    });
  } catch { return []; }
}

export async function saveVisits(visits) {
  const db = await open();
  return new Promise((res, rej) => {
    const t = db.transaction('kv', 'readwrite');
    t.objectStore('kv').put(visits, 'visits');
    t.oncomplete = res; t.onerror = () => rej(t.error); t.onabort = () => rej(t.error);
  });
}
