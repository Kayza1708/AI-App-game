# Milestone 17.2 audit

## Root causes

- Tech nodes used the private `data-tech-select` contract while the rest of the shell used explicit actions. Selection also duplicated state between `AppShell.#selectedTechId` and `state.ui.selectedTechnologyId`, and every selection forced a structural tree rebuild. The canonical selection remains `state.ui.selectedTechnologyId`; the shell field is only a pre-store interaction fallback.
- SVG children were not intrinsically the failure because `closest()` was already used, but the old selector contract was opaque and uninstrumented. Nodes now expose `data-action="select-technology-node"` and `data-node-id`, and child SVG/path clicks resolve through the node wrapper.
- Pan did not intentionally consume selection, but there was no measured gesture threshold. Pointer travel is now recorded and a node gesture over five pixels is treated as a pan rather than a selection.
- Training starts were emitted once by generic source inference and again by the canonical training-state transition recorder. The generic duplicate is removed.
- Analyzer Model Point spending counted events rather than their point costs; ignored-mechanic detection did not recognize `model-skill-upgraded`; the `backgroundSeconds` transport field actually contained milliseconds, obscuring active-versus-wall-clock timing; market bottleneck percentages counted samples instead of time.

## Technology catalog audit

The catalog contains 119 connected build-oriented nodes across 17 branches: 22 minor support nodes, 49 major/mechanic nodes, 24 keystones, 17 model or system unlocks, and 7 era gates. No disconnected prerequisite or duplicate-ID node is shipped. Minor nodes remain the primary candidates for a later content-language audit, but this hotfix deliberately preserves the existing build architecture.

## Directional balance pass

Early tier entry costs changed from `20 / 250 / 1,200 / 4,000 / 30,000` to `20 / 400 / 1,800 / 6,000 / 40,000`. This stretches generation transitions without changing per-unit cost growth or production formulas.

Training Compute anchors changed from `15 / 360 / 2,100 / 20,000 / 80,000 / 2,000,000` at Levels 1/2/3/4/5/10 to `15 / 420 / 3,000 / 25,000 / 120,000 / 6,000,000`. Training remains entirely Compute-based and Hardware, allocation, skills, and Technologies still change ETA.

Balance Lab is diagnostic rather than authoritative. In one-hour runs after this pass, Balanced reached Model Levels 2–8 at about 0.8, 4.0, 8.8, 17.5, 29.0, 39.0, and 52.0 active minutes. Compute/Training reached Levels 2–7 at about 0.5, 3.5, 8.8, 21.3, 37.5, and 47.8 minutes. Balanced reached Pocket Computer, Laptop, Gaming PC, and Workstation at about 2.5, 8.2, 21.7, and 50.0 minutes; strategy differences remain substantial.
