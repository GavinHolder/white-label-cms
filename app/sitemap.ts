export const dynamic = "force-dynamic";

import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { fetchSeoConfig } from "@/lib/metadata-generator";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const seoConfig = await fetchSeoConfig();

  // Sitemaps require absolute URLs — prefer canonical base, fall back to env
  const base = (
    seoConfig.canonicalBase ||
    process.env.NEXT_PUBLIC_API_URL ||
    ""
  ).replace(/\/$/, "");

  // Without an absolute base we can't produce a valid sitemap
  if (!base) return [];

  // All published, indexable pages — including homepage slug "/"
  const pages = await prisma.page.findMany({
    where: { status: "PUBLISHED", noindex: false },
    select: { slug: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  return pages.map((p) => {
    const isHome = p.slug === "/" || p.slug === "";
    return {
      url: isHome ? base : `${base}/${p.slug.replace(/^\//, "")}`,
      lastModified: p.updatedAt,
      changeFrequency: (isHome ? "weekly" : "monthly") as MetadataRoute.Sitemap[0]["changeFrequency"],
      priority: isHome ? 1.0 : 0.7,
    };
  });
}
