# Milestone 20 — First-run engagement and telemetry repair

## Root causes

The 75-minute run exposed two separate issues. First, normal-mode `Application` instances did not create a `TelemetryService`; the recorder was incorrectly coupled to the Developer Dashboard gate. State transitions also supplied only the new state, forcing telemetry to infer the previous state from mutable recorder state. Recording is now always local and active, while the dashboard remains developer-only. The active event journal survives hash-route reloads, and `StateStore` emits the exact previous and next states.

The progression dead zone was caused by the permanent roadmap ordering: after four onboarding goals, its next three goals required INT or permanent Technology that could only be earned after a Development Cycle. Players could progress numerically but could not satisfy the six claimed-goal requirement or see the locked Cycle requirements because Strategy navigation was unavailable. The roadmap now places Users, Marketing, Compute, Training, Model Level, and core-run User and Marketing goals before permanent-Technology goals. A live Cycle panel is visible on the Command Center.

## First-run progression and Cycle

The first Cycle remains progression-derived: Model Level 9, Hardware Tier 4, six claimed Progression Goals, 60M run Credits, and 400M run Compute. The supplied natural-playtest profile (Level 12, Tier 5, 61M Credits, 400M Compute, six goals) is eligible for one INT; the former 5M Credits/24M Compute rush profile is not.

| Window | Before | After authored beats |
| --- | --- | --- |
| 0–15m | Hardware and Training numbers | onboarding, Users, Marketing, Compute, Training and Model Point goals |
| 15–40m | sparse tier changes | Server/GPU progression, Model goals, first event at ~8m, basic Allocation in Run 1 |
| 40–55m | mostly saving | larger User/Training goals, visible company infrastructure art |
| 55–75m | invisible eligibility blockers | always-visible five-part Cycle checklist, ETA, and prominent ready CTA |

## Progression Goals and retention Missions

The first-run catalogue now includes first Calculator, first Compute, first Training, first Model Point, 1K/10K Users, three Marketing campaigns, 1K Compute/sec, six Trainings, Model Level 10, 100K Users, and ten Marketing campaigns. The existing long-term hardware, user, revenue, compute, training, Marketing, Research, Patent, Cycle, and Technology tracks follow them.

Daily Missions draw from Credits, Compute, Hardware, Training, Model improvements, Users, Research, Items, and exploration. Weekly Missions cover revenue, Model levels, Items, Development Cycles, and Patents. Monthly Missions cover sustained revenue, Training programs, INT, Model eras, Hardware eras, and rare Items. Locked mechanics are filtered and mission Credits remain capped supplemental income; Gems remain the headline reward. Login rewards continue to use one UTC calendar date and cannot be advanced by reloads.

## Gems and Boosts

| Source | Gems | Sink | Cost |
| --- | ---: | --- | ---: |
| Daily/Weekly/Monthly Missions | 2 / 7 / 24 minimum | Finish Training | dynamic |
| Daily login/streak | 1–3 | Double Training Points | dynamic |
| Achievements/caches | controlled milestone amount | Revenue / Compute / Training Boost | 4 |
| Explicit rewarded provider callback | 2, capped | 10-minute Revenue Cache | 3 |

Boost modifiers do not multiply indefinitely. A Revenue, Compute, or Training Boost adds +100% for 15 minutes; reactivation extends the same source's expiry rather than adding another simultaneous modifier. Browser builds expose no fake rewarded-ad completion. Every Gem activation uses the canonical ledger and telemetry records source, duration, cost, and canonical economy before/after.

## Market and Model value

The playtest's ~10% utilization was not addressed with a global Demand multiplier. The Market continues to present Capacity investment versus Quality, Popularity, Marketing, and Price choices. Representative one-point TinyChat previews are:

| State | Quality | Efficiency | Popularity | Bottleneck |
| --- | ---: | ---: | ---: | --- |
| Early (Calculator/Home Computer) | +26.23% Demand plus Revenue/User | +12.50% Capacity and Training | +16.39% Demand | Demand limited |
| Mid (Workstation/GPU) | +3.45% Demand plus Revenue/User | +12.50% Capacity and Training | +2.88% Demand | Demand limited |

Efficiency remains strongest as a headline percentage in the mid state, but Quality adds monetization and Popularity is a lower-cost reach choice. This is retained as a balance risk rather than forcing identical effects.

## Deterministic validation

Aggressive Human-like simulation currently remains materially more conservative than the supplied natural human run. That discrepancy is reported rather than hidden by globally accelerating the economy.

| Minutes | Tier | Model | Users | Credits/s | Compute/s | Goals | Research | Cycle | INT | Beat interval |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- | --- | ---: | ---: |
| 15 | 2 | 4 | 321 | 78 | 61 | 0 | No | No | 0 | 150s |
| 30 | 3 | 5 | 1,095 | 266 | 491 | 7 | No | No | 0 | 225s |
| 45 | 3 | 6 | 1,652 | 401 | 1,074 | 8 | No | No | 0 | 300s |
| 60 | 3 | 7 | 2,007 | 487 | 1,657 | 9 | No | No | 0 | 360s |
| 75 | 4 | 8 | 6,404 | 1,555 | 6,961 | 10 | No | No | 0 | 375s |
| 120 | 4 | 10 | 18,297 | 4,444 | 21,901 | 12 | No | No | 0 | 514s |

The supplied human state, not this lagging agent, is the primary pacing anchor: it now reaches eligibility at the intended 60–75 minute boundary. Remaining work is to make the simulator reproduce human bulk-buy, allocation, and saving behavior before using it for further economy tuning.

## Visual identity and remaining risks

All sixteen Hardware tiers and all nine Models now resolve to specific lightweight SVG paths instead of falling back to one server/cube icon. Silhouettes progress from desktop devices through datacenters, planetary/orbital facilities, and stellar structures. The new Cycle panel, active-Boost chips, glow hierarchy, 44px actions, and responsive stacking retain the dark teal/purple language.

Remaining risks are a conservative simulation agent, first-run SmartChat still depending on permanent Technology architecture, and Efficiency's high mid-game value. A follow-up natural playtest with repaired telemetry is required before further balance changes.
