// ============================================
// 広告スロットコンポーネント
// 広告コードを後から簡単に追加できる設計
//
// 使い方:
//   <AdSlot slot="result" context="nisa" />  ← NISA結果の下
//   <AdSlot slot="result" context="income" /> ← 手取り結果の下
//   <AdSlot slot="result" context="micro" />  ← マイクロ法人結果の下
//   <AdSlot slot="faq" />
//   <AdSlot slot="footer" />
// ============================================

import type { AdSlotType } from "@/types";

// ── アフィリエイトリンク定義 ───────────────────

interface AdItem {
  id: string;
  href: string;
  label: string;
  description: string;
  subtext: string;
  icon: string;
  color: "blue" | "green" | "purple" | "orange";
  // どのコンテキストで表示するか（未指定は全ページ）
  contexts?: Array<"nisa" | "income" | "micro" | "all">;
  // トラッキングピクセル
  pixelSrc?: string;
}

const ADS: AdItem[] = [
  // ── NISA・株式系 ──────────────────────────
  {
    id: "matui-ideco",
    href: "https://px.a8.net/svt/ejp?a8mat=4B7QWW+9IYGI+3XCC+BXIYQ",
    label: "松井証券ではじめるiDeCo",
    description: "iDeCo・節税",
    subtext: "老後資金を積立しながら節税。口座開設無料 →",
    icon: "📈",
    color: "blue",
    contexts: ["income", "micro"],
    pixelSrc: "https://www15.a8.net/0.gif?a8mat=4B7QWW+9IYGI+3XCC+BXIYQ",
  },
  {
    id: "matui-stock",
    href: "https://px.a8.net/svt/ejp?a8mat=4B7QWW+8XIUQ+3XCC+6HMHT",
    label: "松井証券で株式・投資信託をはじめる",
    description: "株式・投資信託・NISA",
    subtext: "豊富な投資サービスを取り扱う老舗ネット証券 →",
    icon: "📊",
    color: "blue",
    contexts: ["nisa"],
    pixelSrc: "https://www13.a8.net/0.gif?a8mat=4B7QWW+8XIUQ+3XCC+6HMHT",
  },
  {
    id: "dmm-stock",
    href: "https://px.a8.net/svt/ejp?a8mat=4B650H+AO0LYQ+1WP2+15ORS2",
    label: "DMM株ではじめる！株式取引",
    description: "株式取引・NISA",
    subtext: "口座開設無料・手数料業界最安水準 →",
    icon: "💹",
    color: "green",
    contexts: ["nisa"],
    pixelSrc: "https://www17.a8.net/0.gif?a8mat=4B650H+AO0LYQ+1WP2+15ORS2",
  },
  {
    id: "retry-loan",
    href: "https://px.a8.net/svt/ejp?a8mat=4B650G+DTQEIA+56AO+NTJWY",
    label: "住宅ローン返済にお困りなら【リトライ】",
    description: "住宅ローン 返済・借り換え",
    subtext: "返済が苦しい方へ。専門家に無料相談 →",
    icon: "🏠",
    color: "blue",
    contexts: ["nisa"],
    pixelSrc: undefined,
  },
  {
    id: "sumai-iroha",
    href: "https://px.a8.net/svt/ejp?a8mat=4B7QWW+1SW9PU+5V18+5YJRM",
    label: "すまいのいろはPlus｜家探し・家づくり",
    description: "住まい探し・家づくり",
    subtext: "マイホームを検討中の方へ。情報収集はここから →",
    icon: "🏡",
    color: "green",
    contexts: ["nisa"],
    pixelSrc: undefined,
  },
  {
    id: "alterna",
    href: "https://px.a8.net/svt/ejp?a8mat=4B7QWW+EVUWI+5PYG+5YJRM",
    label: "ALTERNA（オルタナ）｜デジタル証券で資産運用",
    description: "資産運用・デジタル証券",
    subtext: "三井物産グループ。少額から始める新しい資産運用 →",
    icon: "💎",
    color: "purple",
    contexts: ["nisa"],
    pixelSrc: undefined,
  },
  // ── 保険・FP相談系 ─────────────────────────
  {
    id: "hoken-fp",
    href: "https://px.a8.net/svt/ejp?a8mat=4B7QWW+19UECY+20NK+656YQ",
    label: "無料FP相談｜みんなの生命保険アドバイザー",
    description: "無料保険・FP相談",
    subtext: "全国対応・在籍FP3000名以上。何度でも無料 →",
    icon: "💬",
    color: "purple",
    contexts: ["income", "micro", "nisa"],
    pixelSrc: "https://www12.a8.net/0.gif?a8mat=4B7QWW+19UECY+20NK+656YQ",
  },
  {
    id: "fp-cafe",
    href: "https://px.a8.net/svt/ejp?a8mat=4B7QWW+198YR6+5ULO+5Z6WX",
    label: "FPカフェ｜無料で資産形成・保険相談",
    description: "無料FP相談",
    subtext: "資産形成や保険について気軽に相談 →",
    icon: "☕",
    color: "orange",
    contexts: ["income", "micro"],
    pixelSrc: "https://www19.a8.net/0.gif?a8mat=4B7QWW+198YR6+5ULO+5Z6WX",
  },
  {
    id: "oh-ya",
    href: "https://px.a8.net/svt/ejp?a8mat=4B7QWW+JNBQQ+53AC+601S1",
    label: "不動産投資一括面談【Oh!Ya】",
    description: "不動産投資",
    subtext: "資産形成に不動産投資を。60秒で簡単相談 →",
    icon: "🏢",
    color: "blue",
    contexts: ["nisa", "micro"],
    pixelSrc: "https://www12.a8.net/0.gif?a8mat=4B7QWW+JNBQQ+53AC+601S1",
  },
];

// ── カラーマップ ──────────────────────────────

const colorMap = {
  blue:   { text: "text-blue-500",   bg: "bg-blue-500" },
  green:  { text: "text-green-500",  bg: "bg-green-500" },
  purple: { text: "text-purple-500", bg: "bg-purple-500" },
  orange: { text: "text-brand-500",  bg: "bg-brand-500" },
};

// ── コンテキスト型 ────────────────────────────

type AdContext = "nisa" | "income" | "micro" | "all";

interface AdSlotProps {
  slot: AdSlotType;
  context?: AdContext;
}

// ── メインコンポーネント ──────────────────────

export default function AdSlot({ slot: _slot, context = "all" }: AdSlotProps) {
  // コンテキストに合う広告を絞り込み
  const filtered = ADS.filter(ad =>
    !ad.contexts || ad.contexts.includes(context) || ad.contexts.includes("all")
  );

  if (filtered.length === 0) return null;

  return (
    <section aria-label="おすすめサービス">
      <div className="flex items-center gap-3 mb-4 px-1">
        <div className="w-1 h-5 rounded-full bg-brand-500" />
        <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 tracking-tight">
          ✨ あなたにおすすめ
        </h2>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
      </div>

      <div className="space-y-3">
        {filtered.map(ad => (
          <div key={ad.id}>
            <a
              href={ad.href}
              target="_blank"
              rel="nofollow noopener noreferrer"
              aria-label={ad.label}
              className="flex items-center gap-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-gray-700/60 shadow-sm p-4 active:opacity-70 transition-opacity"
            >
              <div className={`w-12 h-12 rounded-xl ${colorMap[ad.color].bg} flex items-center justify-center text-2xl flex-shrink-0`}>
                {ad.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs ${colorMap[ad.color].text} font-semibold mb-0.5`}>
                  {ad.description}
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">
                  {ad.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{ad.subtext}</p>
              </div>
              <span className="text-gray-300 dark:text-gray-600 text-lg flex-shrink-0">›</span>
            </a>
            {/* トラッキングピクセル（A8.netの成果計測用） */}
            {ad.pixelSrc && (
              <img width={1} height={1} src={ad.pixelSrc} alt="" className="border-0" />
            )}
          </div>
        ))}
      </div>

      <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-3">
        ※ 広告・PR を含みます
      </p>
    </section>
  );
}