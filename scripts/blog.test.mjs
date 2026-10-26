import "./blog-validation.test.mjs";
import test from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  cp,
  readFile,
  writeFile,
  rm,
  readdir,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { build } from "./build-blog.mjs";

test("source-only build is repeatable and protects legacy articles", async () => {
  const root = await mkdtemp(join(tmpdir(), "perwira-blog-"));
  try {
    for (const path of [
      "blog",
      "content",
      "scripts/templates",
      "sitemap.xml",
    ]) {
      await cp(resolve(path), join(root, path), { recursive: true });
    }
    const legacy = await readFile(
      join(root, "blog/pt-pma-funding-capital-injection-loans/index.html"),
    );
    await build(root);
    const snapshot = async () => {
      const result = {};
      for (const entry of await readdir(join(root, "blog"), {
        withFileTypes: true,
      })) {
        if (entry.isDirectory())
          for (const file of ["index.html", "meta.json"]) {
            result[`${entry.name}/${file}`] = await readFile(
              join(root, "blog", entry.name, file),
              "utf8",
            );
          }
      }
      result.sitemap = await readFile(join(root, "sitemap.xml"), "utf8");
      const manifest = JSON.parse(
        await readFile(join(root, "blog/posts.json"), "utf8"),
      );
      delete manifest.generatedAt;
      result.manifest = manifest;
      return result;
    };
    const first = await snapshot();
    await build(root);
    assert.deepEqual(await snapshot(), first);
    assert.deepEqual(
      await readFile(
        join(root, "blog/pt-pma-funding-capital-injection-loans/index.html"),
      ),
      legacy,
    );
    const source = await readFile(
      join(root, "content/blog/taking-money-out-indonesian-company.md"),
      "utf8",
    );
    await writeFile(
      join(root, "content/blog/collision.md"),
      source.replace(
        "slug: taking-money-out-indonesian-company",
        "slug: pt-pma-funding-capital-injection-loans",
      ),
      "utf8",
    );
    await assert.rejects(build(root), /Refusing to overwrite/);
    assert.deepEqual(
      await readFile(
        join(root, "blog/pt-pma-funding-capital-injection-loans/index.html"),
      ),
      legacy,
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
