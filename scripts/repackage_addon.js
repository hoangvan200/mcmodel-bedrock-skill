const fs = require('fs');
const path = require('path');
const { packageAddon } = require('../src/addon_builder.js');

const outputDir = path.resolve(__dirname, '../output');
const pluginOutputDir = 'C:\\Users\\Admin\\.gemini\\config\\plugins\\mcmodel-bedrock\\output';

const geoFiles = fs.readdirSync(outputDir).filter(f => f.endsWith('.geo.json') && f !== 'test_cube.geo.json');
const items = geoFiles.map(f => ({
  asset_name: f.replace('.geo.json', ''),
  mode: 'block'
}));

console.log(`Repackaging addon with ${items.length} upgraded models...`);

const addonName = 'vietnam_sidewalk_pack';
const addonPath = packageAddon({
  addonName,
  items,
  outputDir
});

if (fs.existsSync(addonPath)) {
  fs.copyFileSync(addonPath, path.join(pluginOutputDir, `${addonName}.mcaddon`));
}

console.log(`Successfully re-packaged addon to ${addonPath}`);
console.log(`Synced to: ${path.join(pluginOutputDir, `${addonName}.mcaddon`)}`);
