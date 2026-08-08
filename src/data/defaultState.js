import { BALANCE } from '../config/balance.js';

export const SAVE_VERSION = 11;
export const GAME_VERSION = '0.12.0';

export const HARDWARE_CATALOG = [
  ['calculator','⌗','Calculator','A programmable calculator running the first tiny tensor operations.'],
  ['homeComputer','▣','Pocket Computer','Portable silicon for experiments beyond basic arithmetic.'],
  ['gamingPc','▱','Laptop','A mobile development machine for the first useful models.'],
  ['workstation','◫','Gaming PC','Consumer graphics hardware repurposed for neural networks.'],
  ['gpuServer','◇','Workstation','Professional acceleration for sustained model development.'],
  ['miniDatacenter','▤','Server Rack','Rack-mounted parallel Compute with redundant networking.'],
  ['enterpriseDatacenter','⬡','GPU Cluster','A coordinated accelerator fleet for serious Training and Inference.'],
  ['hyperscaleDatacenter','▥','Datacenter','A dedicated facility where infrastructure becomes a company advantage.'],
  ['tpuCluster','▦','Hyperscale Center','Warehouse-scale custom silicon serving a global market.'],
  ['aiSupercomputer','◉','Orbital Datacenter','Solar-powered Compute beyond terrestrial grid constraints.'],
  ['planetaryGrid','◒','Moon Compute Facility','A lunar industrial complex with uninterrupted scientific workloads.'],
  ['underwaterDatacenter','⊕','Mars Compute Grid','A planetary network built for autonomous frontier operations.'],
  ['orbitalDatacenter','✦','Fusion Compute Network','Fusion-powered intelligence infrastructure spanning worlds.'],
  ['lunarFacility','☼','Dyson Compute Array','Stellar collectors turn a meaningful fraction of sunlight into thought.'],
  ['dysonSwarm','◎','Matrioshka Brain','Nested computational shells enclose and coordinate a star.'],
  ['matrioshkaBrain','∞','Singularity Core','Self-improving infrastructure operating beyond human-scale planning.'],
].map(([id,icon,name,description],tier)=>({id,icon,name,description,baseCost:BALANCE.hardware.tierCosts[tier],computePerSecond:BALANCE.hardware.tierProduction[tier],energy:BALANCE.hardware.tierEnergy[tier],tier,
  milestones:[
    {quantity:10,name:'Thermal Rhythm',description:`${name} output +10%`,effect:'hardwareOutput',value:.1},
    {quantity:25,name:'Bulk Procurement',description:`All hardware costs -${3+tier%3}%`,effect:'hardwareDiscount',value:(3+tier%3)/100},
    {quantity:50,name:'Fleet Intelligence',description:`Market demand +${5+tier}%`,effect:'demand',value:(5+tier)/100},
    {quantity:100,name:'Autonomous Operations',description:`Revenue +${4+tier}%`,effect:'revenue',value:(4+tier)/100},
  ],
}));

export const MODEL_SKILLS = ['quality','reasoning','knowledge','context','coding','vision','creativity','math','efficiency','energy','latency','popularity','enterprise','research','safety','autonomy'];
const MODEL_BASE = [
  {id:'tinyChat',name:'TinyChat',role:'Consumer',specialty:'Fast, efficient access for a large free audience.',intCost:0,trainingScale:.5,identity:{adoption:.3,energyEfficiency:.2},stats:{quality:1,reasoning:1,knowledge:1,context:1,coding:1,vision:0,creativity:2,math:1,efficiency:8,energy:8,latency:8,popularity:5,enterprise:0,research:0,safety:3,autonomy:0}},
  {id:'smartChat',name:'SmartChat',role:'Developer',specialty:'Coding workflows, developer demand, and practical Research.',intCost:3,trainingScale:3,identity:{research:.2,coding:.35},stats:{quality:3,reasoning:3,knowledge:3,context:3,coding:7,vision:1,creativity:3,math:4,efficiency:7,energy:7,latency:7,popularity:4,enterprise:2,research:4,safety:4,autonomy:1}},
  {id:'gptClass',name:'GPT-Class',role:'Generalist',specialty:'Broad language capability with flexible consumer and business builds.',intCost:8,trainingScale:7,identity:{quality:.15,marketSize:.12},stats:{quality:5,reasoning:6,knowledge:6,context:6,coding:6,vision:1,creativity:6,math:6,efficiency:6,energy:5,latency:6,popularity:7,enterprise:5,research:5,safety:5,autonomy:3}},
  {id:'omni',name:'Omni',role:'Multimodal',specialty:'Vision, creativity, advertising, and viral consumer adoption.',intCost:15,trainingScale:15,identity:{demand:.3,adoption:.3},stats:{quality:7,reasoning:5,knowledge:6,context:6,coding:3,vision:11,creativity:10,math:4,efficiency:5,energy:4,latency:5,popularity:11,enterprise:4,research:4,safety:6,autonomy:3}},
  {id:'research',name:'Research',role:'Scientific',specialty:'Knowledge generation, mathematics, and permanent Patent progress.',intCost:28,trainingScale:35,identity:{research:.55,revenue:-.15},stats:{quality:9,reasoning:11,knowledge:12,context:10,coding:7,vision:5,creativity:6,math:12,efficiency:4,energy:4,latency:3,popularity:4,enterprise:4,research:13,safety:8,autonomy:5}},
  {id:'agent',name:'Agent',role:'Automation',specialty:'Autonomous operations and Agent Tasks at high Compute demand.',intCost:48,trainingScale:75,identity:{agents:.6,energyEfficiency:-.2},stats:{quality:10,reasoning:10,knowledge:9,context:9,coding:10,vision:6,creativity:7,math:8,efficiency:4,energy:2,latency:4,popularity:7,enterprise:7,research:7,safety:7,autonomy:13}},
  {id:'enterprise',name:'Enterprise',role:'Enterprise',specialty:'Secure contracts with exceptional revenue per customer.',intCost:80,trainingScale:150,identity:{revenue:.7,demand:-.22},stats:{quality:12,reasoning:10,knowledge:11,context:13,coding:9,vision:6,creativity:4,math:10,efficiency:7,energy:5,latency:5,popularity:4,enterprise:15,research:7,safety:13,autonomy:6}},
  {id:'agi',name:'AGI',role:'General Intelligence',specialty:'Recursive improvement and stronger Development Cycle Intelligence.',intCost:135,trainingScale:300,identity:{intelligence:.35,quality:.3},stats:{quality:16,reasoning:16,knowledge:16,context:16,coding:14,vision:12,creativity:14,math:16,efficiency:6,energy:4,latency:5,popularity:11,enterprise:12,research:14,safety:11,autonomy:14}},
  {id:'asiSeed',name:'ASI Seed',role:'Post-human',specialty:'A configurable seed for radically specialized late-game companies.',intCost:225,trainingScale:600,identity:{allOutput:.25,intelligence:.5},stats:{quality:20,reasoning:20,knowledge:20,context:20,coding:18,vision:18,creativity:18,math:20,efficiency:7,energy:4,latency:6,popularity:14,enterprise:15,research:18,safety:14,autonomy:20}},
];

const MODEL_ARCHETYPES = {
  tinyChat:['Consumer',['popularity','efficiency','adoption'],['reasoning','enterprise'],['consumer','inference','adoption']],
  smartChat:['Coding / Research',['coding','research','latency'],['enterprise'],['research','training','compute']],
  gptClass:['Generalist',['quality','context'],[],['consumer','enterprise','reasoning']],
  omni:['Multimodal',['vision','creativity','popularity'],['energy'],['consumer','adoption','inference']],
  research:['Scientific / Research',['research','reasoning','knowledge'],['consumer'],['research','reasoning','training']],
  agent:['Autonomous Agent',['autonomy','coding','agents'],['energy','safety'],['agent','automation','compute']],
  enterprise:['Enterprise',['enterprise','safety','context'],['adoption'],['enterprise','safety','inference']],
  agi:['General Intelligence',['reasoning','research','autonomy'],['energy'],['reasoning','research','agent']],
  asiSeed:['Frontier Intelligence',['research','autonomy','intelligence'],['energy'],['experimental','space','quantum']],
};
export const MODEL_CATALOG = MODEL_BASE.map((model) => { const [archetype,strengths,weaknesses,tags]=MODEL_ARCHETYPES[model.id]; return { ...model, archetype, strengths, weaknesses, tags, itemSlots: ['architecture','compute'] }; });

const HARDWARE_UPGRADE_TYPES = [
  ['cooling', 'GPU Cooling', 'hardwareOutput', 0.02], ['tensor', 'Tensor Optimizer', 'hardwareOutput', 0.03],
  ['compiler', 'Compiler Optimization', 'training', 0.03], ['memory', 'Memory Compression', 'inference', 0.04],
  ['scheduler', 'Distributed Scheduler', 'allOutput', 0.02], ['pipeline', 'Pipeline Optimization', 'training', 0.05],
  ['ssd', 'SSD Cache', 'training', 0.03], ['kernel', 'Kernel Upgrade', 'hardwareOutput', 0.05],
  ['batch', 'Batch Processing', 'training', 0.07], ['network', 'Network Compression', 'inference', 0.05],
  ['routing', 'Dynamic Routing', 'inference', 0.07], ['psu', 'Efficient Power Supply', 'hardwareCost', 0.04],
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
  { id: 'gamingPc', text: 'Purchase a Gaming PC', reward: 5_000, type: 'workstation', target: 1 },
  { id: 'compute100', text: 'Reach 100 Compute/s', reward: 12_000, type: 'computeRate', target: 100 },
];

const TECH_BRANCHES = {
  compute: { label: 'Compute Empire', strength: 'hardwareOutput', weakness: 'demand', nodes: ['Parallel Kernels', 'Thermal Architecture', 'Photonic Interconnects', 'Cloud Fabric', 'Exascale Scheduling', 'Universal Compute'] },
  market: { label: 'Market Dominance', strength: 'demand', weakness: 'hardwareOutput', nodes: ['Growth Analytics', 'Brand Network', 'Elastic Pricing', 'Global Distribution', 'Category Ownership', 'Ubiquitous AI'] },
  research: { label: 'Research Lab', strength: 'research', weakness: 'revenue', nodes: ['Peer Review', 'Research Teams', 'Autonomous Research', 'Quantum Simulation', 'Scientific Commons', 'Theory Engine'] },
  model: { label: 'Frontier Models', strength: 'quality', weakness: 'hardwareCost', nodes: ['Tokenizer Theory', 'Reasoning Traces', 'Architecture Search', 'Synthetic Data', 'Recursive Training', 'General Intelligence'] },
  automation: { label: 'Autonomous Company', strength: 'automation', weakness: 'click', nodes: ['Smart Allocation', 'Purchase Rules', 'Auto Training', 'Operations Agent', 'Executive Agent', 'Self-Improving Company'] },
  enterprise: { label: 'Enterprise Monopoly', strength: 'enterprise', weakness: 'adoption', nodes: ['Sales Pipeline', 'Developer API', 'Enterprise Contracts', 'Compliance Suite', 'Mission Critical AI', 'Industry Standard'] },
  consumer: { label: 'Consumer Platform', strength: 'adoption', weakness: 'revenue', nodes: ['Viral Loops', 'Creator Program', 'Free Tier', 'Social Intelligence', 'Global Consumer Brand', 'Universal Assistant'] },
  agent: { label: 'Agent Economy', strength: 'agents', weakness: 'hardwareCost', nodes: ['Tool Use', 'Agent Memory', 'Multi-Agent Teams', 'AI Agents', 'Agent Marketplace', 'Machine Economy'] },
  robotics: { label: 'Robotics', strength: 'automation', weakness: 'revenue', nodes: ['Robot APIs', 'Embodied Learning', 'Factory Autonomy', 'General Robotics', 'Self-Replicating Industry', 'Machine Civilization'] },
  medicine: { label: 'Medicine', strength: 'reputationGrowth', weakness: 'training', nodes: ['Clinical Models', 'Protein Design', 'Diagnostic Networks', 'Personalized Medicine', 'Longevity Research', 'Post-Biological Health'] },
  education: { label: 'Education', strength: 'adoption', weakness: 'revenue', nodes: ['AI Tutors', 'Adaptive Curricula', 'Universal Translation', 'Global Academy', 'Accelerated Learning', 'Collective Intelligence'] },
  energy: { label: 'Energy', strength: 'energyOutput', weakness: 'hardwareCost', nodes: ['Smart Grid', 'Advanced Storage', 'Fusion Control', 'Orbital Solar', 'Stellar Engineering', 'Infinite Power'] },
  physics: { label: 'Physics', strength: 'research', weakness: 'revenue', nodes: ['Simulation Labs', 'Materials Search', 'Quantum Simulation', 'Unified Models', 'Reality Engineering', 'Computational Physics'] },
  space: { label: 'Space Infrastructure', strength: 'marketSize', weakness: 'hardwareCost', nodes: ['Launch Networks', 'Orbital Industry', 'Lunar Fabrication', 'Mars Logistics', 'Dyson Construction', 'Interstellar Infrastructure'] },
  government: { label: 'Government', strength: 'reputationGrowth', weakness: 'click', nodes: ['Public Contracts', 'Regulatory Models', 'Digital Institutions', 'Planetary Coordination', 'AI Governance', 'Civilization Planning'] },
  agi: { label: 'Artificial General Intelligence', strength: 'quality', weakness: 'energyEfficiency', nodes: ['General Transfer', 'World Models', 'Recursive Learning', 'Aligned Agency', 'General Intelligence', 'Civilization Partner'] },
  asi: { label: 'Artificial Super Intelligence', strength: 'intelligenceGain', weakness: 'revenue', nodes: ['Superhuman Science', 'Recursive Architecture', 'Strategic Foresight', 'Intelligence Explosion', 'Superintelligent Alignment', 'ASI Civilization'] },
  singularity: { label: 'Singularity', strength: 'allOutput', weakness: 'click', nodes: ['Machine Economy', 'Planetary Mind', 'Stellar Cognition', 'Post-Scarcity', 'Cosmic Intelligence', 'Technological Singularity'] },
};

export const TECH_NODES = Object.entries(TECH_BRANCHES).flatMap(([branch, config]) => config.nodes.map((name, rank) => ({
  id: `${branch}-${rank + 1}`, branch, branchLabel: config.label, name, rank: rank + 1, cost: rank + 1,
  requires: rank ? `${branch}-${rank}` : null, effect: config.strength, value: rank < 3 ? 0.08 + rank * 0.02 : 0.15 + rank * 0.03,
  tradeoff: config.weakness, penalty: rank < 3 ? 0.015 : 0.025,
  unlock: rank === 2 ? `Unlocks ${name} operations` : rank === 5 ? `Defines the ${config.label} endgame identity` : null,
})));

const ACHIEVEMENT_TRACKS = [
  ['credits', 'Capital', 'totalCreditsEarned', 100], ['compute', 'Computation', 'totalComputeProduced', 100],
  ['clicks', 'Optimizer', 'totalClicks', 25], ['users', 'Audience', 'users', 10], ['quality', 'Intelligence', 'quality', 2],
  ['hardware', 'Infrastructure', 'hardware', 5], ['level', 'Model Builder', 'level', 3], ['research', 'Scientist', 'research', 10],
  ['reputation', 'Trusted', 'reputation', 1.25], ['cycles', 'Rebuilder', 'cycles', 1],
];
export const ACHIEVEMENTS = ACHIEVEMENT_TRACKS.flatMap(([id, label, metric, base]) => Array.from({ length: 12 }, (_, tier) => ({
  id: `${id}-${tier + 1}`, name: `${label} ${tier + 1}`, metric, target: base * 3 ** tier, reward: 0.002 + tier * 0.0005,
})));

export const WORLD_EVENTS = [
  { id: 'shortage', title: 'Global GPU Shortage', description: 'Supply chains seize up as competitors buy every accelerator.', choices: [{ label: 'Secure inventory', cost: 500, effect: 'hardwareOutput', value: 0.2 }, { label: 'Wait it out', effect: 'hardwareDiscount', value: 0.15 }] },
  { id: 'regulation', title: 'Government Regulation', description: 'Regulators demand a clear position on frontier AI safety.', choices: [{ label: 'Lead on compliance', cost: 1_500, effect: 'reputation', value: 0.35 }, { label: 'Move fast', effect: 'training', value: 0.2, penalty: 'reputation' }] },
  { id: 'investor', title: 'Investor Offer', description: 'A global fund offers capital in return for aggressive growth.', choices: [{ label: 'Take investment', credits: 5_000, effect: 'demand', value: 0.1 }, { label: 'Stay independent', effect: 'revenue', value: 0.15 }] },
  { id: 'breach', title: 'Security Breach', description: 'An intrusion threatens user trust and model data.', choices: [{ label: 'Emergency audit', cost: 2_000, effect: 'reputation', value: 0.25 }, { label: 'Contain quietly', effect: 'reputation', value: -0.2 }] },
  { id: 'opensource', title: 'Open Source Breakthrough', description: 'A new training technique spreads across the community.', choices: [{ label: 'Contribute research', effect: 'research', value: 0.3 }, { label: 'Productize it', effect: 'quality', value: 0.2 }] },
  { id: 'energy', title: 'Energy Crisis', description: 'Power prices spike across your primary compute region.', choices: [{ label: 'Optimize facilities', cost: 4_000, effect: 'hardwareOutput', value: 0.15 }, { label: 'Throttle training', effect: 'training', value: -0.2 }] },
  { id: 'boom', title: 'Global AI Boom', description: 'Every company suddenly needs an intelligence strategy.', choices: [{ label: 'Target enterprises', effect: 'enterprise', value: 0.3 }, { label: 'Capture consumers', effect: 'adoption', value: 0.3 }] },
];

const PATENT_DEFINITIONS = [
  ['cold-kernels','Cold Kernel Scheduling','hardwareOutput',.05,'Schedules workloads around thermal peaks to sustain compute output.'],
  ['gradient-cache','Gradient Cache','training',.10,'Reuses stable gradients without sacrificing model quality.'],
  ['viral-embedding','Viral Embeddings','demand',.08,'Represents cultural trends before they reach the wider market.'],
  ['trust-ledger','Trust Ledger','reputationGrowth',.15,'Makes every model and dataset decision independently auditable.'],
  ['lab-notebook','Autonomous Lab Notebook','flatResearch',1,'Produces one permanent Research point every second.'],
  ['voltage-curve','Adaptive Voltage Curve','energyEfficiency',.05,'Reduces hardware energy consumption under variable workloads.'],
  ['recursive-insight','Recursive Insight','intelligenceGain',.01,'Preserves more organizational insight between Development Cycles.'],
  ['elastic-pricing','Elastic Price Map','priceElasticity',.08,'Predicts willingness to pay without collapsing demand.'],
  ['compute-router','Compute Intent Router','allocationEfficiency',.02,'Routes unused allocation to the workload that needs it most.'],
  ['agent-contracts','Agent Contract Protocol','agents',.12,'Lets autonomous agents negotiate and divide complex tasks.'],
  ['sparse-attention','Sparse Attention Lattice','inference',.08,'Skips irrelevant context while maintaining coherent responses.'],
  ['semantic-cache','Semantic Response Cache','inference',.10,'Serves equivalent requests from a shared semantic memory.'],
  ['synthetic-curriculum','Synthetic Curriculum','quality',.08,'Creates progressively harder examples for every training run.'],
  ['reputation-graph','Reputation Knowledge Graph','reputationGrowth',.12,'Connects product reliability to public trust signals.'],
  ['market-telescope','Market Telescope','marketSize',.10,'Identifies valuable customer segments before competitors.'],
  ['liquid-bus','Liquid-Cooled Bus','energyEfficiency',.07,'Combines cooling and interconnects into a single efficient layer.'],
  ['checkpoint-delta','Delta Checkpoints','training',.08,'Stores only meaningful changes between model checkpoints.'],
  ['context-folding','Context Folding','quality',.06,'Compresses long histories into durable working memories.'],
  ['microgrid-ai','Predictive Microgrid','energyOutput',.10,'Forecasts generation and demand across every power source.'],
  ['sales-copilot','Enterprise Sales Copilot','enterprise',.12,'Builds technical business cases for high-value customers.'],
  ['privacy-learning','Private Collaborative Learning','reputationGrowth',.18,'Learns from customers without centralizing sensitive data.'],
  ['optical-fabric','Optical Compute Fabric','hardwareOutput',.08,'Moves tensors with light instead of energy-intensive copper.'],
  ['reward-model','Pluralistic Reward Model','appeal',.09,'Adapts model behavior to distinct customer expectations.'],
  ['data-distillery','Data Distillery','research',.12,'Extracts reusable scientific signal from noisy datasets.'],
  ['carbon-aware','Carbon-Aware Training','energyEfficiency',.08,'Moves training runs toward clean surplus generation.'],
  ['federated-agents','Federated Agent Teams','agents',.15,'Coordinates agents across organizations without sharing secrets.'],
  ['compiler-proof','Verified AI Compiler','training',.12,'Proves optimized training kernels preserve numerical behavior.'],
  ['demand-simulator','Demand World Model','demand',.12,'Simulates adoption before committing marketing resources.'],
  ['retention-memory','Personal Memory Vault','adoption',.10,'Gives users portable, private long-term model memory.'],
  ['energy-arbitrage','Grid Energy Arbitrage','energyOutput',.12,'Stores power when cheap and releases it at peak demand.'],
  ['neural-firewall','Neural Firewall','reputationGrowth',.20,'Detects adversarial behavior before it reaches deployed models.'],
  ['mixture-routing','Expert Market Routing','revenue',.08,'Routes premium requests to specialized high-value experts.'],
  ['research-swarm','Research Swarm','research',.15,'Many independent agents challenge every scientific claim.'],
  ['zero-copy','Zero-Copy Inference','inference',.14,'Eliminates memory duplication across model serving processes.'],
  ['thermal-storage','Thermal Energy Storage','energyOutput',.15,'Turns waste heat into dispatchable facility energy.'],
  ['reasoning-distill','Reasoning Distillation','quality',.12,'Transfers deep reasoning into smaller efficient models.'],
  ['global-api','Global API Mesh','marketSize',.15,'Places low-latency model endpoints near every customer.'],
  ['safe-agency','Constrained Agency','agents',.18,'Makes autonomous action powerful, observable, and reversible.'],
  ['dynamic-batching','Predictive Dynamic Batching','inference',.16,'Anticipates request bursts and assembles optimal batches.'],
  ['fusion-control','Neural Fusion Control','energyOutput',.20,'Stabilizes fusion plasma using real-time learned control.'],
  ['scientific-memory','Scientific Memory Palace','research',.18,'Links every experiment to all prior supporting evidence.'],
  ['universal-tokenizer','Universal Tokenizer','appeal',.14,'Represents language, code, images, and scientific notation together.'],
  ['autonomous-audit','Autonomous Compliance Audit','enterprise',.18,'Continuously proves enterprise deployments meet policy.'],
  ['lossless-quant','Lossless Semantic Quantization','energyEfficiency',.12,'Reduces precision only where meaning remains unchanged.'],
  ['market-maker','AI Service Market Maker','revenue',.12,'Matches spare inference capacity with real-time demand.'],
  ['self-repair','Self-Repairing Datacenter','hardwareOutput',.15,'Predicts and replaces failing components without downtime.'],
  ['collective-alignment','Collective Alignment Protocol','reputationGrowth',.25,'Lets communities participate directly in model governance.'],
  ['stellar-load','Stellar Load Balancer','allocationEfficiency',.08,'Balances computation across planetary and orbital latency.'],
  ['recursive-science','Recursive Science Engine','flatResearch',5,'Continuously proposes, tests, and criticizes new hypotheses.'],
  ['singularity-proof','Singularity Safety Proof','intelligenceGain',.10,'Preserves critical knowledge through transformations of intelligence.'],
];
export const PATENTS = PATENT_DEFINITIONS.map(([id,name,effect,value,description], index) => ({ id,name,effect,value,description,index }));

export const ENERGY_BUILDINGS = [
  ['coal','Coal Plant','▰',25,1],['gas','Gas Plant','◒',180,7],['solar','Solar Farm','☀',1_200,45],
  ['wind','Wind Farm','≋',8_000,260],['hydro','Hydroelectric Dam','≈',55_000,1_500],['nuclear','Nuclear Plant','⚛',420_000,9_000],
  ['fusion','Fusion Reactor','✦',4_000_000,60_000],['orbitalSolar','Orbital Solar Array','◉',55_000_000,500_000],['dysonEnergy','Dyson Energy Swarm','☼',1_000_000_000,6_000_000],
].map(([id,name,icon,cost,output]) => ({id,name,icon,cost,output}));

export const GEM_SHOP_ITEMS = [
  { id:'researchLab2',name:'Second Research Lab',category:'Research',cost:25,description:'+20% Patent research speed' },
  { id:'researchLab3',name:'Third Research Lab',category:'Research',cost:60,description:'+25% Patent research speed' },
  { id:'trainingQueue',name:'Training Queue',category:'Utilities',cost:20,description:'Automatically starts the next model run' },
  { id:'objectiveSlot',name:'Objective Slot',category:'Utilities',cost:15,description:'Track one additional objective at once' },
  { id:'allocationPresets',name:'Allocation Presets',category:'Automation',cost:30,description:'Save strategic Compute configurations' },
  { id:'patentScanner',name:'Patent Scanner',category:'Research',cost:40,description:'Reveals the next Patent before discovery' },
  { id:'statisticsPlus',name:'Advanced Statistics',category:'Utilities',cost:10,description:'Keeps deeper cycle histories' },
  { id:'themeAurora',name:'Aurora Theme',category:'Visual',cost:12,description:'Unlocks an optional account theme' },
  { id:'saveSlot',name:'Strategy Save Slot',category:'Utilities',cost:20,description:'Stores an additional allocation build' },
  { id:'eventForecast',name:'Event Forecast',category:'Utilities',cost:18,description:'Shows the next world-event category' },
];

export function createDefaultState() {
  return {
    version: SAVE_VERSION,
    profile: { companyName: 'Singularity Labs', createdAt: Date.now(), localOwnerId: `local-${Date.now()}` },
    resources: { credits: 45, compute: 0, users: 0, research: 0, gems: 0 },
    hardware: Object.fromEntries(HARDWARE_CATALOG.map(({ id }) => [id, 0])),
    model: { level: 1, xp: 0, quality: 1, upgradePoints: 0, trainingProgress: 0, trainingActive: false, activeId: 'tinyChat', trainingTarget: 'tinyChat', owned: ['tinyChat'], deployed: ['tinyChat'], improvements: {}, progress: { tinyChat: { level: 1, xp: 0, upgradePoints: 0, skills: {} } } },
    allocation: { training: 50, inference: 50, research: 0, data: 0, agents: 0 },
    market: { priceMultiplier: 1, marketing: 0, reputation: 1, adoption: 0, demand: 0 },
    upgrades: [], objectives: {},
    meta: { intelligence: 0, totalIntelligence: 0, cycles: 0, breakthroughs: 0, breakthroughCurrency: 0, cycleHistory: [], featureUnlockTimes: { core: 0 }, techNodes: [], achievements: {}, unlockedModels: ['tinyChat'] },
    world: { activeEvent: null, nextEventMs: BALANCE.events.firstDelayMs, modifiers: [] },
    company: { employees: { research: 0, marketing: 0, sales: 0, operations: 0, legal: 0, finance: 0, hr: 0 } },
    automation: { lastHardwarePurchaseMs: -1_000 },
    energy: { stored: 0, buildings: Object.fromEntries(ENERGY_BUILDINGS.map(({id}) => [id, 0])) },
    patents: { discovered: [], progress: 0, history: [], equipped: [], levels: {}, intInvested: {}, slots: 3 },
    premium: { purchases: [], adCooldowns: {} },
    retention: { lastLoginDate: null, loginStreak: 0, claimedDaily: {}, claimedWeekly: {}, claimedMonthly: null },
    inventory: { instances: [], equipped: {}, nextInstanceId: 1, capacity: BALANCE.items.inventoryCapacity, collection: { items: [], rarities: [], sets: [] }, newItem: null },
    consumables: {}, rewardCaches: {},
    missions: { dailyPeriodId: null, weeklyPeriodId: null, monthlyPeriodId: null, daily: [], weekly: [], monthly: [], claims: {}, generatedAt: null },
    gemEconomy: { earned: 0, spent: 0, consumablesUsed: 0, history: [] },
    rewardedBoosts: { periodId: null, claims: {}, offered: 0, started: 0, completed: 0 },
    artifacts: { owned: [], collection: [] },
    marketplace: { enabled: false, authority: 'server-required', listings: [], pendingTransactions: [] },
    futureMeta: { materials: {}, blueprints: [], seasonalChallenge: null, pass: null },
    tutorial: { step: 0, completed: false },
    settings: { numberNotation: 'compact', sound: true },
    statistics: { totalCreditsEarned: 0, totalCreditsSpent: 0, totalComputeProduced: 0, totalManualComputeProduced: 0, totalComputeConsumed: 0, totalComputeWasted: 0, totalClicks: 0, totalItemsAcquired: 0, totalMissionsClaimed: 0, playTimeMs: 0 },
    run: { creditsEarned: 0, computeProduced: 0 },
    session: { elapsedMs: 0, lastSavedAt: null },
    ui: { activeView: 'dashboard', sidebarOpen: false, toast: null },
  };
}
