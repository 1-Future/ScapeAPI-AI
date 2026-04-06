// ══════════════════════════════════════════════════════════════════════════════
// SHOPS: Every notable shop with stock
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

const SHOPS = [
  { id: 'shop-lumbridge-general', name: 'Lumbridge General Store',  location: 'Lumbridge', stock: ['pot','jug','tinderbox','chisel','hammer','bucket','bowl','cake tin','shears','empty-pot'] },
  { id: 'shop-varrock-general',   name: 'Varrock General Store',   location: 'Varrock', stock: ['pot','jug','tinderbox','chisel','hammer','bucket'] },
  { id: 'shop-varrock-swords',    name: "Zaff's Superior Staffs",  location: 'Varrock', stock: ['staff','magic_staff','staff_of_air','staff_of_water','staff_of_earth','staff_of_fire','battlestaff'] },
  { id: 'shop-varrock-runes',     name: "Aubury's Rune Shop",     location: 'Varrock', stock: ['air_rune','mind_rune','water_rune','earth_rune','fire_rune','body_rune','chaos_rune','death_rune'] },
  { id: 'shop-falador-general',   name: 'Falador General Store',   location: 'Falador', stock: ['pot','jug','tinderbox','chisel','hammer'] },
  { id: 'shop-falador-gems',      name: "Herquin's Gems",         location: 'Falador', stock: ['uncut_sapphire','uncut_emerald','uncut_ruby','uncut_diamond'] },
  { id: 'shop-edgeville-general', name: 'Edgeville General Store', location: 'Edgeville', stock: ['pot','jug','tinderbox'] },
  { id: 'shop-al-kharid-crafting',name: 'Al Kharid Crafting Store',location: 'Al Kharid', stock: ['needle','thread','leather','chisel'] },
  { id: 'shop-ardougne-general',  name: 'Ardougne General Store',  location: 'Ardougne', stock: ['pot','jug','tinderbox','chisel','hammer'] },
  { id: 'shop-canifis-general',   name: 'Canifis General Store',   location: 'Canifis', stock: ['pot','jug','tinderbox'] },
  { id: 'shop-lunar-runes',       name: 'Baba Yaga Rune Shop',    location: 'Lunar Isle', stock: ['astral_rune','cosmic_rune','law_rune','death_rune'] },
  { id: 'shop-tzhaar-ore',        name: 'TzHaar Ore Shop',        location: 'TzHaar City', stock: ['uncut_onyx','obsidian_cape','toktz_xil_ak'] },
  { id: 'shop-blast-furnace',     name: 'Blast Furnace Ore Seller',location: 'Keldagrim', stock: ['iron_ore','coal','mithril_ore','adamantite_ore','runite_ore','gold_ore','silver_ore'] },
  { id: 'shop-charter-ship-store',name: 'Charter Ship Store',     location: 'Port Sarim', stock: ['bucket','tinderbox','hammer','rope','spade'] },
  { id: 'shop-nardah-general',    name: 'Nardah General Store',   location: 'Nardah', stock: ['waterskin','desert_boots','shantay_pass'] },
  { id: 'shop-prifddinas-general',name: 'Prifddinas General Store',location: 'Prifddinas', stock: ['crystal_shard','crystal_armour_seed'] },
  { id: 'shop-warriors-guild',    name: "Warriors' Guild Shop",   location: "Warriors' Guild", stock: ['attack_potion','strength_potion','defence_potion'] },
  { id: 'shop-void-knight',       name: 'Void Knight Store',      location: 'Pest Control', stock: ['void_knight_top','void_knight_robe','void_knight_gloves','void_knight_mace'] },
  { id: 'shop-nmz-rewards',       name: 'NMZ Reward Shop',        location: 'NMZ', stock: ['herb_box','imbue_scroll','redirection_scroll'] },
  { id: 'shop-slayer-rewards',    name: 'Slayer Reward Shop',     location: 'Slayer Master', stock: ['broad_arrow_tips','slayer_ring','herb_sack','rune_pouch'] },
  { id: 'shop-bh-rewards',        name: 'BH Reward Shop',         location: 'Edgeville', stock: ['dragon_pickaxe','rune_pouch','looting_bag'] },
  { id: 'shop-lms-rewards',       name: 'LMS Reward Shop',        location: 'LMS', stock: ['dragon_claws','armadyl_godsword','elder_maul','volatile_staff'] },
  { id: 'shop-ca-rewards',        name: 'Combat Achievement Shop',location: 'Varrock', stock: ['ghommals_hilt','imbued_heart'] },
  { id: 'shop-motherlode',        name: 'Prospector Percy Shop',  location: 'Motherlode Mine', stock: ['prospector_helmet','prospector_jacket','prospector_legs','prospector_boots','coal_bag','gem_bag'] },
  { id: 'shop-hallowed-sep',      name: 'Hallowed Sepulchre Shop',location: 'Darkmeyer', stock: ['hallowed_ring','hallowed_focus','hallowed_symbol','hallowed_hammer','ring_of_endurance'] },
  { id: 'shop-tithe-farm',        name: 'Tithe Farm Shop',        location: 'Hosidius', stock: ['farmers_hat','farmers_jacket','farmers_boro','farmers_boots','seed_box','herb_sack','gricollers_can'] },
  { id: 'shop-ba-rewards',        name: 'BA Reward Shop',         location: 'BA', stock: ['fighter_torso','penance_skirt','runner_boots','healer_hat'] },
  { id: 'shop-castle-wars',       name: 'Castle Wars Shop',       location: 'Castle Wars', stock: ['decorative_armour_gold','halo'] },
  { id: 'shop-fishing-guild',     name: 'Fishing Guild Shop',     location: 'Fishing Guild', stock: ['feather','bait','fly_fishing_rod','lobster_pot','harpoon'] },
  { id: 'shop-cooking-guild',     name: 'Cooking Guild Shop',     location: 'Cooking Guild', stock: ['chocolate_bar','grapes','pie_dish'] },
  { id: 'shop-magic-guild',       name: 'Magic Guild Shop',       location: 'Yanille', stock: ['nature_rune','law_rune','death_rune','blood_rune'] },
  { id: 'shop-ranging-guild',     name: 'Ranging Guild Shop',     location: 'Ranging Guild', stock: ['bronze_arrow','iron_arrow','steel_arrow','mithril_arrow','adamant_arrow','rune_arrow'] },
  { id: 'shop-champions-guild',   name: 'Champions Guild Shop',  location: 'Champions Guild', stock: ['adamant_platebody','rune_chainbody'] },
  { id: 'shop-sawmill',           name: 'Sawmill',                location: 'Varrock', stock: ['plank','oak_plank','teak_plank','mahogany_plank'] },
  { id: 'shop-sand-gravel',       name: 'Bert Sand Delivery',     location: 'Yanille', stock: ['bucket_of_sand'] },
];

for (const s of SHOPS) {
  define({
    id: s.id, name: s.name, type: 'shop',
    atoms: {
      dialogue: { npcName: 'Shopkeeper', tree: { start: { lines: ['Welcome to my shop!'], next: null } } },
      tickCycle: { interval: 100 }, // restock timer
    },
    config: { location: s.location, stock: s.stock }
  });
}

console.log(`[defs] Shops: ${SHOPS.length} shops`);
