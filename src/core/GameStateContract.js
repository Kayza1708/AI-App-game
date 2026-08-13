import { createDefaultState, ENERGY_BUILDINGS, HARDWARE_CATALOG, MODEL_CATALOG } from '../data/defaultState.js';

const normalizedStates = new WeakMap();

export function isCompleteGameState(state) {
  return Boolean(
    state && typeof state === 'object'
    && finiteRecord(state.resources, ['credits','compute','users','research','gems'])
    && finiteRecord(state.hardware, HARDWARE_CATALOG.map(({ id }) => id))
    && state.model && finiteRecord(state.allocation, ['training','inference','research','data','agents'])
    && state.market && state.meta && state.world && state.energy && state.patents
    && state.inventory?.equipped && Array.isArray(state.inventory?.instances)
    && Array.isArray(state.upgrades) && Array.isArray(state.model?.deployed) && Array.isArray(state.model?.owned)
    && MODEL_CATALOG.some(({ id }) => id === state.model.activeId)
    && state.model.progress && state.model.improvements
    && Array.isArray(state.meta.techNodes) && state.meta.achievements
    && Array.isArray(state.world.modifiers) && finiteRecord(state.energy.buildings, ENERGY_BUILDINGS.map(({ id }) => id))
    && Array.isArray(state.patents.equipped) && Array.isArray(state.patents.discovered)
    && state.artifacts && Array.isArray(state.artifacts.owned)
    && state.statistics && state.run && state.session && state.ui
  );
}

/**
 * Establishes the one runtime-state contract used by simulation, telemetry and UI.
 * Complete immutable states keep their identity; partial legacy/test/reset states are
 * hydrated once and cached rather than guarded independently in every formula.
 */
export function ensureGameState(candidate) {
  if (isCompleteGameState(candidate)) return candidate;
  if (candidate && typeof candidate === 'object' && normalizedStates.has(candidate)) return normalizedStates.get(candidate);
  const hydrated = mergeDefaults(createDefaultState(), candidate);
  if (candidate && typeof candidate === 'object') normalizedStates.set(candidate, hydrated);
  return hydrated;
}

function mergeDefaults(defaults, candidate) {
  if (Array.isArray(defaults)) return Array.isArray(candidate) ? [...candidate] : [...defaults];
  if (!isRecord(defaults)) return validPrimitive(candidate, defaults);
  const source = isRecord(candidate) ? candidate : {};
  return Object.fromEntries(Object.entries(defaults).map(([key, fallback]) => [key, mergeDefaults(fallback, source[key])]).concat(
    Object.entries(source).filter(([key]) => !(key in defaults)),
  ));
}

function isRecord(value) { return Boolean(value) && typeof value === 'object' && !Array.isArray(value); }
function finiteRecord(value, keys) { return isRecord(value) && keys.every((key) => Number.isFinite(value[key])); }
function validPrimitive(value, fallback) {
  if (typeof fallback === 'number') return Number.isFinite(value) ? value : fallback;
  return value === undefined || value === null ? fallback : value;
}
