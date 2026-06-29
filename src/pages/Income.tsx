// ============================================
// 手取りシミュレーター
// 会社員と個人事業主の手取りを比較します
// ============================================

import { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell,
} from "recharts";

import Layout from "@/components/Layout";
import { Card, SectionTitle, SliderInput, StatRow } from "@/components/ui";
import AdSlot from "@/components/AdSlot";
import SimulatorGrid from "@/components/SimulatorGrid";

// ── 計算ロジック ─────────────────────────────

/** 会社員の手取り計算 */
function calcEmployee(income: number, dependents: number) {
  // 給与所得控除
  const deduction =
    income <= 162.5 ? 55
    : income <= 180 ? income * 0.4 - 10
    : income <= 360 ? income * 0.3 + 8
    : income <= 660 ? income * 0.2 + 44
    : income <= 850 ? income * 0.1 + 110
    : 195;

  const kyuyo = income - deduction; // 給与所得

  // 所得控除
  const basicDeduction = 48; // 基礎控除
  const dependentDeduction = dependents * 38; // 扶養控除
  const socialInsuranceEst = income * 0.147; // 社会保険料概算（健保+厚年+雇用）

  const taxableIncome = Math.max(0, kyuyo - basicDeduction - dependentDeduction - socialInsuranceEst);

  // 所得税（超過累進課税）
  let incomeTax = 0;
  if (taxableIncome <= 195) incomeTax = taxableIncome * 0.05;
  else if (taxableIncome <= 330) incomeTax = taxableIncome * 0.1 - 9.75;
  else if (taxableIncome <= 695) incomeTax = taxableIncome * 0.2 - 42.75;
  else if (taxableIncome <= 900) incomeTax = taxableIncome * 0.23 - 63.6;
  else if (taxableIncome <= 1800) incomeTax = taxableIncome * 0.33 - 153.6;
  else if (taxableIncome <= 4000) incomeTax = taxableIncome * 0.4 - 279.6;
  else incomeTax = taxableIncome * 0.45 - 479.6;
  incomeTax *= 1.021; // 復興特別所得税

  // 住民税
  const residentTax = taxableIncome * 0.1 + 0.5; // 均等割含む概算

  const totalTax = incomeTax + residentTax + socialInsuranceEst;
  const takeHome = income - totalTax;

  return {
    income,
    socialInsurance: Math.round(socialInsuranceEst * 10) / 10,
    incomeTax: Math.round(incomeTax * 10) / 10,
    residentTax: Math.round(residentTax * 10) / 10,
    totalTax: Math.round(totalTax * 10) / 10,
    takeHome: Math.round(takeHome * 10) / 10,
    takeHomeRate: Math.round((takeHome / income) * 1000) / 10,
  };
}

/** 個人事業主の手取り計算 */
function calcFreelance(revenue: number, expense: number, dependents: number) {
  const businessIncome = Math.max(0, revenue - expense); // 事業所得

  // 青色申告特別控除
  const blueDeduction = Math.min(65, businessIncome);
  const afterBlue = businessIncome - blueDeduction;

  // 国民健康保険（概算）
  const kokuho = Math.min(afterBlue * 0.1 + 5, 87); // 上限あり

  // 国民年金
  const nenkin = 1.9956 * 12 / 10000 * 10000; // 2024年度 月額19,956円
  const nenkinMan = 1.99 * 12 / 10; // 万円換算

  // 所得控除
  const basicDeduction = 48;
  const dependentDeduction = dependents * 38;
  const socialDeduction = kokuho + nenkinMan;

  const taxableIncome = Math.max(0, afterBlue - basicDeduction - dependentDeduction - socialDeduction);

  // 所得税
  let incomeTax = 0;
  if (taxableIncome <= 195) incomeTax = taxableIncome * 0.05;
  else if (taxableIncome <= 330) incomeTax = taxableIncome * 0.1 - 9.75;
  else if (taxableIncome <= 695) incomeTax = taxableIncome * 0.2 - 42.75;
  else if (taxableIncome <= 900) incomeTax = taxableIncome * 0.23 - 63.6;
  else if (taxableIncome <= 1800) incomeTax = taxableIncome * 0.33 - 153.6;
  else if (taxableIncome <= 4000) incomeTax = taxableIncome * 0.4 - 279.6;
  else incomeTax = taxableIncome * 0.45 - 479.6;
  incomeTax *= 1.021;

  // 住民税
  const residentTax = taxableIncome * 0.1 + 0.5;

  // 個人事業税（概算）
  const bizTax = Math.max(0, (afterBlue - 290) * 0.05);

  const totalTax = incomeTax + residentTax + kokuho + nenkinMan + bizTax;
  const takeHome = businessIncome - totalTax;

  return {
    revenue,
    expense,
    businessIncome: Math.round(businessIncome * 10) / 10,
    kokuho: Math.round(kokuho * 10) / 10,
    nenkin: Math.round(nenkinMan * 10) / 10,
    incomeTax: Math.round(incomeTax * 10) / 10,
    residentTax: Math.round(residentTax * 10) / 10,
    bizTax: Math.round(bizTax * 10) / 10,
    totalTax: Math.round(totalTax * 10) / 10,
    takeHome: Math.round(takeHome * 10) / 10,
    takeHomeRate: Math.round((takeHome / Math.max(revenue, 1)) * 1000) / 10,
  };
}

// ── メインコンポーネント ──────────────────────

export default function Income() {
  const [income, setIncome] = useState(500);         // 会社員年収
  const [dependents, setDependents] = useState(0);   // 扶養人数（共通）
  const [revenue, setRevenue] = useState(700);       // 個人事業主売上
  const [expense, setExpense] = useState(200);       // 経費

  const emp = useMemo(() => calcEmployee(income, dependents), [income, dependents]);
  const frl = useMemo(() => calcFreelance(revenue, expense, dependents), [revenue, expense, dependents]);

  const fmtM = (n: number) => `${n.toLocaleString()}万円`;

  // グラフ用データ
  const chartData = [
    {
      name: "会社員",
      手取り: emp.takeHome,
      社会保険: emp.socialInsurance,
      所得税: emp.incomeTax,
      住民税: emp.residentTax,
    },
    {
      name: "個人事業主",
      手取り: frl.takeHome,
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
            <SliderInput label="扶養家族の人数" value={dependents} min={0} max={5} step={1} unit="人" onChange={setDependents} />
          </Card>
        </section>

        {/* 会社員 */}
        <section>
          <SectionTitle color="blue">🏢 会社員</SectionTitle>
          <Card>
            <SliderInput label="年収" value={income} min={200} max={3000} step={50} unit="万円" onChange={setIncome} />
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
            <SliderInput label="年間売上" value={revenue} min={100} max={5000} step={50} unit="万円" onChange={setRevenue} />
            <SliderInput label="年間経費" value={expense} min={0} max={2000} step={10} unit="万円" onChange={setExpense} />
          </Card>
          <Card className="mt-3">
            <StatRow label="年間売上" value={fmtM(frl.revenue)} />
            <StatRow label="経費" value={fmtM(frl.expense)} />
            <StatRow label="事業所得（売上−経費）" value={fmtM(frl.businessIncome)} />
            <StatRow label="国民健康保険（概算）" value={fmtM(frl.kokuho)} />
            <StatRow label="国民年金" value={fmtM(frl.nenkin)} />
            <StatRow label="所得税" value={fmtM(frl.incomeTax)} />
            <StatRow label="住民税" value={fmtM(frl.residentTax)} />
            <StatRow label="個人事業税" value={fmtM(frl.bizTax)} />
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
        <section className="prose prose-sm dark:prose-invert max-w-none">
          <SectionTitle color="blue">📖 知っておきたいお金の知識</SectionTitle>
          <Card>
            <div className="space-y-6 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">

              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                  会社員と個人事業主の違い
                </h2>
                <p>
                  会社員と個人事業主では、収入の仕組みや税金・社会保険の計算方法が大きく異なります。
                  会社員は企業から「給与」を受け取り、会社が税金や社会保険料を代わりに納付してくれます（源泉徴収）。
                  一方、個人事業主は「事業所得」として自分で確定申告を行い、税金や保険料を自ら納付する必要があります。
                </p>
              </div>

              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                  手取りの計算方法
                </h2>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">会社員の場合</h3>
                <p>
                  手取り ＝ 年収 − 社会保険料 − 所得税 − 住民税。
                  社会保険料（健康保険・厚生年金・雇用保険）は給与の約15%程度が目安です。
                  給与所得控除が自動的に適用されるため、同じ収入なら個人事業主より節税効果があることも多いです。
                </p>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mt-3 mb-1">個人事業主の場合</h3>
                <p>
                  手取り ＝ 売上 − 経費 − 国民健康保険 − 国民年金 − 所得税 − 住民税 − 個人事業税。
                  経費を適切に計上し、青色申告（最大65万円控除）を活用することで手取りを増やせます。
                </p>
              </div>

              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                  税金の仕組み
                </h2>
                <p>
                  所得税は「超過累進課税」で、所得が増えるほど税率が上がります。税率は5%〜45%の7段階。
                  ただし、所得全体に高い税率がかかるわけではなく、段階ごとに税率が適用されます。
                  住民税は一律10%（所得割）＋均等割（年約5,000円）が基本です。
                </p>
              </div>

              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">
                  社会保険の違い
                </h2>
                <p>
                  会社員は「健康保険＋厚生年金」に加入し、保険料は会社と折半します。手取りは減りますが、
                  将来の年金受給額が国民年金より多くなるメリットがあります。
                  個人事業主は「国民健康保険＋国民年金」に自己負担で加入します。
                  国民年金の受給額は月約6.8万円（2024年度）と厚生年金に比べて少ないため、
                  iDeCoやNISAで自助努力による老後資金づくりが重要です。
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
          ※本シミュレーションは概算です。実際の税額は税理士にご確認ください。青色申告・各種控除の適用状況により変わります。
        </p>
      </div>
    </Layout>
  );
}
