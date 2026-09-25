import { BLUEPRINTS, COMPONENTS } from '../data/componentCatalog.js';
import { acquireItem } from './InventorySystem.js';
import { researchEffect } from './ResearchSystem.js';

export function componentAmount(state,id){return Math.max(0,Math.floor(state.inventory?.components?.[id]??0))}
export function grantComponents(state,rewards,source='gameplay'){
  if(!rewards||typeof rewards!=='object')return state;
  const known=new Set(COMPONENTS.map(item=>item.id)),components={...(state.inventory.components??{})},granted={};
  for(const[id,raw]of Object.entries(rewards)){const amount=Math.max(0,Math.floor(Number(raw)||0));if(!known.has(id)||!amount)continue;components[id]=(components[id]??0)+amount;granted[id]=amount}
  if(!Object.keys(granted).length)return state;
  return{...state,inventory:{...state.inventory,components,componentHistory:[...(state.inventory.componentHistory??[]),{source,rewards:granted,at:Date.now()}].slice(-100)}};
}
export function blueprintStatus(state,blueprintId){const blueprint=BLUEPRINTS.find(item=>item.id===blueprintId);if(!blueprint)return null;const efficiency=Math.min(.5,researchEffect(state,'craftingEfficiency')),ingredients=Object.entries(blueprint.recipe).map(([id,baseRequired])=>{const required=Math.max(1,Math.ceil(baseRequired*(1-efficiency)));return({id,required,owned:componentAmount(state,id),missing:Math.max(0,required-componentAmount(state,id))})});return{blueprint,ingredients,canCraft:ingredients.every(item=>item.missing===0)} }
export function craftBlueprint(state,blueprintId,now=Date.now()){
  const status=blueprintStatus(state,blueprintId);if(!status?.canCraft)return state;
  const components={...state.inventory.components};for(const item of status.ingredients)components[item.id]-=item.required;
  const paid={...state,inventory:{...state.inventory,components,craftedCount:(state.inventory.craftedCount??0)+1,craftHistory:[...(state.inventory.craftHistory??[]),{blueprintId,resultItemId:status.blueprint.resultItemId,at:now}].slice(-100)}};
  return acquireItem(paid,status.blueprint.resultItemId,`craft:${blueprintId}`,now,{bypassUnlock:true});
}
