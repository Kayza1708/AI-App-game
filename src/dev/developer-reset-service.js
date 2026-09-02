const GAME_STORAGE_PREFIXES = ['ai-singularity', 'ai_singularity'];
export const FRESH_RESET_MARKER = 'ai-singularity-dev-reset-fresh';

export class DeveloperResetService {
  constructor({ local = globalThis.localStorage, session = globalThis.sessionStorage, database = globalThis.indexedDB } = {}) {
    this.local = local;
    this.session = session;
    this.database = database;
  }

  async reset({ telemetry, replaceState, reload }) {
    telemetry?.clearAll();
    clearMatchingStorage(this.local);
    clearMatchingStorage(this.session);
    await clearGameDatabases(this.database);
    replaceState();
    this.session?.setItem(FRESH_RESET_MARKER, '1');
    reload();
  }

  consumeFreshResetMarker() {
    const fresh = this.session?.getItem(FRESH_RESET_MARKER) === '1';
    if (fresh) this.session.removeItem(FRESH_RESET_MARKER);
    return fresh;
  }
}

export function clearMatchingStorage(storage) {
  if (!storage) return;
  const keys = Array.from({ length: storage.length ?? 0 }, (_, index) => storage.key(index)).filter(Boolean);
  keys.filter((key) => GAME_STORAGE_PREFIXES.some((prefix) => key.startsWith(prefix))).forEach((key) => storage.removeItem(key));
}

export async function clearGameDatabases(database) {
  if (!database?.databases) return;
  try {
    const databases = await database.databases();
    await Promise.all(databases.filter(({ name }) => name && GAME_STORAGE_PREFIXES.some((prefix) => name.startsWith(prefix))).map(({ name }) => new Promise((resolve) => {
      const request = database.deleteDatabase(name);
      request.onsuccess = resolve;
      request.onerror = resolve;
      request.onblocked = resolve;
    })));
  } catch (error) {
    globalThis.console?.warn('Developer reset could not enumerate IndexedDB; continuing with fresh game state.', error);
  }
}
