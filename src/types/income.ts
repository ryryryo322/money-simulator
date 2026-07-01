// ============================================
// 手取りシミュレーター 型定義
// ============================================

import type { BlueReturnType } from "@/constants/tax2026";

/** 会社員の入力値 */
export interface EmployeeInputs {
  income: number;        // 年収（万円）
  dependents: number;    // 扶養人数
  hasSpouse: boolean;    // 配偶者控除あり
}

/** 個人事業主の入力値 */
export interface FreelanceInputs {
  revenue: number;             // 年間売上（万円）
  expense: number;             // 年間経費（万円）
  blueReturn: BlueReturnType;  // 青色申告控除
  shokibo: number;             // 小規模企業共済（万円/月）
  ideco: number;               // iDeCo（万円/月）
  dependents: number;          // 扶養人数
  hasSpouse: boolean;          // 配偶者控除あり
  hasBizTax: boolean;          // 個人事業税あり
  isTaxable: boolean;          // 消費税課税事業者
}

/** 会社員の計算結果 */
export interface EmployeeResult {
  income: number;              // 年収
  kyuyoDeduction: number;      // 給与所得控除
  kyuyoIncome: number;         // 給与所得
  totalDeductions: number;     // 所得控除合計
  taxableIncome: number;       // 課税所得
  socialInsurance: number;     // 社会保険料
  incomeTax: number;           // 所得税
  residentTax: number;         // 住民税
  totalBurden: number;         // 税・保険料合計
  takeHome: number;            // 手取り
  takeHomeRate: number;        // 手取り率
}

/** 個人事業主の計算結果 */
export interface FreelanceResult {
  revenue: number;             // 売上
  expense: number;             // 経費
  businessIncome: number;      // 事業所得（売上−経費）
  blueDeduction: number;       // 青色申告控除
  afterBlue: number;           // 青色控除後所得
  shokoboAnnual: number;       // 小規模企業共済（年額）
  idecoAnnual: number;         // iDeCo（年額）
  kokuho: number;              // 国民健康保険
  kokunen: number;             // 国民年金
  bizTax: number;              // 個人事業税
  consumptionTax: number;      // 消費税
  totalDeductions: number;     // 所得控除合計
  taxableIncome: number;       // 課税所得
  incomeTax: number;           // 所得税
  residentTax: number;         // 住民税
  totalBurden: number;         // 税・保険料合計
  takeHome: number;            // 手取り
  takeHomeRate: number;        // 手取り率（売上比）
}

/** 計算根拠のステップ */
export interface CalcStep {
  label: string;
  value: number;
  isDeduction?: boolean; // trueなら控除（マイナス表示）
  isResult?: boolean;    // trueなら結果行（太字）
}
