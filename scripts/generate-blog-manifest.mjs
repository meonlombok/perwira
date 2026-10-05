import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, posix } from "node:path";

const blogDirectory = join(process.cwd(), "blog");
const manifestPath = join(blogDirectory, "posts.json");

const entries = await readdir(blogDirectory, { withFileTypes: true });
const posts = [];

for (const entry of entries) {
  if (!entry.isDirectory() || entry.name.startsWith(".")) continue;

  const articleDirectory = join(blogDirectory, entry.name);
  const articlePath = join(articleDirectory, "index.html");
  const metadataPath = join(articleDirectory, "meta.json");

  try {
    await readFile(articlePath, "utf8");
    const metadata = JSON.parse(await readFile(metadataPath, "utf8"));

    for (const field of ["title", "description", "date", "category"]) {
      if (!metadata[field] || typeof metadata[field] !== "string") {
        throw new Error(`Missing required "${field}" field`);
      }
    }

    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(metadata.date) ||
      Number.isNaN(Date.parse(`${metadata.date}T00:00:00Z`))
    ) {
      throw new Error("Date must use YYYY-MM-DD format");
    }

    posts.push({
      title: metadata.title.trim(),
      description: metadata.description.trim(),
      date: metadata.date,
      category: metadata.category.trim(),
      published: metadata.published !== false,
      url: posix.join("/blog", entry.name, "/"),
    });
  } catch (error) {
    throw new Error(`Invalid blog article "${entry.name}": ${error.message}`);
  }
}

posts.sort((a, b) => new Date(b.date) - new Date(a.date));
const manifest = `${JSON.stringify({ generatedAt: new Date().toISOString(), posts }, null, 2)}\n`;

await writeFile(manifestPath, manifest, "utf8");
console.log(`Generated blog/posts.json with ${posts.length} article(s).`);
