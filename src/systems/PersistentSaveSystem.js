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
    const owned = [...new Set(readSaveArray(save.model?.owned, defaults.model.owned).map((id) => legacyModelIds[id] ?? id))];
    const requestedActiveId = legacyModelIds[save.model?.activeId] ?? save.model?.activeId;
    const activeId = owned.includes(requestedActiveId) && MODEL_CATALOG.some(({ id }) => id === requestedActiveId) ? requestedActiveId : defaults.model.activeId;
    const migratedProgress = Object.fromEntries(Object.entries(readSaveObject(save.model?.progress)).map(([id, value]) => [legacyModelIds[id] ?? id, readSaveObject(value)]));
    const progress = { ...defaults.model.progress, ...migratedProgress };
    progress[activeId] ??= { level: save.model?.level ?? 1, xp: save.model?.xp ?? 0, upgradePoints: save.model?.upgradePoints ?? 0, skills: save.model?.improvements?.[activeId] ?? {} };
    const featureUnlockTimes = { ...defaults.meta.featureUnlockTimes, ...save.meta?.featureUnlockTimes };
    for (const feature of FEATURE_UNLOCKS) if (feature.int <= (save.meta?.totalIntelligence ?? 0) && featureUnlockTimes[feature.id] === undefined) featureUnlockTimes[feature.id] = save.statistics?.playTimeMs ?? 0;
    const requestedDeployment = [...new Set(readSaveArray(save.model?.deployed, defaults.model.deployed).map((id) => legacyModelIds[id] ?? id).filter((id) => owned.includes(id)))];
    const deployed = requestedDeployment.length ? requestedDeployment.slice(0, 3) : [defaults.model.activeId];
    const hardwareUpgradeLevels = migrateLegacyHardwareUpgradeTracks(defaults.hardwareUpgradeLevels, save);
    const migratedTechNodes = migrateLegacySystemTechnologyNodes(save);
    return ensureGameState({
      ...defaults, ...save, version: SAVE_VERSION,
      profile: { ...defaults.profile, ...readSaveObject(save.profile) }, resources: readSaveNumericRecord(defaults.resources, save.resources),
      hardware: readSaveNumericRecord(defaults.hardware, save.hardware), hardwareUpgradeLevels, model: { ...defaults.model, ...readSaveObject(save.model), activeId, trainingTarget: activeId, owned, deployed, improvements: readSaveObject(save.model?.improvements), progress },
      allocation: normalizeSavedAllocation(defaults.allocation, save.allocation), market: readSaveNumericRecord(defaults.market, save.market),
      upgrades: readSaveArray(save.upgrades).filter((id) => !LEGACY_HARDWARE_UPGRADES.some((upgrade) => upgrade.id === id)), tutorial: { ...defaults.tutorial, ...readSaveObject(save.tutorial) }, objectives: { ...defaults.objectives, ...readSaveObject(save.objectives) },
      meta: { ...defaults.meta, ...readSaveObject(save.meta), unlockedModels: [...new Set([...readSaveArray(save.meta?.unlockedModels), ...owned])], techNodes: migratedTechNodes, achievements: { ...defaults.meta.achievements, ...readSaveObject(save.meta?.achievements) }, featureUnlockTimes, cycleHistory: readSaveArray(save.meta?.cycleHistory) },
      world: { ...defaults.world, ...readSaveObject(save.world), modifiers: readSaveArray(save.world?.modifiers), activeEvent: readSaveObject(save.world?.activeEvent).id ? save.world.activeEvent : null }, company: { ...defaults.company, ...readSaveObject(save.company), employees: readSaveNumericRecord(defaults.company.employees, save.company?.employees) },
      automation: { ...defaults.automation, ...save.automation },
      energy: { ...defaults.energy, ...save.energy, buildings: { ...defaults.energy.buildings, ...save.energy?.buildings } },
      patents: { ...defaults.patents, ...readSaveObject(save.patents), discovered: readSaveArray(save.patents?.discovered), equipped: readSaveArray(save.patents?.equipped), history: readSaveArray(save.patents?.history), levels: readSaveObject(save.patents?.levels), intInvested: readSaveObject(save.patents?.intInvested) }, premium: { ...defaults.premium, ...readSaveObject(save.premium), purchases: readSaveArray(save.premium?.purchases), adCooldowns: { ...defaults.premium.adCooldowns, ...readSaveObject(save.premium?.adCooldowns) } },
      retention: { ...defaults.retention, ...readSaveObject(save.retention), claimedDaily: { ...defaults.retention.claimedDaily, ...readSaveObject(save.retention?.claimedDaily) }, claimedWeekly: { ...defaults.retention.claimedWeekly, ...readSaveObject(save.retention?.claimedWeekly) } },
      inventory: { ...defaults.inventory, ...readSaveObject(save.inventory), instances: readSaveArray(save.inventory?.instances).filter((item) => item && typeof item.instanceId === 'string' && typeof item.catalogId === 'string'), equipped: readSaveObject(save.inventory?.equipped), collection: { ...defaults.inventory.collection, ...readSaveObject(save.inventory?.collection), items: readSaveArray(save.inventory?.collection?.items), rarities: readSaveArray(save.inventory?.collection?.rarities), sets: readSaveArray(save.inventory?.collection?.sets) }, newItem: null },
      consumables: readSaveNumericMap(save.consumables), rewardCaches: readSaveNumericMap(save.rewardCaches),
      missions: { ...defaults.missions, ...readSaveObject(save.missions), daily: readSaveArray(save.missions?.daily), weekly: readSaveArray(save.missions?.weekly), monthly: readSaveArray(save.missions?.monthly), claims: readSaveObject(save.missions?.claims) },
      gemEconomy: { ...defaults.gemEconomy, ...readSaveObject(save.gemEconomy), history: readSaveArray(save.gemEconomy?.history) },
      rewardedBoosts: { ...defaults.rewardedBoosts, ...readSaveObject(save.rewardedBoosts), claims: readSaveObject(save.rewardedBoosts?.claims) },
      artifacts: { ...defaults.artifacts, ...readSaveObject(save.artifacts), owned: readSaveArray(save.artifacts?.owned), collection: readSaveArray(save.artifacts?.collection) },
      marketplace: { ...defaults.marketplace, ...readSaveObject(save.marketplace), enabled: false, authority: 'server-required', listings: [], pendingTransactions: [] },
      futureMeta: { ...defaults.futureMeta, ...readSaveObject(save.futureMeta), materials: readSaveNumericMap(save.futureMeta?.materials), blueprints: readSaveArray(save.futureMeta?.blueprints) },
      offline: { ...defaults.offline, ...readSaveObject(save.offline), capMs: Number.isFinite(save.offline?.capMs) ? Math.max(0, save.offline.capMs) : defaults.offline.capMs, results: readSaveObject(save.offline?.results) },
      rewards: { ...defaults.rewards, ...readSaveObject(save.rewards), queue: readSaveArray(save.rewards?.queue), history: readSaveArray(save.rewards?.history) },
      balanceRun: { ...defaults.balanceRun, ...readSaveObject(save.balanceRun) },
      settings: { ...defaults.settings, ...readSaveObject(save.settings) }, statistics: readSaveNumericRecord(defaults.statistics, save.statistics),
      run: readSaveNumericRecord(defaults.run, save.run),
      session: { ...defaults.session, ...readSaveObject(save.session) }, ui: { ...defaults.ui, ...readSaveObject(save.ui), toast: readSaveObject(save.ui?.toast).message ? save.ui.toast : null },
    });
  }
}

function readSaveObject(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
function readSaveArray(value, fallback = []) { return Array.isArray(value) ? value : fallback; }
function readSaveNumericRecord(defaults, value) { const source = readSaveObject(value); return Object.fromEntries(Object.entries(defaults).map(([key, initial]) => [key, Number.isFinite(source[key]) && source[key] >= 0 ? source[key] : initial])); }
function readSaveNumericMap(value) { return Object.fromEntries(Object.entries(readSaveObject(value)).filter(([, amount]) => Number.isFinite(amount) && amount >= 0)); }
function normalizeSavedAllocation(defaults, value) { const allocation = readSaveNumericRecord(defaults, value); const total = Object.values(allocation).reduce((sum, amount) => sum + amount, 0); if (!total) return defaults; const entries = Object.entries(allocation); const normalized = Object.fromEntries(entries.map(([key, amount]) => [key, Math.round(amount / total * 100)])); normalized[entries.at(-1)[0]] += 100 - Object.values(normalized).reduce((sum, amount) => sum + amount, 0); return normalized; }

function migrateLegacyHardwareUpgradeTracks(defaults, save) {
  const explicit = readSaveObject(save.hardwareUpgradeLevels);
  const levels = Object.fromEntries(HARDWARE_CATALOG.map(({id}) => [id, readSaveNumericRecord(defaults[id], explicit[id])]));
  if (save.version >= 13) return levels;
  for (const hardware of HARDWARE_CATALOG) {
    const count = readSaveArray(save.upgrades).filter((id) => LEGACY_HARDWARE_UPGRADES.some((upgrade) => upgrade.id === id && upgrade.hardwareId === hardware.id)).length;
    for (let index = 0; index < count; index += 1) { const track = ['processor','memory','optimization'][index % 3]; levels[hardware.id][track] += 1; }
  }
  return levels;
}
function migrateLegacySystemTechnologyNodes(save) {
  const nodes = new Set(readSaveArray(save.meta?.techNodes));
  if (save.version >= 13) return [...nodes];
  const total = save.meta?.totalIntelligence ?? 0;
  const legacy = [[1,'system-model-engineering'],[4,'system-marketing'],[10,'system-allocation'],[10,'system-research'],[15,'system-items'],[20,'system-patents'],[20,'system-account'],[80,'system-automation'],[120,'system-agents'],[170,'system-enterprise'],[350,'system-energy']];
  for (const [threshold,id] of legacy) if (total >= threshold) nodes.add(id);
  return [...nodes];
}
