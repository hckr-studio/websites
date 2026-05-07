/**
 * Forwards Shazam API call with music signature to get metadata of recognized track.
 * Usage example see @link https://github.com/Inrixia/ShazamWoW/blob/c96349029a7dfce4ddb33dc34dd2eef7bd00bfff/src/InvisibleDropzone.tsx#L58-L72
 * @param signature {Signature}
 * @returns {ShazamData}
 */

export async function onRequestPost({ request }) {
  const params = new URLSearchParams({
    sync: true,
    webv3: true,
    sampling: true,
    connected: "",
    shazamapiversion: "v3",
    sharehub: true,
    hubv5minorversion: "v5.1",
    hidelb: true,
    video: "v3"
  });
  const resp = await fetch(`https://amp.shazam.com/discovery/v5/en-US/US/iphone/-/tag/${crypto.randomUUID()}/${crypto.randomUUID()}?${params}`,
    {
      headers: request.headers,
      method: request.method,
      body: request.body,
      redirect: "follow",
    });
  return new Response(resp.body, resp);
}
