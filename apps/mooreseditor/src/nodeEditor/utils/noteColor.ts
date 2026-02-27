export const DEFAULT_NOTE_COLOR = "#FFFACD";

const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/;

export function normalizeNoteColor(color: unknown): string {
  if (typeof color === "string" && HEX_COLOR_PATTERN.test(color)) {
    return color;
  }
  return DEFAULT_NOTE_COLOR;
}

export function getReadableTextColor(backgroundColor: unknown): string {
  const color = normalizeNoteColor(backgroundColor);
  const red = Number.parseInt(color.slice(1, 3), 16);
  const green = Number.parseInt(color.slice(3, 5), 16);
  const blue = Number.parseInt(color.slice(5, 7), 16);
  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255;

  return luminance > 0.6 ? "#333" : "#fff";
}
