# Milestone 15 — Core-loop simplification

## Audit and runtime root cause

`AppShell.#updateView` treated Developer Analytics specially but did not terminate the Runtime Inspector path. The generic final branch was therefore reached for `runtime` and attempted to write Missions markup into a nonexistent `[data-missions-list]` node. The shell now has explicit view branches, owns one stable workspace host, and returns after updating developer-only views. Runtime Inspector and Developer Analytics failures are caught and rendered inside their own host rather than crossing the application boundary.

## Training and Model Points

Active gameplay no longer accumulates XP. A Training project invests canonical effective Training Compute and completes exactly one level:

`ETA = remaining required Compute / effective Training Compute per second`

Base work is log-interpolated between authored anchors, then multiplied by the selected Model's bounded training scale. The anchors are: Level 1 `15`, 2 `360`, 3 `2,100`, 4 `20,000`, 5 `80,000`, 10 `2M`, 20 `1B`, and 50 `1e15` Compute. Further finite anchors cover levels 100, 250, and 500. This single controlled curve replaces the prior compounded XP and Training curves.

Each completion grants the trained Model exactly one unspent Model Point. Basic Quality, Efficiency, and Popularity are immediately available. Skill costs by outgoing rank begin `1, 1, 1, 2, 2, 3, 3, 4, 5, 6`; advanced categories remain Technology-gated. Quality changes Demand and revenue per User, Efficiency changes serving Capacity, and Popularity changes Demand. UI previews call the same economy snapshot used by simulation.

Development Cycles reset per-run Model levels, points, skills, and active Training while keeping permanently unlocked Models and purchased Technologies. Version 15 migration keeps the legacy level and legitimate unspent points/skills, removes XP without converting it into levels, maps active Training by completion percentage, and refunds removed Hardware sub-upgrade investment.

## Technology and Hardware presentation

The authored 102-node, ten-era graph remains unchanged. It is rendered as compact icon nodes over SVG prerequisite connections, with distinct locked, unaffordable, available, and purchased states. The viewport supports pointer panning and wheel zoom; a separate detail panel contains prerequisites, exact effects, trade-offs, unlock text, cost, and purchase action. Available and Lifetime INT remain separate, and spending never changes the Lifetime INT income bonus.

Hardware cards now focus on owned units, effective Compute, tier milestones, and buying the next machine. Processor, Memory, and Optimization sub-upgrades are inert legacy compatibility data rather than active decisions.

## Session analytics

A Human Session continues across Development Cycles. A cycle emits `run-ended`, the Development Cycle action, and `run-started`; run summaries retain duration, INT, Training completions, Points earned/spent, skills chosen, and before/after Demand, Capacity, and revenue. Balance Lab output is always simulated data and now includes Popularity, Quality, Efficiency, and Balanced Model-build policies.

## Diagnostic one-hour results

| Simulated policy | First cycle | Trainings | Lifetime INT | Characteristic build |
| --- | ---: | ---: | ---: | --- |
| Balanced | 1,940s | 16 | 4 | Quality-led balance |
| Quality | 1,910s | 17 | 4 | Higher value and demand |
| Popularity | 2,890s | 12 | 3 | Consumer demand |
| Efficiency | none in first hour | 8 | 0 | Serving capacity |

These bots expose structural differences but are not Human Playtest evidence. The next test should focus on first-point comprehension, whether Training remains a useful background goal, Hardware-driven ETA changes, bottleneck reactions, first-cycle timing, and whether a permanent branch purchase makes Run 2 feel different.
