"use client";
import { useEffect, useRef, useState } from "react";
export function ScrollGuide() {
  const bar = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState("");
  useEffect(() => {
    const ids = ["precision", "local-lens", "signal"];
    const update = () => {
      if (bar.current) {
        const range = document.documentElement.scrollHeight - window.innerHeight;
        bar.current.style.transform = `scaleX(${range ? window.scrollY / range : 0})`;
      }
      let current = "";
      for (const id of ids) {
        const r = document.getElementById(id)?.getBoundingClientRect();
        if (r && r.top < window.innerHeight * 0.55 && r.bottom > window.innerHeight * 0.25)
          current = id;
      }
      setActive(current);
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return (
    <>
      <div ref={bar} className="scroll-progress" aria-hidden="true" />
      {active && (
        <nav className="lab-dock" aria-label="Playground navigation">
          <a href="#precision" data-active={active === "precision"}>
            01 Precision
          </a>
          <a href="#local-lens" data-active={active === "local-lens"}>
            02 Local Lens
          </a>
          <a href="#signal" data-active={active === "signal"}>
            03 Signal
          </a>
        </nav>
      )}
    </>
  );
}
