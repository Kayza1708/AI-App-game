import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultState, MODEL_SKILLS, PATENTS } from '../src/data/defaultState.js';
import { viewUnlocked } from '../src/config/balance.js';
import { economySnapshot, marketMetrics, patentCurrentBonus, researchPerSecond, startPatentResearch, tickGame, upgradeModelSkill } from '../src/systems/GameSystem.js';

function runningState(){const state=createDefaultState();state.hardware.workstation=10;return state}

test('new Core Loop is Credits → Hardware → Compute → fully utilized Users → Credits',()=>{const state=runningState(),economy=economySnapshot(state);assert(economy.computePerSecond>0);assert.equal(economy.users,economy.capacity);assert.equal(economy.servedUsers,economy.capacity);assert.equal(economy.utilization,1);assert.equal(economy.creditsPerSecond,economy.users*economy.revenuePerUser);const next=tickGame(state,1000);assert.equal(next.resources.users,economy.capacity);assert(next.resources.credits>state.resources.credits)});

test('only Quality and Efficiency can receive Model Points',()=>{assert.deepEqual(MODEL_SKILLS,['quality','efficiency']);const state=runningState();state.model.upgradePoints=1;state.model.progress.tinyChat.upgradePoints=1;const quality=upgradeModelSkill(state,'tinyChat','quality');assert(marketMetrics(quality).revenuePerUser>marketMetrics(state).revenuePerUser);const efficiency=structuredClone(state);efficiency.model.progress.tinyChat.skills.efficiency=1;assert(marketMetrics(efficiency).computePerUser<marketMetrics(state).computePerUser);assert.equal(upgradeModelSkill(state,'tinyChat','popularity'),state)});

test('Research is generated automatically from total Hardware Compute',()=>{const state=runningState(),rate=researchPerSecond(state);assert(rate>0);state.allocation.research=0;assert.equal(researchPerSecond(state),rate);assert(tickGame(state,1000).resources.research>0)});

test('discovered Patents are all permanently active and remain INT-upgradeable',()=>{const state=runningState();state.meta.techNodes.push('system-patents');state.resources.research=1e9;const next=tickGame(startPatentResearch(state),0);assert.equal(next.patents.discovered[0],PATENTS[0].id);assert.deepEqual(next.patents.equipped,next.patents.discovered);assert(Number.isFinite(patentCurrentBonus(next,PATENTS[0].id)))});

test('Demand, Market, Allocation, Popularity, and Patent-slot controls are not exposed',()=>{const state=createDefaultState();assert.equal(viewUnlocked(state,'market'),false);assert.equal(viewUnlocked(state,'allocation'),false);assert(!MODEL_SKILLS.includes('popularity'));assert.equal(state.patents.slots,Number.MAX_SAFE_INTEGER)});
