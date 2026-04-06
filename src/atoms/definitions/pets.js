// ══════════════════════════════════════════════════════════════════════════════
// PETS: Every obtainable pet
// ══════════════════════════════════════════════════════════════════════════════

const { define } = require('../mechanic');

const PETS = [
  // Boss pets
  { id: 'pet-baby-mole',      name: 'Baby Mole',              source: 'Giant Mole',            dropRate: '1/3000' },
  { id: 'pet-kbd-prince',     name: 'Prince Black Dragon',    source: 'King Black Dragon',     dropRate: '1/3000' },
  { id: 'pet-kq-princess',    name: 'Kalphite Princess',      source: 'Kalphite Queen',        dropRate: '1/3000' },
  { id: 'pet-smoke-devil',    name: 'Pet Smoke Devil',        source: 'Thermonuclear Smoke Devil', dropRate: '1/3000' },
  { id: 'pet-kraken',         name: 'Pet Kraken',             source: 'Kraken',                dropRate: '1/3000' },
  { id: 'pet-cerberus',       name: 'Hellpuppy',              source: 'Cerberus',              dropRate: '1/3000' },
  { id: 'pet-abyssal-orphan', name: 'Abyssal Orphan',         source: 'Abyssal Sire',          dropRate: '1/2560' },
  { id: 'pet-dark-claw',      name: 'Skotos',                 source: 'Skotizo',               dropRate: '1/65' },
  { id: 'pet-jad',            name: 'TzRek-Jad',              source: 'TzTok-Jad',             dropRate: '1/200' },
  { id: 'pet-zuk',            name: 'Jal-Nib-Rek',            source: 'TzKal-Zuk',             dropRate: '1/100' },
  { id: 'pet-corp-puppy',     name: 'Pet Dark Core',          source: 'Corporeal Beast',       dropRate: '1/5000' },
  { id: 'pet-graardor',       name: 'Pet General Graardor',   source: 'General Graardor',      dropRate: '1/5000' },
  { id: 'pet-kreearra',       name: "Pet Kree'arra",          source: "Kree'arra",             dropRate: '1/5000' },
  { id: 'pet-zilyana',        name: 'Pet Zilyana',            source: 'Commander Zilyana',     dropRate: '1/5000' },
  { id: 'pet-kril',           name: "Pet K'ril Tsutsaroth",   source: "K'ril Tsutsaroth",     dropRate: '1/5000' },
  { id: 'pet-vorkath',        name: 'Vorki',                  source: 'Vorkath',               dropRate: '1/3000' },
  { id: 'pet-zulrah',         name: 'Pet Snakeling',          source: 'Zulrah',                dropRate: '1/4000' },
  { id: 'pet-hydra',          name: 'Ikkle Hydra',            source: 'Alchemical Hydra',      dropRate: '1/3000' },
  { id: 'pet-nightmare',      name: 'Little Nightmare',       source: 'The Nightmare',         dropRate: '1/4000' },
  { id: 'pet-nex',            name: 'Nexling',                source: 'Nex',                   dropRate: '1/500' },
  { id: 'pet-sarachnis',      name: 'Sraracha',               source: 'Sarachnis',             dropRate: '1/3000' },
  { id: 'pet-gauntlet',       name: 'Youngllef',              source: 'Corrupted Gauntlet',    dropRate: '1/800' },
  { id: 'pet-olmlet',         name: 'Olmlet',                 source: 'Chambers of Xeric',     dropRate: '1/53' },
  { id: 'pet-lil-zik',        name: "Lil'Zik",               source: 'Theatre of Blood',      dropRate: '1/650' },
  { id: 'pet-tumekens-guardian',name:"Tumeken's Guardian",   source: 'Tombs of Amascut',      dropRate: '1/350' },
  // Skilling pets
  { id: 'pet-heron',          name: 'Heron',                  source: 'Fishing',               dropRate: '1/257,770' },
  { id: 'pet-beaver',         name: 'Beaver',                 source: 'Woodcutting',           dropRate: '1/264,336' },
  { id: 'pet-rock-golem',     name: 'Rock Golem',             source: 'Mining',                dropRate: '1/244,725' },
  { id: 'pet-rift-guardian',   name: 'Rift Guardian',         source: 'Runecraft',             dropRate: '1/1,795,758' },
  { id: 'pet-chinchompa',     name: 'Baby Chinchompa',        source: 'Hunter',                dropRate: '1/131,395' },
  { id: 'pet-giant-squirrel', name: 'Giant Squirrel',         source: 'Agility',               dropRate: '1/36,842' },
  { id: 'pet-tangleroot',     name: 'Tangleroot',             source: 'Farming',               dropRate: '1/7,500' },
  { id: 'pet-rocky',          name: 'Rocky',                  source: 'Thieving',              dropRate: '1/36,490' },
  { id: 'pet-phoenix',        name: 'Phoenix',                source: 'Wintertodt',            dropRate: '1/5000' },
  { id: 'pet-tiny-tempor',    name: 'Tiny Tempor',            source: 'Tempoross',             dropRate: '1/8000' },
  { id: 'pet-smol-heredit',   name: 'Smol Heredit',           source: 'Colosseum',             dropRate: '1/200' },
  { id: 'pet-abyssal-protector',name:'Abyssal Protector',    source: 'Guardians of the Rift', dropRate: '1/4000' },
  // Other
  { id: 'pet-bloodhound',     name: 'Bloodhound',             source: 'Master Clue',           dropRate: '1/1000' },
  { id: 'pet-chompy-chick',   name: 'Chompy Chick',           source: 'Chompy Bird Hunting',   dropRate: '1/500' },
  { id: 'pet-chaos-elemental',name: 'Pet Chaos Elemental',   source: 'Chaos Elemental',       dropRate: '1/300' },
  { id: 'pet-callisto-cub',   name: 'Callisto Cub',           source: 'Callisto',              dropRate: '1/2000' },
  { id: 'pet-vetion-jr',      name: "Vet'ion Jr.",            source: "Vet'ion",               dropRate: '1/2000' },
  { id: 'pet-venenatis-spider',name:'Venenatis Spiderling',   source: 'Venenatis',             dropRate: '1/2000' },
  { id: 'pet-scorpias-offspring',name:"Scorpia's Offspring",  source: 'Scorpia',               dropRate: '1/2016' },
  { id: 'pet-dagannoth-rex',   name: 'Pet Dagannoth Rex',     source: 'Dagannoth Rex',         dropRate: '1/5000' },
  { id: 'pet-dagannoth-prime',  name: 'Pet Dagannoth Prime',  source: 'Dagannoth Prime',       dropRate: '1/5000' },
  { id: 'pet-dagannoth-supreme',name: 'Pet Dagannoth Supreme',source: 'Dagannoth Supreme',     dropRate: '1/5000' },
  { id: 'pet-cat',            name: 'Cat (Grown)',             source: 'Gertrude Cat Quest',    dropRate: 'quest' },
  { id: 'pet-kitten',         name: 'Kitten',                 source: 'Gertrude',              dropRate: 'quest' },
];

for (const p of PETS) {
  define({
    id: p.id, name: p.name, type: 'pet',
    atoms: {},
    config: { source: p.source, dropRate: p.dropRate }
  });
}

console.log(`[defs] Pets: ${PETS.length} pets`);
