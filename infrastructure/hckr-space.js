import cloudflare from "@pulumi/cloudflare";

export function createDnsZone(account) {
  const zone = new cloudflare.Zone(
    "hckr.space",
    {
      accountId: account.id,
      plan: "free",
      zone: "hckr.space",
    },
    { protect: true },
  );

  return { zone };
}
