/**
 * Permanent company-build Technology catalog.
 * This file is deliberately data-only so the same graph drives simulation, UI,
 * telemetry, migration tests, documentation exports, and Balance Lab policies.
 */
export const TECHNOLOGY_SCHEMA_VERSION = 1;
export const TECHNOLOGY_ERAS = Object.freeze(['Garage AI','Machine Learning','Deep Learning','Foundation Models','Agentic AI','Autonomous Science','AGI','Superintelligence','Singularity']);

const B = (label, icon, color, baseCost, nodes) => ({ label, icon, color, baseCost, nodes });
const N = (name, type, effect, value, description, options={}) => ({ name, type, effect, value, description, ...options });

export const TECHNOLOGY_BRANCHES = Object.freeze({
  compute:B('Compute Empire','compute','#55e8da',1,[
    N('Compute Theory','system','hardwareOutput',.10,'Establishes Compute as the company’s primary engineering discipline.'),
    N('Parallel Kernels','minor','hardwareOutput',.15,'Runs independent tensor kernels across every owned processor.'),
    N('Heterogeneous Clusters','major','hardwareOutput',.12,'Each distinct owned Hardware tier amplifies global Compute.',{mechanic:'hardware-diversity',synergy:'Gain +3% Hardware output per distinct owned Hardware tier.'}),
    N('Load Balancing','major','allocationEfficiency',.12,'Routes unused workload budget toward productive systems.',{mechanic:'load-balancing',synergy:'Unused Inference allocation can support active Training.'}),
    N('Distributed Compute','major','hardwareOutput',.22,'Older Hardware strengthens the newest generation instead of becoming obsolete.',{mechanic:'legacy-compute'}),
    N('Compute Density','keystone','hardwareOutput',1,'Double Hardware output by accepting a more expensive infrastructure race.',{tradeoff:'hardwareCost',penalty:.25,mechanic:'compute-empire',synergy:'Hardware Mastery bonuses are 25% stronger.'}),
    N('Universal Compute','era','allOutput',.65,'Unifies planetary workloads into one programmable Compute fabric.',{cost:1e18,unlock:'Universal Compute era'}),
  ]),
  training:B('Training Science','training','#9d8cff',2,[
    N('Gradient Optimization','minor','training',.15,'Improves useful Model progress per unit of Training Compute.'),
    N('Checkpoint Compression','major','training',.10,'Every new Training begins with a preserved checkpoint.',{mechanic:'checkpointing',synergy:'Training starts with 5% required work completed.'}),
    N('Parallel Backpropagation','major','training',.24,'Server-class Hardware contributes additional Training throughput.',{mechanic:'gpu-training'}),
    N('Active Optimization','major','click',.65,'Manual Compute becomes more effective while a Model is Training.',{mechanic:'training-injection'}),
    N('Training Momentum','major','training',.25,'Consecutive Training on one Model builds momentum.',{mechanic:'training-momentum'}),
    N('All-In Training','keystone','training',1,'Double Training efficiency at the cost of serving fewer Users.',{tradeoff:'inference',penalty:.40,mechanic:'all-in-training'}),
    N('Slow and Deep','keystone','modelSkillPower',.75,'Longer projects make every invested Model Point substantially stronger.',{tradeoff:'training',penalty:.34,mechanic:'slow-deep',synergy:'Model skill effects +75%; Training throughput -34%.'}),
  ]),
  hardware:B('Hardware Engineering','hardware','#54a7ff',3,[
    N('Overclocking','minor','hardwareOutput',.20,'Pushes all Hardware beyond conservative clock targets.',{tradeoff:'hardwareCost',penalty:.05}),
    N('Tier Mastery I','major','hardwareMastery',1,'Unlocks Mastery I effects for Hardware tiers with 10 owned.',{mechanic:'hardware-mastery-1'}),
    N('Rack Optimization','major','hardwareOutput',.18,'Server-class Hardware receives optimized rack and network layouts.',{mechanic:'server-specialization'}),
    N('Tier Mastery II','major','hardwareMastery',2,'Unlocks scaling Mastery II effects at 25 owned.',{mechanic:'hardware-mastery-2'}),
    N('Recursive Infrastructure','major','milestonePower',.35,'Hardware milestones scale with the highest generation reached.'),
    N('Vertical Integration','keystone','hardwareCost',.30,'Own the supply chain and reduce Hardware prices.',{tradeoff:'marketing',penalty:.20,mechanic:'vertical-integration'}),
    N('Bleeding Edge','keystone','newestHardware',2,'The newest owned Hardware tier produces triple output; older tiers lose half.',{tradeoff:'legacyHardware',penalty:.50,mechanic:'bleeding-edge'}),
  ]),
  model:B('Model Science','model','#d5a4ff',1,[
    N('Model Engineering','system','modelSkillPower',.10,'Unlocks Model Improvements and the SmartChat architecture.',{unlockModel:'smartChat',unlock:'Model Improvements · SmartChat'}),
    N('Advanced Reasoning Model','model','quality',.12,'Unlocks the GPT-Class advanced reasoning architecture.',{unlockModel:'gptClass',unlock:'GPT-Class Model'}),
    N('Multimodal Representations','model','quality',.18,'Unlocks Omni while making Quality Model Points matter more to markets.',{mechanic:'quality-mastery',unlockModel:'omni',unlock:'Omni Model · Vision and Context skills'}),
    N('Code Intelligence','major','training',.16,'Coding and Reasoning Model Points contribute to Training efficiency.',{mechanic:'coding-mastery'}),
    N('Ensemble Inference','major','inference',.20,'Deploying multiple Models creates portfolio Capacity synergy.',{mechanic:'ensemble-inference'}),
    N('Specialist AI','keystone','modelSkillPower',.50,'The strongest deployed Model receives amplified skills; other Models contribute less.',{tradeoff:'secondaryModels',penalty:.50,mechanic:'specialist-ai'}),
    N('Generalist AI','keystone','deploymentPower',.35,'All deployed Models contribute broadly, but each is individually weaker.',{tradeoff:'modelSkillPower',penalty:.20,mechanic:'generalist-ai'}),
  ]),
  consumer:B('Consumer AI','consumer','#ff72bc',1,[
    N('Growth Analytics','minor','marketing',.20,'Improves Marketing conversion using live product analytics.'),
    N('Viral Loops','major','demand',.18,'Active Users generate additional future Demand.',{mechanic:'viral-loops'}),
    N('Social Proof','major','adoption',.25,'Large User populations accelerate Adoption.'),
    N('Personalization','major','demand',.22,'Model Quality contributes more strongly to Consumer Demand.',{mechanic:'quality-demand'}),
    N('Network Effects','major','demand',.30,'User milestones amplify Popularity Model skills.',{mechanic:'popularity-mastery'}),
    N('Viral AI','keystone','popularityPower',1,'Double Popularity effects while reducing revenue from every User.',{tradeoff:'revenue',penalty:.30,mechanic:'viral-ai'}),
    N('Mass Market','keystone','demand',2,'Triple Demand while sacrificing Enterprise value.',{tradeoff:'enterprise',penalty:.50,mechanic:'mass-market'}),
  ]),
  enterprise:B('Enterprise AI','enterprise','#ffb15a',12,[
    N('API Access','system','enterprise',.15,'Creates an API value layer for business customers.',{unlock:'API revenue'}),
    N('Enterprise Sales','minor','revenue',.20,'Improves revenue captured from high-value accounts.'),
    N('Enterprise Model','model','enterprise',.25,'Unlocks the secure Enterprise Model architecture.',{unlockModel:'enterprise',unlock:'Enterprise Model'}),
    N('Premium Contracts','major','revenue',.28,'Model Quality contributes more strongly to Revenue/User.',{mechanic:'quality-revenue'}),
    N('Service-Level Agreements','major','enterprise',.30,'Efficiency and Safety increase Enterprise contract value.',{mechanic:'sla-synergy'}),
    N('Enterprise First','keystone','revenue',1.5,'Multiply Revenue/User by 2.5 while halving Consumer Demand.',{tradeoff:'demand',penalty:.50,mechanic:'enterprise-first'}),
    N('Mission Critical AI','major','enterprise',.75,'Quality and Efficiency strongly amplify contracts; Training becomes more expensive.',{tradeoff:'training',penalty:.25,mechanic:'mission-critical'}),
  ]),
  research:B('Research Lab','research','#74d490',3,[
    N('Research Division','system','research',.15,'Unlocks Research production from allocated Compute.',{unlockFeature:'research',unlock:'Research allocation'}),
    N('Scientific Model','model','research',.20,'Unlocks the Research Model and scientific specialization.',{unlockModel:'research',unlock:'Research Model'}),
    N('Scientific Compute','minor','research',.25,'Improves Research generated per allocated Compute.'),
    N('Model-Assisted Science','major','research',.22,'The intrinsic reasoning and knowledge of deployed Models contributes to Research.',{mechanic:'reasoning-research'}),
    N('Recursive Discovery','major','research',.20,'Each equipped Research Patent improves Research output.',{mechanic:'recursive-discovery'}),
    N('Open Science','keystone','research',1,'Double Research output while reducing immediate Credits/sec.',{tradeoff:'revenue',penalty:.25,mechanic:'open-science'}),
    N('Deep Research','keystone','patentPower',.75,'Patents take longer to discover but their specialized effects are much stronger.',{tradeoff:'patentSpeed',penalty:.50,mechanic:'deep-research'}),
  ]),
  patent:B('Patent Engineering','patent','#65dfbe',35,[
    N('Patent Office','system','patentSpeed',.15,'Unlocks Patent discovery and specialized permanent loadouts.',{unlockFeature:'patents',unlock:'Patent system'}),
    N('Patent Slot','major','patentSlots',1,'Adds one permanent equipped Patent slot.',{mechanic:'patent-slot'}),
    N('Patent Amplification','major','patentPower',.20,'Strengthens effects of equipped Patents.'),
    N('Cross-Licensing','major','patentPower',.18,'Different Patent tags create cross-category synergy.',{mechanic:'patent-diversity'}),
    N('Patent Mastery','major','patentUpgradeCost',.25,'Reduces INT costs for improving discovered Patents.'),
    N('Narrow Portfolio','keystone','patentPower',1,'Only two Patent slots remain, but equipped Patent effects double.',{tradeoff:'patentSlots',penalty:6,mechanic:'narrow-patents'}),
    N('Diversified Portfolio','major','patentSlots',3,'Equip three additional Patents, each operating at reduced strength.',{tradeoff:'patentPower',penalty:.15,mechanic:'diverse-patents'}),
  ]),
  efficiency:B('Efficiency AI','efficiency','#62c7ff',2,[
    N('Inference Compression','minor','inference',.20,'Serves more Users from the same Inference Compute.'),
    N('Model Distillation','major','inference',.18,'Older deployed Models become efficient specialist services.',{mechanic:'old-model-efficiency'}),
    N('Cache Optimization','major','inference',.25,'Repeated requests consume less serving capacity.'),
    N('Batched Inference','major','inference',.22,'Large User populations improve serving efficiency.',{mechanic:'batched-inference'}),
    N('Dynamic Routing','major','training',.15,'Unused Inference capacity redirects toward active Training.',{mechanic:'dynamic-routing'}),
    N('Lean AI','keystone','efficiencyPower',1,'Double Efficiency skill effects while reducing Quality effects.',{tradeoff:'qualityPower',penalty:.25,mechanic:'lean-ai'}),
    N('Maximum Utilization','major','inference',.80,'Massively improves Capacity while reducing Demand growth.',{tradeoff:'demand',penalty:.15,mechanic:'maximum-utilization'}),
  ]),
  automation:B('Autonomous Company','automation','#9da9ff',100,[
    N('Smart Allocation','system','automation',.10,'Automatically adjusts workload allocation around bottlenecks.',{mechanic:'smart-allocation'}),
    N('Auto Train','system','automation',.12,'Automatically begins the next available Training project.',{mechanic:'auto-training'}),
    N('Auto Buy','system','automation',.14,'Automatically purchases safe, affordable Hardware.',{mechanic:'auto-buy'}),
    N('Auto Marketing','major','marketing',.20,'Maintains Marketing pressure when Demand becomes limiting.',{mechanic:'auto-marketing'}),
    N('Model Manager','major','deploymentPower',.20,'Improves multi-Model deployment and automatic portfolio choices.'),
    N('Autonomous Company','keystone','automation',1,'Automates routine operations while weakening manual Compute.',{tradeoff:'click',penalty:.55,mechanic:'autonomous-company'}),
    N('Self-Improving Operations','era','allOutput',.40,'Agents continuously optimize company operations.',{cost:1e21,unlock:'Autonomous Company era'}),
  ]),
  agent:B('Agent Economy','agents','#df89ff',250,[
    N('Tool Use','minor','agents',.20,'Improves autonomous task execution.'),
    N('Agent Tasks','system','agents',.15,'Unlocks Agent workload allocation.',{unlockFeature:'agents',unlock:'Agent Tasks'}),
    N('Autonomous Agent Model','model','agents',.25,'Unlocks the Agent Model architecture.',{unlockModel:'agent',unlock:'Agent Model'}),
    N('Autonomous Sales','major','enterprise',.24,'Agent output contributes to Enterprise revenue.',{mechanic:'agent-sales'}),
    N('Autonomous Research','major','research',.28,'Agent output contributes to Research.',{mechanic:'agent-research'}),
    N('Agent Swarm','keystone','agents',1,'Double Agent effects while weakening direct Marketing.',{tradeoff:'marketing',penalty:.40,mechanic:'agent-swarm'}),
    N('AI-Operated Company','keystone','automation',.80,'Agent skills amplify all unlocked automation rules.',{tradeoff:'click',penalty:.30,mechanic:'ai-operated'}),
  ]),
  data:B('Data & Quality','data','#ff7593',500,[
    N('Curated Datasets','minor','quality',.18,'Raises the value of Quality Model Points.'),
    N('Synthetic Data','major','training',.15,'Training projects create reusable synthetic curricula.'),
    N('Knowledge Bases','major','quality',.20,'Knowledge and Context reinforce Model Quality.',{mechanic:'knowledge-quality'}),
    N('Feedback Loops','major','quality',.18,'Active Users improve future Model performance.',{mechanic:'user-feedback'}),
    N('Data Flywheel','major','demand',.25,'Demand and Quality reinforce one another.',{mechanic:'data-flywheel'}),
    N('Data Monopoly','keystone','qualityPower',1,'Double Quality effects while reducing Research efficiency.',{tradeoff:'research',penalty:.25,mechanic:'data-monopoly'}),
    N('Planetary Dataset','era','quality',.60,'Builds a civilization-scale representation of knowledge.',{cost:1e24,unlock:'Planetary data era'}),
  ]),
  market:B('Market & Marketing','market','#ffcb66',1,[
    N('Targeted Advertising','minor','marketing',.25,'Improves Credits-to-Demand conversion.'),
    N('Brand Recognition','major','demand',.20,'Adds durable baseline Demand.'),
    N('Growth Loops','major','demand',.24,'Marketing and Popularity reinforce each other.',{mechanic:'marketing-popularity'}),
    N('Pricing Science','major','priceElasticity',.25,'Reduces Demand lost to higher prices.'),
    N('Global Expansion','major','marketSize',.40,'Opens larger addressable markets.'),
    N('Growth at All Costs','keystone','marketing',2,'Triple Marketing effectiveness while reducing Revenue/User.',{tradeoff:'revenue',penalty:.25,mechanic:'growth-at-all-costs'}),
    N('Category Ownership','era','demand',.75,'Makes the company synonymous with applied AI.',{cost:1e27,unlock:'Global market era'}),
  ]),
  items:B('Item & Artifact Science','items','#d6bd86',2_500,[
    N('Equipment Science','system','itemPower',.10,'Unlocks stronger role-matched equipment interactions.',{unlockFeature:'items',unlock:'Equipment specialization'}),
    N('Equipment Slot','major','itemSlots',1,'Adds one specialized Model equipment slot.'),
    N('Rarity Mastery','major','itemPower',.25,'Higher-rarity Item effects scale further.'),
    N('Set Synergy','major','itemSetPower',.35,'Strengthens completed equipment-set bonuses.'),
    N('Artifact Research','major','artifactPower',.40,'Amplifies unusual Artifact effects.'),
    N('Relic Hunter','keystone','itemPower',.50,'Items and Artifacts become dominant; ordinary Tech modifiers weaken.',{tradeoff:'techPower',penalty:.20,mechanic:'relic-hunter'}),
    N('Pure Technologist','keystone','techPower',.25,'Technology effects strengthen while Item effects weaken.',{tradeoff:'itemPower',penalty:.30,mechanic:'pure-technologist'}),
  ]),
  prestige:B('Intelligence & Prestige','prestige','#f4e66e',10_000,[
    N('Intelligence Retention','minor','intelligenceGain',.15,'Improves insight preserved by Development Cycles.'),
    N('Milestone Intelligence','major','intelligenceGain',.18,'Hardware and Model milestones contribute to INT rewards.',{mechanic:'milestone-intelligence'}),
    N('Model Intelligence','major','intelligenceGain',.20,'Completed Training contributes more strongly to INT.'),
    N('Research Intelligence','major','intelligenceGain',.22,'Discovered Patents contribute to INT.'),
    N('Cycle Planning','major','intelligenceGain',.18,'Rewards deliberate timing around company-era goals.'),
    N('Deep Run','keystone','deepRunInt',.80,'Long Runs scale INT strongly but short Runs suffer.',{tradeoff:'earlyInt',penalty:.45,mechanic:'deep-run'}),
    N('Rapid Iteration','keystone','earlyInt',.65,'Early cycles gain more INT but late-run scaling weakens.',{tradeoff:'deepRunInt',penalty:.40,mechanic:'rapid-iteration'}),
  ]),
  agi:B('Artificial General Intelligence','agi','#ffffff',1_000_000,[
    N('World Models','major','quality',.30,'Models reason over persistent simulations of the world.'),
    N('General Transfer','major','training',.30,'Completed knowledge transfers between Model architectures.'),
    N('Recursive Model Design','major','training',.40,'Each completed Training reduces future architectural work.',{mechanic:'recursive-training'}),
    N('Self-Designed Hardware','major','hardwareOutput',.45,'Model Quality contributes to Hardware engineering.',{mechanic:'model-hardware'}),
    N('General Intelligence','model','intelligenceGain',.35,'Unlocks the AGI Model and recursive company strategy.',{unlockModel:'agi',unlock:'AGI Model'}),
    N('Recursive Self-Improvement','keystone','allOutput',1,'AGI doubles connected systems but increases Training requirements.',{tradeoff:'training',penalty:.35,mechanic:'recursive-self-improvement'}),
    N('Intelligence Explosion','era','intelligenceGain',2,'Crosses into self-accelerating intelligence growth.',{cost:1e32,unlock:'Superintelligence era'}),
  ]),
  singularity:B('Singularity','singularity','#70fff2',1_000_000_000,[
    N('Autonomous Science','major','research',.60,'Research scales with permanent Intelligence.'),
    N('Machine Economy','major','agents',.65,'Autonomous agents operate a global machine economy.'),
    N('Planetary Mind','major','allOutput',.70,'Planetary infrastructure acts as one intelligence.'),
    N('Superintelligence Seed','model','intelligenceGain',.75,'Unlocks the ASI Seed Model.',{unlockModel:'asiSeed',unlock:'ASI Seed Model'}),
    N('Post-Scarcity Compute','major','hardwareOutput',1,'Compute expands beyond conventional industrial limits.'),
    N('Technological Singularity','era','allOutput',3,'Unlocks the final self-directed company era.',{cost:1e42,unlock:'Singularity'}),
    N('Cosmic Intelligence','era','allOutput',4,'All systems scale cosmically while active manual input becomes negligible.',{cost:1e55,tradeoff:'click',penalty:.95,mechanic:'cosmic-intelligence'}),
  ]),
});

const RANK_COST_MULTIPLIERS=[1,3,12,50,250,2_500,1_000_000];
const TYPE_COST_MULTIPLIER={minor:1,major:1.35,system:1.5,model:2,keystone:4,era:8};
export const TECHNOLOGY_NODES = Object.freeze(Object.entries(TECHNOLOGY_BRANCHES).flatMap(([branch,config],branchIndex)=>config.nodes.map((node,index)=>{
  const id=`${branch}-${index+1}`,type=node.type==='major'&&index===1?'minor':node.type;
  const cost=node.cost??Math.ceil(config.baseCost*RANK_COST_MULTIPLIERS[index]*(TYPE_COST_MULTIPLIER[type]??1));
  return Object.freeze({id,branch,branchLabel:config.label,icon:config.icon,color:config.color,name:node.name,type,rank:index+1,era:TECHNOLOGY_ERAS[Math.min(TECHNOLOGY_ERAS.length-1,Math.floor((branchIndex+index)/3))],cost,requires:index?`${branch}-${index}`:null,effect:node.effect,value:node.value,effects:Object.freeze({[node.effect]:node.value,...(node.effects??{})}),tradeoff:node.tradeoff??null,penalty:node.penalty??0,tradeoffs:Object.freeze(node.tradeoff?{[node.tradeoff]:node.penalty}:{}),description:node.description,mechanic:node.mechanic??null,synergy:node.synergy??null,unlock:node.unlock??null,unlockModel:node.unlockModel??null,unlockFeature:node.unlockFeature??null,tags:Object.freeze([branch,node.type,node.effect]),position:Object.freeze({x:80+index*230,y:80+branchIndex*145}),visibility:'always'});
})));

export function technologyNode(id){return TECHNOLOGY_NODES.find(node=>node.id===id)??null}
const purchasedCache=new WeakMap(),effectCache=new WeakMap();
export function purchasedTechnologyNodes(state){if(purchasedCache.has(state))return purchasedCache.get(state);const ids=new Set(state.meta.techNodes),nodes=TECHNOLOGY_NODES.filter(node=>ids.has(node.id));purchasedCache.set(state,nodes);return nodes}
export function technologyEffect(state,effect){let effects=effectCache.get(state);if(!effects){effects={};for(const node of purchasedTechnologyNodes(state)){for(const[key,value]of Object.entries(node.effects))effects[key]=(effects[key]??0)+value;for(const[key,value]of Object.entries(node.tradeoffs))effects[key]=(effects[key]??0)-value}effectCache.set(state,effects)}return effects[effect]??0}
export function hasTechnologyMechanic(state,mechanic){return purchasedTechnologyNodes(state).some(node=>node.mechanic===mechanic)}
export function branchInvestment(state){return Object.fromEntries(Object.keys(TECHNOLOGY_BRANCHES).map(branch=>[branch,purchasedTechnologyNodes(state).filter(node=>node.branch===branch).reduce((sum,node)=>sum+node.cost,0)]))}
