// Text for the About app. Plain English, edit freely — no code changes needed.
// Source: SIGMobile Information Session slides (Fall 2026).

export const about = {
  headline: "Build real mobile apps, together.",
  intro:
    "SIGMobile is the mobile and cross-platform app development Special Interest Group (SIG) under ACM at UIUC.",

  offers: [
    {
      title: "Projects",
      text: "We work on both semester and year-long projects on app development, in various frameworks and programming languages.",
    },
    {
      title: "Talks & workshops",
      text: "Full-stack development, UI/UX design, systems design, branding and marketing, and the latest innovations in app development.",
    },
    {
      title: "Resources",
      text: "You get access to resources to explore all aspects of mobile development. We encourage you to take the time to learn one thing really well.",
    },
  ],

  /** "Ideal team" from the slides. */
  idealTeam: [
    { role: "Frontend", size: "1–2 members" },
    { role: "Backend", size: "1–2 members", note: "If two: one on API design, one on database design" },
    { role: "Design", size: "1 member" },
  ],

  /** "What makes a good app? Things to consider" from the slides. */
  considerations: [
    "Which stack to choose for frontend and backend, and why?",
    "Which database: SQL or NoSQL? Which flavor of SQL? Is a local database enough for your app?",
    "What is the design language of your app?",
  ],
};
