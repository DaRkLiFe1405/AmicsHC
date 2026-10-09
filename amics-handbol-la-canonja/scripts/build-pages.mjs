import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const distRoot = resolve(projectRoot, "dist");
if (dirname(distRoot) !== projectRoot || distRoot === projectRoot) {
  throw new Error(`Refusing to write output outside this project: ${distRoot}`);
}

const sourcePage = await readFile(resolve(projectRoot, "site/index.html"), "utf8");
function replaceOnce(source, from, to) {
  const first = source.indexOf(from);
  if (first < 0 || source.indexOf(from, first + from.length) >= 0) {
    throw new Error(`Expected exactly one occurrence of ${JSON.stringify(from)}`);
  }
  return `${source.slice(0, first)}${to}${source.slice(first + from.length)}`;
}

let page = replaceOnce(sourcePage, 'src="/images/ascenso_ahcjpeg.jpeg"', 'src="./images/ascenso_ahcjpeg.jpeg"');
page = replaceOnce(
  page,
  'fetch(force ? "/api/data?refresh=1" : "/api/data", { cache: "no-store" })',
  'fetch(force ? "./api/data.json?refresh=1" : "./api/data.json", { cache: "no-store" })',
);

const workerPath = resolve(distRoot, "server/index.js");
const { default: worker } = await import(pathToFileURL(workerPath).href);
const response = await worker.fetch(new Request("https://amics-hc.invalid/api/data"), {}, {});
if (!response.ok) throw new Error(`Could not fetch club data for the Pages snapshot (${response.status})`);
const data = await response.json();
if (!Array.isArray(data.teams)) throw new Error("The data endpoint returned an invalid payload");

await Promise.all([
  mkdir(resolve(distRoot, "api"), { recursive: true }),
  mkdir(resolve(distRoot, "images"), { recursive: true }),
]);
await Promise.all([
  writeFile(resolve(distRoot, "index.html"), page, "utf8"),
  writeFile(resolve(distRoot, "api/data.json"), `${JSON.stringify(data)}\n`, "utf8"),
  writeFile(
    resolve(distRoot, "images/ascenso_ahcjpeg.jpeg"),
    await readFile(resolve(projectRoot, "site/ascenso_ahcjpeg.jpeg")),
  ),
  writeFile(resolve(distRoot, ".nojekyll"), ""),
]);
console.log(`Built GitHub Pages snapshot in ${distRoot}`);
