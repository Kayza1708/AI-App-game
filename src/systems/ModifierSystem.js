import { ARTIFACT_CATALOG } from '../data/metaCatalog.js';
import { ITEM_CATALOG, ITEM_SETS } from '../data/itemCatalog.js';

export function equippedItemInstances(state, modelId = null) {
  const ids = modelId ? Object.values(state.inventory.equipped[modelId] ?? {}) : Object.values(state.inventory.equipped).flatMap(Object.values);
  const wanted = new Set(ids.filter(Boolean));
  return state.inventory.instances.filter(instance=>wanted.has(instance.instanceId));
}

export function itemModifiers(state, modelId = null) {
  const totals = {};
  const instances = equippedItemInstances(state, modelId);
  for (const instance of instances) addEffects(totals, ITEM_CATALOG.find(item=>item.id===instance.catalogId)?.effects);
  const ids=new Set(instances.map(instance=>instance.catalogId));
  for(const set of ITEM_SETS){const pieces=set.itemIds.filter(id=>ids.has(id)).length;for(const bonus of set.bonuses)if(pieces>=bonus.pieces)addEffects(totals,bonus.effects)}
  return totals;
}

export function artifactModifiers(state){const totals={};for(const id of state.artifacts.owned)addEffects(totals,ARTIFACT_CATALOG.find(item=>item.id===id)?.effects);return totals}
export function modifierValue(state,effect,modelId=null){return(itemModifiers(state,modelId)[effect]??0)+(artifactModifiers(state)[effect]??0)}
export function modelBuildSummary(state,model){const effects=itemModifiers(state,model.id),equipment=equippedItemInstances(state,model.id).map(instance=>ITEM_CATALOG.find(item=>item.id===instance.catalogId)?.name).filter(Boolean);const axes={Research:(effects.research??0)+(effects.reasoning??0)*.1,Consumer:(effects.adoption??0)+(effects.popularity??0)*.1,Enterprise:(effects.enterprise??0)+(effects.revenue??0),Agents:(effects.agents??0)+(effects.autonomy??0)*.1,Efficiency:(effects.inference??0)+(effects.energyEfficiency??0)};const leader=Object.entries(axes).sort((a,b)=>b[1]-a[1])[0];return{modelId:model.id,class:model.archetype??model.role,equipment,effects,axes,identity:leader?.[1]>0?leader[0]:'Balanced'}}
export function inferCompanyBuild(state){const skillPoints=Object.values(state.model.progress??{}).map(progress=>Object.values(progress.skills??{}).reduce((sum,value)=>sum+value,0));const scores={Compute:modifierValue(state,'hardwareOutput')+state.allocation.training*.002,Research:modifierValue(state,'research')+state.allocation.research*.01,Consumer:modifierValue(state,'adoption')+state.allocation.inference*.003+(state.market.priceMultiplier<1?.12:0),Enterprise:modifierValue(state,'enterprise')+modifierValue(state,'revenue')+(state.market.priceMultiplier>1.5?.25:0),Agent:modifierValue(state,'agents')+state.allocation.agents*.01,Energy:modifierValue(state,'energyEfficiency')+modifierValue(state,'energyOutput')+Object.values(state.energy.buildings).reduce((sum,value)=>sum+value,0)*.01,'Model Specialist':Math.max(0,...skillPoints)*.04};const ranked=Object.entries(scores).sort((a,b)=>b[1]-a[1]);return ranked[0]?.[1]>.12&&ranked[0][1]>ranked[1][1]*1.2?ranked[0][0]:'Balanced'}
function addEffects(target,effects={}){for(const[key,value]of Object.entries(effects))target[key]=(target[key]??0)+value}
