import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultState } from '../src/data/defaultState.js';
import { buyHardwareBulk, hardwarePurchaseEligibility } from '../src/systems/GameSystem.js';

function withCredits(credits,hardware={}) {
  const state=createDefaultState();
  return {...state,resources:{...state.resources,credits},hardware:{...state.hardware,...hardware}};
}

test('Calculator insufficiency is a Credit state, never a prerequisite lock',()=>{
  const result=hardwarePurchaseEligibility(withCredits(0),'calculator',1);
  assert.equal(result.prerequisiteMet,true);
  assert.equal(result.canPurchase,false);
  assert.equal(result.disabledReason,'INSUFFICIENT_CREDITS');
  assert.equal(result.prerequisiteName,null);
  assert(result.totalCost>0);
});

test('locked Pocket Computer reports its real Calculator prerequisite',()=>{
  const result=hardwarePurchaseEligibility(withCredits(1_000_000),'homeComputer',1);
  assert.equal(result.prerequisiteMet,false);
  assert.equal(result.disabledReason,'PREREQUISITE');
  assert.equal(result.prerequisiteName,'Calculator');
});

test('unlocked Pocket Computer insufficiency remains a Credit state',()=>{
  const result=hardwarePurchaseEligibility(withCredits(0,{calculator:1}),'homeComputer',1);
  assert.equal(result.prerequisiteMet,true);
  assert.equal(result.canPurchase,false);
  assert.equal(result.disabledReason,'INSUFFICIENT_CREDITS');
  assert(result.totalCost>0);
});

test('fixed bulk modes require affordability for the full selected quantity',()=>{
  const itemState=withCredits(1_000);
  const one=hardwarePurchaseEligibility(itemState,'calculator',1);
  const state=withCredits(one.totalCost);
  assert.equal(hardwarePurchaseEligibility(state,'calculator',1).canPurchase,true);
  const twentyFive=hardwarePurchaseEligibility(state,'calculator',25);
  assert.equal(twentyFive.quantity,25);
  assert.equal(twentyFive.canPurchase,false);
  assert.equal(twentyFive.disabledReason,'INSUFFICIENT_CREDITS');
  assert.strictEqual(buyHardwareBulk(state,'calculator',25,'x25'),state);
});

test('MAX is enabled with an exact positive affordable quantity',()=>{
  const result=hardwarePurchaseEligibility(withCredits(1_000),'calculator','max');
  assert(result.quantity>=1);
  assert.equal(result.canPurchase,true);
  assert(result.totalCost<=1_000);
});

test('MAX with room for zero units exposes next price as a Credit state',()=>{
  const result=hardwarePurchaseEligibility(withCredits(0),'calculator','max');
  assert.equal(result.quantity,0);
  assert(result.totalCost>0);
  assert.equal(result.canPurchase,false);
  assert.equal(result.disabledReason,'INSUFFICIENT_CREDITS');
});
