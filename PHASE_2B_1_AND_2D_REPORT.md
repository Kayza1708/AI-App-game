# Phase 2B.1 + Phase 2D Report

## 1. Executive Summary
The live kernel now defines Users as Potential Demand, calibrates static Training requirements to the human run, converts Research Compute through a concave RP curve, and makes Patent progress consume stored RP rather than receiving duplicate Compute progress. This is a human-test build, not final balance authority.

## 2. Human Playtest Findings
The L10 observation (~3K requirement, 145 C/s, ~14s) and L25 observations (~30.5–33.6K at 2.5–4.0K C/s, ~4–8s) show that live Compute outgrew the former `tierRate × level²` reference. The final sample also showed 8,963 Users against 18,634 Demand and no events despite extensive progression.

## 3. Market Simplification
The canonical graph is `fundamentals -> Demand = Users -> min(Demand, Capacity) -> Served Users -> Revenue`.

## 4. Users = Demand Migration
Every snapshot and tick sets Current Users exactly to Potential Demand. Capacity remains a serving constraint only.

## 5. Removed Acquisition/Churn Mechanics
Acquisition half-life, churn half-life, and user convergence are inactive. Compatibility snapshot fields are `null`; user growth is zero. The legacy `advanceUsers` export aliases Demand without timestep behavior.

## 6. Word-of-Mouth Circularity Fix
Users-based Word of Mouth is excluded from Potential Demand. Its compatibility factor is 1, preventing `Demand -> Users -> WOM -> Demand`.

## 7. Training Root Cause
The old static `L²` curve was independent of player state but did not track the observed hardware trajectory. Actual Training Rate rose faster than requirements, so ordinary later levels completed faster.

## 8. Training Curve Derivation
Reference rate uses log-space interpolation through human-calibrated level anchors: L1 .38, L5 4.15, L10 39, L15 170, L20 510, L25 1,395, L30 3,030, L50 18K, L100 180K, L250 5M, L500 100M. Model-tier transition scales remain explicit. Requirement remains `StaticReferenceRate × (45 + 34√L + tierTransition)` and never reads runtime state.

## 9. Training ETA Table
The full machine table is in `PHASE_2B_1_2D_SIMULATION.json`. At L25 the new first-tier requirement is approximately 300K; at the exported 4,033/s rate its ETA is approximately 74 seconds. The table also reports +25%, +50%, and +100% rate cases.

## 10. Training Event Density
The calibrated L21–30 anchor targets ordinary intervals in the requested 60–180 second corridor at reference throughput. Temporary or permanent progression can still reduce it; telemetry must identify any sustained sub-15-second sequence.

## 11. Telemetry Root Cause
The previous export proved a recorder-lifecycle failure: persisted gameplay state advanced while no gameplay events survived the active playthrough record. Existing state-diff inference is retained, and Patent research start/stop are now explicit action sources.

## 12. Telemetry Repair
Application startup always creates a run event, state changes remain observed at the store boundary, and action/progression inference covers Hardware, Training, model skills, price/allocation/Marketing, objectives, Gems, Research, Patents, cycles, and Technology. Export validation emits specific severe reasons when model/hardware/Compute progression lacks corresponding events.

## 13. Session/Run/Playthrough Accounting
Runtime session IDs identify one app process; run IDs change at Development Cycle; playthrough ID remains save-scoped. Session deltas use the recorder's starting state while lifetime totals come only from save statistics.

## 14. Gem Telemetry Repair
Gem analysis uses the session identity `start + session earned - session spent = end`; lifetime ledger fields remain separately labeled. Gem balance and event deltas are not mixed. No Gem prices or rewards changed.

## 15. Research Architecture
`Total Compute × Research allocation = Research Compute`; a canonical concave function produces RP. Labs consume RP once at project start and provide parallel project capacity, not multiplied production.

## 16. Research Production Derivation
`RP/s = 4 × (ResearchCompute / 1,000)^0.72 × modifiers`. This is the locked mathematical specification. Pacing consequences are reported without retuning it.

## 17. Research Reference States
The machine artifact models Research unlock, early, midgame, Datacenter, Planetary, Stellar, AGI, ASI, Matrioshka, and Singularity states with Compute, allocation, RP/s, candidate cost, affordability, duration, and total time. Later entries are explicitly reference-state models.

## 18. Research Cost Derivation
Repeatable projects use the locked `BaseTierCost × (1 + 0.55 × level)^1.7` family. Each authored project cost is treated as its BaseTierCost content anchor; their cross-project values remain content anchors pending audit.

## 19. Research Duration Model
Total expected time is `cost / RP/s + base project duration`. Research speed reduces only duration and is bounded by `1 + 1.5x/(20+x)` below 2.5×.

## 20. Research Labs
Labs are independent parallel slots. They do not duplicate RP generation; each project pays its full cost once. Existing first/second/premium lab unlock identities remain.

## 21. Complete Research Project Audit
All live Research upgrades are emitted in the machine artifact with IDs, categories, current effect, cost, repeatability, and maximum level. Effects continue through their existing modifier targets; broad content replacement is deferred.

## 22. Patent Architecture
Patents remain persistent, limited-slot specializations. Starting Patent research chooses RP spending into the next discovery.

## 23. Patent Resource Flow
Generated RP enters the stored RP balance once. While Patent research is active, `min(storedRP, requirement-progress)` is subtracted and added to Patent progress exactly once. No direct Patent stream exists.

## 24. Patent Discovery Derivation
The requirement is `1500 × 1.52^index × 1.28^floor(index/10)`. A first Patent at the 1 RP/s Research anchor takes 25 minutes, inside the requested 20–40 minute corridor.

## 25. Patent Power Audit
The artifact reports each Patent's base relevant-output ratio and bounded upgraded ratio. Specialized effects and limited slots remain the main choice constraint.

## 26. Patent Level Audit
Live Patent levels retain the pre-Phase-2D compatibility rule `1 + 0.5 × (level - 1)`. The bounded `1 + (L-1)/(3+(L-1))` rule is documented only as `PROPOSED_FUTURE_FORMULA` and is not active.

## 27. Patent Slot Economy
Base slots, Technology adjustments, purchased slots, and narrow-Patent tradeoffs remain. Equip logic enforces the effective slot count. Gem slot prices are unchanged.

## 28. Patent Synergy Audit
Ownership synergies remain capped (for example Cold Kernels/Silicon Legacy at +40%). Research feedback is gated by equipped slots and the concave RP layer. Any uncapped content discovered during human testing is a blocker for later calibration.

## 29. Dependency / Feedback Loop Graph
Research can accelerate Research only through a bounded duration layer. Patent -> Compute -> Research -> Patent is compressed by concave RP and slots. Patent -> Demand -> Revenue -> Hardware -> Research -> Patent remains strategically gated; Capacity never enters Demand.

## 30. Modifier Algebra Audit
Research production uses base × concave scale × one grouped modifier. Research speed is bounded. Patent level is bounded. Keystone and temporary content remain distinct compatibility layers.

## 31. Strategy Simulation
The generator includes BALANCED, HARDWARE_HEAVY, TRAINING_HEAVY, MARKET_HEAVY, RESEARCH_HEAVY, PATENT_HEAVY, GREEDY_ROI, and LOW_INTERACTION. Phase-2B run policy output is reused rather than duplicating runtime economics; research/patent choices are annotated engineering scenarios.

## 32. Offline Simulation
Offline progression continues through canonical `tickGame` substeps. Research production, RP spending, project timers, Patent discovery, and rewards therefore use one runtime implementation.

## 33. Tests
Focused tests cover Users=Demand, Capacity independence, removal of Users/WOM feedback, static Training requirements, inverse ETA scaling, finite L500 values, concave RP, allocation conservation, one-time Patent spending, bounded Patent levels, and preserved Market/Compute regressions.

## 34. Files Changed
Balance configuration, MarketSystem, ProgressionSystem, GameSystem, ResearchSystem, new ResearchEconomySystem, default-state Patent fields, Application Patent actions, telemetry action mapping, tests, generator, machine artifact, and this report.

## 35. Remaining Risks
Project costs still inherit legacy content anchors; later-stage Research and Patent pacing is reference-modeled, not human-validated. Existing Phase-2C code predates this corrective phase and was intentionally not rebalanced. The UI does not yet broadly explain every RP tradeoff.

## 36. Explicit Phase-2C Dependencies
Patent INT upgrade prices remain compatibility values. No final INT entitlement, Technology cost, Technology power, prestige acceleration, or Patent INT calibration changed.

## 37. Recommendation for Next Human Playtest
Start a clean save with `?dev=1`, do not use cheats, and play naturally through Research and the first Patent. Verify Users always equals Demand; Capacity changes only Served Users; record Training ETAs at L1/5/10/15/20/25/30; vary Training allocation once; allocate Research and start at least one project and one Patent; export the complete playthrough JSON. Confirm the export includes Hardware, Training, model-skill, price, allocation, Marketing, objective, Gem, Research, Patent, and Development Cycle events and that Gem/session scope invariants are valid. Stop after the first Patent or 120 active minutes.
