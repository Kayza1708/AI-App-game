# Developer Analytics

## Activation

Developer mode is local and opt-in. Open the game with `?dev=1` (for example, `http://localhost:5173/?dev=1`) or set `localStorage['ai-singularity-dev-mode'] = '1'` and reload. The **Developer Analytics** navigation item and all cheats are omitted in normal mode. No telemetry leaves the browser.

## Architecture

The optional modules under `src/dev/` are deliberately separate from the game domain:

- `telemetry-service.js` owns a session, observes immutable before/after state transitions, aggregates clicks, and coordinates analyzers.
- `telemetry-events.js` defines analytics schema version 2, primitive immutable snapshots, monotonic clocks, validation, and bounded event history.
- `telemetry-sampler.js` reads effective values from `GameSystem`; it never reimplements production formulas. Sampling defaults to five seconds and supports 1/5/15/30-second intervals.
- `meaningful-action-service.js`, `downtime-analyzer.js`, `overload-analyzer.js`, and `bottleneck-analyzer.js` provide focused pacing analysis.
- `session-analyzer.js` produces summaries, balance flags, automatic prose, and the experimental Fun Density heuristic.
- `report-exporter.js` handles validated JSON import and JSON, CSV, and Markdown export.
- `telemetry-storage.js` retains ten recent unpinned sessions plus pinned sessions under a separate local-storage key.
- `developer-dashboard.js` renders real telemetry, SVG charts, reports, controls, import/export, and isolated simulation results.
- `deterministic-simulator.js` runs selectable strategies through the same `GameSystem` functions as human play.

Analytics errors are caught at the application boundary so the game loop continues. Analytics never writes to the normal save.

## Event schema

Every event includes `schemaVersion`, immutable `id`, stable local `playerId`, `sessionId`, `runId`, save/game versions, prestige and breakthrough levels, monotonic `timestamp`, monotonic session/play/lifetime times, `developmentCycle`, `category`, `type`, `source`, `label`, severity and signal flags, numeric amount/cost, primitive before/after snapshots, and primitive metadata. Meaningful events additionally contain an immutable player snapshot with Credits, Compute production/usage, Energy production/usage, Users, Reputation, INT, Gems, Hardware/Model tiers, and allocation percentages. Cooling and Heat remain explicitly `null` until those domain systems exist. Imported JSON must use the current analytics schema and contain event and sample arrays.

First-time funnel events cover initial Hardware, Training, Research, Patent, enterprise deployment, prestige, breakthrough, Agent, Datacenter, and future Quantum Hardware. Feature telemetry separately records unlock, first open, first use, cumulative use count, and delay between unlock and use.

## Meaningful actions

Purchases, material allocation or price changes, training start/completion, model deployment, Objective claims, Achievements, Patents, Tech nodes, event decisions, boosts, milestones, and Development Cycles reset the action timer. Passive ticks, repeated navigation, hover, and allocation changes below two percentage points do not. Optimize clicks are aggregated into bursts after 1.5 seconds of inactivity.

## Sampling and safeguards

Active play is sampled every five seconds by default. Samples contain resources, rates, market outputs, allocation, training and Patent ETAs, Energy, affordability, estimated purchase wait, Intelligence reward, modifiers, bottleneck, and Fun Density. Event and sample histories are capped at 10,000 records. Once capped, middle-era data is aggregated while the first 1,000 records remain intact. No full game state is cloned per frame, storage is written only when sessions end or session management is requested, event lists render only the latest filtered records, and charts update only while the dashboard is visible.

Economy samples also retain income, earned/spent Credits, biggest purchase, average purchase interval, idle and unused Compute, unused Energy, and every allocation percentage. Hardware purchase events include tier, previous/new ownership, exact cost, affordability/unlock waits, alternatives, and Credits before/after.

## Downtime

Downtime requires all three conditions: no meaningful action for 30 seconds, no useful affordable purchase or claimable reward, and no immediate strategic choice. Significant and severe thresholds are 60 and 120 seconds. Background time is excluded. Causes use effective state and include Credits, Research, Energy, Training, Demand, Capacity, and unavailable upgrades. Each period stores its state, nearest purchase, estimated wait, preceding action, and following action.

## Overload

An overload is flagged above four rewards in ten seconds, two modal events in 30 seconds, or eight toasts in 60 seconds. The contributing event IDs remain attached to the period.

## Bottlenecks

The analyzer reads effective market, Energy, Training, Research, Patent, affordability, Quality, Marketing, Reputation, and Adoption outputs. It classifies Demand, Capacity, Energy, Training, Research, Credits, Patent, Model Quality, Marketing, Reputation, Adoption, or No Clear Bottleneck. Periods retain transitions, duration, relevant values, and a suggested response.

## Experimental Fun Density

Fun Density is explicitly a heuristic, never an input to balance. The rolling 60-second score begins at 45, rewards meaningful decisions and progression rewards, and penalizes severe downtime, overload, and excessive navigation. It is clamped to 0–100. Reports include average, minimum, maximum timeline values, and explanations.

## Export and import

- JSON contains versions, summary, events, samples, downtime, overload, bottleneck periods, flags, and Fun Density.
- CSV contains scalar periodic sample fields.
- Markdown contains a shareable session report and automatic analysis.
- Import validates and clones telemetry into dashboard memory. It never replaces game state or the player save.

## Storage

Completed sessions use `ai-singularity-dev-sessions`, not `ai-singularity-save`. Ten recent unpinned sessions are retained; pinned sessions survive rotation. Quota or serialization failures leave active memory intact, expose a dashboard warning, and preserve immediate export.

## Developer controls and simulations

Every cheat emits `developer-cheat` and marks the session non-natural. Reports label those sessions, which should be excluded from standard balance comparisons. Time scaling, resources, model/training/Patent state, Energy stress, events, cycle eligibility, run reset, and telemetry-only reset are supported. Ten deterministic strategies run against isolated default state through the live domain functions and cannot modify the human save.

## Known limitations

Telemetry begins when developer mode loads and does not reconstruct activity from older saves. There is no offline-progress system in the current game, so `offline-progress-applied` is reserved but cannot fire. “Useful purchase” is a configurable heuristic based on the active bottleneck, not a proof of optimal play. Browser storage quotas vary. Simulations are deterministic policy probes, not human behavior models.

## Developer Reset
The red **🗑 RESET GAME** control is available only on the Developer Analytics screen. After one browser confirmation, it removes every `ai-singularity`-scoped local/session storage entry, stored analytics sessions, telemetry and simulation data, and matching IndexedDB databases. The service then installs `createDefaultState()`, creates a one-use fresh-reset marker, and reloads with `?dev=1`. The reload creates new session/run identifiers but suppresses bootstrap events so the new timeline begins at zero. Storage belonging to unrelated applications is intentionally left untouched.

## Milestone 8 balance telemetry
Active sessions now default to one-second sampling. Each sample records liquid and produced Compute, allocation outputs, Credits and revenue, market state, Energy balance, per-tier Hardware contribution, effective multipliers, Patent loadout and ETA, affordability, and the classified bottleneck. Purchase events include waiting time, unlock/affordability context, alternatives, effective gain, ROI, and payback estimates. Model, Patent, Hardware milestone, and Development Cycle events include their domain-specific timing and run context.

Downtime begins after 10 seconds without a meaningful available choice and records the 10, 20, 40, 60, and 120 second thresholds, likely cause, nearby purchases, and a recommended response. The automatic report includes Economy, Progression, Pacing, Hardware, Models, Patents, Prestige, overload, and actionable Suggestions. Fun Density remains an experimental heuristic; it now rewards strategically distinct unlocks while penalizing waiting, repeated identical purchases, excessive Optimize clicks, overload, and interface churn.

## Milestone 9 telemetry audit
The sampler reads live domain outputs and now distinguishes produced, consumed, wasted, and stored Compute. It also records the active training target, next Patent, dominant Tech branch, current Intelligence, Gems, Model, Hardware tier, Development Cycle, and all market and Energy outputs. Purchase events snapshot all relevant resources before and after, identify the spent currency, preserve the live bottleneck, and attach alternatives, wait time, production/revenue gain, ROI, and payback where those values are meaningful.

Navigation analytics retain first visit, visit count, total duration, and average duration for each player and developer screen. Session reports identify never-opened pages, unlocked-but-unused features, and ignored mechanics. The exported progression timeline is a chronological replay of real meaningful events rather than a reconstructed estimate.

Waiting analysis runs with the one-second sampler even when a purchase is affordable. It distinguishes affordability inactivity, Objectives, Development Cycles, Credits, Compute, Research, Energy, Training, and Patents while retaining threshold crossings and concrete next actions. Automatic suggestions compare real Calculator, first Patent, and Development Cycle timestamps with their current balance targets and flag purchase gaps, idle Training, unused Compute, ignored Research, irrelevant Energy, skipped tiers, overload, and premature billion-Credit growth.
