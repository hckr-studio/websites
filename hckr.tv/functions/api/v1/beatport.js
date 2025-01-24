/**
 * @param {EventContext<Env>} context
 */
export async function onRequestGet({ request }) {
  const qs = new URL(request.url).searchParams;
  const params = new URLSearchParams({
    q: qs.get("track"),
    type: "tracks",
    per_page: 1,
  });
  /** @type Response */
  const resp = await fetch(`https://api.beatport.com/v4/catalog/search/?${params}`, {
    method: "GET",
    headers: { Accept: "application/json" },
  });
  let data = await resp.json();
  console.log({ response: data });
  const { tracks } = data;
  if (!tracks.length) {
    return new Response(null, { status: 404 });
  }
  const [track] = tracks;
  return Response.json({
    "@context": "https://schema.org",
    "@type": "MusicRecording",
    byArtist: track.artists.map(artist => ({
      "@type": "MusicGroup",
      name: artist.name,
    })),
    name: track.name,
    version: track.mix_name,
    genre: track.genre.name,
    url: `https://www.beatport.com/track/${track.slug}/${track.id}`,
    image: track.release.image.uri,
  });
}
