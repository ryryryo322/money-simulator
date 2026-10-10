// ============================================
// 自治体別 国民健康保険 制度設定 型定義
// ============================================
// 国保は自治体ごとに「算定方式」「料率」「均等割・平等割・資産割の有無」
// 「賦課限度額」が異なるため、全国共通の計算式を前提にしないデータ構造。
// 公式情報が確認できない区分は null にし、推測値で埋めない。
// ============================================

/** 1つの賦課区分（医療分・支援分・介護分）の設定 */
export interface BracketConfig {
  /** 所得割率（例: 0.0558 = 5.58%） */
  incomeRate: number;
  /** 均等割額（円/人・加入者全員が対象） */
  perCapitaYen: number;
  /** 平等割額（円/世帯）。採用していない自治体は0 */
  perHouseholdYen: number;
  /** 資産割率（固定資産税額に乗じる率）。採用していない自治体は0 */
  assetRate?: number;
  /** 賦課限度額（円） */
  maxYen: number;
}

/**
 * 子ども・子育て支援金分（令和8年度新設）の設定
 * 自治体により「18歳以上にのみ均等割が発生する方式」と
 * 「全加入者に均等割がかかり18歳以上にのみ追加額が乗る方式」の
 * 2パターンがあるため、両方を表現できるようにしている。
 */
export interface ChildBracketConfig extends BracketConfig {
  /** 18歳以上の加入者にのみ追加でかかる均等割額（円/人）。なければ0 */
  perCapitaAge18PlusYen: number;
}

export type DataCompleteness = "full" | "partial";

/** 自治体ごとの国保制度設定 */
export interface MunicipalityConfig {
  /** 内部識別用コード（スラッグ） */
  municipalityCode: string;
  prefecture: string;
  cityName: string;
  /** 対象年度（西暦）。例: 2026（令和8年度） */
  fiscalYear: number;
  /** この自治体の算定方式の説明（表示用。例:「3方式（所得割＋均等割＋平等割）」） */
  calculationMethodLabel: string;

  medical: BracketConfig;            // 医療分（基礎分）／全加入者対象
  support: BracketConfig;            // 支援分（後期高齢者支援金等分）／全加入者対象
  care: BracketConfig | null;        // 介護分／40〜64歳の加入者のみ。制度自体がない場合はnull（通常はどの自治体にもある）
  childSupport: ChildBracketConfig | null; // 子ども・子育て支援金分（令和8年度〜）。金額を確認できていない場合はnull

  /** 軽減制度に関する注記（簡易判定である旨など） */
  reductionNote: string;

  /** 出典（自治体公式サイト名など） */
  source: string;
  sourceUrl: string;
  /** 最終確認日（YYYY-MM-DD） */
  lastVerified: string;
  /** full＝全区分を公式情報で確認済み／partial＝一部区分が未確認・二次情報による補完あり */
  dataCompleteness: DataCompleteness;
  /** 補足説明（任意） */
  notes?: string;
}
