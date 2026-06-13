export default {
  meta: {
    lang: "en",
    title: "HCKR.tv",
    description: "",
    url: "https://hckr.tv/",
  },
  get currentYear() {
    return Temporal.Now.plainDateISO().year;
  }
};
