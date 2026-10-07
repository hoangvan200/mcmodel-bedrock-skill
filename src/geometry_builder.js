const fs = require("fs");
const path = require("path");

const FORMAT_VERSION = "1.19.0";
const STYLES = ["solid", "noise", "bordered", "shaded"];
const DEFAULT_COLOR = "#8a8a8a";
const DEFAULT_STYLE = "shaded";
const BLOCK_LIMITS = [
  [-15, 15],
  [0, 30],
  [-15, 15]
];
const MAX_TEXTURE_SIZE = 4096;
const MIN_TEXTURE_SIZE = 64;
const SIGN_VARIANTS = [
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1]
];

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function round(value) {
  const rounded = Math.round(value * 10000) / 10000;
  return rounded === 0 ? 0 : rounded;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function toVec3(value, fallback) {
  if (Array.isArray(value) && value.length === 3 && value.every(isFiniteNumber)) {
    return value.slice();
  }
  return fallback.slice();
}

function hasVec3(value) {
  return Array.isArray(value) && value.length === 3 && value.every(isFiniteNumber);
}

function isZeroVec(vector) {
  return vector[0] === 0 && vector[1] === 0 && vector[2] === 0;
}

function sanitizeName(value, fallback) {
  const cleaned = String(value === undefined || value === null ? "" : value)
    .trim()
    .replace(/[^A-Za-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return cleaned.length > 0 ? cleaned : fallback;
}

function sanitizeAssetName(value) {
  const cleaned = String(value === undefined || value === null ? "" : value)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return cleaned.length > 0 ? cleaned : "mcmodel_asset";
}

function normalizeColor(value) {
  if (typeof value !== "string") {
    return DEFAULT_COLOR;
  }
  let text = value.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(text)) {
    text = text
      .split("")
      .map((character) => character + character)
      .join("");
  }
  if (/^[0-9a-fA-F]{6}$/.test(text)) {
    return "#" + text.toLowerCase();
  }
  return DEFAULT_COLOR;
}

function normalizeMaterial(value) {
  const source = value && typeof value === "object" ? value : {};
  const style = typeof source.style === "string" ? source.style.trim().toLowerCase() : "";
  return {
    color: normalizeColor(source.color),
    style: STYLES.includes(style) ? style : DEFAULT_STYLE
  };
}

function normalizeCube(raw) {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const origin = toVec3(raw.origin, [0, 0, 0]);
  const rawSize = toVec3(raw.size, [0, 0, 0]);
  const size = rawSize.map((component) => Math.max(0, component));

  if (size[0] === 0 && size[1] === 0 && size[2] === 0) {
    return null;
  }

  const inflate = isFiniteNumber(raw.inflate) ? raw.inflate : 0;
  const rotation = toVec3(raw.rotation, [0, 0, 0]);
  let pivot = null;

  if (!isZeroVec(rotation)) {
    pivot = hasVec3(raw.pivot)
      ? raw.pivot.slice()
      : [origin[0] + size[0] / 2, origin[1] + size[1] / 2, origin[2] + size[2] / 2];
  }

  return {
    origin,
    size,
    pivot,
    rotation,
    inflate,
    mirror: raw.mirror === true,
    material: normalizeMaterial(raw.material)
  };
}

function normalizeBones(rawBones) {
  const bones = [];
  const nameMap = new Map();
  const used = new Set();

  rawBones.forEach((raw, index) => {
    if (!raw || typeof raw !== "object") {
      return;
    }
    const baseName = sanitizeName(raw.name, "bone_" + index);
    let name = baseName;
    let counter = 2;
    while (used.has(name)) {
      name = baseName + "_" + counter;
      counter += 1;
    }
    used.add(name);
    if (!nameMap.has(baseName)) {
      nameMap.set(baseName, name);
    }
    const cubes = Array.isArray(raw.cubes) ? raw.cubes.map(normalizeCube).filter(Boolean) : [];
    bones.push({
      name,
      parentRef: typeof raw.parent === "string" && raw.parent.trim().length > 0 ? sanitizeName(raw.parent, "") : null,
      pivot: toVec3(raw.pivot, [0, 0, 0]),
      rotation: toVec3(raw.rotation, [0, 0, 0]),
      cubes,
      parent: null
    });
  });

  bones.forEach((bone) => {
    if (bone.parentRef && nameMap.has(bone.parentRef) && nameMap.get(bone.parentRef) !== bone.name) {
      bone.parent = nameMap.get(bone.parentRef);
    }
    delete bone.parentRef;
  });

  let root = bones.find((bone) => bone.name === "root");
  if (!root) {
    root = {
      name: "root",
      pivot: [0, 0, 0],
      rotation: [0, 0, 0],
      cubes: [],
      parent: null
    };
    bones.unshift(root);
  }
  root.parent = null;

  const byName = new Map(bones.map((bone) => [bone.name, bone]));

  bones.forEach((bone) => {
    const seen = new Set([bone.name]);
    let current = bone;
    while (current && current.parent) {
      if (seen.has(current.parent)) {
        current.parent = null;
        break;
      }
      seen.add(current.parent);
      current = byName.get(current.parent);
    }
  });

  bones.forEach((bone) => {
    if (bone !== root && !bone.parent) {
      bone.parent = "root";
    }
  });

  return orderBones(bones, root);
}

function orderBones(bones, root) {
  const children = new Map();
  bones.forEach((bone) => {
    if (bone.parent) {
      if (!children.has(bone.parent)) {
        children.set(bone.parent, []);
      }
      children.get(bone.parent).push(bone);
    }
  });

  const ordered = [];
  const visit = (bone) => {
    ordered.push(bone);
    (children.get(bone.name) || []).forEach(visit);
  };
  visit(root);
  return ordered;
}

function collectCubes(bones) {
  const cubes = [];
  bones.forEach((bone) => {
    bone.cubes.forEach((cube) => cubes.push(cube));
  });
  return cubes;
}

function translateY(bones, delta) {
  bones.forEach((bone) => {
    bone.pivot[1] += delta;
    bone.cubes.forEach((cube) => {
      cube.origin[1] += delta;
      if (cube.pivot) {
        cube.pivot[1] += delta;
      }
    });
  });
}

function clampCubeToBlock(cube) {
  for (let axis = 0; axis < 3; axis += 1) {
    const limits = BLOCK_LIMITS[axis];
    let low = cube.origin[axis] - cube.inflate;
    let high = cube.origin[axis] + cube.size[axis] + cube.inflate;
    low = clamp(low, limits[0], limits[1]);
    high = clamp(high, limits[0], limits[1]);
    if (high < low) {
      high = low;
    }
    cube.origin[axis] = low + cube.inflate;
    cube.size[axis] = Math.max(0, high - low - 2 * cube.inflate);
  }
}

function enforceBlockBounds(bones) {
  const cubes = collectCubes(bones);
  if (cubes.length === 0) {
    return;
  }
  const lowestY = Math.min(...cubes.map((cube) => cube.origin[1] - cube.inflate));
  if (lowestY < 0) {
    translateY(bones, -lowestY);
  }
  bones.forEach((bone) => {
    bone.cubes.forEach(clampCubeToBlock);
    bone.cubes = bone.cubes.filter((cube) => cube.size[0] > 0 || cube.size[1] > 0 || cube.size[2] > 0);
  });
}

function rotatePoint(point, pivot, rotation, signX, signY) {
  const px = point[0] - pivot[0];
  const py = point[1] - pivot[1];
  const pz = point[2] - pivot[2];
  const ax = (rotation[0] * Math.PI * signX) / 180;
  const ay = (rotation[1] * Math.PI * signY) / 180;
  const az = (rotation[2] * Math.PI) / 180;

  const cx = Math.cos(ax);
  const sx = Math.sin(ax);
  const x1 = px;
  const y1 = py * cx - pz * sx;
  const z1 = py * sx + pz * cx;

  const cy = Math.cos(ay);
  const sy = Math.sin(ay);
  const x2 = x1 * cy + z1 * sy;
  const y2 = y1;
  const z2 = -x1 * sy + z1 * cy;

  const cz = Math.cos(az);
  const sz = Math.sin(az);
  const x3 = x2 * cz - y2 * sz;
  const y3 = x2 * sz + y2 * cz;
  const z3 = z2;

  return [x3 + pivot[0], y3 + pivot[1], z3 + pivot[2]];
}

function cubeCorners(cube) {
  const low = cube.origin.map((value) => value - cube.inflate);
  const high = cube.origin.map((value, axis) => value + cube.size[axis] + cube.inflate);
  const corners = [];
  for (let i = 0; i < 8; i += 1) {
    corners.push([i & 1 ? high[0] : low[0], i & 2 ? high[1] : low[1], i & 4 ? high[2] : low[2]]);
  }
  return corners;
}

function computeWorldBounds(bones) {
  const byName = new Map(bones.map((bone) => [bone.name, bone]));
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];

  SIGN_VARIANTS.forEach(([signX, signY]) => {
    bones.forEach((bone) => {
      bone.cubes.forEach((cube) => {
        cubeCorners(cube).forEach((corner) => {
          let point = corner;
          if (cube.pivot && !isZeroVec(cube.rotation)) {
            point = rotatePoint(point, cube.pivot, cube.rotation, signX, signY);
          }
          let current = bone;
          while (current) {
            if (!isZeroVec(current.rotation)) {
              point = rotatePoint(point, current.pivot, current.rotation, signX, signY);
            }
            current = current.parent ? byName.get(current.parent) : null;
          }
          for (let axis = 0; axis < 3; axis += 1) {
            if (point[axis] < min[axis]) {
              min[axis] = point[axis];
            }
            if (point[axis] > max[axis]) {
              max[axis] = point[axis];
            }
          }
        });
      });
    });
  });

  return { min, max };
}

function ceilTo(value, factor) {
  return Math.ceil(value * factor - 1e-9) / factor;
}

function resolveVisibleBounds(provided, bones) {
  const source = provided && typeof provided === "object" ? provided : null;
  if (
    source &&
    isFiniteNumber(source.width) &&
    source.width > 0 &&
    isFiniteNumber(source.height) &&
    source.height > 0 &&
    hasVec3(source.offset)
  ) {
    return {
      width: round(source.width),
      height: round(source.height),
      offset: source.offset.map(round)
    };
  }

  const bounds = computeWorldBounds(bones);
  const extentX = bounds.max[0] - bounds.min[0];
  const extentY = bounds.max[1] - bounds.min[1];
  const extentZ = bounds.max[2] - bounds.min[2];
  const width = Math.max(ceilTo(Math.max(extentX, extentZ) / 16, 100), 0.01);
  const height = Math.max(ceilTo(extentY / 16, 100), 0.01);

  return {
    width: round(width),
    height: round(height),
    offset: [
      round((bounds.max[0] + bounds.min[0]) / 2 / 16),
      round((bounds.max[1] + bounds.min[1]) / 2 / 16),
      round((bounds.max[2] + bounds.min[2]) / 2 / 16)
    ]
  };
}

function packRects(rects, size) {
  const order = rects.map((rect, index) => index);
  order.sort((a, b) => rects[b].h - rects[a].h || a - b);

  const positions = new Array(rects.length);
  let x = 0;
  let y = 0;
  let shelfHeight = 0;

  for (const index of order) {
    const rect = rects[index];
    if (rect.w > size || rect.h > size) {
      return null;
    }
    if (x + rect.w > size) {
      y += shelfHeight;
      x = 0;
      shelfHeight = 0;
    }
    if (y + rect.h > size) {
      return null;
    }
    positions[index] = [x, y];
    x += rect.w;
    if (rect.h > shelfHeight) {
      shelfHeight = rect.h;
    }
  }

  return positions;
}

function packBoxUv(cubes) {
  const rects = cubes.map((cube) => {
    const width = Math.ceil(cube.size[0]);
    const height = Math.ceil(cube.size[1]);
    const depth = Math.ceil(cube.size[2]);
    return {
      w: Math.max(1, 2 * (depth + width)),
      h: Math.max(1, depth + height)
    };
  });

  let size = MIN_TEXTURE_SIZE;
  while (size <= MAX_TEXTURE_SIZE) {
    const positions = packRects(rects, size);
    if (positions) {
      return { size, positions };
    }
    size *= 2;
  }

  throw new Error("Model needs a texture larger than " + MAX_TEXTURE_SIZE + "x" + MAX_TEXTURE_SIZE + " pixels");
}

function serializeCube(cube, uv) {
  const output = {
    origin: cube.origin.map(round),
    size: cube.size.map(round)
  };
  if (cube.pivot && !isZeroVec(cube.rotation)) {
    output.pivot = cube.pivot.map(round);
    output.rotation = cube.rotation.map(round);
  }
  if (cube.inflate !== 0) {
    output.inflate = round(cube.inflate);
  }
  if (cube.mirror) {
    output.mirror = true;
  }
  
  const isFloatSize = !Number.isInteger(cube.size[0]) || !Number.isInteger(cube.size[1]) || !Number.isInteger(cube.size[2]);
  if (isFloatSize) {
    const u = uv[0];
    const v = uv[1];
    const w = cube.size[0];
    const h = cube.size[1];
    const d = cube.size[2];
    
    output.uv = {
      up: { uv: [round(u + d), round(v)], uv_size: [round(w), round(d)] },
      down: { uv: [round(u + d + w), round(v)], uv_size: [round(w), round(d)] },
      east: { uv: [round(u), round(v + d)], uv_size: [round(d), round(h)] },
      north: { uv: [round(u + d), round(v + d)], uv_size: [round(w), round(h)] },
      west: { uv: [round(u + d + w), round(v + d)], uv_size: [round(d), round(h)] },
      south: { uv: [round(u + 2 * d + w), round(v + d)], uv_size: [round(w), round(h)] }
    };
  } else {
    output.uv = uv;
  }
  
  return output;
}

function serializeBone(bone, uvByCube) {
  const output = { name: bone.name };
  if (bone.parent) {
    output.parent = bone.parent;
  }
  output.pivot = bone.pivot.map(round);
  if (!isZeroVec(bone.rotation)) {
    output.rotation = bone.rotation.map(round);
  }
  if (bone.cubes.length > 0) {
    output.cubes = bone.cubes.map((cube) => serializeCube(cube, uvByCube.get(cube)));
  }
  return output;
}

function buildGeometry(payload, options) {
  const settings = options || {};

  if (!payload || typeof payload !== "object") {
    throw new Error("Payload must be an object");
  }
  if (!Array.isArray(payload.bones) || payload.bones.length === 0) {
    throw new Error("Payload must contain a non-empty bones array");
  }

  const requestedMode = settings.mode || payload.mode;
  const mode = requestedMode === "entity" ? "entity" : "block";
  const generateTexture =
    settings.generateTexture !== undefined ? settings.generateTexture === true : payload.generate_texture === true;
  const assetName = sanitizeAssetName(payload.asset_name);

  const bones = normalizeBones(payload.bones);

  if (mode === "block") {
    enforceBlockBounds(bones);
  }

  const cubes = collectCubes(bones);
  if (cubes.length === 0) {
    throw new Error("Payload does not contain any cube with a positive size");
  }

  const bounds = resolveVisibleBounds(payload.visible_bounds, bones);
  const packing = packBoxUv(cubes);

  const uvByCube = new Map();
  const cubeRecords = [];
  cubes.forEach((cube, index) => {
    const uv = packing.positions[index];
    uvByCube.set(cube, uv);
    cubeRecords.push({
      index,
      uv,
      size: [Math.ceil(cube.size[0]), Math.ceil(cube.size[1]), Math.ceil(cube.size[2])],
      material: cube.material
    });
  });

  const geometry = {
    format_version: FORMAT_VERSION,
    "minecraft:geometry": [
      {
        description: {
          identifier: "geometry." + assetName,
          texture_width: packing.size,
          texture_height: packing.size,
          visible_bounds_width: bounds.width,
          visible_bounds_height: bounds.height,
          visible_bounds_offset: bounds.offset
        },
        bones: bones.map((bone) => serializeBone(bone, uvByCube))
      }
    ]
  };

  return {
    assetName,
    mode,
    generateTexture,
    geometry,
    textureWidth: packing.size,
    textureHeight: packing.size,
    cubeRecords
  };
}

function saveGeometry(geometry, outputDir, assetName) {
  fs.mkdirSync(outputDir, { recursive: true });
  const filePath = path.join(outputDir, assetName + ".geo.json");
  fs.writeFileSync(filePath, JSON.stringify(geometry, null, 2) + "\n", "utf8");
  return filePath;
}

module.exports = {
  buildGeometry,
  saveGeometry,
  packBoxUv,
  normalizeColor,
  sanitizeAssetName
};
