// ============================================
// 東京都 国民健康保険料シミュレーター 型定義
// ============================================

export type TokyoKokuhoIncomeType = "employee" | "freelance";

/** 東京都国保シミュレーターの入力値 */
export interface TokyoKokuhoInputs {
  ward: string;          // 区
  incomeType: TokyoKokuhoIncomeType;
  annualIncome: number;  // 年収（会社員）万円
  businessIncome: number;// 事業所得（個人事業主）万円
  age: number;
  members: number;       // 世帯の国保加入人数
}
