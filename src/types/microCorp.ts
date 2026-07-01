// ============================================
// マイクロ法人シミュレーター 型定義
// ============================================

import type { BlueReturnType } from "@/constants/tax2026";

/** 個人事業主側の入力 */
export interface SoloInputs {
  revenue: number;          // 年間売上（万円）
  expense: number;          // 必要経費（万円）
  blueReturn: BlueReturnType; // 青色申告控除
  shokibo: number;          // 小規模企業共済（万円/月）
  ideco: number;            // iDeCo（万円/月）
  age: number;              // 年齢
  hasSpouse: boolean;       // 配偶者あり
  dependents: number;       // 扶養人数
  hasBizTax: boolean;       // 個人事業税あり
  prefecture: string;       // 都道府県（国保計算用・現在は概算）
}

/** 法人設立後の入力 */
export interface CorpInputs {
  monthlyReward: number;    // 役員報酬（万円/月）
  maintenance: number;      // 法人維持費（万円/年）
  hasCorpResidentTax: boolean; // 法人住民税均等割あり
}

/** 個人事業主 計算結果 */
export interface SoloResult {
  businessIncome: number;   // 事業所得
  blueDeduction: number;    // 青色申告控除
  shokobo: number;          // 小規模企業共済控除
  idecoDeduction: number;   // iDeCo控除
  kokuho: number;           // 国民健康保険
  kokunen: number;          // 国民年金
  bizTax: number;           // 個人事業税
  incomeTax: number;        // 所得税
  residentTax: number;      // 住民税
  totalBurden: number;      // 税・保険料合計
  takeHome: number;         // 手取り
}

/** マイクロ法人 計算結果 */
export interface CorpResult {
  annualReward: number;     // 役員報酬（年額）
  corpProfit: number;       // 法人利益（役員報酬控除後）
  shakaiHoken: number;      // 健康保険（年額）
  koseiNenkin: number;      // 厚生年金（年額）
  personalIncomeTax: number; // 個人所得税
  personalResidentTax: number; // 個人住民税
  corpTax: number;          // 法人税
  corpResidentTax: number;  // 法人住民税
  maintenance: number;      // 法人維持費
  totalBurden: number;      // 税・保険料合計
  takeHome: number;         // 手取り
}

/** 役員報酬別試算 */
export interface RewardTrial {
  monthlyReward: number;
  takeHome: number;
  totalBurden: number;
  diff: number; // 個人事業との差額
}

// ── 二刀流パターン 型定義 ───────────────────────

/** 二刀流パターンの入力値 */
export interface DualInputs {
  soloRevenue: number;      // 個人事業の年間売上（万円）
  soloExpense: number;      // 個人事業の年間経費（万円）
  corpRevenue: number;      // 副業法人の年間売上（万円）
  corpExpense: number;      // 副業法人の年間経費（万円）
  blueReturn: import("@/constants/tax2026").BlueReturnType;
  shokibo: number;          // 小規模企業共済（万円/月）
  ideco: number;            // iDeCo（万円/月）
  dependents: number;
  hasSpouse: boolean;
  hasBizTax: boolean;
  monthlyReward: number;    // 役員報酬（万円/月）
  maintenance: number;      // 法人維持費（万円/年）
  hasCorpResidentTax: boolean;
}

/** 二刀流パターンの計算結果 */
export interface DualResult {
  soloOnly: {               // 個人事業のみの場合
    takeHome: number;
    kokuho: number;
    kokunen: number;
    incomeTax: number;
    residentTax: number;
  };
  dualTotal: {              // 二刀流の場合
    takeHome: number;
    shakaiHoken: number;
    koseiNenkin: number;
    personalIncomeTax: number;
    corpTax: number;
  };
  diff: number;             // 二刀流 - 個人事業のみ（プラスなら二刀流がお得）
}
