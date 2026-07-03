// ============================================
// 国民健康保険料 計算ライブラリ
// 自治体ごとの料率に対応
// ============================================

import { roundYen, safeNum } from "@/lib/formatter";
import type { KokuhoRate } from "@/constants/kokuhoRates";

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

  // ── 医療分 ──
  const iryoShotoku = income * rate.iryoIncome;
  const iryoKintou = rate.iryoKintou * m;
  const iryoHeitou = rate.iryoHeitou;
  const iryoRaw = iryoShotoku + iryoKintou + iryoHeitou;
  const iryoYen = roundYen(Math.min(iryoRaw, rate.iryoMax));

  // ── 支援金分 ──
  const shienShotoku = income * rate.shienIncome;
  const shienKintou = rate.shienKintou * m;
  const shienHeitou = rate.shienHeitou;
  const shienRaw = shienShotoku + shienKintou + shienHeitou;
  const shienYen = roundYen(Math.min(shienRaw, rate.shienMax));

  // ── 介護分（40〜64歳のみ） ──
  let kaigoYen = 0;
  if (age >= 40 && age <= 64) {
    const kaigoShotoku = income * rate.kaigo;
    const kaigoKintou = rate.kaigoKintou * m;
    const kaigoRaw = kaigoShotoku + kaigoKintou;
    kaigoYen = roundYen(Math.min(kaigoRaw, rate.kaigoMax));
  }

  const totalYen = iryoYen + shienYen + kaigoYen;

  return { iryoYen, shienYen, kaigoYen, totalYen };
}
