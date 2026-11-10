import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = process.cwd();
const output = resolve(root, "dist");
await mkdir(output, { recursive: true });
await cp(resolve(root, "docs/app/index.html"), resolve(output, "index.html"));
await cp(resolve(root, "docs/app/app.js"), resolve(output, "app.js"));
await cp(resolve(root, "src/core.js"), resolve(output, "core.js"));
const source = await readFile(resolve(output, "index.html"), "utf8");
if (!source.includes('<script type="module" src="./app.js"></script>')) {
  throw new Error("App entry point is missing from the built HTML.");
}
console.log("Business360 web app built into dist/.");
