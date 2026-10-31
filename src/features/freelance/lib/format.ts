// ============================================
// 比較表・カード共通の表示用データ整形
// 値が確認できない項目は「未確認」と表示します。
// ============================================

import type { Agent, LangKey, RegionKey, Tri } from "../types";

export type Tone = "ok" | "partial" | "ng" | "unknown" | "neutral";
export interface Cell {
  main: string;
  sub?: string;
  tone: Tone;
}

export const LANG_LABELS: Record<LangKey, string> = {
  java: "Java",
  csharp: "C#",
  php: "PHP",
  python: "Python",
  javascript: "JavaScript",
};

export const REGION_LABELS: Record<RegionKey, string> = {
  kanto: "首都圏（関東）",
  tokai: "東海（愛知など）",
  kansai: "関西",
  kyushu: "九州（福岡など）",
  tohoku_hokkaido: "北海道・東北",
  chugoku_shikoku: "中国・四国",
};

const UNKNOWN: Cell = { main: "未確認", tone: "unknown" };

function triCell(t: Tri, note?: string): Cell {
  switch (t) {
    case "yes":
      return { main: "あり", tone: "ok", sub: note };
    case "limited":
      return { main: "限定的", tone: "partial", sub: note };
    case "no":
      return { main: "なし", tone: "ng", sub: note };
    default:
      return { main: "未確認", tone: "unknown", sub: note };
  }
}

export interface CompareRow {
  key: string;
  label: string;
  cell: (a: Agent) => Cell;
}

export const COMPARE_ROWS: CompareRow[] = [
  {
    key: "languages",
    label: "対応言語（確認できたもの）",
    cell: (a) =>
      a.languages.value.length === 0
        ? UNKNOWN
        : {
            main: a.languages.value.map((l) => LANG_LABELS[l]).join("・"),
            sub: "ここに無い言語は「なし」ではなく未確認です",
            tone: "neutral",
          },
  },
  {
    key: "java",
    label: "Java案件の取り扱い",
    cell: (a) => {
      if (!a.languages.value.includes("java")) return UNKNOWN;
      const sub = a.javaJobCount
        ? `Java案件 ${a.javaJobCount.count.toLocaleString()}件（${a.javaJobCount.asOf}時点）`
        : a.languages.note;
      return { main: "あり", tone: "ok", sub };
    },
  },
  {
    key: "jobCount",
    label: "案件数（公開）",
    cell: (a) =>
      a.jobCount.value == null
        ? UNKNOWN
        : {
            main: `${a.jobCount.value.toLocaleString()}件`,
            sub: `${a.jobCount.asOf ?? "時点不明"}時点・第三者メディア調べ`,
            tone: "neutral",
          },
  },
  { key: "fullRemote", label: "フルリモート案件", cell: (a) => triCell(a.fullRemote.value, a.fullRemote.note) },
  {
    key: "remoteConsult",
    label: "リモート相談可能案件",
    cell: (a) => triCell(a.remoteConsult.value, a.remoteConsult.note),
  },
  {
    key: "experience",
    label: "実務経験年数の条件",
    cell: (a) =>
      a.minExperienceYears.value == null
        ? UNKNOWN
        : { main: `${a.minExperienceYears.value}年以上が目安`, sub: a.minExperienceYears.note, tone: "neutral" },
  },
  { key: "weekly3", label: "週3日以下の案件", cell: (a) => triCell(a.weekly3OrLess.value, a.weekly3OrLess.note) },
  {
    key: "payment",
    label: "支払いサイト",
    cell: (a) =>
      a.paymentSite.value == null
        ? { main: "未確認", sub: a.paymentSite.note, tone: "unknown" }
        : { main: a.paymentSite.value, sub: a.paymentSite.note, tone: "neutral" },
  },
  {
    key: "benefits",
    label: "福利厚生",
    cell: (a) => (a.benefits.value == null ? UNKNOWN : { main: a.benefits.value, sub: a.benefits.note, tone: "neutral" }),
  },
  {
    key: "regions",
    label: "対応地域",
    cell: (a) => (a.regions.value == null ? UNKNOWN : { main: a.regions.value.label, tone: "neutral" }),
  },
];

/** エージェントが使っている出典を重複なしで集める */
export function collectSources(a: Agent) {
  const all = [
    ...a.languages.sources,
    ...(a.javaJobCount ? [a.javaJobCount.source] : []),
    ...a.jobCount.sources,
    ...a.fullRemote.sources,
    ...a.remoteConsult.sources,
    ...a.minExperienceYears.sources,
    ...a.weekly3OrLess.sources,
    ...a.paymentSite.sources,
    ...a.benefits.sources,
    ...a.regions.sources,
  ];
  const seen = new Set<string>();
  return all.filter((s) => (seen.has(s.url) ? false : (seen.add(s.url), true)));
}

export const TONE_CLASS: Record<Tone, string> = {
  ok: "text-emerald-700 dark:text-emerald-400 font-semibold",
  partial: "text-amber-700 dark:text-amber-400 font-semibold",
  ng: "text-red-600 dark:text-red-400 font-semibold",
  unknown: "text-slate-400 dark:text-slate-500",
  neutral: "text-slate-800 dark:text-slate-100",
};
