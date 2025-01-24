import cloudflare from "@pulumi/cloudflare";

export function createDnsZone(account) {
  const zone = new cloudflare.Zone(
    "hckr.party",
    {
      accountId: account.id,
      plan: "free",
      zone: "hckr.party",
    },
    { protect: true },
  );

  return { zone };
}
