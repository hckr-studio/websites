import cloudflare from "@pulumi/cloudflare";

import { registerRedirectRecords } from "./resources/dns.js";

export function createDnsZone(account) {
  const zone = new cloudflare.Zone(
    "twareg.cz",
    {
      accountId: account.id,
      plan: "free",
      zone: "twareg.cz",
    },
    { protect: true },
  );

  registerRedirectRecords("twareg_cz", zone, "@");
  registerRedirectRecords("www_twareg_cz", zone, "www");

  return { zone };
}
