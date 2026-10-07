const COMMAND_PATTERN = /^\/mcmodel(?=\s|$)/i;
const FLAG_PATTERN = /(^|\s)--(block|entity|texture)(?=\s|$)/gi;

function parseCommand(input) {
  const result = {
    isCommand: false,
    mode: "block",
    generateTexture: false,
    cleanPrompt: ""
  };

  if (typeof input !== "string") {
    return result;
  }

  const trimmed = input.trim();
  const match = trimmed.match(COMMAND_PATTERN);

  if (!match) {
    result.cleanPrompt = trimmed;
    return result;
  }

  let mode = "block";
  let generateTexture = false;

  const remainder = trimmed.slice(match[0].length).replace(FLAG_PATTERN, (full, lead, flag) => {
    const name = flag.toLowerCase();
    if (name === "texture") {
      generateTexture = true;
    } else {
      mode = name;
    }
    return lead;
  });

  result.isCommand = true;
  result.mode = mode;
  result.generateTexture = generateTexture;
  result.cleanPrompt = remainder.replace(/[ \t]{2,}/g, " ").trim();

  return result;
}

module.exports = { parseCommand };
