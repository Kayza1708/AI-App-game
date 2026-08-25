# Offline Progress

Offline progression uses the same `tickGame` simulation as active play. Durations up to 30 minutes use one-second chunks for deterministic equivalence; longer durations use bounded ten-second chunks. An eight-hour cap is centralized in `BALANCE.offline` and can later be expanded by legitimate account conveniences.

The reconciliation advances Credits, Compute, Users, active Training and XP, unlocked Research, unlocked Patents, Energy-limited production, Achievements, temporary modifiers, and all existing Model/Item/Tech/Patent effects. Locked Research and Patents remain inactive because the canonical feature gates execute inside each tick.

Safety rules are: negative elapsed time becomes zero, elapsed time above the cap is clamped, `lastReconciledTimestamp` prevents duplicate awards, and background visibility saves before stopping the loop. A Welcome Back reward only appears after ten meaningful offline seconds and omits zero or locked resources. Results retain actual and effective duration, gains, and milestones for telemetry.

Exact equivalence is guaranteed by tests at 60 seconds, five minutes, and thirty minutes. Longer simulations are close rather than frame-identical because ten-second chunks approximate nonlinear User convergence and the exact instant of Training/Patent completion. Real clock security requires a server.
