import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultState } from '../src/data/defaultState.js';
import { computePerSecond, economySnapshot, marketMetrics, revenuePerUser, tickGame } from '../src/systems/GameSystem.js';
import { inferenceCapacity, marketSnapshot, revenueRate } from '../src/systems/MarketSystem.js';
import { efficiencyFactor } from '../src/systems/ProgressionSystem.js';
import { simulateDuration } from '../src/systems/OfflineProgressSystem.js';

function state(){const s=createDefaultState();s.hardware.miniDatacenter=8;s.model.progress.tinyChat={...s.model.progress.tinyChat,skills:{quality:3,efficiency:3}};return s}
const close=(a,b,t=1e-9)=>assert(Math.abs(a-b)<=t*Math.max(1,Math.abs(a),Math.abs(b)),`${a} != ${b}`);

test('Compute capacity ignores removed allocation controls',()=>{const low=state(),high=structuredClone(low);low.allocation.inference=1;high.allocation.inference=99;close(marketMetrics(low).capacity,marketMetrics(high).capacity)});
test('Capacity is fully utilized and aliases Users',()=>{const s=state(),m=marketMetrics(s);assert.equal(m.users,m.capacity);assert.equal(m.currentUsers,m.capacity);assert.equal(m.servedUsers,m.capacity);assert.equal(m.utilization,1);assert.equal(m.bottleneck,'FULLY UTILIZED')});
test('Efficiency reduces Compute per User and expands capacity',()=>{const s=state(),base=inferenceCapacity(s,100,efficiencyFactor(0),1),better=inferenceCapacity(s,100,efficiencyFactor(10),1);assert(better.computePerUser<base.computePerUser);assert(better.inferenceCapacity>base.inferenceCapacity)});
test('Quality raises Revenue per User without changing capacity',()=>{const s=state(),before=marketMetrics(s);s.model.progress.tinyChat.skills.quality=10;const after=marketMetrics(s);assert.equal(after.capacity,before.capacity);assert(revenuePerUser(s)>before.revenuePerUser)});
test('Revenue is Users times Revenue/User',()=>{const m=marketMetrics(state());assert.equal(m.revenuePerSecond,m.users*m.revenuePerUser);assert.equal(revenueRate(12,3),36)});
test('tick sets Users to capacity and grants canonical Credits and passive Research',()=>{const s=state(),m=marketMetrics(s),next=tickGame(s,2000);assert.equal(next.resources.users,m.capacity);close(next.resources.credits-s.resources.credits,m.revenuePerSecond*2);assert(next.resources.research>s.resources.research)});
test('market snapshot remains finite at huge Compute',()=>{const s=state(),m=marketSnapshot(s,{totalComputePerSecond:1e250,modelEfficiency:10,inferenceModifiers:1,revenuePerUser:2,factors:{quality:1}});for(const key of ['capacity','users','servedUsers','revenuePerSecond','computePerUser'])assert(Number.isFinite(m[key]))});
test('offline simulation uses the same Core Loop',()=>{const s=state(),single=tickGame(s,60_000),chunked=simulateDuration(s,60_000);close(chunked.resources.users,single.resources.users,.02);assert(computePerSecond(chunked)>0);assert(economySnapshot(chunked).utilization===1)});
