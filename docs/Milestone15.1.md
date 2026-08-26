# Milestone 15.1 — Correctness and complete session telemetry

## Developer-tool isolation

Developer Analytics and Runtime Inspector are appended by `navigationItemsForState` only when the canonical application-level Developer Mode flag is true. They have no feature ID or Technology node and never pass through `viewUnlocked`. Gameplay Technology purchases, Development Cycles, Breakthroughs, and full gameplay resets cannot reveal or hide them. Normal mode never constructs the developer dashboard.

## Model Point accounting

Training completion is the sole source of the base Model Point reward. Every completion atomically increments the trained Model's level, training count, available points, and total earned points by one. Spending a point atomically decreases available points and increases total spent points by the configured rank cost. Developer validation enforces:

`totalPointsEarned = availablePoints + totalPointsSpent`

Version 16 migration derives historical spent points from saved skill ranks and preserves all unspent points. Development Cycles intentionally reset run-specific Model levels, points, and skills while preserving permanent Model ownership and Technologies.

## Complete session export

The prominent Complete Session Export panel produces one self-contained JSON document named `ai-singularity-session-<sessionId>.json`. Its top-level structure is:

- `identity`: player/session/balance-run IDs, schema versions, start/end and active/background timing, natural/developer status.
- `runs`: every closed and active run, boundaries, state snapshots, economy, purchases, Training, Model Points, Research, Patents, Items, Technologies, market data, and activity.
- `events`: the complete chronological immutable event timeline.
- `samples`: every retained periodic gameplay sample.
- `navigation`: page duration, discovery, first-use, and ignored-feature analysis.
- `rewards` and `offline`: reward and return history.
- `analysis`: session summary, downtime, overload, bottlenecks, Fun Density, flags, and automatic suggestions.
- `builds`: per-Model Training/Point history, skill choices, equipment actions, and inferred identity.

`END SESSION & EXPORT` finalizes telemetry and downloads JSON plus Markdown without resetting gameplay. Development Cycles close one Run and open the next inside the same Session; they never clear events, samples, UX data, or earlier Run summaries. Only Start Clean Balance Run deliberately clears telemetry before creating a new natural Session. Telemetry-only reset does not alter gameplay.

## Build architecture audit

Canonical economy effects remain connected across Model skills, Tech, equipped Patents, Items, Artifacts, market choices, and allocation. The intended analytical archetypes are Compute, Consumer, Enterprise, Research, Efficiency, Agent/Automation, and Balanced. Research benefits from Research allocation, scientific Model skills, deployed Model identity, Tech modifiers, and Item/Artifact modifiers. Limited Patent slots already create loadout choice, although the current 50-Patent catalog should receive a later authored coverage pass to improve Enterprise and Agent-specific options. Prototype Artifacts remain developer-only and are not presented as normal content.
