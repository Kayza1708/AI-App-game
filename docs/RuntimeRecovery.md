# Emergency Runtime Recovery Audit

## Root cause

The white screen was caused before the first render by the lookbehind expression in `src/ui/number-format.js`:

```js
/(?<=\.[0-9]*[1-9])0+$/u
```

`number-format.js` is imported by `AppShell`, which is imported by `Application`, which is imported by the entry module. Browser engines and embedded WebViews without lookbehind support reject that module while parsing it. Because module parsing happens before `main.js` executes, no application code or error UI could run and `#app` remained empty.

The expression was replaced with equivalent forward-only string cleanup. The entry point now also owns a visible recovery boundary, so a future bootstrap failure cannot result in an empty page.

## Runtime trace

The verified startup chain is:

1. `index.html` exposes `#app` and imports `src/main.js`.
2. `main.js` calls the isolated `bootstrap` boundary.
3. `Application` creates the event bus, fresh default state, save system, shell, render pipeline, and game loop.
4. `SaveSystem.load` either returns a normalized version-10 state or `null`; `null` keeps the already-created fresh state.
5. Developer telemetry is created only under `?dev=1` or the explicit local flag.
6. Events are bound once, `AppShell.mount` writes the shell, and the first synchronous Dashboard render completes before the game loop and autosave start.
7. Subsequent render and tick exceptions stop the loop and invoke the visible recovery boundary.

## Additional defects found

- The formatter's unsupported lookbehind could fail at module-parse time.
- Save validation checked only a few top-level primitives. A version-valid save containing `null`, strings, invalid Model IDs, negative Hardware, or malformed arrays could pass validation and later fail at `.includes`, `.map`, or `.filter`.
- `AppShell.#view` eagerly constructed every locked screen while rendering Dashboard. Hidden Model, Patent, Tech, Gem, and Energy templates could therefore throw before their feature was unlocked and added unnecessary first-render work.
- Tutorial step 9 forced navigation to Compute Allocation even though the Milestone 11 feature gate hides Allocation until 10 lifetime INT. The tutorial became impossible to finish on a fresh save.
- Autosave storage exceptions were not isolated.
- Telemetry exceptions were logged but telemetry remained active, allowing the same failure to repeat on every state change.
- Animation-frame render and simulation exceptions had no application-level recovery boundary.
- Navigation visibility logic lived inside the DOM renderer and could not be regression-tested independently.
- HTML escaping depended on creating a temporary DOM node while all view templates were being eagerly constructed.
- AppShell event listeners were not removed during application shutdown or hot-module replacement, allowing duplicate handlers after repeated development reloads.

## Recovery architecture

- `src/core/bootstrap.js` catches synchronous initialization failures and renders a persistent recovery panel with technical details.
- `RenderPipeline` and `GameLoop` contain asynchronous errors and route them to the same boundary.
- Telemetry is disabled after its first boundary failure; normal simulation and rendering continue.
- Save loading normalizes arrays, numeric records, Model ownership/deployment, nested maps, allocations, events, and UI state. Corrupt JSON falls back to the fresh state.
- View templates are lazy. Only the currently visible, unlocked screen is constructed.
- Navigation generation is a pure state-derived function shared by runtime and tests.

## Remaining technical debt

- The repository has no installed real browser automation dependency, and the execution environment blocks Playwright downloads. Runtime regression tests use a deterministic DOM contract harness in addition to Vite build and dev-server checks.
- The UI shell remains a large class. Its views are now lazily evaluated, but splitting each established view into a focused renderer would improve maintainability in a future refactor.
- JavaScript `number` remains the simulation type and therefore retains its finite-range ceiling.
