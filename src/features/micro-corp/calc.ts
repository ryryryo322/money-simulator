// ============================================
// マイクロ法人 計算ロジック
// ============================================

import {
  BLUE_RETURN_OPTIONS,
  CORP_RESIDENT_TAX_FLAT,
  YAKUIN_TRIAL_LIST,
  BASIC_DEDUCTION,
  DEPENDENT_DEDUCTION_PER_PERSON,
  SPOUSE_DEDUCTION,
} from "@/constants/tax2026";
import {
  calcIncomeTax, calcResidentTax, calcKokuho, calcKokunen,
  calcBizTax, calcSocialDeductions, calcShakaiHoken,
  calcKoseiNenkin, calcCorpTax, calcKyuyoDeduction, round1,
} from "@/utils/taxCalc";
import type { SoloInputs, CorpInputs, SoloResult, CorpResult, RewardTrial, DualInputs, DualResult } from "@/types/microCorp";

// ── 個人事業主の計算 ─────────────────────────

export function calcSolo(inp: SoloInputs): SoloResult {
  const businessIncome = Math.max(0, inp.revenue - inp.expense);
  const blueDeduction = Math.min(BLUE_RETURN_OPTIONS[inp.blueReturn], businessIncome);
  const afterBlue = businessIncome - blueDeduction;
  const shokobo = inp.shokibo * 12;
  const idecoDeduction = inp.ideco * 12;
  const bizTax = calcBizTax(afterBlue, inp.hasBizTax);
  const kokuho = calcKokuho(afterBlue);
  const kokunen = calcKokunen();
  const deductions = calcSocialDeductions({
    dependents: inp.dependents,
    hasSpouse: inp.hasSpouse,
    kokuho,
    kokunen,
    shokibo: shokobo,
    ideco: idecoDeduction,
  });
  const taxableIncome = Math.max(0, afterBlue - deductions);
  const incomeTax = calcIncomeTax(taxableIncome);
  const residentTax = calcResidentTax(taxableIncome);
  const totalBurden = incomeTax + residentTax + kokuho + kokunen + bizTax;
  const takeHome = businessIncome - totalBurden;

  return {
    businessIncome: round1(businessIncome),
    blueDeduction: round1(blueDeduction),
    shokobo: round1(shokobo),
    idecoDeduction: round1(idecoDeduction),
    kokuho: round1(kokuho),
    kokunen: round1(kokunen),
    bizTax: round1(bizTax),
    incomeTax: round1(incomeTax),
    residentTax: round1(residentTax),
    totalBurden: round1(totalBurden),
    takeHome: round1(takeHome),
  };
}

// ── マイクロ法人の計算 ───────────────────────

export function calcCorp(soloInp: SoloInputs, corpInp: CorpInputs): CorpResult {
  const annualReward = corpInp.monthlyReward * 12;
  const corpProfit = Math.max(0, soloInp.revenue - soloInp.expense - annualReward);
  const corpTax = calcCorpTax(corpProfit);
  const corpResidentTax = corpInp.hasCorpResidentTax ? CORP_RESIDENT_TAX_FLAT : 0;
  const monthlyShakaiHoken = calcShakaiHoken(corpInp.monthlyReward);
  const monthlyKoseiNenkin = calcKoseiNenkin(corpInp.monthlyReward);
  const shakaiHoken = monthlyShakaiHoken * 12;
  const koseiNenkin = monthlyKoseiNenkin * 12;
  const kyuyoDeduction = calcKyuyoDeduction(annualReward);
  const kyuyoIncome = Math.max(0, annualReward - kyuyoDeduction);
  const personalDeductions = calcSocialDeductions({
    dependents: soloInp.dependents,
    hasSpouse: soloInp.hasSpouse,
    kosei: shakaiHoken + koseiNenkin,
  });
  const personalTaxableIncome = Math.max(0, kyuyoIncome - personalDeductions);
  const personalIncomeTax = calcIncomeTax(personalTaxableIncome);
  const personalResidentTax = calcResidentTax(personalTaxableIncome);
  const totalBurden =
    personalIncomeTax + personalResidentTax
    + shakaiHoken + koseiNenkin
    + corpTax + corpResidentTax
    + corpInp.maintenance;
  const personalTake = annualReward - personalIncomeTax - personalResidentTax - shakaiHoken - koseiNenkin;
  const takeHome = round1(personalTake + Math.max(0, corpProfit - corpTax - corpResidentTax - corpInp.maintenance));

  return {
    annualReward: round1(annualReward),
    corpProfit: round1(corpProfit),
    shakaiHoken: round1(shakaiHoken),
    koseiNenkin: round1(koseiNenkin),
    personalIncomeTax: round1(personalIncomeTax),
    personalResidentTax: round1(personalResidentTax),
    corpTax: round1(corpTax),
    corpResidentTax: round1(corpResidentTax),
    maintenance: round1(corpInp.maintenance),
    totalBurden: round1(totalBurden),
    takeHome,
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
  const soloBusinessIncome = Math.max(0, inp.soloRevenue - inp.soloExpense);
  const blueDeduction = Math.min(BLUE_RETURN_OPTIONS[inp.blueReturn], soloBusinessIncome);
  const afterBlue = soloBusinessIncome - blueDeduction;

  // 法人側の社会保険（役員報酬ベース）
  const annualReward = inp.monthlyReward * 12;
  const shakaiHoken = calcShakaiHoken(inp.monthlyReward) * 12;
  const koseiNenkin = calcKoseiNenkin(inp.monthlyReward) * 12;
  const shokobo = inp.shokibo * 12;
  const ideco = inp.ideco * 12;

  // 個人事業の課税所得（社会保険は法人側で払うので国保・国民年金なし）
  const personalDeductions =
    BASIC_DEDUCTION
    + inp.dependents * DEPENDENT_DEDUCTION_PER_PERSON
    + (inp.hasSpouse ? SPOUSE_DEDUCTION : 0)
    + shakaiHoken + koseiNenkin
    + shokobo + ideco;

  const soloTaxableIncome = Math.max(0, afterBlue - personalDeductions);
  const personalIncomeTax = calcIncomeTax(soloTaxableIncome);
  const personalResidentTax = calcResidentTax(soloTaxableIncome);

  // 法人側
  const corpProfit = Math.max(0, inp.corpRevenue - inp.corpExpense - annualReward);
  const corpTaxAmt = calcCorpTax(corpProfit);
  const corpResidentTax = inp.hasCorpResidentTax ? CORP_RESIDENT_TAX_FLAT : 0;

  // 役員報酬から個人の手取り
  const kyuyoDeduction = calcKyuyoDeduction(annualReward);
  const kyuyoIncome = Math.max(0, annualReward - kyuyoDeduction);
  const rewardDeductions =
    BASIC_DEDUCTION
    + inp.dependents * DEPENDENT_DEDUCTION_PER_PERSON
    + (inp.hasSpouse ? SPOUSE_DEDUCTION : 0)
    + shakaiHoken + koseiNenkin;
  const rewardTaxable = Math.max(0, kyuyoIncome - rewardDeductions);
  const rewardIncomeTax = calcIncomeTax(rewardTaxable);
  const rewardResidentTax = calcResidentTax(rewardTaxable);

  const personalTake = annualReward - rewardIncomeTax - rewardResidentTax - shakaiHoken - koseiNenkin;
  const soloTake = afterBlue - personalIncomeTax - personalResidentTax;
  const corpRetained = Math.max(0, corpProfit - corpTaxAmt - corpResidentTax - inp.maintenance);
  const dualTakeHome = round1(personalTake + soloTake + corpRetained);

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
      shakaiHoken: round1(shakaiHoken),
      koseiNenkin: round1(koseiNenkin),
      personalIncomeTax: round1(personalIncomeTax + rewardIncomeTax),
      corpTax: round1(corpTaxAmt),
    },
    diff: round1(dualTakeHome - soloTotal.takeHome),
  };
}