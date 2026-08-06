// ============================================
// シミュレーター状態管理（Zustand）
// ページ移動しても入力値がリセットされません
// 新しいシミュレーターを追加するときはstateとactionを追記するだけ
// ============================================

import { create } from "zustand";
import type { EmployeeInputs, FreelanceInputs } from "@/types/income";
import type { SoloInputs, CorpInputs } from "@/types/microCorp";

// ============================================
// 共通プロフィール
// トップページで一度入力すると全ページに反映
// ============================================

export type WorkType = "employee" | "freelance";

export interface UserProfile {
  workType: WorkType;       // 職業
  income: number;           // 年収・売上（万円）
  expense: number;          // 経費（個人事業主のみ、万円）
  age: number;              // 年齢
  dependents: number;       // 扶養人数
  hasSpouse: boolean;       // 配偶者あり
  kokuhoCity: string;       // 居住自治体（国保計算用）
}

const profileInitial: UserProfile = {
  workType: "employee",
  income: 500,
  expense: 100,
  age: 35,
  dependents: 0,
  hasSpouse: false,
  kokuhoCity: "東京都（23区）",
};

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
    age: 35, members: 1, kokuhoCity: "東京都（23区）",
    manualIryoRate: 8.0, manualShienRate: 2.7, manualKaigoRate: 2.2,
    manualIryoKintou: 25000, manualShienKintou: 8000,
    manualKaigoKintou: 11000, manualHeitou: 20000,
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
  // 共通プロフィール
  profile: UserProfile;
  setProfile: <K extends keyof UserProfile>(key: K, value: UserProfile[K]) => void;
  // プロフィールを全ページに一括反映
  applyProfile: () => void;

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

export const useSimulatorStore = create<SimulatorStore>((set, get) => ({
  // ── 共通プロフィール ──
  profile: profileInitial,
  setProfile: (key, value) =>
    set(s => ({ profile: { ...s.profile, [key]: value } })),

  // プロフィールの内容を全シミュレーターに一括反映
  applyProfile: () => {
    const { profile } = get();
    set(s => ({
      // LoanNisa
      loanNisa: {
        ...s.loanNisa,
        currentAge: profile.age,
        income: profile.workType === "employee" ? profile.income : profile.income - profile.expense,
      },
      // Income（会社員）
      income: {
        empInp: {
          ...s.income.empInp,
          income: profile.income,
          dependents: profile.dependents,
          hasSpouse: profile.hasSpouse,
        },
        frlInp: {
          ...s.income.frlInp,
          revenue: profile.income,
          expense: profile.expense,
          dependents: profile.dependents,
          hasSpouse: profile.hasSpouse,
          age: profile.age,
          kokuhoCity: profile.kokuhoCity,
        },
      },
      // MicroCorp
      microCorp: {
        ...s.microCorp,
        soloInp: {
          ...s.microCorp.soloInp,
          revenue: profile.income,
          expense: profile.expense,
          age: profile.age,
          dependents: profile.dependents,
          hasSpouse: profile.hasSpouse,
        },
      },
    }));
  },

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
