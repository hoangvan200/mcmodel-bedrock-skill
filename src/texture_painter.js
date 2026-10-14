const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");

const FALLBACK_COLOR = [138, 138, 138];
// Must match UV_PADDING in geometry_builder.js so the painter stays inside
// the allocated atlas cell and never bleeds into the neighbouring cube's region.
const UV_PADDING = 1;

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

// ---------------------------------------------------------------------------
// Stable per-cell seed derived from the UV atlas position.
// Using record.index (global traversal order) caused different colours to
// appear on the same part if the bone hierarchy changed. Using (u, v) instead
// makes the seed depend only on WHERE the cell sits in the atlas — stable
// across any model with the same packing result.
// ---------------------------------------------------------------------------
function uvSeed(u, v, faceIndex) {
  // Simple integer hash: mix u, v, and faceIndex
  let h = ((u * 73856093) ^ (v * 19349663) ^ (faceIndex * 83492791)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x45d9f3b) >>> 0;
  return h ^ (h >>> 16);
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

function paintFace(png, rect, color, shade, style, rng, depth, seed) {
  const left = rect[0];
  const top = rect[1];
  const width = rect[2];
  const height = rect[3];

  for (let py = 0; py < height; py += 1) {
    for (let px = 0; px < width; px += 1) {
      let factor = shade;
      
      // Calculate vertical gradient (1.12 at top to 0.88 at bottom)
      // This gives a 3D volumetric feel to the faces
      const t = height > 1 ? py / (height - 1) : 0;
      const gradient = 1.12 - 0.24 * t;
      
      // Calculate Base Noise (Pixel-perfect White Noise)
      const amplitude = Math.min(0.025, 0.005 + depth * 0.01);
      const baseNoise = (1.0 - amplitude) + rng() * (amplitude * 2);

      if (style === "noise") {
        // Combined Gradient + Heavy Noise (Perfect for Fur / Organic)
        const heavyNoise = 0.85 + rng() * 0.30;
        factor *= gradient * heavyNoise;
      } else if (style === "bordered") {
        factor *= baseNoise;
        const edge = px === 0 || py === 0 || px === width - 1 || py === height - 1;
        if (edge) {
          factor *= 0.72;
        }
      } else if (style === "shaded") {
        // Combined Gradient + Subtle Base Noise (Perfect for Car Paint / Plastic)
        factor *= gradient * baseNoise;
      } else {
        // solid style
        factor *= baseNoise;
      }

      // Add RGB channel shift for subtle per-pixel color variation (Dithering)
      const colorShiftR = (rng() - 0.5) * 5;
      const colorShiftG = (rng() - 0.5) * 5;
      const colorShiftB = (rng() - 0.5) * 5;
      
      const finalColor = [
        color[0] + colorShiftR,
        color[1] + colorShiftG,
        color[2] + colorShiftB
      ];

      setPixel(png, left + px, top + py, finalColor, factor);
    }
  }
}

// ---------------------------------------------------------------------------
// faceLayout — maps a cube's 6 faces onto atlas coordinates.
//
// Box UV convention (matches geometry_builder serializeCube):
//   Atlas cell origin: (u, v)  |  Cell size: (2*(d+w)) × (d+h)
//
//   Row 0 (y: v .. v+d-1):
//     [u+d,       v,   w×d]  → top  (up face)
//     [u+d+w,     v,   w×d]  → bottom (down face)
//
//   Row 1 (y: v+d .. v+d+h-1):
//     [u,         v+d, d×h]  → east  (right side)
//     [u+d,       v+d, w×h]  → north (front face)
//     [u+d+w,     v+d, d×h]  → west  (left side)
//     [u+2d+w,    v+d, w×h]  → south (back face)
//
// `w`, `h`, `d` are CEILED integers (from record.size) so they match
// the integer-pixel UV offsets the geometry builder wrote into the .geo.json.
// ---------------------------------------------------------------------------
function faceLayout(u, v, w, h, d) {
  return [
    { rect: [u + d,         v,     w, d], shade: 1.15 }, // top   (up)
    { rect: [u + d + w,     v,     w, d], shade: 0.65 }, // bottom (down)
    { rect: [u,             v + d, d, h], shade: 0.85 }, // east  (right)
    { rect: [u + d,         v + d, w, h], shade: 1.0  }, // north (front)
    { rect: [u + d + w,     v + d, d, h], shade: 0.85 }, // west  (left)
    { rect: [u + 2 * d + w, v + d, w, h], shade: 0.9  }  // south (back)
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
    // UV position is the top-left corner of the atlas cell for this cube.
    const u = record.uv[0];
    const v = record.uv[1];
    // record.size is [ceil(W), ceil(H), ceil(D)] — matches the geometry builder's
    // ceiled offsets, so painter and .geo.json always agree on face positions.
    const w = record.size[0];
    const h = record.size[1];
    const d = record.size[2];

    faceLayout(u, v, w, h, d).forEach((face, faceIndex) => {
      // Seed derived from atlas position (u,v) + face index — stable regardless
      // of bone traversal order, unlike the old record.index-based seed.
      const seed = uvSeed(u, v, faceIndex);
      const rng = createRng(seed);
      paintFace(png, face.rect, color, face.shade, style, rng, record.depth || 0, seed);
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
