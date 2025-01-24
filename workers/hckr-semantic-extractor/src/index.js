import { DOMParser } from "linkedom/cached";
import { parseStructuredData } from "./structured-data-extractor";

function parseHTML(text) {
  const parser = new DOMParser();
  const document = parser.parseFromString(text, "text/html");
  return { document };
}

export default {
  /*
   * @param {Request} request
   * @param {Env} env
   * @param {ExecutionContext} ctx
   */
  async fetch(request, env, ctx) {
    const { searchParams } = new URL(request.url);
    if (searchParams.get("token") !== env.SEMANTIC_EXTRACTOR_SECRET) {
      return new Response(null, { status: 401 });
    }
    if (!searchParams.has("url")) {
      return new Response(null, { status: 400 });
    }

    const url = searchParams.get("url");
    console.log(`Extracting structured data from ${url}`);
    const resp = await fetch(url, {
      headers: {
        "user-agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-encoding": "gzip, deflate, br, zstd",
        "accept-language": "en-US,en;q=0.9",
        dnt: "1",
        "sec-ch-ua": `"Chromium";v="131", "Not_A Brand";v="24"`,
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": `"macOS"`,
      },
    });
    const html = await resp.text();
    const { document } = parseHTML(html);
    const result = parseStructuredData(document, { base: url });
    const { lang } = document.documentElement;
    const title = document.title.trim();
    return Response.json({ url, title, lang, ...result });
  },
};
