/**
 * This code is modified version of WAE parser
 * @licence MIT
 * @author indix
 * @see https://github.com/raine/web-auto-extractor/blob/master/src/parsers/metatag-parser.js
 */

const keyAttributes = new Set(["name", "property", "itemprop", "http-equiv"]);

/**
 * @param {Document} document
 * @returns {Record<string, string[]>}
 */
export function metaTags(document) {
  const result = new Map();
  for (const elem of document.querySelectorAll("meta")) {
    const nameKey = elem.getAttributeNames().find(attr => keyAttributes.has(attr));
    if (!nameKey) continue;

    const name = elem.getAttribute(nameKey);
    const value = elem.getAttribute("content")?.trim();
    const data = result.get(name) ?? [];
    data.push(value);
    result.set(name, data);
  }
  return Object.fromEntries(result);
}
