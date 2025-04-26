import cloudflare from "@pulumi/cloudflare";
import pulumi from "@pulumi/pulumi";
import * as hckrParty from "./hckr-party.js";
import * as hckrSpace from "./hckr-space.js";
import * as hckrStudio from "./hckr-studio.js";
import * as hckrTv from "./hckr-tv.js";
import { createPages, createRedirect } from "./resources/pages.js";
import * as tropCz from "./trop-cz.js";
import * as twaregCz from "./twareg-cz.js";
import * as xmonksStudio from "./xmonks-studio.js";

const config = new pulumi.Config();

const account = new cloudflare.Account(
  "rarous",
  {
    accountId: config.require("cloudflare-accountId"),
    name: "rarous",
    enforceTwofactor: true,
  },
  { protect: true },
);

// pulumi import cloudflare:index/zone:Zone example <zone_id>

const hckrPartyZone = hckrParty.createDnsZone(account);
const hckrSpaceZone = hckrSpace.createDnsZone(account);
const hckrStudioZone = hckrStudio.createDnsZone(account);
const hckrTvZone = hckrTv.createDnsZone(account);
const twaregCzZone = twaregCz.createDnsZone(account);
const tropCzZone = tropCz.createDnsZone(account);
const xmonksStudioZone = xmonksStudio.createDnsZone(account);

const hckrPartyPages = createPages(account, hckrPartyZone.zone, "@", "hckr-party");
const hckrSpacePages = createPages(account, hckrSpaceZone.zone, "@", "hckr-space");
const hckrStudioPages = createPages(account, hckrStudioZone.zone, "@", "hckr-studio", {
  productionConfiguration: {
    secrets: {
      RAUMEA_POSTMARK_TOKEN: config.require("raumea-postmark-token"),
    },
  },
});
const hckrTvPages = createPages(account, hckrTvZone.zone, "@", "hckr-tv");
const redirects = [
  createRedirect(account, hckrPartyZone.zone, "www", "hckr_party", hckrPartyPages.domain.domain),
  createRedirect(account, hckrSpaceZone.zone, "www", "hckr_space", hckrSpacePages.domain.domain),
  createRedirect(account, hckrStudioZone.zone, "www", "hckr_studio", hckrStudioPages.domain.domain),
  createRedirect(account, hckrTvZone.zone, "www", "hckr_tv", hckrTvPages.domain.domain),
  // those are managed in other repositories, but Lists are global to the account
  ["hackercamp.cz", "https://www.hackercamp.cz"],
  ["www.hckr.camp", "https://www.hackercamp.cz/"],
  ["twareg.cz", "https://hckr.studio"],
  ["www.twareg.cz", "https://hckr.studio"],
  ["trop.cz", "https://hckr.studio"],
  ["www.trop.cz", "https://hckr.studio"],
  ["atlas-as.cz", "https://hckr.studio"],
  ["www.atlas-as.cz", "https://hckr.studio"],
  ["xmonks.studio", "https://hckr.studio"],
  ["www.xmonks.studio", "https://hckr.studio"],
  ["rarous.net", "https://www.rarous.net/"],
  ["w3blogy.cz", "https://www.rarous.net/w3b/"],
  ["www.w3blogy.cz", "https://www.rarous.net/w3b/"],
  ["roubicek.name", "https://www.rarous.net/"],
];

const list = new cloudflare.List(`hckr/redirect-list`, {
  accountId: account.id,
  kind: "redirect",
  name: `hckr_redirects`,
  items: redirects.map(([source, target, code]) => ({
    value: {
      redirects: [
        {
          sourceUrl: source,
          targetUrl: target,
          statusCode: code ?? 301,
          preserveQueryString: "enabled",
          includeSubdomains: "disabled",
          subpathMatching: "enabled",
          preservePathSuffix: "enabled",
        },
      ],
    },
  })),
});

const ruleset = new cloudflare.Ruleset(`hckr/redirect-ruleset`, {
  accountId: account.id,
  description: "Redirects www to apex",
  name: `hckr_www_redirects`,
  kind: "root",
  phase: "http_request_redirect",
  rules: [
    {
      description: "Redirects www to apex",
      expression: list.name.apply(x => `http.request.full_uri in $${x}`),
      action: "redirect",
      actionParameters: {
        fromList: { key: "http.request.full_uri", name: list.name },
      },
      enabled: true,
    },
  ],
});

export default {
  accountId: account.id,
  hckrPartyZoneId: hckrPartyZone.zone.id,
  hckrSpaceZoneId: hckrSpaceZone.zone.id,
  hckrStudioZoneId: hckrStudioZone.zone.id,
  hckrTvZoneId: hckrTvZone.zone.id,
  hckrPartyHost: hckrPartyPages.domain.domain,
  hckrSpaceHost: hckrSpacePages.domain.domain,
  hckrStudioHost: hckrStudioPages.domain.domain,
  hckrTvHost: hckrTvPages.domain.domain,
};
