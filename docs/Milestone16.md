# Milestone 16 — Core Loop and Analytics Audit

## Canonical sources and root causes

- `GameSystem` remains the only economy transaction layer. Training completion, manual Compute, Marketing, Development Cycles, objectives, and modifier effects are mutated there; UI and telemetry only observe immutable before/after states.
- The zero session report was not a Markdown-only defect. `TelemetryService.observe()` maintained exact cumulative economy deltas in `this.economy`, but `getReport()` did not pass that accumulator to `analyzeSession()`. The analyzer consequently tried to reconstruct totals from periodic samples. A session with sparse/missing samples therefore became a plausible-looking zero report. The report now carries the accumulator plus canonical starting/ending snapshots and validates contradictions.
- Model Points were already awarded by the canonical completion transaction in 15.1, but Model screen headings were interpolated only when the view mounted. Incremental renders updated the progress bar, not Level/Point text or skill affordability. Stable data hooks and a same-tick skill-list refresh now update the open screen.
- Hardware track state remained in the default state contract and telemetry even though its UI/actions had been retired. Save migration now reads legacy tracks only long enough to calculate the established deterministic Credit refund; runtime state and formulas no longer contain them.
- Marketing and Allocation were still represented by gameplay Technology feature gates. Basic Marketing is now core; full Market and Allocation navigation are unlocked by the first Development Cycle. Their former system nodes can remain purchased legacy Technology without controlling those screens.
- Objectives were held in run state and omitted from the Development Cycle preservation list. They are now account-level state and use a data-driven 100+ entry roadmap. The screen renders bounded Current/Upcoming groups and a collapsed Completed archive.

## Session and Run contract

A Session starts with the application/clean analytics session and owns all raw events, samples, navigation history, economy accumulators, and analyses. A Run starts at Session start or immediately after a Development Cycle. Prestige emits `run-ended`, archives its start/end snapshots and totals, emits the Development Cycle event, and emits `run-started` without clearing Session arrays.

Complete JSON and Markdown exports are derived from the same analyzed report. Missing metrics are reported as `Unavailable — insufficient telemetry`; contradictions produce `TELEMETRY_INCOMPLETE` with explicit validation issues rather than silently becoming zero.

## Progression and migration

Save version 17 removes active Hardware sub-upgrade tracks, retains legacy investment refunds, preserves claimed Objectives across Development Cycles, and retains INT, Lifetime INT, Technology, Models, Inventory, Patents, Items, and Artifacts. Developer pages remain outside save/progression feature data and are controlled only by canonical developer-mode detection.

## Strategy foundation

Technology, Model skills, deployed Model identities, allocation, equipped Patents, and Item modifiers all feed canonical Compute, Training, Demand, Capacity, Revenue, Research, and Patent calculations. Compute, Consumer, Enterprise, Research, and Agent identities therefore describe measured consequences rather than opt-in labels. Research is an explicit opportunity-cost chain: Compute → Research allocation → Research/sec → Patent progress → persistent build effect.

## Human validation caveat

Balance Lab output is diagnostic, not a substitute for human timing. The first Development Cycle requirement was tightened (Workstation era, Model Level 6, and a larger run-Compute scale) to address the observed 16-minute/3-INT result. The intended 30–45 minute first cycle and approximately 1 INT must be verified by the next clean human session.
