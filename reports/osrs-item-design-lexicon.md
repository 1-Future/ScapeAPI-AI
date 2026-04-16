# OSRS Item Design Lexicon

*A design-literate analysis of OSRS's item-icon visual language, derived from quantitative measurement and structured visual reading of 938 sampled items across 12,193 catalogued. Output of the lexicon research program (`reports/lexicon-research-program.md`); inputs are the Wave A per-item analyses, Wave B specialist lens reports, and Wave D iconic case studies under `/tmp/osrs-study/analysis/`.*

*This document is the textbook. The companion `data/visual-design-rules.json` is the database the Scape art generator consumes. Where this prose says "rule R3," that token is the same identifier in the JSON.*

---

## Part 0 — Why this exists

OSRS's item icons are a 20-year-old visual language that holds up. A 30-pixel inventory icon authored in 2001 still reads cleanly on a 4K monitor, against any background, in any zoom. Players recognize a Dragon Scimitar, a Twisted Bow, a Magic Log, a 4-dose Saradomin Brew at a glance — not because the art is detailed, but because the *visual choices* encode meaning the way written language does. Silhouette, palette, specular, composition, ornament, abstraction level — every dimension carries semantic load. The system works because every choice is constrained by rules that are nearly universal, and every break of those rules signals something specific.

This document codifies those rules. The goal is *generative*: to give Scape's art generator everything it needs to produce original items in the OSRS design tradition without copying any Jagex IP. The principles transfer; the vocabulary (which colors mean what, which silhouettes belong to whom) becomes Scape's own.

We extracted these principles by *observation*, not training. We never use OSRS art as model input or render reference. We study the design language to write down its rules; the rules become Scape's, and Scape authors its own art from those rules.

---

## Part 1 — Universal Truths

These are the rules that hold across nearly every item in the OSRS library. They are the floor of competence — break them and the icon stops looking like it belongs to the same tradition. We verified each across 400-900 items. Compliance rates given are measured.

### U1. The Outline Rule

**Every item has a 1-2px topologically-complete dark outline around its silhouette.** Pure black (`#000000`), not warm-black, not dark-brown, not tinted-by-material. No gaps. No soft edges. No anti-aliasing. Binary alpha — every pixel is fully opaque or fully transparent.

*Compliance: 99.96% across 11,899 icons. The handful of "exceptions" are pastry rims, spirit-shield cerulean crests, and swordfish dorsal-fin highlights that brush the perimeter in 1-2 pixels — never deliberate breaks of the rule.*

This is what makes inventory icons read as *cards or stickers* rather than scenes. They survive any background — light bank, dark bank, screenshot, wiki page, parchment Codex, any future UI we build. The outline is the single most disciplined convention in OSRS's visual system, and it is the cheapest, most non-negotiable rule for Scape.

**Interior outlines share the perimeter color.** Secondary dark lines that subdivide the silhouette (blade-from-guard, plate-seam, spaulder-from-sleeve) use the same `#000000` as the rim, never a lighter gray. Interior outline *count* scales with object complexity (silver-bar = 0 interior pixels, dragon-claws = 100, torva-platebody = 259), not with tier.

**Thickness does not signal tier.** Bronze, mithril, rune, dragon, and 3rd Age all share the same thickness distribution (55-80% of perimeter samples at exactly 1px, the rest at 2px on apex curves and silhouette-signature features). Do not modulate outline thickness as a depth or tier cue.

→ *Scape: every icon outlines at `#000000`, 1-2px, complete enclosure, binary alpha. No exceptions inside the world. Cosmetic exo-items (Scape's equivalent of partyhats) may shift outline color — but only because they're designed to read as out-of-world.*

### U2. Static-Only Commitment

**Zero animation in the inventory icon.** No pulse, no particle, no rotation, no shimmer, no glow aura, no shader effect. Every pixel is authored, fixed, and rendered as-is.

The "shine" of a metal item is rendered as 2-3 fixed pixels of near-white at canonical canvas positions. The fire on a Fire Cape is a static palette gradient with no flicker. The void on Tumeken's Shadow is a fixed black; its prestige doesn't borrow motion. Even the most elemental OSRS items (Fire Cape, Infernal Cape, spirit shields) commit fully to static composition.

This is restraint as a quality signal. Modern games shimmer their legendaries. OSRS makes you bring the awe. The disciplined-craft feel is part of why the items feel valuable — and part of why a 28-slot inventory remains a *clean readable grid* where the player's attention is on choosing, not on watching things shimmer.

**Specular changes only on permanent art transitions.** Reversible mechanical states (imbued/base, poisoned/un-poisoned, charged/un-charged) are pixel-identical icons. Specular changes only for ornament kits, re-skins, and blessed conversions — events that materially change the *art*, not the *state*.

→ *Scape: animation can live in the world (sword swings, spell casts, pet idle, level-up FX) but inventory icons are static and disciplined, every time.*

### U3. Tight-Crop Canvas

**The canvas is the silhouette's shrink-wrap plus 1-2px outline padding.** Not a fixed 32×32 grid. Not a uniform inventory cell. The canvas flexes to the item's shape.

Measured: dagger 21×31, sword 20×31, scimitar 26×30, platebody 31×23, plateleg 12×29, full-helm 19×29, kiteshield 30×28, glove 29×29, boot 29×26, ring 18×22, rune 29×28, bar 28×22, log 31×25, herb 29×25, potion 21×30. Items extend wider when wider, narrower when narrower. A wand is 10×30 vertical; a Twisted Bow is 30×14 horizontal.

This means **canvas dimensions are themselves a category signal.** A 30×14 shape says "horizontal weapon" before color enters. A 12×29 says "platelegs." A 28×22 says "bar." Players come to learn the canvas-per-category mapping subconsciously.

→ *Scape: ship a canvas-size table per category (R-Composition.2 in the rules database). Canvas falls out of bbox computation, never pre-allocated. New categories pick a canvas size and stick to it.*

### U4. Nearest-Neighbor Design Intent

**Icons are authored at native ~30px and scaled up at runtime with nearest-neighbor.** No bilinear, no smoothing, no mipmapping in the inventory layer. Every source pixel becomes a clean 4×4 or 6×6 square on a modern monitor.

This is why OSRS icons hold up at any zoom. Bilinear scaling would smear edges, mud the colors, lose the specular detail. Nearest-neighbor preserves *intent of every pixel*. The 1-2px outline becomes a 4-8px outline at common UI zoom — bold, confident, sticker-like. Soft edges would blur into mud.

The flip side: **icons are designed at 30px, not designed at 256px and shrunk.** The small canvas is the source of truth. Every pixel has intent at native size. Designing big and shrinking produces fuzz; designing small and scaling produces craft.

→ *Scape: render inventory + codex icons with `image-rendering: pixelated` (CSS) or `imageSmoothingEnabled = false` (canvas). Author every icon at its native canvas size. Never produce a 256px master and downscale.*

### U5. Every Pixel Has a Job

**At 30px there is no room for atmospheric noise.** If a pixel exists, it conveys silhouette, material, detail, specular, or — at ultra tier — deliberate negative space. There is no "decoration just to fill the canvas." There is no "background texture." There is no "atmosphere."

A red partyhat carries full cultural identity in 4 palette colors and ~300 pixels. A Magic Log is recognizable from its purple-blue tinge alone — but every individual pixel still serves outline, end-grain, or shading-band duty.

A nuance: **at ultra tier, more pixels' job is to be *negative space*.** Dinh's Bulwark, TzKal Slayer Helmet, Scythe of Vitur, Tumeken's Shadow all have lower fill ratios than mid-tier peers (Scythe fills 20% of its bbox; Crystal Halberd 15%; Zamorakian Spear 11%; common bows fill 45-55%). The whitespace itself is a prestige rhetoric — "this item is so important the canvas breathes around it." Lower-tier items can't afford this; they need every pixel to establish what they are.

→ *Scape: at the rules-database query level, set fill-ratio targets per (category × tier). Common-tier weapons fill 0.40-0.55; ultra-tier signature weapons fill 0.20-0.30. Whitespace is an inverse-prestige signal.*

### U6. Tier as Abstraction Gradient

**Low-tier items are literal renderings of their function. High-tier items are stylized symbols of themselves.** The progression is *functional → idealized → iconic → mythic*. The form serves *recognition* over *realism* the higher you go.

A bronze sword is "a sword" — anatomically plausible, common silhouette, dull-warm palette. A Dragon Scimitar is "the idea of a Dragon Scimitar" — curve exaggerated past anatomy, color past metallurgy (no real metal is blood-red), ornament accumulating. A Twisted Bow is "bowness pushed past structural reason into pure signature" — the twist serves no function, it IS the identity. A Tumeken's Shadow is "a void-staff at the limit of what a staff can be."

Counter-intuitive but verified: **higher tier = MORE stylized, not more realistic detail.** Modern games tend to "make the legendary version more detailed and realistic." OSRS goes the opposite direction. Tier-up means: more abstracted silhouette, more impossible color, more decorative ornament that doesn't serve mechanical function.

The progression is not smooth. It's a disciplined staircase with four landings:
- **Functional** (1-3): bronze, iron, steel, raw materials, junk, food
- **Idealized** (4-6): mithril, adamant, rune, processed materials, finished goods
- **Iconic** (7-8): dragon, barrows, named uniques
- **Mythic** (9-10): 3rd Age, Twisted Bow, Shadow, Torva, Phats

→ *Scape: each category publishes a tier-by-tier abstraction rating. The mid-tier flat plateau (4-6 abstraction across multiple tiers) is intentional — it makes the dragon-rung jump land harder. Don't ornament mid-tier to make it feel "more valuable"; the plateau IS the prestige ramp.*

### U7. The Single-Axis Ultra Discipline

**At ultra tier, items break exactly ONE design dimension and stay disciplined on the others.** Silhouette OR palette OR material-treatment. Never all three. Multi-axis maximalism actively hurts legibility.

- **Twisted Bow**: breaks silhouette (S-curve with 8 internal holes — a topology nothing else in the bow family has), keeps restrained palette (austere blacks/greens), standard "dark wood" material treatment.
- **Tumeken's Shadow**: breaks palette (impossible amber-red void no other staff uses), keeps standard staff silhouette (30×28, sits inside the staff template), standard material treatment.
- **3rd Age**: breaks material (impossible silver-white) but keeps standard slot silhouettes (3rd-age-platebody is 30×23 / 580 opaque, near-identical to bronze-platebody) and disciplined palette inside its silver/gold range.
- **Torva Full Helm**: breaks silhouette (bottom-heavy mandible-dominant mass distribution unlike any other helm), keeps disciplined dark palette, standard material treatment.
- **Bandos Chestplate**: breaks silhouette (vertical "brutalist cuirass" 20×28 instead of standard wide-trapezoid platebody), keeps disciplined Bandos-faction palette.

When an item breaks two or three dimensions at once, it risks looking like fan-art. When it breaks one, the break lands harder.

→ *Scape: the rules database tags every ultra-tier item with `break_axis: silhouette|palette|material`. The generator MUST pick exactly one. Single-axis-break is the discipline that separates a genuine apex from an over-designed mess.*

### U8. Palette Cohesion (Master + Sub-palettes)

**OSRS has one master palette, ~48 colors, that 12,000+ items draw from.** Per-faction, per-region, per-material sub-palettes nest inside the master. This is what makes the entire library feel like one world rather than 12,000 independent clip-art assets.

Verified: the same `#543808` warm wood-brown appears across every dagger tier and every axe handle. The same `#000000` outline appears in every item. Shared shadow tokens, shared specular tokens, shared accent tokens. OSRS reuses palette entries ruthlessly.

Per-faction triplets (verified):
- **Saradomin**: `#101898` blue + `#A8A860` silver-gold + black
- **Zamorak**: `#84180C` red + `#141010` black + black-void
- **Guthix**: `#08640C` forest-green + `#085C60` teal-cyan + black
- **Armadyl**: `#9494A0` silver-sky + `#DCDCE0` pale-white + `#64646C` steel
- **Bandos**: `#3C3838` dark-olive + `#848058` brass-tan + black
- **Ancient/Zaros**: `#442C60` deep-purple + black + `#787070` ash-grey
- **Tumeken/Kharidian**: `#BC8C18` amber + `#942010` red + black

Per-tier signature hexes (verified, ±8 per-channel tolerance):
- bronze: `#4C3820` warm dull-brown
- iron: `#544C4C` cool gray
- steel: `#88807C` brighter gray
- black: `#141010` near-black with deep-gray highlights
- **mithril: `#40405C` indigo/blue-violet** (corrected from "blue-green tint")
- adamant: `#405440` dark green-gray
- rune: `#405864` cyan/teal-gray
- dragon: `#84180C` blood-red + black accents
- barrows-tarnished: `#403830` desaturated-ochre
- 3rd-age: `#988C8C` silver + `#C9A94A` gold inlay

→ *Scape's `data/sprite-palettes.json` becomes the canonical master. Per-region palettes (Heartlands, Sootworks, Moryskah, Veilwood, etc.) are weighted selections from the master, not new palette sets. Every Scape item must draw from master or a named derived sub-palette.*

### U9. Shading Discipline

**2-3 banded shading layers per surface. Not gradient. Not dithered fade.** Light source consistent across the entire library — upper-left convention. Highlights upper-left, shadows lower-right.

109 of 109 sampled iconic items use 2-3 discrete shading bands. No true gradients observed. Torva uses 3 bands; Torag's platelegs use 2; spirit shield family all use 3. The bandedness is part of the pixel-craft language — it preserves the "every pixel has intent" discipline even at the shading layer.

**Shadow tokens are palette-locked.** The second-darkest hex in every item should come from a named master-palette token (`scape.shadow.neutral`, `scape.shadow.warm`, `scape.shadow.cool`, `scape.shadow.tarnish`), selected based on the item's dominant hue. Never hand-pick shadow.

→ *Scape: shading is computed, not painted. Material → tier-palette → derive 2-3 bands by luminance step → pick shadow from the named token matching the dominant hue family.*

### U10. Semiotic Framing

**Items communicate, not illustrate.** Every visual choice encodes meaning the player reads instantly. The design language is extractable as rules precisely because it's a consistent communication system.

- Dharok's armor is *visually damaged* to match low-HP-high-damage mechanic.
- Scythe of Vitur uses *ash-purple* to show drained-life rhetoric.
- Dinh's Bulwark is *grayscale-rectangular slab* to match defensive-wall mechanic.
- Elysian Spirit Shield gets a *third specular ping* to show elevated holy luminance.
- Anti-Dragon Shield has *visible scale pattern* — practical, not pretty, but unambiguous in function.

Visual rhetoric matches mechanic. Weird-scaling items look weird. Holy items look holy. Cursed items look wrong-but-powerful. Rare items look rare via static composition, not animation.

→ *Scape: every item must answer "what does its art teach about its mechanic?" If a sword scales weird, its silhouette should be weird. If an amulet drains prayer wrong, its palette should be wrong-holy. Mechanical singularity earns visual singularity.*

---

## Part 2 — Tier Truths

How OSRS encodes power level visually. This is where the abstraction gradient (U6) meets palette cohesion (U8) meets the single-axis discipline (U7).

### Bronze (1-3 abstraction, low tier)
Warm dull-orange palette anchored at `#4C3820`. 3-5 colors total. Silhouette is the standard category template — for weapons, the literal shape; for armor, the slot baseline. 0-1 specular pings. Minimal ornament. Functional proportions. Reads as "starter kit / commodity craft."

### Iron (1-3 abstraction)
Cool dark gray `#544C4C`. Same silhouette as bronze (the workshop pattern). 1 specular ping at upper-left. Slightly tighter shading (2 bands). Reads as "step up from starter, still common."

### Steel (3 abstraction)
Brighter warm-tinged gray `#88807C`. Same silhouette. 1-2 specular pings. Cleaner edges. Reads as "competent commodity tier."

### Black (3 abstraction)
Near-black `#141010` with deep-gray highlights, slight blue undertone. **Inverts the luminance relationship** in composite items (boots, shields) — metal darker than leather instead of lighter. Restraint as tier signal.

### Mithril (4 abstraction) — CORRECTION
**Indigo/blue-violet `#40405C`, NOT blue-green.** This is verified across all 8 mithril slots in Wave A3. The foundational doc had this wrong. Mithril pulls toward magenta, not toward cyan. Saturation starts here — first "fantasy material" tier.

### Adamant (5 abstraction)
Dark green-gray `#405440`. Saturation continuing. Decoration starting on hilts/pommels/edges. Reads as "high-craft tier."

### Rune (6 abstraction) — first impossible-color tier
**Cyan/teal-gray `#405864`** — the first palette no real metal could be. This is the *palette-break rung* per Wave B6. The cyan reads as "rune-tier" instantly because nothing else in the library uses it. Saturated signature, clear specular, pronounced ornament.

### Dragon (8 abstraction) — the dragon-rung double-break
**Blood-red `#84180C` + black accents + gold inlay.** Both color AND ornament escalate together — the largest single jump in the abstraction curve (+2). Silhouette also softly deviates from the standard category template (dragon-scimitar sharpens the curve to 210 opaque vs standard 258; dragon-full-helm flips to wider-than-tall 1.154 aspect from standard 0.655). This is the *first iconic-tier* — the player reads "this is the prestige material."

Dragon is the only tier where silhouette, palette, and specular all advance at once. Every category gets a coordinated set-level jump at this rung.

### Barrows / Mid-iconic (7-8 abstraction)
Desaturated-ochre `#403830`. Tomb-tarnished. Each brother's set has a *silhouette-family signature* — Dharok damaged, Verac winged, Karil bow-curved, Guthan halberd, Torag warhammer, Ahrim hooded-mage. Set coherence through palette unification + shared accent location + shared ornament motif. The ancient-tomb-metal aesthetic is uniform across all 6 brothers' equipment.

### 3rd Age (9-10 abstraction) — palette-break ultra
**Silver `#988C8C` + gold inlay `#C9A94A`.** Breaks material with impossible silver-white. Keeps standard slot silhouettes (3rd-age-platebody is 30×23 / 580 opaque, near-identical to bronze-platebody — *not* a silhouette violator). Pure ornament spend on palette. Counter-intuitive finding from Wave A1: at 30px, 3rd Age has remarkably RESTRAINED visible gold — the gold-trim fans associate with 3rd Age lives in the worn 3D model and wiki renders, not the inventory icon.

### Crystal (8-9 abstraction) — palette-break + silhouette-soft-deviator
Pale-blue prismatic. Faceted, light-refracting. Crystal-bow shares the shortbow template (30×24 / aspect 1.250) but with only 141 opaque pixels vs standard 220 — same canvas, thinner silhouette. Crystal-helm 18×28, near-identical shell to 3rd Age but differentiated by thinner outline topology.

### Boss-unique / Mythic (9-10 abstraction) — single-axis-break apex
Twisted Bow (silhouette break only), Shadow (palette break only), Torva (silhouette break only), Scythe (silhouette break only). Each is 9-10 abstraction. Each spends its prestige budget on one axis and stays disciplined on the others. *Compound* breaks (silhouette + palette + material all at once) would feel over-designed — the discipline IS the apex.

---

## Part 3 — Material Truths

How materials map to specific palette + treatment + signature. This is the lookup table the Scape generator queries when given `material=cold-iron-reforged` or `material=void-touched` or `material=dragonbone`.

For each material, the database stores: palette range, dominant accent, shadow token, specular token, characteristic ornament motif, silhouette modifications (if any), text examples.

OSRS material vocabulary (verified):

| Material | Palette | Specular | Notes |
|---|---|---|---|
| Bronze | warm-orange dull `#4C3820` | yellow-green `#A8A814` | Slight tarnish hint at low end |
| Iron | cool-gray `#544C4C` | cool-near-white | Often paired with leather rim |
| Steel | bright-gray `#88807C` | warm-near-white | Dense shading |
| Black | near-black `#141010` | deep-gray | Inverts boot/shield luminance |
| **Mithril** | **indigo `#40405C`** | cool-blue-near-white | NOT blue-green |
| Adamant | dark-green-gray `#405440` | green-near-white | Decoration starting |
| Rune | cyan `#405864` | bright-cyan-near-white | First impossible-color |
| Dragon | blood-red `#84180C` + black + gold | dark-wood `#543808` | Always paired with gold accent |
| Barrows-tarnished | desaturated-ochre `#403830` | none or minimal | Each brother adds 1-2 unique colors |
| 3rd Age | silver `#988C8C` + gold `#C9A94A` | gold | Restrained gold visibility at 30px |
| Crystal | pale-blue-grey `#DCDCE0` tinted | tinted-pale | Light-refracting texture, lower fill |
| Void/Shadow | absorbing-near-black + amber | minimal-localized | Reads as "anti-light" |
| Bone | off-white `#DBDBD7` | off-white minimal | Always raw, never specular-pinged |
| Wood (low) | warm-brown `#543808` | minimal | Universal handle/haft material |
| Leather | warm-brown `#483509` | none | Universal composite-armor material |

**Composite-item rule:** boots and kiteshields use composite materials (metal + leather) at all metal tiers. The leather rim color `#483509` is byte-identical across bronze through rune kiteshields — a slot-constant, not a tier feature. **Dragon eliminates the composite entirely** (all-metal dragon-boots). Black inverts the luminance of the composite. This is a rule in the database: "composite → mega tier eliminates secondary material."

**Faction-as-material:** items branded to a faction inherit the faction palette as their *primary* material treatment, regardless of underlying mechanical tier. Saradomin-blessed weapons read as "Saradomin material" first, "metal weapon" second. Faction triplets per U8.

---

## Part 4 — Category Truths

The shared silhouette family + composition convention + tier progression for each major category. Drawn from Wave B1 (silhouette x-ray), B5 (composition), Wave A2/A3/A7/A8 (per-category bulk reads).

### Weapons

**One-handed standard:** scimitar 26×30, longsword 25×29, sword 20×31, dagger 21×31, mace 19×25, warhammer 19×25, battleaxe 20×23, pickaxe 16×28. Diagonal NE-SW orientation (blade upper-right, hilt lower-left). LR-symmetry 0.50-0.57 — deliberately asymmetric because the asymmetry is functional.

**Two-handed standard:** 2h-sword 21×30 (taller, slimmer than longsword). Bows: shortbows 30×24 horizontal aspect 1.25; longbows 26×29 vertical aspect 0.90. Crossbows 28×27 aspect 1.04. Staves 25×29 aspect 0.86 (mundane staves slimmer). Tall-and-thin signature.

**Tier-locked silhouette through rune.** Bronze through rune of every weapon type are *pixel-identical* — only fill palette changes. Seven tiers, one shape per type. This is the template-with-fill discipline applied across the metal ladder.

**Dragon softly deviates.** Dragon-scimitar sharper curve (210 opaque vs standard 258). Dragon-2h-sword nearly square (1.0 aspect vs standard 0.70). Dragon-dagger dramatically smaller (14×26 — the only dagger that reads as "blade, not sword"). Dragon-full-helm wider than tall.

**Ultra weapons own their silhouettes.** Twisted Bow (8 internal holes), Scythe of Vitur (0.201 fill — vast negative space inside the bbox), Elder Maul (square 30×30), Abyssal Whip (S-curve with 4 holes), Dinh's Bulwark (slab 27×29 / fill 0.573 — wall not weapon).

**Combat-style signaling at silhouette level:** scimitars, axes, daggers all carry low LR-symmetry (0.49-0.57) because their cutting edge is asymmetric. Maces, warhammers, battleaxes are slightly more symmetric. Godswords are 0.59-0.64 — moderate asymmetry from wing-decorated guards. Spears and halberds are diagonally extreme.

### Armor

**Slot-locked silhouette templates.** Each slot has one canonical template; the slot is read from shape, the tier from color.

- **Full helm**: 19×29 vertical bucket, vertical eye-slit, tall purple plume rising from crown. Mass distribution low (face-plate + visor + neck guard). Dragon and Crystal eliminate the plume (replaced by horns/shards/crests). 3rd Age stays at 18×28 with high symmetry (0.790 — ceremonial).
- **Platebody**: 31×23 trapezoidal torso, flared pauldrons, narrowing waist, smooth chest at high tier, sigil only at mega+. 4:3 wider-than-tall.
- **Chainbody**: 18×25 narrower-than-platebody, NO pauldrons, dimple-grid texture across whole surface (each dimple = mail link). This grid is *essential* and present on every chainbody including dragon.
- **Platelegs**: 12×29 narrow vertical two-leg silhouette with belt band at top. Aspect 0.41 — narrowest in the armor set.
- **Plateskirt**: 27×24 trapezoidal single-panel, NO leg division, includes a cross-tier-constant olive-yellow `#181D00` waist band representing the non-metal belt.
- **Kiteshield**: 30×28 tilted kite (~10° counter-clockwise rotation, never axial), composite layered (outer brown leather rim `#483509` + central cross-rib + four tier-metal quadrants).
- **Boots**: 29×26 paired three-quarter view (one boot upper-left, one lower-right, each with visible ankle and toe). Composite leather + metal toe cap at most metal tiers; dragon eliminates leather entirely; black inverts luminance.
- **Gloves**: 29×29 paired open-and-closed (one open with splayed fingers upper-left, one clenched into fist lower-right). Three-quarter perspective. Palette-pure metal (no visible leather cuff, unlike boots).

**Tier progression per slot:** palette ramp through bronze→rune; mega (dragon) earns silhouette break per slot (helm gets horns, kiteshield gets asymmetric corner insert); ultra (3rd Age, Crystal) breaks differently per slot (3rd-Age platebody keeps silhouette and breaks via palette; Crystal helm shrinks shell).

**Set coherence.** The Barrows brothers are the masterclass: each brother's pieces share a silhouette language and tarnished-tomb desaturated palette distinct from other brothers'. Sets are unified via *palette unification + shared accent location + shared wear state + shared ornament motif*. Apply this rule to every Scape set.

### Food

**Species-specific silhouette, raw/cooked palette shift.** Trout, tuna, lobster, shark, manta-ray, anglerfish, dark-crab — each species has a bespoke silhouette shared 1:1 between raw and cooked. Cooking changes palette (cool-gray → warm-gold-brown), not form.

**Cooking palette operator:** warm-shift (+30° hue) + edge-harden + specular-double. Universal across fish and meat. Anti-pattern: burnt food collapses palette to charcoal with warm under-hint, preserves silhouette.

**Apex food becomes plated.** Shark and Anglerfish become plated rectangular fillets rather than whole-fish silhouettes — apex-tier food signals "prepared cuisine" rather than "raw catch."

### Potions

**Vial template + liquid level + effect color.** All potions share one vial silhouette (~21×30 narrow-tall). Three orthogonal axes encoded in one template:
1. **Effect** = liquid color (red=combat, green=anti-poison, yellow=energy, etc.)
2. **Dose** = liquid pixel count (4-dose ≈ 18-22 pixels of fill; 1-dose ≈ 3-5)
3. **Imbue/upgrade** = added signature specular pip at canonical location

This is the cleanest template-with-fill in the game. Scape's potion system should clone this discipline.

### Runes

**Pixel-identical template across all 23 runes.** 29×28 / 654 opaque pixels / fill 0.805 / aspect 1.036 / lr_sym 0.970. Zero silhouette variance. The shared pebble outline is a *game-wide asset*; only color and central glyph vary across 23 items.

Element-color grammar:
- fire: red-orange
- water: cyan-blue
- earth: forest-green
- air: near-white/pale
- mind: pale-purple
- body: pale-warm
- nature: mint-green
- chaos: amber-yellow
- law: royal-blue
- death: near-white + skull-motif
- blood: dark-red
- soul: lavender-blue
- wrath: purple-violet apex

Combination runes (lava, mud, steam, smoke, mist, dust) carry larger 92-112 color palettes (vs elementals' ~68) because blended-hue transitions demand intermediates.

### Raw Materials

**Logs**: 31×25 horizontal cylinder template. All 9 standard tree species pixel-identical silhouette. Color = species (oak warm-brown, willow pale-grey-tan, maple warm-pink-brown, yew red-brown, magic violet-blue, redwood deep-red, mahogany dark-warm). Magic-logs cliff: violet `#605080` is the natural→magic threshold.

**Ores**: 32×28 rock-matrix template. All 12 standard ores pixel-identical. Fleck-color signals tier (copper warm, iron neutral-fleck, mithril blue-fleck, adamant green-fleck, rune cyan-fleck, dragon — does not exist as ore in OSRS, narrative consistency).

**Bones**: bone-shape silhouette varies per creature (regular, big, dragon, dagannoth, etc.). Always off-white, no specular, no shading band. Universally readable as "bone."

**Herbs**: 29×25 leafy-sprig template. All 14 species pixel-identical silhouette across both grimy and clean states. Differentiation purely through palette (and per-pixel ragged-ness inside the silhouette for grimy). Clean = vibrant green; grimy = desaturated-mud.

**Gems (uncut)**: 21×22 dense-cluster template. All 7 gem tiers pixel-identical. Color = tier (sapphire blue, emerald green, ruby red, diamond clear-white, dragonstone purple, onyx black-red, zenyte yellow-orange).

### Processed Materials

**Bars**: 28×22 ingot template. All 8 bars pixel-identical (394 opaque pixels each). Color = material per the tier table.

**Cut gems**: 21×23 faceted-thin template. All 7 cut gems pixel-identical (317 opaque each — sparser than uncut at 389, signaling facet-thinning).

**Clean herbs**: same template as grimy, vibrant green palette + 1-2 specular pips.

**Cooked food**: per-species silhouette inherited from raw, palette warm-shifted.

**Plank**: horizontal slab template, color = source tree.

### Jewelry

**Ring**: 18×22 small dense circle (centered mass). Fill ratio ≥ 0.65 (rings must look small-and-dense, not large-and-thin). Quest-critical rings the only oversize exception.

**Amulet**: pendant-on-cord silhouette, gem-as-centerpiece. Gem color signals tier; gem-on-metal items use a *specular pair* — one cool-metal upper-left + one warm-or-tinted central-gem ping, each in its own palette.

**Necklace**: similar to amulet but with a different chain/pendant proportion.

**Tier via gem centerpiece**: opal → sapphire → emerald → ruby → diamond → dragonstone → onyx → zenyte. Color + size as tier signal.

### Tools

**Pickaxe, hatchet, fishing rod, harpoon, butterfly net, chisel, hammer, knife, tinderbox** — each has a category-specific silhouette template. Tier follows the same metal-ladder palette per U8 + Material Truths.

Tools sit lower on the abstraction scale than weapons (1-3 abstraction) — they stay practical and literal across tiers. A dragon pickaxe is recognizable as a pickaxe, not as an abstracted symbol of mining.

### Quest Items — see Part 5 (Origin Truths)

### Junk / Common — see Part 8 (Anti-Pattern Grammar)

---

## Part 5 — Origin Truths

How the *origin* of an item — whether it was crafted, dropped from a boss, found via random event, or rewarded from a quest — shows up in its art.

### Craft Origin (default)
Clean proportions, predictable silhouette per category template, polished, generic, follows tier grammar exactly. The default. Bronze-bar to dragon-2h-sword: all craft-origin items.

→ *Scape: craft items inherit category template + tier palette + tier-appropriate ornament. No deviation.*

### Quest Origin — *the resists-tier-grammar aesthetic*

Quest items break the standard tier grammar deliberately. They have their own visual rules. From Wave B9 (quest-resistance) — the most studied origin in our corpus, with 475 items analyzed.

**Two sub-classes:**

1. **Gate items** (~10% of quest items): items the quest *gates* but that follow tier grammar. Proselyte set, god-books, Elemental shield, Dragon sq shield, Mind helmet, Helm of Neitiznot. These are existing tier items that happen to be quest-locked. The quest is the gate; the item is normal.

2. **Artefact items** (~90%): items the quest *creates* with bespoke art. These resist tier grammar entirely. Arkan blade, Darklight, Silverlight, Blisterwood flail, Wolfbane, Tarnished key, Barrelchest anchor.

**Artefact item rules:**

- **Palette-resistance**: quest artefacts must NOT use tier-metal palettes (bronze/iron/steel/mithril/adamant/rune/dragon equivalents). Pick from lore / faction / regional / property palette instead.
- **Anatomical plausibility**: silhouettes stay inside realistic proportions. Silhouette-uniqueness scores 6-8 are normal; 9-10 reserved for items with narrative singularity. Exaggeration is the tier channel; quest items must stay out of it.
- **Default state register is "used"**: pristine is rare and reserved for ceremonial/newly-created items. The four working state registers are:
  - *Used*: slight desaturation, one outline notch, specular intact
  - *Weathered*: heavier desaturation, rough silhouette edge, specular reduced
  - *Blessed*: silver-shift palette, holy-tinted specular, sometimes added 1-pixel halo accent
  - *Cursed*: red/violet hue-shift, shadow-deepened, specular distorted
- **Narrative-readability mandate**: every artefact must carry one diegetic cue — a silhouette feature, palette hue, or embedded glyph — that teaches the player its function at thumbnail size. Greegree is creature-shape; climbing-boots have cleats; anti-dragon shield has hide banding.

**Seven artefact sub-aesthetics** (per Wave B9 + A4-A6 synthesis):
1. *warm-occult* — Iban line, killer's knife, Arkan
2. *cool-lunar/fey* — Lunar set, moonlight grub, glowing fungus
3. *holy-Saradominist* — holy book, Ivandis flail, Justiciar's hand
4. *bestial-tribal* — greegrees, M'speak, Karamjan vessel
5. *ancient-mastaba* — Mastaba key, magic stone, ogre artefact
6. *gothic-aristocratic* — Vyre noble, dust jacket
7. *consecrated-tool* — anti-creature ritual weapons (silver for lycans, blood-red/cream for vampyres, white for shades)

**Set coherence mechanisms** for multi-piece quest sets:
- *Palette-unified worn kits* — Lunar (silver-blue), Mourner (black-grey), Ghostly (translucent-grey), Khazard (red-black). One palette across all pieces.
- *Silhouette-unified collectibles* — Melzar keys, frozen key pieces, paladin badges. One template shape, palette varies per fragment.

**Compound silhouettes signal grandmaster register.** A quest item composed of multiple recognizable elements (branch + leaf + berries; leaf-wrap + meat; body + wrapping) is grandmaster-tier signaling. Single-element silhouettes default to novice/intermediate.

→ *Scape: every quest item generated tagged with `quest_role: gate|artefact`, `sub_aesthetic`, `state_register`, `set_coherence_mode`. The artefact path uses the lore/faction palette pipeline; the gate path uses the standard tier-material pipeline.*

### Boss Drop Origin — three-channel identity transfer

A boss's visual identity transfers to its unique drops via THREE channels (Wave A8 finding):
1. **Palette pair** — shared signature colors across all drops (Bandos brown-gold, Armadyl cool-metallic, Saradomin cool-blue, Zamorak warm-red)
2. **Recurring motif** — wings, horns, scythe, eye, fleur, bone, scale, flame — repeated across drop pieces
3. **Silhouette-violation** — reserved ONLY for the apex ultra-tier drop. Lesser drops share palette+motif; apex drop additionally breaks silhouette.

Examples:
- **Corp** drops: spirit-shield template silhouette shared across base/blessed/spectral/arcane/elysian; the *family itself* is silhouette-unique vs all other shields, but no individual elysian-vs-spectral silhouette breaks.
- **CoX** drops: Twisted Bow (silhouette break on apex), Elder Maul (silhouette break on apex), Kodai Insignia (palette signature, no silhouette break), Dragon Claws, Dinh's Bulwark.
- **ToB** drops: Scythe of Vitur (silhouette break on apex), Ghrazi Rapier (sword template), Sanguinesti Staff (staff template).
- **GWD** drops: each god's items share palette triplet, silhouette stays inside slot template except for the apex (Bandos chestplate breaks platebody silhouette to brutalist 20×28 vertical; others stay close to template).

→ *Scape: every boss is authored with a faction triplet + signature motif + ONE apex item that gets silhouette-violation. Lesser boss drops inherit palette+motif but stay inside category template.*

### Monster Drop Origin

Items dropped by monsters often *incorporate the monster's body parts* visibly. Bone dagger has bone shape obvious. Dragon claws use red+bone palette and curve-talon silhouette. Abyssal whip is literally the abyssal demon's tail. Hydra slayer helmet has hydra-head ornament.

→ *Scape: monster-drop items earn silhouette-inherit-with-bodypart treatment.*

### Random Event Origin — the curio aesthetic

Random event items carry an off-master "whimsy" palette signaling found-object status. They don't fit the standard tier grammar. Often slightly off-kilter, with an asymmetry that reads as "found, not crafted."

---

## Part 6 — Iconic-Design Grammar

What makes specific items become legends. From Wave D essays + Wave B6 synthesis.

**Three iconic modes:**

1. **Visual-distinction iconic**: items iconic because their visual is unique and distinctive at thumbnail size. Twisted Bow, Shadow of Tumeken, Scythe of Vitur, Elder Maul, Torva, Dragonstone amulet, every gem at peak tier. The art carries the prestige.

2. **Scarcity-as-identity iconic**: items iconic because they are *rare*, despite simple design. Phats (flat color field with no detail), Santa Hat, holiday discontinued items. The art is intentionally simple; the cultural identity comes from rarity. *Designing complex art for a rare item misses the assignment — Phat-tier rarity needs Phat-tier visual restraint.*

3. **Process-chain iconic**: items iconic because they participate in a *recognized chain*. Bowstring is iconic because every fletcher knows that yellow-squiggle. Unstrung Bow is iconic because of its anticipation-built-in design. Magic Logs are iconic because of the violet-blue palette cliff that signals "this is the magic-tier of the wood ladder." The chain context makes the item known.

**Five visual properties common to all iconic items:**
1. **Unique silhouette readable at thumbnail size** — recognizable at 16px (or sometimes 8px, if scarcity-iconic)
2. **One signature visual element** no other item has (the twist, the void, the asymmetric blade, the impossible-color material, the simple flat color field)
3. **Story embedded in the look** — you can guess where it came from by looking
4. **Color that's almost its own material** (rune-cyan, dragon-red, void-black aren't colors, they're identifiers)
5. **Visual rhetoric matches mechanic** — weird-scaling items look weird, holy items look holy-but-wrong, sharp items look aggressive

**The single-axis-break discipline** (U7) applies to all iconic items. Each ultra-tier icon spends its prestige budget on ONE dimension:
- Twisted Bow → silhouette
- Shadow of Tumeken → palette
- 3rd Age → material
- Torva → silhouette
- Phat → simplicity-extreme (palette + scarcity)
- Bowstring → process-chain context

→ *Scape: Iconic Audit. Walk the full Scape item list and flag which items SHOULD be iconic. Maybe 80-120 out of ~500. These get hand-designed prompts and approved-only generation. The other ~400 follow the algorithmic rules. This mix is what makes a game library feel like "some pieces are special." If everything is special, nothing is.*

→ *Scape: spend silhouette-violation budget on one apex per boss / category / faction. Lesser items inherit category template.*

---

## Part 7 — Process-Chain Grammar

From Wave B8. A process chain is itself a design object. Bronze-ore → bronze-bar → bronze-sword should read as three states of one material. Designing a chain means designing the *operators*, not the individual icons.

**Bounded operator vocabulary** (~12 operators total):

- `grimy_to_clean(palette)`: saturate-decompress(0.5) + hue-shift-toward-ochre(+15°) for grimy; then saturate-up(1.5) + collapse-to-2-hexes for clean; specular-add on clean
- `raw_to_cooked(palette)`: hue-shift-warm(+30°) + saturate-up(1.3) + edge-harden + specular-double
- `raw_to_burnt(palette)`: desaturate-to-near-black + silhouette-keep
- `ore_to_bar(palette)`: silhouette-substitute (rock-matrix → ingot template) + palette-purify (remove rock, keep material fleck-color, expand to 3-band)
- `bar_to_weapon(palette)`: silhouette-substitute (ingot → category-weapon-template) + palette-keep + specular-add
- `log_to_unstrung_bow(species_palette)`: silhouette-substitute (horizontal cylinder → curved arc) + orientation-rotate + palette-keep
- `unstrung_to_strung()`: overlay 1px cord line; otherwise pixel-identical
- `uncut_to_cut_gem(palette)`: silhouette-facet (dense cluster → faceted-thin) + saturation-boost(1.2) + add 1-2 specular pixels
- `dose_decrement(potion, by=1)`: liquid-pixel-count-reduce by ~5
- `imbue(item)`: add 1 signature specular at canonical location
- `bless(item)`: silver-shift palette + holy-tinted specular
- `corrupt(item)`: desaturate(0.7) + shadow-deepen + hue-shift toward decay-teal or red-violet

**Three threads connect chain steps:**
1. **Palette-continuity** (default) — material/species hue survives every transformation. Yew stays red-brown log→bow→arrow. Mithril stays violet-blue ore→bar→weapon.
2. **Silhouette-continuity** (alternative) — when shape must change (log→bow, ore→bar), palette MUST hold. When palette must break (smelting chemistry, curing), silhouette MUST hold.
3. **Affordance-rendering** — incompleteness rendered as visible absence. Unstrung bows have exposed nock loops where the string would tie. Empty vials are hollow glass shape. Fragment items have jagged interlocking edges. The missing thing leaves a *visible negative space*.

**Failure states preserve silhouette and shift palette.** Burnt-lobster = near-black lobster (not "generic charcoal blob"). Corrupted-item = desaturated-shadowed version of original. Silhouette preservation lets the player say "oh no, this WAS my lobster."

**Multi-dose potions** use fixed vial silhouette + liquid-level encoding. Three orthogonal axes (effect color, dose pixel count, imbue specular) in one 14×20 template.

→ *Scape: process chains are first-class design objects. Author the operators in `data/process-operators.json`; the icons emerge from operator application. When a player opens a bank holding `cold-iron-ore`, `cold-iron-bar`, `cold-iron-reforged-scimitar`, those three icons must read as three states of one material — that's the lexicon working.*

---

## Part 8 — Anti-Pattern Grammar (Junk / Broken / Worthless)

From Wave B7. Designing junk well is as hard as designing prestige well. The economy needs believable floor items; the prestige ladder needs a depth gradient.

**Junk palette band**: hue 60-180 (yellow-cyan range, the "muddy" zone), saturation 0.2-0.7, luminance 0.08-0.25. Brown, gray, rust, sickly-green, dull-red.

**Forbidden colors on junk**: NO dragon-red, NO rune-cyan, NO 3rd-age-gold, NO mithril-indigo, NO impossible-color signatures. Junk colors must signal "this is *not* the prestige tier" by absence of prestige hues.

**Zero specular is the strongest single junk signal.** No upper-left near-white ping. If an item must have a bright accent for readability, distribute brightness across interior pixels rather than focally pinging it.

**Broken silhouettes depict specific failure modes.** Axes break at the haft, shields at the boss, scrolls at the corner. Generic cracks look like incomplete art. Every broken item answers "how did this specifically fail?" in its silhouette.

**Burnt = palette collapse to charcoal with warm under-hint.** Compress shading to 1-3 bands, shift midtones to near-neutral gray with hue-specific undertone. Do not add black soot pixels on top — *rebuild* the whole palette at low luminance.

**Joke-junk executes its category template perfectly.** The cabbage-shield rule: silhouette-correct for its category (valid shield outline, correct proportions, specular where the category's specular would go — absent in this case) while substituting the joke palette. A joke item that also looks mis-drawn is just a bad item.

**Iconic junk is junk executed with extreme commitment.** The cabbage is iconic because every pixel commits to "I am a cabbage." Junk iconicity is achieved by *refusing to ornament*, not by adding.

**Counter-items (precious-looking-but-worthless) need a tell.** If shipping an item whose silhouette and palette look prestige but which is mechanically junk, the tell must be specular absence + one degradation marker. The "24-carat-sword rule": gold palette, sword silhouette, but zero specular and slightly off proportions.

→ *Scape: design starter wardrobe and vendor-trash deliberately generic-forgettable. The first prestige item the player earns must POP against a wardrobe of mud-brown shirts and olive leathers. If starter gear is too interesting, prestige gear won't feel like a promotion.*

---

## Part 9 — Scape Application

The principles transfer; the vocabulary is ours to author.

### What we adopt directly

- All 10 universal rules (U1-U10): outline contract, static-only, tight-crop, nearest-neighbor, every-pixel-has-a-job, tier-as-abstraction, single-axis-ultra discipline, palette cohesion, shading discipline, semiotic framing
- Tier grammar: 10-step ladder (low/mid/high/mega/ultra) with palette-break rung and dragon-rung double-break
- Material treatment vocabulary: 13+ materials, each with palette range + specular token + ornament motif
- Category silhouette templates: per-slot canvas dimensions, fill ratios, mass distributions, aspect ratios
- Origin grammar: craft default, quest-resistance with 7 sub-aesthetics + 4 state registers + gate/artefact split, boss-drop 3-channel identity transfer
- Process-chain operators: ~12 bounded operators that compose
- Iconic-design grammar: 3 iconic modes (visual-distinction, scarcity, process-chain), 5 visual properties, single-axis discipline
- Junk grammar: palette band, forbidden colors, zero-specular, broken-silhouette specificity

### What we author originally

- **Master palette** at `data/sprite-palettes.json` — 48 colors, our own choices. Same discipline as OSRS (one master, sub-palettes nest), different specific hues.
- **Per-region sub-palettes** — Heartlands, Sootworks, Moryskah, Veilwood, Boneyard, Saltbrine, Inkweald, Glass Desert, The Wilds. Each weighted from master toward regional flavor (already authored in v1; verify against the new master).
- **Per-faction triplets** — Scape's Lamplighter Guild, Sootworks Guild, Bog Witch's Coven, Threshold Wardens, etc. Each gets a 3-hex triplet.
- **Material vocabulary** — Cold-Iron, Bog-Iron, Crystal, Saltbound, Voidtouched, Dreamwrought, Salt-Cured, Soot-Forged. Each gets palette + specular + ornament motif. Can echo OSRS structure (same number of tiers, same single-axis discipline) without copying any specific OSRS color.
- **Iconic items** — 80-120 hand-curated icons that get hand-prompted generation + pixel-editor cleanup. Boss apex drops, signature quest rewards, prestige unlocks. Single-axis-break per ultra item.

### What we deviate from

- **Region count and naming** — already different from OSRS (9 regions with our own names).
- **Skill list** — same 23 skills (or close), but the named *content* differs (no Wintertodt, no Sepulchre — Scape has Cinder King's Graveyard, Whisper Glade, Mooncourt Runecrafting, etc.).
- **Quest narrative voice** — already different per region per project memory.

### Bridge document

The companion `data/visual-design-rules.json` is the queryable database. The Scape art generator queries it like:

```js
const rules = visualRules.compose({
  category: 'sword',
  subcategory: 'scimitar',
  tier: 'mega',
  material: 'cold-iron-reforged',
  origin: 'boss_drop',
  region: 'sootworks',
  iconic_break_axis: null  // not iconic; default category-tier behavior
});
// → returns merged spec: outline + canvas + silhouette template + palette + specular discipline + ornament + abstraction level
```

Then the generator builds the prompt for the local SD model:
```
Scape sword icon, scimitar subcategory, mega tier (dragon-equivalent rung).
Material: cold-iron-reforged — palette {hex list}, specular {hex}, ornament motif {description}.
Origin: boss-drop from the Cinder King — apply faction palette {triplet} and motif {description}.
Region: Sootworks — weighted toward {regional palette}.
Apply universal rules: 1px black outline, complete enclosure, static, 28×30 canvas, NE-SW diagonal, fill 0.40-0.55, specular 2-3 pings upper-left + pommel + edge.
Abstraction level: 8/10 — silhouette softly deviates (sharper curve), palette shifts to impossible blood-red equivalent.
No emojis, no copying OSRS, original Scape style per visual style bible.
```

The generator hits the local SD endpoint, gets back 4 candidates, the DM picks one, optionally cleans up in the embedded pixel editor, commits to `public/sprites/items/cold-iron-reforged-scimitar.png`.

This is the system. The rules database is the foundation.

---

## Part 10 — Closing

OSRS's mastery is not in any individual icon. It's in the *consistency* — 12,000 individually-authored icons that read as one coherent inventory grammar because every choice was constrained by rules even Jagex couldn't fully articulate. Most categories share silhouettes (75%+ of the library is template-with-fill or category-template); the apex 5-10% breaks templates with single-axis discipline; the outline rule holds at 99.96% compliance; the static-only rule holds at 100%; palette cohesion holds across entire factions and regions.

Copying OSRS's *form* is easy. Copying its *discipline* is the hard part — and the discipline is where the design tradition actually lives. Scape inherits the discipline by codifying the rules and applying them through a generator + pixel-editor pipeline that respects them automatically. The result is not OSRS-with-a-coat-of-paint; it's a fresh world that reads as if it shares the same design heritage.

The lexicon is complete. The rules database is the next deliverable. After that: the SD-backend wrapper, the codex tab + generate/regenerate flow, the pixel editor. Then we generate. Then we play.

---

*End of document. Synthesis sources: Wave A1 (109 iconic items), A2 (50 weapons), A3 (69 armor), A4-A6 (475 quest items), A7 (85 processed materials), A8 (121 raw materials + boss uniques), Wave B1 (silhouette x-ray, 402 measurements), B2 (palette archaeology, 17 rules), B3 (specular discipline, 15 rules), B4 (outline variation, 12 rules), B5 (composition, 15 rules), B6 (abstraction gradient, 15 rules), B7 (anti-pattern, 12 rules), B8 (process chains, 15 rules), B9 (quest-resistance, 20 rules), Wave D1 (35 iconic weapons, 16K words), D2 (33 iconic armor, 12K words), D3 (35 iconic curios, 13K words). Total corpus: ~80K words of analytical input distilled into this ~9K-word lexicon. Companion file: `data/visual-design-rules.json`.*
