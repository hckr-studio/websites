export async function onRequestGet({ request }) {
  const resp = await fetch("https://mv.gov.cz/app/opendata/boards/SPS", {
    headers: {
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    }
  });
  const data = await resp.json();
  return  Response.json(data);
}
