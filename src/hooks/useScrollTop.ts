// ============================================
// ページ遷移時に自動でトップへスクロール
// Layout.tsxで使用
// ============================================

import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [pathname]);
}
