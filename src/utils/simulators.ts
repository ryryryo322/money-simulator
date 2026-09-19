import type { SimulatorInfo } from "@/types";
export const SIMULATORS: SimulatorInfo[] = [
  { id: "loan-nisa", title: "住宅ローン・NISAシミュレーター", description: "ローン返済と資産形成を同時にシミュレーション", icon: "🏠", path: "/loan-nisa", available: true },
  { id: "income", title: "手取りシミュレーター", description: "会社員と個人事業主の手取りを比較計算", icon: "💰", path: "/income", available: true },
  { id: "furusato", title: "ふるさと納税シミュレーター", description: "控除上限額をかんたん計算", icon: "🧾", path: "/furusato", available: true },
  { id: "microcorp", title: "マイクロ法人 損得シミュレーター", description: "個人事業とマイクロ法人を徹底比較", icon: "🏢", path: "/micro-corp", available: true },
  { id: "ideco", title: "iDeCoシミュレーター", description: "節税額と将来資産をシミュレーション", icon: "📈", path: "/ideco", available: true },
  { id: "kokuho", title: "国民健康保険シミュレーター", description: "自治体別の国保料をかんたん計算", icon: "💴", path: "/kokuho", available: true },
  { id: "tokyo-kokuho", title: "東京都 国保料シミュレーター", description: "東京23区・2026年度の国保料を区ごとに計算", icon: "🗼", path: "/tokyo-kokuho", available: true },
  { id: "ikukyu", title: "育休手当シミュレーター", description: "育休中の給付金をシミュレーション", icon: "👶", path: "/ikukyu", available: true },
  { id: "refinance", title: "住宅ローン借り換えシミュレーター", description: "借り換えによる節約額をシミュレーション", icon: "🏡", path: "/refinance", available: false },
  { id: "fire", title: "FIREシミュレーター", description: "経済的自立の達成時期をシミュレーション", icon: "💸", path: "/fire", available: false },
];
