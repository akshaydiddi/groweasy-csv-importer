"use client";

import { useEffect, useState } from "react";

export function useCountUp(target: number, durationMs = 900) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (target === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- resets the counter when target drops to 0
      setValue(0);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const from = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(from + (target - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);

  return value;
}
