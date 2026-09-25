# Local Balance Export and Research/Component Audit

## Delivery and privacy contract

Developer Analytics now offers an abortable local ZIP export. It contains `manifest.json`, `summary.json`, `events.csv`, `snapshots.csv`, `economy.json`, and `diagnostics.json`. The builder reads the existing telemetry and canonical catalogs; it does not serialize, mutate, overwrite, or delete the game state. ZIP work yields between files. Export records are bounded to 10,000 events and 2,000 snapshots, while regular snapshots are reduced to about 30-second spacing and important transitions add a nearby snapshot. Local player identifiers, profiles, usernames, and e-mail fields are removed recursively.

Telemetry remains under the existing `ai-singularity-active-telemetry` / `ai-singularity-dev-sessions` keys, separate from the save. Existing in-memory event and sample caps still apply. The ZIP reports dropped input records and both compressed-output progress and cancellation are exposed in the Developer Analytics UI.

## Measured fixed-seed economy evidence (2026-09-25)

`node scripts/research-balance-simulator.mjs` uses the production Data and Research helpers for the existing early-active and established-passive profiles. No drop rate or recipe was changed.

| Profile | Data/s | Compute/s | L1 save / timer | L10 save / timer | L20 save / timer |
| --- | ---: | ---: | ---: | ---: | ---: |
| early-active | 0.5306 | 60.475 | 188.45s / 75s | 1,739.43s / 449.06s | 20,522.64s / 3,280.18s |
| established-passive | 37.7653 | 22,605.425 | 2.65s / 75s | 24.44s / 449.06s | 288.36s / 3,280.18s |

This confirms a profile-dependent bottleneck: active early progression waits primarily for Data through at least level 20, while the established passive profile waits primarily for the fixed timer. At level 50 both profiles hit the 259,200-second timer cap; early-active Data saving is approximately 33.77 million seconds and established-passive saving is approximately 474,455 seconds. Stored Lab duration remains unchanged after start.

## Component and crafting audit

The registry contains all six requested components and three recipes. Runtime completion rewards currently implement Circuits (`research-compute-1`), Lasers (`research-science-1`), Graphene (`research-science-2`), Nanotubes (`research-model-2`), and a Quantum Core at `research-compute-2` level 10. Source and recipe events now preserve source, amount, active/offline context, exact ingredients, result, and item identity.

Blueprint Analysis now grants two Circuits and two Titanium Screws per completed level. Material Analysis grants one Graphene per level in addition to its existing level-ten Quantum Core, connecting the catalog descriptions to production rewards. The production-helper simulation completes three Blueprint Analysis levels, ten Material Analysis levels, eight Data Generation levels, and three Model Architecture levels, then crafts all three recipes in order without direct component grants. No recipe quantity or random drop rate was changed.

Open source contracts:

- passive random component finds (active and offline): not implemented; measured rate is 0/hour;
- analysis actions other than deterministic Research completion: not implemented;
- mission-authored component rewards: announced but not implemented;
- later Prestige component/blueprint/item rewards: announced but not implemented;
- Hardware component milestones and first-craft Graphene remain unimplemented labels and are no longer presented as current component sources.

All six components now have deterministic Research paths and do not depend on rare random drops. The recipes remain unchanged; the new regression simulation proves that their cumulative ingredient requirements are reachable through the production Research and Crafting systems.

## Atlas prerequisite

`public/assets/game/components-atlas-v1.png` is absent from this branch. Consequently its real dimensions and cell boundaries cannot be verified and no sprite coordinates, replacement art, or claimed UI integration were added. Adding the specified source asset is a blocking prerequisite for the Inventory, find, and recipe icon work.

## Handoff / next validation

1. Add the exact atlas asset and verify PNG dimensions before defining a 3×2 sprite grid.
2. Add mission and Prestige component sources only when their reward catalogs are implemented.
3. Extend the canonical simulation with timed active/offline player strategies and compare component/hour, time-to-craft, rate transitions, and blocked durations.
4. Instrument persistence duration at the SaveSystem boundary; current diagnostics truthfully reports this as unavailable unless a save/load event supplies it.
5. Tune only after those runs demonstrate a measured problem; retain before/after exports alongside any parameter change.
