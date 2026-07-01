// ============================================
// 共通フォーマッター
// 全シミュレーターで使い回します
// 内部計算は円、表示は万円に変換
// ============================================

/** 円 → 万円（小数1桁） */
export const formatMan = (yen: number): string => {
  if (!isFinite(yen) || isNaN(yen)) return "－";
  return `${(yen / 10000).toLocaleString("ja-JP", { maximumFractionDigits: 1 })}万円`;
};

/** 円 → 円表示 */
export const formatYen = (yen: number): string => {
  if (!isFinite(yen) || isNaN(yen)) return "－";
  return `${Math.round(yen).toLocaleString("ja-JP")}円`;
};

/** 数値 → %表示 */
export const formatPercent = (rate: number, digits = 1): string => {
  if (!isFinite(rate) || isNaN(rate)) return "－";
  return `${(rate * 100).toFixed(digits)}%`;
};

/** 万円入力値 → 円（内部計算用） */
export const manToYen = (man: number): number => man * 10000;

/** 円 → 万円数値（内部用） */
export const yenToMan = (yen: number): number => yen / 10000;

/** 異常値ガード（負数・NaN・Infinityを0に） */
export const safeNum = (n: number): number => {
  if (!isFinite(n) || isNaN(n) || n < 0) return 0;
  return n;
};

/** 円単位で四捨五入 */
export const roundYen = (yen: number): number => Math.round(safeNum(yen));
