async function retry(fetch, times) {
  let resp;
  do {
    resp = await fetch;
    if (resp.ok) return resp;
  } while (--times > 0);
  return resp;
}


export async function onRequestGet({request}) {
  return retry(fetch("http://mv.gov.cz/app/opendata/boards/SPS", {
    headers: {
      "Accept": "application/json",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
    }
  }), 10);
}
