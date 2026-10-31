// ============================================
// ページごとのcanonicalを、現在のURLから自動設定します。
// （index.htmlに固定のcanonicalを置くと全ページが同じURLを指してしまうため、
//   固定値は置かず、ここでルートごとに設定します）
//
// - お金シミュレーター： https://r-tool-lab.jp/income （末尾スラッシュなし）
// - フリーランスナビ  ： https://r-tool-lab.jp/freelance/agents/ （末尾スラッシュあり）
// ============================================

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ORIGIN = "https://r-tool-lab.jp";

export function buildCanonicalUrl(pathname: string): string {
  if (pathname === "/freelance" || pathname.startsWith("/freelance/")) {
    const p = pathname.replace(/\/+$/, "");
    return `${ORIGIN}${p}/`;
  }
  const p = pathname.replace(/\/+$/, "");
  return `${ORIGIN}${p === "" ? "/" : p}`;
}

export default function CanonicalManager() {
  const { pathname } = useLocation();
  useEffect(() => {
    let link = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = buildCanonicalUrl(pathname);
  }, [pathname]);
  return null;
}
