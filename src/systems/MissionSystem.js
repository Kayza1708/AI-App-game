import { BALANCE, featureUnlocked } from '../config/balance.js';
import { ITEM_CATALOG } from '../data/itemCatalog.js';
import { HARDWARE_CATALOG, OBJECTIVES } from '../data/defaultState.js';
import { economySnapshot, effectiveHardwareCost, grantCredits, isHardwareUnlocked } from './GameSystem.js';
import { acquireItem, earnGems, grantCache } from './InventorySystem.js';

const POOLS = {
  daily: [
    mission('credits','Economy','Earn Credits','creditsEarned',s=>bounded(economySnapshot(s).creditsPerSecond*1_200,300,1e15),{gems:1}),
    mission('compute','Economy','Produce Compute','computeProduced',s=>bounded(economySnapshot(s).computePerSecond*1_200,100,1e18),{credits:300}),
    mission('hardware','Hardware','Expand Hardware','hardwareOwned',s=>Math.max(3,Math.ceil(totalHardware(s)*.12)),{item:'compressed-kv'}),
    mission('training','Training','Complete Model Training','trainings',()=>1,{gems:1}),
    mission('model-upgrade','Models','Spend a Model Improvement Point','modelPointsSpent',()=>1,{credits:300}),
    mission('users','Market','Serve additional Users','usersGained',s=>bounded(Math.max(10,s.resources.users*.15),10,1e12),{gems:1},'marketing'),
    mission('research','Research','Generate Research','researchGained',s=>bounded(economySnapshot(s).researchPerSecond*1_200,25,1e15),{item:'scientific-corpus'},'research'),
    mission('items','Items','Equip a Model Item','itemsEquipped',()=>1,{gems:1},'items'),
    mission('explore','Exploration','Open three company screens','pageVisits',()=>3,{credits:250}),
  ],
  weekly: [
    mission('weekly-credits','Economy','Build weekly revenue','creditsEarned',s=>bounded(economySnapshot(s).creditsPerSecond*10_800,5_000,1e20),{gems:3}),
    mission('weekly-levels','Models','Gain Model levels','modelLevels',()=>3,{cache:'model-cache'}),
    mission('weekly-items','Items','Acquire Model Items','itemsAcquired',()=>3,{cache:'weekly-cache'},'items'),
    mission('weekly-cycles','Prestige','Complete Development Cycles','cycles',()=>1,{gems:5},'development'),
    mission('weekly-patent','Research','Discover a Patent','patents',()=>1,{item:'photonic-accelerator'},'patents'),
  ],
  monthly: [
    mission('monthly-credits','Economy','Build a month of company revenue','creditsEarned',s=>bounded(economySnapshot(s).creditsPerSecond*43_200,25_000,1e24),{gems:24}),
    mission('monthly-training','Training','Complete a major Training program','trainings',()=>12,{gems:24}),
    mission('monthly-int','Prestige','Earn permanent Intelligence','intelligence',s=>bounded(Math.max(5,s.meta.totalIntelligence*.35),5,1e9),{gems:10,item:'open-weights'},'development'),
    mission('monthly-model','Models','Unlock a new Model era','modelsOwned',()=>1,{gems:12,cache:'weekly-cache'},'development'),
    mission('monthly-hardware','Hardware','Reach a new Hardware era','hardwareTier',()=>1,{gems:10}),
    mission('monthly-items','Items','Acquire a Rare-or-better Item','rareItems',()=>1,{gems:10},'items'),
  ],
};

export function missionPeriodIds(date=new Date()){const day=date.toISOString().slice(0,10),first=new Date(Date.UTC(date.getUTCFullYear(),0,1)),week=Math.ceil(((date-first)/86400000+first.getUTCDay()+1)/7);return{dailyPeriodId:day,weeklyPeriodId:`${date.getUTCFullYear()}-W${String(week).padStart(2,'0')}`,monthlyPeriodId:`${date.getUTCFullYear()}-${String(date.getUTCMonth()+1).padStart(2,'0')}`}}
export function ensureMissions(state,date=new Date()){const ids=missionPeriodIds(date);let missions={...state.missions},changed=false;for(const period of ['daily','weekly','monthly']){const key=`${period}PeriodId`;if(missions[key]!==ids[key]){missions={...missions,[key]:ids[key],[period]:generatePeriod(state,period,ids[key]),generatedAt:date.getTime(),seeds:{...missions.seeds,[period]:seedOf(`${state.profile.localOwnerId}:${ids[key]}`)}};changed=true}}return changed?{...state,missions}:state}
export function missionsWithProgress(state,period=null){const names=period?[period]:['daily','weekly','monthly'];return names.flatMap(name=>(state.missions[name]??[]).map(entry=>({...entry,progress:Math.min(entry.target,Math.max(0,metric(state,entry.metric)-entry.baseline)),claimed:Boolean(state.missions.claims[entry.id])}))) }
export function claimMission(state,id){const mission=missionsWithProgress(state).find(entry=>entry.id===id);if(!mission||mission.claimed||mission.progress<mission.target)return state;let next={...state,missions:{...state.missions,claims:{...state.missions.claims,[id]:Date.now()}},statistics:{...state.statistics,totalMissionsClaimed:state.statistics.totalMissionsClaimed+1}};next=grantReward(next,mission.reward,mission.period);return updateDailyStreak(next,mission.period)}
export function completeMissionsForDeveloper(state,period){const entries=state.missions[period]??[];return entries.reduce((next,entry)=>({...next,missions:{...next.missions,claims:{...next.missions.claims,[entry.id]:'developer-complete'}}}),state)}
function generatePeriod(state,period,id){const blockedMetrics=currentObjectiveMetrics(state),available=POOLS[period].filter(entry=>(!entry.feature||featureUnlocked(state,entry.feature))&&!blockedMetrics.has(entry.metric)),count=period==='daily'?Math.min(4,available.length):period==='weekly'?Math.min(4,available.length):Math.min(2,available.length),random=seeded(seedOf(`${state.profile.localOwnerId}:${id}:${period}`)),selected=[];while(selected.length<count){const candidate=available[Math.floor(random()*available.length)];if(candidate&&!selected.some(entry=>entry.category===candidate.category||entry.key===candidate.key))selected.push(candidate);else if(selected.length>=new Set(available.map(entry=>entry.category)).size){const fallback=available.find(entry=>!selected.includes(entry));if(fallback)selected.push(fallback);else break}}return selected.map((entry,index)=>({id:`${id}-${entry.key}`,period,category:entry.category,text:entry.text,target:Math.ceil(entry.target(state)),metric:entry.metric,baseline:metric(state,entry.metric),reward:scaledReward(state,entry.reward,period),bonus:period==='daily'&&index===3}))}
function mission(key,category,text,metricName,target,reward,feature=null){return{key,category,text,metric:metricName,target,reward,feature}}
function metric(state,key){const e=economySnapshot(state),progress=Object.values(state.model.progress??{});return{creditsEarned:state.statistics.totalCreditsEarned,computeProduced:state.statistics.totalComputeProduced,hardwareOwned:totalHardware(state),modelXp:state.statistics.playTimeMs?state.model.level*100+state.model.xp:state.model.xp,trainings:progress.reduce((sum,item)=>sum+(item.trainingCount??item.trainings??0),0),modelPointsSpent:progress.reduce((sum,item)=>sum+(item.totalPointsSpent??0),0),usersGained:state.resources.users,researchGained:state.resources.research,energyBuilt:Object.values(state.energy.buildings).reduce((a,b)=>a+b,0),itemsEquipped:state.inventory.instances.filter(item=>item.equippedModelId).length,pageVisits:state.statistics.pageVisits??0,modelLevels:state.model.level,itemsAcquired:state.statistics.totalItemsAcquired,cycles:state.meta.cycles,patents:state.patents.discovered.length,intelligence:state.meta.totalIntelligence,modelsOwned:state.model.owned.length,hardwareTier:e.currentHardwareTier,rareItems:state.inventory.instances.filter(instance=>['Rare','Epic','Legendary','Mythic'].includes(ITEM_CATALOG.find(item=>item.id===instance.catalogId)?.rarity)).length}[key]??0}
export function missionCreditReward(state,period){const clean={...state,world:{...state.world,modifiers:[]}},stableRate=economySnapshot(clean).creditsPerSecond,available=HARDWARE_CATALOG.filter(item=>isHardwareUnlocked(state,item)),highest=available.at(-1),importantCost=highest?effectiveHardwareCost(state,highest):Infinity,balanceCap=Math.max(BALANCE.missions.creditRewardFloor[period],state.resources.credits*BALANCE.missions.balanceCaps[period]),purchaseCap=importantCost*BALANCE.missions.nextPurchaseCaps[period],rateReward=stableRate*BALANCE.missions.creditRewardSeconds[period];return Math.ceil(Math.max(BALANCE.missions.creditRewardFloor[period],Math.min(rateReward,balanceCap,purchaseCap)))}
function scaledReward(state,reward,period){return{...reward,credits:missionCreditReward(state,period),gems:Math.max(reward.gems??0,BALANCE.missions.gems[period])}}
function grantReward(state,reward,period){let next=state;if(reward.credits)next=grantCredits(next,reward.credits,`${period}-mission`);if(reward.gems)next=earnGems(next,reward.gems,`${period}-mission`);if(reward.item)next=acquireItem(next,reward.item,'mission');if(reward.cache)next=grantCache(next,reward.cache);return next}
function currentObjectiveMetrics(state){const aliases={trainings:'trainings',pointsSpent:'modelPointsSpent',creditsEarned:'creditsEarned',users:'usersGained',level:'modelLevels',computeRate:'computeProduced'};return new Set(OBJECTIVES.filter(item=>!state.objectives[item.id]).slice(0,3).map(item=>item.metric?.startsWith('hardware:')?'hardwareOwned':aliases[item.metric]).filter(Boolean))}
function updateDailyStreak(state,period){if(period!=='daily')return state;const primary=state.missions.daily.filter(entry=>!entry.bonus);if(!primary.length||!primary.every(entry=>state.missions.claims[entry.id])||state.retention.lastDailyCompletionPeriod===state.missions.dailyPeriodId)return state;const previous=previousDay(state.missions.dailyPeriodId),continued=state.retention.lastDailyCompletionPeriod===previous||!state.retention.lastDailyCompletionPeriod,streak=continued?state.retention.dailyCompletionStreak+1:1;let next={...state,retention:{...state.retention,dailyCompletionStreak:streak,lastDailyCompletionPeriod:state.missions.dailyPeriodId,completedDailyPeriods:state.retention.completedDailyPeriods+1}};if(streak%7===0)next=grantCache(next,'weekly-cache');else if(streak%3===0)next=earnGems(next,2,'daily-streak');return next}
function previousDay(id){const date=new Date(`${id}T00:00:00Z`);date.setUTCDate(date.getUTCDate()-1);return date.toISOString().slice(0,10)}
function totalHardware(state){return Object.values(state.hardware).reduce((a,b)=>a+b,0)}
function bounded(value,min,max){return Math.min(max,Math.max(min,value||0))}
function seedOf(text){let value=2166136261;for(const char of text)value=Math.imul(value^char.charCodeAt(0),16777619);return value>>>0}
function seeded(seed){let value=seed||1;return()=>{value=Math.imul(1664525,value)+1013904223>>>0;return value/4294967296}}
