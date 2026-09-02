import assert from 'node:assert/strict';
import test from 'node:test';
import { featureUnlocked, nextFeatureUnlock } from '../src/config/balance.js';
import { createDefaultState } from '../src/data/defaultState.js';
import { TECHNOLOGY_NODES } from '../src/data/technologyCatalog.js';
import { classifyBottleneck } from '../src/dev/bottleneck-analyzer.js';
import { createGameplaySnapshot } from '../src/dev/telemetry-sampler.js';
import { purchaseTechnology, technologyPurchaseEligibility } from '../src/systems/GameSystem.js';

test('first Development Cycle INT buys an origin technology immediately',()=>{
  const roots=TECHNOLOGY_NODES.filter(node=>!node.requires&&['compute','training','hardware','model','consumer','efficiency','market'].includes(node.branch));
  assert(roots.length>=4);
  assert(roots.every(node=>node.cost===1));
  const state={...createDefaultState(),meta:{...createDefaultState().meta,cycles:1,intelligence:1,totalIntelligence:1}};
  const root=roots.find(node=>node.id==='compute-1')??roots[0];
  const eligibility=technologyPurchaseEligibility(state,root.id);
  assert.equal(eligibility.prerequisitesMet,true);
  assert.equal(eligibility.canPurchase,true);
  const purchased=purchaseTechnology(state,root.id);
  assert.equal(purchased.meta.intelligence,0);
  assert(purchased.meta.techNodes.includes(root.id));
});

test('runSeconds starts at the Development Cycle boundary',()=>{
  const base=createDefaultState();
  const state={...base,session:{...base.session,elapsedMs:31_700_000},run:{...base.run,startedAtSessionMs:31_699_000}};
  assert.equal(createGameplaySnapshot(state,10).runSeconds,1);
});

test('Allocation is never reported as a future INT unlock once available',()=>{
  const base=createDefaultState();
  const state={...base,model:{...base.model,level:4}};
  assert.equal(featureUnlocked(state,'allocation'),true);
  assert.notEqual(nextFeatureUnlock(state)?.id,'allocation');
});

test('fresh zero-compute run is not classified as Research Limited',()=>{
  assert.equal(classifyBottleneck({computePerSecond:0,researchAllocation:0}),'No Compute');
});
