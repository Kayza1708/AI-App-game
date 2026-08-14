import { createDefaultState, ENERGY_BUILDINGS, HARDWARE_CATALOG, MODEL_CATALOG, SAVE_VERSION } from '../data/defaultState.js';

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
    && state.rewards && Array.isArray(state.rewards.queue) && Array.isArray(state.rewards.history)
    && state.statistics && state.run && state.session && state.ui
  );
}

/** Validate the runtime contract without repairing it. Intended for developer fail-fast checks. */
export function validateGameState(state, economy = null) {
  const failures = [];
  if (!state || typeof state !== 'object') failures.push('state is not an object');
  if (!finiteRecord(state?.resources, ['credits','compute','users','research','gems'])) failures.push('resources contain missing, NaN, or infinite values');
  if (!finiteRecord(state?.hardware, HARDWARE_CATALOG.map(({ id }) => id))) failures.push('hardware catalog record is incomplete or invalid');
  if (!state?.model || !Array.isArray(state.model.owned) || !Array.isArray(state.model.deployed) || !MODEL_CATALOG.some(({ id }) => id === state.model.activeId)) failures.push('model ownership, deployment, or active model is invalid');
  if (!finiteRecord(state?.allocation, ['training','inference','research','data','agents'])) failures.push('compute allocation is incomplete or non-finite');
  if (!Array.isArray(state?.patents?.discovered) || !Array.isArray(state?.patents?.equipped) || !isRecord(state?.patents?.levels)) failures.push('patent state is invalid');
  if (!Array.isArray(state?.world?.modifiers) || state.world.modifiers.some((item) => !item || typeof item.effect !== 'string' || !Number.isFinite(item.value))) failures.push('world modifiers are invalid');
  if (!Array.isArray(state?.inventory?.instances) || !isRecord(state?.inventory?.equipped)) failures.push('inventory or equipped items are missing');
  if (!Array.isArray(state?.rewards?.queue) || !Array.isArray(state?.rewards?.history) || !Number.isInteger(state?.rewards?.nextId)) failures.push('reward queue is invalid');
  if (state?.version !== SAVE_VERSION) failures.push(`state version ${String(state?.version)} does not match save version ${SAVE_VERSION}`);
  if (economy !== null) {
    const keys = ECONOMY_KEYS;
    if (!economy || typeof economy !== 'object' || keys.some((key) => economy[key] === undefined)) failures.push('economy snapshot is incomplete');
    if (ECONOMY_NUMERIC_KEYS.some((key) => !Number.isFinite(economy?.[key]))) failures.push('economy snapshot contains NaN or infinite values');
  }
  if (failures.length) throw new TypeError(`Invalid game state:\n- ${failures.join('\n- ')}`);
  return true;
}

const ECONOMY_NUMERIC_KEYS = ['credits','creditsPerSecond','compute','computePerSecond','computeConsumed','computeWasted','users','demand','capacity','energyProduction','energyDemand'];
const ECONOMY_KEYS = [...ECONOMY_NUMERIC_KEYS, 'currentModel', 'bottleneck'];

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
