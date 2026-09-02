import { ACHIEVEMENTS, createDefaultState, GEM_SHOP_ITEMS, HARDWARE_CATALOG, MODEL_CATALOG, MODEL_SKILLS, OBJECTIVES, PATENTS, TECH_NODES, UPGRADES, WORLD_EVENTS } from '../data/defaultState.js';
import { BALANCE, curveValue, FEATURE_UNLOCKS, featureUnlocked, isResearchUnlocked, skillUnlocked, SYSTEM_TECH_NODES, viewUnlocked } from '../config/balance.js';
import { modifierValue } from './ModifierSystem.js';
import { ensureMissions } from './MissionSystem.js';
import { ensureGameState } from '../core/GameStateContract.js';
import { branchInvestment, hasTechnologyMechanic, purchasedTechnologyNodes, technologyEffect } from '../data/technologyCatalog.js';
import { earnGems, spendGems } from './GemSystem.js';
import { enqueueReward } from './RewardQueue.js';
import { RESEARCH_PROJECTS, researchProjectCost, startResearchProject, tickResearchLabs, unlockedResearchLabs } from './ResearchSystem.js';



function strategicBonus(state, effect) {
  const tech = purchasedTechnologyNodes(state);
  const technologyPower=Math.max(.1,1+technologyEffect(state,'techPower'));
  const positive = tech.reduce((sum,node)=>sum+(node.effects?.[effect]??(node.effect===effect?node.value:0)),0)*technologyPower;
  const penalties = tech.reduce((sum,node)=>sum+(node.tradeoffs?.[effect]??(node.tradeoff===effect?node.penalty:0)),0);
  const events = state.world.modifiers.filter((modifier) => modifier.effect === effect).reduce((sum, modifier) => sum + modifier.value, 0);
  const achievementBonus = Object.keys(state.meta.achievements).reduce((sum, id) => sum + (ACHIEVEMENTS.find((achievement) => achievement.id === id)?.reward ?? 0), 0);
  const equipped=PATENTS.filter((patent)=>state.patents.equipped.includes(patent.id));const tagDiversity=new Set(equipped.flatMap(patent=>patent.tags??[])).size;const patentPower=Math.max(.1,1+technologyEffect(state,'patentPower')+(hasTechnologyMechanic(state,'patent-diversity')?Math.max(0,tagDiversity-1)*.03:0));
  const patents = equipped.filter((patent) => patent.effect === effect).reduce((sum, patent) => sum + patent.value * patentLevelMultiplier(state, patent.id)*patentPower, 0);
  const modelStats = ['quality','reasoning','knowledge','context','coding','vision','creativity','math','efficiency','latency','popularity','enterprise','research','safety','autonomy'];
  return positive - penalties + events + patents + (['allOutput', 'hardwareOutput', 'demand', 'revenue', 'training'].includes(effect) ? achievementBonus : 0) + (modelStats.includes(effect) ? 0 : modifierValue(state, effect));
}

export function hardwareCost(item, quantity) { return Math.ceil(curveValue(item.baseCost, BALANCE.hardware.costGrowth, quantity)); }
export function isHardwareUnlocked(state, item) { return item.tier === 0 || state.hardware[HARDWARE_CATALOG[item.tier - 1].id] > 0; }

function upgradeBonus(state, effect, hardwareId = null) {
  return UPGRADES.filter((upgrade) => (state.upgrades.includes(upgrade.id)||upgrade.category==='research'&&(state.researchUpgradeLevels?.[upgrade.id]??0)>0) && upgrade.effect === effect && (!upgrade.hardwareId || upgrade.hardwareId === hardwareId)).reduce((total, upgrade) => total + upgrade.value*(upgrade.category==='research'?(state.researchUpgradeLevels?.[upgrade.id]??1):1), 0);
}

function milestoneBonus(state, effect, item = null) {
  return HARDWARE_CATALOG.reduce((total, hardware) => total + hardware.milestones.filter((milestone) => state.hardware[hardware.id] >= milestone.quantity && milestone.effect === effect && (!item || hardware.id === item.id)).reduce((sum, milestone) => sum + milestone.value, 0), 0);
}

export function effectiveHardwareCost(state, item) {
  const discount = Math.min(BALANCE.hardware.bulkDiscountCap, upgradeBonus(state, 'hardwareCost', item.id) + milestoneBonus(state, 'hardwareDiscount') + strategicBonus(state, 'hardwareCost') + strategicBonus(state, 'hardwareDiscount'));
  return Math.ceil(hardwareCost(item, state.hardware[item.id]) * (1 - discount));
}

function hardwareGlobalMultiplier(state) {
  const siliconLegacy=state.patents.equipped.includes('cold-kernels')?Math.min(.4,Math.floor((state.hardware.calculator??0)/25)*.01):0;
  return Math.max(0.1, 1 + upgradeBonus(state, 'allOutput') + upgradeBonus(state, 'hardwareOutput') + strategicBonus(state, 'allOutput') + strategicBonus(state, 'hardwareOutput') + deployedIdentityBonus(state, 'allOutput') + deployedIdentityBonus(state, 'hardwareOutput')+siliconLegacy);
}

export function hardwareContribution(state, item) {
  return rawHardwareContribution(state, item) * hardwareGlobalMultiplier(state);
}
export function hardwareMasteryLevel(state,item){return hasTechnologyMechanic(state,'hardware-mastery-2')&&state.hardware[item.id]>=25?2:hasTechnologyMechanic(state,'hardware-mastery-1')&&state.hardware[item.id]>=10?1:0}
export function rawHardwareContribution(state, item) { const owned=state.hardware[item.id],highest=HARDWARE_CATALOG.reduce((tier,entry)=>state.hardware[entry.id]>0?Math.max(tier,entry.tier):tier,0),distinct=HARDWARE_CATALOG.filter(entry=>state.hardware[entry.id]>0).length,mastery=hardwareMasteryLevel(state,item),diversity=hasTechnologyMechanic(state,'hardware-diversity')?distinct*.03:0,server=hasTechnologyMechanic(state,'server-specialization')&&item.tier>=4?.18:0,masteryBonus=mastery===2?.25+Math.min(.5,Math.floor(owned/10)*.05):mastery===1?.15:0,edge=hasTechnologyMechanic(state,'bleeding-edge')?(item.tier===highest?2:-.5):0,legacy=hasTechnologyMechanic(state,'legacy-compute')&&item.tier<highest?Math.min(.3,(highest-item.tier)*.03):0;return item.computePerSecond * owned * Math.max(.1,1 + milestoneBonus(state, 'hardwareOutput', item) + upgradeBonus(state, 'hardwareOutput', item.id)+diversity+server+masteryBonus+edge+legacy); }

export function computePerSecond(input) {
  const state = ensureGameState(input);
  const raw = HARDWARE_CATALOG.reduce((total, item) => total + rawHardwareContribution(state, item), 0);
  return raw * hardwareGlobalMultiplier(state);
}

// Legacy compatibility: Energy was removed in save version 14 and never affects simulation.
export function rawEnergyDemand() { return 0; }
export function energyProduction() { return 0; }
export function energyEfficiency() { return 1; }
export function energyUse() { return 0; }
export function effectiveHardwareOutput(state, item) { const owned = state.hardware[item.id]; return owned ? hardwareContribution(state, item) / owned : item.computePerSecond * (1 + upgradeBonus(state, 'hardwareOutput', item.id)) * hardwareGlobalMultiplier(state); }
export function activeModel(state) { return MODEL_CATALOG.find(({ id }) => id === state.model.activeId) ?? MODEL_CATALOG[0]; }
export function modelComparison(state,modelId){const candidate=MODEL_CATALOG.find(model=>model.id===modelId),current=activeModel(state);if(!candidate)return null;const potential=model=>({demand:model.stats.popularity+model.stats.quality*.5,revenue:model.stats.enterprise*.04+model.stats.quality*.012,capacity:model.stats.efficiency*(1+model.stats.latency*.04),training:model.trainingScale,research:model.stats.research});const before=potential(current),after=potential(candidate),delta=key=>before[key]?after[key]/before[key]-1:after[key]?Infinity:0;return{against:current.name,demand:delta('demand'),revenue:delta('revenue'),capacity:delta('capacity'),training:delta('training'),research:delta('research'),trait:candidate.role,bestFor:candidate.archetype??candidate.specialty}}
function deployedIdentityBonus(state,effect){return state.model.deployed.reduce((sum,id)=>sum+(MODEL_CATALOG.find(model=>model.id===id)?.identity?.[effect]??0),0)}
function effectiveMarketModels(state){const ids=[...new Set([...(state.model.deployed??[]),state.model.activeId])];return MODEL_CATALOG.filter(model=>ids.includes(model.id))}
function activeProgress(state){return state.model.progress?.[state.model.activeId]??{level:state.model.level,xp:state.model.xp,upgradePoints:state.model.upgradePoints??0,trainings:0,totalPointsEarned:state.model.upgradePoints??0,totalPointsSpent:0,skills:state.model.improvements?.[state.model.activeId]??{}}}
function modelImprovementLevel(state, modelId, path) { return state.model.progress?.[modelId]?.skills?.[path] ?? state.model.improvements[modelId]?.[path] ?? 0; }
export function effectiveModelStat(state, model, stat) { const base=model.stats[stat]??0; const points=skillUnlocked(state,stat)?modelImprovementLevel(state,model.id,stat):0;const skillPower=Math.max(.1,1+technologyEffect(state,'modelSkillPower')+(stat==='efficiency'?technologyEffect(state,'efficiencyPower'):0)+(stat==='popularity'?technologyEffect(state,'popularityPower'):0)+(stat==='quality'?technologyEffect(state,'qualityPower'):0));const portfolio=hasTechnologyMechanic(state,'specialist-ai')&&model.id!==state.model.activeId?.5:hasTechnologyMechanic(state,'generalist-ai')?.8:1; return (base + points * BALANCE.training.skillGain*skillPower + modifierValue(state,stat,model.id)) * portfolio * (stat==='quality' ? 1 + strategicBonus(state,'quality') + deployedIdentityBonus(state,'quality') : 1); }
export function lifetimeIncomeMultiplier(state) { return 1 + Math.max(0, state.meta.totalIntelligence ?? 0) * 0.10; }
export function revenuePerUser(state) { const revenueModels=[...new Set([...state.model.deployed,state.model.activeId])];const enterpriseModels = revenueModels.reduce((sum,id) => {const model=MODEL_CATALOG.find(item=>item.id===id);return sum+(model?effectiveModelStat(state,model,'enterprise')*.04+effectiveModelStat(state,model,'quality')*.012:0)}, 0) + (state.model.deployed.includes('agi') ? 0.5 : 0); return BALANCE.market.revenueBase * state.market.priceMultiplier * lifetimeIncomeMultiplier(state) * Math.max(0.1, 1 + enterpriseModels + upgradeBonus(state, 'revenue') + milestoneBonus(state, 'revenue') + strategicBonus(state, 'revenue') + deployedIdentityBonus(state,'revenue') + strategicBonus(state, 'enterprise') * 0.7 - strategicBonus(state, 'adoption') * 0.25); }
export function xpRequired() { return 0; }
export function trainingRequired(level) { const anchors=BALANCE.training.requirementAnchors; const target=Math.max(1,Number(level)||1); const upper=anchors.find(([anchor])=>anchor>=target)??anchors.at(-1); const lower=[...anchors].reverse().find(([anchor])=>anchor<=target)??anchors[0]; if(upper[0]===lower[0])return lower[1]; const ratio=(target-lower[0])/(upper[0]-lower[0]); return Math.round(Math.exp(Math.log(lower[1])+(Math.log(upper[1])-Math.log(lower[1]))*ratio)); }
export function trainingRequiredForState(state) { const progress=activeProgress(state);return trainingRequired(progress.level) * (activeModel(state).trainingScale??1); }
function trainingMultiplier(state) { const skills=modelImprovementLevel(state,state.model.activeId,'efficiency')*.02;const momentum=hasTechnologyMechanic(state,'training-momentum')?Math.min(.5,(activeProgress(state).trainings??0)*.03):0;const gpu=hasTechnologyMechanic(state,'gpu-training')?HARDWARE_CATALOG.filter(item=>item.tier>=3).reduce((sum,item)=>sum+state.hardware[item.id],0)>.0?.2:0:0;return Math.max(.1,1+upgradeBonus(state,'training')+strategicBonus(state,'training')+strategicBonus(state,'quality')*.5+deployedIdentityBonus(state,'coding')+skills+momentum+gpu) }
export function trainingRatePerSecond(state) { return computePerSecond(state) * state.allocation.training / 100 * trainingMultiplier(state); }
function researchAllocation(state){return isResearchUnlocked(state)?state.allocation.research:0}
export function researchPerSecond(state){if(!isResearchUnlocked(state))return 0;return computePerSecond(state)*researchAllocation(state)/100*Math.max(.1,1+strategicBonus(state,'research'))*(1+strategicBonus(state,'allocationEfficiency'))}
export function trainingEtaSeconds(state){const rate=trainingRatePerSecond(state);const banked=state.model.trainingActive?(state.resources.compute??0)*trainingMultiplier(state):0;return rate>0?Math.max(0,trainingRequiredForState(state)-state.model.trainingProgress-banked)/rate:Infinity}
export function modelAvailablePoints(progress){return Math.max(0,progress?.availablePoints??0,progress?.upgradePoints??0)}
export function modelTrainingCount(progress){return Math.max(0,progress?.trainingCount??progress?.trainings??0)}
export function completeTrainingProgress(progress,pointsEarned=1){const availablePoints=modelAvailablePoints(progress)+pointsEarned,totalPointsSpent=Math.max(0,progress.totalPointsSpent??0),trainingCount=modelTrainingCount(progress)+1;return{...progress,level:Math.max(1,progress.level??1)+1,xp:0,trainings:trainingCount,trainingCount,upgradePoints:availablePoints,availablePoints,totalPointsSpent,totalPointsEarned:availablePoints+totalPointsSpent}}

export function marketMetrics(input) {
  const state = ensureGameState(input);
  const deployed = effectiveMarketModels(state);
  const highestTier = HARDWARE_CATALOG.reduce((tier, item) => state.hardware[item.id] > 0 ? Math.max(tier, item.tier) : tier, 0);
  const deployedLevel = Math.max(1, ...deployed.map((model) => state.model.progress?.[model.id]?.level ?? 1));
  const deployedQuality = deployed.reduce((sum, model) => sum + effectiveModelStat(state, model, 'quality'), 0) / Math.max(1, deployed.length);
  const unlockedMarketSize = (30 + deployedLevel * 18) * BALANCE.market.tierMarketGrowth ** highestTier * (1 + upgradeBonus(state, 'marketSize') + strategicBonus(state, 'marketSize') + deployedIdentityBonus(state, 'marketSize'));
  const appeal = deployed.reduce((sum, deployedModel) => sum + effectiveModelStat(state,deployedModel,'popularity') + effectiveModelStat(state,deployedModel,'quality')*.5 + effectiveModelStat(state,deployedModel,'vision')*.2 + effectiveModelStat(state,deployedModel,'creativity')*.2 + effectiveModelStat(state,deployedModel,'context')*.1 + effectiveModelStat(state,deployedModel,'reasoning')*.1, 0) + upgradeBonus(state, 'appeal') * 10;
  const qualityAppeal = (appeal + strategicBonus(state, 'appeal') * 10 + deployedIdentityBonus(state,'demand') * 10) * (1 + deployedQuality * (0.2 + upgradeBonus(state, 'quality') + strategicBonus(state, 'quality')));
  const priceResistance = 1 / state.market.priceMultiplier ** Math.max(0.55, 1.35 - strategicBonus(state, 'priceElasticity'));
  const marketingPower = 1 + state.market.marketing * (BALANCE.market.marketingBase + upgradeBonus(state, 'marketing') + strategicBonus(state,'marketing'));
  const reputationPower = Math.max(1, state.market.reputation * (1 + upgradeBonus(state, 'reputation')));
  const adoptionPower = 1 + Math.sqrt(state.market.adoption) * (0.08 + upgradeBonus(state, 'adoption'));
  const modelEfficiency = deployed.reduce((sum, deployedModel) => sum + effectiveModelStat(state,deployedModel,'efficiency') * (1+effectiveModelStat(state,deployedModel,'latency')*.04), 0) / Math.max(1, deployed.length);
  const capacity = computePerSecond(state) * state.allocation.inference / 100 * modelEfficiency * BALANCE.market.capacityScale * Math.max(0.1, 1 + upgradeBonus(state, 'inference') + strategicBonus(state,'inference') + strategicBonus(state, 'enterprise') * 0.35);
  const organicDemand = unlockedMarketSize * qualityAppeal * BALANCE.market.demandScale * marketingPower * reputationPower * adoptionPower * priceResistance * Math.max(0.1, 1 + upgradeBonus(state, 'demand') + milestoneBonus(state, 'demand') + strategicBonus(state, 'demand') + strategicBonus(state, 'adoption') - strategicBonus(state, 'enterprise') * 0.2);
  // Distribution is capacity-linked, but Model appeal still determines how much
  // of that reach turns into real Demand. Otherwise the floor masks every
  // Quality/Popularity point once infrastructure becomes large.
  const distributionFloor = capacity * Math.min(0.14, BALANCE.market.demandFloor + highestTier * 0.005)*Math.max(.1,1+strategicBonus(state,'demand'));
  const averagePopularity=deployed.reduce((sum,model)=>sum+effectiveModelStat(state,model,'popularity'),0)/Math.max(1,deployed.length);
  const floorAppeal=1+deployedQuality*.01+averagePopularity*.015;
  const demand = Math.max(organicDemand, distributionFloor*floorAppeal + organicDemand*.25);
  const target = Math.floor(Math.min(demand, capacity));
  const utilization = capacity > 0 ? Math.min(1, state.resources.users / capacity) : 0;
  return { demand, capacity, target, utilization, unlockedMarketSize, bottleneck: demand < capacity ? 'DEMAND LIMITED' : 'CAPACITY LIMITED', revenue: state.resources.users * revenuePerUser(state) };
}

export function userGrowthPerSecond(state) { const target = marketMetrics(state).target; return (target - state.resources.users) * BALANCE.market.userConvergence; }

export function createDefaultEconomySnapshot() {
  return {
    credits: 0, creditsPerSecond: 0, revenuePerSecond: 0,
    compute: 0, computePerSecond: 0, computeConsumed: 0, computeWasted: 0, storedComputeRate: 0,
    trainingCompute: 0, research: 0, researchPerSecond: 0,
    users: 0, usersPerSecond: 0, targetUsers: 0, unlockedMarketSize: 0, demand: 0, capacity: 0,
    utilization: 0, revenuePerUser: 0, priceMultiplier: 1, marketing: 0, marketingBonus: 1,
    reputation: 1, adoption: 0, energyProduction: 0, energyDemand: 0, energySurplus: 0, energyEfficiency: 1, currentHardwareTier: 0,
    currentModel: MODEL_CATALOG[0].id, trainingTarget: MODEL_CATALOG[0].id,
    modelLevel: 1, modelXp: 0, modelUpgradePoints: 0, currentPatent: null, currentObjective: null,
    developmentCycle: 0, runCreditsEarned: 0, runComputeProduced: 0, intelligence: 0, gems: 0,
    bottleneck: 'CAPACITY LIMITED',
  };
}

export function economySnapshot(input) {
  const state = ensureGameState(input);
  const compute = computePerSecond(state);
  const market = marketMetrics(state);
  const trainingRate = trainingRatePerSecond(state);
  const inferenceRate = compute * state.allocation.inference / 100;
  const computeConsumed = inferenceRate * market.utilization + compute * (researchAllocation(state) + state.allocation.data + state.allocation.agents + (state.model.trainingActive ? state.allocation.training : 0)) / 100;
  const storedComputeRate = state.model.trainingActive ? 0 : trainingRate;
  const currentObjective = OBJECTIVES.find((objective) => !state.objectives[objective.id] && objectiveProgress(state, objective) < objective.target) ?? null;
  return { ...createDefaultEconomySnapshot(),
    credits: state.resources.credits, creditsPerSecond: market.revenue, revenuePerSecond: market.revenue,
    compute: state.resources.compute, computePerSecond: compute, computeConsumed, computeWasted: Math.max(0, inferenceRate * (1 - market.utilization)), storedComputeRate,
    trainingCompute: trainingRate, research: state.resources.research, researchPerSecond: researchPerSecond(state),
    users: state.resources.users, usersPerSecond: (market.target - state.resources.users) * BALANCE.market.userConvergence, targetUsers: market.target, unlockedMarketSize: market.unlockedMarketSize, demand: market.demand, capacity: market.capacity,
    utilization: market.utilization, revenuePerUser: revenuePerUser(state), priceMultiplier: state.market.priceMultiplier,
    marketing: state.market.marketing, marketingBonus: 1 + state.market.marketing * (BALANCE.market.marketingBase + upgradeBonus(state, 'marketing')),
    reputation: state.market.reputation, adoption: state.market.adoption,
    currentHardwareTier: HARDWARE_CATALOG.reduce((tier, item) => state.hardware[item.id] > 0 ? Math.max(tier, item.tier) : tier, 0),
    currentModel: state.model.activeId, trainingTarget: state.model.trainingTarget ?? state.model.activeId,
    modelLevel: state.model.level, modelXp: state.model.xp, modelUpgradePoints: state.model.upgradePoints ?? 0,
    currentPatent: PATENTS[state.patents.discovered.length]?.id ?? null, currentObjective: currentObjective?.id ?? null,
    developmentCycle: state.meta.cycles, runCreditsEarned: state.run.creditsEarned, runComputeProduced: state.run.computeProduced, intelligence: state.meta.intelligence, gems: state.resources.gems,
    bottleneck: market.bottleneck,
  };
}

export const TUTORIAL_STEPS = Object.freeze([
  {id:'economy',title:'FOUND THE COMPANY',copy:'Credits fund every company decision. Start by bringing your first Compute source online.',action:'OPEN HARDWARE',view:'hardware',feature:'core',eligible:state=>viewUnlocked(state,'hardware'),condition:state=>Boolean(state.tutorial.acknowledged?.includes('economy'))},
  {id:'hardware',title:'BUY A CALCULATOR',copy:'Hardware continuously produces Compute. Purchase your first Calculator.',feature:'core',eligible:state=>viewUnlocked(state,'hardware'),condition:state=>state.hardware.calculator>0},
  {id:'compute',title:'COMPUTE IS FLOWING',copy:'Compute powers Training and serving. Watch your first machine produce it.',feature:'core',eligible:state=>viewUnlocked(state,'dashboard'),condition:state=>state.statistics.totalComputeProduced>=.25},
  {id:'training-start',title:'START MODEL TRAINING',copy:'Open AI Model and begin TinyChat’s next Training project.',action:'OPEN AI MODEL',view:'model',feature:'core',eligible:state=>viewUnlocked(state,'model'),condition:state=>state.model.trainingActive||totalTrainings(state)>0},
  {id:'training-complete',title:'COMPLETE TRAINING',copy:'Training continues while you manage the company or while the game is closed.',feature:'core',eligible:state=>viewUnlocked(state,'model'),condition:state=>totalTrainings(state)>0},
  {id:'model-point',title:'IMPROVE THE MODEL',copy:'Spend the Model Point on Quality, Efficiency, or Popularity.',feature:'modelSkills',eligible:state=>viewUnlocked(state,'model'),condition:state=>totalModelPointsSpent(state)>0},
  {id:'users',title:'USERS AND DEMAND',copy:'Better Models create Demand; Inference Compute determines Capacity.',feature:'core',eligible:state=>viewUnlocked(state,'dashboard'),condition:state=>state.resources.users>=1},
  {id:'marketing-intro',title:'INTRODUCE MARKETING',copy:'Marketing creates Demand and competes with Hardware for Credits.',action:'OPEN MARKET',view:'market',feature:'marketing',eligible:state=>viewUnlocked(state,'market'),condition:state=>Boolean(state.tutorial.acknowledged?.includes('marketing-intro'))},
  {id:'marketing-buy',title:'LAUNCH MARKETING',copy:'Purchase one Marketing level and observe the real Demand change.',feature:'marketing',eligible:state=>viewUnlocked(state,'market'),condition:state=>state.market.marketing>0},
  {id:'capacity',title:'DEMAND VS CAPACITY',copy:'Users are limited by the lower of Demand and Capacity. Allocation changes that tradeoff.',action:'UNDERSTOOD',feature:'marketing',eligible:state=>viewUnlocked(state,'market'),condition:state=>Boolean(state.tutorial.acknowledged?.includes('capacity'))},
  {id:'objectives',title:'OBJECTIVES AND MISSIONS',copy:'Objectives guide permanent progress; rotating Missions award scaled Credits and controlled Gems.',action:'OPEN OBJECTIVES',view:'objectives',feature:'core',eligible:state=>viewUnlocked(state,'objectives'),condition:state=>Boolean(state.tutorial.acknowledged?.includes('objectives'))},
  {id:'research',title:'RESEARCH DIVISION',copy:'A permanent Technology unlocks Research. Allocate Compute and install scientific upgrades.',action:'OPEN RESEARCH',view:'research',feature:'research',eligible:isResearchUnlocked,condition:state=>Boolean(state.tutorial.acknowledged?.includes('research'))||state.resources.research>0||state.upgrades.some(id=>UPGRADES.find(upgrade=>upgrade.id===id)?.category==='research')},
  {id:'technology',title:'PERMANENT TECHNOLOGY',copy:'Spend scarce INT on a company build. Locked nodes remain inspectable.',action:'OPEN TECH TREE',view:'strategy',feature:'development',eligible:state=>viewUnlocked(state,'strategy'),condition:state=>(state.meta.techNodes?.length??0)>0},
  {id:'development',title:'DEVELOPMENT CYCLE',copy:'A mature company can reset its run economy to preserve INT and permanent Technologies.',feature:'development',eligible:canDevelop,condition:state=>(state.meta.cycles??0)>0},
]);
function totalTrainings(state){return Object.values(state.model.progress??{}).reduce((sum,progress)=>sum+(progress.trainingCount??progress.trainings??0),0)}
function totalModelPointsSpent(state){return Object.values(state.model.progress??{}).reduce((sum,progress)=>sum+(progress.totalPointsSpent??0),0)}
export function reconcileTutorial(state){if(state.tutorial.completed)return state;let step=Math.max(0,Math.floor(state.tutorial.step??0)),guard=0;while(step<TUTORIAL_STEPS.length&&guard<TUTORIAL_STEPS.length){const definition=TUTORIAL_STEPS[step];if(!definition.condition(state))break;step+=1;guard+=1}const completed=step>=TUTORIAL_STEPS.length;if(step===state.tutorial.step&&completed===state.tutorial.completed)return state;return{...state,tutorial:{...state.tutorial,step,completed}}}
export function activeTutorialStep(state){if(state.tutorial.completed)return null;const definition=TUTORIAL_STEPS[state.tutorial.step];return definition?.eligible(state)?definition:null}

export function tickGame(state, deltaMs) {
  const seconds = deltaMs / 1000;
  const rate = computePerSecond(state);
  const produced = rate * seconds;
  const allocationEfficiency = 1 + strategicBonus(state, 'allocationEfficiency');
  const researchEnabled = featureUnlocked(state, 'research');
  const patentEnabled = featureUnlocked(state, 'patents');
  const rawTrainingGain = produced * state.allocation.training / 100 * allocationEfficiency;
  const effectiveTrainingMultiplier = trainingMultiplier(state);
  const trainingGain = rawTrainingGain * effectiveTrainingMultiplier;
  const researchGain = researchEnabled ? researchPerSecond(state) * seconds : 0;
  const dataGain = produced * state.allocation.data / 100 * allocationEfficiency;
  const autonomy=state.model.deployed.reduce((sum,id)=>{const model=MODEL_CATALOG.find(item=>item.id===id);return sum+(model?effectiveModelStat(state,model,'autonomy')*.015:0)},0);const agentGain = produced * state.allocation.agents / 100 * (1 + strategicBonus(state, 'agents') + autonomy) * allocationEfficiency * (1 + deployedIdentityBonus(state,'agents'));
  const metrics = marketMetrics(state);
  const userStep = Math.max(0.2 * seconds, Math.abs(metrics.target - state.resources.users) * BALANCE.market.userConvergence * seconds);
  const users = metrics.target > state.resources.users ? Math.min(metrics.target, state.resources.users + userStep) : Math.max(metrics.target, state.resources.users - userStep);
  const creditGain = users * revenuePerUser(state) * seconds;
  const safety = state.model.deployed.reduce((sum,id) => {const model=MODEL_CATALOG.find(item=>item.id===id);return sum+(model?effectiveModelStat(state,model,'safety')*.1:0)}, 0);
  const reputation = Math.min(10, state.market.reputation + dataGain * 0.00004 * (1 + safety * 0.06 + strategicBonus(state, 'reputationGrowth')));
  const adoption = Math.min(100, state.market.adoption + agentGain * 0.0002 + users * seconds * 0.00004 * (1 + deployedIdentityBonus(state,'adoption')));
  const wasTrainingActive=state.model.trainingActive;
  // Manually generated Compute uses the same stored resource and is atomically
  // invested by active Training on the next simulation update.
  const storedTrainingUsed = wasTrainingActive ? state.resources.compute : 0;
  let trainingProgress = state.model.trainingProgress;
  let trainingActive = state.model.trainingActive;
  let trainingSession = state.model.trainingSession;
  let lastTrainingResult = state.model.lastTrainingResult;
  let level = activeProgress(state).level; let xp = activeProgress(state).xp; let upgradePoints = modelAvailablePoints(activeProgress(state)); let trainings=modelTrainingCount(activeProgress(state)); let totalPointsEarned=activeProgress(state).totalPointsEarned??upgradePoints; const totalPointsSpent=activeProgress(state).totalPointsSpent??0;
  let completedTraining = false;
  if (trainingActive) {
    const computeInvested = rawTrainingGain + storedTrainingUsed;
    trainingSession = { ...trainingSession, activeElapsedMs: (trainingSession?.activeElapsedMs ?? 0) + deltaMs, computeInvested: (trainingSession?.computeInvested ?? 0) + computeInvested };
    trainingProgress += trainingGain + storedTrainingUsed * effectiveTrainingMultiplier;
    const required = trainingRequiredForState(state);
    if (trainingProgress >= required) { const startingLevel=trainingSession?.startingLevel??level,pointsEarned=trainingSession?.doublePointsPurchased?2:1,completed=completeTrainingProgress({level,xp,upgradePoints,trainings,totalPointsEarned,totalPointsSpent},pointsEarned);({level,xp,upgradePoints,trainings,totalPointsEarned}=completed);trainingProgress = 0; trainingActive = false; completedTraining = true; lastTrainingResult={...trainingSession,modelId:state.model.activeId,completedAt:Date.now(),completionPlaytimeMs:state.statistics.playTimeMs+deltaMs,actualDuration:(trainingSession?.activeElapsedMs??deltaMs)/1000,effectiveDuration:(trainingSession?.activeElapsedMs??deltaMs)/1000,computeInvested:trainingSession?.computeInvested??computeInvested,requiredCompute:required,startingLevel,resultingLevel:level,upgradePointsGained:pointsEarned,offline:false,availablePointsAfter:upgradePoints,totalPointsEarned};trainingSession=null; }
  }
  const patentRate = patentEnabled ? patentResearchPerSecond(state) : 0;
  let patentProgress = state.patents.progress + patentRate * seconds;
  let discoveredPatents = state.patents.discovered; let patentHistory = state.patents.history; let equippedPatents = state.patents.equipped; let patentDiscovery = null;
  const nextPatent = PATENTS[discoveredPatents.length];
  if (nextPatent && patentProgress >= patentResearchRequired(discoveredPatents.length)) { patentProgress -= patentResearchRequired(discoveredPatents.length); discoveredPatents = [...discoveredPatents, nextPatent.id]; patentHistory = [...patentHistory, { id: nextPatent.id, discoveredAt: Date.now(), cycle: state.meta.cycles }]; if (equippedPatents.length < state.patents.slots) equippedPatents = [...equippedPatents, nextPatent.id]; patentDiscovery = nextPatent; }
  const eventCountdown = state.world.activeEvent ? state.world.nextEventMs : featureUnlocked(state,'marketing') ? state.world.nextEventMs - deltaMs : state.world.nextEventMs;
  const event = featureUnlocked(state,'marketing') && !state.world.activeEvent && eventCountdown <= 0 ? WORLD_EVENTS[(state.meta.cycles + Math.floor(state.statistics.playTimeMs / 90_000)) % WORLD_EVENTS.length] : state.world.activeEvent;
  let next = {
    ...state,
    resources: { ...state.resources, credits: state.resources.credits + creditGain, compute: Math.max(0, state.resources.compute - storedTrainingUsed + (wasTrainingActive ? 0 : rawTrainingGain)), users, research: state.resources.research + researchGain },
    model: { ...state.model, level, xp, quality: effectiveModelStat(state,activeModel(state),'quality'), upgradePoints, trainingProgress, trainingActive, trainingSession, lastTrainingResult, progress: { ...state.model.progress, [state.model.activeId]: { ...activeProgress(state), level, xp, upgradePoints, availablePoints:upgradePoints, trainings, trainingCount:trainings, totalPointsEarned, totalPointsSpent } } },
    market: { ...state.market, reputation, adoption, demand: metrics.demand },
    statistics: { ...state.statistics, totalCreditsEarned: state.statistics.totalCreditsEarned + creditGain, creditSources:addCreditSource(state.statistics.creditSources,'user-revenue',creditGain), totalComputeProduced: state.statistics.totalComputeProduced + produced, totalComputeConsumed: state.statistics.totalComputeConsumed + produced * (researchAllocation(state) + state.allocation.data + state.allocation.agents) / 100 + produced * state.allocation.inference / 100 * metrics.utilization + (wasTrainingActive ? rawTrainingGain : 0) + storedTrainingUsed, totalComputeWasted: state.statistics.totalComputeWasted + produced * state.allocation.inference / 100 * (1 - metrics.utilization), playTimeMs: state.statistics.playTimeMs + deltaMs },
    run: { ...state.run, creditsEarned: state.run.creditsEarned + creditGain, computeProduced: state.run.computeProduced + produced },
    session: { ...state.session, elapsedMs: state.session.elapsedMs + deltaMs },
    world: { ...state.world, activeEvent: event, nextEventMs: event ? Math.max(0, eventCountdown) : eventCountdown, modifiers: state.world.modifiers.filter((modifier) => modifier.expiresAt > state.statistics.playTimeMs) },
    patents: { ...state.patents, discovered: discoveredPatents, progress: patentProgress, history: patentHistory, equipped: equippedPatents },
    ui: { ...state.ui, patentDiscovery: patentDiscovery ?? state.ui.patentDiscovery },
  };
  next=tickResearchLabs(next,deltaMs);
  if(patentDiscovery&&discoveredPatents.length%10===0)next=earnGems(next,1,'milestone',{kind:'patent',count:discoveredPatents.length});
  if(completedTraining&&level%5===0){next=earnGems(next,1,'milestone',{kind:'model-level',level});next=enqueueReward(next,{priority:'normal',category:'milestone',title:`MODEL LEVEL ${level}`,lines:[{key:'Gem',value:1}],metadata:{modelId:state.model.activeId,level}})}if (completedTraining) {const points=lastTrainingResult?.upgradePointsGained??1;next = { ...next, ui: { ...next.ui, toast: { message: `Training complete · Level ${level} · +${points} Model Point${points===1?'':'s'} · ${upgradePoints} available`, id: Date.now() } } };}
  next = applyAutomation(awardAchievements(next));
  if (Math.floor(state.statistics.playTimeMs / 60_000) !== Math.floor(next.statistics.playTimeMs / 60_000)) next = ensureMissions(next);
  return reconcileTutorial(next);
}

function feedback(state, message) { return { ...state, ui: { ...state.ui, toast: { message, id: Date.now() } } }; }
function spendCredits(state, cost) { return { ...state, resources: { ...state.resources, credits: state.resources.credits - cost }, statistics: { ...state.statistics, totalCreditsSpent: state.statistics.totalCreditsSpent + cost } }; }
function addCreditSource(sources,source,amount){return{...sources,[source]:(sources?.[source]??0)+amount}}
export function grantCredits(state, amount, source='other') { return { ...state, resources: { ...state.resources, credits: state.resources.credits + amount }, statistics: { ...state.statistics, totalCreditsEarned: state.statistics.totalCreditsEarned + amount, creditSources:addCreditSource(state.statistics.creditSources,source,amount) }, run: { ...state.run, creditsEarned: state.run.creditsEarned + amount } }; }

export function buyHardware(state, itemId) {
  return buyHardwareBulk(state,itemId,1,'x1');
}
export function hardwarePurchaseEligibility(state,itemId,mode=1){
  const item=HARDWARE_CATALOG.find(({id})=>id===itemId),isMax=mode==='max';
  if(!item)return{isUnlocked:false,prerequisiteMet:false,quantity:0,totalCost:0,canAfford:false,canPurchase:false,disabledReason:'INVALID_HARDWARE'};
  const prerequisite=item.tier>0?HARDWARE_CATALOG[item.tier-1]:null;
  const prerequisiteMet=!prerequisite||(state.hardware[prerequisite.id]??0)>0;
  const isUnlocked=prerequisiteMet;
  const requestedQuantity=isMax?Infinity:Math.max(1,Math.floor(Number(mode)||1));
  let quantity=0,totalCost=0,probe=state;
  if(isUnlocked){
    while(quantity<requestedQuantity&&quantity<100_000){
      const cost=effectiveHardwareCost(probe,item);
      if(isMax&&totalCost+cost>state.resources.credits)break;
      totalCost+=cost;quantity+=1;
      probe={...probe,hardware:{...probe.hardware,[itemId]:(probe.hardware[itemId]??0)+1}};
    }
    // A zero-quantity MAX quote still exposes the canonical next-unit price.
    if(isMax&&quantity===0)totalCost=effectiveHardwareCost(state,item);
  }
  const canAfford=isUnlocked&&(isMax?quantity>0:state.resources.credits>=totalCost);
  const canPurchase=isUnlocked&&quantity>0&&canAfford;
  return{isUnlocked,prerequisiteMet,prerequisiteId:prerequisite?.id??null,prerequisiteName:prerequisite?.name??null,quantity,totalCost,canAfford,canPurchase,disabledReason:!prerequisiteMet?'PREREQUISITE':canPurchase?null:'INSUFFICIENT_CREDITS'};
}
export function hardwareBulkCost(state,itemId,mode=1){
  const {quantity,totalCost}=hardwarePurchaseEligibility(state,itemId,mode);
  return{quantity,totalCost};
}
export function buyHardwareBulk(state,itemId,mode=1,purchaseMode=String(mode)){
  const item=HARDWARE_CATALOG.find(({id})=>id===itemId),quote=hardwarePurchaseEligibility(state,itemId,mode);if(!item||!quote.canPurchase)return state;
  const ownedBefore=state.hardware[itemId],creditsBefore=state.resources.credits,paid=spendCredits(state,quote.totalCost),ownedAfter=ownedBefore+quote.quantity;
  return feedback({...paid,hardware:{...paid.hardware,[itemId]:ownedAfter},ui:{...paid.ui,lastHardwarePurchase:{hardwareId:itemId,quantity:quote.quantity,totalCost:quote.totalCost,creditsBefore,creditsAfter:creditsBefore-quote.totalCost,ownedBefore,ownedAfter,purchaseMode}}},`${item.name} x${quote.quantity} online · +${item.computePerSecond*quote.quantity} Compute/s`);
}

export function optimizeCode(state) {
  const gain = optimizeGain(state);
  return feedback({ ...state, resources: { ...state.resources, compute: state.resources.compute + gain }, statistics: { ...state.statistics, totalComputeProduced: state.statistics.totalComputeProduced + gain, totalManualComputeProduced: state.statistics.totalManualComputeProduced + gain, totalClicks: state.statistics.totalClicks + 1 }, run: { ...state.run, computeProduced: state.run.computeProduced + gain,taps:(state.run.taps??0)+1,manualComputeGenerated:(state.run.manualComputeGenerated??0)+gain },session:{...state.session,taps:(state.session.taps??0)+1,manualComputeGenerated:(state.session.manualComputeGenerated??0)+gain} }, `+${gain.toFixed(1)} Compute${state.model.trainingActive ? ' · queued for Training' : ''}`);
}

export function optimizeGain(state) {
  const rate = computePerSecond(state);
  const activeShare = 0.58 / (1 + Math.sqrt(rate / 350)),tap=BALANCE.tapping;
  const trainingInjection=state.model.trainingActive&&hasTechnologyMechanic(state,'training-injection')?1.75:1;
  const scaling=1+Math.floor((state.model.level??1)/tap.modelLevelsPerStep)*tap.modelLevelBonus+Math.floor((state.hardware.homeComputer??0)/tap.pocketComputersPerStep)*tap.pocketComputerBonus+purchasedTechnologyNodes(state).filter(node=>node.branch==='compute').length*tap.techBonus;
  const flat=Math.floor((state.hardware.calculator??0)/tap.calculatorUnitsPerStep)*tap.calculatorFlatBonus;
  const datacenterAssist=(state.hardware.hyperscaleDatacenter??0)*HARDWARE_CATALOG.find(item=>item.id==='hyperscaleDatacenter').computePerSecond*tap.datacenterShare;
  const patentTap=state.patents.equipped.includes('voltage-curve')?1+Math.min(.5,HARDWARE_CATALOG.reduce((tier,item)=>state.hardware[item.id]>0?Math.max(tier,item.tier):tier,0)*.03):1;
  return Math.max(0.5,(Math.max(tap.base+flat+datacenterAssist,rate*activeShare))*scaling*patentTap*Math.max(0.1,1+strategicBonus(state,'click'))*trainingInjection);
}

export function trainModel(state) {
  if (state.model.trainingActive || computePerSecond(state) <= 0) return state;
  const required=trainingRequiredForState(state),rate=trainingRatePerSecond(state),multiplier=trainingMultiplier(state);
  const trainingSession={modelId:state.model.activeId,startedAt:Date.now(),startPlaytimeMs:state.statistics.playTimeMs,startingLevel:activeProgress(state).level,baseRequired:required,expectedDuration:required/Math.max(.0001,rate),activeElapsedMs:0,computeInvested:0,modifiers:{trainingMultiplier:multiplier,allocationEfficiency:1+strategicBonus(state,'allocationEfficiency'),allocation:state.allocation.training}};
  const checkpoint=hasTechnologyMechanic(state,'checkpointing')?required*.05:0;
  return feedback({ ...state, model: { ...state.model, trainingActive: true, trainingProgress:checkpoint, trainingSession, lastTrainingResult:null } }, `${activeModel(state).name} training run started${checkpoint?' · checkpoint restored':''}`);
}


export function trainingFinishGemCost(state){if(!state.model.trainingActive)return 0;const minutes=Math.max(0,trainingEtaSeconds(state))/60;return Math.max(1,Math.ceil(BALANCE.training.finishGemBase+minutes**BALANCE.training.finishGemMinutesExponent))}
export function trainingDoublePointGemCost(state){if(!state.model.trainingActive||state.model.trainingSession?.doublePointsPurchased)return 0;const modelTier=Math.max(0,MODEL_CATALOG.findIndex(model=>model.id===state.model.activeId));return BALANCE.training.doublePointGemBase+Math.floor(modelTier/2)}
export function buyTrainingDoublePoints(state){const cost=trainingDoublePointGemCost(state);if(!cost)return state;const paid=spendGems(state,cost,'training-double-points');if(paid===state)return state;return feedback({...paid,model:{...paid.model,trainingSession:{...paid.model.trainingSession,doublePointsPurchased:true}}},`Training completion upgraded · +2 Model Points`)}
export function finishTrainingWithGems(state){const cost=trainingFinishGemCost(state);if(!cost)return state;const paid=spendGems(state,cost,'training-finish');if(paid===state)return state;const prepared={...paid,model:{...paid.model,trainingProgress:trainingRequiredForState(paid)}};return tickGame(prepared,0)}

export function patentResearchRequired(index) { const tier=Math.floor(index/10); return Math.floor(BALANCE.patents.baseRequirement * BALANCE.patents.discoveryGrowth ** index * BALANCE.patents.tierGrowth ** tier); }
function patentLevel(state, patentId) { return state.patents.levels[patentId] ?? 1; }
function patentLevelMultiplier(state, patentId) { return 1 + (patentLevel(state, patentId) - 1) * 0.5; }
export function patentUpgradeCost(state, patentId) { return Math.ceil(2 * patentLevel(state, patentId) ** 1.7*Math.max(.2,1-technologyEffect(state,'patentUpgradeCost'))); }
export function patentCurrentBonus(state, patentId) { const patent = PATENTS.find(({ id }) => id === patentId); return patent ? patent.value * patentLevelMultiplier(state, patentId) : 0; }
export function effectivePatentSlots(state){return hasTechnologyMechanic(state,'narrow-patents')?2:Math.max(1,state.patents.slots+technologyEffect(state,'patentSlots'))}
export function togglePatentEquipped(state, patentId) { if (!featureUnlocked(state,'patents') || !state.patents.discovered.includes(patentId)) return state; const alreadyEquipped = state.patents.equipped.includes(patentId),slots=effectivePatentSlots(state); const swapping = !alreadyEquipped && state.patents.equipped.length >= slots; const equipped = alreadyEquipped ? state.patents.equipped.filter((id) => id !== patentId) : swapping ? [...state.patents.equipped.slice(1), patentId] : [...state.patents.equipped, patentId]; return feedback({ ...state, patents: { ...state.patents, equipped } }, alreadyEquipped ? 'Patent unequipped' : swapping ? 'Patent loadout swapped' : 'Patent equipped'); }
export function upgradePatent(state, patentId) { if (!state.patents.discovered.includes(patentId)) return state; const cost = patentUpgradeCost(state, patentId); if (state.meta.intelligence < cost) return state; return feedback({ ...state, meta: { ...state.meta, intelligence: state.meta.intelligence - cost }, patents: { ...state.patents, levels: { ...state.patents.levels, [patentId]: patentLevel(state, patentId) + 1 }, intInvested: { ...state.patents.intInvested, [patentId]: (state.patents.intInvested[patentId] ?? 0) + cost } } }, `${PATENTS.find(({id}) => id === patentId).name} upgraded`); }
export const PATENT_SLOT_PRICES = { 4: 250, 5: 600, 6: 1_200, 7: 2_500, 8: 5_000 };
export function buyPatentSlot(state) { const nextSlot = state.patents.slots + 1, cost = PATENT_SLOT_PRICES[nextSlot]; if (!cost) return state;const paid=spendGems(state,cost,'patent-slot',{slot:nextSlot});if(paid===state)return state;return feedback({ ...paid, patents: { ...paid.patents, slots: nextSlot } }, `Patent Slot ${nextSlot} unlocked`); }
export function patentResearchPerSecond(state) { if (!featureUnlocked(state,'patents') || state.patents.discovered.length >= PATENTS.length) return 0; const allocated=computePerSecond(state)*state.allocation.research/100; const researchSkill=state.model.deployed.reduce((sum,id)=>{const model=MODEL_CATALOG.find(entry=>entry.id===id);return sum+(model?effectiveModelStat(state,model,'research')*.03:0)},0); const patentFeedback=hasTechnologyMechanic(state,'recursive-discovery')?state.patents.equipped.filter(id=>PATENTS.find(p=>p.id===id)?.tags?.includes('RESEARCH')).length*.08:0;const agentScience=hasTechnologyMechanic(state,'agent-research')*state.allocation.agents*.005;const specialization=1+strategicBonus(state,'research')+deployedIdentityBonus(state,'research')+researchSkill+patentFeedback+agentScience; return allocated * BALANCE.patents.baseResearchRate * Math.max(.1,specialization) / (hasTechnologyMechanic(state,'deep-research')?1.5:1); }

export function energyBuildingCost() { return Infinity; }
export function buyEnergyBuilding(state) { return state; }

export function modelImprovementCost(state, modelId, path) { const rank=state?.model?.progress?.[modelId]?.skills?.[path]??0; return BALANCE.training.pointCosts[rank]??Math.ceil((rank+1)/2); }
function stateWithModelSkillLevel(state,modelId,path,level){const progress=state.model.progress?.[modelId];if(!progress)return state;return{...state,model:{...state.model,progress:{...state.model.progress,[modelId]:{...progress,skills:{...progress.skills,[path]:level}}},improvements:{...state.model.improvements,[modelId]:{...state.model.improvements?.[modelId],[path]:level}}}}}
export function modelSkillEconomyPreview(state, modelId, path) { const progress=state.model.progress?.[modelId];if(!progress)return null;const levelBefore=progress.skills?.[path]??0,next=stateWithModelSkillLevel(state,modelId,path,levelBefore+1),beforeEconomy=economySnapshot(state),afterEconomy=economySnapshot(next),metric={quality:'demand',popularity:'demand',efficiency:'capacity'}[path]??'demand',before=beforeEconomy[metric]??0,after=afterEconomy[metric]??0;return{modelId,path,levelBefore,levelAfter:levelBefore+1,metric,before,after,percentChange:before?(after-before)/Math.abs(before):after?1:0,economyBefore:beforeEconomy,economyAfter:afterEconomy}; }
export function upgradeModelSkill(state,modelId,skillId){const model=MODEL_CATALOG.find(({id})=>id===modelId),progress=state.model.progress?.[modelId];if(!model||!progress||!state.model.owned.includes(modelId)||!MODEL_SKILLS.includes(skillId)||!skillUnlocked(state,skillId))return state;const cost=modelImprovementCost(state,modelId,skillId),pointsBefore=modelAvailablePoints(progress);if(pointsBefore<cost)return state;const availablePoints=pointsBefore-cost,totalPointsSpent=Math.max(0,progress.totalPointsSpent??0)+cost,totalPointsEarned=Math.max(progress.totalPointsEarned??0,pointsBefore+(progress.totalPointsSpent??0)),skills={...progress.skills,[skillId]:(progress.skills?.[skillId]??0)+1},nextProgress={...progress,upgradePoints:availablePoints,availablePoints,trainings:modelTrainingCount(progress),trainingCount:modelTrainingCount(progress),totalPointsEarned,totalPointsSpent,skills};if(totalPointsEarned!==availablePoints+totalPointsSpent)throw new TypeError(`${modelId} Model Point transaction violated accounting invariant`);const improvements={...state.model.improvements,[modelId]:skills},active=modelId===state.model.activeId,next={...state,model:{...state.model,upgradePoints:active?availablePoints:state.model.upgradePoints,quality:active?effectiveModelStat({...state,model:{...state.model,progress:{...state.model.progress,[modelId]:nextProgress}}},model,'quality'):state.model.quality,progress:{...state.model.progress,[modelId]:nextProgress},improvements}};return feedback(next,`${model.name} ${skillId} specialized`)}
export const improveModel=upgradeModelSkill;

export function acquireModel(state, modelId) {const model=MODEL_CATALOG.find(({id})=>id===modelId),index=MODEL_CATALOG.findIndex(({id})=>id===modelId);const legacySmartChat=modelId==='smartChat'&&state.meta.techNodes.includes('system-model-engineering');if(!model||(model.unlockTech&&!state.meta.techNodes.includes(model.unlockTech)&&!legacySmartChat)||index>0&&!state.model.owned.includes(MODEL_CATALOG[index-1].id))return state;if(state.model.owned.includes(modelId)){const progress=state.model.progress?.[modelId]??{level:1,xp:0,upgradePoints:0,availablePoints:0,trainings:0,trainingCount:0,totalPointsEarned:0,totalPointsSpent:0,skills:{}};return{...state,model:{...state.model,activeId:modelId,trainingTarget:modelId,level:progress.level,xp:progress.xp,upgradePoints:progress.upgradePoints,quality:effectiveModelStat(state,model,'quality')}}}const progress={level:1,xp:0,upgradePoints:0,availablePoints:0,trainings:0,trainingCount:0,totalPointsEarned:0,totalPointsSpent:0,skills:{}};return feedback({...state,meta:{...state.meta,unlockedModels:[...new Set([...(state.meta.unlockedModels??state.model.owned),modelId])]},model:{...state.model,activeId:modelId,trainingTarget:modelId,level:1,xp:0,upgradePoints:0,quality:model.stats.quality,owned:[...state.model.owned,modelId],progress:{...state.model.progress,[modelId]:progress}}},`${model.name} permanently unlocked`)}

export function toggleModelDeployment(state, modelId) { if (!state.model.owned.includes(modelId)) return state; const deployed = state.model.deployed.includes(modelId) ? state.model.deployed.filter((id) => id !== modelId) : [...state.model.deployed, modelId]; if (!deployed.length || deployed.length > 3) return state; return { ...state, model: { ...state.model, deployed } }; }

export function setAllocation(state, category, value) {
  if (!(category in state.allocation)) return state;
  if (!featureUnlocked(state, 'allocation') && ['research', 'data', 'agents'].includes(category)) return state;
  if (category === 'research' && !isResearchUnlocked(state)) return state;
  if (!featureUnlocked(state, 'agents') && category === 'agents') return state;
  const requested = Math.max(0, Math.min(100, Number(value)));
  const available = Object.keys(state.allocation).filter((key) => key !== 'research' || isResearchUnlocked(state)).filter((key) => key !== 'agents' || featureUnlocked(state,'agents'));
  const others = available.filter((key) => key !== category);
  const remaining = 100 - requested;
  const otherTotal = others.reduce((sum, key) => sum + state.allocation[key], 0);
  const allocation = { ...state.allocation, research:isResearchUnlocked(state)?state.allocation.research:0, agents:featureUnlocked(state,'agents')?state.allocation.agents:0, [category]: requested };
  others.forEach((key, index) => { allocation[key] = index === others.length - 1 ? 100 - Object.entries(allocation).filter(([name]) => name !== key).reduce((sum, [, amount]) => sum + amount, 0) : otherTotal ? Math.round(state.allocation[key] / otherTotal * remaining) : Math.round(remaining / others.length); });
  return { ...state, allocation };
}

export function setPrice(state, value) { if (!featureUnlocked(state,'marketing')) return state; return { ...state, market: { ...state.market, priceMultiplier: Math.max(0.5, Math.min(3, Number(value))) } }; }
export function marketingCost(stateOrLevel){const level=typeof stateOrLevel==='number'?stateOrLevel:stateOrLevel?.market?.marketing??0;const costModifier=typeof stateOrLevel==='number'?0:strategicBonus(stateOrLevel,'marketingCost');return Math.ceil(BALANCE.market.marketingCostBase*BALANCE.market.marketingCostGrowth**Math.max(0,level)*Math.max(.1,1-costModifier))}
export function marketingPurchasePreview(state){const cost=marketingCost(state),before=marketMetrics(state),afterState={...state,market:{...state.market,marketing:state.market.marketing+1}},after=marketMetrics(afterState),revenueDelta=after.revenue-before.revenue;return{levelBefore:state.market.marketing,levelAfter:state.market.marketing+1,cost,demandBefore:before.demand,demandAfter:after.demand,usersBefore:before.target,usersAfter:after.target,revenueBefore:before.revenue,revenueAfter:after.revenue,estimatedPaybackSeconds:revenueDelta>0?cost/revenueDelta:Infinity}}
export function buyMarketing(state) { if (!featureUnlocked(state,'marketing')) return state; const cost=marketingCost(state);if(state.resources.credits<cost)return state;const paid=spendCredits(state,cost),preview=marketingPurchasePreview(state);return feedback({ ...paid, market: { ...paid.market, marketing: paid.market.marketing + 1 } }, `Marketing Level ${preview.levelAfter} · +${Math.round(preview.demandAfter-preview.demandBefore)} Demand`); }

export function researchUpgradeCost(state,upgrade){const project=RESEARCH_PROJECTS.find(item=>item.id===upgrade.id);return project?researchProjectCost(state,project):upgrade.cost}
export function canBuyUpgrade(state, upgrade) { const cost=upgrade.category==='research'?researchUpgradeCost(state,upgrade):upgrade.cost,balance = upgrade.category === 'research' ? state.resources.research : state.resources.credits; const unlocked = upgrade.category === 'hardware' ? state.hardware[upgrade.hardwareId] >= upgrade.unlock : state.model.level >= upgrade.unlock; const labAvailable=upgrade.category!=='research'||featureUnlocked(state,'research')&&state.researchLabs?.labs?.some(lab=>lab.id<=unlockedResearchLabs(state)&&!lab.projectId);return (upgrade.category==='research'||!state.upgrades.includes(upgrade.id)) && unlocked && balance >= cost&&labAvailable; }
export function buyUpgrade(state, upgradeId) { const upgrade = UPGRADES.find(({ id }) => id === upgradeId); if (!upgrade || !canBuyUpgrade(state, upgrade)) return state;if(upgrade.category==='research'){const lab=state.researchLabs.labs.find(entry=>entry.id<=unlockedResearchLabs(state)&&!entry.projectId);return lab?feedback(startResearchProject(state,upgradeId,lab.id),`${upgrade.name} assigned to Lab ${lab.id}`):state}const paid=spendCredits(state,upgrade.cost);return feedback({ ...paid, upgrades: [...paid.upgrades, upgradeId] }, `${upgrade.name} installed`); }

export function objectiveProgress(state, objective) {
  const metric = objective.metric ?? objective.type;
  const progress = Object.values(state.model.progress ?? {});
  const value = metric.startsWith('hardware:') ? state.hardware[metric.slice(9)] ?? 0 : {
    hardware: state.hardware.calculator, level: Math.max(state.model.level, ...progress.map((item) => item.level ?? 1)), users: state.resources.users,
    gamingPc: state.hardware.gamingPc, workstation: state.hardware.workstation, computeRate: computePerSecond(state),
    totalCompute: state.statistics.totalComputeProduced, creditsEarned: state.statistics.totalCreditsEarned,totalHardware:Object.values(state.hardware).reduce((sum,value)=>sum+value,0),creditsRate:marketMetrics(state).revenue,
    trainings: progress.reduce((sum, item) => sum + (item.trainings ?? 0), 0),
    pointsSpent: progress.reduce((sum, item) => sum + (item.totalPointsSpent ?? 0), 0),
    marketing: state.market.marketing, research: state.resources.research, researchUnlocked:isResearchUnlocked(state)?1:0, patents: state.patents.discovered.length,
    cycles: state.meta.cycles, tech: state.meta.techNodes.length,models:state.model.owned.length,
    keystones:TECH_NODES.filter(node=>node.type==='keystone'&&state.meta.techNodes.includes(node.id)).length,
    maxBranchInvestment:Math.max(0,...Object.values(branchInvestment(state))),
  }[metric] ?? 0;
  return Math.min(objective.target, value);
}
export function claimObjective(state, objectiveId) { const objective = OBJECTIVES.find(({ id }) => id === objectiveId); if (!objective || state.objectives[objectiveId] || objectiveProgress(state, objective) < objective.target) return state; const rewarded=grantCredits(state,objective.reward,'objective');return feedback({ ...rewarded, objectives: { ...rewarded.objectives, [objectiveId]: true } }, `Objective complete · +${objective.reward} Credits`); }

export function advanceTutorial(state) { const definition=activeTutorialStep(state);if(!definition)return state;if(definition.view&&!viewUnlocked(state,definition.view))return state;const acknowledged=[...new Set([...(state.tutorial.acknowledged??[]),definition.id])];return reconcileTutorial({...state,tutorial:{...state.tutorial,acknowledged},ui:{...state.ui,activeView:definition.view??state.ui.activeView}}); }
export function skipTutorial(state){if(state.tutorial.completed)return state;return{...state,tutorial:{...state.tutorial,step:TUTORIAL_STEPS.length,completed:true}}}

function achievementMetric(state, metric) {
  const hardware = Object.values(state.hardware).reduce((sum, quantity) => sum + quantity, 0);
  return { totalCreditsEarned: state.statistics.totalCreditsEarned, totalComputeProduced: state.statistics.totalComputeProduced, totalClicks: state.statistics.totalClicks, users: state.resources.users, quality: state.model.quality, hardware, level: state.model.level, research: state.resources.research, reputation: state.market.reputation, cycles: state.meta.cycles }[metric];
}

function awardAchievements(state) {
  if (!featureUnlocked(state, 'account')) return state;
  const earned = ACHIEVEMENTS.filter((achievement) => !state.meta.achievements[achievement.id] && achievementMetric(state, achievement.metric) >= achievement.target);
  if (!earned.length) return state;
  const gems = earned.filter((achievement) => Number(achievement.id.split('-').at(-1)) % 4 === 0).length;
  const rewarded=gems?earnGems(state,gems,'achievement',{ids:earned.map(item=>item.id)}):state;return feedback({ ...rewarded, meta: { ...rewarded.meta, achievements: { ...rewarded.meta.achievements, ...Object.fromEntries(earned.map((achievement) => [achievement.id, Date.now()])) } } }, `${earned[0].name} achieved · permanent company bonus${gems ? ` · +${gems} Gem` : ''}`);
}

function applyAutomation(state) {
  let next = state;
  if (hasTechnologyMechanic(state,'smart-allocation')) {
    const metrics = marketMetrics(state); const desiredInference = metrics.utilization < 0.75 ? Math.max(15, state.allocation.inference - 1) : Math.min(65, state.allocation.inference + 1);
    if (desiredInference !== state.allocation.inference) next = setAllocation(next, 'inference', desiredInference);
  }
  if (hasTechnologyMechanic(state,'auto-buy') && state.session.elapsedMs - state.automation.lastHardwarePurchaseMs >= 1_000) {
    const item = HARDWARE_CATALOG.find((hardware) => isHardwareUnlocked(next, hardware) && effectiveHardwareCost(next, hardware) <= next.resources.credits * 0.25);
    if (item) { next = buyHardware(next, item.id); next = { ...next, automation: { ...next.automation, lastHardwarePurchaseMs: state.session.elapsedMs } }; }
  }
  if (hasTechnologyMechanic(state,'auto-training') && !next.model.trainingActive && computePerSecond(next) > 0) next = trainModel(next);
  if(hasTechnologyMechanic(state,'auto-marketing')&&marketMetrics(next).bottleneck==='DEMAND LIMITED'&&next.resources.credits>=marketingCost(next))next=buyMarketing(next);
  return next;
}

export function developmentCycleRequirements(state){const hardwareTier=HARDWARE_CATALOG.reduce((highest,item)=>state.hardware[item.id]>0?Math.max(highest,item.tier):highest,0),modelLevel=Math.max(state.model.level??1,...Object.values(state.model.progress??{}).map(progress=>progress.level??1)),objectives=Object.values(state.objectives??{}).filter(Boolean).length;const values={modelLevel,hardwareTier,runCompute:state.run.computeProduced,runCredits:state.run.creditsEarned,objectives},targets={modelLevel:BALANCE.intelligence.minimumModelLevel,hardwareTier:BALANCE.intelligence.minimumHardwareTier,runCompute:BALANCE.intelligence.computeScale,runCredits:BALANCE.intelligence.creditScale,objectives:BALANCE.intelligence.minimumObjectives},met=Object.fromEntries(Object.keys(targets).map(key=>[key,values[key]>=targets[key]]));return{values,targets,met,ready:Object.values(met).every(Boolean)}}
export function cycleIntelligence(state) { const requirements=developmentCycleRequirements(state);if(!requirements.ready)return 0;const{hardwareTier:tier,modelLevel:highestModel}=requirements.values,computeOrders=Math.log10(Math.max(1,state.run.computeProduced/BALANCE.intelligence.computeScale)),creditOrders=Math.log10(Math.max(1,state.run.creditsEarned/BALANCE.intelligence.creditScale)),milestones=Math.max(0,tier-BALANCE.intelligence.minimumHardwareTier)*.3+Math.max(0,highestModel-BALANCE.intelligence.minimumModelLevel)*.08,technology=Math.max(.25,1+strategicBonus(state,'intelligenceGain')*.25);return Math.max(1,Math.floor((1+computeOrders*.55+creditOrders*.3+milestones)*technology*BALANCE.intelligence.breakthroughMultiplier**(state.meta.breakthroughs??0))); }
export function developmentCyclePreview(state){const gain=cycleIntelligence(state),before=state.meta.totalIntelligence??0,after=before+gain;return{gain,lifetimeBefore:before,lifetimeAfter:after,incomeBonusBefore:before*.1,incomeBonusAfter:after*.1,newSystems:(state.meta.cycles??0)===0?['Permanent Technology','Research Technology Path']:[]};}
export function canDevelop(state) { return cycleIntelligence(state) >= BALANCE.intelligence.cycleRequirement; }
export function startDevelopmentCycle(state) {
  if (!canDevelop(state)) return state;
  const intelligence = cycleIntelligence(state); const fresh = createDefaultState();
  const intelligenceMultiplier = 1 + strategicBonus(state, 'intelligenceGain') + deployedIdentityBonus(state,'intelligence');
  const unlocked=state.meta.unlockedModels??state.model.owned;const progress=Object.fromEntries(unlocked.map(id=>[id,{level:1,xp:0,upgradePoints:0,availablePoints:0,trainings:0,trainingCount:0,totalPointsEarned:0,totalPointsSpent:0,skills:{}}]));const tinyProgress=progress.tinyChat??fresh.model.progress.tinyChat;const gained=Math.floor(intelligence*intelligenceMultiplier),total=state.meta.totalIntelligence+gained;const featureUnlockTimes={...(state.meta.featureUnlockTimes??{})};for(const feature of FEATURE_UNLOCKS)if(feature.int<=total&&featureUnlockTimes[feature.id]===undefined)featureUnlockTimes[feature.id]=state.statistics.playTimeMs;if((state.meta.cycles??0)===0)featureUnlockTimes.allocation??=state.statistics.playTimeMs;return feedback({ ...fresh, resources: { ...fresh.resources, gems: state.resources.gems,research:state.resources.research }, objectives: state.objectives, researchUpgradeLevels:state.researchUpgradeLevels,researchLabs:state.researchLabs, upgrades:[...new Set([...fresh.upgrades,...state.upgrades.filter(id=>id.startsWith('research-'))])], settings: state.settings, session: { ...fresh.session, elapsedMs: state.session.elapsedMs,taps:state.session.taps,manualComputeGenerated:state.session.manualComputeGenerated }, run: { ...fresh.run, number: (state.run.number??state.meta.cycles+1)+1, startedAtSessionMs: state.session.elapsedMs }, statistics: state.statistics, meta: { ...state.meta, unlockedModels:unlocked, intelligence: state.meta.intelligence + gained, totalIntelligence: total, cycles: state.meta.cycles + 1, featureUnlockTimes, cycleHistory:[...(state.meta.cycleHistory??[]),{at:state.statistics.playTimeMs,duration:state.session.elapsedMs,compute:state.run.computeProduced,intelligence:gained}] }, model:{...fresh.model,level:tinyProgress.level,xp:tinyProgress.xp,upgradePoints:tinyProgress.upgradePoints,owned:unlocked,deployed:['tinyChat'],progress}, patents: state.patents, premium: state.premium, retention: state.retention, inventory:state.inventory, consumables:state.consumables, rewardCaches:state.rewardCaches, missions:state.missions, gemEconomy:state.gemEconomy, rewardedBoosts:state.rewardedBoosts, artifacts:state.artifacts, marketplace:state.marketplace, futureMeta:state.futureMeta, balanceRun:state.balanceRun, tutorial: state.tutorial,intro:state.intro }, `Development Cycle ${state.meta.cycles+1} complete · +${gained} INT · operational resources reset; permanent knowledge remains`);
}
export function breakthroughReward(state){if(!canBreakthrough(state))return 0;return Math.max(1,Math.floor((state.statistics.totalComputeProduced/BALANCE.breakthrough.requiredCompute)**BALANCE.breakthrough.exponent));}
export function canBreakthrough(state){return state.meta.totalIntelligence>=BALANCE.breakthrough.requiredLifetimeIntelligence&&state.statistics.totalComputeProduced>=BALANCE.breakthrough.requiredCompute;}
export function startBreakthrough(state){if(!canBreakthrough(state))return state;const reward=breakthroughReward(state),fresh=createDefaultState();return feedback({...fresh,profile:state.profile,resources:{...fresh.resources,gems:state.resources.gems},researchUpgradeLevels:state.researchUpgradeLevels,upgrades:state.upgrades.filter(id=>id.startsWith('research-')),settings:state.settings,statistics:state.statistics,retention:state.retention,premium:state.premium,inventory:state.inventory,consumables:state.consumables,rewardCaches:state.rewardCaches,missions:state.missions,gemEconomy:state.gemEconomy,rewardedBoosts:state.rewardedBoosts,artifacts:state.artifacts,marketplace:state.marketplace,futureMeta:state.futureMeta,balanceRun:state.balanceRun,meta:{...fresh.meta,achievements:state.meta.achievements,breakthroughs:(state.meta.breakthroughs??0)+reward,breakthroughCurrency:(state.meta.breakthroughCurrency??0)+reward},tutorial:state.tutorial},`Breakthrough complete · +${reward} Insight`)}
export function technologyPurchaseEligibility(state,nodeId){const node=TECH_NODES.find(({id})=>id===nodeId)??SYSTEM_TECH_NODES.find(({id})=>id===nodeId);if(!node)return{node:null,canPurchase:false,prerequisitesMet:false,affordable:false,failureReason:'UNKNOWN_NODE'};const purchased=state.meta.techNodes.includes(nodeId),prerequisitesMet=!node.requires||state.meta.techNodes.includes(node.requires),affordable=state.meta.intelligence>=node.cost;return{node,purchased,prerequisitesMet,affordable,canPurchase:!purchased&&prerequisitesMet&&affordable,failureReason:purchased?'ALREADY_PURCHASED':!prerequisitesMet?'PREREQUISITE_MISSING':!affordable?'INSUFFICIENT_INT':null}}
export function purchaseTechnology(state, nodeId) {
  const eligibility=technologyPurchaseEligibility(state,nodeId),node=eligibility.node;if(!eligibility.canPurchase)return state;
  const featureUnlockTimes=node.unlockFeature?{...state.meta.featureUnlockTimes,[node.unlockFeature]:state.meta.featureUnlockTimes?.[node.unlockFeature]??state.statistics.playTimeMs}:state.meta.featureUnlockTimes;let next={ ...state, meta: { ...state.meta, intelligence: state.meta.intelligence - node.cost, techNodes: [...state.meta.techNodes, nodeId], featureUnlockTimes } };
  if(node.unlockModel&&!next.model.owned.includes(node.unlockModel)){const model=MODEL_CATALOG.find(item=>item.id===node.unlockModel);if(model){const progress={level:1,xp:0,upgradePoints:0,availablePoints:0,trainings:0,trainingCount:0,totalPointsEarned:0,totalPointsSpent:0,skills:{}};next={...next,meta:{...next.meta,unlockedModels:[...new Set([...(next.meta.unlockedModels??next.model.owned),model.id])]},model:{...next.model,owned:[...next.model.owned,model.id],progress:{...next.model.progress,[model.id]:progress}}}}}
  const unlocks=node.unlocks?.join(', ')??node.unlock??(node.unlockModel?`${MODEL_CATALOG.find(model=>model.id===node.unlockModel)?.name} activated`:'Permanent effect active');return feedback(next, `${node.name} unlocked · -${node.cost} INT · ${unlocks}`);
}
export const buyTechNode=purchaseTechnology;
export function worldEventChoiceCost(state,choice){if(!choice?.cost)return 0;const severity=choice.severity??'moderate',incomeSeconds=BALANCE.events.incomeSeconds[severity]??BALANCE.events.incomeSeconds.moderate,share=BALANCE.events.creditShare[severity]??BALANCE.events.creditShare.moderate,scaled=Math.min(economySnapshot(state).creditsPerSecond*incomeSeconds,state.resources.credits*share);return Math.ceil(Math.max(choice.cost,scaled));}
export function resolveWorldEvent(state, choiceIndex) {
  const event = state.world.activeEvent; const choice = event?.choices[choiceIndex],cost=worldEventChoiceCost(state,choice); if (!choice || (cost && state.resources.credits < cost)) return state;
  const modifier = { effect: choice.effect, value: choice.value, expiresAt: state.statistics.playTimeMs + BALANCE.events.durationMs };
  const reputationPenalty = choice.penalty === 'reputation' ? -0.15 : 0;
  let next=cost?spendCredits(state,cost):state;if(choice.credits)next=grantCredits(next,Math.max(choice.credits,economySnapshot(state).creditsPerSecond*60),'event');return feedback({ ...next, market: { ...next.market, reputation: Math.max(0.25, next.market.reputation + reputationPenalty) }, world: { activeEvent: null, nextEventMs: BALANCE.events.minimumDelayMs + (next.statistics.totalClicks % 600) * 1_000, modifiers: [...next.world.modifiers, modifier] } }, `${event.title}: ${choice.label}${cost?` · -${cost} Credits`:''}`);
}
export function acceptWorldEventConsequences(state){if(!state.world.activeEvent)return state;return feedback({...state,world:{...state.world,activeEvent:null,nextEventMs:BALANCE.events.minimumDelayMs,modifiers:[...state.world.modifiers,{effect:'revenue',value:-.1,expiresAt:state.statistics.playTimeMs+BALANCE.events.durationMs,source:'event-fallback'}]}},'Event consequences accepted · -10% Revenue for 3 min');}
export function companyStage(state) { const tier = HARDWARE_CATALOG.reduce((highest, hardware) => state.hardware[hardware.id] ? Math.max(highest, hardware.tier) : highest, 0); return ['Garage Developer', 'Startup', 'AI Company', 'Tech Giant', 'Global AI Infrastructure', 'Planetary Compute Network', 'Interplanetary AI', 'Technological Singularity'][Math.min(7, Math.floor(tier / 2))]; }
export function dismissPatentDiscovery(state) { return { ...state, ui: { ...state.ui, patentDiscovery: null } }; }

export function buyGemShopItem(state, itemId) { const item = GEM_SHOP_ITEMS.find(({id}) => id === itemId); if (!featureUnlocked(state,'account') || !item || state.premium.purchases.includes(itemId)) return state;const paid=spendGems(state,item.cost,item.category==='Visual'?'shop-cosmetic':'shop-item',{itemId});if(paid===state)return state;return feedback({ ...paid,premium: { ...paid.premium, purchases: [...paid.premium.purchases, itemId] } }, `${item.name} added to your account`); }

function dateKey(date = new Date()) { return date.toISOString().slice(0,10); }
export function claimLoginReward(state) { const today = dateKey(); if (state.retention.lastLoginDate === today) return state; const yesterday = dateKey(new Date(Date.now() - 86400000)); const streak = state.retention.lastLoginDate === yesterday ? state.retention.loginStreak + 1 : 1; const gems = streak % 7 === 0 ? 3 : 1;const rewarded=earnGems(state,gems,'daily-login',{streak});return feedback({ ...rewarded, retention: { ...rewarded.retention, lastLoginDate: today, loginStreak: streak } }, `Day ${streak} login · +${gems} Gem${gems > 1 ? 's' : ''}`); }
