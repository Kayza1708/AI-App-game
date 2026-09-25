# Fixed Research and Component Crafting

## Runtime contract

Research uses the existing `resources.research` balance as **Data**; the storage key remains unchanged so old saves lose nothing. Data continues to come only from the canonical Hardware/User economy. A project start atomically validates its prerequisite, free Lab, unique active project, exact Data balance, and level. It then deducts `ceil(baseDataCost × 1.28^(level-1))` once and stores the precise `min(baseSeconds × 1.22^(level-1), 259200)` duration on the Lab. Production bonuses never mutate that duration.

Completion is an idempotent transaction keyed by `projectId:level`: Lab progress is cleared, the level and status are advanced, the deterministic component reward is applied once, and a pending-save marker plus step diagnostics are recorded. This fixes the first-Lab completion freeze at its concrete boundary: the old path had no transaction identity and allowed the same repeatable project into multiple Labs, so simultaneous completion could mutate/reward the same level twice. Active-project exclusion and completion keys now prevent that invalid state; durations are not shortened as a workaround.

Existing version-24 saves migrate to version 25. Unknown or malformed saves still fail validation without being overwritten. Research levels, running Lab precision, Items, and permanent progression remain intact. Components and crafted Items follow the existing Inventory preservation contract across both reset layers.

## Research organization

One-time projects remain completed unlocks. Repeatable, mechanically connected families are Data Generation (canonical Data rate), Material Analysis (component yield), Blueprint Analysis (recipe requirements), Model Architecture (Quality economy), and Laboratory Automation (automation plus parallel capacity milestones). Locked cards state their prerequisites; each card shows current/next effects, next level, exact cost, shortage, and formatted duration.

## Components and blueprints

The registry defines Circuits, Lasers, Graphene, Titanium Screws, Nanotubes, and Quantum Cores with rarity, a reused text-icon, description, and at least two authored sources. Research analysis is deterministic, so required progression never depends solely on chance. Three recipes craft existing real Items: Prototype GPU Cluster, Scientific Corpus, and Photonic Accelerator. The Inventory view previews owned/required/missing ingredients and the exact result before enabling Craft.

## Balance evidence

`RESEARCH_COMPONENT_BALANCE.json` is generated with `node scripts/research-balance-simulator.mjs` using the production economy and formulas. It reports levels 1, 5, 10, 20, and 50 for early-active and established-passive Hardware profiles, including duration, Data cost, real Data/s, and save time. The 75-second base permits research within minutes; exponential levels cross hours and eventually reach the 72-hour cap. Data cost, rather than a rare drop, remains the repeatable bottleneck.

## Open work

- Mission-authored component rewards and later Prestige sources are named source contracts but remain future catalog integrations.
- More recipes should only be added with a real effect and deterministic material path.
- Tune base project anchors after longer human-session exports; do not change the locked global exponents without regenerating the report.
