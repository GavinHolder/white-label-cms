"use client";

interface ClientLayoutProps {
  children: React.ReactNode;
  showNavigation: boolean;
}

/**
 * ClientLayout wraps page content.
 *
 * For public pages (showNavigation=true): renders a scroll-snap container div.
 * Scroll snap is on this wrapper instead of html because Chromium doesn't
 * reliably support scroll-snap-type on the viewport scroll container.
 *
 * For admin pages (showNavigation=false): pure pass-through, no snap.
 */
export default function ClientLayout({ children, showNavigation }: ClientLayoutProps) {
  if (!showNavigation) {
    return <>{children}</>;
  }

  return (
    <div id="snap-container">
      {children}
    </div>
  );
}
