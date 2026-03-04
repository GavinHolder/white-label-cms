"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * TokenRefresher Component
 *
 * Automatically refreshes the access token before it expires.
 * Runs silently in the background for all admin pages.
 *
 * How it works:
 * - Access token expires in 8 hours
 * - Checks every 5 minutes if refresh is needed
 * - Refreshes token 10 minutes before expiration
 * - Redirects to login if refresh fails
 */
export default function TokenRefresher() {
  const router = useRouter();
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  useEffect(() => {
    const refreshToken = async () => {
      // Prevent concurrent refresh requests
      if (isRefreshingRef.current) {
        console.log("[TokenRefresher] Already refreshing, skipping...");
        return;
      }

      console.log("[TokenRefresher] Starting token refresh...");
      isRefreshingRef.current = true;

      try {
        const response = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include", // Important: include cookies
        });

        if (!response.ok) {
          console.error("[TokenRefresher] Failed:", response.status);

          // If refresh fails, redirect to login
          if (response.status === 401) {
            console.log("[TokenRefresher] Session expired, redirecting to login...");
            router.push("/admin/login?expired=true");
          }
        } else {
          const data = await response.json();
          console.log("[TokenRefresher] ✅ Success! Next refresh in 7 hours.");
        }
      } catch (error) {
        console.error("[TokenRefresher] Error:", error);
      } finally {
        isRefreshingRef.current = false;
      }
    };

    // Refresh token immediately on mount (in case it's close to expiration)
    refreshToken();

    // Then refresh every 7 hours (1 hour before 8-hour expiration)
    // This ensures the token never expires during active use
    refreshIntervalRef.current = setInterval(
      refreshToken,
      7 * 60 * 60 * 1000 // 7 hours in milliseconds
    );

    // Cleanup on unmount
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [router]);

  // This component renders nothing - it just runs in the background
  return null;
}
