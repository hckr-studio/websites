import cloudflare from "@pulumi/cloudflare";

import { registerRedirectRecords } from "./resources/dns.js";

export function createDnsZone(account) {
  const zone = new cloudflare.Zone(
    "xmonks.studio",
    {
      accountId: account.id,
      plan: "free",
      zone: "xmonks.studio",
    },
    { protect: true },
  );

  registerRedirectRecords("xmonks_studio", zone, "@");
  registerRedirectRecords("www_xmonks_studio", zone, "www");

  return { zone };
}
