import { TAU, ellipse, rrect, clamp, lerp } from './config.js';

// ---------- generated glow sprites ----------

function makeGlow(size, inner, mid) {
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, inner);
  grad.addColorStop(0.35, mid);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

export const ART = {
  glowWarm: makeGlow(128, 'rgba(255, 246, 210, 1)', 'rgba(255, 190, 90, .34)'),
  glowGold: makeGlow(160, 'rgba(255, 230, 166, .95)', 'rgba(240, 185, 82, .3)'),
  glowTeal: makeGlow(128, 'rgba(214, 255, 239, 1)', 'rgba(96, 220, 190, .28)'),
  glowRed: makeGlow(96, 'rgba(255, 200, 160, .9)', 'rgba(220, 100, 60, .25)')
};

// ---------- explorer ----------

export function drawExplorer(g, p, time, flags = {}) {
  const walk = p.walk || 0;
  const moving = !!p.moving;
  const face = p.face || 1;
  const lookX = clamp(p.lookX || 0, -1, 1);
  const lookY = clamp(p.lookY || 0, -1, 1);

  g.save();
  g.translate(p.x, p.y);

  // Shadow.
  g.globalAlpha = 0.36;
  ellipse(g, 0, 2, 16, 5.5, '#020b06');
  g.globalAlpha = 1;

  const bob = moving ? Math.abs(Math.sin(walk)) * 1.7 : Math.sin(time * 2.1) * 0.55;
  g.translate(0, -bob);
  g.scale(face, 1);

  const swing = moving ? Math.sin(walk) : 0;

  // Back arm.
  g.save();
  g.translate(-10, -34);
  g.rotate(-swing * 0.32);
  g.fillStyle = '#b57c4e';
  rrect(g, -3.2, 0, 6.4, 16, 3);
  g.fill();
  g.fillStyle = '#c78e5f';
  g.beginPath(); g.arc(0, 16, 3.6, 0, TAU); g.fill();
  g.restore();

  // Legs.
  function leg(x, phase, dark) {
    g.save();
    g.translate(x, -18);
    g.rotate(phase * 0.3);
    g.fillStyle = dark ? '#6b5132' : '#866742';
    rrect(g, -3.6, 0, 7.2, 15, 3);
    g.fill();
    g.fillStyle = '#3b2715';
    rrect(g, -4.2, 11, 8.4, 7, 3);
    g.fill();
    g.fillStyle = 'rgba(176, 140, 88, .5)';
    rrect(g, -3, 11, 6, 2, 1);
    g.fill();
    g.restore();
  }
  leg(-4.5, swing, true);
  leg(4.8, -swing, false);

  // Backpack.
  g.fillStyle = '#4b3620';
  rrect(g, -12, -43, 24, 21, 6);
  g.fill();
  g.fillStyle = '#5f462a';
  rrect(g, -10, -41, 20, 17, 5);
  g.fill();
  g.strokeStyle = 'rgba(35, 23, 12, .55)';
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(-7, -40); g.lineTo(-7, -26);
  g.moveTo(7, -40); g.lineTo(7, -26);
  g.stroke();

  // Torso: shirt and open vest.
  const shirt = g.createLinearGradient(-10, -46, 10, -18);
  shirt.addColorStop(0, '#e0cda1');
  shirt.addColorStop(1, '#b49b6c');
  g.fillStyle = shirt;
  rrect(g, -10, -45, 20, 28, 7);
  g.fill();
  g.fillStyle = '#43583a';
  g.beginPath();
  g.moveTo(-10, -44);
  g.quadraticCurveTo(-14, -32, -9, -18);
  g.lineTo(-2, -18);
  g.lineTo(-3, -44);
  g.closePath();
  g.fill();
  g.beginPath();
  g.moveTo(10, -44);
  g.quadraticCurveTo(14, -32, 9, -18);
  g.lineTo(2, -18);
  g.lineTo(3, -44);
  g.closePath();
  g.fill();
  g.fillStyle = '#2e4029';
  g.fillRect(-2.5, -44, 1.4, 26);
  g.fillRect(1.1, -44, 1.4, 26);

  // Belt and buckle.
  g.fillStyle = '#5c3d21';
  rrect(g, -10, -22, 20, 4.5, 1.5);
  g.fill();
  g.fillStyle = '#d7aa5c';
  rrect(g, -2.5, -22.4, 5, 5, 1);
  g.fill();
  g.fillStyle = '#3a2a14';
  g.fillRect(-1, -21.4, 2, 3);

  // Scarf.
  const scarfWave = Math.sin(time * 4 + (moving ? walk : 0)) * 2.5;
  g.fillStyle = '#b84b36';
  g.beginPath();
  g.ellipse(0, -44, 8, 3.4, 0, 0, TAU);
  g.fill();
  g.beginPath();
  g.moveTo(-5, -44);
  g.quadraticCurveTo(-16, -42 + scarfWave, -22, -34 + scarfWave);
  g.quadraticCurveTo(-14, -36 + scarfWave, -4, -40);
  g.closePath();
  g.fill();
  g.fillStyle = '#d06a4d';
  g.beginPath();
  g.ellipse(-1, -45.4, 5.2, 1.3, 0, 0, TAU);
  g.fill();

  // Front arm holding machete.
  g.save();
  g.translate(10, -35);
  g.rotate(swing * 0.3);
  g.fillStyle = '#c78e5f';
  rrect(g, -3, 0, 6, 15, 3);
  g.fill();
  g.fillStyle = '#c78e5f';
  g.beginPath(); g.arc(0, 16, 3.4, 0, TAU); g.fill();

  if (flags.machete) {
    g.save();
    g.translate(0, 16);
    g.rotate(0.75);
    g.fillStyle = '#4a3218';
    rrect(g, -2, -2, 4, 9, 1.5);
    g.fill();
    g.fillStyle = '#c9d4cc';
    g.beginPath();
    g.moveTo(-2, 6);
    g.lineTo(-3.6, 25);
    g.lineTo(1.6, 30);
    g.lineTo(2.6, 6);
    g.closePath();
    g.fill();
    g.strokeStyle = 'rgba(58, 76, 66, .5)';
    g.lineWidth = 0.8;
    g.stroke();
    g.restore();
  }
  g.restore();

  // Head.
  g.fillStyle = '#c78e5f';
  g.beginPath();
  g.arc(0, -53, 8.6, 0, TAU);
  g.fill();
  g.fillStyle = '#b57c4e';
  g.beginPath();
  g.arc(8.2, -52, 2.2, 0, TAU);
  g.fill();
  // Hair.
  g.fillStyle = '#33231a';
  g.beginPath();
  g.arc(-1, -55, 8.4, Math.PI * 0.9, Math.PI * 1.98);
  g.fill();
  g.fillStyle = '#3e2b1e';
  g.beginPath();
  g.ellipse(6, -56, 3.4, 5.4, 0.4, 0, TAU);
  g.fill();
  // Face.
  const blink = (Math.sin(time * 0.7 + 1.2) > 0.985) ? 0.2 : 1;
  g.fillStyle = '#2b1a11';
  g.beginPath();
  g.ellipse(-2.6 + lookX * 1.2, -52.4 + lookY * 0.9, 0.9, 0.9 * blink, 0, 0, TAU);
  g.fill();
  g.beginPath();
  g.ellipse(2.8 + lookX * 1.2, -52.4 + lookY * 0.9, 0.9, 0.9 * blink, 0, 0, TAU);
  g.fill();
  g.strokeStyle = '#7c4a34';
  g.lineWidth = 0.9;
  g.beginPath();
  g.arc(0.4 + lookX * 1.2, -49.6 + lookY * 0.5, 1.9, 0.15, Math.PI - 0.15);
  g.stroke();

  // Hat.
  const hatGrad = g.createLinearGradient(-14, -64, 12, -55);
  hatGrad.addColorStop(0, '#a37b44');
  hatGrad.addColorStop(1, '#6f512a');
  g.fillStyle = hatGrad;
  g.beginPath();
  g.ellipse(0, -59, 15.5, 4.4, -0.03, 0, TAU);
  g.fill();
  g.beginPath();
  g.moveTo(-8, -59);
  g.quadraticCurveTo(-8.5, -70, 0, -70);
  g.quadraticCurveTo(8.5, -70, 8, -59);
  g.closePath();
  g.fill();
  g.fillStyle = '#4a3218';
  rrect(g, -8, -63.5, 16, 3, 1);
  g.fill();
  g.strokeStyle = 'rgba(255, 235, 190, .35)';
  g.lineWidth = 0.8;
  g.beginPath();
  g.ellipse(0, -59, 13.5, 3.4, -0.03, 0.1, Math.PI - 0.4);
  g.stroke();

  // Torch in the other hand.
  if (flags.torch) {
    g.save();
    g.translate(-13, -28);
    g.rotate(-0.28);
    g.fillStyle = '#5e4425';
    rrect(g, -1.8, -2, 3.6, 20, 1.6);
    g.fill();
    g.fillStyle = '#4a3a20';
    rrect(g, -3.4, -7, 6.8, 7, 2);
    g.fill();
    const flick = Math.sin(time * 12) * 2 + Math.sin(time * 19) * 1;
    g.fillStyle = 'rgba(255, 158, 63, .95)';
    g.beginPath();
    g.moveTo(-5, -7);
    g.quadraticCurveTo(-7 + flick, -17, 0, -25);
    g.quadraticCurveTo(7 + flick, -17, 5, -7);
    g.closePath();
    g.fill();
    g.fillStyle = 'rgba(255, 229, 150, .95)';
    g.beginPath();
    g.moveTo(-2.6, -8);
    g.quadraticCurveTo(-2 + flick, -15, 0, -19);
    g.quadraticCurveTo(2.6 + flick, -15, 2.6, -8);
    g.closePath();
    g.fill();
    g.restore();
  }

  g.restore();
}

// ---------- Yara, the guide ----------

export function drawYara(g, x, y, time) {
  g.save();
  g.translate(x, y);
  g.globalAlpha = 0.34;
  ellipse(g, 0, 2, 15, 5.5, '#020b06');
  g.globalAlpha = 1;
  const bob = Math.sin(time * 1.7) * 0.8;
  g.translate(0, -bob);
  const sway = Math.sin(time * 1.4) * 1.2;

  // Staff.
  g.strokeStyle = '#6c512b';
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(15, 0);
  g.lineTo(18, -62);
  g.stroke();
  g.fillStyle = '#d2a65b';
  g.beginPath();
  g.arc(18, -64, 3.6, 0, TAU);
  g.fill();
  g.fillStyle = '#c8664b';
  g.beginPath();
  g.ellipse(18, -69, 2, 6, 0.2, 0, TAU);
  g.fill();
  g.fillStyle = '#5c9a62';
  g.beginPath();
  g.ellipse(21, -68, 1.8, 5.4, -0.4, 0, TAU);
  g.fill();

  // Long dress.
  const dress = g.createLinearGradient(-13, -52, 14, 0);
  dress.addColorStop(0, '#3f7a4f');
  dress.addColorStop(0.55, '#2c5c3a');
  dress.addColorStop(1, '#1e422a');
  g.fillStyle = dress;
  g.beginPath();
  g.moveTo(-8, -44);
  g.quadraticCurveTo(-15, -20, -11, 0);
  g.quadraticCurveTo(0, 5, 12, 0);
  g.quadraticCurveTo(15, -22, 8, -44);
  g.closePath();
  g.fill();
  g.strokeStyle = 'rgba(198, 172, 107, .45)';
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(-9, -16);
  g.quadraticCurveTo(0, -10, 10, -16);
  g.stroke();
  g.beginPath();
  g.moveTo(-10, -7);
  g.quadraticCurveTo(0, -1, 11, -7);
  g.stroke();

  // Shawl.
  g.fillStyle = '#8d4b36';
  g.beginPath();
  g.moveTo(-10, -44);
  g.quadraticCurveTo(0, -36, 10, -44);
  g.quadraticCurveTo(4, -38, 0, -37);
  g.quadraticCurveTo(-5, -38, -10, -44);
  g.fill();

  // Arms.
  g.fillStyle = '#a96f47';
  g.save();
  g.translate(-9, -40);
  g.rotate(-0.35 + sway * 0.02);
  rrect(g, -2.6, 0, 5.2, 16, 2.6);
  g.fill();
  g.restore();
  g.save();
  g.translate(9, -40);
  g.rotate(0.35);
  rrect(g, -2.6, 0, 5.2, 15, 2.6);
  g.fill();
  g.restore();

  // Necklace.
  g.strokeStyle = '#e8b866';
  g.lineWidth = 1;
  g.beginPath();
  g.arc(0, -42, 6, 0.2, Math.PI - 0.2);
  g.stroke();
  g.fillStyle = '#e8b866';
  g.beginPath();
  g.arc(0, -36.5, 1.8, 0, TAU);
  g.fill();

  // Neck and face.
  g.fillStyle = '#a96f47';
  g.fillRect(-2.5, -48, 5, 5);
  g.beginPath();
  g.ellipse(0, -54, 8.2, 9, 0, 0, TAU);
  g.fill();
  // Hair.
  g.fillStyle = '#211712';
  g.beginPath();
  g.ellipse(0, -56, 9.2, 9.6, 0, Math.PI, TAU);
  g.fill();
  g.beginPath();
  g.moveTo(-9, -55);
  g.quadraticCurveTo(-13, -38, -8, -28);
  g.quadraticCurveTo(-4, -34, -4, -48);
  g.closePath();
  g.fill();
  g.beginPath();
  g.moveTo(9, -55);
  g.quadraticCurveTo(13, -38, 8, -28);
  g.quadraticCurveTo(4, -34, 4, -48);
  g.closePath();
  g.fill();
  // Face details.
  g.fillStyle = '#2b1a11';
  g.beginPath(); g.ellipse(-2.7, -54.5, 0.8, 0.9, 0, 0, TAU); g.fill();
  g.beginPath(); g.ellipse(2.7, -54.5, 0.8, 0.9, 0, 0, TAU); g.fill();
  g.strokeStyle = '#6d3c2b';
  g.lineWidth = 0.9;
  g.beginPath();
  g.arc(0, -51, 1.8, 0.2, Math.PI - 0.2);
  g.stroke();
  // Face paint.
  g.strokeStyle = 'rgba(204, 96, 59, .75)';
  g.lineWidth = 1.2;
  g.beginPath(); g.moveTo(-6.5, -58); g.lineTo(-4, -57); g.stroke();
  g.beginPath(); g.moveTo(6.5, -58); g.lineTo(4, -57); g.stroke();

  // Feathered headdress.
  const feathers = [
    [-10, -64, '#d2a65b'], [-5, -68, '#5c9a62'], [0, -72, '#c8664b'], [5, -68, '#d2a65b'], [10, -64, '#5c9a62']
  ];
  for (const [fx, fy, color] of feathers) {
    g.fillStyle = color;
    g.save();
    g.translate(fx, fy);
    g.rotate(fx * 0.035);
    g.beginPath();
    g.ellipse(0, -9, 2.2, 10, 0, 0, TAU);
    g.fill();
    g.strokeStyle = 'rgba(255, 240, 200, .4)';
    g.lineWidth = 0.6;
    g.beginPath();
    g.moveTo(0, 0); g.lineTo(0, -17);
    g.stroke();
    g.restore();
  }
  g.fillStyle = '#b98d47';
  g.beginPath();
  g.ellipse(0, -62, 8.6, 2.6, 0, 0, TAU);
  g.fill();
  g.fillStyle = '#e8b866';
  g.beginPath();
  g.arc(0, -62, 2.2, 0, TAU);
  g.fill();

  g.restore();
}

// ---------- glyph stones ----------

export function drawStone(g, x, y, type, time, active, scale = 1) {
  const bob = Math.sin(time * 2.3 + x * 0.01) * 3;
  g.save();
  g.translate(x, y + bob);
  g.scale(scale, scale);

  if (active) {
    const pulse = 0.8 + Math.sin(time * 2.6) * 0.2;
    g.globalCompositeOperation = 'lighter';
    g.globalAlpha = 0.5 * pulse;
    g.drawImage(ART.glowGold, -58, -58, 116, 116);
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';

    // Rotating rays.
    g.save();
    g.rotate(time * 0.45);
    g.strokeStyle = 'rgba(255, 217, 138, .3)';
    g.lineWidth = 1;
    for (let i = 0; i < 10; i += 1) {
      const a = (i / 10) * TAU;
      g.beginPath();
      g.moveTo(Math.cos(a) * 19, Math.sin(a) * 19);
      g.lineTo(Math.cos(a) * (25 + (i % 2) * 4), Math.sin(a) * (25 + (i % 2) * 4));
      g.stroke();
    }
    g.restore();
  }

  // Medallion.
  g.fillStyle = 'rgba(4, 13, 8, .65)';
  g.beginPath();
  g.arc(0, 3, 19, 0, TAU);
  g.fill();
  const ring = g.createLinearGradient(-18, -18, 18, 18);
  ring.addColorStop(0, '#ffe9ae');
  ring.addColorStop(0.45, '#d6a452');
  ring.addColorStop(1, '#7a4f1e');
  g.fillStyle = ring;
  g.beginPath();
  g.arc(0, 0, 17, 0, TAU);
  g.fill();
  const inner = g.createRadialGradient(-4, -5, 1, 0, 0, 14);
  inner.addColorStop(0, '#224a35');
  inner.addColorStop(1, '#081b11');
  g.fillStyle = inner;
  g.beginPath();
  g.arc(0, 0, 13.2, 0, TAU);
  g.fill();

  g.strokeStyle = '#ffe0a0';
  g.fillStyle = '#ffe0a0';
  g.lineWidth = 1.5;
  if (type === 'jaguar') {
    for (let i = 0; i < 4; i += 1) {
      const a = -2.1 + i * 0.52;
      g.beginPath();
      g.ellipse(Math.cos(a) * 6, Math.sin(a) * 5.6, 1.9, 2.5, 0, 0, TAU);
      g.fill();
    }
    g.beginPath();
    g.ellipse(0, 4, 4.6, 3.4, 0, 0, TAU);
    g.fill();
  } else if (type === 'serpent') {
    g.beginPath();
    g.moveTo(-7, 7);
    g.bezierCurveTo(-2, 3, 5, 5, 5, 0);
    g.bezierCurveTo(5, -4, -1, -4, -2, -1);
    g.stroke();
    g.beginPath();
    g.arc(6, -2, 1.8, 0, TAU);
    g.fill();
    g.beginPath();
    g.moveTo(7.4, -2); g.lineTo(10, -3.4);
    g.stroke();
  } else {
    g.beginPath();
    g.arc(0, 0, 4.2, 0, TAU);
    g.stroke();
    for (let i = 0; i < 8; i += 1) {
      const a = (i / 8) * TAU;
      g.beginPath();
      g.moveTo(Math.cos(a) * 6, Math.sin(a) * 6);
      g.lineTo(Math.cos(a) * 9.6, Math.sin(a) * 9.6);
      g.stroke();
    }
  }
  g.restore();
}

export function drawMarker(g, x, y, time, char = '!') {
  const bob = Math.sin(time * 2.4) * 4;
  g.save();
  g.translate(x, y - 74 + bob);
  g.globalCompositeOperation = 'lighter';
  g.globalAlpha = 0.5;
  g.drawImage(ART.glowWarm, -26, -26, 52, 52);
  g.globalAlpha = 1;
  g.globalCompositeOperation = 'source-over';
  g.rotate(Math.PI / 4);
  g.fillStyle = '#0b2318';
  g.strokeStyle = '#e8b866';
  g.lineWidth = 1.4;
  rrect(g, -11, -11, 22, 22, 3);
  g.fill();
  g.stroke();
  g.rotate(-Math.PI / 4);
  g.fillStyle = '#ffd98a';
  g.font = '700 15px Georgia, serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText(char, 0, 1);
  g.restore();
}

// ---------- canoe ----------

export function drawCanoe(g, boat, time, rider) {
  const bob = Math.sin(time * 2 + 1) * 1.4;
  g.save();
  g.translate(boat.x, boat.y + bob);

  // Ripples.
  g.strokeStyle = 'rgba(195, 241, 224, .28)';
  g.lineWidth = 1.2;
  g.beginPath();
  g.ellipse(0, 10, 46, 8, 0, 0, TAU);
  g.stroke();
  g.globalAlpha = 0.5;
  g.beginPath();
  g.ellipse(0, 10, 34, 5.5, 0, 0.2, Math.PI - 0.2);
  g.stroke();
  g.globalAlpha = 1;

  // Hull.
  const hull = g.createLinearGradient(0, -14, 0, 15);
  hull.addColorStop(0, '#9a7240');
  hull.addColorStop(0.45, '#6f4f28');
  hull.addColorStop(1, '#3d2a15');
  g.fillStyle = hull;
  g.beginPath();
  g.moveTo(-46, -2);
  g.quadraticCurveTo(-30, 15, 0, 14);
  g.quadraticCurveTo(30, 15, 46, -2);
  g.quadraticCurveTo(30, 4, 0, 4);
  g.quadraticCurveTo(-30, 4, -46, -2);
  g.closePath();
  g.fill();
  g.strokeStyle = 'rgba(44, 28, 13, .6)';
  g.lineWidth = 1;
  g.stroke();

  // Inner rim.
  g.strokeStyle = '#b08a52';
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(-44, -2);
  g.quadraticCurveTo(0, 9, 44, -2);
  g.stroke();

  // Seats.
  g.strokeStyle = '#7c5a31';
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(-14, -3);
  g.lineTo(-14, 6);
  g.moveTo(13, -3);
  g.lineTo(13, 6);
  g.stroke();

  // Prow curls.
  g.strokeStyle = '#3d2a15';
  g.lineWidth = 2.4;
  g.beginPath();
  g.moveTo(-46, -2);
  g.quadraticCurveTo(-54, -8, -50, -15);
  g.stroke();
  g.beginPath();
  g.moveTo(46, -2);
  g.quadraticCurveTo(54, -8, 50, -15);
  g.stroke();

  // Carved eye.
  g.strokeStyle = 'rgba(232, 184, 102, .55)';
  g.lineWidth = 1;
  g.beginPath();
  g.arc(-38, 2, 3.4, 0, TAU);
  g.stroke();

  // Paddle.
  g.save();
  g.rotate(-0.55);
  g.strokeStyle = '#7d5c31';
  g.lineWidth = 2.4;
  g.beginPath();
  g.moveTo(8, 2);
  g.lineTo(34, -18);
  g.stroke();
  g.fillStyle = '#8f6a3a';
  g.beginPath();
  g.ellipse(37, -21, 3.6, 7, 0.7, 0, TAU);
  g.fill();
  g.restore();

  if (rider) {
    // Seated explorer.
    g.save();
    g.translate(-2, -8);
    g.fillStyle = '#d9c79b';
    rrect(g, -7, -12, 14, 15, 5);
    g.fill();
    g.fillStyle = '#43583a';
    rrect(g, -7, -12, 14, 5, 2);
    g.fill();
    g.fillStyle = '#c78e5f';
    g.beginPath();
    g.arc(0, -19, 6.4, 0, TAU);
    g.fill();
    g.fillStyle = '#8c6a3b';
    g.beginPath();
    g.ellipse(0, -24, 11, 3.2, 0, 0, TAU);
    g.fill();
    g.beginPath();
    g.moveTo(-6, -24);
    g.quadraticCurveTo(-6, -32, 0, -32);
    g.quadraticCurveTo(6, -32, 6, -24);
    g.closePath();
    g.fill();
    g.fillStyle = '#4a3218';
    rrect(g, -6, -28, 12, 2.4, 1);
    g.fill();
    g.fillStyle = '#2b1a11';
    g.beginPath(); g.arc(-2.2, -19, 0.7, 0, TAU); g.fill();
    g.beginPath(); g.arc(2.2, -19, 0.7, 0, TAU); g.fill();
    g.restore();
  }

  g.restore();
}

// ---------- particles ----------

export class Particles {
  constructor(max = 420) {
    this.items = [];
    this.max = max;
  }

  add(type, x, y, options = {}) {
    if (this.items.length >= this.max) this.items.shift();
    const life = options.life ?? (type === 'leaf' ? 2.4 : type === 'ember' ? 1.1 : 0.9);
    this.items.push({
      type,
      x,
      y,
      vx: options.vx ?? 0,
      vy: options.vy ?? 0,
      gravity: options.gravity ?? 0,
      drag: options.drag ?? 1,
      life,
      maxLife: life,
      size: options.size ?? 2,
      color: options.color ?? '#ffffff',
      rot: options.rot ?? Math.random() * TAU,
      spin: options.spin ?? (Math.random() - 0.5) * 4,
      wobble: options.wobble ?? 0,
      phase: Math.random() * TAU
    });
  }

  leaf(x, y, n = 1) {
    for (let i = 0; i < n; i += 1) {
      this.add('leaf', x + (Math.random() - 0.5) * 20, y + (Math.random() - 0.5) * 8, {
        vx: (Math.random() - 0.5) * 40,
        vy: -18 - Math.random() * 40,
        gravity: 34,
        drag: 0.985,
        life: 1.8 + Math.random() * 1.8,
        size: 1.6 + Math.random() * 2.4,
        color: Math.random() > 0.5 ? '#5f9c52' : '#3d7a43',
        spin: (Math.random() - 0.5) * 4,
        wobble: 12
      });
    }
  }

  dust(x, y, n = 2, color = '#9c8156') {
    for (let i = 0; i < n; i += 1) {
      this.add('dust', x, y, {
        vx: (Math.random() - 0.5) * 18,
        vy: -4 - Math.random() * 10,
        gravity: -2,
        drag: 0.9,
        life: 0.5 + Math.random() * 0.5,
        size: 2 + Math.random() * 3.5,
        color
      });
    }
  }

  splash(x, y, n = 8) {
    for (let i = 0; i < n; i += 1) {
      this.add('splash', x + (Math.random() - 0.5) * 10, y, {
        vx: (Math.random() - 0.5) * 70,
        vy: -30 - Math.random() * 60,
        gravity: 170,
        life: 0.5 + Math.random() * 0.4,
        size: 1.2 + Math.random() * 2,
        color: Math.random() > 0.35 ? '#b7eee0' : '#e6fff7'
      });
    }
  }

  ember(x, y, n = 1) {
    for (let i = 0; i < n; i += 1) {
      this.add('ember', x + (Math.random() - 0.5) * 8, y, {
        vx: (Math.random() - 0.5) * 14,
        vy: -16 - Math.random() * 26,
        gravity: -6,
        drag: 0.99,
        life: 0.7 + Math.random() * 1.1,
        size: 0.8 + Math.random() * 1.7,
        color: Math.random() > 0.4 ? '#ffc46a' : '#ff8d3c'
      });
    }
  }

  gold(x, y, n = 1) {
    for (let i = 0; i < n; i += 1) {
      this.add('gold', x + (Math.random() - 0.5) * 30, y + (Math.random() - 0.5) * 20, {
        vx: (Math.random() - 0.5) * 26,
        vy: -14 - Math.random() * 24,
        gravity: 10,
        drag: 0.99,
        life: 1.6 + Math.random() * 2.4,
        size: 1 + Math.random() * 2.6,
        color: Math.random() > 0.5 ? '#ffd98a' : '#f0bb5f',
        spin: (Math.random() - 0.5) * 3,
        wobble: 8
      });
    }
  }

  sparkle(x, y, n = 6) {
    for (let i = 0; i < n; i += 1) {
      this.add('gold', x + (Math.random() - 0.5) * 12, y + (Math.random() - 0.5) * 12, {
        vx: (Math.random() - 0.5) * 50,
        vy: (Math.random() - 0.5) * 50 - 12,
        gravity: 12,
        drag: 0.97,
        life: 0.6 + Math.random() * 0.8,
        size: 1 + Math.random() * 2,
        color: '#ffe5a6'
      });
    }
  }

  update(dt) {
    for (let i = this.items.length - 1; i >= 0; i -= 1) {
      const p = this.items[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.items.splice(i, 1);
        continue;
      }
      p.vy += p.gravity * dt;
      p.vx *= Math.pow(p.drag, dt * 60);
      p.vy *= Math.pow(p.drag, dt * 60);
      p.x += (p.vx + (p.wobble ? Math.sin(p.life * 5 + p.phase) * p.wobble : 0)) * dt;
      p.y += p.vy * dt;
      p.rot += p.spin * dt;
    }
  }

  draw(g) {
    for (const p of this.items) {
      const t = p.life / p.maxLife;
      g.globalAlpha = p.type === 'dust' ? t * 0.45 : Math.min(1, t * 1.6);
      if (p.type === 'ember' || p.type === 'gold') {
        g.globalCompositeOperation = 'lighter';
        const s = p.size * 4;
        g.drawImage(p.type === 'gold' ? ART.glowGold : ART.glowWarm, p.x - s / 2, p.y - s / 2, s, s);
        g.fillStyle = p.color;
        g.beginPath();
        g.arc(p.x, p.y, p.size * 0.7, 0, TAU);
        g.fill();
        g.globalCompositeOperation = 'source-over';
      } else if (p.type === 'leaf') {
        g.save();
        g.translate(p.x, p.y);
        g.rotate(p.rot);
        g.fillStyle = p.color;
        g.beginPath();
        g.ellipse(0, 0, p.size * 1.5, p.size * 0.65, 0, 0, TAU);
        g.fill();
        g.restore();
      } else if (p.type === 'splash') {
        g.fillStyle = p.color;
        g.beginPath();
        g.arc(p.x, p.y, p.size, 0, TAU);
        g.fill();
      } else {
        g.fillStyle = p.color;
        g.beginPath();
        g.arc(p.x, p.y, p.size, 0, TAU);
        g.fill();
      }
    }
    g.globalAlpha = 1;
    g.globalCompositeOperation = 'source-over';
  }
}
