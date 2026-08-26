# Milestone 13 Architecture and Logic Audit

## Traced runtime

The audited lifecycle is bootstrap → default state → save migration → offline reconciliation → mission-period reconciliation → telemetry start → AppShell mount → bounded animation-frame ticks → autosave. The canonical `tickGame` and `economySnapshot` remain the sources of truth for online play, offline progression, telemetry, UI effective values, and the Balance Lab.

## High-confidence findings and fixes

- There was no offline lifecycle. Autosave now stamps `lastActiveTimestamp`; startup and visibility resume reconcile once, clamp negative time to zero, cap extreme jumps, and record the reconciled timestamp to prevent duplicate awards.
- Background tabs could continue being counted as active animation time. The game loop now stops on hidden, saves immediately, and resumes after offline reconciliation.
- Milestone 12 missions used fixed targets and ad-hoc selection. They now use stable player/period seeds, baseline-relative targets, feature-safe pools, and persisted period definitions.
- Old fixed mission and rewarded-ad functions remained beside their replacement systems. Those dead duplicate implementations were removed so missions and rewarded boosts each have one source of truth.
- Item/build identity previously considered only equipment, so a strategy with strong allocation or pricing choices was labelled Balanced. Inference now includes actual allocation, pricing, Energy infrastructure, skills, and equipment modifiers.
- Reward popups had no coordination boundary. A priority queue now orders and aggregates return rewards; offline results arrive as one Welcome Back presentation instead of many resource modals.
- Developer reports omitted offline, retention, Item, Gem, ad-placement, reward pacing, and build sections. Session report schema 3 includes them and carries `balanceRunId`.
- Existing modifier effects are still additive and can become large when future content expands. This is not changed without human balance evidence; the Balance Lab flags dominance rather than automatically retuning it.

## Remaining technical debt

`GameSystem.js` and `AppShell.js` remain dense and should be decomposed by domain in a future maintainability milestone. Offline chunks intentionally use the real tick function, but event timing inside a 10-second long-duration chunk is approximate. Client timestamps and balance-run identity are diagnostic, not secure; server authority is required for anti-cheat, commerce, or competitive systems.
