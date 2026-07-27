"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";

type MoodId = "still" | "bright" | "tender" | "wild" | "hopeful";

type Mood = {
  id: MoodId;
  label: string;
  whisper: string;
  colors: [string, string, string, string];
};

type SavedBloom = {
  id: string;
  mood: MoodId;
  energy: number;
  softness: number;
  seed: number;
  createdAt: string;
};

const MOODS: Mood[] = [
  {
    id: "still",
    label: "Still",
    whisper: "Quiet water, deep roots",
    colors: ["#102d2a", "#23564d", "#b8e0c8", "#f5ddad"],
  },
  {
    id: "bright",
    label: "Bright",
    whisper: "Sunlight with somewhere to go",
    colors: ["#50382a", "#b25b47", "#ffd764", "#ff8f70"],
  },
  {
    id: "tender",
    label: "Tender",
    whisper: "Soft edges, open heart",
    colors: ["#382a4d", "#704b72", "#ffb8c6", "#f7e0d1"],
  },
  {
    id: "wild",
    label: "Wild",
    whisper: "All instinct, no apology",
    colors: ["#15392c", "#347344", "#dff25a", "#ff7557"],
  },
  {
    id: "hopeful",
    label: "Hopeful",
    whisper: "A horizon leaning closer",
    colors: ["#243460", "#3f6f91", "#73d2de", "#ffe073"],
  },
];

const STORAGE_KEY = "bloomly-meadow-v1";

function seededRandom(seed: number) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function hexToRgba(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const number = Number.parseInt(value, 16);
  const red = (number >> 16) & 255;
  const green = (number >> 8) & 255;
  const blue = number & 255;
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function drawFlower(
  context: CanvasRenderingContext2D,
  x: number,
  baseline: number,
  height: number,
  petalCount: number,
  petalColor: string,
  centerColor: string,
  leafColor: string,
  sway: number,
  openness: number,
  progress: number,
  random: () => number,
) {
  const stemProgress = Math.min(1, progress / 0.58);
  const bloomProgress = Math.max(0, Math.min(1, (progress - 0.38) / 0.62));
  const easedBloom = 1 - Math.pow(1 - bloomProgress, 3);
  const top = -height * stemProgress;

  context.save();
  context.translate(x, baseline);

  context.strokeStyle = leafColor;
  context.lineWidth = Math.max(2, height * 0.018);
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(0, 0);
  context.bezierCurveTo(
    sway * 0.18,
    top * 0.34,
    sway * 0.85,
    top * 0.72,
    sway,
    top,
  );
  context.stroke();

  if (stemProgress > 0.55) {
    const leafAlpha = Math.min(1, (stemProgress - 0.55) / 0.25);
    context.fillStyle = hexToRgba(leafColor, leafAlpha * 0.86);
    [-1, 1].forEach((direction, index) => {
      context.save();
      const leafY = top * (0.36 + index * 0.15);
      const leafX = sway * (0.2 + index * 0.18);
      context.translate(leafX, leafY);
      context.rotate(direction * (0.72 + random() * 0.25));
      context.beginPath();
      context.ellipse(
        direction * height * 0.085,
        0,
        height * 0.105,
        height * 0.035,
        0,
        0,
        Math.PI * 2,
      );
      context.fill();
      context.restore();
    });
  }

  context.translate(sway, top);
  context.scale(easedBloom, easedBloom);
  const petalLength = height * (0.115 + openness * 0.035);
  const petalWidth = height * (0.052 + openness * 0.02);

  for (let index = 0; index < petalCount; index += 1) {
    const angle = (Math.PI * 2 * index) / petalCount - Math.PI / 2;
    context.save();
    context.rotate(angle);
    context.fillStyle = hexToRgba(petalColor, 0.82 + random() * 0.16);
    context.beginPath();
    context.ellipse(
      petalLength * 0.62,
      0,
      petalLength,
      petalWidth,
      0,
      0,
      Math.PI * 2,
    );
    context.fill();
    context.restore();
  }

  context.fillStyle = centerColor;
  context.beginPath();
  context.arc(0, 0, height * 0.052, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = hexToRgba("#fff6d8", 0.55);
  context.beginPath();
  context.arc(-height * 0.012, -height * 0.015, height * 0.015, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawGarden(
  canvas: HTMLCanvasElement,
  mood: Mood,
  energy: number,
  softness: number,
  seed: number,
  progress: number,
) {
  const rectangle = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(320, rectangle.width);
  const height = Math.max(360, rectangle.height);
  canvas.width = Math.floor(width * ratio);
  canvas.height = Math.floor(height * ratio);

  const context = canvas.getContext("2d");
  if (!context) return;
  context.setTransform(ratio, 0, 0, ratio, 0, 0);

  const random = seededRandom(seed);
  const background = context.createLinearGradient(0, 0, width, height);
  background.addColorStop(0, mood.colors[0]);
  background.addColorStop(0.58, mood.colors[1]);
  background.addColorStop(1, hexToRgba(mood.colors[0], 0.96));
  context.fillStyle = background;
  context.fillRect(0, 0, width, height);

  const glow = context.createRadialGradient(
    width * 0.72,
    height * 0.2,
    0,
    width * 0.72,
    height * 0.2,
    width * 0.58,
  );
  glow.addColorStop(0, hexToRgba(mood.colors[2], 0.22));
  glow.addColorStop(1, hexToRgba(mood.colors[2], 0));
  context.fillStyle = glow;
  context.fillRect(0, 0, width, height);

  const moteCount = 20 + Math.round(energy * 18);
  for (let index = 0; index < moteCount; index += 1) {
    const moteX = random() * width;
    const moteY = 58 + random() * height * 0.5;
    const radius = 0.7 + random() * 2.2;
    context.fillStyle = hexToRgba(
      index % 3 === 0 ? mood.colors[3] : mood.colors[2],
      0.18 + random() * 0.34,
    );
    context.beginPath();
    context.arc(moteX, moteY, radius, 0, Math.PI * 2);
    context.fill();
  }

  context.fillStyle = hexToRgba("#071b18", 0.34);
  context.beginPath();
  context.moveTo(0, height * 0.76);
  context.bezierCurveTo(
    width * 0.25,
    height * 0.67,
    width * 0.57,
    height * 0.84,
    width,
    height * 0.7,
  );
  context.lineTo(width, height);
  context.lineTo(0, height);
  context.closePath();
  context.fill();

  context.fillStyle = hexToRgba("#051410", 0.5);
  context.beginPath();
  context.moveTo(0, height * 0.86);
  context.bezierCurveTo(
    width * 0.34,
    height * 0.73,
    width * 0.68,
    height * 0.94,
    width,
    height * 0.8,
  );
  context.lineTo(width, height);
  context.lineTo(0, height);
  context.closePath();
  context.fill();

  const flowerCount = 6 + Math.round(energy * 4);
  const flowers = Array.from({ length: flowerCount }, (_, index) => ({
    index,
    x: width * (0.08 + random() * 0.84),
    baseline: height * (0.78 + random() * 0.18),
    height: height * (0.16 + random() * 0.2),
    sway: (random() - 0.5) * width * (0.04 + softness * 0.035),
    petals: 5 + Math.floor(random() * 5),
    openness: 0.35 + softness * 0.8,
  })).sort((a, b) => a.baseline - b.baseline);

  flowers.forEach((flower) => {
    const primary = flower.index === Math.floor(flowerCount / 2);
    drawFlower(
      context,
      flower.x,
      flower.baseline,
      primary ? flower.height * 1.32 : flower.height,
      primary ? flower.petals + 2 : flower.petals,
      primary ? mood.colors[3] : mood.colors[2],
      primary ? mood.colors[2] : mood.colors[3],
      mood.colors[2],
      flower.sway,
      flower.openness,
      Math.min(1, progress + (primary ? 0 : random() * 0.12)),
      random,
    );
  });

  context.fillStyle = hexToRgba("#ffffff", 0.72);
  context.font = "600 11px ui-monospace, SFMono-Regular, Menlo, monospace";
  context.fillText("TODAY'S BLOOM", 28, 34);
  context.fillStyle = "#ffffff";
  context.font = "500 24px ui-serif, Georgia, serif";
  context.fillText(mood.label, 28, 65);
  context.fillStyle = hexToRgba("#ffffff", 0.58);
  context.font = "500 10px ui-monospace, SFMono-Regular, Menlo, monospace";
  context.fillText(`SEED ${seed.toString(36).toUpperCase()}`, width - 112, height - 24);
}

export default function BloomlyApp() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [moodId, setMoodId] = useState<MoodId>("hopeful");
  const [energy, setEnergy] = useState(0.62);
  const [softness, setSoftness] = useState(0.7);
  const [seed, setSeed] = useState(27072026);
  const [savedBlooms, setSavedBlooms] = useState<SavedBloom[]>([]);
  const [status, setStatus] = useState("Your flower is ready to grow.");
  const dayLabel = "Today";

  const mood = useMemo(
    () => MOODS.find((item) => item.id === moodId) ?? MOODS[0],
    [moodId],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) setSavedBlooms(JSON.parse(stored) as SavedBloom[]);
      } catch {
        setStatus("Your garden stays in this tab for now.");
      }
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const render = useCallback(
    (progress = 1) => {
      if (!canvasRef.current) return;
      drawGarden(canvasRef.current, mood, energy, softness, seed, progress);
    },
    [energy, mood, seed, softness],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const startedAt = performance.now();
    let frame = 0;

    const animate = (timestamp: number) => {
      const progress = reduceMotion
        ? 1
        : Math.min(1, (timestamp - startedAt) / 1050);
      render(progress);
      if (progress < 1) frame = window.requestAnimationFrame(animate);
    };

    frame = window.requestAnimationFrame(animate);
    const observer = new ResizeObserver(() => render(1));
    observer.observe(canvas);

    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [render]);

  const generateBloom = () => {
    const nextSeed = window.crypto.getRandomValues(new Uint32Array(1))[0];
    setSeed(nextSeed);
    setStatus(`${mood.label} has taken root.`);
  };

  const saveBloom = () => {
    const bloom: SavedBloom = {
      id: `${seed}-${moodId}`,
      mood: moodId,
      energy,
      softness,
      seed,
      createdAt: new Date().toISOString(),
    };
    const next = [bloom, ...savedBlooms.filter((item) => item.id !== bloom.id)].slice(
      0,
      8,
    );
    setSavedBlooms(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    setStatus("Saved to your private meadow.");
  };

  const downloadBloom = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    render(1);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const link = document.createElement("a");
      link.download = `bloomly-${moodId}-${seed.toString(36)}.png`;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
      setStatus("Your bloom card has been downloaded.");
    }, "image/png");
  };

  const copyStory = async () => {
    const story = `Today I grew a ${mood.label.toLowerCase()} bloom — ${mood.whisper.toLowerCase()}. Made with Bloomly.`;
    try {
      await navigator.clipboard.writeText(story);
      setStatus("A little bloom story is ready to share.");
    } catch {
      setStatus("Copy is unavailable, but your bloom is still here.");
    }
  };

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Bloomly home">
          <span className="brand-mark" aria-hidden="true">
            b.
          </span>
          <span>Bloomly</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#ritual">The ritual</a>
          <a href="#meadow">Your meadow</a>
          <a className="nav-cta" href="#garden">
            Grow a bloom <span aria-hidden="true">↘</span>
          </a>
        </nav>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">A tiny ritual for real feelings</p>
          <h1>
            Turn a feeling into <em>something alive.</em>
          </h1>
          <p className="hero-lede">
            Name the weather inside you. Bloomly turns it into a flower no one
            else will ever grow.
          </p>
          <div className="hero-note">
            <span className="pulse-dot" aria-hidden="true" />
            No account. No streaks. Your meadow stays on this device.
          </div>
        </div>

        <div className="garden-card" id="garden">
          <div className="garden-meta">
            <span>{dayLabel}</span>
            <span className="seed-label">
              seed / {seed.toString(36).toUpperCase()}
            </span>
          </div>
          <canvas
            ref={canvasRef}
            className="garden-canvas"
            role="img"
            aria-label={`A generative ${mood.label.toLowerCase()} garden with seed ${seed}`}
          />
          <div className="canvas-actions">
            <button className="text-button" type="button" onClick={saveBloom}>
              Save to meadow
            </button>
            <button className="text-button" type="button" onClick={copyStory}>
              Copy story
            </button>
            <button
              className="icon-button"
              type="button"
              onClick={downloadBloom}
              aria-label="Download this bloom as an image"
            >
              <span aria-hidden="true">↓</span>
            </button>
          </div>
        </div>
      </section>

      <section className="ritual-grid" id="ritual">
        <div className="controls-intro">
          <p className="section-number">01 / THE RITUAL</p>
          <h2>How does today feel?</h2>
          <p>
            There is no score and no right answer. Pick the word that feels
            closest, then shape the energy around it.
          </p>
        </div>

        <div className="controls-panel">
          <fieldset className="mood-fieldset">
            <legend>Choose a feeling</legend>
            <div className="mood-options">
              {MOODS.map((item) => (
                <button
                  className={`mood-option ${moodId === item.id ? "is-active" : ""}`}
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={moodId === item.id}
                  onClick={() => {
                    setMoodId(item.id);
                    setStatus(`${item.label} feels closest today.`);
                  }}
                >
                  <span
                    className="mood-swatch"
                    style={{ background: item.colors[2] }}
                    aria-hidden="true"
                  />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="slider-row">
            <label htmlFor="energy">
              <span>Energy</span>
              <span>{Math.round(energy * 100)}%</span>
            </label>
            <input
              id="energy"
              type="range"
              min="0.15"
              max="1"
              step="0.01"
              value={energy}
              onChange={(event) => setEnergy(Number(event.target.value))}
            />
          </div>

          <div className="slider-row">
            <label htmlFor="softness">
              <span>Softness</span>
              <span>{Math.round(softness * 100)}%</span>
            </label>
            <input
              id="softness"
              type="range"
              min="0.15"
              max="1"
              step="0.01"
              value={softness}
              onChange={(event) => setSoftness(Number(event.target.value))}
            />
          </div>

          <div className="grow-row">
            <button className="grow-button" type="button" onClick={generateBloom}>
              Grow this feeling <span aria-hidden="true">↗</span>
            </button>
            <p className="status" aria-live="polite">
              {status}
            </p>
          </div>
        </div>
      </section>

      <section className="meadow-section" id="meadow">
        <div className="meadow-heading">
          <div>
            <p className="section-number">02 / YOUR MEADOW</p>
            <h2>A gentle record, not a scoreboard.</h2>
          </div>
          <p>
            Saved blooms live only in this browser. Keep the moments that matter;
            let the rest drift away.
          </p>
        </div>

        {savedBlooms.length === 0 ? (
          <button className="empty-meadow" type="button" onClick={saveBloom}>
            <span className="empty-index">001</span>
            <span className="empty-orb" aria-hidden="true" />
            <span>
              Your first bloom is waiting
              <small>Save today&apos;s flower to begin</small>
            </span>
            <span aria-hidden="true">＋</span>
          </button>
        ) : (
          <div className="bloom-list">
            {savedBlooms.map((bloom, index) => {
              const savedMood =
                MOODS.find((item) => item.id === bloom.mood) ?? MOODS[0];
              const date = new Intl.DateTimeFormat("en", {
                month: "short",
                day: "numeric",
              }).format(new Date(bloom.createdAt));
              const style = {
                "--bloom-a": savedMood.colors[0],
                "--bloom-b": savedMood.colors[2],
                "--bloom-c": savedMood.colors[3],
              } as CSSProperties;
              return (
                <article className="saved-bloom" key={bloom.id} style={style}>
                  <span className="saved-index">
                    {String(index + 1).padStart(3, "0")}
                  </span>
                  <span className="saved-flower" aria-hidden="true">
                    <i />
                  </span>
                  <div>
                    <h3>{savedMood.label}</h3>
                    <p>{savedMood.whisper}</p>
                  </div>
                  <span className="saved-date">{date}</span>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="principles">
        <p className="section-number">03 / WHY BLOOMLY</p>
        <div className="principle-grid">
          <article>
            <span>01</span>
            <h3>Feelings, not metrics</h3>
            <p>No charts to optimize. Just a small moment of noticing.</p>
          </article>
          <article>
            <span>02</span>
            <h3>Yours by design</h3>
            <p>Your entries stay on your device and never become a profile.</p>
          </article>
          <article>
            <span>03</span>
            <h3>Always one of one</h3>
            <p>Every seed grows a new composition you can keep or share.</p>
          </article>
        </div>
      </section>

      <footer>
        <div>
          <span className="footer-mark">b.</span>
          <p>Made for the weather inside us.</p>
        </div>
        <p>Open source · Local first · No tracking</p>
      </footer>
    </main>
  );
}
