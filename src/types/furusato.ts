// ============================================
// ふるさと納税シミュレーター 型定義
// ============================================

export type FurusatoIncomeType = "employee" | "freelance";

/** ふるさと納税シミュレーターの入力値 */
export interface FurusatoInputs {
  incomeType: FurusatoIncomeType;
  income: number;           // 年収・売上（万円）
  expense: number;          // 経費（個人事業主のみ）
  blueReturn: number;       // 青色申告控除（個人事業主のみ）
  dependents: number;       // 扶養家族人数
  hasSpouse: boolean;       // 配偶者控除あり
  hasDisability: boolean;   // 障害者控除あり
  donation: number;         // 寄付金額（万円）
}
