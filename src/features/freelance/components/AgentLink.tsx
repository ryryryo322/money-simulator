// ============================================
// エージェントへのリンク
// - ASPで提携承認済み（affiliates.ts）の場合のみアフィリエイトURLを使用（rel="sponsored"、PR表記つき）
// - それ以外は公式サイトへの通常リンク
// - クリックは計測するが、成果（ASPでの承認）とは別の指標
// ============================================

import type { ReactNode } from "react";
import type { Agent } from "../types";
import { getApprovedAffiliate } from "../data/affiliates";
import { track } from "../lib/track";

interface Props {
  agent: Agent;
  /** 設置場所（計測用）例: "table" / "card" / "result" */
  placement: string;
  className?: string;
  showPixel?: boolean;
  children?: ReactNode;
}

export default function AgentLink({ agent, placement, className, showPixel, children }: Props) {
  const aff = getApprovedAffiliate(agent.id);
  const href = aff ? (aff.affiliateUrl as string) : agent.officialUrl;

  const onClick = () => {
    track(aff ? "freelance_affiliate_click" : "freelance_official_click", {
      agent_id: agent.id,
      placement,
      link_type: aff ? "affiliate" : "official",
      asp: aff && aff.asp ? aff.asp : undefined,
    });
  };

  return (
    <span className="inline-flex items-center gap-1.5">
      <a
        href={href}
        target="_blank"
        rel={aff ? "sponsored nofollow noopener noreferrer" : "noopener noreferrer"}
        onClick={onClick}
        className={
          className ??
          "inline-flex items-center justify-center gap-1 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-4 py-2.5 transition-colors"
        }
      >
        {children ?? "公式サイトを見る"}
        <span aria-hidden="true">↗</span>
      </a>
      {aff && (
        <span className="text-[10px] leading-none rounded border border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 px-1 py-0.5">
          PR
        </span>
      )}
      {aff && showPixel && aff.pixelSrc ? (
        <img width={1} height={1} src={aff.pixelSrc} alt="" className="border-0" />
      ) : null}
    </span>
  );
}
