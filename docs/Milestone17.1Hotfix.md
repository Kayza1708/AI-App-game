# Milestone 17.1 Interaction Hotfix Audit

## Root causes

### Model skill purchase

The Model screen rendered the entire skill card as one implicit button. The player-facing cost and preview were nested inside that control, but there was no explicit `UPGRADE` affordance. More importantly, old/migrated Model state could expose the active Model's compatibility `upgradePoints` while eligibility and the transaction read the per-Model point record. The previous point hotfix reconciled the data; Milestone 17.1 completes the interaction path by rendering a dedicated `data-model-skill-upgrade` button and sending the unambiguous `{ modelId, skillId }` payload through EventBus to `upgradeModelSkill`.

### Technology purchase and selection

Technology selection lived only in the AppShell private `#selectedTechId`. It forced a local synchronous render rather than updating StateStore. Subsequent queued renders could therefore rebuild from the default first node, leaving the detail purchase button bound to a stale/default node ID. The domain purchase function had no structured rejection result, so the UI could silently appear inert when that stale node was locked or unaffordable.

Selection is now explicit `state.ui.selectedTechnologyId`, updated through `tech:select` and StateStore. The detail panel and purchase button derive from that ID. `purchaseTechnology` is the sole canonical transaction, while `technologyPurchaseEligibility` provides `UNKNOWN_NODE`, `ALREADY_PURCHASED`, `PREREQUISITE_MISSING`, and `INSUFFICIENT_INT` reasons. Developer Mode exposes the last selection/purchase transaction record.

## Marketing curve

Old cost:

`100 × (level + 1)^1.6`

This polynomial curve cost only about 14K at Level 20 and became irrelevant in a million-Credit economy.

New canonical next-level cost:

`ceil(250 × 1.55^level × effectiveCostModifier)`

There is currently no Marketing-cost Technology, so the effective modifier is 1. The state-aware function is ready for a future authored cost modifier without allowing UI and charging formulas to diverge.

Representative costs:

| Current level | Next campaign |
| ---: | ---: |
| 1 | 388 |
| 5 | 2,237 |
| 10 | 20,011 |
| 20 | 1,601,674 |
| 30 | 128,200,865 |
| 50 | 821,343,675,208 |

`marketingPurchasePreview` computes Demand, target Users, revenue/sec, and payback from the canonical live Market formulas. The Dashboard, Market screen, Automation, purchase transaction, and telemetry all consume the same `marketingCost` function.

## Telemetry and export

The live recorder emits `model-point-earned`, `model-skill-upgraded`, `technology-node-selected`, `technology-node-purchased`, and `marketing-purchased`. Marketing metadata includes level, Credits cost, Demand, target Users, revenue before/after, and estimated payback. Complete Session export still calls `prepareExport(currentState)` on the injected live recorder and retains truthful `HEALTHY`, `INCOMPLETE`, and `BROKEN` validation.
