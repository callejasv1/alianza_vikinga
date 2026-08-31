/* =============================================
   ALIANZA VIKINGA — Lógica de la app
   ============================================= */

'use strict';

// ── Configuración de pistas ──
const TRACKS = {
  1: {
    file:    'audio/mitologica.mp3',
    name:    'Música Mitológica',
    detail:  'Yggdrasil · Odín · Thor',
    icon:    '🌿',
    cardId:  'card-1'
  },
  2: {
    file:    'audio/historica.mp3',
    name:    'Música Histórica',
    detail:  'Erik el Rojo · Leif Erikson',
    icon:    '⚓',
    cardId:  'card-2'
  },
  3: {
    file:    'audio/dragones.mp3',
    name:    'Música de Dragones',
    detail:  'Furia Nocturna · Furia Luminosa',
    icon:    '🐉',
    cardId:  'card-3'
  },
  4: {
    file:    'audio/reyes.mp3',
    name:    'Entrada de los Reyes',
    detail:  'Rey Iñaki · Reina Josefa',
    icon:    '👑',
    cardId:  'card-4'
  }
};

// Presets de volumen
const VOL_MAX  = 1.0;
const VOL_LOW  = 0.15;   // volumen fondo (narrador habla encima)
const FADE_MS  = 800;    // duración del fade in/out en ms
const FADE_STEPS = 40;   // pasos de fade

// ── Estado ──
let currentTrack = null;   // número de pista activa (1-4) o null
let currentAudio = null;   // objeto Audio activo
let audioCache   = {};     // cache de objetos Audio por número
let isMuted      = false;
let targetVolume = 0.80;   // volumen objetivo actual
let fadeTimer    = null;

// ── DOM refs ──
const nowPlayingEl = document.getElementById('now-playing');
const npIcon       = document.getElementById('np-icon');
const npTrack      = document.getElementById('np-track');
const npBars       = document.getElementById('np-bars');
const volSlider    = document.getElementById('vol-slider');
const volPercent   = document.getElementById('vol-percent');
const btnMax       = document.getElementById('btn-max');
const btnLow       = document.getElementById('btn-low');
const btnMute      = document.getElementById('btn-mute');

// ── Inicialización ──
document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initPlayButtons();
  initVolumeControls();
  updateSliderTrack(volSlider.value);
});

// ── Partículas flotantes ──
function initParticles() {
  const container = document.getElementById('particles');
  const count = window.innerWidth < 600 ? 18 : 35;
  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left      = Math.random() * 100 + 'vw';
    p.style.animationDuration = (6 + Math.random() * 14) + 's';
    p.style.animationDelay    = (Math.random() * 12) + 's';
    p.style.width = p.style.height = (1 + Math.random() * 2.5) + 'px';
    p.style.opacity = Math.random() * 0.7;
    container.appendChild(p);
  }
}

// ── Botones de reproducción ──
function initPlayButtons() {
  document.querySelectorAll('.play-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const trackNum = parseInt(btn.dataset.track, 10);
      handleTrackClick(trackNum);
    });
  });
}

function handleTrackClick(trackNum) {
  if (currentTrack === trackNum) {
    // Misma pista: pausar / reanudar
    if (currentAudio && !currentAudio.paused) {
      pauseCurrent();
    } else {
      resumeCurrent();
    }
    return;
  }
  // Nueva pista
  playSwitchTo(trackNum);
}

function playSwitchTo(trackNum) {
  const track = TRACKS[trackNum];
  if (!track) return;

  // Fade out de la pista anterior
  if (currentAudio && !currentAudio.paused) {
    const prevAudio = currentAudio;
    fadeOut(prevAudio, () => { prevAudio.pause(); prevAudio.currentTime = 0; });
  }

  // Desmarcar tarjeta y botón anterior
  if (currentTrack) clearActiveState(currentTrack);

  currentTrack = trackNum;

  // Obtener / crear el objeto Audio
  if (!audioCache[trackNum]) {
    audioCache[trackNum] = new Audio(track.file);
    audioCache[trackNum].loop = true;
    audioCache[trackNum].preload = 'auto';

    // Gestión de errores
    audioCache[trackNum].addEventListener('error', () => {
      showError(trackNum);
    });
  }

  currentAudio = audioCache[trackNum];
  currentAudio.volume = 0;
  currentAudio.currentTime = 0;

  const playPromise = currentAudio.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => fadeIn(currentAudio, isMuted ? 0 : targetVolume))
      .catch(err => {
        console.warn('Playback failed:', err);
        showError(trackNum);
      });
  }

  // UI: marcar activo
  setActiveState(trackNum);
  updateNowPlaying(track);
}

function pauseCurrent() {
  if (!currentAudio) return;
  fadeOut(currentAudio, () => currentAudio.pause());
  updatePlayBtn(currentTrack, false);
  npBars.classList.remove('playing');
}

function resumeCurrent() {
  if (!currentAudio) return;
  const playPromise = currentAudio.play();
  if (playPromise !== undefined) {
    playPromise
      .then(() => fadeIn(currentAudio, isMuted ? 0 : targetVolume))
      .catch(console.warn);
  }
  updatePlayBtn(currentTrack, true);
  npBars.classList.add('playing');
}

// ── Fade in / out ──
function fadeIn(audio, toVolume) {
  clearInterval(fadeTimer);
  const step = toVolume / FADE_STEPS;
  let v = 0;
  audio.volume = 0;
  fadeTimer = setInterval(() => {
    v = Math.min(v + step, toVolume);
    audio.volume = v;
    if (v >= toVolume) clearInterval(fadeTimer);
  }, FADE_MS / FADE_STEPS);
}

function fadeOut(audio, onDone) {
  clearInterval(fadeTimer);
  const startV = audio.volume;
  const step = startV / FADE_STEPS;
  let v = startV;
  fadeTimer = setInterval(() => {
    v = Math.max(v - step, 0);
    audio.volume = v;
    if (v <= 0) {
      clearInterval(fadeTimer);
      if (onDone) onDone();
    }
  }, FADE_MS / FADE_STEPS);
}

// ── UI helpers ──
function setActiveState(trackNum) {
  const track = TRACKS[trackNum];
  const card  = document.getElementById(track.cardId);
  const btn   = card ? card.querySelector('.play-btn') : null;
  if (card) card.classList.add('active');
  if (btn)  { btn.classList.add('playing'); btn.querySelector('.btn-icon').textContent = '⏸'; btn.querySelector('.btn-label').textContent = 'Pausar'; }
}

function clearActiveState(trackNum) {
  const track = TRACKS[trackNum];
  if (!track) return;
  const card = document.getElementById(track.cardId);
  const btn  = card ? card.querySelector('.play-btn') : null;
  if (card) card.classList.remove('active');
  if (btn)  { btn.classList.remove('playing'); btn.querySelector('.btn-icon').textContent = '▶'; btn.querySelector('.btn-label').textContent = 'Reproducir'; }
}

function updatePlayBtn(trackNum, isPlaying) {
  const track = TRACKS[trackNum];
  if (!track) return;
  const card = document.getElementById(track.cardId);
  const btn  = card ? card.querySelector('.play-btn') : null;
  if (!btn) return;
  if (isPlaying) {
    btn.classList.add('playing');
    btn.querySelector('.btn-icon').textContent  = '⏸';
    btn.querySelector('.btn-label').textContent = 'Pausar';
  } else {
    btn.classList.remove('playing');
    btn.querySelector('.btn-icon').textContent  = '▶';
    btn.querySelector('.btn-label').textContent = 'Reproducir';
  }
}

function updateNowPlaying(track) {
  npIcon.textContent  = track.icon;
  npTrack.textContent = track.name + ' — ' + track.detail;
  nowPlayingEl.querySelector('.np-label').textContent = '♪ Reproduciendo';
  npBars.classList.add('playing');
}

function showError(trackNum) {
  const track = TRACKS[trackNum];
  clearActiveState(trackNum);
  if (currentTrack === trackNum) {
    npIcon.textContent  = '⚠️';
    npTrack.textContent = 'No se pudo cargar: ' + track.name;
    nowPlayingEl.querySelector('.np-label').textContent = 'Error';
    npBars.classList.remove('playing');
    currentTrack = null;
    currentAudio = null;
  }
}

// ── Controles de volumen ──
function initVolumeControls() {
  btnMax.addEventListener('click', () => setVolumePreset(VOL_MAX,  'max'));
  btnLow.addEventListener('click', () => setVolumePreset(VOL_LOW,  'low'));
  btnMute.addEventListener('click', toggleMute);

  volSlider.addEventListener('input', () => {
    const val = parseInt(volSlider.value, 10);
    targetVolume = val / 100;
    isMuted = (val === 0);
    if (currentAudio && !currentAudio.paused) {
      clearInterval(fadeTimer);
      currentAudio.volume = targetVolume;
    }
    updateSliderTrack(val);
    updateVolPercent(val);
    clearVolBtnActive();
    if (val === 0) btnMute.classList.add('active');
    else if (val === Math.round(VOL_MAX * 100)) btnMax.classList.add('active');
    else if (val === Math.round(VOL_LOW * 100)) btnLow.classList.add('active');
  });
}

function setVolumePreset(vol, preset) {
  isMuted = (vol === 0);
  targetVolume = vol;
  const sliderVal = Math.round(vol * 100);
  volSlider.value = sliderVal;
  updateSliderTrack(sliderVal);
  updateVolPercent(sliderVal);

  if (currentAudio && !currentAudio.paused) {
    clearInterval(fadeTimer);
    fadeIn(currentAudio, isMuted ? 0 : vol);
  }

  clearVolBtnActive();
  if (preset === 'max')  btnMax.classList.add('active');
  if (preset === 'low')  btnLow.classList.add('active');
  if (preset === 'mute') btnMute.classList.add('active');
}

function toggleMute() {
  if (isMuted) {
    // Desmutear: volver al volumen anterior (o 80% si era 0)
    const restoreVol = targetVolume > 0 ? targetVolume : 0.80;
    setVolumePreset(restoreVol, '');
    isMuted = false;
  } else {
    // Mutear
    isMuted = true;
    if (currentAudio) {
      clearInterval(fadeTimer);
      currentAudio.volume = 0;
    }
    const sliderVal = 0;
    volSlider.value = sliderVal;
    updateSliderTrack(sliderVal);
    updateVolPercent(sliderVal);
    clearVolBtnActive();
    btnMute.classList.add('active');
  }
}

function updateSliderTrack(val) {
  volSlider.style.setProperty('--val', val + '%');
  // Forzar re-render del degradado
  volSlider.style.background = `linear-gradient(to right, var(--accent-gold) ${val}%, rgba(255,255,255,0.1) ${val}%)`;
}

function updateVolPercent(val) {
  volPercent.textContent = val + '%';
}

function clearVolBtnActive() {
  [btnMax, btnLow, btnMute].forEach(b => b.classList.remove('active'));
}
