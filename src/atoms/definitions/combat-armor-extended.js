// ══════════════════════════════════════════════════════════════════════════════
// COMBAT: Ranged armor, magic armor, barrows sets, void, graceful
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

const ARMOR = [
  // Ranged armor
  { id: 'equip-leather-body',     name: 'Leather Body',           slot: 'body', reqs: { ranged: 1 } },
  { id: 'equip-leather-chaps',    name: 'Leather Chaps',          slot: 'legs', reqs: { ranged: 1 } },
  { id: 'equip-studded-body',     name: 'Studded Body',           slot: 'body', reqs: { ranged: 20 } },
  { id: 'equip-studded-chaps',    name: 'Studded Chaps',          slot: 'legs', reqs: { ranged: 20 } },
  { id: 'equip-green-dhide-body', name: "Green D'hide Body",      slot: 'body', reqs: { ranged: 40, defence: 40 } },
  { id: 'equip-green-dhide-chaps',name: "Green D'hide Chaps",     slot: 'legs', reqs: { ranged: 40 } },
  { id: 'equip-green-dhide-vamb', name: "Green D'hide Vambraces", slot: 'gloves', reqs: { ranged: 40 } },
  { id: 'equip-blue-dhide-body',  name: "Blue D'hide Body",       slot: 'body', reqs: { ranged: 50, defence: 40 } },
  { id: 'equip-blue-dhide-chaps', name: "Blue D'hide Chaps",      slot: 'legs', reqs: { ranged: 50 } },
  { id: 'equip-red-dhide-body',   name: "Red D'hide Body",        slot: 'body', reqs: { ranged: 60, defence: 40 } },
  { id: 'equip-red-dhide-chaps',  name: "Red D'hide Chaps",       slot: 'legs', reqs: { ranged: 60 } },
  { id: 'equip-black-dhide-body', name: "Black D'hide Body",      slot: 'body', reqs: { ranged: 70, defence: 40 } },
  { id: 'equip-black-dhide-chaps',name: "Black D'hide Chaps",     slot: 'legs', reqs: { ranged: 70 } },
  { id: 'equip-black-dhide-vamb', name: "Black D'hide Vambraces", slot: 'gloves', reqs: { ranged: 70 } },
  { id: 'equip-robin-hood-hat',   name: 'Robin Hood Hat',         slot: 'head', reqs: { ranged: 40 } },
  { id: 'equip-ranger-boots',     name: 'Ranger Boots',           slot: 'boots', reqs: { ranged: 40 } },
  { id: 'equip-ranger-tunic',     name: 'Ranger Tunic',           slot: 'body', reqs: { ranged: 40 } },
  { id: 'equip-masori-mask',      name: 'Masori Mask',            slot: 'head', reqs: { ranged: 80, defence: 30 } },
  { id: 'equip-masori-body',      name: 'Masori Body',            slot: 'body', reqs: { ranged: 80, defence: 30 } },
  { id: 'equip-masori-chaps',     name: 'Masori Chaps',           slot: 'legs', reqs: { ranged: 80, defence: 30 } },

  // Magic armor
  { id: 'equip-wizard-hat',       name: 'Wizard Hat',             slot: 'head', reqs: {} },
  { id: 'equip-wizard-robe-top',  name: 'Wizard Robe Top',        slot: 'body', reqs: {} },
  { id: 'equip-wizard-robe-skirt',name: 'Wizard Robe Skirt',      slot: 'legs', reqs: {} },
  { id: 'equip-mystic-hat',       name: 'Mystic Hat',             slot: 'head', reqs: { magic: 40, defence: 20 } },
  { id: 'equip-mystic-robe-top',  name: 'Mystic Robe Top',        slot: 'body', reqs: { magic: 40, defence: 20 } },
  { id: 'equip-mystic-robe-bottom',name:'Mystic Robe Bottom',     slot: 'legs', reqs: { magic: 40, defence: 20 } },
  { id: 'equip-infinity-hat',     name: 'Infinity Hat',           slot: 'head', reqs: { magic: 50, defence: 25 } },
  { id: 'equip-infinity-top',     name: 'Infinity Top',           slot: 'body', reqs: { magic: 50, defence: 25 } },
  { id: 'equip-infinity-bottom',  name: 'Infinity Bottoms',       slot: 'legs', reqs: { magic: 50, defence: 25 } },
  { id: 'equip-ahrim-hood',       name: "Ahrim's Hood",           slot: 'head', reqs: { magic: 70, defence: 70 } },
  { id: 'equip-ahrim-robe-top',   name: "Ahrim's Robe Top",       slot: 'body', reqs: { magic: 70, defence: 70 } },
  { id: 'equip-ahrim-robe-skirt', name: "Ahrim's Robe Skirt",     slot: 'legs', reqs: { magic: 70, defence: 70 } },

  // Void knight
  { id: 'equip-void-knight-top',  name: 'Void Knight Top',        slot: 'body', reqs: { attack: 42, strength: 42, defence: 42, ranged: 42, magic: 42, hitpoints: 42, prayer: 22 } },
  { id: 'equip-void-knight-robe', name: 'Void Knight Robe',       slot: 'legs', reqs: { attack: 42, strength: 42, defence: 42, ranged: 42, magic: 42, hitpoints: 42, prayer: 22 } },
  { id: 'equip-void-knight-gloves',name:'Void Knight Gloves',     slot: 'gloves', reqs: { attack: 42, strength: 42, defence: 42, ranged: 42, magic: 42, hitpoints: 42, prayer: 22 } },
  { id: 'equip-void-melee-helm',  name: 'Void Melee Helm',        slot: 'head', reqs: { attack: 42, strength: 42, defence: 42, ranged: 42, magic: 42, hitpoints: 42, prayer: 22 } },
  { id: 'equip-void-ranger-helm', name: 'Void Ranger Helm',       slot: 'head', reqs: { attack: 42, strength: 42, defence: 42, ranged: 42, magic: 42, hitpoints: 42, prayer: 22 } },
  { id: 'equip-void-mage-helm',   name: 'Void Mage Helm',         slot: 'head', reqs: { attack: 42, strength: 42, defence: 42, ranged: 42, magic: 42, hitpoints: 42, prayer: 22 } },
  { id: 'equip-elite-void-top',   name: 'Elite Void Top',         slot: 'body', reqs: { attack: 42, strength: 42, defence: 42, ranged: 42, magic: 42, hitpoints: 42, prayer: 22 } },
  { id: 'equip-elite-void-robe',  name: 'Elite Void Robe',        slot: 'legs', reqs: { attack: 42, strength: 42, defence: 42, ranged: 42, magic: 42, hitpoints: 42, prayer: 22 } },

  // Graceful
  { id: 'equip-graceful-hood',    name: 'Graceful Hood',           slot: 'head', reqs: {} },
  { id: 'equip-graceful-top',     name: 'Graceful Top',            slot: 'body', reqs: {} },
  { id: 'equip-graceful-legs',    name: 'Graceful Legs',           slot: 'legs', reqs: {} },
  { id: 'equip-graceful-gloves',  name: 'Graceful Gloves',         slot: 'gloves', reqs: {} },
  { id: 'equip-graceful-boots',   name: 'Graceful Boots',          slot: 'boots', reqs: {} },
  { id: 'equip-graceful-cape',    name: 'Graceful Cape',           slot: 'cape', reqs: {} },

  // Barrows full sets
  { id: 'equip-dharok-helm',      name: "Dharok's Helm",          slot: 'head', reqs: { defence: 70 } },
  { id: 'equip-dharok-platebody', name: "Dharok's Platebody",     slot: 'body', reqs: { defence: 70 } },
  { id: 'equip-dharok-platelegs', name: "Dharok's Platelegs",     slot: 'legs', reqs: { defence: 70 } },
  { id: 'equip-dharok-greataxe',  name: "Dharok's Greataxe",     slot: 'weapon', reqs: { attack: 70, strength: 70 } },
  { id: 'equip-guthan-helm',      name: "Guthan's Helm",          slot: 'head', reqs: { defence: 70 } },
  { id: 'equip-guthan-platebody', name: "Guthan's Platebody",     slot: 'body', reqs: { defence: 70 } },
  { id: 'equip-guthan-chainskirt',name: "Guthan's Chainskirt",    slot: 'legs', reqs: { defence: 70 } },
  { id: 'equip-guthan-warspear',  name: "Guthan's Warspear",      slot: 'weapon', reqs: { attack: 70 } },
  { id: 'equip-verac-helm',       name: "Verac's Helm",           slot: 'head', reqs: { defence: 70 } },
  { id: 'equip-verac-brassard',   name: "Verac's Brassard",       slot: 'body', reqs: { defence: 70 } },
  { id: 'equip-verac-plateskirt', name: "Verac's Plateskirt",     slot: 'legs', reqs: { defence: 70 } },
  { id: 'equip-verac-flail',      name: "Verac's Flail",          slot: 'weapon', reqs: { attack: 70 } },
  { id: 'equip-karil-coif',       name: "Karil's Coif",           slot: 'head', reqs: { defence: 70, ranged: 70 } },
  { id: 'equip-karil-leathertop', name: "Karil's Leathertop",     slot: 'body', reqs: { defence: 70, ranged: 70 } },
  { id: 'equip-karil-leatherskirt',name:"Karil's Leatherskirt",   slot: 'legs', reqs: { defence: 70, ranged: 70 } },
  { id: 'equip-karil-crossbow',   name: "Karil's Crossbow",       slot: 'weapon', reqs: { ranged: 70 } },
  { id: 'equip-torag-helm',       name: "Torag's Helm",           slot: 'head', reqs: { defence: 70 } },
  { id: 'equip-torag-platebody',  name: "Torag's Platebody",      slot: 'body', reqs: { defence: 70 } },
  { id: 'equip-torag-platelegs',  name: "Torag's Platelegs",      slot: 'legs', reqs: { defence: 70 } },
  { id: 'equip-torag-hammers',    name: "Torag's Hammers",        slot: 'weapon', reqs: { attack: 70, strength: 70 } },

  // Misc notable
  { id: 'equip-fighter-torso',    name: 'Fighter Torso',          slot: 'body', reqs: { defence: 40 } },
  { id: 'equip-obsidian-helm',    name: 'Obsidian Helm',          slot: 'head', reqs: { defence: 60 } },
  { id: 'equip-obsidian-body',    name: 'Obsidian Platebody',     slot: 'body', reqs: { defence: 60 } },
  { id: 'equip-obsidian-legs',    name: 'Obsidian Platelegs',     slot: 'legs', reqs: { defence: 60 } },
  { id: 'equip-granite-body',     name: 'Granite Body',           slot: 'body', reqs: { defence: 50, strength: 50 } },
  { id: 'equip-granite-helm',     name: 'Granite Helm',           slot: 'head', reqs: { defence: 50, strength: 50 } },
  { id: 'equip-granite-legs',     name: 'Granite Legs',           slot: 'legs', reqs: { defence: 50, strength: 50 } },
  { id: 'equip-dragon-platebody', name: 'Dragon Platebody',       slot: 'body', reqs: { defence: 60 } },
  { id: 'equip-dragon-platelegs', name: 'Dragon Platelegs',       slot: 'legs', reqs: { defence: 60 } },
  { id: 'equip-dragon-full-helm', name: 'Dragon Full Helm',       slot: 'head', reqs: { defence: 60 } },
  { id: 'equip-dragon-sq-shield', name: 'Dragon Sq Shield',       slot: 'shield', reqs: { defence: 60 } },
  { id: 'equip-dragon-kiteshield',name: 'Dragon Kiteshield',      slot: 'shield', reqs: { defence: 60 } },
  { id: 'equip-dragon-boots',     name: 'Dragon Boots',           slot: 'boots', reqs: { defence: 60 } },
  { id: 'equip-dragon-chainbody', name: 'Dragon Chainbody',       slot: 'body', reqs: { defence: 60 } },
  { id: 'equip-dragon-med-helm',  name: 'Dragon Med Helm',        slot: 'head', reqs: { defence: 60 } },
  { id: 'equip-dragonfire-shield',name: 'Dragonfire Shield',      slot: 'shield', reqs: { defence: 75 } },
  { id: 'equip-anti-dragon-shield',name:'Anti-Dragon Shield',    slot: 'shield', reqs: {} },
  { id: 'equip-crystal-shield',   name: 'Crystal Shield',         slot: 'shield', reqs: { defence: 70 } },
  { id: 'equip-toktz-ket-xil',    name: 'Toktz-ket-xil (Shield)',slot: 'shield', reqs: { defence: 60 } },
];

for (const a of ARMOR) {
  define({
    id: a.id, name: a.name, type: 'equipment',
    requires: { levels: a.reqs },
    atoms: {},
    config: { slot: a.slot }
  });
}

console.log(`[defs] Extended Armor: ${ARMOR.length} pieces`);
