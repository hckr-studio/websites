export default {
  meta: {
    lang: "en",
    title: "hckr.space",
    description: "",
    url: "https://hckr.space/",
  },
  podcasts: {
    list: ["data-talk", "kanarci-v-siti", "people-ops", "exec", "hra-skolou", "plodne-hovory", "appcast"],
  },
  get currentYear() {
    return Temporal.Now.plainDateISO().year;
  }
};
