// ============================================
// シミュレーター一覧データ
// 新しいシミュレーターを追加するときはここに追記するだけでOKです
// ============================================

import type { SimulatorInfo } from "@/types";

export const SIMULATORS: SimulatorInfo[] = [
  {
    id: "loan-nisa",
    title: "住宅ローン・NISAシミュレーター",
    description: "ローン返済と資産形成を同時にシミュレーション",
    icon: "🏠",
    path: "/loan-nisa",
    available: true,
  },
  {
    id: "income",
    title: "手取りシミュレーター",
    description: "会社員と個人事業主の手取りを比較計算",
    icon: "💰",
    path: "/income",
    available: true,
  },
  {
    id: "furusato",
    title: "ふるさと納税シミュレーター",
    description: "控除上限額をかんたん計算",
    icon: "🧾",
    path: "/furusato",
    available: false,
  },
  {
    id: "microcorp",
    title: "マイクロ法人シミュレーター",
    description: "法人化のメリットをシミュレーション",
    icon: "🏢",
    path: "/microcorp",
    available: false,
  },
  {
    id: "ideco",
    title: "iDeCoシミュレーター",
    description: "節税額と将来資産をシミュレーション",
    icon: "📈",
    path: "/ideco",
    available: false,
  },
  {
    id: "kokuho",
    title: "国民健康保険シミュレーター",
    description: "保険料をかんたん計算",
    icon: "💴",
    path: "/kokuho",
    available: false,
  },
  {
    id: "ikukyu",
    title: "育休手当シミュレーター",
    description: "育休中の手取りをシミュレーション",
    icon: "👶",
    path: "/ikukyu",
    available: false,
  },
  {
    id: "refinance",
    title: "住宅ローン借り換えシミュレーター",
    description: "借り換えによる節約額をシミュレーション",
    icon: "🏡",
    path: "/refinance",
    available: false,
  },
  {
    id: "fire",
    title: "FIREシミュレーター",
    description: "経済的自立の達成時期をシミュレーション",
    icon: "💸",
    path: "/fire",
    available: false,
  },
];
