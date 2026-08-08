/**
 * Milestone 11 progression controls. Gameplay formulas consume this object so
 * pacing can be tuned without hunting through simulation or UI code.
 */
export const BALANCE = Object.freeze({
  hardware: Object.freeze({
    costGrowth: 1.16, energyBase: 1.5, bulkDiscountCap: 0.5,
    tierCosts: Object.freeze([20,140,850,5_800,42_000,340_000,3_100_000,32_000_000,390_000_000,5_800_000_000,105_000_000_000,2_300_000_000_000,62_000_000_000_000,2_100_000_000_000_000,92_000_000_000_000_000,5_000_000_000_000_000_000]),
    tierProduction: Object.freeze([.5,1.7,5.5,19,72,290,1_250,5_800,29_000,160_000,980_000,6_600_000,49_000_000,410_000_000,4_100_000_000,52_000_000_000]),
    tierEnergy: Object.freeze([.003,.018,.09,.42,1.8,8,36,170,850,4_600,27_000,175_000,1_300_000,12_000_000,130_000_000,1_800_000_000]),
  }),
  training: Object.freeze({ xpBase: 16, xpExponent: 1.4, workBase: 12, workExponent: 1.46, skillGain: 0.4 }),
  market: Object.freeze({ revenueBase: 0.24, tierMarketGrowth: 2.15, userConvergence: 0.18, capacityScale: 1.45, marketingBase: 0.12 }),
  patents: Object.freeze({
    baseResearchRate: 0.025,
    targetMinutes: Object.freeze([[0, 25], [4, 300], [9, 1440], [19, 10080], [29, 30240], [39, 86400], [49, 259200]]),
  }),
  intelligence: Object.freeze({
    computeScale: 1_000,
    exponent: 0.32,
    cycleRequirement: 1,
    breakthroughMultiplier: 1.65,
  }),
  breakthrough: Object.freeze({ requiredLifetimeIntelligence: 10_000, requiredCompute: 1e24, exponent: 0.2 }),
  events: Object.freeze({ firstDelayMs: 720_000, minimumDelayMs: 600_000, durationMs: 180_000 }),
  items: Object.freeze({ unlockInt: 15, baseSlots: 2, maxSlots: 6, inventoryCapacity: 50, rarityWeights: Object.freeze({Common:55,Uncommon:25,Rare:13,Epic:5,Legendary:1.8,Mythic:.2}) }),
  missions: Object.freeze({ dailyCredits: 300, dailyGems: 1, weeklyGems: 3, monthlyGems: 10 }),
});

export const FEATURE_UNLOCKS = Object.freeze([
  { id: 'core', name: 'Core Company', int: 0, views: ['dashboard', 'hardware', 'model', 'objectives'], description: 'Credits, Compute, TinyChat, Optimize, and Objectives.' },
  { id: 'development', name: 'Development Cycles', int: 1, views: ['strategy'], description: 'Spend permanent Intelligence and plan the next run.' },
  { id: 'marketing', name: 'Marketing Division', int: 4, views: ['company', 'market'], description: 'Demand, pricing, Marketing, Reputation, and Adoption.' },
  { id: 'research', name: 'Research Division', int: 10, views: ['allocation'], description: 'Research Compute and strategic allocation.' },
  { id: 'items', name: 'Model Equipment', int: 15, views: ['inventory'], description: 'Collect equipment and create specialized Model builds.' },
  { id: 'missions', name: 'Mission Network', int: 4, views: ['missions'], description: 'Daily goals and long-term account challenges.' },
  { id: 'patents', name: 'Patent Office', int: 20, views: ['patents'], description: 'Permanent discoveries and Patent loadouts.' },
  { id: 'modelSkills', name: 'Model Development', int: 35, views: [], description: 'Spend Model Upgrade Points on specialized skills.' },
  { id: 'energy', name: 'Energy Grid', int: 55, views: ['energy'], description: 'Power generation, demand, and efficiency.' },
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

export const MODEL_SKILL_UNLOCKS = Object.freeze({
  quality: 0, efficiency: 0, context: 0,
  reasoning: 35, knowledge: 35, coding: 35, vision: 35, math: 35, creativity: 35,
  safety: 55, energy: 55, latency: 55, research: 55, popularity: 55,
  autonomy: 120, agents: 120, enterprise: 170,
});

export function curveValue(base, growth, level) { return base * growth ** Math.max(0, level); }
export function powerCurve(base, level, exponent) { return base * Math.max(1, level) ** exponent; }
export function featureUnlocked(state, id) { return (state.meta.totalIntelligence ?? 0) >= (FEATURE_UNLOCKS.find((item) => item.id === id)?.int ?? Infinity); }
export function nextFeatureUnlock(state) { return FEATURE_UNLOCKS.filter((item) => item.int > (state.meta.totalIntelligence ?? 0)).sort((a, b) => a.int - b.int)[0] ?? null; }
export function viewUnlocked(state, view) { return FEATURE_UNLOCKS.some((feature) => feature.views.includes(view) && featureUnlocked(state, feature.id)); }
export function skillUnlocked(state, skill) { return (state.meta.totalIntelligence ?? 0) >= (MODEL_SKILL_UNLOCKS[skill] ?? Infinity); }
