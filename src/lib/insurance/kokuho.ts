// ============================================
// 国民健康保険料 計算ライブラリ
// 自治体ごとの料率に対応
// ============================================

import { roundYen, safeNum } from "@/lib/formatter";
import type { KokuhoRate } from "@/constants/kokuhoRates";

/** 国保 所得割の基礎控除（円）全国共通 */
export const KOKUHO_SHOTOKU_KOJO_YEN = 330_000;

/** 国保 均等割軽減の基準額（円）2024年度 */
const KIGEN_7 = 430_000;                      // 7割軽減
const KIGEN_5_BASE = 430_000;                 // 5割軽減ベース
const KIGEN_5_PER = 290_000;                  // 5割軽減 被保険者1人あたり
const KIGEN_2_BASE = 430_000;                 // 2割軽減ベース
const KIGEN_2_PER = 535_000;                  // 2割軽減 被保険者1人あたり

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

  // 所得割の計算基準 = 総所得 - 33万円（国保独自の基礎控除）
  const shotokuBase = Math.max(0, income - KOKUHO_SHOTOKU_KOJO_YEN);

  // 均等割・平等割の軽減判定
  const kigen7 = KIGEN_7;
  const kigen5 = KIGEN_5_BASE + KIGEN_5_PER * m;
  const kigen2 = KIGEN_2_BASE + KIGEN_2_PER * m;
  const kintoRate =
    income <= kigen7 ? 0.3   // 7割軽減 → 3割負担
    : income <= kigen5 ? 0.5 // 5割軽減 → 5割負担
    : income <= kigen2 ? 0.8 // 2割軽減 → 8割負担
    : 1.0;                   // 軽減なし

  // ── 医療分 ──
  const iryoShotoku = shotokuBase * rate.iryoIncome;
  const iryoKintou = rate.iryoKintou * m * kintoRate;
  const iryoHeitou = rate.iryoHeitou * kintoRate;
  const iryoRaw = iryoShotoku + iryoKintou + iryoHeitou;
  const iryoYen = roundYen(Math.min(iryoRaw, rate.iryoMax));

  // ── 支援金分 ──
  const shienShotoku = shotokuBase * rate.shienIncome;
  const shienKintou = rate.shienKintou * m * kintoRate;
  const shienHeitou = rate.shienHeitou * kintoRate;
  const shienRaw = shienShotoku + shienKintou + shienHeitou;
  const shienYen = roundYen(Math.min(shienRaw, rate.shienMax));

  // ── 介護分（40〜64歳のみ） ──
  let kaigoYen = 0;
  if (age >= 40 && age <= 64) {
    const kaigoShotoku = shotokuBase * rate.kaigo;
    const kaigoKintou = rate.kaigoKintou * m * kintoRate;
    const kaigoHeitou = (rate.kaigoHeitou ?? 0) * kintoRate;
    const kaigoRaw = kaigoShotoku + kaigoKintou + kaigoHeitou;
    kaigoYen = roundYen(Math.min(kaigoRaw, rate.kaigoMax));
  }

  const totalYen = iryoYen + shienYen + kaigoYen;

  return { iryoYen, shienYen, kaigoYen, totalYen };
}