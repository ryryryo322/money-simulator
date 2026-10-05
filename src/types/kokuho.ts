// ============================================
// 国民健康保険シミュレーター 型定義
// ============================================

/** 国民健康保険シミュレーターの入力値 */
export interface KokuhoInputs {
  income: number;        // 総所得（万円）青色控除後
  age: number;           // 年齢
  members: number;       // 世帯の国保加入人数
  kokuhoCity: string;    // 自治体
  // 手動入力
  manualIryoRate: number;
  manualShienRate: number;
  manualKaigoRate: number;
  manualIryoKintou: number;
  manualShienKintou: number;
  manualKaigoKintou: number;
  manualHeitou: number;
}
