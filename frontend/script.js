/* =========================================
   EID AL-ADHA GREETING CARD - script.js
   Particles, Confetti & Interactivity
   ========================================= */

// ── Stars ──────────────────────────────────────────────────────────────
(function createStars() {
  const container = document.getElementById('stars');
  if (!container) return;
  for (let i = 0; i < 90; i++) {
    const dot = document.createElement('div');
    dot.className = 'star-dot';
    const size = Math.random() * 2.5 + 0.5;
    dot.style.cssText = `
      width:${size}px; height:${size}px;
      top:${Math.random() * 100}%;
      left:${Math.random() * 100}%;
      --tw-dur:${(Math.random() * 3 + 2).toFixed(1)}s;
      --tw-delay:${(Math.random() * 4).toFixed(1)}s;
    `;
    container.appendChild(dot);
  }
})();

// ── Floating Particle Canvas ────────────────────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const GOLD = [
    [212, 175, 55],
    [245, 217, 120],
    [160, 124, 30],
    [255, 255, 200],
  ];

  class Particle {
    constructor() { this.reset(true); }
    reset(initial = false) {
      this.x     = Math.random() * canvas.width;
      this.y     = initial ? Math.random() * canvas.height : canvas.height + 10;
      this.r     = Math.random() * 2.5 + 0.5;
      this.speed = Math.random() * 0.6 + 0.2;
      this.drift = (Math.random() - 0.5) * 0.4;
      this.alpha = Math.random() * 0.6 + 0.2;
      this.fade  = (Math.random() * 0.008 + 0.002) * (Math.random() > 0.5 ? 1 : -1);
      this.color = GOLD[Math.floor(Math.random() * GOLD.length)];
      this.twinkle = Math.random() > 0.6;
    }
    update() {
      this.y -= this.speed;
      this.x += this.drift;
      this.alpha += this.fade;
      if (this.alpha > 0.9 || this.alpha < 0.05) this.fade *= -1;
      if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color[0]},${this.color[1]},${this.color[2]},${this.alpha})`;
      ctx.fill();
    }
  }

  const particles = Array.from({ length: 70 }, () => new Particle());

  function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  }
  loop();
})();

// ── Confetti Burst ──────────────────────────────────────────────────────
function launchConfetti() {
  const colors = [
    '#D4AF37', '#F5D978', '#A07C1E',
    '#0D6E7A', '#4FC3F7', '#E91E63',
    '#7C4DFF', '#69F0AE', '#FFFFFF',
  ];
  const count = 80;
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      const color = colors[Math.floor(Math.random() * colors.length)];
      const tx    = (Math.random() - 0.5) * window.innerWidth * 0.8;
      const ty    = window.innerHeight * (0.5 + Math.random() * 0.5);
      const rot   = (Math.random() > 0.5 ? 1 : -1) * (360 + Math.random() * 720);
      const dur   = (Math.random() * 1.5 + 1.5).toFixed(2);
      const size  = Math.random() * 10 + 6;
      const shape = Math.random() > 0.4
        ? 'border-radius:50%'
        : `border-radius:${Math.random() > 0.5 ? '0' : '2px'}`;

      el.style.cssText = `
        background:${color};
        left:${window.innerWidth / 2 + (Math.random() - 0.5) * 200}px;
        top:${window.innerHeight * 0.6}px;
        width:${size}px; height:${size}px;
        ${shape};
        --tx:${tx}px; --ty:-${ty}px;
        --rot:${rot}deg;
        --dur:${dur}s;
        --delay:0s;
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), parseFloat(dur) * 1000 + 200);
    }, i * 18);
  }

  // Extra emoji burst
  const emojis = ['🌙', '⭐', '✨', '🎊', '🎉', '🕌', '💛'];
  for (let i = 0; i < 12; i++) {
    setTimeout(() => {
      const em = document.createElement('div');
      em.style.cssText = `
        position:fixed;
        left:${Math.random() * window.innerWidth}px;
        top:${Math.random() * window.innerHeight * 0.6 + 50}px;
        font-size:${Math.random() * 1.5 + 1}rem;
        z-index:200;
        pointer-events:none;
        animation:confetti-fall 2.5s ease-in both;
        --tx:${(Math.random()-0.5)*200}px;
        --ty:-${200 + Math.random()*300}px;
        --rot:${(Math.random()-0.5)*720}deg;
        --dur:2.5s; --delay:0s;
      `;
      em.textContent = emojis[Math.floor(Math.random() * emojis.length)];
      document.body.appendChild(em);
      setTimeout(() => em.remove(), 3000);
    }, i * 80);
  }
}

document.getElementById('confetti-btn').addEventListener('click', launchConfetti);

// ── Auto launch on load (gentle) ────────────────────────────────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    // Single gentle burst on arrival
    const colors = ['#D4AF37', '#F5D978', '#0D6E7A', '#FFFFFF'];
    for (let i = 0; i < 30; i++) {
      setTimeout(() => {
        const el = document.createElement('div');
        el.className = 'confetti-piece';
        const size = Math.random() * 8 + 4;
        el.style.cssText = `
          background:${colors[Math.floor(Math.random() * colors.length)]};
          left:${Math.random() * window.innerWidth}px;
          top:-10px;
          width:${size}px; height:${size}px;
          border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
          --tx:${(Math.random()-0.5)*100}px;
          --ty:${window.innerHeight + 20}px;
          --rot:${(Math.random()-0.5)*720}deg;
          --dur:${(Math.random()*2+2).toFixed(1)}s;
          --delay:0s;
        `;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 5000);
      }, i * 60);
    }
  }, 1200);
});

// ── Card hover parallax ─────────────────────────────────────────────────
const card = document.getElementById('card-main');
if (card && window.innerWidth > 768) {
  document.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = (e.clientX - cx) / (window.innerWidth  / 2);
    const dy   = (e.clientY - cy) / (window.innerHeight / 2);
    const tiltX = dy * -6;
    const tiltY = dx *  6;
    card.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale(1.01)`;
  });
  document.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
}

// ── Badge pop animations on scroll-into-view ────────────────────────────
const badges = document.querySelectorAll('.icon-badge');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.style.animation = 'badge-pop 0.5s cubic-bezier(0.22,1,0.36,1) both';
      }, i * 100);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

// Inject keyframe
const style = document.createElement('style');
style.textContent = `
  @keyframes badge-pop {
    from { opacity:0; transform:scale(0.5) translateY(20px); }
    to   { opacity:1; transform:scale(1)   translateY(0); }
  }
`;
document.head.appendChild(style);
badges.forEach(b => observer.observe(b));
