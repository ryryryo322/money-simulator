// ============================================
// 条件別診断ロジック
//
// 【ルール】
// - 確認できていない項目（未確認）は採点しません。「判定対象外」として理由に明示します。
// - 並び順は、適合度 → 五十音順。広告提携の有無・報酬額は一切使いません。
// - 希望単価は、各社の比較可能な公式データが無いため、適合度には反映しません。
// ============================================

import type { Agent, LangKey, RegionKey } from "../types";
import { LANG_LABELS, REGION_LABELS } from "./format";

export type WorkStyle = "full_remote" | "remote_ok" | "onsite_ok";

export interface DiagnosisInput {
  language: LangKey | "other";
  years: number;
  workStyle: WorkStyle;
  region: RegionKey | "any";
  wantWeek3: boolean;
  desiredPriceMan: number | null; // 万円/月（任意・採点には使わない）
}

export type ReasonResult = "match" | "partial" | "mismatch" | "unknown" | "skipped";

export interface Reason {
  label: string;
  result: ReasonResult;
  text: string;
}

export interface DiagnosisResult {
  agent: Agent;
  /** 0〜100。判定材料が少ない場合は null */
  score: number | null;
  evaluatedCount: number;
  reasons: Reason[];
}

const WEIGHTS = { language: 3, experience: 2, workStyle: 2, weekly3: 1.5, region: 2 };
const POINT: Record<"match" | "partial" | "mismatch", number> = { match: 1, partial: 0.5, mismatch: 0 };
/** 評価できた項目がこの数未満なら、点数は出さず「判定材料不足」とする（2項目だけで100%などと見せない） */
const MIN_EVALUATED = 3;

export function diagnose(agents: Agent[], input: DiagnosisInput): DiagnosisResult[] {
  const results = agents.map((agent) => evaluate(agent, input));
  const order = new Map(agents.map((a, i) => [a.id, i]));
  return results.sort((x, y) => {
    const xs = x.score == null ? -1 : x.score;
    const ys = y.score == null ? -1 : y.score;
    if (ys !== xs) return ys - xs;
    return (order.get(x.agent.id) ?? 0) - (order.get(y.agent.id) ?? 0);
  });
}

function evaluate(agent: Agent, input: DiagnosisInput): DiagnosisResult {
  const reasons: Reason[] = [];
  let sum = 0;
  let weightSum = 0;
  let evaluated = 0;

  const add = (weight: number, label: string, result: ReasonResult, text: string) => {
    reasons.push({ label, result, text });
    if (result === "match" || result === "partial" || result === "mismatch") {
      sum += weight * POINT[result];
      weightSum += weight;
      evaluated += 1;
    }
  };

  // ── 使用言語 ──
  if (input.language === "other") {
    add(0, "使用言語", "skipped", "比較データのある言語（Java・C#・PHP・Python・JavaScript）以外は、判定対象外です。");
  } else {
    const name = LANG_LABELS[input.language];
    if (agent.languages.value.includes(input.language)) {
      add(WEIGHTS.language, "使用言語", "match", `${name}案件の取り扱いを、出典付きで確認できました。`);
    } else {
      add(0, "使用言語", "unknown", `${name}案件の取り扱いは確認できていません（「なし」という意味ではありません）。`);
    }
  }

  // ── 実務経験年数 ──
  const minYears = agent.minExperienceYears.value;
  if (minYears == null) {
    add(0, "実務経験", "unknown", "実務経験年数の条件が確認できていません。");
  } else if (input.years >= minYears) {
    add(WEIGHTS.experience, "実務経験", "match", `目安の「実務経験${minYears}年以上」を満たしています。`);
  } else {
    add(WEIGHTS.experience, "実務経験", "mismatch", `目安は「実務経験${minYears}年以上」で、現在の経験年数だと案件が限られる可能性があります。`);
  }

  // ── 勤務形態 ──
  const fr = agent.fullRemote.value;
  const rc = agent.remoteConsult.value;
  if (input.workStyle === "onsite_ok") {
    add(0, "勤務形態", "skipped", "出社・常駐も可とのことなので、勤務形態では差をつけていません。");
  } else if (input.workStyle === "full_remote") {
    if (fr === "yes") add(WEIGHTS.workStyle, "勤務形態", "match", "フルリモート案件の掲載を確認できました。");
    else if (fr === "limited") add(WEIGHTS.workStyle, "勤務形態", "partial", "フルリモート案件はありますが、限られるとの記載があります。");
    else if (fr === "no") add(WEIGHTS.workStyle, "勤務形態", "mismatch", "フルリモート案件は無いとの記載があります。");
    else add(0, "勤務形態", "unknown", "フルリモート案件の有無が確認できていません。");
  } else {
    if (rc === "yes" || fr === "yes") {
      add(WEIGHTS.workStyle, "勤務形態", "match", rc === "yes" ? "リモート相談可能な案件の記載を確認できました。" : "フルリモート案件があり、リモート勤務が可能です。");
    } else if (rc === "limited" || fr === "limited") {
      add(WEIGHTS.workStyle, "勤務形態", "partial", "リモート案件はありますが、限られるとの記載があります。");
    } else if (rc === "no" && fr === "no") {
      add(WEIGHTS.workStyle, "勤務形態", "mismatch", "リモート案件は無いとの記載があります。");
    } else {
      add(0, "勤務形態", "unknown", "リモート相談可否が確認できていません。");
    }
  }

  // ── 週3日以下 ──
  if (input.wantWeek3) {
    const w = agent.weekly3OrLess.value;
    if (w === "yes") add(WEIGHTS.weekly3, "週3日以下", "match", "週3日以下の案件の記載を確認できました。");
    else if (w === "limited") add(WEIGHTS.weekly3, "週3日以下", "partial", "週3日以下の案件は限られるとの記載があります。");
    else if (w === "no") add(WEIGHTS.weekly3, "週3日以下", "mismatch", "週3日以下の案件は無いとの記載があります。");
    else add(0, "週3日以下", "unknown", "週3日以下の案件の有無が確認できていません。");
  }

  // ── 希望勤務地 ──
  const region = agent.regions.value;
  if (input.region === "any") {
    add(0, "勤務地", "skipped", "勤務地は問わないとのことなので、判定していません。");
  } else if (region == null) {
    add(0, "勤務地", "unknown", "対応地域が確認できていません。");
  } else if (region.nationwide || region.keys.includes(input.region)) {
    add(WEIGHTS.region, "勤務地", "match", `${REGION_LABELS[input.region]}は対応地域に含まれています（${region.label}）。`);
  } else if (region.exhaustive) {
    add(WEIGHTS.region, "勤務地", "mismatch", `${REGION_LABELS[input.region]}は対応地域として記載がありません（${region.label}）。`);
  } else {
    add(0, "勤務地", "unknown", `記載されている対応地域は「${region.label}」で、一覧が網羅的でないため${REGION_LABELS[input.region]}は未確認です。`);
  }

  // ── 希望単価（採点しない） ──
  if (input.desiredPriceMan != null) {
    reasons.push({
      label: "希望単価",
      result: "skipped",
      text: "エージェントごとの単価を比較できる公式データが無いため、適合度には反映していません。面談で確認してください。",
    });
  }

  const score = evaluated >= MIN_EVALUATED && weightSum > 0 ? Math.round((sum / weightSum) * 100) : null;
  return { agent, score, evaluatedCount: evaluated, reasons };
}
