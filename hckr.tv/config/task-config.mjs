import OpenProps from "open-props";
import jitProps from "postcss-jit-props";

export default {
  html: true,
  images: true,
  cloudflare: true,
  cloudinary: false,
  fonts: true,
  static: true,
  svgSprite: true,
  esbuild: true,

  stylesheets: {
    postcss: {
      plugins: [jitProps(OpenProps)],
    },
  },
};
