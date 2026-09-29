export async function onRequestGet({ request }) {
  return fetch("https://mv.gov.cz/app/opendata/boards/SPS", request);
}
