const fs = require('fs');
const path = require('path');
const { buildMinecraftAsset } = require('../src/index.js');
const { packageAddon } = require('../src/addon_builder.js');

const models = [
  {
    asset_name: "low_plastic_chair",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [-4, 6, -4], size: [8, 1, 8], material: { color: "#D32F2F", style: "bordered" } },
          { origin: [-3, 5, -4], size: [6, 1, 1], material: { color: "#B71C1C", style: "solid" } },
          { origin: [-3, 5, 3], size: [6, 1, 1], material: { color: "#B71C1C", style: "solid" } },
          { origin: [3, 5, -3], size: [1, 1, 6], material: { color: "#B71C1C", style: "solid" } },
          { origin: [-4, 5, -3], size: [1, 1, 6], material: { color: "#B71C1C", style: "solid" } },
          { origin: [2, 0.5, -4], size: [2, 5.5, 2], material: { color: "#C62828", style: "solid" } },
          { origin: [-4, 0.5, -4], size: [2, 5.5, 2], material: { color: "#C62828", style: "solid" } },
          { origin: [2, 0.5, 2], size: [2, 5.5, 2], material: { color: "#C62828", style: "solid" } },
          { origin: [-4, 0.5, 2], size: [2, 5.5, 2], material: { color: "#C62828", style: "solid" } },
          { origin: [2, 0, -4], size: [2, 0.5, 2], material: { color: "#212121", style: "solid" } },
          { origin: [-4, 0, -4], size: [2, 0.5, 2], material: { color: "#212121", style: "solid" } },
          { origin: [2, 0, 2], size: [2, 0.5, 2], material: { color: "#212121", style: "solid" } },
          { origin: [-4, 0, 2], size: [2, 0.5, 2], material: { color: "#212121", style: "solid" } }
        ]
      }
    ]
  },
  {
    asset_name: "high_plastic_chair",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [-5, 8, -5], size: [10, 1.5, 10], material: { color: "#1976D2", style: "bordered" } },
          { origin: [-4, 7, -4], size: [8, 1, 8], material: { color: "#0D47A1", style: "solid" } },
          { origin: [3, 0.5, -5], size: [2, 7.5, 2], material: { color: "#1565C0", style: "solid" } },
          { origin: [-5, 0.5, -5], size: [2, 7.5, 2], material: { color: "#1565C0", style: "solid" } },
          { origin: [3, 0.5, 3], size: [2, 7.5, 2], material: { color: "#1565C0", style: "solid" } },
          { origin: [-5, 0.5, 3], size: [2, 7.5, 2], material: { color: "#1565C0", style: "solid" } },
          { origin: [3, 0, -5], size: [2, 0.5, 2], material: { color: "#212121", style: "solid" } },
          { origin: [-5, 0, -5], size: [2, 0.5, 2], material: { color: "#212121", style: "solid" } },
          { origin: [3, 0, 3], size: [2, 0.5, 2], material: { color: "#212121", style: "solid" } },
          { origin: [-5, 0, 3], size: [2, 0.5, 2], material: { color: "#212121", style: "solid" } },
          { origin: [3.5, 9.5, 3.5], size: [1.5, 8.5, 1.5], material: { color: "#1565C0", style: "solid" } },
          { origin: [-5, 9.5, 3.5], size: [1.5, 8.5, 1.5], material: { color: "#1565C0", style: "solid" } },
          { origin: [-5, 16.5, 3.5], size: [10, 1.5, 1.5], material: { color: "#1976D2", style: "bordered" } },
          { origin: [-3, 11.5, 3.8], size: [6, 4, 1], material: { color: "#1E88E5", style: "bordered" } }
        ]
      }
    ]
  },
  {
    asset_name: "low_plastic_table",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [-7, 7.5, -5], size: [14, 1.5, 10], material: { color: "#D32F2F", style: "bordered" } },
          { origin: [-6, 6, -4], size: [12, 1.5, 8], material: { color: "#B71C1C", style: "solid" } },
          { origin: [5, 0.5, -5], size: [2, 7, 2], material: { color: "#C62828", style: "solid" } },
          { origin: [-7, 0.5, -5], size: [2, 7, 2], material: { color: "#C62828", style: "solid" } },
          { origin: [5, 0.5, 3], size: [2, 7, 2], material: { color: "#C62828", style: "solid" } },
          { origin: [-7, 0.5, 3], size: [2, 7, 2], material: { color: "#C62828", style: "solid" } },
          { origin: [5, 0, -5], size: [2, 0.5, 2], material: { color: "#212121", style: "solid" } },
          { origin: [-7, 0, -5], size: [2, 0.5, 2], material: { color: "#212121", style: "solid" } },
          { origin: [5, 0, 3], size: [2, 0.5, 2], material: { color: "#212121", style: "solid" } },
          { origin: [-7, 0, 3], size: [2, 0.5, 2], material: { color: "#212121", style: "solid" } }
        ]
      }
    ]
  },
  {
    asset_name: "high_plastic_table",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [-7, 12.5, -7], size: [14, 1.5, 14], material: { color: "#1976D2", style: "bordered" } },
          { origin: [-6, 11, -6], size: [12, 1.5, 12], material: { color: "#1565C0", style: "solid" } },
          { origin: [5, 0.5, -7], size: [2, 12, 2], material: { color: "#0D47A1", style: "solid" } },
          { origin: [-7, 0.5, -7], size: [2, 12, 2], material: { color: "#0D47A1", style: "solid" } },
          { origin: [5, 0.5, 5], size: [2, 12, 2], material: { color: "#0D47A1", style: "solid" } },
          { origin: [-7, 0.5, 5], size: [2, 12, 2], material: { color: "#0D47A1", style: "solid" } },
          { origin: [5, 0, -7], size: [2, 0.5, 2], material: { color: "#212121", style: "solid" } },
          { origin: [-7, 0, -7], size: [2, 0.5, 2], material: { color: "#212121", style: "solid" } },
          { origin: [5, 0, 5], size: [2, 0.5, 2], material: { color: "#212121", style: "solid" } },
          { origin: [-7, 0, 5], size: [2, 0.5, 2], material: { color: "#212121", style: "solid" } },
          { origin: [-5, 4, -0.5], size: [10, 1, 1], material: { color: "#1976D2", style: "solid" } },
          { origin: [-0.5, 4, -5], size: [1, 1, 10], material: { color: "#1976D2", style: "solid" } }
        ]
      }
    ]
  },
  {
    asset_name: "folding_stainless_table",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [-8, 12, -6], size: [16, 1, 12], material: { color: "#E0E0E0", style: "shaded" } },
          { origin: [-8.1, 11.5, -6.1], size: [16.2, 0.5, 12.2], material: { color: "#BDBDBD", style: "bordered" } },
          { origin: [-7, 10.7, -5], size: [14, 0.8, 10], material: { color: "#757575", style: "solid" } },
          { origin: [-6, 0.5, -4.5], size: [1.2, 10.2, 1.2], material: { color: "#9E9E9E", style: "shaded" } },
          { origin: [-6, 0.5, 3.3], size: [1.2, 10.2, 1.2], material: { color: "#9E9E9E", style: "shaded" } },
          { origin: [4.8, 0.5, -4.5], size: [1.2, 10.2, 1.2], material: { color: "#9E9E9E", style: "shaded" } },
          { origin: [4.8, 0.5, 3.3], size: [1.2, 10.2, 1.2], material: { color: "#9E9E9E", style: "shaded" } },
          { origin: [-6.2, 0, -5], size: [1.6, 0.5, 10], material: { color: "#616161", style: "solid" } },
          { origin: [4.6, 0, -5], size: [1.6, 0.5, 10], material: { color: "#616161", style: "solid" } },
          { origin: [-5, 6, -0.5], size: [10, 0.8, 1], material: { color: "#BDBDBD", style: "solid" } }
        ]
      }
    ]
  },
  {
    asset_name: "closed_canvas_umbrella",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [-4, 0, -4], size: [8, 3, 8], material: { color: "#757575", style: "bordered" } },
          { origin: [-0.75, 3, -0.75], size: [1.5, 25, 1.5], material: { color: "#424242", style: "solid" } },
          { origin: [-2.5, 12, -2.5], size: [5, 7, 5], material: { color: "#1976D2", style: "shaded" } },
          { origin: [-3, 19, -3], size: [6, 7, 6], material: { color: "#D32F2F", style: "shaded" } },
          { origin: [-3.1, 18, -3.1], size: [6.2, 1, 6.2], material: { color: "#FFEB3B", style: "bordered" } },
          { origin: [-2, 26, -2], size: [4, 2, 4], material: { color: "#1976D2", style: "solid" } },
          { origin: [-0.5, 28, -0.5], size: [1, 1.5, 1], material: { color: "#FBC02D", style: "solid" } }
        ]
      }
    ]
  },
  {
    asset_name: "open_canvas_umbrella",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [-5, 0, -5], size: [10, 3, 10], material: { color: "#616161", style: "bordered" } },
          { origin: [-1.5, 3, -1.5], size: [3, 2, 3], material: { color: "#424242", style: "solid" } },
          { origin: [-0.75, 5, -0.75], size: [1.5, 22, 1.5], material: { color: "#9E9E9E", style: "solid" } },
          { origin: [-1.5, 22, -1.5], size: [3, 1.5, 3], material: { color: "#424242", style: "solid" } },
          { origin: [-12, 24, -12], size: [24, 2, 24], material: { color: "#1976D2", style: "shaded" } },
          { origin: [-7, 26, -7], size: [14, 2, 14], material: { color: "#D32F2F", style: "shaded" } },
          { origin: [-3, 28, -3], size: [6, 1, 6], material: { color: "#1565C0", style: "solid" } },
          { origin: [-0.5, 29, -0.5], size: [1, 1, 1], material: { color: "#FDD835", style: "solid" } },
          { origin: [-12, 22, -12], size: [24, 2, 0.5], material: { color: "#D32F2F", style: "bordered" } },
          { origin: [-12, 22, 11.5], size: [24, 2, 0.5], material: { color: "#D32F2F", style: "bordered" } },
          { origin: [11.5, 22, -12], size: [0.5, 2, 24], material: { color: "#D32F2F", style: "bordered" } },
          { origin: [-12, 22, -12], size: [0.5, 2, 24], material: { color: "#D32F2F", style: "bordered" } }
        ]
      }
    ]
  },
  {
    asset_name: "beverage_branded_umbrella",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [-5, 0, -5], size: [10, 3, 10], material: { color: "#212121", style: "bordered" } },
          { origin: [-0.75, 3, -0.75], size: [1.5, 24, 1.5], material: { color: "#E0E0E0", style: "solid" } },
          { origin: [-12, 24, -12], size: [24, 2, 24], material: { color: "#B71C1C", style: "shaded" } },
          { origin: [-8, 26, -8], size: [16, 2, 16], material: { color: "#D32F2F", style: "shaded" } },
          { origin: [-3, 28, -3], size: [6, 1, 6], material: { color: "#FFFFFF", style: "solid" } },
          { origin: [-0.5, 29, -0.5], size: [1, 1, 1], material: { color: "#D32F2F", style: "solid" } },
          { origin: [-12, 21.5, -12], size: [24, 2.5, 0.6], material: { color: "#FFFFFF", style: "bordered" } },
          { origin: [-12, 21.5, 11.4], size: [24, 2.5, 0.6], material: { color: "#FFFFFF", style: "bordered" } },
          { origin: [11.4, 21.5, -12], size: [0.6, 2.5, 24], material: { color: "#FFFFFF", style: "bordered" } },
          { origin: [-12, 21.5, -12], size: [0.6, 2.5, 24], material: { color: "#FFFFFF", style: "bordered" } }
        ]
      }
    ]
  },
  {
    asset_name: "closed_styrofoam_cooler",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [-7, 0, -5], size: [14, 7.5, 10], material: { color: "#FAFAFA", style: "bordered" } },
          { origin: [-7.2, 7.5, -5.2], size: [14.4, 1.8, 10.4], material: { color: "#F5F5F5", style: "bordered" } },
          { origin: [-7.3, 7, -5.3], size: [14.6, 1.2, 10.6], material: { color: "#FDD835", style: "solid" } },
          { origin: [-1, 9.3, -5.3], size: [2, 0.2, 10.6], material: { color: "#FDD835", style: "solid" } }
        ]
      }
    ]
  },
  {
    asset_name: "open_styrofoam_cooler",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [-7, 0, -5], size: [14, 1, 10], material: { color: "#FAFAFA", style: "bordered" } },
          { origin: [-7, 1, -5], size: [14, 7, 1.5], material: { color: "#FAFAFA", style: "bordered" } },
          { origin: [-7, 1, 3.5], size: [14, 7, 1.5], material: { color: "#FAFAFA", style: "bordered" } },
          { origin: [5.5, 1, -3.5], size: [1.5, 7, 7], material: { color: "#FAFAFA", style: "bordered" } },
          { origin: [-7, 1, -3.5], size: [1.5, 7, 7], material: { color: "#FAFAFA", style: "bordered" } },
          { origin: [-5.5, 1, -3.5], size: [11, 4.5, 7], material: { color: "#B3E5FC", style: "shaded" } },
          { origin: [-4, 5.5, -2], size: [3, 2, 3], material: { color: "#81D4FA", style: "shaded" } },
          { origin: [0, 5.5, -1], size: [3.5, 2, 2.5], material: { color: "#E1F5FE", style: "solid" } },
          { origin: [-1, 5.5, 0.5], size: [2.5, 1.8, 3], material: { color: "#4FC3F7", style: "shaded" } },
          { origin: [-6.5, 4, 4.5], size: [13, 8, 1.5], rotation: [20, 0, 0], pivot: [0, 4, 4.5], material: { color: "#F5F5F5", style: "bordered" } }
        ]
      }
    ]
  },
  {
    asset_name: "banh_mi_cart",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [-7, 3, -6], size: [14, 9, 12], material: { color: "#FBC02D", style: "bordered" } },
          { origin: [-7.1, 9.5, -6.1], size: [14.2, 2, 12.2], material: { color: "#D32F2F", style: "solid" } },
          { origin: [6, 0, -5], size: [1, 3, 3], material: { color: "#424242", style: "solid" } },
          { origin: [-7, 0, -5], size: [1, 3, 3], material: { color: "#424242", style: "solid" } },
          { origin: [6, 0, 2], size: [1, 3, 3], material: { color: "#424242", style: "solid" } },
          { origin: [-7, 0, 2], size: [1, 3, 3], material: { color: "#424242", style: "solid" } },
          { origin: [-6, 9.5, 6], size: [12, 1, 2], material: { color: "#B0BEC5", style: "solid" } },
          { origin: [6, 12, -6], size: [1, 10, 1], material: { color: "#CFD8DC", style: "solid" } },
          { origin: [-7, 12, -6], size: [1, 10, 1], material: { color: "#CFD8DC", style: "solid" } },
          { origin: [6, 12, 5], size: [1, 10, 1], material: { color: "#CFD8DC", style: "solid" } },
          { origin: [-7, 12, 5], size: [1, 10, 1], material: { color: "#CFD8DC", style: "solid" } },
          { origin: [-6, 12, -6], size: [12, 10, 0.5], material: { color: "#E0F7FA", style: "solid" } },
          { origin: [6.5, 12, -5], size: [0.5, 10, 10], material: { color: "#E0F7FA", style: "solid" } },
          { origin: [-7, 12, -5], size: [0.5, 10, 10], material: { color: "#E0F7FA", style: "solid" } },
          { origin: [-6, 16.5, -5], size: [12, 0.5, 10], material: { color: "#B2EBF2", style: "solid" } },
          { origin: [-5, 17, -4], size: [2, 1.5, 7], material: { color: "#D7CCC8", style: "shaded" } },
          { origin: [-2, 17, -4], size: [2, 1.5, 7], material: { color: "#8D6E63", style: "shaded" } },
          { origin: [1, 17, -4], size: [2, 1.5, 7], material: { color: "#D7CCC8", style: "shaded" } },
          { origin: [-8, 22, -7], size: [16, 2, 14], material: { color: "#CFD8DC", style: "bordered" } }
        ]
      }
    ]
  },
  {
    asset_name: "hu_tieu_cart",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [-7, 3, -6], size: [14, 10, 12], material: { color: "#5D4037", style: "bordered" } },
          { origin: [6, 0, -5], size: [1, 3, 3], material: { color: "#212121", style: "solid" } },
          { origin: [-7, 0, -5], size: [1, 3, 3], material: { color: "#212121", style: "solid" } },
          { origin: [6, 0, 2], size: [1, 3, 3], material: { color: "#212121", style: "solid" } },
          { origin: [-7, 0, 2], size: [1, 3, 3], material: { color: "#212121", style: "solid" } },
          { origin: [-7.5, 13, -6.5], size: [15, 1, 13], material: { color: "#CFD8DC", style: "shaded" } },
          { origin: [-6, 14, -4], size: [6, 6, 6], material: { color: "#B0BEC5", style: "bordered" } },
          { origin: [-6.3, 19.5, -4.3], size: [6.6, 0.8, 6.6], material: { color: "#90A4AE", style: "solid" } },
          { origin: [-5.8, 19, -3.8], size: [5.6, 0.2, 5.6], material: { color: "#FF8F00", style: "shaded" } },
          { origin: [1, 14, -3], size: [5, 1, 5], material: { color: "#A1887F", style: "solid" } },
          { origin: [2, 15, -2], size: [3, 2, 2], material: { color: "#C62828", style: "shaded" } },
          { origin: [-7, 14, -6], size: [1, 10, 1], material: { color: "#78909C", style: "solid" } },
          { origin: [6, 14, -6], size: [1, 10, 1], material: { color: "#78909C", style: "solid" } },
          { origin: [-7, 14, 5], size: [1, 10, 1], material: { color: "#78909C", style: "solid" } },
          { origin: [6, 14, 5], size: [1, 10, 1], material: { color: "#78909C", style: "solid" } },
          { origin: [-7, 20, -5], size: [14, 4, 10], material: { color: "#ECEFF1", style: "bordered" } },
          { origin: [-8, 24, -7], size: [16, 1.5, 14], material: { color: "#D32F2F", style: "bordered" } }
        ]
      }
    ]
  },
  {
    asset_name: "sugarcane_juice_cart",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [-7, 3, -6], size: [14, 9, 12], material: { color: "#43A047", style: "bordered" } },
          { origin: [6, 0, -5], size: [1, 3, 3], material: { color: "#424242", style: "solid" } },
          { origin: [-7, 0, -5], size: [1, 3, 3], material: { color: "#424242", style: "solid" } },
          { origin: [6, 0, 2], size: [1, 3, 3], material: { color: "#424242", style: "solid" } },
          { origin: [-7, 0, 2], size: [1, 3, 3], material: { color: "#424242", style: "solid" } },
          { origin: [-7.5, 12, -6.5], size: [15, 1, 13], material: { color: "#CFD8DC", style: "shaded" } },
          { origin: [-6, 13, -3], size: [6, 7, 7], material: { color: "#B0BEC5", style: "bordered" } },
          { origin: [-5, 15, -1], size: [4, 3, 2], material: { color: "#E0E0E0", style: "shaded" } },
          { origin: [-6.5, 14, -2], size: [1, 5, 5], material: { color: "#F44336", style: "solid" } },
          { origin: [2, 13, -4], size: [1.5, 10, 1.5], material: { color: "#7CB342", style: "shaded" } },
          { origin: [3.5, 13, -3], size: [1.5, 9, 1.5], material: { color: "#8BC34A", style: "shaded" } },
          { origin: [2.5, 13, -2], size: [1.5, 11, 1.5], material: { color: "#689F38", style: "shaded" } },
          { origin: [3, 13, 2], size: [2, 5, 2], material: { color: "#E0F7FA", style: "solid" } },
          { origin: [-7, 13, -6], size: [1, 10, 1], material: { color: "#78909C", style: "solid" } },
          { origin: [6, 13, -6], size: [1, 10, 1], material: { color: "#78909C", style: "solid" } },
          { origin: [-7, 13, 5], size: [1, 10, 1], material: { color: "#78909C", style: "solid" } },
          { origin: [6, 13, 5], size: [1, 10, 1], material: { color: "#78909C", style: "solid" } },
          { origin: [-7.5, 23, -6.5], size: [15, 1.5, 13], material: { color: "#43A047", style: "bordered" } }
        ]
      }
    ]
  },
  {
    asset_name: "fried_fish_ball_cart",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [-7, 3, -6], size: [14, 9, 12], material: { color: "#E65100", style: "bordered" } },
          { origin: [6, 0, -5], size: [1, 3, 3], material: { color: "#212121", style: "solid" } },
          { origin: [-7, 0, -5], size: [1, 3, 3], material: { color: "#212121", style: "solid" } },
          { origin: [6, 0, 2], size: [1, 3, 3], material: { color: "#212121", style: "solid" } },
          { origin: [-7, 0, 2], size: [1, 3, 3], material: { color: "#212121", style: "solid" } },
          { origin: [-7.5, 12, -6.5], size: [15, 1, 13], material: { color: "#B0BEC5", style: "shaded" } },
          { origin: [-6, 13, -4], size: [7, 2.5, 7], material: { color: "#78909C", style: "bordered" } },
          { origin: [-5.5, 14.5, -3.5], size: [6, 0.5, 6], material: { color: "#FFB300", style: "shaded" } },
          { origin: [-5.5, 15.5, 0], size: [6, 0.8, 3], material: { color: "#CFD8DC", style: "bordered" } },
          { origin: [-5, 16.3, 0.5], size: [4, 0.8, 0.8], material: { color: "#FFE082", style: "shaded" } },
          { origin: [-5, 16.3, 1.8], size: [4, 0.8, 0.8], material: { color: "#6D4C41", style: "shaded" } },
          { origin: [2, 13, -4], size: [1.5, 4, 1.5], material: { color: "#D32F2F", style: "solid" } },
          { origin: [4, 13, -4], size: [1.5, 4, 1.5], material: { color: "#212121", style: "solid" } },
          { origin: [3, 13, -2], size: [1.5, 3.5, 1.5], material: { color: "#FFF9C4", style: "solid" } },
          { origin: [-7, 13, -6], size: [1, 10, 1], material: { color: "#78909C", style: "solid" } },
          { origin: [6, 13, -6], size: [1, 10, 1], material: { color: "#78909C", style: "solid" } },
          { origin: [-7, 13, 5], size: [1, 10, 1], material: { color: "#78909C", style: "solid" } },
          { origin: [6, 13, 5], size: [1, 10, 1], material: { color: "#78909C", style: "solid" } },
          { origin: [-8, 23, -7], size: [16, 1.5, 14], material: { color: "#E65100", style: "bordered" } }
        ]
      }
    ]
  },
  {
    asset_name: "glass_food_cabinet",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [-7, 0, -5], size: [14, 1, 10], material: { color: "#78909C", style: "bordered" } },
          { origin: [6, 1, -5], size: [1, 13, 1], material: { color: "#90A4AE", style: "solid" } },
          { origin: [-7, 1, -5], size: [1, 13, 1], material: { color: "#90A4AE", style: "solid" } },
          { origin: [6, 1, 4], size: [1, 13, 1], material: { color: "#90A4AE", style: "solid" } },
          { origin: [-7, 1, 4], size: [1, 13, 1], material: { color: "#90A4AE", style: "solid" } },
          { origin: [-7, 14, -5], size: [14, 1, 10], material: { color: "#78909C", style: "bordered" } },
          { origin: [-6, 1, -5], size: [12, 13, 0.5], material: { color: "#E0F7FA", style: "solid" } },
          { origin: [6.5, 1, -4], size: [0.5, 13, 8], material: { color: "#E0F7FA", style: "solid" } },
          { origin: [-7, 1, -4], size: [0.5, 13, 8], material: { color: "#E0F7FA", style: "solid" } },
          { origin: [-6, 7, -4], size: [12, 0.5, 8], material: { color: "#B2EBF2", style: "solid" } },
          { origin: [-5, 1, -3], size: [5, 1.5, 6], material: { color: "#D32F2F", style: "noise" } },
          { origin: [1, 1, -3], size: [5, 1.5, 6], material: { color: "#FDD835", style: "noise" } },
          { origin: [-4, 7.5, -2], size: [2.5, 2, 2.5], material: { color: "#FAFAFA", style: "shaded" } },
          { origin: [-3, 9.5, -1], size: [0.6, 0.2, 0.6], material: { color: "#D32F2F", style: "solid" } },
          { origin: [0, 7.5, -2], size: [2.5, 2, 2.5], material: { color: "#FAFAFA", style: "shaded" } },
          { origin: [1, 9.5, -1], size: [0.6, 0.2, 0.6], material: { color: "#D32F2F", style: "solid" } }
        ]
      }
    ]
  },
  {
    asset_name: "unlit_honeycomb_coal_stove",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [-5, 0, -5], size: [10, 1, 10], material: { color: "#546E7A", style: "bordered" } },
          { origin: [-4.5, 1, -4.5], size: [9, 9, 9], material: { color: "#78909C", style: "bordered" } },
          { origin: [-2, 1.5, -5], size: [4, 2.5, 0.8], material: { color: "#37474F", style: "bordered" } },
          { origin: [4.5, 7, -0.5], size: [1, 2, 1], material: { color: "#B0BEC5", style: "solid" } },
          { origin: [-5.5, 7, -0.5], size: [1, 2, 1], material: { color: "#B0BEC5", style: "solid" } },
          { origin: [-5.5, 9, -0.5], size: [11, 1, 1], material: { color: "#90A4AE", style: "solid" } },
          { origin: [-1, 10, -4.5], size: [2, 1, 1.5], material: { color: "#263238", style: "solid" } },
          { origin: [-1, 10, 3], size: [2, 1, 1.5], material: { color: "#263238", style: "solid" } },
          { origin: [3, 10, -1], size: [1.5, 1, 2], material: { color: "#263238", style: "solid" } },
          { origin: [-4.5, 10, -1], size: [1.5, 1, 2], material: { color: "#263238", style: "solid" } },
          { origin: [-3, 2.5, -3], size: [6, 7, 6], material: { color: "#263238", style: "noise" } },
          { origin: [-2.9, 9.5, -2.9], size: [5.8, 0.2, 5.8], material: { color: "#212121", style: "bordered" } }
        ]
      }
    ]
  },
  {
    asset_name: "lit_honeycomb_coal_stove",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [-5, 0, -5], size: [10, 1, 10], material: { color: "#455A64", style: "bordered" } },
          { origin: [-4.5, 1, -4.5], size: [9, 9, 9], material: { color: "#5D4037", style: "shaded" } },
          { origin: [-2, 1.5, -5], size: [4, 2.5, 0.8], material: { color: "#BF360C", style: "shaded" } },
          { origin: [-1.5, 2, -4.5], size: [3, 1.5, 0.5], material: { color: "#FF5722", style: "shaded" } },
          { origin: [4.5, 7, -0.5], size: [1, 2, 1], material: { color: "#78909C", style: "solid" } },
          { origin: [-5.5, 7, -0.5], size: [1, 2, 1], material: { color: "#78909C", style: "solid" } },
          { origin: [-5.5, 9, -0.5], size: [11, 1, 1], material: { color: "#78909C", style: "solid" } },
          { origin: [-1, 10, -4.5], size: [2, 1, 1.5], material: { color: "#212121", style: "solid" } },
          { origin: [-1, 10, 3], size: [2, 1, 1.5], material: { color: "#212121", style: "solid" } },
          { origin: [3, 10, -1], size: [1.5, 1, 2], material: { color: "#212121", style: "solid" } },
          { origin: [-4.5, 10, -1], size: [1.5, 1, 2], material: { color: "#212121", style: "solid" } },
          { origin: [-3, 2.5, -3], size: [6, 7, 6], material: { color: "#D84315", style: "shaded" } },
          { origin: [-2.9, 9.5, -2.9], size: [5.8, 0.5, 5.8], material: { color: "#FF5722", style: "shaded" } },
          { origin: [-2, 10, -2], size: [4, 0.6, 4], material: { color: "#FFAB00", style: "shaded" } }
        ]
      }
    ]
  },
  {
    asset_name: "charcoal_grill_with_smoke",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [-7, 4, -4], size: [14, 4, 8], material: { color: "#424242", style: "bordered" } },
          { origin: [-6, 6, -3], size: [12, 1.5, 6], material: { color: "#BF360C", style: "shaded" } },
          { origin: [-5, 7.5, -2], size: [10, 0.5, 4], material: { color: "#FF5722", style: "shaded" } },
          { origin: [6, 0, -4], size: [1, 4, 1], material: { color: "#212121", style: "solid" } },
          { origin: [-7, 0, -4], size: [1, 4, 1], material: { color: "#212121", style: "solid" } },
          { origin: [6, 0, 3], size: [1, 4, 1], material: { color: "#212121", style: "solid" } },
          { origin: [-7, 0, 3], size: [1, 4, 1], material: { color: "#212121", style: "solid" } },
          { origin: [-7.1, 8, -4.1], size: [14.2, 0.5, 8.2], material: { color: "#CFD8DC", style: "bordered" } },
          { origin: [-5, 8.5, -2.5], size: [10, 0.8, 1.5], material: { color: "#8D6E63", style: "shaded" } },
          { origin: [-5, 8.5, 0], size: [10, 0.8, 1.5], material: { color: "#D84315", style: "shaded" } },
          { origin: [-5, 8.5, 2], size: [10, 0.8, 1.5], material: { color: "#6D4C41", style: "shaded" } },
          { origin: [5, 8.7, -2.5], size: [2, 0.4, 0.4], material: { color: "#D7CCC8", style: "solid" } },
          { origin: [5, 8.7, 0], size: [2, 0.4, 0.4], material: { color: "#D7CCC8", style: "solid" } },
          { origin: [-2, 10, -1], size: [3, 2, 2], material: { color: "#ECEFF1", style: "shaded" } },
          { origin: [0, 12, -0.5], size: [4, 2.5, 3], material: { color: "#CFD8DC", style: "shaded" } },
          { origin: [-1, 14.5, 0], size: [3, 2, 2], material: { color: "#ECEFF1", style: "shaded" } }
        ]
      }
    ]
  },
  {
    asset_name: "chalkboard_sidewalk_sign",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [-5, 3, -2], size: [10, 12, 1], material: { color: "#212121", style: "bordered" } },
          { origin: [-5.5, 15, -2.2], size: [11, 1.5, 1.4], material: { color: "#5D4037", style: "solid" } },
          { origin: [-5.5, 0, -2.2], size: [1.2, 15, 1.4], material: { color: "#5D4037", style: "solid" } },
          { origin: [4.3, 0, -2.2], size: [1.2, 15, 1.4], material: { color: "#5D4037", style: "solid" } },
          { origin: [-5.5, 0, 2], size: [1.2, 14, 1.2], material: { color: "#4E342E", style: "solid" } },
          { origin: [4.3, 0, 2], size: [1.2, 14, 1.2], material: { color: "#4E342E", style: "solid" } },
          { origin: [-5, 4, 2], size: [10, 1, 1], material: { color: "#4E342E", style: "solid" } },
          { origin: [-5, 15.5, -2], size: [10, 1, 5], material: { color: "#795548", style: "solid" } },
          { origin: [-3.5, 6, -2.1], size: [7, 7, 0.2], material: { color: "#FFF9C4", style: "solid" } }
        ]
      }
    ]
  },
  {
    asset_name: "illuminated_light_box_sign",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [4, 0, -4], size: [1.5, 1, 8], material: { color: "#212121", style: "solid" } },
          { origin: [-5.5, 0, -4], size: [1.5, 1, 8], material: { color: "#212121", style: "solid" } },
          { origin: [4, 1, -0.75], size: [1.5, 6, 1.5], material: { color: "#263238", style: "solid" } },
          { origin: [-5.5, 1, -0.75], size: [1.5, 6, 1.5], material: { color: "#263238", style: "solid" } },
          { origin: [-6, 7, -1.5], size: [12, 12, 3], material: { color: "#FFFFF0", style: "shaded" } },
          { origin: [-6.2, 6.8, -1.6], size: [12.4, 12.4, 3.2], material: { color: "#78909C", style: "bordered" } },
          { origin: [-5, 11, -1.7], size: [10, 4, 0.2], material: { color: "#D32F2F", style: "solid" } },
          { origin: [-4, 8, -1.7], size: [8, 2, 0.2], material: { color: "#1976D2", style: "solid" } },
          { origin: [-5, 11, 1.5], size: [10, 4, 0.2], material: { color: "#D32F2F", style: "solid" } }
        ]
      }
    ]
  },
  {
    asset_name: "sidewalk_tarp",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [-8, 0, -8], size: [16, 0.5, 16], material: { color: "#1565C0", style: "bordered" } },
          { origin: [-8, 0.5, -8], size: [3, 0.1, 16], material: { color: "#FF6F00", style: "solid" } },
          { origin: [5, 0.5, -8], size: [3, 0.1, 16], material: { color: "#FF6F00", style: "solid" } },
          { origin: [-7.5, 0.5, -7.5], size: [0.8, 0.15, 0.8], material: { color: "#FFD54F", style: "solid" } },
          { origin: [6.7, 0.5, -7.5], size: [0.8, 0.15, 0.8], material: { color: "#FFD54F", style: "solid" } },
          { origin: [-7.5, 0.5, 6.7], size: [0.8, 0.15, 0.8], material: { color: "#FFD54F", style: "solid" } },
          { origin: [6.7, 0.5, 6.7], size: [0.8, 0.15, 0.8], material: { color: "#FFD54F", style: "solid" } }
        ]
      }
    ]
  },
  {
    asset_name: "bamboo_tray",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [-6, 0, -6], size: [12, 0.8, 12], material: { color: "#D7CCC8", style: "noise" } },
          { origin: [-6, 0, -7], size: [12, 1.8, 1], material: { color: "#8D6E63", style: "bordered" } },
          { origin: [-6, 0, 6], size: [12, 1.8, 1], material: { color: "#8D6E63", style: "bordered" } },
          { origin: [6, 0, -6], size: [1, 1.8, 12], material: { color: "#8D6E63", style: "bordered" } },
          { origin: [-7, 0, -6], size: [1, 1.8, 12], material: { color: "#8D6E63", style: "bordered" } },
          { origin: [-5, 0.8, -5], size: [10, 0.2, 10], material: { color: "#4CAF50", style: "shaded" } }
        ]
      }
    ]
  },
  {
    asset_name: "plastic_vegetable_basket",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [-5, 0, -5], size: [10, 1, 10], material: { color: "#2E7D32", style: "bordered" } },
          { origin: [-5.5, 1, -5.5], size: [11, 4.5, 1], material: { color: "#388E3C", style: "bordered" } },
          { origin: [-5.5, 1, 4.5], size: [11, 4.5, 1], material: { color: "#388E3C", style: "bordered" } },
          { origin: [4.5, 1, -5.5], size: [1, 4.5, 11], material: { color: "#388E3C", style: "bordered" } },
          { origin: [-5.5, 1, -5.5], size: [1, 4.5, 11], material: { color: "#388E3C", style: "bordered" } },
          { origin: [-6, 5.5, -6], size: [12, 0.8, 12], material: { color: "#4CAF50", style: "bordered" } },
          { origin: [-4.5, 1, -4.5], size: [9, 2.5, 9], material: { color: "#43A047", style: "noise" } },
          { origin: [-4, 3, -4], size: [8, 3, 8], material: { color: "#66BB6A", style: "shaded" } },
          { origin: [-2, 5.5, -2], size: [4, 1.5, 4], material: { color: "#2E7D32", style: "solid" } }
        ]
      }
    ]
  },
  {
    asset_name: "placed_iced_tea_glass",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [-2, 0, -2], size: [4, 1, 4], material: { color: "#ECEFF1", style: "bordered" } },
          { origin: [-2.25, 1, -2.25], size: [4.5, 7, 4.5], material: { color: "#E0F2F1", style: "solid" } },
          { origin: [-1.9, 1, -1.9], size: [3.8, 5.5, 3.8], material: { color: "#FFA000", style: "shaded" } },
          { origin: [-1.5, 5.5, -1.5], size: [1.5, 1.5, 1.5], material: { color: "#E1F5FE", style: "solid" } },
          { origin: [0, 5.5, -0.5], size: [1.5, 1.5, 1.5], material: { color: "#B3E5FC", style: "shaded" } },
          { origin: [-1, 5.5, 0.2], size: [1.5, 1.5, 1.5], material: { color: "#E1F5FE", style: "solid" } },
          { origin: [1.2, 1, 1.2], size: [0.5, 9, 0.5], material: { color: "#F44336", style: "solid" } }
        ]
      }
    ]
  },
  {
    asset_name: "bamboo_water_pipe",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [-1.5, 1, -7], size: [3, 3, 14], material: { color: "#8D6E63", style: "shaded" } },
          { origin: [-1.7, 0.8, -4], size: [3.4, 3.4, 0.8], material: { color: "#5D4037", style: "solid" } },
          { origin: [-1.7, 0.8, 2], size: [3.4, 3.4, 0.8], material: { color: "#5D4037", style: "solid" } },
          { origin: [-2, 0, -6], size: [4, 1, 2], material: { color: "#4E342E", style: "solid" } },
          { origin: [-0.75, 3.5, -4.5], size: [1.5, 3, 1.5], material: { color: "#FFB300", style: "solid" } },
          { origin: [-1.1, 6, -4.8], size: [2.2, 1.5, 2.2], material: { color: "#FFA000", style: "bordered" } },
          { origin: [-1.6, 0.9, 6.8], size: [3.2, 3.2, 0.5], material: { color: "#3E2723", style: "bordered" } }
        ]
      }
    ]
  },
  {
    asset_name: "copper_wrapped_water_pipe",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [-1.5, 1, -7], size: [3, 3, 14], material: { color: "#4E342E", style: "shaded" } },
          { origin: [-1.7, 0.8, 4], size: [3.4, 3.4, 3], material: { color: "#FFA000", style: "bordered" } },
          { origin: [-1.7, 0.8, -7], size: [3.4, 3.4, 3], material: { color: "#FFA000", style: "bordered" } },
          { origin: [-1.7, 0.8, -1], size: [3.4, 3.4, 1.5], material: { color: "#FFB300", style: "bordered" } },
          { origin: [-0.75, 3.5, -4.5], size: [1.5, 3, 1.5], material: { color: "#FFC107", style: "solid" } },
          { origin: [-1.2, 6, -4.95], size: [2.4, 1.8, 2.4], material: { color: "#FFD54F", style: "bordered" } },
          { origin: [-2, 0, -6], size: [4, 1, 2], material: { color: "#3E2723", style: "solid" } }
        ]
      }
    ]
  },
  {
    asset_name: "rang_dong_thermos",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [-3, 0, -3], size: [6, 1, 6], material: { color: "#B0BEC5", style: "bordered" } },
          { origin: [-2.8, 1, -2.8], size: [5.6, 9, 5.6], material: { color: "#C62828", style: "shaded" } },
          { origin: [-2.9, 3.5, -2.9], size: [5.8, 3.5, 5.8], material: { color: "#FFF9C4", style: "solid" } },
          { origin: [-2.6, 10, -2.6], size: [5.2, 2, 5.2], material: { color: "#CFD8DC", style: "bordered" } },
          { origin: [-2, 12, -2], size: [4, 2.5, 4], material: { color: "#B0BEC5", style: "bordered" } },
          { origin: [2.8, 8, -0.5], size: [0.6, 4, 1], material: { color: "#90A4AE", style: "solid" } },
          { origin: [-3.4, 8, -0.5], size: [0.6, 4, 1], material: { color: "#90A4AE", style: "solid" } },
          { origin: [-3.4, 12, -0.5], size: [6.8, 1, 1], material: { color: "#90A4AE", style: "solid" } }
        ]
      }
    ]
  },
  {
    asset_name: "aluminum_kettle",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [-4, 0, -4], size: [8, 1, 8], material: { color: "#90A4AE", style: "bordered" } },
          { origin: [-4.5, 1, -4.5], size: [9, 5, 9], material: { color: "#CFD8DC", style: "shaded" } },
          { origin: [-3, 6, -3], size: [6, 1.2, 6], material: { color: "#B0BEC5", style: "bordered" } },
          { origin: [-0.75, 7.2, -0.75], size: [1.5, 1, 1.5], material: { color: "#212121", style: "solid" } },
          { origin: [-1, 2, -6.5], size: [2, 4, 3], material: { color: "#B0BEC5", style: "solid" } },
          { origin: [4.2, 5, -0.5], size: [0.8, 5, 1], material: { color: "#37474F", style: "solid" } },
          { origin: [-5, 5, -0.5], size: [0.8, 5, 1], material: { color: "#37474F", style: "solid" } },
          { origin: [-5, 9.5, -0.5], size: [10, 1, 1], material: { color: "#212121", style: "solid" } }
        ]
      }
    ]
  },
  {
    asset_name: "vintage_elephant_ear_fan",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [-3.5, 0, -4], size: [7, 2, 8], material: { color: "#ECEFF1", style: "bordered" } },
          { origin: [-1.5, 2, -3], size: [3, 0.5, 1.5], material: { color: "#D32F2F", style: "solid" } },
          { origin: [-0.75, 2, -0.5], size: [1.5, 5, 1.5], material: { color: "#CFD8DC", style: "solid" } },
          { origin: [-2, 7, -1], size: [4, 4, 5], material: { color: "#ECEFF1", style: "bordered" } },
          { origin: [-1, 8, -2.5], size: [2, 2, 1.5], material: { color: "#90A4AE", style: "solid" } },
          { origin: [-1.5, 9.5, -2.2], size: [3, 4, 0.5], material: { color: "#546E7A", style: "shaded" } },
          { origin: [0.5, 6.5, -2.2], size: [4, 3, 0.5], material: { color: "#546E7A", style: "shaded" } },
          { origin: [-4.5, 6.5, -2.2], size: [4, 3, 0.5], material: { color: "#546E7A", style: "shaded" } }
        ]
      }
    ]
  },
  {
    asset_name: "standing_industrial_fan",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [-7, 0, -1.5], size: [14, 1.5, 3], material: { color: "#212121", style: "bordered" } },
          { origin: [-1.5, 0, -7], size: [3, 1.5, 14], material: { color: "#212121", style: "bordered" } },
          { origin: [-0.75, 1.5, -0.75], size: [1.5, 16.5, 1.5], material: { color: "#37474F", style: "solid" } },
          { origin: [-1.25, 9, -1.25], size: [2.5, 2, 2.5], material: { color: "#212121", style: "solid" } },
          { origin: [-2.5, 18, 0], size: [5, 5, 5], material: { color: "#263238", style: "bordered" } },
          { origin: [-7, 15, -4], size: [14, 12, 1], material: { color: "#455A64", style: "bordered" } },
          { origin: [-7, 15, -1], size: [14, 12, 1], material: { color: "#455A64", style: "bordered" } },
          { origin: [-1.5, 19.5, -4.3], size: [3, 3, 0.5], material: { color: "#D32F2F", style: "solid" } },
          { origin: [-5, 16, -2.5], size: [10, 10, 0.5], material: { color: "#90A4AE", style: "shaded" } }
        ]
      }
    ]
  },
  {
    asset_name: "condiment_tray",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [-5, 0, -4], size: [10, 1, 8], material: { color: "#B0BEC5", style: "bordered" } },
          { origin: [-0.4, 1, -0.4], size: [0.8, 7.5, 0.8], material: { color: "#78909C", style: "solid" } },
          { origin: [-1.5, 8.5, -0.4], size: [3, 1, 0.8], material: { color: "#78909C", style: "solid" } },
          { origin: [-4, 1, -3.5], size: [2.5, 6, 2.5], material: { color: "#D32F2F", style: "solid" } },
          { origin: [-3.5, 7, -3], size: [1.5, 1.5, 1.5], material: { color: "#FDD835", style: "solid" } },
          { origin: [1.5, 1, -3.5], size: [3, 4, 3], material: { color: "#E0F2F1", style: "solid" } },
          { origin: [1.8, 1.2, -3.2], size: [2.4, 2.5, 2.4], material: { color: "#FAFAFA", style: "solid" } },
          { origin: [1.8, 2.5, -3.2], size: [2.4, 0.8, 2.4], material: { color: "#E53935", style: "solid" } },
          { origin: [1.4, 5, -3.6], size: [3.2, 0.8, 3.2], material: { color: "#D32F2F", style: "bordered" } },
          { origin: [-4, 1, 1], size: [2, 3.5, 2], material: { color: "#424242", style: "bordered" } },
          { origin: [1.5, 1, 1], size: [2, 3, 2], material: { color: "#FFF9C4", style: "solid" } }
        ]
      }
    ]
  },
  {
    asset_name: "toilet_paper_roll_napkin",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [-3.5, 0, -3.5], size: [7, 0.8, 7], material: { color: "#E0E0E0", style: "bordered" } },
          { origin: [-3, 0.8, -3], size: [6, 6, 6], material: { color: "#FFFFFF", style: "shaded" } },
          { origin: [-3.1, 0.9, -3.1], size: [6.2, 5.8, 6.2], material: { color: "#F5F5F5", style: "bordered" } },
          { origin: [-1, 0.8, -1], size: [2, 6.2, 2], material: { color: "#BCAAA4", style: "bordered" } },
          { origin: [3.1, 1.5, -1.5], size: [0.2, 4, 3], material: { color: "#FFFFFF", style: "solid" } }
        ]
      }
    ]
  },
  {
    asset_name: "plastic_chopstick_holder",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [-3, 0, -3], size: [6, 1, 6], material: { color: "#C62828", style: "bordered" } },
          { origin: [-2.75, 1, -2.75], size: [5.5, 8, 5.5], material: { color: "#D32F2F", style: "bordered" } },
          { origin: [-3.1, 8.5, -3.1], size: [6.2, 1, 6.2], material: { color: "#B71C1C", style: "bordered" } },
          { origin: [-1.5, 9, -1.5], size: [2, 6, 2], material: { color: "#8D6E63", style: "solid" } },
          { origin: [0.5, 9, -1], size: [1.5, 5, 1.5], material: { color: "#A1887F", style: "solid" } },
          { origin: [-2, 9, 0.5], size: [0.6, 5, 1], material: { color: "#B0BEC5", style: "solid" } },
          { origin: [-2.6, 13, 0.6], size: [1.8, 2, 0.8], material: { color: "#CFD8DC", style: "shaded" } }
        ]
      }
    ]
  },
  {
    asset_name: "small_plastic_trash_bin",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [-4, 0, -4], size: [8, 1, 8], material: { color: "#1565C0", style: "bordered" } },
          { origin: [-4.5, 1, -4.5], size: [9, 7, 0.8], material: { color: "#1976D2", style: "bordered" } },
          { origin: [-4.5, 1, 3.7], size: [9, 7, 0.8], material: { color: "#1976D2", style: "bordered" } },
          { origin: [3.7, 1, -4.5], size: [0.8, 7, 9], material: { color: "#1976D2", style: "bordered" } },
          { origin: [-4.5, 1, -4.5], size: [0.8, 7, 9], material: { color: "#1976D2", style: "bordered" } },
          { origin: [-5, 8, -5], size: [10, 1, 10], material: { color: "#1E88E5", style: "bordered" } },
          { origin: [-2, 1, -2], size: [4, 2, 4], material: { color: "#F5F5F5", style: "noise" } },
          { origin: [0.5, 2.5, 0], size: [1.5, 1, 1.5], material: { color: "#4CAF50", style: "solid" } }
        ]
      }
    ]
  },
  {
    asset_name: "wooden_stool",
    mode: "block",
    generate_texture: true,
    bones: [
      {
        name: "root",
        pivot: [0, 0, 0],
        cubes: [
          { origin: [-4.5, 6.5, -4.5], size: [9, 1.5, 9], material: { color: "#8D6E63", style: "noise" } },
          { origin: [2.5, 0, -4.5], size: [2, 6.5, 2], material: { color: "#6D4C41", style: "noise" } },
          { origin: [-4.5, 0, -4.5], size: [2, 6.5, 2], material: { color: "#6D4C41", style: "noise" } },
          { origin: [2.5, 0, 2.5], size: [2, 6.5, 2], material: { color: "#6D4C41", style: "noise" } },
          { origin: [-4.5, 0, 2.5], size: [2, 6.5, 2], material: { color: "#6D4C41", style: "noise" } },
          { origin: [-2.5, 2, -4.3], size: [5, 1, 1.2], material: { color: "#5D4037", style: "noise" } },
          { origin: [-2.5, 2, 3.1], size: [5, 1, 1.2], material: { color: "#5D4037", style: "noise" } },
          { origin: [2.7, 3, -2.5], size: [1.2, 1, 5], material: { color: "#5D4037", style: "noise" } },
          { origin: [-3.9, 3, -2.5], size: [1.2, 1, 5], material: { color: "#5D4037", style: "noise" } }
        ]
      }
    ]
  }
];

const outputDir = path.resolve(__dirname, '../output');
const pluginOutputDir = 'C:\\Users\\Admin\\.gemini\\config\\plugins\\mcmodel-bedrock\\output';

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}
if (!fs.existsSync(pluginOutputDir)) {
  fs.mkdirSync(pluginOutputDir, { recursive: true });
}

console.log(`Starting generation of ${models.length} Vietnamese sidewalk block models...`);

const results = [];
const addonItems = [];

for (const model of models) {
  try {
    const res = buildMinecraftAsset(model, { outputDir });
    results.push(res);
    addonItems.push({ asset_name: model.asset_name, mode: model.mode });

    // Also copy to plugin output directory
    const geoSrc = path.join(outputDir, `${model.asset_name}.geo.json`);
    const pngSrc = path.join(outputDir, `${model.asset_name}.png`);
    if (fs.existsSync(geoSrc)) {
      fs.copyFileSync(geoSrc, path.join(pluginOutputDir, `${model.asset_name}.geo.json`));
    }
    if (fs.existsSync(pngSrc)) {
      fs.copyFileSync(pngSrc, path.join(pluginOutputDir, `${model.asset_name}.png`));
    }

    console.log(`[SUCCESS] ${model.asset_name} -> bones: ${res.boneCount}, cubes: ${res.cubeCount}, tex: ${res.textureWidth}x${res.textureHeight}`);
  } catch (err) {
    console.error(`[ERROR] ${model.asset_name}:`, err.message);
  }
}

console.log(`Successfully generated ${results.length}/${models.length} models.`);

// Package into single addon
const addonName = 'vietnam_sidewalk_pack';
const addonPath = packageAddon({
  addonName,
  items: addonItems,
  outputDir
});

if (fs.existsSync(addonPath)) {
  fs.copyFileSync(addonPath, path.join(pluginOutputDir, `${addonName}.mcaddon`));
}

console.log(`Addon packaged at: ${addonPath}`);
console.log(`Also synced to: ${path.join(pluginOutputDir, `${addonName}.mcaddon`)}`);
