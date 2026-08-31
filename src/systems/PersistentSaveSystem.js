import { createDefaultState, HARDWARE_CATALOG, LEGACY_HARDWARE_UPGRADES, MODEL_CATALOG, SAVE_VERSION } from '../data/defaultState.js';
import { BALANCE, FEATURE_UNLOCKS, isResearchUnlocked } from '../config/balance.js';
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
    const progress = Object.fromEntries(Object.entries({ ...defaults.model.progress, ...migratedProgress }).map(([id,value])=>[id,normalizeModelPointAccounting({...value,xp:0})]));
    progress[activeId] ??= normalizeModelPointAccounting({ level: save.model?.level ?? 1, xp: 0, upgradePoints: save.model?.upgradePoints ?? 0, trainings: 0, skills: save.model?.improvements?.[activeId] ?? {} });
    const featureUnlockTimes = { ...defaults.meta.featureUnlockTimes, ...save.meta?.featureUnlockTimes };
    for (const feature of FEATURE_UNLOCKS) if (feature.int <= (save.meta?.totalIntelligence ?? 0) && featureUnlockTimes[feature.id] === undefined) featureUnlockTimes[feature.id] = save.statistics?.playTimeMs ?? 0;
    const requestedDeployment = [...new Set(readSaveArray(save.model?.deployed, defaults.model.deployed).map((id) => legacyModelIds[id] ?? id).filter((id) => owned.includes(id)))];
    const deployed = requestedDeployment.length ? requestedDeployment.slice(0, 3) : [defaults.model.activeId];
    const emptyLegacyTracks = Object.fromEntries(HARDWARE_CATALOG.map(({id})=>[id,{processor:0,memory:0,optimization:0}]));
    const legacyHardwareUpgradeLevels = migrateLegacyHardwareUpgradeTracks(emptyLegacyTracks, save);
    const hardwareUpgradeRefund = legacyHardwareUpgradeRefund(save, legacyHardwareUpgradeLevels);
    const migratedTechNodes = migrateTechnologyCatalog(migrateLegacySystemTechnologyNodes(save),save.version);
    const migratedTrainingProgress = migrateLegacyTrainingProgress(save, activeId, progress);
    const migratedTrainingSession = migrateLegacyTrainingSession(save, activeId, progress, migratedTrainingProgress);
    return ensureGameState({
      ...defaults, ...save, version: SAVE_VERSION,
      profile: { ...defaults.profile, ...readSaveObject(save.profile) }, resources: { ...readSaveNumericRecord(defaults.resources, save.resources), credits: (Number.isFinite(save.resources?.credits) ? save.resources.credits : defaults.resources.credits) + hardwareUpgradeRefund },
      hardware: readSaveNumericRecord(defaults.hardware, save.hardware), model: { ...defaults.model, ...readSaveObject(save.model), activeId, trainingTarget: activeId, xp: 0, owned, deployed, improvements: readSaveObject(save.model?.improvements), progress, trainingProgress: migratedTrainingProgress, trainingSession: migratedTrainingSession },
      allocation: normalizeSavedAllocationForFeatures(defaults.allocation, save.allocation, migratedTechNodes), energy: defaults.energy, market: readSaveNumericRecord(defaults.market, save.market),
      upgrades: readSaveArray(save.upgrades).filter((id) => !LEGACY_HARDWARE_UPGRADES.some((upgrade) => upgrade.id === id)), tutorial: { ...defaults.tutorial, ...readSaveObject(save.tutorial), acknowledged: readSaveArray(save.tutorial?.acknowledged) }, objectives: { ...defaults.objectives, ...readSaveObject(save.objectives) },
      meta: { ...defaults.meta, ...readSaveObject(save.meta), unlockedModels: [...new Set([...readSaveArray(save.meta?.unlockedModels), ...owned])], techNodes: migratedTechNodes, achievements: { ...defaults.meta.achievements, ...readSaveObject(save.meta?.achievements) }, featureUnlockTimes, cycleHistory: readSaveArray(save.meta?.cycleHistory) },
      world: { ...defaults.world, ...readSaveObject(save.world), modifiers: readSaveArray(save.world?.modifiers), activeEvent: readSaveObject(save.world?.activeEvent).id ? save.world.activeEvent : null }, company: { ...defaults.company, ...readSaveObject(save.company), employees: readSaveNumericRecord(defaults.company.employees, save.company?.employees) },
      automation: { ...defaults.automation, ...save.automation },
      patents: { ...defaults.patents, ...readSaveObject(save.patents), discovered: readSaveArray(save.patents?.discovered), equipped: readSaveArray(save.patents?.equipped), history: readSaveArray(save.patents?.history), levels: readSaveObject(save.patents?.levels), intInvested: readSaveObject(save.patents?.intInvested) }, premium: { ...defaults.premium, ...readSaveObject(save.premium), purchases: readSaveArray(save.premium?.purchases), adCooldowns: { ...defaults.premium.adCooldowns, ...readSaveObject(save.premium?.adCooldowns) } },
      retention: { ...defaults.retention, ...readSaveObject(save.retention), claimedDaily: { ...defaults.retention.claimedDaily, ...readSaveObject(save.retention?.claimedDaily) }, claimedWeekly: { ...defaults.retention.claimedWeekly, ...readSaveObject(save.retention?.claimedWeekly) } },
      inventory: { ...defaults.inventory, ...readSaveObject(save.inventory), instances: readSaveArray(save.inventory?.instances).filter((item) => item && typeof item.instanceId === 'string' && typeof item.catalogId === 'string'), equipped: readSaveObject(save.inventory?.equipped), collection: { ...defaults.inventory.collection, ...readSaveObject(save.inventory?.collection), items: readSaveArray(save.inventory?.collection?.items), rarities: readSaveArray(save.inventory?.collection?.rarities), sets: readSaveArray(save.inventory?.collection?.sets) }, newItem: null },
      consumables: readSaveNumericMap(save.consumables), rewardCaches: readSaveNumericMap(save.rewardCaches),
      missions: { ...defaults.missions, ...readSaveObject(save.missions), daily: readSaveArray(save.missions?.daily), weekly: readSaveArray(save.missions?.weekly), monthly: readSaveArray(save.missions?.monthly), claims: readSaveObject(save.missions?.claims) },
      gemEconomy: normalizeGemEconomy(defaults.gemEconomy,save.gemEconomy,Number.isFinite(save.resources?.gems)?save.resources.gems:defaults.resources.gems),
      rewardedBoosts: { ...defaults.rewardedBoosts, ...readSaveObject(save.rewardedBoosts), claims: readSaveObject(save.rewardedBoosts?.claims) },
      artifacts: { ...defaults.artifacts, ...readSaveObject(save.artifacts), owned: readSaveArray(save.artifacts?.owned), collection: readSaveArray(save.artifacts?.collection) },
      marketplace: { ...defaults.marketplace, ...readSaveObject(save.marketplace), enabled: false, authority: 'server-required', listings: [], pendingTransactions: [] },
      futureMeta: { ...defaults.futureMeta, ...readSaveObject(save.futureMeta), materials: readSaveNumericMap(save.futureMeta?.materials), blueprints: readSaveArray(save.futureMeta?.blueprints) },
      offline: { ...defaults.offline, ...readSaveObject(save.offline), capMs: Number.isFinite(save.offline?.capMs) ? Math.max(0, save.offline.capMs) : defaults.offline.capMs, results: readSaveObject(save.offline?.results) },
      rewards: { ...defaults.rewards, ...readSaveObject(save.rewards), queue: readSaveArray(save.rewards?.queue), history: readSaveArray(save.rewards?.history) },
      balanceRun: { ...defaults.balanceRun, ...readSaveObject(save.balanceRun) },
      settings: { ...defaults.settings, ...readSaveObject(save.settings) }, statistics: { ...readSaveNumericRecord(defaults.statistics, save.statistics), creditSources:normalizeCreditSources(defaults.statistics.creditSources,save.statistics?.creditSources,save.statistics?.totalCreditsEarned) },
      run: readSaveNumericRecord(defaults.run, save.run),
      session: { ...defaults.session, ...readSaveObject(save.session) }, ui: { ...defaults.ui, ...readSaveObject(save.ui), toast: readSaveObject(save.ui?.toast).message ? save.ui.toast : null },
    });
  }
}

function readSaveObject(value) { return value && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
function readSaveArray(value, fallback = []) { return Array.isArray(value) ? value : fallback; }
function readSaveNumericRecord(defaults, value) { const source = readSaveObject(value); return Object.fromEntries(Object.entries(defaults).map(([key, initial]) => [key, Number.isFinite(source[key]) && source[key] >= 0 ? source[key] : initial])); }
function readSaveNumericMap(value) { return Object.fromEntries(Object.entries(readSaveObject(value)).filter(([, amount]) => Number.isFinite(amount) && amount >= 0)); }
function normalizeModelPointAccounting(value) { const skills=Object.fromEntries(Object.entries(readSaveObject(value.skills)).filter(([skill])=>['quality','efficiency','popularity'].includes(skill)));const spent=Number.isFinite(value.totalPointsSpent)?value.totalPointsSpent:Object.values(skills).reduce((sum,rank)=>sum+Array.from({length:Math.max(0,Math.floor(rank))},(_,index)=>BALANCE.training.pointCosts[index]??Math.ceil((index+1)/2)).reduce((a,b)=>a+b,0),0);const available=Math.max(0,Math.floor(value.availablePoints??value.upgradePoints??0)),trainingCount=Math.max(0,Math.floor(value.trainingCount??value.trainings??0));return{...value,trainings:trainingCount,trainingCount,upgradePoints:available,availablePoints:available,totalPointsSpent:spent,totalPointsEarned:Number.isFinite(value.totalPointsEarned)?Math.max(value.totalPointsEarned,available+spent):available+spent,skills}; }
function normalizeSavedAllocation(defaults, value) { const allocation = readSaveNumericRecord(defaults, value); const total = Object.values(allocation).reduce((sum, amount) => sum + amount, 0); if (!total) return defaults; const entries = Object.entries(allocation); const normalized = Object.fromEntries(entries.map(([key, amount]) => [key, Math.round(amount / total * 100)])); normalized[entries.at(-1)[0]] += 100 - Object.values(normalized).reduce((sum, amount) => sum + amount, 0); return normalized; }
function normalizeSavedAllocationForFeatures(defaults,value,techNodes){const allocation=normalizeSavedAllocation(defaults,value);if(isResearchUnlocked({meta:{techNodes}}))return allocation;return{...allocation,inference:allocation.inference+allocation.research,research:0}}
function normalizeGemEconomy(defaults,value,balance){const source=readSaveObject(value),spent=Math.max(0,source.spent??0),recorded=Math.max(0,source.earned??0),earned=Math.max(recorded,spent+Math.max(0,balance));const history=readSaveArray(source.history);return{...defaults,...source,earned,spent,history:earned>recorded?[...history,{type:'earned',amount:earned-recorded,source:'migration',metadata:{version:SAVE_VERSION},at:Date.now()}].slice(-250):history.slice(-250)}}
function normalizeCreditSources(defaults,value,total){const sources=readSaveNumericRecord(defaults,value),known=Object.values(sources).reduce((sum,amount)=>sum+amount,0),missing=Math.max(0,(Number(total)||0)-known);return{...sources,other:sources.other+missing}}

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
function migrateTechnologyCatalog(nodes,version){if(version>=18)return nodes;const branchMap={robotics:'hardware',medicine:'data',education:'consumer',physics:'research',space:'singularity',government:'enterprise',asi:'agi'};return[...new Set(nodes.map(id=>{const [branch,rank]=id.split('-');return branchMap[branch]&&/^\d+$/.test(rank)?`${branchMap[branch]}-${rank}`:id}))]}
function migrateLegacySystemTechnologyNodes(save) {
  const nodes = new Set(readSaveArray(save.meta?.techNodes));
  if (save.version >= 13) return [...nodes];
  const total = save.meta?.totalIntelligence ?? 0;
  const legacy = [[1,'system-model-engineering'],[4,'system-marketing'],[10,'system-allocation'],[10,'system-research'],[15,'system-items'],[20,'system-patents'],[20,'system-account'],[80,'system-automation'],[120,'system-agents'],[170,'system-enterprise'],[350,'system-energy']];
  for (const [threshold,id] of legacy) if (total >= threshold) nodes.add(id);
  return [...nodes];
}

function migrateLegacyTrainingProgress(save, activeId, progress) {
  const value=Number(save.model?.trainingProgress??0); if(!Number.isFinite(value)||value<=0)return 0; if((save.version??0)>=15)return value;
  const level=progress[activeId]?.level??1, modelScale=MODEL_CATALOG.find(model=>model.id===activeId)?.trainingScale??1;
  const oldRequired=(save.version??0)>=14 ? legacyV14TrainingRequired(level)*modelScale : 5*Math.max(1,level)**1.65*1.9**Math.max(0,level-1)*1.12**(progress[activeId]?.trainings??0)*modelScale;
  const newRequired=currentTrainingRequired(level)*modelScale;
  return Math.min(newRequired,value/Math.max(1,oldRequired)*newRequired);
}
function legacyV14TrainingRequired(level){let work=8,previous=1;for(const[ceiling,growth]of[[10,1.32],[25,1.2],[50,1.13],[100,1.09],[Infinity,1.06]]){const steps=Math.max(0,Math.min(level,ceiling)-previous);work*=growth**steps;previous=ceiling;if(level<=ceiling)break}return Math.floor(work)}
function currentTrainingRequired(level){const anchors=[[1,18],[2,480],[3,4_500],[4,45_000],[5,300_000],[10,40_000_000],[20,4e11],[50,2e18],[100,1e27],[250,1e43],[500,1e65]],target=Math.max(1,level);const upper=anchors.find(([anchor])=>anchor>=target)??anchors.at(-1),lower=[...anchors].reverse().find(([anchor])=>anchor<=target)??anchors[0];if(upper[0]===lower[0])return lower[1];const ratio=(target-lower[0])/(upper[0]-lower[0]);return Math.round(Math.exp(Math.log(lower[1])+(Math.log(upper[1])-Math.log(lower[1]))*ratio))}
function legacyHardwareUpgradeRefund(save,levels){if((save.version??0)>=15)return 0;return HARDWARE_CATALOG.reduce((total,hardware)=>total+Object.values(levels[hardware.id]??{}).reduce((sum,level)=>sum+Array.from({length:level},(_,index)=>Math.ceil(hardware.baseCost*3*1.78**index)).reduce((a,b)=>a+b,0),0),0)}

function migrateLegacyTrainingSession(save,activeId,progress,trainingProgress){if(!save.model?.trainingActive)return null;const modelScale=MODEL_CATALOG.find(model=>model.id===activeId)?.trainingScale??1,required=currentTrainingRequired(progress[activeId]?.level??1)*modelScale,legacy=readSaveObject(save.model?.trainingSession);return{...legacy,modelId:activeId,startingLevel:progress[activeId]?.level??1,baseRequired:required,computeInvested:Math.min(required,Math.max(0,trainingProgress)),expectedDuration:Number.isFinite(legacy.expectedDuration)?legacy.expectedDuration:null}}
