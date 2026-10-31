import { TAU, blob, ellipse } from './config.js';

function canvasSprite(width, height, draw) {
  const c = document.createElement('canvas');
  const ss = 2;
  c.width = width * ss;
  c.height = height * ss;
  const g = c.getContext('2d');
  g.scale(ss, ss);
  draw(g);
  return c;
}

export function makeTreeSprite(pal, rand) {
  return canvasSprite(320, 360, g => {
    // Ground shadow.
    g.save();
    g.globalAlpha = 0.42;
    ellipse(g, 160, 338, 92, 23, '#041009');
    g.restore();

    // Roots.
    g.fillStyle = '#3a2a1b';
    g.beginPath();
    g.moveTo(134, 336);
    g.quadraticCurveTo(120, 330, 112, 342);
    g.quadraticCurveTo(136, 342, 144, 330);
    g.closePath();
    g.fill();
    g.beginPath();
    g.moveTo(176, 336);
    g.quadraticCurveTo(196, 326, 208, 342);
    g.quadraticCurveTo(184, 342, 172, 330);
    g.closePath();
    g.fill();

    // Trunk.
    const trunk = g.createLinearGradient(145, 0, 178, 0);
    trunk.addColorStop(0, '#5b4128');
    trunk.addColorStop(0.45, '#7a5a36');
    trunk.addColorStop(1, '#3a2919');
    g.fillStyle = trunk;
    g.beginPath();
    g.moveTo(150, 338);
    g.bezierCurveTo(146, 300, 148, 250, 154, 214);
    g.lineTo(170, 214);
    g.bezierCurveTo(174, 252, 176, 300, 170, 338);
    g.closePath();
    g.fill();
    g.strokeStyle = 'rgba(38, 25, 13, .55)';
    g.lineWidth = 1.2;
    for (let i = 0; i < 6; i += 1) {
      const y = 230 + i * 17;
      g.beginPath();
      g.moveTo(153 + i * 0.4, y);
      g.quadraticCurveTo(159, y + 4, 166, y - 1);
      g.stroke();
    }

    // Canopy: layered organic clusters.
    const clusters = [];
    for (let i = 0; i < 14; i += 1) {
      const a = rand() * TAU;
      const rr = 18 + rand() * 72;
      clusters.push({
        x: 160 + Math.cos(a) * rr * 1.4,
        y: 154 + Math.sin(a) * rr * 0.8,
        rx: 40 + rand() * 32,
        ry: 32 + rand() * 24,
        rot: rand() * TAU
      });
    }

    g.save();
    g.globalAlpha = 0.95;
    for (const c of clusters) {
      blob(g, c.x + 2, c.y + 15, c.rx, c.ry, 10, rand, c.rot);
      g.fillStyle = pal.dark;
      g.fill();
    }
    for (const c of clusters) {
      blob(g, c.x - 2, c.y - 2, c.rx * 0.92, c.ry * 0.9, 10, rand, c.rot + 0.2);
      g.fillStyle = pal.mid;
      g.fill();
    }
    for (const c of clusters) {
      blob(g, c.x - 8, c.y - 13, c.rx * 0.72, c.ry * 0.68, 9, rand, c.rot + 0.4);
      g.fillStyle = pal.light;
      g.fill();
    }
    for (const c of clusters) {
      blob(g, c.x - 14, c.y - 24, c.rx * 0.48, c.ry * 0.45, 8, rand, c.rot + 0.6);
      g.globalAlpha = 0.75;
      g.fillStyle = pal.hi;
      g.fill();
      g.globalAlpha = 0.95;
    }
    g.restore();

    // Sunlit rim on the upper-left.
    g.save();
    g.globalAlpha = 0.26;
    for (let i = 0; i < 18; i += 1) {
      const a = -2.7 + rand() * 1.6;
      const rr = 74 + rand() * 54;
      const x = 160 + Math.cos(a) * rr;
      const y = 150 + Math.sin(a) * rr * 0.8;
      ellipse(g, x, y, 7 + rand() * 12, 3 + rand() * 6, pal.rim);
    }
    g.restore();

    // Leaf speckles.
    for (let i = 0; i < 90; i += 1) {
      const a = rand() * TAU;
      const rr = rand() ** 0.6 * 108;
      const x = 160 + Math.cos(a) * rr * 1.2;
      const y = 152 + Math.sin(a) * rr * 0.72;
      g.globalAlpha = 0.25 + rand() * 0.35;
      g.fillStyle = rand() > 0.45 ? pal.hi : pal.dark;
      g.beginPath();
      g.ellipse(x, y, 1.1 + rand() * 2.2, 0.7 + rand() * 1.3, rand() * TAU, 0, TAU);
      g.fill();
    }
    g.globalAlpha = 1;

    // Hanging vines.
    for (let i = 0; i < 4; i += 1) {
      const x = 118 + rand() * 86;
      const len = 34 + rand() * 58;
      g.strokeStyle = i % 2 ? '#3d7b46' : '#2d5e37';
      g.lineWidth = 1.4;
      g.beginPath();
      g.moveTo(x, 220);
      g.bezierCurveTo(x - 7, 240, x + 8, 250, x - 3, 220 + len);
      g.stroke();
      for (let j = 0; j < 4; j += 1) {
        const yy = 232 + (len / 5) * j;
        g.fillStyle = '#4c9657';
        g.beginPath();
        g.ellipse(x + (j % 2 ? 3 : -3), yy, 3.2, 1.6, 0.6, 0, TAU);
        g.fill();
      }
    }

    // A few bright bromeliads.
    for (let i = 0; i < 3; i += 1) {
      const x = 120 + rand() * 80;
      const y = 178 + rand() * 56;
      g.fillStyle = '#b84f36';
      for (let j = 0; j < 5; j += 1) {
        const a = (j / 5) * TAU;
        g.beginPath();
        g.ellipse(x + Math.cos(a) * 3.5, y + Math.sin(a) * 3.5, 2.6, 1.2, a, 0, TAU);
        g.fill();
      }
      g.fillStyle = '#e7b856';
      g.beginPath();
      g.arc(x, y, 1.7, 0, TAU);
      g.fill();
    }
  });
}

export function makePalmSprite(rand, variant) {
  const greens = [
    ['#1a4a2d', '#2d6a3c', '#4b9254'],
    ['#174434', '#28634a', '#3f8c63'],
    ['#204c2a', '#336c39', '#58a04d']
  ][variant % 3];
  return canvasSprite(280, 380, g => {
    g.save();
    g.globalAlpha = 0.36;
    ellipse(g, 138, 354, 65, 18, '#03100a');
    g.restore();

    // Curved trunk.
    const trunk = g.createLinearGradient(118, 0, 166, 0);
    trunk.addColorStop(0, '#503a24');
    trunk.addColorStop(0.5, '#87653c');
    trunk.addColorStop(1, '#392817');
    g.fillStyle = trunk;
    g.beginPath();
    g.moveTo(132, 354);
    g.bezierCurveTo(128, 300, 142, 240, 160, 194);
    g.lineTo(171, 197);
    g.bezierCurveTo(158, 246, 152, 304, 146, 354);
    g.closePath();
    g.fill();
    g.strokeStyle = 'rgba(50, 34, 18, .45)';
    g.lineWidth = 1.1;
    for (let i = 0; i < 12; i += 1) {
      const t = i / 12;
      const y = 348 - t * 148;
      g.beginPath();
      g.moveTo(132 + t * 30, y);
      g.lineTo(145 + t * 26, y - 2);
      g.stroke();
    }

    const cx = 165;
    const cy = 191;

    // Fronds.
    for (let i = 0; i < 9; i += 1) {
      const a = -Math.PI * 0.97 + (i / 8) * Math.PI * 1.1 + rand() * 0.1;
      const len = 88 + rand() * 28;
      const tipX = cx + Math.cos(a) * len;
      const tipY = cy + Math.sin(a) * len * 0.82 + 4;
      const perpX = -Math.sin(a);
      const perpY = Math.cos(a);
      const w = 14 + rand() * 4;
      g.fillStyle = greens[i % 2 ? 1 : 0];
      g.beginPath();
      g.moveTo(cx, cy);
      g.quadraticCurveTo(
        cx + Math.cos(a) * len * 0.5 + perpX * w,
        cy + Math.sin(a) * len * 0.5 * 0.82 + perpY * w,
        tipX, tipY
      );
      g.quadraticCurveTo(
        cx + Math.cos(a) * len * 0.5 - perpX * w * 0.5,
        cy + Math.sin(a) * len * 0.5 * 0.82 - perpY * w * 0.5,
        cx, cy
      );
      g.closePath();
      g.fill();
      g.strokeStyle = greens[2];
      g.globalAlpha = 0.6;
      g.lineWidth = 1;
      g.beginPath();
      g.moveTo(cx, cy);
      g.quadraticCurveTo(cx + Math.cos(a) * len * 0.55, cy + Math.sin(a) * len * 0.5, tipX, tipY);
      g.stroke();
      // Leaflets.
      for (let j = 1; j < 8; j += 1) {
        const t = j / 8;
        const px = cx + Math.cos(a) * len * t;
        const py = cy + Math.sin(a) * len * t * 0.82;
        g.globalAlpha = 0.38;
        g.lineWidth = 1;
        g.beginPath();
        g.moveTo(px, py);
        g.lineTo(px + perpX * 7 + Math.cos(a) * 2, py + perpY * 7);
        g.moveTo(px, py);
        g.lineTo(px - perpX * 6 + Math.cos(a) * 2, py - perpY * 6);
        g.stroke();
      }
      g.globalAlpha = 1;
    }

    // Coconuts.
    for (let i = 0; i < 3; i += 1) {
      g.fillStyle = i === 1 ? '#5f4a26' : '#4a381c';
      g.beginPath();
      g.arc(cx - 10 + i * 9, cy + 10 + (i % 2) * 5, 5.4, 0, TAU);
      g.fill();
      g.fillStyle = 'rgba(180, 150, 80, .35)';
      g.beginPath();
      g.arc(cx - 11.5 + i * 9, cy + 8 + (i % 2) * 5, 1.8, 0, TAU);
      g.fill();
    }
  });
}

export function makeBushSprite(rand, variant) {
  const palettes = [
    ['#173f27', '#235832', '#327342', '#65a35c'],
    ['#1b4325', '#2a6130', '#3f7c3e', '#78b063'],
    ['#153d2c', '#20583b', '#2f7149', '#5b9c69'],
    ['#1e4522', '#2d5e2b', '#467b36', '#7ca552']
  ];
  const pal = palettes[variant % palettes.length];
  return canvasSprite(180, 150, g => {
    g.save();
    g.globalAlpha = 0.3;
    ellipse(g, 90, 134, 52, 13, '#03100a');
    g.restore();

    if (variant === 3) {
      // Broad-leaf plant.
      for (let i = 0; i < 7; i += 1) {
        const a = -Math.PI * 0.92 + (i / 6) * Math.PI * 0.95;
        const len = 54 + rand() * 30;
        const x2 = 90 + Math.cos(a) * len;
        const y2 = 126 + Math.sin(a) * len * 0.86;
        g.fillStyle = i % 2 ? pal[1] : pal[2];
        g.beginPath();
        g.moveTo(90, 126);
        g.quadraticCurveTo(90 + Math.cos(a) * len * 0.5 - Math.sin(a) * 16, 126 + Math.sin(a) * len * 0.5 + Math.cos(a) * 16, x2, y2);
        g.quadraticCurveTo(90 + Math.cos(a) * len * 0.4 + Math.sin(a) * 6, 126 + Math.sin(a) * len * 0.4 - Math.cos(a) * 6, 90, 126);
        g.closePath();
        g.fill();
        g.strokeStyle = pal[3];
        g.globalAlpha = 0.5;
        g.beginPath();
        g.moveTo(90, 126);
        g.lineTo(x2, y2);
        g.stroke();
        g.globalAlpha = 1;
      }
    } else {
      const blobs = [];
      for (let i = 0; i < 7; i += 1) {
        const a = rand() * TAU;
        const rr = rand() * 32;
        blobs.push({ x: 90 + Math.cos(a) * rr, y: 100 + Math.sin(a) * rr * 0.55, rx: 24 + rand() * 18, ry: 20 + rand() * 13 });
      }
      for (const b of blobs) {
        blob(g, b.x + 2, b.y + 7, b.rx, b.ry, 9, rand);
        g.fillStyle = pal[0];
        g.fill();
      }
      for (const b of blobs) {
        blob(g, b.x - 1, b.y - 2, b.rx * 0.92, b.ry * 0.9, 9, rand);
        g.fillStyle = pal[1];
        g.fill();
      }
      for (const b of blobs) {
        blob(g, b.x - 5, b.y - 9, b.rx * 0.62, b.ry * 0.6, 8, rand);
        g.fillStyle = pal[2];
        g.fill();
      }
    }

    // Flowers or fruit.
    const flowerColors = ['#f0d9a0', '#e9a7a0', '#f2c46b', '#d9e3b0'];
    g.fillStyle = flowerColors[variant % 4];
    for (let i = 0; i < 6; i += 1) {
      const x = 58 + rand() * 64;
      const y = 74 + rand() * 42;
      const r = 1.5 + rand() * 1.5;
      g.beginPath();
      g.arc(x, y, r, 0, TAU);
      g.fill();
    }
  });
}
