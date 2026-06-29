// ============================================
// 住宅ローン・NISAシミュレーター
// ============================================

import { useState, useMemo, useCallback, useRef } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

import Layout from "@/components/Layout";
import { Card, SectionTitle, SliderInput, StatRow, ChartTooltip } from "@/components/ui";
import AdSlot from "@/components/AdSlot";
import SimulatorGrid from "@/components/SimulatorGrid";

// ── 型定義 ──────────────────────────────────

interface Inputs {
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

interface YearPoint {
  age: number;
  loanBalance: number;
  nisaAsset: number;
  netAsset: number;
}

// ── 計算ロジック ─────────────────────────────

function calculate(inp: Inputs) {
  const { loanAmount, rate, loanYears, bonus, nisaMonthly, nisaReturn,
    currentAsset, currentAge, retireAge, income } = inp;

  const r = rate / 100 / 12;
  const n = loanYears * 12;
  const monthlyPayment = r > 0
    ? loanAmount * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
    : loanAmount / n;

  const totalPayment = monthlyPayment * n + bonus * 2 * loanYears;
  const completeAge = currentAge + loanYears;

  const years: YearPoint[] = [];
  let balance = loanAmount;
  let nisaAsset = currentAsset;
  const nr = nisaReturn / 100 / 12;

  const maxAge = Math.max(retireAge, completeAge) + 1;
  for (let age = currentAge; age <= maxAge; age++) {
    years.push({
      age,
      loanBalance: Math.max(0, Math.round(balance * 10) / 10),
      nisaAsset: Math.round(nisaAsset * 10) / 10,
      netAsset: Math.round((nisaAsset - Math.max(0, balance)) * 10) / 10,
    });
    if (balance > 0) {
      for (let m = 0; m < 12; m++) {
        const interest = balance * (rate / 100 / 12);
        balance = Math.max(0, balance - (monthlyPayment - interest));
      }
      balance = Math.max(0, balance - bonus * 2);
    }
    for (let m = 0; m < 12; m++) {
      nisaAsset = nisaAsset * (1 + nr) + nisaMonthly;
    }
  }

  // イベント
  const fmt = (n: number) => n >= 10000 ? `${(n / 10000).toFixed(1)}億` : `${Math.round(n)}万`;
  const events: { age: number; label: string; icon: string }[] = [];
  for (const ms of [500, 1000, 2000, 3000, 5000]) {
    const hit = years.find((y) => y.nisaAsset >= ms);
    if (hit && hit.age <= retireAge + 5)
      events.push({ age: hit.age, label: `NISA ${fmt(ms)}達成`, icon: "🎯" });
  }
  const cross = years.find((y) => y.nisaAsset >= Math.max(0, y.loanBalance) && y.loanBalance > 0);
  if (cross) events.push({ age: cross.age, label: "資産がローン残高を超える", icon: "⚡" });
  events.push({ age: completeAge, label: "住宅ローン完済", icon: "🏠" });
  const retirePoint = years.find((y) => y.age === retireAge);
  if (retirePoint) events.push({ age: retireAge, label: `資産 ${fmt(retirePoint.nisaAsset)}`, icon: "🎉" });

  const uniqueEvents = events
    .sort((a, b) => a.age - b.age)
    .filter((e, i, arr) => arr.findIndex((x) => x.age === e.age && x.label === e.label) === i);

  // リスク診断
  const annualPayment = monthlyPayment * 12 + bonus * 2;
  const ratio = income > 0 ? annualPayment / income : 0;
  const risk = ratio < 0.25 ? "safe" : ratio < 0.35 ? "caution" : "danger";

  return {
    monthlyPayment, totalPayment, completeAge,
    finalNisa: retirePoint?.nisaAsset ?? 0,
    finalNet: retirePoint?.netAsset ?? 0,
    years, uniqueEvents, risk, annualPayment,
  };
}

// ── メインコンポーネント ──────────────────────

export default function LoanNisa() {
  const [inp, setInp] = useState<Inputs>({
    loanAmount: 3500, rate: 1.5, loanYears: 35, bonus: 20,
    nisaMonthly: 5, nisaReturn: 5, currentAsset: 100,
    currentAge: 35, retireAge: 65, income: 500,
  });

  const set = useCallback((key: keyof Inputs) => (v: number) =>
    setInp((prev) => ({ ...prev, [key]: v })), []);

  const result = useMemo(() => calculate(inp), [inp]);

  const riskLabel = result.risk === "danger" ? "危険" : result.risk === "caution" ? "注意" : "安全";
  const riskColor = result.risk === "danger" ? "text-red-500" : result.risk === "caution" ? "text-amber-500" : "text-green-500";
  const riskBg    = result.risk === "danger" ? "bg-red-50 dark:bg-red-900/20" : result.risk === "caution" ? "bg-amber-50 dark:bg-amber-900/20" : "bg-green-50 dark:bg-green-900/20";
  const riskBorder= result.risk === "danger" ? "border-red-200 dark:border-red-800" : result.risk === "caution" ? "border-amber-200 dark:border-amber-800" : "border-green-200 dark:border-green-800";

  const captureRef = useRef<HTMLDivElement>(null);
  const handleSave = async () => {
    const html2canvas = (await import("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.esm.min.js" as any)).default;
    if (!captureRef.current) return;
    const canvas = await html2canvas(captureRef.current, { scale: 2, useCORS: true });
    const link = document.createElement("a");
    link.download = "simulation.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  const chartData = result.years.filter((y) => y.age % 5 === 0 || y.age === inp.currentAge);
  const fmtM = (n: number) => `${Math.round(n).toLocaleString()}万円`;

  return (
    <Layout title="いえとお金シミュレーター">
      <div ref={captureRef} className="space-y-10">

        {/* 入力：住宅ローン */}
        <section>
          <SectionTitle color="blue">🏠 住宅ローン</SectionTitle>
          <Card>
            <SliderInput label="借入額" value={inp.loanAmount} min={0} max={8000} step={100} unit="万円" onChange={set("loanAmount")} />
            <SliderInput label="金利（年）" value={inp.rate} min={0.1} max={5} step={0.05} unit="%" onChange={set("rate")} />
            <SliderInput label="返済期間" value={inp.loanYears} min={10} max={50} step={1} unit="年" onChange={set("loanYears")} />
            <SliderInput label="ボーナス返済（年2回×）" value={inp.bonus} min={0} max={200} step={5} unit="万円" onChange={set("bonus")} />
          </Card>
        </section>

        {/* 入力：NISA */}
        <section>
          <SectionTitle color="green">📈 NISA</SectionTitle>
          <Card>
            <SliderInput label="毎月積立額" value={inp.nisaMonthly} min={0} max={30} step={0.5} unit="万円" onChange={set("nisaMonthly")} />
            <SliderInput label="想定利回り（年）" value={inp.nisaReturn} min={1} max={10} step={0.5} unit="%" onChange={set("nisaReturn")} />
            <SliderInput label="現在の保有資産" value={inp.currentAsset} min={0} max={3000} step={10} unit="万円" onChange={set("currentAsset")} />
          </Card>
        </section>

        {/* 入力：あなたの情報 */}
        <section>
          <SectionTitle color="purple">👤 あなたの情報</SectionTitle>
          <Card>
            <SliderInput label="現在の年齢" value={inp.currentAge} min={20} max={55} step={1} unit="歳" onChange={set("currentAge")} />
            <SliderInput label="リタイア予定年齢" value={inp.retireAge} min={50} max={75} step={1} unit="歳" onChange={set("retireAge")} />
            <SliderInput label="年収" value={inp.income} min={200} max={3000} step={50} unit="万円" onChange={set("income")} />
          </Card>
        </section>

        {/* 結果 */}
        <section>
          <SectionTitle color="blue">📊 シミュレーション結果</SectionTitle>
          <Card>
            <StatRow label="毎月返済額" value={`${Math.round(result.monthlyPayment).toLocaleString()}万円`} highlight />
            <StatRow label="総返済額" value={fmtM(result.totalPayment)} />
            <StatRow label="ローン完済年齢" value={`${result.completeAge}歳`} />
            <StatRow label={`NISA最終資産（${inp.retireAge}歳）`} value={fmtM(result.finalNisa)} highlight />
            <StatRow label={`純資産（${inp.retireAge}歳）`} value={fmtM(result.finalNet)} />
          </Card>
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSave}
              className="text-xs font-medium text-brand-500 hover:text-brand-600 active:opacity-70 transition-opacity"
            >
              画像として保存
            </button>
          </div>
        </section>

        {/* リスク診断 */}
        <section>
          <SectionTitle color="blue">⚠️ 返済負担リスク診断</SectionTitle>
          <div className={`rounded-2xl border p-4 flex items-center gap-3 ${riskBg} ${riskBorder}`}>
            <span className={`text-2xl font-bold ${riskColor}`}>{riskLabel}</span>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-snug">
              年間返済額 <span className="font-semibold text-gray-900 dark:text-white">{fmtM(result.annualPayment)}</span>　
              返済負担率 <span className="font-semibold text-gray-900 dark:text-white">
                {inp.income > 0 ? (result.annualPayment / inp.income * 100).toFixed(1) : "－"}%
              </span><br />
              25%未満：安全　25〜35%：注意　35%超：危険
            </p>
          </div>
        </section>

        {/* グラフ1 */}
        <section>
          <SectionTitle color="blue">📉 ローン残高 vs NISA資産</SectionTitle>
          <Card>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gLoan" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gNisa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="age" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}歳`} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}万`} width={48} />
                <Tooltip content={<ChartTooltip labelSuffix="歳" />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area type="monotone" dataKey="loanBalance" name="ローン残高" stroke="#ef4444" fill="url(#gLoan)" strokeWidth={2} isAnimationActive />
                <Area type="monotone" dataKey="nisaAsset" name="NISA資産" stroke="#3b82f6" fill="url(#gNisa)" strokeWidth={2} isAnimationActive />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </section>

        {/* グラフ2 */}
        <section>
          <SectionTitle color="green">💰 純資産の推移</SectionTitle>
          <Card>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gNet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="age" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}歳`} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}万`} width={48} />
                <Tooltip content={<ChartTooltip labelSuffix="歳" />} />
                <Area type="monotone" dataKey="netAsset" name="純資産" stroke="#10b981" fill="url(#gNet)" strokeWidth={2} isAnimationActive />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </section>

        {/* タイムライン */}
        <section>
          <SectionTitle color="purple">🗓 ライフイベント</SectionTitle>
          <Card className="py-4">
            <ol className="relative border-l border-gray-200 dark:border-gray-700 ml-3">
              {result.uniqueEvents.map((ev, i) => (
                <li key={i} className="ml-5 pb-5 last:pb-0">
                  <span className="absolute -left-3 flex items-center justify-center w-6 h-6 bg-blue-50 dark:bg-blue-900/30 rounded-full text-sm border border-white dark:border-gray-900">
                    {ev.icon}
                  </span>
                  <div className="flex items-baseline gap-2 pt-0.5">
                    <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums w-10">{ev.age}歳</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{ev.label}</span>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </section>

        {/* 広告 */}
        <AdSlot slot="result" />

        {/* 他のシミュレーター */}
        <SimulatorGrid excludeId="loan-nisa" />

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 pb-4">
          ※本シミュレーションは参考値です。実際の数値は金融機関にご確認ください。
        </p>
      </div>
    </Layout>
  );
}
