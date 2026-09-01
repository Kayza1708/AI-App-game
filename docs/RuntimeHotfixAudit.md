# Runtime hotfix audit

## Exact crash root

The reported property name identified the undefined value: `state` was not the direct receiver. The only production dereferences named `computePerSecond` are Hardware catalog entries and the derived `economy` object in telemetry/UI reporting. Catalog entries are authored constants. The unsafe runtime boundary was the telemetry derivation chain:

`TelemetryService.observe` → `TelemetrySampler.sample` → `createGameplaySnapshot` → `hardwareTelemetry` / `effectiveMultipliers` → `currentHardwareMultiplier` → `economy.computePerSecond`.

`ensureGameState()` only normalizes game state. It cannot make a separately passed derived `economy` argument valid. The previous fix therefore repaired the state source while leaving this second runtime input outside the contract. The telemetry helpers now derive a canonical `economySnapshot(state)` whenever their economy argument is omitted. Developer startup also validates the normalized state and the finished snapshot before telemetry or UI mounts.

## Occurrence and caller audit

| Occurrence | Function / caller | State source and guarantee |
| --- | --- | --- |
| `GameSystem.computePerSecond` | UI HUD/views, tick, Training, Patents, Objectives, telemetry | Public boundary calls `ensureGameState`; legacy input is repaired. |
| Hardware `item.computePerSecond` | `rawHardwareContribution`, `effectiveHardwareOutput`, purchase feedback | Item comes from `HARDWARE_CATALOG`; callers iterate/find the canonical catalog. Invalid IDs return before purchase. |
| `GameSystem.marketMetrics` | tick, UI via economy snapshot, telemetry, tests | Public boundary calls `ensureGameState`. |
| `GameSystem.economySnapshot` | UI Dashboard, Missions, Offline snapshots, telemetry | Public boundary calls `ensureGameState` and starts with `createDefaultEconomySnapshot`. |
| `createDefaultEconomySnapshot` | economy boundary, runtime diagnostics, tests | No state input; always returns the complete canonical shape. |
| `TelemetrySampler` economy reads | `createGameplaySnapshot`, affordability, Hardware/effective modifiers | State is normalized; derived economy now defaults to `economySnapshot(state)` and cannot be omitted. |
| `TelemetryService` rate reads | action and progression inference | Both before/after states are normalized by `observe`; GameSystem boundaries normalize again. |
| `DeveloperDashboard` and `session-analyzer` | completed telemetry samples | Dashboard returns when no sample exists; analyzer uses optional/default access for empty sessions. |
| `AppShell` rate reads | synchronous first render and view updates | `render` normalizes first; snapshot and Compute boundaries normalize independently. |

The first invalid runtime value was thus the optional, separately threaded telemetry economy value—not the normalized StateStore state. `validateGameState()` intentionally does not repair and reports missing Inventory, Models, Hardware, Allocation, Patents, Modifiers, Reward Queue, non-finite resources, version mismatch, or an incomplete/non-finite economy snapshot.

## Blocking offline modal root

Four independent renderers (`World Event`, `Patent Discovery`, `Item Discovery`, and `Reward Queue`) could each create a full-screen `.event-backdrop` during the same render. All used the same fixed z-index. DOM/stacking order then decided which invisible/full-screen layer owned pointer input. The Offline Continue handler was registered, but another presentation layer could intercept the click; subsequent renders recreated every still-pending layer.

`AppShell` now selects exactly one presentation owner in this order: Reward Queue, Patent, Item, World Event. Non-owning hosts are cleared. Dismissing an offline reward removes it from the queue and atomically clears `offline.rewardPending`; the next queued presentation may then render.

## Diagnostics

Fatal recovery now prints the complete stack and a serializable runtime snapshot: screen, modal, reward queue, offline pending state, overlay count, pointer lock, focused element, last economy snapshot, normalized state, versions, and validation status. Developer Mode exposes the same information through Runtime Inspector. Runtime validation runs before the first developer render and throws a descriptive contract error instead of allowing a later property dereference.
