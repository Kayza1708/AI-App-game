export function techNodeState(state, node) {
  if (state.meta.techNodes.includes(node.id)) return 'purchased';
  if ((state.meta.totalIntelligence ?? 0) < node.visibleAt) return 'locked-int';
  if (node.requires && !state.meta.techNodes.includes(node.requires)) return 'locked-prerequisite';
  return state.meta.intelligence >= node.cost ? 'available' : 'locked-int';
}
