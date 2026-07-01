// ============================================
// 手取りシミュレーター カスタムフック
// 計算ロジックをUIから分離します
// Income.tsx はこのhookを呼ぶだけでOK
// ============================================

import { useMemo } from "react";
import {
  BASIC_DEDUCTION,
  DEPENDENT_DEDUCTION_PER_PERSON,
  SPOUSE_DEDUCTION,
  BLUE_RETURN_OPTIONS,
  KOKUNEN_ANNUAL,
  KOKUHO_RATE,
  KOKUHO_FIXED,
  KOKUHO_MAX,
  BIZ_TAX_RATE,
  BIZ_TAX_DEDUCTION,
  RESIDENT_TAX_RATE,
  RESIDENT_TAX_FLAT,
} from "@/constants/tax2026";
import {
  calcIncomeTax,
  calcKyuyoDeduction,
  round1,
} from "@/utils/taxCalc";
import type {
  EmployeeInputs,
  FreelanceInputs,
  EmployeeResult,
  FreelanceResult,
  CalcStep,
} from "@/types/income";

// ── 会社員の計算 ─────────────────────────────

function computeEmployee(inp: EmployeeInputs): EmployeeResult {
  // 給与所得控除
  const kyuyoDeduction = calcKyuyoDeduction(inp.income);
  const kyuyoIncome = Math.max(0, inp.income - kyuyoDeduction);

  // 社会保険料概算（健保+厚年+雇用: 約14.7%）
  const socialInsurance = round1(inp.income * 0.147);

  // 所得控除合計
  const totalDeductions = round1(
    BASIC_DEDUCTION
    + inp.dependents * DEPENDENT_DEDUCTION_PER_PERSON
    + (inp.hasSpouse ? SPOUSE_DEDUCTION : 0)
    + socialInsurance
  );

  // 課税所得
  const taxableIncome = Math.max(0, kyuyoIncome - totalDeductions);

  // 税額
  const incomeTax = round1(calcIncomeTax(taxableIncome));
  const residentTax = round1(taxableIncome * RESIDENT_TAX_RATE + RESIDENT_TAX_FLAT);

  const totalBurden = round1(incomeTax + residentTax + socialInsurance);
  const takeHome = round1(inp.income - totalBurden);

  return {
    income: inp.income,
    kyuyoDeduction: round1(kyuyoDeduction),
    kyuyoIncome: round1(kyuyoIncome),
    totalDeductions,
    taxableIncome: round1(taxableIncome),
    socialInsurance,
    incomeTax,
    residentTax,
    totalBurden,
    takeHome,
    takeHomeRate: round1((takeHome / Math.max(inp.income, 1)) * 100),
  };
}

// ── 個人事業主の計算 ─────────────────────────

function computeFreelance(inp: FreelanceInputs): FreelanceResult {
  // 事業所得
  const businessIncome = Math.max(0, inp.revenue - inp.expense);

  // 青色申告控除
  const blueDeduction = Math.min(BLUE_RETURN_OPTIONS[inp.blueReturn], businessIncome);
  const afterBlue = round1(businessIncome - blueDeduction);

  // 小規模企業共済・iDeCo（年額）
  const shokoboAnnual = round1(inp.shokibo * 12);
  const idecoAnnual = round1(inp.ideco * 12);

  // 個人事業税（業種によって不要）
  const bizTax = inp.hasBizTax
    ? round1(Math.max(0, (afterBlue - BIZ_TAX_DEDUCTION) * BIZ_TAX_RATE))
    : 0;

  // 国民健康保険（概算。自治体によって異なります）
  const kokuho = round1(Math.min(afterBlue * KOKUHO_RATE + KOKUHO_FIXED, KOKUHO_MAX));

  // 国民年金（2026年度）
  const kokunen = round1(KOKUNEN_ANNUAL);

  // 消費税（課税事業者のみ。簡易計算）
  // ※正確には簡易課税・原則課税で異なります
  const consumptionTax = inp.isTaxable
    ? round1(Math.max(0, (inp.revenue - inp.expense) * 0.1))
    : 0;

  // 所得控除合計
  const totalDeductions = round1(
    BASIC_DEDUCTION
    + inp.dependents * DEPENDENT_DEDUCTION_PER_PERSON
    + (inp.hasSpouse ? SPOUSE_DEDUCTION : 0)
    + kokuho
    + kokunen
    + shokoboAnnual
    + idecoAnnual
  );

  // 課税所得
  const taxableIncome = Math.max(0, afterBlue - totalDeductions);

  // 税額
  const incomeTax = round1(calcIncomeTax(taxableIncome));
  const residentTax = round1(taxableIncome * RESIDENT_TAX_RATE + RESIDENT_TAX_FLAT);

  const totalBurden = round1(incomeTax + residentTax + kokuho + kokunen + bizTax + consumptionTax);
  const takeHome = round1(businessIncome - totalBurden);

  return {
    revenue: inp.revenue,
    expense: inp.expense,
    businessIncome: round1(businessIncome),
    blueDeduction: round1(blueDeduction),
    afterBlue,
    shokoboAnnual,
    idecoAnnual,
    kokuho,
    kokunen,
    bizTax,
    consumptionTax,
    totalDeductions,
    taxableIncome: round1(taxableIncome),
    incomeTax,
    residentTax,
    totalBurden,
    takeHome,
    takeHomeRate: round1((takeHome / Math.max(inp.revenue, 1)) * 100),
  };
}

// ── 計算根拠ステップ生成 ──────────────────────

export function buildFreelanceSteps(r: FreelanceResult): CalcStep[] {
  return [
    { label: "年間売上", value: r.revenue },
    { label: "経費", value: r.expense, isDeduction: true },
    { label: "事業所得", value: r.businessIncome, isResult: true },
    { label: `青色申告控除`, value: r.blueDeduction, isDeduction: true },
    { label: "基礎控除", value: BASIC_DEDUCTION, isDeduction: true },
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
