# Milestone 10 Gameplay Logic Audit

This audit traces the shipped save state through `Application`, `StateStore`, `GameSystem`, `AppShell`, and Developer Analytics before Milestone 10 changes were made.

## End-to-end loop

1. A Hardware purchase spends Credits and increments its owned quantity.
2. `computePerSecond` combines owned Hardware, milestones, upgrades, Tech, Patents, Achievements, events, and Energy efficiency.
3. `tickGame` allocates produced Compute to Training, Research, Data Processing, Agents, and Inference capacity.
4. Training produces XP. XP raises the selected Model's Level and grants manual Upgrade Points.
5. Deployed Model stats, allocation, Marketing, Reputation, Adoption, price, and Hardware tier determine Demand and Capacity.
6. Users move toward the smaller of Demand and Capacity, and every served User generates Credits through `revenuePerUser`.
7. Credits fund Hardware, Energy, Marketing, and run upgrades. Research drives permanent Patents. Development Cycles award Intelligence for Models, Tech, and Patent levels.

## Findings by system

| System | Audit result | Milestone 10 action |
| --- | --- | --- |
| Credits | Revenue continued mathematically, but early Energy capped Compute and Capacity after only a few Calculators, making purchases appear to stop income growth. Lifetime spending was not stored in game state. | Remove the unintended early hard-cap, centralize spending, and expose the real revenue chain. |
| Compute | Production was centralized, but telemetry independently recreated consumption and waste. Stored Compute could grow without a visible utilization explanation. | Add one canonical effective economy snapshot and lifetime produced/consumed/wasted statistics. |
| Allocation | All five allocations affected gameplay, but inactive Training allocation became stored Compute and was easy to misread as consumed. | Report allocated, consumed, stored, and wasted Compute separately. |
| Training | XP and Upgrade Points worked, but completion telemetry could duplicate the start event and Training ROI was absent. | Preserve XP-only progression, add completion/level economics, and report Training ROI. |
| Research | Research currency powered Research upgrades; Patent research used a separate derived rate. `flatResearch` Patents were disconnected after an earlier formula change. | Reconnect all Research modifiers through the canonical Patent rate. |
| Users / Market | Demand, Capacity, price, Reputation, Adoption, Marketing, Model stats, and Inference were connected. Early Energy starvation indirectly froze Capacity. | Stabilize early Capacity and expose utilization and bottleneck causes from canonical values. |
| Energy | The 0.1 baseline supply was exhausted by roughly five Calculators. This was the root cause of the reported early economy stall. | Provide an intentional starter grid and move Energy pressure to later Hardware. |
| Hardware | Sixteen tiers existed, but names did not match the intended progression and a generated `2.4^tier` cost multiplier obscured balancing. | Use explicit authored costs, outputs, and Energy demand for all sixteen requested tiers. |
| Models | Locked Models were rendered as complete cards. Several identity modifiers (`hardware`, `allOutput`, `quality`, `energy`, `coding`) were defined but never consumed. | Show only permanently unlocked Models on the Model page, move the next INT unlock to Strategy, and connect every identity. |
| Patents | Slots, levels, and INT upgrades worked. The cumulative curve ended near 90 days instead of 6+ months, and `flatResearch` was dead. | Extend the curve to 180 days and reconnect Patent research effects. |
| Tech Tree | Nodes applied strengths and tradeoffs, but Hardware cost sign semantics were inconsistent. | Normalize Hardware discount/cost modifier semantics. |
| Development Cycle | Permanent Model Levels and lifetime Credits made a completed run immediately eligible again, enabling repeated zero-progress cycles; Model unlocks were also not presented as the primary next-era reward. | Require fresh run Credits before every cycle, preserve permanent Model builds, and show the next Model era beside cycle decisions. |
| Achievements / Objectives | Progress and rewards worked; multiple unlocks shared one toast but telemetry recorded each. | Keep logic, add current Objective and claims to telemetry/reporting. |
| Events | Choices, costs, modifiers, and cooldowns worked. Hardware-cost event semantics were inverted. | Correct modifier semantics and log cooldown start/end values. |
| Automation | Auto-buy could run once per animation frame and telemetry only labeled it as a generic automation action, hiding purchases and creating bursts. | Rate-limit auto-buy and emit the real Hardware purchase plus automation context. |
| Upgrades | Run upgrades worked, but effective values and ROI were recalculated differently by UI and telemetry. | Use canonical effective outputs for display and analytics. |
| Gem Shop | Purchases persisted and Research Labs affected Patents. Several future convenience items intentionally have no live effect. | Report inactive convenience purchases honestly; do not fabricate power. |
| Telemetry | Events were state-diff driven and generally isolated, but samples duplicated economy formulas, lifetime totals could remain zero, claims/cooldowns were incomplete, and reports lacked several utilization/ROI measures. | Sample canonical state-derived values, expand event diffs, and add actionable ROI/utilization findings. |
| Save System | Version migration preserved legacy Model IDs and defaults, but nested Model skill progress needed stronger normalization for future IDs. | Bump the save version and normalize legacy and Milestone 9 Model IDs into the authored Milestone 10 order. |

## Confirmed dead or misleading values

- `energy.stored` is persisted but has no producer or consumer. It remains reserved state rather than being displayed as functional storage.
- Cooling and Heat do not exist in the simulation. Telemetry must keep them unavailable rather than invent values.
- Gem convenience entries such as themes and save slots are account purchases but do not yet alter simulation power.
- The previous Hardware catalog's generated tier multiplier made displayed base data differ from authored source numbers.
- Model identity keys for Hardware, global output, Quality, Energy, and Coding were previously inert.

## Balance targets adopted

- The starter grid supports the Calculator loop without forcing an unexplained Energy purchase.
- Hardware costs and outputs are explicit, sequential, and increase payback gradually rather than through a hidden tier exponent.
- Patent cumulative targets are 25 minutes, 5 hours, 1 day, 1 week, 3 weeks, 2 months, and 6 months for Patents 1, 5, 10, 20, 30, 40, and 50 before build bonuses.
- The Model page contains TinyChat on a fresh save. Permanent Model eras appear there only after an Intelligence unlock.
- Telemetry values come from the same effective economy snapshot used to explain the live loop.
