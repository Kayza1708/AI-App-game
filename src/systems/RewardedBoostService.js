import { GEM_BOOSTS, REWARDED_BOOSTS } from '../data/metaCatalog.js';
import { earnGems, spendGems } from './GemSystem.js';
import { economySnapshot, grantCredits } from './GameSystem.js';

export function activateGemBoost(state,id){
  const config=GEM_BOOSTS.find(boost=>boost.id===id);if(!config)return state;
  const paid=spendGems(state,config.cost,'boost',{boostId:id,durationMs:config.durationMs});if(paid===state)return state;
  if(config.effect==='instantCreditsSeconds')return grantCredits(paid,economySnapshot(state).creditsPerSecond*config.value,'boost');
  const existing=paid.world.modifiers.find(modifier=>modifier.source===`gem:${id}`&&modifier.expiresAt>paid.statistics.playTimeMs);
  const startsAt=existing?existing.expiresAt:paid.statistics.playTimeMs;
  return{...paid,world:{...paid.world,modifiers:[...paid.world.modifiers.filter(modifier=>modifier!==existing),{effect:config.effect,value:config.value,expiresAt:startsAt+config.durationMs,source:`gem:${id}`,activatedAt:paid.statistics.playTimeMs}]}};
}

export function activeBoosts(state){return state.world.modifiers.filter(modifier=>(modifier.source?.startsWith('gem:')||modifier.source?.startsWith('rewarded:'))&&modifier.expiresAt>state.statistics.playTimeMs).map(modifier=>({...modifier,remainingMs:modifier.expiresAt-state.statistics.playTimeMs}));}

export class RewardedBoostService {
  // This adapter is invoked only by the explicitly labeled Developer control.
  // Production browser UI never exposes it as a real ad provider.
  provider='web-mock';
  activate(state,id,now=Date.now()){
    const config=REWARDED_BOOSTS.find(boost=>boost.id===id);if(!config)return state;
    const period=new Date(now).toISOString().slice(0,10);const existing=state.rewardedBoosts.periodId===period?state.rewardedBoosts.claims:{};const claim=existing[id]??{count:0,lastAt:0};
    if(claim.count>=config.dailyCap||(claim.count>0&&now-claim.lastAt<config.cooldownMs))return state;
    let next={...state,rewardedBoosts:{...state.rewardedBoosts,periodId:period,started:state.rewardedBoosts.started+1,completed:state.rewardedBoosts.completed+1,lastInteraction:{id,placement:config.placement,at:now,provider:this.provider},claims:{...existing,[id]:{count:claim.count+1,lastAt:now}}}};
    if(config.effect==='gems')next=earnGems(next,config.value,'rewarded-ad');else next={...next,world:{...next.world,modifiers:[...next.world.modifiers,{effect:config.effect,value:config.value,expiresAt:state.statistics.playTimeMs+config.durationMs,source:`rewarded:${id}`}]}};
    return next;
  }
}
