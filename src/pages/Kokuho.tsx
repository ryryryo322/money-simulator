// ============================================
// 国民健康保険シミュレーター（v2 — 自治体別制度対応版）
// /kokuho
//
// 自治体ごとの算定方式・料率・均等割・平等割・賦課限度額・
// 子ども・子育て支援金分の違いを考慮して計算します。
// 公式情報が確認できていない区分は、推測値を使わず「未確認」と表示します。
// ============================================

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, SectionTitle, SliderInput, StatRow } from "@/components/ui";
import AdSlot from "@/components/AdSlot";
import SimulatorGrid from "@/components/SimulatorGrid";
import { MUNICIPALITIES, findMunicipality } from "@/constants/municipalities";
import { calcMunicipalityKokuho } from "@/lib/insurance/municipalityKokuho";
import type { MunicipalityKokuhoResult } from "@/lib/insurance/municipalityKokuho";

// ── 入力型 ────────────────────────────────────

interface KokuhoInputsV2 {
  income: number;              // 総所得（万円）控除後
  age: number;                 // 年齢（簡略化：世帯全員が同じ年齢として扱う）
  members: number;             // 世帯の国保加入者数
  municipalityCode: string;    // 自治体コード
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
  { q: "軽減措置とは？", a: "世帯所得が一定以下の場合、均等割・平等割が7割・5割・2割軽減されます。申請不要で自動適用されます。ただし正確な判定には世帯全員の所得や給与所得者等の人数が必要で、このシミュレーターは簡易判定です。" },
  { q: "40歳になると保険料が上がる？", a: "はい。40〜64歳は介護保険料（介護分）が加算されます。65歳以上は介護保険料が別途徴収されるため国保の介護分の対象から外れます。" },
  { q: "子ども・子育て支援金分とは？", a: "2026年度（令和8年度）から新設された区分です。加入者全員、または18歳以上の加入者に対して賦課されます（自治体により異なります）。" },
  { q: "マイクロ法人を作ると国保を抜けられる？", a: "法人で役員報酬を受け取ると協会けんぽ（健康保険）に加入でき、国保から脱退できます。保険料が大幅に下がる場合があります。" },
  { q: "このシミュレーターの計算はどこまで正確？", a: "各自治体の公式サイトで確認できた令和8年度の料率・均等割・平等割・賦課限度額をもとに、区分（医療分・支援分・介護分・子ども分）ごとに計算しています。ただし世帯内の年齢差や給与所得者数までは考慮できていません。最終的な金額は必ず自治体からの通知額をご確認ください。" },
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

// ── 内訳1行表示 ───────────────────────────────

const BracketRow = ({ result, fmtYen }: {
  result: MunicipalityKokuhoResult["medical"] | null;
  fmtYen: (n: number) => string;
}) => {
  if (!result) return null;
  return (
    <div className="py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{result.label}</span>
        <span className="text-sm font-bold text-gray-900 dark:text-white">{fmtYen(result.totalYen)}</span>
      </div>
      <div className="flex justify-between text-xs text-gray-400">
        <span>所得割 {fmtYen(result.incomeYen)}</span>
        <span>均等割 {fmtYen(result.perCapitaYen)}</span>
        <span>平等割 {fmtYen(result.perHouseholdYen)}</span>
      </div>
      {result.cappedByMax && (
        <p className="text-xs text-amber-500 mt-1">⚠️ 賦課限度額に達しています（上限適用後の金額です）</p>
      )}
    </div>
  );
};

// ── メインコンポーネント ──────────────────────

export default function Kokuho() {
  const [inp, setInp] = useState<KokuhoInputsV2>({
    income: 400,
    age: 35,
    members: 1,
    municipalityCode: "fukuoka",
  });

  const set = <K extends keyof KokuhoInputsV2>(key: K, val: KokuhoInputsV2[K]) =>
    setInp(prev => ({ ...prev, [key]: val }));

  const municipality = useMemo(() => findMunicipality(inp.municipalityCode), [inp.municipalityCode]);

  const result = useMemo(() => {
    if (!municipality) return null;
    return calcMunicipalityKokuho({
      totalIncomeYen: inp.income * 10000,
      members: inp.members,
      age: inp.age,
      municipality,
    });
  }, [inp, municipality]);

  const fmtYen = (n: number) => `${Math.round(n).toLocaleString()}円`;
  const fmtMan = (n: number) => `${n.toLocaleString()}万円`;

  return (
    <Layout title="国民健康保険シミュレーター">
      <div className="space-y-10">

        <div className="text-center py-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            自治体ごとの料率・区分に基づいて国保料を計算します
          </p>
        </div>

        {/* 入力 */}
        <section>
          <SectionTitle color="blue">👤 あなたの情報</SectionTitle>
          <Card>
            <SliderInput
              label="総所得（売上−経費−青色控除、または給与所得控除後）"
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
              {inp.members > 1 && (
                <p className="text-xs text-amber-500 mt-1">
                  ⚠️ 年齢は1つしか入力できないため、世帯全員が同じ年齢として計算されます（特に介護分・子ども分の判定に影響します）
                </p>
              )}
            </div>

            {/* 自治体選択 */}
            <div className="mb-2">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">自治体</label>
              <select value={inp.municipalityCode} onChange={e => set("municipalityCode", e.target.value)}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                {MUNICIPALITIES.map(m => <option key={m.municipalityCode} value={m.municipalityCode}>{m.cityName}</option>)}
              </select>

              {municipality && (
                <>
                  <p className="text-xs text-gray-400 mt-1">{municipality.calculationMethodLabel}</p>
                  {municipality.dataCompleteness === "partial" && (
                    <p className="text-xs text-amber-500 mt-1">
                      ⚠️ この自治体は一部区分のデータを公式サイト本体から直接確認できていません。{municipality.notes}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    出典：{municipality.source}（最終確認日: {municipality.lastVerified}）
                  </p>
                </>
              )}
              <p className="text-xs text-gray-400 mt-1">
                この一覧に掲載されていない自治体の正確な計算には対応していません（全国一律の推測値は使用しません）。
              </p>
            </div>
          </Card>
        </section>

        {/* 結果 */}
        {result && municipality && (
          <section>
            <SectionTitle color="orange">📊 計算結果</SectionTitle>

            {/* 軽減区分 */}
            {result.reduction.rate < 1 && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-3 mb-3 text-center">
                <p className="text-sm font-bold text-green-600 dark:text-green-400">
                  🎉 {result.reduction.label}が適用されています（簡易判定）
                </p>
              </div>
            )}

            {/* 年間保険料ハイライト */}
            <div className="bg-gradient-to-r from-brand-500 to-orange-400 rounded-2xl p-5 mb-4 text-center">
              <p className="text-white/80 text-xs font-medium mb-1">年間国民健康保険料（概算）</p>
              <p className="text-white text-4xl font-black mb-1">{fmtYen(result.totalYen)}</p>
              <p className="text-white/70 text-xs">月額：約{fmtYen(Math.round(result.totalYen / 12))}</p>
            </div>

            <Card>
              <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800 text-sm mb-1">
                <span className="text-gray-500">所得割計算基準（総所得−43万円）</span>
                <span className="font-semibold text-gray-900 dark:text-white">{fmtMan(Math.round(result.shotokuBaseYen / 10000 * 10) / 10)}</span>
              </div>

              <BracketRow result={result.medical} fmtYen={fmtYen} />
              <BracketRow result={result.support} fmtYen={fmtYen} />
              {inp.age >= 40 && inp.age <= 64 && result.care && (
                <BracketRow result={result.care} fmtYen={fmtYen} />
              )}
              {inp.age < 40 || inp.age > 64 ? (
                <p className="text-xs text-gray-400 py-2">介護分：対象外（40〜64歳のみ）</p>
              ) : null}

              {result.childSupport ? (
                <BracketRow result={result.childSupport} fmtYen={fmtYen} />
              ) : result.childSupportMissing ? (
                <div className="py-3">
                  <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">子ども・子育て支援金分：データ未確認</p>
                  <p className="text-xs text-gray-400 mt-1">
                    現在、この自治体の公式料率データを登録していないため、子ども・子育て支援金分を計算に含めていません。実際の保険料はここに表示した金額より高くなります。
                  </p>
                </div>
              ) : null}

              <div className="flex justify-between py-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="font-bold text-gray-900 dark:text-white">年間合計</span>
                <span className="font-black text-brand-500">{fmtYen(result.totalYen)}</span>
              </div>
            </Card>

            <p className="text-xs text-gray-400 mt-2 px-1">
              {municipality.reductionNote}
            </p>
          </section>
        )}

        {/* 広告 */}
        <AdSlot slot="result" context="kokuho" />

        {/* 東京都ユーザーへの誘導 */}
        <section>
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs text-blue-500 font-semibold mb-0.5">🗼 東京都にお住まいの方へ</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">東京23区の国保料を区ごとに正確に計算</p>
              <p className="text-xs text-gray-500 mt-0.5">2026年度公式データ対応・子ども支援金含む</p>
            </div>
            <Link to="/tokyo-kokuho"
              className="flex-shrink-0 bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-blue-600 active:opacity-70 transition-colors">
              計算する →
            </Link>
          </div>
        </section>

        {/* SEO解説 */}
        <section>
          <SectionTitle color="blue">📖 国保の基礎知識</SectionTitle>
          <Card>
            <div className="space-y-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">国民健康保険料の計算方法</h2>
                <p>国保料は「所得割（所得×料率）＋均等割（加入者×定額）＋平等割（世帯×定額）」などの区分の合計で計算されます。方式（2方式・3方式・4方式）・料率・金額は自治体ごとに異なります。</p>
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">2026年度（令和8年度）からの変更点</h2>
                <p>「子ども・子育て支援金分」が新設されました。自治体により、全加入者が対象の場合と18歳以上の加入者にのみ追加負担が生じる場合があります。</p>
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">国保料を下げる方法</h2>
                <p>①青色申告特別控除（最大65万円）で所得を減らす、②iDeCoや小規模企業共済で所得控除を増やす、③マイクロ法人を設立して協会けんぽに切り替える、などの方法があります。</p>
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
          ※本シミュレーションは各自治体の公式情報をもとにした概算です。実際の保険料は自治体からの通知額が優先されます。軽減制度の判定は簡易判定であり、正確な判定には世帯全員の所得等の情報が必要です。
        </p>
      </div>
    </Layout>
  );
}
