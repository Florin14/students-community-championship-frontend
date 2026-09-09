# CLAUDE.md — SCC Frontend

Vite + React 18 + TypeScript single-page app for the students' minifootball
championship: a public area anyone can browse, and a secured area at `/admin`
where operators score matches live from their phones.

## Commands

```bash
npm install
cp .env.example .env          # VITE_API_URL, defaults to http://localhost:8000/
npm run dev                   # dev server
npm run type-check            # tsc --noEmit — must pass before every commit
npm run lint
npm run build                 # type-check + production build
```

## Architecture

```
src/
  api/config.ts        the single axios instance; attaches the bearer token
  components/          Layout, RequireAuth, GlobalSnackbar
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
- **Fonts:** Sora for headings and labels, Manrope for body.
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
- **A goal takes two taps** (team, then scorer), a card three. The minute is
  filled from the running clock and only edited when wrong.
- Every action is queued locally in `scc_event_queue` with a client-generated
  UUID before it is sent, and retried when the connection returns. Each event
  shows its own state: saved, pending, failed.
- Undo is always visible and voids the last action rather than deleting it.
- Operators only ever see the matches assigned to them.

When touching this screen, test it throttled and offline — that is its real
operating condition.
