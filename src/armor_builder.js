/**
 * armor_builder.js — Minecraft Bedrock Armor Attachable & BP Item Generator
 *
 * Implements the official Minecraft Bedrock 1.21+ armor attachment specification:
 *   1. Generates `attachables/<identifier>.json` linking an armor .geo.json model
 *      to the standard humanoid player rig via the official `minecraft:attachable` format.
 *   2. Generates `bp_items/<identifier>.json` defining the armor item behavior in the
 *      Behavior Pack, including wearable slot, defense points, and durability.
 *   3. Exposes `ARMOR_PIECES` configuration table and helper utilities for full set
 *      orchestration.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// Armor Piece Configuration Table
// ---------------------------------------------------------------------------

/**
 * Standard Minecraft Bedrock armor piece mapping.
 *
 * Each entry defines:
 *   - `parentBone`      : Target bone on `geometry.humanoid` to attach to.
 *   - `wearableSlot`    : Slot ID used in `minecraft:wearable` (`slot.armor.head`, etc.).
 *   - `defense`         : Default armor defense points for this slot.
 *   - `durability`      : Base durability multiplier (matches vanilla diamond scale).
 *   - `itemTexturePath` : RP relative path to the 2D inventory item icon.
 */
const ARMOR_PIECES = {
  helmet: {
    parentBone: 'head',
    wearableSlot: 'slot.armor.head',
    defense: 3,
    durability: 363,
    itemTexturePath: 'textures/items/armor_helmet',
  },
  chestplate: {
    parentBone: 'body',
    wearableSlot: 'slot.armor.chest',
    defense: 8,
    durability: 528,
    itemTexturePath: 'textures/items/armor_chestplate',
  },
  leggings: {
    parentBone: 'body',
    wearableSlot: 'slot.armor.legs',
    defense: 6,
    durability: 495,
    itemTexturePath: 'textures/items/armor_leggings',
  },
  boots: {
    parentBone: 'body',
    wearableSlot: 'slot.armor.feet',
    defense: 3,
    durability: 429,
    itemTexturePath: 'textures/items/armor_boots',
  },
};

/**
 * Standard bone names for the humanoid armor rig.
 * When the AI builds geometry for an armor piece, the root-level bones
 * must match these exact names so the Bedrock client can bind them to the
 * corresponding player bones.
 */
const HUMANOID_ARMOR_BONES = {
  helmet: ['head', 'hat'],
  chestplate: ['body', 'rightArm', 'leftArm'],
  leggings: ['body', 'rightLeg', 'leftLeg', 'waist'],
  boots: ['rightLeg', 'leftLeg', 'rightBoot', 'leftBoot'],
};

/**
 * Validates whether the given piece name is a recognized armor piece.
 *
 * @param {string} piece - 'helmet' | 'chestplate' | 'leggings' | 'boots'
 * @returns {boolean}
 */
function isValidArmorPiece(piece) {
  return typeof piece === 'string' && Object.prototype.hasOwnProperty.call(ARMOR_PIECES, piece.toLowerCase());
}

/**
 * Returns a humanoid root bone template for an armor piece.
 *
 * @param {string} piece - 'helmet' | 'chestplate' | 'leggings' | 'boots'
 * @returns {Array<object>} Bone definitions ready for Bedrock geometry JSON.
 */
function getArmorBoneTemplate(piece) {
  const p = piece.toLowerCase();
  if (!isValidArmorPiece(p)) {
    throw new Error(`[armor_builder] Unknown armor piece: "${piece}". Expected one of: ${Object.keys(ARMOR_PIECES).join(', ')}`);
  }

  const boneNames = HUMANOID_ARMOR_BONES[p];
  return boneNames.map(name => ({
    name,
    pivot: [0, 0, 0],
    cubes: [], // Cubes will be filled by the AI via spatial_analysis.
  }));
}

// ---------------------------------------------------------------------------
// Exported Functions
// ---------------------------------------------------------------------------

/**
 * Determines whether a description string represents a request for a full
 * armor set rather than a single piece.
 *
 * Returns `true` when the description mentions:
 *   - "armor" without restricting to a single piece, OR
 *   - any individual piece keyword (helmet / chestplate / leggings / boots)
 *     without an explicit "only <piece>" qualifier.
 *
 * Returns `false` when the description explicitly requests exactly one piece
 * (e.g. "only helmet", "only boots").
 *
 * @param {string} description - Natural-language description of the request.
 * @returns {boolean}
 */
function isArmorRequest(description) {
  if (typeof description !== 'string') return false;
  const lower = description.toLowerCase();

  // Explicit single-piece qualifiers
  const singlePiecePatterns = [
    /\bonly\s+(helmet|chestplate|leggings|boots)\b/,
    /\bjust\s+(a\s+)?(helmet|chestplate|leggings|boots)\b/,
    /\bsingle\s+(helmet|chestplate|leggings|boots)\b/,
    /\bchi\s+(tao\s+)?(helmet|chestplate|leggings|boots)\b/,
  ];

  for (const pattern of singlePiecePatterns) {
    if (pattern.test(lower)) return false;
  }

  // Positive triggers: full-set keywords
  const fullSetKeywords = [
    'armor', 'armour', 'armor set', 'armour set', 'full set', 'full armor',
    'giap', 'bo giap', 'toan bo giap'
  ];
  for (const kw of fullSetKeywords) {
    if (lower.includes(kw)) return true;
  }

  // If multiple piece keywords appear together, treat as a set request.
  const pieceKeywords = ['helmet', 'chestplate', 'leggings', 'boots'];
  const matchedPieces = pieceKeywords.filter(p => lower.includes(p));
  if (matchedPieces.length > 1) return true;

  return false;
}

/**
 * Generates the Resource Pack Attachable JSON (`minecraft:attachable`) for an armor piece.
 *
 * Follows the official Bedrock format:
 *   - `format_version`: "1.10.0"
 *   - `minecraft:attachable.description.identifier`: `<namespace>:<assetName>`
 *   - `item`: `<namespace>:<assetName>`
 *   - `materials.default`: "armor"
 *   - `materials.enchanted`: "armor_enchanted"
 *   - `textures.default`: "textures/models/armor/<assetName>"
 *   - `textures.enchanted`: "textures/misc/enchanted_item_glint"
 *   - `geometry.default`: `<geoIdentifier>`
 *   - `scripts.parent_setup`: Attach root bone to player bone.
 *   - `render_controllers`: ["controller.render.armor"]
 *
 * @param {string} assetName      - Asset name, e.g. "warden_armor_helmet".
 * @param {string} piece          - 'helmet' | 'chestplate' | 'leggings' | 'boots'.
 * @param {string} geoIdentifier  - Geometry ID from .geo.json, e.g. "geometry.warden_armor_helmet".
 * @param {string} [namespace='custom'] - Addon namespace prefix.
 * @returns {object} Full Attachable JSON object.
 */
function buildArmorAttachable(assetName, piece, geoIdentifier, namespace = 'custom') {
  const p = piece.toLowerCase();
  if (!isValidArmorPiece(p)) {
    throw new Error(`[armor_builder] Invalid armor piece "${piece}". Expected helmet|chestplate|leggings|boots.`);
  }

  const cleanNs = (namespace || 'custom').replace(/[^a-zA-Z0-9_]/g, '');
  const cleanAsset = assetName.replace(/[^a-zA-Z0-9_]/g, '');
  const identifier = `${cleanNs}:${cleanAsset}`;
  const cfg = ARMOR_PIECES[p];

  return {
    format_version: '1.10.0',
    'minecraft:attachable': {
      description: {
        identifier,
        materials: {
          default: 'armor',
          enchanted: 'armor_enchanted',
        },
        textures: {
          default: `textures/models/armor/${cleanAsset}`,
          enchanted: 'textures/misc/enchanted_item_glint',
        },
        geometry: {
          default: geoIdentifier,
        },
        scripts: {
          parent_setup: `variable.${cfg.parentBone} = player_root;`,
        },
        render_controllers: ['controller.render.armor'],
      },
    },
  };
}

/**
 * Generates the Behavior Pack Item JSON (`minecraft:item`) for an armor piece.
 *
 * Implements:
 *   - `minecraft:wearable`: slot configuration (`slot.armor.head`, etc.).
 *   - `minecraft:armor`: protection point value.
 *   - `minecraft:durability`: max damage durability.
 *   - `minecraft:creative_category`: placed in EQUIPMENT tab.
 *
 * @param {string} assetName      - Asset name, e.g. "warden_armor_helmet".
 * @param {string} piece          - 'helmet' | 'chestplate' | 'leggings' | 'boots'.
 * @param {string} [namespace='custom'] - Addon namespace prefix.
 * @param {string} [displayName]  - Friendly in-game item name. Defaults to capitalized asset name.
 * @returns {object} Full Behavior Pack Item JSON object.
 */
function buildArmorBehaviorItem(assetName, piece, namespace = 'custom', displayName) {
  const p = piece.toLowerCase();
  if (!isValidArmorPiece(p)) {
    throw new Error(`[armor_builder] Invalid armor piece "${piece}". Expected helmet|chestplate|leggings|boots.`);
  }

  const cleanNs = (namespace || 'custom').replace(/[^a-zA-Z0-9_]/g, '');
  const cleanAsset = assetName.replace(/[^a-zA-Z0-9_]/g, '');
  const identifier = `${cleanNs}:${cleanAsset}`;
  const cfg = ARMOR_PIECES[p];

  const friendlyName = displayName || cleanAsset
    .split('_')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return {
    format_version: '1.20.80',
    'minecraft:item': {
      description: {
        identifier,
        menu_category: {
          category: 'equipment',
          group: 'itemGroup.name.armor',
        },
      },
      components: {
        'minecraft:display_name': {
          value: friendlyName,
        },
        'minecraft:icon': {
          texture: cleanAsset,
        },
        'minecraft:max_stack_size': 1,
        'minecraft:wearable': {
          slot: cfg.wearableSlot,
          dispensable: true,
        },
        'minecraft:armor': {
          protection: cfg.defense,
        },
        'minecraft:durability': {
          max_durability: cfg.durability,
        },
        'minecraft:repairable': {
          repair_items: [
            {
              items: ['minecraft:diamond', 'minecraft:netherite_ingot', identifier],
              repair_amount: `context.other->query.remaining_durability + ${Math.round(cfg.durability * 0.25)}`,
            },
          ],
        },
        'minecraft:enchantable': {
          value: 10,
          slot: 'armor_' + p,
        },
      },
    },
  };
}

/**
 * Saves generated armor files into their appropriate subdirectories within an output folder.
 *
 * Folder layout:
 *   <outputDir>/
 *     attachables/<assetName>.json
 *     bp_items/<assetName>.json
 *
 * @param {string} outputDir      - Target output directory.
 * @param {string} assetName      - Asset name, e.g. "warden_armor_helmet".
 * @param {object} attachableJson - Object returned by buildArmorAttachable.
 * @param {object} bpItemJson     - Object returned by buildArmorBehaviorItem.
 * @returns {{ attachablePath: string, bpItemPath: string }}
 */
function saveArmorFiles(outputDir, assetName, attachableJson, bpItemJson) {
  const attachableDir = path.join(outputDir, 'attachables');
  const bpItemDir = path.join(outputDir, 'bp_items');

  fs.mkdirSync(attachableDir, { recursive: true });
  fs.mkdirSync(bpItemDir, { recursive: true });

  const attachablePath = path.join(attachableDir, `${assetName}.json`);
  const bpItemPath = path.join(bpItemDir, `${assetName}.json`);

  fs.writeFileSync(attachablePath, JSON.stringify(attachableJson, null, 2) + '\n', 'utf8');
  fs.writeFileSync(bpItemPath, JSON.stringify(bpItemJson, null, 2) + '\n', 'utf8');

  return { attachablePath, bpItemPath };
}

// ---------------------------------------------------------------------------
// Module Exports
// ---------------------------------------------------------------------------

module.exports = {
  ARMOR_PIECES,
  HUMANOID_ARMOR_BONES,
  isValidArmorPiece,
  getArmorBoneTemplate,
  isArmorRequest,
  buildArmorAttachable,
  buildArmorBehaviorItem,
  saveArmorFiles,
};
