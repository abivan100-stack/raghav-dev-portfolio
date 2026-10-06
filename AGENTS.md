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

## Motion (one language)

- All timing lives in `src/lib/motion.ts`: one ease, 8px rise, 50ms stagger. Components import it rather than hardcoding durations.
- One orchestrated moment: the hero entrance (name, statement, actions, facts). Sections are static and readable on arrival.
- The arena robot (`components/Track.tsx`) answers the scroll: it eases toward the scroll position with `ROBOT_FOLLOW`, writes its `transform` straight to the SVG (no React state per frame), and stops its rAF loop once it settles. Under reduced motion it parks at the start and every station is lit.
- Interaction motion (mobile menu, button press, project-row zone swipe) answers the user's action. Transform/opacity only, calm easing.
- `SiteShell` wraps every page in `LazyMotion features={domAnimation} strict` and `MotionConfig reducedMotion="user"`. Animate with `m.*` from `motion/react-m`; a `motion.*` component throws under `strict` and pulls the full bundle back in.
- Under reduced motion, `MotionConfig` drops transforms but keeps opacity fades; the CSS query covers the rest.

## Design system

- The arena: the page is a robotics arena floor. Tokens on `:root` in `src/index.css`: `--floor` (faint mat grid), `--ink` (black tape; white on the dark floor), `--yellow` (zones, results, the robot), `--red` (the robot's LED only). `--panel` stays black in both themes for the scoreboard. Text contrast stays at WCAG AA.
- Two families. Anybody, set extra-wide (`font-stretch` 130 to 150%) and black, is the paint on the floor: names, headings, the headline result. Instrument Sans does the reading. Sentence case, no caps labels, no mono.
- The tape lane: `.lane-pad` keeps content right of the tape. `Track` draws a serpentine tape from `[data-start]` to `[data-finish]` (hero start box or projects `h1`, footer finish line) with a station at each `[data-station]` heading. Elements that stick (project entries) use `data-station="top"` so scrolling cannot move their station. New pages need one `data-start` and the shared footer.
- Sections use `Section` (`components/ui.tsx`): heading at a station, heading text matching its nav label. Facts go in `dl.spec` rows. Competitions is the black scoreboard; Stack is a parts organiser (`.drawers`).
- The robot is decoration: keep it free of copy, labels or claims, and hidden from assistive tech.
- Each result appears once on the home page, in Competitions. The home project index shows name + `summary`.

## Components

- Pages go through `SiteShell` (skip link, nav, `main`, footer, deep-link hash scroll, motion setup).
- All copy lives in `src/data/content.ts`; components render it.
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
