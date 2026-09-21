// ============================================
// 手取りシミュレーター カスタムフック
// 自治体別国保計算対応版
// ============================================

import { useMemo } from "react";
import {
  calcIncomeTax, calcResidentTax, calcKyuyoDeduction,
  calcIncomeDeductions, calcBizTax,
  BASIC_DEDUCTION_YEN,/**/ 
} from "@/lib/tax";
import { calcKokunen, calcEmployeeSocialInsurance } from "@/lib/insurance";
import { calcKokuhoAccurate } from "@/lib/insurance/kokuho";
import { roundYen, manToYen, yenToMan } from "@/lib/formatter";
import {
  BLUE_RETURN_OPTIONS,
  RESIDENT_TAX_INCOME_RATE,
  RESIDENT_TAX_FLAT,
} from "@/constants/tax2026";
import { KOKUHO_RATES, KOKUHO_MANUAL_DEFAULT } from "@/constants/kokuhoRates";
import type { EmployeeInputs, FreelanceInputs, EmployeeResult, FreelanceResult, CalcStep } from "@/types/income";

// ── 会社員の計算 ─────────────────────────────

function computeEmployee(inp: EmployeeInputs): EmployeeResult {
  const incomeYen = manToYen(inp.income);
  const kyuyoDeductionYen = calcKyuyoDeduction(incomeYen);
  const kyuyoIncomeYen = Math.max(0, incomeYen - kyuyoDeductionYen);
  const socialInsuranceYen = calcEmployeeSocialInsurance(incomeYen);
  const totalDeductionsYen = calcIncomeDeductions({
    dependents: inp.dependents,
    hasSpouse: inp.hasSpouse,
    socialInsuranceYen,
  });
  const taxableIncomeYen = Math.max(0, kyuyoIncomeYen - totalDeductionsYen);
  const incomeTaxYen = calcIncomeTax(taxableIncomeYen);
  const residentTaxYen = calcResidentTax(taxableIncomeYen);
  const totalBurdenYen = roundYen(incomeTaxYen + residentTaxYen + socialInsuranceYen);
  const takeHomeYen = roundYen(incomeYen - totalBurdenYen);

  return {
    income: inp.income,
    kyuyoDeduction: yenToMan(kyuyoDeductionYen),
    kyuyoIncome: yenToMan(kyuyoIncomeYen),
    totalDeductions: yenToMan(totalDeductionsYen),
    taxableIncome: yenToMan(taxableIncomeYen),
    socialInsurance: yenToMan(socialInsuranceYen),
    incomeTax: yenToMan(incomeTaxYen),
    residentTax: yenToMan(residentTaxYen),
    totalBurden: yenToMan(totalBurdenYen),
    takeHome: yenToMan(takeHomeYen),
    takeHomeRate: Math.round((takeHomeYen / Math.max(incomeYen, 1)) * 1000) / 10,
  };
}

// ── 個人事業主の計算 ─────────────────────────

function computeFreelance(inp: FreelanceInputs): FreelanceResult {
  const revenueYen = manToYen(inp.revenue);
  const expenseYen = manToYen(inp.expense);
  const businessIncomeYen = Math.max(0, revenueYen - expenseYen);
  const blueDeductionYen = Math.min(manToYen(BLUE_RETURN_OPTIONS[inp.blueReturn]), businessIncomeYen);

  // 国保の計算基準は「青色控除後の事業所得」（課税所得ではない）
  const afterBlueYen = roundYen(businessIncomeYen - blueDeductionYen);

  const shokoboYen = roundYen(manToYen(inp.shokibo) * 12);
  const idecoYen = roundYen(manToYen(inp.ideco) * 12);
  const bizTaxYen = calcBizTax(afterBlueYen, inp.hasBizTax);

  // 自治体別国保計算
  const kokuhoRate = inp.kokuhoCity === "manual"
    ? {
        ...KOKUHO_MANUAL_DEFAULT,
        iryoIncome: inp.manualIryoRate / 100,
        shienIncome: inp.manualShienRate / 100,
        kaigo: inp.manualKaigoRate / 100,
        iryoKintou: inp.manualIryoKintou,
        shienKintou: inp.manualShienKintou,
        kaigoKintou: inp.manualKaigoKintou,
        iryoHeitou: inp.manualHeitou,
        shienHeitou: 0,
      }
    : KOKUHO_RATES.find(r => r.city === inp.kokuhoCity) ?? KOKUHO_RATES[0];

  const kokuhoResult = calcKokuhoAccurate({
    totalIncomeYen: afterBlueYen,  // 青色控除後の事業所得を使用
    members: inp.members,
    age: inp.age,
    rate: kokuhoRate,
  });
  const kokuhoYen = kokuhoResult.totalYen;
  const kokunenYen = calcKokunen();

  const consumptionTaxYen = inp.isTaxable
    ? roundYen(Math.max(0, businessIncomeYen * 0.1))
    : 0;

  // 所得控除（課税所得の計算に使う）
  const totalDeductionsYen = calcIncomeDeductions({
    dependents: inp.dependents,
    hasSpouse: inp.hasSpouse,
    socialInsuranceYen: kokuhoYen + kokunenYen,
    shokoboYen,
    idecoYen,
  });

  const taxableIncomeYen = Math.max(0, afterBlueYen - totalDeductionsYen);
  const incomeTaxYen = calcIncomeTax(taxableIncomeYen);
  const residentTaxYen = roundYen(taxableIncomeYen * RESIDENT_TAX_INCOME_RATE + RESIDENT_TAX_FLAT);
  const totalBurdenYen = roundYen(incomeTaxYen + residentTaxYen + kokuhoYen + kokunenYen + bizTaxYen + consumptionTaxYen);
  const takeHomeYen = roundYen(businessIncomeYen - totalBurdenYen);

  const m = (y: number) => yenToMan(y);
  return {
    revenue: inp.revenue,
    expense: inp.expense,
    businessIncome: m(businessIncomeYen),
    blueDeduction: m(blueDeductionYen),
    afterBlue: m(afterBlueYen),
    shokoboAnnual: m(shokoboYen),
    idecoAnnual: m(idecoYen),
    kokuho: m(kokuhoYen),
    kokuhoIryo: m(kokuhoResult.iryoYen),
    kokuhoShien: m(kokuhoResult.shienYen),
    kokuhoKaigo: m(kokuhoResult.kaigoYen),
    kokunen: m(kokunenYen),
    bizTax: m(bizTaxYen),
    consumptionTax: m(consumptionTaxYen),
    totalDeductions: m(totalDeductionsYen),
    taxableIncome: m(taxableIncomeYen),
    incomeTax: m(incomeTaxYen),
    residentTax: m(residentTaxYen),
    totalBurden: m(totalBurdenYen),
    takeHome: m(takeHomeYen),
    takeHomeRate: Math.round((takeHomeYen / Math.max(revenueYen, 1)) * 1000) / 10,
  };
}

// ── 計算根拠ステップ ─────────────────────────

export function buildFreelanceSteps(r: FreelanceResult): CalcStep[] {
  return [
    { label: "年間売上", value: r.revenue },
    { label: "経費", value: r.expense, isDeduction: true },
    { label: "事業所得", value: r.businessIncome, isResult: true },
    { label: "青色申告控除", value: r.blueDeduction, isDeduction: true },
    { label: "基礎控除", value: yenToMan(BASIC_DEDUCTION_YEN), isDeduction: true },
    { label: "国民健康保険", value: r.kokuho, isDeduction: true },
    { label: "国民年金", value: r.kokunen, isDeduction: true },
    ...(r.shokoboAnnual > 0 ? [{ label: "小規模企業共済", value: r.shokoboAnnual, isDeduction: true }] : []),
    ...(r.idecoAnnual > 0 ? [{ label: "iDeCo", value: r.idecoAnnual, isDeduction: true }] : []),
    { label: "課税所得", value: r.taxableIncome, isResult: true },
    { label: "所得税", value: r.incomeTax, isDeduction: true },
    { label: "住民税", value: r.residentTax, isDeduction: true },
    ...(r.bizTax > 0 ? [{ label: "個人事業税", value: r.bizTax, isDeduction: true }] : []),
    ...(r.consumptionTax > 0 ? [{ label: "消費税", value: r.consumptionTax, isDeduction: true }] : []),
    { label: "手取り", value: r.takeHome, isResult: true },
  ];
}

export function useIncomeSimulator({ empInp, frlInp }: { empInp: EmployeeInputs; frlInp: FreelanceInputs }) {
  const emp = useMemo(() => computeEmployee(empInp), [empInp]);
  const frl = useMemo(() => computeFreelance(frlInp), [frlInp]);
  const frlSteps = useMemo(() => buildFreelanceSteps(frl), [frl]);
  return { emp, frl, frlSteps };
}
