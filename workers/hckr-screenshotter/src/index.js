import puppeteer from "@cloudflare/puppeteer";

const headers = type => ({
  "Content-Type": `image/${type}`,
  "Cache-Control": "public, max-age=3600",
});

export default {
  /*
   * @param {Request} request
   * @param {Env} env
   * @param {ExecutionContext} ctx
   */
  async fetch(request, env, ctx) {
    const { searchParams } = new URL(request.url);
    if (searchParams.get("token") !== env.SCREENSHOTTER_SECRET) {
      return new Response(null, { status: 401 });
    }
    if (!searchParams.has("url")) {
      return new Response(null, { status: 400 });
    }

    const url = searchParams.get("url");

    const { value, metadata } = await env.imgCache.getWithMetadata(url, "arrayBuffer");
    if (value) {
      console.log(`found pre-rendered image in KV ${url}`);
      return new Response(value, { headers: metadata.headers });
    }

    const browser = await puppeteer.launch(env.browser);
    const page = await browser.newPage();

    page.on("response", resp => resp.ok() || console.log("ERROR:", resp.status(), resp.url(), resp.headers()));

    const waitUntil = searchParams.get("waitUntil") ?? "load";
    const width = searchParams.get("width") ?? searchParams.get("w");
    const height = searchParams.get("height") ?? searchParams.get("h");
    const dpr = searchParams.get("dpr") ?? "1";
    const selector = searchParams.get("selector");
    const fullPage = Boolean(searchParams.get("fullPage"));
    const type = searchParams.get("type") ?? "png";

    if (width && height) {
      await page.setViewport({
        width: Number.parseInt(width),
        height: Number.parseInt(height),
        deviceScaleFactor: Number.parseInt(dpr),
      });
    }
    await page.setExtraHTTPHeaders({
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
    });
    await page.goto(url, { waitUntil });
    const node = selector ? await page.waitForSelector(selector) : page;
    const buffer = await node.screenshot({
      fullPage,
      type,
      encoding: "binary",
    });

    // cache image for 12 hours
    await env.imgCache.put(url, buffer, {
      expirationTtl: 43_200,
      metadata: { headers: headers(type) },
    });

    await browser.close();
    return new Response(buffer, { headers: headers(type) });
  },
};
