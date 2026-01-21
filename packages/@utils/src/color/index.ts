import { TinyColor } from "@ctrl/tinycolor";

function isValidColor(color?: string) {
  if (!color) {
    return false;
  }
  return new TinyColor(color).isValid;
}

export { isValidColor };

