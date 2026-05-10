import OpenProps from "open-props";
import jitProps from "postcss-jit-props";
import {wasmLoader} from "esbuild-plugin-wasm";

export default {
  html: true,
  images: true,
  cloudflare: true,
  cloudinary: false,
  fonts: true,
  static: true,
  svgSprite: true,
  esbuild: {
    options: {
      plugins: [wasmLoader()]
    }
  },

  stylesheets: {
    postcss: {
      plugins: [jitProps(OpenProps)],
    },
  }
};
