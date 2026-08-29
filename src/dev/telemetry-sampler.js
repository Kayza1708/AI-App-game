import { HARDWARE_CATALOG, MODEL_CATALOG, OBJECTIVES, PATENTS, TECH_NODES, UPGRADES } from '../data/defaultState.js';
import { BALANCE, FEATURE_UNLOCKS, nextFeatureUnlock } from '../config/balance.js';
import {
  canBuyUpgrade, canDevelop, computePerSecond, cycleIntelligence, economySnapshot, effectiveHardwareCost,
  effectiveModelStat, modelImprovementCost,
  isHardwareUnlocked, patentResearchPerSecond, patentResearchRequired, rawHardwareContribution,
  trainingRatePerSecond, trainingRequiredForState,
} from '../systems/GameSystem.js';
import { ITEM_CATALOG } from '../data/itemCatalog.js';
import { branchInvestment } from '../data/technologyCatalog.js';
import { missionsWithProgress } from '../systems/MissionSystem.js';
import { artifactModifiers, inferCompanyBuild, itemModifiers } from '../systems/ModifierSystem.js';
import { ensureGameState } from '../core/GameStateContract.js';

export const SAMPLE_INTERVALS = [1, 5, 15, 30];
export const MAX_SAMPLES = 10_000;

export class TelemetrySampler {
  constructor(interval = 1) { this.setInterval(interval); this.lastSampleSeconds = -Infinity; this.samples = []; }
  setInterval(value) { const number = Number(value); this.interval = SAMPLE_INTERVALS.includes(number) ? number : 1; }
  shouldSample(seconds) { return seconds - this.lastSampleSeconds >= this.interval; }
  sample(state, seconds, context = {}) {
    if (!this.shouldSample(seconds)) return null;
    this.lastSampleSeconds = seconds;
    const snapshot = createGameplaySnapshot(state, seconds, context);
    boundedPush(this.samples, Object.freeze(snapshot), MAX_SAMPLES);
    return snapshot;
  }
  forceSample(state,seconds,context={}){this.lastSampleSeconds=seconds-this.interval;return this.sample(state,seconds,context)}
}

export function createGameplaySnapshot(input, seconds, context = {}) {
  const state = ensureGameState(input);
  const economy = economySnapshot(state);
  const patentRate = patentResearchPerSecond(state);
  const patentRequired = PATENTS[state.patents.discovered.length] ? patentResearchRequired(state.patents.discovered.length) : 0;
  const trainingRate = trainingRatePerSecond(state);
  const affordability = analyzeAffordability(state, economy);
  const purchaseTimes = context.economy?.purchaseTimes ?? [];
  const purchaseIntervals = purchaseTimes.slice(1).map((time, index) => time - purchaseTimes[index]);
  const meaningfulActions = context.meaningfulActions ?? 0;
  return {
    sessionId: context.sessionId, runId: context.runId, playerId: context.playerId,
    balanceRunId: state.balanceRun.id ?? context.balanceRunId ?? null,
    saveVersion: context.saveVersion, gameVersion: context.gameVersion,
    timestamp: context.timestamp ?? Date.now(), sessionSeconds: seconds, sessionPlaytime: seconds,
    totalLifetimePlaytime: state.statistics.playTimeMs / 1000, runSeconds: state.session.elapsedMs / 1000,
    prestigeLevel: state.meta.cycles, breakthroughLevel: state.meta.breakthroughs ?? 0,
    ...economy,
    currentIntelligence: economy.intelligence, gems: economy.gems,
    lifetimeCredits: state.statistics.totalCreditsEarned,
    lifetimeCreditsSpent: state.statistics.totalCreditsSpent,
    lifetimeComputeProduced: state.statistics.totalComputeProduced,
    lifetimeComputeConsumed: state.statistics.totalComputeConsumed,
    lifetimeComputeWasted: state.statistics.totalComputeWasted,
    incomePerSecond: economy.creditsPerSecond,
    creditsEarned: context.economy?.creditsEarned ?? state.statistics.totalCreditsEarned,
    creditsSpent: context.economy?.creditsSpent ?? state.statistics.totalCreditsSpent,
    sessionComputeProduced: context.economy?.computeProduced ?? 0, sessionComputeConsumed: context.economy?.computeConsumed ?? 0, sessionComputeWasted: context.economy?.computeWasted ?? 0,
    biggestPurchase: context.economy?.biggestPurchase ?? 0,
    averagePurchaseInterval: purchaseIntervals.length ? average(purchaseIntervals) : 0,
    averageDecisionInterval: context.averageDecisionInterval ?? 0,
    meaningfulActionsPerHour: seconds > 0 ? meaningfulActions / seconds * 3600 : 0,
    manualComputeContribution: state.statistics.totalManualComputeProduced,
    computeUsage: economy.computeConsumed,
    effectiveComputePerSecond: economy.computePerSecond,
    unusedCompute: economy.computeWasted,
    idleCompute: state.resources.compute,
    idlePercentage: economy.computePerSecond ? economy.storedComputeRate / economy.computePerSecond : 0,
    marketUtilization: economy.utilization,
    computeUtilization: economy.computePerSecond ? economy.computeConsumed / economy.computePerSecond : 0,
    researchRate: patentRate,
    patentProgress: state.patents.progress,
    patentEta: patentRate && patentRequired ? Math.max(0, (patentRequired - state.patents.progress) / patentRate) : Infinity,
    trainingAllocation: state.allocation.training, inferenceAllocation: state.allocation.inference,
    researchAllocation: state.allocation.research, dataAllocation: state.allocation.data,
    agentAllocation: state.allocation.agents, allocation: { ...state.allocation },
    trainingProgress: state.model.trainingProgress, trainingRate, trainingActive: state.model.trainingActive,
    trainingEta: state.model.trainingActive && trainingRate ? Math.max(0, (trainingRequiredForState(state) - state.model.trainingProgress) / trainingRate) : Infinity,
    selectedModel: state.model.activeId, deployedModelCount: state.model.deployed.length,
    currentModelTier: Math.max(0, MODEL_CATALOG.findIndex(({ id }) => id === state.model.activeId)),
    intelligenceReward: cycleIntelligence(state), developmentCycleEligible: canDevelop(state),
    currentTechBranch: currentTechBranch(state),
    progressionCurves: BALANCE,
    nextFeatureUnlock: nextFeatureUnlock(state),
    featureUnlockOrder: Object.entries(state.meta.featureUnlockTimes ?? {}).sort((a,b)=>a[1]-b[1]).map(([id,playtimeMs])=>({id,playtimeMs})),
    averageIntelligencePerRun: average((state.meta.cycleHistory??[]).map((cycle)=>cycle.intelligence)),
    timeBetweenPrestiges: intervals((state.meta.cycleHistory??[]).map((cycle)=>cycle.at)),
    abandonedUnlockPaths: FEATURE_UNLOCKS.filter((feature)=>feature.int<=state.meta.totalIntelligence&&!Object.hasOwn(state.meta.featureUnlockTimes??{},feature.id)).map(({id})=>id),
    technologyChoices: [...state.meta.techNodes],
    modelUsageDistribution: Object.fromEntries(MODEL_CATALOG.map((model)=>[model.id,state.model.deployed.includes(model.id)?1/state.model.deployed.length:0])),
    hardwareTelemetry: hardwareTelemetry(state, economy),
    modelQuality: effectiveModelStat(state, MODEL_CATALOG.find((model) => model.id === state.model.activeId) ?? MODEL_CATALOG[0], 'quality'),
    activePatentBonuses: state.patents.equipped.map((id) => ({ id, level: state.patents.levels[id] ?? 1 })),
    equippedPatentSlots: state.patents.equipped.length,
    intelligenceInvestedInPatents: Object.values(state.patents.intInvested).reduce((sum, value) => sum + value, 0),
    activeModifiers: state.world.modifiers.length,
    inventorySize: state.inventory.instances.length,
    inventoryCapacity: state.inventory.capacity,
    rarityDistribution: Object.fromEntries(['Common','Uncommon','Rare','Epic','Legendary','Mythic'].map(rarity=>[rarity,state.inventory.instances.filter(instance=>ITEM_CATALOG.find(item=>item.id===instance.catalogId)?.rarity===rarity).length])),
    equippedItemCount: state.inventory.instances.filter(instance=>instance.equippedModelId).length,
    unusedHighRarityItems: state.inventory.instances.filter(instance=>!instance.equippedModelId&&['Epic','Legendary','Mythic'].includes(ITEM_CATALOG.find(item=>item.id===instance.catalogId)?.rarity)).length,
    gemsEarned: state.gemEconomy.earned, gemsSpent: state.gemEconomy.spent, gemBalance: state.resources.gems,
    missionCompletion: { completed: missionsWithProgress(state).filter(mission=>mission.progress>=mission.target).length, claimed: Object.keys(state.missions.claims).length, total: missionsWithProgress(state).length },
    rewardedAdInteractions: { offered:state.rewardedBoosts.offered,started:state.rewardedBoosts.started,completed:state.rewardedBoosts.completed },
    consumablesHeld: Object.values(state.consumables).reduce((sum,value)=>sum+value,0), consumablesUsed: state.gemEconomy.consumablesUsed,
    inferredBuild: inferCompanyBuild(state),
    modelBuilds: Object.fromEntries(Object.entries(state.model.progress).map(([id,progress])=>[id,{level:progress.level,trainingCount:progress.trainings??0,availablePoints:progress.upgradePoints??0,totalPointsEarned:progress.totalPointsEarned??0,totalPointsSpent:progress.totalPointsSpent??0,skills:{...progress.skills},itemModifiers:itemModifiers(state,id)}])),
    buildContributors: { technologyBranches: technologyBranchCounts(state), patentLoadout: [...state.patents.equipped], itemModifiers: itemModifiers(state), artifactModifiers: artifactModifiers(state), allocation: { ...state.allocation }, priceMultiplier: state.market.priceMultiplier },
    activeCooldowns: Object.entries(state.premium.adCooldowns).filter(([, expiresAt]) => expiresAt > (context.timestamp ?? Date.now())).map(([id, expiresAt]) => ({ id, expiresAt })),
    worldEventCooldownSeconds: Math.max(0, state.world.nextEventMs / 1000),
    effectiveMultipliers: effectiveMultipliers(state, economy),
    ...affordability,
    claimableRewards: claimableRewards(state), strategicChoice: Boolean(state.world.activeEvent),
    backgrounded: Boolean(context.backgrounded), funDensity: context.funDensity ?? 50,
  };
}

export function analyzeAffordability(state, economy = economySnapshot(state)) {
  const candidates = [];
  for (const item of HARDWARE_CATALOG) if (isHardwareUnlocked(state, item)) candidates.push({ id: item.id, category: 'hardware', label: item.name, cost: effectiveHardwareCost(state, item), gain: item.computePerSecond * currentHardwareMultiplier(state, economy), useful: economy.bottleneck !== 'DEMAND LIMITED' });
  for (const upgrade of UPGRADES) if (!state.upgrades.includes(upgrade.id)) candidates.push({ id: upgrade.id, category: 'upgrade', label: upgrade.name, cost: upgrade.cost, gain: upgrade.value, useful: upgradeRelevant(upgrade.effect, economy.bottleneck), affordable: canBuyUpgrade(state, upgrade) });
  for (const model of MODEL_CATALOG.filter((item) => state.model.owned.includes(item.id))) {
    const points = state.model.progress?.[model.id]?.upgradePoints ?? 0;
    candidates.push({ id: `${model.id}:skill`, category: 'model', label: `${model.name} Upgrade Point`, cost: modelImprovementCost(), gain: .4, useful: true, affordable: points > 0, currency: 'upgradePoints' });
  }
  for (const candidate of candidates) candidate.affordable ??= state.resources.credits >= candidate.cost;
  const useful = candidates.filter((candidate) => candidate.useful);
  const affordable = candidates.filter((candidate) => candidate.affordable);
  const affordableUseful = useful.filter((candidate) => candidate.affordable);
  const cheapest = useful.filter((candidate) => candidate.currency !== 'upgradePoints').sort((a, b) => a.cost - b.cost)[0] ?? null;
  return {
    affordableHardware: affordable.filter(({ category }) => category === 'hardware').length,
    affordableUpgrades: affordable.filter(({ category }) => category === 'upgrade').length,
    affordableModelImprovements: affordable.filter(({ category }) => category === 'model').length,
    affordablePurchases: affordable.length, usefulPurchases: affordableUseful.length,
    usefulAlternatives: affordableUseful.map(({ id, category, label, cost, gain }) => ({ id, category, label, cost, gain })),
    cheapestUsefulLabel: cheapest?.label ?? null, cheapestUsefulCost: cheapest?.cost ?? 0,
    cheapestUsefulCategory: cheapest?.category ?? null,
    cheapestUsefulEta: cheapest ? Math.max(0, (cheapest.cost - state.resources.credits) / Math.max(.0001, economy.creditsPerSecond)) : 0,
    cheapestUsefulGain: cheapest?.gain ?? 0,
  };
}

function claimableRewards(state) {
  const modelProgress=Object.values(state.model.progress??{}),investment=branchInvestment(state);const metrics={users:state.resources.users,totalCompute:state.statistics.totalComputeProduced,computeRate:computePerSecond(state),creditsEarned:state.statistics.totalCreditsEarned,level:Math.max(state.model.level,...modelProgress.map(item=>item.level??1)),trainings:modelProgress.reduce((sum,item)=>sum+(item.trainings??0),0),pointsSpent:modelProgress.reduce((sum,item)=>sum+(item.totalPointsSpent??0),0),marketing:state.market.marketing,research:state.resources.research,patents:state.patents.discovered.length,cycles:state.meta.cycles,tech:state.meta.techNodes.length,models:state.model.owned.length,keystones:TECH_NODES.filter(node=>node.type==='keystone'&&state.meta.techNodes.includes(node.id)).length,maxBranchInvestment:Math.max(0,...Object.values(investment))};
  return OBJECTIVES.filter((objective) => {const metric=objective.metric??objective.type;const value=metric.startsWith('hardware:')?state.hardware[metric.slice(9)]??0:metrics[metric]??0;return !state.objectives[objective.id]&&value>=objective.target}).length
    + missionsWithProgress(state).filter((mission) => !mission.claimed && mission.progress >= mission.target).length
    + TECH_NODES.filter((node) => !state.meta.techNodes.includes(node.id) && state.meta.intelligence >= node.cost && (!node.requires || state.meta.techNodes.includes(node.requires))).length;
}
function upgradeRelevant(effect, bottleneck) { const map = { 'DEMAND LIMITED': ['demand','marketing','appeal','reputation','adoption','marketSize'], 'CAPACITY LIMITED': ['inference','hardwareOutput','allOutput'], 'Training Limited': ['training','hardwareOutput'], 'Credits Limited': ['revenue','demand','enterprise'] }; return (map[bottleneck] ?? []).includes(effect) || ['allOutput','hardwareCost'].includes(effect); }
function currentHardwareMultiplier(state,economy=economySnapshot(state)){const raw=HARDWARE_CATALOG.reduce((sum,item)=>sum+rawHardwareContribution(state,item),0);return raw?economy.computePerSecond/raw:1}
function hardwareTelemetry(state,economy=economySnapshot(state)){const multiplier=currentHardwareMultiplier(state,economy);return Object.fromEntries(HARDWARE_CATALOG.map(item=>{const raw=rawHardwareContribution(state,item);return[item.id,{tier:item.tier,owned:state.hardware[item.id],computeContribution:raw*multiplier,effectivePerUnit:state.hardware[item.id]?raw*multiplier/state.hardware[item.id]:item.computePerSecond*multiplier}]}))}
function effectiveMultipliers(state, economy = economySnapshot(state)) { const raw = HARDWARE_CATALOG.reduce((sum, item) => sum + item.computePerSecond * state.hardware[item.id], 0); return { hardware: raw ? economy.computePerSecond / raw : 0, price: state.market.priceMultiplier, reputation: state.market.reputation, adoption: 1 + Math.sqrt(state.market.adoption) * .08, marketing: economy.marketingBonus }; }
function currentTechBranch(state) { const counts = {}; for (const id of state.meta.techNodes) { const branch = id.split('-')[0]; counts[branch] = (counts[branch] ?? 0) + 1; } return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null; }
function technologyBranchCounts(state) { const counts={};for(const id of state.meta.techNodes){const node=TECH_NODES.find(entry=>entry.id===id);const branch=node?.branch??id.split('-')[0];counts[branch]=(counts[branch]??0)+1}return counts }
function average(values) { return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0; }
function intervals(values){return values.slice(1).map((value,index)=>(value-values[index])/1000)}
function boundedPush(array, item, max) { if (array.length >= max) { const preserve = 1000, old = array.slice(preserve, preserve + 20); if (old.length) array.splice(preserve, 20, Object.freeze({ ...old[0], aggregated: true, bucketCount: old.length, sessionSeconds: old.at(-1).sessionSeconds })); else array.splice(preserve, 1); } array.push(item); }
