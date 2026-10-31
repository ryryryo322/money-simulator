// ============================================
// 条件別診断ロジック
//
// 【判定は「一致 / 不一致 / 未確認」の3種類】
// - 一致  ：根拠となる情報（公式サイト等）を確認できた
// - 不一致：条件に合わない情報を確認できた
// - 未確認：確認できていない。「不一致」でも「一致」でもなく、スコア計算に含めない
//
// 【参考スコアの計算】
//   参考スコア ＝ 一致した項目の配点 ÷ 確認できた項目（一致＋不一致）の配点合計 × 100
//   配点：使用言語 3 ／ 勤務形態 3 ／ 言語×フルリモート 2 ／ 週3日以下 2 ／ 勤務地 2
//   ※ 「言語×フルリモート」は、言語とフルリモートの両方を指定した場合のみ対象
//   ※ 実際の案件とのマッチ率ではなく、確認できた情報にもとづく参考値です
//
// 【順位を付ける条件】
//   確認できた項目の配点が、診断対象の配点の6割以上、かつ2項目以上ある場合のみスコアと順位を表示。
//   それ以外は「判定材料不足」として別枠に表示します。
//
// 【使わないもの】
// - 実務経験年数：案件ごとに異なり、各社共通の登録条件を確認できていないため、スコアに使いません
// - 希望単価：エージェント別に比較できる公式データがないため、スコアに使いません
// - 広告提携の有無・報酬額：一切使いません
// ============================================

import type { Agent, LangKey, RegionKey } from "../types";
import { LANG_LABELS, REGION_LABELS } from "./format";

export type WorkStyle = "full_remote" | "remote_ok" | "onsite_ok";

export interface DiagnosisInput {
  language: LangKey | "other";
  years: number; // 入力欄は残すが、スコアには使わない
  workStyle: WorkStyle;
  region: RegionKey | "any";
  wantWeek3: boolean;
  desiredPriceMan: number | null; // 万円/月（スコアには使わない）
}

export type Outcome = "match" | "mismatch" | "unknown";

export interface Reason {
  label: string;
  outcome: Outcome;
  text: string;
  /** 配点 */
  weight: number;
}

export interface DiagnosisResult {
  agent: Agent;
  reasons: Reason[];
  /** 0〜100。判定材料不足の場合は null */
  score: number | null;
  /** 診断対象の配点のうち、確認できた配点の割合（0〜1） */
  coverage: number;
  matched: number;
  checked: number;
  requested: number;
  /** 同点・同確認率は同順位。判定材料不足は null */
  rank: number | null;
}

export interface DiagnosisOutput {
  ranked: DiagnosisResult[];
  insufficient: DiagnosisResult[];
}

export const WEIGHTS = { language: 3, workStyle: 3, combo: 2, weekly3: 2, region: 2 } as const;
const MIN_COVERAGE = 0.6;
const MIN_CHECKED = 2;

export function diagnose(agents: Agent[], input: DiagnosisInput): DiagnosisOutput {
  const order = new Map(agents.map((a, i) => [a.id, i]));
  const results = agents.map((a) => evaluate(a, input));

  const ranked = results
    .filter((r) => r.score != null)
    .sort(
      (x, y) =>
        (y.score as number) - (x.score as number) ||
        y.coverage - x.coverage ||
        (order.get(x.agent.id) ?? 0) - (order.get(y.agent.id) ?? 0)
    );
  // 同点・同確認率は同順位
  ranked.forEach((r, i) => {
    const prev = ranked[i - 1];
    r.rank = prev && prev.score === r.score && prev.coverage === r.coverage ? (prev.rank as number) : i + 1;
  });

  const insufficient = results
    .filter((r) => r.score == null)
    .sort((x, y) => (order.get(x.agent.id) ?? 0) - (order.get(y.agent.id) ?? 0));

  return { ranked, insufficient };
}

function evaluate(agent: Agent, input: DiagnosisInput): DiagnosisResult {
  const reasons: Reason[] = [];
  const add = (weight: number, label: string, outcome: Outcome, text: string) =>
    reasons.push({ label, outcome, text, weight });

  const lang = input.language === "other" ? null : input.language;
  const langName = lang ? LANG_LABELS[lang] : "";

  // ── 使用言語 ──
  if (lang) {
    if (agent.languages.value.includes(lang)) {
      add(WEIGHTS.language, "使用言語", "match", `${langName}案件の取扱いを確認できました。`);
    } else {
      add(WEIGHTS.language, "使用言語", "unknown", `${langName}案件の取扱いを公式情報で確認できませんでした（非対応の意味ではありません）。`);
    }
  }

  // ── 勤務形態 ──
  const fr = agent.fullRemote.value;
  const rc = agent.remoteConsult.value;
  if (input.workStyle === "full_remote") {
    if (fr === "yes") add(WEIGHTS.workStyle, "フルリモート", "match", "フルリモート案件を確認できました。");
    else if (fr === "no") add(WEIGHTS.workStyle, "フルリモート", "mismatch", "フルリモート案件は無いとの情報があります。");
    else add(WEIGHTS.workStyle, "フルリモート", "unknown", "フルリモート案件を確認できませんでした。");
  } else if (input.workStyle === "remote_ok") {
    if (rc === "yes" || fr === "yes") {
      add(WEIGHTS.workStyle, "リモート", "match", rc === "yes" ? "リモート相談可能な案件を確認できました。" : "フルリモート案件があり、リモート勤務が可能です。");
    } else if (rc === "no" && fr === "no") {
      add(WEIGHTS.workStyle, "リモート", "mismatch", "リモート案件は無いとの情報があります。");
    } else {
      add(WEIGHTS.workStyle, "リモート", "unknown", "リモート相談可否を確認できませんでした。");
    }
  }
  // onsite_ok は勤務形態で差をつけない（診断対象外）

  // ── 言語 × フルリモート（両方を指定した場合のみ） ──
  if (lang && input.workStyle === "full_remote") {
    if (agent.fullRemoteLanguages.value.includes(lang)) {
      add(WEIGHTS.combo, `${langName}×フルリモート`, "match", `${langName}のフルリモート案件を確認できました。`);
    } else {
      add(WEIGHTS.combo, `${langName}×フルリモート`, "unknown", `${langName}のフルリモート案件は確認できませんでした。`);
    }
  }

  // ── 週3日以下 ──
  if (input.wantWeek3) {
    const w = agent.weekly3OrLess.value;
    if (w === "yes") add(WEIGHTS.weekly3, "週3日以下", "match", "週3日以下の案件を確認できました。");
    else if (w === "no") add(WEIGHTS.weekly3, "週3日以下", "mismatch", "週3日以下の案件は無いとの情報があります。");
    else add(WEIGHTS.weekly3, "週3日以下", "unknown", "週3日以下の案件を確認できませんでした。");
  }

  // ── 希望勤務地 ──
  if (input.region !== "any") {
    const region = agent.regions.value;
    const name = REGION_LABELS[input.region];
    if (region && region.keys.includes(input.region)) {
      add(WEIGHTS.region, "勤務地", "match", `${name}の案件を確認できました。`);
    } else if (region && region.exhaustive) {
      add(WEIGHTS.region, "勤務地", "mismatch", `${name}の案件は確認できません（対応地域の一覧に含まれていません）。`);
    } else {
      add(WEIGHTS.region, "勤務地", "unknown", `${name}の案件は確認できませんでした（確認できた地域の一覧は網羅的ではありません）。`);
    }
  }

  // ── スコア ──
  const requested = reasons.reduce((s, r) => s + r.weight, 0);
  const checkedReasons = reasons.filter((r) => r.outcome !== "unknown");
  const checked = checkedReasons.reduce((s, r) => s + r.weight, 0);
  const matched = reasons.filter((r) => r.outcome === "match").reduce((s, r) => s + r.weight, 0);
  const coverage = requested > 0 ? checked / requested : 0;
  const sufficient = checkedReasons.length >= MIN_CHECKED && coverage >= MIN_COVERAGE;
  const score = sufficient && checked > 0 ? Math.round((matched / checked) * 100) : null;

  return { agent, reasons, score, coverage, matched, checked, requested, rank: null };
}
