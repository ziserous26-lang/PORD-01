
/* PORD-01 global timer alarm */
(function () {
  'use strict';

  const KEY = 'pord01-focus-timer';
  const SOUND_KEY = 'pord01-timer-sound';

  const soundFiles = {
    'airsoft-fatty': 'sounds/airsoft-fatty.mp3',
    'darius': 'sounds/darius.mp3',
    'evil-spell': 'sounds/evil-spell.mp3',
    'ice-cream': 'sounds/ice-cream.mp3',
    'property-dispute': 'sounds/property-dispute.mp3',
    'punisher': 'sounds/punisher.mp3'
  };

  const scriptUrl = document.currentScript?.src || location.href;
  const baseUrl = new URL('.', scriptUrl).href;

  let audioContext = null;
  let sound = null;
  let chimeInterval = null;
  let active = false;

  const style = document.createElement('style');
  style.textContent = `
    #pord-global-timeup {
      position: fixed !important;
      inset: 0 !important;
      z-index: 2147483647 !important;
      display: none !important;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 24px;
      background: #760008;
      color: white;
      text-align: center;
      font-family: Arial, sans-serif;
      cursor: pointer;
      touch-action: manipulation;
      animation: pordPulse 1.1s ease-in-out infinite;
    }
    #pord-global-timeup.pord-visible {
      display: flex !important;
    }
    #pord-global-timeup strong {
      font-size: clamp(70px, 13vw, 180px);
      font-weight: 900;
      line-height: 1;
    }
    #pord-global-timeup span {
      font-size: clamp(20px, 3vw, 38px);
      font-weight: 700;
    }
    @keyframes pordPulse {
      0%, 100% { background: #650008; }
      50% { background: #ff2029; }
    }
  `;
  document.head.appendChild(style);

  const overlay = document.createElement('div');
  overlay.id = 'pord-global-timeup';
  overlay.tabIndex = 0;
  overlay.setAttribute('role', 'alertdialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = `
    <strong>Time's Up!</strong>
    <span>Tap anywhere to dismiss</span>
  `;

  function readTimer() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || 'null');
    } catch (e) {
      return null;
    }
  }

  function writeTimer(timer) {
    try {
      localStorage.setItem(KEY, JSON.stringify(timer));
    } catch (e) {}
  }

  function unlockAudio() {
    try {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!audioContext && C) audioContext = new C();
      if (audioContext?.state === 'suspended') {
        audioContext.resume().catch(() => {});
      }
    } catch (e) {}
  }

  function playChime() {
    if (!active || !audioContext ||
        audioContext.state !== 'running') return;

    try {
      const t = audioContext.currentTime;

      [0, 0.18, 0.4].forEach((delay, i) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(
          i === 1 ? 660 : 880, t + delay
        );

        gain.gain.setValueAtTime(0.0001, t + delay);
        gain.gain.linearRampToValueAtTime(
          0.10, t + delay + 0.02
        );
        gain.gain.exponentialRampToValueAtTime(
          0.0001, t + delay + 0.15
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start(t + delay);
        oscillator.stop(t + delay + 0.16);
      });
    } catch (e) {}
  }

  function startAlarm() {
    if (active) return;

    active = true;
    overlay.classList.add('pord-visible');

    let selected = 'default';
    try {
      selected = localStorage.getItem(SOUND_KEY) || 'default';
    } catch (e) {}

    if (selected !== 'default' && soundFiles[selected]) {
      try {
        const url = new URL(soundFiles[selected], baseUrl).href;
        sound = new Audio(url);
        sound.loop = true;
        sound.preload = 'auto';

        sound.play().catch(err => {
          console.warn('Custom timer sound failed:', err);
        });
      } catch (e) {
        console.warn('Could not create timer audio:', e);
      }
    } else {
      unlockAudio();
      playChime();
      chimeInterval = setInterval(playChime, 1600);
    }
  }

  function stopAlarm() {
    if (!active) return;

    active = false;
    overlay.classList.remove('pord-visible');

    if (chimeInterval) {
      clearInterval(chimeInterval);
      chimeInterval = null;
    }

    if (sound) {
      sound.pause();
      sound.currentTime = 0;
      sound = null;
    }
  }

  function dismissAlarm() {
    const timer = readTimer();

    if (timer) {
      timer.running = false;
      timer.completed = false;
      timer.remaining = Number(timer.selected) || 1500;
      timer.endAt = 0;
      writeTimer(timer);
    }

    stopAlarm();
    document.dispatchEvent(new Event('pord-timer-dismissed'));
  }

  overlay.addEventListener('click', dismissAlarm);

  overlay.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      dismissAlarm();
    }
  });

  function checkTimer() {
    const timer = readTimer();

    if (!timer) {
      stopAlarm();
      return;
    }

    if (timer.running &&
        Number(timer.endAt) > 0 &&
        Date.now() >= Number(timer.endAt)) {
      timer.running = false;
      timer.completed = true;
      timer.remaining = 0;
      writeTimer(timer);
    }

    if (timer.completed) {
      startAlarm();
    } else {
      stopAlarm();
    }
  }

  function initialize() {
    document.body.appendChild(overlay);

    checkTimer();
    setInterval(checkTimer, 300);

    document.addEventListener('visibilitychange', checkTimer);
    window.addEventListener('pageshow', checkTimer);

    window.addEventListener('storage', event => {
      if (event.key === KEY) checkTimer();
    });

    document.addEventListener(
      'pointerdown', unlockAudio, { capture: true }
    );
    document.addEventListener(
      'keydown', unlockAudio, { capture: true }
    );
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }
})();
