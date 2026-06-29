// ============================================
// 数値フォーマット関数
// 全シミュレーターで使い回します
// ============================================

/** 万円単位でフォーマット（例: 3500 → "3,500万円"） */
export const fmtMan = (n: number): string =>
  `${Math.round(n).toLocaleString()}万円`;

/** 億・万円単位で省略表示（例: 12000 → "1.2億"） */
export const fmtShort = (n: number): string =>
  n >= 10000
    ? `${(n / 10000).toFixed(1)}億`
    : `${Math.round(n).toLocaleString()}万`;

/** 円単位でフォーマット（例: 250000 → "250,000円"） */
export const fmtYen = (n: number): string =>
  `${Math.round(n).toLocaleString()}円`;

/** パーセントフォーマット（例: 0.253 → "25.3%"） */
export const fmtPct = (n: number, digits = 1): string =>
  `${(n * 100).toFixed(digits)}%`;
