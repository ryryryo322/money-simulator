// ============================================
// 社会保険計算ライブラリ
// 全シミュレーターで共通利用します
// 内部計算はすべて「円」単位
// 2026年度対応
//
// ※国民健康保険の計算は ./kokuho.ts に一本化しています
// ============================================

import { safeNum, roundYen } from "@/lib/formatter";

// ── 定数 ────────────────────────────────────

/** 国民年金 月額（円）2026年度 */
export const KOKUNEN_MONTHLY_YEN = 17_000;

/** 国民年金 年額（円）2026年度 */
export const KOKUNEN_ANNUAL_YEN = KOKUNEN_MONTHLY_YEN * 12; // 204,000円

/** 協会けんぽ 健康保険料率（本人負担分・東京都）2026年度 */
export const SHAKAI_HOKEN_RATE = 0.0498;

/** 厚生年金保険料率（本人負担分）2026年度 */
export const KOSEI_NENKIN_RATE = 0.0915;

/** 標準報酬月額 上限（円）2026年度 */
export const HYOJUN_MAX_YEN = 650_000;

/** 標準報酬月額 下限（円）2026年度 */
export const HYOJUN_MIN_YEN = 58_000;

/** 会社員 社会保険料率概算（健保+厚年+雇用）本人負担分 */
export const EMPLOYEE_SOCIAL_RATE = 0.147;

// ── 型定義 ────────────────────────────────────

/** 社会保険計算結果 */
export interface SocialInsuranceResult {
  shakaiHokenYen: number;      // 健康保険（円/年）
  koseiNenkinYen: number;      // 厚生年金（円/年）
  totalYen: number;            // 合計（円/年）
}

// ── 関数 ─────────────────────────────────────

/**
 * 国民年金保険料を返します（年額）
 *
 * @returns 国民年金（円/年）
 *
 * @remarks 2026年度の定額保険料。60歳以上は加入不要な場合あり。
 */
export function calcKokunen(): number {
  return KOKUNEN_ANNUAL_YEN;
}

/**
 * 協会けんぽ・厚生年金保険料を計算します（役員報酬ベース）
 *
 * @param monthlyRewardYen 役員報酬月額（円）
 * @returns 健康保険・厚生年金の計算結果
 *
 * @remarks 標準報酬月額に基づく計算。東京都の協会けんぽ料率を使用。
 */
export function calcShakaiHokenKosei(monthlyRewardYen: number): SocialInsuranceResult {
  const hyojun = Math.min(
    Math.max(safeNum(monthlyRewardYen), HYOJUN_MIN_YEN),
    HYOJUN_MAX_YEN
  );
  const shakaiHokenYen = roundYen(hyojun * SHAKAI_HOKEN_RATE * 12);
  const koseiNenkinYen = roundYen(hyojun * KOSEI_NENKIN_RATE * 12);
  return {
    shakaiHokenYen,
    koseiNenkinYen,
    totalYen: shakaiHokenYen + koseiNenkinYen,
  };
}

/**
 * 会社員の社会保険料を概算します
 *
 * @param incomeYen 年収（円）
 * @returns 社会保険料（円/年）
 *
 * @remarks 健康保険+厚生年金+雇用保険の本人負担分合計の概算（約14.7%）
 */
export function calcEmployeeSocialInsurance(incomeYen: number): number {
  return roundYen(safeNum(incomeYen) * EMPLOYEE_SOCIAL_RATE);
}
