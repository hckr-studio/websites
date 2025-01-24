import cloudflare from "@pulumi/cloudflare";

export function createDnsZone(account) {
  const zone = new cloudflare.Zone(
    "hckr.tv",
    {
      accountId: account.id,
      plan: "free",
      zone: "hckr.tv",
    },
    { protect: true },
  );

  return { zone };
}
