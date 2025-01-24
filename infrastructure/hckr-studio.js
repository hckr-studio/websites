import cloudflare from "@pulumi/cloudflare";

export function createDnsZone(account) {
  const zone = new cloudflare.Zone(
    "hckr.studio",
    {
      accountId: account.id,
      plan: "free",
      zone: "hckr.studio",
    },
    { protect: true },
  );

  new cloudflare.Record("postmark-dkim-hckr.studio", {
    zoneId: zone.id,
    type: "TXT",
    name: "20240410132338pm._domainkey",
    comment: "Postmarkapp DKIM",
    content:
      "k=rsa;p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDCygwrolR01/Cw/Tdo4d09q0w0q33VdzmxSDWsi4puj5ibOvyXA66Qtub46rZBZ1kbJ3PDlfeTDMx/snkWVasEz6lEoDJ0h2+EMcbTKU+TAHSauVkB+s0aabas2ZAQkZkBN8qJ7yiVSugWpB0AooK5mPJJEHt+mmgP0Dxbar77/QIDAQAB",
  });
  new cloudflare.Record("postmark-return-path-hckr.studio", {
    zoneId: zone.id,
    type: "CNAME",
    name: "pm-bounces",
    comment: "Postmarkapp Return path",
    content: "pm.mtasv.net",
  });

  return { zone };
}
