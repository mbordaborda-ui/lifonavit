import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/env";
import { LEGAL_PAGES } from "@/lib/legal";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getAppUrl();
  const now = new Date();

  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/producto`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...LEGAL_PAGES.map((page) => ({
      url: `${base}/politicas/${page.slug}`,
      lastModified: now,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
