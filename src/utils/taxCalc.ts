// ============================================
// 共通税計算ユーティリティ
// ============================================

import {
  INCOME_TAX_BRACKETS,
  RECONSTRUCTION_TAX_RATE,
  BASIC_DEDUCTION,
  DEPENDENT_DEDUCTION_PER_PERSON,
  SPOUSE_DEDUCTION,
  RESIDENT_TAX_RATE,
  RESIDENT_TAX_FLAT,
  KYUYO_DEDUCTION_BRACKETS,
  KOKUHO_RATE,
  KOKUHO_FIXED,
  KOKUHO_MAX,
  KOKUNEN_MONTHLY,
  BIZ_TAX_RATE,
  BIZ_TAX_DEDUCTION,
  SHAKAI_HOKEN_RATE,
  KOSEI_NENKIN_RATE,
  HYOJUN_MAX,
  HYOJUN_MIN,
  CORP_TAX_RATE_SMALL,
  CORP_TAX_RATE_LARGE,
  CORP_TAX_THRESHOLD,
} from "@/constants/tax2026";

/** 所得税計算（万円単位） */
export function calcIncomeTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return 0;
  for (const bracket of INCOME_TAX_BRACKETS) {
    if (taxableIncome <= bracket.max) {
      const tax = taxableIncome * bracket.rate - bracket.deduction;
      return Math.max(0, tax) * RECONSTRUCTION_TAX_RATE;
    }
  }
  return 0;
}

/** 住民税計算（万円単位） */
export function calcResidentTax(taxableIncome: number): number {
  if (taxableIncome <= 0) return RESIDENT_TAX_FLAT;
  return taxableIncome * RESIDENT_TAX_RATE + RESIDENT_TAX_FLAT;
}

/** 給与所得控除計算（万円単位） */
export function calcKyuyoDeduction(income: number): number {
  for (const b of KYUYO_DEDUCTION_BRACKETS) {
    if (income <= b.max) {
      if ("deduction" in b) return b.deduction;
      if ("rate" in b) return income * b.rate + b.offset;
    }
  }
  return 195;
}

/** 国民健康保険料計算（万円単位） */
export function calcKokuho(income: number): number {
  return Math.min(income * KOKUHO_RATE + KOKUHO_FIXED, KOKUHO_MAX);
}

/** 国民年金（年額・万円） */
export function calcKokunen(): number {
  return KOKUNEN_MONTHLY;
}

/** 個人事業税（万円単位） */
export function calcBizTax(income: number, hasBizTax: boolean): number {
  if (!hasBizTax) return 0;
  return Math.max(0, (income - BIZ_TAX_DEDUCTION) * BIZ_TAX_RATE);
}

/** 所得控除合計（万円単位） */
export function calcSocialDeductions(params: {
  dependents: number;
  hasSpouse: boolean;
  kokuho?: number;
  kokunen?: number;
  kosei?: number;
  shokibo?: number;
  ideco?: number;
}): number {
  const { dependents, hasSpouse, kokuho = 0, kokunen = 0, kosei = 0, shokibo = 0, ideco = 0 } = params;
  return (
    BASIC_DEDUCTION
    + dependents * DEPENDENT_DEDUCTION_PER_PERSON
    + (hasSpouse ? SPOUSE_DEDUCTION : 0)
    + kokuho + kokunen + kosei + shokibo + ideco
  );
}

/** 協会けんぽ 健康保険料（月額・万円） */
export function calcShakaiHoken(monthlyReward: number): number {
  const hyojun = Math.min(Math.max(monthlyReward, HYOJUN_MIN), HYOJUN_MAX);
  return hyojun * SHAKAI_HOKEN_RATE;
}

/** 厚生年金保険料（月額・万円） */
export function calcKoseiNenkin(monthlyReward: number): number {
  const hyojun = Math.min(Math.max(monthlyReward, HYOJUN_MIN), HYOJUN_MAX);
  return hyojun * KOSEI_NENKIN_RATE;
}

/** 法人税計算（万円単位） */
export function calcCorpTax(profit: number): number {
  if (profit <= 0) return 0;
  if (profit <= CORP_TAX_THRESHOLD) return profit * CORP_TAX_RATE_SMALL;
  return CORP_TAX_THRESHOLD * CORP_TAX_RATE_SMALL + (profit - CORP_TAX_THRESHOLD) * CORP_TAX_RATE_LARGE;
}

/** 万円を小数1桁で丸める */
export const round1 = (n: number) => Math.round(n * 10) / 10;
