import { useEffect } from "react";

interface SEOProps {
  title: string;
  description: string;
  canonical?: string;
  image?: string | null;
  /** Add noemailindex to prevent email scraping by bots */
  noEmailIndex?: boolean;
  /** JSON-LD structured data (any number of objects). Rendered into <script type="application/ld+json"> tags. */
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
}

function upsertMeta(selector: string, attr: 'name' | 'property', key: string, value: string) {
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function upsertJsonLd(items: Array<Record<string, unknown>>) {
  document.querySelectorAll('script[type="application/ld+json"][data-managed="seo-component"]').forEach(el => el.remove());
  for (const obj of items) {
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-managed', 'seo-component');
    script.text = JSON.stringify(obj);
    document.head.appendChild(script);
  }
}

/**
 * Simple SEO component that updates document title and meta description.
 * For a Vite SPA, this is sufficient for basic SEO on directory pages.
 * The meta description will be picked up by search engines on crawl.
 */
export function SEO({ title, description, canonical, image, noEmailIndex, jsonLd }: SEOProps) {
  useEffect(() => {
    // Update document title
    const fullTitle = title.includes("Martha's Vineyard IT")
      ? title
      : `${title} | Martha's Vineyard IT`;
    document.title = fullTitle;

    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement("meta");
      metaDescription.setAttribute("name", "description");
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute("content", description);

    // Update or create canonical link + og:url (always aligned)
    if (canonical) {
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.setAttribute("rel", "canonical");
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.setAttribute("href", canonical);
      upsertMeta('meta[property="og:url"]', 'property', 'og:url', canonical);
    }

    // Update Open Graph tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement("meta");
      ogTitle.setAttribute("property", "og:title");
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute("content", fullTitle);

    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement("meta");
      ogDescription.setAttribute("property", "og:description");
      document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute("content", description);

    // Update or create Open Graph image
    if (image) {
      let ogImage = document.querySelector('meta[property="og:image"]');
      if (!ogImage) {
        ogImage = document.createElement("meta");
        ogImage.setAttribute("property", "og:image");
        document.head.appendChild(ogImage);
      }
      ogImage.setAttribute("content", image);

      // Also add Twitter card image
      let twitterImage = document.querySelector('meta[name="twitter:image"]');
      if (!twitterImage) {
        twitterImage = document.createElement("meta");
        twitterImage.setAttribute("name", "twitter:image");
        document.head.appendChild(twitterImage);
      }
      twitterImage.setAttribute("content", image);

      // Add twitter card type
      let twitterCard = document.querySelector('meta[name="twitter:card"]');
      if (!twitterCard) {
        twitterCard = document.createElement("meta");
        twitterCard.setAttribute("name", "twitter:card");
        document.head.appendChild(twitterCard);
      }
      twitterCard.setAttribute("content", "summary_large_image");
    }

    // Render JSON-LD structured data (replaces any prior managed scripts)
    if (jsonLd) {
      const items = Array.isArray(jsonLd) ? jsonLd : [jsonLd];
      upsertJsonLd(items);
    }

    // Add noemailindex directive for directory pages (anti-scraping protection)
    if (noEmailIndex) {
      let robotsMeta = document.querySelector('meta[name="robots"]');
      if (!robotsMeta) {
        robotsMeta = document.createElement("meta");
        robotsMeta.setAttribute("name", "robots");
        document.head.appendChild(robotsMeta);
      }
      // Preserve existing directives, add noemailindex
      const currentContent = robotsMeta.getAttribute("content") || "";
      if (!currentContent.includes("noemailindex")) {
        const newContent = currentContent
          ? `${currentContent}, noemailindex`
          : "index, follow, noemailindex";
        robotsMeta.setAttribute("content", newContent);
      }
    }

  }, [title, description, canonical, image, noEmailIndex, jsonLd]);

  return null;
}
