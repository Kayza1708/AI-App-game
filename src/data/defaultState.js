export const SAVE_VERSION = 4;

export const HARDWARE_CATALOG = [
  ['calculator', '⌗', 'Calculator', 'A programmable calculator running its first tiny tensor operations.', 20, 0.5, 0.02],
  ['homeComputer', '▣', 'Home Computer', 'A beloved beige box with enough memory to experiment.', 95, 2.5, 0.12],
  ['gamingPc', '◫', 'Gaming PC', 'Consumer graphics hardware repurposed for neural networks.', 480, 12, 0.55],
  ['workstation', '◇', 'Workstation', 'Professional acceleration for sustained model development.', 2_600, 58, 2.4],
  ['gpuServer', '▤', 'GPU Server', 'Rack-mounted parallel compute with industrial throughput.', 14_000, 280, 11],
  ['miniDatacenter', '▥', 'Mini-Datacenter', 'Your first dedicated compute facility.', 78_000, 1_350, 48],
  ['enterpriseDatacenter', '▦', 'Enterprise-Datacenter', 'Redundant halls built for global-scale inference.', 440_000, 6_600, 230],
  ['hyperscaleDatacenter', '▩', 'Hyperscale-Datacenter', 'A horizon of servers operating as one machine.', 2_600_000, 32_000, 1_100],
  ['tpuCluster', '⬡', 'TPU-Cluster', 'Custom silicon removes every unnecessary operation.', 16_000_000, 160_000, 5_200],
  ['aiSupercomputer', '✦', 'AI-Supercomputer', 'A national-scale engine built around intelligence.', 105_000_000, 820_000, 26_000],
  ['planetaryGrid', '◎', 'Planetary Compute Grid', 'Every continent contributes to a unified neural fabric.', 720_000_000, 4_300_000, 130_000],
  ['underwaterDatacenter', '≋', 'Underwater Datacenter', 'Ocean-cooled compute cities beneath the waves.', 5_200_000_000, 24_000_000, 650_000],
  ['orbitalDatacenter', '◉', 'Orbital Datacenter', 'Solar-powered inference in permanent freefall.', 41_000_000_000, 140_000_000, 3_200_000],
  ['lunarFacility', '◒', 'Lunar Compute Facility', 'A silent lunar factory with uninterrupted solar access.', 360_000_000_000, 900_000_000, 17_000_000],
  ['dysonSwarm', '☼', 'Dyson Swarm', 'Billions of collectors turn starlight into thought.', 3_600_000_000_000, 6_400_000_000, 95_000_000],
  ['matrioshkaBrain', '◉', 'Matrioshka Brain', 'Nested computational shells enclose an entire star.', 42_000_000_000_000, 52_000_000_000, 600_000_000],
].map(([id, icon, name, description, baseCost, computePerSecond, energy], tier) => ({
  id, icon, name, description, baseCost, computePerSecond, energy, tier,
  milestones: [
    { quantity: 10, name: 'Thermal Rhythm', description: `${name} output +10%`, effect: 'hardwareOutput', value: 0.1 },
    { quantity: 25, name: 'Bulk Procurement', description: `All hardware costs -${3 + tier % 3}%`, effect: 'hardwareDiscount', value: (3 + tier % 3) / 100 },
    { quantity: 50, name: 'Fleet Intelligence', description: `Market demand +${5 + tier}%`, effect: 'demand', value: (5 + tier) / 100 },
    { quantity: 100, name: 'Autonomous Operations', description: `Revenue +${4 + tier}%`, effect: 'revenue', value: (4 + tier) / 100 },
  ],
}));

export const MODEL_CATALOG = [
  { id: 'tinyChat', name: 'TinyChat', cost: 0, unlockLevel: 1, stats: { quality: 1, speed: 8, context: 2, reasoning: 1, efficiency: 8, appeal: 2 } },
  { id: 'smartChat', name: 'SmartChat', cost: 2_500, unlockLevel: 3, stats: { quality: 3, speed: 7, context: 4, reasoning: 3, efficiency: 7, appeal: 4 } },
  { id: 'omni', name: 'Omni', cost: 45_000, unlockLevel: 7, stats: { quality: 6, speed: 7, context: 6, reasoning: 5, efficiency: 6, appeal: 7 } },
  { id: 'research', name: 'Research', cost: 900_000, unlockLevel: 12, stats: { quality: 9, speed: 4, context: 9, reasoning: 10, efficiency: 4, appeal: 5 } },
  { id: 'agent', name: 'Agent', cost: 24_000_000, unlockLevel: 20, stats: { quality: 12, speed: 8, context: 10, reasoning: 11, efficiency: 7, appeal: 10 } },
  { id: 'agi', name: 'AGI', cost: 1_000_000_000, unlockLevel: 30, stats: { quality: 20, speed: 10, context: 20, reasoning: 20, efficiency: 10, appeal: 20 } },
];

const HARDWARE_UPGRADE_TYPES = [
  ['cooling', 'Better Cooling', 'hardwareOutput', 0.08], ['overclock', 'Overclocking', 'hardwareOutput', 0.1],
  ['accelerator', 'AI Accelerator', 'inference', 0.1], ['ssd', 'SSD Upgrade', 'training', 0.08],
  ['psu', 'Efficient PSU', 'hardwareCost', 0.04],
];
const COMPANY_UPGRADES = [
  ['brand', 'Better Marketing', 'marketing', 0.12], ['pricing', 'Pricing Analytics', 'revenue', 0.1],
  ['api', 'Developer API', 'demand', 0.12], ['enterprise', 'Enterprise Sales', 'marketSize', 0.15],
  ['collection', 'Better Data Collection', 'reputation', 0.12], ['hiring', 'Better Hiring', 'allOutput', 0.06],
  ['support', 'Customer Success', 'adoption', 0.14], ['partnerships', 'Strategic Partnerships', 'marketSize', 0.18],
];
const MODEL_UPGRADES = [
  ['tokenizer', 'Better Tokenizer', 'quality', 0.12], ['training', 'Better Training', 'training', 0.15],
  ['rlhf', 'RLHF', 'appeal', 0.15], ['synthetic', 'Synthetic Data', 'quality', 0.16],
  ['context', 'Context Compression', 'inference', 0.14], ['moe', 'Mixture of Experts', 'allOutput', 0.1],
];
const RESEARCH_UPGRADES = [
  ['algorithms', 'Algorithmic Insight', 'training', 0.12], ['silicon', 'Silicon Research', 'hardwareOutput', 0.1],
  ['behavior', 'Behavioral Science', 'demand', 0.14], ['compression', 'Neural Compression', 'inference', 0.13],
  ['economics', 'Market Simulation', 'revenue', 0.1], ['automation', 'Lab Automation', 'allOutput', 0.08],
];

const hardwareUpgrades = HARDWARE_CATALOG.flatMap((hardware) => HARDWARE_UPGRADE_TYPES.map(([key, name, effect, value], index) => ({
  id: `${hardware.id}-${key}`, name: `${hardware.name}: ${name}`, description: `Improve this ${hardware.name} fleet`, category: 'hardware', hardwareId: hardware.id,
  effect, value, cost: Math.ceil(hardware.baseCost * (1.8 + index * 1.35)), unlock: Math.max(1, index * 3),
})));
const progressionUpgrades = (items, category, baseCost, multiplier) => items.map(([key, name, effect, value], index) => ({
  id: `${category}-${key}`, name, description: `${Math.round(value * 100)}% improvement to ${effect.replace(/([A-Z])/g, ' $1').toLowerCase()}`,
  category, effect, value, cost: Math.ceil(baseCost * multiplier ** index), unlock: 1 + index * 2,
}));
export const UPGRADES = [
  ...hardwareUpgrades,
  ...progressionUpgrades(COMPANY_UPGRADES, 'company', 80, 2.4),
  ...progressionUpgrades(MODEL_UPGRADES, 'model', 140, 3),
  ...progressionUpgrades(RESEARCH_UPGRADES, 'research', 12, 2.1),
];

export const OBJECTIVES = [
  { id: 'calculators', text: 'Own 10 Calculators', reward: 250, type: 'hardware', target: 10 },
  { id: 'level5', text: 'Reach Model Level 5', reward: 1_000, type: 'level', target: 5 },
  { id: 'users100', text: 'Gain 100 Users', reward: 2_500, type: 'users', target: 100 },
  { id: 'gamingPc', text: 'Purchase a Gaming PC', reward: 5_000, type: 'gamingPc', target: 1 },
  { id: 'compute100', text: 'Reach 100 Compute/s', reward: 12_000, type: 'computeRate', target: 100 },
];

export function createDefaultState() {
  return {
    version: SAVE_VERSION,
    profile: { companyName: 'Singularity Labs', createdAt: Date.now() },
    resources: { credits: 45, compute: 0, users: 0, research: 0 },
    hardware: Object.fromEntries(HARDWARE_CATALOG.map(({ id }) => [id, 0])),
    model: { level: 1, xp: 0, quality: 1, trainingProgress: 0, activeId: 'tinyChat', owned: ['tinyChat'] },
    allocation: { training: 40, inference: 35, research: 5, data: 10, agents: 10 },
    market: { priceMultiplier: 1, marketing: 0, reputation: 1, adoption: 0, demand: 0 },
    upgrades: [], objectives: {},
    tutorial: { step: 0, completed: false },
    settings: { numberNotation: 'compact', sound: true },
    statistics: { totalCreditsEarned: 0, totalComputeProduced: 0, totalClicks: 0, playTimeMs: 0 },
    session: { elapsedMs: 0, lastSavedAt: null },
    ui: { activeView: 'dashboard', sidebarOpen: false, toast: null },
  };
}
