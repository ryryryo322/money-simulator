// ============================================
// 手取りシミュレーター
// 会社員と個人事業主の手取りを比較します
// ============================================

import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

import Layout from "@/components/Layout";
import { Card, SectionTitle, SliderInput, StatRow } from "@/components/ui";
import AdSlot from "@/components/AdSlot";
import SimulatorGrid from "@/components/SimulatorGrid";

// ── 計算ロジック ─────────────────────────────

/** 所得税計算（共通） */
function calcIncomeTax(taxableIncome: number): number {
  let tax = 0;
  if (taxableIncome <= 195) tax = taxableIncome * 0.05;
  else if (taxableIncome <= 330) tax = taxableIncome * 0.1 - 9.75;
  else if (taxableIncome <= 695) tax = taxableIncome * 0.2 - 42.75;
  else if (taxableIncome <= 900) tax = taxableIncome * 0.23 - 63.6;
  else if (taxableIncome <= 1800) tax = taxableIncome * 0.33 - 153.6;
  else if (taxableIncome <= 4000) tax = taxableIncome * 0.4 - 279.6;
  else tax = taxableIncome * 0.45 - 479.6;
  return Math.max(0, tax) * 1.021; // 復興特別所得税
}

/** 会社員の手取り計算 */
function calcEmployee(income: number, dependents: number) {
  const deduction =
    income <= 162.5 ? 55
    : income <= 180 ? income * 0.4 - 10
    : income <= 360 ? income * 0.3 + 8
    : income <= 660 ? income * 0.2 + 44
    : income <= 850 ? income * 0.1 + 110
    : 195;

  const kyuyo = income - deduction;
  const socialInsuranceEst = income * 0.147;
  const basicDeduction = 48;
  const dependentDeduction = dependents * 38;
  const taxableIncome = Math.max(0, kyuyo - basicDeduction - dependentDeduction - socialInsuranceEst);

  const incomeTax = calcIncomeTax(taxableIncome);
  const residentTax = taxableIncome * 0.1 + 0.5;
  const totalTax = incomeTax + residentTax + socialInsuranceEst;
  const takeHome = income - totalTax;

  return {
    income,
    socialInsurance: Math.round(socialInsuranceEst * 10) / 10,
    incomeTax: Math.round(incomeTax * 10) / 10,
    residentTax: Math.round(residentTax * 10) / 10,
    totalTax: Math.round(totalTax * 10) / 10,
    takeHome: Math.round(takeHome * 10) / 10,
    takeHomeRate: Math.round((takeHome / Math.max(income, 1)) * 1000) / 10,
  };
}

/** 個人事業主の手取り計算 */
function calcFreelance(
  revenue: number,
  expense: number,
  dependents: number,
  hasBizTax: boolean,
  isTaxable: boolean,
  blueReturn: "65" | "10" | "none", // 青色申告控除額
) {
  const businessIncome = Math.max(0, revenue - expense);

  // 青色申告特別控除
  const blueDeduction =
    blueReturn === "65" ? Math.min(65, businessIncome)
    : blueReturn === "10" ? Math.min(10, businessIncome)
    : 0;
  const afterBlue = businessIncome - blueDeduction;

  // 国民健康保険（概算・上限あり）
  const kokuho = Math.min(afterBlue * 0.1 + 5, 87);

  // 国民年金（2024年度 月額19,956円）
  const nenkinMan = 1.9956 * 12 / 10;

  // 所得控除
  const basicDeduction = 48;
  const dependentDeduction = dependents * 38;
  const socialDeduction = kokuho + nenkinMan;
  const taxableIncome = Math.max(0, afterBlue - basicDeduction - dependentDeduction - socialDeduction);

  const incomeTax = calcIncomeTax(taxableIncome);
  const residentTax = taxableIncome * 0.1 + 0.5;

  // 個人事業税（業種によって不要）
  const bizTax = hasBizTax ? Math.max(0, (afterBlue - 290) * 0.05) : 0;

  // 消費税（課税事業者のみ・簡易計算）
  const consumptionTax = isTaxable ? Math.max(0, (revenue - expense) * 0.1) : 0;

  const totalTax = incomeTax + residentTax + kokuho + nenkinMan + bizTax + consumptionTax;
  const takeHome = businessIncome - totalTax;

  return {
    revenue,
    expense,
    businessIncome: Math.round(businessIncome * 10) / 10,
    blueDeduction: Math.round(blueDeduction * 10) / 10,
    kokuho: Math.round(kokuho * 10) / 10,
    nenkin: Math.round(nenkinMan * 10) / 10,
    incomeTax: Math.round(incomeTax * 10) / 10,
    residentTax: Math.round(residentTax * 10) / 10,
    bizTax: Math.round(bizTax * 10) / 10,
    consumptionTax: Math.round(consumptionTax * 10) / 10,
    totalTax: Math.round(totalTax * 10) / 10,
    takeHome: Math.round(takeHome * 10) / 10,
    takeHomeRate: Math.round((takeHome / Math.max(revenue, 1)) * 1000) / 10,
  };
}

// ── トグルボタン ─────────────────────────────

function ToggleButton({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
        active
          ? "bg-brand-500 text-white border-brand-500"
          : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
      }`}
    >
      {children}
    </button>
  );
}

// ── メインコンポーネント ──────────────────────

export default function Income() {
  // 共通
  const [dependents, setDependents] = useState(0);

  // 会社員
  const [income, setIncome] = useState(500);

  // 個人事業主
  const [revenue, setRevenue] = useState(700);
  const [expense, setExpense] = useState(200);
  const [hasBizTax, setHasBizTax] = useState(true);
  const [isTaxable, setIsTaxable] = useState(false);
  const [blueReturn, setBlueReturn] = useState<"65" | "10" | "none">("65");

  const emp = useMemo(() => calcEmployee(income, dependents), [income, dependents]);
  const frl = useMemo(
    () => calcFreelance(revenue, expense, dependents, hasBizTax, isTaxable, blueReturn),
    [revenue, expense, dependents, hasBizTax, isTaxable, blueReturn]
  );

  const fmtM = (n: number) => `${n.toLocaleString()}万円`;

  const chartData = [
    {
      name: "会社員",
      手取り: Math.max(0, emp.takeHome),
      社会保険: emp.socialInsurance,
      所得税: emp.incomeTax,
      住民税: emp.residentTax,
    },
    {
      name: "個人事業主",
      手取り: Math.max(0, frl.takeHome),
      社会保険: frl.kokuho + frl.nenkin,
      所得税: frl.incomeTax,
      住民税: frl.residentTax,
    },
  ];

  return (
    <Layout title="手取りシミュレーター">
      <div className="space-y-10">

        {/* 共通設定 */}
        <section>
          <SectionTitle color="purple">👤 共通設定</SectionTitle>
          <Card>
            <div className="mb-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
                扶養家族の人数
              </label>
              <select
                value={dependents}
                onChange={(e) => setDependents(Number(e.target.value))}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {[0,1,2,3,4,5].map(n => (
                  <option key={n} value={n}>{n}人{n === 0 ? "（扶養なし）" : ""}</option>
                ))}
              </select>
            </div>
          </Card>
        </section>

        {/* 会社員 */}
        <section>
          <SectionTitle color="blue">🏢 会社員</SectionTitle>
          <Card>
            <SliderInput label="年収" value={income} min={100} max={3000} step={10} unit="万円" onChange={setIncome} />
          </Card>
          <Card className="mt-3">
            <StatRow label="給与収入" value={fmtM(emp.income)} />
            <StatRow label="社会保険料（概算）" value={fmtM(emp.socialInsurance)} />
            <StatRow label="所得税" value={fmtM(emp.incomeTax)} />
            <StatRow label="住民税" value={fmtM(emp.residentTax)} />
            <StatRow label="税・保険料合計" value={fmtM(emp.totalTax)} />
            <StatRow label="手取り" value={fmtM(emp.takeHome)} highlight />
            <StatRow label="手取り率" value={`${emp.takeHomeRate}%`} highlight />
          </Card>
        </section>

        {/* 個人事業主 */}
        <section>
          <SectionTitle color="green">💼 個人事業主</SectionTitle>
          <Card>
            <SliderInput label="年間売上" value={revenue} min={100} max={5000} step={10} unit="万円" onChange={setRevenue} />

            <SliderInput label="年間経費" value={expense} min={0} max={2000} step={10} unit="万円" onChange={setExpense} />

            {/* 青色申告 */}
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">青色申告控除</p>
              <div className="flex gap-2">
                <ToggleButton active={blueReturn === "65"} onClick={() => setBlueReturn("65")}>65万円</ToggleButton>
                <ToggleButton active={blueReturn === "10"} onClick={() => setBlueReturn("10")}>10万円</ToggleButton>
                <ToggleButton active={blueReturn === "none"} onClick={() => setBlueReturn("none")}>白色申告</ToggleButton>
              </div>
              <p className="text-xs text-gray-400 mt-1">65万円控除は電子申告が必要。白色申告は控除なし。</p>
            </div>

            {/* 個人事業税 */}
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">個人事業税</p>
              <div className="flex gap-2">
                <ToggleButton active={hasBizTax} onClick={() => setHasBizTax(true)}>あり（5%）</ToggleButton>
                <ToggleButton active={!hasBizTax} onClick={() => setHasBizTax(false)}>なし</ToggleButton>
              </div>
              <p className="text-xs text-gray-400 mt-1">業種によって非課税の場合があります（ライター・エンジニアなど）</p>
            </div>

            {/* 消費税 */}
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">消費税</p>
              <div className="flex gap-2">
                <ToggleButton active={!isTaxable} onClick={() => setIsTaxable(false)}>免税事業者</ToggleButton>
                <ToggleButton active={isTaxable} onClick={() => setIsTaxable(true)}>課税事業者</ToggleButton>
              </div>
              <p className="text-xs text-gray-400 mt-1">売上1,000万円超または任意登録で課税事業者</p>
            </div>
          </Card>

          <Card className="mt-3">
            <StatRow label="年間売上" value={fmtM(frl.revenue)} />
            <StatRow label="経費" value={fmtM(frl.expense)} />
            <StatRow label="事業所得（売上−経費）" value={fmtM(frl.businessIncome)} />
            <StatRow label={`青色申告控除（${blueReturn === "none" ? "白色" : blueReturn + "万円"}）`} value={blueReturn === "none" ? "なし" : fmtM(frl.blueDeduction)} />
            <StatRow label="国民健康保険（概算）" value={fmtM(frl.kokuho)} />
            <StatRow label="国民年金" value={fmtM(frl.nenkin)} />
            <StatRow label="所得税" value={fmtM(frl.incomeTax)} />
            <StatRow label="住民税" value={fmtM(frl.residentTax)} />
            <StatRow label="個人事業税" value={hasBizTax ? fmtM(frl.bizTax) : "なし"} />
            <StatRow label="消費税" value={isTaxable ? fmtM(frl.consumptionTax) : "免税"} />
            <StatRow label="税・保険料合計" value={fmtM(frl.totalTax)} />
            <StatRow label="手取り" value={fmtM(frl.takeHome)} highlight />
            <StatRow label="手取り率（売上比）" value={`${frl.takeHomeRate}%`} highlight />
          </Card>
        </section>

        {/* 比較グラフ */}
        <section>
          <SectionTitle color="orange">📊 手取り比較グラフ</SectionTitle>
          <Card>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}万`} width={48} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString()}万円`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="手取り" stackId="a" fill="#10b981" />
                <Bar dataKey="社会保険" stackId="a" fill="#f97316" />
                <Bar dataKey="所得税" stackId="a" fill="#ef4444" />
                <Bar dataKey="住民税" stackId="a" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </section>

        {/* SEO解説コンテンツ */}
        <section>
          <SectionTitle color="blue">📖 知っておきたいお金の知識</SectionTitle>
          <Card>
            <div className="space-y-6 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">

              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">会社員と個人事業主の違い</h2>
                <p>
                  会社員と個人事業主では、収入の仕組みや税金・社会保険の計算方法が大きく異なります。
                  会社員は企業から「給与」を受け取り、会社が税金や社会保険料を代わりに納付してくれます（源泉徴収）。
                  一方、個人事業主は「事業所得」として自分で確定申告を行い、税金や保険料を自ら納付する必要があります。
                </p>
              </div>

              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">手取りの計算方法</h2>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">会社員の場合</h3>
                <p>
                  手取り ＝ 年収 − 社会保険料 − 所得税 − 住民税。
                  社会保険料（健康保険・厚生年金・雇用保険）は給与の約15%程度が目安です。
                </p>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-3 mb-1">個人事業主の場合</h3>
                <p>
                  手取り ＝ 売上 − 経費 − 国民健康保険 − 国民年金 − 所得税 − 住民税 − 個人事業税。
                  青色申告（最大65万円控除）を活用することで手取りを大きく増やせます。
                </p>
              </div>

              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">税金の仕組み</h2>
                <p>
                  所得税は「超過累進課税」で、所得が増えるほど税率が上がります。税率は5%〜45%の7段階。
                  住民税は一律10%（所得割）＋均等割（年約5,000円）が基本です。
                </p>
              </div>

              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">社会保険の違い</h2>
                <p>
                  会社員は「健康保険＋厚生年金」に加入し、保険料は会社と折半します。
                  個人事業主は「国民健康保険＋国民年金」に自己負担で加入します。
                  国民年金の受給額は月約6.8万円（2024年度）と厚生年金に比べて少ないため、
                  iDeCoやNISAで老後資金づくりが重要です。
                </p>
              </div>

            </div>
          </Card>
        </section>

        {/* 広告 */}
        <AdSlot slot="result" />

        {/* 他のシミュレーター */}
        <SimulatorGrid excludeId="income" />

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 pb-4">
          ※本シミュレーションは概算です。実際の税額は税理士にご確認ください。
        </p>
      </div>
    </Layout>
  );
}
