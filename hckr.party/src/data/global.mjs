export default {meta: {
    lang: "en",
    title: "HCKR.party",
    description: "Party as a service.",
    url: "https://hckr.party/",
  },
  get currentYear() {
    return Temporal.Now.plainDateISO().year;
  }
};
