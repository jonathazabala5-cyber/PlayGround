// Shared world data, palette and small math/drawing helpers.
export const TAU = Math.PI * 2;

export const W = 3600;
export const H = 1900;
export const TS = 1.25;
export const RIVER = { x1: 1036, x2: 1224 };
export const GATE = { x: 2835, y: 900, wallX1: 2790, wallX2: 2880, gapTop: 830, gapBottom: 970 };
export const START = { x: 475, y: 960 };
export const PLAYER_R = 13;

export const POS = {
  yara: { x: 552, y: 890 },
  campfire: { x: 365, y: 1032 },
  tentA: { x: 305, y: 935 },
  tentB: { x: 588, y: 1088 },
  crate: { x: 458, y: 1028 },
  banner: { x: 242, y: 1012 },
  torch: { x: 406, y: 1062 },
  shrine: { x: 650, y: 332 },
  altarJaguar: { x: 650, y: 372 },
  vines: { x: 650, y: 486 },
  caveEntrance: { x: 250, y: 1368 },
  caveStone: { x: 250, y: 1648 },
  caveMouth: { x: 250, y: 1382 },
  dockWest: { x: 984, y: 900 },
  dockEast: { x: 1282, y: 900 },
  sunAltar: { x: 2350, y: 792 },
  sunStone: { x: 2350, y: 772 },
  gate: { x: GATE.x, y: 900 },
  city: { x: 3260, y: 1080 }
};

export const PATHS = [
  [[430, 985], [560, 958], [700, 940], [850, 918], [958, 902]],
  [[468, 900], [528, 800], [584, 682], [622, 558], [650, 472], [650, 392]],
  [[432, 1016], [402, 1120], [352, 1218], [302, 1298], [272, 1352]],
  [[1288, 902], [1440, 892], [1580, 878], [1708, 872]],
  [[1708, 872], [1840, 862], [1990, 870], [2140, 882], [2250, 882]],
  [[2250, 882], [2318, 850], [2346, 816]],
  [[2250, 882], [2400, 896], [2550, 906], [2676, 904], [2762, 900]],
  [[2880, 900], [2960, 928], [3060, 982], [3160, 1030], [3258, 1068]]
];

export const CLEARINGS = [
  { x: 420, y: 975, rx: 325, ry: 255 },
  { x: 650, y: 362, rx: 178, ry: 208 },
  { x: 250, y: 1470, rx: 255, ry: 405 },
  { x: 2040, y: 880, rx: 535, ry: 365 },
  { x: 2835, y: 900, rx: 185, ry: 355 },
  { x: 3260, y: 1090, rx: 425, ry: 430 }
];

const RESERVED = [
  [110, 760, 660, 500],
  [505, 240, 300, 320],
  [20, 1220, 570, 560],
  [1440, 540, 1200, 660],
  [2690, 620, 300, 560],
  [2980, 400, 610, 1060]
];

export const PALETTE = {
  gold: '#e8b866',
  goldBright: '#ffd98a',
  cream: '#f3e8cf',
  ink: '#071a12'
};

export const TREE_PALETTES = [
  { dark: '#10351f', mid: '#1b4f2d', light: '#2b6f3e', hi: '#479459', rim: '#7fbd6b' },
  { dark: '#0d2d1e', mid: '#17452b', light: '#246039', hi: '#3d8650', rim: '#6fae62' },
  { dark: '#123a26', mid: '#1d5534', light: '#2f7344', hi: '#4c9a5f', rim: '#8cc673' },
  { dark: '#163a22', mid: '#234f2c', light: '#35683a', hi: '#568f4a', rim: '#9ac06e' },
  { dark: '#0e3324', mid: '#185238', light: '#287350', hi: '#42996d', rim: '#79c491' },
  { dark: '#19351f', mid: '#27512b', light: '#3a6c38', hi: '#5a9049', rim: '#a4c276' }
];

// ---------- math ----------

export function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
export function lerp(a, b, t) { return a + (b - a) * t; }
export function invLerp(a, b, v) { return clamp((v - a) / (b - a), 0, 1); }
export function smoothstep(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
export function easeInOut(t) { t = clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
export function easeOut(t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); }
export function dist2(ax, ay, bx, by) { const dx = ax - bx, dy = ay - by; return dx * dx + dy * dy; }
export function dist(ax, ay, bx, by) { return Math.hypot(ax - bx, ay - by); }
export function angleTo(ax, ay, bx, by) { return Math.atan2(by - ay, bx - ax); }

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function random() {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function formatTime(seconds) {
  const s = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

// ---------- path helpers ----------

export function buildPathSamples(paths, step = 22) {
  const out = [];
  for (const pts of paths) {
    for (let i = 0; i < pts.length - 1; i += 1) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[i + 1];
      const len = Math.hypot(x2 - x1, y2 - y1);
      const count = Math.max(1, Math.ceil(len / step));
      for (let j = 0; j <= count; j += 1) {
        const t = j / count;
        out.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]);
      }
    }
  }
  return out;
}

export const PATH_SAMPLES = buildPathSamples(PATHS);

export function distanceToPath(x, y) {
  let best = Infinity;
  for (const [px, py] of PATH_SAMPLES) {
    const d = (px - x) * (px - x) + (py - y) * (py - y);
    if (d < best) best = d;
  }
  return Math.sqrt(best);
}

export function insideClearing(x, y, pad = 1) {
  return CLEARINGS.some(c => {
    const nx = (x - c.x) / (c.rx * pad);
    const ny = (y - c.y) / (c.ry * pad);
    return nx * nx + ny * ny < 1;
  });
}

export function inReserved(x, y, pad = 0) {
  return RESERVED.some(([rx, ry, rw, rh]) =>
    x > rx - pad && x < rx + rw + pad && y > ry - pad && y < ry + rh + pad);
}

export function inRiver(x, y, pad = 0) {
  return x > RIVER.x1 - pad && x < RIVER.x2 + pad && y > -pad && y < H + pad;
}

// ---------- drawing helpers ----------

export function rrect(g, x, y, w, h, r) {
  if (w < 0) { x += w; w = -w; }
  if (h < 0) { y += h; h = -h; }
  const rr = Math.min(r, w / 2, h / 2);
  g.beginPath();
  g.moveTo(x + rr, y);
  g.lineTo(x + w - rr, y);
  g.quadraticCurveTo(x + w, y, x + w, y + rr);
  g.lineTo(x + w, y + h - rr);
  g.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  g.lineTo(x + rr, y + h);
  g.quadraticCurveTo(x, y + h, x, y + h - rr);
  g.lineTo(x, y + rr);
  g.quadraticCurveTo(x, y, x + rr, y);
  g.closePath();
}

export function ellipse(g, x, y, rx, ry, fill) {
  g.beginPath();
  g.ellipse(x, y, rx, ry, 0, 0, TAU);
  if (fill) { g.fillStyle = fill; g.fill(); }
}

export function blob(g, cx, cy, rx, ry, points, rand, rot = 0) {
  const verts = [];
  for (let i = 0; i < points; i += 1) {
    const a = rot + (i / points) * TAU;
    const wobble = 0.78 + rand() * 0.36;
    verts.push([cx + Math.cos(a) * rx * wobble, cy + Math.sin(a) * ry * wobble]);
  }
  g.beginPath();
  for (let i = 0; i < verts.length; i += 1) {
    const p = verts[i];
    const next = verts[(i + 1) % verts.length];
    const mx = (p[0] + next[0]) / 2;
    const my = (p[1] + next[1]) / 2;
    if (i === 0) g.moveTo(mx, my);
    else g.quadraticCurveTo(p[0], p[1], mx, my);
    if (i === verts.length - 1) g.quadraticCurveTo(p[0], p[1], mx, my);
  }
  g.closePath();
}

export function smoothStroke(g, pts, width, color, alpha = 1) {
  if (pts.length < 2) return;
  g.save();
  g.globalAlpha = alpha;
  g.strokeStyle = color;
  g.lineWidth = width;
  g.lineCap = 'round';
  g.lineJoin = 'round';
  g.beginPath();
  g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i += 1) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2;
    const my = (pts[i][1] + pts[i + 1][1]) / 2;
    g.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
  }
  const last = pts[pts.length - 1];
  g.lineTo(last[0], last[1]);
  g.stroke();
  g.restore();
}

export function drawStar(g, x, y, outer, inner, points, color) {
  g.beginPath();
  for (let i = 0; i < points * 2; i += 1) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (i / (points * 2)) * TAU - Math.PI / 2;
    const px = x + Math.cos(a) * r;
    const py = y + Math.sin(a) * r;
    if (i === 0) g.moveTo(px, py); else g.lineTo(px, py);
  }
  g.closePath();
  g.fillStyle = color;
  g.fill();
}
