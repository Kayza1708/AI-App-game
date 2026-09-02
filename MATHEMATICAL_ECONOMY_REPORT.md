# Mathematical Economy Report — Candidate V1

> Generated from `scripts/economy-model.mjs`. Analysis only; not a live balance forecast.

## Hardware tiers

| Tier | Era | Base cost | Base Compute/s | Derived g | Target purchases | Production/Cost |
|---|---|---:|---:|---:|---:|---:|
| Calculator | personal | 20 | 0.5 | 1.13774 | 30 | 0.025 |
| Pocket Computer | personal | 360 | 2.2 | 1.13774 | 30 | 0.00611 |
| Laptop | personal | 1.7e+03 | 13 | 1.14281 | 28 | 0.00765 |
| Gaming PC | professional | 6.5e+03 | 110 | 1.15412 | 25 | 0.0169 |
| Workstation | professional | 4.5e+04 | 1.35e+03 | 1.15412 | 25 | 0.03 |
| Server Rack | datacenter | 1.4e+06 | 2.2e+04 | 1.17062 | 22 | 0.0157 |
| GPU Cluster | datacenter | 7e+07 | 5e+05 | 1.17062 | 22 | 0.00714 |
| Datacenter | datacenter | 3.2e+10 | 1.4e+07 | 1.18129 | 20 | 0.000438 |
| Hyperscale Center | planetary | 2.2e+12 | 4.8e+08 | 1.18129 | 20 | 0.000218 |
| Orbital Datacenter | planetary | 1.8e+14 | 2e+10 | 1.19310 | 18 | 0.000111 |
| Moon Compute Facility | planetary | 1.7e+16 | 9.5e+11 | 1.19310 | 18 | 5.59e-05 |
| Mars Compute Grid | planetary | 2e+18 | 5.5e+13 | 1.20591 | 16 | 2.75e-05 |
| Fusion Compute Network | stellar | 2.8e+20 | 3.8e+15 | 1.20591 | 16 | 1.36e-05 |
| Dyson Compute Array | stellar | 5e+22 | 3e+17 | 1.21251 | 15 | 6e-06 |
| Matrioshka Brain | stellar | 1.2e+25 | 3e+19 | 1.21251 | 15 | 2.5e-06 |
| Singularity Core | post-singularity | 3.2e+28 | 3.6e+21 | 1.25316 | 12 | 1.12e-07 |

Growth is derived as `F^(1/N)`, not selected independently. First-unit economic payback cannot be finalized until the causal Market model is live; candidate corridors are stored in the parameter file.

## Marginal Hardware ROI

| Tier | ROI @1 | @10 | @25 | @50 | @100 |
|---|---:|---:|---:|---:|---:|
| Calculator | 0.022 | 0.00688 | 0.000993 | 3.94e-05 | 6.22e-08 |
| Pocket Computer | 0.00537 | 0.00168 | 0.000243 | 9.64e-06 | 1.52e-08 |
| Laptop | 0.00669 | 0.00201 | 0.000272 | 9.66e-06 | 1.22e-08 |
| Gaming PC | 0.0147 | 0.00404 | 0.00047 | 1.31e-05 | 1.01e-08 |
| Workstation | 0.026 | 0.00715 | 0.000833 | 2.31e-05 | 1.79e-08 |
| Server Rack | 0.0134 | 0.00325 | 0.000306 | 5.96e-06 | 2.26e-09 |
| GPU Cluster | 0.0061 | 0.00148 | 0.000139 | 2.71e-06 | 1.03e-09 |
| Datacenter | 0.00037 | 8.27e-05 | 6.79e-06 | 1.05e-07 | 2.54e-11 |
| Hyperscale Center | 0.000185 | 4.12e-05 | 3.39e-06 | 5.26e-08 | 1.27e-11 |
| Orbital Datacenter | 9.31e-05 | 1.9e-05 | 1.35e-06 | 1.63e-08 | 2.39e-12 |
| Moon Compute Facility | 4.68e-05 | 9.56e-06 | 6.77e-07 | 8.19e-09 | 1.2e-12 |
| Mars Compute Grid | 2.28e-05 | 4.23e-06 | 2.55e-07 | 2.36e-09 | 2.03e-13 |
| Fusion Compute Network | 1.13e-05 | 2.09e-06 | 1.26e-07 | 1.17e-09 | 1e-13 |
| Dyson Compute Array | 4.95e-06 | 8.74e-07 | 4.85e-08 | 3.93e-10 | 2.57e-14 |
| Matrioshka Brain | 2.06e-06 | 3.64e-07 | 2.02e-08 | 1.64e-10 | 1.07e-14 |
| Singularity Core | 8.98e-08 | 1.18e-08 | 3.99e-10 | 1.42e-12 | 1.78e-17 |

## Training and within-Model levels

| Level | Model factor | Target duration | log10 requirement at 1 Compute/s |
|---:|---:|---:|---:|
| 1 | 1.160× | 79.0s | 1.898 |
| 5 | 1.434× | 121.0s | 2.083 |
| 10 | 1.667× | 152.5s | 2.183 |
| 20 | 2.025× | 197.1s | 2.295 |
| 50 | 2.809× | 285.4s | 2.455 |
| 100 | 3.780× | 385.0s | 2.585 |
| 250 | 5.907× | 582.6s | 2.765 |
| 500 | 8.542× | 805.3s | 2.906 |

The candidate chooses `1+0.16L^0.62`: it is concave, reaches meaningful but non-dominant power at L500, and leaves tier anchors responsible for long-term scale.

## Reference states

| State | Hardware | Model tier | Level | Compute/s | Demand | Users | Capacity | Util. | RPU | Revenue/s | RP/s | Research speed | INT | log10 C/D/R |
|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| R0 Fresh | Calculator | 0 | 1 | 11.2 | 124 | 0 | 4.72 | 0.0% | 0.24 | 0 | 0.0301 | 1.01× | 0 | 1.05/2.09/— |
| R1 Early first run | Laptop | 0 | 3 | 316 | 575 | 0 | 133 | 0.0% | 0.269 | 0 | 0.333 | 1.17× | 0 | 2.5/2.76/— |
| R2 Server Rack | Server Rack | 0 | 11 | 3.73e+05 | 1.64e+04 | 2.2e+05 | 1.76e+05 | 9.3% | 0.29 | 4.75e+03 | 54.2 | 1.40× | 1 | 5.57/4.21/3.68 |
| R3 GPU Cluster | GPU Cluster | 1 | 15 | 8.9e+06 | 1.06e+06 | 1.2e+06 | 4.51e+06 | 23.4% | 0.304 | 3.21e+05 | 532 | 1.47× | 3 | 6.95/6.02/5.51 |
| R4 First Cycle | GPU Cluster | 1 | 18 | 9.18e+06 | 1.24e+06 | 3e+06 | 4.79e+06 | 25.9% | 0.311 | 3.85e+05 | 544 | 1.49× | 3 | 6.96/6.09/5.59 |
| R5 5 Cycles | Datacenter | 2 | 25 | 2.73e+08 | 1.03e+08 | 2e+07 | 1.56e+08 | 12.8% | 0.331 | 6.62e+06 | 6.25e+03 | 1.56× | 10 | 8.44/8.01/6.82 |
| R6 20 Cycles | Hyperscale Center | 3 | 35 | 5.01e+09 | 8.91e+09 | 2e+08 | 3.16e+09 | 6.3% | 0.355 | 7.1e+07 | 5.08e+04 | 1.64× | 25 | 9.7/9.95/7.85 |
| R7 Advanced Datacenter | Orbital Datacenter | 4 | 50 | 2.26e+11 | 9.51e+11 | 2e+09 | 1.57e+11 | 1.3% | 0.381 | 7.62e+08 | 7.89e+05 | 1.73× | 79 | 11.4/12/8.88 |
| R8 AGI | Mars Compute Grid | 7 | 75 | 6.87e+14 | 9.21e+17 | 4e+10 | 5.45e+14 | 0.0% | 0.422 | 1.69e+10 | 2.54e+08 | 1.85× | 886 | 14.8/18/10.2 |
| R9 ASI Seed | Fusion Compute Network | 8 | 100 | 5.13e+16 | 3.98e+20 | 8e+11 | 4.58e+16 | 0.0% | 0.463 | 3.7e+11 | 5.67e+09 | 1.92× | 3245 | 16.7/20.6/11.6 |
| R10 Dyson | Dyson Compute Array | 8 | 180 | 4.82e+18 | 2.02e+21 | 2e+13 | 4.89e+18 | 0.0% | 0.513 | 1.03e+13 | 1.49e+11 | 2.07× | 12740 | 18.7/21.3/13 |
| R11 Matrioshka | Matrioshka Brain | 8 | 300 | 5.7e+20 | 1.12e+22 | 8e+14 | 6.71e+20 | 0.0% | 0.581 | 4.65e+14 | 4.64e+12 | 2.18× | 53598 | 20.8/22/14.7 |
| R12 Singularity Core | Singularity Core | 8 | 500 | 8.2e+22 | 7.23e+22 | 5e+16 | 1.14e+23 | 0.0% | 0.667 | 3.34e+16 | 1.66e+14 | 2.28× | 239209 | 22.9/22.9/16.5 |

Reference states are authored snapshots for formula validation, not literal months-long simulations. Zero utilization at fresh states is expected.

## First-run calibration trajectory

| Time | Highest Hardware | Count | Compute/s | Level | Training ETA | Users | Demand | Capacity | Util. | Revenue/s | Mkt | Allocation | Next goal | ETA | INT |
|---:|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|---|---:|---:|
| 5m | Calculator | 6 | 2.62 | 1 | 79s | 31.6 | 113 | 1.05 | 100% | 0.252 | 1 | 60/40 | Pocket Computer | 580s | 0 |
| 10m | Calculator | 7 | 3.25 | 2 | 93s | 75.8 | 135 | 1.36 | 100% | 0.328 | 2 | 60/40 | Pocket Computer | 560s | 0 |
| 15m | Pocket Computer | 9 | 17.1 | 3 | 104s | 137 | 179 | 7.43 | 100% | 1.78 | 3 | 60/40 | Laptop | 540s | 0 |
| 20m | Pocket Computer | 11 | 19.8 | 4 | 113s | 223 | 291 | 8.89 | 100% | 2.13 | 4 | 70/30 | Laptop | 520s | 0 |
| 30m | Laptop | 14 | 150 | 6 | 128s | 511 | 664 | 70.5 | 100% | 16.9 | 6 | 70/30 | Gaming PC | 480s | 0 |
| 45m | Gaming PC | 19 | 1.68e+03 | 8 | 141s | 1.53e+03 | 1.98e+03 | 822 | 100% | 197 | 9 | 70/30 | Workstation | 420s | 0 |
| 60m | Workstation | 24 | 2.56e+04 | 11 | 158s | 4.29e+03 | 5.57e+03 | 1.32e+04 | 33% | 1.03e+03 | 12 | 70/30 | Server Rack | 360s | 0 |
| 75m | Server Rack | 29 | 5e+05 | 13 | 168s | 1.18e+04 | 1.53e+04 | 2.64e+05 | 4% | 2.83e+03 | 15 | 70/30 | GPU Cluster | 300s | 1 |
| 90m | GPU Cluster | 34 | 1.32e+07 | 16 | 181s | 3.22e+04 | 4.19e+04 | 7.26e+06 | 0% | 7.73e+03 | 18 | 70/30 | Development Cycle | 240s | 4 |

Available meaningful actions at each sample are Hardware, Training, and Marketing. These values are calibration anchors. They deliberately do not claim human equivalence.

## First Development Cycle strategies

| Strategy | Candidate minutes | 60–90m corridor |
|---|---:|---|
| BALANCED | 78 | yes |
| TRAINING-HEAVY | 84 | yes |
| MARKET-HEAVY | 82 | yes |
| HARDWARE-HEAVY | 73 | yes |
| LOW-INTERACTION | 105 | no |
| HIGHLY-OPTIMIZED | 64 | yes |

Low Interaction at 105m is the intentional slower outlier. These times are constraints for Phase-2 simulation, not results from the current live bot.

## Price sensitivity

| Price | Demand factor | Revenue index before Capacity |
|---:|---:|---:|
| 0.50× | 1.400 | 0.700 |
| 0.75× | 1.200 | 0.900 |
| 1.00× | 1.000 | 1.000 |
| 1.25× | 0.795 | 0.993 |
| 1.50× | 0.631 | 0.947 |
| 2.00× | 0.399 | 0.797 |
| 2.50× | 0.252 | 0.629 |
| 3.00× | 0.159 | 0.476 |

The unconstrained index peaks in the middle of the range rather than at 0.5× or 3×. Capacity constraints can rationally move the optimum upward.

## User acquisition half-lives

| Popularity/Marketing investment index | Acquisition half-life | Churn half-life |
|---:|---:|---:|
| 0 | 180.0s | 90s |
| 5 | 139.9s | 90s |
| 20 | 116.8s | 90s |
| 50 | 99.9s | 90s |
| 100 | 86.7s | 90s |

## INT entitlement

| Qualifying Compute | log10 Compute | Total entitlement | log10 INT |
|---:|---:|---:|---:|
| 4e+08 | 8.6 | 1 | 0.00 |
| 4e+10 | 10.6 | 4 | 0.60 |
| 4e+12 | 12.6 | 16 | 1.20 |
| 4e+16 | 16.6 | 256 | 2.41 |
| 4e+24 | 24.6 | 6.55e+04 | 4.82 |
| 4e+40 | 40.6 | 4.29e+09 | 9.63 |
| 4e+80 | 80.6 | 4.72e+21 | 21.67 |
| 4e+160 | 160.6 | 5.71e+45 | 45.76 |
| 4e+300 | 300.6 | 7.96e+87 | 87.90 |

## Technology cost audit framework

Every node is listed below. Proposed cost is the candidate depth/type equation evaluated against a stage INT-gain proxy; it is a review baseline, not a migration value.

| Node | Branch | Type | Depth | Current | Candidate | INT/run | Run equivalent | Power | Flag |
|---|---|---|---:|---:|---:|---:|---:|---:|---|
| Compute Theory | compute | system | 1 | 1 | 1 | 1 | 1.00 | 1.10× | — |
| Parallel Kernels | compute | minor | 2 | 3 | 1 | 1 | 1.00 | 1.15× | — |
| Heterogeneous Clusters | compute | major | 3 | 17 | 4 | 2 | 2.00 | 1.12× | — |
| Load Balancing | compute | major | 4 | 68 | 5 | 2 | 2.50 | 1.12× | CURRENT_COST_HIGH |
| Distributed Compute | compute | major | 5 | 338 | 14 | 4 | 3.50 | 1.22× | CURRENT_COST_HIGH |
| Compute Density | compute | keystone | 6 | 10000 | 27 | 4 | 6.75 | 2.00× | CURRENT_COST_HIGH |
| Universal Compute | compute | era | 7 | 1000000000000000000 | 91 | 8 | 11.38 | 1.65× | CURRENT_COST_HIGH |
| Gradient Optimization | training | minor | 1 | 1 | 1 | 1 | 1.00 | 1.15× | — |
| Checkpoint Compression | training | minor | 2 | 6 | 1 | 1 | 1.00 | 1.10× | CURRENT_COST_HIGH |
| Parallel Backpropagation | training | major | 3 | 33 | 4 | 2 | 2.00 | 1.24× | CURRENT_COST_HIGH |
| Active Optimization | training | major | 4 | 135 | 5 | 2 | 2.50 | 1.65× | CURRENT_COST_HIGH |
| Training Momentum | training | major | 5 | 675 | 14 | 4 | 3.50 | 1.25× | CURRENT_COST_HIGH |
| All-In Training | training | keystone | 6 | 20000 | 27 | 4 | 6.75 | 2.00× | CURRENT_COST_HIGH |
| Slow and Deep | training | keystone | 7 | 8000000 | 64 | 8 | 8.00 | 1.75× | CURRENT_COST_HIGH |
| Overclocking | hardware | minor | 1 | 1 | 1 | 1 | 1.00 | 1.20× | — |
| Tier Mastery I | hardware | minor | 2 | 9 | 1 | 1 | 1.00 | 2.00× | CURRENT_COST_HIGH |
| Rack Optimization | hardware | major | 3 | 49 | 4 | 2 | 2.00 | 1.18× | CURRENT_COST_HIGH |
| Tier Mastery II | hardware | major | 4 | 203 | 5 | 2 | 2.50 | 3.00× | CURRENT_COST_HIGH |
| Recursive Infrastructure | hardware | major | 5 | 1013 | 14 | 4 | 3.50 | 1.35× | CURRENT_COST_HIGH |
| Vertical Integration | hardware | keystone | 6 | 30000 | 27 | 4 | 6.75 | 1.30× | CURRENT_COST_HIGH |
| Bleeding Edge | hardware | keystone | 7 | 12000000 | 64 | 8 | 8.00 | 3.00× | CURRENT_COST_HIGH |
| Model Engineering | model | system | 1 | 1 | 1 | 1 | 1.00 | 1.10× | — |
| Advanced Reasoning Model | model | model | 2 | 6 | 1 | 1 | 1.00 | 1.12× | CURRENT_COST_HIGH |
| Multimodal Representations | model | model | 3 | 24 | 2 | 2 | 1.00 | 1.18× | CURRENT_COST_HIGH |
| Code Intelligence | model | major | 4 | 68 | 5 | 2 | 2.50 | 1.16× | CURRENT_COST_HIGH |
| Ensemble Inference | model | major | 5 | 338 | 14 | 4 | 3.50 | 1.20× | CURRENT_COST_HIGH |
| Specialist AI | model | keystone | 6 | 10000 | 27 | 4 | 6.75 | 1.50× | CURRENT_COST_HIGH |
| Generalist AI | model | keystone | 7 | 4000000 | 64 | 8 | 8.00 | 1.35× | CURRENT_COST_HIGH |
| Growth Analytics | consumer | minor | 1 | 1 | 1 | 1 | 1.00 | 1.20× | — |
| Viral Loops | consumer | minor | 2 | 3 | 1 | 1 | 1.00 | 1.18× | — |
| Social Proof | consumer | major | 3 | 17 | 4 | 2 | 2.00 | 1.25× | — |
| Personalization | consumer | major | 4 | 68 | 5 | 2 | 2.50 | 1.22× | CURRENT_COST_HIGH |
| Network Effects | consumer | major | 5 | 338 | 14 | 4 | 3.50 | 1.30× | CURRENT_COST_HIGH |
| Viral AI | consumer | keystone | 6 | 10000 | 27 | 4 | 6.75 | 2.00× | CURRENT_COST_HIGH |
| Mass Market | consumer | keystone | 7 | 4000000 | 64 | 8 | 8.00 | 3.00× | CURRENT_COST_HIGH |
| API Access | enterprise | system | 1 | 18 | 1 | 1 | 1.00 | 1.15× | CURRENT_COST_HIGH |
| Enterprise Sales | enterprise | minor | 2 | 36 | 1 | 1 | 1.00 | 1.20× | CURRENT_COST_HIGH |
| Enterprise Model | enterprise | model | 3 | 288 | 2 | 2 | 1.00 | 1.25× | CURRENT_COST_HIGH |
| Premium Contracts | enterprise | major | 4 | 810 | 5 | 2 | 2.50 | 1.28× | CURRENT_COST_HIGH |
| Service-Level Agreements | enterprise | major | 5 | 4051 | 14 | 4 | 3.50 | 1.30× | CURRENT_COST_HIGH |
| Enterprise First | enterprise | keystone | 6 | 120000 | 27 | 4 | 6.75 | 2.50× | CURRENT_COST_HIGH |
| Mission Critical AI | enterprise | major | 7 | 16200001 | 40 | 8 | 5.00 | 1.75× | CURRENT_COST_HIGH |
| Research Division | research | system | 1 | 5 | 1 | 1 | 1.00 | 1.15× | — |
| Laboratory Methods | research | model | 2 | 18 | 1 | 1 | 1.00 | 1.15× | CURRENT_COST_HIGH |
| Parallel Scientific Work | research | minor | 3 | 36 | 1 | 2 | 0.50 | 1.10× | CURRENT_COST_HIGH |
| Research Lab 2 | research | system | 4 | 225 | 4 | 2 | 2.00 | 1.10× | CURRENT_COST_HIGH |
| Offline Science | research | major | 5 | 1013 | 14 | 4 | 3.50 | 1.20× | CURRENT_COST_HIGH |
| Research Queue I | research | keystone | 6 | 30000 | 27 | 4 | 6.75 | 1.30× | CURRENT_COST_HIGH |
| Deep Research | research | keystone | 7 | 12000000 | 64 | 8 | 8.00 | 1.75× | CURRENT_COST_HIGH |
| Patent Office | patent | system | 1 | 53 | 1 | 1 | 1.00 | 1.15× | CURRENT_COST_HIGH |
| Patent Slot | patent | minor | 2 | 105 | 1 | 1 | 1.00 | 2.00× | CURRENT_COST_HIGH |
| Patent Amplification | patent | major | 3 | 567 | 4 | 2 | 2.00 | 1.20× | CURRENT_COST_HIGH |
| Cross-Licensing | patent | major | 4 | 2363 | 5 | 2 | 2.50 | 1.18× | CURRENT_COST_HIGH |
| Patent Mastery | patent | major | 5 | 11813 | 14 | 4 | 3.50 | 1.25× | CURRENT_COST_HIGH |
| Narrow Portfolio | patent | keystone | 6 | 350000 | 27 | 4 | 6.75 | 2.00× | CURRENT_COST_HIGH |
| Diversified Portfolio | patent | major | 7 | 47250000 | 40 | 8 | 5.00 | 4.00× | CURRENT_COST_HIGH |
| Inference Compression | efficiency | minor | 1 | 1 | 1 | 1 | 1.00 | 1.20× | — |
| Model Distillation | efficiency | minor | 2 | 6 | 1 | 1 | 1.00 | 1.18× | CURRENT_COST_HIGH |
| Cache Optimization | efficiency | major | 3 | 33 | 4 | 2 | 2.00 | 1.25× | CURRENT_COST_HIGH |
| Batched Inference | efficiency | major | 4 | 135 | 5 | 2 | 2.50 | 1.22× | CURRENT_COST_HIGH |
| Dynamic Routing | efficiency | major | 5 | 675 | 14 | 4 | 3.50 | 1.15× | CURRENT_COST_HIGH |
| Lean AI | efficiency | keystone | 6 | 20000 | 27 | 4 | 6.75 | 2.00× | CURRENT_COST_HIGH |
| Maximum Utilization | efficiency | major | 7 | 2700000 | 40 | 8 | 5.00 | 1.80× | CURRENT_COST_HIGH |
| Smart Allocation | automation | system | 1 | 150 | 1 | 1 | 1.00 | 1.10× | CURRENT_COST_HIGH |
| Auto Train | automation | system | 2 | 450 | 1 | 1 | 1.00 | 1.12× | CURRENT_COST_HIGH |
| Auto Buy | automation | system | 3 | 1800 | 3 | 2 | 1.50 | 1.14× | CURRENT_COST_HIGH |
| Auto Marketing | automation | major | 4 | 6750 | 5 | 2 | 2.50 | 1.20× | CURRENT_COST_HIGH |
| Model Manager | automation | major | 5 | 33750 | 14 | 4 | 3.50 | 1.20× | CURRENT_COST_HIGH |
| Autonomous Company | automation | keystone | 6 | 1000000 | 27 | 4 | 6.75 | 2.00× | CURRENT_COST_HIGH |
| Self-Improving Operations | automation | era | 7 | 1e+21 | 91 | 8 | 11.38 | 1.40× | CURRENT_COST_HIGH |
| Tool Use | agent | minor | 1 | 250 | 1 | 1 | 1.00 | 1.20× | CURRENT_COST_HIGH |
| Agent Tasks | agent | system | 2 | 1125 | 1 | 1 | 1.00 | 1.15× | CURRENT_COST_HIGH |
| Autonomous Agent Model | agent | model | 3 | 6000 | 2 | 2 | 1.00 | 1.25× | CURRENT_COST_HIGH |
| Autonomous Sales | agent | major | 4 | 16875 | 5 | 2 | 2.50 | 1.24× | CURRENT_COST_HIGH |
| Autonomous Research | agent | major | 5 | 84375 | 14 | 4 | 3.50 | 1.28× | CURRENT_COST_HIGH |
| Agent Swarm | agent | keystone | 6 | 2500000 | 27 | 4 | 6.75 | 2.00× | CURRENT_COST_HIGH |
| AI-Operated Company | agent | keystone | 7 | 1000000000 | 64 | 8 | 8.00 | 1.80× | CURRENT_COST_HIGH |
| Curated Datasets | data | minor | 1 | 500 | 1 | 1 | 1.00 | 1.18× | CURRENT_COST_HIGH |
| Synthetic Data | data | minor | 2 | 1500 | 1 | 1 | 1.00 | 1.15× | CURRENT_COST_HIGH |
| Knowledge Bases | data | major | 3 | 8101 | 4 | 2 | 2.00 | 1.20× | CURRENT_COST_HIGH |
| Feedback Loops | data | major | 4 | 33750 | 5 | 2 | 2.50 | 1.18× | CURRENT_COST_HIGH |
| Data Flywheel | data | major | 5 | 168750 | 14 | 4 | 3.50 | 1.25× | CURRENT_COST_HIGH |
| Data Monopoly | data | keystone | 6 | 5000000 | 27 | 4 | 6.75 | 2.00× | CURRENT_COST_HIGH |
| Planetary Dataset | data | era | 7 | 1e+24 | 91 | 8 | 11.38 | 1.60× | CURRENT_COST_HIGH |
| Targeted Advertising | market | minor | 1 | 1 | 1 | 1 | 1.00 | 1.25× | — |
| Brand Recognition | market | minor | 2 | 3 | 1 | 1 | 1.00 | 1.20× | — |
| Growth Loops | market | major | 3 | 17 | 4 | 2 | 2.00 | 1.24× | — |
| Pricing Science | market | major | 4 | 68 | 5 | 2 | 2.50 | 1.25× | CURRENT_COST_HIGH |
| Global Expansion | market | major | 5 | 338 | 14 | 4 | 3.50 | 1.40× | CURRENT_COST_HIGH |
| Growth at All Costs | market | keystone | 6 | 10000 | 27 | 4 | 6.75 | 3.00× | CURRENT_COST_HIGH |
| Category Ownership | market | era | 7 | 1e+27 | 91 | 8 | 11.38 | 1.75× | CURRENT_COST_HIGH |
| Equipment Science | items | system | 1 | 3750 | 1 | 1 | 1.00 | 1.10× | CURRENT_COST_HIGH |
| Equipment Slot | items | minor | 2 | 7500 | 1 | 1 | 1.00 | 2.00× | CURRENT_COST_HIGH |
| Rarity Mastery | items | major | 3 | 40500 | 4 | 2 | 2.00 | 1.25× | CURRENT_COST_HIGH |
| Set Synergy | items | major | 4 | 168750 | 5 | 2 | 2.50 | 1.35× | CURRENT_COST_HIGH |
| Artifact Research | items | major | 5 | 843750 | 14 | 4 | 3.50 | 1.40× | CURRENT_COST_HIGH |
| Relic Hunter | items | keystone | 6 | 25000000 | 27 | 4 | 6.75 | 1.50× | CURRENT_COST_HIGH |
| Pure Technologist | items | keystone | 7 | 10000000000 | 64 | 8 | 8.00 | 1.25× | CURRENT_COST_HIGH |
| Intelligence Retention | prestige | minor | 1 | 10000 | 1 | 1 | 1.00 | 1.15× | CURRENT_COST_HIGH |
| Milestone Intelligence | prestige | minor | 2 | 30000 | 1 | 1 | 1.00 | 1.18× | CURRENT_COST_HIGH |
| Model Intelligence | prestige | major | 3 | 162000 | 4 | 2 | 2.00 | 1.20× | CURRENT_COST_HIGH |
| Research Intelligence | prestige | major | 4 | 675000 | 5 | 2 | 2.50 | 1.22× | CURRENT_COST_HIGH |
| Cycle Planning | prestige | major | 5 | 3375000 | 14 | 4 | 3.50 | 1.18× | CURRENT_COST_HIGH |
| Deep Run | prestige | keystone | 6 | 100000000 | 27 | 4 | 6.75 | 1.80× | CURRENT_COST_HIGH |
| Rapid Iteration | prestige | keystone | 7 | 40000000000 | 64 | 8 | 8.00 | 1.65× | CURRENT_COST_HIGH |
| World Models | agi | major | 1 | 1350000 | 1 | 1 | 1.00 | 1.30× | CURRENT_COST_HIGH |
| General Transfer | agi | minor | 2 | 3000000 | 1 | 1 | 1.00 | 1.30× | CURRENT_COST_HIGH |
| Recursive Model Design | agi | major | 3 | 16200001 | 4 | 2 | 2.00 | 1.40× | CURRENT_COST_HIGH |
| Self-Designed Hardware | agi | major | 4 | 67500000 | 5 | 2 | 2.50 | 1.45× | CURRENT_COST_HIGH |
| General Intelligence | agi | model | 5 | 500000000 | 6 | 4 | 1.50 | 1.35× | CURRENT_COST_HIGH |
| Recursive Self-Improvement | agi | keystone | 6 | 10000000000 | 27 | 4 | 6.75 | 2.00× | CURRENT_COST_HIGH |
| Intelligence Explosion | agi | era | 7 | 1e+32 | 91 | 8 | 11.38 | 3.00× | CURRENT_COST_HIGH |
| Autonomous Science | singularity | major | 1 | 1350000000 | 1 | 1 | 1.00 | 1.60× | CURRENT_COST_HIGH |
| Machine Economy | singularity | minor | 2 | 3000000000 | 1 | 1 | 1.00 | 1.65× | CURRENT_COST_HIGH |
| Planetary Mind | singularity | major | 3 | 16200000001 | 4 | 2 | 2.00 | 1.70× | CURRENT_COST_HIGH |
| Superintelligence Seed | singularity | model | 4 | 100000000000 | 2 | 2 | 1.00 | 1.75× | CURRENT_COST_HIGH |
| Post-Scarcity Compute | singularity | major | 5 | 337500000000 | 14 | 4 | 3.50 | 2.00× | CURRENT_COST_HIGH |
| Technological Singularity | singularity | era | 6 | 1e+42 | 38 | 4 | 9.50 | 4.00× | CURRENT_COST_HIGH |
| Cosmic Intelligence | singularity | era | 7 | 1e+55 | 91 | 8 | 11.38 | 5.00× | CURRENT_COST_HIGH |

Target corridors remain Minor 0.25–0.75 runs, Standard 0.75–1.5, Major 1.5–3, Keystone 3–6, Transformative 5–10. Rows outside their intended class require content review.
## Research progression

Candidate RP conversion is `4(C_research/1000)^0.72`; each 10× Compute yields 5.25× RP rather than 10×. Repeat cost is `BaseTierCost(1+0.55l)^1.7`. Permanent Research Speed is bounded below 2.5× before explicit Keystone/temporary layers. Afford time plus timer duration is the calibration quantity.

## Patent power and modifier stacking

| Patent | Effect | Base value | Early EP | Mid EP | Late EP | Mode | Risk |
|---|---|---:|---:|---:|---:|---|---|
| SILICON LEGACY | hardwareOutput | 0.05 | 1.05× | 1.07× | 1.10× | BOUNDED_OR_TRANSFORM | REQUIRES_EXPLICIT_CAP_AUDIT |
| TRAINING FLYWHEEL | training | 0.1 | 1.10× | 1.15× | 1.20× | BOUNDED_OR_TRANSFORM | REQUIRES_EXPLICIT_CAP_AUDIT |
| MARKET TELEMETRY | demand | 0.08 | 1.08× | 1.12× | 1.16× | BOUNDED_OR_TRANSFORM | REQUIRES_EXPLICIT_CAP_AUDIT |
| Trust Ledger | reputationGrowth | 0.15 | 1.15× | 1.23× | 1.30× | ADD | — |
| RESEARCH CAMPUS | flatResearch | 1 | 2.00× | 2.50× | 3.00× | BOUNDED_OR_TRANSFORM | REQUIRES_EXPLICIT_CAP_AUDIT |
| MANUAL OVERCLOCKING | energyEfficiency | 0.05 | 1.05× | 1.07× | 1.10× | BOUNDED_OR_TRANSFORM | REQUIRES_EXPLICIT_CAP_AUDIT |
| Recursive Insight | intelligenceGain | 0.01 | 1.01× | 1.01× | 1.02× | ADD | — |
| Elastic Price Map | priceElasticity | 0.08 | 1.08× | 1.12× | 1.16× | ADD | — |
| HYPERSCALE NETWORK | allocationEfficiency | 0.02 | 1.02× | 1.03× | 1.04× | BOUNDED_OR_TRANSFORM | REQUIRES_EXPLICIT_CAP_AUDIT |
| Agent Contract Protocol | agents | 0.12 | 1.12× | 1.18× | 1.24× | ADD | — |
| Sparse Attention Lattice | inference | 0.08 | 1.08× | 1.12× | 1.16× | ADD | — |
| Semantic Response Cache | inference | 0.1 | 1.10× | 1.15× | 1.20× | ADD | — |
| Synthetic Curriculum | quality | 0.08 | 1.08× | 1.12× | 1.16× | ADD | — |
| Reputation Knowledge Graph | reputationGrowth | 0.12 | 1.12× | 1.18× | 1.24× | ADD | — |
| Market Telescope | marketSize | 0.1 | 1.10× | 1.15× | 1.20× | ADD | — |
| Liquid-Cooled Bus | energyEfficiency | 0.07 | 1.07× | 1.10× | 1.14× | ADD | — |
| Delta Checkpoints | training | 0.08 | 1.08× | 1.12× | 1.16× | ADD | — |
| Context Folding | quality | 0.06 | 1.06× | 1.09× | 1.12× | ADD | — |
| Predictive Microgrid | energyOutput | 0.1 | 1.10× | 1.15× | 1.20× | ADD | — |
| Enterprise Sales Copilot | enterprise | 0.12 | 1.12× | 1.18× | 1.24× | ADD | — |
| Private Collaborative Learning | reputationGrowth | 0.18 | 1.18× | 1.27× | 1.36× | ADD | — |
| Optical Compute Fabric | hardwareOutput | 0.08 | 1.08× | 1.12× | 1.16× | ADD | — |
| Pluralistic Reward Model | appeal | 0.09 | 1.09× | 1.14× | 1.18× | ADD | — |
| Data Distillery | research | 0.12 | 1.12× | 1.18× | 1.24× | ADD | — |
| Carbon-Aware Training | energyEfficiency | 0.08 | 1.08× | 1.12× | 1.16× | ADD | — |
| Federated Agent Teams | agents | 0.15 | 1.15× | 1.23× | 1.30× | ADD | — |
| Verified AI Compiler | training | 0.12 | 1.12× | 1.18× | 1.24× | ADD | — |
| Demand World Model | demand | 0.12 | 1.12× | 1.18× | 1.24× | ADD | — |
| Personal Memory Vault | adoption | 0.1 | 1.10× | 1.15× | 1.20× | ADD | — |
| Grid Energy Arbitrage | energyOutput | 0.12 | 1.12× | 1.18× | 1.24× | ADD | — |
| Neural Firewall | reputationGrowth | 0.2 | 1.20× | 1.30× | 1.40× | ADD | — |
| Expert Market Routing | revenue | 0.08 | 1.08× | 1.12× | 1.16× | ADD | — |
| Research Swarm | research | 0.15 | 1.15× | 1.23× | 1.30× | ADD | — |
| Zero-Copy Inference | inference | 0.14 | 1.14× | 1.21× | 1.28× | ADD | — |
| Thermal Energy Storage | energyOutput | 0.15 | 1.15× | 1.23× | 1.30× | ADD | — |
| Reasoning Distillation | quality | 0.12 | 1.12× | 1.18× | 1.24× | ADD | — |
| Global API Mesh | marketSize | 0.15 | 1.15× | 1.23× | 1.30× | ADD | — |
| Constrained Agency | agents | 0.18 | 1.18× | 1.27× | 1.36× | ADD | — |
| Predictive Dynamic Batching | inference | 0.16 | 1.16× | 1.24× | 1.32× | ADD | — |
| Neural Fusion Control | energyOutput | 0.2 | 1.20× | 1.30× | 1.40× | ADD | — |
| Scientific Memory Palace | research | 0.18 | 1.18× | 1.27× | 1.36× | ADD | — |
| Universal Tokenizer | appeal | 0.14 | 1.14× | 1.21× | 1.28× | ADD | — |
| Autonomous Compliance Audit | enterprise | 0.18 | 1.18× | 1.27× | 1.36× | ADD | — |
| Lossless Semantic Quantization | energyEfficiency | 0.12 | 1.12× | 1.18× | 1.24× | ADD | — |
| AI Service Market Maker | revenue | 0.12 | 1.12× | 1.18× | 1.24× | ADD | — |
| Self-Repairing Datacenter | hardwareOutput | 0.15 | 1.15× | 1.23× | 1.30× | ADD | — |
| Collective Alignment Protocol | reputationGrowth | 0.25 | 1.25× | 1.38× | 1.50× | ADD | — |
| Stellar Load Balancer | allocationEfficiency | 0.08 | 1.08× | 1.12× | 1.16× | ADD | — |
| Recursive Science Engine | flatResearch | 5 | 6.00× | 8.50× | 11.00× | ADD | — |
| Singularity Safety Proof | intelligenceGain | 0.1 | 1.10× | 1.15× | 1.20× | ADD | — |

These are algebraic screening ratios. Bespoke synergies require the Phase-2 reference-state evaluator; any ownership formula without an explicit cap is blocked from migration. Ordinary Patent target power is 1.05–1.25×; Keystone target is 1.20–1.60×. Maximum ordinary multiplicative depth is four.
## Milestones and old Hardware

Direct old-Hardware value declines according to the Production/Cost table. Strategic value should come from bounded, distinct synergies. Generic global Demand at 50 and Revenue at 100 are flagged because they make every old tier the same checklist investment. Phase 2 should calculate direct production share and synergy contribution after live reference states exist.

## Elasticity and growth derivatives

Analytic candidate elasticities are diminishing: Marketing `E=M·0.32/[(1+M)MarketingFactor]`; Quality Demand `E=Q·0.18/[(1+Q)QualityDemand]`; Efficiency `E=E·0.10/[sqrt(E)EfficiencyFactor]`. Price elasticity is `-1.15p/PriceTolerance` above 1. Growth derivatives require the Phase-2 purchase policy; static reference snapshots cannot honestly provide `d log(Y)/dt`.

## WOM stability

For `z=ln(1+U/1000)`, `dWOM/dU=4.5/[(3+z)^2(1000+U)]`. Potential-Demand derivative is `BaseWithoutWOM×dWOM/dU`. Phase 2 must assert it remains below 1 at every state. The derivative tends to zero, so WOM cannot be asymptotically explosive.

## Dominance, dead zones, and runaway risks

- **Severe live runaway risk:** Capacity currently creates Demand directly.
- **Likely live dominance:** raw lifetime INT adds 10% Revenue per INT without bound.
- **Dead-zone risk:** Training anchors are independent of expected Training throughput.
- **Dead-zone risk:** Research `2.6^level` costs are independent of RP afford-time targets.
- **Dominance review:** generic old-Hardware Demand/Revenue milestones scale with the whole future economy.
- **Historic Server Rack → GPU Cluster:** cannot be safely recalibrated until Capacity is removed from Demand; current V2 utilization is causally invalid.

## Progression event density

Phase-2 target is 0.20–0.50 meaningful events/minute (one per 2–5 minutes). The candidate first-run checkpoints retain multiple available actions, but event density is not claimed without a real transition simulation.

## Invariants generated

- `bulkFormulaFinite`: **PASS**
- `bulkClosedFormEqualsSum`: **PASS**
- `hardwareCostsMonotonic`: **PASS**
- `trainingMonotonic`: **PASS**
- `demandIndependentOfInference`: **PASS**
- `servedUsersBounded`: **PASS**
- `researchFinite`: **PASS**
- `numberSafety`: **PASS**

## Endgame Number safety

All candidate R0–R12 reference values are below log10 100. Level-500 duration and Model factors are small. Hardware ownership geometric costs remain the primary future risk: evaluate cost in log space and introduce a Decimal-like abstraction before reachable values approach log10 250. No BigNumber dependency is required in Phase 1.

## Open risks

1. Candidate first-run anchors need a Phase-2 deterministic policy simulation against migrated pure formulas.
2. Hardware base-cost payback requires a causal Market implementation; current live Market cannot validate it.
3. Every Technology and Patent needs state-specific Equivalent Power measurement after modifier grouping.
4. Research and Patent allocation must be separated to eliminate double use.
5. Price continuity is value-continuous but has a derivative cusp at 1.0.
6. Model tier transition durations require human testing.

## Recommendation

Proceed to Phase 2 only as a staged migration: pure market helpers and invariants first; canonical user flow and Revenue second; grouped modifiers third; INT entitlement fourth; then content calibration. Preserve feature flags or side-by-side diagnostics until fresh human runs confirm the 60–90 minute target.
