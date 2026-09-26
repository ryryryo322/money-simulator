// ============================================
// マイクロ法人 計算ロジック
// 入出力は万円、内部計算は円（lib/tax・lib/insurance を利用）
// ============================================

import { BLUE_RETURN_OPTIONS, YAKUIN_TRIAL_LIST } from "@/constants/tax2026";
import {
  calcIncomeTax, calcResidentTax, calcKyuyoDeduction,
  calcIncomeDeductions, calcBizTax, calcCorpTax,
} from "@/lib/tax";
import { calcKokunen, calcShakaiHokenKosei } from "@/lib/insurance";
import { calcKokuhoAccurate, findKokuhoRateByPrefecture } from "@/lib/insurance/kokuho";
import { manToYen, yenToMan, roundYen } from "@/lib/formatter";
import type { SoloInputs, CorpInputs, SoloResult, CorpResult, RewardTrial, DualInputs, DualResult } from "@/types/microCorp";

/** 万円を小数1桁で丸める */
const round1 = (n: number) => Math.round(n * 10) / 10;

/** 円 → 万円（小数1桁） */
const toMan = (yen: number) => round1(yenToMan(yen));

// ── 個人事業主の計算 ─────────────────────────

export function calcSolo(inp: SoloInputs): SoloResult {
  const businessIncomeYen = Math.max(0, manToYen(inp.revenue) - manToYen(inp.expense));
  const blueDeductionYen = Math.min(manToYen(BLUE_RETURN_OPTIONS[inp.blueReturn]), businessIncomeYen);
  const afterBlueYen = businessIncomeYen - blueDeductionYen;
  const shokoboYen = roundYen(manToYen(inp.shokibo) * 12);
  const idecoYen = roundYen(manToYen(inp.ideco) * 12);
  const bizTaxYen = calcBizTax(afterBlueYen, inp.hasBizTax);

  // 国保は都道府県ごとの代表料率で計算（本人1人世帯）
  const kokuhoYen = calcKokuhoAccurate({
    totalIncomeYen: afterBlueYen,
    members: 1,
    age: inp.age,
    rate: findKokuhoRateByPrefecture(inp.prefecture),
  }).totalYen;
  const kokunenYen = calcKokunen();

  const deductionsYen = calcIncomeDeductions({
    dependents: inp.dependents,
    hasSpouse: inp.hasSpouse,
    socialInsuranceYen: kokuhoYen + kokunenYen,
    shokoboYen,
    idecoYen,
  });
  const taxableIncomeYen = Math.max(0, afterBlueYen - deductionsYen);
  const incomeTaxYen = calcIncomeTax(taxableIncomeYen);
  const residentTaxYen = calcResidentTax(taxableIncomeYen);
  const totalBurdenYen = incomeTaxYen + residentTaxYen + kokuhoYen + kokunenYen + bizTaxYen;
  const takeHomeYen = businessIncomeYen - totalBurdenYen;

  return {
    businessIncome: toMan(businessIncomeYen),
    blueDeduction: toMan(blueDeductionYen),
    shokobo: toMan(shokoboYen),
    idecoDeduction: toMan(idecoYen),
    kokuho: toMan(kokuhoYen),
    kokunen: toMan(kokunenYen),
    bizTax: toMan(bizTaxYen),
    incomeTax: toMan(incomeTaxYen),
    residentTax: toMan(residentTaxYen),
    totalBurden: toMan(totalBurdenYen),
    takeHome: toMan(takeHomeYen),
  };
}

// ── マイクロ法人の計算 ───────────────────────

export function calcCorp(soloInp: SoloInputs, corpInp: CorpInputs): CorpResult {
  const businessIncomeYen = manToYen(soloInp.revenue) - manToYen(soloInp.expense);
  const annualRewardYen = manToYen(corpInp.monthlyReward) * 12;
  const corpProfitYen = Math.max(0, businessIncomeYen - annualRewardYen);
  const maintenanceYen = manToYen(corpInp.maintenance);

  const corpTax = calcCorpTax(corpProfitYen, corpInp.hasCorpResidentTax);
  const insurance = calcShakaiHokenKosei(manToYen(corpInp.monthlyReward));

  // 役員報酬は給与所得として課税
  const kyuyoIncomeYen = Math.max(0, annualRewardYen - calcKyuyoDeduction(annualRewardYen));
  const personalDeductionsYen = calcIncomeDeductions({
    dependents: soloInp.dependents,
    hasSpouse: soloInp.hasSpouse,
    socialInsuranceYen: insurance.totalYen,
  });
  const personalTaxableYen = Math.max(0, kyuyoIncomeYen - personalDeductionsYen);
  const personalIncomeTaxYen = calcIncomeTax(personalTaxableYen);
  const personalResidentTaxYen = calcResidentTax(personalTaxableYen);

  const totalBurdenYen =
    personalIncomeTaxYen + personalResidentTaxYen
    + insurance.totalYen
    + corpTax.totalYen
    + maintenanceYen;
  const personalTakeYen = annualRewardYen - personalIncomeTaxYen - personalResidentTaxYen - insurance.totalYen;
  const corpRetainedYen = Math.max(0, corpProfitYen - corpTax.totalYen - maintenanceYen);

  return {
    annualReward: toMan(annualRewardYen),
    corpProfit: toMan(corpProfitYen),
    shakaiHoken: toMan(insurance.shakaiHokenYen),
    koseiNenkin: toMan(insurance.koseiNenkinYen),
    personalIncomeTax: toMan(personalIncomeTaxYen),
    personalResidentTax: toMan(personalResidentTaxYen),
    corpTax: toMan(corpTax.corpTaxYen),
    corpResidentTax: toMan(corpTax.corpResidentTaxYen),
    maintenance: toMan(maintenanceYen),
    totalBurden: toMan(totalBurdenYen),
    takeHome: toMan(personalTakeYen + corpRetainedYen),
  };
}

// ── 役員報酬別試算 ───────────────────────────

export function calcRewardTrials(soloInp: SoloInputs, corpInp: CorpInputs, soloTakeHome: number): RewardTrial[] {
  return YAKUIN_TRIAL_LIST.map((monthly) => {
    const result = calcCorp(soloInp, { ...corpInp, monthlyReward: monthly });
    return {
      monthlyReward: monthly,
      takeHome: result.takeHome,
      totalBurden: result.totalBurden,
      diff: round1(result.takeHome - soloTakeHome),
    };
  });
}

// ── おすすめ役員報酬 ─────────────────────────

export function getBestReward(trials: RewardTrial[]): number {
  return trials.reduce((best, t) => (t.takeHome > best.takeHome ? t : best)).monthlyReward;
}

// ── 二刀流パターンの計算 ─────────────────────

export function calcDual(inp: DualInputs): DualResult {
  // 個人事業のみの場合（比較用）
  const soloTotal = calcSolo({
    revenue: inp.soloRevenue + inp.corpRevenue,
    expense: inp.soloExpense + inp.corpExpense,
    blueReturn: inp.blueReturn,
    shokibo: inp.shokibo,
    ideco: inp.ideco,
    age: 40,
    hasSpouse: inp.hasSpouse,
    dependents: inp.dependents,
    hasBizTax: inp.hasBizTax,
    prefecture: "東京都",
  });

  // 二刀流の個人事業側
  const soloBusinessIncomeYen = Math.max(0, manToYen(inp.soloRevenue) - manToYen(inp.soloExpense));
  const blueDeductionYen = Math.min(manToYen(BLUE_RETURN_OPTIONS[inp.blueReturn]), soloBusinessIncomeYen);
  const afterBlueYen = soloBusinessIncomeYen - blueDeductionYen;

  // 法人側の社会保険（役員報酬ベース）
  const annualRewardYen = manToYen(inp.monthlyReward) * 12;
  const insurance = calcShakaiHokenKosei(manToYen(inp.monthlyReward));
  const shokoboYen = roundYen(manToYen(inp.shokibo) * 12);
  const idecoYen = roundYen(manToYen(inp.ideco) * 12);

  // 個人事業の課税所得（社会保険は法人側で払うので国保・国民年金なし）
  const soloDeductionsYen = calcIncomeDeductions({
    dependents: inp.dependents,
    hasSpouse: inp.hasSpouse,
    socialInsuranceYen: insurance.totalYen,
    shokoboYen,
    idecoYen,
  });
  const soloTaxableYen = Math.max(0, afterBlueYen - soloDeductionsYen);
  const soloIncomeTaxYen = calcIncomeTax(soloTaxableYen);
  const soloResidentTaxYen = calcResidentTax(soloTaxableYen);

  // 法人側
  const corpProfitYen = Math.max(0, manToYen(inp.corpRevenue) - manToYen(inp.corpExpense) - annualRewardYen);
  const corpTax = calcCorpTax(corpProfitYen, inp.hasCorpResidentTax);
  const maintenanceYen = manToYen(inp.maintenance);

  // 役員報酬から個人の手取り
  const kyuyoIncomeYen = Math.max(0, annualRewardYen - calcKyuyoDeduction(annualRewardYen));
  const rewardDeductionsYen = calcIncomeDeductions({
    dependents: inp.dependents,
    hasSpouse: inp.hasSpouse,
    socialInsuranceYen: insurance.totalYen,
  });
  const rewardTaxableYen = Math.max(0, kyuyoIncomeYen - rewardDeductionsYen);
  const rewardIncomeTaxYen = calcIncomeTax(rewardTaxableYen);
  const rewardResidentTaxYen = calcResidentTax(rewardTaxableYen);

  const personalTakeYen = annualRewardYen - rewardIncomeTaxYen - rewardResidentTaxYen - insurance.totalYen;
  const soloTakeYen = afterBlueYen - soloIncomeTaxYen - soloResidentTaxYen;
  const corpRetainedYen = Math.max(0, corpProfitYen - corpTax.totalYen - maintenanceYen);
  const dualTakeHome = toMan(personalTakeYen + soloTakeYen + corpRetainedYen);

  return {
    soloOnly: {
      takeHome: soloTotal.takeHome,
      kokuho: soloTotal.kokuho,
      kokunen: soloTotal.kokunen,
      incomeTax: soloTotal.incomeTax,
      residentTax: soloTotal.residentTax,
    },
    dualTotal: {
      takeHome: dualTakeHome,
      shakaiHoken: toMan(insurance.shakaiHokenYen),
      koseiNenkin: toMan(insurance.koseiNenkinYen),
      personalIncomeTax: toMan(soloIncomeTaxYen + rewardIncomeTaxYen),
      corpTax: toMan(corpTax.corpTaxYen),
    },
    diff: round1(dualTakeHome - soloTotal.takeHome),
  };
}
