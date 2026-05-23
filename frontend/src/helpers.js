/* =====================================================
   helpers.js — Confetti and audio synth helper functions
   ===================================================== */

const CONF_COLORS = [
  "#D4AF37", "#F5E070", "#A07C1E", "#0D6E7A", "#4FC3F7",
  "#E91E63", "#7C4DFF", "#69F0AE", "#FFFFFF", "#FFD700", "#FF6B6B"
];

export function spawnConf({ x = window.innerWidth / 2, y = window.innerHeight * 0.55, up = false, spread = 300 } = {}) {
  const el = document.createElement("div");
  el.className = "conf-piece";
  const col = CONF_COLORS[Math.floor(Math.random() * CONF_COLORS.length)];
  const cx = (Math.random() - 0.5) * spread * 2;
  const cy = up ? -(Math.random() * 400 + 100) : (Math.random() * 400 + 100);
  const cr = (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 720);
  const cd = (Math.random() * 1.5 + 1.5).toFixed(2);
  const sz = Math.random() * 12 + 5;
  const sh = Math.random() > 0.4 ? "border-radius:50%" : "";
  
  el.style.cssText = `
    background: ${col};
    left: ${x + (Math.random() - 0.5) * 60}px;
    top: ${y}px;
    width: ${sz}px;
    height: ${sz}px;
    ${sh};
    --cx: ${cx}px;
    --cy: ${cy}px;
    --cr: ${cr}deg;
    --cd: ${cd}s;
    --cdl: 0s;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), parseFloat(cd) * 1000 + 300);
}

export function launchEntranceConfetti() {
  for (let i = 0; i < 55; i++) {
    setTimeout(() => spawnConf({ up: true, spread: 260 }), i * 22);
  }
  
  const emojis = ["🌙", "⭐", "✨", "🎊", "🕌", "💛", "🐑"];
  emojis.forEach((em, i) => {
    setTimeout(() => {
      const el = document.createElement("div");
      el.style.cssText = `
        position: fixed;
        font-size: ${Math.random() * 1.8 + 1.2}rem;
        left: ${Math.random() * window.innerWidth}px;
        top: ${window.innerHeight * 0.5}px;
        z-index: 201;
        pointer-events: none;
        animation: conf-fall 2.5s ease-in both;
        --cx: ${(Math.random() - 0.5) * 320}px;
        --cy: -${180 + Math.random() * 320}px;
        --cr: ${(Math.random() - 0.5) * 720}deg;
        --cd: 2.5s;
        --cdl: 0s;
      `;
      el.textContent = em;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }, i * 90);
  });
}

export function launchConfetti() {
  for (let i = 0; i < 100; i++) {
    setTimeout(() => spawnConf({ spread: window.innerWidth * 0.45 }), i * 14);
  }
  
  const emojis = ["🌙", "⭐", "✨", "🎊", "🎉", "🕌", "💛", "🐑", "🎈", "🌟"];
  for (let i = 0; i < 18; i++) {
    setTimeout(() => {
      const el = document.createElement("div");
      el.style.cssText = `
        position: fixed;
        font-size: ${Math.random() * 1.9 + 1}rem;
        left: ${Math.random() * window.innerWidth}px;
        top: ${window.innerHeight * 0.55}px;
        z-index: 201;
        pointer-events: none;
        animation: conf-fall 2.8s ease-in both;
        --cx: ${(Math.random() - 0.5) * 400}px;
        --cy: -${200 + Math.random() * 350}px;
        --cr: ${(Math.random() - 0.5) * 720}deg;
        --cd: 2.8s;
        --cdl: 0s;
      `;
      el.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3200);
    }, i * 65);
  }
}

// =====================================================
// WEB AUDIO SYNTHESIZER FOR INTERACTIVE SOUND EFFECTS
// =====================================================

export function playSynthTone(freq) {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    // Smooth volume decay
    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 1.0);
  } catch (e) {
    console.warn("Web Audio API not initialized or blocked by browser gesture rules.");
  }
}

export function playCompletionChord() {
  const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4, E4, G4, C5, E5 (C Major Chord)
  notes.forEach((freq, idx) => {
    setTimeout(() => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = "triangle"; // Warm organ/bell-like sound
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
        osc.stop(ctx.currentTime + 1.8);
      } catch (e) {}
    }, idx * 120); // 120ms staggered arpeggio
  });
}
