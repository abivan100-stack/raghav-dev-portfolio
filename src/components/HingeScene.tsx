import * as m from "motion/react-m";
import { useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import { HINGE_COPY, PROJECTS, PROJECTS_PAGE_PATH } from "../data/content";
import { ACTUATE_DURATION, EASE, HAND_HOLD_MS, STAGE_STEP } from "../lib/motion";

type CssVars = CSSProperties & { [name: `--${string}`]: string };

interface Point {
  x: number;
  y: number;
}

const VIEW_W = 640;
const VIEW_H = 300;
const GAP_LEFT = 232;
const GAP_RIGHT = 408;
const FINGER_R = 18;
const BEAM_Y = { laser: 70, ir: 130 } as const;
/** Where the button parks the fingertip: past both beams, mid-gap. */
const FORCED_HAND: Point = { x: 320, y: 188 };
const PARKED: Point = { x: 320, y: -40 };

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

/** A beam is cut once the fingertip has passed its height inside the gap. */
function beamEnd(beamY: number, hand: Point | null): number {
  if (!hand || hand.y < beamY) return GAP_RIGHT;
  if (hand.x + FINGER_R <= GAP_LEFT || hand.x - FINGER_R >= GAP_RIGHT) return GAP_RIGHT;
  return clamp(hand.x - FINGER_R, GAP_LEFT, GAP_RIGHT);
}

function stageVars(index: number): CssVars {
  return { "--i": String(index) };
}

const chainVars: CssVars = {
  "--actuate-dur": `${ACTUATE_DURATION}s`,
  "--stage-step": `${STAGE_STEP}s`,
};

/**
 * The hero's one interactive moment: a top view of the hinge gap with a laser
 * and an IR beam across it. A fingertip follows the pointer; once it cuts a
 * beam, the Sense, Process and Actuate stages light in order. The button does
 * the same for keyboard and touch users. A sketch, not a measurement.
 */
export function HingeScene() {
  const patternId = useId();
  const [pos, setPos] = useState<Point>(PARKED);
  const [present, setPresent] = useState(false);
  const [driven, setDriven] = useState(false);
  const [forced, setForced] = useState(false);
  const [settled, setSettled] = useState(false);
  const holdTimer = useRef(0);

  useEffect(() => () => window.clearTimeout(holdTimer.current), []);

  // The button's fingertip takes a moment to arrive; the beams cut when it has.
  useEffect(() => {
    if (!forced) return;
    const id = window.setTimeout(() => setSettled(true), ACTUATE_DURATION * 600);
    return () => window.clearTimeout(id);
  }, [forced]);

  const hand = forced ? (settled ? FORCED_HAND : null) : present ? pos : null;
  const laserEnd = beamEnd(BEAM_Y.laser, hand);
  const irEnd = beamEnd(BEAM_Y.ir, hand);
  const tripped = laserEnd < GAP_RIGHT || irEnd < GAP_RIGHT;
  const shown = forced ? FORCED_HAND : pos;
  const visible = forced || present;

  const chain = PROJECTS.find((project) => project.featured)?.sysline ?? [];

  function track(event: PointerEvent<SVGSVGElement>) {
    if (forced) return;
    window.clearTimeout(holdTimer.current);
    const box = event.currentTarget.getBoundingClientRect();
    setDriven(true);
    setPresent(true);
    setPos({
      x: clamp(((event.clientX - box.left) / box.width) * VIEW_W, FINGER_R, VIEW_W - FINGER_R),
      y: clamp(((event.clientY - box.top) / box.height) * VIEW_H, 0, VIEW_H),
    });
  }

  function retract() {
    setDriven(false);
    setPresent(false);
    setPos(PARKED);
  }

  function lift(event: PointerEvent<SVGSVGElement>) {
    if (forced || event.pointerType === "mouse") return;
    window.clearTimeout(holdTimer.current);
    holdTimer.current = window.setTimeout(retract, HAND_HOLD_MS);
  }

  function toggle() {
    window.clearTimeout(holdTimer.current);
    setDriven(false);
    setPresent(false);
    setPos(PARKED);
    setSettled(false);
    setForced((value) => !value);
  }

  return (
    <figure className={tripped ? "hinge is-tripped" : "hinge"} style={chainVars}>
      <svg
        className="hinge-scene"
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        role="img"
        aria-label={HINGE_COPY.sceneLabel}
        onPointerMove={track}
        onPointerDown={track}
        onPointerUp={lift}
        onPointerCancel={lift}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse" && !forced) retract();
        }}
      >
        <defs>
          <pattern id={patternId} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <line className="h-hatch" x1="0" y1="0" x2="0" y2="12" />
          </pattern>
        </defs>

        <rect className="h-solid" x="24" y="12" width="208" height="276" rx="4" />
        <rect className="h-solid" x="408" y="12" width="208" height="276" rx="4" />
        <rect className="h-zone" x={GAP_LEFT} y="12" width={GAP_RIGHT - GAP_LEFT} height="214" fill={`url(#${patternId})`} />
        <rect className="h-hinge" x="208" y="236" width="224" height="34" rx="4" />
        <line className="h-hinge-line" x1="232" y1="253" x2="408" y2="253" />
        <circle className="h-hinge-pin" cx="320" cy="253" r="9" />

        <g aria-hidden="true">
          <text className="h-text h-text-dim" x="40" y="276">{HINGE_COPY.door}</text>
          <text className="h-text h-text-dim" x="446" y="276">{HINGE_COPY.frame}</text>
          <text className="h-text h-text-halo" x="320" y="214" textAnchor="middle">{HINGE_COPY.zone}</text>
          <text className="h-text" x="40" y={BEAM_Y.laser + 5}>{HINGE_COPY.laser}</text>
          <text className="h-text" x="40" y={BEAM_Y.ir + 5}>{HINGE_COPY.ir}</text>
        </g>

        <rect className="h-pad" x="212" y={BEAM_Y.laser - 9} width="20" height="18" rx="3" />
        <rect className="h-pad h-pad-hollow" x="408" y={BEAM_Y.laser - 9} width="20" height="18" rx="3" />
        <rect className="h-pad" x="212" y={BEAM_Y.ir - 9} width="20" height="18" rx="3" />
        <rect className="h-pad h-pad-hollow" x="408" y={BEAM_Y.ir - 9} width="20" height="18" rx="3" />

        <g className="h-beam h-beam-laser" aria-hidden="true">
          <line className="h-beam-glow" x1={GAP_LEFT} y1={BEAM_Y.laser} x2={laserEnd} y2={BEAM_Y.laser} />
          <line className="h-beam-core" x1={GAP_LEFT} y1={BEAM_Y.laser} x2={laserEnd} y2={BEAM_Y.laser} />
        </g>
        <line className="h-beam-ir" aria-hidden="true" x1={GAP_LEFT} y1={BEAM_Y.ir} x2={irEnd} y2={BEAM_Y.ir} />

        <m.g
          className="h-finger"
          aria-hidden="true"
          initial={false}
          animate={{ x: shown.x, y: shown.y, opacity: visible ? 1 : 0 }}
          transition={driven ? { duration: 0 } : { duration: ACTUATE_DURATION, ease: EASE }}
        >
          <path className="h-finger-body" d={`M${-FINGER_R} -320 V${-FINGER_R} a${FINGER_R} ${FINGER_R} 0 0 0 ${FINGER_R * 2} 0 V-320`} />
          <path className="h-finger-nail" d="M-9 -26 q9 -10 18 0" />
          <path className="h-finger-nail" d="M-18 -92 h10 M8 -92 h10" />
        </m.g>
      </svg>

      <ol className="hinge-chain" aria-label="Signal chain">
        {chain.map((step, index) => (
          <li key={step.text.label} style={stageVars(index)}>
            <span className="chain-stage">{step.strong}</span>
            <span className="chain-part">{step.text.label}</span>
            {index === chain.length - 1 ? <ActuatorGlyph /> : null}
          </li>
        ))}
      </ol>

      <figcaption className="hinge-foot">
        <p className="hinge-status" role="status">
          {tripped ? HINGE_COPY.tripped : HINGE_COPY.idle}
        </p>
        <p className="hinge-hint">{HINGE_COPY.hint}</p>
        <div className="hinge-actions">
          <button className="btn btn-ghost" type="button" aria-pressed={forced} onClick={toggle}>
            {HINGE_COPY.trigger}
          </button>
          <a className="hinge-more" href={`${PROJECTS_PAGE_PATH}#door-hinge-safety-system`}>
            {HINGE_COPY.more}
          </a>
        </div>
        <p className="hinge-caption">{HINGE_COPY.caption}</p>
      </figcaption>
    </figure>
  );
}

/** Servo horn that swings and solenoid plunger that extends once the chain fires. */
function ActuatorGlyph() {
  return (
    <svg className="glyph" viewBox="0 0 76 32" width="76" height="32" aria-hidden="true" focusable="false">
      <circle className="glyph-hub" cx="14" cy="16" r="6" />
      <rect className="glyph-arm" x="14" y="14" width="24" height="4" rx="2" />
      <rect className="glyph-coil" x="46" y="8" width="18" height="16" rx="2" />
      <rect className="glyph-plunger" x="58" y="14" width="14" height="4" rx="2" />
    </svg>
  );
}
