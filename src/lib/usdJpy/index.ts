// ============================================
// ドル円積立シミュレーション計算ライブラリ
// 実際のUSD/JPYレート（円）を受け取り、
// 毎月ドルを積み立てた場合の累積・評価額・損益を計算します
// ============================================

/** 1ヶ月分のレートデータ点 */
export interface RatePoint {
  /** 対象月（YYYY-MM） */
  month: string;
  /** 狙った基準日（YYYY-MM-DD）。各月1日 */
  targetDate: string;
  /** 実際に採用した基準日（YYYY-MM-DD）。非営業日の場合は後ろにずれる */
  actualDate: string | null;
  /** USD/JPYレート（1USD＝何円か）。取得できなかった場合はnull */
  rate: number | null;
}

/** 積立の推移1点分 */
export interface MonthlyPoint {
  /** 表示用日付（YYYY-MM-DD） */
  date: string;
  /** その時点までの累計積立額（円） */
  invested: number;
  /** その時点までの累積ドル */
  usd: number;
  /** その時点の評価額（円）＝ 累積ドル × その月のレート */
  valuation: number;
}

/** シミュレーション結果サマリー */
export interface UsdJpySimulationSummary {
  /** 実際に使用した積立開始日（YYYY-MM-DD） */
  startDate: string;
  /** 実際に集計できた月数（欠損月は除く） */
  months: number;
  /** 毎月の積立額（円） */
  monthlyAmountYen: number;
  /** 累計積立額（円） */
  totalInvestedYen: number;
  /** 累積ドル */
  totalUsd: number;
  /** 現在評価額の計算に使用したUSD/JPYレート */
  currentRate: number;
  /** 現在レートの基準日（YYYY-MM-DD）。分かる場合のみ */
  currentRateDate: string | null;
  /** 現在の円換算評価額（円） */
  currentValuationYen: number;
  /** 損益額（円） */
  gainYen: number;
  /** 損益率（%） */
  gainRate: number;
  /** 積立元本・評価額の推移（グラフ用） */
  timeline: MonthlyPoint[];
  /** 集計から除外された月数（データ欠損） */
  skippedMonths: number;
}

/**
 * ドル円積立（ドルコスト平均法）をシミュレーションします
 *
 * @param series 各月のUSD/JPYレートデータ（時系列昇順）
 * @param monthlyAmountYen 毎月の積立額（円）
 * @param currentRate 現在評価額の計算に使う、最新のUSD/JPYレート
 * @param currentRateDate currentRateの基準日（YYYY-MM-DD）。表示用
 * @returns シミュレーション結果
 *
 * @remarks
 * 計算式: 各月の購入ドル = 積立額（円） ÷ その月のUSD/JPYレート
 *         現在評価額 = 累積ドル × 現在のUSD/JPYレート
 * レートが取得できなかった月（rate: null）は0円で購入したとはせず、
 * 集計から除外します（skippedMonthsでカウント）。
 */
export function simulateUsdJpyDca(
  series: RatePoint[],
  monthlyAmountYen: number,
  currentRate: number,
  currentRateDate: string | null
): UsdJpySimulationSummary {
  const valid = series.filter((p) => p.rate !== null && p.rate > 0 && p.actualDate !== null);
  const skippedMonths = series.length - valid.length;

  if (valid.length === 0) {
    throw new Error("USD/JPYレートを取得できませんでした。期間を見直してください。");
  }

  let cumulativeUsd = 0;
  let cumulativeInvested = 0;
  const timeline: MonthlyPoint[] = [];

  for (const point of valid) {
    const rate = point.rate as number;
    cumulativeInvested += monthlyAmountYen;
    cumulativeUsd += monthlyAmountYen / rate;
    timeline.push({
      date: point.actualDate as string,
      invested: cumulativeInvested,
      usd: cumulativeUsd,
      valuation: Math.round(cumulativeUsd * rate),
    });
  }

  const currentValuationYen = Math.round(cumulativeUsd * currentRate);
  const gainYen = currentValuationYen - cumulativeInvested;
  const gainRate = cumulativeInvested > 0 ? Math.round((gainYen / cumulativeInvested) * 1000) / 10 : 0;

  // 現在レートで評価額の最終点も揃える（グラフの最終点と数値を一致させるため）
  if (timeline.length > 0) {
    timeline[timeline.length - 1] = {
      ...timeline[timeline.length - 1],
      valuation: currentValuationYen,
    };
  }

  return {
    startDate: valid[0].actualDate as string,
    months: valid.length,
    monthlyAmountYen,
    totalInvestedYen: cumulativeInvested,
    totalUsd: cumulativeUsd,
    currentRate,
    currentRateDate,
    currentValuationYen,
    gainYen,
    gainRate,
    timeline,
    skippedMonths,
  };
}

/** 基準価額（レート）の取得ルール説明（画面表示用） */
export const RATE_RULE_TEXT =
  "各月1日を基準日とし、土日・休場日等でその日のレートが存在しない場合は、直近の翌営業日（最大10日先まで）のレートを使用しています。該当レートが見つからない月は集計から除外します（架空のレートは使用しません）。";
