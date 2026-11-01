// ============================================
// アフィリエイト情報（広告案件）
// ※ エージェントの公式情報（agents.ts）とは完全に別管理です。
//
// 【更新方法】ASPで提携が「承認」されたら、該当エージェントの行を次のように書き換えます。
//   status: "approved"
//   affiliateUrl: "ASPで発行されたURL"
//   asp / programId / rewardYen / rewardCondition / lastCheckedAt もASPの画面で確認して入力
//
// 【ルール】
// - status が "approved" かつ affiliateUrl がある時だけ、アフィリエイトリンクが使われます。
//   それ以外は公式サイトへの通常リンクになります。
// - 成果報酬額・成果条件は、ASPの画面で確認できるまで null のままにしてください（推測で入力しない）。
// - このファイルの内容は、比較表の並び順・診断の適合度に一切影響しません。
// ============================================

import type { AffiliateInfo } from "../types";

const none = (agentId: string): AffiliateInfo => ({
  agentId,
  asp: null,
  programId: null,
  rewardYen: null,
  rewardCondition: null,
  status: "none",
  affiliateUrl: null,
  pixelSrc: null,
  lastCheckedAt: null,
});

export const AFFILIATES: Record<string, AffiliateInfo> = {
  levtech: none("levtech"),
  geechs: none("geechs"),
  itpro: none("itpro"),
  // A8.net（提携承認済み）。URL・計測用画像は、A8から提供された文字列をそのまま使用（改変しない）
  midworks: {
    agentId: "midworks",
    asp: "A8.net",
    programId: null, // ASPの画面で確認できるまで空欄（推測で入力しない）
    rewardYen: null,
    rewardCondition: null,
    status: "approved",
    affiliateUrl: "https://px.a8.net/svt/ejp?a8mat=4BGAV0+35PU3E+3TVC+BX3J6",
    pixelSrc: "https://www19.a8.net/0.gif?a8mat=4BGAV0+35PU3E+3TVC+BX3J6",
    lastCheckedAt: "2026-11-01",
  },
  pebank: {
    agentId: "pebank",
    asp: "A8.net",
    programId: null,
    rewardYen: null,
    rewardCondition: null,
    status: "approved",
    affiliateUrl: "https://px.a8.net/svt/ejp?a8mat=4BGAV0+3ITDEI+3SLI+5YJRM",
    pixelSrc: "https://www17.a8.net/0.gif?a8mat=4BGAV0+3ITDEI+3SLI+5YJRM",
    lastCheckedAt: "2026-11-01",
  },
};

/** 提携承認済みで、使えるURLがある場合のみ返す */
export function getApprovedAffiliate(agentId: string): AffiliateInfo | null {
  const a = AFFILIATES[agentId];
  if (a && a.status === "approved" && a.affiliateUrl) return a;
  return null;
}

/** 1件でも承認済みの広告があるか（広告表記の出し分け用） */
export function hasAnyApprovedAffiliate(): boolean {
  return Object.keys(AFFILIATES).some((id) => getApprovedAffiliate(id) !== null);
}
