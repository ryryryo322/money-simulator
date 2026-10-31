// ============================================
// 比較表・カード共通の表示用データ整形
// 値が確認できない項目は「未確認」と表示します。
// 出典が第三者メディアのみの項目には「公式未確認」と表示します。
// ============================================

import type { Agent, LangKey, RegionKey, Source, Tri } from "../types";

export type Tone = "ok" | "ng" | "unknown" | "neutral";
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
const THIRD_ONLY = "第三者情報・公式未確認";

/** 出典がすべて第三者メディア（または出典なし）か */
export function isThirdPartyOnly(sources: Source[]): boolean {
  return sources.length === 0 || sources.every((s) => s.kind === "third_party");
}

function join(...parts: (string | undefined | false)[]): string | undefined {
  const text = parts.filter(Boolean).join(" ");
  return text === "" ? undefined : text;
}

function triCell(t: Tri, note: string | undefined, sources: Source[]): Cell {
  const suffix = t !== "unknown" && isThirdPartyOnly(sources) ? `（${THIRD_ONLY}）` : undefined;
  switch (t) {
    case "yes":
      return { main: "あり", tone: "ok", sub: join(note, suffix) };
    case "limited":
      return { main: "限定的", tone: "neutral", sub: join(note, suffix) };
    case "no":
      return { main: "なし", tone: "ng", sub: join(note, suffix) };
    default:
      return { main: "未確認", tone: "unknown", sub: note };
  }
}

function langList(langs: LangKey[]): string {
  return langs.map((l) => LANG_LABELS[l]).join("・");
}

export interface CompareRow {
  key: string;
  label: string;
  cell: (a: Agent) => Cell;
}

export const COMPARE_ROWS: CompareRow[] = [
  {
    key: "languages",
    label: "対応言語（公式サイト等で取扱いを確認した言語）",
    cell: (a) =>
      a.languages.value.length === 0
        ? UNKNOWN
        : {
            main: langList(a.languages.value),
            sub: join("掲載のない言語は「未確認」で、非対応の意味ではありません。", a.languages.note),
            tone: "neutral",
          },
  },
  {
    key: "java",
    label: "Java案件の取り扱い",
    cell: (a) => {
      if (!a.languages.value.includes("java")) return UNKNOWN;
      const count = a.javaInfo
        ? `${a.javaInfo.label}：${a.javaInfo.count.toLocaleString()}件（${a.javaInfo.asOf}時点${a.javaInfo.official ? "・公式" : "・第三者調査"}）`
        : "案件の有無は確認済み。案件数は未確認です。";
      return { main: "あり", tone: "ok", sub: count };
    },
  },
  {
    key: "jobCount",
    label: "公開案件数",
    cell: (a) => {
      const { official, thirdParty, note } = a.jobCount;
      if (!official && !thirdParty) return UNKNOWN;
      const third = thirdParty
        ? `第三者調査：${thirdParty.value.toLocaleString()}件（${thirdParty.asOf}時点）`
        : undefined;
      if (official) {
        return {
          main: `${official.text}（公式表記）`,
          sub: join(third, "集計範囲が異なる場合があります。", note),
          tone: "neutral",
        };
      }
      return {
        main: "公式の総数は未確認",
        sub: join(third, "公式サイトの案件数とは限りません。", note),
        tone: "unknown",
      };
    },
  },
  {
    key: "fullRemote",
    label: "フルリモート案件（出社不要が原則）",
    cell: (a) => {
      const c = triCell(a.fullRemote.value, a.fullRemote.note, a.fullRemote.sources);
      const langs = a.fullRemoteLanguages.value;
      if (a.fullRemote.value === "yes" && langs.length > 0) {
        c.sub = join(c.sub, `フルリモートを確認した言語：${langList(langs)}`);
      }
      return c;
    },
  },
  {
    key: "remoteConsult",
    label: "リモート相談可能な案件（一部出社を含む）",
    cell: (a) => triCell(a.remoteConsult.value, a.remoteConsult.note, a.remoteConsult.sources),
  },
  {
    key: "experience",
    label: "実務経験年数の条件",
    cell: (a) => ({
      main: "案件により異なる",
      sub: join(
        a.experience.agencyCondition
          ? `登録条件：${a.experience.agencyCondition}`
          : "各社共通の登録条件としての年数は、公式で確認できていません。",
        a.experience.caseExample?.text
      ),
      tone: "neutral",
    }),
  },
  {
    key: "weekly3",
    label: "週3日以下の案件",
    cell: (a) => triCell(a.weekly3OrLess.value, a.weekly3OrLess.note, a.weekly3OrLess.sources),
  },
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
    cell: (a) =>
      a.benefits.value == null
        ? { main: "未確認", sub: a.benefits.note, tone: "unknown" }
        : { main: a.benefits.value, sub: a.benefits.note, tone: "neutral" },
  },
  {
    key: "regions",
    label: "案件の所在地（確認できた地域）",
    cell: (a) =>
      a.regions.value == null
        ? UNKNOWN
        : { main: a.regions.value.label, sub: "一覧は網羅的ではありません。ここに無い地域は「未確認」です。", tone: "neutral" },
  },
];

/** エージェントが使っている出典を重複なしで集める（公式を先に並べる） */
export function collectSources(a: Agent): Source[] {
  const all: Source[] = [
    ...a.languages.sources,
    ...(a.javaInfo ? [a.javaInfo.source] : []),
    ...(a.jobCount.official ? [a.jobCount.official.source] : []),
    ...(a.jobCount.thirdParty ? [a.jobCount.thirdParty.source] : []),
    ...a.fullRemote.sources,
    ...a.fullRemoteLanguages.sources,
    ...a.remoteConsult.sources,
    ...(a.experience.caseExample ? [a.experience.caseExample.source] : []),
    ...a.weekly3OrLess.sources,
    ...a.paymentSite.sources,
    ...a.benefits.sources,
    ...a.regions.sources,
  ];
  const seen = new Set<string>();
  const unique = all.filter((s) => (seen.has(s.url) ? false : (seen.add(s.url), true)));
  return [...unique.filter((s) => s.kind === "official"), ...unique.filter((s) => s.kind !== "official")];
}

export const TONE_CLASS: Record<Tone, string> = {
  ok: "text-emerald-700 dark:text-emerald-400 font-semibold",
  ng: "text-red-600 dark:text-red-400 font-semibold",
  unknown: "text-slate-400 dark:text-slate-500",
  neutral: "text-slate-800 dark:text-slate-100",
};
