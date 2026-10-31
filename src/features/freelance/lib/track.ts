// ============================================
// 計測イベント送信
//
// - GA4（gtag）が導入されていれば gtag('event') で送信、
//   GTM（dataLayer）のみなら dataLayer.push で送信します。
// - どちらも無ければ何もしません（測定IDを推測して実装することはしません）。
// - すべてのイベントに service: "freelance-navi" を付けるので、
//   お金シミュレーターと同じGA4プロパティでも区別できます。
// - 「クリック」は成果（ASPで承認された成約）とは別の指標です。
// ============================================

import { ANALYTICS_SERVICE_LABEL } from "../config";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export type FreelanceEvent =
  | "freelance_compare_view" // エージェント比較ページの閲覧
  | "freelance_diagnosis_start" // 診断開始（フォームに最初に触れた時）
  | "freelance_diagnosis_complete" // 診断完了（結果を表示した時）
  | "freelance_agent_detail_click" // 詳細・出典を開いた時
  | "agent_outbound_click"; // エージェントのリンクのクリック（link_type で公式/広告を区別。成果ではない）

export function track(event: FreelanceEvent, params: Record<string, string | number | boolean | undefined> = {}) {
  try {
    const payload = { service: ANALYTICS_SERVICE_LABEL, ...params };
    if (typeof window.gtag === "function") {
      window.gtag("event", event, payload);
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event, ...payload });
    }
  } catch {
    // 計測の失敗でサイトの動作を止めない
  }
}
