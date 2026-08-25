import { SYSTEM_TECH_NODES } from '../config/balance.js';

export function techNodeState(state, node) {
  if (state.meta.techNodes.includes(node.id)) return 'purchased';
  if ((state.meta.totalIntelligence ?? 0) < node.visibleAt) return 'locked-int';
  if (node.requires && !state.meta.techNodes.includes(node.requires)) return 'locked-prerequisite';
  return state.meta.intelligence >= node.cost ? 'available' : 'locked-int';
}
export function purchaseSystemTech(state, nodeId) {
  const node = SYSTEM_TECH_NODES.find((entry) => entry.id === nodeId);
  if (!node || techNodeState(state, node) !== 'available') return state;
  return {
    ...state,
    meta: { ...state.meta, intelligence: state.meta.intelligence - node.cost, techNodes: [...state.meta.techNodes, node.id] },
    ui: { ...state.ui, toast: { id: Date.now(), message: `${node.name} unlocked · ${node.unlocks.join(', ')}` } },
  };
}
