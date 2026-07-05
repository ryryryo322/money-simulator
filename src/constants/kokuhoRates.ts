// ============================================
// 国民健康保険 料率データ
// 2024年度（令和6年度）
// 自治体により異なるため外部データとして管理
// 制度改正・料率改定時はこのファイルを更新してください
// ============================================

export interface KokuhoRate {
  city: string;          // 自治体名
  prefecture: string;    // 都道府県
  iryoIncome: number;    // 医療分 所得割率
  shienIncome: number;   // 支援金分 所得割率
  kaigo: number;         // 介護分 所得割率（40〜64歳）
  iryoKintou: number;    // 医療分 均等割（円/人）
  shienKintou: number;   // 支援金分 均等割（円/人）
  kaigoKintou: number;   // 介護分 均等割（円/人）
  iryoHeitou: number;    // 医療分 平等割（円/世帯）
  shienHeitou: number;   // 支援金分 平等割（円/世帯）
  kaigoHeitou?: number;  // 介護分 平等割（円/世帯）※ある自治体のみ
  note?: string;         // 備考（内部調整など）
  adjustmentLevel?: "low" | "medium" | "high"; // 内部調整の強さ
  iryoMax: number;       // 医療分 賦課限度額（円）
  shienMax: number;      // 支援金分 賦課限度額（円）
  kaigoMax: number;      // 介護分 賦課限度額（円）
}

/** 主要都市の国保料率（2024-2026年度） */
export const KOKUHO_RATES: KokuhoRate[] = [
  {
    city: "東京都（23区）", prefecture: "東京都",
    iryoIncome: 0.0770, shienIncome: 0.0280, kaigo: 0.0180,
    iryoKintou: 47100, shienKintou: 14700, kaigoKintou: 17300,
    iryoHeitou: 0, shienHeitou: 0,
    iryoMax: 650000, shienMax: 240000, kaigoMax: 170000,
    adjustmentLevel: "low",
  },
  {
    city: "横浜市", prefecture: "神奈川県",
    iryoIncome: 0.0987, shienIncome: 0.0316, kaigo: 0.0261,
    iryoKintou: 33462, shienKintou: 10692, kaigoKintou: 14244,
    iryoHeitou: 0, shienHeitou: 0,
    iryoMax: 650000, shienMax: 240000, kaigoMax: 170000,
    adjustmentLevel: "low",
  },
  {
    city: "大阪市", prefecture: "大阪府",
    iryoIncome: 0.0891, shienIncome: 0.0290, kaigo: 0.0260,
    iryoKintou: 22410, shienKintou: 7320, kaigoKintou: 11220,
    iryoHeitou: 22140, shienHeitou: 6240,
    iryoMax: 650000, shienMax: 240000, kaigoMax: 170000,
    adjustmentLevel: "medium",
    note: "内部調整が入るため計算値と実際の通知額が異なる場合があります",
  },
  {
    city: "名古屋市", prefecture: "愛知県",
    iryoIncome: 0.0737, shienIncome: 0.0237, kaigo: 0.0185,
    iryoKintou: 24450, shienKintou: 7650, kaigoKintou: 10800,
    iryoHeitou: 22800, shienHeitou: 7200,
    iryoMax: 650000, shienMax: 240000, kaigoMax: 170000,
    adjustmentLevel: "low",
  },
  {
    city: "札幌市", prefecture: "北海道",
    iryoIncome: 0.0826, shienIncome: 0.0274, kaigo: 0.0230,
    iryoKintou: 26640, shienKintou: 8520, kaigoKintou: 11520,
    iryoHeitou: 21600, shienHeitou: 6480,
    iryoMax: 650000, shienMax: 240000, kaigoMax: 170000,
    adjustmentLevel: "medium",
    note: "内部調整が入るため計算値と実際の通知額が異なる場合があります",
  },
  {
    city: "福岡市", prefecture: "福岡県",
    iryoIncome: 0.0887, shienIncome: 0.0292, kaigo: 0.0200,
    iryoKintou: 33000, shienKintou: 11000, kaigoKintou: 12000,
    iryoHeitou: 28000, shienHeitou: 10000, kaigoHeitou: 14000,
    iryoMax: 650000, shienMax: 240000, kaigoMax: 170000,
    adjustmentLevel: "high",
    note: "内部調整（按分・限度額調整）が強く、実際の通知額は計算値より低くなる場合があります",
  },
  {
    city: "仙台市", prefecture: "宮城県",
    iryoIncome: 0.0889, shienIncome: 0.0293, kaigo: 0.0223,
    iryoKintou: 26400, shienKintou: 8400, kaigoKintou: 10800,
    iryoHeitou: 22800, shienHeitou: 7200,
    iryoMax: 650000, shienMax: 240000, kaigoMax: 170000,
    adjustmentLevel: "medium",
    note: "内部調整が入るため計算値と実際の通知額が異なる場合があります",
  },
  {
    city: "広島市", prefecture: "広島県",
    iryoIncome: 0.0887, shienIncome: 0.0283, kaigo: 0.0226,
    iryoKintou: 26760, shienKintou: 8520, kaigoKintou: 11280,
    iryoHeitou: 23400, shienHeitou: 7440,
    iryoMax: 650000, shienMax: 240000, kaigoMax: 170000,
    adjustmentLevel: "medium",
    note: "内部調整が入るため計算値と実際の通知額が異なる場合があります",
  },
  {
    city: "京都市", prefecture: "京都府",
    iryoIncome: 0.0917, shienIncome: 0.0289, kaigo: 0.0233,
    iryoKintou: 22680, shienKintou: 7272, kaigoKintou: 10560,
    iryoHeitou: 24120, shienHeitou: 7560,
    iryoMax: 650000, shienMax: 240000, kaigoMax: 170000,
    adjustmentLevel: "medium",
    note: "内部調整が入るため計算値と実際の通知額が異なる場合があります",
  },
  {
    city: "神戸市", prefecture: "兵庫県",
    iryoIncome: 0.0868, shienIncome: 0.0271, kaigo: 0.0218,
    iryoKintou: 27900, shienKintou: 8520, kaigoKintou: 11160,
    iryoHeitou: 22200, shienHeitou: 6960,
    iryoMax: 650000, shienMax: 240000, kaigoMax: 170000,
    adjustmentLevel: "low",
  },
];

/** 手動入力用のデフォルト値 */
export const KOKUHO_MANUAL_DEFAULT: KokuhoRate = {
  city: "手動入力", prefecture: "",
  iryoIncome: 0.08, shienIncome: 0.027, kaigo: 0.022,
  iryoKintou: 25000, shienKintou: 8000, kaigoKintou: 11000,
  iryoHeitou: 20000, shienHeitou: 6000,
  iryoMax: 650000, shienMax: 240000, kaigoMax: 170000,
};
