"use client";

import { useState, useEffect } from "react";

interface ClientFeatureResult {
  enabled: boolean;
  config: Record<string, unknown>;
  loading: boolean;
}

/**
 * useClientFeature
 *
 * Fetches a client feature flag from /api/features/[slug].
 * Returns { enabled: false, config: {}, loading: false } if not found.
 *
 * ASSUMPTIONS:
 * 1. User is authenticated as SUPER_ADMIN (for admin pages)
 * 2. slug matches a registered ClientFeature record
 *
 * FAILURE MODES:
 * - Network failure → returns { enabled: false } (safe default)
 * - Feature not found → returns { enabled: false }
 */
export function useClientFeature(slug: string): ClientFeatureResult {
  const [result, setResult] = useState<ClientFeatureResult>({
    enabled: false,
    config: {},
    loading: true,
  });

  useEffect(() => {
    // Try admin endpoint first (returns full data when authenticated);
    // fall back to public endpoint for unauthenticated visitors on public pages.
    const fetchFeature = async () => {
      try {
        let res = await fetch(`/api/features/${slug}`);
        if (res.status === 401 || res.status === 403) {
          // Not an admin — use the public endpoint
          res = await fetch(`/api/features/public/${slug}`);
        }
        if (!res.ok) {
          setResult({ enabled: false, config: {}, loading: false });
          return;
        }
        const data = await res.json();
        if (data?.success && data.data) {
          setResult({ enabled: data.data.enabled, config: data.data.config ?? {}, loading: false });
        } else {
          setResult({ enabled: false, config: {}, loading: false });
        }
      } catch {
        setResult({ enabled: false, config: {}, loading: false });
      }
    };
    fetchFeature();
  }, [slug]);

  return result;
}
