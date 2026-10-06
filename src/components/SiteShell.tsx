import { domAnimation, LazyMotion, MotionConfig } from "motion/react";
import type { ReactNode } from "react";
import { useInitialHashScroll } from "../lib/site";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";
import { Track } from "./Track";

/**
 * Frame shared by every page: skip link, nav, then the arena (tape track,
 * main landmark, footer).
 * LazyMotion loads only the DOM animation features the site uses (components
 * use `m.*`, and `strict` rejects the full `motion.*` bundle). Reduced motion
 * is honoured globally.
 */
export function SiteShell({ children }: { children: ReactNode }) {
  useInitialHashScroll();
  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Navbar />
        <div className="arena">
          <Track />
          <main id="main">{children}</main>
          <Footer />
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}
