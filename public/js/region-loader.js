// ── RegionLoader ────────────────────────────────────────────────────────────
// Fetches tilemap JSON and palette data from the Scape HTTP API. Lightweight
// wrapper so the renderer can stay focused on drawing. Caches within a single
// page load — if you want fresh data, make a new instance.
//
// Endpoints (defined in src/http-api.js):
//   GET /api/tilemap             → { regions: [...] }
//   GET /api/tilemap/:region     → full region JSON (tiles, walls, spawn_points...)
//   GET /api/palettes            → sprite-palettes.json
//   GET /api/sprite-manifest     → sprite manifest (optional, for sprite atlas)
//
// Region id convention: matches the tilemap filename stem (heartlands,
// saltbrine_reach, the_wilds, boneyard_wastes, etc.).
// ───────────────────────────────────────────────────────────────────────────

(function () {
  'use strict';

  // Map region file-stem ids → palette keys in sprite-palettes.json. The
  // palettes use shorter names for the same regions.
  const REGION_TO_PALETTE = Object.freeze({
    heartlands: 'heartlands',
    moryskah: 'moryskah',
    sootworks: 'sootworks',
    saltbrine_reach: 'saltbrine',
    veilwood: 'veilwood',
    boneyard_wastes: 'boneyard',
    inkweald: 'inkweald',
    glass_desert: 'glass_desert',
    the_wilds: 'wilds',
    // drifting_market + universal have palettes but no tilemap yet.
  });

  class RegionLoader {
    constructor(baseUrl) {
      this.baseUrl = (baseUrl == null ? '' : String(baseUrl)).replace(/\/+$/, '');
      this._regionCache = new Map();   // regionId → tilemap JSON
      this._regionList = null;         // Promise<string[]>
      this._palettes = null;           // Promise<palettes JSON>
      this._manifest = null;           // Promise<sprite manifest JSON>
    }

    _url(suffix) { return `${this.baseUrl}${suffix}`; }

    static regionToPaletteKey(regionId) {
      return REGION_TO_PALETTE[regionId] || regionId;
    }

    async fetchRegionList() {
      if (this._regionList) return this._regionList;
      this._regionList = (async () => {
        const res = await fetch(this._url('/api/tilemap'));
        if (!res.ok) throw new Error(`GET /api/tilemap → ${res.status}`);
        const body = await res.json();
        if (!body || !Array.isArray(body.regions)) {
          throw new Error('malformed region list');
        }
        return body.regions.slice();
      })();
      return this._regionList;
    }

    async fetchTilemap(regionId) {
      if (!/^[a-z][a-z0-9_]*$/.test(regionId)) {
        throw new Error(`invalid region id: ${regionId}`);
      }
      if (this._regionCache.has(regionId)) return this._regionCache.get(regionId);
      const res = await fetch(this._url(`/api/tilemap/${encodeURIComponent(regionId)}`));
      if (!res.ok) {
        if (res.status === 404) throw new Error(`region not found: ${regionId}`);
        throw new Error(`GET /api/tilemap/${regionId} → ${res.status}`);
      }
      const body = await res.json();
      this._validateTilemap(body, regionId);
      this._regionCache.set(regionId, body);
      return body;
    }

    async fetchPalettes() {
      if (this._palettes) return this._palettes;
      this._palettes = (async () => {
        const res = await fetch(this._url('/api/palettes'));
        if (!res.ok) throw new Error(`GET /api/palettes → ${res.status}`);
        return res.json();
      })();
      return this._palettes;
    }

    async fetchPalette(regionId) {
      const all = await this.fetchPalettes();
      const key = RegionLoader.regionToPaletteKey(regionId);
      return all[key] || all[regionId] || null;
    }

    async fetchSpriteManifest() {
      if (this._manifest) return this._manifest;
      this._manifest = (async () => {
        const res = await fetch(this._url('/api/sprite-manifest'));
        if (!res.ok) throw new Error(`GET /api/sprite-manifest → ${res.status}`);
        return res.json();
      })();
      return this._manifest;
    }

    // Validate the shape we expect. Throws descriptive Error on mismatch —
    // renderer surfaces this in the status line.
    _validateTilemap(t, regionId) {
      if (!t || typeof t !== 'object') throw new Error('tilemap not an object');
      if (typeof t.width !== 'number' || t.width <= 0) throw new Error('tilemap.width missing');
      if (typeof t.height !== 'number' || t.height <= 0) throw new Error('tilemap.height missing');
      if (!t.tile_legend || typeof t.tile_legend !== 'object') {
        throw new Error('tilemap.tile_legend missing');
      }
      if (!Array.isArray(t.tiles)) {
        throw new Error('tilemap.tiles must be array of row strings');
      }
      if (t.tiles.length !== t.height) {
        throw new Error(`tiles rows (${t.tiles.length}) !== height (${t.height})`);
      }
      for (let y = 0; y < t.tiles.length; y++) {
        if (typeof t.tiles[y] !== 'string') {
          throw new Error(`tiles[${y}] not a string`);
        }
        if (t.tiles[y].length !== t.width) {
          throw new Error(`tiles[${y}] length ${t.tiles[y].length} !== width ${t.width}`);
        }
      }
      // Arrays that may be absent are coerced downstream — only error on wrong TYPE.
      if (t.walls != null && !Array.isArray(t.walls)) throw new Error('tilemap.walls must be array');
      if (t.landmarks != null && !Array.isArray(t.landmarks)) throw new Error('tilemap.landmarks must be array');
      if (t.spawn_points != null && typeof t.spawn_points !== 'object') {
        throw new Error('tilemap.spawn_points must be object');
      }
      if (t.id && regionId && t.id !== regionId) {
        // Not fatal — just warn by throwing a non-error marker into console.
        // Caller decides.
        try { console.warn(`tilemap id "${t.id}" differs from requested "${regionId}"`); } catch (_) { /* ignore */ }
      }
    }
  }

  // Parse a single tile character (base-36: 0-9 a-z). Used by renderer.
  RegionLoader.parseTileChar = function (ch) {
    if (!ch) return 0;
    const code = ch.charCodeAt(0);
    if (code >= 48 && code <= 57) return code - 48;      // '0'..'9'
    if (code >= 97 && code <= 122) return code - 97 + 10; // 'a'..'z'
    if (code >= 65 && code <= 90) return code - 65 + 10;  // 'A'..'Z'
    return 0;
  };

  // Expose on window for the browser and module.exports for node-side tests.
  if (typeof window !== 'undefined') window.RegionLoader = RegionLoader;
  if (typeof module !== 'undefined' && module.exports) module.exports = RegionLoader;
})();
