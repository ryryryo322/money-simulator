// ============================================
// シミュレーター状態管理（Zustand）
// ページ移動しても入力値がリセットされません
// 新しいシミュレーターを追加するときはstateとactionを追記するだけ
// ============================================

import { create } from "zustand";
import type { EmployeeInputs, FreelanceInputs } from "@/types/income";
import type { SoloInputs, CorpInputs } from "@/types/microCorp";

// ── LoanNisa の初期値 ─────────────────────────

interface LoanNisaState {
  loanAmount: number;
  rate: number;
  loanYears: number;
  bonus: number;
  nisaMonthly: number;
  nisaReturn: number;
  currentAsset: number;
  currentAge: number;
  retireAge: number;
  income: number;
}

const loanNisaInitial: LoanNisaState = {
  loanAmount: 3500, rate: 1.5, loanYears: 35, bonus: 20,
  nisaMonthly: 5, nisaReturn: 5, currentAsset: 100,
  currentAge: 35, retireAge: 65, income: 500,
};

// ── Income の初期値 ───────────────────────────

interface IncomeState {
  empInp: EmployeeInputs;
  frlInp: FreelanceInputs;
}

const incomeInitial: IncomeState = {
  empInp: { income: 500, dependents: 0, hasSpouse: false },
  frlInp: {
    revenue: 700, expense: 200, blueReturn: "65",
    shokibo: 0, ideco: 0, dependents: 0, hasSpouse: false,
    hasBizTax: false, isTaxable: false,
  },
};

// ── MicroCorp の初期値 ────────────────────────

interface MicroCorpState {
  soloInp: SoloInputs;
  corpInp: CorpInputs;
}

const microCorpInitial: MicroCorpState = {
  soloInp: {
    revenue: 800, expense: 150, blueReturn: "65",
    shokibo: 0, ideco: 0, age: 40,
    hasSpouse: false, dependents: 0,
    hasBizTax: false, prefecture: "東京都",
  },
  corpInp: {
    monthlyReward: 10, maintenance: 15, hasCorpResidentTax: true,
  },
};

// ── ストア定義 ───────────────────────────────

interface SimulatorStore {
  // LoanNisa
  loanNisa: LoanNisaState;
  setLoanNisa: (key: keyof LoanNisaState, value: number) => void;

  // Income
  income: IncomeState;
  setEmpInp: <K extends keyof EmployeeInputs>(key: K, value: EmployeeInputs[K]) => void;
  setFrlInp: <K extends keyof FreelanceInputs>(key: K, value: FreelanceInputs[K]) => void;

  // MicroCorp
  microCorp: MicroCorpState;
  setSoloInp: <K extends keyof SoloInputs>(key: K, value: SoloInputs[K]) => void;
  setCorpInp: <K extends keyof CorpInputs>(key: K, value: CorpInputs[K]) => void;
}

export const useSimulatorStore = create<SimulatorStore>((set) => ({
  // ── LoanNisa ──
  loanNisa: loanNisaInitial,
  setLoanNisa: (key, value) =>
    set(s => ({ loanNisa: { ...s.loanNisa, [key]: value } })),

  // ── Income ──
  income: incomeInitial,
  setEmpInp: (key, value) =>
    set(s => ({ income: { ...s.income, empInp: { ...s.income.empInp, [key]: value } } })),
  setFrlInp: (key, value) =>
    set(s => ({ income: { ...s.income, frlInp: { ...s.income.frlInp, [key]: value } } })),

  // ── MicroCorp ──
  microCorp: microCorpInitial,
  setSoloInp: (key, value) =>
    set(s => ({ microCorp: { ...s.microCorp, soloInp: { ...s.microCorp.soloInp, [key]: value } } })),
  setCorpInp: (key, value) =>
    set(s => ({ microCorp: { ...s.microCorp, corpInp: { ...s.microCorp.corpInp, [key]: value } } })),
}));
