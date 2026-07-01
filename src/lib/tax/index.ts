// ============================================
// 税金計算ライブラリ
// 全シミュレーターで共通利用します
// 内部計算はすべて「円」単位
// 2026年度税制対応
// ============================================

import { safeNum, roundYen } from "@/lib/formatter";

// ── 定数（制度改正時はここだけ変更） ───────────

/** 所得税 超過累進課税テーブル（円単位） */
const INCOME_TAX_BRACKETS = [
  { max: 1_950_000,   rate: 0.05,  deduction: 0 },
  { max: 3_300_000,   rate: 0.10,  deduction: 97_500 },
  { max: 6_950_000,   rate: 0.20,  deduction: 427_500 },
  { max: 9_000_000,   rate: 0.23,  deduction: 636_000 },
  { max: 18_000_000,  rate: 0.33,  deduction: 1_536_000 },
  { max: 40_000_000,  rate: 0.40,  deduction: 2_796_000 },
  { max: Infinity,    rate: 0.45,  deduction: 4_796_000 },
] as const;

/** 復興特別所得税率（2037年まで） */
const RECONSTRUCTION_TAX_RATE = 0.021;

/** 基礎控除（円）2026年度 */
export const BASIC_DEDUCTION_YEN = 480_000;

/** 扶養控除 1人あたり（円） */
export const DEPENDENT_DEDUCTION_YEN = 380_000;

/** 配偶者控除（円） */
export const SPOUSE_DEDUCTION_YEN = 380_000;

/** 住民税率（所得割） */
export const RESIDENT_TAX_INCOME_RATE = 0.10;

/** 住民税 均等割 + 森林環境税（円/年）2024年度〜 */
export const RESIDENT_TAX_FLAT_YEN = 6_000;

/** 給与所得控除テーブル（円単位） */
const KYUYO_DEDUCTION_BRACKETS = [
  { max: 1_625_000,   deduction: 550_000 },
  { max: 1_800_000,   rate: 0.40, offset: -100_000 },
  { max: 3_600_000,   rate: 0.30, offset: 80_000 },
  { max: 6_600_000,   rate: 0.20, offset: 440_000 },
  { max: 8_500_000,   rate: 0.10, offset: 1_100_000 },
  { max: Infinity,    deduction: 1_950_000 },
] as const;

/** 個人事業税 控除額（円） */
export const BIZ_TAX_DEDUCTION_YEN = 2_900_000;

/** 個人事業税 税率 */
export const BIZ_TAX_RATE = 0.05;

/** 法人税率 軽減税率（利益800万円以下）中小企業 */
export const CORP_TAX_RATE_SMALL = 0.15;

/** 法人税率（利益800万円超） */
export const CORP_TAX_RATE_LARGE = 0.234;

/** 法人税 軽減税率適用上限（円） */
export const CORP_TAX_THRESHOLD_YEN = 8_000_000;

/** 法人住民税 均等割（円/年）最低税額 */
export const CORP_RESIDENT_TAX_FLAT_YEN = 70_000;

// ── 型定義 ────────────────────────────────────

/** 所得控除パラメータ */
export interface IncomeDeductionParams {
  dependents: number;
  hasSpouse: boolean;
  socialInsuranceYen: number;  // 社会保険料（円）
  shokoboYen?: number;         // 小規模企業共済（円）
  idecoYen?: number;           // iDeCo（円）
}

/** 法人税計算結果 */
export interface CorpTaxResult {
  corpTaxYen: number;          // 法人税
  corpResidentTaxYen: number;  // 法人住民税均等割
  totalYen: number;            // 合計
}

// ── 関数 ─────────────────────────────────────

/**
 * 所得税を計算します（復興特別所得税込み）
 *
 * @param taxableIncomeYen 課税所得（円）
 * @returns 所得税（円）
 *
 * @remarks 2026年度税制対応。復興特別所得税（2037年まで）含む。
 */
export function calcIncomeTax(taxableIncomeYen: number): number {
  const income = safeNum(taxableIncomeYen);
  for (const b of INCOME_TAX_BRACKETS) {
    if (income <= b.max) {
      const tax = income * b.rate - b.deduction;
      return roundYen(Math.max(0, tax) * (1 + RECONSTRUCTION_TAX_RATE));
    }
  }
  return 0;
}

/**
 * 住民税を計算します
 *
 * @param taxableIncomeYen 課税所得（円）
 * @returns 住民税（円）
 *
 * @remarks 所得割10% + 均等割6,000円（森林環境税含む）。自治体により異なります。
 */
export function calcResidentTax(taxableIncomeYen: number): number {
  const income = safeNum(taxableIncomeYen);
  return roundYen(income * RESIDENT_TAX_INCOME_RATE + RESIDENT_TAX_FLAT_YEN);
}

/**
 * 給与所得控除を計算します
 *
 * @param incomeYen 給与収入（円）
 * @returns 給与所得控除（円）
 */
export function calcKyuyoDeduction(incomeYen: number): number {
  const income = safeNum(incomeYen);
  for (const b of KYUYO_DEDUCTION_BRACKETS) {
    if (income <= b.max) {
      if ("deduction" in b) return b.deduction;
      if ("rate" in b) return roundYen(income * b.rate + b.offset);
    }
  }
  return 1_950_000;
}

/**
 * 所得控除合計を計算します
 *
 * @param params 控除パラメータ
 * @returns 所得控除合計（円）
 *
 * @remarks 基礎控除・扶養控除・配偶者控除・社会保険料控除・iDeCo・小規模企業共済を含む
 */
export function calcIncomeDeductions(params: IncomeDeductionParams): number {
  const {
    dependents,
    hasSpouse,
    socialInsuranceYen,
    shokoboYen = 0,
    idecoYen = 0,
  } = params;

  return roundYen(
    BASIC_DEDUCTION_YEN
    + dependents * DEPENDENT_DEDUCTION_YEN
    + (hasSpouse ? SPOUSE_DEDUCTION_YEN : 0)
    + safeNum(socialInsuranceYen)
    + safeNum(shokoboYen)
    + safeNum(idecoYen)
  );
}

/**
 * 個人事業税を計算します
 *
 * @param businessIncomeYen 事業所得（円）
 * @param hasBizTax 個人事業税の対象業種か
 * @returns 個人事業税（円）
 *
 * @remarks ライター・エンジニアなど第5種事業は非課税の場合あり
 */
export function calcBizTax(businessIncomeYen: number, hasBizTax: boolean): number {
  if (!hasBizTax) return 0;
  const taxable = safeNum(businessIncomeYen) - BIZ_TAX_DEDUCTION_YEN;
  return roundYen(Math.max(0, taxable) * BIZ_TAX_RATE);
}

/**
 * 法人税を計算します
 *
 * @param corpProfitYen 法人利益（役員報酬控除後）（円）
 * @param hasResidentTax 法人住民税均等割を含めるか
 * @returns 法人税計算結果
 *
 * @remarks 中小企業の軽減税率を適用。法人事業税・地方法人税は含まない（概算）
 */
export function calcCorpTax(
  corpProfitYen: number,
  hasResidentTax = true,
): CorpTaxResult {
  const profit = safeNum(corpProfitYen);
  let corpTaxYen = 0;
  if (profit <= CORP_TAX_THRESHOLD_YEN) {
    corpTaxYen = roundYen(profit * CORP_TAX_RATE_SMALL);
  } else {
    corpTaxYen = roundYen(
      CORP_TAX_THRESHOLD_YEN * CORP_TAX_RATE_SMALL
      + (profit - CORP_TAX_THRESHOLD_YEN) * CORP_TAX_RATE_LARGE
    );
  }
  const corpResidentTaxYen = hasResidentTax ? CORP_RESIDENT_TAX_FLAT_YEN : 0;
  return {
    corpTaxYen,
    corpResidentTaxYen,
    totalYen: corpTaxYen + corpResidentTaxYen,
  };
}
