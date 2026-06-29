// ============================================
// 共通UIコンポーネント
// Card, SliderInput, StatRow, SectionTitle など
// 全シミュレーターで使い回します
// ============================================

import React from "react";

// ── カード ──────────────────────────────────
export const Card = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl border border-white/60 dark:border-gray-700/60 shadow-sm p-5 ${className}`}
  >
    {children}
  </div>
);

// ── セクションタイトル ────────────────────────
export const SectionTitle = ({
  children,
  color = "blue",
}: {
  children: React.ReactNode;
  color?: "blue" | "green" | "purple" | "orange";
}) => {
  const colors: Record<string, string> = {
    blue:   "bg-blue-500",
    green:  "bg-green-500",
    purple: "bg-purple-500",
    orange: "bg-brand-500",
  };
  return (
    <div className="flex items-center gap-3 mb-4 px-1">
      <div className={`w-1 h-5 rounded-full ${colors[color] ?? colors.blue}`} />
      <h2 className="text-sm font-bold text-gray-700 dark:text-gray-300 tracking-tight">
        {children}
      </h2>
      <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
    </div>
  );
};

// ── スライダー入力 ────────────────────────────
export const SliderInput = ({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) => (
  <div className="mb-5">
    <div className="flex justify-between items-baseline mb-1">
      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-base font-semibold text-gray-900 dark:text-white tabular-nums">
        {value.toLocaleString()}{unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none accent-brand-500 cursor-pointer"
      aria-label={label}
    />
    <div className="flex justify-between text-xs text-gray-400 mt-0.5">
      <span>{min}{unit}</span>
      <span>{max}{unit}</span>
    </div>
  </div>
);

// ── 結果行 ───────────────────────────────────
export const StatRow = ({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) => (
  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0">
    <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
    <span
      className={`text-sm font-semibold tabular-nums ${
        highlight ? "text-brand-500" : "text-gray-900 dark:text-white"
      }`}
    >
      {value}
    </span>
  </div>
);

// ── グラフ共通ツールチップ ────────────────────
export const ChartTooltip = ({
  active,
  payload,
  label,
  labelSuffix = "",
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
  labelSuffix?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 p-3 text-xs">
      <p className="font-semibold text-gray-700 dark:text-gray-300 mb-1">
        {label}{labelSuffix}
      </p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="tabular-nums">
          {p.name}: {Math.round(p.value).toLocaleString()}万円
        </p>
      ))}
    </div>
  );
};
