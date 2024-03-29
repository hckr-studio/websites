import cloudflare from "@pulumi/cloudflare";
import pulumi from "@pulumi/pulumi";
import * as hckrSpace from "./hckr-space.js";
import * as hckrStudio from "./hckr-studio.js";
import * as hckrTv from "./hckr-tv.js";
import { createPages, createRedirect } from "./resources/pages.js";

const config = new pulumi.Config();

const account = new cloudflare.Account("rarous", {
  accountId: config.require("cloudflare-accountId"),
  name: "rarous",
  enforceTwofactor: true,
}, { protect: true });

const hckrSpaceZone = hckrSpace.createDnsZone(account);
const hckrStudioZone = hckrStudio.createDnsZone(account);
const hckrTvZone = hckrTv.createDnsZone(account);

const hckrSpacePages = createPages(account, hckrSpaceZone.zone, "@", "hckr-space");
const hckrStudioPages = createPages(account, hckrStudioZone.zone, "@", "hckr-studio");
const hckrTvPages = createPages(account, hckrTvZone.zone, "@", "hckr-tv");
const redirects = [
  createRedirect(account, hckrSpaceZone.zone, "www", "hckr_space", hckrSpacePages.domain.domain),
  createRedirect(account, hckrStudioZone.zone, "www", "hckr_studio", hckrStudioPages.domain.domain),
  createRedirect(account, hckrTvZone.zone, "www", "hckr_tv", hckrTvPages.domain.domain),
  // those are managed in another repositories, but Lists are global to the account
  ["rarous.net", "https://www.rarous.net"],
  ["hackercamp.cz", "https://www.hackercamp.cz"],
  ["hckr.camp", "https://www.hackercamp.cz"],
  ["www.hckr.camp", "https://www.hackercamp.cz"],
  ["donut.hckr.camp", "https://donut.hackercamp.cz"]
];

const list = new cloudflare.List(`hckr/redirect-list`, {
  accountId: account.id,
  kind: "redirect",
  name: `hckr_redirects`,
  items: redirects.map(([source, target]) => (
    {
      value: {
        redirects: [{
          sourceUrl: source,
          targetUrl: target,
          statusCode: 301,
          preserveQueryString: "enabled",
          includeSubdomains: "disabled",
          subpathMatching: "enabled",
          preservePathSuffix: "enabled",
        }],
      },
    }
  )),
});

const rulset = new cloudflare.Ruleset(`hckr/redirect-ruleset`, {
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
  hckrSpaceZoneId: hckrSpaceZone.zone.id,
  hckrStudioZoneId: hckrStudioZone.zone.id,
  hckrTvZoneId: hckrTvZone.zone.id,
  hckrSpaceHost: hckrSpacePages.domain.domain,
  hckrStudioHost: hckrStudioPages.domain.domain,
  hckrTvHost: hckrTvPages.domain.domain,
};
