function parseLinks(document, type) {
  const items = new Map();
  for (const link of document.querySelectorAll(`[${type}][href]`)) {
    const key = link.getAttribute(type);
    const val = link.getAttribute("href");
    if (!val) continue;
    const data = items.get(key) ?? [];
    data.push(val);
    items.set(key, data);
  }
  return Object.fromEntries(items);
}

/**
 * @param {Document} document
 * @returns {Record<string, string[]>}
 */
export function relLinks(document) {
  return parseLinks(document, "rel");
}

/**
 * @param {Document} document
 * @returns {Record<string, string[]>}
 */
export function revLinks(document) {
  return parseLinks(document, "rev");
}
