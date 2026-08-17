# Language Learner

A device-only, offline-first language-learning PWA built around modular, lazily loaded first-party language packs. It currently ships with Japanese, Indonesian, Vietnamese, and Thai packs, each with practical topics, active-recall checkpoints, shared phrase study, and a pack-authored character course.

The scored checkpoints remain topic-based. Scenes organize vocabulary and dialogue study without adding extra locks, while Safety & Conditions stays permanently accessible and specialist interests remain optional.

## Local development

```sh
npm install
npm run dev
```

The development server uses Vite and serves the PWA at the local URL it prints. Keep the page open during the first load so the service worker can cache the app shell and all registered language-pack chunks. Use `npm run preview` to serve the production build locally.

Run the checks with:

```sh
npm test
npm run validate:content
npm run test:responsive
npm run build
```

`npm test` runs the jsdom/Vitest suite. `npm run validate:content` loads every registered pack and checks its IDs, locale tags, generated quiz sessions, answers, and character hierarchy. `npm run test:responsive` runs the Playwright phone and desktop checks against the Vite dev server. `npm run build` runs content validation, TypeScript, and the production Vite/PWA build.

See [Authoring language packs](docs/language-packs.md) for the pack contract, a complete minimal example, character-course structure, and validation checklist.

## GitHub Pages

Push the project to a repository whose default branch is `main`, then enable **Settings → Pages → GitHub Actions**. The workflow in `.github/workflows/deploy-pages.yml` installs with `npm ci`, runs the unit suite and production build, uploads `dist`, and deploys it with the Pages deployment action. The repository must allow GitHub Actions to write Pages deployments and use the workflow's `pages: write` and `id-token: write` permissions.

The Vite config derives the base path from `GITHUB_REPOSITORY` in GitHub Actions: a project site is served below `/<repository>/`, while an organization or user site uses `/`. To build for another host, set `BASE_PATH` to the required path, including its trailing slash. Routes use the hash fragment, so refreshing a nested screen does not require server-side fallback configuration.

## Offline data and updates

The service worker precaches the app shell and registered language-pack chunks. After the first complete online load, lessons and character practice continue without a network connection. An **Offline** badge indicates that the cached app is ready; if caching is interrupted, reconnect once and leave the app open until it finishes.

Progress is stored only in this browser's IndexedDB and is isolated by language pack and speech variant. It is not synchronized between devices. The Settings screen can reset the active language's quiz history, character progress, confidence scores, saved sessions, and tier unlocks; clearing site data or deleting the app can remove all local progress permanently.

When a new service-worker version is waiting, the app shows **Update ready**. Apply it from the notice when convenient. If a deployment appears stale, reload once while online, or use the update action before continuing offline.

The app intentionally has no account, analytics, remote fonts, or runtime network dependency.
