// ============================================
// 自治体別 国民健康保険料 計算エンジン（v2）
// ============================================
// 区分（医療分・支援分・介護分・子ども分）ごとに独立して計算し、
// 区分ごとに賦課限度額を適用します。
// 「合計額に最後に一律で上限をかける」実装はしていません。
//
// 既存の src/lib/insurance/kokuho.ts（calcKokuhoAccurate）とは
// 別系統です。既存の /income・/micro-corp・/tokyo-kokuho は
// 引き続き kokuho.ts を使用しており、このファイルでは変更していません。
// ============================================

import { roundYen, safeNum } from "@/lib/formatter";
import type { BracketConfig, ChildBracketConfig, MunicipalityConfig } from "@/types/municipality";

/** 国保 所得割の基礎控除（円）全国共通（総所得 − 43万円） */
export const KOKUHO_SHOTOKU_KOJO_YEN = 430_000;

const KIGEN_7 = 430_000;
const KIGEN_5_BASE = 430_000;
const KIGEN_5_PER = 290_000;
const KIGEN_2_BASE = 430_000;
const KIGEN_2_PER = 535_000;

export interface ReductionInfo {
  /** 負担割合（7割軽減=0.3 / 5割軽減=0.5 / 2割軽減=0.8 / 軽減なし=1.0） */
  rate: number;
  label: string;
}

/**
 * 均等割・平等割の軽減区分を判定します（簡易判定）
 *
 * @remarks
 * 正確な判定には世帯全員の所得・給与所得者等の人数・特定同一世帯所属者の
 * 有無が必要ですが、ここでは「世帯の総所得・加入者数」のみで判定します。
 */
export function getReductionInfo(totalIncomeYen: number, members: number): ReductionInfo {
  const income = safeNum(totalIncomeYen);
  const m = Math.max(1, members);
  const kigen5 = KIGEN_5_BASE + KIGEN_5_PER * m;
  const kigen2 = KIGEN_2_BASE + KIGEN_2_PER * m;
  if (income <= KIGEN_7) return { rate: 0.3, label: "7割軽減" };
  if (income <= kigen5) return { rate: 0.5, label: "5割軽減" };
  if (income <= kigen2) return { rate: 0.8, label: "2割軽減" };
  return { rate: 1.0, label: "軽減なし" };
}

export interface BracketResult {
  /** 区分名（表示用） */
  label: string;
  incomeYen: number;     // 所得割部分
  perCapitaYen: number;  // 均等割部分（軽減後）
  perHouseholdYen: number; // 平等割部分（軽減後）
  rawYen: number;        // 上限適用前の合計
  totalYen: number;      // 上限適用後の合計（実際に賦課される額）
  cappedByMax: boolean;  // 賦課限度額で頭打ちになったか
}

/**
 * 1区分（医療・支援・介護）を計算する
 * 4方式（資産割あり）の自治体向けに assetValueYen（固定資産税額）を
 * 受け付けるが、現在登録している10自治体はいずれも資産割を採用して
 * いないため、通常は0のまま使われない（将来、資産割ありの自治体を
 * 追加する際にそのまま使える設計にしている）
 */
function calcBracket(
  label: string,
  bracket: BracketConfig,
  shotokuBaseYen: number,
  members: number,
  reductionRate: number,
  assetValueYen = 0
): BracketResult {
  const incomeYen = shotokuBaseYen * bracket.incomeRate;
  const perCapitaYen = bracket.perCapitaYen * members * reductionRate;
  const perHouseholdYen = bracket.perHouseholdYen * reductionRate;
  const assetYen = (bracket.assetRate ?? 0) * assetValueYen;
  const rawYen = incomeYen + perCapitaYen + perHouseholdYen + assetYen;
  const totalYen = Math.min(rawYen, bracket.maxYen);
  return {
    label,
    incomeYen: roundYen(incomeYen),
    perCapitaYen: roundYen(perCapitaYen),
    perHouseholdYen: roundYen(perHouseholdYen),
    rawYen: roundYen(rawYen),
    totalYen: roundYen(totalYen),
    cappedByMax: rawYen > bracket.maxYen,
  };
}

/** 子ども・子育て支援金分を計算する（18歳以上加算に対応） */
function calcChildBracket(
  bracket: ChildBracketConfig,
  shotokuBaseYen: number,
  members: number,
  adultMembers: number,
  reductionRate: number
): BracketResult {
  const incomeYen = shotokuBaseYen * bracket.incomeRate;
  // 基本均等割は加入者全員、18歳以上加算は成人の加入者数ぶんのみ
  const perCapitaYen = (bracket.perCapitaYen * members + bracket.perCapitaAge18PlusYen * adultMembers) * reductionRate;
  const perHouseholdYen = bracket.perHouseholdYen * reductionRate;
  const rawYen = incomeYen + perCapitaYen + perHouseholdYen;
  const totalYen = Math.min(rawYen, bracket.maxYen);
  return {
    label: "子ども・子育て支援金分",
    incomeYen: roundYen(incomeYen),
    perCapitaYen: roundYen(perCapitaYen),
    perHouseholdYen: roundYen(perHouseholdYen),
    rawYen: roundYen(rawYen),
    totalYen: roundYen(totalYen),
    cappedByMax: rawYen > bracket.maxYen,
  };
}

export interface MunicipalityKokuhoParams {
  /** 総所得（円）。事業所得なら売上−経費−青色控除後、給与所得なら給与所得控除後の金額 */
  totalIncomeYen: number;
  /** 世帯の国保加入者数（本人含む） */
  members: number;
  /**
   * 加入者の年齢。現状の入力仕様（単一の年齢のみ）に合わせ、
   * 「世帯の加入者は全員この年齢」という簡略化をしています。
   * 複数人世帯で年齢が異なる場合、正確な計算にはなりません。
   */
  age: number;
  municipality: MunicipalityConfig;
  /** 資産割（4方式）の自治体向け：固定資産税額（円）。該当しない場合は省略可 */
  assetValueYen?: number;
}

export interface MunicipalityKokuhoResult {
  shotokuBaseYen: number;
  reduction: ReductionInfo;
  medical: BracketResult;
  support: BracketResult;
  care: BracketResult | null;          // 40〜64歳以外、または制度がない場合はnull
  childSupport: BracketResult | null;  // データ未確認の自治体はnull
  totalYen: number;
  /** 子ども分が自治体データ未確認のため計算に含まれていない場合true */
  childSupportMissing: boolean;
}

/**
 * 自治体ごとの制度に基づいて国民健康保険料を計算します（区分ごとに独立計算・区分ごとに上限適用）
 *
 * @remarks
 * - 所得割算定基礎額 = 総所得 − 43万円（基礎控除、全国共通）
 * - 均等割・平等割には軽減率を適用。所得割には適用しない
 * - 介護分は40〜64歳の加入者のみ対象（年齢入力が単一のため、世帯全員が
 *   その年齢であるという簡略化をしています）
 * - 子ども・子育て支援金分は、自治体データが未確認（childSupport: null）の
 *   場合は計算に含めず、その旨を結果に明示します
 */
export function calcMunicipalityKokuho(params: MunicipalityKokuhoParams): MunicipalityKokuhoResult {
  const { totalIncomeYen, members, age, municipality, assetValueYen = 0 } = params;
  const income = safeNum(totalIncomeYen);
  const m = Math.max(1, members);

  const shotokuBaseYen = Math.max(0, income - KOKUHO_SHOTOKU_KOJO_YEN);
  const reduction = getReductionInfo(income, m);

  const medical = calcBracket("医療分（基礎分）", municipality.medical, shotokuBaseYen, m, reduction.rate, assetValueYen);
  const support = calcBracket("支援分（後期高齢者支援金等分）", municipality.support, shotokuBaseYen, m, reduction.rate, assetValueYen);

  let care: BracketResult | null = null;
  if (municipality.care && age >= 40 && age <= 64) {
    care = calcBracket("介護分（40〜64歳）", municipality.care, shotokuBaseYen, m, reduction.rate, assetValueYen);
  }

  let childSupport: BracketResult | null = null;
  const childSupportMissing = municipality.childSupport === null;
  if (municipality.childSupport) {
    // 単一年齢入力の簡略化：入力年齢が18歳以上なら、世帯全員を成人として扱う
    const adultMembers = age >= 18 ? m : 0;
    childSupport = calcChildBracket(municipality.childSupport, shotokuBaseYen, m, adultMembers, reduction.rate);
  }

  const totalYen =
    medical.totalYen + support.totalYen + (care?.totalYen ?? 0) + (childSupport?.totalYen ?? 0);

  return {
    shotokuBaseYen: roundYen(shotokuBaseYen),
    reduction,
    medical,
    support,
    care,
    childSupport,
    totalYen: roundYen(totalYen),
    childSupportMissing,
  };
}
