import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { load } from "cheerio";
import { XMLParser, XMLValidator } from "fast-xml-parser";
import MarkdownIt from "markdown-it";
import { metadata } from "./build-blog.mjs";

test("generated hero and byline hide source revision while schema keeps it", async () => {
  const sourceFiles = (await readdir("content/blog")).filter((file) =>
    file.endsWith(".md"),
  );
  assert.ok(sourceFiles.length > 0);
  for (const file of sourceFiles) {
    const source = await readFile(join("content/blog", file), "utf8");
    const slug = source.match(/^slug:\s*(.+)$/m)?.[1].trim();
    assert.ok(slug, `Front matter slug: ${file}`);
    const data = metadata(
      JSON.parse(await readFile(`blog/${slug}/meta.json`, "utf8")),
    );
    const $ = load(await readFile(`blog/${slug}/index.html`, "utf8"));
    const visibleAttribution = $(
      ".article-hero .eyebrow, .article-hero .article-byline",
    ).text();
    assert.doesNotMatch(visibleAttribution, /Source updated/i, slug);
    const schema = JSON.parse($('script[type="application/ld+json"]').text());
    assert.equal(schema.dateModified, data.updated, slug);
  }
});

test("UTF-8, metadata/schema/XML, local links, source fidelity and dropdowns", async () => {
  const slug = "taking-money-out-indonesian-company";
  const html = await readFile(`blog/${slug}/index.html`, "utf8");
  const source = await readFile(`content/blog/${slug}.md`, "utf8");
  const $ = load(html);
  assert.doesNotMatch(html, /\uFFFD|Ã.|Â.|â€|ðŸ|\{\{\w+\}\}/);
  const data = metadata(
    JSON.parse(await readFile(`blog/${slug}/meta.json`, "utf8")),
  );
  assert.equal(data.date, "2026-10-17");
  assert.equal(data.updated, "2026-10-24");
  assert.equal($("h1").text(), data.title);
  assert.equal($("article #faq").find("h3").length, 4);
  const schema = JSON.parse($('script[type="application/ld+json"]').text());
  assert.equal(schema["@context"], "https://schema.org");
  assert.equal(schema["@type"], "Article");
  assert.equal(schema.headline, data.title);
  assert.equal(schema.datePublished, data.date);
  assert.equal(schema.dateModified, data.updated);
  assert.equal(
    schema.mainEntityOfPage["@id"],
    $('link[rel="canonical"]').attr("href"),
  );
  const reference = await readFile(
    "blog/pt-pma-funding-capital-injection-loans/index.html",
    "utf8",
  );
  for (const tag of ["header", "footer"]) {
    const pattern = new RegExp(`<${tag}\\b[\\s\\S]*?<\\/${tag}>`);
    assert.equal(html.match(pattern)[0], reference.match(pattern)[0]);
  }
  const original = load(reference);
  assert.ok($("header details").length > 0);
  assert.deepEqual(
    $("header details a")
      .map((_, el) => $(el).attr("href"))
      .get(),
    original("header details a")
      .map((_, el) => original(el).attr("href"))
      .get(),
  );
  const body = source.replace(/^---[\s\S]*?\n---\r?\n/, "");
  const sourceDOM = load(new MarkdownIt().render(body));
  const normalize = (text) => text.replace(/\s+/g, " ").trim();
  sourceDOM("h1").remove();
  assert.equal(
    normalize($("article").text()),
    normalize(sourceDOM("body").text()),
  );
  const urls = (dom) =>
    dom('a[href^="https:"]')
      .map((_, el) => dom(el).attr("href"))
      .get();
  for (const url of urls(sourceDOM)) assert.ok(urls($).includes(url), url);
  const ids = $("[id]")
    .map((_, el) => $(el).attr("id"))
    .get();
  assert.equal(ids.length, new Set(ids).size);
  for (const el of $("[href], [src]").toArray()) {
    const href = $(el).attr("href") || $(el).attr("src");
    const url = new URL(href, `https://perwiravisa.com/blog/${slug}/`);
    if (url.origin !== "https://perwiravisa.com") continue;
    let path = resolve("." + decodeURIComponent(url.pathname));
    if (url.pathname.endsWith("/")) path = join(path, "index.html");
    const target = await readFile(path);
    if (url.hash)
      assert.ok(
        load(target.toString("utf8"))("[id]")
          .toArray()
          .some(
            (node) => node.attribs.id === decodeURIComponent(url.hash.slice(1)),
          ),
        href,
      );
  }
  const xml = await readFile("sitemap.xml", "utf8");
  assert.equal(XMLValidator.validate(xml), true);
  const locations = new XMLParser()
    .parse(xml)
    .urlset.url.map((entry) => entry.loc);
  assert.equal(locations.length, new Set(locations).size);
  assert.equal(
    locations.filter((url) => url === schema.mainEntityOfPage["@id"]).length,
    1,
  );
  const manifest = JSON.parse(await readFile("blog/posts.json", "utf8"));
  for (const post of manifest.posts) {
    for (const key of ["title", "description", "date", "category", "url"])
      assert.equal(typeof post[key], "string");
    assert.equal(typeof post.published, "boolean");
  }
  assert.equal(
    manifest.posts.find((post) => post.url === `/blog/${slug}/`).date,
    data.date,
  );
  assert.throws(
    () => metadata({ ...data, date: "2026-02-30" }),
    /Invalid date/,
  );
  assert.throws(() => metadata({ ...data, slug: "../escape" }), /Invalid slug/);
});

test("generated TOC anchors target sections observed by the shared scrollspy", async () => {
  const $ = load(
    await readFile(
      "blog/taking-money-out-indonesian-company/index.html",
      "utf8",
    ),
  );
  const links = $(".toc nav a");
  assert.ok(links.length > 0);
  assert.equal($("article .article-section[id]").length, links.length);
  links.each((_, link) => {
    const id = $(link).attr("href").slice(1);
    const target = $("[id]").filter((_, el) => $(el).attr("id") === id);
    assert.equal(target.length, 1, `Unique anchor: ${id}`);
    assert.ok(
      target.is("article section.article-section[id]"),
      `Scrollspy target: ${id}`,
    );
    assert.equal(target.children("h2").length, 1);
  });
});
