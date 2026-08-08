# Changelog

## 0.12.0 — Item economy and long-term meta foundations

- Added 30 handcrafted Model Items, six slot types, three prototype Sets, immutable Item instances, Inventory equipment, favorites, replacement, and build summaries.
- Connected Item and Artifact modifiers to canonical Model, Hardware, Market, Training, Research, and Energy calculations.
- Added 10 Consumables, four non-paid reward caches, feature-safe daily/weekly/monthly missions, legitimate Gem sources/sinks, and period-safe persistence.
- Added an explicit web-only Rewarded Boost provider with cooldowns and caps; no ad starts automatically and real-money products remain inactive metadata.
- Bumped saves to version 11 with backward-compatible defaults for Inventory, missions, Gems, boosts, Artifacts, and disabled marketplace metadata.
- Extended local telemetry with collection, mission, Gem, boost, rarity, equipment, Consumable, and inferred-build measurements.

## Emergency white-screen recovery

- Removed a module-parse-time lookbehind expression from number formatting for compatibility with older mobile WebViews.
- Added synchronous bootstrap and asynchronous render/game-loop recovery boundaries with a visible retry screen.
- Hardened save migration against corrupt JSON and malformed nested arrays, records, Model IDs, Hardware values, events, and UI data.
- Made view templates lazy so locked systems cannot execute or crash the first Dashboard render.
- Fixed the fresh tutorial attempting to open the still-locked Allocation screen.
- Made autosave and developer telemetry failures non-fatal; telemetry disables itself after its first exception.
- Added transactional mount cleanup and AppShell listener teardown to prevent duplicate handlers after failed starts or hot reloads.
- Added runtime regression coverage for first render, normal/developer initialization, feature navigation, corrupted saves, telemetry isolation, and white-screen recovery.

## 0.11.0 — Mathematical progression and unfolding prestige

- Centralized Hardware, Training, Market, Patent, Intelligence, Breakthrough, and event curves in `src/config/balance.js`.
- Replaced Credit/level prestige qualification with a fractional run-Compute INT curve and persistent cycle history.
- Added lifetime-INT gates so fresh saves show only the core loop and later runs reveal Marketing, Research, Patents, Model skills, Energy, Automation, Agents, Enterprise, and late infrastructure.
- Expanded the Technology Tree to 18 strategic branches spanning Robotics, Medicine, Education, Energy, Physics, Space, Government, AGI, ASI, and Singularity.
- Added a functional late-game Breakthrough reset with persistent Insight, Gems, Achievements, account purchases, profile, and statistics.
- Added staged Model skills and prevented locked Research, Patent, Energy, Market, event, and Achievement systems from progressing invisibly.
- Added performant K/M/B/T and alphabetic huge-number notation without scientific notation.
- Extended one-second telemetry with active progression constants, unlock timing/order, INT per run, prestige intervals, Technology choices, abandoned paths, and Model use distribution.
- Bumped save data to version 10 with migration defaults for Breakthrough, cycle history, and feature unlock timing.

## Analytics context and permanent Patent loadouts

- Added stable local player, session, run, version, prestige, breakthrough, and lifetime-play context to telemetry.
- Added meaningful-event player snapshots, first-time funnels, feature discovery/use tracking, enriched Hardware purchases, session economy aggregates, and balancing wait signals.
- Added three initial Patent slots, Gem-unlocked slots 4–8, equipping, swapping telemetry, and permanent Patent leveling with INT.

## Milestone 7 — Developer analytics and balance telemetry

- Added query-gated, local-only Developer Analytics mode.
- Added versioned immutable event recording, periodic effective-resource sampling, click-burst aggregation, bounded history, and separate session storage.
- Added meaningful-action pacing, downtime, overload, bottleneck, growth and experimental Fun Density analysis.
- Added live charts, event filtering, reports, purchase and decision analysis, imports, exports, session retention, cheats, and deterministic strategy simulations.
- Added automated analytics tests and developer documentation.

## Milestone 6 — Patents, energy and long-term economy

- Added permanent Patents, Energy infrastructure, Gems, model portfolios, retention missions and optional rewarded boosts.

## Developer Reset
- Added a Developer Mode-only destructive reset that clears game saves, analytics sessions, telemetry, simulation caches, game-scoped browser storage, and IndexedDB data before recreating the default state.
- Fresh reset reloads retain `?dev=1` for balancing while starting with new session and run identifiers and an empty analytics timeline.

## Milestone 8 — Telemetry-driven balance
- Changed active telemetry sampling to one-second snapshots containing complete economy, allocation, effective multiplier, hardware contribution, Energy, Patent, and bottleneck context.
- Added purchase ROI/payback context, Hardware milestone timing, Model training/deployment duration, Patent ETA accuracy, and full Development Cycle run snapshots.
- Expanded automatic reports with Hardware, Models, Patents, Prestige, dead-time thresholds, and actionable balancing suggestions.
- Rebalanced Hardware costs, Patent discovery toward multi-month permanent progression, early Intelligence rewards, Development Cycle eligibility, and default Research allocation.
- Added a persistent “What should I do next?” chase on player screens without changing the established visual structure.

## Milestone 9 — Core gameplay redesign
- Replaced Credit-purchased linear Models with nine permanent, INT-unlocked AI eras from TinyChat through ASI Seed.
- Training now awards XP only; Model Levels award manual Upgrade Points for sixteen-stat per-model skill builds, with no automatic Quality growth.
- Connected Model identities and skill choices to demand, adoption, enterprise revenue, Energy, Research, Patents, Agent Tasks, training, and Intelligence rewards.
- Upgraded telemetry with real Compute consumption/waste, current progression context, all-resource purchase snapshots, permanent Model unlock events, waiting reasons, page-duration analytics, replayable timelines, ignored-system detection, and target-based balance suggestions.
- Migrated version 7 saves into save version 8, including legacy Model IDs and permanent Model progress.

## Milestone 10 — Audited economy and progression overhaul
- Audited every live gameplay system and documented the complete production-to-prestige chain in `docs/GameplayAudit.md`.
- Fixed the early Credit-growth stall at its source: the starter Energy grid no longer caps Compute after roughly five Calculators, and stored Optimize Compute is now genuinely consumed by Training.
- Authored sixteen explicit Hardware tiers from Calculator to Singularity Core, removed the opaque per-tier cost exponent, and require each preceding tier so large Credit windfalls cannot skip eras.
- Authored the permanent Model order TinyChat → SmartChat → GPT-Class → Omni → Research → Agent → Enterprise → AGI → ASI Seed. Locked Models are hidden from the Model workspace and the next era is unlocked with INT from Strategy.
- Extended Patent 50 to a six-month baseline while reconnecting Research-model, skill, upgrade, Lab, Intelligence, Achievement, Tech, and equipped Patent acceleration.
- Centralized effective economy values, Hardware contributions, Training rate, Credit spending, Credit grants, and Compute consumption statistics.
- Upgraded telemetry and reports with canonical state values, lifetime spending/consumption, objectives, Model XP, cooldowns, utilization, idle percentage, action density, ROI signals, and additional concrete balance recommendations.
- Bumped saves to version 9 and migrated Milestone 9 Model IDs and skill progress to the authored Model order.
- Closed the repeat-Prestige exploit by requiring 250,000 Credits earned in the current run plus Model Level 5; lifetime Credits and permanent Model Levels can no longer make a fresh run immediately eligible.
- Rate-limited automatic Hardware purchasing and record each automatic purchase as a real purchase event instead of hiding it behind a generic automation label.
