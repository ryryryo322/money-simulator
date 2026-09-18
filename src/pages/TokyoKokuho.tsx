// ============================================
// 東京都 国民健康保険料シミュレーター（SEO特化ページ）
// /tokyo-kokuho
// 出典：東京都保健医療局「令和8年度 特別区国民健康保険料一覧表」
//       （令和8年4月1日現在）
// ============================================

import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, SectionTitle, SliderInput } from "@/components/ui";

// ── 2026年度 東京23区 料率データ ──────────────
// 出典：東京都保健医療局（令和8年4月1日現在）
// https://www.hokeniryo.metro.tokyo.lg.jp/documents/d/hokeniryo/tokubetuku202605-pdf

interface Ward {
  name: string;
  // 基礎賦課分（医療分）
  iryoKintou: number;   // 均等割（円）
  iryoIncome: number;   // 所得割率
  iryoMax: number;      // 賦課限度額（円）
  // 後期高齢者支援金分
  shienKintou: number;
  shienIncome: number;
  shienMax: number;
  // 介護納付金分（40〜64歳のみ）
  kaigoKintou: number;
  kaigoIncome: number;
  kaigoMax: number;
  // 子ども・子育て支援納付金分（2026年度新設）
  kodomoKintou18: number; // 18歳以上均等割（円）
  kodomoIncome: number;
  kodomoMax: number;
}

// 全23区のデータ（東京都保健医療局公表値）
// ※ほとんどの区は統一料率。中野区・江戸川区のみ一部異なる。
const WARDS: Ward[] = [
  { name: "千代田区", iryoKintou:47600, iryoIncome:0.0751, iryoMax:670000, shienKintou:17600, shienIncome:0.0280, shienMax:260000, kaigoKintou:17800, kaigoIncome:0.0243, kaigoMax:170000, kodomoKintou18:1800, kodomoIncome:0.0027, kodomoMax:30000 },
  { name: "中央区",   iryoKintou:47600, iryoIncome:0.0751, iryoMax:670000, shienKintou:17600, shienIncome:0.0280, shienMax:260000, kaigoKintou:17800, kaigoIncome:0.0243, kaigoMax:170000, kodomoKintou18:1800, kodomoIncome:0.0027, kodomoMax:30000 },
  { name: "港区",     iryoKintou:47600, iryoIncome:0.0751, iryoMax:670000, shienKintou:17600, shienIncome:0.0280, shienMax:260000, kaigoKintou:17800, kaigoIncome:0.0243, kaigoMax:170000, kodomoKintou18:1800, kodomoIncome:0.0027, kodomoMax:30000 },
  { name: "新宿区",   iryoKintou:47600, iryoIncome:0.0751, iryoMax:670000, shienKintou:17600, shienIncome:0.0280, shienMax:260000, kaigoKintou:17800, kaigoIncome:0.0243, kaigoMax:170000, kodomoKintou18:1800, kodomoIncome:0.0027, kodomoMax:30000 },
  { name: "文京区",   iryoKintou:47600, iryoIncome:0.0751, iryoMax:670000, shienKintou:17600, shienIncome:0.0280, shienMax:260000, kaigoKintou:17800, kaigoIncome:0.0243, kaigoMax:170000, kodomoKintou18:1800, kodomoIncome:0.0027, kodomoMax:30000 },
  { name: "台東区",   iryoKintou:47600, iryoIncome:0.0751, iryoMax:670000, shienKintou:17600, shienIncome:0.0280, shienMax:260000, kaigoKintou:17800, kaigoIncome:0.0243, kaigoMax:170000, kodomoKintou18:1800, kodomoIncome:0.0027, kodomoMax:30000 },
  { name: "墨田区",   iryoKintou:47600, iryoIncome:0.0751, iryoMax:670000, shienKintou:17600, shienIncome:0.0280, shienMax:260000, kaigoKintou:17800, kaigoIncome:0.0243, kaigoMax:170000, kodomoKintou18:1800, kodomoIncome:0.0027, kodomoMax:30000 },
  { name: "江東区",   iryoKintou:47600, iryoIncome:0.0751, iryoMax:670000, shienKintou:17600, shienIncome:0.0280, shienMax:260000, kaigoKintou:17800, kaigoIncome:0.0243, kaigoMax:170000, kodomoKintou18:1800, kodomoIncome:0.0027, kodomoMax:30000 },
  { name: "品川区",   iryoKintou:47600, iryoIncome:0.0751, iryoMax:670000, shienKintou:17600, shienIncome:0.0280, shienMax:260000, kaigoKintou:17800, kaigoIncome:0.0243, kaigoMax:170000, kodomoKintou18:1800, kodomoIncome:0.0027, kodomoMax:30000 },
  { name: "目黒区",   iryoKintou:47600, iryoIncome:0.0751, iryoMax:670000, shienKintou:17600, shienIncome:0.0280, shienMax:260000, kaigoKintou:17800, kaigoIncome:0.0235, kaigoMax:170000, kodomoKintou18:1800, kodomoIncome:0.0027, kodomoMax:30000 },
  { name: "大田区",   iryoKintou:47600, iryoIncome:0.0751, iryoMax:670000, shienKintou:17600, shienIncome:0.0280, shienMax:260000, kaigoKintou:17800, kaigoIncome:0.0243, kaigoMax:170000, kodomoKintou18:1800, kodomoIncome:0.0027, kodomoMax:30000 },
  { name: "世田谷区", iryoKintou:47600, iryoIncome:0.0751, iryoMax:670000, shienKintou:17600, shienIncome:0.0280, shienMax:260000, kaigoKintou:17800, kaigoIncome:0.0243, kaigoMax:170000, kodomoKintou18:1800, kodomoIncome:0.0027, kodomoMax:30000 },
  { name: "渋谷区",   iryoKintou:47600, iryoIncome:0.0751, iryoMax:670000, shienKintou:17600, shienIncome:0.0280, shienMax:260000, kaigoKintou:17800, kaigoIncome:0.0243, kaigoMax:170000, kodomoKintou18:1800, kodomoIncome:0.0027, kodomoMax:30000 },
  { name: "中野区",   iryoKintou:47100, iryoIncome:0.0803, iryoMax:670000, shienKintou:17400, shienIncome:0.0294, shienMax:260000, kaigoKintou:17700, kaigoIncome:0.0253, kaigoMax:170000, kodomoKintou18:1800, kodomoIncome:0.0027, kodomoMax:30000 },
  { name: "杉並区",   iryoKintou:47600, iryoIncome:0.0751, iryoMax:670000, shienKintou:17600, shienIncome:0.0280, shienMax:260000, kaigoKintou:17800, kaigoIncome:0.0243, kaigoMax:170000, kodomoKintou18:1800, kodomoIncome:0.0027, kodomoMax:30000 },
  { name: "豊島区",   iryoKintou:47600, iryoIncome:0.0751, iryoMax:670000, shienKintou:17600, shienIncome:0.0280, shienMax:260000, kaigoKintou:17800, kaigoIncome:0.0243, kaigoMax:170000, kodomoKintou18:1800, kodomoIncome:0.0027, kodomoMax:30000 },
  { name: "北区",     iryoKintou:47600, iryoIncome:0.0751, iryoMax:670000, shienKintou:17600, shienIncome:0.0280, shienMax:260000, kaigoKintou:17800, kaigoIncome:0.0243, kaigoMax:170000, kodomoKintou18:1800, kodomoIncome:0.0027, kodomoMax:30000 },
  { name: "荒川区",   iryoKintou:47600, iryoIncome:0.0751, iryoMax:670000, shienKintou:17600, shienIncome:0.0280, shienMax:260000, kaigoKintou:17800, kaigoIncome:0.0243, kaigoMax:170000, kodomoKintou18:1800, kodomoIncome:0.0027, kodomoMax:30000 },
  { name: "板橋区",   iryoKintou:47600, iryoIncome:0.0751, iryoMax:670000, shienKintou:17600, shienIncome:0.0280, shienMax:260000, kaigoKintou:17800, kaigoIncome:0.0243, kaigoMax:170000, kodomoKintou18:1800, kodomoIncome:0.0027, kodomoMax:30000 },
  { name: "練馬区",   iryoKintou:47600, iryoIncome:0.0751, iryoMax:670000, shienKintou:17600, shienIncome:0.0280, shienMax:260000, kaigoKintou:17800, kaigoIncome:0.0243, kaigoMax:170000, kodomoKintou18:1800, kodomoIncome:0.0027, kodomoMax:30000 },
  { name: "足立区",   iryoKintou:47600, iryoIncome:0.0751, iryoMax:670000, shienKintou:17600, shienIncome:0.0280, shienMax:260000, kaigoKintou:17800, kaigoIncome:0.0243, kaigoMax:170000, kodomoKintou18:1800, kodomoIncome:0.0027, kodomoMax:30000 },
  { name: "葛飾区",   iryoKintou:47600, iryoIncome:0.0751, iryoMax:670000, shienKintou:17600, shienIncome:0.0280, shienMax:260000, kaigoKintou:17800, kaigoIncome:0.0243, kaigoMax:170000, kodomoKintou18:1800, kodomoIncome:0.0027, kodomoMax:30000 },
  { name: "江戸川区", iryoKintou:48900, iryoIncome:0.0783, iryoMax:670000, shienKintou:17400, shienIncome:0.0284, shienMax:260000, kaigoKintou:17400, kaigoIncome:0.0245, kaigoMax:170000, kodomoKintou18:1780, kodomoIncome:0.0027, kodomoMax:30000 },
];

// ── 計算ロジック ─────────────────────────────

interface TokyoKokuhoInputs {
  ward: string;          // 区
  incomeType: "employee" | "freelance";
  annualIncome: number;  // 年収（会社員）万円
  businessIncome: number;// 事業所得（個人事業主）万円
  age: number;
  members: number;       // 世帯の国保加入人数
}

interface TokyoKokuhoResult {
  shotokuBase: number;   // 所得割計算基準（円）
  kintoLabel: string;
  iryoYen: number;
  shienYen: number;
  kaigoYen: number;
  kodomoYen: number;
  totalYen: number;
  monthlyYen: number;
  isOver: boolean;       // 限度額到達
}

// 給与所得控除
function kyuyoDeduction(income: number): number {
  if (income <= 162.5) return 55;
  if (income <= 180) return income * 0.4 - 10;
  if (income <= 360) return income * 0.3 + 8;
  if (income <= 660) return income * 0.2 + 44;
  if (income <= 850) return income * 0.1 + 110;
  return 195;
}

function calcTokyoKokuho(inp: TokyoKokuhoInputs): TokyoKokuhoResult {
  const ward = WARDS.find(w => w.name === inp.ward) ?? WARDS[0];
  const m = Math.max(1, inp.members);

  // 所得の計算（旧ただし書き方式：総所得-43万円）
  let totalIncomeMan: number;
  if (inp.incomeType === "employee") {
    const deduction = kyuyoDeduction(inp.annualIncome);
    totalIncomeMan = Math.max(0, inp.annualIncome - deduction);
  } else {
    totalIncomeMan = Math.max(0, inp.businessIncome);
  }
  const totalIncomeYen = totalIncomeMan * 10000;
  const shotokuBaseYen = Math.max(0, totalIncomeYen - 430_000);

  // 軽減判定
  const kigen7 = 430_000;
  const kigen5 = 430_000 + 290_000 * m;
  const kigen2 = 430_000 + 535_000 * m;
  let kintoRate: number;
  let kintoLabel: string;
  if (totalIncomeYen <= kigen7) { kintoRate = 0.3; kintoLabel = "7割軽減"; }
  else if (totalIncomeYen <= kigen5) { kintoRate = 0.5; kintoLabel = "5割軽減"; }
  else if (totalIncomeYen <= kigen2) { kintoRate = 0.8; kintoLabel = "2割軽減"; }
  else { kintoRate = 1.0; kintoLabel = "軽減なし"; }

  // 基礎賦課分（医療分）
  const iryoRaw = shotokuBaseYen * ward.iryoIncome + ward.iryoKintou * m * kintoRate;
  const iryoYen = Math.round(Math.min(iryoRaw, ward.iryoMax));

  // 後期高齢者支援金分
  const shienRaw = shotokuBaseYen * ward.shienIncome + ward.shienKintou * m * kintoRate;
  const shienYen = Math.round(Math.min(shienRaw, ward.shienMax));

  // 介護納付金分（40〜64歳のみ）
  let kaigoYen = 0;
  if (inp.age >= 40 && inp.age <= 64) {
    const kaigoRaw = shotokuBaseYen * ward.kaigoIncome + ward.kaigoKintou * m * kintoRate;
    kaigoYen = Math.round(Math.min(kaigoRaw, ward.kaigoMax));
  }

  // 子ども・子育て支援納付金分（2026年度新設・18歳以上）
  const kodomoRaw = inp.age >= 18
    ? shotokuBaseYen * ward.kodomoIncome + ward.kodomoKintou18 * m * kintoRate
    : 0;
  const kodomoYen = Math.round(Math.min(kodomoRaw, ward.kodomoMax));

  const totalYen = iryoYen + shienYen + kaigoYen + kodomoYen;
  const maxTotal = ward.iryoMax + ward.shienMax + (inp.age >= 40 && inp.age <= 64 ? ward.kaigoMax : 0) + ward.kodomoMax;

  return {
    shotokuBase: Math.round(shotokuBaseYen / 10000 * 10) / 10,
    kintoLabel,
    iryoYen,
    shienYen,
    kaigoYen,
    kodomoYen,
    totalYen,
    monthlyYen: Math.round(totalYen / 12),
    isOver: totalYen >= maxTotal * 0.98,
  };
}

// ── 年収別試算テーブル ────────────────────────

const INCOME_EXAMPLES = [300, 400, 500, 600, 700];

function calcExamples(ward: Ward, age: number) {
  return INCOME_EXAMPLES.map(inc => {
    const deduction = kyuyoDeduction(inc);
    const soIncome = Math.max(0, inc - deduction);
    const base = Math.max(0, soIncome * 10000 - 430_000);
    const iryo = Math.min(base * ward.iryoIncome + ward.iryoKintou, ward.iryoMax);
    const shien = Math.min(base * ward.shienIncome + ward.shienKintou, ward.shienMax);
    const kaigo = age >= 40 && age <= 64
      ? Math.min(base * ward.kaigoIncome + ward.kaigoKintou, ward.kaigoMax) : 0;
    const kodomo = Math.min(base * ward.kodomoIncome + ward.kodomoKintou18, ward.kodomoMax);
    return { income: inc, total: Math.round((iryo + shien + kaigo + kodomo) / 10000 * 10) / 10 };
  });
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
  { q: "年収500万円なら東京23区の国保はいくら？", a: "年収500万円の給与所得者（35歳・単身）の場合、給与所得控除後の所得は約346万円、所得割計算基準は約303万円となり、年間保険料の目安は約36万円前後です（2026年度・軽減なし）。ただし年齢・世帯人数・区によって異なります。" },
  { q: "個人事業主の国保はいくら？", a: "個人事業主の場合、売上ではなく「事業所得（売上−経費）」が計算の基準です。青色申告特別控除（最大65万円）を差し引いた後の所得に料率をかけます。同じ年収でも経費・青色申告の有無で大きく変わります。" },
  { q: "国保は前年の所得で決まる？", a: "はい。毎年6〜7月に前年の所得をもとに保険料が決定されます。前年の所得が高ければ今年の保険料も高くなります。" },
  { q: "東京23区ならどこでも同じ？", a: "ほぼ同じですが完全に同一ではありません。2026年度は中野区・江戸川区の一部料率が他の21区と異なります。このシミュレーターでは区を選択できます。" },
  { q: "国保は月払い？", a: "多くの区では年間保険料を6月〜翌年3月の10回（または7〜3月の9回）に分けて納付します。口座振替・納付書・コンビニなどで支払えます。" },
  { q: "会社を辞めたら国保はいくら？", a: "退職後は前年の所得をもとに計算されます。在職中の年収が高かった場合、退職後も高い保険料が続く場合があります。前年所得が少なければ軽減制度（7割・5割・2割軽減）が適用される場合もあります。" },
  { q: "国保と任意継続はどちらが安い？", a: "条件によって異なります。任意継続は退職時の標準報酬月額をもとに計算され、保険料の上限があります。前年の所得が高い場合は任意継続が安くなる場合があり、低い場合は国保の軽減制度が有利になることもあります。必ず両方を試算して比較してください。" },
] as const;

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 dark:border-gray-800 last:border-0" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
      <button onClick={() => setOpen(!open)} className="w-full text-left py-3 flex justify-between items-center gap-2">
        <span className="text-sm font-medium text-gray-800 dark:text-gray-200" itemProp="name">{q}</span>
        <span className="text-gray-400 text-lg flex-shrink-0">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed pb-3" itemProp="text">{a}</p>
        </div>
      )}
    </div>
  );
}

// ── メインコンポーネント ──────────────────────

export default function TokyoKokuho() {
  const [inp, setInp] = useState<TokyoKokuhoInputs>({
    ward: "新宿区",
    incomeType: "employee",
    annualIncome: 500,
    businessIncome: 400,
    age: 35,
    members: 1,
  });

  const set = <K extends keyof TokyoKokuhoInputs>(key: K, val: TokyoKokuhoInputs[K]) =>
    setInp(prev => ({ ...prev, [key]: val }));

  const result = useMemo(() => calcTokyoKokuho(inp), [inp]);
  const selectedWard = WARDS.find(w => w.name === inp.ward) ?? WARDS[3];
  const examples = useMemo(() => calcExamples(selectedWard, inp.age), [selectedWard, inp.age]);

  const fmtYen = (n: number) => `${Math.round(n).toLocaleString()}円`;
  const fmtMan = (n: number) => `${n.toLocaleString()}万円`;

  // FAQ・構造化データ
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQ_LIST.map(f => ({
      "@type": "Question",
      "name": f.q,
      "acceptedAnswer": { "@type": "Answer", "text": f.a },
    })),
  };

  const webAppSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "東京都 国民健康保険料シミュレーター",
    "url": "https://r-tool-lab.jp/tokyo-kokuho",
    "description": "東京23区の2026年度国民健康保険料を区ごとに正確に計算できる無料シミュレーター",
    "applicationCategory": "FinanceApplication",
    "operatingSystem": "Web",
    "offers": { "@type": "Offer", "price": "0" },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "ホーム", "item": "https://r-tool-lab.jp/" },
      { "@type": "ListItem", "position": 2, "name": "国民健康保険シミュレーター", "item": "https://r-tool-lab.jp/kokuho" },
      { "@type": "ListItem", "position": 3, "name": "東京都の国民健康保険料を計算", "item": "https://r-tool-lab.jp/tokyo-kokuho" },
    ],
  };

  return (
    <>
      {/* 構造化データ */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <Layout title="東京都 国民健康保険料シミュレーター">
        <div className="space-y-10">

          {/* パンくず */}
          <nav className="text-xs text-gray-400" aria-label="パンくずリスト">
            <Link to="/" className="hover:text-brand-500">ホーム</Link>
            <span className="mx-1">›</span>
            <Link to="/kokuho" className="hover:text-brand-500">国保シミュレーター</Link>
            <span className="mx-1">›</span>
            <span className="text-gray-600 dark:text-gray-400">東京都</span>
          </nav>

          {/* ヘッダー */}
          <div>
            <h1 className="text-xl font-black text-gray-900 dark:text-white mb-2 leading-snug">
              東京都の国民健康保険料を計算<br />
              <span className="text-brand-500">2026年度シミュレーション</span>
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              区を選択して年収・所得を入力するだけで、2026年度（令和8年度）の国民健康保険料を概算できます。
              会社員・個人事業主・フリーランスに対応。
            </p>
            <p className="text-xs text-gray-400 mt-2">
              出典：東京都保健医療局「令和8年度 特別区国民健康保険料一覧表」（令和8年4月1日現在）
            </p>
          </div>

          {/* ── シミュレーター ── */}
          <section aria-labelledby="sim-title">
            <SectionTitle color="blue">
              <span id="sim-title">🏙️ 東京23区 国保料シミュレーター</span>
            </SectionTitle>
            <Card>
              {/* 区の選択 */}
              <div className="mb-5">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">区を選択</label>
                <select value={inp.ward} onChange={e => set("ward", e.target.value)}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                  {WARDS.map(w => <option key={w.name} value={w.name}>{w.name}</option>)}
                </select>
                {(inp.ward === "中野区" || inp.ward === "江戸川区") && (
                  <p className="text-xs text-amber-500 mt-1">⚠️ この区は一部料率が他の21区と異なります</p>
                )}
              </div>

              {/* 職業 */}
              <div className="mb-5">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">職業・所得の種類</p>
                <div className="flex gap-2">
                  <ToggleBtn active={inp.incomeType === "employee"} onClick={() => set("incomeType", "employee")}>🏢 会社員・給与所得</ToggleBtn>
                  <ToggleBtn active={inp.incomeType === "freelance"} onClick={() => set("incomeType", "freelance")}>💼 個人事業主・フリーランス</ToggleBtn>
                </div>
              </div>

              {inp.incomeType === "employee" ? (
                <SliderInput label="年収（額面）" value={inp.annualIncome} min={100} max={3000} step={10} unit="万円" onChange={v => set("annualIncome", v)} />
              ) : (
                <>
                  <SliderInput label="事業所得（売上−経費−青色控除後）" value={inp.businessIncome} min={0} max={3000} step={10} unit="万円" onChange={v => set("businessIncome", v)} />
                  <p className="text-xs text-gray-400 -mt-3 mb-5 px-1">確定申告書の「所得金額」欄の数値を入力してください</p>
                </>
              )}

              <SliderInput label="年齢" value={inp.age} min={20} max={74} step={1} unit="歳" onChange={v => set("age", v)} />

              <div className="mb-2">
                <label className="text-sm font-medium text-gray-600 dark:text-gray-400 block mb-2">世帯の国保加入人数</label>
                <select value={inp.members} onChange={e => set("members", Number(e.target.value))}
                  className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                  {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}人</option>)}
                </select>
              </div>
            </Card>

            {/* 結果 */}
            <div className="mt-4">
              {result.kintoLabel !== "軽減なし" && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-3 mb-3 text-center">
                  <p className="text-sm font-bold text-green-600 dark:text-green-400">🎉 {result.kintoLabel}が適用されています</p>
                </div>
              )}
              {result.isOver && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-3 mb-3 text-center">
                  <p className="text-sm font-bold text-amber-600 dark:text-amber-400">⚠️ 賦課限度額（上限）に達しています</p>
                </div>
              )}

              <div className="bg-gradient-to-r from-brand-500 to-orange-400 rounded-2xl p-5 text-center mb-3">
                <p className="text-white/80 text-xs font-medium mb-1">年間 国民健康保険料（概算）</p>
                <p className="text-white text-4xl font-black mb-1">{fmtYen(result.totalYen)}</p>
                <p className="text-white/70 text-xs">月額換算：約{fmtYen(result.monthlyYen)}</p>
              </div>

              <Card>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800 text-sm">
                  <span className="text-gray-500">所得割計算基準（所得−43万円）</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{fmtMan(result.shotokuBase)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800 text-sm">
                  <span className="text-gray-500">基礎賦課分（医療分）</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{fmtYen(result.iryoYen)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800 text-sm">
                  <span className="text-gray-500">後期高齢者支援金分</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{fmtYen(result.shienYen)}</span>
                </div>
                {inp.age >= 40 && inp.age <= 64 && (
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800 text-sm">
                    <span className="text-gray-500">介護納付金分（40〜64歳）</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{fmtYen(result.kaigoYen)}</span>
                  </div>
                )}
                {inp.age >= 18 && (
                  <div className="flex justify-between py-2 border-b border-gray-100 dark:border-gray-800 text-sm">
                    <span className="text-gray-500">子ども・子育て支援金分（2026年度新設）</span>
                    <span className="font-semibold text-gray-900 dark:text-white">{fmtYen(result.kodomoYen)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 text-sm">
                  <span className="font-bold text-gray-900 dark:text-white">年間合計</span>
                  <span className="font-black text-brand-500">{fmtYen(result.totalYen)}</span>
                </div>
              </Card>
              <p className="text-xs text-gray-400 mt-2 px-1">
                ※概算です。実際の保険料は区の窓口または通知書でご確認ください。
              </p>
            </div>
          </section>

          {/* ── 東京23区について ── */}
          <section aria-labelledby="about-23">
            <SectionTitle color="green">
              <span id="about-23">🏛️ 東京23区の国保について</span>
            </SectionTitle>
            <Card>
              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">東京23区は「統一保険料方式」を採用</h2>
                  <p>
                    東京23区は「統一保険料方式」を採用しており、ほとんどの区で同一の料率が適用されます。
                    ただし、2026年度は<strong>中野区・江戸川区</strong>の一部料率が他の21区と異なります。
                    また、「東京都」全体（26市町村を含む）では料率が異なるため、
                    23区以外の方は各市区町村にご確認ください。
                  </p>
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">2026年度の新設：子ども・子育て支援金</h2>
                  <p>
                    2026年度（令和8年度）から、国民健康保険に「子ども・子育て支援納付金賦課分」が新設されました。
                    18歳以上の加入者に均等割（1,800円）と所得割（0.27%）が加算されます。
                  </p>
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">計算方法（旧ただし書き方式）</h2>
                  <p>
                    東京23区は「旧ただし書き方式」を採用しています。
                    所得割の計算基準は「前年の総所得金額等 − 43万円（基礎控除）」です。
                    この金額に料率をかけた「所得割」と、加入者数×定額の「均等割」の合計が保険料となります（平等割なし）。
                  </p>
                </div>
              </div>
            </Card>
          </section>

          {/* ── 年収別シミュレーション例 ── */}
          <section aria-labelledby="examples-title">
            <SectionTitle color="orange">
              <span id="examples-title">📊 年収別 保険料の目安（{inp.ward}・{inp.age}歳・単身）</span>
            </SectionTitle>
            <Card>
              <p className="text-xs text-gray-400 mb-3">
                ※会社員（給与所得者）・軽減なし・{inp.age}歳の場合の概算。
                {inp.age >= 40 && inp.age <= 64 ? "介護分含む。" : "介護分なし。"}
                子ども・子育て支援金含む。
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-800">
                      <th className="text-left py-2 text-gray-500 font-medium">年収</th>
                      <th className="text-right py-2 text-gray-500 font-medium">年間保険料（目安）</th>
                      <th className="text-right py-2 text-gray-500 font-medium">月額換算</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examples.map(e => (
                      <tr key={e.income} className={`border-b border-gray-50 dark:border-gray-800/50 last:border-0 ${inp.incomeType === "employee" && inp.annualIncome === e.income ? "bg-brand-50 dark:bg-brand-900/10" : ""}`}>
                        <td className="py-2 font-medium text-gray-900 dark:text-white">{fmtMan(e.income)}</td>
                        <td className="py-2 text-right tabular-nums text-gray-900 dark:text-white">{fmtMan(e.total)}</td>
                        <td className="py-2 text-right tabular-nums text-gray-500">{fmtYen(Math.round(e.total * 10000 / 12))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400 mt-3">
                ※「年収」だけでは国保料を正確に計算できません。給与所得控除後の所得、世帯人数、年齢（介護分の有無）によって変わります。
              </p>
            </Card>
          </section>

          {/* ── 個人事業主向け ── */}
          <section aria-labelledby="freelance-title">
            <SectionTitle color="purple">
              <span id="freelance-title">💼 個人事業主・フリーランスの方へ</span>
            </SectionTitle>
            <Card>
              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">売上ではなく「事業所得」が基準</h2>
                  <p>国保料の計算に使われるのは売上ではなく、確定申告書の「所得金額」です。売上から経費を差し引いた金額が事業所得です。経費が多ければ所得が下がり、国保料も下がります。</p>
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">青色申告特別控除の効果</h2>
                  <p>青色申告をすると最大65万円の特別控除が受けられます。所得割の計算基準は「所得−43万円」なので、青色65万円控除後の所得がそのまま有利に働きます。青色申告は国保料を下げる有効な手段のひとつです。</p>
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">会社員からフリーランスになった場合</h2>
                  <p>退職した年の翌年から、前年のフリーランスとしての所得に基づいて国保料が計算されます。独立1年目は前職の給与所得が対象になるため、高い保険料になる場合があります。収入が大幅に下がった場合は「所得申告」や「減額申請」ができる区もあります。</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500">関連ツール：</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Link to="/income" className="text-xs text-brand-500 hover:underline">→ 手取りシミュレーター</Link>
                  <Link to="/micro-corp" className="text-xs text-brand-500 hover:underline">→ マイクロ法人 損得シミュレーター</Link>
                  <Link to="/kokuho" className="text-xs text-brand-500 hover:underline">→ 全国 国保シミュレーター</Link>
                </div>
              </div>
            </Card>
          </section>

          {/* ── 保険料が高い理由 ── */}
          <section aria-labelledby="why-high">
            <SectionTitle color="blue">
              <span id="why-high">❓ なぜ国保料はこんなに高いの？</span>
            </SectionTitle>
            <Card>
              <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">会社員との大きな違い</h2>
                  <p>会社員の健康保険料は会社と折半します。フリーランス・個人事業主の国保は全額自己負担です。また、会社員には「扶養」制度があり、被扶養者は保険料なしで加入できますが、国保にはその仕組みがなく、世帯員全員に均等割がかかります。</p>
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">所得割と均等割の仕組み</h2>
                  <p>国保料は「所得割（所得に比例）＋均等割（1人あたり定額）」で構成されます。東京23区の場合、1人あたり年間約4.8万円の均等割が必ずかかります。世帯人数が増えると均等割も増えます。</p>
                </div>
                <div>
                  <h2 className="text-base font-bold text-gray-900 dark:text-white mb-2">国保料を下げるには</h2>
                  <p>①青色申告で所得を減らす、②iDeCoや小規模企業共済で所得控除を増やす、③マイクロ法人を設立して協会けんぽに切り替える、などの方法があります。</p>
                </div>
              </div>
            </Card>
          </section>

          {/* ── FAQ ── */}
          <section aria-labelledby="faq-title" itemScope itemType="https://schema.org/FAQPage">
            <SectionTitle color="purple">
              <span id="faq-title">💬 よくある質問</span>
            </SectionTitle>
            <Card>
              {FAQ_LIST.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
            </Card>
          </section>

          {/* 関連ページ */}
          <section>
            <SectionTitle color="green">🔗 関連シミュレーター</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              {[
                { to: "/kokuho", icon: "💴", title: "全国 国保シミュレーター", desc: "全国主要都市の国保を計算" },
                { to: "/income", icon: "💰", title: "手取りシミュレーター", desc: "国保含む手取りを総合計算" },
                { to: "/micro-corp", icon: "🏢", title: "マイクロ法人シミュレーター", desc: "国保を劇的に下げる方法" },
                { to: "/ideco", icon: "📈", title: "iDeCoシミュレーター", desc: "節税で国保も下がる" },
              ].map(item => (
                <Link key={item.to} to={item.to}
                  className="flex flex-col gap-2 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-gray-700/60 shadow-sm active:opacity-70">
                  <span className="text-2xl">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">{item.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <p className="text-center text-xs text-gray-400 dark:text-gray-600 pb-4">
            出典：東京都保健医療局「令和8年度 特別区国民健康保険料一覧表」（令和8年4月1日現在）<br />
            ※料率は制度改正により変更される場合があります。正確な金額は区の窓口でご確認ください。
          </p>
        </div>
      </Layout>
    </>
  );
}
