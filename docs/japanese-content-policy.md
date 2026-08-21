# Japanese content policy

The Japanese pack is designed as a practical beginner course for travel and everyday interactions. Its learning order follows task-based “Can-do” goals: first understand a useful form, then recall it, then choose it in a realistic exchange.

## Teaching policy

- Polite Japanese (`です` / `ます`) is the production target for lessons and checkpoints.
- Casual forms appear only as recognition notes where an authored alternative exists.
- Kanji forms are paired with kana readings. Romaji is limited to the dedicated kana reference and drill.
- Every topic word remains available and is included in the recognition and recall question pools. `must-know`, `useful`, and `reference` change the default study order, not assessment eligibility.
- Optional specialist tracks remain open and are not prerequisites for the main travel path.
- Each checkpoint contains 10 questions and passes at 8 correct answers.
- In-context questions are built only from the authored dialogue corpus; generic slot-template sentences are not used for Japanese assessment.

## Reference framework

- [JF Standard for Japanese-Language Education](https://www.jfstandard.jpf.go.jp/summaryen/ja/render.do) — task-based Can-do objectives and communication in real situations.
- [JF Standard course and assessment design](https://www.jfstandard.jpf.go.jp/course/ja/render.do) — alignment among course goals, lessons, and assessment.
- [Irodori: Japanese for Life in Japan, Starter guidance](https://www.irodori.jpf.go.jp/assets/data/starter/pdf/X_howto_en.pdf) — beginner, situation-based learning for daily life in Japan.
- [Irodori Starter table of contents](https://www.irodori.jpf.go.jp/assets/data/starter/pdf/X_contents_en.pdf) — reference for A1 communicative situations and sequencing.

These sources guide the curriculum and assessment model. The app’s vocabulary, dialogue, translations, and readings are maintained as original project content and must be reviewed in context rather than copied from a reference work.

## Release checks

`npm run validate:content` verifies the complete Japanese catalog, reading coverage for polite dialogue, checkpoint sizes and pass scores, four unique choices, full vocabulary assessment coverage, and authored-dialogue provenance for in-context answers.
