// ============================================
// ドル円積立シミュレーター カスタムフック
// Cloudflare Worker（frankfurter-api）を1回だけ呼び出し、
// 取得したレートデータを lib/usdJpy で計算する
// ============================================

import { useCallback, useState } from "react";
import { simulateUsdJpyDca } from "@/lib/usdJpy";
import type { RatePoint, UsdJpySimulationSummary } from "@/lib/usdJpy";

// Workerの公開URL（秘密情報ではないためVITE_環境変数で管理してよい）
const WORKER_BASE_URL =
  (import.meta.env.VITE_FRANKFURTER_WORKER_URL as string | undefined) ||
  "https://frankfurter-api.example.workers.dev";

interface WorkerResponse {
  generatedAt: string;
  rule: string;
  requestedStart: string;
  months: number;
  series: RatePoint[];
  latest: { date: string; rate: number };
  error?: string;
}

export function useUsdJpySimulator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UsdJpySimulationSummary | null>(null);
  const [rule, setRule] = useState<string>("");

  const run = useCallback(async (startYearMonth: string, months: number, monthlyAmountYen: number) => {
    setError(null);
    setResult(null);

    // 入力バリデーション（Worker側でも検証するが、フロント側でも早期に弾く）
    if (!/^\d{4}-\d{2}$/.test(startYearMonth)) {
      setError("積立開始年月の指定が不正です。");
      return;
    }
    if (!Number.isInteger(months) || months < 1 || months > 480) {
      setError("積立期間が不正です（1〜480ヶ月の範囲で指定してください）。");
      return;
    }
    if (!Number.isFinite(monthlyAmountYen) || monthlyAmountYen < 1000 || monthlyAmountYen > 1_000_000) {
      setError("毎月の積立額は1,000円〜1,000,000円の範囲で指定してください。");
      return;
    }

    setLoading(true);
    try {
      const url = `${WORKER_BASE_URL}/simulate?start=${startYearMonth}&months=${months}`;
      const res = await fetch(url);
      const data: WorkerResponse = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || `APIエラー（HTTP ${res.status}）が発生しました`);
      }

      setRule(data.rule);
      const summary = simulateUsdJpyDca(data.series, monthlyAmountYen, data.latest.rate, data.latest.date);
      setResult(summary);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "為替データを取得できませんでした。しばらくしてから再度お試しください。"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  return { run, loading, error, result, rule };
}
