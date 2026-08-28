/**
 * Milestone 11 progression controls. Gameplay formulas consume this object so
 * pacing can be tuned without hunting through simulation or UI code.
 */
import { TECHNOLOGY_NODES } from '../data/technologyCatalog.js';
export const BALANCE = Object.freeze({
  hardware: Object.freeze({
    costGrowth: 1.18, bulkDiscountCap: 0.42, upgradeCostFactor: 3, upgradeCostGrowth: 1.78,
    tierCosts: Object.freeze([20,400,1_800,6_000,40_000,1_500_000,75_000_000,35_000_000_000,2_400_000_000_000,190_000_000_000_000,18_000_000_000_000_000,2_100_000_000_000_000_000,300_000_000_000_000_000_000,52_000_000_000_000_000_000_000,11_000_000_000_000_000_000_000_000,2_800_000_000_000_000_000_000_000_000]),
    tierProduction: Object.freeze([.5,2,12,100,1_200,20_000,450_000,12_000_000,400_000_000,16_000_000_000,750_000_000_000,42_000_000_000_000,2_800_000_000_000_000,220_000_000_000_000_000,20_000_000_000_000_000_000,2_200_000_000_000_000_000_000]),
  }),
  training: Object.freeze({ requirementAnchors: Object.freeze([[1,18],[2,480],[3,4_500],[4,45_000],[5,300_000],[10,40_000_000],[20,4e11],[50,2e18],[100,1e27],[250,1e43],[500,1e65]]), skillGain: 1, pointCosts: Object.freeze([1,1,1,2,2,3,3,4,5,6]), finishGemMinutesExponent:.68, finishGemBase:1, doublePointGemBase:4 }),
  market: Object.freeze({ revenueBase: 0.24, tierMarketGrowth: 1.88, demandScale: 0.075, demandFloor: 0.04, userConvergence: 0.12, capacityScale: 1.7, marketingBase: 0.12, marketingCostBase: 220, marketingCostGrowth: 1.72 }),
  patents: Object.freeze({ baseRequirement: 120, discoveryGrowth: 1.62, tierGrowth: 1.35, baseResearchRate: 1 }),
  intelligence: Object.freeze({
    computeScale: 3_500_000,
    creditScale: 1_000_000,
    cycleRequirement: 1,
    minimumHardwareTier: 4,
    minimumModelLevel: 6,
    breakthroughMultiplier: 1.65,
  }),
  breakthrough: Object.freeze({ requiredLifetimeIntelligence: 10_000, requiredCompute: 1e24, exponent: 0.2 }),
  events: Object.freeze({ firstDelayMs: 720_000, minimumDelayMs: 600_000, durationMs: 180_000, incomeSeconds: Object.freeze({minor:30,moderate:90,major:240}), creditShare:Object.freeze({minor:.01,moderate:.03,major:.06}) }),
  items: Object.freeze({ unlockInt: 15, baseSlots: 2, maxSlots: 6, inventoryCapacity: 50, rarityWeights: Object.freeze({Common:55,Uncommon:25,Rare:13,Epic:5,Legendary:1.8,Mythic:.2}) }),
  missions: Object.freeze({ creditRewardSeconds:Object.freeze({daily:300,weekly:1_800,monthly:7_200}), creditRewardFloor:Object.freeze({daily:300,weekly:5_000,monthly:25_000}), dailyGems: 1, weeklyGems: 4, monthlyGems: 12 }),
  offline: Object.freeze({ capMs: 8 * 60 * 60 * 1000, shortChunkMs: 1_000, longChunkMs: 10_000, longThresholdMs: 30 * 60 * 1000, minimumRewardMs: 10_000 }),
  progressionTargets: Object.freeze({ firstCalculator:[10,30], firstHardwareUpgrade:[60,180], firstModelLevel:[60,240], firstDevelopmentCycle:[2700,3600], firstItem:[1800,5400], firstPatentResearch:1500, firstBreakthrough:129_600 }),
});

export const FEATURE_UNLOCKS = Object.freeze([
  { id: 'core', name: 'Core Company', int: 0, views: ['dashboard', 'hardware', 'model', 'objectives'], description: 'Credits, Compute, TinyChat, Training, Model Development, and Objectives.' },
  { id: 'development', name: 'Development Cycles', int: 1, views: ['strategy'], description: 'Spend permanent Intelligence and plan the next run.' },
  { id: 'marketing', name: 'Marketing Division', int: 4, views: ['company', 'market'], description: 'Demand, pricing, Marketing, Reputation, and Adoption.' },
  { id: 'allocation', name: 'Compute Allocation', int: 2, views: ['allocation'], description: 'Research Compute and strategic allocation.' },
  { id: 'research', name: 'Research Division', int: Infinity, views: ['research'], description: 'Convert allocated Compute into permanent scientific upgrades.' },
  { id: 'items', name: 'Model Equipment', int: 15, views: ['inventory'], description: 'Collect equipment and create specialized Model builds.' },
  { id: 'missions', name: 'Mission Network', int: 4, views: ['missions'], description: 'Daily goals and long-term account challenges.' },
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
export function nextFeatureUnlock(state) { return FEATURE_UNLOCKS.filter((item) => item.int > (state.meta.totalIntelligence ?? 0)).sort((a, b) => a.int - b.int)[0] ?? null; }
export function featureUnlocked(state, id) {
  if (['core', 'modelSkills', 'marketing'].includes(id)) return true;
  if (id === 'development') return (state.meta.cycles ?? 0) > 0 || (state.meta.totalIntelligence ?? 0) > 0;
  if (id === 'allocation') return (state.meta.cycles ?? 0) > 0;
  if (TECHNOLOGY_NODES.some((node) => node.unlockFeature === id && state.meta.techNodes.includes(node.id))) return true;
  const node = SYSTEM_TECH_NODES.find((item) => item.feature === id);
  return node ? state.meta.techNodes.includes(node.id) : (state.meta.totalIntelligence ?? 0) >= (FEATURE_UNLOCKS.find((item) => item.id === id)?.int ?? Infinity);
}
export function viewUnlocked(state, view) {
  if (view === 'market') return featureUnlocked(state,'marketing');
  if (['company','allocation'].includes(view)) return (state.meta.cycles ?? 0) > 0;
  return FEATURE_UNLOCKS.some((feature) => feature.views.includes(view) && featureUnlocked(state, feature.id));
}
export function skillUnlocked(_state, skill) { return ['quality','efficiency','popularity'].includes(skill); }
