# AI Singularity Technology Tree

## Audit of the previous tree

The Milestone 16 catalog contained 102 generated branch nodes (17 branches × 6 ranks) plus 11 legacy system nodes. The system nodes were useful unlock transactions but were not part of the visible graph. The 102 visible nodes all shared the same template: one positive percentage, one unrelated penalty, a linear prerequisite, and occasional descriptive unlock text that did not activate a mechanic. Model unlock IDs happened to connect, but Hardware, Patent, Item, Automation, Model-skill, and INT interactions were mostly generic or disconnected.

Audit classification:

- **Major unlock / meaningful support:** 11 legacy system nodes and the Model IDs referenced by existing Models.
- **Generic filler:** 102 generated visible nodes.
- **Redundant:** repeated Quantum Simulation, General Intelligence, Machine Economy, and other names across unrelated branches.
- **Broken/disconnected:** descriptive “unlocks operations” strings, branch penalties that were too small to affect a decision, and technology identity scoring that did not consume canonical Technology effects.

Milestone 17 replaces all 102 generated visible nodes. Legacy system IDs remain migration-compatible, but core build progression is now driven by the structured catalog in `src/data/technologyCatalog.js`.

## Final catalog

The tree contains **119 nodes across 17 branches**:

1. Compute Empire
2. Training Science
3. Hardware Engineering
4. Model Science
5. Consumer AI
6. Enterprise AI
7. Research Lab
8. Patent Engineering
9. Efficiency AI
10. Autonomous Company
11. Agent Economy
12. Data & Quality
13. Market & Marketing
14. Item & Artifact Science
15. Intelligence & Prestige
16. Artificial General Intelligence
17. Singularity

Node roles are explicit data: Minor, Major, Keystone, Model, System, and Era. Every node has an icon ID, position, prerequisite, cost, effect, description, tags, and optional tradeoff, mechanic, synergy, Model unlock, or feature unlock.

## Keystones

The 24 build-defining Keystones are:

- Compute Density
- All-In Training and Slow and Deep
- Vertical Integration and Bleeding Edge
- Specialist AI and Generalist AI
- Viral AI and Mass Market
- Enterprise First
- Open Science and Deep Research
- Narrow Portfolio
- Lean AI
- Autonomous Company
- Agent Swarm and AI-Operated Company
- Data Monopoly
- Growth at All Costs
- Relic Hunter and Pure Technologist
- Deep Run and Rapid Iteration
- Recursive Self-Improvement

Era nodes such as Universal Compute, Self-Improving Operations, Planetary Dataset, General Intelligence, Intelligence Explosion, Superintelligence Seed, Technological Singularity, and Cosmic Intelligence are visually separate aspirational milestones.

## Major unlocks and Models

System nodes activate Research, Patents, Agent Tasks, API value, automation rules, and equipment specialization. Model nodes unlock SmartChat, GPT-Class, Omni, Research, Enterprise, Agent, AGI, and ASI Seed through the same canonical Technology purchase transaction. Previously unlocked Models and legacy Technology IDs are preserved by migration.

## Cost philosophy

Early branch origins cost 1–50 INT and present genuine first-cycle choices. Branch depth uses authored type multipliers and escalating rank multipliers. Midgame paths reach hundreds, thousands, millions, and billions. Era and Singularity nodes extend through `1e55` INT. Lifetime INT remains permanent; purchases consume only available INT.

## Cross-system build rules

### Hardware Mastery

Hardware Mastery is derived from purchased Hardware Engineering nodes and ownership thresholds. It never returns per-building Processor/Memory/Optimization buttons. Mastery I activates at 10 owned, Mastery II at 25, and affects tier output, quantity scaling, server specialization, legacy relevance, and Bleeding Edge behavior.

### Training and Model Points

Training nodes affect canonical Training Compute, checkpoint starting progress, GPU-class specialization, momentum, and manual Training injection. Model-skill Technologies amplify specific skill families rather than awarding hidden UI points. One completed base Training still awards exactly one canonical Improvement Point.

### Model synergy

Quality, Efficiency, Popularity, Reasoning, Coding, Research, Enterprise, and Autonomy skills are read by live economy formulas. Specialist AI emphasizes one active Model; Generalist AI strengthens portfolio contribution with an individual tradeoff. Model unlock nodes immediately add the unlocked architecture to the permanent portfolio.

### Patent synergy

All 50 Patents have strategic tags such as Compute, Training, Consumer, Enterprise, Research, Efficiency, Agent, Model, and Market. Patent Amplification, Cross-Licensing, Recursive Discovery, Narrow Portfolio, and Diversified Portfolio read the equipped loadout and modify only the relevant canonical Patent effects or slots.

### Item and Artifact synergy

Equipment Science, Rarity Mastery, Set Synergy, Artifact Research, Relic Hunter, and Pure Technologist scale the existing Item/Artifact modifier pipeline. They do not create a duplicate loot system. Item effects and Artifact effects continue to enter canonical Model and economy calculations.

### Research loop

Research allocation converts real Compute into Research and Patent progress. Scientific Model, Model-Assisted Science, Research-tagged Patents, Research Items, Recursive Discovery, Open Science, and Deep Research create a compounding specialization with an explicit immediate-revenue or discovery-speed cost.

### Automation and Agents

Smart Allocation, Auto Train, Auto Buy, and Auto Marketing call existing domain transactions. Agent Tasks, Autonomous Sales, Autonomous Research, Agent Swarm, and AI-Operated Company connect Agent allocation and Model Autonomy to real Research, Enterprise, Marketing, and passive decisions.

### Prestige styles

Deep Run and Rapid Iteration alter the real Development Cycle formula in opposite directions. Deep Run rewards longer company eras and penalizes short resets; Rapid Iteration improves early cycles while weakening late-run scaling.

## UI architecture

The graph is driven directly from the structured node catalog. It renders compact SVG-icon nodes, typed node sizes, branch colors, prerequisite lines, illuminated purchased paths, dim future paths, hover/tap summaries, and a complete selected-node detail panel. Desktop supports drag-pan and wheel zoom. Pointer tracking supports touch pan and pinch zoom. Controls provide search, Center on Current, Center on Available, Fit Tree, and Reset Zoom. Mobile moves the detail panel into a sticky bottom-sheet layout.

## Build identity and telemetry

Build identity is inferred from actual Technology investment, Model skills, deployed Models, Patent loadout, Items, and allocation. Technology telemetry records node views, tap/hover interaction, purchases, node type, branch, Keystone status, INT spent, available INT, Lifetime INT, and time since affordability. Complete Session exports include Technology purchases, Keystone purchases, branch investment, and Run IDs for reconstructing build evolution.

## Migration

Save version 18 preserves current branch IDs where possible. Removed legacy branches map by rank into a strategically related new branch:

- Robotics → Hardware
- Medicine → Data
- Education → Consumer
- Physics → Research
- Space → Singularity
- Government → Enterprise
- ASI → AGI

No available or Lifetime INT is removed. Exact old percentage equivalence is intentionally not preserved because the old nodes were generic filler; rank/path investment is preserved instead. Fresh balance runs remain the preferred tuning environment.
