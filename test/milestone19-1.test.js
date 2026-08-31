import test from 'node:test';
import assert from 'node:assert/strict';
import { BALANCE } from '../src/config/balance.js';
import { createDefaultState, HARDWARE_CATALOG, SAVE_VERSION } from '../src/data/defaultState.js';
import { claimMission, ensureMissions, missionCreditReward, missionsWithProgress } from '../src/systems/MissionSystem.js';
import { tickGame } from '../src/systems/GameSystem.js';
import { gemLedgerReconciles } from '../src/systems/GemSystem.js';
import { analyzeSession } from '../src/dev/session-analyzer.js';
import { navigationItemsForState } from '../src/ui/navigation.js';

function progressed({credits=200_000,tier=4,units=3}={}){const state=createDefaultState();state.resources.credits=credits;state.hardware[HARDWARE_CATALOG[tier].id]=units;state.resources.users=20_000;state.market.marketing=8;return tickGame(state,1_000)}

test('mission Credits use short stable-income windows and ignore temporary CPS spikes',()=>{const state=progressed(),spiked={...state,world:{...state.world,modifiers:[{effect:'revenue',value:100,expiresAt:Infinity}]}};for(const period of ['daily','weekly','monthly']){const reward=missionCreditReward(state,period),spikeReward=missionCreditReward(spiked,period);assert.equal(spikeReward,reward);assert(reward>=BALANCE.missions.creditRewardFloor[period]);assert(reward<=state.resources.credits*BALANCE.missions.balanceCaps[period]+1)}assert(missionCreditReward(state,'daily')<missionCreditReward(state,'weekly'));assert(missionCreditReward(state,'weekly')<missionCreditReward(state,'monthly'))});

test('Daily Weekly and Monthly claims use both canonical ledgers',()=>{for(const period of ['daily','weekly','monthly']){let state=createDefaultState();state.statistics.totalCreditsEarned=100;state.missions={...state.missions,[period]:[{id:`${period}-claim`,period,category:'Economy',text:'Earn',target:10,metric:'creditsEarned',baseline:90,reward:{credits:100,gems:BALANCE.missions.gems[period]}}]};state=claimMission(state,`${period}-claim`);assert.equal(state.statistics.creditSources[`${period}-mission`],100);assert.equal(state.resources.gems,BALANCE.missions.gems[period]);assert.equal(state.gemEconomy.history.at(-1).source,`${period}-mission`);assert(gemLedgerReconciles(state))}});

test('generated repeatables avoid locked mechanics and the current roadmap metric',()=>{const state=ensureMissions(createDefaultState(),new Date('2026-08-31T00:00:00Z')),missions=missionsWithProgress(state);assert(!missions.some(item=>item.feature));assert(!missions.some(item=>item.category==='Items'||item.category==='Research'||item.category==='Prestige'));assert(!missions.some(item=>item.metric==='hardwareOwned'),'current first Calculator objective owns the Hardware guidance slot')});

test('one navigation entry owns permanent roadmap and repeatable Missions',()=>{const ids=navigationItemsForState(createDefaultState()).map(item=>item.id);assert(ids.includes('objectives'));assert(!ids.includes('missions'))});

test('credit-source analytics reports inflation share and warning',()=>{const summary=analyzeSession({samples:[{sessionSeconds:0,creditSources:{}},{sessionSeconds:60,creditSources:{'user-revenue':600,'daily-mission':400},gemBalance:0}],events:[],durationSeconds:60,economy:{creditsEarned:1000}});assert.equal(summary.economy.creditSources.missionShare,.4);assert.match(summary.economy.creditSources.warning,/40.0%/);assert(summary.balanceFlags.includes('repeatable-reward-inflation'))});

test('save schema advances for Objective Mission and credit-ledger migration',()=>assert.equal(SAVE_VERSION,22));
