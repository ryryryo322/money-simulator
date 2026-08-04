// ============================================
// 育休手当シミュレーター
// /ikukyu
// ============================================

import { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import { Card, SectionTitle, SliderInput, StatRow } from "@/components/ui";
import AdSlot from "@/components/AdSlot";
import SimulatorGrid from "@/components/SimulatorGrid";

// ── 定数 ─────────────────────────────────────

/** 育児休業給付金の給付率 */
const RATE_FIRST_6M = 0.67;   // 最初の180日（67%）
const RATE_AFTER_6M = 0.50;   // 181日以降（50%）

/** 上限・下限（2024年度） */
const MAX_DAILY_FIRST = 15690; // 最初の6ヶ月の日額上限（円）
const MAX_DAILY_AFTER = 13700; // 6ヶ月以降の日額上限（円）
const MIN_DAILY = 2869;        // 日額下限（円）

/** 社会保険料免除（育休中は免除） */
const SHAKAI_HOKEN_RATE = 0.147;

/** 所得税・住民税（育休手当は非課税） */
// 育児休業給付金は非課税

// ── 型定義 ────────────────────────────────────

type ParentType = "mother" | "father";

interface IkukyuInputs {
  parentType: ParentType;     // 母 or 父
  monthlyIncome: number;      // 月収（万円・手取り前）
  ikukyuMonths: number;       // 育休取得月数
  hasPartnerIkukyu: boolean;  // パパ・ママ育休（両親育休）
}

interface IkukyuResult {
  dailyWage: number;          // 日額賃金（円）
  firstBenefit: number;       // 最初の6ヶ月の給付金（月額・円）
  afterBenefit: number;       // 6ヶ月以降の給付金（月額・円）
  totalBenefit: number;       // 総受給額（万円）
  socialInsuranceSaving: number; // 社会保険料免除額（月・万円）
  monthlyDetails: {
    month: number;
    benefit: number;
    rate: number;
  }[];
  effectiveRate: number;      // 実質給付率（社保免除含む）
}

// ── 計算ロジック ─────────────────────────────

function calcIkukyu(inp: IkukyuInputs): IkukyuResult {
  const { monthlyIncome, ikukyuMonths, hasPartnerIkukyu } = inp;

  // 日額賃金（月収 × 12ヶ月 ÷ 365日）
  const annualIncome = monthlyIncome * 10000 * 12;
  const dailyWage = Math.round(annualIncome / 365);

  // パパ・ママ育休の場合は最初の28日間が80%給付（2025年〜）
  // ※ここでは簡易計算として67%で統一
  const firstRate = hasPartnerIkukyu ? 0.80 : RATE_FIRST_6M;

  // 最初の6ヶ月（180日）の月額給付金
  const firstDailyBenefit = Math.min(
    Math.max(dailyWage * firstRate, MIN_DAILY),
    hasPartnerIkukyu ? 15690 : MAX_DAILY_FIRST
  );
  const firstBenefit = Math.round(firstDailyBenefit * 30);

  // 6ヶ月以降の月額給付金
  const afterDailyBenefit = Math.min(
    Math.max(dailyWage * RATE_AFTER_6M, MIN_DAILY),
    MAX_DAILY_AFTER
  );
  const afterBenefit = Math.round(afterDailyBenefit * 30);

  // 月別詳細
  const monthlyDetails = Array.from({ length: ikukyuMonths }, (_, i) => {
    const month = i + 1;
    const isFirst6 = month <= 6;
    const benefit = isFirst6 ? firstBenefit : afterBenefit;
    const rate = isFirst6 ? firstRate : RATE_AFTER_6M;
    return { month, benefit, rate };
  });

  // 総受給額
  const totalBenefitYen = monthlyDetails.reduce((sum, d) => sum + d.benefit, 0);
  const totalBenefit = Math.round(totalBenefitYen / 10000 * 10) / 10;

  // 社会保険料免除額（月額）
  const socialInsuranceSaving = Math.round(monthlyIncome * SHAKAI_HOKEN_RATE * 10) / 10;

  // 実質給付率（給付金 + 社保免除）÷ 月収
  const effectiveMonthlyFirst = (firstBenefit + socialInsuranceSaving * 10000) / (monthlyIncome * 10000);
  const effectiveRate = Math.round(effectiveMonthlyFirst * 1000) / 10;

  return {
    dailyWage,
    firstBenefit,
    afterBenefit,
    totalBenefit,
    socialInsuranceSaving,
    monthlyDetails,
    effectiveRate,
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
  {
    q: "育児休業給付金とは？",
    a: "雇用保険から支給される給付金です。育休取得前の賃金の67%（最初の6ヶ月）または50%（以降）が支給されます。非課税のため手取りベースでの減少は思ったより少ないです。",
  },
  {
    q: "社会保険料が免除される？",
    a: "育休中は健康保険・厚生年金の保険料が本人分・会社負担分ともに免除されます。免除期間も年金の加入期間としてカウントされるため、将来の年金額に影響しません。",
  },
  {
    q: "パパ・ママ育休とは？",
    a: "2022年に創設された「産後パパ育休（出生時育児休業）」制度です。子どもの出生後8週間以内に最大4週間取得でき、その間の給付率が80%になります（2025年度から）。",
  },
  {
    q: "個人事業主は育休手当をもらえる？",
    a: "育児休業給付金は雇用保険の制度のため、個人事業主・フリーランスは対象外です。国民年金の産前産後免除制度は利用できます。",
  },
  {
    q: "育休中に働いたらどうなる？",
    a: "月10日以下（または80時間以下）の就業であれば給付金を受け取れます。それを超えると給付金が支給停止になる場合があります。",
  },
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

export default function Ikukyu() {
  const [inp, setInp] = useState<IkukyuInputs>({
    parentType: "mother",
    monthlyIncome: 30,
    ikukyuMonths: 12,
    hasPartnerIkukyu: false,
  });

  const set = <K extends keyof IkukyuInputs>(key: K, val: IkukyuInputs[K]) =>
    setInp(prev => ({ ...prev, [key]: val }));

  const result = useMemo(() => calcIkukyu(inp), [inp]);

  const fmtYen = (n: number) => `${Math.round(n).toLocaleString()}円`;
  const fmtMan = (n: number) => `${n.toLocaleString()}万円`;

  return (
    <Layout title="育休手当シミュレーター">
      <div className="space-y-10">

        <div className="text-center py-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            育休中の給付金・社会保険料免除額をシミュレーションします
          </p>
          <p className="text-xs text-gray-400 mt-1">※会社員・公務員向け（個人事業主は対象外）</p>
        </div>

        {/* 入力 */}
        <section>
          <SectionTitle color="purple">👶 育休の設定</SectionTitle>
          <Card>
            {/* 取得者 */}
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">育休取得者</p>
              <div className="flex gap-2">
                <ToggleBtn active={inp.parentType === "mother"} onClick={() => set("parentType", "mother")}>👩 ママ</ToggleBtn>
                <ToggleBtn active={inp.parentType === "father"} onClick={() => set("parentType", "father")}>👨 パパ</ToggleBtn>
              </div>
            </div>

            <SliderInput
              label="育休前の月収（額面）"
              value={inp.monthlyIncome}
              min={15} max={100} step={1} unit="万円"
              onChange={v => set("monthlyIncome", v)}
            />

            <SliderInput
              label="育休取得月数"
              value={inp.ikukyuMonths}
              min={1} max={24} step={1} unit="ヶ月"
              onChange={v => set("ikukyuMonths", v)}
            />

            {/* パパ・ママ育休 */}
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                産後パパ育休（出生後8週以内）
              </p>
              <div className="flex gap-2">
                <ToggleBtn active={inp.hasPartnerIkukyu} onClick={() => set("hasPartnerIkukyu", true)}>あり（給付率80%）</ToggleBtn>
                <ToggleBtn active={!inp.hasPartnerIkukyu} onClick={() => set("hasPartnerIkukyu", false)}>なし（給付率67%）</ToggleBtn>
              </div>
              <p className="text-xs text-gray-400 mt-1">2025年度から産後パパ育休の給付率が80%に引上げ</p>
            </div>
          </Card>
        </section>

        {/* 結果サマリー */}
        <section>
          <SectionTitle color="green">💰 給付金シミュレーション</SectionTitle>

          {/* 実質給付率ハイライト */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-400 rounded-2xl p-5 mb-4 text-center">
            <p className="text-white/80 text-xs font-medium mb-1">社会保険料免除込みの実質給付率</p>
            <p className="text-white text-4xl font-black mb-1">約{result.effectiveRate}%</p>
            <p className="text-white/70 text-xs">育休手当は非課税のため、手取りの減少は思ったより少ない</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-4 text-center border border-blue-100 dark:border-blue-800">
              <p className="text-xs text-blue-500 font-semibold mb-1">最初の6ヶ月（月額）</p>
              <p className="text-xl font-black text-blue-600 dark:text-blue-400">{fmtYen(result.firstBenefit)}</p>
              <p className="text-xs text-blue-400 mt-0.5">給付率 {inp.hasPartnerIkukyu ? "80" : "67"}%</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900/20 rounded-2xl p-4 text-center border border-purple-100 dark:border-purple-800">
              <p className="text-xs text-purple-500 font-semibold mb-1">7ヶ月目以降（月額）</p>
              <p className="text-xl font-black text-purple-600 dark:text-purple-400">{fmtYen(result.afterBenefit)}</p>
              <p className="text-xs text-purple-400 mt-0.5">給付率 50%</p>
            </div>
          </div>

          <Card>
            <StatRow label="日額賃金（計算基礎）" value={fmtYen(result.dailyWage)} />
            <StatRow label="社会保険料免除額（月額）" value={fmtMan(result.socialInsuranceSaving)} />
            <StatRow label="育休取得月数" value={`${inp.ikukyuMonths}ヶ月`} />
            <StatRow label="給付金総額" value={fmtMan(result.totalBenefit)} highlight />
          </Card>
        </section>

        {/* 月別詳細 */}
        <section>
          <SectionTitle color="blue">📅 月別給付金</SectionTitle>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left py-2 text-gray-500 font-medium">月</th>
                    <th className="text-right py-2 text-gray-500 font-medium">給付率</th>
                    <th className="text-right py-2 text-gray-500 font-medium">月額給付金</th>
                  </tr>
                </thead>
                <tbody>
                  {result.monthlyDetails.map(d => (
                    <tr key={d.month} className="border-b border-gray-50 dark:border-gray-800/50 last:border-0">
                      <td className="py-2 text-gray-900 dark:text-white font-medium">{d.month}ヶ月目</td>
                      <td className="py-2 text-right">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          d.rate >= 0.8 ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                          : d.rate >= 0.67 ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                        }`}>
                          {Math.round(d.rate * 100)}%
                        </span>
                      </td>
                      <td className="py-2 text-right tabular-nums text-gray-900 dark:text-white font-semibold">
                        {fmtYen(d.benefit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gray-200 dark:border-gray-700">
                    <td colSpan={2} className="py-2 text-gray-600 dark:text-gray-400 font-bold">合計</td>
                    <td className="py-2 text-right tabular-nums text-brand-500 font-black">
                      {fmtMan(result.totalBenefit)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        </section>

        {/* 広告 */}
        <AdSlot slot="result" context="ikukyu" />

        {/* SEO解説 */}
        <section>
          <SectionTitle color="blue">📖 育休手当の基礎知識</SectionTitle>
          <Card>
            <div className="space-y-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">育児休業給付金の仕組み</h2>
                <p>雇用保険から支給される給付金で、育休開始から180日間は賃金の67%、181日以降は50%が支給されます。非課税のため、手取りベースでの減少は実感より少ないことが多いです。</p>
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">社会保険料免除の効果</h2>
                <p>育休中は健康保険・厚生年金保険料が全額免除されます（本人負担＋会社負担）。月収30万円の場合、月約4.4万円の社保が免除されます。この免除分を含めると実質給付率は80〜90%になる場合も。</p>
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">2025年度からの変更点</h2>
                <p>産後パパ育休（出生後8週以内・最大4週間）の給付率が80%に引き上げられました。夫婦で育休を取得するとさらに手厚い給付が受けられます。</p>
              </div>
            </div>
          </Card>
        </section>

        <section>
          <SectionTitle color="purple">❓ よくある質問</SectionTitle>
          <Card>{FAQ_LIST.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}</Card>
        </section>

        <SimulatorGrid excludeId="ikukyu" />

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 pb-4">
          ※本シミュレーションは概算です。実際の給付額はハローワークにご確認ください。
        </p>
      </div>
    </Layout>
  );
}
