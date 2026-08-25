import { createDefaultState, HARDWARE_CATALOG, LEGACY_HARDWARE_UPGRADES, MODEL_CATALOG, SAVE_VERSION } from '../data/defaultState.js';
import { FEATURE_UNLOCKS } from '../config/balance.js';
import { ensureGameState } from '../core/GameStateContract.js';

const STORAGE_KEY = 'ai-singularity-save';
const SAVE_INTERVAL_MS = 15_000;

export class SaveSystem {
  #intervalId = null;
  #store;

  constructor(store) {
    this.#store = store;
  }

  load() {
    try {
      const serializedSave = localStorage.getItem(STORAGE_KEY);
      if (!serializedSave) return null;
      const save = JSON.parse(serializedSave);
      return this.#isValid(save) ? this.#mergeWithDefaults(save) : null;
    } catch {
      return null;
    }
  }

  save() {
    try {
      const state = this.#store.getState();
      const nextState = {
        ...state,
        offline: { ...state.offline, lastActiveTimestamp: Date.now() },
        session: { ...state.session, lastSavedAt: Date.now() },
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
      this.#store.replace(nextState, 'save');
      return true;
    } catch (error) {
      globalThis.console?.error('Autosave failed; the current game remains playable.', error);
      return false;
    }
  }

  startAutosave() {
    if (this.#intervalId === null) {
      this.#intervalId = window.setInterval(() => this.save(), SAVE_INTERVAL_MS);
    }
  }

  stopAutosave() {
    if (this.#intervalId !== null) window.clearInterval(this.#intervalId);
    this.#intervalId = null;
  }

  #isValid(save) {
    return Number.isInteger(save?.version) && save.version > 0 && save.version <= SAVE_VERSION && typeof save.resources?.credits === 'number' && typeof save.model?.level === 'number';
  }

  #mergeWithDefaults(save) {
    const defaults = createDefaultState();
    const legacyModelIds = { codeMind: 'gptClass', visionNet: 'omni', enterpriseGpt: 'enterprise', agentOs: 'agent', scientificAi: 'research', agiCore: 'agi' };
    const owned = [...new Set(asArray(save.model?.owned, defaults.model.owned).map((id) => legacyModelIds[id] ?? id))];
    const requestedActiveId = legacyModelIds[save.model?.activeId] ?? save.model?.activeId;
    const activeId = owned.includes(requestedActiveId) && MODEL_CATALOG.some(({ id }) => id === requestedActiveId) ? requestedActiveId : defaults.model.activeId;
    const migratedProgress = Object.fromEntries(Object.entries(asObject(save.model?.progress)).map(([id, value]) => [legacyModelIds[id] ?? id, asObject(value)]));
    const progress = { ...defaults.model.progress, ...migratedProgress };
    progress[activeId] ??= { level: save.model?.level ?? 1, xp: save.model?.xp ?? 0, upgradePoints: save.model?.upgradePoints ?? 0, skills: save.model?.improvements?.[activeId] ?? {} };
    const featureUnlockTimes = { ...defaults.meta.featureUnlockTimes, ...save.meta?.featureUnlockTimes };
    for (const feature of FEATURE_UNLOCKS) if (feature.int <= (save.meta?.totalIntelligence ?? 0) && featureUnlockTimes[feature.id] === undefined) featureUnlockTimes[feature.id] = save.statistics?.playTimeMs ?? 0;
    const requestedDeployment = [...new Set(asArray(save.model?.deployed, defaults.model.deployed).map((id) => legacyModelIds[id] ?? id).filter((id) => owned.includes(id)))];
    const deployed = requestedDeployment.length ? requestedDeployment.slice(0, 3) : [defaults.model.activeId];
    const hardwareUpgradeLevels = migrateHardwareUpgrades(defaults.hardwareUpgradeLevels, save);
    const migratedTechNodes = migrateSystemTech(save);
    return ensureGameState({
      ...defaults, ...save, version: SAVE_VERSION,
      profile: { ...defaults.profile, ...asObject(save.profile) }, resources: numericRecord(defaults.resources, save.resources),
      hardware: numericRecord(defaults.hardware, save.hardware), hardwareUpgradeLevels, model: { ...defaults.model, ...asObject(save.model), activeId, trainingTarget: activeId, owned, deployed, improvements: asObject(save.model?.improvements), progress },
      allocation: normalizedAllocation(defaults.allocation, save.allocation), market: numericRecord(defaults.market, save.market),
      upgrades: asArray(save.upgrades).filter((id) => !LEGACY_HARDWARE_UPGRADES.some((upgrade) => upgrade.id === id)), tutorial: { ...defaults.tutorial, ...asObject(save.tutorial) }, objectives: { ...defaults.objectives, ...asObject(save.objectives) },
      meta: { ...defaults.meta, ...asObject(save.meta), unlockedModels: [...new Set([...asArray(save.meta?.unlockedModels), ...owned])], techNodes: migratedTechNodes, achievements: { ...defaults.meta.achievements, ...asObject(save.meta?.achievements) }, featureUnlockTimes, cycleHistory: asArray(save.meta?.cycleHistory) },
      world: { ...defaults.world, ...asObject(save.world), modifiers: asArray(save.world?.modifiers), activeEvent: asObject(save.world?.activeEvent).id ? save.world.activeEvent : null }, company: { ...defaults.company, ...asObject(save.company), employees: numericRecord(defaults.company.employees, save.company?.employees) },
      automation: { ...defaults.automation, ...save.automation },
      energy: { ...defaults.energy, ...save.energy, buildings: { ...defaults.energy.buildings, ...save.energy?.buildings } },
      patents: { ...defaults.patents, ...asObject(save.patents), discovered: asArray(save.patents?.discovered), equipped: asArray(save.patents?.equipped), history: asArray(save.patents?.history), levels: asObject(save.patents?.levels), intInvested: asObject(save.patents?.intInvested) }, premium: { ...defaults.premium, ...asObject(save.premium), purchases: asArray(save.premium?.purchases), adCooldowns: { ...defaults.premium.adCooldowns, ...asObject(save.premium?.adCooldowns) } },
      retention: { ...defaults.retention, ...asObject(save.retention), claimedDaily: { ...defaults.retention.claimedDaily, ...asObject(save.retention?.claimedDaily) }, claimedWeekly: { ...defaults.retention.claimedWeekly, ...asObject(save.retention?.claimedWeekly) } },
      inventory: { ...defaults.inventory, ...asObject(save.inventory), instances: asArray(save.inventory?.instances).filter((item) => item && typeof item.instanceId === 'string' && typeof item.catalogId === 'string'), equipped: asObject(save.inventory?.equipped), collection: { ...defaults.inventory.collection, ...asObject(save.inventory?.collection), items: asArray(save.inventory?.collection?.items), rarities: asArray(save.inventory?.collection?.rarities), sets: asArray(save.inventory?.collection?.sets) }, newItem: null },
      consumables: numericMap(save.consumables), rewardCaches: numericMap(save.rewardCaches),
      missions: { ...defaults.missions, ...asObject(save.missions), daily: asArray(save.missions?.daily), weekly: asArray(save.missions?.weekly), monthly: asArray(save.missions?.monthly), claims: asObject(save.missions?.claims) },
      gemEconomy: { ...defaults.gemEconomy, ...asObject(save.gemEconomy), history: asArray(save.gemEconomy?.history) },
      rewardedBoosts: { ...defaults.rewardedBoosts, ...asObject(save.rewardedBoosts), claims: asObject(save.rewardedBoosts?.claims) },
      artifacts: { ...defaults.artifacts, ...asObject(save.artifacts), owned: asArray(save.artifacts?.owned), collection: asArray(save.artifacts?.collection) },
      marketplace: { ...defaults.marketplace, ...asObject(save.marketplace), enabled: false, authority: 'server-required', listings: [], pendingTransactions: [] },
      futureMeta: { ...defaults.futureMeta, ...asObject(save.futureMeta), materials: numericMap(save.futureMeta?.materials), blueprints: asArray(save.futureMeta?.blueprints) },
      offline: { ...defaults.offline, ...asObject(save.offline), capMs: Number.isFinite(save.offline?.capMs) ? Math.max(0, save.offline.capMs) : defaults.offline.capMs, results: asObject(save.offline?.results) },
      rewards: { ...defaults.rewards, ...asObject(save.rewards), queue: asArray(save.rewards?.queue), history: asArray(save.rewards?.history) },
      balanceRun: { ...defaults.balanceRun, ...asObject(save.balanceRun) },
      settings: { ...defaults.settings, ...asObject(save.settings) }, statistics: numericRecord(defaults.statistics, save.statistics),
      run: numericRecord(defaults.run, save.run),
      session: { ...defaults.session, ...asObject(save.session) }, ui: { ...defaults.ui, ...asObject(save.ui), toast: asObject(save.ui?.toast).message ? save.ui.toast : null },
    });
  }
}

function asObject(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
function asArray(value, fallback = []) { return Array.isArray(value) ? value : fallback; }
function numericRecord(defaults, value) { const source = asObject(value); return Object.fromEntries(Object.entries(defaults).map(([key, initial]) => [key, Number.isFinite(source[key]) && source[key] >= 0 ? source[key] : initial])); }
function numericMap(value) { return Object.fromEntries(Object.entries(asObject(value)).filter(([, amount]) => Number.isFinite(amount) && amount >= 0)); }
function normalizedAllocation(defaults, value) { const allocation = numericRecord(defaults, value); const total = Object.values(allocation).reduce((sum, amount) => sum + amount, 0); if (!total) return defaults; const entries = Object.entries(allocation); const normalized = Object.fromEntries(entries.map(([key, amount]) => [key, Math.round(amount / total * 100)])); normalized[entries.at(-1)[0]] += 100 - Object.values(normalized).reduce((sum, amount) => sum + amount, 0); return normalized; }

function migrateHardwareUpgrades(defaults, save) {
  const explicit = asObject(save.hardwareUpgradeLevels);
  const levels = Object.fromEntries(HARDWARE_CATALOG.map(({id}) => [id, numericRecord(defaults[id], explicit[id])]));
  if (save.version >= 13) return levels;
  for (const hardware of HARDWARE_CATALOG) {
    const count = asArray(save.upgrades).filter((id) => LEGACY_HARDWARE_UPGRADES.some((upgrade) => upgrade.id === id && upgrade.hardwareId === hardware.id)).length;
    for (let index = 0; index < count; index += 1) { const track = ['processor','memory','optimization'][index % 3]; levels[hardware.id][track] += 1; }
  }
  return levels;
}
function migrateSystemTech(save) {
  const nodes = new Set(asArray(save.meta?.techNodes));
  if (save.version >= 13) return [...nodes];
  const total = save.meta?.totalIntelligence ?? 0;
  const legacy = [[1,'system-model-engineering'],[4,'system-marketing'],[10,'system-allocation'],[10,'system-research'],[15,'system-items'],[20,'system-patents'],[20,'system-account'],[80,'system-automation'],[120,'system-agents'],[170,'system-enterprise'],[350,'system-energy']];
  for (const [threshold,id] of legacy) if (total >= threshold) nodes.add(id);
  return [...nodes];
}

function asObject(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
function asArray(value, fallback = []) { return Array.isArray(value) ? value : fallback; }
function numericRecord(defaults, value) { const source = asObject(value); return Object.fromEntries(Object.entries(defaults).map(([key, initial]) => [key, Number.isFinite(source[key]) && source[key] >= 0 ? source[key] : initial])); }
function numericMap(value) { return Object.fromEntries(Object.entries(asObject(value)).filter(([, amount]) => Number.isFinite(amount) && amount >= 0)); }
function normalizedAllocation(defaults, value) { const allocation = numericRecord(defaults, value); const total = Object.values(allocation).reduce((sum, amount) => sum + amount, 0); if (!total) return defaults; const entries = Object.entries(allocation); const normalized = Object.fromEntries(entries.map(([key, amount]) => [key, Math.round(amount / total * 100)])); normalized[entries.at(-1)[0]] += 100 - Object.values(normalized).reduce((sum, amount) => sum + amount, 0); return normalized; }
