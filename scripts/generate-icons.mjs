// Generates PWA PNG icons (no external dependencies) from a simple vector design:
// a dark rounded square, a primary-blue disc, and a white "play" triangle.
// Run with: node scripts/generate-icons.mjs
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');

const BG = [11, 15, 25]; // #0b0f19
const DISC = [59, 130, 246]; // #3b82f6
const FG = [255, 255, 255]; // #ffffff

/** CRC-32 table + helper for PNG chunk checksums. */
const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([length, body, crc]);
}

function encodePng(size, pixels) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // colour type RGBA
  // compression, filter, interlace all 0

  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }

  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

function drawIcon(size, { maskable }) {
  const pixels = Buffer.alloc(size * size * 4);
  const radius = maskable ? size : size * 0.22; // full-bleed for maskable
  const disc = size * 0.34;
  const cx = size / 2;
  const cy = size / 2;

  const set = (x, y, [r, g, b]) => {
    const i = (y * size + x) * 4;
    pixels[i] = r;
    pixels[i + 1] = g;
    pixels[i + 2] = b;
    pixels[i + 3] = 255;
  };

  const inRoundedSquare = (x, y) => {
    const rx = Math.max(radius - x, x - (size - 1 - radius), 0);
    const ry = Math.max(radius - y, y - (size - 1 - radius), 0);
    return rx * rx + ry * ry <= radius * radius;
  };

  // Play triangle geometry.
  const tLeft = cx - size * 0.11;
  const tRight = cx + size * 0.17;
  const tTop = cy - size * 0.17;
  const tBottom = cy + size * 0.17;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      if (!inRoundedSquare(x, y)) {
        continue; // leave transparent outside the rounded square
      }
      let colour = BG;
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= disc * disc) {
        colour = DISC;
      }
      // Triangle test (pointing right).
      if (x >= tLeft && x <= tRight) {
        const t = (x - tLeft) / (tRight - tLeft);
        const halfHeight = ((tBottom - tTop) / 2) * (1 - t);
        if (Math.abs(y - cy) <= halfHeight) {
          colour = FG;
        }
      }
      set(x, y, colour);
    }
  }
  return pixels;
}

mkdirSync(outDir, { recursive: true });

const targets = [
  { name: 'icon-192.png', size: 192, maskable: false },
  { name: 'icon-512.png', size: 512, maskable: false },
  { name: 'icon-512-maskable.png', size: 512, maskable: true }
];

for (const { name, size, maskable } of targets) {
  const png = encodePng(size, drawIcon(size, { maskable }));
  writeFileSync(join(outDir, name), png);
  console.log(`wrote ${name} (${png.length} bytes)`);
}
