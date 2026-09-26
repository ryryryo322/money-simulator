// ============================================
// マイクロ法人・青色申告まわりの定数
//
// 税率・控除額・保険料率は円単位で lib に一本化しました。
//   所得税・住民税・給与所得控除・法人税  → src/lib/tax/index.ts
//   国民年金・協会けんぽ・厚生年金        → src/lib/insurance/index.ts
//   国民健康保険                          → src/lib/insurance/kokuho.ts
// 制度改正時は上記ファイルを更新してください。
// ============================================

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

/** 法人設立・維持費 デフォルト（万円/年） */
export const CORP_MAINTENANCE_DEFAULT = 15;

/** 役員報酬 試算テーブル（万円/月） */
export const YAKUIN_TRIAL_LIST = [5, 8, 10, 15, 20] as const;
