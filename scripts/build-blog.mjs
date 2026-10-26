import { readFile, writeFile, readdir, mkdir, access } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import MarkdownIt from "markdown-it";
import { parse, stringify } from "yaml";

const origin = "https://perwiravisa.com";
const md = new MarkdownIt({ html: false });
const escape = md.utils.escapeHtml;
const marker = "<!-- Generated from content/blog/";
const exists = async (path) =>
  access(path).then(
    () => true,
    () => false,
  );
const read = (path) => readFile(path, "utf8");
const write = (path, text) => writeFile(path, text, "utf8");
const json = (value) => JSON.stringify(value).replaceAll("<", "\\u003c");

export function metadata(value) {
  for (const field of [
    "slug",
    "title",
    "description",
    "date",
    "updated",
    "category",
  ]) {
    if (typeof value[field] !== "string" || !value[field].trim())
      throw new Error(`Invalid metadata: ${field}`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.slug))
    throw new Error("Invalid slug");
  for (const field of ["date", "updated"]) {
    const date = new Date(`${value[field]}T00:00:00Z`);
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(value[field]) ||
      !Number.isFinite(+date) ||
      date.toISOString().slice(0, 10) !== value[field]
    )
      throw new Error(`Invalid date: ${field}`);
  }
  if (value.updated < value.date || typeof value.published !== "boolean")
    throw new Error("Invalid publication metadata");
  return value;
}

// One-time extraction: retain the original shell verbatim, not a retyped approximation.
export async function importArticle(sourcePath, root = process.cwd()) {
  const templatePath = join(root, "scripts/templates/article.html");
  const sourceTarget = join(
    root,
    "content/blog/taking-money-out-indonesian-company.md",
  );
  if ((await exists(sourceTarget)) || (await exists(templatePath)))
    throw new Error("Import already exists; edit the Markdown source instead");
  let shell = await read(
    join(root, "blog/pt-pma-funding-capital-injection-loans/index.html"),
  );
  shell = shell
    .replace(
      /<title>[\s\S]*?<\/title>/,
      "<title>{{title}} | Perwira Visa</title>",
    )
    .replace(
      /(<meta (?:name="description"|property="og:description")\s+content=")[^"]*(")/g,
      "$1{{description}}$2",
    )
    .replace(/(<meta property="og:title" content=")[^"]*(")/, "$1{{title}}$2")
    .replaceAll(
      "https://perwiravisa.com/blog/pt-pma-funding-capital-injection-loans/",
      "{{url}}",
    )
    .replace(/<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/g, "")
    .replace(
      "</head>",
      '<script type="application/ld+json">{{schema}}</script>\n</head>',
    )
    .replace(
      /(<p class="eyebrow">)[\s\S]*?(<\/p>)/,
      "$1{{category}} · Published {{date}} · Source updated {{updated}}$2",
    )
    .replace(/<h1>[\s\S]*?<\/h1>/, "<h1>{{title}}</h1>");
  const mainStart = shell.indexOf("<main");
  const heroEnd = shell.indexOf("</section>", mainStart);
  const hero = shell
    .slice(mainStart, heroEnd)
    .replace(
      /(<p class="(?:lead|lede)">)[\s\S]*?(<\/p>)/,
      "$1{{description}}$2",
    );
  shell = shell.slice(0, mainStart) + hero + shell.slice(heroEnd);
  const tocStart = shell.indexOf("<nav>", shell.indexOf('<aside class="toc"'));
  const tocEnd = shell.indexOf("</nav>", tocStart);
  shell = shell.slice(0, tocStart) + "<nav>{{toc}}" + shell.slice(tocEnd);
  const bodyStart =
    shell.indexOf('<article class="article">') +
    '<article class="article">'.length;
  const bodyEnd = shell.indexOf("</article>", bodyStart);
  shell =
    shell.slice(0, bodyStart) + "\n{{body}}\n      " + shell.slice(bodyEnd);
  // Keep the CTA layout, replacing only the previous article's topic-specific text.
  shell = shell.replace(
    "Structure your company funding clearly from day one.",
    "Plan your company payments with clear documentation.",
  );
  shell = shell
    .replace(
      '<span aria-current="page">PT PMA Funding</span>',
      '<span aria-current="page">{{title}}</span>',
    )
    .replace(
      /<p class="article-byline">[\s\S]*?<\/p>/,
      '<p class="article-byline">By Perwira Visa · General information; obtain advice for your circumstances.</p>',
    );
  const source = await read(sourcePath);
  const title = source.match(/^# (.+)/)?.[1];
  if (!title) throw new Error("Expected a Markdown H1");
  const data = metadata({
    slug: "taking-money-out-indonesian-company",
    title,
    description:
      "Understand salary, director fees, dividends, reimbursements and shareholder-loan repayments when taking money out of an Indonesian PT PMA.",
    date: "2026-10-17",
    updated: "2026-10-24",
    category: "Business & Compliance",
    published: true,
  });
  await mkdir(join(root, "scripts/templates"), { recursive: true });
  await mkdir(join(root, "content/blog"), { recursive: true });
  await write(templatePath, shell);
  await write(sourceTarget, `---\n${stringify(data)}---\n\n${source}`);
}

function render(source, data) {
  const tokens = md.parse(source, {});
  if (
    tokens[0]?.type !== "heading_open" ||
    tokens[0].tag !== "h1" ||
    tokens[1].content !== data.title
  )
    throw new Error("Source H1 must match title");
  tokens.splice(0, 3);
  const seen = new Set();
  const toc = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token.type !== "heading_open") continue;
    const text = tokens[i + 1].content;
    const base =
      text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "") || "section";
    let id = base;
    for (let n = 2; seen.has(id); n++) id = `${base}-${n}`;
    seen.add(id);
    token.attrSet("id", id);
    if (token.tag === "h2") toc.push(`<a href="#${id}">${escape(text)}</a>`);
  }
  let body = md.renderer.render(tokens, md.options, {});
  body = body
    .replace(
      /<table>/g,
      '<div class="table-wrap"><table class="comparison-table">',
    )
    .replace(/<\/table>/g, "</table></div>");
  body = body.replace(
    /<h2 id="([^"]+)">/g,
    '</section><section class="article-section" id="$1"><h2>',
  );
  body = '<section class="article-section">' + body + "</section>";
  return { body, toc: toc.join("") };
}

export async function build(root = process.cwd()) {
  const directory = join(root, "content/blog");
  const template = await read(join(root, "scripts/templates/article.html"));
  const planned = [];
  const slugs = new Set();
  for (const file of (await readdir(directory))
    .filter((name) => name.endsWith(".md"))
    .sort()) {
    const source = await read(join(directory, file));
    const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
    if (!match) throw new Error(`Missing front matter: ${file}`);
    const data = metadata(parse(match[1]));
    if (slugs.has(data.slug)) throw new Error(`Duplicate slug: ${data.slug}`);
    slugs.add(data.slug);
    const target = join(root, "blog", data.slug);
    const ownership = `${marker}${file} -->`;
    if (await exists(target)) {
      if (
        !(await exists(join(target, "index.html"))) ||
        !(await read(join(target, "index.html"))).startsWith(ownership)
      )
        throw new Error(`Refusing to overwrite existing article: ${data.slug}`);
    }
    const url = `${origin}/blog/${data.slug}/`;
    const rendered = render(match[2], data);
    const schema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `${url}#article`,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
      headline: data.title,
      description: data.description,
      datePublished: data.date,
      dateModified: data.updated,
      author: { "@type": "Organization", name: "Perwira Visa" },
      publisher: { "@type": "Organization", name: "Perwira Visa" },
    };
    const values = {
      ...Object.fromEntries(
        Object.entries(data)
          .filter(([, v]) => typeof v === "string")
          .map(([k, v]) => [k, escape(v)]),
      ),
      url,
      ...rendered,
      schema: json(schema),
    };
    const html =
      `${ownership}\n` +
      template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
        if (!(key in values)) throw new Error(`Unknown template token: ${key}`);
        return values[key];
      });
    planned.push({ target, html, data, url });
  }
  let sitemap = await read(join(root, "sitemap.xml"));
  if (!sitemap.includes("</urlset>")) throw new Error("Invalid sitemap");
  for (const { target, html, data, url } of planned) {
    await mkdir(target, { recursive: true });
    await write(join(target, "index.html"), html);
    await write(
      join(target, "meta.json"),
      JSON.stringify(data, null, 2) + "\n",
    );
    if (data.published && !sitemap.includes(`<loc>${url}</loc>`))
      sitemap = sitemap.replace(
        "</urlset>",
        `  <url>\n    <loc>${url}</loc>\n  </url>\n</urlset>`,
      );
  }
  await write(join(root, "sitemap.xml"), sitemap);
  // Reuse the site's existing manifest implementation, including legacy metadata.
  const { spawnSync } = await import("node:child_process");
  const result = spawnSync(
    process.execPath,
    [fileURLToPath(new URL("./generate-blog-manifest.mjs", import.meta.url))],
    { cwd: root, encoding: "utf8" },
  );
  if (result.status !== 0) throw new Error(result.stderr || result.stdout);
  console.log(result.stdout.trim());
  console.log(`Built ${planned.length} Markdown article(s).`);
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  if (process.argv[2] === "--import")
    await importArticle(resolve(process.argv[3]));
  else await build();
}
