import { BALANCE, featureUnlocked } from '../config/balance.js';
import { acquireItem, earnGems, grantCache } from './InventorySystem.js';

const POOLS = {
  daily: [
    { key:'compute', text:'Produce Compute', metric:s=>s.statistics.totalComputeProduced, target:100, reward:{credits:BALANCE.missions.dailyCredits} },
    { key:'credits', text:'Earn Credits', metric:s=>s.statistics.totalCreditsEarned, target:1_000, reward:{gems:BALANCE.missions.dailyGems} },
    { key:'hardware', text:'Expand Hardware', metric:s=>Object.values(s.hardware).reduce((a,b)=>a+b,0), target:8, reward:{item:'compressed-kv'} },
    { key:'training', text:'Advance a Model', metric:s=>s.model.level, target:2, reward:{cache:'model-cache'} },
    { key:'research', text:'Generate Research', metric:s=>s.resources.research, target:50, feature:'research', reward:{item:'scientific-corpus'} },
  ],
  weekly: [
    { key:'growth', text:'Earn 25,000 Credits', metric:s=>s.statistics.totalCreditsEarned, target:25_000, reward:{gems:BALANCE.missions.weeklyGems} },
    { key:'items', text:'Acquire 3 Model Items', metric:s=>s.statistics.totalItemsAcquired, target:3, feature:'items', reward:{cache:'weekly-cache'} },
    { key:'cycles', text:'Complete a Development Cycle', metric:s=>s.meta.cycles, target:1, feature:'development', reward:{gems:5} },
    { key:'patent', text:'Discover a Patent', metric:s=>s.patents.discovered.length, target:1, feature:'patents', reward:{item:'photonic-accelerator'} },
  ],
  monthly: [
    { key:'int', text:'Reach 20 Lifetime INT', metric:s=>s.meta.totalIntelligence, target:20, reward:{gems:BALANCE.missions.monthlyGems,item:'open-weights'} },
    { key:'era', text:'Unlock a second Model era', metric:s=>s.model.owned.length, target:2, feature:'development', reward:{gems:12,cache:'weekly-cache'} },
  ],
};

export function missionPeriodIds(date=new Date()) {
  const day=date.toISOString().slice(0,10);const first=new Date(Date.UTC(date.getUTCFullYear(),0,1));const week=Math.ceil(((date-first)/86400000+first.getUTCDay()+1)/7);
  return { dailyPeriodId:day, weeklyPeriodId:`${date.getUTCFullYear()}-W${String(week).padStart(2,'0')}`, monthlyPeriodId:`${date.getUTCFullYear()}-${String(date.getUTCMonth()+1).padStart(2,'0')}` };
}

export function ensureMissions(state,date=new Date()) {
  const ids=missionPeriodIds(date);let missions={...state.missions};let changed=false;
  for(const period of ['daily','weekly','monthly']){const key=`${period}PeriodId`;if(missions[key]!==ids[key]){missions={...missions,[key]:ids[key],[period]:generatePeriod(state,period,ids[key]),generatedAt:date.getTime()};changed=true}}
  return changed?{...state,missions}:state;
}

export function missionsWithProgress(state,period=null){const names=period?[period]:['daily','weekly','monthly'];return names.flatMap(name=>(state.missions[name]??[]).map(mission=>({...mission,progress:Math.min(mission.target,missionMetric(state,mission.metric)),claimed:Boolean(state.missions.claims[mission.id])}))) }

export function claimMission(state,id){const mission=missionsWithProgress(state).find(entry=>entry.id===id);if(!mission||mission.claimed||mission.progress<mission.target)return state;let next={...state,missions:{...state.missions,claims:{...state.missions.claims,[id]:Date.now()}},statistics:{...state.statistics,totalMissionsClaimed:state.statistics.totalMissionsClaimed+1}};if(mission.reward.credits)next={...next,resources:{...next.resources,credits:next.resources.credits+mission.reward.credits}};if(mission.reward.gems)next=earnGems(next,mission.reward.gems,'mission');if(mission.reward.item)next=acquireItem(next,mission.reward.item,'mission');if(mission.reward.cache)next=grantCache(next,mission.reward.cache);return next}

export function completeMissionsForDeveloper(state,period){const entries=state.missions[period]??[];return entries.reduce((next,mission)=>({...next,missions:{...next.missions,claims:{...next.missions.claims,[mission.id]:'developer-complete'}}}),state)}

function generatePeriod(state,period,id){const available=POOLS[period].filter(mission=>!mission.feature||featureUnlocked(state,mission.feature)).sort((a,b)=>Number(Boolean(b.feature))-Number(Boolean(a.feature)));const count=period==='daily'?Math.min(3,available.length):period==='weekly'?Math.min(2,available.length):1;return available.slice(0,count).map(mission=>({id:`${id}-${mission.key}`,period,text:mission.text,target:mission.target,metric:mission.key,reward:mission.reward}))}
function missionMetric(state,key){return POOLS.daily.concat(POOLS.weekly,POOLS.monthly).find(item=>item.key===key)?.metric(state)??0}
