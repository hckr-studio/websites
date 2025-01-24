async function sendRaumeaContactForm(token, payload) {
  const resp = await fetch("https://api.postmarkapp.com/email", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Postmark-Server-Token": token,
    },
    body: JSON.stringify({
      From: "no-reply@hckr.studio",
      To: "info@raumea.cz",
      Subject: "Kontaktní formulář z webu raumea.cz",
      HtmlBody: `
        <p>Ahoj Michale,</p>
        <p>Někdo ti vyplnil kontaktní formulář na webu:</p>
        <dl>
            <dt>Jméno a příjmení</dt><dd>${payload.name}</dd>
            ${payload.company && `<dt>Společnost</dt><dd>${payload.company}</dd>`}
            <dt>E-mail</dt><dd>${payload.email}</dd>
            ${payload.phone && `<dt>Telefon</dt><dd>${payload.phone}</dd>`}
        </dl>

        <blockquote><p>${payload.message}</p></blockquote>

        <p>Tak měj hezký den a hodně štěstí.</p>
        <p>Tvoje hckr.studio</p>
      `,
      MessageStream: "outbound",
    }),
  });
}

/**
 * @param {EventContext<Env>} context
 */
export async function onRequestPost({ request, env }) {
  let url = new URL(request.url);
  const client = url.searchParams.get("client");
  const origin = request.headers.get("origin");
  if (client === "raumea.cz" && origin === "https://www.raumea.cz") {
    const raumeaToken = env.RAUMEA_POSTMARK_TOKEN;
    const payload = Object.fromEntries(await request.formData());
    await sendRaumeaContactForm(raumeaToken, payload);
    return new Response("ok", {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Max-Age": "86400",
      },
    });
  }
  return new Response(null, { status: 400 });
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Max-Age": "86400",
    },
  });
}
