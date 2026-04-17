# Steam Store Design Lab

A Nuxt-based Steam page preview tool for mocking store art, copy, media, pricing, reviews, system requirements, and editing flows.

## License

This project is released under the MIT License. See [LICENSE](./LICENSE).

Copyright (c) 2026 EJ Fox

## Local development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Generate the static site locally:

```bash
npm run generate
```

## GitHub Pages deployment

This repo is configured for GitHub Pages using a GitHub Actions workflow in [`.github/workflows/deploy-pages.yml`](./.github/workflows/deploy-pages.yml).

What is already wired:

- static generation via `npm run generate`
- GitHub Pages-safe base path via `NUXT_APP_BASE_URL`
- `.nojekyll` support so `_nuxt/` assets are served correctly
- deploy on pushes to `main`

Expected public URL for a project repo named `steam-store-design-lab` under the `ejfox` account:

```text
https://ejfox.github.io/steam-store-design-lab/
```

If you rename the repository, the deploy workflow will still build correctly because it derives the Pages base path from the repo name.

## Notes

- This app is client-rendered (`ssr: false`) and ships as a static site.
- GitHub Pages deploys the generated contents of `.output/public`.
