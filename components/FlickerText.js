"use client";

import { useEffect, useState } from "react";

const ASCII_SET = ".,:;-+=*#%@░▒▓█";

export default function FlickerText({ text, duration = 900, hoverDuration = 600 }) {
  const [display, setDisplay] = useState({
    chars: text.split(""),
    flickerMask: text.split("").map(() => false),
  });
  const [introDone, setIntroDone] = useState(false);
  const [hoverUntil, setHoverUntil] = useState(
    text.split("").map(() => 0)
  );

  useEffect(() => {
    const chars = text.split("");
    // Precompute a random settle time for each character so they
    // all start together but resolve at different speeds.
    const minFactor = 1.0;
    const maxFactor = 12.0;
    const biasPower = 0.1; // higher = more weight toward the tail
    const settleTimes = chars.map(() => {
      const r = Math.random();
      // Skew toward larger factors: most characters finish late,
      // a few settle early.
      const biased = 1 - Math.pow(1 - r, biasPower);
      const f = minFactor + biased * (maxFactor - minFactor);
      return duration * f;
    });

    let frameId;
    const start = performance.now();
    setIntroDone(false);

    const animate = () => {
      const now = performance.now();
      const elapsed = now - start;
      const nextChars = chars.map((ch, i) => {
        if (ch === " ") return " ";
        const t = elapsed;
        if (t <= 0) return "";
        if (t >= settleTimes[i]) return ch;
        const idx = Math.floor(Math.random() * ASCII_SET.length);
        return ASCII_SET[idx];
      });

      const nextFlickerMask = chars.map((ch, i) => {
        if (ch === " ") return false;
        const t = elapsed;
        return t > 0 && t < settleTimes[i];
      });

      setDisplay({ chars: nextChars, flickerMask: nextFlickerMask });

      const totalTime = Math.max(...settleTimes);
      if (elapsed < totalTime + 200) {
        frameId = requestAnimationFrame(animate);
      } else {
        setDisplay({
          chars: chars,
          flickerMask: chars.map(() => false),
        });
        setIntroDone(true);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [text, duration]);

  useEffect(() => {
    setHoverUntil(text.split("").map(() => 0));
    setDisplay({
      chars: text.split(""),
      flickerMask: text.split("").map(() => false),
    });
  }, [text]);

  useEffect(() => {
    if (!introDone) return;

    let frameId;
    const run = () => {
      const now = performance.now();
      let anyActive = false;

      const baseChars = text.split("");
      const nextChars = [...baseChars];
      const nextMask = baseChars.map((ch, i) => {
        if (ch === " ") return false;
        if (hoverUntil[i] > now) {
          anyActive = true;
          const idx = Math.floor(Math.random() * ASCII_SET.length);
          nextChars[i] = ASCII_SET[idx];
          return true;
        }
        return false;
      });

      if (anyActive) {
        setDisplay({ chars: nextChars, flickerMask: nextMask });
        frameId = requestAnimationFrame(run);
      } else {
        setDisplay({
          chars: baseChars,
          flickerMask: baseChars.map(() => false),
        });
      }
    };

    const now = performance.now();
    const hasHover = hoverUntil.some((t) => t > now);
    if (hasHover) {
      frameId = requestAnimationFrame(run);
    }

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [hoverUntil, introDone, text]);

  const handleHover = (index) => {
    if (!introDone) return;

    setHoverUntil((prev) => {
      const next = [...prev];
      const now = performance.now();
      const durationMs = hoverDuration;
      next[index] = Math.max(next[index], now + durationMs);
      return next;
    });
  };

  return (
    <p style={{ whiteSpace: "pre-wrap" }}>
      {display.chars.map((ch, i) => (
        <span
          key={i}
          onMouseEnter={() => handleHover(i)}
          style={display.flickerMask[i] ? { color: "#c73a44" } : undefined}
        >
          {ch}
        </span>
      ))}
    </p>
  );
}
