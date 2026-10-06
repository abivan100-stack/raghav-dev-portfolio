import { useEffect, useRef, useState } from "react";
import { ROBOT_FOLLOW } from "../lib/motion";
import { useMediaQuery } from "../lib/useMediaQuery";

interface Layout {
  height: number;
  startY: number;
  endY: number;
  stations: number[];
}

const DESKTOP = { lane: 112, amp: 30, wave: 560, scale: 1 };
const COMPACT = { lane: 56, amp: 9, wave: 380, scale: 0.78 };
const STATION = 26;
/** A station marking an element's top edge sits this far below it, level with a heading. */
const ENTRY_STATION_OFFSET = 56;
const TAU = Math.PI * 2;

/** Vertical centre of each marked element, measured from the top of the arena. */
function measure(arena: HTMLElement): Layout | null {
  const start = arena.querySelector("[data-start]");
  const finish = arena.querySelector("[data-finish]");
  if (!start || !finish) return null;
  const base = arena.getBoundingClientRect().top + window.scrollY;
  const mid = (el: Element) => {
    const box = el.getBoundingClientRect();
    const edge = el instanceof HTMLElement && el.dataset.station === "top";
    return Math.round(box.top + window.scrollY - base + (edge ? ENTRY_STATION_OFFSET : box.height / 2));
  };
  return {
    height: arena.offsetHeight,
    startY: mid(start),
    endY: mid(finish),
    stations: Array.from(arena.querySelectorAll("[data-station]"), mid),
  };
}

const sameLayout = (a: Layout | null, b: Layout | null) => JSON.stringify(a) === JSON.stringify(b);

/**
 * The arena floor: a strip of black tape down the left of the page, a station
 * at every section heading, and a small line-following robot that rides the
 * tape as the page scrolls. Decorative, so hidden from assistive tech; under
 * reduced motion the robot stays at the start and every station is lit.
 */
export function Track() {
  const compact = useMediaQuery("(max-width: 640px)");
  const { lane, amp, wave, scale } = compact ? COMPACT : DESKTOP;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const robotRef = useRef<SVGGElement | null>(null);
  const stationRefs = useRef<(SVGRectElement | null)[]>([]);
  const [layout, setLayout] = useState<Layout | null>(null);

  useEffect(() => {
    const arena = rootRef.current?.parentElement;
    if (!arena) return;
    const update = () => setLayout((current) => {
      const next = measure(arena);
      return sameLayout(current, next) ? current : next;
    });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(arena);
    void document.fonts.ready.then(update);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const robot = robotRef.current;
    if (!layout || !robot) return;
    const { startY, endY, stations } = layout;
    const laneX = (y: number) => lane / 2 + amp * Math.sin(((y - startY) / wave) * TAU);
    const slope = (y: number) => ((amp * TAU) / wave) * Math.cos(((y - startY) / wave) * TAU);
    const place = (y: number, moving: boolean) => {
      const angle = (-Math.atan(slope(y)) * 180) / Math.PI;
      robot.setAttribute("transform", `translate(${laneX(y)} ${y}) rotate(${angle}) scale(${scale})`);
      robot.classList.toggle("is-moving", moving);
      stationRefs.current.forEach((el, i) => el?.classList.toggle("is-passed", y >= (stations[i] ?? Infinity) - 2));
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      place(startY, false);
      stationRefs.current.forEach((el) => el?.classList.add("is-passed"));
      return;
    }

    const targetY = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      return startY + progress * (endY - startY);
    };
    let current = targetY();
    let frame = 0;
    const tick = () => {
      const gap = targetY() - current;
      current += gap * ROBOT_FOLLOW;
      const moving = Math.abs(gap) > 0.6;
      place(current, moving);
      frame = moving ? requestAnimationFrame(tick) : 0;
    };
    const wake = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    place(current, false);
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", wake);
    return () => {
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", wake);
      cancelAnimationFrame(frame);
    };
  }, [layout, lane, amp, wave, scale]);

  let tape = "";
  if (layout) {
    for (let y = layout.startY; y <= layout.endY; y += 6) {
      const x = lane / 2 + amp * Math.sin(((y - layout.startY) / wave) * TAU);
      tape += `${tape ? "L" : "M"}${x.toFixed(1)} ${y} `;
    }
  }

  return (
    <div className="track" ref={rootRef} aria-hidden="true">
      {layout ? (
        <svg
          className="track-svg"
          width={lane}
          height={layout.height}
          viewBox={`0 0 ${lane} ${layout.height}`}
          focusable="false"
        >
          <path className="tape" d={tape} />
          {layout.stations.map((y, i) => (
            <rect
              key={`${i}-${y}`}
              ref={(el) => {
                stationRefs.current[i] = el;
              }}
              className="station"
              x={lane / 2 + amp * Math.sin(((y - layout.startY) / wave) * TAU) - STATION / 2}
              y={y - STATION / 2}
              width={STATION}
              height={STATION}
              rx="6"
            />
          ))}
          <g className="robot" ref={robotRef}>
            <rect className="bot-wheel" x="-22" y="-15" width="7" height="20" rx="2" />
            <rect className="bot-wheel" x="15" y="-15" width="7" height="20" rx="2" />
            <rect className="bot-body" x="-16" y="-23" width="32" height="44" rx="9" />
            <rect className="bot-chip" x="-7" y="-14" width="14" height="14" rx="3" />
            <circle className="bot-led" cx="-9" cy="14" r="3.6" />
            <circle className="bot-led" cx="9" cy="14" r="3.6" />
          </g>
        </svg>
      ) : null}
    </div>
  );
}
