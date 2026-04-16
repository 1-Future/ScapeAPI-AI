# OSRS Item Design Lexicon — Research Program

*Read this first. Every agent in the lexicon research wave references this document for shared context, principles, and quality standards.*

## Mission

Build a design-literate analysis of OSRS's item-icon visual language that yields queryable rules usable for generating original Scape items in the OSRS design tradition without copying any Jagex IP. The final deliverable is a prose lexicon (design textbook, ~10-15K words) + a structured rules database (JSON, queryable) that the Scape art generator can consume.

This is research, not content generation. Observe the art, extract the rules, codify them. The end state is that designing a Scape Cold-Iron Reforged Scimitar becomes a matter of looking up (category=scimitar, tier=dragon-equivalent, material=cold-iron, region=sootworks, origin=boss_drop) in the database and getting a complete prompt specification out.

## Scope

938 sampled OSRS items across ~236 category/tier tags. Source cache at `C:/tmp/osrs-study/` (outside the Scape repo, never distributed):

- `/icons/<slug>.png` — 11,899 inventory icons (typical 30×30 px, tight-cropped, ~500 bytes each)
- `/meta/<slug>.json` — 12,193 item metadata files (wiki categories, infobox stats, examine text, our `reasons` sampling tags)
- `/analysis-targets.json` — the 938-item analytical sample
- `/index.json` — full 12,193-item index

Legal framing: fair-use research. We observe art to extract *principles*, not images to redistribute. Cache stays local.

## Foundational design observations

*These have been established through design conversation. Every agent is expected to validate, deepen, refine, and provide evidence for these — not re-derive from scratch. If you find an exception, document it.*

### Universal rules (candidate, needing validation)

**The Outline Rule.** Every item silhouette has a 1-2px dark outline (near-black or deep warm-tone), forming complete enclosure with no soft edges. This is what makes inventory icons read as *cards/stickers* rather than scenes — they survive any background. Expected: near-universal adherence, exceptions rare and signaling-meaningful.

**Static-Only Commitment.** Zero animation in the inventory icon itself. No pulse, no particle, no rotation, no shimmer. "Shine" is rendered as 2-3 pixel near-white highlights at fixed canvas positions, living in *composition* not in *time*. This is restraint as quality signal — the item is precious because the static art alone earns the prestige.

**Tight-Crop Canvas.** Icons crop tight to silhouette with 1-2px padding, not centered on a fixed 32×32 grid. Canvas flexes to item shape — a dagger icon is narrow, a platebody icon is wide. Bounding-box-centric, not slot-centric.

**Nearest-Neighbor Design Intent.** Icons are *authored* at native ~30px and scaled up for display with nearest-neighbor rendering. Every pixel has intent. There is no design-big-and-shrink workflow — the small canvas is the source of truth. This is why the icons hold up at any zoom.

**Every Pixel Has a Job.** At 30px there's no room for decorative noise. If a pixel exists it conveys silhouette, material, detail, or specular. Nothing is atmospheric. Nothing is background texture.

**Tier as Abstraction.** Low-tier items are *literal* renderings of their function; high-tier items are *stylized symbols of themselves*. The progression is functional → idealized → iconic → mythic. The form serves *recognition* over *realism* the higher you go. (A bronze sword is "a sword." A Dragon Scimitar is "the idea of a Dragon Scimitar" — curve exaggerated past anatomical reason. A Twisted Bow is "bowness pushed past structural reason into pure signature.")

**Palette Cohesion.** OSRS items share a master palette across the whole game so that a library of 12,000+ icons feels like one world, not a pile of clip art. Per-faction/per-region/per-material sub-palettes nest inside the master. Items tied to Heartlands feel like Heartlands, items tied to Morytania feel like Morytania, but they all feel like *OSRS*.

**Shading Discipline.** 2-3 banded shading layers (not gradient, not dithered fade). Light source is consistent across the library — upper-left convention. Highlights on upper-left, shadows on lower-right.

**Semiotic Framing.** Items are communication, not illustration. Every visual choice encodes meaning the player reads instantly. The design language is extractable as rules precisely because it's a consistent communication system.

### Category rules (to be discovered by Wave B/C)

- Each major category has a *shared silhouette family* (all swords point blade-up hilt-down, all bows curve, all potions are vial-shaped with liquid-color = effect)
- Each category has *palette logic* — how color maps to material within that category
- Each category has *tier progression rules* that may differ from other categories (weapons progress palette cooler-then-warmer across tiers; armor progresses differently)
- Each category has *functional readability conventions* (slash vs stab vs crush weapon silhouettes differ; 1H vs 2H cues)
- Each category has *exceptions that prove the rule* (the Abyssal Whip doesn't look like a standard weapon — this is a Signal)

### Tier rules (to be discovered/codified)

- **Low tier**: dull palette, simple silhouette, no specular, minimal ornament, functional proportions
- **Mid tier**: cleaner palette, faint specular, slight ornament accumulation
- **High tier**: saturated signature color, clear specular ping, pronounced ornament
- **Mega tier**: unique color treatment no lower tier uses, multi-point specular, decorative silhouette flourishes (asymmetric guards, fluting, inset gems)
- **Ultra tier**: bespoke silhouette no other item shares, color-as-material (prismatic, void-black, light-absorbing), more white space framing, no-animation restraint still preserved

**Critical ultra-tier discipline (Wave A1 finding):** ultra-tier items break *exactly one* dimension — silhouette OR palette OR material-treatment — while staying disciplined on the others. Twisted Bow breaks silhouette, restrained palette. Tumeken's Shadow breaks palette, standard staff silhouette. 3rd Age breaks material, standard slot shapes. *Three-axis maximalism actively hurts legibility.* Also: ultra tier permits MORE negative space than mid-tier items as prestige language (Dinh's Bulwark, Shadow, TzKal slayer helmet).

**Template-with-fill pattern (Wave A7 finding):** some categories use identical pixel templates with only palette/glyph variation — all 23 runes are 29×28 with 654 opaque pixels; all 8 bars are 28×22 with 394 opaque pixels. This is extreme palette-discipline — the silhouette is a *shared asset*, only color differentiates. Scape should consider this for its rune/bar/herb equivalents.

**Boss-identity transfer (Wave A8 finding):** a boss's visual identity transfers to its unique drops via THREE channels: (1) palette pair — shared signature colors across all drops, (2) recurring motif — wings, horns, scythe, eye, fleur etc repeated across drop pieces, (3) silhouette-violation — reserved only for the apex ultra-tier drop (the Scythe, the Twisted Bow). Lesser drops share palette+motif; apex drop additionally breaks silhouette.

### Material rules (to be discovered/codified)

Each material has a specific palette + treatment + signature:
- **Bronze**: warm dull-orange, slight tarnish hint
- **Iron**: cool gray, minimal ornament, one shade
- **Steel**: brighter gray, subtle highlight
- **Black**: near-black with deep-gray highlights, slight blue undertone
- **Mithril**: indigo/blue-violet (#30-42 purple-blue family) — corrected from "blue-green tint" per Wave A3 finding across 8 mithril slots
- **Adamant**: dark green-gray, more decoration
- **Rune**: cyan/sky-blue signature, impossible-metal color
- **Dragon**: blood-red + gold accents, heat rhetoric
- **Barrows-tarnished**: desaturated ancient-tomb metal, brother-specific silhouette
- **3rd Age**: white + gold, ceremonial-gilded, oversized ornament
- **Crystal**: prismatic, light-refracting
- **Void**: light-absorbing, anti-aesthetic

### Origin rules (to be discovered/codified)

- **Craft items**: clean proportions, predictable silhouette, polished, generic
- **Quest items**: practical-not-pretty, narrative-readable shape, feels used not pristine, often asymmetric in a *purposeful* way
- **Boss drops**: bear the boss's visual identity (Barrows = tarnished tomb metal, Torva-class = brutalist black-gold, draconic drops = red-and-bone)
- **Monster drops**: incorporate the monster's body parts visibly (bone dagger has the bone shape obvious)
- **Random event curios**: slightly off-kilter, don't fit the standard tier grammar, feel like found objects

### Iconic-design grammar (what makes specific items legends)

- **Unique silhouette readable at thumbnail size** — recognizable at 16px
- **One signature visual element** no other item has (the twist, the void, the asymmetric blade, the glow that's actually a fixed highlight)
- **Story embedded in the look** — you can guess where it came from
- **Color that's almost its own material** (rune-cyan, dragon-red, void-black aren't colors, they're identifiers)
- **Visual rhetoric matches mechanic** — weird-scaling items look weird, holy items look holy-but-wrong if they invert prayer, sharp items look aggressive

## Required deliverables by wave

### Wave A — Bulk per-item deep read (8 agents × ~120 items)

Each agent processes a chunk, reads the PNG + metadata, produces per-item JSON in `/tmp/osrs-study/analysis/wave-a/<chunk>.json`:

```json
{
  "item_id": "dragon_scimitar",
  "visual": {
    "canvas_w": 30, "canvas_h": 27,
    "outline_treatment": "1px black, complete enclosure",
    "outline_exceptions": null,
    "shading_layers": 3,
    "light_direction": "upper-left",
    "dominant_palette": ["#7A1F1A", "#A33A30", "#D44F40", "#F8D070"],
    "palette_size": 6,
    "specular_pings": 2,
    "specular_locations": ["blade upper-left", "pommel center"],
    "silhouette": "asymmetric curved blade, exaggerated curve, short grip, ornate guard",
    "silhouette_uniqueness_1to10": 8,
    "ornament_density": "medium",
    "abstraction_level": "high — curve past anatomy, color past metallurgy"
  },
  "tags": {
    "perceived_tier": "mega",
    "perceived_rarity": "uncommon",
    "perceived_origin": "monster_drop",
    "perceived_function": "melee_slash",
    "iconic_score_1to10": 9,
    "follows_universal": ["outline", "static_only", "tight_crop", "every_pixel"],
    "breaks_universal": [],
    "follows_category": ["scimitar_curved_blade", "blade_up_hilt_down"],
    "category_innovations": ["curve exaggerated past category norm", "signature red unique to this material"]
  },
  "critique": "100-200 word prose explaining what's working and why. Specific design observations. What rules does it demonstrate. What Scape can learn."
}
```

### Wave B — Specialist lenses (10 agents × all 938 items, one lens each)

Each agent reads every sampled icon through one specific focus lens. Output: 2-3K word thematic report to `/tmp/osrs-study/analysis/wave-b/<lens>.md`.

Lenses:
1. **Silhouette X-ray** — items as pure black-and-white form only
2. **Palette archaeology** — per category/tier palette vocabularies
3. **Specular discipline** — highlight locations, counts, rarity correlation
4. **Outline variation** — the 1-2px rule with exceptions catalogued
5. **Composition / canvas framing** — bottom-weighted vs centered, white-space rhetoric
6. **Abstraction gradient** — tracing functional→iconic progression across categories
7. **Anti-pattern study** — how OSRS signals junk/broken/worthless
8. **Process-state chains** — ingredient→semi→finished visual transitions
9. **Quest-resistance aesthetic** — why quest items reject the tier grammar
10. **Reverse-lookup test** — blind ID from icon alone, most-reliable signals

### Wave C — Category treatises (12 agents, one per category family)

Each agent writes a 2-4K word treatise on that category's design language to `/tmp/osrs-study/analysis/wave-c/<category>.md`. Categories: weapons, armor, food, potions, runes, raw-materials, processed-materials, jewelry, tools, ammunition, quest-items, junk-currency-cosmetics.

### Wave D — Iconic case studies (3 agents × ~33 items each)

Each agent deep-reads ~33 hand-picked iconic items (from the 100 iconic list) and writes 300-500 word case studies per item to `/tmp/osrs-study/analysis/wave-d/<agent-id>.md`. What is this item, how does it read visually, why is it iconic, what design choices created that, how would Scape design its equivalent without copying.

### Wave E — Synthesis (2 agents + me)

Agent E1: writes `reports/osrs-item-design-lexicon.md` — the prose textbook. Synthesizes all Wave A/B/C/D output into universal truths → category truths → material truths → origin truths → tier truths → iconic-design-grammar → Scape application notes.

Agent E2: writes `data/visual-design-rules.json` — the queryable rules database. Every rule tagged with:
- `rule_id`
- `scope` (universal / category / tier / material / origin / iconic)
- `spec` (the rule stated)
- `evidence` (which items demonstrate it, pulled from Wave A per-item data)
- `exceptions` (cases that break it, with explanation)
- `scape_application` (how to apply to Scape generation)

Then me (Claude main session): review, harmonize, write the bridge-to-Scape section, publish.

## Universal quality bar

Every agent must meet these or the wave fails:

1. **Design research analyst, not content generator.** Produce evidence-backed pattern analysis, not taxonomy. Not "this is a red sword." Instead "this sword uses the dragon-tier blood-red signature palette; compared to iron-tier scimitars which stay within plausible metallurgical grays, the dragon palette is explicitly impossible — a material that signals tier not metallurgy."

2. **Tier-down ordering.** Always study highest-tier exemplars first (3rd Age, Twisted Bow, Shadow, Torva, Scythe, Bandos, Dragon). Lower tiers are then readable as *step-downs* from the ceiling. Going low-to-high is a different and weaker analytical approach.

3. **Comparative.** Always cite specific items by name when making claims. "The X demonstrates rule Y because [specific visual detail]; compared to Z which is similar category but [detail that differs]..."

4. **Pattern-seeking.** Don't describe 10 items individually. Describe the *pattern* that 10 items demonstrate, using 2-3 as illustrative examples. Generalize before enumerate.

5. **Evidence-attached rules.** Every rule stated must list 3+ items that demonstrate it, and any known exceptions with explanation ("the rule holds except for X class of items because [signaling reason]").

6. **Scape-application oriented.** Every insight ends with "→ for Scape this means..." — what specific rule goes into our rules database.

7. **Opus 4.6 extended thinking.** Use deep reasoning. Don't rush. The whole point of this burn is quality.

8. **No emojis.** CommonJS if writing code. No copying OSRS art — we're analyzing design LANGUAGE to codify design RULES.

9. **Validate foundational observations.** If you find evidence an assumed universal rule is wrong, flag it and correct. Don't just confirm priors.

## File paths

- Read: `C:/tmp/osrs-study/icons/<slug>.png`, `C:/tmp/osrs-study/meta/<slug>.json`, `C:/tmp/osrs-study/analysis-targets.json`
- Write: `C:/tmp/osrs-study/analysis/wave-<N>/<agent-id>.json|md`
- Never write to the Scape repo except in Wave E synthesis (which goes to `reports/osrs-item-design-lexicon.md` + `data/visual-design-rules.json`).

## Coordination

Waves A, B, C, D run in parallel — agents are independent, no inter-dependencies. Wave E waits for all prior waves to complete before synthesis.

The user owns the Scape project. This document is the foundation; each wave agent gets it + their specific brief + their items chunk + output path. Every agent is Opus 4.6 with extended thinking.

## End state

When this research is complete:
- `/tmp/osrs-study/analysis/` contains hundreds of analytical outputs
- `reports/osrs-item-design-lexicon.md` is the canonical human-readable design textbook
- `data/visual-design-rules.json` is the queryable rules database the art generator consumes
- Scape can now generate original items at any (category × tier × material × origin × region) coordinate and get a consistent, design-coherent result that feels like it belongs in the same tradition as OSRS without copying any of its art.
