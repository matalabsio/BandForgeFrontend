/**
 * Regenerate app/icon.png and app/apple-icon.png from modules/listening/img/logo.png.
 * Run: node scripts/sync-favicons.mjs
 */
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const logo = path.join(root, "modules/listening/img/logo.png");
const appDir = path.join(root, "app");

async function makeSquareIcon(size, filename) {
  const padding = Math.max(2, Math.round(size * 0.1));
  const inner = size - padding * 2;
  const resized = await sharp(logo)
    .resize({ width: inner, height: inner, fit: "inside" })
    .png()
    .toBuffer();
  const meta = await sharp(resized).metadata();
  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([
      {
        input: resized,
        left: Math.round((size - meta.width) / 2),
        top: Math.round((size - meta.height) / 2),
      },
    ])
    .png()
    .toFile(path.join(appDir, filename));
}

await makeSquareIcon(32, "icon.png");
await makeSquareIcon(180, "apple-icon.png");
console.log("Favicons updated from logo.png");
