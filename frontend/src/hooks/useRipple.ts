"use client";

import { MouseEvent, useCallback } from "react";

export function useRipple() {
  return useCallback((e: MouseEvent<HTMLElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 1.4;
    const span = document.createElement("span");
    span.className = "ripple-el";
    span.style.width = `${size}px`;
    span.style.height = `${size}px`;
    span.style.left = `${e.clientX - rect.left - size / 2}px`;
    span.style.top = `${e.clientY - rect.top - size / 2}px`;
    span.style.opacity = "0.28";

    const prevPosition = getComputedStyle(el).position;
    if (prevPosition === "static") el.style.position = "relative";
    const prevOverflow = el.style.overflow;
    el.style.overflow = "hidden";

    el.appendChild(span);
    span.addEventListener("animationend", () => {
      span.remove();
      el.style.overflow = prevOverflow;
    });
  }, []);
}
