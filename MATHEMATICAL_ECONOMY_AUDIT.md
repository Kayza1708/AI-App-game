# Mathematical Economy Audit — Phase 1

> Analysis only. No live economy, save, or player-facing behavior is changed by this audit.

## Executive diagnosis

The live economy is not governed by a single causal model. `GameSystem` is the main authority, but it exposes calculations that disagree with the state transition actually applied by `tickGame`. The most serious architectural defect is the V2 Market term `capacityDemand = capacity × reachRatio × ...`: Inference allocation raises Capacity, Capacity raises Demand, and Demand raises Users and Revenue. This creates the forbidden automatic loop Capacity → Demand → Revenue → Hardware → Capacity.

The first-run pacing problem is therefore not merely a coefficient problem. Before V2, Demand lagged behind rapidly growing Capacity. V2 repaired the symptom by making Capacity manufacture Demand, violating causal independence and risking runaway growth. Phase 2 should first split `potentialDemand`, `capacity`, `userFlow`, and `servedUsers` into pure helpers and then calibrate them.

## Current canonical formulas and constants

| Domain | Current live expression | Principal constants |
|---|---|---|
| Hardware next cost | `ceil(B_i × 1.18^n × (1-discount))` | global `g=1.18`, discount cap 42% |
| Bulk cost | Iterated sum of effective next-unit costs | same global growth |
| Hardware output | `P_i n_i × tier/run bonuses × global bonuses` | 16 explicit cost/production anchors |
| Compute/s | `Σ rawHardwareContribution_i × globalHardwareMultiplier` | catalog anchors |
| Training/s | `Compute/s × allocation_training × trainingMultiplier` | anchored requirement interpolation |
| Capacity | `Compute/s × allocation_inference × modelEfficiency × 1.7 × modifiers` | capacity scale 1.7 |
| Organic Demand | market anchor × appeal × 0.075 × Marketing × Rep × Adoption × Price | tier market growth 1.88 |
| V2 capacity Demand | `Capacity × reachRatio × Rep × Adoption × Price` | reach contains tier, Marketing, Popularity, Quality |
| Served Users | `min(CurrentUsers, Demand, Capacity)` | none |
| RPU | `0.24 × price × (1 + linear INT×0.10) × revenue modifiers` | 0.24, 10% per lifetime INT |
| User metric | convergence + square-root momentum, capped at 20% gap/s | base convergence 0.025/s |
| User tick | minimum step or `abs(target-users)×0.025×dt` | does not use metric momentum |
| RP/s | allocated Research Compute × additive Research modifiers | no Compute compression |
| Research cost | base × `2.6^level` | unrestricted repeatable exponential |
| Research duration | base duration / Research Speed | 120–3600 seconds authored |
| Patent requirement | `120 × 1.62^index × 1.35^floor(index/10)` | exponential |
| INT reward | run Compute log term + run Credit log term + milestones | Credits are a primary reward input |
| Passive INT income | `1 + 0.10 × lifetime INT` | unbounded linear |
| Offline | `min(absence, cap) × efficiency`, replayed through tick | 2h base, 8h max, 60% base |

Current central parameters are in `src/config/balance.js`; tier anchors, Model data, milestones, upgrades and Patent data are in `src/data/defaultState.js`.

## Duplicated or inconsistent calculations

1. **User acquisition:** `marketMetrics` reports convergence plus momentum, while `tickGame` ignores that value and applies a separate convergence step. At the R2 audit state (Users 218k, target about 489k), the reported formula is about 7,050 Users/s; the tick formula is about 6,768 Users/s before its minimum-step rule. The difference grows with Popularity and Marketing because only the reported formula includes momentum.
2. **Revenue:** `marketMetrics.revenue` uses Served Users, while `tickGame` credits the post-convergence `users` balance directly. If Users exceed Capacity or Demand, tick income can exceed the reported canonical income.
3. **Training:** `trainingRatePerSecond` includes `trainingMultiplier`, while `tickGame` reconstructs raw Training Compute then reapplies the multiplier. This is consistent today but duplicates the path.
4. **Research:** Patent Research and ordinary RP generation both consume the same Research allocation in the same tick. Allocated Research Compute therefore advances two permanent systems simultaneously without an explicit split or conversion budget.
5. **Modifier interpretation:** `strategicBonus`, `upgradeBonus`, `milestoneBonus`, `modifierValue`, Model identities, and bespoke Patent branches overlap. The same conceptual source can appear in several multiplicative layers.

## Causal graph and cycles

### Current forbidden direct loop

`Inference allocation → Capacity → capacityDemand → Demand → target Users → Revenue → Hardware → Compute → Capacity`.

The exact edge is the capacity-linked `capacityDemand` term in `marketMetrics`. Holding all market fundamentals constant and changing Inference allocation changes live Demand. This violates the requested hard invariant.

### Current mediated/acceptable loop

`Revenue → player purchase → Hardware → Compute → player Training allocation → Model improvement → Demand → Revenue`.

Player action and spending mediate this loop, so it is a progression loop rather than an instantaneous algebraic feedback loop.

### Proposed WOM loop

`Users → bounded WOM → Potential Demand → user convergence → Users`. With the candidate saturating WOM, `WOM ≤ 2.5` and `dDemand/dUsers` tends to zero. Local stability still requires `dDemand/dUsers < 1`; the generated report evaluates this at reference states.

## Exponentials and unbounded behavior

- Global Hardware `1.18^n` is appropriate in kind for run walls, but one growth factor is not justified across all 16 tier roles.
- Research repeat levels use `2.6^level`; level 10 is roughly 5,429× base cost and can be disconnected from RP throughput.
- Patent requirements grow as `1.62^index` with extra decadal `1.35` multipliers; this remains numerically safe for the present catalog but is structurally exponential meta scaling.
- Technology costs are curated using rapidly increasing rank multipliers rather than expected INT/run equivalents.
- Raw lifetime INT gives an unbounded linear Revenue multiplier and eventually dominates all other Revenue choices.
- Several Technology effects alter ordinary additive totals, but `techPower`, Patent power, item power, identities, and temporary boosts create multiple independent multiplier layers.

## Hardware audit

The 16 explicit base anchors are useful and should remain scale anchors. Direct production ratios already encode major era transitions, so fitting a single smooth curve would erase intended content rhythm. The candidate table retains explicit anchors but derives within-tier growth from desired purchase count and terminal unit-cost ratio.

Current 10/25/50/100 milestones mix tier-local output, global cost reduction, global Demand, and global Revenue. The 50/100 milestones become more valuable as the rest of the company grows, regardless of the old tier’s direct relevance. That can preserve old Hardware, but generic global Demand/Revenue on all 16 tiers encourages checklist ownership rather than distinct builds. Phase 2 should retain discrete spikes while converting selected milestones to bounded cross-system synergies.

## Training and Model audit

Training requirements use log interpolation between explicit anchors from 18 at Level 1 to `1e65` at Level 500. This is finite (`log10=65`) but duration is not derived from expected throughput. Any mismatch between Hardware anchors and Training anchors produces accidental dead zones.

The live Model level itself adds little direct power; most power comes from skill ranks and Model tier base stats. Candidate V1 separates explicit Model-tier scale from concave within-Model level scale and derives Training requirements from expected stage throughput × target duration.

## Market V2 root cause

Pre-V2 Market reach was too small relative to Server Rack Capacity. V2 attached reach directly to Capacity. This guarantees stronger utilization but makes Inference allocation create Potential Demand. The fix must not be another coefficient adjustment: Potential Demand must be recomputed solely from independent market fundamentals, including an infrastructure-reach **tier/state anchor that does not depend on allocation or Capacity**.

Price currently uses one power-law response on both sides of 1.0. Candidate V1 uses a continuous piecewise response: controlled linear discount demand below 1.0 and exponential premium decay divided by bounded Quality price tolerance above 1.0.

Reputation and Adoption are bounded in state, but Reputation’s mapping is only gently bounded and Adoption hits 100 quickly. Candidate V1 makes both explicit saturating factors with documented minima/maxima.

## INT and Technology audit

Live Development Cycle reward mixes Compute orders, Credit orders, Hardware, Model Level and Technologies. Credits are both a result of the economy and a prestige input, which amplifies Market balance errors into permanent progression. The recommended model is cumulative lifetime Compute entitlement minus already-entitled INT. Lifetime Compute is preferred over highest run Compute because it is monotonic, persists cleanly, and cannot be repeatedly farmed at the same magnitude.

Candidate entitlement anchors are 1 INT at `4e8` qualifying Compute and 16 INT at `4e12`. These derive `alpha = ln(16)/ln(10,000) = 0.30103` and `C0 = 4e8`. Eligibility remains a separate proof-of-progression gate.

Technology should be priced in expected-run equivalents, not an isolated rank sequence. Current nodes also lack an explicit algebraic mode, so ordinary bonuses and transformations are indistinguishable in data.

## Research audit

Live RP generation is linear in allocated Compute. Stellar Compute would trivialize all RP costs unless costs become similarly astronomical, reproducing multiplier escalation. Candidate conversion uses tier-relative concave power `4 × (allocatedCompute/1000)^0.72`. This number is derived to yield 4 RP/s at 1,000 allocated Compute/s and compress each 10× Compute increase to about 5.25× RP/s.

Repeatable Research cost `base × 2.6^level` is replaced in the proposal by `baseTierCost × (1+0.55 level)^1.7`; duration remains a separate real-time gate. Research Speed’s current Datacenter and Model-Level contributions are capped/stepwise but can stack with Technology and Patent totals. Candidate permanent Research Speed saturates at +150%.

## Patent and modifier audit

Patents are split between ordinary `effect/value` entries and bespoke ID checks. This makes dominant-term behavior hard to inspect. Every Patent should declare ADD, BOUNDED, TRANSFORM or KEYSTONE mode and an explicit cap when ownership-driven. Ordinary Patent target Equivalent Power is 1.05–1.25; Keystone target is 1.20–1.60 at its intended state.

Proposed layer order: `Base × RunAdd × PermanentAdd × Bounded × Keystone × Temporary`. Ordinary effects add within their group. Only explicitly classified Keystones and temporary boosts multiply as separate layers.

## Numerical range and Number safety

The live Level-500 Training requirement is `1e65`, safely below the `log10=100` review threshold. Current Hardware base production reaches roughly `2.2e21` and cost roughly `2.8e30`, also safe in isolation. Ownership exponentials can exceed these ranges at extreme counts: `1.18^n` reaches `log10≈300` near 4,177 owned units in one tier. Current UI/catalog milestones stop at 100, but there is no hard ownership bound.

Candidate reference states remain below `log10=100`. Native Number is sufficient for Phase 2 and the currently planned named content, but a numeric abstraction should be scheduled before content targets routinely exceed `1e100`, and is mandatory before `1e250`–`1e300` values become reachable.

## Mission reward boundary violations

The current Mission catalog creates rewards containing Credits in addition to Gems. Weekly and Monthly tracks also include non-Gem resource rewards. That violates the proposed Gem-only rotating Mission boundary. This audit flags the issue but does not alter Missions.

## Offline determinism

Offline progress replays `tickGame` in chunks. Results can vary with chunk size because user convergence uses a discrete step, Training completes at most once per tick, world events use wall-clock timestamps, and Research/Patent completions have tick-boundary behavior. Candidate continuous convergence has an exact exponential step and should be used online and offline.

## Telemetry risks for mathematical validation

Telemetry samples report `economySnapshot`, while actual state transitions can differ in user acquisition and Revenue as described above. Consequently, exported rate diagnostics may not reconstruct the Credits actually awarded. Phase 2 should instrument pure formula outputs and state deltas from the same transition result.

## Immediate Phase-2 prerequisites

1. Introduce pure `potentialDemand`, `inferenceCapacity`, `userFlow`, `servedUsers`, and `revenueRate` helpers.
2. Remove Capacity from Potential Demand before any coefficient calibration.
3. Make `tickGame` consume those helpers exactly once.
4. Introduce modifier modes and grouped evaluation.
5. Add mathematical invariant tests before migrating content parameters.
