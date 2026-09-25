import { BALANCE } from '../config/balance.js';
import { allocatedCompute } from './ProgressionSystem.js';

const nonNegative=value=>Number.isFinite(Number(value))?Math.max(0,Number(value)):0;

/** Research Compute/s. Allocation is conserved by the shared allocation budget. */
export function researchComputePerSecond(totalCompute,allocationPercent){return allocatedCompute(totalCompute,allocationPercent)}

/** Research Points/s. The sub-linear exponent compresses Compute's many orders of magnitude. */
export function researchPointsPerSecond(researchCompute,modifier=1){const p=BALANCE.research;const compute=nonNegative(researchCompute);if(!compute)return 0;return p.researchRpScale*(compute/p.researchComputeNormalization)**p.researchComputeExponent*Math.max(0,nonNegative(modifier))}

/** Exact deterministic Data price for the requested one-based level. */
export function researchDataCost(baseDataCost,level){return Math.ceil(nonNegative(baseDataCost)*BALANCE.research.dataCostLevelGrowth**Math.max(0,Math.floor(level)-1))}
/** Exact fixed duration for the requested one-based level; only presentation may round it. */
export function researchDurationSeconds(baseSeconds,level){return Math.min(nonNegative(baseSeconds)*BALANCE.research.durationLevelGrowth**Math.max(0,Math.floor(level)-1),BALANCE.research.durationCapSeconds)}
/** Compatibility wrapper: historical callers supplied the zero-based current level. */
export function researchLevelCost(baseTierCost,currentLevel){return researchDataCost(baseTierCost,Math.floor(nonNegative(currentLevel))+1)}
/** Compatibility only. Research bonuses affect Data generation, never fixed project duration. */
export function boundedResearchSpeed(){return 1}

/** Pre-Phase-2D live compatibility. Bounded scaling remains AUDIT_ONLY. */
export function patentLevelMultiplier(level){return 1+.5*Math.max(0,nonNegative(level)-1)}

/** PROPOSED_FUTURE_FORMULA — audit only; never used by runtime. */
export function proposedBoundedPatentLevelMultiplier(level){const x=Math.max(0,nonNegative(level)-1);return 1+x/(3+x)}

/** Spend stored RP on Patent progress exactly once. */
export function spendResearchOnPatent(points,progress,requirement){const available=nonNegative(points),remaining=Math.max(0,nonNegative(requirement)-nonNegative(progress)),spent=Math.min(available,remaining);return{spent,points:available-spent,progress:nonNegative(progress)+spent}}
