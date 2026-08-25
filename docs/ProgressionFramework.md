# Milestone 11 Progression Framework

## Philosophy

Every run converts temporary infrastructure into permanent Intelligence (INT). INT does not merely increase output: lifetime INT reveals the game in layers. A fresh company sees only Credits, Compute, Calculator Hardware, TinyChat, Optimize, and Objectives. Marketing, Research, Patents, Model specialization, Energy, Automation, Agents, Enterprise play, planetary infrastructure, and Breakthrough appear only when they become relevant.

## Single balance source

`src/config/balance.js` owns the tunable constants for Hardware, Training, Market, Patents, INT, Breakthrough, and events. Domain code uses the shared `curveValue` and `powerCurve` primitives rather than maintaining private copies.

| Curve | Formula | Initial parameters |
| --- | --- | --- |
| Hardware unit cost | `baseCost × costGrowth^owned` | `costGrowth = 1.16` |
| Model XP | `xpBase × level^xpExponent` | `16 × level^1.4` |
| Training work | `workBase × level^workExponent` | `12 × level^1.46` |
| Development Cycle INT | `floor((runCompute / computeScale)^exponent)` | scale `1,000`, exponent `0.32` |
| Breakthrough multiplier | `1.65^breakthroughs` | applied to future INT |
| Patent discovery | Log interpolation across cumulative time anchors | Patent 1: 25m; Patent 50: 180d |
| Hardware market reach | `marketBase × tierMarketGrowth^tier` | tier growth `2.15` |

Telemetry exports the active configuration with every sample, making a session reproducible after constants change.

## Unfolding systems

Lifetime INT—not unspent INT—controls visibility, so spending cannot relock a feature.

| Lifetime INT | System |
| ---: | --- |
| 0 | Core company |
| 1 | Development Cycles and permanent Model eras |
| 4 | Marketing Division |
| 10 | Research Division and Compute Allocation |
| 20 | Patent Office and account progression |
| 35 | Model Development skill spending |
| 55 | Energy Grid and advanced Model stats |
| 80 | Automation and the permanent Technology Tree |
| 120 | Agent Economy |
| 170 | Enterprise Customers |
| 240 | Global Markets |
| 350 | Datacenter Network |
| 500 | Advanced AI Architectures |
| 800 | Quantum Computing |
| 1,200 | Planetary Compute |
| 10,000 | Breakthrough visibility |

The Model skill surface unfolds independently: Quality, Efficiency, and Context are understandable immediately; specialized and operational stats arrive alongside the systems they influence.

## Development Cycles

Run Compute is the single prestige input. Credits, Hardware, and market growth matter because they increase Compute; this keeps the loop legible. A Cycle cannot repeat without new-run Compute because `run.computeProduced` resets to zero. Permanent Model unlocks and Model builds survive, while temporary company infrastructure resets.

The fractional exponent produces small early rewards and increasingly expensive later rewards. Breakthrough Insight multiplies future INT, creating a second long-term acceleration layer without making it available during early play.

## Breakthrough

Breakthrough requires both 10,000 lifetime INT and `1e24` lifetime Compute. It resets INT, Technology choices, Patent levels, and other INT-bound progression. It preserves player profile, Gems, Achievements, cosmetics/account purchases, retention state, statistics, and earned Breakthrough Insight. This is intentionally unreachable in an ordinary early session.

## Unlimited notation

`formatNumber` uses K/M/B/T, then alphabetic suffixes (`aa`, `ab`, …), avoiding scientific notation and repeated `Intl.NumberFormat` allocation. It remains a display concern; simulation continues to use JavaScript numbers.

## Telemetry

One-second samples include the active balance configuration, next feature threshold, chronological feature unlocks, average INT per run, intervals between Development Cycles, Technology choices, abandoned unlock paths, and deployed Model distribution. Feature unlock events are derived from the same lifetime-INT gates used by gameplay.

## Known scaling boundary

The formatter supports the full finite JavaScript number range. Values beyond approximately `1.8e308` require a future decimal/mantissa simulation type; Milestone 11 deliberately avoids introducing an incompatible numeric representation before the economy reaches that boundary.
