// ── TileRenderer ────────────────────────────────────────────────────────────
// Vanilla-JS canvas renderer for Scape tilemaps. No external libraries.
// Pre-production: where sprites don't exist we fall back to palette colors.
//
// Coordinate conventions (match data/tilemaps/*.json):
//   - tile grid is (width × height) cells, each TILE_SIZE px at zoom=1.
//   - tile codes are base-36 characters ("0".."9","a".."z") → int.
//   - walls are axis-aligned line segments; we expand to per-tile edge bitmasks.
//   - wall edge bits: N=1, E=2, S=4, W=8.
//
// Camera:
//   - camera.x / camera.y are pixel coords in the source (unzoomed) space.
//     (0, 0) = top-left of tile (0, 0).
//   - zoom multiplies pixel size. With zoom=1 each tile is TILE_SIZE px.
// ───────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  const TILE_SIZE = 32;       // from data/sprite-manifest.json conventions
  const MIN_ZOOM = 0.25;
  const MAX_ZOOM = 4.0;

  // Fallback palette used when a region has no entry in sprite-palettes.json.
  const DEFAULT_PALETTE = {
    dominant: ['#6a6a6a', '#8a8a8a', '#5a5a5a'],
    accent:   ['#aa6644', '#cccc66', '#6688aa'],
    shadow: '#2a2a2a',
    highlight: '#d0d0d0',
    water_tint: '#3a6a8a',
  };

  // Heuristic: map tile name substring → which palette swatch to pick. Keeps
  // the fallback colours roughly on-theme even without authored sprites.
  const TILE_NAME_TO_PALETTE_HINT = [
    { match: ['water', 'river', 'lake', 'brine', 'swamp', 'ocean'], kind: 'water' },
    { match: ['path', 'cobble', 'planks', 'road', 'trail'],          kind: 'accent1' },
    { match: ['wall', 'stone', 'obsidian', 'crystal', 'ruined'],     kind: 'shadow' },
    { match: ['tree', 'rotwood', 'pine', 'oak'],                     kind: 'dominant0' },
    { match: ['flower', 'bloom', 'mushroom'],                        kind: 'accent0' },
    { match: ['floor', 'plank', 'carpet', 'flag'],                   kind: 'dominant1' },
    { match: ['sand', 'dust', 'bone', 'ash'],                        kind: 'dominant2' },
    { match: ['grass', 'moss', 'fern', 'field', 'wheat'],            kind: 'dominant0' },
    { match: ['fire', 'lava', 'ember', 'coal'],                      kind: 'accent0' },
    { match: ['ice', 'snow', 'frost'],                               kind: 'highlight' },
    { match: ['bridge'],                                              kind: 'accent1' },
    { match: ['void'],                                                kind: 'void' },
    { match: ['fence'],                                               kind: 'shadow' },
  ];

  function pickPaletteColor(palette, kind) {
    if (!palette) palette = DEFAULT_PALETTE;
    const d = palette.dominant || DEFAULT_PALETTE.dominant;
    const a = palette.accent   || DEFAULT_PALETTE.accent;
    switch (kind) {
      case 'water':      return palette.water_tint || '#3a6a8a';
      case 'shadow':     return palette.shadow || '#333';
      case 'highlight':  return palette.highlight || '#eee';
      case 'dominant0':  return d[0] || '#6a6a6a';
      case 'dominant1':  return d[1] || '#5a5a5a';
      case 'dominant2':  return d[2] || d[0] || '#4a4a4a';
      case 'accent0':    return a[0] || '#aa6644';
      case 'accent1':    return a[1] || '#ccaa44';
      case 'accent2':    return a[2] || '#6688aa';
      case 'void':       return '#0a0805';
      default:           return d[0] || '#6a6a6a';
    }
  }

  function tileKindFromName(name) {
    if (!name) return 'dominant0';
    const lower = String(name).toLowerCase();
    for (const entry of TILE_NAME_TO_PALETTE_HINT) {
      if (entry.match.some(m => lower.includes(m))) return entry.kind;
    }
    return 'dominant0';
  }

  // Deterministic hash string → 0..1 range. Used to vary per-tile tint.
  function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = (h * 16777619) >>> 0;
    }
    return (h & 0xffff) / 65535;
  }

  function tintColor(hex, amount) {
    // amount in [-1, 1]; negative darkens, positive lightens.
    if (!hex || hex[0] !== '#' || hex.length !== 7) return hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const adj = (c) => {
      if (amount >= 0) return Math.round(c + (255 - c) * amount);
      return Math.round(c * (1 + amount));
    };
    const hh = (v) => v.toString(16).padStart(2, '0');
    return '#' + hh(adj(r)) + hh(adj(g)) + hh(adj(b));
  }

  // Parse base-36 tile char → int.
  function parseTileChar(ch) {
    if (!ch) return 0;
    const code = ch.charCodeAt(0);
    if (code >= 48 && code <= 57) return code - 48;
    if (code >= 97 && code <= 122) return code - 97 + 10;
    if (code >= 65 && code <= 90) return code - 65 + 10;
    return 0;
  }

  // 2-letter tag from an NPC / landmark name: first letter of first two words,
  // or first two letters if single word.
  function shortTag(name) {
    if (!name) return '??';
    const s = String(name).replace(/[_-]/g, ' ').trim();
    const words = s.split(/\s+/).filter(Boolean);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    const first = words[0] || '??';
    return (first.slice(0, 2)).toUpperCase();
  }

  // Deterministic colour per NPC id (readable against parchment).
  function npcColor(id) {
    const hue = Math.floor(hashStr(id || '?') * 360);
    return `hsl(${hue}, 55%, 42%)`;
  }

  // Expand wall segments into per-tile edge bitmask: "x_y" → mask.
  // Mirrors src/world/tilemap.js _applyWallSegment.
  const EDGE = Object.freeze({ N: 1, E: 2, S: 4, W: 8 });
  function buildWallEdgeMap(walls) {
    const map = new Map();
    const or = (x, y, mask) => {
      const k = `${x}_${y}`;
      map.set(k, (map.get(k) || 0) | mask);
    };
    for (const w of (walls || [])) {
      const { x1, y1, x2, y2 } = w || {};
      if (x1 == null || y1 == null || x2 == null || y2 == null) continue;
      if (x1 === x2) {
        // Vertical → west edge of column x1
        const a = Math.min(y1, y2), b = Math.max(y1, y2);
        for (let y = a; y < b; y++) {
          or(x1, y, EDGE.W);
          if (x1 > 0) or(x1 - 1, y, EDGE.E);
        }
      } else if (y1 === y2) {
        // Horizontal → north edge of row y1
        const a = Math.min(x1, x2), b = Math.max(x1, x2);
        for (let x = a; x < b; x++) {
          or(x, y1, EDGE.N);
          if (y1 > 0) or(x, y1 - 1, EDGE.S);
        }
      }
      // (Diagonal segments not in current data — skipped.)
    }
    return map;
  }

  // ── Sprite atlas stub ─────────────────────────────────────────────────────
  // If /sprites/<category>/<region>/<id>.png exists, load it lazily. We log
  // each MISSING sprite once so the console doesn't explode on a region full
  // of unauthored tiles.
  class SpriteAtlas {
    constructor() {
      this.cache = new Map();   // spritePath → Image|null (null = known missing)
      this.warnedMissing = new Set();
      this.missingCount = 0;
    }

    // spritePath form: "heartlands/grass_01" → tries /sprites/tile/heartlands/grass_01.png
    // first, falling back to the older /sprites/heartlands/grass_01.png convention.
    // Returns HTMLImageElement (when loaded), or null while loading / after failure.
    get(category, spritePath) {
      if (!spritePath) return null;
      const key = `${category}:${spritePath}`;
      if (this.cache.has(key)) return this.cache.get(key);
      const img = new Image();
      this.cache.set(key, null); // sentinel until load succeeds
      img.onload = () => { this.cache.set(key, img); };
      img.onerror = () => {
        if (!this.warnedMissing.has(key)) {
          this.warnedMissing.add(key);
          this.missingCount++;
          if (this.missingCount <= 20) {
            try { console.debug(`[renderer] sprite missing: ${category}/${spritePath}`); } catch (_) {}
          } else if (this.missingCount === 21) {
            try { console.debug('[renderer] further missing-sprite warnings suppressed'); } catch (_) {}
          }
        }
        this.cache.set(key, null);
      };
      img.src = `/sprites/${category}/${spritePath}.png`;
      return null;
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  class TileRenderer {
    constructor(canvas) {
      if (!canvas || !canvas.getContext) throw new Error('TileRenderer: canvas required');
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.ctx.imageSmoothingEnabled = false;
      if ('imageSmoothingQuality' in this.ctx) this.ctx.imageSmoothingQuality = 'low';

      this.tilemap = null;
      this.palette = null;
      this.wallEdgeMap = new Map();
      this.atlas = new SpriteAtlas();

      this.camera = { x: 0, y: 0, zoom: 1.0 };
      this.layers = {
        tiles: true, walls: true, entities: true, npcs: true, landmarks: true, grid: false,
      };
    }

    // ── Public API ─────────────────────────────────────────────────────────
    loadRegion(tilemap, palette) {
      if (!tilemap) throw new Error('loadRegion: tilemap required');
      this.tilemap = tilemap;
      this.palette = palette || DEFAULT_PALETTE;
      this.wallEdgeMap = buildWallEdgeMap(tilemap.walls);
      this._tileGrid = this._buildTileGrid(tilemap);
      this.resetView();
    }

    toggleLayer(layer, on) {
      if (!(layer in this.layers)) return;
      this.layers[layer] = !!on;
    }

    isLayerOn(layer) { return !!this.layers[layer]; }

    resetView() {
      // Centre camera on (width/2, height/2) at zoom 1.
      if (!this.tilemap) { this.camera = { x: 0, y: 0, zoom: 1 }; return; }
      const cw = this.canvas.width;
      const ch = this.canvas.height;
      const worldW = this.tilemap.width * TILE_SIZE;
      const worldH = this.tilemap.height * TILE_SIZE;
      // Choose zoom so the whole 64×64 region fits with a small margin.
      const zx = cw / (worldW * 1.05);
      const zy = ch / (worldH * 1.05);
      const z = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.min(zx, zy)));
      this.camera.zoom = z;
      this.camera.x = worldW / 2 - (cw / 2) / z;
      this.camera.y = worldH / 2 - (ch / 2) / z;
    }

    panPixels(dx, dy) {
      this.camera.x += dx / this.camera.zoom;
      this.camera.y += dy / this.camera.zoom;
      this._clampCamera();
    }

    zoomBy(factor) {
      const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, this.camera.zoom * factor));
      if (!this.tilemap) { this.camera.zoom = next; return; }
      // Keep canvas centre stable during zoom.
      const cw = this.canvas.width, ch = this.canvas.height;
      const centerWorldX = this.camera.x + (cw / 2) / this.camera.zoom;
      const centerWorldY = this.camera.y + (ch / 2) / this.camera.zoom;
      this.camera.zoom = next;
      this.camera.x = centerWorldX - (cw / 2) / this.camera.zoom;
      this.camera.y = centerWorldY - (ch / 2) / this.camera.zoom;
      this._clampCamera();
    }

    getCamera() {
      const { x, y, zoom } = this.camera;
      const cx = this.tilemap ? Math.max(0, Math.min(this.tilemap.width - 1, Math.floor((x + (this.canvas.width / 2) / zoom) / TILE_SIZE))) : 0;
      const cy = this.tilemap ? Math.max(0, Math.min(this.tilemap.height - 1, Math.floor((y + (this.canvas.height / 2) / zoom) / TILE_SIZE))) : 0;
      return { x, y, zoom, cx, cy };
    }

    // Expose colour picker for legend UI.
    colorForTile(regionId, tileCode, legendEntry) {
      const name = (legendEntry && legendEntry.name) || 'unknown';
      const kind = tileKindFromName(name);
      let base = pickPaletteColor(this.palette, kind);
      // Don't vary the legend swatch per-position — keep it representative.
      return base;
    }

    // ── Rendering ──────────────────────────────────────────────────────────
    render(cameraX, cameraY, zoom) {
      if (cameraX != null) this.camera.x = cameraX;
      if (cameraY != null) this.camera.y = cameraY;
      if (zoom != null) this.camera.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom));

      const ctx = this.ctx;
      ctx.imageSmoothingEnabled = false;
      const cw = this.canvas.width;
      const ch = this.canvas.height;

      // Clear in dark parchment-shadow (the inside of the frame).
      ctx.fillStyle = '#0a0805';
      ctx.fillRect(0, 0, cw, ch);

      if (!this.tilemap) return;

      if (this.layers.tiles) this._renderTiles();
      if (this.layers.landmarks) this._renderLandmarks();
      if (this.layers.npcs || this.layers.entities) this._renderSpawns();
      if (this.layers.walls) this._renderWalls();
      if (this.layers.grid) this._renderGrid();

      // Border around the world so you can see extents.
      this._renderWorldBorder();
    }

    // ── Internal ───────────────────────────────────────────────────────────
    _buildTileGrid(t) {
      const grid = new Uint8Array(t.width * t.height);
      for (let y = 0; y < t.height; y++) {
        const row = t.tiles[y] || '';
        for (let x = 0; x < t.width; x++) {
          grid[y * t.width + x] = parseTileChar(row[x]);
        }
      }
      return grid;
    }

    _clampCamera() {
      if (!this.tilemap) return;
      const cw = this.canvas.width, ch = this.canvas.height;
      const z = this.camera.zoom;
      const worldW = this.tilemap.width * TILE_SIZE;
      const worldH = this.tilemap.height * TILE_SIZE;
      // Let camera pan slightly past edges so entities on the border stay visible.
      const pad = 64;
      const minX = -pad;
      const minY = -pad;
      const maxX = Math.max(minX, worldW + pad - cw / z);
      const maxY = Math.max(minY, worldH + pad - ch / z);
      if (this.camera.x < minX) this.camera.x = minX;
      if (this.camera.y < minY) this.camera.y = minY;
      if (this.camera.x > maxX) this.camera.x = maxX;
      if (this.camera.y > maxY) this.camera.y = maxY;
    }

    // Viewport culling: which tile rect do we need to paint?
    _visibleTileBounds() {
      const z = this.camera.zoom;
      const tileZoomed = TILE_SIZE * z;
      const cw = this.canvas.width, ch = this.canvas.height;
      const x0 = Math.max(0, Math.floor(this.camera.x / TILE_SIZE));
      const y0 = Math.max(0, Math.floor(this.camera.y / TILE_SIZE));
      const x1 = Math.min(this.tilemap.width - 1, Math.ceil((this.camera.x + cw / z) / TILE_SIZE));
      const y1 = Math.min(this.tilemap.height - 1, Math.ceil((this.camera.y + ch / z) / TILE_SIZE));
      return { x0, y0, x1, y1, tileZoomed };
    }

    // Convert world-pixel → canvas-pixel.
    _wx(x) { return (x - this.camera.x) * this.camera.zoom; }
    _wy(y) { return (y - this.camera.y) * this.camera.zoom; }

    _renderTiles() {
      const ctx = this.ctx;
      const t = this.tilemap;
      const legend = t.tile_legend || {};
      const regionId = t.id;
      const { x0, y0, x1, y1, tileZoomed } = this._visibleTileBounds();
      const size = Math.max(1, Math.ceil(tileZoomed));

      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const code = this._tileGrid[y * t.width + x];
          const entry = legend[encodeTileChar(code)] || legend[String(code)] || null;
          const name = (entry && entry.name) || 'unknown';
          const kind = tileKindFromName(name);
          let color = pickPaletteColor(this.palette, kind);
          // Small per-tile variation so uniform fields don't look flat.
          const variance = hashStr(`${regionId}:${x}:${y}:${code}`);
          color = tintColor(color, (variance - 0.5) * 0.12);

          // Try sprite first (will fall through to colour while loading or missing).
          let drew = false;
          if (entry && entry.sprite) {
            const img = this.atlas.get('tile', entry.sprite);
            if (img && img.complete && img.naturalWidth > 0) {
              ctx.drawImage(img, this._wx(x * TILE_SIZE), this._wy(y * TILE_SIZE), size, size);
              drew = true;
            }
          }
          if (!drew) {
            ctx.fillStyle = color;
            ctx.fillRect(this._wx(x * TILE_SIZE), this._wy(y * TILE_SIZE), size, size);
            // Non-walkable accent: thin dark inset, so blocked tiles read clearly.
            if (entry && entry.walkable === false) {
              ctx.strokeStyle = this.palette && this.palette.shadow || '#000';
              ctx.globalAlpha = 0.35;
              ctx.lineWidth = 1;
              ctx.strokeRect(this._wx(x * TILE_SIZE) + 0.5, this._wy(y * TILE_SIZE) + 0.5, size - 1, size - 1);
              ctx.globalAlpha = 1.0;
            }
          }
        }
      }
    }

    _renderWalls() {
      const ctx = this.ctx;
      const { x0, y0, x1, y1 } = this._visibleTileBounds();
      ctx.strokeStyle = this.palette && this.palette.shadow || '#111';
      ctx.lineWidth = Math.max(1, 1 * this.camera.zoom);
      ctx.lineCap = 'square';

      for (let y = y0; y <= y1; y++) {
        for (let x = x0; x <= x1; x++) {
          const mask = this.wallEdgeMap.get(`${x}_${y}`) || 0;
          if (!mask) continue;
          const sx = this._wx(x * TILE_SIZE);
          const sy = this._wy(y * TILE_SIZE);
          const sz = TILE_SIZE * this.camera.zoom;
          ctx.beginPath();
          if (mask & EDGE.N) { ctx.moveTo(sx, sy); ctx.lineTo(sx + sz, sy); }
          if (mask & EDGE.S) { ctx.moveTo(sx, sy + sz); ctx.lineTo(sx + sz, sy + sz); }
          if (mask & EDGE.W) { ctx.moveTo(sx, sy); ctx.lineTo(sx, sy + sz); }
          if (mask & EDGE.E) { ctx.moveTo(sx + sz, sy); ctx.lineTo(sx + sz, sy + sz); }
          ctx.stroke();
        }
      }

      // Doors — draw slightly highlighted.
      const doors = (this.tilemap && this.tilemap.doors) || [];
      if (doors.length) {
        ctx.strokeStyle = this.palette && this.palette.highlight || '#d8c070';
        ctx.lineWidth = Math.max(2, 2 * this.camera.zoom);
        for (const d of doors) {
          if (d.x < x0 - 1 || d.x > x1 + 1 || d.y < y0 - 1 || d.y > y1 + 1) continue;
          const sx = this._wx(d.x * TILE_SIZE);
          const sy = this._wy(d.y * TILE_SIZE);
          const sz = TILE_SIZE * this.camera.zoom;
          ctx.beginPath();
          const edge = d.edge || 0;
          if (edge & EDGE.N) { ctx.moveTo(sx + sz * 0.25, sy); ctx.lineTo(sx + sz * 0.75, sy); }
          if (edge & EDGE.S) { ctx.moveTo(sx + sz * 0.25, sy + sz); ctx.lineTo(sx + sz * 0.75, sy + sz); }
          if (edge & EDGE.W) { ctx.moveTo(sx, sy + sz * 0.25); ctx.lineTo(sx, sy + sz * 0.75); }
          if (edge & EDGE.E) { ctx.moveTo(sx + sz, sy + sz * 0.25); ctx.lineTo(sx + sz, sy + sz * 0.75); }
          ctx.stroke();
        }
      }
    }

    _renderLandmarks() {
      const ctx = this.ctx;
      const list = (this.tilemap && this.tilemap.landmarks) || [];
      if (!list.length) return;
      const { x0, y0, x1, y1 } = this._visibleTileBounds();
      const sz = TILE_SIZE * this.camera.zoom;

      for (const lm of list) {
        if (lm.x < x0 - 1 || lm.x > x1 + 1 || lm.y < y0 - 1 || lm.y > y1 + 1) continue;
        const cx = this._wx(lm.x * TILE_SIZE + TILE_SIZE / 2);
        const cy = this._wy(lm.y * TILE_SIZE + TILE_SIZE / 2);
        const radius = Math.max(5, sz * 0.6);

        // Diamond marker.
        ctx.fillStyle = this.palette && this.palette.accent && this.palette.accent[0] || '#c2a048';
        ctx.strokeStyle = '#1a1510';
        ctx.lineWidth = Math.max(1, 0.08 * sz);
        ctx.beginPath();
        ctx.moveTo(cx, cy - radius);
        ctx.lineTo(cx + radius, cy);
        ctx.lineTo(cx, cy + radius);
        ctx.lineTo(cx - radius, cy);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Label
        if (sz > 18) {
          const label = lm.label || lm.id || 'landmark';
          const fs = Math.max(10, Math.min(14, sz * 0.45));
          ctx.font = `${fs}px 'Courier New', monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          const ty = cy + radius + 2;
          ctx.lineWidth = Math.max(2, fs * 0.25);
          ctx.strokeStyle = '#000';
          ctx.strokeText(label, cx, ty);
          ctx.fillStyle = '#ffe9b8';
          ctx.fillText(label, cx, ty);
        }
      }
    }

    _renderSpawns() {
      const ctx = this.ctx;
      const spawns = (this.tilemap && this.tilemap.spawn_points) || {};
      const entries = Object.entries(spawns);
      if (!entries.length) return;
      const { x0, y0, x1, y1 } = this._visibleTileBounds();
      const sz = TILE_SIZE * this.camera.zoom;

      for (const [key, sp] of entries) {
        if (!sp || typeof sp.x !== 'number' || typeof sp.y !== 'number') continue;
        if (sp.x < x0 - 1 || sp.x > x1 + 1 || sp.y < y0 - 1 || sp.y > y1 + 1) continue;

        const isPlayer = key.startsWith('player_');
        const isNPC = key.startsWith('npc_');
        const isMonster = key.startsWith('monster_') || key.startsWith('boss_');
        if (!this.layers.npcs && (isNPC || isMonster)) continue;
        if (!this.layers.entities && isPlayer) continue;

        const cx = this._wx(sp.x * TILE_SIZE + TILE_SIZE / 2);
        const cy = this._wy(sp.y * TILE_SIZE + TILE_SIZE / 2);
        // NPCs render at 48×48 (character size from manifest) → 1.5× tile.
        const radius = Math.max(6, (sz * 1.5) / 2);

        // Fill by type.
        let fill;
        if (isPlayer) fill = this.palette && this.palette.highlight || '#f5d76e';
        else if (isMonster) fill = '#8a1a1a';
        else fill = npcColor(sp.npc || key);

        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.lineWidth = Math.max(1, 0.08 * sz);
        ctx.strokeStyle = '#000';
        ctx.stroke();

        if (sz > 12) {
          const tag = shortTag(sp.label || sp.npc || key.replace(/^(npc|monster|boss|player)_/, ''));
          const fs = Math.max(9, Math.min(14, sz * 0.55));
          ctx.font = `bold ${fs}px 'Courier New', monospace`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.lineWidth = Math.max(2, fs * 0.3);
          ctx.strokeStyle = '#000';
          ctx.strokeText(tag, cx, cy);
          ctx.fillStyle = '#fff';
          ctx.fillText(tag, cx, cy);
        }
      }
    }

    _renderGrid() {
      const ctx = this.ctx;
      const { x0, y0, x1, y1 } = this._visibleTileBounds();
      const sz = TILE_SIZE * this.camera.zoom;
      if (sz < 6) return; // too crowded
      ctx.strokeStyle = 'rgba(26,21,16,0.22)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = x0; x <= x1 + 1; x++) {
        const sx = this._wx(x * TILE_SIZE) + 0.5;
        ctx.moveTo(sx, this._wy(y0 * TILE_SIZE));
        ctx.lineTo(sx, this._wy((y1 + 1) * TILE_SIZE));
      }
      for (let y = y0; y <= y1 + 1; y++) {
        const sy = this._wy(y * TILE_SIZE) + 0.5;
        ctx.moveTo(this._wx(x0 * TILE_SIZE), sy);
        ctx.lineTo(this._wx((x1 + 1) * TILE_SIZE), sy);
      }
      ctx.stroke();
    }

    _renderWorldBorder() {
      const ctx = this.ctx;
      ctx.strokeStyle = '#ff981f';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        this._wx(0) - 1,
        this._wy(0) - 1,
        this.tilemap.width * TILE_SIZE * this.camera.zoom + 2,
        this.tilemap.height * TILE_SIZE * this.camera.zoom + 2,
      );
    }
  }

  // Encode int → base-36 char (matches src/world/tilemap.js).
  function encodeTileChar(n) {
    if (n == null) return '0';
    if (n < 10) return String(n);
    return String.fromCharCode(97 + (n - 10)); // 'a' + ...
  }

  // Test-only exports on the class (useful in node-side protocol tests).
  TileRenderer.parseTileChar = parseTileChar;
  TileRenderer.encodeTileChar = encodeTileChar;
  TileRenderer.buildWallEdgeMap = buildWallEdgeMap;
  TileRenderer.EDGE = EDGE;
  TileRenderer.TILE_SIZE = TILE_SIZE;
  TileRenderer.pickPaletteColor = pickPaletteColor;
  TileRenderer.tileKindFromName = tileKindFromName;
  TileRenderer.shortTag = shortTag;

  if (typeof window !== 'undefined') window.TileRenderer = TileRenderer;
  if (typeof module !== 'undefined' && module.exports) module.exports = TileRenderer;
})();
