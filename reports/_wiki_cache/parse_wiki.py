"""Parse OSRS wiki mirror and compare to Scape data. Outputs JSON snapshots for each category."""
import os, re, json
from pathlib import Path
from html import unescape

WIKI_DIR = Path('C:/Users/username/osrs-wiki-mirror/oldschool.runescape.wiki/w/')
SCAPE_DIR = Path('C:/Users/username/ScapeAI/')
OUT_DIR = Path('C:/Users/username/ScapeAI/reports/_wiki_cache/')
OUT_DIR.mkdir(exist_ok=True, parents=True)

def read_html(f):
    try:
        fp = WIKI_DIR / f
        data = fp.read_bytes()
        idx = data.find(b'<!DOCTYPE')
        if idx < 0:
            return None
        return data[idx:].decode('utf-8', errors='ignore')
    except:
        return None

def strip_tags(s):
    s = re.sub(r'<[^>]+>', '', s)
    s = unescape(s)
    s = re.sub(r'\s+', ' ', s).strip()
    return s

# =========== DISCOVERY ===========
print('Discovering wiki files...')
html_files = [f for f in os.listdir(WIKI_DIR) if f.endswith('.html.tmp') or f.endswith('.html')]
print(f'  Total HTML files in mirror: {len(html_files)}')

# Categorize by infobox type
categories = {
    'quest': set(),
    'monster': set(),
    'item': set(),
    'skill': set(),
    'minigame': set(),
    'boss': set(),
    'npc': set(),
    'location': set(),
    'music': set(),
    'other': set()
}

quest_data = []
monster_data = []
item_data = []
minigame_data = []
boss_data = []
npc_data = []

print('Scanning infoboxes...')
for f in html_files:
    html = read_html(f)
    if not html:
        continue
    name = f.replace('.html.tmp', '').replace('.html', '').replace('_', ' ')
    # Decide category by infobox class
    box = re.search(r'<table[^>]*class="([^"]*infobox[^"]*)"', html)
    if not box:
        continue
    cls = box.group(1)
    if 'infobox-quest' in cls or 'infobox quest' in cls:
        categories['quest'].add(name)
    elif 'infobox-monster' in cls or 'infobox-npc-monster' in cls:
        categories['monster'].add(name)
    elif 'infobox-bonuses' in cls or 'infobox-item' in cls:
        categories['item'].add(name)
    elif 'infobox-skill' in cls:
        categories['skill'].add(name)
    elif 'infobox-minigame' in cls:
        categories['minigame'].add(name)
    elif 'infobox-npc' in cls:
        categories['npc'].add(name)
    elif 'infobox-location' in cls or 'infobox-location-stub' in cls:
        categories['location'].add(name)
    elif 'infobox-music' in cls:
        categories['music'].add(name)
    else:
        categories['other'].add(name)

for k, v in categories.items():
    print(f'  {k}: {len(v)}')

# =========== QUEST PARSING ===========
print('\nParsing quest infoboxes + questdetails...')
for f in html_files:
    html = read_html(f)
    if not html:
        continue
    if 'infobox-quest' not in html:
        continue
    name = f.replace('.html.tmp', '').replace('.html', '').replace('_', ' ')
    q = {'name': name, 'file': f}
    # Infobox
    ibox = re.search(r'<table[^>]*class="[^"]*infobox-quest[^"]*"[^>]*>(.*?)</table>', html, re.DOTALL)
    if ibox:
        rows = re.findall(r'<tr[^>]*>(.*?)</tr>', ibox.group(1), re.DOTALL)
        for r in rows:
            th = re.search(r'<th[^>]*>(.*?)</th>', r, re.DOTALL)
            td = re.search(r'<td[^>]*>(.*?)</td>', r, re.DOTALL)
            if th and td:
                q[strip_tags(th.group(1))[:50]] = strip_tags(td.group(1))[:200]
    # Quest details
    qd = re.search(r'<table[^>]*questdetails[^>]*>(.*?)</table>', html, re.DOTALL)
    if qd:
        rows = re.findall(r'<tr[^>]*>(.*?)</tr>', qd.group(1), re.DOTALL)
        for r in rows:
            th = re.search(r'<th[^>]*questdetails-header[^>]*>(.*?)</th>', r, re.DOTALL)
            td = re.search(r'<td[^>]*questdetails-info[^>]*>(.*?)</td>', r, re.DOTALL)
            if th and td:
                q[strip_tags(th.group(1))[:50]] = strip_tags(td.group(1))[:500]
    # Also look for non-questdetails-class Difficulty/Length
    if 'Official difficulty' not in q:
        dm = re.search(r'Official difficulty</th>\s*<td[^>]*>(.*?)</td>', html, re.DOTALL)
        if dm:
            q['Official difficulty'] = strip_tags(dm.group(1))[:100]
    if 'Official length' not in q:
        lm = re.search(r'Official length</th>\s*<td[^>]*>(.*?)</td>', html, re.DOTALL)
        if lm:
            q['Official length'] = strip_tags(lm.group(1))[:100]
    # Look for "# quest points" on success
    qp = re.search(r'(\d+)\s*quest point', html, re.IGNORECASE)
    if qp:
        q['qp'] = int(qp.group(1))
    quest_data.append(q)

(OUT_DIR / 'quests.json').write_text(json.dumps(quest_data, indent=2))
print(f'  Quests parsed: {len(quest_data)}')

# =========== MONSTER PARSING ===========
print('\nParsing monster infoboxes...')
for f in html_files:
    html = read_html(f)
    if not html:
        continue
    if 'infobox-monster' not in html and 'infobox monster' not in html:
        continue
    name = f.replace('.html.tmp', '').replace('.html', '').replace('_', ' ')
    m = {'name': name, 'file': f}
    box = re.search(r'<table[^>]*class="[^"]*infobox-monster[^"]*"[^>]*>(.*?)</table>', html, re.DOTALL)
    if box:
        rows = re.findall(r'<tr[^>]*>(.*?)</tr>', box.group(1), re.DOTALL)
        for r in rows:
            th = re.search(r'<th[^>]*>(.*?)</th>', r, re.DOTALL)
            td = re.search(r'<td[^>]*>(.*?)</td>', r, re.DOTALL)
            if th and td:
                m[strip_tags(th.group(1))[:40]] = strip_tags(td.group(1))[:150]
    monster_data.append(m)
(OUT_DIR / 'monsters.json').write_text(json.dumps(monster_data, indent=2))
print(f'  Monsters parsed: {len(monster_data)}')

# =========== ITEM PARSING ===========
print('\nParsing item/equipment infoboxes...')
# Items: infobox-item for consumables; infobox-bonuses for equipment
for f in html_files:
    html = read_html(f)
    if not html:
        continue
    if 'infobox-item' not in html and 'infobox-bonuses' not in html:
        continue
    name = f.replace('.html.tmp', '').replace('.html', '').replace('_', ' ')
    it = {'name': name, 'file': f, 'equipment': 'infobox-bonuses' in html}
    box = re.search(r'<table[^>]*class="[^"]*infobox-item[^"]*"[^>]*>(.*?)</table>', html, re.DOTALL)
    if box:
        rows = re.findall(r'<tr[^>]*>(.*?)</tr>', box.group(1), re.DOTALL)
        for r in rows:
            th = re.search(r'<th[^>]*>(.*?)</th>', r, re.DOTALL)
            td = re.search(r'<td[^>]*>(.*?)</td>', r, re.DOTALL)
            if th and td:
                it[strip_tags(th.group(1))[:40]] = strip_tags(td.group(1))[:100]
    # Equipment slot
    slot_m = re.search(r'Slot[^<]*</th>[^<]*<td[^>]*>([^<]+)', html)
    if slot_m:
        it['slot'] = strip_tags(slot_m.group(1))[:50]
    item_data.append(it)
(OUT_DIR / 'items.json').write_text(json.dumps(item_data, indent=2))
print(f'  Items parsed: {len(item_data)}')

# =========== MINIGAME PARSING ===========
print('\nParsing minigame infoboxes...')
for f in html_files:
    html = read_html(f)
    if not html:
        continue
    if 'infobox-minigame' not in html:
        continue
    name = f.replace('.html.tmp', '').replace('.html', '').replace('_', ' ')
    mg = {'name': name, 'file': f}
    box = re.search(r'<table[^>]*class="[^"]*infobox-minigame[^"]*"[^>]*>(.*?)</table>', html, re.DOTALL)
    if box:
        rows = re.findall(r'<tr[^>]*>(.*?)</tr>', box.group(1), re.DOTALL)
        for r in rows:
            th = re.search(r'<th[^>]*>(.*?)</th>', r, re.DOTALL)
            td = re.search(r'<td[^>]*>(.*?)</td>', r, re.DOTALL)
            if th and td:
                mg[strip_tags(th.group(1))[:40]] = strip_tags(td.group(1))[:150]
    minigame_data.append(mg)
(OUT_DIR / 'minigames.json').write_text(json.dumps(minigame_data, indent=2))
print(f'  Minigames parsed: {len(minigame_data)}')

# Save categories summary
summary = {k: sorted(list(v)) for k, v in categories.items()}
(OUT_DIR / 'categories.json').write_text(json.dumps({k: len(v) for k, v in categories.items()}))
(OUT_DIR / 'categories_full.json').write_text(json.dumps(summary, indent=2))

print('\nDone.')
