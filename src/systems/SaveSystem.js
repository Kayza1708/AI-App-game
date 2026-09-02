// Compatibility export for tools outside the runtime. The application imports the
// versioned persistence module directly so stale localhost module maps are bypassed.
export { SaveSystem } from './PersistentSaveSystem.js';
