// ============================================
// ページごとの title / description / 構造化データ / noindex を設定するフック
// ページを離れると元の値に戻します（お金シミュレーター側に影響を残さない）。
// canonical は src/lib/seo/CanonicalManager.tsx が全ページ共通で管理します。
// ============================================

import { useEffect } from "react";

interface HeadOptions {
  title: string;
  description: string;
  jsonLd?: Record<string, unknown>;
  noindex?: boolean;
}

export function useDocumentHead({ title, description, jsonLd, noindex }: HeadOptions) {
  const jsonLdText = jsonLd ? JSON.stringify(jsonLd) : "";

  useEffect(() => {
    const prevTitle = document.title;
    let desc = document.head.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const descCreated = !desc;
    const prevDesc = desc ? desc.content : "";
    if (!desc) {
      desc = document.createElement("meta");
      desc.name = "description";
      document.head.appendChild(desc);
    }
    document.title = title;
    desc.content = description;

    let robots: HTMLMetaElement | null = null;
    if (noindex) {
      robots = document.createElement("meta");
      robots.name = "robots";
      robots.content = "noindex";
      document.head.appendChild(robots);
    }

    let script: HTMLScriptElement | null = null;
    if (jsonLdText) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.text = jsonLdText;
      document.head.appendChild(script);
    }

    return () => {
      document.title = prevTitle;
      if (descCreated) desc && desc.remove();
      else if (desc) desc.content = prevDesc;
      if (robots) robots.remove();
      if (script) script.remove();
    };
  }, [title, description, noindex, jsonLdText]);
}

/** パンくずの構造化データ（ページ内容に合致するものだけ使用） */
export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
}
