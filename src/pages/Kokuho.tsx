// ============================================
// 国民健康保険シミュレーター
// /kokuho
// ============================================

import { useState, useMemo } from "react";
import Layout from "@/components/Layout";
import { Card, SectionTitle, SliderInput, StatRow } from "@/components/ui";
import AdSlot from "@/components/AdSlot";
import SimulatorGrid from "@/components/SimulatorGrid";
import { KOKUHO_RATES, KOKUHO_MANUAL_DEFAULT } from "@/constants/kokuhoRates";
import type { KokuhoRate } from "@/constants/kokuhoRates";

// ── 計算ロジック ─────────────────────────────

interface KokuhoInputs {
  income: number;        // 総所得（万円）青色控除後
  age: number;           // 年齢
  members: number;       // 世帯の国保加入人数
  kokuhoCity: string;    // 自治体
  // 手動入力
  manualIryoRate: number;
  manualShienRate: number;
  manualKaigoRate: number;
  manualIryoKintou: number;
  manualShienKintou: number;
  manualKaigoKintou: number;
  manualHeitou: number;
}

interface KokuhoResult {
  shotokuBase: number;   // 所得割計算基準（総所得-43万）
  kintoRate: number;     // 軽減率
  kintoLabel: string;    // 軽減区分
  iryoYen: number;       // 医療分
  shienYen: number;      // 支援金分
  kaigoYen: number;      // 介護分
  totalYen: number;      // 合計
  totalMan: number;      // 合計（万円）
}

function calcKokuho(inp: KokuhoInputs): KokuhoResult {
  const { income, age, members } = inp;
  const incomeYen = income * 10000;

  const rate: KokuhoRate = inp.kokuhoCity === "manual"
    ? {
        ...KOKUHO_MANUAL_DEFAULT,
        iryoIncome: inp.manualIryoRate / 100,
        shienIncome: inp.manualShienRate / 100,
        kaigo: inp.manualKaigoRate / 100,
        iryoKintou: inp.manualIryoKintou,
        shienKintou: inp.manualShienKintou,
        kaigoKintou: inp.manualKaigoKintou,
        iryoHeitou: inp.manualHeitou,
        shienHeitou: 0,
      }
    : KOKUHO_RATES.find(r => r.city === inp.kokuhoCity) ?? KOKUHO_RATES[0];

  // 所得割基準（総所得-43万）
  const shotokuBaseYen = Math.max(0, incomeYen - 430_000);

  // 軽減判定
  const m = Math.max(1, members);
  const kigen7 = 430_000;
  const kigen5 = 430_000 + 290_000 * m;
  const kigen2 = 430_000 + 535_000 * m;

  let kintoRate: number;
  let kintoLabel: string;
  if (incomeYen <= kigen7) { kintoRate = 0.3; kintoLabel = "7割軽減"; }
  else if (incomeYen <= kigen5) { kintoRate = 0.5; kintoLabel = "5割軽減"; }
  else if (incomeYen <= kigen2) { kintoRate = 0.8; kintoLabel = "2割軽減"; }
  else { kintoRate = 1.0; kintoLabel = "軽減なし"; }

  // 医療分
  const iryoYen = Math.min(
    shotokuBaseYen * rate.iryoIncome + rate.iryoKintou * m * kintoRate + rate.iryoHeitou * kintoRate,
    rate.iryoMax
  );

  // 支援金分
  const shienYen = Math.min(
    shotokuBaseYen * rate.shienIncome + rate.shienKintou * m * kintoRate + rate.shienHeitou * kintoRate,
    rate.shienMax
  );

  // 介護分（40〜64歳のみ）
  let kaigoYen = 0;
  if (age >= 40 && age <= 64) {
    const kaigoHeitou = (rate.kaigoHeitou ?? 0) * kintoRate;
    kaigoYen = Math.min(
      shotokuBaseYen * rate.kaigo + rate.kaigoKintou * m * kintoRate + kaigoHeitou,
      rate.kaigoMax
    );
  }

  const totalYen = Math.round(iryoYen + shienYen + kaigoYen);
  return {
    shotokuBase: Math.round(shotokuBaseYen / 10000 * 10) / 10,
    kintoRate,
    kintoLabel,
    iryoYen: Math.round(iryoYen),
    shienYen: Math.round(shienYen),
    kaigoYen: Math.round(kaigoYen),
    totalYen,
    totalMan: Math.round(totalYen / 10000 * 10) / 10,
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
  { q: "国民健康保険料はいつ決まる？", a: "前年の所得をもとに毎年6〜7月に決定されます。通知書が届いたら確認しましょう。" },
  { q: "軽減措置とは？", a: "世帯所得が一定以下の場合、均等割・平等割が7割・5割・2割軽減されます。申請不要で自動適用されます。" },
  { q: "40歳になると保険料が上がる？", a: "はい。40〜64歳は介護保険料（介護分）が加算されます。65歳以上は介護保険料が別途徴収されるため国保から外れます。" },
  { q: "マイクロ法人を作ると国保を抜けられる？", a: "法人で役員報酬を受け取ると協会けんぽ（健康保険）に加入でき、国保から脱退できます。保険料が大幅に下がる場合があります。" },
  { q: "計算値と実際の通知額が違う理由は？", a: "自治体によって内部調整（按分・限度額調整）が入るため、理論値と通知額が異なる場合があります。特に一部の政令市は調整が強く出ます。" },
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

export default function Kokuho() {
  const [inp, setInp] = useState<KokuhoInputs>({
    income: 400,
    age: 35,
    members: 1,
    kokuhoCity: "東京都（23区）",
    manualIryoRate: 8.0,
    manualShienRate: 2.7,
    manualKaigoRate: 2.2,
    manualIryoKintou: 25000,
    manualShienKintou: 8000,
    manualKaigoKintou: 11000,
    manualHeitou: 20000,
  });

  const set = <K extends keyof KokuhoInputs>(key: K, val: KokuhoInputs[K]) =>
    setInp(prev => ({ ...prev, [key]: val }));

  const result = useMemo(() => calcKokuho(inp), [inp]);

  const fmtYen = (n: number) => `${Math.round(n).toLocaleString()}円`;
  const fmtMan = (n: number) => `${n.toLocaleString()}万円`;

  const selectedRate = KOKUHO_RATES.find(r => r.city === inp.kokuhoCity);

  return (
    <Layout title="国民健康保険シミュレーター">
      <div className="space-y-10">

        <div className="text-center py-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            自治体別の正確な国保料を計算します
          </p>
        </div>

        {/* 入力 */}
        <section>
          <SectionTitle color="blue">👤 あなたの情報</SectionTitle>
          <Card>
            <SliderInput
              label="総所得（売上−経費−青色控除）"
              value={inp.income} min={0} max={2000} step={10} unit="万円"
              onChange={v => set("income", v)}
            />
            <SliderInput label="年齢" value={inp.age} min={20} max={74} step={1} unit="歳" onChange={v => set("age", v)} />

            <div className="mb-5">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">国保加入人数（世帯）</label>
              <select value={inp.members} onChange={e => set("members", Number(e.target.value))}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}人</option>)}
              </select>
            </div>

            {/* 自治体選択 */}
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">自治体</label>
              <select value={inp.kokuhoCity} onChange={e => set("kokuhoCity", e.target.value)}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                {KOKUHO_RATES.map(r => <option key={r.city} value={r.city}>{r.city}</option>)}
                <option value="manual">その他（手動入力）</option>
              </select>

              {/* 調整レベルメッセージ */}
              {selectedRate?.adjustmentLevel === "high" && (
                <p className="text-xs text-red-500 mt-1">⚠️ {selectedRate.note}</p>
              )}
              {selectedRate?.adjustmentLevel === "medium" && (
                <p className="text-xs text-amber-500 mt-1">⚠️ {selectedRate.note}</p>
              )}
              {selectedRate?.adjustmentLevel === "low" && (
                <p className="text-xs text-green-600 mt-1">✅ 計算値と通知額はほぼ一致する傾向があります</p>
              )}
              <p className="text-xs text-gray-400 mt-1">計算値は理論値です。正確な金額は自治体窓口でご確認ください。</p>
            </div>

            {/* 手動入力 */}
            {inp.kokuhoCity === "manual" && (
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 mb-2 space-y-3">
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">料率を手動入力（%）</p>
                {([
                  { label: "医療分 所得割率", key: "manualIryoRate" as const },
                  { label: "支援金分 所得割率", key: "manualShienRate" as const },
                  { label: "介護分 所得割率（40〜64歳）", key: "manualKaigoRate" as const },
                ]).map(({ label, key }) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-44">{label}</span>
                    <input type="number" step="0.1" min="0" max="20" value={inp[key]}
                      onChange={e => set(key, Number(e.target.value))}
                      className="w-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-sm text-right" />
                    <span className="text-xs text-gray-400">%</span>
                  </div>
                ))}
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mt-2">均等割（円/人）</p>
                {([
                  { label: "医療分", key: "manualIryoKintou" as const },
                  { label: "支援金分", key: "manualShienKintou" as const },
                  { label: "介護分（40〜64歳）", key: "manualKaigoKintou" as const },
                ]).map(({ label, key }) => (
                  <div key={key} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 dark:text-gray-400 w-44">{label}</span>
                    <input type="number" step="100" min="0" value={inp[key]}
                      onChange={e => set(key, Number(e.target.value))}
                      className="w-24 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-sm text-right" />
                    <span className="text-xs text-gray-400">円</span>
                  </div>
                ))}
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 dark:text-gray-400 w-44">平等割（世帯）</span>
                  <input type="number" step="100" min="0" value={inp.manualHeitou}
                    onChange={e => set("manualHeitou", Number(e.target.value))}
                    className="w-24 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1 text-sm text-right" />
                  <span className="text-xs text-gray-400">円</span>
                </div>
              </div>
            )}
          </Card>
        </section>

        {/* 結果 */}
        <section>
          <SectionTitle color="orange">📊 計算結果</SectionTitle>

          {/* 軽減区分 */}
          {result.kintoRate < 1 && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-3 mb-3 text-center">
              <p className="text-sm font-bold text-green-600 dark:text-green-400">
                🎉 {result.kintoLabel}が適用されています
              </p>
            </div>
          )}

          {/* 年間保険料ハイライト */}
          <div className="bg-gradient-to-r from-brand-500 to-orange-400 rounded-2xl p-5 mb-4 text-center">
            <p className="text-white/80 text-xs font-medium mb-1">年間国民健康保険料（概算）</p>
            <p className="text-white text-4xl font-black mb-1">{fmtMan(result.totalMan)}</p>
            <p className="text-white/70 text-xs">月額：約{fmtMan(Math.round(result.totalMan / 12 * 10) / 10)}</p>
          </div>

          <Card>
            <StatRow label="所得割計算基準（総所得-43万）" value={fmtMan(result.shotokuBase)} />
            <StatRow label="医療分" value={fmtYen(result.iryoYen)} />
            <StatRow label="支援金分" value={fmtYen(result.shienYen)} />
            {inp.age >= 40 && inp.age <= 64 && (
              <StatRow label="介護分（40〜64歳）" value={fmtYen(result.kaigoYen)} />
            )}
            <StatRow label="年間合計" value={fmtYen(result.totalYen)} highlight />
            <StatRow label="月額換算" value={fmtYen(Math.round(result.totalYen / 12))} />
          </Card>
        </section>

        {/* 広告 */}
        <AdSlot slot="result" context="kokuho" />

        {/* SEO解説 */}
        <section>
          <SectionTitle color="blue">📖 国保の基礎知識</SectionTitle>
          <Card>
            <div className="space-y-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">国民健康保険料の計算方法</h2>
                <p>国保料は「所得割（所得×料率）＋均等割（加入者×定額）＋平等割（世帯×定額）」で計算されます。料率は自治体ごとに異なりますが、計算式は全国共通です。</p>
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">国保料を下げる方法</h2>
                <p>①青色申告特別控除（最大65万円）で所得を減らす、②iDeCoや小規模企業共済で所得控除を増やす、③マイクロ法人を設立して協会けんぽに切り替える、などの方法があります。</p>
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">上限額（賦課限度額）について</h2>
                <p>国保料には上限があります。医療分65万円・支援金分24万円・介護分17万円（2024年度）が上限です。高所得者はこの上限に達することがあります。</p>
              </div>
            </div>
          </Card>
        </section>

        <section>
          <SectionTitle color="purple">❓ よくある質問</SectionTitle>
          <Card>{FAQ_LIST.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}</Card>
        </section>

        <SimulatorGrid excludeId="kokuho" />

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 pb-4">
          ※計算値は理論値です。実際の保険料は自治体の窓口または公式サイトでご確認ください。
        </p>
      </div>
    </Layout>
  );
}
