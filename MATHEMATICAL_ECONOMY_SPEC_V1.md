# Mathematical Economy Specification V1

> **ANALYSIS ONLY — NOT LIVE ECONOMY.** Candidate equations for review before Phase 2.

## 1. Scale and modifier architecture

Every output is evaluated as:

`Y = ScaleAnchor(content tier) × LocalCurve(run state) × PermanentGroup × BoundedGroup × KeystoneGroup × TemporaryGroup`.

Ordinary bonuses within a group add: `Group = max(floor, 1 + Σ bonus_j)`. Only explicitly declared Keystones and temporary boosts receive distinct multiplicative layers. No ordinary permanent effect may alter a geometric exponent unless declared `TRANSFORM`, bounded, and tested at `n={1,10,25,50,100,500,5000}`.

Proposed effect schema:

```json
{
  "effect": "marketingCoefficient",
  "mode": "TRANSFORM",
  "operation": "ADD",
  "value": 0.02,
  "bounds": [0.20, 0.50],
  "sourceType": "technology",
  "sourceId": "market-example"
}
```

Modes are `ADD`, `MULTIPLY`, `BOUNDED`, `TRANSFORM`, and `KEYSTONE`. The evaluator must return a diagnostic layer breakdown with source IDs.

## 2. Hardware

### Unit cost

`Cost_i(n) = B_i g_i^n D_i`, Credits/unit, for integer `n≥0`, where `B_i` is an explicit tier scale anchor, `g_i>1` is local growth, and `D_i=clamp(1-Σdiscount, D_min, 1)`.

`g_i = F_i^(1/N_i)` is derived from target meaningful purchases `N_i` and desired final/base unit-cost ratio `F_i`. This is geometric because repeated purchases create intentional run walls. Hardware scale anchors may be modified only by authored content revisions; ordinary bonuses may modify `D_i`, not `g_i`. A growth-rate transform is forbidden except a rare bounded Transform.

### Bulk cost

`BulkCost_i(n,k)=D_i B_i g_i^n (g_i^k-1)/(g_i-1)` Credits. This exact geometric sum replaces iterative quoting after equivalence tests. Valid `k≥1`; use `log1p/expm1` or iteration for `g≈1` to avoid cancellation.

### Production

`Hardware_i = P_i n_i × (1+ΣtierRun) × (1+Σpermanent) × boundedSynergy × keystone × temporary` Compute/s.

`TotalCompute = Σ Hardware_i`. `P_i` is an explicit scale anchor. Direct old-tier share naturally falls as `P_i` rises; bounded synergies preserve strategic value. Hardware and allocation may modify Capacity but are forbidden from modifying Potential Demand except a separately authored, allocation-independent infrastructure-reach anchor keyed to highest unlocked/owned tier.

## 3. Model progression

`ModelPower(T,L)=TierScale_T × [1+0.16 L^0.62] × SkillFactors`.

This is scale-anchor × concave power law. It grows from 1.16 at L1 to about 8.52 at L500, keeping levels meaningful without competing with Model-tier anchors. Valid `1≤L≤500`; `log10` remains below 1. Systems may modify the coefficient within bounds, but not the power without a Transform.

Skills use ranks `Q,E,P≥0`:

- `QualityDemand(Q)=1+0.18 ln(1+Q)`.
- `QualityRevenue(Q)=1+0.12 sqrt(Q)`.
- `PriceTolerance(Q)=1+0.10 sqrt(Q)`.
- `Efficiency(E)=1+0.20 sqrt(E)`.
- `Popularity(P)=1+0.30 sqrt(P)+0.08 ln(1+P)`.

Popularity has the largest direct acquisition/Demand elasticity. All are concave; their marginal derivatives decrease as ranks rise.

## 4. Training

`TargetTrainingDuration(T,L)=45 + 34 sqrt(L) + Transition_T` seconds.

`TrainingRequirement(T,L)=ExpectedTrainingRate(T,L) × TargetTrainingDuration(T,L)` Compute.

`TrainingRate=TotalCompute × A_training × Efficiency(E) × TrainingAdd × PermanentAdd × Keystone × Temporary` Compute/s.

Duration, not an arbitrary requirement magnitude, is the calibration target. Transition anchors are explicit Model-tier walls `[0,60,180,420,900,1800,3600,7200,14400]` seconds. Valid L1–500. At fixed tier, `dT/dL=17/sqrt(L)`, so duration growth slows. Model unlocks intentionally create discrete walls.

## 5. Allocation

For unlocked categories, `Σ A_j=1`, `0≤A_j≤1`. Each allocated flow is `C_j=TotalCompute×A_j`. Compute is generated once and each allocated unit may enter one primary system only. Patent discovery must either consume a declared fraction of Research flow or be funded from Research output; it may not independently reuse the full Research allocation.

`InferenceCompute=TotalCompute×A_inference`.

## 6. Potential Demand

`D = BaseMarket_T × ModelLevelFactor(L) × QualityDemand(Q) × Popularity(P) × Reach_H × Marketing(M) × Reputation(R) × Adoption(A) × WOM(U) × PriceDemand(p,Q) × PermanentAdd × Keystone` Users.

Units are potential Users. Inputs are market fundamentals only. **Forbidden inputs:** Inference allocation, Inference Compute, Capacity, Served Users, and Revenue.

`BaseMarket_T` and `Reach_H` are explicit scale anchors. `Reach_H` may depend on the highest legitimately owned infrastructure tier but not its quantity, output, allocation, or Capacity.

### Marketing

`Marketing(M)=1+0.32 ln(1+M)`.

The coefficient is calibrated so M=10 gives 1.77× Demand and M=100 gives 2.48×, preserving relevance with diminishing marginal value `0.32/(1+M)`.

### Reputation

`Reputation(R)=0.75+0.50/[1+exp(-2.2(R-1))]`.

Range is `(0.75,1.25)`. It cannot create a zero-growth wall. The midpoint is exactly 1.00 at R=1. Only Data/Model/Market fundamentals may change R; Capacity may not.

### Adoption

`Adoption(A)=1+0.50 A/(50+A)`, for `A≥0`.

Range `[1,1.5)`, half-saturation at A=50. It is bounded and monotonic.

### Word of Mouth

Let `z=ln(1+U/1000)`. `WOM(U)=1+1.5z/(3+z)`.

Range `[1,2.5)`. `dWOM/dU = 4.5 / [(3+z)^2(1000+U)]`, which tends to zero. WOM may depend on Current Users, never Served Users. Potential-Demand stability requires numerical `dD/dU<1` at all reference states.

## 7. Price

For `0.5≤p≤1`, `PriceDemand=1+0.8(1-p)`. For `1<p≤3`, `PriceDemand=exp[-1.15(p-1)/PriceTolerance(Q)]`.

Both branches equal 1 at p=1. The one-sided derivatives differ intentionally but remain finite; Phase 2 may smooth a narrow interval if UI slider tests reveal a visible cusp.

`RPU=BaseRPU_T × p × QualityRevenue(Q) × EnterpriseFactor × RevenuePermanentAdd × Keystone × Temporary`, Credits/(User·s).

Discount prices exchange RPU for Demand; premium prices exchange Demand for RPU. Capacity-constrained states tend toward higher price until Demand approaches Capacity; Demand-constrained states prefer lower price. Market modifiers may change bounded price tolerance or decay, but Inference cannot.

## 8. User acquisition and churn

For a fixed Potential Demand `D` and timestep `dt`:

- If `U<D`: `U' = D-(D-U)exp(-r_acq dt)`.
- If `U>D`: `U' = D+(U-D)exp(-r_churn dt)`.

`r=ln(2)/halfLife`. Base acquisition half-life is 180s; base churn half-life is 90s. The 180s anchor means half the reachable audience arrives in three minutes, supporting 2–5 minute event cadence without instant filling. Churn is twice as fast so price mistakes are visible.

`H_acq=max(30,180/[1+0.08sqrt(P)+0.06ln(1+M)])` seconds. The 30s floor is a stability and presentation bound. Exact exponential stepping makes online/offline results independent of chunk size for fixed D.

## 9. Capacity, Served Users, and Revenue

`Capacity=InferenceCompute × ModelTierEfficiency_T × Efficiency(E) × InferenceAdd × PermanentAdd × Keystone × Temporary`, Users.

Capacity’s only downstream outputs are Served Users, utilization, Compute use/waste, and capacity-constrained Revenue.

`ServedUsers=min(CurrentUsers,PotentialDemand,Capacity)`. Demand is retained in the minimum as a defensive invariant: it prevents stale Users above newly reduced Demand from being monetized during churn.

`Revenue/s=ServedUsers×RPU`. All quantities must be finite and nonnegative.

## 10. Development Cycle and INT

Eligibility and reward are separate. Eligibility may require a Model milestone, Hardware milestone, objectives, and qualifying Compute; Credits are forbidden as a primary eligibility/reward input.

`INTEntitlement(C)=floor[(C/4e8)^0.30103]`.

`NewINT=max(0,INTEntitlement(lifetimeQualifyingCompute)-INTPreviouslyEntitled)`.

The exponent is derived from anchors `(4e8 Compute,1 INT)` and `(4e12 Compute,16 INT)`: `alpha=ln(16)/ln(10^4)=0.30103`; `C0=4e8`. Lifetime Compute is recommended because it is monotonic and cannot replay the same entitlement after reset. `INTPreviouslyEntitled` must persist.

Raw INT passive Revenue power should be removed. If retained for product reasons, use `1+0.5 sqrt(INT)/(25+sqrt(INT))`, bounded below 1.5×. Technology purchases do not reduce entitlement.

## 11. Technology

`TechCost(d,type,branch)=round(BaseINTStage × (1+0.45d)^1.55 × TypeMultiplier × BranchModifier)` INT.

Costs must then be snapped to readable integers. The constants are constrained by Run Cost Equivalent corridors: Minor 0.25–0.75 runs, Standard 0.75–1.5, Major 1.5–3, Keystone 3–6, Transformative 5–10 at the node’s expected stage. Each node must report Equivalent Power at early/mid/late applicable states; cost is rejected if its Power/Cost is a >2× unexplained outlier.

## 12. Research

`AllocatedResearchCompute=TotalCompute×A_research`.

`RP/s=4(AllocatedResearchCompute/1000)^0.72 × ResearchAdd × ModelResearch × BoundedPatent × Keystone`.

The anchor gives 4 RP/s at 1,000 allocated Compute/s. A tenfold Compute increase gives only `10^0.72≈5.25×` RP, preventing stellar Compute from erasing Research content.

`ResearchCost(tier,l)=BaseTierCost×(1+0.55l)^1.7`. This is polynomial/concave relative to an exponential and is calibrated through `AffordTime=Cost/RP/s`.

`EffectiveDuration=BaseDuration/[1+1.5x/(20+x)]/Keystone/Temporary`, where x is normalized permanent Research investment. Ordinary permanent speed is bounded below 2.5×; temporary and Keystone layers remain explicit. Base-duration corridors remain 1–10m early, 10–30m early-mid, 30–120m mid, 2–12h late, and 12h–days endgame.

## 13. Patents

Each Patent declares an objective metric, mode, equation, cap, and intended stage. Ordinary Patent Equivalent Power target is 1.05–1.25; Keystone target is 1.20–1.60. Ownership synergies use `1+A x/(K+x)`, logarithmic, root, or capped milestones. Uncapped `bonusPerOwned×owned` is forbidden.

Patent discovery cost should remain a meta wall but be calibrated from expected Patent RP and target discovery time. Patent discovery and timed Research must have an explicit resource relationship rather than silently double-consuming Research allocation.

## 14. Offline

`EffectiveOfflineTime=min(Absence,Capacity)×Efficiency`, with `0≤Efficiency≤1`, base Capacity 2h and maximum 8h. Offline runs the same pure transitions as online. Continuous user flow uses its exact solution; timer completions split elapsed intervals at completion boundaries.

## 15. Manual tapping

`TapEquivalentSeconds=TapPower/AutomaticComputePerSecond`.

Normal target corridors are 0.5–2.0s early, 0.1–0.5s midgame, and 0.01–0.15s late. A deliberate Manual Keystone build may reach 1.5s but not grow without bound. Tap power may use bounded Model/Hardware/Patent synergies; it must not reuse an unrestricted percentage of astronomical Compute.

## 16. Numerical safety

All calculations must expose `log10` diagnostics. Values below `1e100` are safe for planned Phase-2 content. At `log10 100–250`, schedule a numeric abstraction; at 250–300, block new content without it; above 300, native Number is forbidden. Exponential unit costs should be evaluated in log space before exponentiation.

## 17. Required invariants

Phase 2 must test Hardware cost/production monotonicity, closed-form bulk equality, Training monotonicity, Demand independence from allocation/Capacity, Capacity monotonicity in Inference allocation, Served Users bounds, nonnegative Revenue, exact user convergence, bounded WOM, price continuity, positive Research duration, finite Research Speed, monotonic/nonfarmable INT entitlement, finite modifier layers, offline efficiency ≤1, nonnegative resources, and endgame Number safety.
