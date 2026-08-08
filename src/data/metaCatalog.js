export const CONSUMABLES = [
  {id:'quantum-chip',name:'Quantum Chip',effect:'training',value:1,durationMs:1_800_000},
  {id:'research-grant',name:'Research Grant',effect:'research',value:1,durationMs:1_800_000},
  {id:'compute-core',name:'Compute Core',effect:'instantCompute',value:600},
  {id:'viral-campaign',name:'Viral Campaign',effect:'adoption',value:.5,durationMs:900_000},
  {id:'energy-cell',name:'Energy Cell',effect:'energyOutput',value:1,durationMs:1_800_000},
  {id:'patent-blueprint',name:'Patent Blueprint',effect:'patentProgress',value:.05},
  {id:'investor-funding',name:'Investor Funding',effect:'instantCreditsSeconds',value:1_800},
  {id:'overclock-module',name:'Overclock Module',effect:'hardwareOutput',value:.5,durationMs:900_000},
  {id:'reputation-audit',name:'Reputation Audit',effect:'reputation',value:.25},
  {id:'model-cache-key',name:'Model Cache Key',effect:'trainingSkip',value:.15},
];

export const REWARD_CACHES = [
  {id:'research-cache',name:'Research Cache',rewards:{research:120,consumable:'research-grant'}},
  {id:'compute-cache',name:'Compute Cache',rewards:{compute:500,consumable:'compute-core'}},
  {id:'model-cache',name:'Model Cache',rewards:{item:'compiler-stack',consumable:'model-cache-key'}},
  {id:'weekly-cache',name:'Weekly Cache',rewards:{gems:3,item:'scientific-corpus'}},
];

export const ARTIFACT_CATALOG = [
  {id:'transformer-paper',name:'First Transformer Paper',effects:{research:.25},developerOnly:true},
  {id:'quantum-prototype',name:'Prototype Quantum Processor',effects:{training:.25},developerOnly:true},
  {id:'agi-contract',name:'Government AGI Contract',effects:{enterprise:.25},developerOnly:true},
];

export const STORE_PRODUCTS = [
  ...[1,2,3,4,5].map(tier=>({id:`gem_pack_${tier}`,type:'iap',name:`Gem Pack ${tier}`,status:'Store integration not active in web development build'})),
  ...['starter_pack','research_pack','founder_pack','monthly_singularity_pass'].map(id=>({id,type:'iap',name:id.replaceAll('_',' '),status:'Store integration not active in web development build'})),
];

export const REWARDED_BOOSTS = [
  {id:'credits',placement:'CREDIT_BOOST',name:'Credit Boost',effect:'revenue',value:1,durationMs:1_800_000,cooldownMs:3_600_000,dailyCap:4},
  {id:'compute',placement:'COMPUTE_BOOST',name:'Compute Boost',effect:'hardwareOutput',value:1,durationMs:1_800_000,cooldownMs:3_600_000,dailyCap:4},
  {id:'training',placement:'TRAINING_BOOST',name:'Training Boost',effect:'training',value:.5,durationMs:1_800_000,cooldownMs:3_600_000,dailyCap:4},
  {id:'research',placement:'RESEARCH_BOOST',name:'Research Boost',effect:'research',value:1,durationMs:1_800_000,cooldownMs:3_600_000,dailyCap:3},
  {id:'patent',placement:'PATENT_BOOST',name:'Patent Boost',effect:'research',value:.5,durationMs:1_800_000,cooldownMs:7_200_000,dailyCap:2},
  {id:'energy',placement:'ENERGY_BOOST',name:'Energy Boost',effect:'energyOutput',value:1,durationMs:1_800_000,cooldownMs:3_600_000,dailyCap:3},
  {id:'gems',placement:'DAILY_GEMS',name:'Small Gem Reward',effect:'gems',value:1,durationMs:0,cooldownMs:21_600_000,dailyCap:1},
];

export const GEM_CONVENIENCE = [
  {id:'item-slot-3',name:'Third Model Item Slot',cost:40,effect:'itemSlot',value:1},
  {id:'training-surge',name:'Training Surge',cost:5,effect:'training',value:.5,durationMs:1_800_000},
  {id:'research-surge',name:'Research Surge',cost:5,effect:'research',value:.5,durationMs:1_800_000},
  {id:'inventory-25',name:'Inventory Expansion',cost:15,effect:'inventoryCapacity',value:25},
];

export const MARKETPLACE_SCHEMA = Object.freeze({version:1,enabled:false,requiresServerAuthority:true,listings:[],taxRate:.08});
