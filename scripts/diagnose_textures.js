const fs = require('fs');
const path = require('path');

const outDir = path.resolve(__dirname, '../output');
const geos = fs.readdirSync(outDir).filter(f => f.endsWith('.geo.json') && !['test_cube.geo.json', 'medieval_lantern.geo.json'].includes(f));

const problematic = [];
const ok = [];

for (const f of geos) {
  const geoPath = path.join(outDir, f);
  const pngPath = path.join(outDir, f.replace('.geo.json', '.png'));
  const name = f.replace('.geo.json', '');

  if (!fs.existsSync(pngPath)) {
    problematic.push({ name, issue: 'MISSING PNG' });
    continue;
  }

  const geo = JSON.parse(fs.readFileSync(geoPath, 'utf8'));
  const desc = geo['minecraft:geometry'][0].description;
  const tw = desc.texture_width;
  const th = desc.texture_height;

  // Read PNG header to get dimensions
  const pngData = fs.readFileSync(pngPath);
  let pngW = 0, pngH = 0;
  // PNG signature: 8 bytes, then IHDR chunk: 4 bytes length + 4 bytes type + 4W + 4H
  if (pngData[0] === 137 && pngData[1] === 80 && pngData[2] === 78 && pngData[3] === 71) {
    pngW = pngData.readUInt32BE(16);
    pngH = pngData.readUInt32BE(20);
  } else {
    problematic.push({ name, issue: 'NOT A VALID PNG' });
    continue;
  }

  if (tw !== pngW || th !== pngH) {
    problematic.push({ name, issue: 'SIZE_MISMATCH', tw_geo: tw, th_geo: th, tw_png: pngW, th_png: pngH });
  } else {
    ok.push(name);
  }
}

console.log(`\n✅ OK: ${ok.length} models match perfectly`);
console.log(`❌ PROBLEMATIC: ${problematic.length} models`);
problematic.forEach(p => console.log('  ', JSON.stringify(p)));

// Also detect UV coords pointing outside actual PNG bounds
console.log('\n=== UV OVERFLOW CHECK ===');
let overflowCount = 0;
for (const f of geos) {
  const geoPath = path.join(outDir, f);
  const pngPath = path.join(outDir, f.replace('.geo.json', '.png'));
  if (!fs.existsSync(pngPath)) continue;

  const geo = JSON.parse(fs.readFileSync(geoPath, 'utf8'));
  const desc = geo['minecraft:geometry'][0].description;
  const tw = desc.texture_width;
  const th = desc.texture_height;
  const pngData = fs.readFileSync(pngPath);
  const pngW = pngData.readUInt32BE(16);
  const pngH = pngData.readUInt32BE(20);

  const bones = geo['minecraft:geometry'][0].bones || [];
  for (const b of bones) {
    for (const c of (b.cubes || [])) {
      if (c.uv && typeof c.uv === 'object' && !Array.isArray(c.uv)) {
        for (const [face, faceData] of Object.entries(c.uv)) {
          if (faceData.uv && faceData.uv_size) {
            const u2 = faceData.uv[0] + Math.abs(faceData.uv_size[0]);
            const v2 = faceData.uv[1] + Math.abs(faceData.uv_size[1]);
            if (u2 > pngW || v2 > pngH) {
              overflowCount++;
              console.log(`  ${f.replace('.geo.json','')} [${face}]: UV end (${u2.toFixed(1)}, ${v2.toFixed(1)}) exceeds PNG ${pngW}x${pngH}`);
            }
          }
        }
      } else if (Array.isArray(c.uv)) {
        // box UV: [u, v] — need to estimate size from cube dims
        const u = c.uv[0];
        const v = c.uv[1];
        const w = Math.ceil(c.size[0]);
        const d = Math.ceil(c.size[2]);
        const h = Math.ceil(c.size[1]);
        const u2 = u + 2 * (w + d);
        const v2 = v + d + h;
        if (u2 > pngW || v2 > pngH) {
          overflowCount++;
          console.log(`  ${f.replace('.geo.json','')} [boxUV]: UV end (${u2}, ${v2}) exceeds PNG ${pngW}x${pngH}`);
        }
      }
    }
  }
}

if (overflowCount === 0) console.log('  No UV overflows detected.');
console.log(`\nTotal UV overflow issues: ${overflowCount}`);
