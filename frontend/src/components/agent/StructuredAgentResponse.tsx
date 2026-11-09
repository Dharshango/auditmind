"use client";

import React, { useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Brain,
  History,
  ShieldCheck,
  Search,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Building2,
  FileText,
  AlertCircle,
  Lock,
  Layers,
  Sparkles,
} from "lucide-react";

export interface CitationItem {
  type: "finding" | "audit" | "facility" | "evidence";
  label: string;
  id?: string;
  link: string;
}

interface StructuredAgentResponseProps {
  content: string;
  isUser?: boolean;
  onOpenCitation?: (citation: CitationItem) => void;
}

/**
 * Parses inline citations and formatting (bold, codes, badges) into clickable React nodes.
 */
function renderFormattedInlineText(
  text: string,
  onOpenCitation?: (c: CitationItem) => void
): React.ReactNode[] {
  // Regex pattern matching:
  // 1. Findings: FIND-2026-xxx
  // 2. Audits: AUD-2026-xxx
  // 3. CAPAs: CAPA-2026-xxx
  // 4. Facilities: FAC-001..FAC-005
  // 5. Evidence files: EVID-FIND-2026-xxx-photo-xx.jpg
  // 6. Regulatory standards: OSHA 1910.xxx, EPA 40 CFR xxx, NFPA 101/13, ISO 14119
  // 7. Bold text: **text**
  // 8. Backtick code: `code`
  const tokenRegex =
    /(`[A-Z0-9_\-./]+`|\*\*[^*]+\*\*|FIND-[A-Z0-9-]+|AUD-[A-Z0-9-]+|CAPA-[A-Z0-9-]+|FAC-00[1-5]|EVID-[A-Z0-9_.-]+|OSHA\s+[0-9]+(?:\.[0-9]+(?:\([a-z0-9]+\))?)?|EPA\s+40\s+CFR\s+[0-9]+(?:\.[0-9]+)?|NFPA\s+[0-9]+|ISO\s+[0-9]+)/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    const matchStart = match.index;
    const matchEnd = matchStart + match[0].length;

    // Plain text before match
    if (matchStart > lastIndex) {
      parts.push(text.slice(lastIndex, matchStart));
    }

    const token = match[0];

    // Handle backticked code
    if (token.startsWith("`") && token.endsWith("`")) {
      const inner = token.slice(1, -1);
      if (inner.startsWith("FIND-")) {
        parts.push(
          <button
            key={matchStart}
            type="button"
            onClick={() =>
              onOpenCitation?.({
                type: "finding",
                label: inner,
                id: inner,
                link: `/findings?search=${encodeURIComponent(inner)}`,
              })
            }
            className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded font-mono text-[11px] font-semibold bg-[#D5A6B5]/15 text-[#D5A6B5] border border-[#D5A6B5]/30 hover:border-[#D5A6B5] transition-colors cursor-pointer"
          >
            <span>{inner}</span>
          </button>
        );
      } else if (inner.startsWith("AUD-")) {
        parts.push(
          <button
            key={matchStart}
            type="button"
            onClick={() =>
              onOpenCitation?.({
                type: "audit",
                label: inner,
                id: inner,
                link: `/audits?search=${encodeURIComponent(inner)}`,
              })
            }
            className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded font-mono text-[11px] font-semibold bg-white/10 text-white border border-white/20 hover:border-white transition-colors cursor-pointer"
          >
            <span>{inner}</span>
          </button>
        );
      } else if (inner.startsWith("CAPA-")) {
        parts.push(
          <span
            key={matchStart}
            className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded font-mono text-[11px] font-semibold bg-[#C6B9D8]/15 text-[#C6B9D8] border border-[#C6B9D8]/30"
          >
            {inner}
          </span>
        );
      } else {
        parts.push(
          <code
            key={matchStart}
            className="px-1.5 py-0.5 mx-0.5 rounded font-mono text-[11px] bg-white/10 text-white border border-white/15"
          >
            {inner}
          </code>
        );
      }
    }
    // Handle **bold text**
    else if (token.startsWith("**") && token.endsWith("**")) {
      const boldText = token.slice(2, -2);
      if (boldText.includes("FAILED_RECURRED")) {
        parts.push(
          <span
            key={matchStart}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded font-bold text-[11px] bg-red-950/40 text-red-300 border border-red-500/30"
          >
            <XCircle className="w-3 h-3 text-red-400" />
            FAILED_RECURRED
          </span>
        );
      } else if (boldText.includes("EFFECTIVE")) {
        parts.push(
          <span
            key={matchStart}
            className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded font-bold text-[11px] bg-emerald-950/40 text-emerald-300 border border-emerald-500/30"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            EFFECTIVE
          </span>
        );
      } else {
        parts.push(
          <strong key={matchStart} className="font-semibold text-white">
            {boldText}
          </strong>
        );
      }
    }
    // Standalone FIND-
    else if (token.startsWith("FIND-")) {
      parts.push(
        <button
          key={matchStart}
          type="button"
          onClick={() =>
            onOpenCitation?.({
              type: "finding",
              label: token,
              id: token,
              link: `/findings?search=${encodeURIComponent(token)}`,
            })
          }
          className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded font-mono text-[11px] font-semibold bg-[#D5A6B5]/15 text-[#D5A6B5] border border-[#D5A6B5]/30 hover:border-[#D5A6B5] transition-colors cursor-pointer"
        >
          <span>{token}</span>
        </button>
      );
    }
    // Standalone AUD-
    else if (token.startsWith("AUD-")) {
      parts.push(
        <button
          key={matchStart}
          type="button"
          onClick={() =>
            onOpenCitation?.({
              type: "audit",
              label: token,
              id: token,
              link: `/audits?search=${encodeURIComponent(token)}`,
            })
          }
          className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded font-mono text-[11px] font-semibold bg-white/10 text-white border border-white/20 hover:border-white transition-colors cursor-pointer"
        >
          <span>{token}</span>
        </button>
      );
    }
    // Standalone CAPA-
    else if (token.startsWith("CAPA-")) {
      parts.push(
        <span
          key={matchStart}
          className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded font-mono text-[11px] font-semibold bg-[#C6B9D8]/15 text-[#C6B9D8] border border-[#C6B9D8]/30"
        >
          {token}
        </span>
      );
    }
    // Standalone FAC-
    else if (token.startsWith("FAC-")) {
      parts.push(
        <button
          key={matchStart}
          type="button"
          onClick={() =>
            onOpenCitation?.({
              type: "facility",
              label: token,
              id: token,
              link: `/facilities`,
            })
          }
          className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded font-mono text-[11px] font-semibold bg-white/10 text-white border border-white/15 hover:border-white transition-colors cursor-pointer"
        >
          <Building2 className="w-2.5 h-2.5 text-[#C6B9D8]" />
          <span>{token}</span>
        </button>
      );
    }
    // Standalone EVID-
    else if (token.startsWith("EVID-")) {
      parts.push(
        <span
          key={matchStart}
          className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded font-mono text-[10.5px] bg-white/5 text-zinc-300 border border-white/15"
        >
          <FileText className="w-2.5 h-2.5 text-[#F3D0C0]" />
          {token}
        </span>
      );
    }
    // Regulatory Standards
    else {
      parts.push(
        <span
          key={matchStart}
          className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded font-mono text-[11px] font-medium bg-zinc-800 text-zinc-200 border border-zinc-700"
        >
          {token}
        </span>
      );
    }

    lastIndex = matchEnd;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

/**
 * Renders markdown pipe tables as clean, styled, scrollable tables
 */
function renderMarkdownTable(
  tableText: string,
  onOpenCitation?: (c: CitationItem) => void
) {
  const lines = tableText
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("|"));
  if (lines.length < 2) return null;

  const headerLine = lines[0];
  const dataLines = lines.slice(1).filter((l) => !l.match(/^\|[-:\s|]+\|$/));

  const parseRow = (line: string) =>
    line
      .split("|")
      .slice(1, -1)
      .map((c) => c.trim().replace(/<br\s*\/?>/gi, " "));

  const headers = parseRow(headerLine);
  if (headers.length === 0) return null;

  return (
    <div className="overflow-x-auto my-3 rounded-xl border border-white/10 bg-black/50 shadow-inner">
      <table className="w-full text-left text-xs border-collapse min-w-[500px]">
        <thead>
          <tr className="border-b border-white/15 bg-white/[0.04]">
            {headers.map((h, i) => (
              <th
                key={i}
                className="py-2.5 px-3.5 font-mono font-semibold text-[11px] text-[#C6B9D8] uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 font-sans">
          {dataLines.map((rowLine, rIdx) => {
            const cells = parseRow(rowLine);
            return (
              <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                {cells.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    className="py-2.5 px-3.5 text-zinc-200 text-xs align-top leading-relaxed"
                  >
                    {renderFormattedInlineText(cell, onOpenCitation)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function StructuredAgentResponse({
  content,
  isUser = false,
  onOpenCitation,
}: StructuredAgentResponseProps) {
  const [memoryExpanded, setMemoryExpanded] = useState(false);

  if (isUser) {
    return (
      <div className="whitespace-pre-wrap leading-relaxed font-sans text-xs sm:text-sm text-white">
        {content}
      </div>
    );
  }

  // -------------------------------------------------------------
  // PATTERN 1: Generic Markdown Sections (### Heading)
  // -------------------------------------------------------------
  if (content.includes("### ")) {
    const rawSections = content.split(/(?=###\s+)/);

    return (
      <div className="space-y-3.5 font-sans">
        {rawSections.map((sec, idx) => {
          const trimmed = sec.trim();
          if (!trimmed) return null;

          const lines = trimmed.split("\n");
          const headerLine = lines[0].replace(/^###\s+/, "").trim();
          const body = lines.slice(1).join("\n").trim();
          const titleLower = headerLine.toLowerCase();

          // Determine Card Theme & Icon
          let cardBg = "bg-[#121214] border-white/15";
          let icon = <FileText className="w-3.5 h-3.5 text-white" />;
          let iconBg = "bg-white/10 text-white";
          let titleColor = "text-white";
          let badge: string | null = null;

          if (titleLower.includes("summary") || titleLower.includes("executive") || titleLower.includes("answer") || titleLower.includes("what we found")) {
            cardBg = "bg-[#14121a]/70 border-[#C6B9D8]/25";
            icon = <Sparkles className="w-3.5 h-3.5 text-[#C6B9D8]" />;
            iconBg = "bg-[#C6B9D8]/20 text-[#C6B9D8]";
            titleColor = "text-[#C6B9D8]";
          } else if (titleLower.includes("finding") || titleLower.includes("evidence") || titleLower.includes("standard")) {
            cardBg = "bg-[#111113] border-white/15";
            icon = <Search className="w-3.5 h-3.5 text-[#D5A6B5]" />;
            iconBg = "bg-[#D5A6B5]/20 text-[#D5A6B5]";
            titleColor = "text-[#D5A6B5]";
          } else if (titleLower.includes("memory") || titleLower.includes("hindsight") || titleLower.includes("pattern") || titleLower.includes("precedent") || titleLower.includes("recurrence")) {
            cardBg = "bg-[#131217] border-[#C6B9D8]/20";
            icon = <Brain className="w-3.5 h-3.5 text-[#C6B9D8]" />;
            iconBg = "bg-[#C6B9D8]/20 text-[#C6B9D8]";
            titleColor = "text-[#C6B9D8]";
            badge = "Hindsight Memory Bank";
          } else if (titleLower.includes("action") || titleLower.includes("recommend") || titleLower.includes("control") || titleLower.includes("solution")) {
            cardBg = "bg-emerald-950/20 border-emerald-500/30";
            icon = <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />;
            iconBg = "bg-emerald-500/20 text-emerald-400";
            titleColor = "text-emerald-400";
          }

          // Check if body contains table
          const hasTable = body.includes("|") && body.includes("---");

          return (
            <div
              key={idx}
              className={`p-3.5 sm:p-4 rounded-xl ${cardBg} shadow-subtle space-y-2.5`}
            >
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-md ${iconBg} flex items-center justify-center`}>
                    {icon}
                  </div>
                  <span className={`text-[11px] font-bold tracking-wider uppercase font-mono ${titleColor}`}>
                    {headerLine}
                  </span>
                </div>

                {badge && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#C6B9D8]/10 text-[#C6B9D8] border border-[#C6B9D8]/20">
                    {badge}
                  </span>
                )}
              </div>

              {/* Render Table if present */}
              {hasTable ? (
                renderMarkdownTable(body, onOpenCitation)
              ) : (
                /* Render Paragraphs or Bullet Points */
                <div className="space-y-2 text-xs sm:text-sm text-zinc-100 leading-relaxed">
                  {body.split("\n\n").map((para, pIdx) => {
                    const trimmedPara = para.trim();
                    if (trimmedPara.startsWith("- ") || trimmedPara.startsWith("* ") || trimmedPara.startsWith("• ")) {
                      const bullets = trimmedPara.split("\n").filter((b) => b.trim().length > 0);
                      return (
                        <div key={pIdx} className="space-y-1.5 pl-1">
                          {bullets.map((bullet, bIdx) => (
                            <div key={bIdx} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#C6B9D8] mt-1.5 shrink-0" />
                              <div className="flex-1 leading-relaxed text-zinc-200">
                                {renderFormattedInlineText(bullet.replace(/^[-*•]\s*/, ""), onOpenCitation)}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    }
                    return (
                      <div key={pIdx}>
                        {renderFormattedInlineText(trimmedPara, onOpenCitation)}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // -------------------------------------------------------------
  // PATTERN 2: Formal 8-Point Compliance Report
  // -------------------------------------------------------------
  if (content.includes("1. **Finding**") && content.includes("8. **Recommended Next Action**")) {
    const pointsRegex =
      /([1-8])\.\s+\*\*([^*]+)\*\*:\s*([\s\S]*?)(?=(?:[1-8]\.\s+\*\*|$))/g;
    const items: { num: string; title: string; body: string }[] = [];
    let match: RegExpExecArray | null;

    while ((match = pointsRegex.exec(content)) !== null) {
      items.push({
        num: match[1],
        title: match[2].trim(),
        body: match[3].trim(),
      });
    }

    return (
      <div className="space-y-3 font-sans">
        <div className="p-2.5 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-white flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-[#C6B9D8]" />
            Formal Compliance Investigation Report (8-Point Contract)
          </span>
          <span className="text-[10px] font-mono text-zinc-400">Verified Deterministic Schema</span>
        </div>

        <div className="space-y-2">
          {items.map((it) => (
            <div
              key={it.num}
              className="p-3 rounded-xl bg-[#121214] border border-white/10 hover:border-white/20 transition space-y-1.5"
            >
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-white/10 flex items-center justify-center font-mono text-[10px] font-bold text-white">
                  0{it.num}
                </span>
                <span className="text-xs font-semibold text-white tracking-wide">{it.title}</span>
              </div>
              <div className="text-xs sm:text-sm text-zinc-200 pl-7 leading-relaxed whitespace-pre-wrap">
                {renderFormattedInlineText(it.body, onOpenCitation)}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // PATTERN 3: Direct Verdict Callout (Type D / Durability)
  // -------------------------------------------------------------
  const lines = content.split("\n\n");
  const firstBlock = lines[0]?.trim() || "";

  // Check if first line is a highlighted bold verdict
  if (firstBlock.startsWith("**") && firstBlock.endsWith("**") && lines.length > 1) {
    const verdictText = firstBlock.slice(2, -2);
    const isNegative = verdictText.toLowerCase().startsWith("no") || verdictText.includes("failed");
    const isPositive = verdictText.toLowerCase().startsWith("yes") || verdictText.includes("permanently") || verdictText.includes("effective");

    return (
      <div className="space-y-3 font-sans">
        {/* Executive Verdict Banner */}
        <div
          className={`p-4 rounded-xl border shadow-subtle flex items-start gap-3 ${
            isNegative
              ? "bg-red-950/20 border-red-500/30 text-red-200"
              : isPositive
              ? "bg-emerald-950/20 border-emerald-500/30 text-emerald-100"
              : "bg-white/10 border-white/20 text-white"
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {isNegative ? (
              <XCircle className="w-5 h-5 text-red-400" />
            ) : isPositive ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <AlertCircle className="w-5 h-5 text-white" />
            )}
          </div>
          <div className="space-y-1">
            <div className="text-[10px] font-mono uppercase tracking-wider opacity-80">
              Executive Determination
            </div>
            <div className="text-sm font-semibold text-white leading-snug">
              {verdictText}
            </div>
          </div>
        </div>

        {/* Remaining Supporting Blocks */}
        <div className="space-y-2.5">
          {lines.slice(1).map((blk, bidx) => (
            <div
              key={bidx}
              className="text-xs sm:text-sm text-zinc-100 leading-relaxed whitespace-pre-wrap"
            >
              {renderFormattedInlineText(blk, onOpenCitation)}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // PATTERN 4: Standard Scannable High-Contrast Answer
  // -------------------------------------------------------------
  return (
    <div className="space-y-2.5 font-sans leading-relaxed text-xs sm:text-sm text-zinc-100 whitespace-pre-wrap">
      {renderFormattedInlineText(content, onOpenCitation)}
    </div>
  );
}
