import React, { useEffect, useRef, useState } from "react";
import "./ConstellationScene.css";
import { spawnConf, playSynthTone, playCompletionChord } from "./helpers";

const STARS = [
  { id: 0, x: 500, y: 180, label: "1", freq: 261.63 }, // C4
  { id: 1, x: 340, y: 280, label: "2", freq: 293.66 }, // D4
  { id: 2, x: 280, y: 460, label: "3", freq: 329.63 }, // E4
  { id: 3, x: 350, y: 640, label: "4", freq: 392.00 }, // G4
  { id: 4, x: 500, y: 740, label: "5", freq: 440.00 }, // A4
  { id: 5, x: 520, y: 580, label: "6", freq: 523.25 }, // C5
  { id: 6, x: 420, y: 460, label: "7", freq: 587.33 }, // D5
  { id: 7, x: 470, y: 320, label: "8", freq: 659.25 }  // E5
];

export default function ConstellationScene({ onExploded, onFadeComplete }) {
  const spaceCanvasRef = useRef(null);
  const svgRef = useRef(null);

  const [connectedCount, setConnectedCount] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const [isComplete, setIsComplete] = useState(false);
  const [isFlashActive, setIsFlashActive] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  // 1. SPACE CANVAS: Stars + Shooting Stars (High Performance backdrop)
  useEffect(() => {
    const cv = spaceCanvasRef.current;
    if (!cv) return;
    const cx = cv.getContext("2d");

    let animFrameId;

    const resizeCanvas = () => {
      cv.width = window.innerWidth;
      cv.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Static background stars
    const stars = [];
    for (let i = 0; i < 280; i++) {
      stars.push({
        x: Math.random() * cv.width,
        y: Math.random() * cv.height,
        r: Math.random() * 1.8 + 0.3,
        alpha: Math.random() * 0.8 + 0.1,
        twinkle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.03 + 0.005,
      });
    }

    // Shooting stars
    const shoots = [];
    const spawnShoot = () => {
      shoots.push({
        x: Math.random() * cv.width * 0.7,
        y: Math.random() * cv.height * 0.4,
        len: Math.random() * 180 + 80,
        speed: Math.random() * 14 + 8,
        alpha: 1,
        angle: Math.PI / 4 + Math.random() * 0.4,
      });
    };

    const shootInterval = setInterval(spawnShoot, 2800);

    const drawLoop = () => {
      cx.clearRect(0, 0, cv.width, cv.height);

      // Draw background stars
      stars.forEach((s) => {
        s.twinkle += s.speed;
        const a = s.alpha * (Math.sin(s.twinkle) * 0.4 + 0.6);
        cx.beginPath();
        cx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        cx.fillStyle = `rgba(255, 255, 255, ${a})`;
        cx.fill();
      });

      // Draw shooting stars
      for (let i = shoots.length - 1; i >= 0; i--) {
        const sh = shoots[i];
        sh.x += Math.cos(sh.angle) * sh.speed;
        sh.y += Math.sin(sh.angle) * sh.speed;
        sh.alpha -= 0.025;

        if (sh.alpha <= 0) {
          shoots.splice(i, 1);
          continue;
        }

        cx.save();
        cx.globalAlpha = sh.alpha;
        const grd = cx.createLinearGradient(
          sh.x - Math.cos(sh.angle) * sh.len,
          sh.y - Math.sin(sh.angle) * sh.len,
          sh.x,
          sh.y
        );
        grd.addColorStop(0, "rgba(245, 224, 112, 0)");
        grd.addColorStop(0.7, "rgba(245, 224, 112, 0.6)");
        grd.addColorStop(1, "rgba(255, 255, 255, 0.9)");

        cx.strokeStyle = grd;
        cx.lineWidth = 2;
        cx.beginPath();
        cx.moveTo(sh.x - Math.cos(sh.angle) * sh.len, sh.y - Math.sin(sh.angle) * sh.len);
        cx.lineTo(sh.x, sh.y);
        cx.stroke();
        cx.restore();
      }

      animFrameId = requestAnimationFrame(drawLoop);
    };

    drawLoop();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      clearInterval(shootInterval);
      cancelAnimationFrame(animFrameId);
    };
  }, []);

  // 2. COORDINATE RESOLUTION UTIL
  const resolveViewBoxCoords = (e) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const rect = svg.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    // Maps screen mouse coordinates to viewBox 0 0 1000 1000
    const x = ((clientX - rect.left) / rect.width) * 1000;
    const y = ((clientY - rect.top) / rect.height) * 1000;
    return { x, y };
  };

  // 3. EVENT LISTENERS FOR DRAG CONNECTIONS
  const handleDragStart = (star, e) => {
    if (isComplete) return;
    
    // User can only drag from the current head of the connected path
    if (star.id === connectedCount) {
      setIsDragging(true);
      const coords = resolveViewBoxCoords(e);
      setCursorPos(coords);
      // Play brief synth sound on pick up
      playSynthTone(star.freq);
    }
  };

  const handleDragMove = (e) => {
    if (!isDragging || isComplete) return;
    const coords = resolveViewBoxCoords(e);
    setCursorPos(coords);

    // Calculate distance to the active target node
    const targetIdx = (connectedCount + 1) % STARS.length;
    const target = STARS[targetIdx];
    const dist = Math.hypot(coords.x - target.x, coords.y - target.y);

    // Snap distance: 42 units in viewBox space
    if (dist < 42) {
      // Connect line!
      const newCount = connectedCount + 1;
      setConnectedCount(newCount);
      playSynthTone(target.freq);

      // Trigger sparkle burst on star snapping
      const starEl = document.getElementById(`star-node-${target.id}`);
      if (starEl) {
        const starRect = starEl.getBoundingClientRect();
        const cx = starRect.left + starRect.width / 2;
        const cy = starRect.top + starRect.height / 2;
        for (let s = 0; s < 12; s++) {
          setTimeout(() => {
            spawnConf({ x: cx, y: cy, spread: 35 });
          }, s * 10);
        }
      }

      // Check if loop is completed
      if (newCount === STARS.length) {
        handleCompletion();
      }
    }
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  // 4. COMPLETION TIMINGS
  const handleCompletion = () => {
    setIsDragging(false);
    setIsComplete(true);

    // Play sparkling chime chord arpeggio
    playCompletionChord();

    // Stagger completion animations
    setTimeout(() => {
      setIsFlashActive(true);

      // Huge confetti shower from center of screen
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight * 0.45;
      for (let i = 0; i < 75; i++) {
        setTimeout(() => {
          spawnConf({ x: cx, y: cy, up: true, spread: 320 });
        }, i * 12);
      }
    }, 800);

    // Mount card scene behind
    setTimeout(() => {
      if (onExploded) onExploded();
    }, 1250);

    // Fade out constellation map
    setTimeout(() => {
      setIsFadingOut(true);
    }, 1700);

    // Finish fade transition
    setTimeout(() => {
      if (onFadeComplete) onFadeComplete();
    }, 2400);
  };

  const activeSource = STARS[connectedCount % STARS.length];
  const activeTarget = STARS[(connectedCount + 1) % STARS.length];

  return (
    <div
      className={`constellation-scene ${isFadingOut ? "scene-fade-out" : ""}`}
      onMouseMove={handleDragMove}
      onTouchMove={handleDragMove}
      onMouseUp={handleDragEnd}
      onTouchEnd={handleDragEnd}
    >
      {/* Background space canvas */}
      <canvas ref={spaceCanvasRef} className="space-canvas" />

      {/* Nebula ambient layers */}
      <div className="nebula n1" style={{ opacity: 0.4 }} />
      <div className="nebula n2" style={{ opacity: 0.3 }} />

      {/* Constellation Canvas Frame */}
      <div className="constellation-container">
        <svg
          ref={svgRef}
          className="constellation-svg"
          viewBox="0 0 1000 1000"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Faint guide lines */}
          {STARS.map((s, idx) => {
            const nextStar = STARS[(idx + 1) % STARS.length];
            return (
              <line
                key={`guide-${idx}`}
                className="const-line guide"
                x1={s.x}
                y1={s.y}
                x2={nextStar.x}
                y2={nextStar.y}
              />
            );
          })}

          {/* Locked connected lines */}
          {Array.from({ length: Math.min(connectedCount, STARS.length) }).map((_, idx) => {
            const current = STARS[idx];
            const next = STARS[(idx + 1) % STARS.length];
            return (
              <line
                key={`line-${idx}`}
                className="const-line"
                x1={current.x}
                y1={current.y}
                x2={next.x}
                y2={next.y}
              />
            );
          })}

          {/* Active drag line */}
          {isDragging && !isComplete && connectedCount < STARS.length && (
            <line
              className="const-line drag"
              x1={activeSource.x}
              y1={activeSource.y}
              x2={cursorPos.x}
              y2={cursorPos.y}
            />
          )}

          {/* Render star nodes */}
          {STARS.map((s) => {
            const isConnected = s.id < connectedCount;
            // The active source (and next snap targets) glow dynamically
            const isActive = s.id === connectedCount % STARS.length || (!isComplete && s.id === (connectedCount + 1) % STARS.length);
            
            return (
              <g
                key={`star-node-${s.id}`}
                id={`star-node-${s.id}`}
                className={`star-node ${isConnected ? "connected" : ""} ${isActive ? "active" : ""}`}
                style={{ cursor: "none" }}
                onMouseDown={(e) => handleDragStart(s, e)}
                onTouchStart={(e) => handleDragStart(s, e)}
              >
                {/* Glow ring */}
                <circle
                  className="star-glow"
                  cx={s.x}
                  cy={s.y}
                  r="35"
                  fill={isConnected ? "rgba(212,175,55,0.08)" : "rgba(255,255,255,0.03)"}
                />
                
                {/* Core star */}
                <circle
                  className="star-core"
                  cx={s.x}
                  cy={s.y}
                  r="6.5"
                  fill={isConnected ? "#F5E070" : "rgba(255,255,255,0.3)"}
                />

                {/* Star text label */}
                <text
                  className="star-text"
                  x={s.x}
                  y={s.y + (s.y > 500 ? 30 : -30)}
                >
                  {s.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Dynamic instructions overlay */}
      {!isComplete && (
        <div className="constellation-instructions">
          <p className="inst-ar">ارسم هلال العيد عن طريق ربط النجوم بالترتيب 🌙</p>
          <p className="inst-fr">Faites glisser et reliez les étoiles dans l'ordre (1 à 8)</p>
        </div>
      )}

      {/* Completion feedback banner */}
      <div className={`completion-label ${isComplete ? "visible" : ""}`}>
        عيد مبارك سعيد ✨
      </div>

      {/* Starburst white flash */}
      <div className={`completion-flash ${isFlashActive ? "active" : ""}`} />
    </div>
  );
}
