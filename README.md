# Language Learner

A device-only, offline-first Japanese travel-learning PWA. It organizes 16 practical topics into five trip-based collections and 48 study scenes, with 1,374 unique vocabulary records, authored dialogues, a shared essential phrase kit, and four progressively unlocked typed quiz tiers.

The scored checkpoints remain topic-based. Scenes organize vocabulary and dialogue study without adding extra locks, while Safety & Conditions stays permanently accessible and specialist interests remain optional.

## Local development

```sh
npm install
npm run dev
```

Run the checks with `npm test`, `npm run validate:content`, and `npm run build`.

## GitHub Pages

Push the project to a repository whose default branch is `main`, then enable **Settings → Pages → GitHub Actions**. The included workflow calculates the project-site base path during the Vite build, and hash routes remain reloadable from any page.

Progress is stored only in the browser's IndexedDB. Clearing site data permanently removes it. The app intentionally has no account, analytics, remote fonts, or runtime network dependency.
