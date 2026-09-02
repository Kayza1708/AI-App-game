const finiteNonNegative=value=>Number.isFinite(Number(value))?Math.max(0,Number(value)):0;
export const PRESTIGE_PARAMETERS=Object.freeze({earlyScale:141_333_445.74961525,earlyExponent:.72,pivotCompute:1e14,pivotEntitlement:16_286.34528324655,lateExponent:.09016844881840277,prestigeModifierCap:2.5});
export const TECHNOLOGY_COST_PARAMETERS=Object.freeze({depthCoefficient:.55,depthPower:1.65,typeMultipliers:Object.freeze({minor:.4,standard:1,major:1,system:1,model:1.5,keystone:3,era:5})});

/** All legitimate automatic, manual, boosted, and offline production uses this statistic. */
export function lifetimeQualifyingCompute(state){return Math.max(finiteNonNegative(state?.statistics?.totalComputeProduced),finiteNonNegative(state?.run?.computeProduced))}

export function baseIntEntitlement(compute){
  const value=finiteNonNegative(compute);
  if(!value)return 0;
  const log10=value<=PRESTIGE_PARAMETERS.pivotCompute
    ?PRESTIGE_PARAMETERS.earlyExponent*(Math.log10(value)-Math.log10(PRESTIGE_PARAMETERS.earlyScale))
    :Math.log10(PRESTIGE_PARAMETERS.pivotEntitlement)+PRESTIGE_PARAMETERS.lateExponent*(Math.log10(value)-Math.log10(PRESTIGE_PARAMETERS.pivotCompute));
  return Math.floor(10**log10);
}

export function intEntitlement(state,prestigeModifier=1){
  const modifier=Math.min(PRESTIGE_PARAMETERS.prestigeModifierCap,Math.max(0,Number(prestigeModifier)||1));
  return Math.floor(baseIntEntitlement(lifetimeQualifyingCompute(state))*modifier);
}

export function claimedIntEntitlement(state){return finiteNonNegative(state?.meta?.lifetimeIntClaimed)}
export function claimableInt(state,prestigeModifier=1){return Math.max(0,intEntitlement(state,prestigeModifier)-claimedIntEntitlement(state))}

export function technologyCost(baseCost,depth,type){
  const p=TECHNOLOGY_COST_PARAMETERS;
  return Math.max(1,Math.ceil(baseCost*(1+p.depthCoefficient*Math.max(0,depth-1))**p.depthPower*(p.typeMultipliers[type]??1)));
}
