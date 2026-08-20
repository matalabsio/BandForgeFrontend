/**
 * Regenerate favicons and PWA icons from the brand logo.
 * Source priority: favi.png (transparent meter) → logo.png → Group 103.png → modules/listening/img/logo.png
 * Run: npm run sync:favicons
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const targets = [path.join(root, "app"), path.join(root, "public")];

const candidates = [
  path.join(root, "favi.png"),
  path.join(root, "logo.png"),
  path.join(root, "Group 103.png"),
  path.join(root, "modules/listening/img/logo.png"),
  path.join(root, "pwa-icon-source.svg"),
];

const source = candidates.find((candidate) => fs.existsSync(candidate));
if (!source) {
  throw new Error("No favicon source found (favi.png, logo.png, or pwa-icon-source.svg)");
}

async function makeSquareIcon(size, filename) {
  const buffer = await sharp(source)
    .resize({
      width: size,
      height: size,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await Promise.all(
    targets.map((dir) => sharp(buffer).toFile(path.join(dir, filename))),
  );
}

await makeSquareIcon(32, "icon.png");
await makeSquareIcon(180, "apple-icon.png");
await makeSquareIcon(192, "icon-192.png");
await makeSquareIcon(512, "icon-512.png");
console.log(`Favicons updated from ${path.basename(source)}`);
