# Markdown blog workflow

Requires Node.js 24+. Install locked dependencies with `npm ci`.

1. Add `content/blog/<slug>.md`, using the existing source as the front-matter example: `slug`, `title`, `description`, `date` (publication), `updated` (source revision), `category`, and boolean `published`. Quote ISO dates and match the Markdown H1 to `title`. Save as UTF-8.
2. Use H2 sections, H3 questions, standard Markdown tables and links; raw HTML is disabled.
3. Run `npm run build`, then `npm test`.
4. Review and publish the source and generated `blog/<slug>/index.html`, `meta.json`, `blog/posts.json`, and `sitemap.xml` together. No runtime framework is deployed.

The fixed `scripts/templates/article.html` shell was extracted from the funding article; header/footer remain byte-for-byte identical. Ordinary builds never read that legacy page as a template.

Only source-owned pages bearing the matching generator marker can be regenerated. Existing articles without that marker are refused, even if a source uses their slug. Do not rename a source file without intentionally migrating its ownership marker. Source removal does not delete published pages or sitemap entries; removal requires editorial review. Sitemap additions preserve existing entries. `published: false` omits new sitemap entries and marks the manifest item unpublished; it does not make the generated URL private.

The one-time import command is `node scripts/build-blog.mjs --import <absolute-markdown-path>`; it refuses existing source/template files. Subsequent articles are authored directly in `content/blog`, without importing or rebuilding the shell.

Tests cover repeat output (except manifest `generatedAt`), legacy overwrite refusal, metadata/Article JSON-LD fields, XML, UTF-8, local links/anchors, source text/link preservation, four FAQs, and exact navigation/footer reuse. They do not independently verify legal claims, external source availability, or browser interaction. The imported article was published 2026-10-17; its supplied source says updated 2026-10-24.
