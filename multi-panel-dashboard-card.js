/**
 * Multi-Panel Dashboard Card
 * Unified single card: header + cameras + sections + devices (mower) + salt + power
 * Author: robman2026
 * GitHub: https://github.com/robman2026/multi-panel-dashboard-card
 * Version: 3.2.0
 * License: MIT
 *
 * ─────────────────────────────────────────────────────────────────────────
 * v3.2.0
 *  + Frosted Glass Dark Mode (default theme only)
 *      · New config keys: frosted_glass (bool), frosted_opacity (0.1–0.9),
 *        frosted_blur (4–40 px)
 *      · OFF by default — zero visual change for existing configs
 *      · When ON: card background + ALL inner tiles (switch, sensor, gauge,
 *        salt, power, mower, camera) use backdrop-filter blur + translucent bg
 *      · Ignored when theme is cyberpunk / luxury / neon
 *      · New "🎨 Appearance" accordion section added to visual editor
 * ─────────────────────────────────────────────────────────────────────────
 * v3.1.0 / v3.0.0 — see previous changelog entries
 * ─────────────────────────────────────────────────────────────────────────
 */

const CARD_VERSION = "3.3.0";

const LitElement = Object.getPrototypeOf(customElements.get("ha-panel-lovelace"));
const html = LitElement.prototype.html;
const css  = LitElement.prototype.css;

// ════════════════════════════════════════════════════════════════════════════
// MDI icon path constants for inline SVG rendering
// ════════════════════════════════════════════════════════════════════════════
const MDI = {
  camera:      'M17 10.5V7a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h12a1 1 0 001-1v-3.5l4 4v-11l-4 4z',
  monitor:     'M20 3H4a1 1 0 00-1 1v13a1 1 0 001 1h7v2H8v2h8v-2h-3v-2h7a1 1 0 001-1V4a1 1 0 00-1-1zm-1 13H5V5h14v11z',
  motion:      'M13.5 5.5a2 2 0 11-4 0 2 2 0 014 0zM10 21l1.5-8-2.5 1v4h-2v-5.5l5-2.5c.75-.3 1.6-.1 2.15.45L16.5 13l3 1v2l-4-1-3-3-1 4h2l4 5h-2l-3.5-4.5L10 21z',
  bulb:        'M9 21h6m-3-3v3M12 3a6 6 0 016 6c0 2.22-1.21 4.16-3 5.2V17H9v-2.8A6 6 0 016 9a6 6 0 016-6z',
  home:        'M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2zm6 11V12h6v8',
  door:        'M8 3h8a2 2 0 012 2v16H6V5a2 2 0 012-2zm4 9a1 1 0 100-2 1 1 0 000 2z',
  server:      'M20 3H4a1 1 0 00-1 1v4a1 1 0 001 1h16a1 1 0 001-1V4a1 1 0 00-1-1zm0 8H4a1 1 0 00-1 1v4a1 1 0 001 1h16a1 1 0 001-1v-4a1 1 0 00-1-1z',
  thermometer: 'M15 13V5a3 3 0 00-6 0v8a5 5 0 106 0zm-3 7a3 3 0 110-6 3 3 0 010 6z',
  water:       'M12 2c-5.33 4.55-8 8.48-8 11.8a8 8 0 0016 0c0-3.32-2.67-7.25-8-11.8z',
  salt:        'M12 2a10 10 0 100 20A10 10 0 0012 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z',
  person:      'M12 4a4 4 0 014 4 4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 014-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4z',
  switch_icon: 'M17 6H7c-3.31 0-6 2.69-6 6s2.69 6 6 6h10c3.31 0 6-2.69 6-6s-2.69-6-6-6zm0 10a4 4 0 010-8 4 4 0 010 8z',
  warning:     'M12 2L1 21h22L12 2zm0 4l7.5 13h-15L12 6zm-1 4v5h2v-5h-2zm0 6v2h2v-2h-2z',
  sensor:      'M12 2a10 10 0 100 20A10 10 0 0012 2zm0 4a6 6 0 016 6 6 6 0 01-6 6 6 6 0 01-6-6 6 6 0 016-6z',
  bolt:        'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
  vibration:   'M0 11h2v2H0zm4-4h2v10H4zm16 4h2v2h-2zm-4-4h2v10h-2zm-4-3h2v16h-2z',
  tilt:        'M12 2L2 19h20L12 2z',
  lightbulb:   'M9 21h6m-3-3v3M12 3a6 6 0 016 6c0 2.22-1.21 4.16-3 5.2V17H9v-2.8A6 6 0 016 9a6 6 0 016-6z',
  mower:       'M7 17a2 2 0 104 0 2 2 0 00-4 0zm10 0a2 2 0 104 0 2 2 0 00-4 0zM3 9l2-4h10l2 4h2v6H3z',
};

const CATEGORY_ICON = {
  camera: 'camera', switch: 'switch_icon', door: 'door', motion: 'motion',
  light: 'lightbulb', person: 'person', server: 'server', vibration: 'vibration',
  tilt: 'tilt', sensor: 'sensor', temp: 'thermometer', humidity: 'water', salt: 'salt',
};

function mdiIcon(name, color, size) {
  color = color || 'rgba(255,255,255,.38)';
  size  = size  || 18;
  const path = MDI[name] || MDI.sensor;
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 24 24" fill="none" stroke="' + color + '" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="' + path + '"/></svg>';
}

function renderIcon(iconName, color, size) {
  if (!iconName) return mdiIcon('sensor', color, size);
  size = size || 18;
  color = color || 'rgba(255,255,255,.38)';
  if (iconName.includes(':')) {
    return '<ha-icon icon="' + iconName + '" style="color:' + color + ';--mdc-icon-size:' + size + 'px;display:inline-flex;align-items:center;justify-content:center;width:' + size + 'px;height:' + size + 'px;"></ha-icon>';
  }
  if (MDI[iconName]) return mdiIcon(iconName, color, size);
  return '<ha-icon icon="mdi:' + iconName + '" style="color:' + color + ';--mdc-icon-size:' + size + 'px;display:inline-flex;align-items:center;justify-content:center;width:' + size + 'px;height:' + size + 'px;"></ha-icon>';
}

// ════════════════════════════════════════════════════════════════════════════
// Motion sensor detection
// ════════════════════════════════════════════════════════════════════════════
const MOTION_DC     = ["motion", "occupancy", "presence", "moving"];
const MOTION_ACTIVE = ["on", "detected", "occupied", "home", "moving"];

function isMotionSensor(entityId, deviceClass) {
  if (!entityId) return false;
  if (MOTION_DC.includes((deviceClass || "").toLowerCase())) return true;
  const id = entityId.toLowerCase();
  return id.includes("motion") || id.includes("presence") ||
         id.includes("occupancy") || id.includes("movement") ||
         id.includes("miscare");
}

// ════════════════════════════════════════════════════════════════════════════
// Thresholds
// ════════════════════════════════════════════════════════════════════════════
function colorFromThresholds(value, thresholds) {
  if (!thresholds || !thresholds.length) return '#4fa3e0';
  for (let i = 0; i < thresholds.length; i++) {
    if (value <= thresholds[i].max) return thresholds[i].color;
  }
  return thresholds[thresholds.length - 1].color;
}
function parseTh(raw, fallback) {
  if (Array.isArray(raw)) return raw;
  try { return JSON.parse(raw); } catch (e) { return fallback; }
}
const DEFAULT_THRESHOLDS = {
  temperature: [
    { max: 10,  color: '#4fa3e0' },
    { max: 25,  color: '#6ddb99' },
    { max: 35,  color: '#e0b44f' },
    { max: 999, color: '#e05050' },
  ],
  humidity: [
    { max: 30,  color: '#e0b44f' },
    { max: 60,  color: '#6ddb99' },
    { max: 80,  color: '#e0b44f' },
    { max: 999, color: '#e05050' },
  ],
  salt: [
    { max: 30,  color: '#e05050' },
    { max: 60,  color: '#e0b44f' },
    { max: 999, color: '#6ddb99' },
  ],
  power: [
    { max: 0,    color: 'rgba(255,255,255,.15)' },
    { max: 500,  color: '#6ddb99' },
    { max: 1500, color: '#e0b44f' },
    { max: 9999, color: '#e05050' },
  ],
};

// ════════════════════════════════════════════════════════════════════════════
// State helpers
// ════════════════════════════════════════════════════════════════════════════
function stateVal(hass, id)  { if (!id || !hass) return null; const e = hass.states[id]; return e ? e.state : null; }
function stateNum(hass, id)  { const v = stateVal(hass, id); return v !== null ? (parseFloat(v) || 0) : 0; }
function stateAttr(hass, id, attr) { if (!id || !hass) return undefined; const e = hass.states[id]; return e ? e.attributes[attr] : undefined; }
function isOn(s)      { return s === 'on' || s === 'true' || s === 'home' || s === 'open'; }
function isUnavail(s) { return !s || s === 'unavailable' || s === 'unknown'; }
function stateLabel(s){ if (!s || isUnavail(s)) return '—'; return s.charAt(0).toUpperCase() + s.slice(1); }

function agoStr(lastChanged) {
  if (!lastChanged) return "";
  const diff = Math.floor((Date.now() - new Date(lastChanged).getTime()) / 1000);
  if (diff < 60)    return diff + "s ago";
  if (diff < 3600)  return Math.floor(diff / 60) + "m ago";
  if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
  return Math.floor(diff / 86400) + "d ago";
}

// ════════════════════════════════════════════════════════════════════════════
// SVG builders
// ════════════════════════════════════════════════════════════════════════════
function gaugeSVG(size, outerPct, outerColor, innerPct, innerColor) {
  const r1 = size * 0.41, r2 = size * 0.32, cx = size / 2;
  const c1 = 2 * Math.PI * r1, c2 = 2 * Math.PI * r2;
  const o1 = c1 * (1 - Math.max(0, Math.min(1, outerPct)));
  const o2 = c2 * (1 - Math.max(0, Math.min(1, innerPct)));
  const oc = outerColor || '#4fa3e0', ic = innerColor || '#6ddb99';
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" style="overflow:visible;display:block">' +
    '<circle cx="' + cx + '" cy="' + cx + '" r="' + r1 + '" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="3.5"/>' +
    '<circle cx="' + cx + '" cy="' + cx + '" r="' + r1 + '" fill="none" stroke="' + oc + '" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="' + c1.toFixed(1) + '" stroke-dashoffset="' + o1.toFixed(1) + '" transform="rotate(-90 ' + cx + ' ' + cx + ')" style="filter:drop-shadow(0 0 4px ' + oc + ')"/>' +
    '<circle cx="' + cx + '" cy="' + cx + '" r="' + r2 + '" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="2.5"/>' +
    '<circle cx="' + cx + '" cy="' + cx + '" r="' + r2 + '" fill="none" stroke="' + ic + '" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="' + c2.toFixed(1) + '" stroke-dashoffset="' + o2.toFixed(1) + '" transform="rotate(-90 ' + cx + ' ' + cx + ')" style="filter:drop-shadow(0 0 3px ' + ic + ')" opacity="0.7"/>' +
    '</svg>';
}

function saltSVG(size, pct, color) {
  const r = size * 0.42, cx = size / 2;
  const c = 2 * Math.PI * r, off = c * (1 - Math.max(0, Math.min(1, pct)));
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" style="overflow:visible;display:block">' +
    '<circle cx="' + cx + '" cy="' + cx + '" r="' + r + '" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="5"/>' +
    '<circle cx="' + cx + '" cy="' + cx + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="5" stroke-linecap="round" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + off.toFixed(1) + '" transform="rotate(-90 ' + cx + ' ' + cx + ')" style="filter:drop-shadow(0 0 4px ' + color + ')"/>' +
    '</svg>';
}

function powerSVG(size, pct, color) {
  const r = size * 0.38, cx = size / 2;
  const full = 2 * Math.PI * r;
  const arc  = full * 0.75;
  const fill = Math.max(0, Math.min(arc, pct * arc));
  return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" style="transform:rotate(-135deg);overflow:visible;display:block">' +
    '<circle cx="' + cx + '" cy="' + cx + '" r="' + r + '" fill="none" stroke="rgba(255,255,255,.06)" stroke-width="4" stroke-dasharray="' + arc.toFixed(1) + ' ' + (full - arc).toFixed(1) + '" stroke-linecap="round"/>' +
    '<circle cx="' + cx + '" cy="' + cx + '" r="' + r + '" fill="none" stroke="' + color + '" stroke-width="4" stroke-dasharray="' + fill.toFixed(1) + ' ' + (full - fill).toFixed(1) + '" stroke-linecap="round" style="filter:drop-shadow(0 0 4px ' + color + ')"/>' +
    '</svg>';
}

// Animated mower SVG
function mowerSVG(state) {
  const isMowing    = state === "mowing";
  const isReturning = state === "returning";
  const isActive    = isMowing || isReturning;
  const isError     = state === "error";
  const isDocked    = state === "docked";
  const opacity     = isDocked ? "0.5" : "1";
  const spinCls     = isMowing ? "mow-spin" : "";
  const bodyFill    = isError ? "#7f1d1d" : "#3d4a52";
  const domeFill    = isError ? "#991b1b" : "#4a5760";
  const stopFill    = isError ? "#fca5a5" : "#dc2626";
  const grassOp     = isActive ? "1" : "0";
  const bladeOp     = isMowing ? "1" : "0";
  const motionOp    = isActive ? "0.18" : "0";

  return '<svg viewBox="0 0 64 48" width="56" height="42" fill="none" xmlns="http://www.w3.org/2000/svg" ' +
         'style="opacity:' + opacity + ';overflow:visible;flex-shrink:0">' +
    '<g opacity="' + grassOp + '">' +
      '<path d="M3 36 C3 29 1 25 1 20" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M3 36 C4 27 7 24 8 19" stroke="#4ade80" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M9 36 C9 28 7 24 6 19" stroke="#22c55e" stroke-width="2" stroke-linecap="round"/>' +
      '<line x1="9" y1="36" x2="64" y2="36" stroke="#fbbf24" stroke-width="0.9" stroke-dasharray="2.5 2" opacity="0.65"/>' +
      '<path d="M55 36 C55 32 54 30 54 28" stroke="#4ade80" stroke-width="1.5" stroke-linecap="round"/>' +
      '<path d="M59 36 C59 32 60 30 61 28" stroke="#22c55e" stroke-width="1.5" stroke-linecap="round"/>' +
      '<path d="M62 36 C62 32 61 30 60 28" stroke="#4ade80" stroke-width="1.4" stroke-linecap="round"/>' +
    '</g>' +
    '<g opacity="' + motionOp + '">' +
      '<line x1="14" y1="27" x2="10" y2="27" stroke="white" stroke-width="1" stroke-linecap="round"/>' +
      '<line x1="14" y1="31" x2="9"  y2="31" stroke="white" stroke-width="1" stroke-linecap="round"/>' +
    '</g>' +
    '<path d="M14 36 Q14 24 20 22 L52 22 Q58 22 58 30 L58 36 Z" fill="' + bodyFill + '" opacity="0.98"/>' +
    '<path d="M18 22 Q18 15 26 14 L48 14 Q56 14 56 20 L56 22 L18 22 Z" fill="' + domeFill + '" opacity="0.95"/>' +
    '<path d="M20 18 L52 18" stroke="rgba(255,255,255,0.08)" stroke-width="0.8"/>' +
    '<rect x="22" y="14" width="7" height="3.5" rx="1.5" fill="' + stopFill + '" opacity="0.95"/>' +
    '<rect x="22.5" y="14.5" width="6" height="1.5" rx="0.8" fill="#ef4444" opacity="0.6"/>' +
    '<circle cx="50" cy="29" r="5" fill="#1a1f35" stroke="rgba(255,255,255,0.2)" stroke-width="0.8"/>' +
    '<line x1="47.5" y1="26.5" x2="47.5" y2="31.5" stroke="white" stroke-width="1.4" stroke-linecap="round" opacity="0.9"/>' +
    '<line x1="52.5" y1="26.5" x2="52.5" y2="31.5" stroke="white" stroke-width="1.4" stroke-linecap="round" opacity="0.9"/>' +
    '<line x1="47.5" y1="29"   x2="52.5" y2="29"   stroke="white" stroke-width="1.2" stroke-linecap="round" opacity="0.9"/>' +
    '<circle cx="22" cy="36" r="9" fill="#2d3748"/>' +
    '<circle cx="22" cy="36" r="7.5" fill="#1a202c"/>' +
    '<g class="' + spinCls + '" style="transform-origin:22px 36px">' +
      '<line x1="22" y1="28.5" x2="22" y2="43.5" stroke="rgba(255,255,255,0.25)" stroke-width="1.2"/>' +
      '<line x1="14.5" y1="36" x2="29.5" y2="36" stroke="rgba(255,255,255,0.25)" stroke-width="1.2"/>' +
      '<line x1="16.7" y1="30.7" x2="27.3" y2="41.3" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>' +
      '<line x1="27.3" y1="30.7" x2="16.7" y2="41.3" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>' +
    '</g>' +
    '<circle cx="22" cy="36" r="3" fill="#4a5568"/>' +
    '<circle cx="22" cy="36" r="1.5" fill="rgba(255,255,255,0.3)"/>' +
    '<circle cx="50" cy="36" r="9" fill="#2d3748"/>' +
    '<circle cx="50" cy="36" r="7.5" fill="#1a202c"/>' +
    '<g class="' + spinCls + '" style="transform-origin:50px 36px">' +
      '<line x1="50" y1="28.5" x2="50" y2="43.5" stroke="rgba(255,255,255,0.28)" stroke-width="1.2"/>' +
      '<line x1="42.5" y1="36" x2="57.5" y2="36" stroke="rgba(255,255,255,0.28)" stroke-width="1.2"/>' +
      '<line x1="44.7" y1="30.7" x2="55.3" y2="41.3" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>' +
      '<line x1="55.3" y1="30.7" x2="44.7" y2="41.3" stroke="rgba(255,255,255,0.18)" stroke-width="1"/>' +
    '</g>' +
    '<circle cx="50" cy="36" r="3" fill="#4a5568"/>' +
    '<circle cx="50" cy="36" r="1.5" fill="rgba(255,255,255,0.3)"/>' +
    '<ellipse cx="35" cy="37.5" rx="3" ry="2" fill="#2d3748"/>' +
    '<g opacity="' + bladeOp + '">' +
      '<circle cx="36" cy="37" r="3.5" fill="rgba(34,197,94,0.08)" stroke="rgba(34,197,94,0.3)" stroke-width="0.8"/>' +
      '<g class="mow-spin-fast" style="transform-origin:36px 37px">' +
        '<line x1="32.5" y1="37" x2="39.5" y2="37" stroke="#22c55e" stroke-width="1" stroke-linecap="round"/>' +
        '<line x1="36" y1="33.5" x2="36" y2="40.5" stroke="#22c55e" stroke-width="1" stroke-linecap="round"/>' +
      '</g>' +
    '</g>' +
  '</svg>';
}

// ════════════════════════════════════════════════════════════════════════════
// Salt % calc
// ════════════════════════════════════════════════════════════════════════════
function calcSaltPct(hass, cfg) {
  if (cfg.salt_pct_entity && hass) {
    const pct = stateNum(hass, cfg.salt_pct_entity);
    if (pct > 1) return Math.min(pct, 100) / 100;
    return Math.min(Math.max(pct, 0), 1);
  }
  if (cfg.salt_entity && hass) {
    const val = stateNum(hass, cfg.salt_entity);
    if (val > 1) return Math.min(val, 100) / 100;
    return Math.min(Math.max(val, 0), 1);
  }
  return 0;
}

// ════════════════════════════════════════════════════════════════════════════
// Device-type registry
// ════════════════════════════════════════════════════════════════════════════
const DEVICE_TYPES = {
  mower: {
    label: 'Mower',
    emoji: '🤖',
    domains: ['lawn_mower', 'vacuum'],
    fields: [
      { key: 'entity',         label: 'Mower Entity',   type: 'entity', domains: ['lawn_mower','vacuum'] },
      { key: 'battery_entity', label: 'Battery Entity', type: 'entity', domains: ['sensor'], deviceClass: 'battery' },
      { key: 'label',          label: 'Display Name',   type: 'text' },
    ],
    badges: {
      mowing:    { label: "Mowing",    color: "#22c55e", bg: "rgba(34,197,94,0.15)"   },
      docked:    { label: "Docked",    color: "#60a5fa", bg: "rgba(99,179,237,0.15)"  },
      paused:    { label: "Paused",    color: "#a855f7", bg: "rgba(168,85,247,0.15)"  },
      returning: { label: "Returning", color: "#fbbf24", bg: "rgba(251,191,36,0.15)"  },
      error:     { label: "Error",     color: "#ef4444", bg: "rgba(239,68,68,0.18)"   },
    },
  },
};

// ════════════════════════════════════════════════════════════════════════════
// Stub (default) config
// ════════════════════════════════════════════════════════════════════════════
function getStubConfig() {
  return {
    // Theme
    theme: 'default',
    neon_color: 'cyan',

    // ── NEW: Frosted Glass (default theme only) ──────────────────────────────
    frosted_glass:   false,
    frosted_opacity: 0.52,
    frosted_blur:    22,

    // Header
    card_title:      'Dashboard',
    card_icon:       'mdi:view-dashboard',
    title_position:  'left',
    show_datetime:   true,
    show_status_dot: false,
    status_entity:   '',

    // Cameras
    cameras:          [],
    cameras_columns:  3,

    // Switches
    switches:         [],
    switches_columns: 2,

    // Sensors
    sensors:          [],
    sensors_columns:  2,

    // Climate gauges
    gauges:           [],
    gauges_columns:   2,

    // Power
    power_circuits:   [],
    power_columns:    2,

    // Salt
    salt_entity: '', salt_pct_entity: '', salt_max_entity: '', salt_max_value: '',
    salt_label: 'Salt Level', salt_warn_threshold: 30,
    salt_thresholds: JSON.stringify(DEFAULT_THRESHOLDS.salt),

    // Devices section
    devices: {
      mower: {
        enabled: false,
        entity: '',
        battery_entity: '',
        label: '',
      },
    },

    // Section labels
    label_surveillance: 'Surveillance',
    label_switches:     'Switches',
    label_sensors:      'Sensors',
    label_climate:      'Climate',
    label_devices:      'Devices',
    label_salt:         'Salt Level',
    label_power:        'Power',
  };
}

// ════════════════════════════════════════════════════════════════════════════
// CSS (card runtime)
// ════════════════════════════════════════════════════════════════════════════
const STYLES = [
  "@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');",
  ":host{display:block;font-family:'DM Sans',sans-serif;}",
  "*{box-sizing:border-box;margin:0;padding:0}",

  "ha-card{background:transparent!important;box-shadow:none!important;border:none!important;border-radius:0!important;}",
  ":host{display:block;font-family:var(--mpd-font,'DM Sans',sans-serif);}",
  ".mpd-card{background:var(--mpd-card-bg,linear-gradient(145deg,#1a1f35,#0f1628,#141929));border-radius:var(--mpd-radius,16px);border:1px solid var(--mpd-border,rgba(99,179,237,0.15));box-shadow:var(--mpd-glow,0 0 0 1px rgba(255,255,255,0.04),0 8px 32px rgba(0,0,0,0.6),0 0 60px rgba(99,179,237,0.05));padding:18px;position:relative;overflow:hidden;}",
  ".mpd-inner{width:100%;position:relative;z-index:1;}",
  ".mpd-card::before{content:'';position:absolute;width:300px;height:300px;border-radius:50%;top:-100px;right:-80px;background:var(--mpd-blob-color,#4fa3e0);filter:blur(80px);opacity:.06;pointer-events:none;}",

  // ── Frosted glass overrides (default theme only, activated by .mpd-frosted) ──
  // Card shell
  ".mpd-frosted{background:var(--mpd-fg-bg,rgba(8,14,30,0.52))!important;backdrop-filter:blur(var(--mpd-fg-blur,22px)) saturate(180%)!important;-webkit-backdrop-filter:blur(var(--mpd-fg-blur,22px)) saturate(180%)!important;border:1px solid rgba(255,255,255,0.09)!important;box-shadow:0 8px 40px rgba(0,0,0,0.55),inset 0 1px 0 rgba(255,255,255,0.07)!important;}",
  // Suppress the blob decoration so it doesn't bleed through the glass
  ".mpd-frosted::before{display:none!important;}",
  // All tile types in frosted mode
  ".mpd-frosted .sw-tile{background:rgba(255,255,255,0.05)!important;backdrop-filter:blur(var(--mpd-fg-blur,22px))!important;-webkit-backdrop-filter:blur(var(--mpd-fg-blur,22px))!important;border-color:rgba(255,255,255,0.1)!important;}",
  ".mpd-frosted .sw-tile:hover{background:rgba(255,255,255,0.09)!important;}",
  ".mpd-frosted .sw-tile.sw-on{background:rgba(79,163,224,0.12)!important;border-color:rgba(79,163,224,0.28)!important;}",
  ".mpd-frosted .sw-tile.sw-motion{background:rgba(255,170,80,0.12)!important;border-color:rgba(255,170,80,0.28)!important;}",
  ".mpd-frosted .sensor-tile{background:rgba(255,255,255,0.05)!important;backdrop-filter:blur(var(--mpd-fg-blur,22px))!important;-webkit-backdrop-filter:blur(var(--mpd-fg-blur,22px))!important;border-color:rgba(255,255,255,0.1)!important;}",
  ".mpd-frosted .sensor-tile:hover{background:rgba(255,255,255,0.09)!important;}",
  ".mpd-frosted .sensor-tile.motion-active{background:rgba(255,170,80,0.12)!important;border-color:rgba(255,170,80,0.28)!important;}",
  ".mpd-frosted .gauge-tile{background:rgba(255,255,255,0.05)!important;backdrop-filter:blur(var(--mpd-fg-blur,22px))!important;-webkit-backdrop-filter:blur(var(--mpd-fg-blur,22px))!important;border-color:rgba(255,255,255,0.1)!important;}",
  ".mpd-frosted .gauge-tile:hover{background:rgba(255,255,255,0.09)!important;}",
  ".mpd-frosted .salt-tile{background:rgba(255,255,255,0.05)!important;backdrop-filter:blur(var(--mpd-fg-blur,22px))!important;-webkit-backdrop-filter:blur(var(--mpd-fg-blur,22px))!important;border-color:rgba(255,255,255,0.1)!important;}",
  ".mpd-frosted .salt-tile:hover{background:rgba(255,255,255,0.09)!important;}",
  ".mpd-frosted .power-tile{background:rgba(255,255,255,0.05)!important;backdrop-filter:blur(var(--mpd-fg-blur,22px))!important;-webkit-backdrop-filter:blur(var(--mpd-fg-blur,22px))!important;border-color:rgba(255,255,255,0.1)!important;}",
  ".mpd-frosted .power-tile:hover{background:rgba(255,255,255,0.09)!important;}",
  ".mpd-frosted .mower-tile{background:rgba(34,197,94,0.07)!important;backdrop-filter:blur(var(--mpd-fg-blur,22px))!important;-webkit-backdrop-filter:blur(var(--mpd-fg-blur,22px))!important;border-color:rgba(34,197,94,0.18)!important;}",
  ".mpd-frosted .mower-tile.st-error{background:rgba(239,68,68,0.07)!important;border-color:rgba(239,68,68,0.22)!important;}",
  ".mpd-frosted .mower-tile.st-docked{background:rgba(99,179,237,0.06)!important;border-color:rgba(99,179,237,0.18)!important;}",
  ".mpd-frosted .cam-tile{background:rgba(5,10,22,0.55)!important;backdrop-filter:blur(var(--mpd-fg-blur,22px))!important;-webkit-backdrop-filter:blur(var(--mpd-fg-blur,22px))!important;border-color:rgba(255,255,255,0.1)!important;}",
  ".mpd-frosted .cam-placeholder{background:rgba(5,10,22,0.55)!important;}",

  // Header
  ".mpd-header{display:flex;align-items:center;gap:10px;padding:0 0 14px;margin-bottom:14px;border-bottom:1px solid var(--mpd-header-sep,rgba(255,255,255,.05));position:relative;}",
  ".mpd-header.pos-left{justify-content:space-between;}",
  ".mpd-header.pos-center{justify-content:space-between;}",
  ".mpd-header.pos-center .mpd-title-wrap{position:absolute;left:50%;transform:translateX(-50%);}",
  ".mpd-title-wrap{display:flex;align-items:center;gap:8px;min-width:0;}",
  ".mpd-title-icon{color:var(--mpd-text-dim,rgba(255,255,255,.45));display:flex;align-items:center;flex-shrink:0;}",
  ".mpd-title-icon ha-icon{--mdc-icon-size:20px;}",
  ".mpd-title{font-size:16px;font-weight:700;letter-spacing:1.4px;color:var(--mpd-title-color,#fff);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
  ".mpd-head-spacer{flex:1;}",
  ".mpd-head-right{display:flex;align-items:center;gap:10px;flex-shrink:0;}",
  ".mpd-datetime{display:flex;flex-direction:column;align-items:flex-end;gap:1px;}",
  ".mpd-date{font-size:12px;font-weight:600;color:var(--mpd-date-color,rgba(255,255,255,.75));letter-spacing:.5px;}",
  ".mpd-time{font-size:11px;font-weight:400;color:var(--mpd-time-color,rgba(255,255,255,.4));letter-spacing:1px;font-family:'DM Mono',monospace;}",
  ".mpd-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0;}",
  ".mpd-dot.online{background:#34d399;box-shadow:0 0 8px rgba(52,211,153,.8);animation:pulse-dot 2s ease-in-out infinite;}",
  ".mpd-dot.offline{background:#6b7280;}",
  "@keyframes pulse-dot{0%,100%{opacity:1;box-shadow:0 0 8px rgba(52,211,153,.8);}50%{opacity:.6;box-shadow:0 0 14px rgba(52,211,153,.4);}}",

  // Section headers
  ".sec{font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:var(--mpd-sec-text,rgba(255,255,255,.9));font-weight:500;margin-bottom:9px;display:flex;align-items:center;gap:5px;white-space:nowrap;overflow:hidden;}",
  ".sec-dot{width:6px;height:6px;border-radius:50%;flex-shrink:0;}",
  ".divider{height:1px;background:var(--mpd-divider,rgba(255,255,255,.05));margin:14px 0;}",

  // Cameras
  ".cam-strip{display:grid;gap:8px;}",
  ".cam-tile{border-radius:11px;overflow:hidden;background:var(--mpd-cam-bg,#090d1a);border:1px solid var(--mpd-border,rgba(255,255,255,.07));position:relative;cursor:pointer;transition:border-color .2s;min-height:90px;}",
  ".cam-tile:hover{border-color:rgba(79,163,224,.35);}",
  "mpd-cam-stream{display:block;width:100%;}",
  ".cam-placeholder{width:100%;min-height:90px;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0d1220,#111827);}",

  // Bottom grid
  ".bottom-grid{display:grid;gap:12px;grid-template-columns:repeat(var(--mpd-cols,4),minmax(0,1fr));}",
  ".mpd-inner.bp-sm .bottom-grid{grid-template-columns:repeat(2,minmax(0,1fr));}",
  ".mpd-inner.bp-sm .cam-tile,.mpd-inner.bp-xs .cam-tile{min-height:0;}",
  ".mpd-inner.bp-xs .bottom-grid{grid-template-columns:repeat(1,minmax(0,1fr));}",
  ".mpd-inner.bp-sm .sec{letter-spacing:.06em;font-size:8px;}",
  ".sec-col{min-width:0;}",

  // Switches
  ".sw-grid{display:grid;gap:5px;min-width:0;}",
  ".sw-tile{background:var(--mpd-tile-bg,rgba(255,255,255,.03));border:1px solid var(--mpd-tile-border,rgba(255,255,255,.05));border-radius:9px;padding:10px 6px;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:pointer;transition:background .15s,border-color .15s,transform .1s;}",
  ".sw-tile:hover{background:var(--mpd-tile-hover,rgba(255,255,255,.06));}",
  ".sw-tile:active{transform:scale(.97);}",
  ".sw-tile.sw-on{background:rgba(79,163,224,.07);border-color:rgba(79,163,224,.2);}",
  ".sw-tile.sw-motion{background:rgba(255,170,80,.07);border-color:rgba(255,170,80,.2);}",
  ".sw-tile.sw-unavail{opacity:.35;pointer-events:none;}",
  ".sw-name{font-size:9px;font-weight:500;color:var(--mpd-text-dim,rgba(255,255,255,.75));text-align:center;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:100%;}",
  ".sw-state{font-size:8px;letter-spacing:.06em;text-transform:uppercase;font-family:'DM Mono',monospace;color:rgba(255,255,255,.28);}",
  ".sw-state.s-on{color:#6dbfff;}.sw-state.s-motion{color:#ffaa6d;}.sw-state.s-open{color:#ffd26d;}",

  // Sensors (with motion icon treatment)
  ".sensor-grid{display:grid;gap:5px;min-width:0;}",
  ".sensor-grid.scols-1 .sensor-tile{flex-direction:row;padding:7px 9px;text-align:left;gap:8px;}",
  ".sensor-grid.scols-1 .sensor-name{flex:1;text-align:left;}",
  ".sensor-grid.scols-2 .sensor-tile,.sensor-grid.scols-3 .sensor-tile,.sensor-grid.scols-4 .sensor-tile{flex-direction:column;padding:8px 4px;text-align:center;}",
  ".sensor-tile{background:var(--mpd-tile-bg,rgba(255,255,255,.03));border:1px solid var(--mpd-tile-border,rgba(255,255,255,.05));border-radius:9px;display:flex;align-items:center;gap:4px;cursor:pointer;transition:background .15s;min-width:0;overflow:hidden;}",
  ".sensor-tile:hover{background:var(--mpd-tile-hover,rgba(255,255,255,.06));}",
  ".sensor-tile.motion-active{background:rgba(255,170,80,.08);border-color:rgba(255,170,80,.22);}",
  ".sensor-icon-wrap{width:26px;height:26px;border-radius:7px;display:flex;align-items:center;justify-content:center;background:rgba(255,255,255,.04);flex-shrink:0;}",
  ".sensor-icon-wrap.motion-active{background:rgba(255,170,80,.12);animation:motion-pulse 1.4s ease-in-out infinite;}",
  ".sensor-icon-wrap.motion-clear{background:rgba(255,255,255,.04);}",
  "@keyframes motion-pulse{0%,100%{box-shadow:0 0 0 0 rgba(255,170,80,.35);}50%{box-shadow:0 0 0 5px rgba(255,170,80,0);}}",
  ".motion-emoji{font-size:14px;line-height:1;}",
  ".motion-emoji.clear{filter:grayscale(0) opacity(.9);}",
  ".sensor-name{font-size:8px;color:var(--mpd-text-dim,rgba(255,255,255,.7));white-space:nowrap;overflow:hidden;text-overflow:ellipsis;width:100%;min-width:0;}",
  ".sensor-val{font-size:9px;font-weight:500;font-family:'DM Mono',monospace;color:rgba(255,255,255,.8);flex-shrink:0;min-width:0;}",
  ".sv-on{color:#6dbfff;}.sv-open{color:#ffd26d;}.sv-motion{color:#ff8a6d;}.sv-off{color:rgba(255,255,255,.7);}",

  // Gauges
  ".gauge-grid{display:grid;gap:7px;min-width:0;}",
  ".gauge-grid.gcols-1 .gauge-tile{flex-direction:row;}.gauge-grid.gcols-1 .g-name{text-align:left;}",
  ".gauge-grid.gcols-2 .gauge-tile,.gauge-grid.gcols-3 .gauge-tile{flex-direction:column;align-items:center;}",
  ".gauge-grid.gcols-2 .g-name,.gauge-grid.gcols-3 .g-name{text-align:center;}",
  ".gauge-tile{background:var(--mpd-tile-bg,rgba(255,255,255,.03));border:1px solid var(--mpd-tile-border,rgba(255,255,255,.06));border-radius:11px;padding:10px 8px;display:flex;align-items:center;gap:8px;cursor:pointer;transition:background .15s;min-width:0;overflow:hidden;}",
  ".gauge-tile:hover{background:var(--mpd-tile-hover,rgba(255,255,255,.06));}",
  ".gauge-wrap{position:relative;flex-shrink:0;width:54px;height:54px;}",
  ".gauge-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none;}",
  ".g-val{font-size:12px;font-weight:600;display:block;line-height:1.15;font-family:'DM Mono',monospace;}",
  ".g-sub{font-size:8px;display:block;margin-top:1px;font-family:'DM Mono',monospace;}",
  ".g-name{font-size:9px;letter-spacing:.06em;text-transform:uppercase;color:var(--mpd-text-dim,rgba(255,255,255,.8));overflow:hidden;text-overflow:ellipsis;white-space:nowrap;width:100%;}",

  // Salt
  ".salt-tile{background:var(--mpd-tile-bg,rgba(255,255,255,.03));border:1px solid var(--mpd-tile-border,rgba(255,255,255,.06));border-radius:11px;padding:10px 12px;display:flex;align-items:center;gap:12px;cursor:pointer;transition:background .15s;min-width:0;overflow:hidden;}",
  ".salt-tile:hover{background:var(--mpd-tile-hover,rgba(255,255,255,.06));}",
  ".salt-wrap{position:relative;flex-shrink:0;width:60px;height:60px;}",
  ".salt-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;pointer-events:none;}",
  ".s-val{font-size:11px;font-weight:600;color:rgba(255,255,255,.9);font-family:'DM Mono',monospace;display:block;line-height:1.1;}",
  ".s-pct{font-size:8px;color:rgba(255,255,255,.38);display:block;}",
  ".salt-info{flex:1;min-width:0;overflow:hidden;}",
  ".salt-title{font-size:9px;font-weight:500;letter-spacing:.07em;text-transform:uppercase;color:var(--mpd-text-dim,rgba(255,255,255,.8));margin-bottom:5px;}",
  ".salt-bar-wrap{background:rgba(255,255,255,.06);border-radius:3px;height:3px;overflow:hidden;margin-bottom:4px;}",
  ".salt-bar{height:3px;border-radius:3px;transition:width .6s;}",
  ".salt-meta{font-size:8px;color:rgba(255,255,255,.5);font-family:'DM Mono',monospace;}",
  ".salt-warn{font-size:8px;color:#ffd26d;margin-top:3px;display:flex;align-items:center;gap:3px;}",

  // Power
  ".power-grid{display:grid;gap:7px;min-width:0;}",
  ".power-grid.pcols-1 .power-tile{flex-direction:row;}.power-grid.pcols-1 .power-name{text-align:left;}",
  ".power-grid.pcols-2 .power-tile,.power-grid.pcols-3 .power-tile{flex-direction:column;align-items:center;}",
  ".power-grid.pcols-2 .power-name,.power-grid.pcols-3 .power-name{text-align:center;}",
  ".power-tile{background:var(--mpd-tile-bg,rgba(255,255,255,.03));border:1px solid var(--mpd-tile-border,rgba(255,255,255,.06));border-radius:11px;padding:10px 8px;display:flex;align-items:center;gap:8px;cursor:pointer;transition:background .15s;min-width:0;overflow:hidden;}",
  ".power-tile:hover{background:var(--mpd-tile-hover,rgba(255,255,255,.06));}",
  ".power-arc-wrap{position:relative;flex-shrink:0;width:52px;height:52px;}",
  ".power-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;}",
  ".p-val{font-size:12px;font-weight:600;color:rgba(255,255,255,.9);font-family:'DM Mono',monospace;line-height:1;}",
  ".p-unit{font-size:7px;color:rgba(255,255,255,.7);letter-spacing:.04em;text-transform:uppercase;}",
  ".power-info{min-width:0;overflow:hidden;}",
  ".power-name{font-size:8px;color:var(--mpd-text-dim,rgba(255,255,255,.8));letter-spacing:.06em;text-transform:uppercase;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
  ".power-subs{display:flex;gap:8px;flex-wrap:wrap;}",
  ".p-sub{display:flex;flex-direction:column;}",
  ".p-sub-val{font-size:9px;font-weight:600;color:rgba(255,255,255,.7);font-family:'DM Mono',monospace;}",
  ".p-sub-lbl{font-size:7px;color:rgba(255,255,255,.7);letter-spacing:.05em;text-transform:uppercase;}",

  // Devices (mower)
  ".devices-wrap{display:flex;flex-direction:column;gap:8px;}",
  ".mower-tile{background:linear-gradient(145deg,rgba(34,197,94,.08),rgba(255,255,255,.03));border:1px solid rgba(34,197,94,.18);border-radius:13px;padding:12px;display:flex;flex-direction:column;gap:10px;}",
  ".mower-tile.st-error{border-color:rgba(239,68,68,.3);background:linear-gradient(145deg,rgba(239,68,68,.08),rgba(255,255,255,.03));}",
  ".mower-tile.st-docked{border-color:rgba(99,179,237,.18);background:linear-gradient(145deg,rgba(99,179,237,.06),rgba(255,255,255,.03));}",
  ".mower-head{display:flex;align-items:center;gap:10px;cursor:pointer;}",
  ".mower-icon-box{width:36px;height:36px;border-radius:9px;background:rgba(34,197,94,.15);border:1px solid rgba(34,197,94,.3);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}",
  ".mower-info{flex:1;min-width:0;}",
  ".mower-name{font-size:12px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}",
  ".mower-status-row{display:flex;align-items:center;gap:6px;margin-top:2px;flex-wrap:wrap;}",
  ".mower-ago{font-size:9px;color:rgba(255,255,255,.45);font-family:'DM Mono',monospace;}",
  ".mower-badge{font-size:9px;font-weight:600;padding:2px 7px;border-radius:10px;letter-spacing:.3px;}",
  ".mower-svg-wrap{flex-shrink:0;}",

  // ── Neon Glow theme ──────────────────────────────────────────────────────────
  "@property --mpd-ba{syntax:'<angle>';initial-value:0deg;inherits:false}",
  "@keyframes mpd-spin{to{--mpd-ba:360deg}}",
  ".mpd-neon-ring{position:relative;border-radius:26px;padding:2px;animation:mpd-spin 4s linear infinite;}",
  ".mpd-neon-ring::before{content:'';position:absolute;inset:0;border-radius:26px;background:conic-gradient(from var(--mpd-ba),transparent 0%,var(--mpd-neon-c1,#00d4ff) 15%,var(--mpd-neon-c2,#ff0080) 35%,var(--mpd-neon-c3,#7c3aed) 55%,transparent 70%);z-index:0;}",
  ".mpd-neon-ring::after{content:'';position:absolute;inset:-8px;border-radius:32px;background:conic-gradient(from var(--mpd-ba),transparent 0%,var(--mpd-neon-c1,#00d4ff) 15%,var(--mpd-neon-c2,#ff0080) 40%,transparent 70%);filter:blur(18px);opacity:.45;z-index:-1;}",
  ".mpd-neon-ring .mpd-card{position:relative;z-index:1;border:none!important;box-shadow:none!important;border-radius:24px;backdrop-filter:blur(20px);}",

  // Tile neon styles
  ":host(.mpd-neon-host) .sw-tile{border-color:rgba(255,255,255,.1);transition:box-shadow .2s,border-color .2s,background .15s;}",
  ":host(.mpd-neon-host) .sw-tile:hover{border-color:var(--mpd-neon-c1,#00d4ff);box-shadow:0 0 10px rgba(0,212,255,.25);}",
  ":host(.mpd-neon-host) .sw-tile.sw-on{background:rgba(0,212,255,.08);border-color:var(--mpd-neon-c1,#00d4ff);box-shadow:0 0 12px rgba(0,212,255,.3);}",
  ":host(.mpd-neon-host) .sw-tile.sw-motion{background:rgba(255,45,120,.08);border-color:var(--mpd-neon-c2,#ff0080);box-shadow:0 0 12px rgba(255,45,120,.3);}",
  ":host(.mpd-neon-host) .sensor-tile{border-color:rgba(255,255,255,.08);transition:box-shadow .2s,border-color .2s;}",
  ":host(.mpd-neon-host) .sensor-tile:hover{border-color:var(--mpd-neon-c1,#00d4ff);box-shadow:0 0 10px rgba(0,212,255,.2);}",
  ":host(.mpd-neon-host) .sensor-tile.motion-active{background:rgba(0,212,255,.08);border-color:var(--mpd-neon-c1,#00d4ff);box-shadow:0 0 14px rgba(0,212,255,.35);}",
  ":host(.mpd-neon-host) .gauge-tile{border-color:rgba(255,255,255,.08);transition:box-shadow .2s;}",
  ":host(.mpd-neon-host) .gauge-tile:hover{border-color:var(--mpd-neon-c1,#00d4ff);box-shadow:0 0 12px rgba(0,212,255,.2);}",
  ":host(.mpd-neon-host) .salt-tile{border-color:rgba(255,255,255,.08);}",
  ":host(.mpd-neon-host) .power-tile{border-color:rgba(255,255,255,.08);transition:box-shadow .2s;}",
  ":host(.mpd-neon-host) .power-tile:hover{border-color:var(--mpd-neon-c1,#00d4ff);box-shadow:0 0 10px rgba(0,212,255,.2);}",
  ":host(.mpd-neon-host) .sensor-icon-wrap{border:1px solid rgba(255,255,255,.06);}",
  ":host(.mpd-neon-host) .sensor-icon-wrap.motion-active{border-color:var(--mpd-neon-c1,#00d4ff);box-shadow:0 0 8px rgba(0,212,255,.4);}",
  ":host(.mpd-neon-host) .mpd-dot.online{background:var(--mpd-neon-c1,#00d4ff);box-shadow:0 0 12px var(--mpd-neon-c1,#00d4ff);}",
  ":host(.mpd-neon-host) .sec-dot{filter:drop-shadow(0 0 4px currentColor);}",
  ":host(.mpd-neon-host) .cam-tile{border-color:rgba(255,255,255,.08);transition:border-color .2s,box-shadow .2s;}",
  ":host(.mpd-neon-host) .cam-tile:hover{border-color:var(--mpd-neon-c1,#00d4ff);box-shadow:0 0 14px rgba(0,212,255,.3);}",

  "@keyframes mow-spin{from{transform:rotate(0);}to{transform:rotate(360deg);}}",
  "@keyframes mow-spin-fast{from{transform:rotate(0);}to{transform:rotate(360deg);}}",
  ".mow-spin{animation:mow-spin 1.8s linear infinite;}",
  ".mow-spin-fast{animation:mow-spin-fast .4s linear infinite;}",
  ".mower-batt{display:flex;align-items:center;gap:8px;}",
  ".mower-batt-ico{font-size:13px;}",
  ".mower-batt-track{flex:1;height:6px;background:rgba(255,255,255,.08);border-radius:4px;overflow:hidden;}",
  ".mower-batt-fill{height:100%;border-radius:4px;transition:width .6s;}",
  ".mower-batt-pct{font-size:11px;font-weight:600;font-family:'DM Mono',monospace;min-width:34px;text-align:right;}",
  ".mower-btns{display:flex;gap:6px;}",
  ".mower-btn{flex:1;padding:7px 8px;font-size:10px;font-weight:600;border:1px solid rgba(255,255,255,.1);border-radius:7px;background:rgba(255,255,255,.03);color:rgba(255,255,255,.75);cursor:pointer;transition:all .15s;letter-spacing:.3px;}",
  ".mower-btn:hover{background:rgba(79,163,224,.1);border-color:rgba(79,163,224,.3);color:#6dbfff;}",
  ".mower-btn.primary{background:rgba(34,197,94,.08);border-color:rgba(34,197,94,.25);color:#6ddb99;}",
  ".mower-btn.primary:hover{background:rgba(34,197,94,.18);border-color:rgba(34,197,94,.4);color:#4ade80;}",

  // ── Just HA Dashboard design adoption — gated on --user-* tokens (defined
  //    only by the Just HA theme, e.g. Heimdall). Falls back to the card's own
  //    --mpd-* knobs / original look everywhere else. ──
  ".mpd-card.mpd-jha{background:var(--user-glow-amber,radial-gradient(120% 130% at 50% -10%,rgba(224,162,78,.30) 0%,rgba(160,104,43,.10) 38%,rgba(20,20,23,0) 72%)),var(--user-ink-750,#141417)!important;border:1px solid var(--user-line,rgba(255,255,255,.09))!important;border-radius:var(--user-radius-lg,16px)!important;}",
].join('');

// ════════════════════════════════════════════════════════════════════════════
// THEME REGISTRY
// ════════════════════════════════════════════════════════════════════════════
const THEMES = {
  default: {
    label: 'Dark Navy',
    font: null,
    vars: {
      '--mpd-bg':           '#0f1628',
      '--mpd-card-bg':      'linear-gradient(145deg,#1a1f35 0%,#0f1628 50%,#141929 100%)',
      '--mpd-card-bg2':     '#1a1f35',
      '--mpd-border':       'rgba(99,179,237,0.15)',
      '--mpd-border2':      'rgba(99,179,237,0.25)',
      '--mpd-glow':         '0 0 0 1px rgba(255,255,255,0.04),0 8px 32px rgba(0,0,0,0.6),0 0 60px rgba(99,179,237,0.05)',
      '--mpd-accent':       '#63b3ed',
      '--mpd-accent2':      '#90cdf4',
      '--mpd-text':         '#e2e8f0',
      '--mpd-text-dim':     'rgba(255,255,255,.8)',
      '--mpd-text-muted':   'rgba(255,255,255,.45)',
      '--mpd-font':         "'DM Sans',sans-serif",
      '--mpd-radius':       '16px',
      '--mpd-tile-bg':      'rgba(255,255,255,.04)',
      '--mpd-tile-border':  'rgba(255,255,255,.07)',
      '--mpd-tile-hover':   'rgba(255,255,255,.08)',
      '--mpd-divider':      'rgba(255,255,255,.06)',
      '--mpd-header-sep':   'rgba(99,179,237,0.12)',
      '--mpd-sec-text':     'rgba(255,255,255,.9)',
      '--mpd-title-color':  '#fff',
      '--mpd-date-color':   'rgba(255,255,255,.75)',
      '--mpd-time-color':   'rgba(255,255,255,.45)',
      '--mpd-cam-bg':       '#0a0e1a',
      '--mpd-blob-color':   '#63b3ed',
    },
  },
  cyberpunk: {
    label: 'Cyberpunk',
    font: 'https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap',
    vars: {
      '--mpd-bg':           '#05010b',
      '--mpd-card-bg':      '#0c0616',
      '--mpd-card-bg2':     '#110820',
      '--mpd-border':       '#ff00ea55',
      '--mpd-border2':      '#00f7ff55',
      '--mpd-glow':         '0 0 24px #ff00ea44,inset 0 0 10px #00f7ff11',
      '--mpd-accent':       '#00f7ff',
      '--mpd-accent2':      '#ff47f3',
      '--mpd-text':         '#ffffff',
      '--mpd-text-dim':     'rgba(255,255,255,.7)',
      '--mpd-text-muted':   'rgba(255,255,255,.4)',
      '--mpd-font':         "'Orbitron',Arial,sans-serif",
      '--mpd-radius':       '12px',
      '--mpd-tile-bg':      'rgba(255,0,234,.04)',
      '--mpd-tile-border':  '#ff00ea33',
      '--mpd-tile-hover':   'rgba(0,247,255,.07)',
      '--mpd-divider':      '#ff00ea22',
      '--mpd-header-sep':   '#00f7ff22',
      '--mpd-sec-text':     '#00f7ff',
      '--mpd-title-color':  '#00f7ff',
      '--mpd-date-color':   '#ff47f3',
      '--mpd-time-color':   'rgba(0,247,255,.7)',
      '--mpd-cam-bg':       '#060012',
      '--mpd-blob-color':   '#ff00ea',
    },
  },
  luxury: {
    label: 'Luxury',
    font: null,
    vars: {
      '--mpd-bg':           '#f4efe8',
      '--mpd-card-bg':      '#ffffff',
      '--mpd-card-bg2':     '#faf7f3',
      '--mpd-border':       'rgba(0,0,0,.06)',
      '--mpd-border2':      'rgba(0,0,0,.1)',
      '--mpd-glow':         '0 12px 28px rgba(0,0,0,.08)',
      '--mpd-accent':       '#9c6b2f',
      '--mpd-accent2':      '#c4873a',
      '--mpd-text':         '#1d1d1f',
      '--mpd-text-dim':     'rgba(0,0,0,.6)',
      '--mpd-text-muted':   'rgba(0,0,0,.4)',
      '--mpd-font':         "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
      '--mpd-radius':       '24px',
      '--mpd-tile-bg':      '#ffffff',
      '--mpd-tile-border':  'rgba(0,0,0,.06)',
      '--mpd-tile-hover':   'rgba(156,107,47,.06)',
      '--mpd-divider':      'rgba(0,0,0,.07)',
      '--mpd-header-sep':   'rgba(0,0,0,.07)',
      '--mpd-sec-text':     '#1d1d1f',
      '--mpd-title-color':  '#1d1d1f',
      '--mpd-date-color':   'rgba(0,0,0,.6)',
      '--mpd-time-color':   'rgba(0,0,0,.4)',
      '--mpd-cam-bg':       '#f0ebe3',
      '--mpd-blob-color':   '#9c6b2f',
    },
  },
  neon: {
    label: 'Neon Glow',
    font: 'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap',
    neonBorder: true,
    vars: {
      '--mpd-bg':           '#080810',
      '--mpd-card-bg':      'rgba(8,8,16,.95)',
      '--mpd-card-bg2':     'rgba(10,10,24,.97)',
      '--mpd-border':       'transparent',
      '--mpd-border2':      'transparent',
      '--mpd-glow':         'none',
      '--mpd-accent':       '#00d4ff',
      '--mpd-accent2':      '#ff0080',
      '--mpd-text':         '#ffffff',
      '--mpd-text-dim':     'rgba(255,255,255,.7)',
      '--mpd-text-muted':   '#475569',
      '--mpd-font':         "'Outfit',sans-serif",
      '--mpd-radius':       '22px',
      '--mpd-tile-bg':      'rgba(255,255,255,.04)',
      '--mpd-tile-border':  'rgba(255,255,255,.08)',
      '--mpd-tile-hover':   'rgba(0,212,255,.07)',
      '--mpd-divider':      'rgba(0,212,255,.1)',
      '--mpd-header-sep':   'rgba(0,212,255,.12)',
      '--mpd-sec-text':     '#00d4ff',
      '--mpd-title-color':  '#ffffff',
      '--mpd-date-color':   '#ff0080',
      '--mpd-time-color':   'rgba(0,212,255,.7)',
      '--mpd-cam-bg':       '#04040e',
      '--mpd-blob-color':   '#00d4ff',
      '--mpd-neon-c1':      '#00d4ff',
      '--mpd-neon-c2':      '#ff0080',
      '--mpd-neon-c3':      '#7c3aed',
    },
    palettes: {
      cyan:   {
        '--mpd-neon-c1': '#00d4ff', '--mpd-neon-c2': '#0080ff', '--mpd-neon-c3': '#7c3aed',
        '--mpd-accent': '#00d4ff',  '--mpd-accent2': '#0080ff',
        '--mpd-sec-text': '#00d4ff', '--mpd-date-color': '#0080ff', '--mpd-time-color': 'rgba(0,212,255,.7)',
      },
      pink:   {
        '--mpd-neon-c1': '#ff2d78', '--mpd-neon-c2': '#ff8c00', '--mpd-neon-c3': '#ff2d78',
        '--mpd-accent': '#ff2d78',  '--mpd-accent2': '#ff8c00',
        '--mpd-sec-text': '#ff2d78', '--mpd-date-color': '#ff8c00', '--mpd-time-color': 'rgba(255,45,120,.7)',
      },
      purple: {
        '--mpd-neon-c1': '#a855f7', '--mpd-neon-c2': '#06b6d4', '--mpd-neon-c3': '#a855f7',
        '--mpd-accent': '#a855f7',  '--mpd-accent2': '#06b6d4',
        '--mpd-sec-text': '#a855f7', '--mpd-date-color': '#06b6d4', '--mpd-time-color': 'rgba(168,85,247,.7)',
      },
    },
  },
};

function _injectNeonProperty() {
  if (document.querySelector('style[data-mpd-neon]')) return;
  const s = document.createElement('style');
  s.dataset.mpdNeon = '1';
  s.textContent = [
    '@property --mpd-border-angle{syntax:"<angle>";initial-value:0deg;inherits:false}',
    '@keyframes mpd-border-spin{to{--mpd-border-angle:360deg}}',
  ].join('\n');
  document.head.appendChild(s);
}

// ── applyTheme: sets CSS custom properties + frosted glass variables ──────────
function applyTheme(hostEl, themeName, neonColor, cfg) {
  const t = THEMES[themeName] || THEMES.default;
  const vars = t.vars;
  Object.keys(vars).forEach(k => hostEl.style.setProperty(k, vars[k]));
  if (t.palettes && neonColor && t.palettes[neonColor]) {
    const pv = t.palettes[neonColor];
    Object.keys(pv).forEach(k => hostEl.style.setProperty(k, pv[k]));
  }
  hostEl.style.fontFamily = vars['--mpd-font'];
  if (t.font) {
    const fontKey = 'link[data-mpd-font="' + themeName + '"]';
    if (!document.querySelector(fontKey)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet'; link.href = t.font;
      link.setAttribute('data-mpd-font', themeName);
      document.head.appendChild(link);
    }
  }
  if (t.neonBorder) {
    hostEl.classList.add('mpd-neon-host');
  } else {
    hostEl.classList.remove('mpd-neon-host');
  }

  // ── Frosted glass custom properties (default theme only) ──────────────────
  // We always clear first so switching themes removes stale frosted vars.
  hostEl.style.removeProperty('--mpd-fg-bg');
  hostEl.style.removeProperty('--mpd-fg-blur');

  if (themeName === 'default' && cfg && cfg.frosted_glass) {
    const opacity = Math.min(0.9, Math.max(0.1, parseFloat(cfg.frosted_opacity) || 0.52));
    const blur    = Math.min(40,  Math.max(4,   parseFloat(cfg.frosted_blur)    || 22));
    hostEl.style.setProperty('--mpd-fg-bg',   'rgba(8,14,30,' + opacity + ')');
    hostEl.style.setProperty('--mpd-fg-blur',  blur + 'px');
  }
}


// ════════════════════════════════════════════════════════════════════════════
// MAIN CARD ELEMENT
// ════════════════════════════════════════════════════════════════════════════
class MultiPanelDashboardCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._hass   = null;
    this._built  = false;
    this._tickInterval = null;
  }

  static getConfigElement() { return document.createElement('multi-panel-dashboard-card-editor'); }
  static getStubConfig()    { return getStubConfig(); }

  setConfig(config) {
    this._config = Object.assign({}, getStubConfig(), config || {});
    this._config.devices = Object.assign({}, getStubConfig().devices, (config && config.devices) || {});
    this._config.devices.mower = Object.assign({}, getStubConfig().devices.mower, (config && config.devices && config.devices.mower) || {});
    this._built = false;
    this._render();
  }

  set hass(hass) {
    const firstHass = !this._hass;
    this._hass = hass;
    if (!this._built || firstHass) {
      this._render();
    } else {
      this._update();
      this._initStreams();
    }
  }

  connectedCallback() {
    if (!this._tickInterval) {
      this._tickInterval = setInterval(() => this._updateClock(), 1000);
    }
  }
  disconnectedCallback() {
    if (this._tickInterval) { clearInterval(this._tickInterval); this._tickInterval = null; }
    if (this._ro) { this._ro.disconnect(); this._ro = null; }
  }

  _moreInfo(id) {
    if (!id) return;
    this.dispatchEvent(new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: id } }));
  }
  _toggle(id) {
    if (!id || !this._hass) return;
    this._hass.callService('homeassistant', 'toggle', { entity_id: id });
  }
  _callMowerService(entityId, action) {
    if (!entityId || !this._hass) return;
    const domain = entityId.split('.')[0];
    const svcMap = {
      lawn_mower: { start_mowing: 'start_mowing', pause: 'pause', dock: 'dock' },
      vacuum:     { start_mowing: 'start',        pause: 'pause', dock: 'return_to_base' },
    };
    const svc = (svcMap[domain] || {})[action] || action;
    this._hass.callService(domain, svc, { entity_id: entityId });
  }

  // ── Header HTML ────────────────────────────────────────────────────────────
  _headerHTML() {
    const cfg = this._config;
    if (!cfg.card_title && !cfg.show_datetime && !cfg.show_status_dot) return '';

    const iconHTML = cfg.card_icon
      ? '<span class="mpd-title-icon"><ha-icon icon="' + cfg.card_icon + '"></ha-icon></span>'
      : '';
    const titleHTML = cfg.card_title
      ? '<div class="mpd-title-wrap">' + iconHTML + '<div class="mpd-title">' + String(cfg.card_title).toUpperCase() + '</div></div>'
      : '<div class="mpd-title-wrap"></div>';

    const now = new Date();
    const dateStr = now.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
    const timeStr = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const dtHTML = cfg.show_datetime
      ? '<div class="mpd-datetime"><div class="mpd-date" id="mpd-date">' + dateStr + '</div><div class="mpd-time" id="mpd-time">' + timeStr + '</div></div>'
      : '';

    let dotHTML = '';
    if (cfg.show_status_dot) {
      let online = true;
      if (cfg.status_entity) {
        const s = stateVal(this._hass, cfg.status_entity);
        online = !isUnavail(s);
      }
      dotHTML = '<div class="mpd-dot ' + (online ? 'online' : 'offline') + '"></div>';
    }

    const rightHTML = (dtHTML || dotHTML)
      ? '<div class="mpd-head-right">' + dtHTML + dotHTML + '</div>'
      : '';

    const pos = cfg.title_position === 'center' ? 'pos-center' : 'pos-left';
    const leftSpacer = cfg.title_position === 'center' ? '<div class="mpd-head-spacer"></div>' : '';
    return '<div class="mpd-header ' + pos + '">' + leftSpacer + titleHTML + rightHTML + '</div>';
  }

  _updateClock() {
    const sr = this.shadowRoot; if (!sr) return;
    const dEl = sr.getElementById('mpd-date');
    const tEl = sr.getElementById('mpd-time');
    if (!dEl && !tEl) return;
    const now = new Date();
    if (dEl) dEl.textContent = now.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' });
    if (tEl) tEl.textContent = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  // ── Mower HTML ─────────────────────────────────────────────────────────────
  _mowerHTML() {
    const cfg = this._config;
    const m = cfg.devices && cfg.devices.mower;
    if (!m || !m.enabled || !m.entity) return '';

    const hass = this._hass;
    const stateObj = hass ? hass.states[m.entity] : null;
    const state    = stateObj ? stateObj.state : 'unknown';
    const name     = m.label || (stateObj ? (stateObj.attributes.friendly_name || m.entity) : 'Mower');
    const ago      = stateObj ? agoStr(stateObj.last_changed) : '';

    const battVal  = m.battery_entity ? stateNum(hass, m.battery_entity) : null;
    const battPct  = battVal !== null && !isNaN(battVal) ? Math.round(battVal) : null;
    const battColor = battPct === null ? '#6b7280'
                    : battPct > 50 ? '#22c55e'
                    : battPct > 20 ? '#fbbf24' : '#ef4444';

    const type = DEVICE_TYPES.mower;
    const badge = type.badges[state] || { label: state, color: '#6b7280', bg: 'rgba(107,114,128,0.15)' };

    const isMowing    = state === 'mowing';
    const isReturning = state === 'returning';
    const showPause   = isMowing || isReturning;

    const tileCls = 'mower-tile' + (state === 'error' ? ' st-error' : state === 'docked' ? ' st-docked' : '');

    const battHTML = battPct !== null ? (
      '<div class="mower-batt">' +
        '<span class="mower-batt-ico">🔋</span>' +
        '<div class="mower-batt-track"><div class="mower-batt-fill" style="width:' + battPct + '%;background:' + battColor + ';box-shadow:0 0 6px ' + battColor + '"></div></div>' +
        '<div class="mower-batt-pct" style="color:' + battColor + '">' + battPct + '%</div>' +
      '</div>'
    ) : '';

    const btnsHTML =
      '<div class="mower-btns">' +
        (showPause
          ? '<button class="mower-btn" data-mower-action="pause">⏸ Pause</button>'
          : '<button class="mower-btn primary" data-mower-action="start_mowing">▶ Start</button>') +
        '<button class="mower-btn" data-mower-action="dock">⬆ Dock</button>' +
      '</div>';

    return (
      '<div class="' + tileCls + '" data-mower-entity="' + m.entity + '">' +
        '<div class="mower-head" data-action="more-info" data-entity="' + m.entity + '">' +
          '<div class="mower-icon-box">🤖</div>' +
          '<div class="mower-info">' +
            '<div class="mower-name">' + name + '</div>' +
            '<div class="mower-status-row">' +
              (ago ? '<span class="mower-ago">' + ago + '</span>' : '') +
              '<span class="mower-badge" style="color:' + badge.color + ';background:' + badge.bg + '">' + badge.label + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="mower-svg-wrap">' + mowerSVG(state) + '</div>' +
        '</div>' +
        battHTML +
        btnsHTML +
      '</div>'
    );
  }

  // ── Main HTML builder ──────────────────────────────────────────────────────
  _buildHTML() {
    const cfg  = this._config;
    const hass = this._hass;

    // Header
    const headerHTML = this._headerHTML();

    // Cameras
    const camCols = parseInt(cfg.cameras_columns) || 3;
    const camsHTML = (cfg.cameras || []).map(function(cam, i) {
      const hasEnt = cam.entity && hass && hass.states[cam.entity];
      const icon   = renderIcon(cam.icon || 'camera', 'rgba(255,255,255,.22)', 28);
      return '<div class="cam-tile" data-action="camera" data-entity="' + (cam.entity||'') + '" data-idx="' + i + '">' +
        (hasEnt
          ? '<mpd-cam-stream data-entity="' + cam.entity + '" data-idx="' + i + '"></mpd-cam-stream>'
          : '<div class="cam-placeholder">' + icon + '</div>') +
        '</div>';
    }).join('');

    // Switches
    const swCols = parseInt(cfg.switches_columns) || 2;
    const swHTML = (cfg.switches || []).map(function(sw, i) {
      const state    = stateVal(hass, sw.entity);
      const on       = isOn(state), unavail = isUnavail(state), motion = sw.category === 'motion';
      const cls = 'sw-tile' + (unavail ? ' sw-unavail' : motion && on ? ' sw-motion' : on ? ' sw-on' : '');
      const icolor = unavail ? 'rgba(255,255,255,.2)' : motion && on ? '#ffaa6d' : on ? '#6dbfff' : 'rgba(255,255,255,.4)';
      const scls   = motion && on ? 's-motion' : on ? 's-on' : '';
      const stxt   = unavail ? 'N/A' : motion ? (on ? 'Detected' : 'Clear') : stateLabel(state);
      return '<div class="' + cls + '" data-action="toggle" data-entity="' + (sw.entity||'') + '" data-idx="' + i + '">' +
        renderIcon(sw.icon || 'switch_icon', icolor, 17) +
        '<span class="sw-name">' + (sw.label||'—') + '</span>' +
        '<span class="sw-state ' + scls + '">' + stxt + '</span>' +
        '</div>';
    }).join('');

    // Sensors
    const sCols = parseInt(cfg.sensors_columns) || 2;
    const sensHTML = (cfg.sensors || []).map(function(s, i) {
      const state = stateVal(hass, s.entity), on = isOn(state), cat = s.category || 'sensor', unavail = isUnavail(state);
      const dc    = stateAttr(hass, s.entity, 'device_class') || '';
      const motion = cat === 'motion' || isMotionSensor(s.entity, dc);
      const motionActive = motion && MOTION_ACTIVE.includes((state || '').toLowerCase());

      const vcls   = 'sensor-val' + (motion && motionActive ? ' sv-motion' : cat === 'door' && on ? ' sv-open' : on ? ' sv-on' : !unavail && !on ? ' sv-off' : '');
      const disp   = unavail ? '—'
                  : motion ? (motionActive ? 'Detected' : 'Clear')
                  : cat === 'door'  ? (on ? 'Open' : 'Closed')
                  : cat === 'light' ? (on ? 'On' : 'Off')
                  : cat === 'person'? (on ? 'Home' : 'Away')
                  : stateLabel(state);

      let iconHTML;
      if (motion) {
        const wrapCls = motionActive ? 'sensor-icon-wrap motion-active' : 'sensor-icon-wrap motion-clear';
        const emojiCls = motionActive ? 'motion-emoji' : 'motion-emoji clear';
        iconHTML = '<div class="' + wrapCls + '"><span class="' + emojiCls + '">🚶</span></div>';
      } else {
        const icolor = cat === 'door' && on ? '#ffd26d'
                    : on ? '#6dbfff'
                    : 'rgba(255,255,255,.4)';
        iconHTML = '<div class="sensor-icon-wrap">' + renderIcon(s.icon || CATEGORY_ICON[cat] || 'sensor', icolor, 13) + '</div>';
      }

      const tileCls = 'sensor-tile' + (motion && motionActive ? ' motion-active' : '');
      return '<div class="' + tileCls + '" data-action="more-info" data-entity="' + (s.entity||'') + '" data-idx="' + i + '">' +
        iconHTML +
        '<div class="sensor-name">' + (s.label||'—') + '</div>' +
        '<div class="' + vcls + '">' + disp + '</div>' +
        '</div>';
    }).join('');

    // Climate gauges
    const gCols = parseInt(cfg.gauges_columns) || 2;
    const gaugesHTML = (cfg.gauges || []).map(function(g, i) {
      const size      = parseInt(g.gauge_size) || 54;
      const tempVal   = stateNum(hass, g.temp_entity), humVal = stateNum(hass, g.humidity_entity);
      const tempTh    = parseTh(g.temp_thresholds, DEFAULT_THRESHOLDS.temperature);
      const humTh     = parseTh(g.hum_thresholds,  DEFAULT_THRESHOLDS.humidity);
      const tempColor = colorFromThresholds(tempVal, tempTh), humColor = colorFromThresholds(humVal, humTh);
      const tempPct   = Math.min(1, Math.max(0, tempVal / 50)), humPct = Math.min(1, Math.max(0, humVal / 100));
      const tempStr   = g.temp_entity     ? tempVal.toFixed(1) + '°C' : '—';
      const humStr    = g.humidity_entity ? humVal.toFixed(1)  + '%'  : '—';
      return '<div class="gauge-tile" data-action="more-info" data-entity="' + (g.temp_entity||'') + '" data-idx="' + i + '">' +
        '<div class="gauge-wrap" style="width:' + size + 'px;height:' + size + 'px">' +
        gaugeSVG(size, tempPct, tempColor, humPct, humColor) +
        '<div class="gauge-center">' +
        '<span class="g-val" id="g-temp-' + i + '" style="color:' + tempColor + '">' + tempStr + '</span>' +
        '<span class="g-sub" id="g-hum-'  + i + '" style="color:' + humColor  + '">' + humStr  + '</span>' +
        '</div></div>' +
        '<div class="g-name">' + (g.label||('Gauge '+(i+1))) + '</div>' +
        '</div>';
    }).join('');

    // Salt
    const hasSaltPct  = !!(hass && cfg.salt_pct_entity);
    const hasSaltDist = !!(hass && cfg.salt_entity);
    const hasSalt     = hasSaltPct || hasSaltDist;
    const saltPct     = hasSalt ? calcSaltPct(hass, cfg) : 0;
    const saltPctDisp = (saltPct * 100).toFixed(1);
    const saltDistRaw = hasSaltDist ? stateNum(hass, cfg.salt_entity) : null;
    const saltDistUnit= hasSaltDist ? (stateAttr(hass, cfg.salt_entity, 'unit_of_measurement') || '') : '';
    const saltDistDisp= saltDistRaw !== null ? saltDistRaw.toFixed(2) + saltDistUnit : '';
    const saltMainDisp= hasSalt ? saltPctDisp + '%' : '—';
    const saltMetaDisp= saltPctDisp + '% full' + (saltDistDisp ? ' · ' + saltDistDisp : '');
    const saltTh      = parseTh(cfg.salt_thresholds, DEFAULT_THRESHOLDS.salt);
    const saltColor   = colorFromThresholds(parseFloat(saltPctDisp), saltTh);
    const saltWarn    = parseFloat(saltPctDisp) < (cfg.salt_warn_threshold || 30);
    const saltSize    = 60;
    const saltClickEntity = cfg.salt_pct_entity || cfg.salt_entity || '';
    const saltHTML = hasSalt ? (
      '<div class="divider" style="margin:10px 0 8px"></div>' +
      '<div class="sec" style="margin-bottom:8px">' +
        '<span class="sec-dot" style="background:#ffd26d;box-shadow:0 0 5px #ffd26d"></span>' +
        (cfg.label_salt || 'Salt Level') +
      '</div>' +
      '<div class="salt-tile" data-action="more-info" data-entity="' + saltClickEntity + '">' +
        '<div class="salt-wrap" style="width:' + saltSize + 'px;height:' + saltSize + 'px">' +
          saltSVG(saltSize, saltPct, saltColor) +
          '<div class="salt-center">' +
            '<span class="s-val">' + saltMainDisp + '</span>' +
            '<span class="s-pct">' + saltDistDisp + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="salt-info">' +
          '<div class="salt-title">' + (cfg.salt_label || 'Salt Level') + '</div>' +
          '<div class="salt-bar-wrap"><div class="salt-bar" style="width:' + saltPctDisp + '%;background:' + saltColor + '"></div></div>' +
          '<div class="salt-meta">' + saltMetaDisp + '</div>' +
          (saltWarn ? '<div class="salt-warn"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#ffd26d" stroke-width="2.5" stroke-linecap="round"><path d="' + MDI.warning + '"/></svg>Below ' + (cfg.salt_warn_threshold||30) + '% — buy salt!</div>' : '') +
        '</div>' +
      '</div>'
    ) : '';

    // Power
    const pCols = parseInt(cfg.power_columns) || 2;
    const pSize = pCols >= 2 ? 52 : 60;
    const powerHTML = (cfg.power_circuits || []).map(function(p, i) {
      const watts   = stateNum(hass, p.entity);
      const maxW    = parseFloat(p.max_w) || 3000;
      const pct     = Math.min(1, Math.max(0, watts / maxW));
      const pTh     = parseTh(p.power_thresholds, DEFAULT_THRESHOLDS.power);
      const pcolor  = colorFromThresholds(watts, pTh);
      const energy  = p.energy_entity  ? stateNum(hass, p.energy_entity).toFixed(2)  : null;
      const current = p.current_entity ? stateNum(hass, p.current_entity).toFixed(2) : null;
      const subs = (energy  ? '<div class="p-sub"><div class="p-sub-val">' + energy  + 'kWh</div><div class="p-sub-lbl">Energy</div></div>'  : '') +
                   (current ? '<div class="p-sub"><div class="p-sub-val">' + current + 'A</div><div class="p-sub-lbl">Current</div></div>' : '');
      return '<div class="power-tile" data-action="more-info" data-entity="' + (p.entity||'') + '" data-idx="' + i + '">' +
        '<div class="power-arc-wrap" style="width:' + pSize + 'px;height:' + pSize + 'px">' +
          powerSVG(pSize, pct, pcolor) +
          '<div class="power-center">' +
            '<span class="p-val" style="color:' + pcolor + '">' + Math.round(watts) + '</span>' +
            '<span class="p-unit">W</span>' +
          '</div>' +
        '</div>' +
        '<div class="power-info">' +
          '<div class="power-name">' + (p.label||('Circuit '+(i+1))) + '</div>' +
          '<div class="power-subs">' + subs + '</div>' +
        '</div>' +
        '</div>';
    }).join('');

    // Devices
    const hasMower = cfg.devices && cfg.devices.mower && cfg.devices.mower.enabled && cfg.devices.mower.entity;
    const devicesHTML = hasMower ? (
      '<div class="sec"><span class="sec-dot" style="background:#22c55e;box-shadow:0 0 5px #22c55e"></span>' + (cfg.label_devices || 'Devices') + '</div>' +
      '<div class="devices-wrap">' + this._mowerHTML() + '</div>'
    ) : '';

    // Determine bottom columns dynamically
    const hasSw    = (cfg.switches       || []).length > 0;
    const hasSens  = (cfg.sensors        || []).length > 0;
    const hasClim  = (cfg.gauges         || []).length > 0 || !!(cfg.salt_pct_entity || cfg.salt_entity);
    const hasDev   = !!hasMower;
    const hasPower = (cfg.power_circuits || []).length > 0;
    const bottomCols = [hasSw, hasSens, hasClim, hasDev, hasPower].filter(Boolean).length || 1;

    const mkSec = (dotColor, label, inner) =>
      '<div class="sec-col"><div class="sec"><span class="sec-dot" style="background:' + dotColor + ';box-shadow:0 0 5px ' + dotColor + '"></span>' + label + '</div>' + inner + '</div>';

    const swSec    = hasSw    ? mkSec('#4fa3e0', cfg.label_switches || 'Switches',
                         '<div class="sw-grid" style="grid-template-columns:repeat(' + swCols + ',1fr)">' + swHTML + '</div>') : '';
    const sensSec  = hasSens  ? mkSec('#ffaa6d', cfg.label_sensors  || 'Sensors',
                         '<div class="sensor-grid scols-' + sCols + '" style="grid-template-columns:repeat(' + sCols + ',1fr)">' + sensHTML + '</div>') : '';
    const climSec  = hasClim  ? mkSec('#6ddb99', cfg.label_climate  || 'Climate',
                         ((cfg.gauges||[]).length > 0
                            ? '<div class="gauge-grid gcols-' + gCols + '" style="grid-template-columns:repeat(' + gCols + ',1fr)">' + gaugesHTML + '</div>'
                            : '') + saltHTML) : '';
    const devSec   = hasDev   ? mkSec('#22c55e', cfg.label_devices  || 'Devices',
                         '<div class="devices-wrap">' + this._mowerHTML() + '</div>') : '';
    const powerSec = hasPower ? mkSec('#e07c4f', cfg.label_power    || 'Power',
                         '<div class="power-grid pcols-' + pCols + '" style="grid-template-columns:repeat(' + pCols + ',1fr)">' + powerHTML + '</div>') : '';

    const hasCameras = (cfg.cameras || []).length > 0;
    const camsSection = hasCameras ? (
      '<div class="sec"><span class="sec-dot" style="background:#4fa3e0;box-shadow:0 0 5px #4fa3e0"></span>' + (cfg.label_surveillance || 'Surveillance') + '</div>' +
      '<div class="cam-strip" style="grid-template-columns:repeat(' + camCols + ',1fr)">' + camsHTML + '</div>' +
      '<div class="divider"></div>'
    ) : '';

    // ── Frosted glass class: only on default theme ───────────────────────────
    const isNeon    = (cfg.theme === 'neon');
    const isFrosted = (cfg.theme === 'default' || !cfg.theme) && !!cfg.frosted_glass;
    const cardCls   = 'mpd-card' + (isFrosted ? ' mpd-frosted' : '') + (cfg.jha ? ' mpd-jha' : '');

    const cardOpen  = isNeon
      ? '<div class="mpd-neon-ring"><div class="' + cardCls + '"><div class="mpd-inner">'
      : '<div class="' + cardCls + '"><div class="mpd-inner">';
    const cardClose = isNeon ? '</div></div></div>' : '</div></div>';

    return '<style>' + STYLES + '</style>' +
      cardOpen +
        headerHTML +
        camsSection +
        '<div class="bottom-grid" style="--mpd-cols:' + bottomCols + '">' +
          swSec + sensSec + climSec + devSec + powerSec +
        '</div>' +
      cardClose;
  }

  _render() {
    this.shadowRoot.innerHTML = this._buildHTML();
    this._attachListeners();
    this._initStreams();
    this._startResizeObserver();
    applyTheme(this, this._config.theme || 'default', this._config.neon_color || 'cyan', this._config);
    this._built = true;
  }

  _startResizeObserver() {
    if (this._ro) this._ro.disconnect();
    const inner = this.shadowRoot.querySelector('.mpd-inner');
    if (!inner) return;
    this._ro = new ResizeObserver((entries) => {
      const w = entries[0].contentRect.width;
      inner.classList.remove('bp-sm', 'bp-xs');
      if (w < 480)      inner.classList.add('bp-xs');
      else if (w < 900) inner.classList.add('bp-sm');
    });
    this._ro.observe(inner);
  }

  _update() {
    const cfg = this._config, hass = this._hass, sr = this.shadowRoot;

    // Status dot
    if (cfg.show_status_dot) {
      const dot = sr.querySelector('.mpd-dot');
      if (dot) {
        let online = true;
        if (cfg.status_entity) {
          const s = stateVal(hass, cfg.status_entity);
          online = !isUnavail(s);
        }
        dot.className = 'mpd-dot ' + (online ? 'online' : 'offline');
      }
    }

    // Switches
    (cfg.switches || []).forEach(function(sw, i) {
      const tile = sr.querySelector('.sw-tile[data-idx="' + i + '"]'); if (!tile) return;
      const state = stateVal(hass, sw.entity), on = isOn(state), unavail = isUnavail(state), motion = sw.category === 'motion';
      tile.className = 'sw-tile' + (unavail ? ' sw-unavail' : motion && on ? ' sw-motion' : on ? ' sw-on' : '');
      const stEl = tile.querySelector('.sw-state'); if (!stEl) return;
      stEl.className   = 'sw-state' + (motion && on ? ' s-motion' : on ? ' s-on' : '');
      stEl.textContent = unavail ? 'N/A' : motion ? (on ? 'Detected' : 'Clear') : stateLabel(state);
    });

    // Sensors (including motion)
    (cfg.sensors || []).forEach(function(s, i) {
      const tile = sr.querySelector('.sensor-tile[data-idx="' + i + '"]'); if (!tile) return;
      const state = stateVal(hass, s.entity), on = isOn(state), cat = s.category || 'sensor', unavail = isUnavail(state);
      const dc    = stateAttr(hass, s.entity, 'device_class') || '';
      const motion = cat === 'motion' || isMotionSensor(s.entity, dc);
      const motionActive = motion && MOTION_ACTIVE.includes((state || '').toLowerCase());
      const disp = unavail ? '—'
                : motion ? (motionActive ? 'Detected' : 'Clear')
                : cat === 'door'  ? (on ? 'Open' : 'Closed')
                : cat === 'light' ? (on ? 'On' : 'Off')
                : cat === 'person'? (on ? 'Home' : 'Away')
                : stateLabel(state);

      tile.className = 'sensor-tile' + (motion && motionActive ? ' motion-active' : '');

      if (motion) {
        const wrap  = tile.querySelector('.sensor-icon-wrap');
        const emoji = tile.querySelector('.motion-emoji');
        if (wrap)  wrap.className  = 'sensor-icon-wrap ' + (motionActive ? 'motion-active' : 'motion-clear');
        if (emoji) emoji.className = 'motion-emoji' + (motionActive ? '' : ' clear');
      }

      const valEl = tile.querySelector('.sensor-val'); if (!valEl) return;
      valEl.className   = 'sensor-val' + (motion && motionActive ? ' sv-motion' : cat === 'door' && on ? ' sv-open' : on ? ' sv-on' : !unavail && !on ? ' sv-off' : '');
      valEl.textContent = disp;
    });

    // Gauges
    (cfg.gauges || []).forEach(function(g, i) {
      const card  = sr.querySelector('.gauge-tile[data-idx="' + i + '"]');
      const tEl   = sr.getElementById('g-temp-' + i), hEl = sr.getElementById('g-hum-' + i);
      const tVal  = stateNum(hass, g.temp_entity), hVal = stateNum(hass, g.humidity_entity);
      const tTh   = parseTh(g.temp_thresholds, DEFAULT_THRESHOLDS.temperature);
      const hTh   = parseTh(g.hum_thresholds,  DEFAULT_THRESHOLDS.humidity);
      const tColor = colorFromThresholds(tVal, tTh), hColor = colorFromThresholds(hVal, hTh);
      const tPct  = Math.min(1, Math.max(0, tVal / 50)), hPct = Math.min(1, Math.max(0, hVal / 100));
      if (tEl) { tEl.textContent = g.temp_entity     ? tVal.toFixed(1) + '°C' : '—'; tEl.style.color = tColor; }
      if (hEl) { hEl.textContent = g.humidity_entity ? hVal.toFixed(1) + '%'  : '—'; hEl.style.color = hColor; }
      if (card) {
        const size = parseInt(g.gauge_size) || 54;
        const r1 = size * 0.41, r2 = size * 0.32;
        const c1 = 2 * Math.PI * r1, c2 = 2 * Math.PI * r2;
        const circles = card.querySelectorAll('circle');
        if (circles.length >= 4) {
          circles[1].setAttribute('stroke', tColor);
          circles[1].setAttribute('stroke-dashoffset', (c1 * (1 - tPct)).toFixed(1));
          circles[1].style.filter = 'drop-shadow(0 0 4px ' + tColor + ')';
          circles[3].setAttribute('stroke', hColor);
          circles[3].setAttribute('stroke-dashoffset', (c2 * (1 - hPct)).toFixed(1));
          circles[3].style.filter = 'drop-shadow(0 0 3px ' + hColor + ')';
        }
      }
    });

    // Salt
    if (cfg.salt_pct_entity || cfg.salt_entity) {
      const saltCard = sr.querySelector('.salt-tile');
      if (saltCard) {
        const saltPct      = calcSaltPct(hass, cfg);
        const saltPctDisp  = (saltPct * 100).toFixed(1);
        const saltTh       = parseTh(cfg.salt_thresholds, DEFAULT_THRESHOLDS.salt);
        const saltColor    = colorFromThresholds(parseFloat(saltPctDisp), saltTh);
        const r = 60 * 0.42, c = 2 * Math.PI * r, off = c * (1 - saltPct);
        const saltDistRaw  = cfg.salt_entity ? stateNum(hass, cfg.salt_entity) : null;
        const saltDistUnit = cfg.salt_entity ? (stateAttr(hass, cfg.salt_entity, 'unit_of_measurement') || '') : '';
        const saltDistDisp = saltDistRaw !== null ? saltDistRaw.toFixed(2) + saltDistUnit : '';
        const saltMetaDisp = saltPctDisp + '% full' + (saltDistDisp ? ' · ' + saltDistDisp : '');
        const sVal  = saltCard.querySelector('.s-val');
        const sPct  = saltCard.querySelector('.s-pct');
        const sMeta = saltCard.querySelector('.salt-meta');
        const sBar  = saltCard.querySelector('.salt-bar');
        const sCir  = saltCard.querySelectorAll('circle')[1];
        if (sVal)  sVal.textContent  = saltPctDisp + '%';
        if (sPct)  sPct.textContent  = saltDistDisp;
        if (sMeta) sMeta.textContent = saltMetaDisp;
        if (sBar)  { sBar.style.width = saltPctDisp + '%'; sBar.style.background = saltColor; }
        if (sCir)  { sCir.setAttribute('stroke', saltColor); sCir.setAttribute('stroke-dashoffset', off.toFixed(1)); }
      }
    }

    // Power
    (cfg.power_circuits || []).forEach(function(p, i) {
      const tile  = sr.querySelector('.power-tile[data-idx="' + i + '"]'); if (!tile) return;
      const watts = stateNum(hass, p.entity);
      const maxW  = parseFloat(p.max_w) || 3000;
      const pct   = Math.min(1, Math.max(0, watts / maxW));
      const pTh   = parseTh(p.power_thresholds, DEFAULT_THRESHOLDS.power);
      const pcolor = colorFromThresholds(watts, pTh);
      const pSize  = parseInt(cfg.power_columns) >= 2 ? 52 : 60;
      const r = pSize * 0.38, full = 2 * Math.PI * r, arc = full * 0.75, fill = Math.max(0, Math.min(arc, pct * arc));
      const circles = tile.querySelectorAll('circle');
      if (circles.length >= 2) {
        circles[1].setAttribute('stroke', pcolor);
        circles[1].setAttribute('stroke-dasharray', fill.toFixed(1) + ' ' + (full - fill).toFixed(1));
        circles[1].style.filter = 'drop-shadow(0 0 4px ' + pcolor + ')';
      }
      const pVal = tile.querySelector('.p-val');
      if (pVal) { pVal.textContent = Math.round(watts); pVal.style.color = pcolor; }
      if (p.energy_entity || p.current_entity) {
        const subVals = tile.querySelectorAll('.p-sub-val');
        if (p.energy_entity  && subVals[0]) subVals[0].textContent = stateNum(hass, p.energy_entity).toFixed(2)  + 'kWh';
        if (p.current_entity && subVals[1]) subVals[1].textContent = stateNum(hass, p.current_entity).toFixed(2) + 'A';
      }
    });

    // Mower
    const m = cfg.devices && cfg.devices.mower;
    if (m && m.enabled && m.entity) {
      const existing = sr.querySelector('[data-mower-entity]');
      if (existing) {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = this._mowerHTML();
        const fresh = wrapper.firstElementChild;
        if (fresh) {
          existing.replaceWith(fresh);
          this._attachMowerListeners(fresh);
          const head = fresh.querySelector('[data-action="more-info"]');
          if (head) this._bindDataAction(head);
        }
      }
    }
  }

  _initStreams() {
    if (!this._hass) return;
    const cfg  = this._config, hass = this._hass, sr = this.shadowRoot;
    const doInit = function() {
      sr.querySelectorAll('mpd-cam-stream').forEach(function(el) {
        const idx      = parseInt(el.dataset.idx);
        const cam      = (cfg.cameras || [])[idx] || {};
        const entityId = el.dataset.entity || cam.entity || '';
        const stateObj = hass.states[entityId];
        if (!stateObj) return;
        el.hass     = hass;
        el.stateObj = stateObj;
        el.label    = cam.label || entityId;
        el.entityId = entityId;
      });
    };
    if (customElements.get('mpd-cam-stream')) {
      setTimeout(doInit, 50);
    } else {
      customElements.whenDefined('mpd-cam-stream').then(function() { setTimeout(doInit, 50); });
    }
  }

  _bindDataAction(el) {
    const self = this;
    el.addEventListener('click', function(e) {
      e.stopPropagation();
      const action = el.dataset.action, entity = el.dataset.entity;
      if (!entity || entity === 'undefined' || entity === '') return;
      if (action === 'toggle') {
        self._toggle(entity);
      } else {
        self._moreInfo(entity);
      }
    });
  }

  _attachMowerListeners(scope) {
    const self = this;
    const root = scope || this.shadowRoot;
    const mowerEntity = (this._config.devices && this._config.devices.mower && this._config.devices.mower.entity) || '';
    root.querySelectorAll('[data-mower-action]').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        self._callMowerService(mowerEntity, btn.dataset.mowerAction);
      });
    });
  }

  _attachListeners() {
    const self = this;
    this.shadowRoot.querySelectorAll('[data-action]').forEach(function(el) {
      self._bindDataAction(el);
    });
    this._attachMowerListeners();
  }

  getCardSize() { return 10; }
}

// ════════════════════════════════════════════════════════════════════════════
// EDITOR
// ════════════════════════════════════════════════════════════════════════════
class MultiPanelDashboardCardEditor extends LitElement {
  static get properties() {
    return {
      hass:             {},
      _config:          { state: true },
      _openSections:    { state: true },
      _loadedPickers:   { state: true },
    };
  }

  constructor() {
    super();
    this._openSections = { header: true };
    this._loadedPickers = false;
  }

  async firstUpdated() {
    const load = async () => {
      try {
        if (!customElements.get('ha-entity-picker')) {
          const helpers = await window.loadCardHelpers();
          const c = await helpers.createCardElement({ type: 'entities', entities: [] });
          await c.constructor.getConfigElement();
        }
      } catch (_) {}
      this._loadedPickers = true;
      this.requestUpdate();
    };
    const timeout = setTimeout(() => { this._loadedPickers = true; this.requestUpdate(); }, 3000);
    load().then(() => clearTimeout(timeout));
  }

  setConfig(config) {
    this._config = Object.assign({}, getStubConfig(), config || {});
    this._config.devices = Object.assign({}, getStubConfig().devices, (config && config.devices) || {});
    this._config.devices.mower = Object.assign({}, getStubConfig().devices.mower, (config && config.devices && config.devices.mower) || {});
  }

  _fire() {
    const ev = new Event('config-changed', { bubbles: true, composed: true });
    ev.detail = { config: this._config };
    this.dispatchEvent(ev);
  }

  _set(key, value) {
    this._config = Object.assign({}, this._config, { [key]: value });
    this._fire();
  }
  _setDeep(path, value) {
    const cfg = JSON.parse(JSON.stringify(this._config));
    let cur = cfg;
    for (let i = 0; i < path.length - 1; i++) {
      cur[path[i]] = cur[path[i]] || {};
      cur = cur[path[i]];
    }
    cur[path[path.length - 1]] = value;
    this._config = cfg;
    this._fire();
  }
  _addItem(key, defaults) {
    const arr = (this._config[key] || []).concat([defaults]);
    this._set(key, arr);
  }
  _removeItem(key, idx) {
    const arr = (this._config[key] || []).slice();
    arr.splice(idx, 1);
    this._set(key, arr);
  }
  _updateItem(key, idx, field, value) {
    const arr = (this._config[key] || []).slice();
    arr[idx] = Object.assign({}, arr[idx], { [field]: value });
    this._set(key, arr);
  }

  _toggleSection(id) {
    this._openSections = Object.assign({}, this._openSections, { [id]: !this._openSections[id] });
  }

  // ── Atomic editor widgets ─────────────────────────────────────────────────
  _renderEntityPicker(value, onChange, domains, label) {
    return html`
      <div class="ed-field">
        <label class="ed-label">${label || 'Entity'}</label>
        <ha-entity-picker
          .hass=${this.hass}
          .value=${value || ''}
          .includeDomains=${domains && domains.length ? domains : undefined}
          allow-custom-entity
          @value-changed=${(e) => {
            const v = e.detail.value || '';
            if (v !== (value || '')) onChange(v);
          }}
        ></ha-entity-picker>
      </div>
    `;
  }

  _renderIconPicker(value, onChange, placeholder) {
    return html`
      <div class="ed-field">
        <label class="ed-label">Icon</label>
        <ha-icon-picker
          .hass=${this.hass}
          .value=${value || ''}
          .placeholder=${placeholder || 'mdi:...'}
          @value-changed=${(e) => { const v = e.detail.value || ''; if (v !== (value || '')) onChange(v); }}
        ></ha-icon-picker>
      </div>
    `;
  }

  _txt(label, value, onChange, placeholder) {
    return html`
      <div class="ed-field">
        <label class="ed-label">${label}</label>
        <input class="ed-input" type="text" .value="${value || ''}" placeholder="${placeholder || ''}"
          @change="${(e) => onChange(e.target.value)}" />
      </div>`;
  }

  _num(label, value, onChange, placeholder) {
    return html`
      <div class="ed-field">
        <label class="ed-label">${label}</label>
        <input class="ed-input" type="number" .value="${value || ''}" placeholder="${placeholder || ''}"
          @change="${(e) => onChange(e.target.value)}" />
      </div>`;
  }

  _toggle(label, checked, onChange) {
    return html`
      <div class="toggle-row">
        <span class="toggle-label">${label}</span>
        <label class="toggle-wrap">
          <input type="checkbox" .checked="${!!checked}" @change="${(e) => onChange(e.target.checked)}" />
          <span class="toggle-slider"></span>
        </label>
      </div>`;
  }

  _seg(label, value, options, onChange) {
    return html`
      <div class="ed-field">
        <label class="ed-label">${label}</label>
        <div class="segmented">
          ${options.map((opt) => html`
            <div class="seg-opt ${value === opt.val ? 'active' : ''}" @click="${() => onChange(opt.val)}">${opt.label}</div>
          `)}
        </div>
      </div>`;
  }

  _select(label, value, options, onChange) {
    return html`
      <div class="ed-field">
        <label class="ed-label">${label}</label>
        <select class="ed-select" .value="${value || ''}"
          @change="${(e) => onChange(e.target.value)}">
          ${options.map((opt) => html`<option value="${opt.val}" ?selected=${String(value) === String(opt.val)}>${opt.label}</option>`)}
        </select>
      </div>`;
  }

  // ── Range slider widget ───────────────────────────────────────────────────
  _range(label, value, min, max, step, onChange, unit) {
    const val = parseFloat(value) || 0;
    const pct = Math.round(((val - min) / (max - min)) * 100);
    return html`
      <div class="ed-field">
        <div class="ed-range-header">
          <label class="ed-label" style="margin:0">${label}</label>
          <span class="ed-range-val">${val}${unit || ''}</span>
        </div>
        <input class="ed-range" type="range"
          min="${min}" max="${max}" step="${step}"
          .value="${String(val)}"
          style="--range-pct:${pct}%"
          @input="${(e) => onChange(parseFloat(e.target.value))}" />
      </div>`;
  }

  _section(id, title, count, content) {
    const open = !!this._openSections[id];
    return html`
      <div class="ed-section ${open ? 'open' : ''}">
        <div class="ed-section-header" @click="${() => this._toggleSection(id)}">
          <div class="ed-section-title">
            ${title}
            ${count !== undefined ? html`<span class="ed-section-count">${count}</span>` : ''}
          </div>
          <span class="ed-section-arrow">▾</span>
        </div>
        <div class="ed-section-body">
          ${open ? content : ''}
        </div>
      </div>
    `;
  }

  // ── Section content builders ──────────────────────────────────────────────

  // ── NEW: Appearance section ───────────────────────────────────────────────
  _appearanceSectionContent() {
    const cfg = this._config;
    const isDefault = (cfg.theme === 'default' || !cfg.theme);
    return html`
      ${isDefault ? html`
        ${this._toggle('✨ Just HA Design', cfg.jha, (v) => this._set('jha', v))}
        ${this._toggle('Frosted Glass Mode', cfg.frosted_glass, (v) => this._set('frosted_glass', v))}
        ${cfg.frosted_glass ? html`
          <p class="hint">
            The card background and all inner tiles use a translucent blur effect.
            Works best when a dynamic wallpaper is visible behind Home Assistant.
          </p>
          ${this._range(
            'Glass Opacity',
            cfg.frosted_opacity !== undefined ? cfg.frosted_opacity : 0.52,
            0.1, 0.9, 0.01,
            (v) => this._set('frosted_opacity', v),
            ''
          )}
          ${this._range(
            'Blur Strength',
            cfg.frosted_blur !== undefined ? cfg.frosted_blur : 22,
            4, 40, 1,
            (v) => this._set('frosted_blur', v),
            'px'
          )}
        ` : ''}
      ` : html`
        <p class="hint">
          Frosted Glass is only available with the <strong>Dark Navy</strong> theme.
          Switch the Theme to Dark Navy in the Header section to enable it.
        </p>
      `}
    `;
  }

  _headerSectionContent() {
    const cfg = this._config;
    const themeOpts = Object.keys(THEMES).map(k => ({ val: k, label: THEMES[k].label }));
    return html`
      ${this._seg('Theme', cfg.theme || 'default', themeOpts, (v) => this._set('theme', v))}
      ${(cfg.theme === 'neon') ? this._seg('Neon Color', cfg.neon_color || 'cyan',
        [{ val: 'cyan', label: '● Cyan' }, { val: 'pink', label: '● Pink' }, { val: 'purple', label: '● Purple' }],
        (v) => this._set('neon_color', v)) : ''}
      ${this._txt('Card Title', cfg.card_title, (v) => this._set('card_title', v), 'Dashboard')}
      ${this._seg('Title Position', cfg.title_position || 'left',
        [{ val: 'left', label: 'Left' }, { val: 'center', label: 'Center' }],
        (v) => this._set('title_position', v))}
      ${this._renderIconPicker(cfg.card_icon, (v) => this._set('card_icon', v), 'mdi:view-dashboard')}
      ${this._toggle('Show Date & Time', cfg.show_datetime, (v) => this._set('show_datetime', v))}
      ${this._toggle('Show Status Dot', cfg.show_status_dot, (v) => this._set('show_status_dot', v))}
      ${cfg.show_status_dot ? html`
        ${this._renderEntityPicker(cfg.status_entity,
          (v) => this._set('status_entity', v),
          ['binary_sensor','sensor','switch','light'],
          'Status Entity (optional)')}
      ` : ''}
    `;
  }

  _camerasSectionContent() {
    const cfg = this._config, self = this;
    const items = cfg.cameras || [];
    return html`
      ${this._txt('Section Label', cfg.label_surveillance, (v) => this._set('label_surveillance', v), 'Surveillance')}
      ${items.map((cam, i) => html`
        <div class="entity-item">
          <div class="entity-item-hd">
            <span class="entity-item-num">Camera ${i + 1}</span>
            <button class="btn-remove" @click="${() => self._removeItem('cameras', i)}">Remove</button>
          </div>
          ${self._renderEntityPicker(cam.entity,
            (v) => {
              self._updateItem('cameras', i, 'entity', v);
              if (v && !cam.label) {
                const fn = stateAttr(self.hass, v, 'friendly_name');
                if (fn) self._updateItem('cameras', i, 'label', fn);
              }
            },
            ['camera'], 'Entity')}
          ${self._txt('Label', cam.label, (v) => self._updateItem('cameras', i, 'label', v), 'Camera name')}
          ${self._renderIconPicker(cam.icon, (v) => self._updateItem('cameras', i, 'icon', v), 'mdi:cctv')}
        </div>
      `)}
      <button class="btn-add" @click="${() => self._addItem('cameras', { entity: '', label: '', icon: 'camera' })}">+ Add Camera</button>
    `;
  }

  _switchesSectionContent() {
    const cfg = this._config, self = this;
    const items = cfg.switches || [];
    const catOpts = [
      { val: 'switch', label: 'Switch' },
      { val: 'light',  label: 'Light' },
      { val: 'motion', label: 'Motion' },
      { val: 'door',   label: 'Door' },
      { val: 'person', label: 'Person' },
    ];
    return html`
      ${this._txt('Section Label', cfg.label_switches, (v) => this._set('label_switches', v), 'Switches')}
      ${items.map((sw, i) => html`
        <div class="entity-item">
          <div class="entity-item-hd">
            <span class="entity-item-num">Switch ${i + 1}</span>
            <button class="btn-remove" @click="${() => self._removeItem('switches', i)}">Remove</button>
          </div>
          ${self._renderEntityPicker(sw.entity,
            (v) => {
              self._updateItem('switches', i, 'entity', v);
              if (v && !sw.label) {
                const fn = stateAttr(self.hass, v, 'friendly_name');
                if (fn) self._updateItem('switches', i, 'label', fn);
              }
            },
            ['switch','light','input_boolean','fan','automation','script','binary_sensor'], 'Entity')}
          ${self._txt('Label', sw.label, (v) => self._updateItem('switches', i, 'label', v), 'Switch name')}
          ${self._renderIconPicker(sw.icon, (v) => self._updateItem('switches', i, 'icon', v), 'mdi:toggle-switch')}
          ${self._select('Category', sw.category || 'switch', catOpts, (v) => self._updateItem('switches', i, 'category', v))}
        </div>
      `)}
      <button class="btn-add" @click="${() => self._addItem('switches', { entity: '', label: '', icon: 'switch_icon', category: 'switch' })}">+ Add Switch</button>
    `;
  }

  _sensorsSectionContent() {
    const cfg = this._config, self = this;
    const items = cfg.sensors || [];
    const catOpts = [
      { val: 'sensor', label: 'Sensor' },
      { val: 'motion', label: 'Motion' },
      { val: 'door',   label: 'Door' },
      { val: 'light',  label: 'Light' },
      { val: 'person', label: 'Person' },
    ];
    return html`
      ${this._txt('Section Label', cfg.label_sensors, (v) => this._set('label_sensors', v), 'Sensors')}
      ${items.map((s, i) => html`
        <div class="entity-item">
          <div class="entity-item-hd">
            <span class="entity-item-num">Sensor ${i + 1}</span>
            <button class="btn-remove" @click="${() => self._removeItem('sensors', i)}">Remove</button>
          </div>
          ${self._renderEntityPicker(s.entity,
            (v) => {
              self._updateItem('sensors', i, 'entity', v);
              if (v && !s.label) {
                const fn = stateAttr(self.hass, v, 'friendly_name');
                if (fn) self._updateItem('sensors', i, 'label', fn);
              }
              if (v) {
                const dc = stateAttr(self.hass, v, 'device_class') || '';
                if (isMotionSensor(v, dc) && !s.category) {
                  self._updateItem('sensors', i, 'category', 'motion');
                }
              }
            },
            ['binary_sensor','sensor','input_boolean','switch','light'], 'Entity')}
          ${self._txt('Label', s.label, (v) => self._updateItem('sensors', i, 'label', v), 'Sensor name')}
          ${self._renderIconPicker(s.icon, (v) => self._updateItem('sensors', i, 'icon', v), 'mdi:sensor')}
          ${self._select('Category', s.category || 'sensor', catOpts, (v) => self._updateItem('sensors', i, 'category', v))}
        </div>
      `)}
      <button class="btn-add" @click="${() => self._addItem('sensors', { entity: '', label: '', icon: 'sensor', category: 'sensor' })}">+ Add Sensor</button>
    `;
  }

  _climateSectionContent() {
    const cfg = this._config, self = this;
    const items = cfg.gauges || [];
    return html`
      ${this._txt('Section Label', cfg.label_climate, (v) => this._set('label_climate', v), 'Climate')}
      ${items.map((g, i) => html`
        <div class="entity-item">
          <div class="entity-item-hd">
            <span class="entity-item-num">Gauge ${i + 1}</span>
            <button class="btn-remove" @click="${() => self._removeItem('gauges', i)}">Remove</button>
          </div>
          ${self._renderEntityPicker(g.temp_entity,
            (v) => self._updateItem('gauges', i, 'temp_entity', v),
            ['sensor'], 'Temperature Entity')}
          ${self._renderEntityPicker(g.humidity_entity,
            (v) => self._updateItem('gauges', i, 'humidity_entity', v),
            ['sensor'], 'Humidity Entity')}
          ${self._txt('Label', g.label, (v) => self._updateItem('gauges', i, 'label', v), 'Room name')}
          ${self._num('Gauge size (px)', g.gauge_size, (v) => self._updateItem('gauges', i, 'gauge_size', parseInt(v) || 54), '54')}
          <div class="ed-field">
            <label class="ed-label">Temperature Thresholds (JSON)</label>
            <input class="ed-input mono" type="text" .value="${g.temp_thresholds || ''}"
              placeholder='[{"max":25,"color":"#6ddb99"},...]'
              @change="${(e) => self._updateItem('gauges', i, 'temp_thresholds', e.target.value)}" />
          </div>
          <div class="ed-field">
            <label class="ed-label">Humidity Thresholds (JSON)</label>
            <input class="ed-input mono" type="text" .value="${g.hum_thresholds || ''}"
              placeholder='[{"max":60,"color":"#6ddb99"},...]'
              @change="${(e) => self._updateItem('gauges', i, 'hum_thresholds', e.target.value)}" />
          </div>
        </div>
      `)}
      <button class="btn-add" @click="${() => self._addItem('gauges', {
        temp_entity: '', humidity_entity: '', label: '',
        temp_thresholds: JSON.stringify(DEFAULT_THRESHOLDS.temperature),
        hum_thresholds:  JSON.stringify(DEFAULT_THRESHOLDS.humidity),
        gauge_size: 54,
      })}">+ Add Gauge</button>
    `;
  }

  _devicesSectionContent() {
    const cfg = this._config, self = this;
    const m = cfg.devices.mower || {};
    return html`
      ${this._txt('Section Label', cfg.label_devices, (v) => this._set('label_devices', v), 'Devices')}
      <div class="entity-item">
        <div class="entity-item-hd">
          <span class="entity-item-num">🤖 Mower</span>
        </div>
        ${this._toggle('Enable Mower', m.enabled, (v) => self._setDeep(['devices','mower','enabled'], v))}
        ${m.enabled ? html`
          ${self._renderEntityPicker(m.entity,
            (v) => {
              self._setDeep(['devices','mower','entity'], v);
              if (v && !m.label) {
                const fn = stateAttr(self.hass, v, 'friendly_name');
                if (fn) self._setDeep(['devices','mower','label'], fn);
              }
            },
            ['lawn_mower','vacuum'], 'Mower Entity')}
          ${self._renderEntityPicker(m.battery_entity,
            (v) => self._setDeep(['devices','mower','battery_entity'], v),
            ['sensor'], 'Battery Entity (optional)')}
          ${self._txt('Display Name', m.label, (v) => self._setDeep(['devices','mower','label'], v), 'Mower')}
        ` : ''}
      </div>
      <div class="devices-future">FUTURE: vacuum · washer · dryer · more</div>
    `;
  }

  _saltSectionContent() {
    const cfg = this._config, self = this;
    return html`
      ${this._txt('Section Label', cfg.label_salt, (v) => this._set('label_salt', v), 'Salt Level')}
      <p class="hint">Provide a % entity directly, OR a distance entity + max value for auto-calc.</p>
      ${this._renderEntityPicker(cfg.salt_entity,
        (v) => this._set('salt_entity', v), ['sensor'], 'Salt Distance Entity')}
      ${this._renderEntityPicker(cfg.salt_pct_entity,
        (v) => this._set('salt_pct_entity', v), ['sensor'], 'Salt % Entity (optional)')}
      ${this._renderEntityPicker(cfg.salt_max_entity,
        (v) => this._set('salt_max_entity', v), ['sensor'], 'Salt Max Entity (optional)')}
      ${this._txt('Salt Max Value', cfg.salt_max_value, (v) => this._set('salt_max_value', v), 'e.g. 0.31')}
      ${this._txt('Display Label', cfg.salt_label, (v) => this._set('salt_label', v), 'Salt Level')}
      ${this._num('Warn Below (%)', cfg.salt_warn_threshold, (v) => this._set('salt_warn_threshold', parseFloat(v) || 30), '30')}
      <div class="ed-field">
        <label class="ed-label">Thresholds (JSON)</label>
        <input class="ed-input mono" type="text" .value="${cfg.salt_thresholds || ''}"
          placeholder='[{"max":30,"color":"#e05050"},...]'
          @change="${(e) => self._set('salt_thresholds', e.target.value)}" />
      </div>
    `;
  }

  _powerSectionContent() {
    const cfg = this._config, self = this;
    const items = cfg.power_circuits || [];
    return html`
      ${this._txt('Section Label', cfg.label_power, (v) => this._set('label_power', v), 'Power')}
      ${items.map((p, i) => html`
        <div class="entity-item">
          <div class="entity-item-hd">
            <span class="entity-item-num">Circuit ${i + 1}</span>
            <button class="btn-remove" @click="${() => self._removeItem('power_circuits', i)}">Remove</button>
          </div>
          ${self._renderEntityPicker(p.entity,
            (v) => {
              self._updateItem('power_circuits', i, 'entity', v);
              if (v && !p.label) {
                const fn = stateAttr(self.hass, v, 'friendly_name');
                if (fn) self._updateItem('power_circuits', i, 'label', fn);
              }
            },
            ['sensor'], 'Power Entity (W)')}
          ${self._renderEntityPicker(p.energy_entity,
            (v) => self._updateItem('power_circuits', i, 'energy_entity', v),
            ['sensor'], 'Energy Entity (kWh) — optional')}
          ${self._renderEntityPicker(p.current_entity,
            (v) => self._updateItem('power_circuits', i, 'current_entity', v),
            ['sensor'], 'Current Entity (A) — optional')}
          ${self._txt('Label', p.label, (v) => self._updateItem('power_circuits', i, 'label', v), 'Circuit name')}
          ${self._num('Max Watts', p.max_w, (v) => self._updateItem('power_circuits', i, 'max_w', parseFloat(v) || 3000), '3000')}
        </div>
      `)}
      <button class="btn-add" @click="${() => self._addItem('power_circuits', {
        entity: '', label: '', energy_entity: '', current_entity: '', max_w: 3000,
      })}">+ Add Circuit</button>
    `;
  }

  _layoutSectionContent() {
    const cfg = this._config, self = this;
    const colOpts = [
      { val: '1', label: '1' }, { val: '2', label: '2' },
      { val: '3', label: '3' }, { val: '4', label: '4' },
    ];
    return html`
      <p class="hint">Set the number of columns for each grid section. Narrower screens auto-collapse.</p>
      ${this._select('Cameras Columns',       String(cfg.cameras_columns  || 3), colOpts, (v) => self._set('cameras_columns',  parseInt(v)))}
      ${this._select('Switches Columns',      String(cfg.switches_columns || 2), colOpts, (v) => self._set('switches_columns', parseInt(v)))}
      ${this._select('Sensors Columns',       String(cfg.sensors_columns  || 2), colOpts, (v) => self._set('sensors_columns',  parseInt(v)))}
      ${this._select('Climate Gauge Columns', String(cfg.gauges_columns   || 2), colOpts, (v) => self._set('gauges_columns',   parseInt(v)))}
      ${this._select('Power Columns',         String(cfg.power_columns    || 2), colOpts, (v) => self._set('power_columns',    parseInt(v)))}
    `;
  }

  // ── Main render ───────────────────────────────────────────────────────────
  render() {
    try {
      if (!this._config) return html``;
      const cfg = this._config;
      const counts = {
        cameras:  (cfg.cameras || []).length,
        switches: (cfg.switches || []).length,
        sensors:  (cfg.sensors || []).length,
        gauges:   (cfg.gauges || []).length,
        power:    (cfg.power_circuits || []).length,
      };
      const deviceCount = (cfg.devices && cfg.devices.mower && cfg.devices.mower.enabled && cfg.devices.mower.entity) ? 1 : 0;

      return html`
        <div class="ed-root">
          ${this._section('header',     'Header',           undefined,       this._headerSectionContent())}
          ${this._section('appearance', '🎨 Appearance',    undefined,       this._appearanceSectionContent())}
          ${this._section('cameras',    'Cameras',          counts.cameras,  this._camerasSectionContent())}
          ${this._section('switches',   'Switches',         counts.switches, this._switchesSectionContent())}
          ${this._section('sensors',    'Sensors',          counts.sensors,  this._sensorsSectionContent())}
          ${this._section('climate',    'Climate (gauges)', counts.gauges,   this._climateSectionContent())}
          ${this._section('devices',    'Devices',          deviceCount,     this._devicesSectionContent())}
          ${this._section('salt',       'Salt Level',       undefined,       this._saltSectionContent())}
          ${this._section('power',      'Power Circuits',   counts.power,    this._powerSectionContent())}
          ${this._section('layout',     'Layout',           undefined,       this._layoutSectionContent())}
        </div>
      `;
    } catch(err) {
      console.error('[MPD-CARD editor render error]', err);
      return html`<div style="padding:16px;color:#ef4444;font-size:12px;font-family:monospace;white-space:pre-wrap">Editor error — check browser console (F12):\n${err && err.message ? err.message : String(err)}</div>`;
    }
  }

  static get styles() {
    return css`
      :host { display: block; font-family: 'Segoe UI', system-ui, sans-serif; }

      .ed-root { display: flex; flex-direction: column; padding: 8px 0; }

      .ed-label {
        display: block;
        font-size: 12px; font-weight: 500;
        color: var(--primary-text-color, rgba(255,255,255,.7));
        margin-bottom: 6px;
        letter-spacing: .2px;
      }
      .ed-field { margin-bottom: 12px; }

      .ed-input, .ed-select {
        width: 100%;
        padding: 10px 12px;
        font-size: 14px;
        font-family: inherit;
        border: 1px solid var(--divider-color, rgba(255,255,255,.1));
        border-radius: 8px;
        background: var(--secondary-background-color, rgba(255,255,255,.04));
        color: var(--primary-text-color, #fff);
        transition: border-color .15s, background .15s;
        box-sizing: border-box;
      }
      .ed-input:focus, .ed-select:focus {
        outline: none;
        border-color: var(--primary-color, #4fa3e0);
      }
      .ed-input.mono { font-family: 'DM Mono', monospace; font-size: 12px; }

      /* Range slider */
      .ed-range-header {
        display: flex; align-items: center; justify-content: space-between;
        margin-bottom: 6px;
      }
      .ed-range-val {
        font-size: 12px; font-weight: 600;
        color: var(--primary-color, #4fa3e0);
        font-family: 'DM Mono', monospace;
        min-width: 36px; text-align: right;
      }
      .ed-range {
        -webkit-appearance: none;
        width: 100%; height: 4px; border-radius: 2px; outline: none; cursor: pointer;
        background: linear-gradient(
          to right,
          var(--primary-color, #4fa3e0) 0%,
          var(--primary-color, #4fa3e0) var(--range-pct, 50%),
          rgba(255,255,255,.12) var(--range-pct, 50%),
          rgba(255,255,255,.12) 100%
        );
      }
      .ed-range::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 16px; height: 16px; border-radius: 50%;
        background: #fff;
        box-shadow: 0 0 0 3px rgba(79,163,224,.4);
        cursor: pointer;
      }
      .ed-range::-moz-range-thumb {
        width: 16px; height: 16px; border-radius: 50%; border: none;
        background: #fff;
        box-shadow: 0 0 0 3px rgba(79,163,224,.4);
        cursor: pointer;
      }

      .hint {
        font-size: 12px;
        color: var(--secondary-text-color, rgba(255,255,255,.5));
        margin: 0 0 10px;
        line-height: 1.5;
      }
      .hint strong { color: var(--primary-text-color, rgba(255,255,255,.8)); }

      ha-entity-picker, ha-device-picker, ha-icon-picker {
        display: block;
        width: 100%;
      }

      /* Collapsible sections */
      .ed-section {
        background: var(--secondary-background-color, rgba(255,255,255,.025));
        border: 1px solid var(--divider-color, rgba(255,255,255,.06));
        border-radius: 10px;
        margin-bottom: 10px;
        overflow: hidden;
      }
      .ed-section-header {
        padding: 12px 14px;
        display: flex; align-items: center; justify-content: space-between;
        cursor: pointer;
        user-select: none;
        transition: background .15s;
      }
      .ed-section-header:hover { background: rgba(255,255,255,.03); }
      .ed-section-title {
        display: flex; align-items: center; gap: 10px;
        font-size: 14px; font-weight: 500;
        color: var(--primary-text-color, #fff);
      }
      .ed-section-count {
        font-size: 11px; font-weight: 500;
        color: var(--secondary-text-color, rgba(255,255,255,.4));
        background: rgba(255,255,255,.05);
        padding: 2px 8px;
        border-radius: 10px;
      }
      .ed-section-arrow {
        color: var(--secondary-text-color, rgba(255,255,255,.4));
        font-size: 12px;
        transition: transform .2s;
      }
      .ed-section.open .ed-section-arrow { transform: rotate(180deg); }
      .ed-section-body { padding: 0 14px; }
      .ed-section.open .ed-section-body { padding: 4px 14px 14px; }

      /* Entity item card */
      .entity-item {
        background: rgba(0,0,0,.18);
        border: 1px solid var(--divider-color, rgba(255,255,255,.05));
        border-radius: 9px;
        padding: 10px;
        margin-bottom: 10px;
      }
      .entity-item-hd {
        display: flex; justify-content: space-between; align-items: center;
        margin-bottom: 8px;
      }
      .entity-item-num {
        font-size: 11px; font-weight: 600;
        color: var(--primary-color, #4fa3e0);
        letter-spacing: .05em; text-transform: uppercase;
      }

      .btn-add {
        width: 100%;
        padding: 10px;
        font-size: 13px; font-weight: 500;
        border: 1px dashed var(--primary-color, #4fa3e0);
        border-radius: 8px;
        background: transparent;
        color: var(--primary-color, #4fa3e0);
        cursor: pointer;
        transition: background .15s;
      }
      .btn-add:hover { background: rgba(79,163,224,.08); }
      .btn-remove {
        padding: 4px 10px; font-size: 11px;
        border: 1px solid #ef4444; border-radius: 6px;
        background: transparent; color: #ef4444;
        cursor: pointer;
      }
      .btn-remove:hover { background: rgba(239,68,68,.1); }

      /* Toggle */
      .toggle-row {
        display: flex; align-items: center; justify-content: space-between;
        padding: 6px 0;
        margin-bottom: 10px;
      }
      .toggle-label {
        font-size: 13px;
        color: var(--primary-text-color, rgba(255,255,255,.75));
      }
      .toggle-wrap {
        position: relative; display: inline-block;
        width: 40px; height: 22px;
        flex-shrink: 0;
      }
      .toggle-wrap input { display: none; }
      .toggle-slider {
        position: absolute; inset: 0;
        background: #334155;
        border-radius: 11px; cursor: pointer;
        transition: background .2s;
      }
      .toggle-slider::before {
        content: ""; position: absolute;
        left: 3px; top: 3px;
        width: 16px; height: 16px;
        background: #fff; border-radius: 50%;
        transition: transform .2s;
      }
      .toggle-wrap input:checked + .toggle-slider {
        background: var(--primary-color, #4fa3e0);
      }
      .toggle-wrap input:checked + .toggle-slider::before {
        transform: translateX(18px);
      }

      /* Segmented */
      .segmented {
        display: inline-flex;
        background: rgba(255,255,255,.04);
        border: 1px solid rgba(255,255,255,.08);
        border-radius: 8px;
        padding: 2px;
      }
      .seg-opt {
        padding: 7px 14px;
        font-size: 12px; font-weight: 500;
        color: var(--secondary-text-color, rgba(255,255,255,.55));
        cursor: pointer;
        border-radius: 6px;
        transition: all .15s;
      }
      .seg-opt.active {
        background: var(--primary-color, #4fa3e0);
        color: #fff;
      }

      .devices-future {
        font-size: 10px;
        color: var(--secondary-text-color, rgba(255,255,255,.38));
        padding: 8px 6px;
        text-align: center;
        letter-spacing: .4px;
      }

      /* Mobile responsiveness */
      @media (max-width: 520px) {
        .ed-section-header { padding: 10px 12px; }
        .entity-item { padding: 8px; }
      }
    `;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Camera stream sub-element (unchanged)
// ════════════════════════════════════════════════════════════════════════════
class MpdCamStream extends LitElement {
  static get properties() {
    return { hass: {}, stateObj: {}, label: {}, entityId: {} };
  }

  _fireMoreInfo() {
    if (!this.entityId) return;
    this.dispatchEvent(new CustomEvent('hass-more-info', {
      bubbles: true, composed: true, detail: { entityId: this.entityId },
    }));
  }

  updated(changedProps) {
    if (!changedProps.has('stateObj') && !changedProps.has('hass')) return;
    const stream = this.shadowRoot.querySelector('ha-camera-stream');
    if (!stream) return;
    if (stream._rcLastStateObj === this.stateObj && stream._rcLastHass === this.hass) return;
    stream._rcLastStateObj = this.stateObj;
    stream._rcLastHass     = this.hass;
    stream.hass     = this.hass;
    stream.stateObj = this.stateObj;
    if (typeof stream.requestUpdate === 'function') stream.requestUpdate();
  }

  render() {
    if (!this.stateObj) return html``;
    return html`
      <div class="stream-wrap" @click="${() => this._fireMoreInfo()}">
        <ha-camera-stream allow-exoplayer muted playsinline></ha-camera-stream>
      </div>`;
  }

  static get styles() {
    return css`
      :host { display: block; }
      .stream-wrap {
        position: relative;
        border-radius: 11px; overflow: hidden;
        background: #0a0e1a;
        border: 1px solid rgba(255,255,255,.08);
        min-height: 90px; cursor: pointer;
      }
      ha-camera-stream {
        width: 100%; display: block;
        max-height: 350px; object-fit: cover;
        --video-border-radius: 0;
      }
    `;
  }
}

// ════════════════════════════════════════════════════════════════════════════
// Register custom elements
// ════════════════════════════════════════════════════════════════════════════
customElements.define('mpd-cam-stream', MpdCamStream);
customElements.define('multi-panel-dashboard-card', MultiPanelDashboardCard);
customElements.define('multi-panel-dashboard-card-editor', MultiPanelDashboardCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type:             'multi-panel-dashboard-card',
  name:             'Multi-Panel Dashboard Card',
  description:      'Unified dashboard card — header/cameras/sensors/climate/devices (mower)/salt/power — v3.2',
  preview:          true,
  documentationURL: 'https://github.com/robman2026/multi-panel-dashboard-card',
});

console.info(
  '%c MULTI-PANEL-DASHBOARD-CARD %c v' + CARD_VERSION + ' ',
  'background:#4fa3e0;color:#fff;font-weight:700;padding:2px 6px;border-radius:4px 0 0 4px;',
  'background:#181c27;color:#6dbfff;font-weight:600;padding:2px 6px;border-radius:0 4px 4px 0;'
);
