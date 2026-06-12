# Contributing to KoalaShip

Thanks for helping improve KoalaShip. Contributions should support its central
idea: a playful but believable shopping simulation without real purchases,
debt or manipulative commerce patterns.

## Good Contributions

- Bug fixes and accessibility improvements
- Better mobile and keyboard support
- New fictional products, reviews or satire headlines
- Translation corrections
- Performance and local-storage improvements
- Realistic shopping, delivery and unboxing details
- Focused tests for store and pricing logic

Avoid features based on debt, gambling, paid currency, fake urgency, daily
chores or intentionally frustrating progression.

## Development Workflow

1. Fork and clone the repository.
2. Create a focused branch.
3. Install dependencies with `npm ci`.
4. Make the smallest coherent change.
5. Run `npm run check` and `npm run build`.
6. Describe behavior changes and manual testing in the pull request.

Do not include unrelated formatting or generated-file churn. The repository
currently commits `dist/`, so rebuild it when application code changes.

## Code Style

- Follow the existing Svelte 5 and TypeScript patterns.
- Prefer typed data structures over loosely shaped objects.
- Keep game state backward compatible where practical.
- Store expandable editorial content in JSON under `src/data/`.
- Respect `prefers-reduced-motion`.
- Use semantic buttons, labels and visible keyboard focus.
- Keep external requests behind the existing same-origin proxy paths.

## Adding News Ticker Entries

Edit `src/data/news-ticker.json`:

```json
{
  "id": "unique-short-id",
  "category": "delivery",
  "text": "A clearly fictional satirical headline.",
  "weight": 2,
  "requires": "OUT_FOR_DELIVERY"
}
```

`requires` is optional. Supported values are documented in
`src/components/NewsTicker.svelte`. Headlines must be unmistakably fictional,
must not target private individuals and should stay relevant to shopping,
delivery, products or e-commerce.

## Pull Requests

Include:

- What changed
- Why it belongs in KoalaShip
- How it was verified
- Screenshots for visible UI changes
- Any migration or local-storage considerations

Small, reviewable pull requests are preferred.
