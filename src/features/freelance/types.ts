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
  /** official=エージェント公式サイト / third_party=第三者メディア */
  kind: "official" | "third_party";
  /** 情報の時点（分かる範囲で。不明なら省略） */
  asOf?: string;
}

/** 値 + 出典 + 補足。出典が第三者のみの項目は、画面で「公式未確認」と表示されます */
export interface Fact<T> {
  value: T;
  sources: Source[];
  note?: string;
}

/** 公開案件数。公式サイトの表記と第三者調査値は混ぜずに分けて持ちます */
export interface JobCountInfo {
  official?: { text: string; asOf: string; source: Source };
  thirdParty?: { value: number; asOf: string; source: Source };
  note?: string;
}

export interface Agent {
  id: string;
  name: string;
  /** 並び順用の読み（五十音順。広告とは無関係） */
  kana: string;
  operator: string;
  officialUrl: string;

  /** 公式サイト等で取扱いを確認した言語（含まれない言語は「未確認」であり「非対応」ではない） */
  languages: Fact<LangKey[]>;
  /** Java案件の「有無」とは別に、案件数が確認できた場合のみ */
  javaInfo?: { label: string; count: number; asOf: string; official: boolean; source: Source };
  jobCount: JobCountInfo;
  /** フルリモート案件の掲載（原則として出社不要の案件）。割合は別項目で未確認のまま */
  fullRemote: Fact<Tri>;
  /** 「言語 × フルリモート」の案件を確認できた言語（言語の取扱いとは別に管理） */
  fullRemoteLanguages: Fact<LangKey[]>;
  /** リモート相談可能（一部出社・出社頻度の相談を含む）。フルリモートとは別項目 */
  remoteConsult: Fact<Tri>;
  /** 実務経験：各社共通の登録条件としては扱わない。案件ごとに異なる */
  experience: {
    /** エージェント自体の登録条件として公式に明記されている場合のみ */
    agencyCondition: string | null;
    /** 個別案件の条件の例（個別案件であることを明記して表示） */
    caseExample?: { text: string; source: Source };
  };
  weekly3OrLess: Fact<Tri>;
  paymentSite: Fact<string | null>;
  benefits: Fact<string | null>;
  regions: Fact<{
    label: string;
    /** 案件の所在地を確認できた地域 */
    keys: RegionKey[];
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
