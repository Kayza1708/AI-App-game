# Phase 2B — Compute, Hardware, Training & Model Progression

## 1. Implementation summary

Phase 2B makes per-tier Hardware anchors, canonical Compute allocation, static-reference Training requirements, concave Model levels, explicit Model tier scales, and distinct Quality/Efficiency/Popularity dependencies live. Market V3 remains the sole Market kernel: Inference changes Capacity only and never Potential Demand. Final INT, Research, Patents, Missions, Gems, and monetization are unchanged.

## 2. Files changed

- `src/config/balance.js`: derived Hardware, Training, Model parameters.
- `src/data/defaultState.js`: per-tier Hardware growth metadata.
- `src/systems/ProgressionSystem.js`: pure progression mathematics.
- `src/systems/GameSystem.js`: canonical live integration and bounded tick integration.
- `src/dev/telemetry-sampler.js`: reconstructable progression fields.
- `scripts/phase-2b-simulator.mjs`: canonical deterministic state-transition policies.
- `test/phase-2b.test.js`: focused invariants.
- `PHASE_2B_SIMULATION.json`: machine-readable checkpoints.

## 3. Exact live formulas

- `UnitCost_i(n) = ceil(B_i × g_i^n)`.
- `BulkBaseCost_i(n,k) = B_i × g_i^n × (g_i^k−1)/(g_i−1)`; live discounted purchases sum canonical rounded unit quotes because discounts can change at quantity milestones.
- `g_i = TargetFinalCostRatio_i^(1/TargetPurchaseCount_i)`.
- `TotalCompute = Σ(baseProduction_i × owned_i × localAdd_i) × globalAddGroup`.
- `AllocatedCompute = TotalCompute × clamp(allocation,0,100)/100`.
- `LevelFactor(L) = 1 + 0.16L^0.62`.
- `TierScale(T) = [1,3.5,12,42,160,650,2800,14000,80000]_T`.
- `TargetDuration(T,L) = 45 + 34√L + transition[T]` seconds.
- `ReferenceRate(T,L) = referenceRate[T] × L²`, where reference rates are `[0.25,8,240,7200,220000,7e6,2.4e8,1e10,5e11]` Compute/s.
- `TrainingRequirement(T,L) = ReferenceRate(T,L) × TargetDuration(T,L)`. The requirement has no state/modifier input.
- `Efficiency(E) = 1 + 0.20√E`.
- `ActualTrainingRate = AllocatedTrainingCompute × Efficiency × (1 + Σ training additions)`. Ordinary additions share one group.
- `InferenceCapacity = AllocatedInferenceCompute × Efficiency × InferenceModifierGroup`.
- `QualityRevenue(Q) = 1 + 0.12√Q`; Market V3 separately owns Quality Demand and price tolerance.
- Ticks larger than 10 seconds are deterministically integrated as canonical 10-second substeps to prevent endpoint-Revenue divergence.

The duration coefficients preserve the Phase-1 explicit anchors: 79 seconds at L1 and roughly 805 seconds at L500 before tier-transition walls. `L²` is a static reference-throughput approximation, not the player's rate; therefore every real throughput improvement shortens ETA.

## 4. Hardware table

| Hardware | Base cost | Base Compute/s | Target units | Final/base | Derived growth |
|---|---:|---:|---:|---:|---:|
| Calculator | 2.000e1 | 5.000e-1 | 30 | 48× | 1.137736 |
| Pocket Computer | 3.600e2 | 2.200e0 | 30 | 48× | 1.137736 |
| Laptop | 1.700e3 | 1.300e1 | 28 | 42× | 1.142808 |
| Gaming PC | 6.500e3 | 1.100e2 | 25 | 36× | 1.154123 |
| Workstation | 4.500e4 | 1.350e3 | 25 | 36× | 1.154123 |
| Server Rack | 1.400e6 | 2.200e4 | 22 | 32× | 1.170620 |
| GPU Cluster | 7.000e7 | 5.000e5 | 22 | 32× | 1.170620 |
| Datacenter | 3.200e10 | 1.400e7 | 20 | 28× | 1.181294 |
| Hyperscale Center | 2.200e12 | 4.800e8 | 20 | 28× | 1.181294 |
| Orbital Datacenter | 1.800e14 | 2.000e10 | 18 | 24× | 1.193104 |
| Moon Compute Facility | 1.700e16 | 9.500e11 | 18 | 24× | 1.193104 |
| Mars Compute Grid | 2.000e18 | 5.500e13 | 16 | 20× | 1.205909 |
| Fusion Compute Network | 2.800e20 | 3.800e15 | 16 | 20× | 1.205909 |
| Dyson Compute Array | 5.000e22 | 3.000e17 | 15 | 18× | 1.212509 |
| Matrioshka Brain | 1.200e25 | 3.000e19 | 15 | 18× | 1.212509 |
| Singularity Core | 3.200e28 | 3.600e21 | 12 | 15× | 1.253163 |

The purchase counts and final/base ratios are design constraints from Phase 1; growth is derived rather than selected independently. Scale anchors deliberately jump between infrastructure eras.

## 5. Hardware ROI and milestone audit

| Checkpoint | Capacity-constrained value | Demand-constrained value | Best observed simulator purchase |
|---|---|---|---|
| Personal | Additional Compute immediately raises served users | Compute primarily reduces Training ETA | newest affordable or Calculator milestone |
| Professional | Inference and Training both produce value | Training is the primary marginal value | Gaming PC / Workstation |
| Server Rack | extra Inference is valuable near balance | extra Capacity has zero immediate Revenue ROI | Server Rack |
| GPU Cluster+ | evaluated by the same counterfactual snapshot | Training/Research opportunity value remains | requires post-prestige human data |

Machine-readable marginal production/cost at ownership 1/10/25/50/100 is derivable from the Hardware table and tested finite. Revenue payback is state-dependent by design; no fake Revenue value is assigned when Demand binds. Existing 10/25/50/100 milestones remain compatible. Their additive aggregation can still cascade across 16 fleets (especially Demand, Revenue, and discount milestones), so the broad milestone redesign remains deferred and is a documented late-game dominance risk.

## 6. Model Tier table

| Model | Tier scale | Tier transition wall | Derivation anchor |
|---|---:|---:|---|
| TinyChat | 1 | 0s | first-run baseline |
| SmartChat | 3.5 | 60s | personal-to-developer transition |
| GPT-Class | 12 | 180s | professional Compute scale |
| Omni | 42 | 420s | broad-market transition |
| Research | 160 | 900s | early meta horizon |
| Agent | 650 | 1,800s | automation horizon |
| Enterprise | 2,800 | 3,600s | mature datacenter horizon |
| AGI | 14,000 | 7,200s | explicit long-term spike |
| ASI Seed | 80,000 | 14,400s | post-human scale anchor |

These Phase-1 scales are ratios anchored to expected infrastructure eras and Demand-scale transitions, not a single extrapolated exponential. Unlock conditions remain the existing Technology prerequisites; Phase 2B does not change Tech affordability.

## 7. Model Level table

| Level | factor | marginal factor | prior-level % | target duration |
|---:|---:|---:|---:|---:|
| 1 | 1.1600 | — | — | 79s |
| 5 | 1.4340 | 0.0561 | 4.07% | 121s |
| 10 | 1.6670 | 0.0422 | 2.60% | 153s |
| 20 | 2.0251 | 0.0321 | 1.61% | 197s |
| 50 | 2.8092 | 0.0225 | 0.81% | 285s |
| 100 | 3.7805 | 0.0173 | 0.46% | 385s |
| 250 | 5.9073 | 0.0122 | 0.21% | 583s |
| 500 | 8.5419 | 0.0094 | 0.11% | 805s |

The concave marginal percentage prevents levels from replacing Model tiers. Level affects Potential Demand only after a completed Training; it does not directly alter Revenue/User or the requirement's static reference law.

## 8. Skill dependency map

- **Quality →** Market V3 Quality Demand, Quality price tolerance, and `1+0.12√Q` Revenue/User. It is no longer also a generic Training bonus.
- **Efficiency →** `1+0.20√E` applied once to Training throughput and once to Inference Capacity in their independent branches.
- **Popularity →** Market V3 Potential Demand and acquisition half-life. It does not alter Revenue/User or Compute.

## 9. Allocation invariants

Allocation helpers clamp every share to `[0,1]`. The existing setter preserves a 100% unlocked-category sum. Training allocation raises Training rate; Inference allocation raises Capacity. Neither changes Potential Demand in a fixed state. Training affects Demand only after a Model level actually completes.

## 10. Deterministic first-run simulation

The full 5/10/15/20/30/45/60/75/90/120-minute tables for all six policies are in `PHASE_2B_SIMULATION.json`. Key outcomes:

| Policy | first observed eligibility | event density/hour | longest measured event gap |
|---|---:|---:|---:|
| BALANCED | 75m | 60.5 | 2m |
| HARDWARE_HEAVY | 75m | 61.0 | 2m |
| TRAINING_HEAVY | 90m | 62.0 | 1m |
| MARKET_HEAVY | 90m | 56.5 | 3m |
| GREEDY_ROI | 75m | 59.0 | 3m |
| LOW_INTERACTION | 75m | 62.0 | 1m |

At 60 minutes, representative Compute ranges from 134K–314K/s and Revenue from 27.7K–30.0K/s. Detailed Model, Demand, Capacity, and allocation values remain in the generated artifact. These are engineering-policy results, not human predictions. LOW_INTERACTION currently looks unrealistically strong because one-minute automated decisions still claim every available objective and purchase efficiently; human play remains authoritative.

## 11. Event density, dead zones, and dominance

No modeled Hardware-tier/Model-level gap exceeds three minutes. This is denser than the 2–5-minute target because high Compute makes one Training complete per decision interval; it flags possible over-frequent late first-run levels. Hardware-heavy and greedy policies do not exceed balanced by a catastrophic margin, but all policies converge on Server Rack and fail to reach GPU Cluster by 120 minutes. The historical Server Rack → GPU Cluster dead zone therefore remains the principal human-play risk. The simulator does not justify changing GPU Cluster cost in this phase.

## 12. Market V3 regression

Tests prove identical Potential Demand at 10% and 90% Inference, Capacity monotonicity, Served User bounds, Revenue identity, WOM/reputation/adoption bounds, and the tenfold-Capacity V2 explosion regression. Phase 2B changes Model factors but introduces no Capacity, Inference, Served Users, or Revenue input into Potential Demand.

## 13. Timestep and offline results

Before bounded integration, a single 600-second endpoint-Revenue tick diverged by 20.9–28.6% from 600 one-second ticks, a blocker. The minimal correction makes every tick use at most 10-second canonical substeps. Ten-second versus one-second Credit divergence measured 0.44–0.61%, below the accepted 1% corridor. Offline simulation already calls `tickGame`; checks at 5 minutes, 30 minutes, and 2 hours remain finite and deterministic with no separate economy formula.

## 14. Telemetry

Periodic samples now explicitly include Hardware ownership, Training progress, requirement, rate and ETA, active Model Quality/Efficiency/Popularity, complete allocation, Market factor breakdown, Potential Demand, Users, Capacity, Served Users, Revenue/User, Revenue/s, and Development Cycle readiness. Existing playthrough/session export architecture is reused.

## 15. Tests and remaining risks

Focused tests cover derived growth, geometric bulk equality, Compute identity/conservation, static Training requirements, real ETA reduction, skill dependency maps, allocation/Market separation, L500 finiteness, offline determinism, bounded timestep divergence, and deterministic simulator reproduction. Existing Phase 2A regressions remain active.

Remaining risks: simulator decision quality is not human-like; tier reference rates need real unlock-time validation; Model unlocks remain Tech-bound; global Hardware milestones can form late multiplicative pressure; Server Rack → GPU Cluster may still be a dead zone; and final INT/Tech economics remain deliberately deferred.

## 16. Recommendation for Phase 2C

Run a clean no-cheat human playthrough to eligibility or 120 active minutes and export complete telemetry. Compare actual Training ETAs, Server Rack utilization, GPU Cluster ETA, event density, and allocation changes with `PHASE_2B_SIMULATION.json`. Phase 2C should then implement Compute entitlement and calibrate Tech affordability without changing Market causality or making Training requirements dynamic.
