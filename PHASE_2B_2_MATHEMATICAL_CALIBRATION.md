# Phase 2B.2 — Mathematical Core Economy Calibration

## Executive decision

Phase 2B.2 replaces hand-shaped early-run behavior with a progression-stage (`P`) calibration axis. `P` is **analysis only**: approximately `max(ModelLevel / 25, highestHardwareTier, 2 × ModelTier)`. Runtime formulas never read `P` or the player's expected state. At increasing `P`, expected Compute, static Training requirements, Model power, Demand, Revenue, and Hardware affordability can therefore be compared without creating feedback loops.

The runtime source of truth is `ProgressionSystem.js` for Training, Model, and Hardware primitives; `MarketSystem.js` for skill-market and user-response primitives; and `GameSystem.js` only for composition with actual state. Research, Patent, Development Cycle, INT, Technology, Breakthrough, Offline architecture, monetization, and Gems mathematics were not recalibrated.

## Training

**OLD FORMULA.** Eleven hand-authored log-interpolated expected-rate anchors multiplied by `45 + 34√L + tierTransition[T]`.

**NEW FORMULA.** `ExpectedTrainingRate(T,L) = 0.5 × 1.67^(L−1) × 32^T`; `TargetDuration(T,L) = 28 + 2L^0.72 + transition[T]`; `Requirement(T,L) = ExpectedTrainingRate × TargetDuration`. Actual ETA remains `Requirement / ActualTrainingRate`. The level ratio is approximately 1.67 (slightly higher because duration grows), inside the 1.45–1.90 corridor through L500. Hardware, allocation, Efficiency, and modifiers affect actual rate, never Requirement.

**WHY.** Expected Hardware growth is exponential. The prior anchors slowed radically after L25 and allowed live Compute to win permanently. A single exponential reference curve restores walls and makes a Hardware spike genuine relief.

**PARAMETERS / CLASSIFICATION.** `expectedRateBase`, `expectedRateLevelGrowth`, `durationBaseSeconds`, `durationLevelCoefficient`, and `durationLevelPower` are `TUNABLE_PARAMETER`; the nine tier transitions are `CONTENT_ANCHOR`; `referenceRateByTier = 32^T` is a `DERIVED_PARAMETER`.

**EARLY-GAME SENSITIVITY.** The base moves every ETA proportionally; level growth is the primary knob when L10–L30 is too fast or slow. **LATE-GAME SENSITIVITY.** A 10% level-growth change compounds strongly, so it must be adjusted in small increments. **CROSS-SYSTEM DEPENDENCIES.** Expected rate is calibrated against Hardware but has no runtime Hardware dependency. **HUMAN TARGET.** At representative observed rates, L10 is about one minute and L20 about 107 seconds. **SIMULATION RESULT.** Requirements are finite and monotonic through L500; representative Hardware acquisitions produce reported sawteeth in `TRAINING_SAWTOOTH_ANALYSIS.json`.

## Model Level

**OLD FORMULA.** `1 + 0.16L^0.62`. **NEW FORMULA.** `1 + 0.8L^0.72`.

Candidate pairs `(a,b)` considered were `(0.65,0.78)`, `(0.8,0.72)`, and `(1.0,0.65)`. The selected middle pair gives powers 1.8, 5.20, 7.92, 14.38, and 23.03 at L1/L10/L20/L50/L100. It is stronger early, remains concave, and grows far more slowly than the accelerating Model Tier curve.

`levelCoefficient` and `levelPower` are `TUNABLE_PARAMETER`. Early sensitivity is mostly coefficient-driven; late sensitivity is exponent-driven. Its only direct core dependency is Potential Demand. The human target is that each completion is economically visible; simulation shows the curve remains meaningful at L500 (71.20) without replacing tier progression.

## Model Tier

**OLD FORMULA.** `[1, 3.5, 12, 42, 160, 650, 2,800, 14,000, 80,000]`.

**NEW FORMULA.** `4.2^T × 1.08^(T(T−1)/2)`, yielding approximately `[1, 4.2, 19.05, 93.33, 493.79, 2,821.53, 17,412.14, 116,049.67, 835,332.69]`. `tierBase` and `tierAcceleration` are `TUNABLE_PARAMETER`; triangular exponent arithmetic is `DERIVED_PARAMETER`. Every transition exceeds an ordinary level step while retained level/skill investment still multiplies the new tier.

## Model skills

### Quality

**OLD FORMULAS.** Demand `1 + 0.18 ln(1+Q)`; Revenue/User `1 + 0.12√Q`; price tolerance `1 + 0.1√Q`.

**NEW FORMULAS.** Demand `1 + 0.5Q^0.5`; Revenue/User `1 + 0.38Q^0.48`; price tolerance is deliberately unchanged. Coefficients and powers are `TUNABLE_PARAMETER`. Both changed curves are increasing and concave. Quality retains exactly its authorized Demand, Revenue/User, and tolerance responsibilities.

### Efficiency

**OLD FORMULA.** `1 + 0.20√E`. **NEW FORMULA.** `1 + 0.42E^0.5`. Coefficient and power are `TUNABLE_PARAMETER`. It applies only to Training throughput and Inference Capacity. Equivalent power evaluates their combined impact, rather than injecting Efficiency into Demand.

### Popularity

**OLD FORMULA.** `1 + 0.3√P + 0.08ln(1+P)`. **NEW FORMULA.** `1 + 0.58P^0.5`. Coefficient and power are `TUNABLE_PARAMETER`. Popularity creates Potential Demand and a bounded response-speed bonus only; it creates neither Capacity nor user-derived word of mouth.

For all three skills, exact levels 0/1/2/5/10/20/50/100, next-point marginal changes, domain effects, and Equivalent Power appear in `MODEL_SKILL_POWER_ANALYSIS.json`. The early coefficient is the one-knob response if points feel weak; exponents control late retention. No curve is linear.

## Users and market

**OLD FORMULA.** `CurrentUsers = PotentialDemand` every tick (the older 30–180 second acquisition/churn system was already inactive).

**NEW FORMULA.** `U(t+dt) = Target + (U(t)−Target)exp(−kdt)`, where `Target = PotentialDemand`, `k = −ln(0.05)/response95`, base `response95 = 4s`, and effective response95 is `max(1.25, 4 / (1 + 2.2P/(20+P)))`. The base, minimum, maximum speed bonus, and half-saturation are `TUNABLE_PARAMETER`. The same rule handles growth and decline without overshoot. Marketing does not affect response speed.

Potential Demand keeps its factorized canonical structure and still excludes Capacity and Current Users. Model Level, Model Tier, stronger Quality, and stronger Popularity now carry escalation; no flat Demand ×5 was added. Revenue/User base remains **unchanged** at 0.24. Revenue remains exactly `min(CurrentUsers, Capacity) × RevenuePerUser`, avoiding a simultaneous base-revenue explosion. Major revenue log10 contributions are therefore `log10(served users) + log10(0.24) + log10(quality revenue) + log10(price) + log10(authored modifiers)`.

## Hardware relevance

Costs and within-tier geometric purchasing remain canonical and unchanged. Local output milestones changed from a weak +10% plus global Demand/Revenue bonuses into local production multipliers: cumulative ×1.35 at 10, ×2.10 at 50, and ×3.60 at 100. The 25-owned local procurement discount remains authored. This avoids uncontrolled all-output multipliers and lets mature old tiers compete with a new base tier. Transition ROI diagnostics are in `HARDWARE_RELEVANCE_ANALYSIS.json`; costs remain content anchors audited against `ExpectedRevenue(P) × TargetSavingTime` rather than becoming a live revenue-dependent formula.

## Simulation, endgame, and sensitivity

`PHASE_2B_2_SIMULATION.json` contains all eight required strategies and 1/3/5/10/15/20/30/45/60/75/90/120-minute checkpoints. It is a deterministic mathematical projection, not a claim about human play. It also reports L500/all-nine-model-tier and all-sixteen-Hardware-tier coverage. Values remain far below `Number.MAX_VALUE`; Decimal-style arithmetic is not yet necessary, though future content beyond roughly log10 300 must migrate.

Primary knobs are: Training slope → `expectedRateLevelGrowth`; user acquisition speed → `userResponse95Seconds`; Hardware unlock speed → tier cost anchors; point strength → the relevant Quality/Efficiency/Popularity coefficient. The sensitivity grid is −25%, −10%, baseline, +10%, +25%; because the simulator remains diagnostic, first Development Cycle eligibility is reported only when the unchanged canonical requirements are actually reached. The 60–90 minute target remains plausible but requires a fresh human validation run; the projection must not be treated as game-feel truth.

## Parameter discipline and governance

The recalibration removes eleven Training level anchors and the two obsolete acquisition/churn families, replacing them with five high-leverage Training curve parameters and four bounded user-response parameters. In the changed core scope, numeric entries fall from 44 to 35 (arrays count each authored entry); newly introduced entries are classified above. No `LEGACY_MAGIC_NUMBER` was introduced. Remaining `AUDIT_ONLY` areas are authored Hardware affordability anchors, full-run strategy fidelity, large-number first-hit timing beyond 120 minutes, and human 60–90 minute Development Cycle validation.

## Telemetry

The runtime recorder is initialized outside Developer Mode, observes every canonical state transition, and retains snapshot inference only as validation/recovery. Phase 2B.2 preserves existing canonical action emission for Hardware purchases/upgrades/milestones, Training start/completion, Model skill/unlock/deploy, allocation/price/Marketing, Objectives/Missions/rewards, Patents, Research, and Development Cycles. Existing health analysis exposes failed invariants rather than silently returning an empty healthy report. The original empty-export root cause—recording gated behind Developer Mode—remains repaired in `Application.js`; the regression suite exercises live exports and action reconciliation.
