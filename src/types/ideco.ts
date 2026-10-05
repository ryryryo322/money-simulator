// ============================================
// iDeCoシミュレーター 型定義
// ============================================

export type IdecoIncomeType = "employee" | "freelance";

/** iDeCoシミュレーターの入力値 */
export interface IdecoInputs {
  incomeType: IdecoIncomeType;
  income: number;           // 年収（万円）
  expense: number;          // 経費（個人事業主のみ）
  monthly: number;          // 毎月掛金（万円）
  returnRate: number;       // 想定利回り（%）
  currentAge: number;       // 現在年齢
  retireAge: number;        // 受取開始年齢（60〜75歳）
  dependents: number;       // 扶養人数
  hasSpouse: boolean;       // 配偶者あり
}
