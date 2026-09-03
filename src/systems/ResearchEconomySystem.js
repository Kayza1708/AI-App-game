import { BALANCE } from '../config/balance.js';
import { allocatedCompute } from './ProgressionSystem.js';

const nonNegative=value=>Number.isFinite(Number(value))?Math.max(0,Number(value)):0;

/** Research Compute/s. Allocation is conserved by the shared allocation budget. */
export function researchComputePerSecond(totalCompute,allocationPercent){return allocatedCompute(totalCompute,allocationPercent)}

/** Research Points/s. The sub-linear exponent compresses Compute's many orders of magnitude. */
export function researchPointsPerSecond(researchCompute,modifier=1){const p=BALANCE.research;const compute=nonNegative(researchCompute);if(!compute)return 0;return p.researchRpScale*(compute/p.researchComputeNormalization)**p.researchComputeExponent*Math.max(0,nonNegative(modifier))}

/** Locked level-cost family. Project researchCost is its content tier anchor. */
export function researchLevelCost(baseTierCost,level){const p=BALANCE.research;return nonNegative(baseTierCost)*(1+p.costLevelCoefficient*nonNegative(level))**p.costExponent}

/** Bounded permanent duration multiplier; Research speed never changes RP cost. */
export function boundedResearchSpeed(rawBonus){const p=BALANCE.research,x=nonNegative(rawBonus);return 1+p.speedMaxBonus*x/(p.speedHalfSaturation+x)}

/** Pre-Phase-2D live compatibility. Bounded scaling remains AUDIT_ONLY. */
export function patentLevelMultiplier(level){return 1+.5*Math.max(0,nonNegative(level)-1)}

/** PROPOSED_FUTURE_FORMULA — audit only; never used by runtime. */
export function proposedBoundedPatentLevelMultiplier(level){const x=Math.max(0,nonNegative(level)-1);return 1+x/(3+x)}

/** Spend stored RP on Patent progress exactly once. */
export function spendResearchOnPatent(points,progress,requirement){const available=nonNegative(points),remaining=Math.max(0,nonNegative(requirement)-nonNegative(progress)),spent=Math.min(available,remaining);return{spent,points:available-spent,progress:nonNegative(progress)+spent}}
