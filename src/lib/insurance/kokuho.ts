// ============================================
// 国民健康保険料 計算ライブラリ
// 自治体ごとの料率に対応
// 国保の計算はこのファイルに一本化しています
// ============================================

import { roundYen, safeNum } from "@/lib/formatter";
import { KOKUHO_RATES, KOKUHO_MANUAL_DEFAULT } from "@/constants/kokuhoRates";
import type { KokuhoRate } from "@/constants/kokuhoRates";

/** 国保 所得割の基礎控除（円）全国共通（総所得 − 43万円） */
export const KOKUHO_SHOTOKU_KOJO_YEN = 430_000;

/** 国保 均等割軽減の基準額（円）2024年度 */
const KIGEN_7 = 430_000;                      // 7割軽減
const KIGEN_5_BASE = 430_000;                 // 5割軽減ベース
const KIGEN_5_PER = 290_000;                  // 5割軽減 被保険者1人あたり
const KIGEN_2_BASE = 430_000;                 // 2割軽減ベース
const KIGEN_2_PER = 535_000;                  // 2割軽減 被保険者1人あたり

/** 軽減判定の結果 */
export interface KintoInfo {
  /** 負担割合（7割軽減=0.3 / 5割軽減=0.5 / 2割軽減=0.8 / 軽減なし=1.0） */
  kintoRate: number;
  kintoLabel: string;
}

/**
 * 均等割・平等割の軽減区分を判定します
 *
 * @param totalIncomeYen 総所得（円）
 * @param members 世帯の被保険者数
 */
export function getKintoInfo(totalIncomeYen: number, members: number): KintoInfo {
  const income = safeNum(totalIncomeYen);
  const m = Math.max(1, members);
  const kigen5 = KIGEN_5_BASE + KIGEN_5_PER * m;
  const kigen2 = KIGEN_2_BASE + KIGEN_2_PER * m;
  if (income <= KIGEN_7) return { kintoRate: 0.3, kintoLabel: "7割軽減" };
  if (income <= kigen5) return { kintoRate: 0.5, kintoLabel: "5割軽減" };
  if (income <= kigen2) return { kintoRate: 0.8, kintoLabel: "2割軽減" };
  return { kintoRate: 1.0, kintoLabel: "軽減なし" };
}

/** 手動入力された料率（画面の入力値そのまま。率は%表記） */
export interface ManualKokuhoInput {
  manualIryoRate: number;
  manualShienRate: number;
  manualKaigoRate: number;
  manualIryoKintou: number;
  manualShienKintou: number;
  manualKaigoKintou: number;
  manualHeitou: number;
}

/**
 * 自治体名から料率データを解決します
 * "manual" の場合は手動入力値から組み立てます。見つからない場合は先頭（東京23区）。
 */
export function resolveKokuhoRate(city: string, manual?: ManualKokuhoInput): KokuhoRate {
  if (city === "manual" && manual) {
    return {
      ...KOKUHO_MANUAL_DEFAULT,
      iryoIncome: manual.manualIryoRate / 100,
      shienIncome: manual.manualShienRate / 100,
      kaigo: manual.manualKaigoRate / 100,
      iryoKintou: manual.manualIryoKintou,
      shienKintou: manual.manualShienKintou,
      kaigoKintou: manual.manualKaigoKintou,
      iryoHeitou: manual.manualHeitou,
      shienHeitou: 0,
    };
  }
  return KOKUHO_RATES.find(r => r.city === city) ?? KOKUHO_RATES[0];
}

/**
 * 都道府県名から代表の料率データを返します（マイクロ法人など自治体選択がない画面用）
 * データがない都道府県は東京23区の料率で概算します。
 */
export function findKokuhoRateByPrefecture(prefecture: string): KokuhoRate {
  return KOKUHO_RATES.find(r => r.prefecture === prefecture) ?? KOKUHO_RATES[0];
}

export interface KokuhoParams {
  /** 総所得（事業所得 = 売上 - 経費 - 青色控除）（円） */
  totalIncomeYen: number;
  /** 世帯の被保険者数（本人含む） */
  members: number;
  /** 年齢（40〜64歳は介護分が加算） */
  age: number;
  /** 自治体の料率データ */
  rate: KokuhoRate;
}

export interface KokuhoResult {
  iryoYen: number;    // 医療分
  shienYen: number;   // 支援金分
  kaigoYen: number;   // 介護分（40〜64歳のみ）
  totalYen: number;   // 合計
  shotokuBaseYen: number; // 所得割の計算基準（総所得 − 43万円）
  kintoRate: number;      // 軽減後の負担割合
  kintoLabel: string;     // 軽減区分
}

/**
 * 国民健康保険料を計算します（自治体別料率対応）
 *
 * @param params 計算パラメータ
 * @returns 国保料計算結果（円/年）
 *
 * @remarks
 * 計算式: 所得割 + 均等割 × 人数 + 平等割
 * 総所得は「事業所得（売上−経費−青色控除）」を使用
 * 課税所得（各種控除後）は使わないことに注意
 */
export function calcKokuhoAccurate(params: KokuhoParams): KokuhoResult {
  const { totalIncomeYen, members, age, rate } = params;
  const income = safeNum(totalIncomeYen);
  const m = Math.max(1, members);

  // 所得割の計算基準 = 総所得 - 43万円
  const shotokuBaseYen = Math.max(0, income - KOKUHO_SHOTOKU_KOJO_YEN);

  // 均等割・平等割の軽減判定
  const { kintoRate, kintoLabel } = getKintoInfo(income, m);

  // ── 医療分 ──
  const iryoRaw =
    shotokuBaseYen * rate.iryoIncome
    + rate.iryoKintou * m * kintoRate
    + rate.iryoHeitou * kintoRate;
  const iryoYen = roundYen(Math.min(iryoRaw, rate.iryoMax));

  // ── 支援金分 ──
  const shienRaw =
    shotokuBaseYen * rate.shienIncome
    + rate.shienKintou * m * kintoRate
    + rate.shienHeitou * kintoRate;
  const shienYen = roundYen(Math.min(shienRaw, rate.shienMax));

  // ── 介護分（40〜64歳のみ） ──
  let kaigoYen = 0;
  if (age >= 40 && age <= 64) {
    const kaigoRaw =
      shotokuBaseYen * rate.kaigo
      + rate.kaigoKintou * m * kintoRate
      + (rate.kaigoHeitou ?? 0) * kintoRate;
    kaigoYen = roundYen(Math.min(kaigoRaw, rate.kaigoMax));
  }

  const totalYen = iryoYen + shienYen + kaigoYen;

  return { iryoYen, shienYen, kaigoYen, totalYen, shotokuBaseYen, kintoRate, kintoLabel };
}
