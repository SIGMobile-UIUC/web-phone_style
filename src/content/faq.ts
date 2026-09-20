// The "Join us" chat in the Messages app. Each entry becomes a quick-reply button (the question) and a reply (the answer).
// Edit the wording freely. In an answer you can use these placeholders, which the app fills in for you:
//   {{meeting}}  -> "Wednesdays 6:00–8:00 PM CT · Location TBA"   (from the term file)
//   {{term}}     -> "Fall 2026"
//   {{projects}} -> "Virtual Pet App, Language Learning App, …"
// `cta` adds a button under the answer.

export type Faq = { id: string; question: string; answer: string; cta?: "discord" | "instagram" };

export const greeting = "Hi! I'm the SIGMobile bot. Tap a question and I'll tell you all about us.";

export const faq: Faq[] = [
  {
    id: "what",
    question: "What is SIGMobile?",
    answer:
      "SIGMobile is the mobile and cross-platform app development Special Interest Group (SIG) under ACM at UIUC. We work on both semester and year-long projects, in various frameworks and programming languages.",
  },
  {
    id: "experience",
    question: "Do I need experience?",
    answer:
      "You get access to resources to explore all aspects of mobile development, and we encourage you to take the time to learn one thing really well. Not sure where to start? Ask us on Discord!",
    cta: "discord",
  },
  { id: "when", question: "When do you meet?", answer: "Our weekly meeting: {{meeting}}." },
  { id: "projects", question: "What are you building?", answer: "This semester ({{term}}): {{projects}}." },
  {
    id: "join",
    question: "How do I join?",
    answer: "Join our Discord — that's the best way to connect with the team and hear about meetings.",
    cta: "discord",
  },
];
