import { useEffect, useRef, useState } from "react";
import { ROBOT_STIFFNESS } from "../lib/motion";
import { useMediaQuery } from "../lib/useMediaQuery";

interface Layout {
  height: number;
  startY: number;
  endY: number;
  stations: number[];
}

const DESKTOP = { lane: 112, amp: 30, wave: 560, scale: 1 };
const COMPACT = { lane: 56, amp: 9, wave: 380, scale: 0.78 };
type Geometry = typeof DESKTOP;
/** Horizontal centre of the tape at page-height `y`, a sine measured from the start box. */
const laneX = ({ lane, amp, wave }: Geometry, y: number, startY: number) =>
  lane / 2 + amp * Math.sin(((y - startY) / wave) * TAU);
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
  const geo = compact ? COMPACT : DESKTOP;
  const { lane, amp, wave, scale } = geo;
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
    const slope = (y: number) => ((amp * TAU) / wave) * Math.cos(((y - startY) / wave) * TAU);
    const place = (y: number, moving: boolean) => {
      const angle = (-Math.atan(slope(y)) * 180) / Math.PI;
      robot.setAttribute("transform", `translate(${laneX(geo, y, startY)} ${y}) rotate(${angle}) scale(${scale})`);
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
    let last = 0;
    let moving = false;
    let velocity = 0;
    const tick = (now: number) => {
      // Critically damped spring, fixed 4 ms sub-steps: smooth, no overshoot,
      // identical at any refresh rate, and velocity carries across scroll bursts.
      let remaining = Math.min(now - last, 64) / 1000;
      last = now;
      const target = targetY();
      while (remaining > 0) {
        const h = Math.min(remaining, 0.004);
        velocity += (ROBOT_STIFFNESS * (target - current) - 2 * Math.sqrt(ROBOT_STIFFNESS) * velocity) * h;
        current += velocity * h;
        remaining -= h;
      }
      const gap = Math.abs(target - current);
      // Hysteresis so the LED does not flicker around the threshold.
      moving = moving ? gap > 0.6 : gap > 4;
      if (gap > 0.1 || Math.abs(velocity) > 1) {
        place(current, moving);
        frame = requestAnimationFrame(tick);
      } else {
        current = target;
        velocity = 0;
        place(current, false);
        frame = 0;
      }
    };
    const wake = () => {
      if (!frame) {
        last = performance.now();
        frame = requestAnimationFrame(tick);
      }
    };
    place(current, false);
    window.addEventListener("scroll", wake, { passive: true });
    window.addEventListener("resize", wake);
    return () => {
      window.removeEventListener("scroll", wake);
      window.removeEventListener("resize", wake);
      cancelAnimationFrame(frame);
    };
  }, [layout, geo]);

  let tape = "";
  if (layout) {
    for (let y = layout.startY; y <= layout.endY; y += 6) {
      tape += `${tape ? "L" : "M"}${laneX(geo, y, layout.startY).toFixed(1)} ${y} `;
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
              x={laneX(geo, y, layout.startY) - STATION / 2}
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
