import { BALANCE } from '../config/balance.js';

const finiteNonNegative=value=>Number.isFinite(value)?Math.max(0,value):0;

export function marketingFactor(level){return 1+BALANCE.marketV3.marketingCoefficient*Math.log1p(finiteNonNegative(level))}
export function reputationFactor(value){const p=BALANCE.marketV3.reputation,r=Number.isFinite(value)?value:p.midpoint;return p.min+(p.max-p.min)/(1+Math.exp(-p.steepness*(r-p.midpoint)))}
export function adoptionFactor(value){const p=BALANCE.marketV3.adoption,a=finiteNonNegative(value);return 1+p.maxBonus*a/(p.halfSaturation+a)}
export function wordOfMouthFactor(users){const p=BALANCE.marketV3.wordOfMouth,z=Math.log1p(finiteNonNegative(users)/p.userScale);return 1+p.maxBonus*z/(p.saturation+z)}
export function qualityDemandFactor(quality){return 1+BALANCE.marketV3.qualityDemandCoefficient*Math.log1p(finiteNonNegative(quality))}
export function popularityDemandFactor(popularity){const p=BALANCE.marketV3.popularity,value=finiteNonNegative(popularity);return 1+p.sqrtCoefficient*Math.sqrt(value)+p.logCoefficient*Math.log1p(value)}
export function priceDemandFactor(price,quality,elasticityBonus=0){const p=BALANCE.marketV3.price,value=Math.min(3,Math.max(.5,Number(price)||1));if(value<=1)return 1+p.discountDemandCoefficient*(1-value);const tolerance=Math.max(.1,1+p.qualityToleranceCoefficient*Math.sqrt(finiteNonNegative(quality))+finiteNonNegative(elasticityBonus));return Math.exp(-p.premiumElasticity*(value-1)/tolerance)}
// Compatibility boundary for old callers: acquisition/churn is inactive.
export function advanceUsers(_users,demand){return finiteNonNegative(demand)}

// Capacity must never feed Potential Demand. This prevents the V2 feedback loop.
export function potentialDemand(_state,factors){const value=factors.baseMarket*factors.modelTier*factors.modelLevel*qualityDemandFactor(factors.quality)*popularityDemandFactor(factors.popularity)*factors.infrastructure*marketingFactor(factors.marketing)*reputationFactor(factors.reputation)*adoptionFactor(factors.adoption)*priceDemandFactor(factors.price,factors.quality,factors.priceElasticity)*factors.marketSizeModifiers*factors.demandModifiers*factors.appealModifiers;return finiteNonNegative(value)}
export function inferenceCapacity(state,totalComputePerSecond,modelEfficiency,inferenceModifiers=1){const inferenceCompute=finiteNonNegative(totalComputePerSecond)*(finiteNonNegative(state.allocation.inference)/100),capacity=inferenceCompute*finiteNonNegative(modelEfficiency)*finiteNonNegative(inferenceModifiers);return{inferenceComputePerSecond:inferenceCompute,inferenceCapacity:finiteNonNegative(capacity)}}
export function servedUsers(currentUsers,demand,capacity){return Math.min(finiteNonNegative(currentUsers),finiteNonNegative(demand),finiteNonNegative(capacity))}
export function revenueRate(served,revenuePerUser){return finiteNonNegative(served)*finiteNonNegative(revenuePerUser)}
export function marketSnapshot(state,context){const factors={...context.factors,currentUsers:null},demand=potentialDemand(state,factors),users=demand,capacityResult=inferenceCapacity(state,context.totalComputePerSecond,context.modelEfficiency,context.inferenceModifiers),served=servedUsers(users,demand,capacityResult.inferenceCapacity),utilization=capacityResult.inferenceCapacity?Math.min(1,served/capacityResult.inferenceCapacity):0,rpu=finiteNonNegative(context.revenuePerUser);return{potentialDemand:demand,demand,currentUsers:users,users,servedUsers:served,...capacityResult,capacity:capacityResult.inferenceCapacity,utilization,revenuePerUser:rpu,revenuePerSecond:revenueRate(served,rpu),revenue:revenueRate(served,rpu),acquisitionHalfLife:null,churnHalfLife:null,userGrowthPerSecond:0,factors:{...factors,wordOfMouth:1},capacityDemand:0,organicDemand:demand,target:demand,bottleneck:demand<=capacityResult.inferenceCapacity?'DEMAND LIMITED':'CAPACITY LIMITED'} }
