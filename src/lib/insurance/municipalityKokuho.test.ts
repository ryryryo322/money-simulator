// ============================================
// 自治体別 国民健康保険料 計算エンジン テスト
// ============================================
// 実行には devDependency として vitest の追加が必要です（下記README参照）。
// npx vitest run src/lib/insurance/municipalityKokuho.test.ts
// ============================================

import { describe, it, expect } from "vitest";
import { calcMunicipalityKokuho } from "./municipalityKokuho";
import { findMunicipality } from "@/constants/municipalities";
import type { MunicipalityConfig } from "@/types/municipality";

const fukuoka = findMunicipality("fukuoka")!;
const tokyo23 = findMunicipality("tokyo23")!;
const osaka = findMunicipality("osaka")!;

// 4方式（資産割あり）のテスト専用ダミー自治体。
// 実在する登録自治体に4方式採用例がないため、資産割の計算ロジック自体を
// 検証するための仮データ（公式情報ではない。テスト専用）。
const dummy4Method: MunicipalityConfig = {
  municipalityCode: "__test_4method__",
  prefecture: "（テスト用）",
  cityName: "（テスト用）4方式自治体",
  fiscalYear: 2026,
  calculationMethodLabel: "4方式（所得割＋資産割＋均等割＋平等割）",
  medical: { incomeRate: 0.05, perCapitaYen: 20000, perHouseholdYen: 15000, assetRate: 0.1, maxYen: 670000 },
  support: { incomeRate: 0.02, perCapitaYen: 8000, perHouseholdYen: 6000, assetRate: 0.03, maxYen: 260000 },
  care: { incomeRate: 0.02, perCapitaYen: 9000, perHouseholdYen: 5000, assetRate: 0.03, maxYen: 170000 },
  childSupport: { incomeRate: 0.002, perCapitaYen: 1000, perHouseholdYen: 800, perCapitaAge18PlusYen: 0, maxYen: 30000 },
  reductionNote: "テスト用",
  source: "テスト用ダミーデータ",
  sourceUrl: "",
  lastVerified: "2026-01-01",
  dataCompleteness: "full",
};

describe("福岡市 令和8年度テストケース（本件の検証対象）", () => {
  it("所得470万円・29歳・1人：医療分・支援分・子ども分のみ（介護分は対象外）", () => {
    const r = calcMunicipalityKokuho({
      totalIncomeYen: 4_700_000,
      members: 1,
      age: 29,
      municipality: fukuoka,
    });

    expect(r.shotokuBaseYen).toBe(4_270_000); // 画面表示の「427万円」と一致

    // 医療分: 4,270,000×5.58% + 19,807 + 18,664 = 276,737円
    expect(r.medical.totalYen).toBe(276_737);
    // 支援分: 4,270,000×3.14% + 10,441 + 9,838 = 154,357円
    expect(r.support.totalYen).toBe(154_357);
    // 介護分: 29歳は対象外のため null
    expect(r.care).toBeNull();
    // 子ども分: 4,270,000×0.28% + 1,039 + 911 = 13,906円
    expect(r.childSupport?.totalYen).toBe(13_906);

    // 年間合計: 276,737 + 154,357 + 13,906 = 445,000円
    // ※旧実装の 585,433円 とは一致しない（旧実装の料率が古かったため）
    expect(r.totalYen).toBe(445_000);
  });
});

describe("年齢条件（介護分の対象判定）", () => {
  const base = { totalIncomeYen: 4_700_000, members: 1, municipality: fukuoka };

  it("29歳：介護分なし", () => {
    expect(calcMunicipalityKokuho({ ...base, age: 29 }).care).toBeNull();
  });
  it("40歳：介護分あり（40〜64歳の下限）", () => {
    expect(calcMunicipalityKokuho({ ...base, age: 40 }).care).not.toBeNull();
  });
  it("64歳：介護分あり（40〜64歳の上限）", () => {
    expect(calcMunicipalityKokuho({ ...base, age: 64 }).care).not.toBeNull();
  });
  it("65歳：介護分なし（介護保険第1号被保険者のため国保の介護分の対象外）", () => {
    expect(calcMunicipalityKokuho({ ...base, age: 65 }).care).toBeNull();
  });
});

describe("複数人世帯", () => {
  it("4人世帯：均等割・平等割（世帯あたり1回のみ）が正しく計算される", () => {
    const r = calcMunicipalityKokuho({
      totalIncomeYen: 4_700_000,
      members: 4,
      age: 45,
      municipality: fukuoka,
    });
    // 医療分の均等割は人数分、平等割は世帯で1回のみ
    expect(r.medical.perCapitaYen).toBe(19_807 * 4);
    expect(r.medical.perHouseholdYen).toBe(18_664); // 世帯あたり1回
  });

  it("年齢が異なる複数人世帯は、単一年齢入力の制約により正確な計算にならない点をテストで明示する", () => {
    // このシミュレーターは「世帯の加入者は全員同じ年齢」という簡略化をしている。
    // 本来は40〜64歳の加入者の人数分だけ介護分がかかるべきだが、
    // 現在の入力仕様では年齢を1つしか受け取れないため、
    // 「代表年齢が40〜64歳なら世帯全員ぶん介護分を計算する」という近似になる。
    const r = calcMunicipalityKokuho({
      totalIncomeYen: 4_700_000,
      members: 3, // 例: 45歳・70歳・10歳の3人世帯のつもり
      age: 45,     // 代表年齢として45歳を入力
      municipality: fukuoka,
    });
    // 実際には介護分の対象は45歳の1人のみのはずだが、
    // 現在の実装では3人分として計算されてしまう（既知の制約）
    expect(r.care?.perCapitaYen).toBe(10_160 * 3);
  });
});

describe("軽減制度（7割・5割・2割）", () => {
  it("所得0円：7割軽減が適用される", () => {
    const r = calcMunicipalityKokuho({ totalIncomeYen: 0, members: 1, age: 29, municipality: fukuoka });
    expect(r.reduction.label).toBe("7割軽減");
    expect(r.reduction.rate).toBe(0.3);
    expect(r.shotokuBaseYen).toBe(0);
    // 所得割部分は0、均等割・平等割は7割軽減後（3割負担）
    expect(r.medical.incomeYen).toBe(0);
    expect(r.medical.perCapitaYen).toBe(Math.round(19_807 * 0.3));
  });

  it("所得600万円・1人：軽減なし", () => {
    const r = calcMunicipalityKokuho({ totalIncomeYen: 6_000_000, members: 1, age: 29, municipality: fukuoka });
    expect(r.reduction.label).toBe("軽減なし");
    expect(r.reduction.rate).toBe(1.0);
  });
});

describe("賦課限度額（区分ごとの上限）", () => {
  it("所得3000万円：医療・支援・子ども分それぞれが区分ごとの上限で頭打ちになる", () => {
    const r = calcMunicipalityKokuho({
      totalIncomeYen: 30_000_000,
      members: 1,
      age: 45,
      municipality: fukuoka,
    });
    expect(r.medical.totalYen).toBe(670_000);
    expect(r.medical.cappedByMax).toBe(true);
    expect(r.support.totalYen).toBe(260_000);
    expect(r.support.cappedByMax).toBe(true);
    expect(r.care?.totalYen).toBe(170_000);
    expect(r.care?.cappedByMax).toBe(true);
    expect(r.childSupport?.totalYen).toBe(30_000);
    expect(r.childSupport?.cappedByMax).toBe(true);

    // 重要：「合計額に一律で上限」ではなく、区分ごとに別々の上限が適用されていることを確認
    const expectedTotal = 670_000 + 260_000 + 170_000 + 30_000;
    expect(r.totalYen).toBe(expectedTotal);
  });
});

describe("所得0円（事業赤字・無収入ケース）", () => {
  it("所得割は0円、均等割・平等割は7割軽減後の金額のみ発生する", () => {
    const r = calcMunicipalityKokuho({ totalIncomeYen: 0, members: 1, age: 29, municipality: fukuoka });
    expect(r.medical.incomeYen).toBe(0);
    expect(r.support.incomeYen).toBe(0);
    expect(r.totalYen).toBeGreaterThan(0); // 均等割・平等割分は発生する
  });
});

describe("所得の種類（事業所得／給与所得）", () => {
  it("このエンジンは totalIncomeYen（控除後の総所得）のみを受け取るため、事業所得・給与所得の別を区別しない", () => {
    // 給与所得控除・青色申告控除などは呼び出し側（ページ側）で
    // 「総所得金額等」に変換してから渡す設計。同じ総所得なら結果は同じになる。
    const r1 = calcMunicipalityKokuho({ totalIncomeYen: 3_000_000, members: 1, age: 35, municipality: fukuoka });
    const r2 = calcMunicipalityKokuho({ totalIncomeYen: 3_000_000, members: 1, age: 35, municipality: fukuoka });
    expect(r1.totalYen).toBe(r2.totalYen);
  });
});

describe("算定方式の違い（2方式・3方式・4方式）", () => {
  it("2方式（東京23区）：平等割は常に0円", () => {
    const r = calcMunicipalityKokuho({ totalIncomeYen: 5_000_000, members: 2, age: 45, municipality: tokyo23 });
    expect(r.medical.perHouseholdYen).toBe(0);
    expect(r.support.perHouseholdYen).toBe(0);
    expect(r.care?.perHouseholdYen).toBe(0);
  });

  it("3方式（福岡市）：平等割が発生する", () => {
    const r = calcMunicipalityKokuho({ totalIncomeYen: 5_000_000, members: 2, age: 45, municipality: fukuoka });
    expect(r.medical.perHouseholdYen).toBeGreaterThan(0);
  });

  it("医療・支援は3方式／介護・子どもは2方式が混在する自治体（大阪市）も正しく計算できる", () => {
    const r = calcMunicipalityKokuho({ totalIncomeYen: 5_000_000, members: 2, age: 45, municipality: osaka });
    expect(r.medical.perHouseholdYen).toBeGreaterThan(0); // 医療分は平等割あり
    expect(r.care?.perHouseholdYen).toBe(0);              // 介護分は平等割なし
  });

  it("4方式（資産割あり・テスト専用データ）：資産割が合計に反映される", () => {
    const withoutAsset = calcMunicipalityKokuho({
      totalIncomeYen: 3_000_000,
      members: 1,
      age: 45,
      municipality: dummy4Method,
      assetValueYen: 0,
    });
    const withAsset = calcMunicipalityKokuho({
      totalIncomeYen: 3_000_000,
      members: 1,
      age: 45,
      municipality: dummy4Method,
      assetValueYen: 100_000,
    });
    expect(withAsset.totalYen).toBeGreaterThan(withoutAsset.totalYen);
  });
});

describe("子ども・子育て支援金分が未確認の自治体（神戸市）", () => {
  it("childSupport が null になり、childSupportMissing フラグが立つ。計算からも除外される", () => {
    const kobe = findMunicipality("kobe")!;
    const r = calcMunicipalityKokuho({ totalIncomeYen: 5_000_000, members: 1, age: 45, municipality: kobe });
    expect(r.childSupport).toBeNull();
    expect(r.childSupportMissing).toBe(true);
  });
});

describe("未登録の自治体", () => {
  it("findMunicipality は存在しないコードに対して null を返す（推測データで埋めない）", () => {
    expect(findMunicipality("存在しない自治体コード")).toBeNull();
  });
});
