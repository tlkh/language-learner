# Language Learner

A device-only, offline-first language-learning PWA built around modular, lazily loaded first-party language packs. Japanese is the only currently installed pack. It includes 16 practical topics, five trip-based collections, 48 study scenes, 1,389 unique vocabulary records, four typed quiz tiers, and a 214-unit hiragana and katakana course.

The scored checkpoints remain topic-based. Scenes organize vocabulary and dialogue study without adding extra locks, while Safety & Conditions stays permanently accessible and specialist interests remain optional.

## Local development

```sh
npm install
npm run dev
```

Run the checks with `npm test`, `npm run validate:content`, `npm run test:responsive`, and `npm run build`.

See [Authoring language packs](docs/language-packs.md) for the pack contract, a complete minimal example, character-course structure, validation checklist, and guidance for future Indonesian, Vietnamese, and Thai content.

## GitHub Pages

Push the project to a repository whose default branch is `main`, then enable **Settings → Pages → GitHub Actions**. The included workflow calculates the project-site base path during the Vite build, and hash routes remain reloadable from any page.

Progress is stored only in the browser's IndexedDB. Clearing site data permanently removes it. The app intentionally has no account, analytics, remote fonts, or runtime network dependency.
