/** URL-safe slug from a display title (strips ™ / ® / ©, lowercases, hyphenates). */
export function slugify(input: string): string {
  const s = input
    .replace(/[™®©]/gu, "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || "item";
}
