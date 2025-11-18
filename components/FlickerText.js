"use client";

import { useEffect, useState } from "react";

const ASCII_SET = ".,:;-+=*#%@░▒▓█";

export default function FlickerText({ text, duration = 900 }) {
  const [display, setDisplay] = useState(text);

  useEffect(() => {
    const chars = text.split("");
    // Precompute a random settle time for each character so they
    // all start together but resolve at different speeds.
    const minFactor = 0.1;
    const maxFactor = 8.4;
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

    const animate = () => {
      const now = performance.now();
      const elapsed = now - start;
      const next = chars.map((ch, i) => {
        if (ch === " ") return " ";
        const t = elapsed;
        if (t <= 0) return "";
        if (t >= settleTimes[i]) return ch;
        const idx = Math.floor(Math.random() * ASCII_SET.length);
        return ASCII_SET[idx];
      });
      setDisplay(next.join(""));

      const totalTime = Math.max(...settleTimes);
      if (elapsed < totalTime + 200) {
        frameId = requestAnimationFrame(animate);
      } else {
        setDisplay(text);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [text, duration]);

  return <p>{display}</p>;
}
