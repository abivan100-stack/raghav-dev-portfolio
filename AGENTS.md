# AGENTS.md for dev-portfolio

Vite + React 19 + strict TypeScript portfolio with two pages: home (`index.html` → `src/App.tsx`) and projects (`project.html` → `src/pages/ProjectPage.tsx`, served at `/project`). Content rules live in `README.md` ("Project content rules"); read them before touching copy.

## Verify

- There are no tests, lint, or CI. Done means: `npm run build` green (it typechecks first), zero console errors, and a browser check.
- Fix type errors at the source; the build stays free of `any` casts and `@ts-ignore`.
- Browser matrix when layout or behaviour changes: desktop + 390px phone, light + dark, horizontal overflow (`scrollWidth` vs `clientWidth`), menu + Escape, `reducedMotion: reduce`.
- Dev server: `npm run dev` on port 5173. The projects page is `/project.html` in dev and `/project` in production.
- Browser tooling: `file://` is blocked, so serve over localhost from a detached process (see Shell). If the Playwright MCP is down, `playwright-core` driving the cached Chromium at `%LOCALAPPDATA%\ms-playwright\chromium-*\chrome-win64\chrome.exe` works; install it in a scratch folder, outside the repo.

## Shell (Windows PowerShell 5.1)

- Chain with `; if ($?) { ... }` (there is no `&&`). `Select-Object` takes `-First` / `-Last`.
- Each call is a fresh session. Start long-running servers with `Start-Process ... -WindowStyle Hidden`, then probe with `Invoke-WebRequest`.
- Write commit messages to a file and use `git commit -F <file>`; here-strings passed to native commands get split into pathspecs.
- The working tree mixes CRLF and LF files (`core.autocrlf=true`). Use the Edit tool for multi-line replacements; `` `n ``-based string replaces silently miss CRLF files.
- Noise to ignore: `LF will be replaced by CRLF` warnings, and `git push` progress on stderr surfacing as `NativeCommandError`.

## Motion (no budget, no variety cap)

- `motion/react` is the animation library. Animate as much as you want, anywhere: there is no per-section budget, no cap on the number of animated elements, and no "this must stay still" list. Adding, extending, or removing animation is always in scope.
- Anything goes effect-wise: layout animation, scroll-linked animation, parallax, springs, bouncy or custom easings, keyframes, gestures, shared-layout transitions, looping/ambient motion. None of it is off-limits.
- `src/lib/motion.ts` is the home of the shared tokens. Reuse them where they fit and add new ones as needed, so repeated effects stay consistent. Don't route every value through it when a one-off reads better inline.
- `SiteShell` wraps every page in `LazyMotion features={domAnimation} strict` and `MotionConfig reducedMotion="user"`. Animate with `m.*` from `motion/react-m`; under `strict` a `motion.*` component throws and pulls the full bundle back in, so keep new motion on `m.*`.
- Accessibility is the one hard requirement, not a budget item. Anything you animate must respect reduced motion — `MotionConfig` drops transforms while opacity fades remain, and the CSS query covers the rest. Never make motion the only way information is conveyed.
- Performance is the other one: prefer transform/opacity, and make scroll-linked work cheap (avoid layout thrash and per-frame `setState` on large subtrees).
- The arena robot (`components/Track.tsx`) answers the scroll: it eases toward the scroll position with `ROBOT_STIFFNESS` (critically damped spring), writes its `transform` straight to the SVG (no React state per frame), and stops its rAF loop once it settles. Under reduced motion it parks at the start and every station is lit.
- What ships today is restrained — a hero entrance, action feedback, and sections that are static on arrival. That is the current design, not a rule. Changing it is allowed.

## Design system

- The arena: the page is a robotics arena floor. Tokens on `:root` in `src/index.css`: `--floor` (faint mat grid in light, foam-tile checker on black in dark), `--ink` (true black tape; white on the dark floor), `--yellow` (zones, results, the robot), `--red` (the robot's LED only). `--panel` stays black in both themes for the scoreboard. Text contrast stays at WCAG AA.
- Two families, split by role. Anybody, set extra-wide (`font-stretch` 130 to 150%) and black, is the paint on the floor: names, headings, the headline result. Schibsted Grotesk (`--font`) does all the reading. Sentence case, no caps labels, no mono.
- The tape lane: `.lane-pad` keeps content right of the tape. `Track` (`components/Track.tsx`) draws a serpentine tape from `[data-start]` to `[data-finish]` (hero start box or the projects `h1`, and the footer finish line) with a station at each `[data-station]` heading. Elements that stick (project entries) use `data-station="top"` so scrolling cannot move their station. A new page needs one `data-start` and the shared footer.
- Sections use `Section` (`components/ui.tsx`): the heading sits at a station and matches its nav label. `variant` only adds a `section--<variant>` class for per-section styling. Facts go in `dl.spec` rows. Competitions is a real `<table>` styled as the black scoreboard (rows stack below 48rem); Stack is a parts organiser (`.kit`).
- The hero is the name, one statement, the start box, and the avatar photo with the facts. The robot is decoration: keep it free of copy, labels or claims, and hidden from assistive tech. The real signal chain lives on the Door Hinge entry.
- Responsive floor: 280px up to 2560px with no horizontal overflow; stand-alone controls are 44px minimum below 1024px; the nav becomes a menu below 880px; on phones a tooltip is pinned to the bottom of the screen so it can never be clipped at an edge. Check the browser matrix at 280, 320, 390, 768, 1024 and 1440 widths.
- Each result appears once on the home page, in Competitions. The home project index shows name + `summary`.

## Components

- Pages go through `SiteShell` (skip link, nav, `main`, footer, deep-link hash scroll, motion setup).
- All copy lives in `src/data/content.ts`; components render it.
- Stack badges (`StackIcon.tsx`): brand marks are inlined from simple-icons (CC0) in `brandIcons.ts`, keyed by the `STACK_ROWS` label; marks only published as images (the Blynk sign for `IoT`) are inlined as data URIs in the same file; an item with neither gets a drawn fallback glyph (yellow on a dark tile) in `StackIcon.tsx`. Only add a mark for a skill that is already in `STACK_ROWS` (see the README content rules).
- Watermelon UI is ported natively (`Tip` in `components/ui.tsx`, nav, buttons); it is a React + Tailwind + shadcn registry, so it never gets `npm install`ed here.
- Build UI with React + CSS only. Component and animation libraries (KokonutUI, React Bits, Motion Primitives, 21st.dev) were evaluated and rejected: smallest footprint wins.

## Contributions API

- `api/github-contributions.ts` is a Vercel function; the Vite dev server runs the same handler and passes it `.env.local` values. Setup and the public-only policy are in `README.md` ("GitHub contribution graph").
- Any unavailable answer hides the section and the hero count; failures log a short reason in the Vercel function logs.

## Deploy

- Vercel project `van-89de/dev-portfolio`, live at `https://raghavkrishna-dev.vercel.app` (the `raghav-dev` and `raghavdev` aliases were taken). Merges to upstream `main` auto-deploy; the CLI is logged in for the rare manual deploy.
- `.vercelignore` keeps `.playwright-mcp/` and `dist/` out of uploads; including them aborts deploys on slow networks.
- The canonical URL (`https://raghavkrishna-dev.vercel.app`, projects at `/project`, no trailing slash) stays in sync across `index.html` and `project.html` (canonical + `og:url`), `public/robots.txt`, and `public/sitemap.xml`. `vercel.json` sets `trailingSlash: false`.

## Git

- Remotes: `origin` is upstream `Raghav2012Code/dev-portfolio`; `fork` is `abivan100-stack/raghav-dev-portfolio`. Work on a branch, push it to `fork`, and open or update a PR into upstream `main`.
- Commit after a green build unless the user says otherwise. History only moves forward (no force-push), and secrets stay out of the repo.
- A global pre-commit hook runs a Codex bug check on the staged patch and can block the commit. Fix what it flags, then commit again with hooks enabled.

## Agent skills

### Issue tracker

Issues live in upstream GitHub repo `Raghav2012Code/dev-portfolio`; use `gh` and specify `--repo Raghav2012Code/dev-portfolio`. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the default labels `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

This is a single-context repo. See `docs/agents/domain.md`.
