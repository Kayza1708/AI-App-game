# Phase 2B.1 / 2D Mathematical Compliance Audit

## Correction
The prior implementation replaced the locked Research curve while trying to fit an inferred 1 RP/s unlock pacing anchor. That calibration decision was outside authorization. The live formula is restored to `4 × (ResearchCompute/1000)^0.72 × ResearchModifiers`; resulting pacing is observed, not compensated.

The bounded Patent level proposal is rolled back from runtime. Live behavior is again `1 + 0.5(level-1)`. The bounded alternative is retained only as `PROPOSED_FUTURE_FORMULA` in the registry and simulation comparison.

## Research cost audit
All six projects constructed from `UPGRADES` entries whose category is `research` now use `BaseTierCost × (1 + 0.55 × level)^1.7`. `project.researchCost` is the authored BaseTierCost. These explicit values preserve project identity and are classified CONTENT_ANCHOR. No separate per-level legacy exponential remains. `BALANCE.research.upgradeBaseCost` and `upgradeFamilyGrowth` are unrelated legacy/config values not used by `researchProjectCost`; they are classified LEGACY_MAGIC_NUMBER pending content audit.

## Full economy compliance
| System | Formula | Status | Classification | Canonical source | Runtime canonical? | Simulator canonical? | UI canonical? | Offline canonical? | Magic numbers? | Action |
|---|---|---|---|---|---:|---:|---:|---:|---:|---|
| Hardware | tier production and geometric cost | Current | DERIVED/CONTENT | Progression/GameSystem | Yes | Yes | Yes | Yes | Yes | Audit only |
| Compute/allocation | total then conserved allocation | Current | LOCKED boundary | Progression/GameSystem | Yes | Yes | Yes | Yes | No | None |
| Training/Models | static requirement and explicit scales | Accepted | DERIVED/TUNABLE | ProgressionSystem | Yes | Yes | Yes | Yes | Yes | Human test |
| Market/Users | Demand; Users=Demand | Accepted | LOCKED boundary | MarketSystem | Yes | Yes | Yes | Yes | Yes | None |
| Capacity/Revenue | min constraint; served×RPU | Accepted | LOCKED identity | MarketSystem | Yes | Yes | Yes | Yes | Yes | None |
| Research Compute/RP | `4(RC/1000)^.72` | Restored | LOCKED | ResearchEconomySystem | Yes | Yes | Yes | Yes | No | Observe pacing |
| Research costs | `BaseTierCost(1+.55L)^1.7` | Migrated | LOCKED + CONTENT | ResearchEconomySystem | Yes | Yes | Yes | Yes | anchors | Audit anchors |
| Research speed/Labs | bounded duration; parallel slots | Current | TUNABLE/LOCKED boundary | ResearchEconomy/ResearchSystem | Yes | Yes | Yes | Yes | Yes | Human test |
| Patent progress | spend RP once | Accepted | LOCKED boundary | ResearchEconomySystem | Yes | Yes | Yes | Yes | No | None |
| Patent discovery | geometric authored requirements | Current | TUNABLE | GameSystem | Yes | Yes | Yes | Yes | Yes | Human test |
| Patent levels/synergies | legacy linear / authored caps | Rolled back | AUDIT_ONLY | GameSystem | Yes | Yes | Yes | Yes | Yes | Future decision |
| Offline | canonical tick chunks | Current | LOCKED boundary | OfflineProgressSystem | Yes | Yes | N/A | Yes | Yes | None |
| Tapping | authored contribution | Current | AUDIT_ONLY | GameSystem | Yes | Yes | Yes | Yes | Yes | Future audit |
| Prestige/INT/Tech | existing Phase 2C implementation | Unchanged | AUDIT_ONLY here | Prestige/Technology | Yes | Yes | Yes | Yes | Yes | Separate review |
| Breakthroughs | existing authored behavior | Unchanged | AUDIT_ONLY | GameSystem | Yes | Yes | Yes | Yes | Yes | Future phase |

## Consequences
At 60,000 Research Compute/s, the restored formula produces approximately 76.2 RP/s instead of 1 RP/s. The unchanged first Patent requirement of 1,500 RP therefore takes about 19.7 seconds at that reference throughput, far below the prior 20–40 minute target. Research affordability similarly accelerates sharply. This is a reported specification consequence; no compensating Patent requirement, project anchor, duration, or Research coefficient was changed.

## Remaining audit-only scope
Patent level scaling and synergies, tapping, final Research content anchors, Development Cycles, INT, Technology, and Breakthroughs remain AUDIT_ONLY. No Phase 2C balancing was performed.
# Phase 2B.2 supersession note

The Training, Model power, Model skills, instant-user, and Hardware milestone findings in this audit are historical as of Phase 2B.2. Their replacement formulas and classifications are documented in `PHASE_2B_2_MATHEMATICAL_CALIBRATION.md`; Research, Patent, Development Cycle, INT, Technology, and Breakthrough findings remain unchanged.
