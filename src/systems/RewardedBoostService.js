import { REWARDED_BOOSTS } from '../data/metaCatalog.js';
import { earnGems } from './InventorySystem.js';

export class RewardedBoostService {
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
