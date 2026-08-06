export const SAVE_VERSION = 2;

export const HARDWARE_CATALOG = [
  { id: 'laptop', name: 'Old Laptop', description: 'A battered dual-core machine. Slow, stubborn, and yours.', baseCost: 25, computePerSecond: 0.8 },
  { id: 'gamingPc', name: 'Gaming PC', description: 'Consumer silicon repurposed for late-night training runs.', baseCost: 180, computePerSecond: 6 },
  { id: 'workstation', name: 'AI Workstation', description: 'Purpose-built acceleration for serious model iteration.', baseCost: 1_400, computePerSecond: 42 },
  { id: 'server', name: 'GPU Server', description: 'Rack-mounted parallel compute with industrial throughput.', baseCost: 12_000, computePerSecond: 310 },
  { id: 'datacenter', name: 'Mini Datacenter', description: 'Your first dedicated facility, humming around the clock.', baseCost: 110_000, computePerSecond: 2_400 },
];

export function createDefaultState() {
  return {
    version: SAVE_VERSION,
    profile: { companyName: 'Singularity Labs', createdAt: Date.now() },
    resources: { credits: 75, compute: 0, users: 8 },
    hardware: Object.fromEntries(HARDWARE_CATALOG.map(({ id }) => [id, 0])),
    model: { level: 1, xp: 0, quality: 1, trainingProgress: 0 },
    settings: { numberNotation: 'compact' },
    statistics: { totalCreditsEarned: 0, totalComputeProduced: 0, totalClicks: 0, playTimeMs: 0 },
    session: { elapsedMs: 0, lastSavedAt: null },
    ui: { activeView: 'dashboard', sidebarOpen: false },
  };
}
