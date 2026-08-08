export const ITEM_RARITIES = ['Common','Uncommon','Rare','Epic','Legendary','Mythic'];
export const ITEM_SLOT_TYPES = ['architecture','compute','memory','dataset','optimization','safety'];
export const ITEM_TAGS = ['consumer','enterprise','research','agent','compute','energy','training','inference','adoption','reasoning','safety','automation','open-source','experimental','quantum','space'];

const definitions = [
  ['sparse-transformer','Sparse Transformer','Rare','architecture',['reasoning','research'],{reasoning:.8,research:.08,energyEfficiency:-.05},'research'],
  ['moe-core','Mixture-of-Experts Core','Epic','architecture',['reasoning','inference'],{quality:.6,inference:.14,energyEfficiency:-.08},'monthly'],
  ['recursive-stack','Recursive Reasoning Stack','Legendary','architecture',['reasoning','research','experimental'],{reasoning:1.4,research:.18,safety:-.6},'breakthrough'],
  ['open-weights','Open Source Weights','Rare','architecture',['open-source','adoption','research'],{adoption:.24,research:.14,enterprise:-.12},'weekly'],
  ['efficient-transformer','Efficient Transformer','Uncommon','architecture',['consumer','energy'],{efficiency:.7,energyEfficiency:.06},'daily'],
  ['prototype-gpu','Prototype GPU Cluster','Uncommon','compute',['compute','training','experimental'],{training:.1,hardwareOutput:.05,energyEfficiency:-.04},'daily'],
  ['photonic-accelerator','Photonic Accelerator','Epic','compute',['compute','research','energy'],{training:.16,research:.12,energyEfficiency:.08},'patent'],
  ['quantum-tensor','Quantum Tensor Core','Legendary','compute',['quantum','training'],{training:.28,research:.1,energyEfficiency:-.12},'monthly'],
  ['edge-accelerator','Edge Inference ASIC','Rare','compute',['consumer','inference'],{inference:.18,adoption:.08},'weekly'],
  ['stellar-processor','Stellar Processor Mesh','Mythic','compute',['space','compute'],{hardwareOutput:.35,energyEfficiency:.12},'breakthrough'],
  ['compressed-kv','Compressed KV Cache','Uncommon','memory',['inference','consumer'],{context:.6,inference:.1},'daily'],
  ['persistent-memory','Persistent Memory Layer','Rare','memory',['agent','automation'],{context:.9,agents:.14},'weekly'],
  ['reasoning-memory','Reasoning Scratchpad','Rare','memory',['reasoning','research'],{reasoning:.7,research:.08},'model'],
  ['enterprise-memory','Auditable Memory Vault','Epic','memory',['enterprise','safety'],{enterprise:.8,reputationGrowth:.12},'monthly'],
  ['agent-memory','Autonomous Memory Graph','Epic','memory',['agent','automation'],{autonomy:1,agents:.18},'agent'],
  ['internet-archive','Internet Archive','Uncommon','dataset',['consumer','adoption'],{knowledge:.6,popularity:.7},'daily'],
  ['scientific-corpus','Scientific Corpus','Rare','dataset',['research','reasoning'],{research:.15,reasoning:.5,popularity:-.25},'daily'],
  ['enterprise-dataset','Enterprise Dataset','Rare','dataset',['enterprise','safety'],{enterprise:.9,revenue:.12,adoption:-.06},'weekly'],
  ['synthetic-universe','Synthetic Training Universe','Legendary','dataset',['training','research','experimental'],{training:.22,research:.2},'monthly'],
  ['government-contracts','Government Contract Dataset','Epic','dataset',['enterprise','safety'],{revenue:.22,reputationGrowth:.18,adoption:-.12},'monthly'],
  ['quantization-engine','Quantization Engine','Uncommon','optimization',['inference','energy'],{inference:.16,quality:-.3,energyEfficiency:.1},'daily'],
  ['compiler-stack','Compiler Stack','Rare','optimization',['compute','training'],{training:.12,coding:.7},'weekly'],
  ['distributed-scheduler','Distributed Scheduler','Rare','optimization',['compute','automation'],{hardwareOutput:.09,allocationEfficiency:.04},'hardware'],
  ['ultra-quantizer','Ultra Efficient Quantizer','Epic','optimization',['inference','energy'],{energyEfficiency:.2,quality:-.5,inference:.2},'monthly'],
  ['agent-kernel','Unrestricted Agent Kernel','Legendary','optimization',['agent','experimental'],{agents:.35,autonomy:1.4,safety:-1},'agent'],
  ['alignment-framework','Alignment Framework','Uncommon','safety',['safety','enterprise'],{safety:.8,reputationGrowth:.08,autonomy:-.3},'daily'],
  ['compliance-suite','Regulatory Compliance Suite','Rare','safety',['enterprise','safety'],{enterprise:.7,reputationGrowth:.12,adoption:-.05},'weekly'],
  ['open-governance','Open Governance Protocol','Rare','safety',['open-source','consumer'],{safety:.6,adoption:.12,revenue:-.05},'patent'],
  ['agent-guardrails','Agent Guardrail Runtime','Epic','safety',['agent','safety'],{safety:1,agents:.12},'monthly'],
  ['singularity-proof','Singularity Containment Proof','Mythic','safety',['safety','research'],{safety:2,research:.25,intelligenceGain:.08},'breakthrough'],
];

export const ITEM_CATALOG = definitions.map(([id,name,rarity,slotType,tags,effects,source])=>({id,name,description:describe(effects),rarity,itemClass:tags[0],slotType,level:1,effects,tags,source,setId:setFor(id),compatibility:[],tradeable:false,bound:true}));

export const ITEM_SETS = [
  {id:'open-source',name:'Open Source Set',itemIds:['open-weights','internet-archive','open-governance'],bonuses:[{pieces:2,effects:{research:.08}},{pieces:3,effects:{adoption:.12}}]},
  {id:'frontier-lab',name:'Frontier Lab Set',itemIds:['sparse-transformer','photonic-accelerator','scientific-corpus','compiler-stack'],bonuses:[{pieces:2,effects:{training:.08}},{pieces:4,effects:{research:.14}}]},
  {id:'trusted-enterprise',name:'Trusted Enterprise Set',itemIds:['enterprise-memory','enterprise-dataset','compliance-suite'],bonuses:[{pieces:2,effects:{revenue:.1}},{pieces:3,effects:{reputationGrowth:.15}}]},
];

function setFor(id){return {'open-weights':'open-source','internet-archive':'open-source','open-governance':'open-source','sparse-transformer':'frontier-lab','photonic-accelerator':'frontier-lab','scientific-corpus':'frontier-lab','compiler-stack':'frontier-lab','enterprise-memory':'trusted-enterprise','enterprise-dataset':'trusted-enterprise','compliance-suite':'trusted-enterprise'}[id]??null}
function describe(effects){return Object.entries(effects).map(([key,value])=>`${value>=0?'+':''}${Math.abs(value)<.5?Math.round(value*100)+'%':value} ${key}`).join(' · ')}
