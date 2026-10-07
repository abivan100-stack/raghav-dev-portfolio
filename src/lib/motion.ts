// Shared motion language (motion/react v13).
// One orchestrated moment: the hero settles in on load (name, statement,
// actions). Nothing else animates on its own; sections are
// static so content is readable the instant it scrolls into view.
// Interaction motion (menu, button press, the arena robot following the scroll) answers the user's action.
// Transform/opacity only. Reduced motion is handled globally via
// MotionConfig reducedMotion="user" in SiteShell, which also wraps pages in
// LazyMotion: animate with `m.*` from "motion/react-m", never `motion.*`.
import type { Transition } from "motion/react";

export const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];
export const RISE_PX = 8;
export const INTERACTION_DURATION = 0.25;
export const PRESS_DURATION = 0.12;
/** Spring stiffness (1/s²) of the arena robot following the scroll; critically damped. */
export const ROBOT_STIFFNESS = 90;

/** Spread onto a motion element for the hero entrance (plays on mount). */
export function entrance(index = 0) {
  return {
    initial: { opacity: 0, y: RISE_PX },
    animate: { opacity: 1, y: 0 },
    transition: {
      duration: 0.4,
      ease: EASE,
      delay: 0.05 + index * 0.05,
    } satisfies Transition,
  };
}
