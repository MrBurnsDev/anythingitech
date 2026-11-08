import { ReactNode } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import "./app-studio.css";

/**
 * Integration wrapper for the migrated MV App Studio pages.
 *
 * Drop-in replacement for the source repo's <Layout>: it supplies MVIT's own
 * header, footer, and background (via SiteLayout) while wrapping the migrated
 * content in `.app-studio`, which scopes the original MV App Studio design
 * tokens and typography (see app-studio.css) so the showcase, device mockups,
 * and animations render exactly as they did on mvappstudio.com — without
 * affecting any other MVIT page.
 */
export function AppStudioLayout({ children }: { children: ReactNode }) {
  return (
    <SiteLayout>
      <div className="app-studio">{children}</div>
    </SiteLayout>
  );
}
