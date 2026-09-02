# Phase 2A — Canonical Market Economy Kernel V3

## 1. Files changed

- `src/config/balance.js`: centralized Market V3 coefficients.
- `src/systems/MarketSystem.js`: pure Market factor, Demand, Capacity, user-flow, Served User, Revenue, and snapshot helpers.
- `src/systems/GameSystem.js`: delegates Market calculations and uses the canonical post-user-flow snapshot in `tickGame`.
- `test/market-v3.test.js`: Market causal and mathematical invariants.
- `test/economy-v2.test.js`: replaces obsolete V2 Capacity-created-Demand expectations with V3 causal expectations.
- This report.

No Hardware prices/production, Training requirements, Research economy, Patent balance, Mission rewards, save version, or Development Cycle requirements changed.

## 2. Old causal graph

The V2 graph included `Inference allocation → Capacity → capacityDemand → Demand → Users → Revenue`. A Capacity increase therefore manufactured its own market and could finance another Capacity increase.

## 3. New causal graph

`Market fundamentals → Potential Demand → Current Users`, independently of `Hardware → Compute → Inference allocation → Capacity`. Current Users, Potential Demand, and Capacity meet only at `ServedUsers=min(Users,Demand,Capacity)`. Revenue is `ServedUsers×RPU`.

## 4. Live formulas

- Marketing: `1 + 0.32 ln(1+M)`.
- Reputation: `0.75 + 0.50/(1+exp(-2.2(R-1)))`.
- Adoption: `1 + 0.50A/(50+A)`.
- WOM: with `z=ln(1+Users/1000)`, `1 + 1.5z/(3+z)`.
- Quality Demand: `1 + 0.18ln(1+Q)`.
- Popularity: `1 + 0.30sqrt(P) + 0.08ln(1+P)`.
- Discount price: `1 + 0.8(1-p)` for `p≤1`.
- Premium price: `exp(-1.15(p-1)/(1+0.10sqrt(Q)+elasticityBonus))`.
- Acquisition: exact exponential convergence with half-life `max(30,180/(1+0.08sqrt(P)+0.06ln(1+M)))` seconds.
- Churn: exact exponential convergence with a 90-second half-life.
- Capacity retains the current `allocated Compute × Model efficiency × capacity/inference modifiers` structure.
- Revenue is exactly canonical post-flow Served Users × Revenue/User.

## 5. Constants

All V3 coefficients are under `BALANCE.marketV3`. They are candidate calibration values from Phase 1, not immutable design constants.

## 6. Compatibility

Save version remains unchanged. Existing `market.demand` is overwritten with current Potential Demand during the next tick. Existing callers of `marketMetrics`, `revenuePerUser`, and `userGrowthPerSecond` remain supported. `capacityDemand` remains as a deprecated diagnostic value fixed at zero and never participates in gameplay.

## 7. Capacity-to-Demand removal

Potential Demand receives only Model, tier-based infrastructure reach, Marketing, Reputation, Adoption, Current Users/WOM, Price, and explicit Market modifiers. Neither Compute, Inference allocation, nor Capacity is an input. Tests compare 10% with 90% Inference and a separate tenfold Capacity change.

## 8. User-flow migration

The old minimum user step and Euler-like convergence were removed. `advanceUsers` applies the closed-form exponential solution. The same function is used by the live tick and directly by tests. Fixed-fundamental 60×1s and 600×1s results match single 60s and 600s evaluations within floating-point tolerance.

## 9. Revenue migration

The tick first advances Users against the current Potential Demand, creates a new snapshot using those evolved Users, and credits exactly `snapshot.revenuePerSecond×dt`. Lifetime served-user statistics now count `snapshot.servedUsers`, not every Current User.

## 10. Modifier mapping

- `marketSize`: one additive compatibility group on Base Market.
- `demand`: one additive Demand group, including Demand milestones.
- `appeal`: one compatibility group containing non-Quality/Popularity Model appeal; Quality and Popularity use only their V3 functions.
- `priceElasticity`: adds to bounded Price Tolerance rather than multiplying Demand.
- `reputation` and `adoption`: existing state generation remains unchanged; their Market response is represented only by the bounded V3 factors.
- Model identity `marketSize` and `demand` effects remain in their corresponding compatibility groups.

## 11. Lifetime INT compatibility

The former unbounded `1+0.10×lifetimeINT` Revenue multiplier was replaced with the explicitly temporary Phase-2A boundary `1+0.50sqrt(INT)/(10+sqrt(INT))`, bounded below 1.5×. Final INT entitlement remains Phase 2C work.

## 12. Telemetry/export

`economySnapshot` now exposes Potential Demand, Current Users, Served Users, Inference Compute, Capacity, utilization, Revenue/User, Revenue/s, acquisition/churn half-lives, instantaneous user growth, and the complete factor breakdown. Existing periodic telemetry spreads this canonical economy snapshot, so a fresh export contains reconstructable Market diagnostics without a telemetry rewrite.

## 13. Tests

Tests cover Demand independence from Inference allocation and Capacity, Capacity monotonicity, V2 explosion regression, Served User bounds, Revenue identities, tick credits, 60-second and 600-second timestep invariance, WOM/Reputation/Adoption bounds, price continuity, finite outputs, binding Capacity/Demand behavior, and offline chunk reconciliation.

## 14. Expected player-facing change

Demand no longer rises merely because the player moves Compute into Inference. Inference now raises only Capacity. User movement is smoother and timestep-stable. Revenue consistently reflects the lowest of Current Users, Potential Demand, and Capacity. Existing UI labels remain unchanged.

## 15. Known remaining economy problems

Hardware and Marketing costs are not yet recalibrated against V3 ROI. Model Level scaling, Training requirements, Compute-based INT entitlement, Research/Patent resource flow, Technology costs, and Mission reward boundaries remain later phases. First-cycle timing is deliberately not compensated in this patch.

## 16. Next human playtest

1. Start a **new/clean save**.
2. Enable Developer Analytics only for recording; do not use cheats or time scaling.
3. Play naturally without optimizing from implementation knowledge, preferably in one continuous session.
4. Continue until Development Cycle becomes available or 120 active minutes elapse.
5. Record visible Demand, Users, Capacity, Revenue/s, allocation, Marketing, Training, major Hardware unlocks, and Model levels when making normal decisions.
6. At the stopping condition, open Developer Analytics and choose **Download Complete Playthrough**.
7. Preserve the JSON export and note the stopping reason and any interval that felt like passive waiting.
8. Review the export’s periodic Market fields to reconstruct Hardware/Model timing, Potential Demand factors, Current/Served Users, Capacity, Revenue, and Development Cycle eligibility.
