// ============================================
// トップページ
// シミュレーター一覧 + 共通プロフィール設定
// ============================================

import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import SimulatorGrid from "@/components/SimulatorGrid";
import { Card, SectionTitle, SliderInput } from "@/components/ui";
import { useSimulatorStore } from "@/store/simulatorStore";
import { KOKUHO_RATES } from "@/constants/kokuhoRates";

const ToggleBtn = ({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) => (
  <button onClick={onClick} className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
    active ? "bg-brand-500 text-white border-brand-500"
    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
  }`}>{children}</button>
);

export default function Home() {
  const { profile, setProfile, applyProfile } = useSimulatorStore();
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    applyProfile();
    setApplied(true);
    setTimeout(() => setApplied(false), 2000);
  };

  return (
    <Layout title="お金シミュレーターシリーズ">
      <div className="space-y-8">

        {/* キャッチコピー */}
        <div className="text-center py-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            お金に関する計算をかんたんに。全て無料でご利用いただけます。
          </p>
        </div>

        {/* 共通プロフィール設定 */}
        <section>
          <SectionTitle color="orange">⚡ まずあなたの情報を入力</SectionTitle>
          <Card>
            <p className="text-xs text-gray-400 dark:text-gray-500 mb-4">
              一度入力すると、全てのシミュレーターに自動反映されます
            </p>

            {/* 職業 */}
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">職業</p>
              <div className="flex gap-2">
                <ToggleBtn active={profile.workType === "employee"} onClick={() => setProfile("workType", "employee")}>
                  🏢 会社員
                </ToggleBtn>
                <ToggleBtn active={profile.workType === "freelance"} onClick={() => setProfile("workType", "freelance")}>
                  💼 個人事業主
                </ToggleBtn>
              </div>
            </div>

            {/* 収入 */}
            {profile.workType === "employee" ? (
              <SliderInput
                label="年収"
                value={profile.income} min={100} max={3000} step={10} unit="万円"
                onChange={v => setProfile("income", v)}
              />
            ) : (
              <>
                <SliderInput
                  label="年間売上"
                  value={profile.income} min={100} max={5000} step={10} unit="万円"
                  onChange={v => setProfile("income", v)}
                />
                <SliderInput
                  label="年間経費"
                  value={profile.expense} min={0} max={2000} step={10} unit="万円"
                  onChange={v => setProfile("expense", v)}
                />
              </>
            )}

            {/* 年齢 */}
            <SliderInput
              label="年齢"
              value={profile.age} min={20} max={70} step={1} unit="歳"
              onChange={v => setProfile("age", v)}
            />

            {/* 扶養人数 */}
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">扶養家族の人数</label>
              <select
                value={profile.dependents}
                onChange={e => setProfile("dependents", Number(e.target.value))}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {[0,1,2,3,4,5].map(n => (
                  <option key={n} value={n}>{n}人{n === 0 ? "（なし）" : ""}</option>
                ))}
              </select>
            </div>

            {/* 配偶者 */}
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">配偶者控除</p>
              <div className="flex gap-2">
                <ToggleBtn active={profile.hasSpouse} onClick={() => setProfile("hasSpouse", true)}>あり</ToggleBtn>
                <ToggleBtn active={!profile.hasSpouse} onClick={() => setProfile("hasSpouse", false)}>なし</ToggleBtn>
              </div>
            </div>

            {/* 自治体 */}
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">居住自治体（国保計算用）</label>
              <select
                value={profile.kokuhoCity}
                onChange={e => setProfile("kokuhoCity", e.target.value)}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {KOKUHO_RATES.map(r => <option key={r.city} value={r.city}>{r.city}</option>)}
                <option value="manual">その他</option>
              </select>
            </div>

            {/* 反映ボタン */}
            <button
              onClick={handleApply}
              className={`w-full py-3 rounded-xl text-sm font-bold transition-all ${
                applied
                  ? "bg-green-500 text-white"
                  : "bg-brand-500 hover:bg-brand-600 text-white active:opacity-70"
              }`}
            >
              {applied ? "✅ 全シミュレーターに反映しました！" : "全シミュレーターに反映する"}
            </button>
            <p className="text-xs text-gray-400 text-center mt-2">各ページで個別に変更することもできます</p>
          </Card>
        </section>

        {/* シミュレーター一覧 */}
        <SimulatorGrid title="シミュレーター一覧" />

      </div>
    </Layout>
  );
}
