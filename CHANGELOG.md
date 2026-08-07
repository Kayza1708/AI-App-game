# Changelog

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
