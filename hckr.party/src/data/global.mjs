export default {meta: {
    lang: "en",
    title: "HCKR.party",
    description: "",
    url: "https://hckr.party/",
  },
  get currentYear() {
    return Temporal.Now.plainDateISO().year;
  }
};
