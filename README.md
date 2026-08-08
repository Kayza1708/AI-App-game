# AI Singularity

A premium browser-based idle game about building an AI company and steering intelligence toward the technological singularity.

## Development

```bash
npm install
npm run dev
```

## First playable loop

Purchase exponentially scaling hardware and energy infrastructure, train and specialize a portfolio of AI models, discover 50 permanent Patents, and reinvest user revenue. Development Cycles, eight Intelligence specializations, optional retention rewards, strategic events, 120 achievements, and a convenience-only Gem economy let every company develop a distinct long-term identity.

## Developer Analytics

Internal balance telemetry is hidden during normal play. Start the development server and open `http://localhost:5173/?dev=1`, then choose **Developer Analytics** in the sidebar. The recorder is local-only, uses separate browser storage, and never sends analytics to a server. See [`docs/DeveloperAnalytics.md`](docs/DeveloperAnalytics.md) for architecture, schema, analysis rules, exports, controls, and limitations.

Telemetry includes stable anonymous-local player/session/run context, meaningful-event economy snapshots, first-time funnels, feature discovery, enriched purchase pacing, balancing wait signals, and permanent Patent loadout analytics. Patent discoveries can be equipped into three starting slots, upgraded with INT, and expanded to eight slots using Gems.

Developer Mode also provides a destructive **🗑 RESET GAME** balancing control at the top of Developer Analytics. It clears all AI Singularity browser persistence and reloads a true first-launch state while keeping Developer Mode active.

Milestone 8 uses one-second local telemetry and automatic actionable balance reports to evaluate the slower Hardware, Patent, and Development Cycle curves. Every player screen also surfaces the next concrete progression chase.

Milestone 9 turns Models into permanent INT unlocks and Training into XP-driven, manual sixteen-stat builds. Developer reports now include page discovery, full resource-aware purchases, waiting causes, a replayable progression timeline, and target-based balance suggestions.

Milestone 10 is based on a full gameplay audit. The early Energy hard-cap was removed, Hardware now advances sequentially through sixteen authored tiers, locked Models stay hidden until permanently unlocked with INT, stored Compute powers Training, and the Patent baseline reaches six months. See [`docs/GameplayAudit.md`](docs/GameplayAudit.md) for the traced logic and balance rationale.

Milestone 11 centralizes all major economy curves, makes Development Cycles depend on run Compute, and reveals systems through lifetime Intelligence. See [`docs/ProgressionFramework.md`](docs/ProgressionFramework.md) for formulas, unlock thresholds, Breakthrough rules, and telemetry fields.

The emergency runtime audit and white-screen recovery boundaries are documented in [`docs/RuntimeRecovery.md`](docs/RuntimeRecovery.md). Bootstrap, first render, malformed-save recovery, normal mode, and Developer Mode now have dedicated regression coverage.

## Milestone 12 — Model equipment foundations

Model equipment now provides a playable build loop: feature-gated mission rewards can grant handcrafted Items, the Inventory equips them to compatible Model slots, and the canonical economy immediately reflects their effects. Daily/weekly/monthly periods, Consumables, gameplay caches, Gem conveniences, and an explicit web-only Rewarded Boost mock establish long-term meta foundations without real IAP, forced ads, or client-trusted trading. See [`docs/ItemEconomy.md`](docs/ItemEconomy.md), [`docs/ModelBuilds.md`](docs/ModelBuilds.md), and [`docs/MonetizationDesign.md`](docs/MonetizationDesign.md).
