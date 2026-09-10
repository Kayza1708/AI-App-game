import { BALANCE } from '../config/balance.js';

const finiteNonNegative=value=>Number.isFinite(value)?Math.max(0,value):0;

/** Compute is the only User-capacity input; Efficiency lowers Compute/User. */
export function inferenceCapacity(_state,totalComputePerSecond,modelEfficiency,inferenceModifiers=1){
  const compute=finiteNonNegative(totalComputePerSecond);
  const capacity=compute*finiteNonNegative(modelEfficiency)*finiteNonNegative(inferenceModifiers)/BALANCE.market.computePerUserBase;
  return{inferenceComputePerSecond:compute,inferenceCapacity:finiteNonNegative(capacity),computePerUser:capacity>0?compute/capacity:0};
}

export function revenueRate(users,revenuePerUser){return finiteNonNegative(users)*finiteNonNegative(revenuePerUser)}

/** Capacity is always fully utilized: Current Users, Served Users and Capacity are identical. */
export function marketSnapshot(state,context){
  const capacityResult=inferenceCapacity(state,context.totalComputePerSecond,context.modelEfficiency,context.inferenceModifiers);
  const users=capacityResult.inferenceCapacity,rpu=finiteNonNegative(context.revenuePerUser),revenue=revenueRate(users,rpu);
  return{currentUsers:users,users,servedUsers:users,...capacityResult,capacity:users,utilization:users>0?1:0,revenuePerUser:rpu,revenuePerSecond:revenue,revenue,userGrowthPerSecond:0,factors:{quality:context.quality,efficiency:context.modelEfficiency},target:users,bottleneck:'FULLY UTILIZED'};
}
