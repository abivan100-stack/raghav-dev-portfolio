import { AnimatePresence } from "motion/react";
import * as m from "motion/react-m";
import { useEffect, useRef, useState } from "react";
import { GITHUB_URL, NAV_GITHUB_LABEL, NAV_LINKS, PROFILE_NAME, PROJECTS_PAGE_PATH } from "../data/content";
import { EASE, INTERACTION_DURATION, RISE_PX } from "../lib/motion";
import { isHomePage, resolveHref, scrollToTop } from "../lib/site";
import { useMediaQuery } from "../lib/useMediaQuery";
import { LinkIcon } from "./ui";

/** Section links scroll on home; off home, Projects is this page itself. */
function navTarget(href: string): { href: string; current?: "page" } {
  if (href === "#projects" && !isHomePage()) return { href: PROJECTS_PAGE_PATH, current: "page" };
  return { href: resolveHref(href) };
}

const NAV_HREFS = new Set(NAV_LINKS.map((link) => link.href));

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [activeHref, setActiveHref] = useState<string | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const mobile = useMediaQuery("(max-width: 640px)");
  const home = isHomePage();

  // Scroll-spy (home only): highlight the section crossing the middle band.
  // Every section is observed, so the hero or an unlisted section clears the
  // highlight instead of leaving the last one lit. Sections that mount late
  // (contributions) clear it when their neighbour leaves the band.
  useEffect(() => {
    if (!home) return;
    const spy = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) continue;
          const href = `#${entry.target.id}`;
          setActiveHref((current) => (current === href ? null : current));
        }
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const href = `#${entry.target.id}`;
          setActiveHref(NAV_HREFS.has(href) ? href : null);
        }
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );
    document.querySelectorAll("main section[id]").forEach((section) => spy.observe(section));
    return () => spy.disconnect();
  }, [home]);

  // The menu only exists on small screens; widening the window closes it.
  useEffect(() => {
    if (!mobile) setOpen(false);
  }, [mobile]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const links = NAV_LINKS.map((link) => {
    const target = navTarget(link.href);
    return {
      label: link.label,
      href: target.href,
      current: target.current ?? (activeHref === link.href ? ("true" as const) : undefined),
    };
  });

  return (
    <header className="nav" id="top">
      <div className="nav-inner">
        <a
          className="brand"
          href={home ? "#top" : "/"}
          aria-label={`${PROFILE_NAME} home`}
          onClick={home ? scrollToTop : undefined}
        >
          <svg className="brand-mark" viewBox="0 0 100 100" width="28" height="28" aria-hidden="true" focusable="false">
            <rect className="mark-board" width="100" height="100" rx="22" />
            <path className="mark-trace" d="M50 -4V30Q50 50 50 62" />
            <rect className="mark-pad" x="30" y="38" width="40" height="52" rx="12" />
            <circle className="mark-led" cx="40" cy="74" r="5" />
            <circle className="mark-led" cx="60" cy="74" r="5" />
          </svg>
          <span className="brand-text">{PROFILE_NAME}</span>
        </a>
        <nav className="nav-links" aria-label="Primary">
          {links.map((link) => (
            <a key={link.href} href={link.href} aria-current={link.current}>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="nav-cta">
          <a className="nav-github" href={GITHUB_URL} target="_blank" rel="noopener">
            <LinkIcon label="GitHub" size={14} />
            <span className="nav-github-label">{NAV_GITHUB_LABEL}</span>
          </a>
          <button
            className="nav-toggle"
            ref={toggleRef}
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls={open ? "mobileMenu" : undefined}
            onClick={() => setOpen((value) => !value)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
      <AnimatePresence initial={false}>
        {open ? (
          <m.nav
            key="mobile-menu"
            className="mobile-menu"
            id="mobileMenu"
            aria-label="Mobile"
            initial={{ opacity: 0, y: -RISE_PX }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -RISE_PX }}
            transition={{ duration: INTERACTION_DURATION, ease: EASE }}
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                aria-current={link.current}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </m.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
