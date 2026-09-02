# Phase 2C — Development Cycles, Intelligence & Technology Economy

## 1. Implementation summary and files

Phase 2C replaces Credit-sensitive, reset-farmable INT with cumulative Compute entitlement. INT is now only a claimable permanent currency: it has no passive Revenue multiplier. Technology costs use one controlled depth curve, INT-gain effects modify entitlement once, and Development Cycles expose canonical entitlement data while preserving permanent systems.

Changed: `src/config/balance.js`, `src/data/defaultState.js`, `src/data/technologyCatalog.js`, `src/systems/GameSystem.js`, `src/systems/PersistentSaveSystem.js`, `src/systems/PrestigeSystem.js`, `src/dev/telemetry-sampler.js`, `scripts/phase-2b-simulator.mjs`, `scripts/phase-2c-simulator.mjs`, tests, and generated `PHASE_2C_SIMULATION.json`.

## 2. Old prestige diagnosis

The old reward mixed run Compute, Credits, Hardware, Model level, breakthroughs, strategic bonuses, and then multiplied the result by Intelligence effects again during reset. It therefore allowed Market inflation to raise INT, could apply `intelligenceGain` twice, and had no cumulative claimed-entitlement ledger. Raw lifetime INT also passively raised Revenue, double-dipping with Technology purchases.

## 3. Candidate entitlement families

| Family | Early claims | Late behavior | Reset incentive | Decision |
|---|---|---|---|---|
| Single fractional power | A late-safe exponent makes Cycle 2 claims too sparse | excellent compression | long no-claim plateaus | rejected |
| `a·ln(1+C/C0)^b` | tunable | very compressed | difficult-to-read doubling | rejected |
| Piecewise fractional power | independently anchors early cadence and late safety | controlled | predictable early claims | chosen |
| Fractional power + milestones | good spikes | stable between spikes | encourages threshold-only resets | rejected |

## 4. Chosen entitlement equation and derivation

For qualifying Compute `C ≤ 10^14`:

`BaseEntitlement(C) = floor((C / 141,333,445.74961525)^0.72)`

For `C > 10^14`:

`BaseEntitlement(C) = floor(16,286.34528324655 × (C / 10^14)^0.09016844881840277)`

Then:

`TotalEntitlement = floor(BaseEntitlement × clamp(1 + intelligenceGain, 0, 2.5))`

`ClaimableINT = max(0, TotalEntitlement − LifetimeINTClaimed)`

The early scale is derived from the Phase-2B observed anchor `6.5×10^8 Compute → 3 INT` with the explicit early exponent `0.72`: `C0=C1/I1^(1/α)`. The pivot value is the continuous early equation at `10^14`. The late exponent is derived from the pivot and Number-safety anchor `10^300 Compute → 10^30 INT`: `αlate=ln(I2/Ipivot)/ln(C2/Cpivot)`. It is not selected for visual neatness.

At the live eligibility floor of `4×10^8` Compute, the first deterministic cycle claims **2 INT**, allowing a choice among Compute, Training, Hardware, Consumer, Efficiency, Market, and Model roots without unlocking an entire branch.

## 5. Qualifying Compute and eligibility

`LifetimeQualifyingCompute = max(statistics.totalComputeProduced, run.computeProduced)` for legacy/partial-state safety. Automatic, manual, boosted, and offline production count because all canonical paths increment the same statistic. Stored resources, telemetry, loaded-value reconciliation, and developer resource grants do not create qualifying Compute unless they explicitly mutate production statistics.

Eligibility classifications:

| Existing condition | Classification | Phase 2C treatment |
|---|---|---|
| Model level | progression/tutorial proof | retained |
| Hardware tier | progression proof | retained |
| Run Compute | anti-spam/new-run proof | retained |
| Run Credits | Market-dependent and redundant | informational only |
| Objectives | tutorial/engagement gate | retained; run Objectives reset each cycle |
| Claimable INT ≥ 1 | cumulative anti-farm gate | added |

Reward magnitude depends only on cumulative qualifying Compute and the single bounded prestige modifier—not Credits, price, Inference allocation, Hardware tier, or objective count.

## 6. Cycle 1/2/3 simulation

The simulator uses live GameSystem transitions, purchases, objectives, Training, Market V3, resets, and Technology purchases. It is an engineering instrument, not a human forecast.

| Strategy | Cycle 1 | Cycle 2 | Cycle 3 | C2/C1 | C3/C2 | First purchases |
|---|---:|---:|---:|---:|---:|---|
| Compute-first | 64m | 51m | 52m | 0.797 | 1.020 | Compute Theory, Parallel Kernels |
| Training-first | 64m | 62m | 63m | 0.969 | 1.016 | Gradient Optimization, then Checkpoint Compression |
| Market-first | 64m | 59m | 58m | 0.922 | 0.983 | Targeted Advertising, Brand Recognition |
| Greedy | 64m | 52m | 53m | 0.813 | 1.019 | Training + Compute, then Market |

Compute-first is fastest in Cycle 2 but is only `62/51 = 1.22×` faster than Training-first, below the 1.5× universal-dominance review threshold. Training-first specializes in Model progression rather than winning every output. Resetting run Objectives was necessary because permanent one-time Objective Credit subsidies otherwise made every second run slower despite Technology.

## 7. Reset-timing analysis

| Reset timing | Total time | Lifetime Compute | Claimable INT |
|---|---:|---:|---:|
| immediately eligible | 64m | 4.016e8 | 2 |
| +10m | 74m | 6.234e8 | 2 |
| +30m | 94m | 1.155e9 | 4 |
| +60m | 124m | 2.028e9 | 6 |

The +10-minute plateau favors immediate reset, while +30/+60 minutes buy additional choices. Because entitlement is cumulative, waiting is useful but does not allow repeated farming of the same scale. Human testing must decide whether the early floor steps need later coefficient tuning.

## 8. Technology affordability model and complete audit

Every node appears in `PHASE_2C_SIMULATION.json` with branch, depth, type, cost, effect, modifier mode, Equivalent Power, expected relevant INT, Run Cost Equivalent, and Power/Cost.

Canonical cost:

`TechCost = ceil(BranchBaseCost × (1 + 0.55(depth−1))^1.65 × TypeMultiplier)`

Type multipliers: minor `0.4`, ordinary/system `1`, model `1.5`, keystone `3`, era `5`. First-run specialization roots remain 1 INT. This maps explicit progression depth to controlled polynomial costs rather than retaining unexplained `10^18–10^55` overrides.

Representative costs:

| Branch | Root | early major | keystone | final node |
|---|---:|---:|---:|---:|
| Compute | 1 | 4 | 27 | 56 |
| Training | 1 | 7 | 54 | 67 |
| Market | 1 | 4 | 27 | 56 |
| Prestige | 4,000 | 34,015 | 265,628 | 332,924 |
| AGI | 1,000,000 | 3,401,433 | 26,562,739 | 55,487,219 |
| Singularity | 1,000,000,000 | 3,401,432,339 | 44,271,230,797 | 55,487,218,665 |

At `10^100` qualifying Compute entitlement is roughly `9.25×10^11`, making Singularity nodes expensive but mathematically reachable. The full audit records `ADD`, `MULTIPLY`, `TRANSFORM`, and `KEYSTONE` classification. Ordinary effects stay in existing additive groups; `allOutput` and keystones remain explicit layers. Endgame `allOutput +3/+4` nodes are flagged by their 4×/5× Equivalent Power in the machine audit rather than silently treated as ordinary bonuses.

Early root powers were calibrated to make a first 2-INT choice visible despite the loss of raw-INT passive Revenue: Compute Theory plus Parallel Kernels gives a 2.0× additive Hardware group, the first two Training nodes give 2.0× Training, and the Market pair combines Marketing and Demand specialization. These target an approximately 40–60-minute equivalent Cycle-2 corridor; observed results are 51–62 minutes.

## 9. INT-gain feedback and modifier depth

`intelligenceGain` is summed once by the existing strategic modifier algebra, bounded to 2.5×, and applied once to cumulative Base Entitlement. The reset no longer multiplies `cycleIntelligence()` a second time. Spending Current INT cannot change claimed entitlement. Raw INT returns exactly `1×` in the legacy income helper, so no unbounded or bounded passive Revenue double dip remains.

## 10. Development Cycle reset table

| Resource/System | Reset? | Reason |
|---|---|---|
| Credits, stored Compute, Users | yes | run economy |
| Hardware | yes | run progression |
| Model levels and skills | yes | run progression; unlocked identities remain |
| Marketing, Reputation, Adoption | yes | run Market state |
| Objectives | yes | repeatable run guidance and baseline Credit path |
| run statistics | yes | new anti-spam proof |
| lifetime statistics | no | canonical history/qualifying Compute |
| Research Points/completions | no | permanent meta progression |
| Patents/loadout | no | permanent build system |
| Technology | no | primary prestige power |
| Current/Lifetime/Claimed INT | no | permanent currency and ledger |
| Gems | no | premium/meta currency |
| Achievements | no | account progression |
| Missions | no | calendar progression |
| Items/Artifacts | no | permanent collections |

## 11. Save migration

Save version 23 adds `lifetimeIntClaimed`, `totalIntEntitlement`, and `lifetimeIntSpent`. Existing owned Technology is preserved. Old saves initialize claimed entitlement to the entitlement represented by their recorded lifetime Compute, preventing a migration windfall; inferred historic spending uses preserved owned-node and Patent investments. Current and lifetime INT remain non-negative and are not clawed back when new costs differ.

## 12. Telemetry and UX data

The canonical economy snapshot and periodic telemetry now expose Lifetime Qualifying Compute, total entitlement, already claimed entitlement, claimable INT, Current INT, lifetime INT spent, eligibility, eligibility timestamp, estimated reward, and unmet requirements. Technology purchase events continue to carry node and cost data; cycle history now records run Compute, lifetime qualifying Compute, entitlement, and awarded INT.

## 13. Sensitivity and Number safety

The machine-readable sensitivity table spans `10^6` through `10^300`. Entitlement is finite and monotonic throughout; representative results are `21` at `10^10`, `591` at `10^12`, `16,286` at the `10^14` pivot, `3.60×10^6` at `10^40`, `9.25×10^11` at `10^100`, `9.62×10^20` at `10^200`, and `10^30` at `10^300`. Log-space evaluation avoids overflow in the entitlement calculation. JavaScript Number remains adequate for the modeled range, though values beyond the `10^300` design boundary require a future numeric abstraction.

## 14. Tests, risks, and Phase 2D recommendation

Tests cover monotonic entitlement, non-negative claims, reset-spam prevention, Current-vs-Lifetime INT spending, Credit and Inference independence, one-time INT-gain application, removal of raw passive INT Revenue, permanent reset preservation, save migration, and deterministic cycle simulation. Phase 2A/2B suites remain unchanged except obsolete prestige expectations.

Open risks: early floor steps create a no-benefit +10-minute wait; Training-first acceleration is modest; Objective reset enables repeatable Credit rewards by design and needs human pacing validation; `allOutput` endgame keystones remain deep multiplier layers; later reference Compute anchors are modeled rather than played; and the simulator's automatic Objective claiming remains more efficient than a human.

Phase 2D should migrate Research and Patent resource mathematics without changing this entitlement ledger. Before coefficient changes, run a clean human three-cycle telemetry playthrough and compare cycle times, reset decisions, INT claims, Technology choices, and major Hardware/Model unlock timing against `PHASE_2C_SIMULATION.json`.
