const { buildMinecraftAsset } = require(".");
const fs = require("fs");

const args = {
  asset_name: "student_chair",
  mode: "block",
  generate_texture: true,
  bones: [
    {
      name: "root",
      pivot: [8, 0, 8],
      cubes: [
        {
          origin: [2, 8, 2],
          size: [12, 2, 12],
          material: { color: "#FF0000", style: "bordered" }
        },
        {
          origin: [3, 0, 3],
          size: [2, 8, 2],
          material: { color: "#FF0000", style: "solid" }
        },
        {
          origin: [11, 0, 3],
          size: [2, 8, 2],
          material: { color: "#FF0000", style: "solid" }
        },
        {
          origin: [3, 0, 11],
          size: [2, 8, 2],
          material: { color: "#FF0000", style: "solid" }
        },
        {
          origin: [11, 0, 11],
          size: [2, 8, 2],
          material: { color: "#FF0000", style: "solid" }
        },
        {
          origin: [5, 4, 4],
          size: [6, 2, 1],
          material: { color: "#FF0000", style: "solid" }
        },
        {
          origin: [5, 4, 11],
          size: [6, 2, 1],
          material: { color: "#FF0000", style: "solid" }
        },
        {
          origin: [4, 4, 5],
          size: [1, 2, 6],
          material: { color: "#FF0000", style: "solid" }
        },
        {
          origin: [11, 4, 5],
          size: [1, 2, 6],
          material: { color: "#FF0000", style: "solid" }
        }
      ]
    }
  ]
};

if (!fs.existsSync("./output")) {
  fs.mkdirSync("./output", { recursive: true });
}

const result = buildMinecraftAsset(args, { outputDir: "./output" });
const summary = { ...result };
delete summary.geometry;
console.log(JSON.stringify(summary, null, 2));
