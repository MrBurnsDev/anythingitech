import { useEffect } from "react";

interface DocumentMeta {
  title: string;
  description: string;
  canonical?: string;
  keywords?: string[];
}

function setMeta(name: string, content: string, useProperty = false) {
  const selector = useProperty
    ? `meta[property="${name}"]`
    : `meta[name="${name}"]`;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement("meta");
    if (useProperty) el.setAttribute("property", name);
    else el.setAttribute("name", name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", "canonical");
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function useDocumentMeta({ title, description, canonical, keywords }: DocumentMeta) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;
    setMeta("description", description);
    setMeta("og:title", title, true);
    setMeta("og:description", description, true);
    setMeta("twitter:title", title);
    setMeta("twitter:description", description);
    if (keywords && keywords.length) {
      setMeta("keywords", keywords.join(", "));
    }
    if (canonical) {
      setCanonical(canonical);
      setMeta("og:url", canonical, true);
    }
    return () => {
      document.title = previousTitle;
    };
  }, [title, description, canonical, keywords]);
}
