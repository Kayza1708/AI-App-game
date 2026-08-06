export const SAVE_VERSION = 3;

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
].map(([id, icon, name, description, baseCost, computePerSecond, energy]) => ({ id, icon, name, description, baseCost, computePerSecond, energy, milestones: [10, 25, 50, 100] }));

export const MODEL_CATALOG = [
  { id: 'tinyChat', name: 'TinyChat', cost: 0, unlockLevel: 1, stats: { quality: 1, speed: 8, context: 2, reasoning: 1, efficiency: 8, appeal: 2 } },
  { id: 'smartChat', name: 'SmartChat', cost: 2_500, unlockLevel: 3, stats: { quality: 3, speed: 7, context: 4, reasoning: 3, efficiency: 7, appeal: 4 } },
  { id: 'omni', name: 'Omni', cost: 45_000, unlockLevel: 7, stats: { quality: 6, speed: 7, context: 6, reasoning: 5, efficiency: 6, appeal: 7 } },
  { id: 'research', name: 'Research', cost: 900_000, unlockLevel: 12, stats: { quality: 9, speed: 4, context: 9, reasoning: 10, efficiency: 4, appeal: 5 } },
  { id: 'agent', name: 'Agent', cost: 24_000_000, unlockLevel: 20, stats: { quality: 12, speed: 8, context: 10, reasoning: 11, efficiency: 7, appeal: 10 } },
  { id: 'agi', name: 'AGI', cost: 1_000_000_000, unlockLevel: 30, stats: { quality: 20, speed: 10, context: 20, reasoning: 20, efficiency: 10, appeal: 20 } },
];

export const UPGRADES = [
  { id: 'cooling', name: 'Better Cooling', description: '+20% hardware compute', cost: 750 },
  { id: 'training', name: 'Optimized Training', description: '+25% training efficiency', cost: 3_500 },
  { id: 'marketing', name: 'Marketing Campaign', description: '+30% marketing power', cost: 12_000 },
  { id: 'inference', name: 'Efficient Inference', description: '+25% inference capacity', cost: 60_000 },
  { id: 'gpus', name: 'Better GPUs', description: '+35% hardware compute', cost: 300_000 },
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
    resources: { credits: 25, compute: 0, users: 0, research: 0 },
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
