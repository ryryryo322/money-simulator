// /freelance/diagnosis/ 条件別診断ページ
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AGENTS } from "../data/agents";
import { diagnose, WEIGHTS, type DiagnosisInput, type DiagnosisOutput, type DiagnosisResult, type WorkStyle } from "../lib/diagnose";
import { LANG_LABELS, REGION_LABELS } from "../lib/format";
import { breadcrumbJsonLd, useDocumentHead } from "../lib/useDocumentHead";
import { track } from "../lib/track";
import { SERVICE_NAME, SITE_ORIGIN } from "../config";
import type { LangKey, RegionKey } from "../types";
import AgentLink from "../components/AgentLink";
import AgentDetails from "../components/AgentDetails";
import { AdNotice } from "../components/Notices";

const YEARS: { label: string; value: number }[] = [
  { label: "1年未満", value: 0 },
  { label: "1年", value: 1 },
  { label: "2年", value: 2 },
  { label: "3年", value: 3 },
  { label: "4〜5年", value: 4 },
  { label: "6年以上", value: 6 },
];

const WORK_STYLES: { label: string; value: WorkStyle; hint: string }[] = [
  { label: "フルリモート", value: "full_remote", hint: "出社なしで働きたい" },
  { label: "リモート相談可", value: "remote_ok", hint: "週数日の出社があってもよい" },
  { label: "出社・常駐でも可", value: "onsite_ok", hint: "働き方にこだわらない" },
];

const fieldLabel = "block text-sm font-semibold mb-2";
const selectCls =
  "w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

export default function DiagnosisPage() {
  useDocumentHead({
    title: `条件別診断｜ITフリーランスエージェントとの適合度｜${SERVICE_NAME}`,
    description:
      "使用言語・実務経験・希望の働き方・勤務地を入力すると、ITフリーランスエージェントとの適合度を理由つきで表示。確認できていない項目は点数に含めません。",
    jsonLd: breadcrumbJsonLd([
      { name: SERVICE_NAME, url: `${SITE_ORIGIN}/freelance/` },
      { name: "条件別診断", url: `${SITE_ORIGIN}/freelance/diagnosis/` },
    ]),
  });

  const [language, setLanguage] = useState<LangKey | "other">("java");
  const [years, setYears] = useState<number>(3);
  const [workStyle, setWorkStyle] = useState<WorkStyle>("full_remote");
  const [region, setRegion] = useState<RegionKey | "any">("any");
  const [wantWeek3, setWantWeek3] = useState(false);
  const [price, setPrice] = useState<string>("");
  const [output, setOutput] = useState<DiagnosisOutput | null>(null);
  const [priceNoted, setPriceNoted] = useState(false);
  const [lastInput, setLastInput] = useState<DiagnosisInput | null>(null);
  const started = useRef(false);

  // フォームに最初に触れた時に「診断開始」を1回だけ計測
  const markStarted = () => {
    if (!started.current) {
      started.current = true;
      track("freelance_diagnosis_start");
    }
  };

  const submit = () => {
    markStarted();
    const priceNum = price.trim() === "" ? null : Number(price);
    const input: DiagnosisInput = {
      language,
      years,
      workStyle,
      region,
      wantWeek3,
      desiredPriceMan: priceNum != null && Number.isFinite(priceNum) && priceNum > 0 ? priceNum : null,
    };
    setPriceNoted(input.desiredPriceMan != null);
    setLastInput(input);
    setOutput(diagnose(AGENTS, input));
    track("freelance_diagnosis_complete", {
      language,
      years,
      work_style: workStyle,
      region,
      want_week3: wantWeek3,
    });
    setTimeout(() => document.getElementById("diagnosis-result")?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  // 表示用：一致率が同じなら同率順位（並び順や計算は変更しない）
  const rankLabels = new Map<string, string>();
  let hasTie = false;
  if (output) {
    output.ranked.forEach((r, i) => {
      const first = output.ranked.findIndex((x) => x.score === r.score);
      const sameCount = output.ranked.filter((x) => x.score === r.score).length;
      if (sameCount > 1) hasTie = true;
      rankLabels.set(r.agent.id, `${sameCount > 1 ? "同率" : ""}${first + 1}位`);
      void i;
    });
  }

  return (
    <div className="space-y-6">
      <nav className="text-xs text-slate-500 dark:text-slate-400" aria-label="パンくず">
        <Link to="/freelance/" className="hover:underline">
          {SERVICE_NAME}
        </Link>{" "}
        ＞ 条件別診断
      </nav>

      <div>
        <h1 className="text-2xl font-black tracking-tight">条件別診断</h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          条件を入力すると、{AGENTS.length}社との適合度を、判定の理由つきで表示します。確認できていない項目は「未確認」とし、一致率の計算には含めません。
        </p>
      </div>

      {/* ── 入力フォーム ── */}
      <div
        className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-5"
        onChangeCapture={markStarted}
      >
        <div>
          <label htmlFor="dg-lang" className={fieldLabel}>
            使用言語（メイン）
          </label>
          <select
            id="dg-lang"
            className={selectCls}
            value={language}
            onChange={(e) => setLanguage(e.target.value as LangKey | "other")}
          >
            {(Object.keys(LANG_LABELS) as LangKey[]).map((k) => (
              <option key={k} value={k}>
                {LANG_LABELS[k]}
              </option>
            ))}
            <option value="other">その他</option>
          </select>
        </div>

        <div>
          <label htmlFor="dg-years" className={fieldLabel}>
            実務経験年数
          </label>
          <select id="dg-years" className={selectCls} value={years} onChange={(e) => setYears(Number(e.target.value))}>
            {YEARS.map((y) => (
              <option key={y.value} value={y.value}>
                {y.label}
              </option>
            ))}
          </select>
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            ※ 実務経験の条件は案件ごとに異なり、各社共通の登録条件を確認できていないため、診断のスコアには使っていません。
          </p>
        </div>

        <fieldset>
          <legend className={fieldLabel}>希望する勤務形態</legend>
          <div className="grid gap-2 sm:grid-cols-3">
            {WORK_STYLES.map((w) => (
              <label
                key={w.value}
                className={`cursor-pointer rounded-xl border px-3 py-3 text-sm transition-colors ${
                  workStyle === w.value
                    ? "border-blue-600 bg-blue-50 dark:bg-blue-950"
                    : "border-slate-300 dark:border-slate-700"
                }`}
              >
                <input
                  type="radio"
                  name="workStyle"
                  className="sr-only"
                  checked={workStyle === w.value}
                  onChange={() => setWorkStyle(w.value)}
                />
                <span className="block font-semibold">{w.label}</span>
                <span className="block text-[11px] text-slate-500 dark:text-slate-400">{w.hint}</span>
              </label>
            ))}
          </div>
          <label className="mt-3 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={wantWeek3} onChange={(e) => setWantWeek3(e.target.checked)} className="w-4 h-4" />
            週3日以下の稼働を希望する
          </label>
        </fieldset>

        <div>
          <label htmlFor="dg-region" className={fieldLabel}>
            希望勤務地
          </label>
          <select
            id="dg-region"
            className={selectCls}
            value={region}
            onChange={(e) => setRegion(e.target.value as RegionKey | "any")}
          >
            <option value="any">問わない（リモート中心）</option>
            {(Object.keys(REGION_LABELS) as RegionKey[]).map((k) => (
              <option key={k} value={k}>
                {REGION_LABELS[k]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="dg-price" className={fieldLabel}>
            希望単価（月額・万円）<span className="ml-1 text-xs font-normal text-slate-500">任意</span>
          </label>
          <input
            id="dg-price"
            type="number"
            inputMode="numeric"
            min={0}
            placeholder="例：70"
            className={selectCls}
            value={price}
            onChange={(e) => setPrice(e.target.value)}
          />
          <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
            ※ 各社の単価を比較できる公式データが無いため、適合度には反映されません。
          </p>
        </div>

        <button
          type="button"
          onClick={submit}
          className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3.5 transition-colors"
        >
          この条件で診断する
        </button>
      </div>

      {/* ── 結果 ── */}
      {output && (
        <section id="diagnosis-result" className="space-y-5 scroll-mt-20">
          <h2 className="text-lg font-bold">診断結果</h2>
          <AdNotice />

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed space-y-1">
            <p className="font-semibold text-slate-800 dark:text-slate-100">数値の見方</p>
            <p>
              <span className="font-semibold">確認済み条件の一致率</span>
              ：公式サイト等で確認できた条件のうち、希望に一致した配点の割合です。
              <span className="font-semibold">実際の案件とのマッチ率ではありません。</span>
              「未確認」は一致にも不一致にも数えません。
            </p>
            <p>
              <span className="font-semibold">条件の確認率</span>
              ：入力した条件の配点のうち、確認できた配点の割合です。低いほど、未確認の条件が多いことを表します。
            </p>
            <p>
              配点：使用言語 {WEIGHTS.language}／勤務形態 {WEIGHTS.workStyle}／言語×フルリモート {WEIGHTS.combo}（両方を指定した場合）／週3日以下 {WEIGHTS.weekly3}／勤務地 {WEIGHTS.region}。
              確認できた項目が少ないエージェントは、数値と順位を出さず別枠に表示します。
            </p>
            <p>
              情報が増えると、順位が変わる可能性があります。
              {priceNoted && "希望単価は、エージェントごとの単価比較データがないため、診断には反映していません。面談で確認してください。"}
            </p>
          </div>

          {output.ranked.length > 0 ? (
            <>
              {hasTie && (
                <p className="rounded-xl bg-blue-50 dark:bg-slate-900 border border-blue-100 dark:border-slate-800 p-3 text-xs leading-relaxed">
                  今回の条件では、確認できた情報に大きな差はありません。各社の公式サイトで最新の案件条件をご確認ください。
                </p>
              )}
              <ol className="space-y-4">
                {output.ranked.map((r) => (
                  <ResultCard key={r.agent.id} r={r} input={lastInput} rankLabel={rankLabels.get(r.agent.id) ?? null} />
                ))}
              </ol>
            </>
          ) : (
            <p className="rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 p-3 text-xs leading-relaxed">
              入力条件のうち確認できた項目が少なく、順位を付けられるエージェントがありませんでした。勤務形態や週3日以下などを指定すると、判定しやすくなります。
              <Link to="/freelance/agents/" className="underline ml-1">
                比較表を見る
              </Link>
            </p>
          )}

          {output.insufficient.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold">判定材料が不足しているエージェント</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                入力条件のうち、確認できた情報が少ないため、一致率と順位は表示していません。「未確認」は、条件に合わないという意味ではありません。
              </p>
              <ul className="space-y-4">
                {output.insufficient.map((r) => (
                  <ResultCard key={r.agent.id} r={r} input={lastInput} rankLabel={null} />
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            診断結果は目安です。最終的な条件は、各社の公式サイトや面談でご確認ください。
          </p>
        </section>
      )}
    </div>
  );
}

function ResultCard({ r, input, rankLabel }: { r: DiagnosisResult; input: DiagnosisInput | null; rankLabel: string | null }) {
  const group = (outcome: "match" | "mismatch" | "unknown") => r.reasons.filter((x) => x.outcome === outcome);
  const matches = group("match");
  const mismatches = group("mismatch");
  const unknowns = group("unknown");
  const confirmRate = Math.round(r.coverage * 100);
  const actions = nextActions(r, input);

  return (
    <li className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 list-none">
      <div className="flex items-start justify-between gap-3">
        <div>
          {rankLabel && <p className="text-xs text-slate-500 dark:text-slate-400">{rankLabel}</p>}
          <h3 className="text-base font-bold">{r.agent.name}</h3>
        </div>
        <div className="text-right flex-shrink-0">
          {r.score == null ? (
            <p className="text-sm font-semibold text-slate-500">判定材料不足</p>
          ) : (
            <>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">確認済み条件の一致率</p>
              <p className="text-2xl font-black text-blue-700 dark:text-blue-300">
                {r.score}
                <span className="text-sm font-bold">%</span>
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                一致配点 {r.matched} ／ 確認済み配点 {r.checked}
              </p>
            </>
          )}
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            条件の確認率 {confirmRate}%（確認 {r.checked} ／ 全体 {r.requested}）
          </p>
        </div>
      </div>

      {r.score != null && (
        <div className="mt-3 h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden" aria-hidden="true">
          <div className="h-full bg-blue-600" style={{ width: `${r.score}%` }} />
        </div>
      )}
      <p className="mt-1 text-[10px] text-slate-500 dark:text-slate-400">
        実際の案件とのマッチ率ではなく、公式サイト等で確認できた条件にもとづく値です。
      </p>

      <div className="mt-4 space-y-3 text-sm">
        <ReasonGroup title="条件一致" mark="○" cls="text-emerald-600 dark:text-emerald-400" items={matches} />
        <ReasonGroup title="条件不一致" mark="×" cls="text-red-600 dark:text-red-400" items={mismatches} />
        <ReasonGroup title="未確認（一致率に含めません）" mark="？" cls="text-slate-400" items={unknowns} />
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">次に確認すること</p>
        <ul className="mt-1 list-disc pl-5 space-y-1 text-sm leading-snug">
          {actions.map((a, i) => (
            <li key={i}>{a}</li>
          ))}
        </ul>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <AgentLink agent={r.agent} placement="result" showPixel />
        <AgentDetails agent={r.agent} placement="result" />
      </div>
    </li>
  );
}

/** 診断結果から、次に何を確認すればよいかを案内する（未確認の案件が存在するかのような表現は使わない） */
function nextActions(r: DiagnosisResult, input: DiagnosisInput | null): string[] {
  const items: string[] = [];
  const by = (pred: (label: string) => boolean) => r.reasons.find((x) => pred(x.label));
  const langName = input && input.language !== "other" ? LANG_LABELS[input.language] : "";

  const lang = by((l) => l === "使用言語");
  if (lang) {
    items.push(
      lang.outcome === "match"
        ? `${langName}の案件の詳細（求められるスキル・経験）を、公式サイトで確認する`
        : `${langName}の案件を扱っているか、公式サイトや面談で確認する`
    );
  }

  const work = by((l) => l === "フルリモート" || l === "リモート");
  if (work) {
    const full = work.label === "フルリモート";
    items.push(
      work.outcome === "match"
        ? full
          ? "フルリモート案件の詳細（出社の有無・頻度）を確認する"
          : "リモート案件の詳細（出社の頻度・条件）を確認する"
        : full
          ? "フルリモートの案件があるか、公式サイトや面談で確認する"
          : "リモート勤務が可能な案件があるか、公式サイトや面談で確認する"
    );
  }

  const combo = by((l) => l.endsWith("×フルリモート"));
  if (combo) {
    items.push(
      combo.outcome === "match"
        ? `${langName}のフルリモート案件の詳細を確認する`
        : `${langName}でフルリモートの案件があるか、公式サイトや面談で確認する`
    );
  }

  const week3 = by((l) => l === "週3日以下");
  if (week3) {
    items.push(
      week3.outcome === "match"
        ? "週3日以下の案件の稼働日数・条件を確認する"
        : "週3日以下の案件があるか、公式サイトや面談で確認する"
    );
  }

  const region = by((l) => l === "勤務地");
  if (region) {
    items.push(
      region.outcome === "match"
        ? "希望地域の案件の勤務地・出社条件を確認する"
        : "希望地域の案件があるか、公式サイトや面談で確認する"
    );
  }

  items.push(
    input && input.desiredPriceMan != null
      ? `希望単価（月${input.desiredPriceMan}万円）や稼働条件を、担当者との面談で相談する`
      : "希望単価や稼働条件を、担当者との面談で相談する"
  );
  items.push("実務経験の条件は案件ごとに異なるため、気になる案件の応募条件を確認する");
  return items;
}

function ReasonGroup({
  title,
  mark,
  cls,
  items,
}: {
  title: string;
  mark: string;
  cls: string;
  items: { label: string; text: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1">{title}</p>
      <ul className="space-y-1.5">
        {items.map((x, i) => (
          <li key={i} className="flex gap-2 leading-snug">
            <span className={`w-5 flex-shrink-0 text-center font-bold ${cls}`}>{mark}</span>
            <span>
              <span className="font-semibold">{x.label}：</span>
              {x.text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
