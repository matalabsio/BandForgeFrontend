/**
 * Regenerate favicons from frontend/favi.png.
 * Run: npm run sync:favicons
 */
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "favi.png");
const targets = [path.join(root, "app"), path.join(root, "public")];

async function makeSquareIcon(size, filename) {
  const buffer = await sharp(source)
    .resize({ width: size, height: size, fit: "cover", position: "center" })
    .png()
    .toBuffer();

  await Promise.all(
    targets.map((dir) => sharp(buffer).toFile(path.join(dir, filename))),
  );
}

await makeSquareIcon(32, "icon.png");
await makeSquareIcon(180, "apple-icon.png");
console.log("Favicons updated from favi.png");
