import { writeFileSync } from 'node:fs';
import { BALANCE } from '../src/config/balance.js';
import { HARDWARE_CATALOG, MODEL_CATALOG, PATENTS, UPGRADES } from '../src/data/defaultState.js';

const parameter=(name,currentValue,formula,classification,system,increaseEffect,dependencies=[],lockedStatus='TUNABLE')=>({name,currentValue,formula,classification,system,earlyGameSensitivity:'context-dependent',lateGameSensitivity:'context-dependent',increaseEffect,decreaseEffect:`Opposite of: ${increaseEffect}`,dependencies,lockedStatus});
const parameters=[
 parameter('research.researchRpScale',BALANCE.research.researchRpScale,'scale × (ResearchCompute / normalization)^exponent × modifiers','LOCKED_FORMULA_COMPONENT','Research','Raises RP/s proportionally',['Research Compute'],'LOCKED'),
 parameter('research.researchComputeNormalization',BALANCE.research.researchComputeNormalization,'4 × (ResearchCompute / normalization)^0.72','LOCKED_FORMULA_COMPONENT','Research','Lowers RP/s at every positive input',['Research Compute'],'LOCKED'),
 parameter('research.researchComputeExponent',BALANCE.research.researchComputeExponent,'4 × (ResearchCompute / 1000)^exponent','LOCKED_FORMULA_COMPONENT','Research','Increases high-Compute sensitivity; effect below normalization reverses',['Research Compute'],'LOCKED'),
 parameter('research.costLevelCoefficient',BALANCE.research.costLevelCoefficient,'BaseTierCost × (1 + coefficient × level)^1.7','LOCKED_FORMULA_COMPONENT','Research costs','Raises repeat-level costs',['BaseTierCost','level'],'LOCKED'),
 parameter('research.costExponent',BALANCE.research.costExponent,'BaseTierCost × (1 + .55 × level)^exponent','LOCKED_FORMULA_COMPONENT','Research costs','Raises repeat-level cost curvature',['BaseTierCost','level'],'LOCKED'),
 parameter('research.speedMaxBonus',BALANCE.research.speedMaxBonus,'1 + maxBonus × x/(halfSaturation+x)','TUNABLE_PARAMETER','Research duration','Raises maximum speed without changing RP cost',['research speed bonuses']),
 parameter('research.speedHalfSaturation',BALANCE.research.speedHalfSaturation,'1 + 1.5x/(halfSaturation+x)','TUNABLE_PARAMETER','Research duration','Slows approach to the speed cap',['research speed bonuses']),
 parameter('patents.baseRequirement',BALANCE.patents.baseRequirement,'base × discoveryGrowth^index × tierGrowth^tier','TUNABLE_PARAMETER','Patents','Lengthens every Patent discovery',['RP/s']),
 parameter('patents.discoveryGrowth',BALANCE.patents.discoveryGrowth,'base × growth^index','TUNABLE_PARAMETER','Patents','Steepens discovery sequence',['Patent index']),
 parameter('patents.tierGrowth',BALANCE.patents.tierGrowth,'requirement × tierGrowth^floor(index/10)','TUNABLE_PARAMETER','Patents','Increases decade transition walls',['Patent tier']),
 parameter('training.expectedRateBase',BALANCE.training.expectedRateBase,'base × levelGrowth^(L-1) × 32^T','TUNABLE_PARAMETER','Training','Raises every static requirement',['level','model tier']),
 parameter('training.expectedRateLevelGrowth',BALANCE.training.expectedRateLevelGrowth,'base × growth^(L-1)','TUNABLE_PARAMETER','Training','Steepens local Training escalation',['level']),
 parameter('training.durationBaseSeconds',BALANCE.training.durationBaseSeconds,'base + coefficient × level^power + transition','TUNABLE_PARAMETER','Training','Lengthens all reference requirements',['static reference rate']),
 parameter('training.durationLevelCoefficient',BALANCE.training.durationLevelCoefficient,'28 + coefficient × level^.72 + transition','TUNABLE_PARAMETER','Training','Lengthens higher-level targets concavely',['level']),
 parameter('models.levelCoefficient',BALANCE.models.levelCoefficient,'1 + coefficient × L^.72','TUNABLE_PARAMETER','Models/Market','Raises level contribution to Demand',['model level']),
 parameter('models.levelPower',BALANCE.models.levelPower,'1 + .8 × L^power','TUNABLE_PARAMETER','Models/Market','Raises late-level sensitivity',['model level']),
 parameter('marketV3.marketingCoefficient',BALANCE.marketV3.marketingCoefficient,'1 + coefficient ln(1+M)','TUNABLE_PARAMETER','Market','Raises Marketing Demand effect',['Marketing']),
 parameter('marketV3.qualityDemandCoefficient',BALANCE.marketV3.qualityDemandCoefficient,'1 + coefficient ln(1+Q)','TUNABLE_PARAMETER','Market','Raises Quality Demand effect',['Quality']),
 parameter('marketV3.price.premiumElasticity',BALANCE.marketV3.price.premiumElasticity,'exp(-elasticity(p-1)/tolerance)','TUNABLE_PARAMETER','Market','Penalizes premium price more strongly',['price','Quality']),
 parameter('market.capacityScale',BALANCE.market.capacityScale,'InferenceCompute × Efficiency × capacityScale','TUNABLE_PARAMETER','Capacity','Raises users serviceable per Inference Compute',['Inference allocation','Efficiency']),
 parameter('market.revenueBase',BALANCE.market.revenueBase,'ServedUsers × base × RPU modifiers','TUNABLE_PARAMETER','Revenue','Raises Revenue per served user',['Served Users']),
 parameter('offline.efficiency',BALANCE.offline.efficiency,'canonical production × efficiency','TUNABLE_PARAMETER','Offline','Raises offline rewards',['offline duration']),
 parameter('offline.capMs',BALANCE.offline.capMs,'min(elapsed, cap)','TUNABLE_PARAMETER','Offline','Extends ordinary offline accumulation',['elapsed time']),
 parameter('tapping.base',BALANCE.tapping.base,'authored tapping formula','AUDIT_ONLY','Tapping','Raises manual Compute baseline',[],'AUDIT_ONLY'),
 parameter('intelligence entitlement parameters','see PrestigeSystem','piecewise cumulative Compute entitlement','AUDIT_ONLY','INT','Not authorized in this correction',['Lifetime qualifying Compute'],'AUDIT_ONLY'),
];
const phase2B2={status:'implemented',canonicalSources:['src/systems/ProgressionSystem.js','src/systems/MarketSystem.js','src/systems/GameSystem.js'],legacyMagicNumbersIntroduced:0};
writeFileSync(new URL('../ECONOMY_PARAMETER_MAP.json',import.meta.url),JSON.stringify({schemaVersion:1,generatedAt:new Date().toISOString(),purpose:'Parametric balancing map; AUDIT_ONLY entries are not change authorization.',parameters,phase2B2},null,2)+'\n');
const entries=[
 ...HARDWARE_CATALOG.flatMap(item=>[['baseCost',item.baseCost,'CONTENT_ANCHOR'],['computePerSecond',item.computePerSecond,'CONTENT_ANCHOR'],['costGrowth',item.costGrowth,'DERIVED_PARAMETER']].map(([parameterName,value,classification])=>({system:'Hardware',source:`HARDWARE_CATALOG.${item.id}.${parameterName}`,value,classification}))),
 ...MODEL_CATALOG.map(item=>({system:'Models',source:`MODEL_CATALOG.${item.id}.trainingScale`,value:item.trainingScale,classification:'CONTENT_ANCHOR'})),
 ...UPGRADES.filter(item=>item.category==='research').map(item=>({system:'Research',source:`UPGRADES.${item.id}.cost`,value:item.cost,classification:'CONTENT_ANCHOR',note:'BaseTierCost for locked level formula'})),
 ...PATENTS.map(item=>({system:'Patents',source:`PATENTS.${item.id}.value`,value:item.value,classification:'CONTENT_ANCHOR'})),
 ...parameters.map(item=>({system:item.system,source:`BALANCE.${item.name}`,value:item.currentValue,classification:item.classification})),
 {system:'Research',source:'BALANCE.research.upgradeBaseCost',value:BALANCE.research.upgradeBaseCost,classification:'LEGACY_MAGIC_NUMBER',note:'Not consumed by canonical researchProjectCost'},
 {system:'Research',source:'BALANCE.research.upgradeFamilyGrowth',value:BALANCE.research.upgradeFamilyGrowth,classification:'LEGACY_MAGIC_NUMBER',note:'Not consumed by canonical researchProjectCost'},
 {system:'Patents',source:'legacy patent level coefficient',value:.5,classification:'AUDIT_ONLY',note:'Pre-Phase-2D live compatibility'},
 {system:'Research',source:'research project duration array',value:[120,300,600,900,1800,3600],classification:'LEGACY_MAGIC_NUMBER'},
 {system:'Patents',source:'patent tier width',value:10,classification:'LEGACY_MAGIC_NUMBER'},
];
const counts=Object.fromEntries([...new Set(entries.map(item=>item.classification))].map(key=>[key,entries.filter(item=>item.classification===key).length]));
writeFileSync(new URL('../MATHEMATICAL_MAGIC_NUMBER_AUDIT.json',import.meta.url),JSON.stringify({schemaVersion:1,generatedAt:new Date().toISOString(),classifications:['LOCKED_FORMULA_COMPONENT','DERIVED_PARAMETER','TUNABLE_PARAMETER','CONTENT_ANCHOR','LEGACY_MAGIC_NUMBER','NON_ECONOMY_CONSTANT','AUDIT_ONLY'],counts,entries,phase2B2:{status:'implemented',legacyMagicNumbersIntroduced:0}},null,2)+'\n');
