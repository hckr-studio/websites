# hckr_ websites

[![CircleCI](https://dl.circleci.com/status-badge/img/gh/hckr-studio/websites/tree/trunk.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/hckr-studio/websites/tree/trunk)

Monorepo for websites

## Development

You'll need Node.js to develop and build websites. We are using [yarn](https://yarnpkg.com/) for workspace management and automation.

```bash
cd hckr.studio
yarn start
```

## Build

Websites are built with [Blendid](https://github.com/hckr-studio/blendid) static website builder.

```bash
cd hckr.studio
yarn build
```

Build results are in `.blendid/public/hckr.studio`.

## Deploy

Websites are hosted on [Cloudflare Pages](https://pages.cloudflare.com/). Infrastructure is managed with [Pulumi](https://www.pulumi.com/).
Deployment pipeline runs on [CircleCI](https://app.circleci.com/pipelines/github/hckr-studio/websites).
