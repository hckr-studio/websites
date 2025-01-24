import cloudflare from "@pulumi/cloudflare";

import { registerRedirectRecords } from "./resources/dns.js";

export function createDnsZone(account) {
  const zone = new cloudflare.Zone(
    "trop.cz",
    {
      accountId: account.id,
      plan: "free",
      zone: "trop.cz",
    },
    { protect: true },
  );

  registerRedirectRecords("trop_cz", zone, "@");
  registerRedirectRecords("www_trop_cz", zone, "www");

  return { zone };
}
