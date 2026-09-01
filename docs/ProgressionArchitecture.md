# Progression Architecture 0.15

## Canonical loops

Hardware produces Compute. Active Model Training consumes its allocated Compute continuously. Training improves that Model and grants unspent specialization points. Deployed Model attributes determine Demand, Capacity, Users, and Credit income. Research allocation converts Compute directly into Patent discovery progress.

Energy was removed from active gameplay in save version 14. Legacy Energy payloads are replaced by inert migration defaults and never constrain Compute, Training, Research, or income.

## Training

Training work is model-specific:

`required = piecewiseLevelWork(level) × 1.035^modelTrainings × model.trainingScale`

Level growth is `1.32` through level 10, `1.20` through 25, `1.13` through 50, `1.09` through 100, and `1.06` thereafter. This replaces the old compound `level^1.65 × 1.9^(level-1) × 1.12^trainings` curve that caused catastrophic ETAs. Legacy active jobs retain their completion percentage against the new requirement.

Representative base work: level 1 `8`, level 10 `97`, level 25 `1,499`, level 50 `31,837`, level 61 `82,153`, level 100 `2,367,336`.

## Intelligence and Development Cycles

Lifetime Intelligence provides one canonical global Credit multiplier:

`income multiplier = 1 + Lifetime INT × 0.10`

Spending available INT never reduces Lifetime INT or this multiplier. Development Cycle gain combines run Compute, run Credits, highest Hardware tier, highest per-Model level, and Breakthrough progression. Model levels and active Training reset; permanent Technologies and permanently unlocked Models survive.

The current diagnostic first-cycle result is 2,190–2,220 seconds across Balanced, Compute, and Consumer one-hour strategies. The bots are diagnostic rather than human balance truth.

## Permanent Technology roadmap

The roadmap contains 102 positioned nodes across 17 active branches and ten named eras. Costs within each branch progress from `1` through `15`, `2.5K`, `1M`, `1T`, and `1e36` INT. Nodes are always visible, require their authored prerequisite, and never auto-purchase from Lifetime INT.

## Research and Patents

Research allocation produces Patent progress directly from effective Compute and Research specialization. Requirement is:

`120 × 1.62^discoveryIndex × 1.35^floor(discoveryIndex / 10)`

Representative requirements for Patents 1, 2, 5, 10, 20, 30, and 50 are `120`, `194`, `826`, `9,221`, `1,549,887`, `260,485,890`, and `7,357,868,682,523` Research.

## One-hour Balance Lab snapshot

| Strategy | First cycle | Cycles | Lifetime INT | Characteristic result |
| --- | ---: | ---: | ---: | --- |
| Balanced | 2,190s | 2 | 5 | Broad economy |
| Compute | 2,200s | 1 | 3 | Higher Training progression |
| Consumer | 2,220s | 2 | 5 | Higher user focus |

The next human run should validate second-cycle pacing, the perceived value of the +10% Lifetime INT bonus, training waits at levels 20–60, Patent ETA clarity, and whether branch differences remain legible after several permanent purchases.
