import { useState } from "react";
import "./App.css";

const stars = Array.from({ length: 34 }, (_, index) => index);
const sparkles = [
  { icon: "✨", x: "-150px", y: "-160px" },
  { icon: "🌙", x: "-70px", y: "-210px" },
  { icon: "⭐", x: "32px", y: "-230px" },
  { icon: "🎉", x: "130px", y: "-170px" },
  { icon: "💛", x: "170px", y: "-54px" },
  { icon: "✨", x: "72px", y: "52px" },
  { icon: "⭐", x: "-92px", y: "42px" },
  { icon: "🌟", x: "-176px", y: "-42px" },
];

function App() {
  const [name, setName] = useState("Yassine");
  const [celebrating, setCelebrating] = useState(false);

  const cleanName = name.trim() || "sahbi";

  const celebrate = () => {
    setCelebrating(false);
    window.setTimeout(() => setCelebrating(true), 20);
    window.setTimeout(() => setCelebrating(false), 1800);
  };

  return (
    <main className={celebrating ? "eid-night celebrating" : "eid-night"}>
      <div className="sky" aria-hidden="true">
        {stars.map((star) => (
          <span className="star" style={{ "--i": star }} key={star} />
        ))}
        <span className="shooting-star" />
        <span className="shooting-star second" />
      </div>

      <section className="scene" aria-labelledby="page-title">
        <div className="moon-wrap" aria-hidden="true">
          <div className="moon" />
        </div>

        <div className="lanterns" aria-hidden="true">
          <span className="lantern lantern-one" />
          <span className="lantern lantern-two" />
          <span className="lantern lantern-three" />
        </div>

        <div className="content">
          <p className="eyebrow">Eid Al-Adha night</p>
          <h1 id="page-title">Mabrouk 3idek, {cleanName}</h1>
          <p className="subtitle">
            Seha, farha, lbaraka, ou vibes zwina m3a l3a2ila w lhbab.
          </p>

          <label className="name-control">
            <span>Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="kteb smiya"
            />
          </label>
        </div>

        <button
          className="sheep-stage"
          type="button"
          onClick={celebrate}
          aria-label={`Launch Eid animation for ${cleanName}`}
        >
          <span className="tap-hint">Click me</span>
          <span className="sheep">🐑</span>
          <span className="ground-glow" />
        </button>

        <div className="sparkle-burst" aria-hidden="true">
          {sparkles.map((sparkle, index) => (
            <span
              style={{ "--i": index, "--x": sparkle.x, "--y": sparkle.y }}
              key={`${sparkle.icon}-${index}`}
            >
              {sparkle.icon}
            </span>
          ))}
        </div>
      </section>

      <div className="horizon" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </main>
  );
}

export default App;
