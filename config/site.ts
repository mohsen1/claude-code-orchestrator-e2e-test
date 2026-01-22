export const siteConfig = {
  name: "SplitSync",
  description: "Real-time expense sharing application with intelligent debt settlement calculation",
  url: process.env.NEXTAUTH_URL || "http://localhost:3000",
  ogImage: "https://splitsync.app/og.jpg",
  links: {
    twitter: "https://twitter.com/splitsync",
    github: "https://github.com/splitsync/splitsync",
    docs: "https://docs.splitsync.app",
  },
  creator: "SplitSync Team",
  keywords: [
    "expense sharing",
    "split bills",
    "group expenses",
    "debt settlement",
    "money tracking",
    "shared expenses",
  ],
  categories: ["finance", "productivity"],
} as const;

export type SiteConfig = typeof siteConfig;
