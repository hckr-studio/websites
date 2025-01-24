import { texyTypography } from "@hckr_/blendid/lib/texy.mjs";
import OpenProps from "open-props";
import jitProps from "postcss-jit-props";

export default {
  images: true,
  cloudflare: true,
  cloudinary: false,
  fonts: true,
  static: true,
  svgSprite: true,
  esbuild: true,

  generate: {
    exclude: ["podcasts.json"],
    json: [
      {
        collection: "podcasts",
        stripTitle: true,
        transform(data, file) {
          return Object.assign({ filename: file.basename, slug: file.stem }, data);
        },
        mergeOptions: {
          concatArrays: true,
          edit(json) {
            return { [json.slug]: json };
          },
        },
      },
    ],
  },

  html: {
    data: { collections: ["podcasts"] },
    markedExtensions: [texyTypography("cs")],
  },

  stylesheets: {
    postcss: {
      plugins: [jitProps(OpenProps)],
    },
  },

  vite: {
    browser: "google chrome canary",
    browserArgs: "--ignore-certificate-errors --allow-insecure-localhost",
  },
};
