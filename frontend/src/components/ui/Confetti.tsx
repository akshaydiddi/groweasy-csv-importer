"use client";

import { useState } from "react";

const COLORS = ["var(--accent)", "var(--accent-2)", "var(--brand)", "var(--brand-2)"];

export function Confetti({ count = 26 }: { count?: number }) {
  // Lazy useState initializer: runs exactly once per mount, so the
  // randomness here doesn't re-fire on re-renders like a useMemo would.
  const [pieces] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.25,
      duration: 0.9 + Math.random() * 0.6,
      fallY: 160 + Math.random() * 140,
      spin: (Math.random() > 0.5 ? 1 : -1) * (240 + Math.random() * 200),
      color: COLORS[i % COLORS.length],
      rotate: Math.random() * 360,
      round: Math.random() > 0.5,
    }))
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 z-30 h-0 overflow-visible">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            borderRadius: p.round ? "999px" : "2px",
            transform: `rotate(${p.rotate}deg)`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            ["--fall-y" as string]: `${p.fallY}px`,
            ["--spin" as string]: `${p.spin}deg`,
          }}
        />
      ))}
    </div>
  );
}
