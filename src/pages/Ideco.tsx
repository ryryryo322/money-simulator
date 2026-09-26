// ============================================
// iDeCoシミュレーター
// /ideco
// ============================================

import { useState, useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import Layout from "@/components/Layout";
import { Card, SectionTitle, SliderInput, StatRow } from "@/components/ui";
import AdSlot from "@/components/AdSlot";
import SimulatorGrid from "@/components/SimulatorGrid";
import { calcKyuyoDeduction as calcKyuyoDeductionYen, getMarginalIncomeTaxRate } from "@/lib/tax";
import { manToYen, yenToMan } from "@/lib/formatter";

// ── 定数 ─────────────────────────────────────
// 税率表・給与所得控除は lib/tax の共通ロジックを利用します（このページの単位は万円）

/** 所得税率（課税所得：万円） */
function getIncomeTaxRate(taxableIncome: number): number {
  return getMarginalIncomeTaxRate(manToYen(taxableIncome));
}

/** 給与所得控除（万円） */
function calcKyuyoDeduction(income: number): number {
  return yenToMan(calcKyuyoDeductionYen(manToYen(income)));
}

// ── 型定義 ────────────────────────────────────

type IncomeType = "employee" | "freelance";
type FundType = "balanced" | "stock" | "bond"; // 運用タイプ

interface IdecoInputs {
  incomeType: IncomeType;
  income: number;           // 年収（万円）
  expense: number;          // 経費（個人事業主のみ）
  monthly: number;          // 毎月掛金（万円）
  returnRate: number;       // 想定利回り（%）
  currentAge: number;       // 現在年齢
  retireAge: number;        // 受取開始年齢（60〜75歳）
  dependents: number;       // 扶養人数
  hasSpouse: boolean;       // 配偶者あり
}

interface IdecoResult {
  annualDeduction: number;      // 年間掛金
  taxRate: number;              // 所得税率
  incomeTaxSaving: number;      // 所得税節税額（年）
  residentTaxSaving: number;    // 住民税節税額（年）
  totalTaxSaving: number;       // 合計節税額（年）
  years: number;                // 運用年数
  totalContribution: number;    // 総掛金
  finalAsset: number;           // 最終資産額
  profit: number;               // 運用益
  lifetimeTaxSaving: number;    // 生涯節税総額
  chartData: { age: number; asset: number; contribution: number }[];
}

// ── 計算ロジック ─────────────────────────────

function calcIdeco(inp: IdecoInputs): IdecoResult {
  const { incomeType, income, expense, monthly, returnRate, currentAge, retireAge, dependents, hasSpouse } = inp;

  // 所得計算
  let baseIncome: number;
  let socialInsurance: number;
  if (incomeType === "employee") {
    const kyuyoDeduction = calcKyuyoDeduction(income);
    baseIncome = income - kyuyoDeduction;
    socialInsurance = income * 0.147;
  } else {
    baseIncome = Math.max(0, income - expense);
    socialInsurance = Math.min(baseIncome * 0.10 + 5, 87) + 20.4;
  }

  const annualDeduction = monthly * 12;
  const basicDeduction = 48;
  const dependentDeduction = dependents * 38;
  const spouseDeduction = hasSpouse ? 38 : 0;

  // iDeCoなしの課税所得
  const taxableWithout = Math.max(0,
    baseIncome - basicDeduction - dependentDeduction - spouseDeduction - socialInsurance
  );

  // iDeCoありの課税所得
  const taxableWith = Math.max(0, taxableWithout - annualDeduction);

  const taxRate = getIncomeTaxRate(taxableWithout);
  const incomeTaxSaving = (taxableWithout - taxableWith) * taxRate * 1.021;
  const residentTaxSaving = (taxableWithout - taxableWith) * 0.10;
  const totalTaxSaving = incomeTaxSaving + residentTaxSaving;

  // 運用シミュレーション
  const years = Math.max(1, retireAge - currentAge);
  const r = returnRate / 100 / 12;
  let asset = 0;
  const chartData: { age: number; asset: number; contribution: number }[] = [];
  let contribution = 0;

  for (let y = 0; y <= years; y++) {
    chartData.push({
      age: currentAge + y,
      asset: Math.round(asset * 10) / 10,
      contribution: Math.round(contribution * 10) / 10,
    });
    for (let m = 0; m < 12; m++) {
      asset = asset * (1 + r) + monthly;
    }
    contribution += annualDeduction;
  }

  const finalAsset = Math.round(asset * 10) / 10;
  const totalContribution = Math.round(contribution * 10) / 10;
  const profit = Math.round((finalAsset - totalContribution) * 10) / 10;
  const lifetimeTaxSaving = Math.round(totalTaxSaving * years * 10) / 10;

  return {
    annualDeduction,
    taxRate,
    incomeTaxSaving: Math.round(incomeTaxSaving * 10) / 10,
    residentTaxSaving: Math.round(residentTaxSaving * 10) / 10,
    totalTaxSaving: Math.round(totalTaxSaving * 10) / 10,
    years,
    totalContribution,
    finalAsset,
    profit,
    lifetimeTaxSaving,
    chartData: chartData.filter((_, i) => i % 5 === 0 || i === 0 || i === years),
  };
}

// ── トグルボタン ─────────────────────────────

const ToggleBtn = ({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) => (
  <button onClick={onClick} className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
    active ? "bg-brand-500 text-white border-brand-500"
    : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
  }`}>{children}</button>
);

// ── FAQ ──────────────────────────────────────

const FAQ_LIST = [
  { q: "iDeCoとは？", a: "個人型確定拠出年金のことです。毎月一定額を積み立てて運用し、60歳以降に受け取れる私的年金制度です。掛金が全額所得控除になるため、節税効果が非常に高いのが特徴です。" },
  { q: "個人事業主はいくらまで掛けられる？", a: "国民年金基金と合わせて月額68,000円（年間816,000円）まで掛けられます。会社員（企業年金なし）は月額23,000円が上限です。" },
  { q: "60歳前に引き出せる？", a: "原則として60歳になるまで引き出しできません。これが最大のデメリットです。生活資金の余裕がある方向けの制度です。" },
  { q: "受け取り方は？", a: "「一時金」として一括で受け取るか、「年金」として分割で受け取るか選べます。一時金は退職所得控除、年金は公的年金等控除が適用されます。" },
  { q: "運用商品はどう選ぶ？", a: "長期運用なら株式インデックスファンド（全世界株・S&P500など）が人気です。リスクを抑えたい場合はバランスファンドも選択肢です。" },
] as const;

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
      <button onClick={() => setOpen(!open)} className="w-full text-left py-3 flex justify-between items-center gap-2">
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{q}</span>
        <span className="text-gray-400 text-lg flex-shrink-0">{open ? "−" : "+"}</span>
      </button>
      {open && <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pb-3">{a}</p>}
    </div>
  );
}

// ── メインコンポーネント ──────────────────────

export default function Ideco() {
  const [inp, setInp] = useState<IdecoInputs>({
    incomeType: "employee",
    income: 500,
    expense: 100,
    monthly: 2.3,
    returnRate: 5,
    currentAge: 35,
    retireAge: 60,
    dependents: 0,
    hasSpouse: false,
  });

  const set = <K extends keyof IdecoInputs>(key: K, val: IdecoInputs[K]) =>
    setInp(prev => ({ ...prev, [key]: val }));

  const result = useMemo(() => calcIdeco(inp), [inp]);
  const fmtM = (n: number) => `${n.toLocaleString()}万円`;

  // 掛金上限
  const maxMonthly = inp.incomeType === "freelance" ? 6.8 : 2.3;

  return (
    <Layout title="iDeCoシミュレーター">
      <div className="space-y-10">

        <div className="text-center py-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            掛金・節税額・将来資産をリアルタイムで計算します
          </p>
        </div>

        {/* 入力 */}
        <section>
          <SectionTitle color="blue">👤 あなたの情報</SectionTitle>
          <Card>
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">職業</p>
              <div className="flex gap-2">
                <ToggleBtn active={inp.incomeType === "employee"} onClick={() => { set("incomeType", "employee"); set("monthly", 2.3); }}>🏢 会社員</ToggleBtn>
                <ToggleBtn active={inp.incomeType === "freelance"} onClick={() => { set("incomeType", "freelance"); set("monthly", 6.8); }}>💼 個人事業主</ToggleBtn>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {inp.incomeType === "employee" ? "上限：月2.3万円（企業年金なしの場合）" : "上限：月6.8万円（国民年金基金と合算）"}
              </p>
            </div>

            {inp.incomeType === "employee" ? (
              <SliderInput label="年収" value={inp.income} min={200} max={3000} step={10} unit="万円" onChange={v => set("income", v)} />
            ) : (
              <>
                <SliderInput label="年間売上" value={inp.income} min={100} max={5000} step={10} unit="万円" onChange={v => set("income", v)} />
                <SliderInput label="年間経費" value={inp.expense} min={0} max={2000} step={10} unit="万円" onChange={v => set("expense", v)} />
              </>
            )}

            <div className="mb-5">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">扶養家族の人数</label>
              <select value={inp.dependents} onChange={e => set("dependents", Number(e.target.value))}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                {[0,1,2,3,4,5].map(n => <option key={n} value={n}>{n}人{n === 0 ? "（なし）" : ""}</option>)}
              </select>
            </div>

            <div className="mb-5">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">配偶者控除</p>
              <div className="flex gap-2">
                <ToggleBtn active={inp.hasSpouse} onClick={() => set("hasSpouse", true)}>あり</ToggleBtn>
                <ToggleBtn active={!inp.hasSpouse} onClick={() => set("hasSpouse", false)}>なし</ToggleBtn>
              </div>
            </div>
          </Card>
        </section>

        <section>
          <SectionTitle color="green">💰 iDeCo設定</SectionTitle>
          <Card>
            <SliderInput label="毎月の掛金" value={inp.monthly} min={0.1} max={maxMonthly} step={0.1} unit="万円" onChange={v => set("monthly", v)} />
            <SliderInput label="想定利回り（年）" value={inp.returnRate} min={1} max={10} step={0.5} unit="%" onChange={v => set("returnRate", v)} />
            <SliderInput label="現在の年齢" value={inp.currentAge} min={20} max={59} step={1} unit="歳" onChange={v => set("currentAge", v)} />
            <SliderInput label="受取開始年齢" value={inp.retireAge} min={60} max={75} step={1} unit="歳" onChange={v => set("retireAge", v)} />
          </Card>
        </section>

        {/* 節税効果 */}
        <section>
          <SectionTitle color="orange">💡 年間節税効果</SectionTitle>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 text-center border border-blue-100 dark:border-blue-800">
              <p className="text-xs text-blue-500 font-semibold mb-1">所得税節税</p>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{fmtM(result.incomeTaxSaving)}</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 text-center border border-purple-100 dark:border-purple-800">
              <p className="text-xs text-purple-500 font-semibold mb-1">住民税節税</p>
              <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{fmtM(result.residentTaxSaving)}</p>
            </div>
          </div>
          <div className="bg-gradient-to-r from-green-500 to-emerald-400 rounded-2xl p-5 text-center">
            <p className="text-white/80 text-xs font-medium mb-1">年間合計節税額</p>
            <p className="text-white text-4xl font-black mb-1">{fmtM(result.totalTaxSaving)}</p>
            <p className="text-white/70 text-xs">{result.years}年間で合計 {fmtM(result.lifetimeTaxSaving)} の節税</p>
          </div>
        </section>

        {/* 資産シミュレーション */}
        <section>
          <SectionTitle color="blue">📈 将来資産シミュレーション</SectionTitle>
          <Card>
            <StatRow label="毎月掛金" value={fmtM(inp.monthly)} />
            <StatRow label="運用年数" value={`${result.years}年`} />
            <StatRow label="総掛金" value={fmtM(result.totalContribution)} />
            <StatRow label="運用益" value={fmtM(result.profit)} />
            <StatRow label={`${inp.retireAge}歳時点の資産`} value={fmtM(result.finalAsset)} highlight />
          </Card>
        </section>

        {/* グラフ */}
        <section>
          <SectionTitle color="green">📊 資産推移グラフ</SectionTitle>
          <Card>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={result.chartData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gAsset" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gContrib" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="age" tick={{ fontSize: 11 }} tickFormatter={v => `${v}歳`} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}万`} width={48} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString()}万円`} labelFormatter={v => `${v}歳`} />
                <Area type="monotone" dataKey="contribution" name="総掛金" stroke="#3b82f6" fill="url(#gContrib)" strokeWidth={2} />
                <Area type="monotone" dataKey="asset" name="資産総額" stroke="#10b981" fill="url(#gAsset)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </section>

        {/* 広告 */}
        <AdSlot slot="result" context="ideco" />

        {/* SEO解説 */}
        <section>
          <SectionTitle color="blue">📖 iDeCoの基礎知識</SectionTitle>
          <Card>
            <div className="space-y-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">iDeCoの最大のメリット：3つの税制優遇</h2>
                <p>①掛金が全額所得控除、②運用益が非課税、③受取時に退職所得控除・公的年金等控除が適用されます。この3つが揃う制度は他にありません。</p>
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">個人事業主にとって特にお得な理由</h2>
                <p>会社員の上限は月2.3万円ですが、個人事業主は月6.8万円まで掛けられます。年間81.6万円が全額所得控除になるため、節税効果は絶大です。</p>
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">NISAとの違い</h2>
                <p>NISAは運用益が非課税ですが掛金控除はありません。iDeCoは掛金控除＋運用益非課税のダブル効果がある一方、60歳まで引き出せません。老後資金にはiDeCo、中期の資産形成にはNISAという使い分けがおすすめです。</p>
              </div>
            </div>
          </Card>
        </section>

        <section>
          <SectionTitle color="purple">❓ よくある質問</SectionTitle>
          <Card>{FAQ_LIST.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}</Card>
        </section>

        <SimulatorGrid excludeId="ideco" />

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 pb-4">
          ※本シミュレーションは概算です。実際の節税額は税理士にご確認ください。
        </p>
      </div>
    </Layout>
  );
}
