export const dynamic = "force-dynamic";

import type { MetadataRoute } from "next";
import { fetchSeoConfig } from "@/lib/metadata-generator";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seoConfig = await fetchSeoConfig();

  // Prefer explicit canonical base, fall back to deployment URL env var
  const base = (
    seoConfig.canonicalBase ||
    process.env.NEXT_PUBLIC_API_URL ||
    ""
  ).replace(/\/$/, "");

  // Filter out blanks — an empty Disallow: entry blocks the entire site
  const disallow = (seoConfig.robots.disallowPaths ?? []).filter(Boolean);

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        ...(disallow.length > 0 ? { disallow } : {}),
      },
    ],
    ...(seoConfig.robots.includeSitemap && base
      ? { sitemap: `${base}/sitemap.xml` }
      : {}),
  };
}
