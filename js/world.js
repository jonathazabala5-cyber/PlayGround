import {
  W, H, RIVER, POS, GATE, TREE_PALETTES, TAU,
  clamp, mulberry32, distanceToPath, insideClearing, inRiver, inReserved,
  PATH_SAMPLES
} from './config.js';
import { makeTreeSprite, makePalmSprite, makeBushSprite } from './sprites.js';
import { paintGround } from './terrain.js';

function buildRiverShape() {
  const left = [];
  const right = [];
  for (let y = -50; y <= H + 50; y += 28) {
    left.push([RIVER.x1 + Math.sin(y * 0.019 + 1.4) * 7 + Math.sin(y * 0.0061 + 0.4) * 5, y]);
    right.push([RIVER.x2 + Math.sin(y * 0.017 + 3.2) * 8 + Math.cos(y * 0.0053) * 4, y]);
  }
  const path = new Path2D();
  path.moveTo(left[0][0], left[0][1]);
  for (let i = 1; i < left.length; i += 1) path.lineTo(left[i][0], left[i][1]);
  for (let i = right.length - 1; i >= 0; i -= 1) path.lineTo(right[i][0], right[i][1]);
  path.closePath();
  return { left, right, path };
}

export function createWorld() {
  const rand = mulberry32(0x51EDBEEF);
  const world = {
    ground: null,
    sprites: {
      trees: [],
      palms: [],
      bushes: []
    },
    trees: [],
    bushes: [],
    props: [],
    obstacles: [],
    scenery: [],
    glints: [],
    fireflies: [],
    goldMotes: [],
    pathSamples: PATH_SAMPLES,
    river: buildRiverShape(),
    gate: { progress: 0 },
    canoe: { x: 1068, y: 900, side: 'west' },
    cave: { x: 250, y: 1580, rx: 315, ry: 330 },
    glyphs: { jaguar: { x: POS.shrine.x, y: POS.shrine.y }, serpent: { x: POS.caveStone.x, y: POS.caveStone.y }, sun: { x: POS.sunStone.x, y: POS.sunStone.y } }
  };

  for (let i = 0; i < 6; i += 1) world.sprites.trees.push(makeTreeSprite(TREE_PALETTES[i], mulberry32(1000 + i * 77)));
  for (let i = 0; i < 3; i += 1) world.sprites.palms.push(makePalmSprite(mulberry32(2000 + i * 31), i));
  for (let i = 0; i < 4; i += 1) world.sprites.bushes.push(makeBushSprite(mulberry32(3000 + i * 19), i));

  const treePoints = [];

  function canPlaceTree(x, y, radius) {
    if (x < 70 || x > W - 70 || y < 70 || y > H - 70) return false;
    if (inRiver(x, y, 46)) return false;
    if (insideClearing(x, y, 1.04)) return false;
    if (distanceToPath(x, y) < 72) return false;
    if (inReserved(x, y, 16)) return false;
    for (const p of treePoints) {
      if ((p[0] - x) ** 2 + (p[1] - y) ** 2 < (radius + p[2] + 32) ** 2) return false;
    }
    return true;
  }

  // Dense jungle canopy.
  for (let gy = 80; gy < H; gy += 122) {
    for (let gx = 80; gx < W; gx += 126) {
      if (rand() < 0.43) continue;
      const x = gx + (rand() - 0.5) * 86;
      const y = gy + (rand() - 0.5) * 80;
      const s = 0.78 + rand() * 0.52;
      const variant = Math.floor(rand() * 6);
      if (!canPlaceTree(x, y, 42 * s)) continue;
      treePoints.push([x, y, 40 * s]);
      world.trees.push({ kind: 'tree', x, y, s, variant, sprite: world.sprites.trees[variant], ax: 160, ay: 340, bw: 320, bh: 360, radius: 15 * s });
      world.obstacles.push({ type: 'circle', x, y: y - 4, r: 15 * s });
    }
  }

  // Palms leaning over the river.
  for (const side of [-1, 1]) {
    for (let i = 0; i < 20; i += 1) {
      const y = 90 + rand() * (H - 180);
      if (y > 790 && y < 1010) continue;
      const x = side < 0 ? RIVER.x1 - 28 - rand() * 66 : RIVER.x2 + 28 + rand() * 66;
      if (distanceToPath(x, y) < 46) continue;
      if (insideClearing(x, y, 0.98)) continue;
      const s = 0.8 + rand() * 0.4;
      const variant = Math.floor(rand() * 3);
      world.trees.push({ kind: 'palm', x, y, s, variant, sprite: world.sprites.palms[variant], ax: 130, ay: 348, bw: 260, bh: 370, radius: 10 * s });
      world.obstacles.push({ type: 'circle', x, y: y - 3, r: 11 * s });
    }
  }

  // Understory.
  for (let i = 0; i < 190; i += 1) {
    const x = 60 + rand() * (W - 120);
    const y = 60 + rand() * (H - 120);
    if (inRiver(x, y, 22)) continue;
    if (insideClearing(x, y, 0.93)) continue;
    if (distanceToPath(x, y) < 38) continue;
    if (inReserved(x, y, 8)) continue;
    const s = 0.65 + rand() * 0.55;
    world.bushes.push({ kind: 'bush', x, y, s, sprite: world.sprites.bushes[Math.floor(rand() * 4)], ax: 90, ay: 132, bw: 180, bh: 150 });
  }

  const props = [
    { kind: 'banner', x: POS.banner.x, y: POS.banner.y, s: 1 },
    { kind: 'tent', x: POS.tentA.x, y: POS.tentA.y + 24, s: 1.08 },
    { kind: 'tent', x: POS.tentB.x, y: POS.tentB.y + 26, s: 0.94, flip: true },
    { kind: 'crate', x: POS.crate.x, y: POS.crate.y + 12, s: 1 },
    { kind: 'campfire', x: POS.campfire.x, y: POS.campfire.y + 6, s: 1 },
    { kind: 'torch', x: POS.torch.x, y: POS.torch.y + 10, s: 1 },
    { kind: 'shrineArch', x: 650, y: 520, s: 1 },
    { kind: 'altar', variant: 'jaguar', x: POS.altarJaguar.x, y: POS.altarJaguar.y + 28, s: 1 },
    { kind: 'altar', variant: 'sun', x: POS.sunAltar.x, y: POS.sunAltar.y + 56, s: 1.2 },
    { kind: 'vines', x: POS.vines.x, y: POS.vines.y + 16, s: 1 },
    { kind: 'caveMouth', x: POS.caveMouth.x, y: POS.caveMouth.y + 18, s: 1 },
    { kind: 'pillar', x: 1535, y: 692, s: 1, broken: false },
    { kind: 'pillar', x: 1618, y: 1088, s: 0.9, broken: true },
    { kind: 'pillar', x: 2188, y: 628, s: 1.12, broken: false },
    { kind: 'pillar', x: 2518, y: 1052, s: 0.86, broken: true },
    { kind: 'pillar', x: 1832, y: 1048, s: 0.8, broken: true },
    { kind: 'giantHead', x: 1868, y: 1132, s: 1 },
    { kind: 'guardian', x: 2708, y: 748, s: 1, flip: false },
    { kind: 'guardian', x: 2708, y: 1052, s: 1, flip: true },
    { kind: 'gate', x: GATE.x, y: GATE.y, s: 1 },
    { kind: 'guardian', x: 3106, y: 1246, s: 1.05, flip: true, gold: true }
  ];

  world.props = props;
  world.scenery = [...world.trees, ...world.bushes, ...props];

  // Obstacles for solid props.
  const addCircle = (x, y, r) => world.obstacles.push({ type: 'circle', x, y, r });
  addCircle(POS.tentA.x, POS.tentA.y + 6, 46);
  addCircle(POS.tentB.x, POS.tentB.y + 6, 40);
  addCircle(POS.crate.x, POS.crate.y + 2, 17);
  addCircle(POS.campfire.x, POS.campfire.y + 2, 21);
  addCircle(POS.yara.x, POS.yara.y, 11);
  addCircle(580, 492, 16);
  addCircle(720, 492, 16);
  addCircle(POS.altarJaguar.x, POS.altarJaguar.y + 6, 34);
  addCircle(128, 1392, 56);
  addCircle(372, 1392, 56);
  for (const p of props) {
    if (p.kind === 'pillar') addCircle(p.x, p.y - 4, 21 * p.s);
    if (p.kind === 'guardian') addCircle(p.x, p.y - 4, 22 * p.s);
    if (p.kind === 'giantHead') addCircle(p.x, p.y - 8, 44 * p.s);
  }
  world.obstacles.push({ type: 'rect', x: 3018, y: 452, w: 512, h: 492 });
  world.obstacles.push({ type: 'rect', x: GATE.wallX1, y: 560, w: GATE.wallX2 - GATE.wallX1, h: GATE.gapTop - 560 });
  world.obstacles.push({ type: 'rect', x: GATE.wallX1, y: GATE.gapBottom, w: GATE.wallX2 - GATE.wallX1, h: 270 });

  // Animated river sparkles.
  for (let i = 0; i < 100; i += 1) {
    world.glints.push({
      x: RIVER.x1 + 16 + rand() * (RIVER.x2 - RIVER.x1 - 32),
      y: rand() * (H + 160) - 80,
      len: 3 + rand() * 14,
      speed: 10 + rand() * 26,
      alpha: 0.05 + rand() * 0.16,
      phase: rand() * TAU
    });
  }

  // Fireflies and gold motes.
  const fireflySpots = [
    [420, 980, 360, 300], [1180, 900, 340, 500], [2020, 900, 430, 340], [650, 380, 170, 170], [2835, 900, 200, 250]
  ];
  for (let i = 0; i < 78; i += 1) {
    const spot = fireflySpots[Math.floor(rand() * fireflySpots.length)];
    world.fireflies.push({
      x: spot[0] + (rand() - 0.5) * spot[2],
      y: spot[1] + (rand() - 0.5) * spot[3],
      phase: rand() * TAU,
      speed: 0.25 + rand() * 0.55,
      radius: 8 + rand() * 22,
      size: 1.2 + rand() * 1.7
    });
  }
  for (let i = 0; i < 46; i += 1) {
    world.goldMotes.push({
      x: 2920 + rand() * 600,
      y: 600 + rand() * 900,
      phase: rand() * TAU,
      speed: 0.2 + rand() * 0.5,
      radius: 10 + rand() * 26,
      size: 1 + rand() * 2.1
    });
  }

  world.ground = paintGround(world, mulberry32(0xC0FFEE));
  return world;
}

export function drawWater(g, world, time) {
  g.save();
  g.clip(world.river.path);

  const grad = g.createLinearGradient(RIVER.x1, 0, RIVER.x2, 0);
  grad.addColorStop(0, 'rgba(8, 43, 45, .35)');
  grad.addColorStop(0.22, 'rgba(20, 89, 88, .12)');
  grad.addColorStop(0.55, 'rgba(53, 151, 138, .08)');
  grad.addColorStop(1, 'rgba(8, 40, 43, .42)');
  g.fillStyle = grad;
  g.fillRect(RIVER.x1 - 30, 0, RIVER.x2 - RIVER.x1 + 60, H);

  // Soft moving bands.
  for (let i = 0; i < 9; i += 1) {
    const y = ((i * 233 + time * 14) % (H + 300)) - 150;
    g.globalAlpha = 0.035 + (i % 3) * 0.012;
    g.fillStyle = '#b7efe2';
    g.fillRect(RIVER.x1, y, RIVER.x2 - RIVER.x1, 44 + (i % 4) * 32);
  }

  // Sparkles.
  for (const s of world.glints) {
    const y = ((s.y + time * s.speed) % (H + 160)) - 80;
    const x = s.x + Math.sin(time * 0.8 + s.phase) * 5;
    const a = s.alpha * (0.55 + 0.45 * Math.sin(time * 1.7 + s.phase));
    g.globalAlpha = a;
    g.fillStyle = '#d9fff5';
    g.beginPath();
    g.ellipse(x, y, s.len * 0.5, 0.9, 0, 0, TAU);
    g.fill();
  }

  // Little ripples.
  g.globalAlpha = 1;
  for (let i = 0; i < 5; i += 1) {
    const y = 300 + i * 330 + Math.sin(time * 0.4 + i) * 26;
    g.strokeStyle = 'rgba(196, 245, 229, .13)';
    g.lineWidth = 1;
    g.beginPath();
    g.ellipse(RIVER.x1 + 34 + i * 24, y, 20 + (i % 3) * 9, 4, 0, 0, TAU);
    g.stroke();
  }
  g.restore();

  // Foam along the banks.
  g.save();
  g.lineCap = 'round';
  for (const side of [world.river.left, world.river.right]) {
    for (let i = 2; i < side.length - 2; i += 3) {
      const [x, y] = side[i];
      const shimmer = 0.5 + 0.5 * Math.sin(time * 1.3 + y * 0.05);
      g.globalAlpha = 0.08 + shimmer * 0.13;
      g.strokeStyle = '#d7f7e7';
      g.lineWidth = 1.2;
      g.beginPath();
      g.moveTo(x, y);
      g.lineTo(x + Math.sin(time + y) * 7, y + 1);
      g.stroke();
    }
  }
  g.restore();
}
