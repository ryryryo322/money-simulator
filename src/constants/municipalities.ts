// ============================================
// 自治体別 国民健康保険 料率データ（令和8年度／2026年度）
// ============================================
// 各自治体の公式サイトを一次情報として調査した結果を登録しています。
// 「全国共通の料率」は存在しないため、自治体ごとに個別のデータとして
// 保持しています（kokuhoRates.ts の旧データとは別系統・別目的）。
//
// dataCompleteness: "partial" の自治体は、一部区分（主に子ども・子育て
// 支援金分）の金額を自治体公式サイト本体から直接確認できておらず、
// 二次情報（自治体データ専門サイト等）で補完しています。神戸市のように
// 金額が全く確認できない区分は childSupport を null にし、計算から
// 除外しています（推測値は使用していません）。
//
// 制度改正があった場合は、このファイルのみ更新してください。
// ============================================

import type { MunicipalityConfig } from "@/types/municipality";

export const MUNICIPALITIES: MunicipalityConfig[] = [
  // ── 福岡市（今回のテストケース） ─────────────
  {
    municipalityCode: "fukuoka",
    prefecture: "福岡県",
    cityName: "福岡市",
    fiscalYear: 2026,
    calculationMethodLabel: "3方式（所得割＋均等割＋平等割）",
    medical: { incomeRate: 0.0558, perCapitaYen: 19807, perHouseholdYen: 18664, maxYen: 670000 },
    support: { incomeRate: 0.0314, perCapitaYen: 10441, perHouseholdYen: 9838, maxYen: 260000 },
    care: { incomeRate: 0.0261, perCapitaYen: 10160, perHouseholdYen: 7751, maxYen: 170000 },
    childSupport: { incomeRate: 0.0028, perCapitaYen: 1039, perHouseholdYen: 911, perCapitaAge18PlusYen: 0, maxYen: 30000 },
    reductionNote: "7割・5割・2割軽減は世帯の所得・加入者数のみで簡易判定しています。正確な判定には世帯全員の所得・給与所得者等の人数・特定同一世帯所属者の有無が必要です。",
    source: "福岡市「国民健康保険料の計算方法」",
    sourceUrl: "https://www.city.fukuoka.lg.jp/hofuku/kokuho/hp/seido/06-02.html",
    lastVerified: "2026-11-01",
    dataCompleteness: "full",
    notes: "賦課限度額（医療67万・支援26万・介護17万・子ども3万）は、福岡市公式ページの別掲示および複数の自治体データサイトで一致していたため採用。料率・均等割・平等割は福岡市公式ページの表と完全一致を確認済み。",
  },

  // ── 東京都23区（統一保険料。中野区・江戸川区は一部料率が異なります） ──
  {
    municipalityCode: "tokyo23",
    prefecture: "東京都",
    cityName: "東京都（23区・統一保険料）",
    fiscalYear: 2026,
    calculationMethodLabel: "2方式（所得割＋均等割。平等割なし）",
    medical: { incomeRate: 0.0751, perCapitaYen: 47600, perHouseholdYen: 0, maxYen: 670000 },
    support: { incomeRate: 0.0280, perCapitaYen: 17600, perHouseholdYen: 0, maxYen: 260000 },
    care: { incomeRate: 0.0243, perCapitaYen: 17800, perHouseholdYen: 0, maxYen: 170000 },
    childSupport: { incomeRate: 0.0027, perCapitaYen: 0, perHouseholdYen: 0, perCapitaAge18PlusYen: 1873, maxYen: 30000 },
    reductionNote: "7割・5割・2割軽減は世帯の所得・加入者数のみで簡易判定しています。正確な判定には世帯全員の所得・給与所得者等の人数・特定同一世帯所属者の有無が必要です。",
    source: "渋谷区・中央区 国民健康保険料ページ（特別区統一保険料率）",
    sourceUrl: "https://www.city.shibuya.tokyo.jp/kurashi/kokuho/kenkohokenryo/hokenryo_26.html",
    lastVerified: "2026-11-01",
    dataCompleteness: "full",
    notes: "23区のうち21区が統一料率。中野区・江戸川区のみ一部料率が異なります（区ごとの詳細は/tokyo-kokuhoページを参照）。子ども分は18歳未満の均等割がなく、18歳以上にのみ均等割（1,873円）が課されます。",
  },

  // ── 横浜市 ────────────────────────────────
  {
    municipalityCode: "yokohama",
    prefecture: "神奈川県",
    cityName: "横浜市",
    fiscalYear: 2026,
    calculationMethodLabel: "2方式（所得割＋均等割。平等割なし）",
    medical: { incomeRate: 0.0833, perCapitaYen: 40870, perHouseholdYen: 0, maxYen: 670000 },
    support: { incomeRate: 0.0262, perCapitaYen: 13380, perHouseholdYen: 0, maxYen: 260000 },
    care: { incomeRate: 0.0284, perCapitaYen: 16200, perHouseholdYen: 0, maxYen: 170000 },
    childSupport: { incomeRate: 0.0034, perCapitaYen: 1690, perHouseholdYen: 0, perCapitaAge18PlusYen: 80, maxYen: 30000 },
    reductionNote: "7割・5割・2割軽減は世帯の所得・加入者数のみで簡易判定しています。正確な判定には世帯全員の所得・給与所得者等の人数・特定同一世帯所属者の有無が必要です。",
    source: "横浜市「令和8年度保険料の料率等について」",
    sourceUrl: "https://www.city.yokohama.lg.jp/kurashi/koseki-zei-hoken/kokuho/hokenryo/r7hokennryouritu.html",
    lastVerified: "2026-11-01",
    dataCompleteness: "full",
  },

  // ── 大阪市（大阪府統一保険料率） ───────────────
  {
    municipalityCode: "osaka",
    prefecture: "大阪府",
    cityName: "大阪市（大阪府統一保険料率）",
    fiscalYear: 2026,
    calculationMethodLabel: "医療・支援分は3方式、介護・子ども分は2方式（平等割なし）",
    medical: { incomeRate: 0.0950, perCapitaYen: 34990, perHouseholdYen: 33908, maxYen: 660000 },
    support: { incomeRate: 0.0306, perCapitaYen: 11191, perHouseholdYen: 10845, maxYen: 260000 },
    care: { incomeRate: 0.0260, perCapitaYen: 18682, perHouseholdYen: 0, maxYen: 170000 },
    childSupport: { incomeRate: 0.0028, perCapitaYen: 1745, perHouseholdYen: 0, perCapitaAge18PlusYen: 96, maxYen: 30000 },
    reductionNote: "7割・5割・2割軽減は世帯の所得・加入者数のみで簡易判定しています。正確な判定には世帯全員の所得・給与所得者等の人数・特定同一世帯所属者の有無が必要です。",
    source: "大阪府・枚方市公表「大阪府統一保険料率」資料",
    sourceUrl: "https://www.city.hirakata.osaka.jp/0000037140.html",
    lastVerified: "2026-11-01",
    dataCompleteness: "full",
    notes: "令和6年度から大阪府内は統一保険料率のため、大阪市に限らず府内市町村で共通の料率です（減免基準のみ市町村ごとに異なる場合あり）。医療分の賦課限度額は66万円（全国標準の67万円ではない）。",
  },

  // ── 名古屋市 ──────────────────────────────
  {
    municipalityCode: "nagoya",
    prefecture: "愛知県",
    cityName: "名古屋市",
    fiscalYear: 2026,
    calculationMethodLabel: "2方式（所得割＋均等割。平等割なし）",
    medical: { incomeRate: 0.0883, perCapitaYen: 50591, perHouseholdYen: 0, maxYen: 670000 },
    support: { incomeRate: 0.0258, perCapitaYen: 15784, perHouseholdYen: 0, maxYen: 260000 },
    care: { incomeRate: 0.0234, perCapitaYen: 16120, perHouseholdYen: 0, maxYen: 170000 },
    childSupport: { incomeRate: 0.0026, perCapitaYen: 1771, perHouseholdYen: 0, perCapitaAge18PlusYen: 92, maxYen: 30000 },
    reductionNote: "7割・5割・2割軽減は世帯の所得・加入者数のみで簡易判定しています。正確な判定には世帯全員の所得・給与所得者等の人数・特定同一世帯所属者の有無が必要です。",
    source: "名古屋市「令和8年度分の国民健康保険料」",
    sourceUrl: "https://www.city.nagoya.jp/kurashi/hoken/1011736/1011793/1011794/1011799.html",
    lastVerified: "2026-11-01",
    dataCompleteness: "full",
  },

  // ── 札幌市 ────────────────────────────────
  {
    municipalityCode: "sapporo",
    prefecture: "北海道",
    cityName: "札幌市",
    fiscalYear: 2026,
    calculationMethodLabel: "3方式（所得割＋均等割＋平等割）",
    medical: { incomeRate: 0.0861, perCapitaYen: 20550, perHouseholdYen: 32540, maxYen: 670000 },
    support: { incomeRate: 0.0256, perCapitaYen: 6330, perHouseholdYen: 10010, maxYen: 260000 },
    care: { incomeRate: 0.0233, perCapitaYen: 6020, perHouseholdYen: 7550, maxYen: 170000 },
    childSupport: { incomeRate: 0.0029, perCapitaYen: 0, perHouseholdYen: 1000, perCapitaAge18PlusYen: 1100, maxYen: 30000 },
    reductionNote: "7割・5割・2割軽減は世帯の所得・加入者数のみで簡易判定しています。正確な判定には世帯全員の所得・給与所得者等の人数・特定同一世帯所属者の有無が必要です。",
    source: "札幌市「保険料の計算」「よくある質問Q9」",
    sourceUrl: "https://www.city.sapporo.jp/hoken-iryo/kokuho/fuka.html",
    lastVerified: "2026-11-01",
    dataCompleteness: "full",
    notes: "子ども分の均等割は18歳未満の加入者には課されず、18歳以上の加入者にのみ1,100円（内訳: 基本1,000円＋18歳以上加算100円）がかかります。",
  },

  // ── 仙台市 ────────────────────────────────
  {
    municipalityCode: "sendai",
    prefecture: "宮城県",
    cityName: "仙台市",
    fiscalYear: 2026,
    calculationMethodLabel: "3方式（所得割＋均等割＋平等割）",
    medical: { incomeRate: 0.0796, perCapitaYen: 27850, perHouseholdYen: 26700, maxYen: 670000 },
    support: { incomeRate: 0.0300, perCapitaYen: 10410, perHouseholdYen: 9980, maxYen: 260000 },
    care: { incomeRate: 0.0244, perCapitaYen: 9440, perHouseholdYen: 7070, maxYen: 170000 },
    childSupport: { incomeRate: 0.0027, perCapitaYen: 940, perHouseholdYen: 900, perCapitaAge18PlusYen: 0, maxYen: 30000 },
    reductionNote: "7割・5割・2割軽減は世帯の所得・加入者数のみで簡易判定しています。正確な判定には世帯全員の所得・給与所得者等の人数・特定同一世帯所属者の有無が必要です。",
    source: "仙台市「保険料はいくら（令和8年度）」「保険料の計算方法」",
    sourceUrl: "https://www.city.sendai.jp/kenko-hoken/kurashi/tetsuzuki/kokumin/kenkohoken/hokenryo.html",
    lastVerified: "2026-11-01",
    dataCompleteness: "partial",
    notes: "医療分・支援分は仙台市公式ページ本体で確認済み。介護分・子ども分の金額は公式ページから直接確認できず、自治体データ専門サイト（kokuho.info）の二次情報で補完しています。正式な金額は仙台市へ直接ご確認ください。",
  },

  // ── 広島市 ────────────────────────────────
  {
    municipalityCode: "hiroshima",
    prefecture: "広島県",
    cityName: "広島市",
    fiscalYear: 2026,
    calculationMethodLabel: "3方式（所得割＋均等割＋平等割）",
    medical: { incomeRate: 0.0818, perCapitaYen: 31228, perHouseholdYen: 30403, maxYen: 670000 },
    support: { incomeRate: 0.0264, perCapitaYen: 10342, perHouseholdYen: 10069, maxYen: 260000 },
    care: { incomeRate: 0.0252, perCapitaYen: 10443, perHouseholdYen: 7860, maxYen: 170000 },
    childSupport: { incomeRate: 0.0027, perCapitaYen: 1072, perHouseholdYen: 1044, perCapitaAge18PlusYen: 56, maxYen: 30000 },
    reductionNote: "7割・5割・2割軽減は世帯の所得・加入者数のみで簡易判定しています。正確な判定には世帯全員の所得・給与所得者等の人数・特定同一世帯所属者の有無が必要です。",
    source: "広島市「国民健康保険料の計算方法」",
    sourceUrl: "https://www.city.hiroshima.lg.jp/living/hoken-nenkin/1021143/1025566/1003464.html",
    lastVerified: "2026-11-01",
    dataCompleteness: "full",
  },

  // ── 京都市 ────────────────────────────────
  {
    municipalityCode: "kyoto",
    prefecture: "京都府",
    cityName: "京都市",
    fiscalYear: 2026,
    calculationMethodLabel: "3方式（所得割＋均等割＋平等割）",
    medical: { incomeRate: 0.0794, perCapitaYen: 30080, perHouseholdYen: 17930, maxYen: 670000 },
    support: { incomeRate: 0.0266, perCapitaYen: 10360, perHouseholdYen: 6180, maxYen: 260000 },
    care: { incomeRate: 0.0251, perCapitaYen: 11090, perHouseholdYen: 5370, maxYen: 170000 },
    childSupport: { incomeRate: 0.0028, perCapitaYen: 1110, perHouseholdYen: 660, perCapitaAge18PlusYen: 60, maxYen: 30000 },
    reductionNote: "7割・5割・2割軽減は世帯の所得・加入者数のみで簡易判定しています。正確な判定には世帯全員の所得・給与所得者等の人数・特定同一世帯所属者の有無が必要です。",
    source: "京都市「令和8年度の保険料の計算方法について」（制度構成・区分を確認）。料率・金額は自治体データ専門サイトで二次確認。",
    sourceUrl: "https://www.city.kyoto.lg.jp/hokenfukushi/page/0000351039.html",
    lastVerified: "2026-11-01",
    dataCompleteness: "partial",
    notes: "京都市公式ページで「医療分・後期分・子ども分・介護分の4区分構成」であることは確認済みですが、料率・均等割・平等割の具体的な金額は公式ページ本体から直接取得できず、自治体データ専門サイトの二次情報で補完しています。正式な金額は京都市へ直接ご確認ください。",
  },

  // ── 神戸市 ────────────────────────────────
  {
    municipalityCode: "kobe",
    prefecture: "兵庫県",
    cityName: "神戸市",
    fiscalYear: 2026,
    calculationMethodLabel: "3方式（所得割＋均等割＋平等割）",
    medical: { incomeRate: 0.0738, perCapitaYen: 33700, perHouseholdYen: 21800, maxYen: 670000 },
    support: { incomeRate: 0.0297, perCapitaYen: 13510, perHouseholdYen: 8740, maxYen: 260000 },
    care: { incomeRate: 0.0278, perCapitaYen: 13970, perHouseholdYen: 6880, maxYen: 170000 },
    childSupport: null,
    reductionNote: "7割・5割・2割軽減は世帯の所得・加入者数のみで簡易判定しています。正確な判定には世帯全員の所得・給与所得者等の人数・特定同一世帯所属者の有無が必要です。",
    source: "神戸市「国民健康保険料の額」",
    sourceUrl: "https://www.city.kobe.lg.jp/a52670/kurashi/support/insurance/gaku.html",
    lastVerified: "2026-11-01",
    dataCompleteness: "partial",
    notes: "医療分・支援分・介護分は神戸市公式ページで確認済み。子ども・子育て支援金分は令和8年度から新設され所得割率0.26%であることは確認できましたが、均等割・平等割の具体的な金額を公式情報から確認できなかったため、このシミュレーターでは子ども分を計算に含めていません（年間合計が実際より少なく算出されます）。",
  },
];

/** コードから自治体設定を取得。見つからない場合はnull（推測で代替しない） */
export function findMunicipality(code: string): MunicipalityConfig | null {
  return MUNICIPALITIES.find((m) => m.municipalityCode === code) ?? null;
}
