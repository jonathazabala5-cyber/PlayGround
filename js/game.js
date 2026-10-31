import {
  W, H, TS, RIVER, GATE, START, PLAYER_R, POS, TAU,
  clamp, lerp, dist, easeInOut, easeOut, smoothstep, angleTo, formatTime
} from './config.js';
import { createWorld, drawWater } from './world.js';
import { drawScenery } from './scenery.js';
import { ART, drawExplorer, drawYara, drawStone, drawMarker, drawCanoe, Particles } from './art.js';
import { AudioEngine } from './audio.js';

const $ = id => document.getElementById(id);

const canvas = $('game');
const ctx = canvas.getContext('2d', { alpha: false });
const lightCanvas = document.createElement('canvas');
const lctx = lightCanvas.getContext('2d');

const ui = {
  hud: $('hud'),
  objective: $('objective-text'),
  glyphs: [...document.querySelectorAll('.glyph')],
  glyphCount: $('glyph-count'),
  needle: $('needle-wrap'),
  compassLabel: $('compass-label'),
  compassDistance: $('compass-distance'),
  prompt: $('prompt'),
  promptLabel: $('prompt-label'),
  toast: $('toast'),
  toastText: $('toast-text'),
  dialogue: $('dialogue'),
  dialogueSpeaker: $('dialogue-speaker'),
  dialogueLine: $('dialogue-line'),
  dialoguePortrait: $('dialogue-portrait'),
  dialogueNext: $('dialogue-next'),
  title: $('title-screen'),
  startBtn: $('start-btn'),
  ending: $('ending'),
  replayBtn: $('replay-btn'),
  soundBtn: $('sound-btn'),
  keyHint: $('key-hint'),
  actionBtn: $('action-btn'),
  actionIcon: $('action-icon'),
  joystick: $('joystick'),
  stick: $('stick'),
  flash: $('flash'),
  statTime: $('stat-time'),
  statStones: $('stat-stones'),
  statDistance: $('stat-distance'),
  app: $('app')
};

const audio = new AudioEngine();
const world = createWorld();
const particles = new Particles(460);

const player = {
  x: START.x,
  y: START.y,
  vx: 0,
  vy: 0,
  face: 1,
  walk: 0,
  moving: false,
  lookX: 0,
  lookY: 1,
  riding: false,
  stepDist: 0
};

const game = {
  mode: 'title',
  time: 0,
  started: false,
  muted: false,
  flags: {
    talked: false,
    machete: false,
    torch: false,
    vinesCut: false,
    jaguar: false,
    serpent: false,
    sun: false,
    gateOpen: false,
    caveSeen: false
  },
  stats: { time: 0, distance: 0 },
  camera: { x: 1150, y: 900, scale: 1, shake: 0 },
  cut: null,
  dialogue: null,
  near: null,
  toastTimer: 0,
  hintTimer: 16,
  caveCooldown: 0,
  endingShown: false,
  flashTimer: 0,
  titleDirty: true
};

const view = { w: window.innerWidth, h: window.innerHeight, dpr: 1 };
let baseScaleValue = 1;
let vignetteGradient = null;

function computeBaseScale() {
  return clamp(Math.min(view.w / 1180, view.h / 760), 0.55, 1.3);
}

function resize() {
  view.w = window.innerWidth;
  view.h = window.innerHeight;
  view.dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(view.w * view.dpr);
  canvas.height = Math.round(view.h * view.dpr);
  canvas.style.width = `${view.w}px`;
  canvas.style.height = `${view.h}px`;
  lightCanvas.width = canvas.width;
  lightCanvas.height = canvas.height;
  baseScaleValue = computeBaseScale();
  vignetteGradient = ctx.createRadialGradient(
    view.w / 2, view.h / 2, Math.min(view.w, view.h) * 0.18,
    view.w / 2, view.h / 2, Math.max(view.w, view.h) * 0.78
  );
  vignetteGradient.addColorStop(0, 'rgba(1, 7, 4, 0)');
  vignetteGradient.addColorStop(0.62, 'rgba(1, 7, 4, .16)');
  vignetteGradient.addColorStop(1, 'rgba(1, 6, 4, .68)');
  if (game.mode === 'title') {
    game.camera.scale = baseScaleValue * 1.02;
    game.titleDirty = true;
  }
}

function isTouch() {
  return window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0 || window.innerWidth <= 720;
}

if (isTouch()) document.body.classList.add('touch');

// ---------- UI ----------

let hudCache = { objective: '', count: -1, label: '', distance: -1 };

function countGlyphs() {
  return [game.flags.jaguar, game.flags.serpent, game.flags.sun].filter(Boolean).length;
}

function objectiveText() {
  const n = countGlyphs();
  if (!game.flags.talked) return 'Habla con Yara en el campamento';
  if (!game.flags.jaguar) return `Recupera la Piedra del Jaguar · ${n}/3`;
  if (!game.flags.serpent) return `Recupera la Piedra de la Serpiente · ${n}/3`;
  if (!game.flags.sun) return `Recupera la Piedra del Sol · ${n}/3`;
  if (!game.flags.gateOpen) return 'Lleva las tres piedras a la Gran Puerta';
  return 'Entra en la Ciudad Perdida';
}

function getTarget() {
  if (!game.flags.talked) return { x: POS.yara.x, y: POS.yara.y, label: 'Yara' };
  if (!game.flags.jaguar) return { x: POS.shrine.x, y: POS.shrine.y, label: 'Santuario del Jaguar' };
  if (!game.flags.serpent) {
    if (!game.flags.torch) return { x: POS.torch.x, y: POS.torch.y, label: 'Antorcha' };
    return { x: POS.caveStone.x, y: POS.caveStone.y, label: 'Cueva de la Serpiente' };
  }
  if (!game.flags.sun) {
    if (player.x < RIVER.x1) return { x: POS.dockWest.x, y: POS.dockWest.y, label: 'Canoa' };
    return { x: POS.sunStone.x, y: POS.sunStone.y, label: 'Altar del Sol' };
  }
  if (!game.flags.gateOpen) return { x: GATE.x, y: 900, label: 'La Gran Puerta' };
  return { x: POS.city.x, y: POS.city.y, label: 'El Dorado' };
}

function updateHUD() {
  const objective = objectiveText();
  if (objective !== hudCache.objective) {
    ui.objective.textContent = objective;
    hudCache.objective = objective;
  }
  const count = countGlyphs();
  if (count !== hudCache.count) {
    ui.glyphCount.textContent = `${count} / 3`;
    ui.glyphs.forEach(el => {
      const key = el.dataset.glyph;
      el.classList.toggle('found', !!game.flags[key]);
    });
    hudCache.count = count;
  }
  const target = getTarget();
  const d = Math.round(dist(player.x, player.y, target.x, target.y) * 0.1);
  if (target.label !== hudCache.label) {
    ui.compassLabel.textContent = target.label;
    hudCache.label = target.label;
  }
  if (d !== hudCache.distance) {
    ui.compassDistance.textContent = `${d} m`;
    hudCache.distance = d;
  }
  const angle = angleTo(player.x, player.y, target.x, target.y) + Math.PI / 2;
  ui.needle.style.transform = `rotate(${angle}rad)`;
}

function toast(text, duration = 3.4) {
  ui.toastText.textContent = text;
  ui.toast.classList.remove('is-hidden');
  game.toastTimer = duration;
}

function hideToast() {
  ui.toast.classList.add('is-hidden');
  game.toastTimer = 0;
}

function updateToast(dt) {
  if (game.toastTimer > 0) {
    game.toastTimer -= dt;
    if (game.toastTimer <= 0) hideToast();
  }
}

function showDialogue(lines, onDone = null) {
  if (!lines.length) {
    if (onDone) onDone();
    return;
  }
  game.mode = 'dialogue';
  game.dialogue = {
    lines,
    index: 0,
    chars: 0,
    typing: true,
    onDone
  };
  ui.dialogue.classList.remove('is-hidden');
  document.body.classList.add('dialogue-open');
  hidePrompt();
  showLine(0);
}

function showLine(index) {
  const d = game.dialogue;
  if (!d) return;
  d.index = index;
  d.chars = 0;
  d.typing = true;
  const line = d.lines[index];
  ui.dialogueSpeaker.textContent = line.speaker || 'Yara';
  ui.dialogueLine.textContent = '';
  const portrait = line.speaker === 'Narración' ? '✦' : (line.speaker === 'Yara' ? 'Y' : '✦');
  ui.dialoguePortrait.firstElementChild.textContent = portrait;
}

function updateDialogue(dt) {
  const d = game.dialogue;
  if (!d) return;
  if (d.typing) {
    const line = d.lines[d.index];
    d.chars += dt * 48;
    const n = Math.min(line.text.length, Math.floor(d.chars));
    ui.dialogueLine.textContent = line.text.slice(0, n);
    if (n >= line.text.length) d.typing = false;
  }
}

function advanceDialogue() {
  const d = game.dialogue;
  if (!d) return;
  if (d.typing) {
    d.chars = d.lines[d.index].text.length;
    ui.dialogueLine.textContent = d.lines[d.index].text;
    d.typing = false;
    return;
  }
  if (d.index + 1 < d.lines.length) {
    showLine(d.index + 1);
    return;
  }
  endDialogue();
}

function endDialogue() {
  const d = game.dialogue;
  game.dialogue = null;
  ui.dialogue.classList.add('is-hidden');
  document.body.classList.remove('dialogue-open');
  game.mode = 'playing';
  if (d && d.onDone) d.onDone();
  updateHUD();
}

// ---------- interactions ----------

const interactions = [
  {
    id: 'yara',
    point: () => POS.yara,
    radius: 112,
    active: () => true,
    label: () => 'Hablar con Yara',
    run: talkYara
  },
  {
    id: 'torch',
    point: () => POS.torch,
    radius: 88,
    active: () => !game.flags.torch,
    label: () => 'Recoger antorcha',
    run: takeTorch
  },
  {
    id: 'vines',
    point: () => POS.vines,
    radius: 96,
    active: () => !game.flags.vinesCut,
    label: () => game.flags.machete ? 'Cortar las lianas' : 'Examinar las lianas',
    run: useVines
  },
  {
    id: 'jaguar',
    point: () => POS.shrine,
    radius: 98,
    active: () => game.flags.vinesCut && !game.flags.jaguar,
    label: () => 'Tomar la Piedra del Jaguar',
    run: takeJaguar
  },
  {
    id: 'cave',
    point: () => POS.caveEntrance,
    radius: 94,
    active: () => !game.flags.torch,
    label: () => 'Examinar la cueva',
    run: examineCave
  },
  {
    id: 'serpent',
    point: () => POS.caveStone,
    radius: 96,
    active: () => !game.flags.serpent,
    label: () => 'Tomar la Piedra de la Serpiente',
    run: takeSerpent
  },
  {
    id: 'sun',
    point: () => POS.sunStone,
    radius: 108,
    active: () => !game.flags.sun,
    label: () => 'Tomar la Piedra del Sol',
    run: takeSun
  },
  {
    id: 'canoe',
    point: () => player.x < RIVER.x1 ? POS.dockWest : POS.dockEast,
    radius: 100,
    active: () => !game.cut && !player.riding,
    label: () => player.x < RIVER.x1 ? 'Cruzar el río en canoa' : 'Volver al campamento',
    run: crossRiver
  },
  {
    id: 'gate',
    point: () => POS.gate,
    radius: 160,
    active: () => true,
    label: () => game.flags.gateOpen ? 'La Gran Puerta' : 'Abrir la Gran Puerta',
    run: useGate
  }
];

function findInteraction() {
  let best = null;
  let bestDist = Infinity;
  for (const item of interactions) {
    if (!item.active()) continue;
    const p = item.point();
    const d = dist(player.x, player.y, p.x, p.y);
    if (d <= item.radius && d < bestDist) {
      best = item;
      bestDist = d;
    }
  }
  return best;
}

function updatePrompt() {
  const active = (game.mode === 'playing') && !game.cut && !game.dialogue;
  const near = active ? findInteraction() : null;
  game.near = near;
  if (near) {
    const label = near.label();
    ui.prompt.classList.remove('is-hidden');
    ui.promptLabel.textContent = label;
    ui.actionBtn.classList.add('ready');
    ui.actionIcon.textContent = '✦';
    ui.actionBtn.setAttribute('aria-label', label);
  } else {
    hidePrompt();
  }
}

function hidePrompt() {
  ui.prompt.classList.add('is-hidden');
  ui.actionBtn.classList.remove('ready');
  if (!game.dialogue) {
    ui.actionIcon.textContent = '✦';
    ui.actionBtn.setAttribute('aria-label', 'Interactuar');
  }
}

function interact() {
  if (game.mode === 'title') {
    startGame();
    return;
  }
  if (game.mode === 'dialogue') {
    advanceDialogue();
    return;
  }
  if (game.mode !== 'playing') return;
  audio.resume();
  const near = findInteraction();
  if (near) {
    audio.resume();
    near.run();
  }
}

// ---------- story actions ----------

function talkYara() {
  if (!game.flags.talked) {
    showDialogue([
      { speaker: 'Yara', text: 'Así que tú eres el explorador del que hablan los remeros. Llegas justo a tiempo.' },
      { speaker: 'Yara', text: 'La leyenda es cierta: El Dorado existe. Pero la selva protege su secreto con tres piedras sagradas.' },
      { speaker: 'Yara', text: 'El jaguar, la serpiente y el sol. Sin ellas, la Gran Puerta jamás se abrirá.' },
      { speaker: 'Yara', text: 'Toma mi machete. Las lianas del santuario, al norte, no te dejarán pasar sin él.' },
      { speaker: 'Yara', text: 'Y coge una antorcha de la fogata. Al sur hay una cueva donde ni el sol se atreve a entrar.' },
      { speaker: 'Narración', text: 'Objetivo: recupera las tres piedras sagradas y encuentra la ciudad perdida.' }
    ], () => {
      game.flags.talked = true;
      game.flags.machete = true;
      audio.chime();
      toast('Machete obtenido. El santuario del jaguar está al norte.', 4);
      updateHUD();
    });
    return;
  }

  let text;
  if (!game.flags.jaguar) {
    text = 'El santuario del jaguar está al norte del campamento. Corta las lianas que bloquean la entrada y reclama la piedra.';
  } else if (!game.flags.serpent) {
    text = game.flags.torch
      ? 'La cueva del sur es profunda. Con la antorcha en la mano, la oscuridad no podrá detenerte.'
      : 'Antes de bajar a la cueva, coge una antorcha de la fogata. Sin luz, esa grieta se traga hasta los recuerdos.';
  } else if (!game.flags.sun) {
    text = 'La piedra del sol duerme en el altar de las ruinas, al otro lado del río. La canoa te llevará.';
  } else if (!game.flags.gateOpen) {
    text = 'Las tres piedras cantan. Lleva el jaguar, la serpiente y el sol a la Gran Puerta, al este.';
  } else {
    text = 'El Dorado es tuyo, explorador. Yo vigilaré que la selva no reclame tu regreso.';
  }
  showDialogue([{ speaker: 'Yara', text }]);
}

function takeTorch() {
  game.flags.torch = true;
  audio.pickup();
  particles.sparkle(POS.torch.x, POS.torch.y - 26, 12);
  toast('Antorcha encendida. La cueva del sur ya no es un misterio.', 4);
  updateHUD();
}

function useVines() {
  if (!game.flags.machete) {
    toast('Las lianas son demasiado gruesas. Necesitas un machete.');
    return;
  }
  game.flags.vinesCut = true;
  audio.cut();
  game.camera.shake = 0.35;
  for (let i = 0; i < 5; i += 1) {
    particles.leaf(POS.vines.x + (Math.random() - 0.5) * 170, POS.vines.y + (Math.random() - 0.5) * 30, 5);
  }
  toast('Has abierto paso al santuario del jaguar.');
  updateHUD();
}

function collect(kind) {
  game.flags[kind] = true;
  audio.pickup();
  const positions = { jaguar: POS.shrine, serpent: POS.caveStone, sun: POS.sunStone };
  const p = positions[kind];
  particles.sparkle(p.x, p.y, 24);
  particles.gold(p.x, p.y, 20);
  const names = { jaguar: 'Piedra del Jaguar', serpent: 'Piedra de la Serpiente', sun: 'Piedra del Sol' };
  const count = countGlyphs();
  toast(`${names[kind]} recuperada · ${count}/3`, 3.6);
  if (count === 3) {
    audio.chime();
    game.camera.shake = 0.25;
    setTimeout(() => {
      toast('Las tres piedras cantan. La Gran Puerta te espera al este.', 5);
    }, 1300);
  }
  updateHUD();
}

function takeJaguar() { collect('jaguar'); }
function takeSerpent() { collect('serpent'); }
function takeSun() { collect('sun'); }

function examineCave() {
  toast('La oscuridad es absoluta. Necesitas una antorcha para entrar.');
}

function crossRiver() {
  if (game.cut) return;
  const goEast = player.x < RIVER.x1;
  game.mode = 'cutscene';
  player.riding = true;
  player.vx = 0;
  player.vy = 0;
  world.canoe.side = goEast ? 'west' : 'east';
  world.canoe.x = goEast ? 1066 : 1198;
  game.cut = {
    type: 'canoe',
    t: 0,
    duration: 3.1,
    from: world.canoe.x,
    to: goEast ? 1198 : 1066,
    goEast,
    wake: 0
  };
  audio.splash();
  hidePrompt();
}

function useGate() {
  if (game.flags.gateOpen) {
    toast('La Gran Puerta está abierta. El Dorado te espera.');
    return;
  }
  const n = countGlyphs();
  if (n < 3) {
    toast(`La Gran Puerta tiene tres engastes vacíos. Te faltan ${3 - n} ${3 - n === 1 ? 'piedra' : 'piedras'}.`, 4);
    return;
  }
  game.mode = 'cutscene';
  player.vx = 0;
  player.vy = 0;
  game.cut = { type: 'gate', t: 0, done: false, dialog: false };
  audio.gate();
  game.camera.shake = 1.1;
  hidePrompt();
}

// ---------- cutscenes / ending ----------

function updateCutscene(dt) {
  const cut = game.cut;
  if (!cut) { game.mode = 'playing'; return; }
  cut.t += dt;

  if (cut.type === 'canoe') {
    const k = clamp(cut.t / cut.duration, 0, 1);
    const e = easeInOut(k);
    const x = lerp(cut.from, cut.to, e);
    world.canoe.x = x;
    world.canoe.y = 900 + Math.sin(game.time * 4) * 2;
    player.x = x;
    player.y = 916;
    cut.wake -= dt;
    if (cut.wake <= 0) {
      cut.wake = 0.12;
      particles.splash(x - Math.sign(cut.to - cut.from) * 22, 908, 4);
    }
    if (k >= 1) {
      player.riding = false;
      player.x = cut.goEast ? 1282 : 984;
      player.y = 900;
      world.canoe.x = cut.goEast ? 1198 : 1066;
      world.canoe.side = cut.goEast ? 'east' : 'west';
      game.cut = null;
      game.mode = 'playing';
      audio.splash();
      particles.splash(player.x, player.y + 8, 10);
      toast(cut.goEast ? 'Has cruzado el río. Las ruinas te esperan.' : 'De vuelta en el campamento.', 3);
      updateHUD();
    }
    return;
  }

  if (cut.type === 'gate') {
    const p = clamp(cut.t / 3.1, 0, 1);
    world.gate.progress = easeInOut(p);
    if (cut.t < 3.6) game.camera.shake = Math.max(game.camera.shake, 0.15);
    if (Math.random() < 0.35) {
      const socketY = [772, 728, 684][Math.floor(Math.random() * 3)];
      particles.gold(GATE.x + (Math.random() - 0.5) * 70, socketY, 1);
    }
    if (p >= 1 && !cut.done) {
      cut.done = true;
      game.flags.gateOpen = true;
      game.camera.shake = 0.8;
      audio.chime();
      updateHUD();
    }
    if (cut.done && !cut.dialog && cut.t > 4) {
      cut.dialog = true;
      showDialogue([
        { speaker: 'Narración', text: 'La piedra cede. Un rugido antiquísimo atraviesa la selva y los pájaros callan.' },
        { speaker: 'Narración', text: 'Ante ti se extiende El Dorado, la ciudad que el tiempo olvidó.' }
      ], () => {
        game.cut = null;
        game.mode = 'playing';
        player.x = Math.max(player.x, GATE.x - 55);
        toast('Entra en la Ciudad Perdida.', 4);
        audio.chime();
      });
    }
    return;
  }

  if (cut.type === 'ending') {
    const k = clamp(cut.t / 3.4, 0, 1);
    const e = easeInOut(k);
    player.x = lerp(cut.fromX, 3230, e);
    player.y = lerp(cut.fromY, 1060, e);
    player.moving = true;
    player.walk += dt * 9;
    player.face = 1;
    if (Math.random() < 0.55) particles.gold(player.x + (Math.random() - 0.5) * 120, player.y - Math.random() * 90, 2);
    if (cut.t > 4.5 && !cut.finished) {
      cut.finished = true;
      showEnding();
    }
  }
}

function startEnding() {
  if (game.mode === 'cutscene' || game.mode === 'ending') return;
  game.mode = 'cutscene';
  game.cut = { type: 'ending', t: 0, fromX: player.x, fromY: player.y, finished: false };
  player.vx = 0;
  player.vy = 0;
  hidePrompt();
  audio.win();
  game.camera.shake = 0.4;
}

function showEnding() {
  game.mode = 'ending';
  game.endingShown = true;
  game.cut = null;
  ui.hud.classList.add('is-hidden');
  ui.ending.classList.remove('is-hidden');
  document.body.classList.remove('dialogue-open');
  ui.statTime.textContent = formatTime(game.stats.time);
  ui.statStones.textContent = `${countGlyphs()} / 3`;
  ui.statDistance.textContent = `${Math.round(game.stats.distance * 0.1)} m`;
  audio.win();
}

// ---------- reset / start ----------

function resetGame() {
  game.flags = {
    talked: false, machete: false, torch: false, vinesCut: false,
    jaguar: false, serpent: false, sun: false, gateOpen: false, caveSeen: false
  };
  game.stats = { time: 0, distance: 0 };
  game.time = 0;
  game.cut = null;
  game.dialogue = null;
  game.near = null;
  game.endingShown = false;
  game.camera.shake = 0;
  game.camera.scale = baseScaleValue;
  game.hintTimer = 16;
  game.caveCooldown = 0;
  player.x = START.x;
  player.y = START.y;
  player.vx = 0;
  player.vy = 0;
  player.face = 1;
  player.walk = 0;
  player.moving = false;
  player.riding = false;
  player.stepDist = 0;
  world.gate.progress = 0;
  world.canoe.x = 1066;
  world.canoe.y = 900;
  world.canoe.side = 'west';
  particles.items.length = 0;
  hudCache = { objective: '', count: -1, label: '', distance: -1 };
  ui.ending.classList.add('is-hidden');
  ui.hud.classList.remove('is-hidden');
  document.body.classList.remove('dialogue-open');
  ui.dialogue.classList.add('is-hidden');
  hideToast();
  hidePrompt();
  updateHUD();
}

function startGame() {
  audio.init();
  audio.resume();
  if (!game.started) {
    game.started = true;
    resetGame();
  }
  ui.title.classList.add('is-hidden');
  ui.hud.classList.remove('is-hidden');
  ui.app.classList.remove('title-mode');
  game.mode = 'playing';
  game.camera.x = player.x;
  game.camera.y = player.y - 10;
  game.camera.scale = baseScaleValue;
  ui.keyHint.classList.remove('fade');
  game.hintTimer = 16;
  updateHUD();
  if (isTouch()) toast('Mueve con el joystick y toca ✦ para interactuar.', 4);
}

function replay() {
  resetGame();
  ui.ending.classList.add('is-hidden');
  ui.title.classList.add('is-hidden');
  ui.app.classList.remove('title-mode');
  game.mode = 'playing';
  game.started = true;
  audio.init();
  audio.resume();
  game.camera.x = player.x;
  game.camera.y = player.y - 10;
  game.camera.scale = baseScaleValue;
  toast('Una nueva expedición comienza.', 3);
}

// ---------- input ----------

const keys = { up: false, down: false, left: false, right: false, shift: false };
const touchInput = { active: false, x: 0, y: 0, pointer: null };

function keyName(event) {
  const key = event.key.toLowerCase();
  if (key === 'arrowup' || key === 'w') return 'up';
  if (key === 'arrowdown' || key === 's') return 'down';
  if (key === 'arrowleft' || key === 'a') return 'left';
  if (key === 'arrowright' || key === 'd') return 'right';
  if (key === 'shift') return 'shift';
  return null;
}

window.addEventListener('keydown', event => {
  const name = keyName(event);
  if (name) {
    keys[name] = true;
    if (name !== 'shift') {
      ui.keyHint.classList.add('fade');
      game.hintTimer = 0;
    }
    if (['up', 'down', 'left', 'right'].includes(name) || event.key === ' ') event.preventDefault();
  }
  if (event.key === 'e' || event.key === 'E' || event.key === ' ' || event.key === 'Enter') {
    if (game.mode === 'title' || game.mode === 'playing' || game.mode === 'dialogue') {
      event.preventDefault();
      interact();
    }
  }
  if (event.key === 'm' || event.key === 'M') toggleSound();
});

window.addEventListener('keyup', event => {
  const name = keyName(event);
  if (name) keys[name] = false;
});

window.addEventListener('blur', () => {
  keys.up = keys.down = keys.left = keys.right = keys.shift = false;
  resetJoystick();
});

function toggleSound() {
  game.muted = !game.muted;
  audio.setMuted(game.muted);
  ui.soundBtn.classList.toggle('muted', game.muted);
  ui.soundBtn.setAttribute('aria-label', game.muted ? 'Activar sonido' : 'Silenciar sonido');
}

ui.soundBtn.addEventListener('click', () => {
  audio.init();
  toggleSound();
});

ui.startBtn.addEventListener('click', startGame);
ui.replayBtn.addEventListener('click', replay);
ui.dialogue.addEventListener('click', advanceDialogue);

// Touch joystick.
function joystickCenter() {
  const rect = ui.joystick.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, radius: rect.width * 0.34 };
}

function moveStick(dx, dy) {
  const { radius } = joystickCenter();
  const len = Math.hypot(dx, dy);
  const clamped = Math.min(len, radius);
  const nx = len > 0 ? dx / len : 0;
  const ny = len > 0 ? dy / len : 0;
  ui.stick.style.transform = `translate(${nx * clamped}px, ${ny * clamped}px)`;
  touchInput.x = nx * (len / radius > 1 ? 1 : len / radius);
  touchInput.y = ny * (len / radius > 1 ? 1 : len / radius);
}

function resetJoystick() {
  touchInput.active = false;
  touchInput.pointer = null;
  touchInput.x = 0;
  touchInput.y = 0;
  ui.stick.style.transform = 'translate(0px, 0px)';
}

ui.joystick.addEventListener('pointerdown', event => {
  event.preventDefault();
  touchInput.active = true;
  touchInput.pointer = event.pointerId;
  ui.joystick.setPointerCapture(event.pointerId);
  const c = joystickCenter();
  moveStick(event.clientX - c.x, event.clientY - c.y);
});
ui.joystick.addEventListener('pointermove', event => {
  if (!touchInput.active || event.pointerId !== touchInput.pointer) return;
  event.preventDefault();
  const c = joystickCenter();
  moveStick(event.clientX - c.x, event.clientY - c.y);
});
ui.joystick.addEventListener('pointerup', event => {
  if (event.pointerId !== touchInput.pointer) return;
  resetJoystick();
});
ui.joystick.addEventListener('pointercancel', resetJoystick);

ui.actionBtn.addEventListener('pointerdown', event => {
  event.preventDefault();
  if (game.mode === 'dialogue') advanceDialogue();
  else if (game.mode === 'title') startGame();
  else interact();
});

document.addEventListener('touchmove', event => {
  if (event.target === canvas || event.target === document.body) event.preventDefault();
}, { passive: false });

// ---------- movement and collision ----------

function circleRect(x, y, r, rx, ry, rw, rh) {
  const cx = clamp(x, rx, rx + rw);
  const cy = clamp(y, ry, ry + rh);
  return (x - cx) ** 2 + (y - cy) ** 2 < r * r;
}

function canBeAt(x, y) {
  if (x < 38 || x > W - 38 || y < 48 || y > H - 36) return false;
  if (!player.riding) {
    if (circleRect(x, y, PLAYER_R + 2, RIVER.x1 + 6, -100, RIVER.x2 - RIVER.x1 - 12, H + 200)) return false;
  }
  if (!game.flags.gateOpen) {
    if (circleRect(x, y, PLAYER_R, GATE.wallX1, 560, GATE.wallX2 - GATE.wallX1, 680)) return false;
  } else {
    if (circleRect(x, y, PLAYER_R, GATE.wallX1, 560, GATE.wallX2 - GATE.wallX1, GATE.gapTop - 560)) return false;
    if (circleRect(x, y, PLAYER_R, GATE.wallX1, GATE.gapBottom, GATE.wallX2 - GATE.wallX1, 270)) return false;
  }
  for (const obstacle of world.obstacles) {
    if (obstacle.type === 'circle') {
      const rr = obstacle.r + PLAYER_R;
      if ((x - obstacle.x) ** 2 + (y - obstacle.y) ** 2 < rr * rr) return false;
    } else if (circleRect(x, y, PLAYER_R, obstacle.x, obstacle.y, obstacle.w, obstacle.h)) {
      return false;
    }
  }
  return true;
}

function movementInput() {
  let x = 0;
  let y = 0;
  if (keys.left) x -= 1;
  if (keys.right) x += 1;
  if (keys.up) y -= 1;
  if (keys.down) y += 1;
  if (touchInput.active) {
    x += touchInput.x;
    y += touchInput.y;
  }
  const len = Math.hypot(x, y);
  if (len > 1) { x /= len; y /= len; }
  return { x, y, len: Math.min(1, len) };
}

function updatePlayer(dt) {
  const input = movementInput();
  const running = keys.shift && input.len > 0.15;
  const speed = running ? 292 : 205;
  const targetX = input.x * speed;
  const targetY = input.y * speed;
  const blend = 1 - Math.exp(-13 * dt);
  player.vx = lerp(player.vx, targetX, blend);
  player.vy = lerp(player.vy, targetY, blend);
  if (input.len < 0.05) {
    player.vx *= Math.pow(0.0008, dt);
    player.vy *= Math.pow(0.0008, dt);
  }
  if (Math.abs(player.vx) < 2) player.vx = 0;
  if (Math.abs(player.vy) < 2) player.vy = 0;

  const startX = player.x;
  const startY = player.y;
  const nx = player.x + player.vx * dt;
  if (canBeAt(nx, player.y)) player.x = nx;
  else player.vx *= 0.15;
  const ny = player.y + player.vy * dt;
  if (canBeAt(player.x, ny)) player.y = ny;
  else player.vy *= 0.15;

  const moved = Math.hypot(player.x - startX, player.y - startY);
  game.stats.distance += moved;

  const velocity = Math.hypot(player.vx, player.vy);
  player.moving = velocity > 26;
  if (player.moving) {
    player.walk += dt * (5.5 + velocity * 0.036);
    if (input.x < -0.2) player.face = -1;
    if (input.x > 0.2) player.face = 1;
    player.lookX = clamp(input.x, -1, 1);
    player.lookY = clamp(input.y, -1, 1);
    player.stepDist += moved;
    if (player.stepDist > 34) {
      player.stepDist = 0;
      audio.step();
      particles.dust(player.x + (Math.random() - 0.5) * 8, player.y + 1, 1);
    }
  } else {
    player.walk += dt * 1.4;
  }

  // Knee-high vegetation rustle.
  if (player.moving && Math.random() < dt * 2.2) {
    particles.add('leaf', player.x + (Math.random() - 0.5) * 18, player.y - 4, {
      vx: (Math.random() - 0.5) * 16,
      vy: -4 - Math.random() * 8,
      gravity: 20,
      life: 0.8 + Math.random() * 0.5,
      size: 1.2 + Math.random(),
      color: '#6a9a4f'
    });
  }

  // Cave: no torch, no entry.
  if (player.x < 475 && player.y > 1378) {
    if (!game.flags.torch) {
      player.y = 1374;
      if (game.caveCooldown <= 0) {
        game.caveCooldown = 2.6;
        toast('La oscuridad es absoluta. Necesitas una antorcha para entrar.', 3.4);
      }
    } else if (!game.flags.caveSeen) {
      game.flags.caveSeen = true;
      toast('La antorcha revela un pasadizo oculto. Algo brilla al fondo.', 4.2);
    }
  }

  if (game.flags.gateOpen && player.x > 3020 && game.mode === 'playing') {
    startEnding();
  }
}

function updateCamera(dt) {
  let tx = player.x + player.vx * 0.12;
  let ty = player.y - 14 + player.vy * 0.08;
  let zoom = baseScaleValue;

  if (game.mode === 'title') {
    tx = 1160 + Math.sin(game.time * 0.05) * 70;
    ty = 900 + Math.sin(game.time * 0.037) * 34;
    zoom = baseScaleValue * 1.02;
  } else if (game.cut && game.cut.type === 'gate') {
    tx = GATE.x - 36;
    ty = 900;
    zoom = baseScaleValue * 1.18;
  } else if (game.cut && game.cut.type === 'canoe') {
    tx = player.x;
    ty = 906;
    zoom = baseScaleValue * 1.04;
  } else if (game.cut && game.cut.type === 'ending') {
    tx = lerp(player.x, 3260, 0.4);
    ty = 1040;
    zoom = baseScaleValue * 0.9;
  } else if (game.mode === 'ending') {
    tx = 3260 + Math.sin(game.time * 0.06) * 36;
    ty = 1050;
    zoom = baseScaleValue * 0.88;
  } else if (game.dialogue && game.cut && game.cut.type === 'gate') {
    tx = GATE.x - 36;
    ty = 900;
    zoom = baseScaleValue * 1.14;
  }

  const smooth = 1 - Math.exp(-4.4 * dt);
  const smoothZoom = 1 - Math.exp(-3.2 * dt);
  game.camera.x = lerp(game.camera.x, tx, smooth);
  game.camera.y = lerp(game.camera.y, ty, smooth);
  game.camera.scale = lerp(game.camera.scale, zoom, smoothZoom);

  const halfW = view.w / (2 * game.camera.scale);
  const halfH = view.h / (2 * game.camera.scale);
  game.camera.x = halfW * 2 >= W ? W / 2 : clamp(game.camera.x, halfW - 10, W - halfW + 10);
  game.camera.y = halfH * 2 >= H ? H / 2 : clamp(game.camera.y, halfH - 10, H - halfH + 10);

  game.camera.shake = Math.max(0, game.camera.shake - dt * 1.6);
}

// ---------- ambience ----------

let leafTimer = 0;
let emberTimer = 0;
let goldTimer = 0;

function updateAmbience(dt) {
  leafTimer -= dt;
  if (leafTimer <= 0) {
    leafTimer = 0.5 + Math.random() * 0.7;
    const scale = game.camera.scale;
    const halfW = view.w / (2 * scale);
    const halfH = view.h / (2 * scale);
    const x = game.camera.x + (Math.random() - 0.5) * halfW * 2;
    const y = game.camera.y - halfH - 40 + Math.random() * 80;
    particles.add('leaf', x, y, {
      vx: 8 + Math.random() * 22,
      vy: 14 + Math.random() * 18,
      gravity: 8,
      drag: 0.995,
      life: 5 + Math.random() * 3,
      size: 1.8 + Math.random() * 2.2,
      color: Math.random() > 0.55 ? '#6c9f50' : '#4c7e3f',
      spin: (Math.random() - 0.5) * 2.4,
      wobble: 16
    });
  }

  const campVisible = Math.abs(game.camera.x - POS.campfire.x) < view.w / game.camera.scale * 0.7 + 400;
  emberTimer -= dt;
  if (campVisible && emberTimer <= 0) {
    emberTimer = 0.14 + Math.random() * 0.2;
    particles.ember(POS.campfire.x + (Math.random() - 0.5) * 12, POS.campfire.y - 14, 1);
  }

  if (game.flags.gateOpen) {
    goldTimer -= dt;
    if (goldTimer <= 0) {
      goldTimer = 0.25 + Math.random() * 0.35;
      particles.gold(3090 + Math.random() * 300, 900 + Math.random() * 260, 1);
    }
  }
}

function updateCaveCooldown(dt) {
  if (game.caveCooldown > 0) game.caveCooldown -= dt;
  if (game.hintTimer > 0) {
    game.hintTimer -= dt;
    if (game.hintTimer <= 0) ui.keyHint.classList.add('fade');
  }
  if (game.flashTimer > 0) {
    game.flashTimer -= dt;
    if (game.flashTimer <= 0) ui.flash.classList.remove('fire');
  }
}

function update(dt) {
  game.time += dt;
  updateCaveCooldown(dt);

  if (game.mode === 'title') {
    updateCamera(dt);
  } else if (game.mode === 'playing') {
    game.stats.time += dt;
    updatePlayer(dt);
    updateCamera(dt);
    updateHUD();
    updatePrompt();
    if (!game.flags.gateOpen && countGlyphs() === 3 && game.near && game.near.id === 'gate') {
      if (ui.promptLabel.textContent !== 'Abrir la Gran Puerta') ui.promptLabel.textContent = 'Abrir la Gran Puerta';
    }
  } else if (game.mode === 'dialogue') {
    updateDialogue(dt);
    updateCamera(dt);
    updateHUD();
    hidePrompt();
  } else if (game.mode === 'cutscene') {
    game.stats.time += dt;
    updateCutscene(dt);
    updateCamera(dt);
    hidePrompt();
  } else if (game.mode === 'ending') {
    updateCamera(dt);
  }

  updateAmbience(dt);
  particles.update(dt);
  updateToast(dt);
}

// ---------- rendering ----------

function worldToScreen(x, y, camX, camY, scale) {
  return {
    x: view.w / 2 + (x - camX) * scale,
    y: view.h / 2 + (y - camY) * scale
  };
}

function drawGround(camX, camY, scale) {
  const halfW = view.w / (2 * scale);
  const halfH = view.h / (2 * scale);
  const left = camX - halfW - 40;
  const top = camY - halfH - 40;
  const right = camX + halfW + 40;
  const bottom = camY + halfH + 40;
  const sx = clamp(left, 0, W);
  const sy = clamp(top, 0, H);
  const ex = clamp(right, 0, W);
  const ey = clamp(bottom, 0, H);
  const w = ex - sx;
  const h = ey - sy;
  if (w <= 0 || h <= 0) return;
  for (const tile of world.ground) {
    const x0 = Math.max(sx, tile.x);
    const y0 = Math.max(sy, tile.y);
    const x1 = Math.min(ex, tile.x + tile.w);
    const y1 = Math.min(ey, tile.y + tile.h);
    if (x1 <= x0 || y1 <= y0) continue;
    ctx.drawImage(
      tile.canvas,
      (x0 - tile.x) * TS, (y0 - tile.y) * TS,
      (x1 - x0) * TS, (y1 - y0) * TS,
      x0, y0, x1 - x0, y1 - y0
    );
  }
}

function drawFireflies() {
  for (const f of world.fireflies) {
    const x = f.x + Math.sin(game.time * f.speed + f.phase) * f.radius;
    const y = f.y + Math.cos(game.time * f.speed * 0.7 + f.phase) * f.radius * 0.55;
    if (x < game.camera.x - view.w / game.camera.scale * 0.7 || x > game.camera.x + view.w / game.camera.scale * 0.7) continue;
    if (y < game.camera.y - view.h / game.camera.scale * 0.7 || y > game.camera.y + view.h / game.camera.scale * 0.7) continue;
    const pulse = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(game.time * 2.2 + f.phase * 3));
    ctx.globalAlpha = 0.28 * pulse;
    ctx.drawImage(ART.glowTeal, x - 12, y - 12, 24, 24);
    ctx.globalAlpha = 0.9 * pulse;
    ctx.fillStyle = '#e8ffe9';
    ctx.beginPath();
    ctx.arc(x, y, f.size * 0.75, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawGoldMotes() {
  if (!game.flags.gateOpen) return;
  for (const m of world.goldMotes) {
    const x = m.x + Math.sin(game.time * m.speed + m.phase) * m.radius;
    const y = m.y + Math.cos(game.time * m.speed * 0.8 + m.phase) * m.radius * 0.6;
    if (x < game.camera.x - view.w / game.camera.scale * 0.7 || x > game.camera.x + view.w / game.camera.scale * 0.7) continue;
    if (y < game.camera.y - view.h / game.camera.scale * 0.7 || y > game.camera.y + view.h / game.camera.scale * 0.7) continue;
    const pulse = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(game.time * 2 + m.phase * 2));
    ctx.globalAlpha = 0.25 * pulse;
    ctx.drawImage(ART.glowGold, x - 16, y - 16, 32, 32);
    ctx.globalAlpha = 0.9 * pulse;
    ctx.fillStyle = '#ffe9ae';
    ctx.beginPath();
    ctx.arc(x, y, m.size * 0.8, 0, TAU);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function buildDrawables() {
  const list = [];
  const scale = game.camera.scale;
  const margin = 420;
  const halfW = view.w / (2 * scale) + margin;
  const halfH = view.h / (2 * scale) + margin;
  const cx = game.camera.x;
  const cy = game.camera.y;

  for (const item of world.scenery) {
    if (Math.abs(item.x - cx) > halfW || Math.abs(item.y - cy) > halfH) continue;
    list.push({ y: item.y, type: 'scenery', item });
  }

  if (!game.flags.jaguar) {
    list.push({ y: POS.shrine.y, type: 'stone', stone: 'jaguar', x: POS.shrine.x, y: POS.shrine.y });
  }
  if (!game.flags.serpent) {
    list.push({ y: POS.caveStone.y, type: 'stone', stone: 'serpent', x: POS.caveStone.x, y: POS.caveStone.y });
  }
  if (!game.flags.sun) {
    list.push({ y: POS.sunStone.y, type: 'stone', stone: 'sun', x: POS.sunStone.x, y: POS.sunStone.y });
  }

  list.push({ y: POS.yara.y, type: 'yara' });
  list.push({ y: world.canoe.y + 10, type: 'canoe' });

  if (!player.riding && !(game.mode === 'title')) {
    list.push({ y: player.y, type: 'player' });
  }

  list.sort((a, b) => a.y - b.y);
  return list;
}

function render() {
  ctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
  ctx.fillStyle = '#081c13';
  ctx.fillRect(0, 0, view.w, view.h);

  const scale = game.camera.scale;
  const shakeX = (Math.random() - 0.5) * game.camera.shake * 26;
  const shakeY = (Math.random() - 0.5) * game.camera.shake * 20;
  const camX = game.camera.x + shakeX;
  const camY = game.camera.y + shakeY;

  ctx.save();
  ctx.translate(view.w / 2, view.h / 2);
  ctx.scale(scale, scale);
  ctx.translate(-camX, -camY);

  drawGround(camX, camY, scale);

  if (camX + view.w / (2 * scale) > RIVER.x1 - 80 && camX - view.w / (2 * scale) < RIVER.x2 + 80) {
    drawWater(ctx, world, game.time);
  }

  const drawables = buildDrawables();
  const state = { flags: game.flags, gateProgress: world.gate.progress };

  for (const entry of drawables) {
    if (entry.type === 'scenery') {
      drawScenery(ctx, entry.item, game.time, state);
    } else if (entry.type === 'stone') {
      drawStone(ctx, entry.x, entry.y, entry.stone, game.time, true);
    } else if (entry.type === 'yara') {
      drawYara(ctx, POS.yara.x, POS.yara.y, game.time);
      if (game.mode !== 'title') {
        const marker = game.flags.talked ? '?' : '!';
        drawMarker(ctx, POS.yara.x, POS.yara.y, game.time, marker);
      }
    } else if (entry.type === 'canoe') {
      drawCanoe(ctx, world.canoe, game.time, player.riding);
    } else if (entry.type === 'player') {
      drawExplorer(ctx, player, game.time, game.flags);
    }
  }

  particles.draw(ctx);
  drawFireflies();
  drawGoldMotes();

  ctx.restore();

  drawAtmosphere(camX, camY, scale);
}

function drawAtmosphere(camX, camY, scale) {
  // Sunbeams.
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.translate(view.w * 0.28, -view.h * 0.15);
  ctx.rotate(0.5);
  for (let i = 0; i < 4; i += 1) {
    const x = ((game.time * 4 + i * 260) % (view.w * 1.4)) - view.w * 0.3;
    const grad = ctx.createLinearGradient(x, 0, x + 130, 0);
    grad.addColorStop(0, 'rgba(255, 236, 170, 0)');
    grad.addColorStop(0.45, 'rgba(255, 236, 170, .06)');
    grad.addColorStop(1, 'rgba(255, 236, 170, 0)');
    ctx.fillStyle = grad;
    ctx.fillRect(x, -view.h * 0.4, 130, view.h * 2.2);
  }
  ctx.restore();

  // Cave darkness with a torch-carved hole. It only fades in once the
  // explorer gets close to the cave, so the rest of the jungle stays readable.
  const insideCave = player.x < 475 && player.y > 1378;
  const caveDX = (player.x - world.cave.x) / world.cave.rx;
  const caveDY = (player.y - world.cave.y) / world.cave.ry;
  const caveDist = Math.hypot(caveDX, caveDY);
  const caveFade = insideCave ? 1 : Math.max(0, Math.min(1, (1.35 - caveDist) / 0.35));
  if (caveFade > 0.01) {
    const caveCenter = worldToScreen(world.cave.x, world.cave.y, camX, camY, scale);
    const caveRX = world.cave.rx * scale;
    const caveRY = world.cave.ry * scale;
    lctx.setTransform(view.dpr, 0, 0, view.dpr, 0, 0);
    lctx.clearRect(0, 0, view.w, view.h);
    lctx.save();
    lctx.globalAlpha = caveFade;
    if (insideCave) {
      // Deep inside the cave: blanket the whole screen.
      lctx.fillStyle = 'rgba(1, 6, 3, .975)';
      lctx.fillRect(0, 0, view.w, view.h);
    } else {
      // Approaching the mouth: a soft-edged shadow over the cave floor.
      lctx.beginPath();
      lctx.ellipse(caveCenter.x, caveCenter.y, caveRX, caveRY, 0, 0, TAU);
      lctx.clip();
      const shade = lctx.createRadialGradient(caveCenter.x, caveCenter.y, caveRX * 0.35, caveCenter.x, caveCenter.y, caveRX);
      shade.addColorStop(0, 'rgba(1, 6, 3, .96)');
      shade.addColorStop(0.62, 'rgba(1, 6, 3, .9)');
      shade.addColorStop(0.86, 'rgba(1, 6, 3, .55)');
      shade.addColorStop(1, 'rgba(1, 6, 3, 0)');
      lctx.fillStyle = shade;
      lctx.fillRect(caveCenter.x - caveRX, caveCenter.y - caveRY, caveRX * 2, caveRY * 2);
    }

    if (game.flags.torch) {
      const p = worldToScreen(player.x, player.y, camX, camY, scale);
      const radius = Math.max(90, 230 * scale);
      if (insideCave) {
        // Cave walls block the light: keep the hole within the cave floor.
        lctx.beginPath();
        lctx.ellipse(caveCenter.x, caveCenter.y, caveRX * 1.04, caveRY * 1.04, 0, 0, TAU);
        lctx.clip();
      }
      const glow = lctx.createRadialGradient(p.x, p.y, 8, p.x, p.y, radius);
      glow.addColorStop(0, 'rgba(0,0,0,1)');
      glow.addColorStop(0.45, 'rgba(0,0,0,.94)');
      glow.addColorStop(0.78, 'rgba(0,0,0,.45)');
      glow.addColorStop(1, 'rgba(0,0,0,0)');
      lctx.globalCompositeOperation = 'destination-out';
      lctx.fillStyle = glow;
      lctx.fillRect(p.x - radius, p.y - radius, radius * 2, radius * 2);
    }
    lctx.restore();
    ctx.drawImage(lightCanvas, 0, 0, view.w, view.h);
  }

  // Torch warmth.
  if (game.flags.torch) {
    const p = worldToScreen(player.x, player.y, camX, camY, scale);
    const inCave = player.x < 475 && player.y > 1360;
    const radius = (inCave ? 300 : 130) * scale;
    const glow = ctx.createRadialGradient(p.x, p.y - 20, 4, p.x, p.y - 20, radius);
    glow.addColorStop(0, `rgba(255, 178, 82, ${inCave ? 0.24 : 0.1})`);
    glow.addColorStop(0.5, `rgba(255, 154, 62, ${inCave ? 0.1 : 0.035})`);
    glow.addColorStop(1, 'rgba(255, 154, 62, 0)');
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = glow;
    ctx.fillRect(p.x - radius, p.y - radius - 20, radius * 2, radius * 2);
    ctx.restore();
  }

  // Subtle color grade.
  const tint = ctx.createLinearGradient(0, 0, 0, view.h);
  tint.addColorStop(0, 'rgba(12, 38, 25, .12)');
  tint.addColorStop(0.55, 'rgba(0, 0, 0, 0)');
  tint.addColorStop(1, 'rgba(4, 14, 9, .2)');
  ctx.fillStyle = tint;
  ctx.fillRect(0, 0, view.w, view.h);

  if (vignetteGradient) {
    ctx.fillStyle = vignetteGradient;
    ctx.fillRect(0, 0, view.w, view.h);
  }
}

// ---------- boot ----------

window.addEventListener('resize', () => {
  resize();
  game.camera.scale = game.mode === 'title' ? baseScaleValue * 1.02 : game.camera.scale;
});
window.addEventListener('orientationchange', () => {
  resetJoystick();
  setTimeout(resize, 220);
});

resize();
updateHUD();
// Paint the title backdrop during load, then freeze it as a still image. The
// live canvas stays out of the compositor until the expedition begins.
render();
game.titleDirty = false;
try {
  ui.title.style.setProperty('--title-art', `url("${canvas.toDataURL('image/jpeg', 0.9)}")`);
} catch (error) {
  console.warn('Title backdrop unavailable', error);
}

let lastFrame = performance.now();
function frame(now) {
  let dt = (now - lastFrame) / 1000;
  lastFrame = now;
  dt = clamp(dt, 0, 0.045);
  if (!document.hidden) {
    update(dt);
    // The title is a single painted hero frame; skipping the heavy canvas
    // redraw keeps the start screen responsive while CSS handles its motion.
    if (game.mode !== 'title' || game.titleDirty) {
      render();
      game.titleDirty = false;
    }
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Debug hooks for automated visual checks.
window.__eldorado = {
  game,
  world,
  player,
  startGame,
  resetGame,
  replay,
  teleport(x, y, options = {}) {
    player.x = x;
    player.y = y;
    player.vx = 0;
    player.vy = 0;
    player.riding = false;
    game.camera.x = x;
    game.camera.y = y - 10;
    game.camera.scale = baseScaleValue;
    if (options.mode) game.mode = options.mode;
    updateHUD();
  },
  setFlags(flags) {
    Object.assign(game.flags, flags);
    if (flags.gateOpen) world.gate.progress = 1;
    hudCache = { objective: '', count: -1, label: '', distance: -1 };
    updateHUD();
  },
  collectAll() {
    Object.assign(game.flags, { talked: true, machete: true, torch: true, vinesCut: true, jaguar: true, serpent: true, sun: true });
    hudCache = { objective: '', count: -1, label: '', distance: -1 };
    updateHUD();
  },
  openGate() {
    Object.assign(game.flags, { talked: true, machete: true, torch: true, vinesCut: true, jaguar: true, serpent: true, sun: true, gateOpen: true });
    world.gate.progress = 1;
    hudCache = { objective: '', count: -1, label: '', distance: -1 };
    updateHUD();
  },
  getTarget
};
