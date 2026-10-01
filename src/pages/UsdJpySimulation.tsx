// ============================================
// ドル円積立シミュレーター
// /usd-jpy-simulation
//
// 実際のUSD/JPY為替データ（Frankfurter APIより取得）を使い、
// 指定した年月から毎月ドルに積み立てていたら、現在いくらに
// なっていたかをシミュレーションします。
//
// データ取得はCloudflare Worker（frankfurter-api）を経由します。
// フロントエンドからFrankfurterのAPIを直接呼ぶことはありません。
// ============================================

import { useMemo, useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

import Layout from "@/components/Layout";
import { Card, SectionTitle, SliderInput, StatRow, ChartTooltip } from "@/components/ui";
import SimulatorGrid from "@/components/SimulatorGrid";
import { useUsdJpySimulator } from "@/hooks/useUsdJpySimulator";

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: CURRENT_YEAR - 1999 + 1 }, (_, i) => 1999 + i);
const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

const fmtYen = (n: number) => `${Math.round(n).toLocaleString()}円`;
const fmtUsd = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
const fmtPct = (n: number) => `${n >= 0 ? "+" : ""}${n.toLocaleString()}%`;

export default function UsdJpySimulation() {
  const [startYear, setStartYear] = useState<number>(2020);
  const [startMonth, setStartMonth] = useState<number>(1);
  const [years, setYears] = useState<number>(5);
  const [monthlyAmount, setMonthlyAmount] = useState<number>(30000);

  const { run, loading, error, result, rule } = useUsdJpySimulator();

  const startYearMonth = useMemo(
    () => `${startYear}-${String(startMonth).padStart(2, "0")}`,
    [startYear, startMonth]
  );
  const months = years * 12;

  const handleRun = () => {
    void run(startYearMonth, months, monthlyAmount);
  };

  return (
    <Layout title="ドル円積立シミュレーター｜何年前から毎月いくらでドル積立？">
      <div className="space-y-10">

        <div className="text-center py-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            実際の過去のUSD/JPYレートをもとに、ドル積立の実績をシミュレーションします
          </p>
        </div>

        {/* 入力 */}
        <section>
          <SectionTitle color="blue">💵 シミュレーション条件</SectionTitle>
          <Card>
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">積立開始年月</p>
              <div className="flex gap-2">
                <select
                  value={startYear}
                  onChange={(e) => setStartYear(Number(e.target.value))}
                  className="flex-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>{y}年</option>
                  ))}
                </select>
                <select
                  value={startMonth}
                  onChange={(e) => setStartMonth(Number(e.target.value))}
                  className="w-28 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  {MONTH_OPTIONS.map((m) => (
                    <option key={m} value={m}>{m}月</option>
                  ))}
                </select>
              </div>
            </div>

            <SliderInput
              label="積立期間"
              value={years}
              min={1} max={20} step={1} unit="年"
              onChange={setYears}
            />

            <SliderInput
              label="毎月の積立額"
              value={monthlyAmount}
              min={1000} max={200000} step={1000} unit="円"
              onChange={setMonthlyAmount}
            />

            <button
              onClick={handleRun}
              disabled={loading}
              className={`w-full py-3 rounded-xl text-sm font-bold transition-all mt-2 ${
                loading
                  ? "bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-brand-500 hover:bg-brand-600 text-white active:opacity-70"
              }`}
            >
              {loading ? "実際のレートを取得・計算中…" : "シミュレーションする"}
            </button>
          </Card>
        </section>

        {/* エラー */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">
              ⚠️ 為替データを取得できませんでした。しばらくしてから再度お試しください。
            </p>
            <p className="text-xs text-red-500 mt-1">{error}</p>
          </div>
        )}

        {/* 結果 */}
        {result && (
          <>
            <section>
              <SectionTitle color="orange">📈 シミュレーション結果</SectionTitle>
              {rule && <p className="text-xs text-gray-400 mb-3 px-1">レートの取得ルール：{rule}</p>}

              <Card>
                <p className="text-xs text-gray-400 mb-3">
                  実際の積立開始日：{result.startDate}
                  {result.skippedMonths > 0 && (
                    <span className="ml-1">（データ欠損 {result.skippedMonths}ヶ月分は除外）</span>
                  )}
                  {result.currentRateDate && (
                    <span className="block mt-1">現在レート基準日：{result.currentRateDate}</span>
                  )}
                </p>
                <StatRow label="累計積立額" value={fmtYen(result.totalInvestedYen)} />
                <StatRow label="累積ドル" value={fmtUsd(result.totalUsd)} />
                <StatRow label="現在のUSD/JPY" value={`${result.currentRate.toLocaleString()}円`} />
                <StatRow label="現在の円換算額" value={fmtYen(result.currentValuationYen)} highlight />
                <StatRow
                  label="損益額"
                  value={`${result.gainYen >= 0 ? "+" : ""}${fmtYen(result.gainYen)}`}
                />
                <StatRow label="損益率" value={fmtPct(result.gainRate)} highlight />
              </Card>
            </section>

            {/* グラフ */}
            <section>
              <SectionTitle color="green">📉 積立元本と評価額の推移</SectionTitle>
              <Card>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={result.timeline} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="gInvestedUsd" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#9ca3af" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#9ca3af" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gValuationUsd" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `${Math.round(v / 10000).toLocaleString()}万`}
                      width={48}
                    />
                    <Tooltip content={<ChartTooltip labelSuffix="" />} />
                    <Legend wrapperStyle={{ fontSize: 12 }} />
                    <Area
                      type="monotone" dataKey="invested" name="積立元本"
                      stroke="#9ca3af" fill="url(#gInvestedUsd)" strokeWidth={2}
                    />
                    <Area
                      type="monotone" dataKey="valuation" name="評価額"
                      stroke="#3b82f6" fill="url(#gValuationUsd)" strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Card>
            </section>
          </>
        )}

        {/* このシミュレーターでできること */}
        <section>
          <SectionTitle color="blue">📖 このシミュレーターでできること</SectionTitle>
          <Card>
            <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>
                指定した年月から毎月一定額を米ドルに積み立てていたら、現在いくらになって
                いたかを計算します。想定レートによる架空の計算ではなく、<strong>Frankfurter
                API（欧州中央銀行等のデータをもとにした無料の為替データAPI）から取得した、
                実際の過去のUSD/JPYレート</strong>を使用しています。
              </p>
            </div>
          </Card>
        </section>

        {/* 計算方法 */}
        <section>
          <SectionTitle color="green">🧮 計算方法</SectionTitle>
          <Card>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>各月の積立について、次の式で購入できたドルを計算します。</p>
              <p className="font-mono text-xs bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                その月の購入ドル = 毎月の積立額（円） ÷ その月のUSD/JPYレート
              </p>
              <p>これを全期間分累積し、現在のレートをかけて円換算評価額を出します。</p>
              <p className="font-mono text-xs bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                現在の円換算額 = 累積ドル × 現在のUSD/JPYレート
              </p>
            </div>
          </Card>
        </section>

        {/* データについて */}
        <section>
          <SectionTitle color="purple">🗂 データについて</SectionTitle>
          <Card>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <p>
                USD/JPYレートは、Frankfurter APIから、リクエストの都度取得しています。
                為替市場が休みの土日・休場日はレートが存在しないため、<strong>各月1日を
                基準日とし、その日が非営業日等でレートが存在しない場合は、直近の翌営業日
                （最大10日先まで）のレートを使用</strong>しています。
              </p>
              <p>
                該当するレートがどうしても見つからない月は、架空のレートで埋めることはせず、
                その月を集計から除外します（結果画面に除外月数を表示します）。
              </p>
            </div>
          </Card>
        </section>

        {/* 注意事項 */}
        <section>
          <SectionTitle color="orange">⚠️ 注意事項</SectionTitle>
          <Card>
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <p className="font-semibold text-gray-800 dark:text-gray-200">
                このシミュレーションは過去の実績にもとづくものであり、将来の運用成果を
                保証するものではありません。
              </p>
              <p>
                また、実際のドル積立・外貨預金・外貨建て資産では、為替手数料（スプレッド）、
                実際の購入タイミングとレート決定タイミングのずれ、金利、税金などがあるため、
                この試算結果は実際の口座の損益と完全には一致しません。あくまで目安として
                ご利用ください。
              </p>
            </div>
          </Card>
        </section>

        <SimulatorGrid excludeId="usd-jpy-simulation" />

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 pb-4">
          ※為替データ：Frankfurter API（api.frankfurter.dev）
        </p>
      </div>
    </Layout>
  );
}
