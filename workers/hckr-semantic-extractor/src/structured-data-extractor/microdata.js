/**
 * This code is modified version of Cucumber Microdata parser
 * @licence MIT
 * @author Cucumber
 * @see https://github.com/cucumber/microdata/blob/main/src/index.ts
 */

/**
 * @see https://html.spec.whatwg.org/multipage/microdata.html#values
 */
const attributeNameByTagName = new Map([
  ["meta", "content"],
  ["audio", "src"],
  ["embed", "src"],
  ["iframe", "src"],
  ["img", "src"],
  ["source", "src"],
  ["track", "src"],
  ["video", "src"],
  ["a", "href"],
  ["area", "href"],
  ["link", "href"],
  ["object", "data"],
  ["data", "value"],
  ["meter", "value"],
  ["time", "datetime"],
]);

function getItemType(itemType) {
  try {
    if (itemType) {
      return new URL(itemType).pathname.slice(1);
    }
  } catch (err) {}
  return ":nil";
}

/**
 * @param {Element} scope
 * @param {(element: Element) => string | undefined | null} extractValue
 * @param options
 * @returns {Record<string, any>}
 */
function extract(scope, extractValue, options) {
  const itemType = scope.getAttribute("itemtype");

  const microdata = new Map([
    ["@context", "https://schema.org"],
    ["@type", getItemType(itemType)],
  ]);
  const children = Array.from(scope.children);
  let child;

  while ((child = children.shift())) {
    const key = child.getAttribute("itemprop");
    if (key) {
      add(microdata, key, value(child, extractValue, options));
    }
    if (child.getAttribute("itemscope") === null) {
      prepend(children, child.children);
    }
  }

  return Object.fromEntries(microdata);
}

/**
 * @param {Map} microdata
 * @param {string} key
 * @param {any} value
 */
function add(microdata, key, value) {
  if (value === null) return;

  const prop = microdata.get(key);
  if (prop == null) microdata.set(key, value);
  else if (Array.isArray(prop)) prop.push(value);
  else microdata.set(key, [prop, value]);
}

/**
 * @param {Element} element
 * @param extractValue
 * @param options
 * @returns {T|number|*|boolean}
 */
function value(element, extractValue, options) {
  if (element.getAttribute("itemscope") !== null) {
    return extract(element, extractValue, options);
  }
  const attributeName = attributeNameByTagName.get(element.tagName.toLowerCase());
  const extractedValue = extractValue(element);
  const rawStringValue =
    extractedValue === undefined
      ? attributeName
        ? element.getAttribute(attributeName)
        : element.textContent
      : extractedValue;

  if (rawStringValue === null) {
    if (!options?.silentWarnings) {
      console.warn("Unable to extract value");
      console.log(element.outerHTML);
    }
    return null;
  }
  const stringValue = rawStringValue
    .trim()
    .split(/\n/)
    .map(s => s.trim())
    .join(" ");
  const itemType = element.getAttribute("itemtype");
  switch (itemType) {
    case null:
      return stringValue;
    case "https://schema.org/Text":
    case "https://schema.org/DateTime":
    case "https://schema.org/Date":
    case "https://schema.org/Time":
    case "https://schema.org/CssSelectorType":
    case "https://schema.org/PronounceableText":
    case "https://schema.org/URL":
    case "https://schema.org/XPathType":
      return stringValue;
    case "https://schema.org/Number":
    case "https://schema.org/Float":
    case "https://schema.org/Integer":
      return Number(stringValue);
    case "https://schema.org/Boolean":
      return stringValue === "true";
    case "https://schema.org/False":
      return false;
    case "https://schema.org/True":
      return true;
    default:
      if (!options?.silentWarnings) {
        console.warn(
          `Unable to extract value. Change itemtype to a primitive type or add itemscope on element ${element.outerHTML}`,
        );
      }
  }
}

/**
 * @param {Element[]} target
 * @param {HTMLCollection} addition
 */
function prepend(target, addition) {
  [].unshift.apply(target, [].slice.call(addition));
}

/**
 * @param {Document|Element} scope
 * @param {(element: Element) => string | undefined | null} extractValue
 * @param options
 * @returns {Record<string, any>[]}
 */
export function microdata(scope, extractValue = () => undefined, options) {
  const itemScopes = scope.querySelectorAll(`[itemscope]`);
  const result = [];
  for (const itemScope of itemScopes) {
    result.push(extract(itemScope, extractValue, options));
  }
  return result;
}
