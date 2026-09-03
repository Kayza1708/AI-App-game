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
| Training throughput | allocated Training Compute × Efficiency × grouped modifiers | TUNABLE | `GameSystem.trainingRatePerSecond` |
| Model level | `1 + 0.16 L^0.62` market factor | TUNABLE | `ProgressionSystem.withinModelLevelFactor` |
| Model tiers | explicit tier scale table | CONTENT_ANCHOR | `BALANCE.models.tierScale` |
| Quality | logarithmic Demand; root Revenue and price tolerance | TUNABLE | `MarketSystem`, `ProgressionSystem` |
| Efficiency | `1 + 0.20√E` for Training and Capacity | TUNABLE | `ProgressionSystem.efficiencyFactor` |
| Popularity | `1 + 0.30√P + 0.08 ln(1+P)` | TUNABLE | `MarketSystem.popularityDemandFactor` |
| Potential Demand | product of independent Market fundamentals; never Capacity | LOCKED boundary | `MarketSystem.potentialDemand` |
| Price | discount linear / premium exponential | TUNABLE | `MarketSystem.priceDemandFactor` |
| Marketing | `1 + 0.32 ln(1+M)` | TUNABLE | `MarketSystem.marketingFactor` |
| Reputation | bounded logistic `[0.75,1.25]` | TUNABLE | `MarketSystem.reputationFactor` |
| Adoption | `1 + 0.5A/(50+A)` | TUNABLE | `MarketSystem.adoptionFactor` |
| Users | `Users = PotentialDemand` | LOCKED | `MarketSystem.marketSnapshot` |
| Inference Capacity | Inference Compute × Efficiency × modifier group | LOCKED boundary | `MarketSystem.inferenceCapacity` |
| Served Users | `min(Demand, Capacity)` | LOCKED | `MarketSystem.servedUsers` |
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
