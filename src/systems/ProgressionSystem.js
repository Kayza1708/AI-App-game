import { BALANCE } from '../config/balance.js';

const nonNegative = value => Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0;

/** Local unit price before discounts, in Credits. */
export function hardwareUnitCost(item, owned) {
  return Math.ceil(item.baseCost * item.costGrowth ** Math.max(0, Math.floor(nonNegative(owned))));
}

/** Exact undiscounted geometric bulk price. */
export function hardwareBulkBaseCost(item, owned, quantity) {
  const n = Math.max(0, Math.floor(nonNegative(owned)));
  const k = Math.max(0, Math.floor(nonNegative(quantity)));
  if (!k) return 0;
  const growth = item.costGrowth;
  return item.baseCost * growth ** n * (growth ** k - 1) / (growth - 1);
}

export function derivedHardwareGrowth(targetPurchaseCount, targetFinalCostRatio) {
  return nonNegative(targetFinalCostRatio) ** (1 / Math.max(1, nonNegative(targetPurchaseCount)));
}

export function withinModelLevelFactor(level) {
  return 1 + BALANCE.models.levelCoefficient * Math.max(1, nonNegative(level)) ** BALANCE.models.levelPower;
}

export function modelTierScale(tier) {
  return BALANCE.models.tierScale[Math.min(BALANCE.models.tierScale.length - 1, Math.max(0, Math.floor(nonNegative(tier))))];
}

export function targetTrainingDuration(level, tier = 0) {
  const transition = BALANCE.training.tierTransitionSeconds[Math.min(BALANCE.training.tierTransitionSeconds.length - 1, Math.max(0, Math.floor(nonNegative(tier))))];
  return BALANCE.training.durationBaseSeconds + BALANCE.training.durationSqrtCoefficient * Math.sqrt(Math.max(1, nonNegative(level))) + transition;
}

/** Static calibration anchor. It deliberately cannot inspect player state. */
export function referenceTrainingRate(level, tier = 0) {
  const value=Math.max(1,nonNegative(level));
  const anchors=BALANCE.training.referenceRateAnchors;
  const upper=anchors.find(anchor=>anchor.level>=value)??anchors.at(-1);
  const lower=[...anchors].reverse().find(anchor=>anchor.level<=value)??anchors[0];
  const localRate=lower===upper?lower.rate:Math.exp(Math.log(lower.rate)+(Math.log(upper.rate)-Math.log(lower.rate))*(value-lower.level)/(upper.level-lower.level));
  const tierScale=BALANCE.training.referenceRateByTier[Math.min(BALANCE.training.referenceRateByTier.length-1,Math.max(0,Math.floor(nonNegative(tier))))];
  return localRate*tierScale;
}

export function trainingRequirement(level, tier = 0) {
  return referenceTrainingRate(level, tier) * targetTrainingDuration(level, tier);
}

export function efficiencyFactor(efficiency) { return 1 + BALANCE.models.efficiencyCoefficient * Math.sqrt(nonNegative(efficiency)); }
export function qualityRevenueFactor(quality) { return 1 + BALANCE.models.qualityRevenueCoefficient * Math.sqrt(nonNegative(quality)); }

export function allocatedCompute(totalCompute, allocationPercent) {
  return nonNegative(totalCompute) * Math.min(100, nonNegative(allocationPercent)) / 100;
}
