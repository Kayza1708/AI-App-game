/** Permanent crafting materials. Icons reuse the established text-icon language; no atlas coordinates are invented. */
export const COMPONENTS=Object.freeze([
  {id:'circuits',name:'Circuits',rarity:'Common',icon:'▦',description:'Reliable control boards recovered from scaled hardware.',sources:['Complete Applied Silicon','Complete Blueprint Analysis']},
  {id:'lasers',name:'Lasers',rarity:'Uncommon',icon:'✦',description:'Precision photonics for fast model accelerators.',sources:['Complete Data Generation','Repeat Data Generation']},
  {id:'graphene',name:'Graphene',rarity:'Rare',icon:'◇',description:'Conductive sheets for efficient memory and cooling.',sources:['Complete Material Analysis','Repeat Material Analysis']},
  {id:'titanium-screws',name:'Titanium Screws',rarity:'Common',icon:'⌘',description:'Durable fasteners recovered during fleet maintenance.',sources:['Complete Blueprint Analysis','Repeat Blueprint Analysis']},
  {id:'nanotubes',name:'Nanotubes',rarity:'Epic',icon:'⌁',description:'High-density interconnects produced by advanced analysis.',sources:['Complete Model Architecture research','Mission rewards (later)']},
  {id:'quantum-cores',name:'Quantum Cores',rarity:'Legendary',icon:'◉',description:'Stable computation cores for endgame prototypes.',sources:['Reach repeatable Research Level 10','Later Prestige unlocks']},
]);

export const BLUEPRINTS=Object.freeze([
  {id:'prototype-gpu-blueprint',name:'Prototype GPU Cluster',resultItemId:'prototype-gpu',recipe:{circuits:4,lasers:2,'titanium-screws':6},description:'Craft a Training-focused Compute item.'},
  {id:'scientific-corpus-blueprint',name:'Scientific Corpus',resultItemId:'scientific-corpus',recipe:{graphene:3,circuits:2,nanotubes:1},description:'Craft a Research dataset.'},
  {id:'photonic-accelerator-blueprint',name:'Photonic Accelerator',resultItemId:'photonic-accelerator',recipe:{lasers:6,graphene:4,nanotubes:2,'quantum-cores':1},description:'Craft a high-end photonic accelerator.'},
]);
