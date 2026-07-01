// ============================================
// 手取りシミュレーター カスタムフック（リファクタリング済み）
// lib/tax・lib/insurance の共通ライブラリを使用
// 内部計算は円単位、表示は万円に変換
// ============================================

import { useMemo } from "react";
import {
  calcIncomeTax, calcResidentTax, calcKyuyoDeduction,
  calcIncomeDeductions, calcBizTax,
  BASIC_DEDUCTION_YEN,
} from "@/lib/tax";
import {
  calcKokuho, calcKokunen, calcEmployeeSocialInsurance,
} from "@/lib/insurance";
import { roundYen, manToYen, yenToMan } from "@/lib/formatter";
import { BLUE_RETURN_OPTIONS } from "@/constants/tax2026";
import type {
  EmployeeInputs, FreelanceInputs,
  EmployeeResult, FreelanceResult, CalcStep,
} from "@/types/income";

// ── 会社員の計算 ─────────────────────────────

function computeEmployee(inp: EmployeeInputs): EmployeeResult {
  // 入力を円に変換
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

  // 表示用に万円へ変換
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
  // 入力を円に変換
  const revenueYen = manToYen(inp.revenue);
  const expenseYen = manToYen(inp.expense);
  const businessIncomeYen = Math.max(0, revenueYen - expenseYen);

  // 青色申告控除
  const blueDeductionYen = Math.min(
    manToYen(BLUE_RETURN_OPTIONS[inp.blueReturn]),
    businessIncomeYen
  );
  const afterBlueYen = roundYen(businessIncomeYen - blueDeductionYen);

  // 小規模企業共済・iDeCo（年額・円）
  const shokoboYen = roundYen(manToYen(inp.shokibo) * 12);
  const idecoYen = roundYen(manToYen(inp.ideco) * 12);

  // 個人事業税
  const bizTaxYen = calcBizTax(afterBlueYen, inp.hasBizTax);

  // 国民健康保険・国民年金
  const kokuhoYen = calcKokuho({ businessIncomeYen: afterBlueYen });
  const kokunenYen = calcKokunen();

  // 消費税（課税事業者のみ・簡易計算）
  const consumptionTaxYen = inp.isTaxable
    ? roundYen(Math.max(0, businessIncomeYen * 0.1))
    : 0;

  // 所得控除合計
  const totalDeductionsYen = calcIncomeDeductions({
    dependents: inp.dependents,
    hasSpouse: inp.hasSpouse,
    socialInsuranceYen: kokuhoYen + kokunenYen,
    shokoboYen,
    idecoYen,
  });

  // 課税所得
  const taxableIncomeYen = Math.max(0, afterBlueYen - totalDeductionsYen);

  // 税額
  const incomeTaxYen = calcIncomeTax(taxableIncomeYen);
  const residentTaxYen = calcResidentTax(taxableIncomeYen);

  const totalBurdenYen = roundYen(
    incomeTaxYen + residentTaxYen + kokuhoYen + kokunenYen + bizTaxYen + consumptionTaxYen
  );
  const takeHomeYen = roundYen(businessIncomeYen - totalBurdenYen);

  // 万円に変換して返す
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
  const basicDeductionMan = yenToMan(BASIC_DEDUCTION_YEN);
  return [
    { label: "年間売上", value: r.revenue },
    { label: "経費", value: r.expense, isDeduction: true },
    { label: "事業所得", value: r.businessIncome, isResult: true },
    { label: "青色申告控除", value: r.blueDeduction, isDeduction: true },
    { label: "基礎控除", value: basicDeductionMan, isDeduction: true },
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

// ── カスタムフック ────────────────────────────

interface UseIncomeSimulatorProps {
  empInp: EmployeeInputs;
  frlInp: FreelanceInputs;
}

export function useIncomeSimulator({ empInp, frlInp }: UseIncomeSimulatorProps) {
  const emp = useMemo(() => computeEmployee(empInp), [empInp]);
  const frl = useMemo(() => computeFreelance(frlInp), [frlInp]);
  const frlSteps = useMemo(() => buildFreelanceSteps(frl), [frl]);
  return { emp, frl, frlSteps };
}
