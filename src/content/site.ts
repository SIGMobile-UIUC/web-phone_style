// Club-wide facts that are not tied to a semester.

export const site = {
  name: "SIGMobile",
  tagline: "Mobile app development @ UIUC",
  /** All meeting times are wall-clock times in this IANA time zone, whatever the visitor's zone is. */
  timeZone: "America/Chicago",
  links: {
    discord: "https://discord.gg/A9RdGmVzZ3",
    instagram: "https://www.instagram.com/sigmobile.uiuc/",
  },
} as const;
