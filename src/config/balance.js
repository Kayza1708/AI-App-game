/**
 * Milestone 11 progression controls. Gameplay formulas consume this object so
 * pacing can be tuned without hunting through simulation or UI code.
 */
import { RESEARCH_UNLOCK_TECH_ID, TECHNOLOGY_NODES } from '../data/technologyCatalog.js';
import { PRESTIGE_PARAMETERS, TECHNOLOGY_COST_PARAMETERS } from '../systems/PrestigeSystem.js';
export const BALANCE = Object.freeze({
  hardware: Object.freeze({
    bulkDiscountCap: 0.42, upgradeCostFactor: 3, upgradeCostGrowth: 1.78,
    // Each local growth rate is derived as finalCostRatio^(1 / targetPurchaseCount).
    targetPurchaseCounts:Object.freeze([30,30,28,25,25,22,22,20,20,18,18,16,16,15,15,12]),
    targetFinalCostRatios:Object.freeze([48,48,42,36,36,32,32,28,28,24,24,20,20,18,18,15]),
    tierGrowth:Object.freeze([1.13773567,1.13773567,1.14280778,1.15412301,1.15412301,1.17061991,1.17061991,1.18129374,1.18129374,1.19310428,1.19310428,1.20590855,1.20590855,1.21250862,1.21250862,1.25316312]),
    tierCosts: Object.freeze([20,360,1_700,6_500,45_000,1_400_000,70_000_000,32_000_000_000,2_200_000_000_000,180_000_000_000_000,17_000_000_000_000_000,2_000_000_000_000_000_000,280_000_000_000_000_000_000,50_000_000_000_000_000_000_000,12_000_000_000_000_000_000_000_000,32_000_000_000_000_000_000_000_000_000]),
    tierProduction: Object.freeze([.5,2.2,13,110,1_350,22_000,500_000,14_000_000,480_000_000,20_000_000_000,950_000_000_000,55_000_000_000_000,3_800_000_000_000_000,300_000_000_000_000_000,30_000_000_000_000_000_000,3_600_000_000_000_000_000_000]),
  }),
  training: Object.freeze({
    maximumSimulationStepMs:10_000,
    durationBaseSeconds:45,durationSqrtCoefficient:34,
    tierTransitionSeconds:Object.freeze([0,60,180,420,900,1_800,3_600,7_200,14_400]),
    // Static expected throughput anchors; never read actual player modifiers.
    referenceRateByTier:Object.freeze([.25,8,240,7_200,220_000,7_000_000,240_000_000,10_000_000_000,500_000_000_000]),
    referenceLevelPower:2,
    skillGain: 1, pointCosts: Object.freeze([1,1,1,2,2,3,3,4,5,6]), finishGemMinutesExponent:.68, finishGemBase:1, doublePointGemBase:4,
  }),
  models:Object.freeze({tierScale:Object.freeze([1,3.5,12,42,160,650,2_800,14_000,80_000]),levelCoefficient:.16,levelPower:.62,qualityRevenueCoefficient:.12,efficiencyCoefficient:.20}),
  market: Object.freeze({ revenueBase: 0.24, tierMarketGrowth: 1.88, demandScale: 0.075, demandFloor: 0.04, userConvergence: 0.025, capacityScale: 1.7, marketingBase: 0.12, marketingCostBase: 220, marketingCostGrowth: 1.72 }),
  marketV3: Object.freeze({
    marketingCoefficient:.32,qualityDemandCoefficient:.18,
    reputation:Object.freeze({min:.75,max:1.25,steepness:2.2,midpoint:1}),
    adoption:Object.freeze({maxBonus:.5,halfSaturation:50}),
    wordOfMouth:Object.freeze({userScale:1_000,maxBonus:1.5,saturation:3}),
    price:Object.freeze({discountDemandCoefficient:.8,premiumElasticity:1.15,qualityToleranceCoefficient:.1}),
    popularity:Object.freeze({sqrtCoefficient:.3,logCoefficient:.08}),
    acquisition:Object.freeze({baseHalfLifeSeconds:180,minimumHalfLifeSeconds:30,popularityCoefficient:.08,marketingCoefficient:.06}),
    churnHalfLifeSeconds:90,
  }),
  patents: Object.freeze({ baseRequirement: 120, discoveryGrowth: 1.62, tierGrowth: 1.35, baseResearchRate: 1 }),
  intelligence: Object.freeze({
    // Piecewise curve derived from Phase-2B's 6.5e8 => 3 INT early anchor,
    // a 1e14 transition anchor, and 1e300 => 1e30 INT Number-safety anchor.
    entitlementScale:PRESTIGE_PARAMETERS.earlyScale,
    entitlementExponent:PRESTIGE_PARAMETERS.earlyExponent,
    entitlementPivotCompute:PRESTIGE_PARAMETERS.pivotCompute,
    entitlementPivotInt:PRESTIGE_PARAMETERS.pivotEntitlement,
    entitlementLateExponent:PRESTIGE_PARAMETERS.lateExponent,
    firstPrestigeComputeAnchor:650_000_000,
    firstPrestigeIntAnchor:3,
    endgameComputeAnchor:1e300,
    endgameIntAnchor:1e30,
    prestigeModifierCap:PRESTIGE_PARAMETERS.prestigeModifierCap,
    computeScale: 400_000_000,
    creditScale:60_000_000, // Legacy diagnostic only; not an eligibility or reward input.
    cycleRequirement: 1,
    minimumHardwareTier: 4,
    minimumModelLevel: 9,
    minimumObjectives: 6,
    breakthroughMultiplier: 1.65,
  }),
  technologyEconomy:TECHNOLOGY_COST_PARAMETERS,
  breakthrough: Object.freeze({ requiredLifetimeIntelligence: 10_000, requiredCompute: 1e24, exponent: 0.2 }),
  events: Object.freeze({ firstDelayMs: 480_000, minimumDelayMs: 720_000, durationMs: 180_000, incomeSeconds: Object.freeze({minor:30,moderate:90,major:240}), creditShare:Object.freeze({minor:.01,moderate:.03,major:.06}) }),
  items: Object.freeze({ unlockInt: 15, baseSlots: 2, maxSlots: 6, inventoryCapacity: 50, rarityWeights: Object.freeze({Common:55,Uncommon:25,Rare:13,Epic:5,Legendary:1.8,Mythic:.2}) }),
  missions: Object.freeze({
    creditRewardSeconds:Object.freeze({daily:35,weekly:240,monthly:600}),
    creditRewardFloor:Object.freeze({daily:75,weekly:750,monthly:5_000}),
    balanceCaps:Object.freeze({daily:.2,weekly:.35,monthly:.6}),
    nextPurchaseCaps:Object.freeze({daily:.12,weekly:.3,monthly:.55}),
    gems:Object.freeze({daily:2,weekly:7,monthly:24}),
    repeatableCreditWarningShare:.25,
  }),
  research: Object.freeze({ upgradeBaseCost:25_000, upgradeLevelGrowth:2.6, upgradeFamilyGrowth:2.4, maxLabs:5, labGemCosts:Object.freeze({3:120,4:360,5:900}), baseSpeed:1 }),
  rewardedAds:Object.freeze({dailyGemClaims:2,gemReward:2}),
  offline: Object.freeze({ capMs: 2 * 60 * 60 * 1000, maxCapMs:8 * 60 * 60 * 1000, efficiency:.6, doubleGemCost:8, shortChunkMs: 1_000, longChunkMs: 10_000, longThresholdMs: 30 * 60 * 1000, minimumRewardMs: 10_000 }),
  tapping:Object.freeze({base:1.5,modelLevelsPerStep:5,modelLevelBonus:.04,pocketComputersPerStep:10,pocketComputerBonus:.03,calculatorUnitsPerStep:25,calculatorFlatBonus:1,techBonus:.025,datacenterShare:.002}),
  freeGems:Object.freeze({amount:5,cooldownMs:24*60*60*1000}),
  progressionTargets: Object.freeze({ firstCalculator:[10,30], firstHardwareUpgrade:[60,180], firstModelLevel:[60,240], firstDevelopmentCycle:[3600,5400], firstItem:[1800,5400], firstPatentResearch:1500, firstBreakthrough:129_600 }),
});

export const FEATURE_UNLOCKS = Object.freeze([
  { id: 'core', name: 'Core Company', int: 0, views: ['dashboard', 'hardware', 'model', 'objectives'], description: 'Credits, Compute, TinyChat, Training, Model Development, and Objectives.' },
  { id: 'development', name: 'Development Cycles', int: 1, views: ['strategy'], description: 'Spend permanent Intelligence and plan the next run.' },
  { id: 'marketing', name: 'Marketing Division', int: 4, views: ['company', 'market'], description: 'Demand, pricing, Marketing, Reputation, and Adoption.' },
  { id: 'allocation', name: 'Compute Allocation', int: Infinity, views: ['allocation'], description: 'Split Compute between Training and Inference; Research joins after the first Development Cycle.' },
  { id: 'research', name: 'Research Division', int: Infinity, views: ['research'], description: 'Convert allocated Compute into permanent scientific upgrades.' },
  { id: 'items', name: 'Model Equipment', int: 15, views: ['inventory'], description: 'Collect equipment and create specialized Model builds.' },
  { id: 'missions', name: 'Mission Network', int: 4, views: ['objectives'], description: 'Daily goals and long-term account challenges.' },
  { id: 'patents', name: 'Patent Office', int: 20, views: ['patents'], description: 'Permanent discoveries and Patent loadouts.' },
  { id: 'modelSkills', name: 'Model Development', int: 35, views: [], description: 'Spend Model Upgrade Points on specialized skills.' },
  { id: 'automation', name: 'Automation', int: 80, views: ['strategy'], description: 'Automatic allocation, purchasing, and Training.' },
  { id: 'agents', name: 'Agent Economy', int: 120, views: [], description: 'Agent Tasks and autonomous Model skills.' },
  { id: 'enterprise', name: 'Enterprise Customers', int: 170, views: [], description: 'Enterprise Models, revenue, and contracts.' },
  { id: 'globalMarkets', name: 'Global Markets', int: 240, views: [], description: 'Global demand and market-size technologies.' },
  { id: 'datacenters', name: 'Datacenter Network', int: 350, views: [], description: 'Datacenter-scale infrastructure.' },
  { id: 'advancedArchitecture', name: 'Advanced AI Architecture', int: 500, views: [], description: 'Advanced Model eras and architecture Tech.' },
  { id: 'quantum', name: 'Quantum Computing', int: 800, views: [], description: 'Quantum-scale Research and Compute.' },
  { id: 'planetary', name: 'Planetary Compute', int: 1200, views: [], description: 'Infrastructure beyond Earth.' },
  { id: 'account', name: 'Account Progression', int: 20, views: ['achievements', 'gemshop', 'statistics'], description: 'Long-term account rewards and records.' },
  { id: 'breakthrough', name: 'Breakthrough', int: 10_000, views: [], description: 'A second prestige layer for mature civilizations.' },
]);

export const SYSTEM_TECH_NODES = Object.freeze([
  { id:'system-model-engineering', feature:'modelSkills', branch:'Models', name:'Model Engineering', cost:1, visibleAt:0, requires:null, description:'Spend Model Points on the first clear specializations.', unlocks:['Model skills','SmartChat path'] },
  { id:'system-allocation', feature:'allocation', branch:'Compute', name:'Compute Allocation', cost:2, visibleAt:1, requires:'system-model-engineering', description:'Direct Compute between Training, Inference, and future workloads.', unlocks:['Allocation screen','Research Compute'] },
  { id:'system-marketing', feature:'marketing', branch:'Market', name:'Marketing Division', cost:2, visibleAt:1, requires:'system-model-engineering', description:'Control price, Marketing, Reputation, and Adoption.', unlocks:['Market','Company'] },
  { id:'system-missions', feature:'missions', branch:'Company', name:'Mission Network', cost:2, visibleAt:2, requires:'system-model-engineering', description:'Adds rotating account objectives and rewards.', unlocks:['Missions'] },
  { id:'system-research', feature:'research', branch:'Research', name:'Research Division', cost:5, visibleAt:3, requires:'system-allocation', description:'Turns allocated Compute into long-term Research.', unlocks:['Research production'] },
  { id:'system-items', feature:'items', branch:'Models', name:'Model Equipment', cost:4, visibleAt:4, requires:'system-model-engineering', description:'Equip Models with build-defining Items.', unlocks:['Inventory','Equipment'] },
  { id:'system-patents', feature:'patents', branch:'Research', name:'Patent Office', cost:5, visibleAt:6, requires:'system-research', description:'Converts sustained Research into permanent Patents.', unlocks:['Patents'] },
  { id:'system-account', feature:'account', branch:'Company', name:'Account Progression', cost:4, visibleAt:6, requires:'system-missions', description:'Reveals Achievements, Statistics, and Gems.', unlocks:['Achievements','Gem utilities'] },
  { id:'system-automation', feature:'automation', branch:'Automation', name:'Automation', cost:10, visibleAt:12, requires:'system-allocation', description:'Unlocks rules for allocation, purchasing, and Training.', unlocks:['Automation Tech'] },
  { id:'system-enterprise', feature:'enterprise', branch:'Market', name:'Enterprise AI', cost:12, visibleAt:15, requires:'system-marketing', description:'Develop fewer, higher-value business customers.', unlocks:['Enterprise skills'] },
  { id:'system-agents', feature:'agents', branch:'Automation', name:'Agent Systems', cost:20, visibleAt:30, requires:'system-automation', description:'Unlock autonomous workloads and Agent specialization.', unlocks:['Agent Tasks','Autonomy'] },
]);

export const MODEL_SKILL_UNLOCKS = Object.freeze({ quality: 0, efficiency: 0, popularity: 0 });

export function curveValue(base, growth, level) { return base * growth ** Math.max(0, level); }
export function powerCurve(base, level, exponent) { return base * Math.max(1, level) ** exponent; }
export function nextFeatureUnlock(state) { return FEATURE_UNLOCKS.filter((item) => Number.isFinite(item.int) && !featureUnlocked(state,item.id)).sort((a, b) => a.int - b.int)[0] ?? null; }
export function featureUnlocked(state, id) {
  if (['core', 'modelSkills', 'marketing', 'missions'].includes(id)) return true;
  if (id === 'development') return (state.meta.cycles ?? 0) > 0 || (state.meta.totalIntelligence ?? 0) > 0;
  if (id === 'allocation') return (state.meta.cycles ?? 0) > 0 || (state.model?.level ?? 1) >= 4 || (state.hardware?.workstation ?? 0) > 0 || state.meta.techNodes.includes('system-allocation');
  if (id === 'research') return isResearchUnlocked(state);
  if (TECHNOLOGY_NODES.some((node) => node.unlockFeature === id && state.meta.techNodes.includes(node.id))) return true;
  const node = SYSTEM_TECH_NODES.find((item) => item.feature === id);
  return node ? state.meta.techNodes.includes(node.id) : (state.meta.totalIntelligence ?? 0) >= (FEATURE_UNLOCKS.find((item) => item.id === id)?.int ?? Infinity);
}
export function isResearchUnlocked(state) {
  const purchased = state?.meta?.techNodes ?? [];
  const legacyEvidence=state?.meta?.featureUnlockTimes?.research!==undefined||(state?.resources?.research??0)>0||(state?.upgrades??[]).some(id=>id.startsWith('research-'))||purchased.includes('system-research');
  return legacyEvidence||((state?.meta?.cycles??0)>=1&&purchased.includes(RESEARCH_UNLOCK_TECH_ID));
}
export function viewUnlocked(state, view) {
  if (view === 'market') return featureUnlocked(state,'marketing');
  if (view === 'gemshop') return true;
  if (view === 'company') return (state.meta.cycles ?? 0) > 0;
  if (view === 'allocation') return featureUnlocked(state,'allocation');
  return FEATURE_UNLOCKS.some((feature) => feature.views.includes(view) && featureUnlocked(state, feature.id));
}
export function skillUnlocked(_state, skill) { return ['quality','efficiency','popularity'].includes(skill); }
