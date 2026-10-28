# tanakasande — portfolio

Personal site of Tanaka Sande, designer. Astro, plain JS, self-hosted fonts, deployed on Netlify.

## Run it

```
npm install
npm run dev      # http://localhost:4321
npm run build    # static site in dist/
```

## Add a project

1. Create `src/content/work/<slug>.mdx` (copy `revere.mdx` as a template).
2. Fill the frontmatter: `code` (TS–00x), `title`, `year`, `discipline`, `client`, `summary`, `status`, `order`, `cover`.
3. `status: "pending"` lists it in the index without a page. Switch to `"live"` when the case study is written.
4. Images go in `public/img/` as `.webp` (about 1400 px wide, plus a `-sm` copy about 640 px).

## Structure

- `src/pages/index.astro` — home: name, statement, object study, index, about, contact
- `src/pages/work/[...slug].astro` — a project file, rendered from its MDX
- `src/components/` — section, archive index, object study, REVERE plates and motion
- `src/lib/revere-svg.ts` — prepares REVERE's drawings for animation
- `public/motion.js` — the motion engine (each piece renders from one time value)
- `src/styles/global.css` — the whole design system, tokens at the top

## Deploy

Hosted on Cloudflare Pages: tanakasande.pages.dev. Build command `npm run build`, output directory `dist`, Node version from `.node-version`. Every push to `main` redeploys.
