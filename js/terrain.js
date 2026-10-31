import {
  W, H, TS, RIVER, PATHS, POS, TAU,
  ellipse, blob, smoothStroke, rrect, drawStar,
  distanceToPath, inReserved, mulberry32
} from './config.js';

function paintBase(g, rand) {
  const base = g.createLinearGradient(0, 0, W, H);
  base.addColorStop(0, '#12301e');
  base.addColorStop(0.35, '#0d2819');
  base.addColorStop(0.7, '#102f1e');
  base.addColorStop(1, '#0b2316');
  g.fillStyle = base;
  g.fillRect(0, 0, W, H);

  // Pools of sunlight.
  for (let i = 0; i < 16; i += 1) {
    const x = rand() * W;
    const y = rand() * H;
    const r = 140 + rand() * 460;
    const grad = g.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, 'rgba(158, 184, 96, .12)');
    grad.addColorStop(0.5, 'rgba(104, 146, 70, .05)');
    grad.addColorStop(1, 'rgba(80, 120, 60, 0)');
    g.fillStyle = grad;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }

  // Mossy tonal patches.
  const tones = ['#1a442b', '#225035', '#143822', '#2a5b39', '#0f2e1d', '#1e4a30'];
  for (let i = 0; i < 900; i += 1) {
    const x = rand() * W;
    const y = rand() * H;
    const rx = 18 + rand() * 120;
    const ry = 10 + rand() * 70;
    g.globalAlpha = 0.035 + rand() * 0.05;
    ellipse(g, x, y, rx, ry, tones[Math.floor(rand() * tones.length)]);
  }

  // Canopy shade.
  for (let i = 0; i < 140; i += 1) {
    const x = rand() * W;
    const y = rand() * H;
    g.globalAlpha = 0.035 + rand() * 0.04;
    ellipse(g, x, y, 70 + rand() * 140, 40 + rand() * 70, '#020d08');
  }
  g.globalAlpha = 1;

  // Fine ground grain.
  for (let i = 0; i < 2600; i += 1) {
    g.globalAlpha = 0.03 + rand() * 0.08;
    g.fillStyle = rand() > 0.5 ? '#79a464' : '#06150d';
    const x = rand() * W;
    const y = rand() * H;
    g.fillRect(x, y, 1 + rand() * 2, 1 + rand() * 1.5);
  }
  g.globalAlpha = 1;
}

function paintClearings(g, rand) {
  // Camp: trodden earth.
  const campGrad = g.createRadialGradient(420, 970, 40, 420, 970, 320);
  campGrad.addColorStop(0, 'rgba(118, 92, 56, .78)');
  campGrad.addColorStop(0.55, 'rgba(91, 71, 43, .5)');
  campGrad.addColorStop(1, 'rgba(60, 55, 32, 0)');
  g.fillStyle = campGrad;
  ellipse(g, 420, 970, 330, 265);
  g.fill();

  const shrineGrad = g.createRadialGradient(650, 370, 10, 650, 370, 190);
  shrineGrad.addColorStop(0, 'rgba(76, 91, 56, .55)');
  shrineGrad.addColorStop(0.65, 'rgba(48, 68, 44, .32)');
  shrineGrad.addColorStop(1, 'rgba(30, 50, 33, 0)');
  g.fillStyle = shrineGrad;
  ellipse(g, 650, 370, 190, 215);
  g.fill();

  const caveGrad = g.createRadialGradient(250, 1460, 30, 250, 1460, 340);
  caveGrad.addColorStop(0, 'rgba(22, 28, 20, .86)');
  caveGrad.addColorStop(0.7, 'rgba(20, 30, 20, .55)');
  caveGrad.addColorStop(1, 'rgba(20, 30, 20, 0)');
  g.fillStyle = caveGrad;
  ellipse(g, 250, 1460, 275, 400);
  g.fill();

  // Sand and charcoal speckles in camp.
  for (let i = 0; i < 120; i += 1) {
    const a = rand() * TAU;
    const rr = Math.sqrt(rand());
    const x = 420 + Math.cos(a) * rr * 260;
    const y = 970 + Math.sin(a) * rr * 205;
    g.globalAlpha = 0.18 + rand() * 0.2;
    g.fillStyle = rand() > 0.62 ? '#3d2e1d' : '#b0905e';
    g.beginPath();
    g.arc(x, y, 0.7 + rand() * 1.8, 0, TAU);
    g.fill();
  }
  g.globalAlpha = 1;
}

function paintPaths(g, rand) {
  for (const pts of PATHS) {
    smoothStroke(g, pts, 98, '#1c2a16', 0.42);
    smoothStroke(g, pts, 76, '#5a4529', 0.92);
    smoothStroke(g, pts, 48, '#7d5e39', 0.95);
    smoothStroke(g, pts, 20, '#9b794c', 0.55);
    // Dappled path texture.
    for (let i = 0; i < 26; i += 1) {
      const seg = Math.floor(rand() * (pts.length - 1));
      const t = rand();
      const x = pts[seg][0] + (pts[seg + 1][0] - pts[seg][0]) * t + (rand() - 0.5) * 46;
      const y = pts[seg][1] + (pts[seg + 1][1] - pts[seg][1]) * t + (rand() - 0.5) * 34;
      g.globalAlpha = 0.1 + rand() * 0.16;
      ellipse(g, x, y, 2 + rand() * 8, 1 + rand() * 4, rand() > 0.5 ? '#c1a474' : '#3b2b18');
    }
  }
  g.globalAlpha = 1;
}

function paintRiver(g, world, rand) {
  const { x1, x2 } = RIVER;
  g.save();
  g.clip(world.river.path);

  const water = g.createLinearGradient(x1, 0, x2, 0);
  water.addColorStop(0, '#072a31');
  water.addColorStop(0.12, '#0b4145');
  water.addColorStop(0.35, '#0f5b5a');
  water.addColorStop(0.55, '#116762');
  water.addColorStop(0.78, '#0c4f4e');
  water.addColorStop(1, '#06262d');
  g.fillStyle = water;
  g.fillRect(x1 - 20, 0, x2 - x1 + 40, H);

  // Deep current shadows.
  for (let i = 0; i < 34; i += 1) {
    const x = x1 + rand() * (x2 - x1);
    const y = rand() * H;
    g.globalAlpha = 0.05 + rand() * 0.08;
    ellipse(g, x, y, 20 + rand() * 70, 5 + rand() * 20, '#02181d');
  }
  g.globalAlpha = 1;

  // Shallow edges.
  const shallowL = g.createLinearGradient(x1, 0, x1 + 46, 0);
  shallowL.addColorStop(0, 'rgba(90, 150, 124, .38)');
  shallowL.addColorStop(1, 'rgba(40, 110, 100, 0)');
  g.fillStyle = shallowL;
  g.fillRect(x1 - 10, 0, 56, H);
  const shallowR = g.createLinearGradient(x2, 0, x2 - 46, 0);
  shallowR.addColorStop(0, 'rgba(90, 150, 124, .35)');
  shallowR.addColorStop(1, 'rgba(40, 110, 100, 0)');
  g.fillStyle = shallowR;
  g.fillRect(x2 - 46, 0, 56, H);

  // Submerged rocks.
  for (let i = 0; i < 26; i += 1) {
    const x = x1 + 24 + rand() * (x2 - x1 - 48);
    const y = 40 + rand() * (H - 80);
    const rx = 8 + rand() * 20;
    const ry = 4 + rand() * 9;
    g.globalAlpha = 0.32;
    ellipse(g, x, y, rx, ry, '#041b1d');
    g.globalAlpha = 0.24;
    ellipse(g, x - rx * 0.15, y - ry * 0.3, rx * 0.6, ry * 0.45, '#7cb7a2');
    g.globalAlpha = 0.35;
    g.strokeStyle = '#c9f1e0';
    g.lineWidth = 1;
    g.beginPath();
    g.ellipse(x + 3, y + 2, rx * 1.1, ry * 1.2, 0, 0.2, 2.4);
    g.stroke();
  }
  g.globalAlpha = 1;

  // Light streaks.
  for (let i = 0; i < 18; i += 1) {
    const x = x1 + 30 + rand() * (x2 - x1 - 60);
    const y = rand() * H;
    g.globalAlpha = 0.04 + rand() * 0.06;
    g.fillStyle = '#c4f5e6';
    g.fillRect(x, y, 2 + rand() * 3, 40 + rand() * 90);
  }
  g.globalAlpha = 1;
  g.restore();

  // Banks.
  for (const side of [world.river.left, world.river.right]) {
    g.save();
    g.lineJoin = 'round';
    g.lineCap = 'round';
    g.strokeStyle = '#2c3b22';
    g.globalAlpha = 0.85;
    g.lineWidth = 34;
    g.beginPath();
    g.moveTo(side[0][0], side[0][1]);
    for (let i = 1; i < side.length; i += 1) g.lineTo(side[i][0], side[i][1]);
    g.stroke();
    g.strokeStyle = '#5a6540';
    g.globalAlpha = 0.7;
    g.lineWidth = 13;
    g.stroke();
    g.strokeStyle = 'rgba(178, 203, 149, .26)';
    g.lineWidth = 3;
    g.stroke();
    g.restore();

    // Wet sand and pebbles.
    for (let i = 2; i < side.length - 2; i += 2) {
      const [x, y] = side[i];
      if (rand() < 0.55) {
        g.globalAlpha = 0.2 + rand() * 0.2;
        ellipse(g, x + (rand() - 0.5) * 22, y + (rand() - 0.5) * 9, 3 + rand() * 9, 1.4 + rand() * 3, '#b4a16e');
      }
    }
    g.globalAlpha = 1;
  }
}

function drawPlaza(g, rand, cx, cy, rx, ry, palette) {
  g.save();
  g.beginPath();
  g.ellipse(cx, cy, rx, ry, 0, 0, TAU);
  g.clip();

  const base = g.createRadialGradient(cx, cy - ry * 0.15, 40, cx, cy, rx);
  base.addColorStop(0, palette.center);
  base.addColorStop(0.72, palette.mid);
  base.addColorStop(1, palette.edge);
  g.fillStyle = base;
  g.fillRect(cx - rx, cy - ry, rx * 2, ry * 2);

  // Stone tiles.
  const tw = 58;
  const th = 46;
  for (let y = cy - ry - th; y < cy + ry + th; y += th) {
    for (let x = cx - rx - tw; x < cx + rx + tw; x += tw) {
      if (rand() < 0.08) continue;
      const ox = (Math.floor(y / th) % 2) * tw * 0.5;
      const px = x + ox + (rand() - 0.5) * 3;
      const py = y + (rand() - 0.5) * 2;
      g.globalAlpha = 0.24 + rand() * 0.26;
      g.fillStyle = palette.tiles[Math.floor(rand() * palette.tiles.length)];
      rrect(g, px + 1, py + 1, tw - 3, th - 3, 2);
      g.fill();
      g.globalAlpha = 0.2;
      g.strokeStyle = palette.line;
      g.lineWidth = 1;
      g.stroke();
    }
  }
  g.globalAlpha = 1;

  // Cracks.
  g.strokeStyle = palette.crack;
  for (let i = 0; i < 26; i += 1) {
    let x = cx - rx + rand() * rx * 2;
    let y = cy - ry + rand() * ry * 2;
    g.globalAlpha = 0.16 + rand() * 0.28;
    g.lineWidth = 0.7 + rand() * 1.2;
    g.beginPath();
    g.moveTo(x, y);
    for (let j = 0; j < 3 + Math.floor(rand() * 4); j += 1) {
      x += (rand() - 0.5) * 36;
      y += (rand() - 0.3) * 26;
      g.lineTo(x, y);
    }
    g.stroke();
  }

  // Moss.
  for (let i = 0; i < 70; i += 1) {
    const a = rand() * TAU;
    const rr = Math.sqrt(rand());
    const x = cx + Math.cos(a) * rr * rx * 0.94;
    const y = cy + Math.sin(a) * rr * ry * 0.94;
    g.globalAlpha = 0.08 + rand() * 0.2;
    ellipse(g, x, y, 5 + rand() * 24, 3 + rand() * 13, palette.moss);
  }
  g.globalAlpha = 1;
  g.restore();

  // Broken rim.
  g.save();
  g.globalAlpha = 0.45;
  g.strokeStyle = palette.rim;
  g.lineWidth = 7;
  g.beginPath();
  g.ellipse(cx, cy, rx, ry, 0, 0, TAU);
  g.stroke();
  g.globalAlpha = 0.18;
  g.lineWidth = 18;
  g.stroke();
  g.restore();
}

function paintRuins(g, rand) {
  drawPlaza(g, rand, 2040, 880, 535, 365, {
    center: '#4f5845', mid: '#3c4a36', edge: '#2a3829',
    tiles: ['#69725a', '#5c6650', '#727b61', '#57604b', '#7a8266'],
    line: '#20291d', crack: '#182015', moss: '#3e6537', rim: '#202d20'
  });

  // Central glyph mandala.
  g.save();
  g.translate(2040, 880);
  g.strokeStyle = 'rgba(196, 204, 154, .25)';
  g.lineWidth = 2;
  g.beginPath();
  g.arc(0, 0, 96, 0, TAU);
  g.stroke();
  g.beginPath();
  g.arc(0, 0, 72, 0, TAU);
  g.stroke();
  g.lineWidth = 1;
  for (let i = 0; i < 12; i += 1) {
    const a = (i / 12) * TAU;
    g.beginPath();
    g.moveTo(Math.cos(a) * 74, Math.sin(a) * 74);
    g.lineTo(Math.cos(a) * 94, Math.sin(a) * 94);
    g.stroke();
  }
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * TAU + 0.3;
    g.beginPath();
    g.moveTo(Math.cos(a) * 24, Math.sin(a) * 24);
    g.lineTo(Math.cos(a) * 58, Math.sin(a) * 58);
    g.stroke();
  }
  g.restore();

  // Low broken walls.
  const walls = [
    [1460, 615, 220, 26], [2400, 545, 170, 24], [1600, 1206, 190, 22], [2380, 1210, 150, 20]
  ];
  for (const [x, y, w, h] of walls) {
    g.fillStyle = 'rgba(10, 20, 13, .32)';
    ellipse(g, x + w / 2, y + h + 4, w / 2 + 8, 10);
    g.fill();
    g.fillStyle = '#59614c';
    rrect(g, x, y, w, h, 3);
    g.fill();
    g.fillStyle = '#6f775d';
    rrect(g, x + 3, y + 2, w - 6, h * 0.45, 2);
    g.fill();
    g.strokeStyle = 'rgba(31, 42, 27, .6)';
    g.lineWidth = 1;
    for (let bx = x + 18; bx < x + w; bx += 32) {
      g.beginPath();
      g.moveTo(bx, y + 3);
      g.lineTo(bx, y + h - 2);
      g.stroke();
    }
    for (let i = 0; i < 6; i += 1) {
      g.globalAlpha = 0.2 + rand() * 0.3;
      ellipse(g, x + rand() * w, y + rand() * h, 4 + rand() * 14, 2 + rand() * 6, '#3f6636');
    }
    g.globalAlpha = 1;
  }

  // Scattered fallen blocks.
  for (let i = 0; i < 22; i += 1) {
    const a = rand() * TAU;
    const rr = 0.5 + rand() * 0.5;
    const x = 2040 + Math.cos(a) * 500 * rr;
    const y = 880 + Math.sin(a) * 330 * rr;
    g.save();
    g.translate(x, y);
    g.rotate(rand() * TAU);
    g.globalAlpha = 0.8;
    g.fillStyle = rand() > 0.5 ? '#61694f' : '#4d5540';
    rrect(g, -13, -8, 26 + rand() * 18, 16 + rand() * 8, 3);
    g.fill();
    g.strokeStyle = 'rgba(25, 34, 22, .4)';
    g.stroke();
    g.globalAlpha = 0.35;
    ellipse(g, 2, -2, 8, 3, '#829064');
    g.restore();
  }
  g.globalAlpha = 1;
}

function paintPyramid(g) {
  const cx = 3272;
  const baseY = 926;

  // Glow behind the temple.
  const glow = g.createRadialGradient(cx, 520, 10, cx, 520, 300);
  glow.addColorStop(0, 'rgba(246, 205, 112, .3)');
  glow.addColorStop(0.5, 'rgba(233, 181, 86, .1)');
  glow.addColorStop(1, 'rgba(233, 181, 86, 0)');
  g.fillStyle = glow;
  g.fillRect(cx - 320, 220, 640, 620);

  for (let layer = 0; layer < 6; layer += 1) {
    const y = baseY - layer * 70;
    const half = 262 - layer * 35;
    const h = 74;
    const topHalf = half - 34;
    const grad = g.createLinearGradient(cx - half, y - h, cx + half, y);
    grad.addColorStop(0, '#8e8056');
    grad.addColorStop(0.32, '#b3a06a');
    grad.addColorStop(0.62, '#96885c');
    grad.addColorStop(1, '#655c3f');
    g.fillStyle = grad;
    g.beginPath();
    g.moveTo(cx - half, y);
    g.lineTo(cx - topHalf, y - h);
    g.lineTo(cx + topHalf, y - h);
    g.lineTo(cx + half, y);
    g.closePath();
    g.fill();
    g.strokeStyle = 'rgba(49, 43, 26, .45)';
    g.lineWidth = 1.2;
    g.stroke();

    // Stone joints.
    for (let i = 1; i < 5; i += 1) {
      const t = i / 5;
      g.globalAlpha = 0.22;
      g.strokeStyle = '#3f3926';
      g.beginPath();
      g.moveTo(cx - half + (half - topHalf) * t, y - h * 0.6);
      g.lineTo(cx + half - (half - topHalf) * t, y - h * 0.6);
      g.stroke();
    }
    g.globalAlpha = 1;

    // Moss and dappled highlights.
    for (let i = 0; i < 16; i += 1) {
      g.globalAlpha = 0.1 + Math.random() * 0.15;
      ellipse(g, cx - half + 20 + Math.random() * (half * 2 - 40), y - 10 - Math.random() * 38, 8 + Math.random() * 22, 2 + Math.random() * 5, '#4c6d3e');
    }
    g.globalAlpha = 1;
  }

  // Grand stairs.
  const stairTop = 512;
  const stairBottom = baseY + 4;
  g.fillStyle = '#5a5237';
  g.beginPath();
  g.moveTo(cx - 62, stairBottom);
  g.lineTo(cx - 39, stairTop);
  g.lineTo(cx + 39, stairTop);
  g.lineTo(cx + 62, stairBottom);
  g.closePath();
  g.fill();
  const stairGrad = g.createLinearGradient(cx - 50, 0, cx + 50, 0);
  stairGrad.addColorStop(0, '#6e6444');
  stairGrad.addColorStop(0.5, '#b6a36b');
  stairGrad.addColorStop(1, '#6b6143');
  g.fillStyle = stairGrad;
  for (let y = stairBottom; y > stairTop; y -= 17) {
    const t = (stairBottom - y) / (stairBottom - stairTop);
    const half = 60 - t * 21;
    g.globalAlpha = 0.9;
    rrect(g, cx - half, y - 13, half * 2, 11, 1.5);
    g.fill();
  }
  g.globalAlpha = 1;

  // Temple on top.
  const ty = stairTop;
  g.fillStyle = '#7d6f49';
  rrect(g, cx - 88, ty - 30, 176, 34, 3);
  g.fill();
  g.fillStyle = '#a79563';
  rrect(g, cx - 54, ty - 78, 108, 52, 2);
  g.fill();
  g.fillStyle = '#6d5c37';
  rrect(g, cx - 20, ty - 62, 40, 36, 1);
  g.fill();
  g.fillStyle = '#f0cd7b';
  g.globalAlpha = 0.9;
  rrect(g, cx - 14, ty - 57, 28, 31, 1);
  g.fill();
  g.globalAlpha = 1;

  // Golden roof.
  const roofGrad = g.createLinearGradient(cx - 96, ty - 96, cx + 96, ty - 50);
  roofGrad.addColorStop(0, '#f5dc91');
  roofGrad.addColorStop(0.45, '#e8b866');
  roofGrad.addColorStop(1, '#9b6a2c');
  g.fillStyle = roofGrad;
  g.beginPath();
  g.moveTo(cx - 102, ty - 76);
  g.lineTo(cx, ty - 120);
  g.lineTo(cx + 102, ty - 76);
  g.lineTo(cx + 66, ty - 76);
  g.lineTo(cx, ty - 104);
  g.lineTo(cx - 66, ty - 76);
  g.closePath();
  g.fill();
  g.strokeStyle = 'rgba(255, 236, 174, .5)';
  g.lineWidth = 1.2;
  g.stroke();

  // Sanctum light.
  const light = g.createRadialGradient(cx, ty - 40, 2, cx, ty - 40, 90);
  light.addColorStop(0, 'rgba(255, 238, 174, .9)');
  light.addColorStop(0.4, 'rgba(255, 217, 138, .24)');
  light.addColorStop(1, 'rgba(255, 217, 138, 0)');
  g.fillStyle = light;
  g.fillRect(cx - 100, ty - 130, 200, 190);

  // Flanking obelisks.
  for (const side of [-1, 1]) {
    const x = cx + side * 300;
    g.fillStyle = 'rgba(9, 17, 11, .3)';
    ellipse(g, x + 5, baseY + 26, 44, 10);
    g.fill();
    g.fillStyle = '#86784f';
    rrect(g, x - 15, baseY - 122, 30, 148, 2);
    g.fill();
    g.fillStyle = '#b3a06c';
    rrect(g, x - 11, baseY - 118, 22, 140, 1);
    g.fill();
    g.fillStyle = '#e3c37b';
    g.beginPath();
    g.moveTo(x - 17, baseY - 122);
    g.lineTo(x, baseY - 150);
    g.lineTo(x + 17, baseY - 122);
    g.closePath();
    g.fill();
    g.globalAlpha = 0.4;
    g.strokeStyle = '#5a4d2e';
    for (let i = 0; i < 4; i += 1) {
      g.beginPath();
      g.moveTo(x - 8, baseY - 86 + i * 24);
      g.lineTo(x + 8, baseY - 82 + i * 24);
      g.stroke();
    }
    g.globalAlpha = 1;
  }
}

function paintCity(g, rand) {
  drawPlaza(g, rand, 3260, 1090, 425, 430, {
    center: '#5f5a3f', mid: '#4a4a35', edge: '#333826',
    tiles: ['#7b7150', '#8a7c58', '#6e6749', '#948560', '#675f45'],
    line: '#2f3121', crack: '#242618', moss: '#4d6737', rim: '#393d28'
  });

  // Golden inlays.
  g.save();
  g.translate(3260, 1090);
  g.strokeStyle = 'rgba(232, 184, 102, .38)';
  const rings = [56, 132, 205, 286];
  for (const r of rings) {
    g.lineWidth = r === 132 ? 2.4 : 1.1;
    g.beginPath();
    g.arc(0, 0, r, 0, TAU);
    g.stroke();
  }
  g.lineWidth = 1.2;
  for (let i = 0; i < 24; i += 1) {
    const a = (i / 24) * TAU;
    g.beginPath();
    g.moveTo(Math.cos(a) * 136, Math.sin(a) * 136);
    g.lineTo(Math.cos(a) * 198, Math.sin(a) * 198);
    g.stroke();
  }
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * TAU + 0.2;
    drawStar(g, Math.cos(a) * 246, Math.sin(a) * 246, 10, 4, 4, 'rgba(232, 184, 102, .3)');
  }
  g.restore();

  // Loose golden leaves.
  for (let i = 0; i < 130; i += 1) {
    const a = rand() * TAU;
    const rr = Math.sqrt(rand());
    const x = 3260 + Math.cos(a) * rr * 400;
    const y = 1090 + Math.sin(a) * rr * 405;
    g.globalAlpha = 0.2 + rand() * 0.5;
    g.fillStyle = rand() > 0.5 ? '#d6b46c' : '#f0d492';
    g.beginPath();
    g.ellipse(x, y, 1.2 + rand() * 2.4, 0.6 + rand() * 1.1, rand() * TAU, 0, TAU);
    g.fill();
  }
  g.globalAlpha = 1;

  paintPyramid(g);

  // Water channels feeding the plaza.
  for (const x of [2966, 3560]) {
    const grad = g.createLinearGradient(x, 900, x, 1560);
    grad.addColorStop(0, 'rgba(58, 139, 132, .18)');
    grad.addColorStop(0.5, 'rgba(35, 100, 98, .5)');
    grad.addColorStop(1, 'rgba(20, 74, 76, .12)');
    g.fillStyle = grad;
    g.fillRect(x - 17, 900, 34, 660);
    g.strokeStyle = 'rgba(139, 206, 183, .18)';
    g.lineWidth = 1.2;
    for (let y = 920; y < 1560; y += 22) {
      g.beginPath();
      g.moveTo(x - 13, y);
      g.quadraticCurveTo(x, y + 5, x + 13, y);
      g.stroke();
    }
  }
}

function paintCave(g, rand) {
  g.save();
  g.beginPath();
  g.ellipse(250, 1575, 300, 325, 0, 0, TAU);
  g.clip();
  const floor = g.createRadialGradient(250, 1560, 30, 250, 1560, 330);
  floor.addColorStop(0, '#2b2c24');
  floor.addColorStop(0.7, '#1a1d17');
  floor.addColorStop(1, '#11150f');
  g.fillStyle = floor;
  g.fillRect(-50, 1200, 600, 700);

  // Rock grain.
  for (let i = 0; i < 120; i += 1) {
    const x = 20 + rand() * 460;
    const y = 1290 + rand() * 600;
    g.globalAlpha = 0.08 + rand() * 0.12;
    ellipse(g, x, y, 6 + rand() * 30, 3 + rand() * 14, rand() > 0.5 ? '#4b4a38' : '#0a0d09');
  }
  g.globalAlpha = 1;

  // Cracks.
  g.strokeStyle = 'rgba(6, 9, 7, .55)';
  for (let i = 0; i < 18; i += 1) {
    let x = 40 + rand() * 420;
    let y = 1320 + rand() * 500;
    g.lineWidth = 0.8 + rand();
    g.beginPath();
    g.moveTo(x, y);
    for (let j = 0; j < 4; j += 1) {
      x += (rand() - 0.5) * 44;
      y += (rand() - 0.5) * 34;
      g.lineTo(x, y);
    }
    g.stroke();
  }

  // Glyph wall at the back.
  g.save();
  g.translate(250, 1820);
  g.globalAlpha = 0.5;
  g.strokeStyle = '#c9a75e';
  g.lineWidth = 1.3;
  g.beginPath();
  g.arc(0, 10, 108, Math.PI, TAU);
  g.stroke();
  g.beginPath();
  g.arc(0, 10, 84, Math.PI, TAU);
  g.stroke();
  for (let i = 0; i < 9; i += 1) {
    const a = Math.PI + (i / 8) * Math.PI;
    g.beginPath();
    g.moveTo(Math.cos(a) * 88, 10 + Math.sin(a) * 88);
    g.lineTo(Math.cos(a) * 104, 10 + Math.sin(a) * 104);
    g.stroke();
  }
  g.restore();
  g.globalAlpha = 1;

  // Glowing mushrooms.
  for (let i = 0; i < 16; i += 1) {
    const x = 70 + rand() * 360;
    const y = 1350 + rand() * 440;
    g.globalAlpha = 0.5;
    g.fillStyle = '#6fd3b1';
    g.beginPath();
    g.arc(x, y, 1.2 + rand() * 1.6, 0, TAU);
    g.fill();
    g.globalAlpha = 0.14;
    g.beginPath();
    g.arc(x, y, 6 + rand() * 8, 0, TAU);
    g.fill();
  }
  g.globalAlpha = 1;
  g.restore();

  // Entrance transition.
  const enter = g.createLinearGradient(0, 1320, 0, 1420);
  enter.addColorStop(0, 'rgba(24, 30, 20, 0)');
  enter.addColorStop(1, 'rgba(16, 20, 14, .8)');
  g.fillStyle = enter;
  g.fillRect(50, 1320, 410, 120);
}

function paintDocks(g, rand) {
  for (const side of ['west', 'east']) {
    const x = side === 'west' ? 944 : 1226;
    const dir = side === 'west' ? 1 : -1;
    const y = 882;
    // Posts.
    g.fillStyle = 'rgba(7, 16, 10, .4)';
    ellipse(g, x + dir * 42, y + 48, 62, 13);
    g.fill();
    for (let i = 0; i < 3; i += 1) {
      const px = x + dir * (12 + i * 30);
      g.fillStyle = '#4d3a22';
      rrect(g, px - 3, y + 6, 6, 36, 2);
      g.fill();
      g.fillStyle = '#6c5330';
      rrect(g, px - 2, y + 8, 3, 30, 1);
      g.fill();
    }
    // Planks.
    for (let i = 0; i < 5; i += 1) {
      const px = x + dir * (i * 22);
      g.fillStyle = i % 2 ? '#8a6b40' : '#785c36';
      rrect(g, px - 4, y + 12 - i * 1.5, 100 * dir, 10, 1.5);
      g.fill();
      g.strokeStyle = 'rgba(47, 34, 18, .5)';
      g.lineWidth = 0.8;
      g.stroke();
    }
    g.strokeStyle = 'rgba(197, 170, 118, .25)';
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(x, y + 22);
    g.lineTo(x + dir * 30, y + 18);
    g.stroke();
  }
}

function paintDetails(g, rand) {
  const greens = ['#2d6a3d', '#3c7d46', '#4c9250', '#225632', '#67a35a'];

  // Grass tufts.
  for (let i = 0; i < 760; i += 1) {
    const x = 40 + rand() * (W - 80);
    const y = 40 + rand() * (H - 80);
    if (x > RIVER.x1 - 12 && x < RIVER.x2 + 12) continue;
    if (distanceToPath(x, y) < 18) continue;
    if (inReserved(x, y, -8)) continue;
    if (x > 3030 && x < 3520 && y < 950) continue;
    const n = 2 + Math.floor(rand() * 3);
    g.strokeStyle = greens[Math.floor(rand() * greens.length)];
    g.globalAlpha = 0.35 + rand() * 0.35;
    g.lineWidth = 0.8 + rand() * 0.8;
    for (let j = 0; j < n; j += 1) {
      g.beginPath();
      g.moveTo(x + j * 2 - 2, y);
      g.quadraticCurveTo(x + (rand() - 0.5) * 8, y - 5, x + (rand() - 0.5) * 10, y - 8 - rand() * 8);
      g.stroke();
    }
  }

  // Ferns.
  for (let i = 0; i < 230; i += 1) {
    const x = 40 + rand() * (W - 80);
    const y = 40 + rand() * (H - 80);
    if (x > RIVER.x1 - 20 && x < RIVER.x2 + 20) continue;
    if (distanceToPath(x, y) < 26) continue;
    if (inReserved(x, y, -14)) continue;
    if (x > 3030 && x < 3520 && y < 950) continue;
    g.save();
    g.translate(x, y);
    g.rotate(rand() * TAU);
    const size = 10 + rand() * 18;
    g.strokeStyle = rand() > 0.5 ? '#3f7d46' : '#2d6239';
    g.globalAlpha = 0.45 + rand() * 0.35;
    g.lineWidth = 1.1;
    for (let j = 0; j < 6; j += 1) {
      const a = (j / 6) * TAU;
      g.beginPath();
      g.moveTo(0, 0);
      g.quadraticCurveTo(Math.cos(a) * size * 0.6, Math.sin(a) * size * 0.6 - 3, Math.cos(a) * size, Math.sin(a) * size);
      g.stroke();
    }
    g.restore();
  }
  g.globalAlpha = 1;

  // Wildflowers.
  const petals = ['#f4e1b6', '#f0b1a2', '#e9c96d', '#cfd9a8', '#e6a2c3'];
  for (let i = 0; i < 180; i += 1) {
    const x = 40 + rand() * (W - 80);
    const y = 40 + rand() * (H - 80);
    if (x > RIVER.x1 - 12 && x < RIVER.x2 + 12) continue;
    if (distanceToPath(x, y) < 34) continue;
    if (inReserved(x, y, -4)) continue;
    if (x > 3030 && x < 3520 && y < 950) continue;
    const color = petals[Math.floor(rand() * petals.length)];
    for (let j = 0; j < 4; j += 1) {
      const a = (j / 4) * TAU + rand();
      g.globalAlpha = 0.7;
      g.fillStyle = color;
      g.beginPath();
      g.arc(x + Math.cos(a) * 2, y + Math.sin(a) * 2, 1 + rand() * 1.2, 0, TAU);
      g.fill();
    }
    g.fillStyle = '#e3b955';
    g.beginPath();
    g.arc(x, y, 0.9, 0, TAU);
    g.fill();
  }
  g.globalAlpha = 1;

  // Pebbles and bones.
  for (let i = 0; i < 130; i += 1) {
    const x = 40 + rand() * (W - 80);
    const y = 40 + rand() * (H - 80);
    if (distanceToPath(x, y) > 80) continue;
    g.globalAlpha = 0.3 + rand() * 0.3;
    ellipse(g, x, y, 1.5 + rand() * 4, 1 + rand() * 2.5, rand() > 0.5 ? '#8f8a72' : '#3a3a2b');
  }
  g.globalAlpha = 1;

  // Mushrooms.
  for (let i = 0; i < 46; i += 1) {
    const x = 60 + rand() * (W - 120);
    const y = 60 + rand() * (H - 120);
    if (x > RIVER.x1 - 20 && x < RIVER.x2 + 20) continue;
    if (distanceToPath(x, y) < 20) continue;
    if (inReserved(x, y, 2)) continue;
    g.fillStyle = 'rgba(9, 18, 11, .35)';
    ellipse(g, x, y + 1, 4, 1.5);
    g.fillStyle = '#d9c79a';
    rrect(g, x - 1, y - 5, 2, 5, 1);
    g.fill();
    g.fillStyle = rand() > 0.5 ? '#c46a4c' : '#d9a557';
    g.beginPath();
    g.arc(x, y - 6, 2.5 + rand() * 1.5, Math.PI, TAU);
    g.fill();
  }

  // Fallen logs.
  for (let i = 0; i < 12; i += 1) {
    const x = 100 + rand() * (W - 200);
    const y = 100 + rand() * (H - 200);
    if (x > RIVER.x1 - 60 && x < RIVER.x2 + 60) continue;
    if (distanceToPath(x, y) < 70 || inReserved(x, y, 10)) continue;
    g.save();
    g.translate(x, y);
    g.rotate((rand() - 0.5) * 1.6);
    g.globalAlpha = 0.6;
    g.fillStyle = '#3a2a18';
    rrect(g, -30, -7, 60, 14, 7);
    g.fill();
    g.fillStyle = '#5d452a';
    rrect(g, -28, -6, 56, 7, 4);
    g.fill();
    g.globalAlpha = 0.4;
    g.strokeStyle = '#2a1c10';
    for (let j = -18; j < 20; j += 8) {
      g.beginPath();
      g.moveTo(j, -5);
      g.lineTo(j + 2, 5);
      g.stroke();
    }
    g.fillStyle = '#4e7a3e';
    for (let j = 0; j < 5; j += 1) {
      g.beginPath();
      g.ellipse(-20 + rand() * 40, -5 + rand() * 4, 2 + rand() * 4, 1 + rand() * 2, rand() * TAU, 0, TAU);
      g.fill();
    }
    g.restore();
  }
  g.globalAlpha = 1;

  // Reeds along both banks.
  for (let i = 0; i < 90; i += 1) {
    const side = rand() > 0.5 ? -1 : 1;
    const baseX = side < 0 ? RIVER.x1 - 8 : RIVER.x2 + 8;
    const x = baseX + (rand() - 0.5) * 16;
    const y = 60 + rand() * (H - 120);
    if (y > 850 && y < 960) continue;
    g.strokeStyle = rand() > 0.5 ? '#5e7c3d' : '#466a36';
    g.globalAlpha = 0.5 + rand() * 0.3;
    g.lineWidth = 1;
    const h = 10 + rand() * 18;
    for (let j = 0; j < 3; j += 1) {
      g.beginPath();
      g.moveTo(x + j * 2, y);
      g.quadraticCurveTo(x + j * 2 + (rand() - 0.5) * 6, y - h * 0.6, x + j * 2 + (rand() - 0.5) * 9, y - h);
      g.stroke();
    }
  }
  g.globalAlpha = 1;

  // Lily pads near the banks.
  for (let i = 0; i < 24; i += 1) {
    const side = rand() > 0.5 ? -1 : 1;
    const x = side < 0 ? RIVER.x1 + 14 + rand() * 24 : RIVER.x2 - 14 - rand() * 24;
    const y = 120 + rand() * (H - 240);
    g.globalAlpha = 0.42;
    g.fillStyle = '#2f6e3f';
    g.beginPath();
    g.ellipse(x, y, 4 + rand() * 5, 2.5 + rand() * 3, rand() * TAU, 0, TAU);
    g.fill();
    g.globalAlpha = 0.35;
    g.strokeStyle = '#8ec083';
    g.lineWidth = 0.6;
    g.stroke();
  }
  g.globalAlpha = 1;
}

export function paintGround(world, rand) {
  const c = document.createElement('canvas');
  c.width = Math.ceil(W * TS);
  c.height = Math.ceil(H * TS);
  const g = c.getContext('2d', { willReadFrequently: true });
  g.scale(TS, TS);

  paintBase(g, rand);
  paintClearings(g, rand);
  paintPaths(g, rand);
  paintRiver(g, world, rand);
  paintDocks(g, rand);
  paintRuins(g, rand);
  paintCave(g, rand);
  paintCity(g, rand);
  paintDetails(g, rand);

  // Slice the finished ground into small tiles. Uploading one giant texture
  // stalls low-end GPUs (and software rendering) on the first painted frame;
  // small tiles are uploaded lazily as the camera reveals them.
  const TILE = 512;
  const tiles = [];
  for (let ty = 0; ty < c.height; ty += TILE) {
    for (let tx = 0; tx < c.width; tx += TILE) {
      const tw = Math.min(TILE, c.width - tx);
      const th = Math.min(TILE, c.height - ty);
      const tile = document.createElement('canvas');
      tile.width = tw;
      tile.height = th;
      tile.getContext('2d', { willReadFrequently: true }).drawImage(c, tx, ty, tw, th, 0, 0, tw, th);
      tiles.push({ canvas: tile, x: tx / TS, y: ty / TS, w: tw / TS, h: th / TS });
    }
  }
  // Release the oversized scratch canvas before the first frame.
  c.width = 0;
  c.height = 0;
  return tiles;
}
