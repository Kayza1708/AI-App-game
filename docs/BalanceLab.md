# Long-term Balance Lab

The Balance Lab is a Node/browser-compatible diagnostic simulator that calls real GameSystem actions and ticks. It supports Naive, Balanced, Compute, Research, Consumer, Enterprise, Agent, Energy, Model Specialist, Active, Idle, Prestige Rusher, and Prestige Saver agents. Human-constraint configuration reserves session length, sessions/day, reaction and purchase delay, overnight offline time, ad probability, mission engagement, and Gem behavior.

Durations include one hour, six hours, 24 hours, three days, seven days, and 30 days. Steps are 10 seconds for short runs, 60 seconds through one day, and five minutes for multi-day runs. Reports contain first purchase/tier/level/cycle times, cycle details, INT/hour, Credits/hour, Compute/hour, feature/Model/Patent/Item timelines, Energy efficiency, build identity, decisions/hour, and diagnostic target flags. The INT marginal-cost table inverts the actual prestige formula.

## Sample diagnostic findings

The one-hour runs produced 0–22 INT/hour; Enterprise had the highest Credits/hour (~2.33M) but did not dominate Compute or every other dimension. Prestige Rusher completed 16 cycles and was flagged for rapid consecutive prestige. Idle made no progress, as intended.

At 24 hours, active strategies reached roughly 2.8–3.8 INT/hour, while Prestige Rusher reached ~9.8 INT/hour through 235 tiny cycles and very weak Credits/hour. Most non-idle strategies became severely Energy limited (roughly 4.5–12% efficiency), which is suspicious and should be examined in the human run rather than automatically rebalanced.

Balanced seven-day and 30-day smoke simulations complete in seconds and remain finite. Multi-strategy month sweeps are intentionally left as a CLI workload rather than automatically blocking every test run.

These bots are deliberately simple, do not understand every unlock, and are not evidence of perfect strategy balance. Use their flags to form playtest questions, not to auto-tune production curves.
