/**
 * This code is modified version of WAE parser
 * @licence MIT
 * @author indix
 * @see https://github.com/raine/web-auto-extractor/blob/master/src/parsers/jsonld-parser.js
 */
import { parse as parseJSONC } from "jsonc-parser";

/**
 * @param {Element} el
 */
function parse(el) {
  const parsedJSON = parseJSONC(el.textContent);
  if (Array.isArray(parsedJSON)) return parsedJSON;
  return [parsedJSON];
}

/**
 * @param {Document} document
 * @param options
 * @returns {Record<string, any>}
 */
export function jsonLd(document, options) {
  const result = new Map();
  for (const script of document.querySelectorAll('script[type="application/ld+json"]')) {
    try {
      for (const obj of parse(script)) {
        const type = obj["@type"];
        if (!type) continue;
        const data = result.get(type) ?? [];
        data.push(obj);
        result.set(type, data);
      }
    } catch (err) {
      if (!options.silentWarnings) {
        console.error("Error in jsonld parse", err);
        console.log(script.outerHTML);
      }
    }
  }
  return Object.fromEntries(result);
}
