// ============================================
// 手取りシミュレーター（リファクタリング済み）
// 計算ロジックは hooks/useIncomeSimulator.ts へ
// 定数は constants/tax2026.ts へ
// 型は types/income.ts へ
// ============================================

import { useState, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

import Layout from "@/components/Layout";
import { Card, SectionTitle, SliderInput, StatRow } from "@/components/ui";
import AdSlot from "@/components/AdSlot";
import SimulatorGrid from "@/components/SimulatorGrid";

import { useIncomeSimulator } from "@/hooks/useIncomeSimulator";
import { useSimulatorStore } from "@/store/simulatorStore";
import type { EmployeeInputs, FreelanceInputs, CalcStep } from "@/types/income";
import type { BlueReturnType } from "@/constants/tax2026";

// ── トグルボタン ─────────────────────────────

const ToggleBtn = ({
  active, onClick, children,
}: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
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

// ── 計算根拠アコーディオン ────────────────────

const CalcBasis = ({ steps }: { steps: CalcStep[] }) => {
  const [open, setOpen] = useState(false);
  const fmtM = (n: number) => `${n.toLocaleString()}万円`;
  return (
    <div className="mt-3">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left text-xs text-brand-500 font-medium flex items-center gap-1"
      >
        {open ? "▼" : "▶"} 計算根拠を見る
      </button>
      {open && (
        <div className="mt-3 space-y-1">
          {steps.map((s, i) => (
            <div
              key={i}
              className={`flex justify-between items-center py-1.5 border-b border-gray-50 dark:border-gray-800/50 last:border-0 ${
                s.isResult ? "font-bold text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <span className="text-xs">
                {s.isDeduction ? "　↓ " : ""}{s.label}
              </span>
              <span className={`text-xs tabular-nums ${s.isDeduction ? "text-red-400" : s.isResult ? "text-brand-500" : ""}`}>
                {s.isDeduction ? "−" : ""}{fmtM(s.value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── メインコンポーネント ──────────────────────

export default function Income() {
  // Zustandストアから状態を取得（ページ移動しても値が保持される）
  const { income: { empInp, frlInp }, setEmpInp, setFrlInp } = useSimulatorStore();
  const setEmp = useCallback(setEmpInp, [setEmpInp]);
  const setFrl = useCallback(setFrlInp, [setFrlInp]);

  // 計算はhookに委譲
  const { emp, frl, frlSteps } = useIncomeSimulator({ empInp, frlInp });

  const fmtM = (n: number) => `${n.toLocaleString()}万円`;

  // グラフ用データ
  const chartData = [
    {
      name: "会社員",
      手取り: Math.max(0, Math.round(emp.takeHome)),
      社会保険: Math.round(emp.socialInsurance),
      所得税: Math.round(emp.incomeTax),
      住民税: Math.round(emp.residentTax),
    },
    {
      name: "個人事業主",
      手取り: Math.max(0, Math.round(frl.takeHome)),
      社会保険: Math.round(frl.kokuho + frl.kokunen),
      所得税: Math.round(frl.incomeTax),
      住民税: Math.round(frl.residentTax),
    },
  ];

  return (
    <Layout title="手取りシミュレーター">
      <div className="space-y-10">

        {/* 共通設定 */}
        <section>
          <SectionTitle color="purple">👤 共通設定</SectionTitle>
          <Card>
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">
                扶養家族の人数
              </label>
              <select
                value={frlInp.dependents}
                onChange={e => {
                  const n = Number(e.target.value);
                  setEmp("dependents", n);
                  setFrl("dependents", n);
                }}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {[0,1,2,3,4,5].map(n => (
                  <option key={n} value={n}>{n}人{n === 0 ? "（扶養なし）" : ""}</option>
                ))}
              </select>
            </div>
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">配偶者控除</p>
              <div className="flex gap-2">
                <ToggleBtn active={frlInp.hasSpouse} onClick={() => { setEmp("hasSpouse", true); setFrl("hasSpouse", true); }}>あり</ToggleBtn>
                <ToggleBtn active={!frlInp.hasSpouse} onClick={() => { setEmp("hasSpouse", false); setFrl("hasSpouse", false); }}>なし</ToggleBtn>
              </div>
            </div>
          </Card>
        </section>

        {/* 会社員 */}
        <section>
          <SectionTitle color="blue">🏢 会社員</SectionTitle>
          <Card>
            <SliderInput label="年収" value={empInp.income} min={100} max={3000} step={10} unit="万円" onChange={v => setEmp("income", v)} />
          </Card>
          <Card className="mt-3">
            <StatRow label="給与収入" value={fmtM(emp.income)} />
            <StatRow label="給与所得控除" value={fmtM(emp.kyuyoDeduction)} />
            <StatRow label="給与所得" value={fmtM(emp.kyuyoIncome)} />
            <StatRow label="社会保険料（概算）" value={fmtM(emp.socialInsurance)} />
            <StatRow label="課税所得" value={fmtM(emp.taxableIncome)} />
            <StatRow label="所得税" value={fmtM(emp.incomeTax)} />
            <StatRow label="住民税" value={fmtM(emp.residentTax)} />
            <StatRow label="税・保険料合計" value={fmtM(emp.totalBurden)} />
            <StatRow label="手取り" value={fmtM(emp.takeHome)} highlight />
            <StatRow label="手取り率" value={`${emp.takeHomeRate}%`} highlight />
          </Card>
        </section>

        {/* 個人事業主 */}
        <section>
          <SectionTitle color="green">💼 個人事業主</SectionTitle>
          <Card>
            <SliderInput label="年間売上" value={frlInp.revenue} min={100} max={5000} step={10} unit="万円" onChange={v => setFrl("revenue", v)} />
            <SliderInput label="年間経費" value={frlInp.expense} min={0} max={2000} step={10} unit="万円" onChange={v => setFrl("expense", v)} />

            {/* 青色申告 */}
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">青色申告控除</p>
              <div className="flex gap-2">
                {(["65","55","10","none"] as BlueReturnType[]).map(k => (
                  <ToggleBtn key={k} active={frlInp.blueReturn === k} onClick={() => setFrl("blueReturn", k)}>
                    {k === "none" ? "白色" : `${k}万`}
                  </ToggleBtn>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1">65万円控除はe-Tax電子申告が必要</p>
            </div>

            {/* 小規模企業共済 */}
            <SliderInput label="小規模企業共済（月額）" value={frlInp.shokibo} min={0} max={7} step={0.5} unit="万円" onChange={v => setFrl("shokibo", v)} />

            {/* iDeCo */}
            <SliderInput label="iDeCo（月額）" value={frlInp.ideco} min={0} max={6.8} step={0.1} unit="万円" onChange={v => setFrl("ideco", v)} />

            {/* 個人事業税 */}
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">個人事業税</p>
              <div className="flex gap-2">
                <ToggleBtn active={frlInp.hasBizTax} onClick={() => setFrl("hasBizTax", true)}>あり（5%）</ToggleBtn>
                <ToggleBtn active={!frlInp.hasBizTax} onClick={() => setFrl("hasBizTax", false)}>なし</ToggleBtn>
              </div>
              <p className="text-xs text-gray-400 mt-1">ライター・エンジニアなど業種によって不要な場合あり</p>
            </div>

            {/* 消費税 */}
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">消費税</p>
              <div className="flex gap-2">
                <ToggleBtn active={!frlInp.isTaxable} onClick={() => setFrl("isTaxable", false)}>免税事業者</ToggleBtn>
                <ToggleBtn active={frlInp.isTaxable} onClick={() => setFrl("isTaxable", true)}>課税事業者</ToggleBtn>
              </div>
              <p className="text-xs text-gray-400 mt-1">売上1,000万円超または任意登録で課税事業者。簡易計算です。</p>
            </div>
          </Card>

          <Card className="mt-3">
            <StatRow label="年間売上" value={fmtM(frl.revenue)} />
            <StatRow label="経費" value={fmtM(frl.expense)} />
            <StatRow label="事業所得" value={fmtM(frl.businessIncome)} />
            <StatRow label={`青色申告控除（${frlInp.blueReturn === "none" ? "白色" : frlInp.blueReturn + "万円"}）`} value={frlInp.blueReturn === "none" ? "なし" : fmtM(frl.blueDeduction)} />
            {frl.shokoboAnnual > 0 && <StatRow label="小規模企業共済（年額）" value={fmtM(frl.shokoboAnnual)} />}
            {frl.idecoAnnual > 0 && <StatRow label="iDeCo（年額）" value={fmtM(frl.idecoAnnual)} />}
            <StatRow label="国民健康保険（概算）" value={fmtM(frl.kokuho)} />
            <StatRow label="国民年金（2026年度）" value={fmtM(frl.kokunen)} />
            {frlInp.hasBizTax && <StatRow label="個人事業税" value={fmtM(frl.bizTax)} />}
            <StatRow label="消費税" value={frlInp.isTaxable ? fmtM(frl.consumptionTax) : "免税（計算対象外）"} />
            <StatRow label="課税所得" value={fmtM(frl.taxableIncome)} />
            <StatRow label="所得税" value={fmtM(frl.incomeTax)} />
            <StatRow label="住民税" value={fmtM(frl.residentTax)} />
            <StatRow label="税・保険料合計" value={fmtM(frl.totalBurden)} />
            <StatRow label="手取り" value={fmtM(frl.takeHome)} highlight />
            <StatRow label="手取り率（売上比）" value={`${frl.takeHomeRate}%`} highlight />
            {/* 計算根拠アコーディオン */}
            <CalcBasis steps={frlSteps} />
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
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}万`} width={48} />
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

        {/* SEO解説 */}
        <section>
          <SectionTitle color="blue">📖 知っておきたいお金の知識</SectionTitle>
          <Card>
            <div className="space-y-6 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">会社員と個人事業主の違い</h2>
                <p>会社員は企業から「給与」を受け取り、会社が税金や社会保険料を代わりに納付します（源泉徴収）。個人事業主は「事業所得」として自分で確定申告を行い、税金や保険料を自ら納付する必要があります。</p>
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">青色申告で節税する</h2>
                <p>青色申告特別控除（最大65万円）は個人事業主専用の強力な節税手段です。e-Tax（電子申告）で65万円、帳簿のみで55万円、簡易帳簿で10万円の控除が受けられます。</p>
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">iDeCoと小規模企業共済</h2>
                <p>iDeCoは月最大6.8万円、小規模企業共済は月最大7万円を所得控除にできます。両方を最大活用すると年間167万円以上の控除が可能で、個人事業主の最大の節税手段のひとつです。</p>
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">社会保険の違い</h2>
                <p>会社員は「健康保険＋厚生年金」に会社と折半で加入します。個人事業主は「国民健康保険＋国民年金」に自己負担で加入します。国民年金の受給額は月約6.8万円と厚生年金より少ないため、iDeCoやNISAで補完することが重要です。</p>
              </div>
            </div>
          </Card>
        </section>

        <AdSlot slot="result" />
        <SimulatorGrid excludeId="income" />

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 pb-4">
          ※本シミュレーションは概算です。実際の税額は税理士にご確認ください。
        </p>
      </div>
    </Layout>
  );
}
