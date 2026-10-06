import * as m from "motion/react-m";
import type { ReactEventHandler } from "react";
import { useEffect, useState } from "react";
import {
  CONTRIBUTION_TEASER,
  GITHUB_AVATAR_URL,
  HERO_COPY,
  PROJECTS_PAGE_PATH,
  TITLE_BLOCK,
} from "../data/content";
import { getContributions } from "../lib/contributions";
import { EASE, entrance, PRESS_DURATION } from "../lib/motion";
import { HingeScene } from "./HingeScene";

const hideOnError: ReactEventHandler<HTMLImageElement> = (event) => {
  event.currentTarget.style.display = "none";
};

const press = { whileTap: { scale: 0.98 }, transition: { duration: PRESS_DURATION, ease: EASE } };

/**
 * The hero is a circuit board: the name in silkscreen type, a few facts, and
 * a sketch of the Door Hinge Safety System that reacts to the pointer.
 */
export function Hero() {
  const [contributionTotal, setContributionTotal] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    void getContributions().then((calendar) => {
      if (active && calendar) setContributionTotal(calendar.totalContributions);
    });
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="hero" id="intro" aria-labelledby="hero-name">
      <div className="container">
        <div className="board hero-board">
          <m.h1 {...entrance(0)} className="hero-name" id="hero-name">
            {HERO_COPY.name}
          </m.h1>
          <div className="hero-grid">
            <m.div {...entrance(1)} className="hero-copy">
              <p className="hero-statement">{HERO_COPY.statement}</p>
              <div className="hero-person">
                {/* PROFILE PHOTO: swap src for assets/profile.jpg to use a real photograph. */}
                <img
                  className="profile-img"
                  src={GITHUB_AVATAR_URL}
                  alt={HERO_COPY.avatarAlt}
                  width={64}
                  height={64}
                  decoding="async"
                  onError={hideOnError}
                />
                <dl className="hero-facts">
                  {TITLE_BLOCK.map((fact) => (
                    <div key={fact.label}>
                      <dt>{fact.label}</dt>
                      <dd>{fact.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="hero-actions">
                <m.a className="btn btn-gold" href={PROJECTS_PAGE_PATH} {...press}>
                  {HERO_COPY.projectsLink}
                </m.a>
                {contributionTotal !== null ? (
                  <a className="hero-teaser" href="#contributions">
                    <span className="hero-teaser-count">{contributionTotal.toLocaleString()}</span>{" "}
                    {CONTRIBUTION_TEASER.lead}
                  </a>
                ) : null}
              </div>
            </m.div>
            <m.div {...entrance(2)} className="hero-scene">
              <HingeScene />
            </m.div>
          </div>
        </div>
      </div>
    </section>
  );
}
