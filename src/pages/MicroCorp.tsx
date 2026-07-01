// ============================================
// マイクロ法人 損得シミュレーター
// /micro-corp
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

import { calcSolo, calcCorp, calcRewardTrials, getBestReward } from "@/features/micro-corp/calc";
import { CORP_MAINTENANCE_DEFAULT, YAKUIN_TRIAL_LIST } from "@/constants/tax2026";
import type { SoloInputs, CorpInputs } from "@/types/microCorp";
import type { BlueReturnType } from "@/constants/tax2026";

// ── FAQ データ ────────────────────────────────

const FAQ_LIST = [
  {
    q: "マイクロ法人とは何ですか？",
    a: "個人事業主が社会保険料の節約を目的として設立する、役員が1名の小規模な法人です。個人事業と法人を並行運営し、役員報酬を低く設定することで社会保険料（健康保険・厚生年金）を抑えられます。",
  },
  {
    q: "どんな人がマイクロ法人に向いていますか？",
    a: "年間売上が600万円以上の個人事業主で、社会保険料の負担を減らしたい方に向いています。特に国民健康保険料が上限（約87万円）近くに達している方に効果的です。",
  },
  {
    q: "役員報酬はいくらに設定すればよいですか？",
    a: "一般的に月額5〜15万円が多く選ばれます。低すぎると厚生年金の将来受給額が減り、高すぎると社会保険料も増えます。このシミュレーターの「おすすめ役員報酬」も参考にしてください。",
  },
  {
    q: "法人設立にはどのくらいお金がかかりますか？",
    a: "株式会社で約24万円、合同会社で約10万円の設立費用がかかります。毎年の法人住民税均等割（最低7万円）や税理士費用なども考慮が必要です。",
  },
  {
    q: "個人事業も続けられますか？",
    a: "はい。マイクロ法人では副業的な事業（例：不動産収入・ネット販売など）を行い、メインの個人事業と並行して運営するケースが多いです。",
  },
  {
    q: "健康保険はどう変わりますか？",
    a: "国民健康保険から協会けんぽ（健康保険）に切り替わります。役員報酬が低ければ保険料も低くなり、かつ扶養家族も保険料なしで加入できるメリットがあります。",
  },
  {
    q: "厚生年金に加入するデメリットはありますか？",
    a: "保険料負担は増えますが、将来の年金受給額が国民年金より多くなります。老後を考えると一概にデメリットとは言えません。",
  },
  {
    q: "このシミュレーターの計算は正確ですか？",
    a: "概算計算です。国民健康保険料は自治体によって大きく異なり、所得控除の種類や法人の事業内容によっても変わります。意思決定の参考にとどめ、必ず税理士・社労士にご相談ください。",
  },
  {
    q: "法人税はどのくらいかかりますか？",
    a: "中小企業の法人税率は利益800万円以下で約15%、超過分は約23.4%です。法人住民税や事業税も別途かかります（このシミュレーターは概算）。",
  },
  {
    q: "青色申告はマイクロ法人でも使えますか？",
    a: "法人には青色申告特別控除はありませんが、法人でも青色申告（法人税の青色申告）は行います。個人事業主の青色申告特別控除（最大65万円）は個人事業側で引き続き利用できます。",
  },
] as const;

// ── トグルボタン ─────────────────────────────

function ToggleBtn({
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

// ── FAQ アコーディオン ────────────────────────

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left py-3 flex justify-between items-center gap-2"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{q}</span>
        <span className="text-gray-400 text-lg flex-shrink-0">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pb-3">
          {a}
        </p>
      )}
    </div>
  );
}

// ── メインコンポーネント ──────────────────────

export default function MicroCorp() {
  // ── STEP1: 個人事業入力 ──
  const [soloInp, setSoloInp] = useState<SoloInputs>({
    revenue: 800,
    expense: 150,
    blueReturn: "65",
    shokibo: 0,
    ideco: 0,
    age: 40,
    hasSpouse: false,
    dependents: 0,
    hasBizTax: false,
    prefecture: "東京都",
  });

  // ── STEP2: 法人設立後入力 ──
  const [corpInp, setCorpInp] = useState<CorpInputs>({
    monthlyReward: 10,
    maintenance: CORP_MAINTENANCE_DEFAULT,
    hasCorpResidentTax: true,
  });

  const setSolo = <K extends keyof SoloInputs>(key: K, val: SoloInputs[K]) =>
    setSoloInp(prev => ({ ...prev, [key]: val }));
  const setCorp = <K extends keyof CorpInputs>(key: K, val: CorpInputs[K]) =>
    setCorpInp(prev => ({ ...prev, [key]: val }));

  // ── 計算 ──
  const solo = useMemo(() => calcSolo(soloInp), [soloInp]);
  const corp = useMemo(() => calcCorp(soloInp, corpInp), [soloInp, corpInp]);
  const trials = useMemo(() => calcRewardTrials(soloInp, corpInp, solo.takeHome), [soloInp, corpInp, solo.takeHome]);
  const bestReward = useMemo(() => getBestReward(trials), [trials]);

  const diff = corp.takeHome - solo.takeHome;
  const corpWins = diff > 0;

  const fmtM = (n: number) => `${n.toLocaleString()}万円`;

  // グラフ用データ
  const chartData = [
    {
      name: "個人事業",
      税金: Math.round(solo.incomeTax + solo.residentTax + solo.bizTax),
      社会保険: Math.round(solo.kokuho + solo.kokunen),
      手取り: Math.max(0, Math.round(solo.takeHome)),
    },
    {
      name: "マイクロ法人",
      税金: Math.round(corp.personalIncomeTax + corp.personalResidentTax + corp.corpTax + corp.corpResidentTax),
      社会保険: Math.round(corp.shakaiHoken + corp.koseiNenkin),
      手取り: Math.max(0, Math.round(corp.takeHome)),
    },
  ];

  // FAQ構造化データ
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQ_LIST.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a },
    })),
  };

  return (
    <Layout title="マイクロ法人 損得シミュレーター">
      {/* FAQ構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <div className="space-y-10">

        {/* ヘッダー説明 */}
        <div className="text-center py-2">
          <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">【2026年制度対応】最終更新 2026年6月</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            個人事業のままとマイクロ法人設立後を比較できます。概算計算です。
          </p>
        </div>

        {/* ── STEP1: 個人事業 ── */}
        <section>
          <SectionTitle color="blue">STEP 1｜現在の個人事業</SectionTitle>
          <Card>
            {/* 都道府県 */}
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">都道府県</label>
              <select
                value={soloInp.prefecture}
                onChange={e => setSolo("prefecture", e.target.value)}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {["北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県","茨城県","栃木県","群馬県","埼玉県","千葉県","東京都","神奈川県","新潟県","富山県","石川県","福井県","山梨県","長野県","岐阜県","静岡県","愛知県","三重県","滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県","鳥取県","島根県","岡山県","広島県","山口県","徳島県","香川県","愛媛県","高知県","福岡県","佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県","沖縄県"].map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">国保料は概算。自治体により異なります。</p>
            </div>

            <SliderInput label="年間売上" value={soloInp.revenue} min={100} max={5000} step={10} unit="万円" onChange={v => setSolo("revenue", v)} />
            <SliderInput label="必要経費" value={soloInp.expense} min={0} max={3000} step={10} unit="万円" onChange={v => setSolo("expense", v)} />

            {/* 青色申告 */}
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">青色申告控除</p>
              <div className="flex gap-2">
                {(["65","55","10","none"] as BlueReturnType[]).map(k => (
                  <ToggleBtn key={k} active={soloInp.blueReturn === k} onClick={() => setSolo("blueReturn", k)}>
                    {k === "none" ? "白色" : `${k}万`}
                  </ToggleBtn>
                ))}
              </div>
            </div>

            {/* 小規模企業共済 */}
            <SliderInput label="小規模企業共済（月額）" value={soloInp.shokibo} min={0} max={7} step={0.5} unit="万円" onChange={v => setSolo("shokibo", v)} />

            {/* iDeCo */}
            <SliderInput label="iDeCo（月額）" value={soloInp.ideco} min={0} max={6.8} step={0.1} unit="万円" onChange={v => setSolo("ideco", v)} />

            <SliderInput label="年齢" value={soloInp.age} min={20} max={65} step={1} unit="歳" onChange={v => setSolo("age", v)} />

            {/* 配偶者 */}
            <div className="mb-5">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">配偶者</p>
              <div className="flex gap-2">
                <ToggleBtn active={soloInp.hasSpouse} onClick={() => setSolo("hasSpouse", true)}>あり</ToggleBtn>
                <ToggleBtn active={!soloInp.hasSpouse} onClick={() => setSolo("hasSpouse", false)}>なし</ToggleBtn>
              </div>
            </div>

            {/* 扶養人数 */}
            <div className="mb-5">
              <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">扶養人数</label>
              <select
                value={soloInp.dependents}
                onChange={e => setSolo("dependents", Number(e.target.value))}
                className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {[0,1,2,3,4,5].map(n => (
                  <option key={n} value={n}>{n}人{n === 0 ? "（なし）" : ""}</option>
                ))}
              </select>
            </div>

            {/* 個人事業税 */}
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">個人事業税</p>
              <div className="flex gap-2">
                <ToggleBtn active={soloInp.hasBizTax} onClick={() => setSolo("hasBizTax", true)}>あり（5%）</ToggleBtn>
                <ToggleBtn active={!soloInp.hasBizTax} onClick={() => setSolo("hasBizTax", false)}>なし</ToggleBtn>
              </div>
              <p className="text-xs text-gray-400 mt-1">ライター・エンジニアなど業種によって不要な場合あり</p>
            </div>
          </Card>
        </section>

        {/* ── STEP2: 法人設立後 ── */}
        <section>
          <SectionTitle color="green">STEP 2｜法人設立後の設定</SectionTitle>
          <Card>
            <SliderInput
              label="役員報酬（月額）"
              value={corpInp.monthlyReward}
              min={0} max={30} step={1} unit="万円"
              onChange={v => setCorp("monthlyReward", v)}
            />
            <SliderInput
              label="法人維持費（年間）"
              value={corpInp.maintenance}
              min={0} max={100} step={1} unit="万円"
              onChange={v => setCorp("maintenance", v)}
            />
            <div className="mb-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">法人住民税均等割</p>
              <div className="flex gap-2">
                <ToggleBtn active={corpInp.hasCorpResidentTax} onClick={() => setCorp("hasCorpResidentTax", true)}>あり（7万円）</ToggleBtn>
                <ToggleBtn active={!corpInp.hasCorpResidentTax} onClick={() => setCorp("hasCorpResidentTax", false)}>なし</ToggleBtn>
              </div>
            </div>
          </Card>
        </section>

        {/* ── STEP3: 比較結果 ── */}
        <section>
          <SectionTitle color="orange">STEP 3｜比較結果</SectionTitle>

          {/* 結果サマリー */}
          <div className={`rounded-2xl border p-5 mb-4 text-center ${
            corpWins
              ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
              : "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
          }`}>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">年間差額</p>
            <p className={`text-3xl font-black mb-1 ${corpWins ? "text-green-500" : "text-blue-500"}`}>
              {corpWins ? "+" : ""}{fmtM(Math.round(diff))}
            </p>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              {corpWins ? "🏆 マイクロ法人がお得です" : "💡 個人事業のままがおすすめです"}
            </p>
          </div>

          {/* 詳細比較 */}
          <div className="grid grid-cols-2 gap-3">
            <Card>
              <p className="text-xs font-bold text-blue-500 mb-3">現在（個人事業）</p>
              <StatRow label="所得税" value={fmtM(solo.incomeTax)} />
              <StatRow label="住民税" value={fmtM(solo.residentTax)} />
              <StatRow label="国民健康保険" value={fmtM(solo.kokuho)} />
              <StatRow label="国民年金" value={fmtM(solo.kokunen)} />
              {soloInp.hasBizTax && <StatRow label="個人事業税" value={fmtM(solo.bizTax)} />}
              <StatRow label="負担合計" value={fmtM(solo.totalBurden)} />
              <StatRow label="手取り" value={fmtM(solo.takeHome)} highlight />
            </Card>
            <Card>
              <p className="text-xs font-bold text-green-500 mb-3">マイクロ法人</p>
              <StatRow label="所得税" value={fmtM(corp.personalIncomeTax)} />
              <StatRow label="住民税" value={fmtM(corp.personalResidentTax)} />
              <StatRow label="健康保険" value={fmtM(corp.shakaiHoken)} />
              <StatRow label="厚生年金" value={fmtM(corp.koseiNenkin)} />
              <StatRow label="法人税" value={fmtM(corp.corpTax)} />
              {corpInp.hasCorpResidentTax && <StatRow label="法人住民税" value={fmtM(corp.corpResidentTax)} />}
              <StatRow label="法人維持費" value={fmtM(corp.maintenance)} />
              <StatRow label="負担合計" value={fmtM(corp.totalBurden)} />
              <StatRow label="手取り" value={fmtM(corp.takeHome)} highlight />
            </Card>
          </div>
        </section>

        {/* ── グラフ ── */}
        <section>
          <SectionTitle color="blue">📊 比較グラフ</SectionTitle>
          <Card>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}万`} width={48} />
                <Tooltip formatter={(v: number) => `${v.toLocaleString()}万円`} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="税金" stackId="a" fill="#ef4444" />
                <Bar dataKey="社会保険" stackId="a" fill="#f97316" />
                <Bar dataKey="手取り" stackId="a" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </section>

        {/* ── 役員報酬別試算 ── */}
        <section>
          <SectionTitle color="purple">💡 役員報酬別 自動試算</SectionTitle>
          <Card>
            <p className="text-sm font-bold text-brand-500 mb-3">
              ✨ あなたの場合は月額 {bestReward}万円 が最も手取りが多くなります
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-gray-800">
                    <th className="text-left py-2 text-gray-500 font-medium">月額報酬</th>
                    <th className="text-right py-2 text-gray-500 font-medium">手取り</th>
                    <th className="text-right py-2 text-gray-500 font-medium">個人事業との差</th>
                  </tr>
                </thead>
                <tbody>
                  {trials.map(t => (
                    <tr
                      key={t.monthlyReward}
                      className={`border-b border-gray-50 dark:border-gray-800/50 last:border-0 ${
                        t.monthlyReward === bestReward ? "bg-brand-50 dark:bg-brand-900/10" : ""
                      }`}
                    >
                      <td className="py-2 font-medium text-gray-900 dark:text-white">
                        {t.monthlyReward}万円
                        {t.monthlyReward === bestReward && <span className="ml-1 text-brand-500">★</span>}
                      </td>
                      <td className="py-2 text-right tabular-nums text-gray-900 dark:text-white">{fmtM(t.takeHome)}</td>
                      <td className={`py-2 text-right tabular-nums font-semibold ${t.diff >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {t.diff >= 0 ? "+" : ""}{fmtM(t.diff)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* ── 解説 ── */}
        <section>
          <SectionTitle color="blue">📖 なぜこの結果になるの？</SectionTitle>
          <Card>
            <div className="space-y-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-1">青色申告とは</h2>
                <p>青色申告特別控除（最大65万円）は個人事業主専用の節税手段です。マイクロ法人化後も個人事業側で引き続き利用できます。電子申告（e-Tax）を行うと最大65万円の控除が受けられます。</p>
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-1">国民健康保険 vs 協会けんぽ</h2>
                <p>国民健康保険料は所得に比例して増え、上限は約87万円。マイクロ法人で役員報酬を低く設定すると、協会けんぽの保険料が大幅に下がります。さらに家族を扶養に入れると、追加保険料なしで全員が加入できます。</p>
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-1">厚生年金について</h2>
                <p>厚生年金の保険料は増えますが、将来の年金受給額も増えます。老後の収入を考えると一概にデメリットとは言えません。</p>
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-1">法人税と役員報酬</h2>
                <p>役員報酬は法人の経費として計上できます。役員報酬が高いほど法人税は減りますが、個人の社会保険料や所得税が増えます。最適な役員報酬を見つけることが節税の鍵です。</p>
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white mb-1">法人維持費</h2>
                <p>法人を維持するには税理士費用・法人住民税・登記費用などがかかります。年間15〜30万円程度が目安。節税効果がこれを上回るかどうかがマイクロ法人化の判断基準です。</p>
              </div>
            </div>
          </Card>
        </section>

        {/* 広告（結果下） */}
        <AdSlot slot="result" />

        {/* ── FAQ ── */}
        <section>
          <SectionTitle color="purple">❓ よくある質問</SectionTitle>
          <Card>
            {FAQ_LIST.map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} />
            ))}
          </Card>
        </section>

        {/* 広告（FAQ下） */}
        <AdSlot slot="faq" />

        {/* 他のシミュレーター */}
        <SimulatorGrid excludeId="microcorp" />

        {/* 広告（ページ最下部） */}
        <AdSlot slot="footer" />

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 pb-4">
          ※概算です。自治体や加入保険等で変わります。税理士・社労士へ相談してください。
        </p>
      </div>
    </Layout>
  );
}
