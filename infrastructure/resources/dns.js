import cloudflare from "@pulumi/cloudflare";

export function registerRedirectRecords(projectName, zone, recordName) {
  new cloudflare.Record(
    `${projectName}/redirect-dns-record-a`,
    {
      zoneId: zone.id,
      name: recordName,
      type: "A",
      content: "192.0.2.1",
      ttl: 1,
      proxied: true,
    },
    { dependsOn: [zone] },
  );

  new cloudflare.Record(
    `${projectName}/redirect-dns-record-aaaa`,
    {
      zoneId: zone.id,
      name: recordName,
      type: "AAAA",
      content: "100::",
      ttl: 1,
      proxied: true,
    },
    { dependsOn: [zone] },
  );
}
