# Core Loop Rebuild audit

## Canonical paths

- Credits, Users, Demand, Capacity, Revenue, Compute, Training, Research, Patents, Energy, Development Cycles, and INT are calculated by `GameSystem` and exposed through `economySnapshot`.
- Hardware track ownership, pricing, and purchases are canonical in `HardwareUpgradeSystem`; UI previews call the same Compute, Training ETA, and Market functions used by simulation.
- System unlock ownership and INT spending are canonical in `TechSystem`. Lifetime INT makes nodes visible; it never purchases them.
- Model statistics use `effectiveModelStat` plus the Modifier system, so Model Points affect actual Market, Training, Research, Enterprise, Agent, and Energy outputs.
- Telemetry samples consume `economySnapshot`; action telemetry compares canonical before/after snapshots.

## Balance changes

Hardware tiers retain a quick Calculator but use a steeper era curve. Costs now begin `20 → 250 → 1,200 → 4,000 → 30,000 → 1M` and grow into extremely large late-game values. Production grows from `0.5/s` into sextillion-scale Compute without lowering time-to-progression by itself.

Training work is `5 × level^1.65 × 1.9^(level-1) × 1.12^completedTrainings × modelScale`. Completion time is never a fixed timer: remaining required work is divided by effective allocated Training Compute.

Each Hardware generation now has three repeatable tracks: Processor (+12% tier output), Memory (+8% global Training efficiency), and Optimization (+8% Inference capacity). Their price is `tier base cost × 3 × 1.78^level`.

## Save 13 migration

Version 12 and earlier saves retain all permanent value. Every three purchased legacy Hardware upgrades become one level in each new track, distributed Processor → Memory → Optimization. Legacy feature access is converted into purchased system nodes based on the old Lifetime INT thresholds. Legacy Hardware upgrade IDs are removed only after their levels are credited.

## Unlock contract

Fresh accounts expose only the core loop. Energy never constrains production before `Energy Infrastructure` is purchased. Research, Patents, Items, Marketing, Automation, Enterprise, and Agents similarly require explicit Tech purchases. Development Cycles preserve purchased Tech nodes.
