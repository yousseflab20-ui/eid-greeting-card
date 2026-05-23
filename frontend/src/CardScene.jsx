import React, { useEffect, useRef, useState } from "react";
import "./CardScene.css";
import { launchConfetti } from "./helpers";

const AURORA = [
  [70, 30, 170], [40, 80, 210], [20, 120, 150],
  [90, 20, 160], [25, 55, 185], [160, 120, 20]
];

const GOLDS = [
  [212, 175, 55], [245, 224, 112], [160, 124, 30], [255, 255, 200], [255, 200, 80]
];

export default function CardScene({ toName = "Ami", fromName = "Mohamed" }) {
  const auroraRef = useRef(null);
  const particlesRef = useRef(null);
  const cardGlowRef = useRef(null);
  const starsRef = useRef(null);

  const frMsgRef = useRef(null);
  const daMsgRef = useRef(null);
  const enMsgRef = useRef(null);

  const [isRevealed, setIsRevealed] = useState(false);

  // 1. REVEAL EFFECT ON MOUNT
  useEffect(() => {
    // Delay reveal to sync with moon explosion fade
    const timer = setTimeout(() => {
      setIsRevealed(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // 2. STATIC STARS BACKGROUND
  useEffect(() => {
    const starsEl = starsRef.current;
    if (!starsEl) return;
    starsEl.innerHTML = ""; // Clear
    for (let i = 0; i < 90; i++) {
      const d = document.createElement("div");
      d.className = "star-dot";
      const sz = Math.random() * 2.5 + 0.5;
      d.style.cssText = `
        position: absolute;
        width: ${sz}px;
        height: ${sz}px;
        top: ${Math.random() * 100}%;
        left: ${Math.random() * 100}%;
        --td: ${(Math.random() * 3 + 2).toFixed(1)}s;
        --tdl: ${(Math.random() * 4).toFixed(1)}s;
      `;
      starsEl.appendChild(d);
    }
  }, []);

  // 3. AURORA CANVAS BACKGROUND
  useEffect(() => {
    const cv = auroraRef.current;
    if (!cv) return;
    const cx = cv.getContext("2d");
    let animFrameId;

    const rs = () => {
      cv.width = window.innerWidth;
      cv.height = window.innerHeight;
    };
    rs();
    window.addEventListener("resize", rs);

    class Blob {
      constructor() {
        this.reset(true);
      }
      reset(init = false) {
        this.x = Math.random() * cv.width;
        this.y = init ? Math.random() * cv.height : -200;
        this.r = Math.random() * 380 + 160;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.25;
        this.col = AURORA[Math.floor(Math.random() * AURORA.length)];
        this.phase = Math.random() * Math.PI * 2;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        this.phase += 0.005;
        this.alpha = Math.sin(this.phase) * 0.03 + 0.05;
        if (this.x < -this.r || this.x > cv.width + this.r) this.vx *= -1;
        if (this.y < -this.r || this.y > cv.height + this.r) this.vy *= -1;
      }
      draw() {
        const [r, g, b] = this.col;
        const grad = cx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
        grad.addColorStop(0, `rgba(${r},${g},${b},${this.alpha})`);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        cx.fillStyle = grad;
        cx.beginPath();
        cx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        cx.fill();
      }
    }

    const blobs = Array.from({ length: 8 }, () => new Blob());

    const loop = () => {
      cx.clearRect(0, 0, cv.width, cv.height);
      blobs.forEach((b) => {
        b.update();
        b.draw();
      });
      animFrameId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener("resize", rs);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  // 4. FLOATING PARTICLES CANVAS
  useEffect(() => {
    const cv = particlesRef.current;
    if (!cv) return;
    const cx = cv.getContext("2d");
    let animFrameId;

    const rs = () => {
      cv.width = window.innerWidth;
      cv.height = window.innerHeight;
    };
    rs();
    window.addEventListener("resize", rs);

    class P {
      constructor() {
        this.reset(true);
      }
      reset(init = false) {
        this.x = Math.random() * cv.width;
        this.y = init ? Math.random() * cv.height : cv.height + 10;
        this.r = Math.random() * 2 + 0.5;
        this.speed = Math.random() * 0.55 + 0.15;
        this.drift = (Math.random() - 0.5) * 0.35;
        this.alpha = Math.random() * 0.5 + 0.1;
        this.fade = (Math.random() * 0.007 + 0.002) * (Math.random() > 0.5 ? 1 : -1);
        this.col = GOLDS[Math.floor(Math.random() * GOLDS.length)];
      }
      update() {
        this.y -= this.speed;
        this.x += this.drift;
        this.alpha += this.fade;
        if (this.alpha > 0.8 || this.alpha < 0.04) this.fade *= -1;
        if (this.y < -10 || this.x < -10 || this.x > cv.width + 10) this.reset();
      }
      draw() {
        cx.beginPath();
        cx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        cx.fillStyle = `rgba(${this.col[0]},${this.col[1]},${this.col[2]},${this.alpha})`;
        cx.fill();
      }
    }

    const pts = Array.from({ length: 65 }, () => new P());

    const loop = () => {
      cx.clearRect(0, 0, cv.width, cv.height);
      pts.forEach((p) => {
        p.update();
        p.draw();
      });
      animFrameId = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener("resize", rs);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  // 5. PARALLAX TILT EFFECT
  useEffect(() => {
    const glow = cardGlowRef.current;
    if (!glow) return;

    const handleMouseMove = (e) => {
      if (window.innerWidth <= 768) return;
      const rect = glow.getBoundingClientRect();
      if (!rect.width) return;
      const dx = (e.clientX - (rect.left + rect.width / 2)) / (window.innerWidth / 2);
      const dy = (e.clientY - (rect.top + rect.height / 2)) / (window.innerHeight / 2);
      glow.style.transform = `perspective(1200px) rotateX(${dy * -4}deg) rotateY(${dx * 4}deg) scale(1.01)`;
    };

    const handleMouseLeave = () => {
      glow.style.transform = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // 6. TYPEWRITER EFFECT TRIGGER
  useEffect(() => {
    if (!isRevealed) return;

    let intervals = [];

    const typewrite = (el, text, speed = 30) => {
      if (!el) return;
      el.textContent = "";
      let i = 0;
      const t = setInterval(() => {
        el.textContent += text[i++];
        if (i >= text.length) clearInterval(t);
      }, speed);
      intervals.push(t);
    };

    // Staggered typing starting after card transition
    const t1 = setTimeout(() => {
      typewrite(frMsgRef.current, `Chèr(e) ${toName}, en ce jour béni de l'Aïd Al-Adha, je vous souhaite santé, bonheur et paix.`, 28);
    }, 800);

    const t2 = setTimeout(() => {
      typewrite(daMsgRef.current, `عيد مبارك سعيد ليك يا ${toName} — ربي يتقبل منا ومنكم وياخد بيدنا لكل خير 🤲`, 40);
    }, 2800);

    const t3 = setTimeout(() => {
      typewrite(enMsgRef.current, `May Allah accept our prayers, bless your family and fill your heart with gratitude. Eid Mubarak!`, 28);
    }, 5400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      intervals.forEach(clearInterval);
    };
  }, [isRevealed, toName]);

  return (
    <div className="card-scene">
      {/* Background Canvasses */}
      <canvas ref={auroraRef} className="aurora-canvas" />
      <canvas ref={particlesRef} className="particles-canvas" />
      <div ref={starsRef} className="stars-layer" />

      {/* Floating lanterns */}
      <div className="lanterns-container">
        <div className="lantern-item" style={{ left: "10%", top: "8%", animationDelay: "0s" }}>🪔</div>
        <div className="lantern-item" style={{ right: "12%", top: "6%", animationDelay: "-1.5s" }}>🪔</div>
        <div className="lantern-item" style={{ left: "15%", bottom: "10%", animationDelay: "-3s" }}>🪔</div>
        <div className="lantern-item" style={{ right: "10%", bottom: "12%", animationDelay: "-4.5s" }}>🪔</div>
      </div>

      {/* Islamic geometric bg pattern overlay */}
      <div className="islamic-bg" aria-hidden="true">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="ip" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path
                d="M50,5 L55.8,27.5 L76.5,15 L64.2,35.8 L86.5,35.8 L67.5,50 L86.5,64.2 L64.2,64.2 L76.5,85 L55.8,72.5 L50,95 L44.2,72.5 L23.5,85 L35.8,64.2 L13.5,64.2 L32.5,50 L13.5,35.8 L35.8,35.8 L23.5,15 L44.2,27.5 Z"
                fill="none"
                stroke="rgba(212,175,55,0.06)"
                strokeWidth="1"
              />
              <circle cx="50" cy="50" r="14" fill="none" stroke="rgba(212,175,55,0.04)" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#ip)" />
        </svg>
      </div>

      {/* Greeting Card structure */}
      <div ref={cardGlowRef} className={`card-glow-wrap ${isRevealed ? "revealed" : ""}`}>
        <div className="card-border-spin" />
        <div className="card-body">
          {/* Watermark logo */}
          <div className="card-watermark" aria-hidden="true">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M100,15 L113,62 L159,38 L135,82 L182,82 L145,100 L182,118 L135,118 L159,162 L113,138 L100,185 L87,138 L41,162 L65,118 L18,118 L55,100 L18,82 L65,82 L41,38 L87,62 Z"
                fill="none"
                stroke="rgba(212,175,55,0.06)"
                strokeWidth="1.5"
              />
              <circle cx="100" cy="100" r="42" fill="none" stroke="rgba(212,175,55,0.04)" strokeWidth="1" />
              <circle cx="100" cy="100" r="65" fill="none" stroke="rgba(212,175,55,0.03)" strokeWidth="1" />
            </svg>
          </div>

          <div className="deco-bar"><div className="deco-pat" /></div>

          {/* Card Crescent Moon Header */}
          <header className="card-header">
            <div className="moon-halo-wrap">
              <div className="card-moon-halo" />
              <span className="card-crescent">☽</span>
            </div>
            <div className="stars-row">
              <span className="sr">✦</span>
              <span className="sr sm">✦</span>
              <span className="sr">✦</span>
            </div>
          </header>

          {/* Main Title Section */}
          <section className="title-sec">
            <h1 className="big-title">
              <span className="t1">عيد الأضحى</span>
              <span className="t2">مبـارك</span>
            </h1>
            <div className="orn">
              <span className="orn-l" />
              <span className="orn-d">◆</span>
              <span className="orn-l" />
            </div>
            <p className="sub-ar">تَقَبَّلَ اللهُ مِنَّا وَمِنكُم صَالِحَ الأَعمَال</p>

            {/* Recipient tag */}
            <div style={{
              display: "inline-block",
              background: "rgba(212,175,55,0.08)",
              border: "1px solid rgba(212,175,55,0.22)",
              borderRadius: "999px",
              padding: "6px 20px",
              marginTop: "16px",
              color: "#F5E070",
              fontSize: "1rem",
              fontWeight: 600,
              letterSpacing: "0.02em"
            }}>
              إلى / À : <span style={{ color: "#FFF8E7", textShadow: "0 0 10px rgba(255,255,255,0.4)" }}>{toName}</span>
            </div>
          </section>

          {/* Typewriter Message Cards */}
          <section className="msgs">
            <div className="msg-card mc-fr">
              <span className="mc-icon">🌟</span>
              <p ref={frMsgRef} />
            </div>
            <div className="msg-card mc-da">
              <span className="mc-icon">🌙</span>
              <p ref={daMsgRef} className="darija-p" />
            </div>
            <div className="msg-card mc-en">
              <span className="mc-icon">💫</span>
              <p ref={enMsgRef} />
            </div>
          </section>

          {/* Interactive floating sheep row */}
          <div className="sheep-row" aria-hidden="true">
            <span className="shp s1">🐑</span>
            <span className="shp s2">🐑</span>
            <span className="shp s3">🐏</span>
          </div>

          {/* Badges block */}
          <div className="badges">
            <div className="bdg" id="b1"><span className="bi">🕌</span><span className="bl">Mosquée</span></div>
            <div className="bdg" id="b2"><span className="bi">🌙</span><span className="bl">Hilal</span></div>
            <div className="bdg" id="b3"><span className="bi">🤲</span><span className="bl">Du'a</span></div>
            <div className="bdg" id="b4"><span className="bi">💛</span><span className="bl">Baraka</span></div>
          </div>

          {/* Footer signature and share */}
          <footer className="card-ft">
            <div className="ft-div">
              <span className="ft-l" />
              <span className="ft-t">من / De</span>
              <span className="ft-l" />
            </div>
            <p className="sig-name">{fromName}</p>
            <p className="sig-sub">LinkedIn Connection 🤝</p>
            
            <a className="li-pill" href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              <span>Partagé avec ❤️ sur LinkedIn</span>
            </a>
          </footer>

          <div className="deco-bar"><div className="deco-pat" /></div>
        </div>
      </div>

      {/* Sticky Celebrate floating action button */}
      <button className="cel-btn" onClick={launchConfetti}>
        <span>🎊</span>
        <span>Célébrer !</span>
      </button>
    </div>
  );
}
