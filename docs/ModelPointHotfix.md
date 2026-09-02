# Model Point and Session Export Hotfix Audit

## Model Point root cause

The runtime had two independently maintained representations of the active Model's points: `model.upgradePoints` and `model.progress[modelId].upgradePoints`. Training, save migration, Model selection, UI eligibility, and purchasing did not share a named point contract. A migrated or partially updated state could therefore show the active/global reward while the skill button and `improveModel` checked a different per-Model value and rejected the purchase by returning the original state. Because `StateStore.update` intentionally emits nothing for an unchanged state, the failed transaction looked like a dead button.

The hotfix makes the per-Model progress record canonical and maintains explicit `availablePoints`, `trainingCount`, `totalPointsEarned`, `totalPointsSpent`, and `skills` fields. `upgradePoints` and `trainings` remain synchronized compatibility aliases for version-18 saves. `upgradeModelSkill(state, modelId, skillId)` is the only purchase transaction; `improveModel` is a compatibility export of that same function, not a second implementation.

The UI reads the canonical per-Model pool, sends `{ modelId, skillId }`, and delegates the mutation through the EventBus and StateStore. Training completion writes both compatibility aliases in the same atomic state update. Save migration reconciles old aliases without inventing points.

## Empty Complete Session Export root cause

`Application.#telemetryCall` permanently set `TelemetryService.disabled = true` after any single telemetry exception. Every later `observe` and `record` call then returned immediately, while gameplay continued normally. The Developer Dashboard was correctly holding the application's recorder, but that recorder had silently stopped collecting data. The exporter health check only treated empty streams as invalid after five minutes, so a 223-second progressed session could be reported as `HEALTHY` with empty events and samples.

The recorder now remains live after an isolated telemetry-operation failure and retains a failure ledger. Export actions call `prepareExport(currentState)` on the injected live recorder, forcing a final state sample before generating the report. Validation now reports `INCOMPLETE` when an active session exceeds 60 seconds without samples and `BROKEN` when state progression exists without gameplay events. Telemetry reset also creates a fresh sampler and explicitly re-enables collection.
