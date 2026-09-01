const VALID_SOURCES=new Set(['daily-mission','weekly-mission','monthly-mission','achievement','milestone','rewarded-ad','event','cache','developer','migration','daily-login','daily-streak']);
const VALID_SINKS=new Set(['training-finish','training-double-points','shop-item','shop-cosmetic','inventory-slot','loadout-slot','shop-refresh','boost','future-reroll','patent-slot']);

export function earnGems(state,amount,source,metadata={}){const value=Math.max(0,Math.floor(Number(amount)||0));if(!value||!VALID_SOURCES.has(source))return state;return record(state,value,'earned',source,metadata)}
export function spendGems(state,amount,sink,metadata={}){const value=Math.max(0,Math.floor(Number(amount)||0));if(!value||!VALID_SINKS.has(sink)||state.resources.gems<value)return state;return record(state,value,'spent',sink,metadata)}
export function gemLedgerReconciles(state){return state.resources.gems===Math.max(0,(state.gemEconomy.earned??0)-(state.gemEconomy.spent??0))}
function record(state,amount,type,source,metadata){const direction=type==='earned'?1:-1;return{...state,resources:{...state.resources,gems:state.resources.gems+amount*direction},gemEconomy:{...state.gemEconomy,[type]:(state.gemEconomy[type]??0)+amount,history:[...(state.gemEconomy.history??[]),{type,amount,source,metadata,at:Date.now()}].slice(-250)}}}
