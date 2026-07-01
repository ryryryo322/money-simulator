// ============================================
// 税率・保険料率・控除額 定数ファイル
// 制度改正があった場合はこのファイルだけ変更してください
// 最終更新: 2026年
// ============================================

/** 所得税 超過累進課税テーブル */
export const INCOME_TAX_BRACKETS = [
  { max: 195,  rate: 0.05,  deduction: 0 },
  { max: 330,  rate: 0.10,  deduction: 9.75 },
  { max: 695,  rate: 0.20,  deduction: 42.75 },
  { max: 900,  rate: 0.23,  deduction: 63.6 },
  { max: 1800, rate: 0.33,  deduction: 153.6 },
  { max: 4000, rate: 0.40,  deduction: 279.6 },
  { max: Infinity, rate: 0.45, deduction: 479.6 },
] as const;

/** 復興特別所得税率 */
export const RECONSTRUCTION_TAX_RATE = 1.021;

/** 基礎控除（万円） */
export const BASIC_DEDUCTION = 48;

/** 扶養控除 1人あたり（万円） */
export const DEPENDENT_DEDUCTION_PER_PERSON = 38;

/** 配偶者控除（万円） */
export const SPOUSE_DEDUCTION = 38;

/** 給与所得控除テーブル */
export const KYUYO_DEDUCTION_BRACKETS = [
  { max: 162.5, deduction: 55 },
  { max: 180,   rate: 0.40, offset: -10 },
  { max: 360,   rate: 0.30, offset: 8 },
  { max: 660,   rate: 0.20, offset: 44 },
  { max: 850,   rate: 0.10, offset: 110 },
  { max: Infinity, deduction: 195 },
] as const;

/** 住民税率 */
export const RESIDENT_TAX_RATE = 0.10;
/** 住民税 均等割（万円）※2024年度から森林環境税1,000円追加 */
export const RESIDENT_TAX_FLAT = 0.6; // 均等割5,000円 + 森林環境税1,000円
/** 住民税 所得割率 */
export const RESIDENT_TAX_INCOME_RATE = 0.10;

/** 国民健康保険 概算レート */
export const KOKUHO_RATE = 0.10;
/** 国民健康保険 固定額（万円） */
export const KOKUHO_FIXED = 5;
/** 国民健康保険 上限（万円） */
export const KOKUHO_MAX = 87;

/** 国民年金 月額（万円）2026年度 */
export const KOKUNEN_MONTHLY_MAN = 1.7; // 月額1.7万円
/** 国民年金 年額（万円）2026年度 */
export const KOKUNEN_ANNUAL = KOKUNEN_MONTHLY_MAN * 12; // 20.4万円

/** 個人事業税 税率 */
export const BIZ_TAX_RATE = 0.05;
/** 個人事業税 控除額（万円） */
export const BIZ_TAX_DEDUCTION = 290;

/** 小規模企業共済 掛金上限（万円/月） */
export const SHOKIBO_MAX_MONTHLY = 7;

/** iDeCo 個人事業主 拠出限度額（万円/月） */
export const IDECO_JIGYOU_MAX = 6.8;

/** 青色申告特別控除額テーブル（万円） */
export const BLUE_RETURN_OPTIONS = {
  "65": 65,
  "55": 55,
  "10": 10,
  "none": 0,
} as const;
export type BlueReturnType = keyof typeof BLUE_RETURN_OPTIONS;

// ── 法人関連 ─────────────────────────────────

/** 法人税率（中小企業 800万円以下） */
export const CORP_TAX_RATE_SMALL = 0.15;
/** 法人税率（800万円超） */
export const CORP_TAX_RATE_LARGE = 0.234;
/** 法人税 軽減税率適用上限（万円） */
export const CORP_TAX_THRESHOLD = 800;

/** 法人住民税 均等割（万円/年） */
export const CORP_RESIDENT_TAX_FLAT = 7;

/** 協会けんぽ 健康保険料率（本人負担分・東京都） */
export const SHAKAI_HOKEN_RATE = 0.0498;
/** 厚生年金保険料率（本人負担分） */
export const KOSEI_NENKIN_RATE = 0.0915;
/** 標準報酬月額 上限（万円） */
export const HYOJUN_MAX = 65;
/** 標準報酬月額 下限（万円） */
export const HYOJUN_MIN = 5.8;

/** 法人設立・維持費 デフォルト（万円/年） */
export const CORP_MAINTENANCE_DEFAULT = 15;

/** 役員報酬 試算テーブル（万円/月） */
export const YAKUIN_TRIAL_LIST = [5, 8, 10, 15, 20] as const;
