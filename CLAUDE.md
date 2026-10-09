# CLAUDE.md — SCC Frontend

Vite + React 18 + TypeScript single-page app for the students' minifootball
championship: a public area anyone can browse, and a secured area at `/admin`
where operators score matches live from their phones.

## Commands

```bash
npm install
cp .env.template .env         # VITE_API_URL, defaults to http://localhost:8000/
npm run dev                   # dev server
npm run type-check            # tsc --noEmit — must pass before every commit
npm run lint
npm run build                 # type-check + production build

# The built bundle behind nginx, exactly as it deploys (:3000)
docker compose up -d --build
docker compose -f docker-compose.yml up -d   # deployed shape: no ports, no mounts
```

## API base URL

Resolved in `src/api/config.ts`, most specific first:

1. `window.__SCC_CONFIG__.API_URL` from `/runtime-config.js`, written by the
   container at start-up from `API_URL` — this is what lets one image serve
   every environment.
2. `VITE_API_URL`, inlined at build time — `npm run dev` and static hosts.
3. `http://localhost:8000/`.

Adding a runtime setting means touching four places: `docker/40-runtime-config.sh`,
`env.yml`, the `SccRuntimeConfig` interface in `src/vite-env.d.ts`, and
`.env.template`.

## Architecture

```
src/
  api/config.ts        the single axios instance; attaches the bearer token
  components/          Layout (header only), DashboardBand (stats, hero, the ONE
                       row of NavTabs), RequireRole, GlobalSnackbar
    reusable/          shared presentational pieces (MatchCard, TeamBadge, StatCard…)
  i18n/                flat-key dictionaries; t(language, key)
  pages/               one file per public page
    admin/             admin panel, sections/ and modals/
    live/              the operator scoring console
  store/
    slices/            one Redux Toolkit slice per feature
      thunks/          async thunks, one file per feature
  types/               TS mirrors of the API payloads
  utils/               dateFormat, images, storageKeys, offline queue
```

## Conventions

- **Styling is styled-components first**, MUI second. Colors come from CSS
  variables (`--bg-*`, `--text-*`, `--accent`), defined in `index.css` and
  switched by the `data-theme` attribute. Never hardcode a hex in a component.
- **Fonts:** Chivo for headings and labels, Space Grotesk for body — through
  `var(--font-heading)` / `var(--font-body)`, never a literal family name.
- **Palette** (from the client's sheet): primary orange `#FF6B00` (`--accent`),
  secondary purple `#7928CA` (`--secondary`), tertiary violet `#8B5CF6`
  (`--violet`), neutral plum `#120524` as the dark background. Green/amber/red
  (`--success` / `--warning` / `--danger`) are reserved for W/D/L and +/-.
- **i18n:** every user-facing string goes through `t(language, "some.key")` with
  the key added to both `i18n/ro.ts` and `i18n/en.ts`. Romanian is the default.
- **State:** server data lives in slices, fetched by thunks in
  `store/slices/thunks/`. Components read through `useAppSelector` and never
  call axios directly.
- **Dates** are displayed as `DD.MM.YYYY` via `utils/dateFormat.ts`.
- **Storage keys** are centralised in `utils/storageKeys.ts` (`scc_auth`,
  `scc_theme`, `scc_lang`, `scc_event_queue`).
- Every page handles three states explicitly: loading, empty, error.

## The operator console

`/admin/live/:matchId` is the most important screen in the product and has
different design rules from the rest of the app:

- It is built for a phone held in one hand, outdoors, at arm's length. Touch
  targets are large; nothing important sits below the fold.
- **Goals:** choose the scorer, review the optional teammate assist, then tap
  Save goal. Player selections keep the draft open until it is saved. Cards
  and own goals keep direct entry. The minute follows the running clock unless
  the operator explicitly corrects it.
- Every action is queued locally in `scc_event_queue` with a client-generated
  UUID before it is sent, and retried when the connection returns. Each event
  shows its own state: saved, pending, failed.
- Undo is always visible and voids the last action rather than deleting it.
- Operator is the sole stadium staff role and may score any open match and
  confirm attendance. Assignments record responsibility without restricting access.
  Former Volunteer accounts migrate to Operator; stored browser sessions keep
  their account and token while updating the legacy role to Operator.
- Admins and super-admins may score any open match; competition
  administration remains restricted to admins. Audience is optional (unknown
  is null, zero is valid), saved online before the result is locked.

Player photos are required when an admin creates or saves a player. The modal
must show a readable image before enabling Save, including for legacy players.

Player QR images encode an absolute link to the public player profile on the
frontend origin. The signed attendance credential and season travel in the URL
fragment; never render the raw JWT as the QR payload or put it in a query string.
Profile links continue to attendance; login preserves pathname, search and hash.
Attendance selects the credential season and verifies against the chosen match
before explicit identity confirmation. Camera/image/manual scans accept both
new profile links and legacy token-only cards. Re-download existing QR images
after deploying this change; viewing a credential does not regenerate it.

Attendance totals belong to each match and are shown in match cards/details,
including counts for each team. The season total counts check-ins, not unique
people. The home band shows total spectators instead of a global check-in count.
Audience statistics count finished matches with recorded numbers only; zero
is a known value and null is unknown. Request IDs prevent stale audience results
from replacing the selected season's response.

Staff see an in-app reminder after each full hour of playing time while the
clock still runs. Reminders poll once a minute when the app is visible and
online; they never finish or pause a match automatically. Dismissal is stored
per account, match kickoff and playing-hour bucket, so reloading does not repeat
it in the same hour. Paused and locked matches are ignored.

When touching this screen, test it throttled and offline — that is its real
operating condition.

Match details show active events beneath the corresponding team and compare
goals, assists, cards and check-ins in the statistics section. Match listings
use a single full-width card per row. Team squads group players by position,
including a group for legacy players without a position.

Teams have separate optional university and faculty fields. New match forms
default to the selected/active season and the current local date/time. Rounds
are weekly from the season start using calendar days (not 24-hour durations);
manual round overrides survive date changes until the user requests recalculation.
Field and location remain explicit choices.

Seasons may have an editable calendar of inclusive date ranges, phase labels,
optional round numbers and breaks. A configured calendar takes priority over
weekly arithmetic. No range, a break, or an unnumbered phase produces no
automatic round; manual overrides remain available for rescheduled matches.
The 24-period 2026–2027 template mirrors the organiser's image, including its
repeated knockout names; apply it explicitly in the season editor and save.
Public match lists show the calendar and group unnumbered phases by their
calendarLabel. Calendar edits do not modify the rounds/results of existing matches.

Event entry follows the shared live clock until manual correction is selected.
Corrections affect the recorded event only; returning to the scorer step keeps
the draft and assist choice. Clock interpolation anchors reset on every server
clock response so scoring and lifecycle changes never count elapsed time twice.
