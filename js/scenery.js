import { TAU, ellipse, rrect, drawStar, clamp, lerp } from './config.js';

function flame(g, x, y, w, h, time, seed = 0, colors = ['#ff9d42', '#ffd46a', '#fff0bd']) {
  const f = Math.sin(time * 8 + seed * 2.3) * 0.22 + Math.sin(time * 13 + seed) * 0.1;
  const sway = Math.sin(time * 5.5 + seed) * w * 0.22;
  g.save();
  g.globalAlpha = 0.85;
  for (let i = 0; i < 3; i += 1) {
    const k = 1 - i * 0.25;
    const wave = Math.sin(time * (7 + i * 2) + seed + i) * w * 0.16;
    g.fillStyle = colors[i];
    g.beginPath();
    g.moveTo(x - w * 0.5 * k, y);
    g.quadraticCurveTo(x - w * 0.35 * k + wave, y - h * 0.5 * k, x + sway * 0.4 + wave, y - h * k * (1 + f * 0.18));
    g.quadraticCurveTo(x + w * 0.4 * k + wave, y - h * 0.45 * k, x + w * 0.5 * k, y);
    g.closePath();
    g.fill();
  }
  g.restore();
}

function shadow(g, rx, ry, alpha = 0.35) {
  g.save();
  g.globalAlpha = alpha;
  ellipse(g, 2, 1, rx, ry, '#020b06');
  g.restore();
}

function drawTent(g, time, item) {
  const s = item.s || 1;
  g.save();
  g.scale(s, s);
  shadow(g, 70, 13, 0.32);

  // Ropes.
  g.strokeStyle = 'rgba(210, 193, 154, .35)';
  g.lineWidth = 0.8;
  g.beginPath();
  g.moveTo(-58, -4); g.lineTo(-82, 6);
  g.moveTo(58, -4); g.lineTo(82, 6);
  g.moveTo(0, -86); g.lineTo(0, -98);
  g.stroke();

  // Back fabric.
  const back = g.createLinearGradient(-66, -80, 66, 0);
  back.addColorStop(0, '#5f6441');
  back.addColorStop(1, '#363a25');
  g.fillStyle = back;
  g.beginPath();
  g.moveTo(-64, -6);
  g.lineTo(0, -94);
  g.lineTo(64, -6);
  g.closePath();
  g.fill();

  // Front panels.
  const left = g.createLinearGradient(-64, -80, 0, 0);
  left.addColorStop(0, '#d4c28e');
  left.addColorStop(1, '#8f8559');
  g.fillStyle = left;
  g.beginPath();
  g.moveTo(-64, -6);
  g.lineTo(0, -94);
  g.lineTo(0, -6);
  g.closePath();
  g.fill();
  const right = g.createLinearGradient(64, -80, 0, 0);
  right.addColorStop(0, '#b3a374');
  right.addColorStop(1, '#77714c');
  g.fillStyle = right;
  g.beginPath();
  g.moveTo(64, -6);
  g.lineTo(0, -94);
  g.lineTo(0, -6);
  g.closePath();
  g.fill();

  // Opening.
  g.fillStyle = '#222417';
  g.beginPath();
  g.moveTo(-16, -6);
  g.quadraticCurveTo(0, -56, 16, -6);
  g.closePath();
  g.fill();
  g.fillStyle = 'rgba(244, 208, 140, .16)';
  g.beginPath();
  g.moveTo(-11, -7);
  g.quadraticCurveTo(0, -46, 11, -7);
  g.closePath();
  g.fill();

  // Seams and poles.
  g.strokeStyle = 'rgba(72, 63, 36, .55)';
  g.lineWidth = 1.2;
  g.beginPath();
  g.moveTo(0, -92); g.lineTo(0, -6);
  g.moveTo(-32, -50); g.lineTo(0, -92);
  g.moveTo(32, -50); g.lineTo(0, -92);
  g.stroke();
  g.strokeStyle = '#6f5632';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(-64, -2); g.lineTo(-64, -64);
  g.moveTo(64, -2); g.lineTo(64, -64);
  g.stroke();

  // Flag.
  const wave = Math.sin(time * 2.1) * 3;
  g.fillStyle = '#9b7433';
  g.beginPath();
  g.moveTo(0, -98);
  g.quadraticCurveTo(13 + wave, -96, 23 + wave, -90);
  g.quadraticCurveTo(13 + wave, -86, 0, -86);
  g.closePath();
  g.fill();
  g.fillStyle = '#e8b866';
  g.globalAlpha = 0.7;
  g.beginPath();
  g.arc(12 + wave, -91, 2.2, 0, TAU);
  g.fill();
  g.globalAlpha = 1;
  g.restore();
}

function drawBanner(g, time) {
  shadow(g, 12, 5, 0.3);
  g.strokeStyle = '#5c4527';
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(0, 0);
  g.lineTo(0, -120);
  g.stroke();
  g.fillStyle = '#7d6036';
  g.beginPath();
  g.arc(0, -122, 4, 0, TAU);
  g.fill();
  const wave = Math.sin(time * 2.4) * 4;
  g.fillStyle = '#315b3b';
  g.beginPath();
  g.moveTo(2, -115);
  g.quadraticCurveTo(28 + wave, -112, 46 + wave, -104);
  g.lineTo(40 + wave, -76);
  g.quadraticCurveTo(24 + wave, -80, 2, -78);
  g.closePath();
  g.fill();
  g.strokeStyle = 'rgba(232, 184, 102, .55)';
  g.lineWidth = 1.4;
  g.stroke();
  g.fillStyle = '#e8b866';
  drawStar(g, 22 + wave * 0.7, -96, 8, 3.5, 4, 'rgba(232, 184, 102, .85)');
}

function drawCrate(g) {
  shadow(g, 24, 8, 0.3);
  g.fillStyle = '#5f4628';
  rrect(g, -19, -34, 38, 36, 2);
  g.fill();
  g.fillStyle = '#8a6939';
  rrect(g, -16, -32, 32, 31, 1.5);
  g.fill();
  g.strokeStyle = 'rgba(61, 43, 22, .65)';
  g.lineWidth = 1.2;
  g.beginPath();
  g.moveTo(-16, -21); g.lineTo(16, -21);
  g.moveTo(-16, -10); g.lineTo(16, -10);
  g.moveTo(-6, -32); g.lineTo(-6, -1);
  g.moveTo(6, -32); g.lineTo(6, -1);
  g.stroke();
  g.strokeStyle = 'rgba(230, 197, 130, .35)';
  g.lineWidth = 0.8;
  g.beginPath();
  g.moveTo(-16, -32); g.lineTo(16, -1);
  g.stroke();
}

function drawCampfire(g, time, item) {
  const s = item.s || 1;
  g.save();
  g.scale(s, s);
  shadow(g, 34, 11, 0.3);

  // Ember glow.
  const glow = g.createRadialGradient(0, -12, 2, 0, -12, 72);
  glow.addColorStop(0, 'rgba(255, 176, 70, .32)');
  glow.addColorStop(0.5, 'rgba(238, 126, 44, .1)');
  glow.addColorStop(1, 'rgba(238, 126, 44, 0)');
  g.fillStyle = glow;
  g.fillRect(-76, -88, 152, 110);

  // Stone ring.
  for (let i = 0; i < 9; i += 1) {
    const a = (i / 9) * TAU;
    const x = Math.cos(a) * 27;
    const y = Math.sin(a) * 14;
    g.fillStyle = i % 2 ? '#666858' : '#555847';
    g.beginPath();
    g.ellipse(x, y, 6.5, 4.5, a, 0, TAU);
    g.fill();
    g.fillStyle = 'rgba(170, 175, 143, .22)';
    g.beginPath();
    g.ellipse(x - 1.5, y - 1.5, 2.6, 1.5, a, 0, TAU);
    g.fill();
  }

  // Logs.
  g.fillStyle = '#3b2714';
  g.save();
  g.rotate(0.5);
  rrect(g, -21, -5, 42, 9, 4);
  g.fill();
  g.restore();
  g.save();
  g.rotate(-0.58);
  rrect(g, -21, -5, 42, 9, 4);
  g.fill();
  g.restore();
  g.fillStyle = '#8a4d23';
  g.beginPath();
  g.arc(0, -3, 7, 0, TAU);
  g.fill();

  flame(g, 0, -2, 24, 40, time, 1.3);
  flame(g, -7, -1, 12, 24, time, 4.1, ['#ff8b35', '#ffc45d', '#ffe8a6']);
  flame(g, 8, 0, 10, 20, time, 7.7, ['#ff8b35', '#ffc45d', '#ffe8a6']);
  g.restore();
}

function drawTorch(g, time) {
  shadow(g, 20, 5, 0.28);
  g.save();
  g.translate(6, -4);
  g.rotate(-0.18);
  g.fillStyle = '#5e4425';
  rrect(g, -2, -44, 5, 46, 2);
  g.fill();
  g.fillStyle = '#8d6b3a';
  rrect(g, -1, -42, 2, 42, 1);
  g.fill();
  g.fillStyle = '#4a3a20';
  rrect(g, -5, -51, 11, 12, 3);
  g.fill();
  flame(g, 0, -51, 13, 22, time, 2.4);
  g.restore();
}

function drawShrineArch(g, time) {
  shadow(g, 130, 22, 0.32);

  // Steps.
  g.fillStyle = '#4f5847';
  rrect(g, -118, -20, 236, 24, 4);
  g.fill();
  g.fillStyle = '#69715a';
  rrect(g, -108, -22, 216, 10, 3);
  g.fill();

  // Pillars.
  for (const side of [-1, 1]) {
    const x = side * 92;
    g.fillStyle = 'rgba(4, 12, 8, .35)';
    ellipse(g, x + 6, 2, 28, 8);
    g.fill();
    const grad = g.createLinearGradient(x - 22, 0, x + 22, 0);
    grad.addColorStop(0, '#343b2e');
    grad.addColorStop(0.4, '#727a62');
    grad.addColorStop(1, '#3d4535');
    g.fillStyle = grad;
    rrect(g, x - 21, -166, 42, 168, 3);
    g.fill();
    g.strokeStyle = 'rgba(31, 39, 27, .55)';
    g.lineWidth = 1;
    for (let y = -150; y < -8; y += 24) {
      g.beginPath();
      g.moveTo(x - 20, y);
      g.lineTo(x + 20, y);
      g.stroke();
    }
    g.fillStyle = '#59614a';
    rrect(g, x - 27, -174, 54, 14, 2);
    g.fill();
    g.fillStyle = '#7b846a';
    rrect(g, x - 26, -173, 52, 5, 1);
    g.fill();
    // Moss.
    g.globalAlpha = 0.4;
    for (let i = 0; i < 6; i += 1) {
      ellipse(g, x - 14 + Math.random() * 28, -150 + Math.random() * 130, 4 + Math.random() * 10, 2 + Math.random() * 5, '#3f6b3d');
    }
    g.globalAlpha = 1;
  }

  // Lintel.
  const lintel = g.createLinearGradient(-130, -200, 130, -160);
  lintel.addColorStop(0, '#4a5240');
  lintel.addColorStop(0.5, '#848c71');
  lintel.addColorStop(1, '#3e4637');
  g.fillStyle = lintel;
  rrect(g, -132, -202, 264, 34, 3);
  g.fill();
  g.strokeStyle = 'rgba(28, 36, 24, .6)';
  g.lineWidth = 1.2;
  g.stroke();

  // Jaguar face.
  g.save();
  g.translate(0, -186);
  g.fillStyle = '#3b4433';
  g.beginPath();
  g.ellipse(0, 0, 28, 21, 0, 0, TAU);
  g.fill();
  g.fillStyle = '#697258';
  g.beginPath();
  g.ellipse(0, -3, 22, 15, 0, 0, TAU);
  g.fill();
  g.fillStyle = '#3a4433';
  g.beginPath();
  g.moveTo(-24, -8); g.lineTo(-39, -23); g.lineTo(-17, -19); g.closePath(); g.fill();
  g.beginPath();
  g.moveTo(24, -8); g.lineTo(39, -23); g.lineTo(17, -19); g.closePath(); g.fill();
  g.fillStyle = '#e8b866';
  g.globalAlpha = 0.85;
  g.beginPath(); g.ellipse(-8, -3, 3.4, 2, -0.2, 0, TAU); g.fill();
  g.beginPath(); g.ellipse(8, -3, 3.4, 2, 0.2, 0, TAU); g.fill();
  g.globalAlpha = 1;
  g.fillStyle = '#2f382a';
  g.beginPath(); g.ellipse(0, 4, 4, 2.6, 0, 0, TAU); g.fill();
  g.strokeStyle = '#2f382a';
  g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(0, 6); g.lineTo(0, 10); g.stroke();
  g.restore();

  // Hanging vines.
  g.strokeStyle = '#427044';
  g.globalAlpha = 0.7;
  for (let i = 0; i < 5; i += 1) {
    const x = -100 + i * 50 + Math.sin(time * 1.2 + i) * 2;
    g.lineWidth = 1;
    g.beginPath();
    g.moveTo(x, -168);
    g.quadraticCurveTo(x + 4, -140, x - 2, -112 - i * 5);
    g.stroke();
  }
  g.globalAlpha = 1;
}

function drawAltar(g, item) {
  const gold = item.variant === 'sun';
  shadow(g, 62, 15, 0.32);
  const stone = gold ? ['#6f6140', '#9b8860', '#b7a374'] : ['#4a5341', '#697158', '#828a6c'];
  g.fillStyle = stone[0];
  rrect(g, -62, -14, 124, 20, 4);
  g.fill();
  g.fillStyle = stone[1];
  rrect(g, -52, -30, 104, 22, 3);
  g.fill();
  g.fillStyle = stone[2];
  rrect(g, -42, -46, 84, 20, 3);
  g.fill();
  g.fillStyle = stone[1];
  rrect(g, -48, -54, 96, 12, 2);
  g.fill();
  g.strokeStyle = 'rgba(29, 37, 25, .5)';
  g.lineWidth = 1;
  g.stroke();
  // Glyphs.
  g.globalAlpha = gold ? 0.8 : 0.55;
  g.strokeStyle = gold ? '#f0cc7e' : '#b5c09a';
  g.lineWidth = 1.3;
  g.beginPath();
  g.arc(0, -38, 9, 0, TAU);
  g.stroke();
  for (let i = 0; i < 8; i += 1) {
    const a = (i / 8) * TAU;
    g.beginPath();
    g.moveTo(Math.cos(a) * 11, -38 + Math.sin(a) * 11);
    g.lineTo(Math.cos(a) * 15, -38 + Math.sin(a) * 15);
    g.stroke();
  }
  g.globalAlpha = 1;
  // Moss.
  for (let i = 0; i < 5; i += 1) {
    g.globalAlpha = 0.3;
    ellipse(g, -40 + Math.random() * 80, -20 + Math.random() * 12, 5 + Math.random() * 10, 2 + Math.random() * 4, '#40653a');
  }
  g.globalAlpha = 1;
}

function drawVines(g, time) {
  // A fallen bough with a curtain of vines across the shrine path.
  g.strokeStyle = '#4b3720';
  g.lineWidth = 9;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(-108, -34);
  g.quadraticCurveTo(0, -46, 108, -30);
  g.stroke();
  g.strokeStyle = '#6c5330';
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(-106, -36);
  g.quadraticCurveTo(0, -47, 106, -32);
  g.stroke();

  for (let i = 0; i < 15; i += 1) {
    const x = -98 + i * 14 + Math.sin(time * 1.1 + i) * 2.5;
    const len = 44 + (i % 5) * 17;
    g.strokeStyle = i % 3 === 0 ? '#2f5f36' : '#3b7442';
    g.globalAlpha = 0.85;
    g.lineWidth = 1.3;
    g.beginPath();
    g.moveTo(x, -38);
    g.bezierCurveTo(x - 5, -18, x + 7, 4, x + Math.sin(time + i) * 3, -38 + len);
    g.stroke();
    // Leaves.
    for (let j = 0; j < 5; j += 1) {
      const t = (j + 1) / 6;
      const lx = x + Math.sin(time * 1.2 + i + j) * 3 + (j % 2 ? 4 : -4);
      const ly = -38 + len * t;
      g.fillStyle = j % 2 ? '#4a9251' : '#3d7f46';
      g.globalAlpha = 0.9;
      g.beginPath();
      g.ellipse(lx, ly, 3.4, 1.6, j % 2 ? 0.7 : -0.7, 0, TAU);
      g.fill();
    }
  }
  // Red flowers.
  g.fillStyle = '#c8664b';
  for (let i = 0; i < 4; i += 1) {
    const x = -70 + i * 45;
    g.beginPath();
    g.arc(x, -26 + (i % 2) * 14, 2.6, 0, TAU);
    g.fill();
  }
  g.globalAlpha = 1;
}

function drawCaveMouth(g, time) {
  shadow(g, 145, 26, 0.38);

  // Dark throat.
  const hole = g.createRadialGradient(0, -34, 6, 0, -34, 120);
  hole.addColorStop(0, '#010402');
  hole.addColorStop(0.55, '#07100a');
  hole.addColorStop(1, 'rgba(7, 16, 10, 0)');
  g.fillStyle = hole;
  g.beginPath();
  g.ellipse(0, -40, 126, 100, 0, 0, TAU);
  g.fill();

  // Boulders.
  const rocks = [
    [-112, -10, 55, 34, 0.1], [-78, -58, 48, 32, -0.2], [-128, -66, 38, 26, 0.3],
    [112, -8, 58, 36, -0.1], [78, -60, 50, 32, 0.2], [128, -66, 40, 28, -0.3],
    [-40, -102, 54, 28, 0.05], [38, -104, 58, 30, -0.1], [0, -118, 48, 24, 0]
  ];
  for (const [x, y, rx, ry, rot] of rocks) {
    g.save();
    g.translate(x, y);
    g.rotate(rot);
    g.fillStyle = 'rgba(3, 9, 6, .45)';
    ellipse(g, 5, 6, rx + 4, ry + 4);
    const grad = g.createLinearGradient(-rx, -ry, rx, ry);
    grad.addColorStop(0, '#525a4a');
    grad.addColorStop(0.55, '#3b4336');
    grad.addColorStop(1, '#222a21');
    g.fillStyle = grad;
    g.beginPath();
    g.ellipse(0, 0, rx, ry, 0, 0, TAU);
    g.fill();
    g.strokeStyle = 'rgba(23, 30, 22, .65)';
    g.lineWidth = 1;
    g.stroke();
    g.globalAlpha = 0.35;
    for (let i = 0; i < 4; i += 1) {
      ellipse(g, -rx * 0.5 + Math.random() * rx, -ry * 0.5 + Math.random() * ry, 4 + Math.random() * 12, 2 + Math.random() * 4, '#3f6b3d');
    }
    g.globalAlpha = 1;
    g.restore();
  }

  // Moss and tiny glow at the edges.
  g.globalAlpha = 0.65;
  for (let i = 0; i < 8; i += 1) {
    const x = -120 + i * 34;
    g.fillStyle = '#376a3c';
    g.beginPath();
    g.ellipse(x, -18 + (i % 3) * 12, 9, 3.5, 0.2, 0, TAU);
    g.fill();
  }
  g.globalAlpha = 1;

  // Hanging vines.
  g.strokeStyle = '#3b653d';
  g.globalAlpha = 0.7;
  for (let i = 0; i < 6; i += 1) {
    const x = -70 + i * 28;
    g.beginPath();
    g.moveTo(x, -104);
    g.quadraticCurveTo(x + 4, -84, x - 2, -66 - (i % 3) * 8 + Math.sin(time + i) * 2);
    g.stroke();
  }
  g.globalAlpha = 1;

  // A faint blue glow from inside.
  const inner = g.createRadialGradient(0, -34, 0, 0, -34, 80);
  inner.addColorStop(0, 'rgba(121, 214, 177, .1)');
  inner.addColorStop(1, 'rgba(121, 214, 177, 0)');
  g.fillStyle = inner;
  g.fillRect(-90, -120, 180, 170);
}

function drawPillar(g, item) {
  const s = item.s || 1;
  g.save();
  g.scale(s, s);
  shadow(g, 32, 9, 0.3);
  g.fillStyle = '#4a5240';
  rrect(g, -25, -12, 50, 16, 2);
  g.fill();
  g.fillStyle = '#6c745a';
  rrect(g, -20, -18, 40, 12, 2);
  g.fill();
  const grad = g.createLinearGradient(-16, 0, 16, 0);
  grad.addColorStop(0, '#3d4535');
  grad.addColorStop(0.45, '#7a8267');
  grad.addColorStop(1, '#414a39');
  g.fillStyle = grad;
  if (item.broken) {
    g.beginPath();
    g.moveTo(-16, -18);
    g.lineTo(-16, -100);
    g.lineTo(-6, -112);
    g.lineTo(3, -98);
    g.lineTo(12, -108);
    g.lineTo(16, -18);
    g.closePath();
    g.fill();
  } else {
    rrect(g, -16, -122, 32, 106, 2);
    g.fill();
    g.fillStyle = '#818a6e';
    rrect(g, -22, -132, 44, 13, 2);
    g.fill();
  }
  g.strokeStyle = 'rgba(33, 42, 29, .5)';
  g.lineWidth = 0.9;
  for (let i = -10; i <= 10; i += 5) {
    g.beginPath();
    g.moveTo(i, -20);
    g.lineTo(i, -96);
    g.stroke();
  }
  g.globalAlpha = 0.4;
  for (let i = 0; i < 5; i += 1) {
    ellipse(g, -10 + Math.random() * 20, -80 + Math.random() * 55, 4 + Math.random() * 9, 2 + Math.random() * 4, '#3f6b3d');
  }
  g.globalAlpha = 1;
  g.restore();
}

function drawGiantHead(g, item) {
  const s = item.s || 1;
  g.save();
  g.scale(s, s);
  shadow(g, 66, 16, 0.36);
  g.fillStyle = '#3f4939';
  rrect(g, -58, -16, 116, 20, 4);
  g.fill();
  const grad = g.createLinearGradient(-60, -130, 50, 0);
  grad.addColorStop(0, '#7d8168');
  grad.addColorStop(0.5, '#5c6550');
  grad.addColorStop(1, '#3d4737');
  g.fillStyle = grad;
  g.beginPath();
  g.ellipse(0, -62, 54, 64, -0.06, 0, TAU);
  g.fill();
  // Helmet band.
  g.fillStyle = '#4b5542';
  g.beginPath();
  g.ellipse(0, -96, 58, 30, -0.05, Math.PI, TAU);
  g.fill();
  g.strokeStyle = 'rgba(28, 36, 25, .55)';
  g.lineWidth = 1.2;
  g.beginPath();
  g.ellipse(0, -96, 58, 30, -0.05, Math.PI, TAU);
  g.stroke();
  for (let i = 0; i < 7; i += 1) {
    const x = -48 + i * 16;
    g.beginPath();
    g.moveTo(x, -118);
    g.lineTo(x + 5, -104);
    g.stroke();
  }
  // Face.
  g.fillStyle = '#384131';
  g.beginPath(); g.ellipse(-22, -72, 10, 5, -0.15, 0, TAU); g.fill();
  g.beginPath(); g.ellipse(22, -72, 10, 5, 0.15, 0, TAU); g.fill();
  g.fillStyle = '#6c755a';
  g.beginPath(); g.ellipse(0, -58, 13, 18, 0, 0, TAU); g.fill();
  g.strokeStyle = '#2e3728';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(-18, -42);
  g.quadraticCurveTo(0, -34, 18, -42);
  g.stroke();
  g.beginPath();
  g.moveTo(0, -54);
  g.lineTo(0, -44);
  g.stroke();
  // Eyes.
  g.fillStyle = '#e8b866';
  g.globalAlpha = 0.4;
  g.beginPath(); g.arc(-22, -74, 2.5, 0, TAU); g.fill();
  g.beginPath(); g.arc(22, -74, 2.5, 0, TAU); g.fill();
  g.globalAlpha = 1;
  // Moss.
  g.globalAlpha = 0.45;
  for (let i = 0; i < 10; i += 1) {
    ellipse(g, -50 + Math.random() * 100, -118 + Math.random() * 70, 5 + Math.random() * 12, 2 + Math.random() * 5, '#3e6b3b');
  }
  g.globalAlpha = 1;
  g.restore();
}

function drawGuardian(g, item, time) {
  const s = item.s || 1;
  const gold = item.gold;
  g.save();
  g.scale(s, s);
  if (item.flip) g.scale(-1, 1);
  shadow(g, 38, 11, 0.34);
  // Plinth.
  g.fillStyle = gold ? '#6d5a35' : '#4a5240';
  rrect(g, -32, -16, 64, 18, 2);
  g.fill();
  g.fillStyle = gold ? '#9d8655' : '#697158';
  rrect(g, -27, -22, 54, 10, 2);
  g.fill();

  // Body.
  const body = g.createLinearGradient(-30, -100, 30, -16);
  body.addColorStop(0, gold ? '#d7b878' : '#757d62');
  body.addColorStop(0.55, gold ? '#b89454' : '#59624c');
  body.addColorStop(1, gold ? '#715a2e' : '#333c2d');
  g.fillStyle = body;
  g.beginPath();
  g.moveTo(-26, -22);
  g.quadraticCurveTo(-32, -64, -18, -82);
  g.quadraticCurveTo(0, -96, 22, -80);
  g.quadraticCurveTo(32, -58, 24, -22);
  g.closePath();
  g.fill();
  // Head.
  g.beginPath();
  g.ellipse(0, -92, 20, 18, 0, 0, TAU);
  g.fill();
  // Ears.
  g.beginPath();
  g.moveTo(-17, -104); g.lineTo(-24, -121); g.lineTo(-8, -108); g.closePath(); g.fill();
  g.beginPath();
  g.moveTo(17, -104); g.lineTo(24, -121); g.lineTo(8, -108); g.closePath(); g.fill();
  // Paws.
  g.fillStyle = gold ? '#c8a763' : '#626b53';
  g.beginPath(); g.ellipse(-16, -20, 12, 7, 0, 0, TAU); g.fill();
  g.beginPath(); g.ellipse(16, -20, 12, 7, 0, 0, TAU); g.fill();
  // Face.
  g.fillStyle = gold ? '#705b2f' : '#39422f';
  g.beginPath(); g.ellipse(-7, -94, 4, 2.6, 0, 0, TAU); g.fill();
  g.beginPath(); g.ellipse(7, -94, 4, 2.6, 0, 0, TAU); g.fill();
  g.beginPath(); g.ellipse(0, -86, 5.5, 3, 0, 0, TAU); g.fill();
  // Eyes glow.
  g.fillStyle = gold ? '#ffe6a4' : '#8fd6a1';
  g.globalAlpha = 0.65 + 0.3 * Math.sin(time * 2 + item.y);
  g.beginPath(); g.arc(-7, -95, 1.7, 0, TAU); g.fill();
  g.beginPath(); g.arc(7, -95, 1.7, 0, TAU); g.fill();
  g.globalAlpha = 1;
  // Carvings.
  g.strokeStyle = gold ? 'rgba(255, 232, 164, .5)' : 'rgba(170, 190, 148, .35)';
  g.lineWidth = 1;
  g.beginPath();
  g.arc(0, -54, 11, 0, TAU);
  g.stroke();
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * TAU;
    g.beginPath();
    g.moveTo(Math.cos(a) * 12, -54 + Math.sin(a) * 12);
    g.lineTo(Math.cos(a) * 17, -54 + Math.sin(a) * 17);
    g.stroke();
  }
  g.restore();
}

function drawGate(g, item, time, state) {
  const p = clamp(state.gateProgress || 0, 0, 1);
  const flags = state.flags || {};
  const filled = [flags.jaguar, flags.serpent, flags.sun].filter(Boolean).length;
  shadow(g, 230, 34, 0.46);

  // Massive wall.
  const wall = g.createLinearGradient(-60, 0, 60, 0);
  wall.addColorStop(0, '#2a3328');
  wall.addColorStop(0.35, '#59614c');
  wall.addColorStop(0.6, '#6d755c');
  wall.addColorStop(1, '#273026');
  g.fillStyle = wall;
  rrect(g, -52, -336, 104, 672, 10);
  g.fill();
  g.strokeStyle = 'rgba(21, 29, 20, .6)';
  g.lineWidth = 1.4;
  g.stroke();

  // Stone joints.
  for (let y = -320; y < 330; y += 34) {
    g.globalAlpha = 0.25;
    g.beginPath();
    g.moveTo(-50, y);
    g.lineTo(50, y);
    g.stroke();
    g.beginPath();
    g.moveTo(-50, y);
    g.lineTo(-50, y + 34);
    g.stroke();
    g.beginPath();
    g.moveTo(50, y);
    g.lineTo(50, y + 34);
    g.stroke();
  }
  g.globalAlpha = 1;

  // Carvings on the wall.
  g.globalAlpha = 0.5;
  g.strokeStyle = '#d8c08a';
  g.lineWidth = 1.5;
  // Jaguar paw (north).
  g.save();
  g.translate(0, -258);
  for (let i = 0; i < 4; i += 1) {
    const a = -1.9 + i * 0.55;
    g.beginPath();
    g.ellipse(Math.cos(a) * 12, Math.sin(a) * 11, 3.5, 4.5, 0, 0, TAU);
    g.stroke();
  }
  g.beginPath();
  g.ellipse(0, 8, 9, 7, 0, 0, TAU);
  g.stroke();
  g.restore();
  // Serpent (south).
  g.save();
  g.translate(0, 250);
  g.beginPath();
  g.moveTo(-20, 16);
  g.bezierCurveTo(-6, 2, 8, 12, 15, -2);
  g.bezierCurveTo(20, -12, 4, -18, -4, -10);
  g.stroke();
  g.restore();
  g.globalAlpha = 1;

  // Towers / braziers.
  for (const side of [-1, 1]) {
    const y = side * 344;
    g.fillStyle = 'rgba(4, 12, 7, .4)';
    ellipse(g, 8, y + 18, 70, 22);
    g.fill();
    const tower = g.createRadialGradient(-14, y - 18, 6, 0, y, 70);
    tower.addColorStop(0, '#7c8468');
    tower.addColorStop(0.65, '#4b5441');
    tower.addColorStop(1, '#232c21');
    g.fillStyle = tower;
    g.beginPath();
    g.arc(0, y, 62, 0, TAU);
    g.fill();
    g.strokeStyle = 'rgba(24, 33, 23, .6)';
    g.lineWidth = 1.5;
    g.stroke();
    g.strokeStyle = 'rgba(172, 181, 142, .18)';
    g.lineWidth = 1;
    g.beginPath();
    g.arc(0, y, 50, 0, TAU);
    g.stroke();
    // Brazier.
    g.fillStyle = '#3a3220';
    g.beginPath();
    g.ellipse(0, y - 8, 17, 8, 0, 0, TAU);
    g.fill();
    const glow = g.createRadialGradient(0, y - 24, 2, 0, y - 24, 50);
    glow.addColorStop(0, 'rgba(255, 186, 88, .32)');
    glow.addColorStop(1, 'rgba(255, 186, 88, 0)');
    g.fillStyle = glow;
    g.fillRect(-54, y - 78, 108, 90);
    flame(g, 0, y - 12, 18, 34, time, side + 4);
  }

  // Doorway.
  const doorGrad = g.createLinearGradient(-36, 0, 36, 0);
  doorGrad.addColorStop(0, '#0a110c');
  doorGrad.addColorStop(0.5, '#050a07');
  doorGrad.addColorStop(1, '#0a110c');
  g.fillStyle = doorGrad;
  rrect(g, -38, -72, 76, 144, 6);
  g.fill();

  // Door leaves.
  if (p < 0.995) {
    const leaf = g.createLinearGradient(-36, 0, 36, 0);
    leaf.addColorStop(0, '#2c3529');
    leaf.addColorStop(0.4, '#5b644e');
    leaf.addColorStop(1, '#2b3428');
    g.fillStyle = leaf;
    const topY = -70 - 70 * p;
    const bottomY = 70 * p;
    rrect(g, -38, topY, 76, 70, 3);
    g.fill();
    rrect(g, -38, bottomY, 76, 70, 3);
    g.fill();
    g.strokeStyle = 'rgba(23, 31, 21, .65)';
    g.lineWidth = 1.2;
    g.stroke();
    // Carved lines on doors.
    g.strokeStyle = 'rgba(213, 189, 130, .28)';
    g.lineWidth = 1;
    for (let i = 0; i < 3; i += 1) {
      g.beginPath();
      g.moveTo(-30, topY + 14 + i * 16);
      g.lineTo(30, topY + 14 + i * 16);
      g.stroke();
      g.beginPath();
      g.moveTo(-30, bottomY + 14 + i * 16);
      g.lineTo(30, bottomY + 14 + i * 16);
      g.stroke();
    }
  }

  // Golden trim and sockets.
  g.strokeStyle = 'rgba(232, 184, 102, .55)';
  g.lineWidth = 2;
  rrect(g, -42, -78, 84, 156, 7);
  g.stroke();

  for (let i = 0; i < 3; i += 1) {
    const y = -128 - i * 44;
    const isFilled = i === 0 ? flags.jaguar : i === 1 ? flags.serpent : flags.sun;
    g.fillStyle = isFilled ? 'rgba(255, 217, 138, .26)' : 'rgba(4, 10, 6, .6)';
    g.beginPath();
    g.arc(0, y, 13, 0, TAU);
    g.fill();
    g.strokeStyle = isFilled ? '#ffd98a' : 'rgba(232, 184, 102, .35)';
    g.lineWidth = 1.4;
    g.stroke();
    if (isFilled) {
      const glow = g.createRadialGradient(0, y, 1, 0, y, 34);
      glow.addColorStop(0, 'rgba(255, 217, 138, .45)');
      glow.addColorStop(1, 'rgba(255, 217, 138, 0)');
      g.fillStyle = glow;
      g.fillRect(-36, y - 36, 72, 72);
    }
  }

  // Light through the open doorway.
  if (p > 0.02) {
    g.save();
    g.globalCompositeOperation = 'lighter';
    const light = g.createRadialGradient(0, 0, 10, 0, 0, 180);
    light.addColorStop(0, `rgba(255, 222, 145, ${0.32 * p})`);
    light.addColorStop(0.4, `rgba(255, 206, 115, ${0.1 * p})`);
    light.addColorStop(1, 'rgba(255, 206, 115, 0)');
    g.fillStyle = light;
    g.fillRect(-190, -190, 380, 380);
    g.restore();
  }
}

export function drawScenery(g, item, time, state) {
  const s = item.s || 1;
  if (item.kind === 'tree' || item.kind === 'palm' || item.kind === 'bush') {
    g.drawImage(item.sprite, item.x - item.ax * s, item.y - item.ay * s, item.bw * s, item.bh * s);
    return;
  }

  g.save();
  g.translate(item.x, item.y);
  if (item.flip) g.scale(-1, 1);
  switch (item.kind) {
    case 'tent': drawTent(g, time, item); break;
    case 'banner': drawBanner(g, time); break;
    case 'crate': drawCrate(g); break;
    case 'campfire': drawCampfire(g, time, item); break;
    case 'torch':
      if (!state.flags || !state.flags.torch) drawTorch(g, time);
      break;
    case 'shrineArch': drawShrineArch(g, time); break;
    case 'altar': drawAltar(g, item); break;
    case 'vines':
      if (!state.flags || !state.flags.vinesCut) drawVines(g, time);
      break;
    case 'caveMouth': drawCaveMouth(g, time); break;
    case 'pillar': drawPillar(g, item); break;
    case 'giantHead': drawGiantHead(g, item); break;
    case 'guardian': drawGuardian(g, item, time); break;
    case 'gate': drawGate(g, item, time, state); break;
    default: break;
  }
  g.restore();
}
