// ============================================
// フリーランスナビ 型定義
// 「公式情報（Agent）」と「広告情報（AffiliateInfo）」は別の型・別ファイルで管理します
// ============================================

/** あり / 限定的 / なし / 未確認 */
export type Tri = "yes" | "limited" | "no" | "unknown";

export type LangKey = "java" | "csharp" | "php" | "python" | "javascript";

export type RegionKey =
  | "kanto"
  | "tokai"
  | "kansai"
  | "kyushu"
  | "tohoku_hokkaido"
  | "chugoku_shikoku";

/** 情報の出典 */
export interface Source {
  label: string;
  url: string;
  /** official=エージェント公式 / third_party=第三者メディア */
  kind: "official" | "third_party";
  /** 情報の時点（分かる範囲で。不明なら省略） */
  asOf?: string;
}

/** 値 + 出典 + 補足 */
export interface Fact<T> {
  value: T;
  sources: Source[];
  note?: string;
}

export interface Agent {
  id: string;
  name: string;
  /** 並び順用の読み（五十音順。広告とは無関係） */
  kana: string;
  operator: string;
  officialUrl: string;

  /** 取り扱いを確認できた言語（含まれない言語は「未確認」であり「なし」ではない） */
  languages: Fact<LangKey[]>;
  javaJobCount?: { count: number; asOf: string; source: Source };
  jobCount: Fact<number | null> & { asOf?: string };
  fullRemote: Fact<Tri>;
  /** 「リモート相談可能」。フルリモートとは別項目 */
  remoteConsult: Fact<Tri>;
  minExperienceYears: Fact<number | null>;
  weekly3OrLess: Fact<Tri>;
  paymentSite: Fact<string | null>;
  benefits: Fact<string | null>;
  regions: Fact<{
    label: string;
    keys: RegionKey[];
    /** 全国対応と明記されている場合 true */
    nationwide?: boolean;
    /** 一覧が網羅的な場合のみ true（「など」付きの場合は false） */
    exhaustive: boolean;
  } | null>;
}

/** アフィリエイト情報（Agentとは別管理） */
export interface AffiliateInfo {
  agentId: string;
  asp: string | null;
  programId: string | null;
  /** 成果報酬額（円）。未確認ならnull。推測で入れない */
  rewardYen: number | null;
  rewardCondition: string | null;
  /** none=未提携 / pending=申請中 / approved=提携承認済み */
  status: "none" | "pending" | "approved";
  affiliateUrl: string | null;
  /** ASPのトラッキング用1x1画像（任意） */
  pixelSrc?: string | null;
  lastCheckedAt: string | null;
}
