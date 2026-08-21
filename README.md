# Language Learner

A device-only, offline-first language-learning PWA built around modular, lazily loaded first-party language packs. It currently ships with Japanese, Indonesian, Vietnamese, and Thai packs, each with practical topics, active-recall checkpoints, shared phrase study, and a pack-authored character course.

The scored checkpoints remain topic-based. Scenes organize vocabulary and dialogue study without adding extra locks, while Safety & Conditions stays permanently accessible and specialist interests remain optional.

## Local development

```sh
npm install
npm run dev
```

Run the checks with `npm test`, `npm run validate:content`, `npm run test:responsive`, and `npm run build`.

See [Authoring language packs](docs/language-packs.md) for the pack contract, a complete minimal example, character-course structure, and validation checklist. The [Japanese content policy](docs/japanese-content-policy.md) records its beginner teaching model, reference framework, and release checks.

## GitHub Pages

Push the project to a repository whose default branch is `main`, then enable **Settings → Pages → GitHub Actions**. The included workflow calculates the project-site base path during the Vite build, and hash routes remain reloadable from any page.

Progress is stored only in the browser's IndexedDB. Clearing site data permanently removes it. The app intentionally has no account, analytics, remote fonts, or runtime network dependency.
