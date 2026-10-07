/**
 * Hero Shader v2 — Foundation (Phase 1)
 *
 * Unified WebGL background shader. Replaces the v1 split between
 * production (compile-time-baked constants) and playground (uniforms);
 * v2 is uniform-driven everywhere. The fragment shader is compiled
 * exactly once per page load — quality-tier downgrades and live
 * playground edits update uniforms only.
 *
 * Attaches to the first element with a `data-shader` attribute, or
 * `.header` as fallback. Per-page settings live in `data-shader='{...}'`.
 *
 * Skips on no-WebGL, prefers-reduced-motion. Pauses when the host is
 * offscreen or the tab is hidden. Releases the WebGL context on unload.
 *
 * Public API (all read-only unless noted):
 *   window.HeroShader.schema      — declarative parameter schema (frozen)
 *   window.HeroShader.userConfig  — parsed `data-shader` JSON for the page
 *   window.HeroShader.config      — live config object (mutable; mutate to
 *                                   change params at runtime, e.g. from
 *                                   the playground sliders)
 *   window.HeroShader.glVersion   — 1 or 2 (whichever was successfully
 *                                   negotiated)
 *   window.HeroShader.version     — semver-ish version string
 *
 * Back-compat aliases:
 *   window.__shaderConfig   ← same reference as window.HeroShader.config
 *   window.__shaderDefaults ← snapshot of the resolved-default settings
 *
 * Tuneable parameters: see docs/parameters.md.
 *
 * Quality tiers (auto-downgrade on sustained low FPS — uniform-only,
 * no shader recompile):
 *   high     — full settings, full DPR
 *   medium   — lineCount × 0.75, lineColor alpha × 0.9, DPR clamped to 1
 *   low      — lineCount × 0.5, scale × 1.2, warpAmplitude × 0.5, alpha × 0.85
 *   minimal  — lineCount = 4, glow + circles disabled, alpha × 0.8
 *
 * Override via:
 *   localStorage.setItem('shader-quality', 'minimal')   // lock to a tier
 *   localStorage.removeItem('shader-quality')           // back to auto
 *
 * Example:
 *   <header class="header" data-shader='{"lineCount":10,"overallSpeed":0.1}'>
 */
(function() {
  'use strict';

  // =========================================================================
  // SCHEMA — the single source of truth for every parameter.
  // Consumed by: renderer, playground UI, future randomiser, future migrations.
  // =========================================================================

  var SCHEMA = {
    // --- Colours ---
    bgColor1: {
      type: 'color', default: [0.059, 0.075, 0.094, 1.0],
      group: 'Colours', label: 'Background left',
      description: 'Left-side gradient colour.'
    },
    bgColor2: {
      type: 'color', default: [0.06, 0.14, 0.28, 1.0],
      group: 'Colours', label: 'Background right',
      description: 'Right-side gradient colour.'
    },
    lineColor: {
      type: 'color', default: [0.0, 0.48, 1.0, 0.6],
      defaultMobile: [0.0, 0.48, 1.0, 0.4],
      group: 'Colours', label: 'Line colour',
      description: 'Colour and opacity of the lines (and circles).'
    },

    // --- Motion ---
    overallSpeed: {
      type: 'float', default: 0.2, defaultMobile: 0.12,
      range: [0.0, 1.0], goodRange: [0.05, 0.5], scale: 'linear',
      group: 'Motion', label: 'Animation speed',
      description: 'Master speed multiplier. Affects line drift, warp, and circles together.'
    },

    // --- Lines ---
    lineCount: {
      type: 'int', default: 16, defaultMobile: 8,
      range: [4, 30], goodRange: [8, 22], scale: 'linear',
      group: 'Lines', label: 'Line count',
      description: 'Number of flowing lines drawn each frame.'
    },
    minLineWidth: {
      type: 'float', default: 0.02,
      range: [0.0, 0.5], goodRange: [0.005, 0.1], scale: 'linear',
      group: 'Lines', label: 'Min line width'
    },
    maxLineWidth: {
      type: 'float', default: 0.2,
      range: [0.0, 1.0], goodRange: [0.05, 0.5], scale: 'linear',
      group: 'Lines', label: 'Max line width'
    },
    lineFrequency: {
      type: 'float', default: 0.2,
      range: [0.0, 2.0], goodRange: [0.05, 1.0], scale: 'log',
      group: 'Lines', label: 'Wave frequency'
    },
    lineAmplitude: {
      type: 'float', default: 1.0, defaultMobile: 0.8,
      range: [0.0, 3.0], goodRange: [0.2, 2.0], scale: 'linear',
      group: 'Lines', label: 'Wave height'
    },

    // --- Warp distortion (per-line) ---
    warpFrequency: {
      type: 'float', default: 0.5,
      range: [0.0, 3.0], goodRange: [0.1, 1.5], scale: 'log',
      group: 'Warp', label: 'Warp tightness'
    },
    warpAmplitude: {
      type: 'float', default: 1.0, defaultMobile: 0.6,
      range: [0.0, 3.0], goodRange: [0.0, 2.0], scale: 'linear',
      group: 'Warp', label: 'Warp strength'
    },

    // --- Spread ---
    offsetFrequency: {
      type: 'float', default: 0.5,
      range: [0.0, 2.0], goodRange: [0.0, 1.5], scale: 'linear',
      group: 'Spread', label: 'Horizontal variation'
    },
    minOffsetSpread: {
      type: 'float', default: 0.6,
      range: [0.0, 2.0], goodRange: [0.0, 1.5], scale: 'linear',
      group: 'Spread', label: 'Min vertical spread'
    },
    maxOffsetSpread: {
      type: 'float', default: 2.0,
      range: [0.0, 5.0], goodRange: [0.5, 3.5], scale: 'linear',
      group: 'Spread', label: 'Max vertical spread'
    },

    // --- Scale ---
    scale: {
      type: 'float', default: 5.0,
      range: [1.0, 15.0], goodRange: [2.0, 10.0], scale: 'log',
      group: 'Scale', label: 'Zoom level'
    },

    // --- Glow ---
    glowSpread: {
      type: 'float', default: 0.5,
      range: [0.0, 2.0], goodRange: [0.0, 1.5], scale: 'linear',
      group: 'Glow', label: 'Line glow'
    },

    // --- Circles ---
    circleRadius: {
      type: 'float', default: 0.01,
      range: [0.0, 0.05], goodRange: [0.0, 0.03], scale: 'linear',
      group: 'Circles', label: 'Circle size'
    },
    circleBrightness: {
      type: 'float', default: 4.0, defaultMobile: 3.0,
      range: [0.0, 10.0], goodRange: [1.0, 8.0], scale: 'linear',
      group: 'Circles', label: 'Circle brightness'
    },
    circleSpacing: {
      type: 'float', default: 25.0,
      range: [5.0, 50.0], goodRange: [10.0, 40.0], scale: 'linear',
      group: 'Circles', label: 'Circle spacing'
    },

    // === Phase 1 additions ===

    // --- Palette (IQ cosine) ---
    paletteMode: {
      type: 'enum', default: 'fixed',
      options: ['fixed', 'iq-cosine'],
      group: 'Palette', label: 'Palette mode',
      description: 'fixed = use lineColor; iq-cosine = colour(t) = a + b·cos(2π(c·t + d)).'
    },
    paletteA: {
      type: 'color3', default: [0.5, 0.5, 0.5],
      group: 'Palette', label: 'Palette a (offset)',
      description: 'IQ palette offset vector. Active when paletteMode = iq-cosine.'
    },
    paletteB: {
      type: 'color3', default: [0.5, 0.5, 0.5],
      group: 'Palette', label: 'Palette b (amplitude)'
    },
    paletteC: {
      type: 'color3', default: [1.0, 1.0, 1.0],
      group: 'Palette', label: 'Palette c (frequency)'
    },
    paletteD: {
      type: 'color3', default: [0.0, 0.33, 0.67],
      group: 'Palette', label: 'Palette d (phase)'
    },
    paletteSpeed: {
      type: 'float', default: 0.0,
      range: [0.0, 1.0], goodRange: [0.0, 0.3], scale: 'linear',
      group: 'Palette', label: 'Palette cycle speed',
      description: 'How fast the palette index advances over time.'
    },

    // --- Domain warp (IQ-style recursive) ---
    domainWarpDepth: {
      type: 'int', default: 0,
      range: [0, 2], scale: 'linear',
      group: 'Domain Warp', label: 'Domain warp depth',
      description: '0 = off (default); 1 = single-level warp; 2 = recursive (IQ).'
    },
    domainWarpScale: {
      type: 'float', default: 1.0,
      range: [0.0, 5.0], goodRange: [0.3, 3.0], scale: 'log',
      group: 'Domain Warp', label: 'Domain warp scale'
    },
    domainWarpAmplitude: {
      type: 'float', default: 0.0,
      range: [0.0, 3.0], goodRange: [0.0, 1.5], scale: 'linear',
      group: 'Domain Warp', label: 'Domain warp strength'
    },

    // --- Post-FX (in-shader, single pass) ---
    kaleidoscopeSegments: {
      type: 'int', default: 0,
      range: [0, 12], scale: 'linear',
      group: 'Post-FX', label: 'Kaleidoscope segments',
      description: '0 = disabled. 4–12 = mirrored radial fold count.'
    },
    vignette: {
      type: 'float', default: 0.0,
      range: [0.0, 1.0], goodRange: [0.0, 0.7], scale: 'linear',
      group: 'Post-FX', label: 'Vignette amount'
    },
    chromaticAberration: {
      type: 'float', default: 0.0,
      range: [0.0, 0.05], goodRange: [0.0, 0.02], scale: 'linear',
      group: 'Post-FX', label: 'Chromatic aberration',
      description: 'Costs 3× pattern cost when > 0; free when 0.'
    },
    filmGrain: {
      type: 'float', default: 0.0,
      range: [0.0, 0.5], goodRange: [0.0, 0.2], scale: 'linear',
      group: 'Post-FX', label: 'Film grain'
    }
  };

  // =========================================================================
  // Feature detection — bail early if we shouldn't render at all.
  // =========================================================================

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var testCanvas = document.createElement('canvas');
  var detectedGlVersion = 1;
  var testGl = testCanvas.getContext('webgl2');
  if (testGl) {
    detectedGlVersion = 2;
  } else {
    testGl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
  }
  if (!testGl) return;
  testCanvas = null;
  testGl = null;

  var isMobile = window.innerWidth <= 768;

  // =========================================================================
  // Helpers — schema → settings, settings → uniforms, validation.
  // =========================================================================

  function cloneValue(v) {
    return Array.isArray(v) ? v.slice() : v;
  }

  function applyDefaults(userConfig, mobile) {
    var s = {};
    for (var key in SCHEMA) {
      var def = SCHEMA[key];
      if (userConfig && Object.prototype.hasOwnProperty.call(userConfig, key)) {
        s[key] = cloneValue(userConfig[key]);
      } else if (mobile && Object.prototype.hasOwnProperty.call(def, 'defaultMobile')) {
        s[key] = cloneValue(def.defaultMobile);
      } else {
        s[key] = cloneValue(def.default);
      }
    }
    return s;
  }

  // =========================================================================
  // LFO engine — JS-side parameter modulation, evaluated each frame.
  // =========================================================================

  var LFO_SHAPES = ['sine', 'triangle', 'square', 'ramp', 'sh'];
  var MAX_LFOS = 4;
  var TWO_PI = Math.PI * 2;

  function validateLfos(rawLfos, parentSeed) {
    if (!Array.isArray(rawLfos)) return [];
    var valid = [];
    for (var i = 0; i < rawLfos.length; i++) {
      if (valid.length >= MAX_LFOS) {
        console.warn('shader-bg: more than ' + MAX_LFOS + ' LFOs; truncating.');
        break;
      }
      var lfo = rawLfos[i];
      if (!lfo || typeof lfo !== 'object') continue;
      var def = SCHEMA[lfo.param];
      if (!def) {
        console.warn('shader-bg: LFO targets unknown param "' + lfo.param + '".');
        continue;
      }
      if (def.type !== 'float' && def.type !== 'int') {
        console.warn('shader-bg: LFO targets non-numeric param "' + lfo.param + '".');
        continue;
      }
      if (LFO_SHAPES.indexOf(lfo.shape) === -1) {
        console.warn('shader-bg: LFO has invalid shape "' + lfo.shape + '".');
        continue;
      }
      if (typeof lfo.rate !== 'number' || lfo.rate <= 0) {
        console.warn('shader-bg: LFO has invalid rate ' + lfo.rate + '.');
        continue;
      }
      // Seeded RNG for the S&H shape (deterministic when parentSeed is provided;
      // null falls back to Math.random() inside lfoShape — Phase 1 back-compat).
      var lfoRng = (parentSeed != null) ? mulberry32((parentSeed ^ valid.length) >>> 0) : null;
      valid.push({
        param: lfo.param,
        shape: lfo.shape,
        rate: lfo.rate,
        amp: typeof lfo.amp === 'number' ? lfo.amp : 0,
        phase: typeof lfo.phase === 'number' ? lfo.phase : 0,
        _lastTickFloor: -Infinity,
        _shValue: 0,
        _rng: lfoRng
      });
    }
    return valid;
  }

  function lfoShape(lfo, t) {
    var phase = lfo.rate * t + lfo.phase;
    switch (lfo.shape) {
      case 'sine':
        return Math.sin(TWO_PI * phase);
      case 'triangle':
        return 4 * Math.abs(((phase % 1) + 1) % 1 - 0.5) - 1;
      case 'square':
        var s = Math.sin(TWO_PI * phase);
        return s >= 0 ? 1 : -1;
      case 'ramp':
        return 2 * (((phase % 1) + 1) % 1) - 1;
      case 'sh':
        var tickFloor = Math.floor(phase);
        if (tickFloor !== lfo._lastTickFloor) {
          lfo._lastTickFloor = tickFloor;
          var r = lfo._rng ? lfo._rng() : Math.random();
          lfo._shValue = r * 2 - 1;
        }
        return lfo._shValue;
      default:
        return 0;
    }
  }

  function applyLfos(baseSettings, t, lfos) {
    if (!lfos || lfos.length === 0) return baseSettings;
    var out = {};
    for (var k in baseSettings) out[k] = baseSettings[k];
    for (var i = 0; i < lfos.length; i++) {
      var lfo = lfos[i];
      var def = SCHEMA[lfo.param];
      var v = out[lfo.param] + lfo.amp * lfoShape(lfo, t);
      if (def.range) {
        if (v < def.range[0]) v = def.range[0];
        if (v > def.range[1]) v = def.range[1];
      }
      if (def.type === 'int') v = Math.round(v);
      out[lfo.param] = v;
    }
    return out;
  }

  // =========================================================================
  // SEED SYSTEM (Phase 2) — deterministic PRNG, string hash, Crockford base32.
  // =========================================================================

  function mulberry32(seed) {
    var s = seed >>> 0;
    return function() {
      s = (s + 0x6D2B79F5) | 0;
      var t = Math.imul(s ^ (s >>> 15), 1 | s);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function cyrb53(str, seed) {
    seed = seed || 0;
    var h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (var i = 0, ch; i < str.length; i++) {
      ch = str.charCodeAt(i);
      h1 = Math.imul(h1 ^ ch, 2654435761);
      h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
  }

  var CROCKFORD_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

  function encodeSeed(intSeed) {
    var n = intSeed >>> 0;
    var out = '';
    for (var i = 0; i < 7; i++) {
      out = CROCKFORD_ALPHABET[n & 31] + out;
      n = n >>> 5;
    }
    return out;
  }

  function decodeSeed(str) {
    if (typeof str !== 'string') return null;
    var s = str.toUpperCase()
      .replace(/I|L/g, '1').replace(/O/g, '0').replace(/U/g, 'V')
      .replace(/[^0-9A-HJ-NP-TV-Z]/g, '');
    if (s.length < 1 || s.length > 7) return null;
    var n = 0;
    for (var i = 0; i < s.length; i++) {
      var v = CROCKFORD_ALPHABET.indexOf(s[i]);
      if (v < 0) return null;
      n = ((n * 32) + v) >>> 0;
    }
    return n >>> 0;
  }

  function normaliseSeed(input) {
    if (typeof input === 'number') return input >>> 0;
    if (typeof input === 'string') {
      var decoded = decodeSeed(input);
      if (decoded !== null) return decoded;
      return cyrb53(input) >>> 0;
    }
    var rnd = (window.crypto && window.crypto.getRandomValues)
      ? (function() { var a = new Uint32Array(1); window.crypto.getRandomValues(a); return a[0]; })()
      : Math.floor(Math.random() * 0xFFFFFFFF);
    return rnd >>> 0;
  }

  // =========================================================================
  // Colour space helpers (HSL ↔ RGB) for archetype sampling and morph.
  // =========================================================================

  function hslToRgb(h, s, l) {
    h = ((h % 1) + 1) % 1;
    if (s === 0) return [l, l, l];
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    var p = 2 * l - q;
    function hue2rgb(t) {
      t = ((t % 1) + 1) % 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    return [hue2rgb(h + 1 / 3), hue2rgb(h), hue2rgb(h - 1 / 3)];
  }

  function rgbToHsl(r, g, b) {
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    return [h, s, l];
  }

  function lerp(a, b, t) { return a + (b - a) * t; }

  // =========================================================================
  // ARCHETYPES (Phase 2) — partial schema overrides per mood.
  // =========================================================================

  var ARCHETYPES = {
    calm: {
      lineCount:        [6, 12],
      overallSpeed:     [0.05, 0.15],
      warpAmplitude:    [0.0, 0.6],
      warpFrequency:    [0.2, 0.8],
      glowSpread:       [0.7, 1.5],
      circleRadius:     [0.005, 0.015],
      circleBrightness: [2.0, 5.0],
      domainWarpDepth:  [0, 0],
      vignette:         [0.2, 0.5],
      filmGrain:        [0.0, 0.05]
    },
    dense: {
      lineCount:        [22, 30],
      minLineWidth:     [0.005, 0.02],
      maxLineWidth:     [0.04, 0.12],
      warpAmplitude:    [0.4, 1.2],
      glowSpread:       [0.3, 0.7],
      minOffsetSpread:  [0.2, 0.5],
      maxOffsetSpread:  [1.0, 2.0],
      circleRadius:     [0.0, 0.01],
      domainWarpDepth:  [0, 1]
    },
    minimal: {
      lineCount:        [4, 8],
      overallSpeed:     [0.05, 0.12],
      warpAmplitude:    [0.0, 0.4],
      glowSpread:       [0.0, 0.3],
      circleRadius:     [0.0, 0.0],
      circleBrightness: [0.0, 0.0],
      domainWarpDepth:  [0, 0],
      filmGrain:        [0.0, 0.0],
      vignette:         [0.0, 0.3]
    },
    chaotic: {
      lineCount:           [20, 30],
      overallSpeed:        [0.3, 0.5],
      warpAmplitude:       [1.5, 2.8],
      warpFrequency:       [0.6, 2.0],
      domainWarpDepth:     [1, 2],
      domainWarpAmplitude: [0.5, 1.5],
      domainWarpScale:     [0.4, 2.0],
      chromaticAberration: [0.005, 0.02],
      glowSpread:          [0.4, 1.2],
      filmGrain:           [0.0, 0.15]
    },
    neon: {
      bgColor1:         { hsl: { h: [200, 280], s: [0.6, 1.0], l: [0.04, 0.12], a: [1, 1] } },
      bgColor2:         { hsl: { h: [200, 320], s: [0.6, 1.0], l: [0.06, 0.15], a: [1, 1] } },
      lineColor:        { hsl: { h: [180, 320], s: [0.7, 1.0], l: [0.55, 0.75], a: [0.7, 1.0] } },
      glowSpread:       [1.0, 2.0],
      circleBrightness: [6.0, 10.0],
      vignette:         [0.3, 0.6],
      chromaticAberration: [0.0, 0.012],
      domainWarpDepth:  [0, 1]
    },
    vapor: {
      paletteMode:      'iq-cosine',
      paletteA:         [[0.4, 0.6], [0.4, 0.6], [0.4, 0.6]],
      paletteB:         [[0.4, 0.6], [0.4, 0.6], [0.4, 0.6]],
      paletteC:         [[0.8, 1.2], [0.8, 1.2], [0.4, 0.7]],
      paletteD:         [[0.6, 0.95], [0.7, 1.0], [0.2, 0.45]],
      paletteSpeed:     [0.04, 0.15],
      bgColor1:         { hsl: { h: [240, 320], s: [0.4, 0.8], l: [0.08, 0.18], a: [1, 1] } },
      bgColor2:         { hsl: { h: [260, 340], s: [0.4, 0.8], l: [0.10, 0.22], a: [1, 1] } },
      vignette:         [0.4, 0.7],
      filmGrain:        [0.05, 0.15],
      glowSpread:       [0.6, 1.4]
    },
    sketch: {
      bgColor1:         { hsl: { h: [0, 60], s: [0.0, 0.1], l: [0.04, 0.10], a: [1, 1] } },
      bgColor2:         { hsl: { h: [0, 60], s: [0.0, 0.1], l: [0.04, 0.12], a: [1, 1] } },
      lineColor:        { hsl: { h: [0, 360], s: [0.0, 0.15], l: [0.85, 1.0], a: [0.5, 0.85] } },
      minLineWidth:     [0.005, 0.015],
      maxLineWidth:     [0.03, 0.08],
      glowSpread:       [0.0, 0.2],
      circleRadius:     [0.0, 0.0],
      circleBrightness: [0.0, 0.0],
      domainWarpDepth:  [0, 0],
      filmGrain:        [0.10, 0.25],
      vignette:         [0.2, 0.5]
    },
    glitch: {
      chromaticAberration: [0.012, 0.04],
      filmGrain:           [0.15, 0.3],
      vignette:            [0.0, 0.3],
      domainWarpDepth:     [0, 1],
      domainWarpAmplitude: [0.2, 0.8],
      warpAmplitude:       [0.8, 2.0],
      overallSpeed:        [0.2, 0.45],
      lineCount:           [10, 20]
    }
  };

  var ARCHETYPE_NAMES = Object.keys(ARCHETYPES);

  // =========================================================================
  // PARAMETER SAMPLER (Phase 2) — handles every type + constraint shape.
  // =========================================================================

  function sampleNumeric(def, range, rng) {
    var lo = range[0], hi = range[1];
    if (lo === hi) return def.type === 'int' ? Math.round(lo) : lo;
    var v;
    if (def.scale === 'log' && lo > 0 && hi > 0) {
      var la = Math.log(lo), lb = Math.log(hi);
      v = Math.exp(la + rng() * (lb - la));
    } else {
      v = lo + rng() * (hi - lo);
    }
    return def.type === 'int' ? Math.round(v) : v;
  }

  function sampleColor3(def, constraint, rng) {
    if (Array.isArray(constraint) && Array.isArray(constraint[0])) {
      return [
        constraint[0][0] + rng() * (constraint[0][1] - constraint[0][0]),
        constraint[1][0] + rng() * (constraint[1][1] - constraint[1][0]),
        constraint[2][0] + rng() * (constraint[2][1] - constraint[2][0])
      ];
    }
    return [
      def.default[0] + (rng() - 0.5) * 0.3,
      def.default[1] + (rng() - 0.5) * 0.3,
      def.default[2] + (rng() - 0.5) * 0.3
    ];
  }

  function sampleColor4(def, constraint, rng) {
    if (constraint && constraint.hsl) {
      var h = lerp(constraint.hsl.h[0], constraint.hsl.h[1], rng());
      var s = lerp(constraint.hsl.s[0], constraint.hsl.s[1], rng());
      var l = lerp(constraint.hsl.l[0], constraint.hsl.l[1], rng());
      var a = lerp(constraint.hsl.a[0], constraint.hsl.a[1], rng());
      var rgb = hslToRgb(h / 360, s, l);
      return [rgb[0], rgb[1], rgb[2], a];
    }
    // No constraint — light random walk around the schema default.
    return [
      Math.max(0, Math.min(1, def.default[0] + (rng() - 0.5) * 0.2)),
      Math.max(0, Math.min(1, def.default[1] + (rng() - 0.5) * 0.2)),
      Math.max(0, Math.min(1, def.default[2] + (rng() - 0.5) * 0.2)),
      def.default[3]
    ];
  }

  function sampleEnum(def, constraint, rng) {
    if (typeof constraint === 'string') return constraint;
    var opts = def.options || [def.default];
    return opts[Math.floor(rng() * opts.length)];
  }

  function sampleParam(def, constraint, rng) {
    if (def.type === 'enum') return sampleEnum(def, constraint, rng);
    if (def.type === 'color') return sampleColor4(def, constraint, rng);
    if (def.type === 'color3') return sampleColor3(def, constraint, rng);
    var range;
    if (Array.isArray(constraint) && constraint.length === 2 && typeof constraint[0] === 'number') {
      range = constraint;
    } else if (typeof constraint === 'number') {
      range = [constraint, constraint];
    } else {
      range = def.goodRange || def.range || [def.default, def.default];
    }
    return sampleNumeric(def, range, rng);
  }

  // =========================================================================
  // COUPLINGS + VALIDATORS (Phase 2)
  // =========================================================================

  function applyCouplings(p) {
    if (p.minLineWidth > p.maxLineWidth) {
      var t1 = p.minLineWidth; p.minLineWidth = p.maxLineWidth; p.maxLineWidth = t1;
    }
    if (p.minOffsetSpread > p.maxOffsetSpread) {
      var t2 = p.minOffsetSpread; p.minOffsetSpread = p.maxOffsetSpread; p.maxOffsetSpread = t2;
    }
    if (p.lineCount > 22) {
      var reduce = (p.lineCount - 22) * 0.03;
      p.lineColor = [p.lineColor[0], p.lineColor[1], p.lineColor[2], Math.max(0.2, p.lineColor[3] - reduce)];
    }
    if (p.warpAmplitude > 1.8 && p.lineCount > 18) p.lineCount = 18;
    return p;
  }

  function relativeLuminance(rgba) {
    function lin(c) { return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }
    return 0.2126 * lin(rgba[0]) + 0.7152 * lin(rgba[1]) + 0.0722 * lin(rgba[2]);
  }

  var VALIDATORS = [
    { check: function(p) { return p.maxLineWidth > p.minLineWidth; },
      msg: 'maxLineWidth must exceed minLineWidth' },
    { check: function(p) { return p.maxOffsetSpread >= p.minOffsetSpread; },
      msg: 'maxOffsetSpread must be >= minOffsetSpread' },
    { check: function(p) {
        var bgAvg = [
          (p.bgColor1[0] + p.bgColor2[0]) / 2,
          (p.bgColor1[1] + p.bgColor2[1]) / 2,
          (p.bgColor1[2] + p.bgColor2[2]) / 2,
          1.0
        ];
        return Math.abs(relativeLuminance(p.lineColor) - relativeLuminance(bgAvg)) > 0.04;
      },
      msg: 'Line colour too close to background luminance' }
  ];

  function validatePreset(p) {
    for (var i = 0; i < VALIDATORS.length; i++) {
      if (!VALIDATORS[i].check(p)) return { valid: false, msg: VALIDATORS[i].msg };
    }
    return { valid: true };
  }

  // =========================================================================
  // MIGRATIONS (Phase 2) — empty for v1 launch; structure ready for Phase 3+.
  // =========================================================================

  var SCHEMA_VERSION = 1;
  var MIGRATIONS = [
    // index N migrates from version N to version N+1.
    // No migrations needed yet; Phase 3 will add migrate_v1_to_v2.
  ];

  function migratePreset(saved) {
    var v = saved.schemaVersion || 0;
    var working = saved;
    while (v < SCHEMA_VERSION) {
      var fn = MIGRATIONS[v];
      if (!fn) {
        console.warn('shader-bg: no migration from schema v' + v + '; using preset as-is.');
        break;
      }
      working = fn(working);
      v++;
    }
    working.schemaVersion = SCHEMA_VERSION;
    return working;
  }

  // =========================================================================
  // PRESET ROLLING (Phase 2)
  // =========================================================================

  var _rollIsRetry = false;

  function rollPreset(seedInput, archetypeName) {
    var seedInt = normaliseSeed(seedInput);
    var rng = mulberry32(seedInt);

    var archetype;
    if (archetypeName && ARCHETYPES[archetypeName]) {
      archetype = ARCHETYPES[archetypeName];
    } else {
      archetypeName = ARCHETYPE_NAMES[Math.floor(rng() * ARCHETYPE_NAMES.length)];
      archetype = ARCHETYPES[archetypeName];
    }

    var preset = {};
    var keys = Object.keys(SCHEMA);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i], def = SCHEMA[k];
      preset[k] = sampleParam(def, archetype[k], rng);
    }

    applyCouplings(preset);

    var v = validatePreset(preset);
    if (!v.valid && !_rollIsRetry) {
      _rollIsRetry = true;
      var retry = rollPreset((seedInt + 0x9E3779B9) >>> 0, archetypeName);
      _rollIsRetry = false;
      return retry;
    }
    if (!v.valid) {
      console.warn('shader-bg: preset failed validation after re-roll: ' + v.msg);
    }

    preset._seedInt = seedInt;
    preset._seed = encodeSeed(seedInt);
    preset._archetype = archetypeName;
    preset.schemaVersion = SCHEMA_VERSION;

    return preset;
  }

  // =========================================================================
  // URL HASH SYNC (Phase 2)
  // =========================================================================

  function parseUrlHash() {
    var hash = window.location.hash || '';
    if (!hash) return null;
    var params = {};
    hash.replace(/^#/, '').split('&').forEach(function(kv) {
      var p = kv.split('=');
      if (p.length === 2) params[decodeURIComponent(p[0])] = decodeURIComponent(p[1]);
    });
    if (!params.s) return null;
    var seedInt = decodeSeed(params.s);
    if (seedInt === null) return null;
    return { seed: seedInt, archetype: params.a || null };
  }

  function writeUrlHash(seedStr, archetypeName) {
    var newHash = '#s=' + seedStr + (archetypeName ? '&a=' + encodeURIComponent(archetypeName) : '');
    if (window.location.hash !== newHash) {
      try {
        history.replaceState(null, '', window.location.pathname + window.location.search + newHash);
      } catch (e) {
        // file:// or otherwise restricted — fall back to direct hash assignment.
        try { window.location.hash = newHash; } catch (e2) {}
      }
    }
  }

  // =========================================================================
  // MORPH ENGINE (Phase 2) — parameter-space interpolation, single render path.
  // =========================================================================

  function smoothstep(t) { return t * t * (3 - 2 * t); }

  function lerpLog(a, b, t) {
    if (a <= 0 || b <= 0) return lerp(a, b, t);
    return Math.exp(lerp(Math.log(a), Math.log(b), t));
  }

  function lerpHueShortest(h1, h2, t) {
    var d = ((h2 - h1 + 540) % 360) - 180;
    return ((h1 + d * t) + 360) % 360;
  }

  function lerpColor4(a, b, t) {
    var hslA = rgbToHsl(a[0], a[1], a[2]);
    var hslB = rgbToHsl(b[0], b[1], b[2]);
    var h = lerpHueShortest(hslA[0] * 360, hslB[0] * 360, t) / 360;
    var rgb = hslToRgb(h, lerp(hslA[1], hslB[1], t), lerp(hslA[2], hslB[2], t));
    return [rgb[0], rgb[1], rgb[2], lerp(a[3], b[3], t)];
  }

  function lerpColor3(a, b, t) {
    return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  }

  function interpParam(def, va, vb, t) {
    if (def.type === 'enum') return t < 0.5 ? va : vb;
    if (def.type === 'color') return lerpColor4(va, vb, t);
    if (def.type === 'color3') return lerpColor3(va, vb, t);
    if (def.scale === 'log' && va > 0 && vb > 0) {
      var v = lerpLog(va, vb, t);
      return def.type === 'int' ? Math.round(v) : v;
    }
    var v2 = lerp(va, vb, t);
    return def.type === 'int' ? Math.round(v2) : v2;
  }

  var _morphState = null;

  function startMorph(targetParams, durationMs, onComplete) {
    cancelMorph();
    var fromParams = {};
    for (var k in SCHEMA) fromParams[k] = cloneValue(liveConfig[k]);
    var token = {};
    _morphState = { token: token, fromParams: fromParams, targetParams: targetParams, startTime: performance.now(), duration: Math.max(1, durationMs), onComplete: onComplete };
    function step(now) {
      if (!_morphState || _morphState.token !== token) return;
      var t = Math.min(1, (now - _morphState.startTime) / _morphState.duration);
      var eased = smoothstep(t);
      for (var k in SCHEMA) {
        liveConfig[k] = interpParam(SCHEMA[k], _morphState.fromParams[k], _morphState.targetParams[k], eased);
      }
      if (t < 1) {
        requestAnimationFrame(step);
      } else {
        var done = _morphState.onComplete;
        _morphState = null;
        if (done) done();
      }
    }
    requestAnimationFrame(step);
  }

  function cancelMorph() {
    if (_morphState) _morphState.token = null;
    _morphState = null;
  }

  // =========================================================================
  // STORAGE (Phase 2) — localStorage favourites with seed + delta encoding.
  // =========================================================================

  var STORAGE_KEY = 'heroshader.favourites.v1';

  function isEqualish(a, b) {
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      for (var i = 0; i < a.length; i++) if (Math.abs(a[i] - b[i]) > 1e-4) return false;
      return true;
    }
    if (typeof a === 'string' || typeof b === 'string') return a === b;
    return Math.abs(a - b) < 1e-4;
  }

  function computeDelta(currentParams, basePreset) {
    var delta = {};
    for (var key in SCHEMA) {
      if (!isEqualish(currentParams[key], basePreset[key])) {
        delta[key] = cloneValue(currentParams[key]);
      }
    }
    return delta;
  }

  function readFavourites() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function writeFavourites(arr) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
      return true;
    } catch (e) {
      console.warn('shader-bg: localStorage write failed', e);
      return false;
    }
  }

  function makeShortId() {
    var n = (Math.random() * 0xFFFFFFFF) >>> 0;
    return n.toString(36).slice(0, 6);
  }

  function saveFavourite(name) {
    var seedStr = window.HeroShader.currentSeed;
    var archetype = window.HeroShader.currentArchetype;
    if (!seedStr || !archetype) {
      console.warn('shader-bg: cannot save — current preset has no seed/archetype. Roll first.');
      return null;
    }
    var basePreset = rollPreset(seedStr, archetype);
    var delta = computeDelta(liveConfig, basePreset);
    var entry = {
      id: makeShortId(),
      schemaVersion: SCHEMA_VERSION,
      seed: seedStr,
      archetype: archetype,
      name: name || (archetype + ' ' + seedStr),
      createdAt: Date.now(),
      delta: delta
    };
    var list = readFavourites();
    list.push(entry);
    writeFavourites(list);
    return entry;
  }

  function deleteFavourite(id) {
    var list = readFavourites().filter(function(p) { return p.id !== id; });
    writeFavourites(list);
  }

  function renameFavourite(id, newName) {
    var list = readFavourites();
    for (var i = 0; i < list.length; i++) if (list[i].id === id) list[i].name = newName;
    writeFavourites(list);
  }

  function applyPresetToLiveConfig(rolled, delta) {
    for (var k in SCHEMA) {
      liveConfig[k] = cloneValue(rolled[k]);
    }
    if (delta) {
      for (var dk in delta) {
        if (SCHEMA[dk]) liveConfig[dk] = cloneValue(delta[dk]);
      }
    }
  }

  function loadFavourite(id) {
    var list = readFavourites();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) {
        var migrated = migratePreset(list[i]);
        var basePreset = rollPreset(migrated.seed, migrated.archetype);
        applyPresetToLiveConfig(basePreset, migrated.delta);
        window.HeroShader.currentSeed = basePreset._seed;
        window.HeroShader.currentArchetype = basePreset._archetype;
        writeUrlHash(basePreset._seed, basePreset._archetype);
        return basePreset;
      }
    }
    return null;
  }

  function loadFavouriteAndMorph(id, durationMs) {
    var list = readFavourites();
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) {
        var migrated = migratePreset(list[i]);
        var basePreset = rollPreset(migrated.seed, migrated.archetype);
        var target = {};
        for (var k in SCHEMA) target[k] = cloneValue(basePreset[k]);
        if (migrated.delta) {
          for (var dk in migrated.delta) {
            if (SCHEMA[dk]) target[dk] = cloneValue(migrated.delta[dk]);
          }
        }
        startMorph(target, durationMs || 1500, function() {
          window.HeroShader.currentSeed = basePreset._seed;
          window.HeroShader.currentArchetype = basePreset._archetype;
          writeUrlHash(basePreset._seed, basePreset._archetype);
        });
        return basePreset;
      }
    }
    return null;
  }

  // =========================================================================
  // AUTO-CYCLE (Phase 2) — state machine for production data-shader-cycle.
  // =========================================================================

  function parseCycleAttribute(raw) {
    if (!raw) return null;
    try {
      var cfg = JSON.parse(raw);
      var presets;
      if (Array.isArray(cfg.presets)) presets = cfg.presets;
      else if (Array.isArray(cfg.seeds)) presets = cfg.seeds.map(function(s) { return { seed: s }; });
      else return null;
      if (presets.length < 1) return null;
      return {
        presets: presets,
        hold: typeof cfg.hold === 'number' ? cfg.hold : 12,
        morph: typeof cfg.morph === 'number' ? cfg.morph : 4
      };
    } catch (e) {
      console.warn('shader-bg: invalid data-shader-cycle JSON', e);
      return null;
    }
  }

  function expandCyclePreset(entry) {
    var rolled = rollPreset(entry.seed, entry.archetype || null);
    if (entry.delta) {
      for (var k in entry.delta) {
        if (SCHEMA[k]) rolled[k] = cloneValue(entry.delta[k]);
      }
    }
    return rolled;
  }

  var _cycleState = null;

  function startAutoCycle(cfg) {
    stopAutoCycle();
    var first = expandCyclePreset(cfg.presets[0]);
    for (var k in SCHEMA) liveConfig[k] = cloneValue(first[k]);
    window.HeroShader.currentSeed = first._seed;
    window.HeroShader.currentArchetype = first._archetype;
    _cycleState = { cfg: cfg, index: 0, state: 'HOLD', timer: null };
    scheduleCycleTick();
  }

  function stopAutoCycle() {
    if (_cycleState && _cycleState.timer) clearTimeout(_cycleState.timer);
    _cycleState = null;
    cancelMorph();
  }

  function scheduleCycleTick() {
    if (!_cycleState || _cycleState.state !== 'HOLD') return;
    var ms = _cycleState.cfg.hold * 1000;
    _cycleState.timer = setTimeout(function() {
      if (!_cycleState) return;
      _cycleState.state = 'MORPH';
      var nextIndex = (_cycleState.index + 1) % _cycleState.cfg.presets.length;
      var target = expandCyclePreset(_cycleState.cfg.presets[nextIndex]);
      startMorph(target, _cycleState.cfg.morph * 1000, function() {
        if (!_cycleState) return;
        _cycleState.index = nextIndex;
        _cycleState.state = 'HOLD';
        window.HeroShader.currentSeed = target._seed;
        window.HeroShader.currentArchetype = target._archetype;
        scheduleCycleTick();
      });
    }, ms);
  }

  // =========================================================================
  // Quality tier system — adjusts uniform values, never recompiles.
  // =========================================================================

  var TIER_ORDER = ['high', 'medium', 'low', 'minimal'];
  var FPS_THRESHOLD = 45;
  var FPS_WINDOW_MS = 1000;

  function applyTier(base, tier) {
    var s = {};
    for (var k in base) s[k] = base[k];
    if (tier === 'medium') {
      s.lineCount = Math.max(4, Math.round(base.lineCount * 0.75));
      s.lineColor = [base.lineColor[0], base.lineColor[1], base.lineColor[2], base.lineColor[3] * 0.9];
    } else if (tier === 'low') {
      s.lineCount = Math.max(4, Math.round(base.lineCount * 0.5));
      s.scale = base.scale * 1.2;
      s.warpAmplitude = base.warpAmplitude * 0.5;
      s.lineColor = [base.lineColor[0], base.lineColor[1], base.lineColor[2], base.lineColor[3] * 0.85];
    } else if (tier === 'minimal') {
      s.lineCount = 4;
      s.glowSpread = 0;
      s.circleRadius = 0;
      s.circleBrightness = 0;
      s.warpAmplitude = base.warpAmplitude * 0.5;
      s.lineColor = [base.lineColor[0], base.lineColor[1], base.lineColor[2], base.lineColor[3] * 0.8];
    }
    return s;
  }

  function maxDprForTier(tier) {
    if (tier === 'high') return Math.min(window.devicePixelRatio || 1, 2);
    return 1;
  }

  function readQualityOverride() {
    try {
      var v = localStorage.getItem('shader-quality');
      if (v && TIER_ORDER.indexOf(v) !== -1) return v;
    } catch (e) {}
    return null;
  }

  // =========================================================================
  // Shader sources.
  // =========================================================================

  var VERTEX_SHADER_SOURCE = [
    'attribute vec2 a_position;',
    'void main() {',
    '  gl_Position = vec4(a_position, 0.0, 1.0);',
    '}'
  ].join('\n');

  var FRAGMENT_SHADER_SOURCE = [
    'precision mediump float;',
    '',
    'uniform vec2 u_resolution;',
    'uniform float u_time;',
    '',
    '// v1 uniforms',
    'uniform vec4 u_bgColor1;',
    'uniform vec4 u_bgColor2;',
    'uniform vec4 u_lineColor;',
    'uniform float u_overallSpeed;',
    'uniform float u_lineCount;',
    'uniform float u_minLineWidth;',
    'uniform float u_maxLineWidth;',
    'uniform float u_lineFrequency;',
    'uniform float u_lineAmplitude;',
    'uniform float u_warpFrequency;',
    'uniform float u_warpAmplitude;',
    'uniform float u_offsetFrequency;',
    'uniform float u_minOffsetSpread;',
    'uniform float u_maxOffsetSpread;',
    'uniform float u_scale;',
    'uniform float u_glowSpread;',
    'uniform float u_circleRadius;',
    'uniform float u_circleBrightness;',
    'uniform float u_circleSpacing;',
    '',
    '// Phase 1 uniforms',
    'uniform float u_paletteMode;       // 0 = fixed, 1 = iq-cosine',
    'uniform vec3  u_paletteA;',
    'uniform vec3  u_paletteB;',
    'uniform vec3  u_paletteC;',
    'uniform vec3  u_paletteD;',
    'uniform float u_paletteSpeed;',
    'uniform float u_domainWarpDepth;   // 0, 1, or 2',
    'uniform float u_domainWarpScale;',
    'uniform float u_domainWarpAmplitude;',
    'uniform float u_kaleidoscopeSegments;',
    'uniform float u_vignette;',
    'uniform float u_chromaticAberration;',
    'uniform float u_filmGrain;',
    '',
    'const int MAX_LINES = 32;',
    'const float gridSmoothWidth = 0.015;',
    '',
    '#define drawSmoothLine(pos, halfWidth, t) smoothstep(halfWidth, 0.0, abs(pos - (t)))',
    '#define drawCrispLine(pos, halfWidth, t) smoothstep(halfWidth + gridSmoothWidth, halfWidth, abs(pos - (t)))',
    '#define drawCircle(pos, radius, coord) smoothstep(radius + gridSmoothWidth, radius, length(coord - (pos)))',
    '',
    '// v1 cheap pseudo-random (preserved verbatim for back-compat)',
    'float random(float t) {',
    '  return (cos(t) + cos(t * 1.3 + 1.3) + cos(t * 1.4 + 1.4)) / 3.0;',
    '}',
    '',
    '// 2D float hash, value noise, FBM (used by domain warp + film grain).',
    'float hash21(vec2 p) {',
    '  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);',
    '}',
    'float vnoise(vec2 p) {',
    '  vec2 i = floor(p);',
    '  vec2 f = fract(p);',
    '  vec2 u = f * f * (3.0 - 2.0 * f);',
    '  return mix(',
    '    mix(hash21(i + vec2(0.0, 0.0)), hash21(i + vec2(1.0, 0.0)), u.x),',
    '    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),',
    '    u.y',
    '  );',
    '}',
    'float fbm(vec2 p) {',
    '  float v = 0.0;',
    '  float a = 0.5;',
    '  for (int i = 0; i < 4; i++) {',
    '    v += a * vnoise(p);',
    '    p *= 2.0;',
    '    a *= 0.5;',
    '  }',
    '  return v;',
    '}',
    '',
    '// IQ cosine palette: colour(t) = a + b * cos(2*pi*(c*t + d)).',
    'vec3 iqPalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {',
    '  return a + b * cos(6.28318530718 * (c * t + d));',
    '}',
    '',
    '// Recursive domain warp à la Inigo Quilez (depth 0 = bypass).',
    'vec2 domainWarp(vec2 p, float depth, float warpScale, float amp) {',
    '  if (depth < 0.5) return p;',
    '  vec2 q = vec2(',
    '    fbm(p * warpScale),',
    '    fbm(p * warpScale + vec2(5.2, 1.3))',
    '  );',
    '  if (depth < 1.5) return p + amp * q;',
    '  vec2 r = vec2(',
    '    fbm(p * warpScale + 4.0 * q + vec2(1.7, 9.2)),',
    '    fbm(p * warpScale + 4.0 * q + vec2(8.3, 2.8))',
    '  );',
    '  return p + amp * r;',
    '}',
    '',
    '// Radial mirror fold for kaleidoscope post-FX (segments < 0.5 = bypass).',
    'vec2 kaleido(vec2 uv, float segments) {',
    '  if (segments < 0.5) return uv;',
    '  vec2 p = uv - 0.5;',
    '  float r = length(p);',
    '  float a = atan(p.y, p.x);',
    '  float seg = 6.28318530718 / segments;',
    '  a = mod(a, seg);',
    '  a = abs(a - seg * 0.5);',
    '  return vec2(cos(a), sin(a)) * r + 0.5;',
    '}',
    '',
    'float getPlasmaY(float x, float horizontalFade, float offset) {',
    '  float lineSpeed = 1.0 * u_overallSpeed;',
    '  return random(x * u_lineFrequency + u_time * lineSpeed) * horizontalFade * u_lineAmplitude + offset;',
    '}',
    '',
    'vec3 patternColor(vec2 uv) {',
    '  // 1. Optional kaleidoscope UV transform.',
    '  vec2 muv = kaleido(uv, u_kaleidoscopeSegments);',
    '',
    '  // 2. World-space coord (matches v1 aspect handling: scaled by 1/width on both axes).',
    '  vec2 space = (muv - 0.5) * 2.0 * u_scale * vec2(1.0, u_resolution.y / u_resolution.x);',
    '',
    '  // 3. Optional IQ-style domain warp BEFORE the plasma\'s own line warp.',
    '  space = domainWarp(space, u_domainWarpDepth, u_domainWarpScale, u_domainWarpAmplitude);',
    '',
    '  float lineSpeed = 1.0 * u_overallSpeed;',
    '  float warpSpeed = 0.2 * u_overallSpeed;',
    '  float offsetSpeed = 1.33 * u_overallSpeed;',
    '',
    '  float horizontalFade = 1.0 - (cos(muv.x * 6.28) * 0.5 + 0.5);',
    '  float verticalFade   = 1.0 - (cos(muv.y * 6.28) * 0.5 + 0.5);',
    '',
    '  // 4. Existing per-line warp (same as v1).',
    '  space.y += random(space.x * u_warpFrequency + u_time * warpSpeed) * u_warpAmplitude * (0.5 + horizontalFade);',
    '  space.x += random(space.y * u_warpFrequency + u_time * warpSpeed + 2.0) * u_warpAmplitude * horizontalFade;',
    '',
    '  vec4 lines = vec4(0.0);',
    '  float lineCountF = max(1.0, u_lineCount);',
    '',
    '  for (int l = 0; l < MAX_LINES; l++) {',
    '    if (float(l) >= lineCountF) break;',
    '    float fl = float(l);',
    '    float normalizedLineIndex = fl / lineCountF;',
    '    float offsetTime = u_time * offsetSpeed;',
    '    float offsetPosition = fl + space.x * u_offsetFrequency;',
    '    float rand = random(offsetPosition + offsetTime) * 0.5 + 0.5;',
    '    float halfWidth = mix(u_minLineWidth, u_maxLineWidth, rand * horizontalFade) / 2.0;',
    '    float offset = random(offsetPosition + offsetTime * (1.0 + normalizedLineIndex)) * mix(u_minOffsetSpread, u_maxOffsetSpread, horizontalFade);',
    '    float linePosition = getPlasmaY(space.x, horizontalFade, offset);',
    '    float line = drawSmoothLine(linePosition, halfWidth, space.y) * u_glowSpread + drawCrispLine(linePosition, halfWidth * 0.15, space.y);',
    '',    '    float circleX = mod(fl + u_time * lineSpeed, u_circleSpacing) - u_circleSpacing * 0.48;',
    '    vec2 circlePosition = vec2(circleX, getPlasmaY(circleX, horizontalFade, offset));',
    '    float circle = drawCircle(circlePosition, u_circleRadius, space) * u_circleBrightness;',
    '',
    '    line = line + circle;',
    '',
    '    vec4 lineColorChoice;',
    '    if (u_paletteMode > 0.5) {',
    '      float pt = normalizedLineIndex + u_time * u_paletteSpeed;',
    '      vec3 palCol = iqPalette(pt, u_paletteA, u_paletteB, u_paletteC, u_paletteD);',
    '      lineColorChoice = vec4(palCol, u_lineColor.a);',
    '    } else {',
    '      lineColorChoice = u_lineColor;',
    '    }',
    '',
    '    lines += line * lineColorChoice * rand;',
    '  }',
    '',
    '  vec4 fragColor = mix(u_bgColor1, u_bgColor2, muv.x);',
    '  fragColor *= verticalFade;',
    '  fragColor.a = 1.0;',
    '  fragColor += lines;',
    '',
    '  return fragColor.rgb;',
    '}',
    '',
    'void main() {',
    '  vec2 uv = gl_FragCoord.xy / u_resolution.xy;',
    '',
    '  vec3 col;',
    '  if (u_chromaticAberration > 0.0) {',
    '    vec2 ca = (uv - 0.5) * u_chromaticAberration;',
    '    col.r = patternColor(uv + ca).r;',
    '    col.g = patternColor(uv).g;',
    '    col.b = patternColor(uv - ca).b;',
    '  } else {',
    '    col = patternColor(uv);',
    '  }',
    '',
    '  if (u_vignette > 0.0) {',
    '    float v = smoothstep(0.4, 1.0, length(uv - 0.5));',
    '    col *= mix(1.0, 1.0 - v, u_vignette);',
    '  }',
    '',
    '  if (u_filmGrain > 0.0) {',
    '    float n = hash21(uv * u_resolution.xy + u_time * 60.0) - 0.5;',
    '    col += n * u_filmGrain;',
    '  }',
    '',
    '  gl_FragColor = vec4(col, 1.0);',
    '}'
  ].join('\n');

  // =========================================================================
  // Public API — populated synchronously so playground inline scripts can
  // read window.__shaderConfig before DOMContentLoaded fires.
  // =========================================================================

  var defaultsSnapshot = applyDefaults({}, isMobile);
  var liveConfig = applyDefaults({}, isMobile);

  window.HeroShader = window.HeroShader || {};
  window.HeroShader.schema = Object.freeze(SCHEMA);
  window.HeroShader.glVersion = detectedGlVersion;
  window.HeroShader.version = '2.1.0-alpha';
  window.HeroShader.schemaVersion = SCHEMA_VERSION;
  window.HeroShader.config = liveConfig;
  window.HeroShader.defaults = defaultsSnapshot;
  window.HeroShader.lfos = [];
  window.HeroShader.userConfig = {};
  window.HeroShader.currentSeed = null;
  window.HeroShader.currentArchetype = null;
  window.HeroShader.archetypes = Object.freeze(ARCHETYPE_NAMES.slice());

  // Seed system public API
  window.HeroShader.seeds = {
    encode: encodeSeed,
    decode: decodeSeed,
    archetypes: ARCHETYPE_NAMES.slice(),
    current: function() {
      return {
        seed: window.HeroShader.currentSeed,
        archetype: window.HeroShader.currentArchetype
      };
    },
    roll: function(seedInput, archetypeName) {
      var rolled = rollPreset(seedInput, archetypeName);
      for (var k in SCHEMA) liveConfig[k] = cloneValue(rolled[k]);
      window.HeroShader.currentSeed = rolled._seed;
      window.HeroShader.currentArchetype = rolled._archetype;
      writeUrlHash(rolled._seed, rolled._archetype);
      // Re-validate any active LFOs with the new seed for deterministic S&H.
      window.HeroShader.lfos = validateLfos(
        (window.HeroShader.userConfig && window.HeroShader.userConfig.lfos) || [],
        rolled._seedInt
      );
      return rolled;
    },
    rerollRandom: function(archetypeName) {
      return window.HeroShader.seeds.roll(normaliseSeed(null), archetypeName);
    },
    list: readFavourites,
    save: saveFavourite,
    delete: deleteFavourite,
    rename: renameFavourite,
    load: loadFavourite,
    loadAndMorph: loadFavouriteAndMorph,
    startCycle: function(seedListOrCfg, holdSec, morphSec) {
      var cfg;
      if (Array.isArray(seedListOrCfg)) {
        var presets = seedListOrCfg.map(function(item) {
          if (typeof item === 'string') return { seed: item };
          return item;
        });
        cfg = {
          presets: presets,
          hold: typeof holdSec === 'number' ? holdSec : 12,
          morph: typeof morphSec === 'number' ? morphSec : 4
        };
      } else {
        cfg = seedListOrCfg;
      }
      startAutoCycle(cfg);
    },
    stopCycle: stopAutoCycle,
    isCycling: function() { return _cycleState !== null; },
    morphTo: startMorph
  };

  // Back-compat aliases used by the playground page.
  window.__shaderConfig = liveConfig;
  window.__shaderDefaults = defaultsSnapshot;

  // =========================================================================
  // Init — once the DOM is ready.
  // =========================================================================

  function compileShader(gl, type, source) {
    var sh = gl.createShader(type);
    gl.shaderSource(sh, source);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      console.error('shader-bg: shader compile error\n' + gl.getShaderInfoLog(sh) + '\nSource:\n' + source);
      gl.deleteShader(sh);
      return null;
    }
    return sh;
  }

  function compileProgram(gl) {
    var vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER_SOURCE);
    var fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SOURCE);
    if (!vs || !fs) return null;
    var prog = gl.createProgram();
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.error('shader-bg: program link error\n' + gl.getProgramInfoLog(prog));
      gl.deleteProgram(prog);
      return null;
    }
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    return prog;
  }

  function lookupLocations(gl, program) {
    return {
      aPosition: gl.getAttribLocation(program, 'a_position'),
      resolution: gl.getUniformLocation(program, 'u_resolution'),
      time: gl.getUniformLocation(program, 'u_time'),
      bgColor1: gl.getUniformLocation(program, 'u_bgColor1'),
      bgColor2: gl.getUniformLocation(program, 'u_bgColor2'),
      lineColor: gl.getUniformLocation(program, 'u_lineColor'),
      overallSpeed: gl.getUniformLocation(program, 'u_overallSpeed'),
      lineCount: gl.getUniformLocation(program, 'u_lineCount'),
      minLineWidth: gl.getUniformLocation(program, 'u_minLineWidth'),
      maxLineWidth: gl.getUniformLocation(program, 'u_maxLineWidth'),
      lineFrequency: gl.getUniformLocation(program, 'u_lineFrequency'),
      lineAmplitude: gl.getUniformLocation(program, 'u_lineAmplitude'),
      warpFrequency: gl.getUniformLocation(program, 'u_warpFrequency'),
      warpAmplitude: gl.getUniformLocation(program, 'u_warpAmplitude'),
      offsetFrequency: gl.getUniformLocation(program, 'u_offsetFrequency'),
      minOffsetSpread: gl.getUniformLocation(program, 'u_minOffsetSpread'),
      maxOffsetSpread: gl.getUniformLocation(program, 'u_maxOffsetSpread'),
      scale: gl.getUniformLocation(program, 'u_scale'),
      glowSpread: gl.getUniformLocation(program, 'u_glowSpread'),
      circleRadius: gl.getUniformLocation(program, 'u_circleRadius'),
      circleBrightness: gl.getUniformLocation(program, 'u_circleBrightness'),
      circleSpacing: gl.getUniformLocation(program, 'u_circleSpacing'),
      paletteMode: gl.getUniformLocation(program, 'u_paletteMode'),
      paletteA: gl.getUniformLocation(program, 'u_paletteA'),
      paletteB: gl.getUniformLocation(program, 'u_paletteB'),
      paletteC: gl.getUniformLocation(program, 'u_paletteC'),
      paletteD: gl.getUniformLocation(program, 'u_paletteD'),
      paletteSpeed: gl.getUniformLocation(program, 'u_paletteSpeed'),
      domainWarpDepth: gl.getUniformLocation(program, 'u_domainWarpDepth'),
      domainWarpScale: gl.getUniformLocation(program, 'u_domainWarpScale'),
      domainWarpAmplitude: gl.getUniformLocation(program, 'u_domainWarpAmplitude'),
      kaleidoscopeSegments: gl.getUniformLocation(program, 'u_kaleidoscopeSegments'),
      vignette: gl.getUniformLocation(program, 'u_vignette'),
      chromaticAberration: gl.getUniformLocation(program, 'u_chromaticAberration'),
      filmGrain: gl.getUniformLocation(program, 'u_filmGrain')
    };
  }

  function uploadUniforms(gl, loc, s) {
    gl.uniform4fv(loc.bgColor1, s.bgColor1);
    gl.uniform4fv(loc.bgColor2, s.bgColor2);
    gl.uniform4fv(loc.lineColor, s.lineColor);
    gl.uniform1f(loc.overallSpeed, s.overallSpeed);
    gl.uniform1f(loc.lineCount, Math.max(1, Math.round(s.lineCount)));
    gl.uniform1f(loc.minLineWidth, s.minLineWidth);
    gl.uniform1f(loc.maxLineWidth, s.maxLineWidth);
    gl.uniform1f(loc.lineFrequency, s.lineFrequency);
    gl.uniform1f(loc.lineAmplitude, s.lineAmplitude);
    gl.uniform1f(loc.warpFrequency, s.warpFrequency);
    gl.uniform1f(loc.warpAmplitude, s.warpAmplitude);
    gl.uniform1f(loc.offsetFrequency, s.offsetFrequency);
    gl.uniform1f(loc.minOffsetSpread, s.minOffsetSpread);
    gl.uniform1f(loc.maxOffsetSpread, s.maxOffsetSpread);
    gl.uniform1f(loc.scale, s.scale);
    gl.uniform1f(loc.glowSpread, s.glowSpread);
    gl.uniform1f(loc.circleRadius, s.circleRadius);
    gl.uniform1f(loc.circleBrightness, s.circleBrightness);
    gl.uniform1f(loc.circleSpacing, s.circleSpacing);
    gl.uniform1f(loc.paletteMode, s.paletteMode === 'iq-cosine' ? 1.0 : 0.0);
    gl.uniform3fv(loc.paletteA, s.paletteA);
    gl.uniform3fv(loc.paletteB, s.paletteB);
    gl.uniform3fv(loc.paletteC, s.paletteC);
    gl.uniform3fv(loc.paletteD, s.paletteD);
    gl.uniform1f(loc.paletteSpeed, s.paletteSpeed);
    gl.uniform1f(loc.domainWarpDepth, s.domainWarpDepth);
    gl.uniform1f(loc.domainWarpScale, s.domainWarpScale);
    gl.uniform1f(loc.domainWarpAmplitude, s.domainWarpAmplitude);
    gl.uniform1f(loc.kaleidoscopeSegments, s.kaleidoscopeSegments);
    gl.uniform1f(loc.vignette, s.vignette);
    gl.uniform1f(loc.chromaticAberration, s.chromaticAberration);
    gl.uniform1f(loc.filmGrain, s.filmGrain);
  }

  function init(optionalHost) {
    var host = optionalHost || document.querySelector('[data-shader]') || document.querySelector('.header');
    if (!host) return;
    // React remount / HMR: never stack multiple canvases on the same host.
    if (host.querySelector('.shader-canvas')) return;

    var userConfig = {};
    var raw = host.getAttribute('data-shader');
    if (raw) {
      try { userConfig = JSON.parse(raw); } catch (e) {
        console.warn('shader-bg: invalid data-shader JSON', e);
      }
    }

    var cycleConfig = parseCycleAttribute(host.getAttribute('data-shader-cycle'));
    var hashConfig = parseUrlHash();

    // Seed precedence: URL hash > userConfig.seed (when no auto-cycle).
    var activeSeed = null;
    var activeArchetype = null;
    if (!cycleConfig) {
      if (hashConfig) {
        activeSeed = hashConfig.seed;
        activeArchetype = hashConfig.archetype;
      } else if (userConfig.seed != null) {
        activeSeed = userConfig.seed;
        activeArchetype = userConfig.archetype || null;
      }
    }

    var rolledPreset = (activeSeed != null) ? rollPreset(activeSeed, activeArchetype) : null;

    // Merge order: defaults → rolled → explicit userConfig overrides (excluding seed/archetype/lfos meta-fields).
    for (var key in SCHEMA) {
      if (rolledPreset && Object.prototype.hasOwnProperty.call(rolledPreset, key)) {
        liveConfig[key] = cloneValue(rolledPreset[key]);
      }
      if (Object.prototype.hasOwnProperty.call(userConfig, key)) {
        liveConfig[key] = cloneValue(userConfig[key]);
      }
    }

    // Seeded LFOs: pass the parent seed so S&H is deterministic.
    var lfoSeed = rolledPreset ? rolledPreset._seedInt : null;
    var lfos = validateLfos(userConfig.lfos, lfoSeed);

    window.HeroShader.userConfig = userConfig;
    window.HeroShader.lfos = lfos;
    window.HeroShader.currentSeed = rolledPreset ? rolledPreset._seed : null;
    window.HeroShader.currentArchetype = rolledPreset ? rolledPreset._archetype : null;

    var qualityOverride = readQualityOverride();
    var currentTier = qualityOverride || 'high';
    var lockedTier = qualityOverride !== null;

    var canvas = document.createElement('canvas');
    canvas.className = 'shader-canvas';
    canvas.setAttribute('aria-hidden', 'true');
    host.insertBefore(canvas, host.firstChild);

    var gl = canvas.getContext('webgl2') || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      canvas.remove();
      return;
    }

    var actualGlVersion = (typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext) ? 2 : 1;
    window.HeroShader.glVersion = actualGlVersion;

    host.classList.add('shader-active');

    var program = compileProgram(gl);
    if (!program) {
      canvas.remove();
      host.classList.remove('shader-active');
      return;
    }

    var loc = lookupLocations(gl, program);

    var positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,  1, -1,  -1, 1,  1, 1
    ]), gl.STATIC_DRAW);

    var animationId = null;
    var hostVisible = false;
    var startTime = performance.now();
    var frameCount = 0;
    var lastFpsCheck = startTime;

    function resize() {
      var dpr = isMobile ? 1 : maxDprForTier(currentTier);
      var rect = host.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      gl.viewport(0, 0, canvas.width, canvas.height);
    }

    function downgradeIfNeeded() {
      if (lockedTier) return;
      var idx = TIER_ORDER.indexOf(currentTier);
      var next = TIER_ORDER[idx + 1];
      if (!next) return;
      console.info('shader-bg: dropping quality from ' + currentTier + ' → ' + next + ' due to low FPS');
      currentTier = next;
      resize();
      frameCount = 0;
      lastFpsCheck = performance.now();
    }

    function checkFps() {
      var now = performance.now();
      var elapsed = now - lastFpsCheck;
      if (elapsed >= FPS_WINDOW_MS) {
        var fps = (frameCount * 1000) / elapsed;
        if (fps < FPS_THRESHOLD) downgradeIfNeeded();
        frameCount = 0;
        lastFpsCheck = now;
      }
    }

    function render() {
      var time = (performance.now() - startTime) / 1000.0;

      // Read live config (playground may have mutated baseSettings since last frame).
      var live = window.HeroShader.config;
      var activeLfos = window.HeroShader.lfos || lfos;

      var modulated = applyLfos(live, time, activeLfos);
      var tiered = applyTier(modulated, currentTier);

      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(program);
      gl.uniform2f(loc.resolution, canvas.width, canvas.height);
      gl.uniform1f(loc.time, time);
      uploadUniforms(gl, loc, tiered);

      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.vertexAttribPointer(loc.aPosition, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(loc.aPosition);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      frameCount++;
      checkFps();

      animationId = requestAnimationFrame(render);
    }

    function startRendering() {
      if (!animationId && hostVisible && !document.hidden) {
        startTime = performance.now();
        lastFpsCheck = startTime;
        frameCount = 0;
        render();
      }
    }

    function stopRendering() {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
    }

    resize();

    if (typeof ResizeObserver !== 'undefined') {
      new ResizeObserver(resize).observe(host);
    } else {
      window.addEventListener('resize', resize);
    }

    var observer = new IntersectionObserver(function(entries) {
      hostVisible = entries[0].isIntersecting;
      if (hostVisible) startRendering();
      else stopRendering();
    }, { threshold: 0 });

    observer.observe(host);

    document.addEventListener('visibilitychange', function() {
      if (document.hidden) stopRendering();
      else startRendering();
    });

    window.addEventListener('beforeunload', function() {
      if (animationId) cancelAnimationFrame(animationId);
      var ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
    });

    // Kick off auto-cycle if data-shader-cycle was present.
    if (cycleConfig) startAutoCycle(cycleConfig);
  }

  window.HeroShader = window.HeroShader || {};
  window.HeroShader.mount = init;
  window.HeroShader.destroy = function (host) {
    if (!host) return;
    var canvas = host.querySelector('.shader-canvas');
    if (canvas) canvas.remove();
    host.classList.remove('shader-active');
  };

  // Auto-init for plain HTML pages. React sets window.__HERO_SHADER_MANUAL__ = true first.
  if (!window.__HERO_SHADER_MANUAL__) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function () { init(); });
    } else {
      init();
    }
  }
})();
