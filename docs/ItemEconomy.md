# Item Economy

Milestone 12 introduces a data-driven, permanent Model-equipment vertical slice. `itemCatalog.js` contains 30 handcrafted Items, six slot types, six rarities, validated tags, moderate effects, tradeoffs, and three prototype Sets. `InventorySystem.js` owns acquisition, unique local instance identity, replacement, equip/unequip, favorites, capacity, consumables, gameplay caches, and Gem accounting. Items persist through Development Cycles and Breakthroughs.

A fresh Model has Architecture and Compute slots. Permanent account conveniences and Tech may reveal later slots. Effective values are aggregated by `ModifierSystem.js`; UI never owns economy formulas. Instances reserve owner, binding, tradeability, seed, quality, and affix fields, but randomized affixes, salvage, fusion, and crafting are intentionally not implemented.

Initial rewards come from missions and non-paid gameplay caches. Caches are not sold. Timed effects use playtime expiry and are compatible with future offline reconciliation, but offline simulation remains future work.
