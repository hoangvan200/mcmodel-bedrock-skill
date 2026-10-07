const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const FALLBACK_COLOR = [138, 138, 138];

function hexToRgb(hex) {
  if (typeof hex !== "string") {
    return FALLBACK_COLOR.slice();
  }
  const text = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(text)) {
    return FALLBACK_COLOR.slice();
  }
  return [parseInt(text.slice(0, 2), 16), parseInt(text.slice(2, 4), 16), parseInt(text.slice(4, 6), 16)];
}

function createRng(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clampChannel(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function setPixel(png, x, y, color, factor) {
  if (x < 0 || y < 0 || x >= png.width || y >= png.height) {
    return;
  }
  const offset = (png.width * y + x) * 4;
  png.data[offset] = clampChannel(color[0] * factor);
  png.data[offset + 1] = clampChannel(color[1] * factor);
  png.data[offset + 2] = clampChannel(color[2] * factor);
  png.data[offset + 3] = 255;
}

function paintFace(png, rect, color, shade, style, rng) {
  const left = rect[0];
  const top = rect[1];
  const width = rect[2];
  const height = rect[3];

  for (let py = 0; py < height; py += 1) {
    for (let px = 0; px < width; px += 1) {
      let factor = shade;
      
      // Base subtle noise to prevent the flat plastic look
      const baseNoise = 0.94 + rng() * 0.12;

      if (style === "noise") {
        factor *= 0.82 + rng() * 0.36; // stronger noise
      } else if (style === "bordered") {
        factor *= baseNoise;
        const edge = px === 0 || py === 0 || px === width - 1 || py === height - 1;
        if (edge) {
          factor *= 0.72;
        }
      } else if (style === "shaded") {
        factor *= baseNoise;
        const t = height > 1 ? py / (height - 1) : 0;
        factor *= 1.12 - 0.24 * t;
      } else {
        // solid style or default
        factor *= baseNoise;
      }

      // Add RGB channel shift for dithering (shifting nearby colors)
      const colorShiftR = (rng() - 0.5) * 10;
      const colorShiftG = (rng() - 0.5) * 10;
      const colorShiftB = (rng() - 0.5) * 10;
      
      const finalColor = [
        color[0] + colorShiftR,
        color[1] + colorShiftG,
        color[2] + colorShiftB
      ];

      setPixel(png, left + px, top + py, finalColor, factor);
    }
  }
}

function faceLayout(u, v, w, h, d) {
  return [
    { rect: [u + d, v, w, d], shade: 1.15 },
    { rect: [u + d + w, v, w, d], shade: 0.65 },
    { rect: [u, v + d, d, h], shade: 0.85 },
    { rect: [u + d, v + d, w, h], shade: 1.0 },
    { rect: [u + d + w, v + d, d, h], shade: 0.85 },
    { rect: [u + 2 * d + w, v + d, w, h], shade: 0.9 }
  ];
}

function paintTexture(options) {
  const width = options.width;
  const height = options.height;
  const records = options.cubeRecords || [];

  if (!Number.isInteger(width) || !Number.isInteger(height) || width <= 0 || height <= 0) {
    throw new Error("Texture width and height must be positive integers");
  }

  const png = new PNG({ width, height });
  png.data.fill(0);

  records.forEach((record) => {
    const material = record.material || {};
    const color = hexToRgb(material.color);
    const style = material.style || "shaded";
    const u = record.uv[0];
    const v = record.uv[1];
    const w = record.size[0];
    const h = record.size[1];
    const d = record.size[2];

    faceLayout(u, v, w, h, d).forEach((face, faceIndex) => {
      const rng = createRng(record.index * 7919 + faceIndex * 104729 + 12345);
      paintFace(png, face.rect, color, face.shade, style, rng);
    });
  });

  return PNG.sync.write(png);
}

function saveTexture(buffer, outputDir, assetName) {
  fs.mkdirSync(outputDir, { recursive: true });
  const filePath = path.join(outputDir, assetName + ".png");
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

module.exports = { paintTexture, saveTexture };
