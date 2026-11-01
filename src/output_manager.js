const fs = require("fs");
const path = require("path");

/**
 * Resolves a dedicated versioned output directory for a model or skin asset.
 * 
 * Rules:
 * - Each asset gets its own subfolder in the output directory: `output/<asset_name>_v1/`
 * - When an edit/revision is requested (or when an existing version is detected),
 *   it increments to `output/<asset_name>_v2/`, `output/<asset_name>_v3/`, etc.
 * 
 * @param {string} baseOutputDir - Base output root (e.g. "./output")
 * @param {string} assetName - Sanitized asset name e.g. "street_lamp"
 * @param {object} [options] - Optional settings
 * @param {boolean} [options.isRevision] - Explicit flag indicating this is a revision
 * @param {string} [options.explicitVersion] - Explicit version string e.g. "v1", "v2"
 * @returns {{ dirPath: string, version: string, assetName: string }}
 */
function resolveModelOutputDir(baseOutputDir, assetName, options = {}) {
  const root = path.resolve(baseOutputDir || "./output");
  if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }

  const cleanName = String(assetName || "asset")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (options.explicitVersion) {
    const v = options.explicitVersion.startsWith("v")
      ? options.explicitVersion
      : `v${options.explicitVersion}`;
    const targetDir = path.join(root, `${cleanName}_${v}`);
    fs.mkdirSync(targetDir, { recursive: true });
    return { dirPath: targetDir, version: v, assetName: cleanName };
  }

  // Scan existing directories in output root matching cleanName or cleanName_v<N>
  const entries = fs.readdirSync(root, { withFileTypes: true });
  let maxVersion = 0;
  let hasUnversionedDir = false;

  const versionRegex = new RegExp(`^${cleanName}_v(\\d+)$`, "i");

  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (entry.name.toLowerCase() === cleanName) {
        hasUnversionedDir = true;
      }
      const match = entry.name.match(versionRegex);
      if (match) {
        const vNum = parseInt(match[1], 10);
        if (!isNaN(vNum) && vNum > maxVersion) {
          maxVersion = vNum;
        }
      }
    }
  }

  let chosenVersionNum = 1;

  if (options.isRevision) {
    // If revision explicitly requested:
    if (maxVersion > 0) {
      chosenVersionNum = maxVersion + 1;
    } else if (hasUnversionedDir) {
      chosenVersionNum = 2;
    } else {
      chosenVersionNum = 1;
    }
  } else {
    // If not explicitly marked as revision, check if v1 or unversioned exists with files
    if (maxVersion === 0 && !hasUnversionedDir) {
      chosenVersionNum = 1;
    } else {
      // Check if existing latest version folder has files
      const latestDir = maxVersion > 0
        ? path.join(root, `${cleanName}_v${maxVersion}`)
        : path.join(root, cleanName);
      
      const filesInLatest = fs.existsSync(latestDir) ? fs.readdirSync(latestDir) : [];
      if (filesInLatest.length > 0) {
        // Files already exist from previous generation -> create next version
        chosenVersionNum = Math.max(maxVersion + 1, hasUnversionedDir ? 2 : 1);
      } else {
        // Empty existing folder, reuse it
        chosenVersionNum = maxVersion > 0 ? maxVersion : 1;
      }
    }
  }

  const version = `v${chosenVersionNum}`;
  const dirPath = path.join(root, `${cleanName}_${version}`);
  fs.mkdirSync(dirPath, { recursive: true });

  return { dirPath, version, assetName: cleanName };
}

module.exports = { resolveModelOutputDir };
