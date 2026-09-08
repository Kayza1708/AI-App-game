# Economy Formula Registry

Statuses: **LOCKED** is specification-controlled, **DERIVED** is calculated from anchors, **TUNABLE** is intentionally balance-adjustable, and **AUDIT_ONLY** is not authorized for redesign.

| System | Canonical formula / behavior | Status | Canonical source |
|---|---|---|---|
| Hardware cost | `BaseCost × Growth^owned` | DERIVED | `ProgressionSystem.hardwareUnitCost` |
| Hardware bulk cost | geometric-series closed form | DERIVED | `ProgressionSystem.hardwareBulkBaseCost` |
| Hardware production | sum of owned tier production through grouped modifiers | TUNABLE | `GameSystem.computePerSecond` |
| Compute | canonical Hardware contribution sum | LOCKED boundary | `GameSystem.computePerSecond` |
| Compute allocation | `TotalCompute × allocation/100`; total allocation ≤100% | LOCKED boundary | `ProgressionSystem.allocatedCompute` |
| Training requirement | `StaticReferenceRate × TargetDuration` | LOCKED boundary / DERIVED anchors | `ProgressionSystem.trainingRequirement` |
| Training throughput | Total Hardware Compute × fixed Training share × Training modifiers | TUNABLE | `GameSystem.trainingRatePerSecond` |
| Model Training | static Compute Requirement; awards a Quality/Efficiency point | LOCKED boundary | `GameSystem`, `ProgressionSystem` |
| Quality | concave Revenue/User multiplier | TUNABLE | `ProgressionSystem.qualityRevenueFactor` |
| Efficiency | concave capacity multiplier; lowers Compute/User | TUNABLE | `ProgressionSystem.efficiencyFactor` |
| User Capacity | Hardware Compute × Efficiency × capacity modifiers | LOCKED boundary | `MarketSystem.inferenceCapacity` |
| Users | `Users = Capacity` (fully utilized) | LOCKED | `MarketSystem.marketSnapshot` |
| Compute/User | Hardware Compute divided by User Capacity | DERIVED | `MarketSystem.inferenceCapacity` |
| Research production | total Hardware Compute → RP/s, no allocation | LOCKED boundary | `GameSystem.researchPerSecond` |
| Patents | discovered with RP; every discovered Patent permanently active | LOCKED boundary | `GameSystem`, `ResearchEconomySystem` |
| Patent levels | improved with INT | AUDIT_ONLY legacy | `GameSystem.upgradePatent` |
| Manual Compute | Optimize clicks add stored Compute | TUNABLE | `GameSystem.optimizeCode` |
| Removed controls | Demand, Popularity skill, Allocation, Market pricing, Patent slots are inactive | LOCKED boundary | `navigation.js`, `GameSystem`, `MarketSystem` |
| Capacity utilization | always 100% when Compute > 0 | LOCKED | `MarketSystem.marketSnapshot` |
| Served Users | equals User Capacity | LOCKED | `MarketSystem.marketSnapshot` |
| Revenue | Served Users × Revenue/User | LOCKED identity | `MarketSystem.revenueRate` |
| Research Compute | Total Compute × Research allocation | LOCKED | `ResearchEconomySystem.researchComputePerSecond` |
| RP production | `4 × (ResearchCompute/1000)^0.72 × modifiers` | LOCKED | `ResearchEconomySystem.researchPointsPerSecond` |
| Research costs | `BaseTierCost × (1 + 0.55 level)^1.7` | LOCKED | `ResearchEconomySystem.researchLevelCost` |
| Research speed | bounded duration multiplier | TUNABLE | `ResearchEconomySystem.boundedResearchSpeed` |
| Research Labs | parallel timers; no duplicated RP | LOCKED boundary | `ResearchSystem` |
| Patent progress | stored RP spent once into active Patent | LOCKED boundary | `ResearchEconomySystem.spendResearchOnPatent` |
| Patent discovery | explicit base/growth requirement | TUNABLE | `GameSystem.patentResearchRequired` |
| Patent levels | `1 + 0.5(level-1)` | AUDIT_ONLY legacy | `GameSystem` / `ResearchEconomySystem` |
| Patent synergies | authored, individually capped where implemented | AUDIT_ONLY | `GameSystem.strategicBonus` |
| Offline progress | bounded canonical tick simulation | LOCKED boundary | `OfflineProgressSystem` |
| Tapping | authored additive contribution | AUDIT_ONLY | `GameSystem.optimizeGain` |
| Development Cycle | eligibility plus cumulative claimable INT | AUDIT_ONLY for this correction | `PrestigeSystem`, `GameSystem` |
| INT | piecewise cumulative Compute entitlement | AUDIT_ONLY for this correction | `PrestigeSystem` |
| Technology | authored costs/effects | AUDIT_ONLY for this correction | `technologyCatalog` |
| Breakthroughs | authored second-prestige function | AUDIT_ONLY | `GameSystem` |

## Source-of-truth verification
Runtime, UI, telemetry, and offline progression consume `economySnapshot`, `tickGame`, or the canonical pure helpers above. The Phase 2D generator imports Research and Patent helpers rather than reproducing their equations. Remaining descriptive mirrors in Markdown/JSON are audit output, not executable formulas. Legacy independent formulas are flagged above as AUDIT_ONLY rather than silently changed.

## Proposed future formula (inactive)
`PROPOSED_FUTURE_FORMULA: PatentLevelMultiplier = 1 + (L-1)/(3+(L-1))`. This bounded candidate is exported only for comparison and is not called by live gameplay.
# Phase 2B.2 superseding registry (2026-09-03)

The following entries supersede older Training/Model/Market rows below. Canonical helpers are pure and shared by runtime, previews, offline ticks, telemetry snapshots, and simulators.

| System | Canonical helper | Formula | Classification |
|---|---|---|---|
| Expected Training Rate | `referenceTrainingRate` | `0.5 × 1.67^(L-1) × 32^T` | `LOCKED_FORMULA`; inputs `TUNABLE_PARAMETER` / tier factor `DERIVED_PARAMETER` |
| Training Requirement | `trainingRequirement` | expected rate × `(28 + 2L^0.72 + transition[T])` | `LOCKED_FORMULA` |
| Model Level | `withinModelLevelFactor` | `1 + 0.8L^0.72` | `LOCKED_FORMULA`; coefficient/exponent `TUNABLE_PARAMETER` |
| Model Tier | `modelTierScale` | `4.2^T × 1.08^(T(T-1)/2)` | `LOCKED_FORMULA` |
| Quality Demand | `qualityDemandFactor` | `1 + 0.5Q^0.5` | `LOCKED_FORMULA` |
| Quality Revenue | `qualityRevenueFactor` | `1 + 0.38Q^0.48` | `LOCKED_FORMULA` |
| Efficiency | `efficiencyFactor` | `1 + 0.42E^0.5` | `LOCKED_FORMULA` |
| Popularity Demand | `popularityDemandFactor` | `1 + 0.58P^0.5` | `LOCKED_FORMULA` |
| User Response | `advanceUsers` | `Target +(U-Target)e^(-k dt)` | `LOCKED_FORMULA`; response95 `TUNABLE_PARAMETER` |
| Served Users | `servedUsers` | `min(CurrentUsers, Demand, Capacity)` | `LOCKED_FORMULA` |
| Revenue | `revenueRate` | `ServedUsers × RevenuePerUser` | `LOCKED_FORMULA` |
| Hardware milestones | `rawHardwareContribution` | local cumulative output bonuses at 10/50/100 | `CONTENT_ANCHOR` |
