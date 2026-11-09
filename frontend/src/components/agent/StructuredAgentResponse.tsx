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
  // PATTERN 1: Modular Investigation (### WHAT WE FOUND, etc.)
  // -------------------------------------------------------------
  if (content.includes("### WHAT WE FOUND") || content.includes("### HISTORICAL PATTERN")) {
    const rawSections = content.split(/(?=###\s+[A-Z\s]+)/);

    return (
      <div className="space-y-3.5 font-sans">
        {rawSections.map((sec, idx) => {
          const trimmed = sec.trim();
          if (!trimmed) return null;

          // WHAT WE FOUND
          if (trimmed.startsWith("### WHAT WE FOUND")) {
            const body = trimmed.replace("### WHAT WE FOUND", "").trim();
            return (
              <div
                key={idx}
                className="p-3.5 sm:p-4 rounded-xl bg-[#14121a]/70 border border-[#C6B9D8]/25 shadow-subtle space-y-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-[#C6B9D8]/20 flex items-center justify-center text-[#C6B9D8]">
                    <Search className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#C6B9D8] font-mono">
                    What We Found
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-white leading-relaxed">
                  {renderFormattedInlineText(body, onOpenCitation)}
                </div>
              </div>
            );
          }

          // HISTORICAL PATTERN
          if (trimmed.startsWith("### HISTORICAL PATTERN")) {
            const body = trimmed.replace("### HISTORICAL PATTERN", "").trim();
            const lines = body.split("\n").filter((l) => l.trim().length > 0);

            return (
              <div
                key={idx}
                className="p-3.5 sm:p-4 rounded-xl bg-[#121214] border border-white/15 shadow-subtle space-y-2.5"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-[#D5A6B5]/20 flex items-center justify-center text-[#D5A6B5]">
                    <History className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#D5A6B5] font-mono">
                    Historical Pattern & Recurrence
                  </span>
                </div>
                <div className="space-y-1.5 pl-1">
                  {lines.map((line, lidx) => (
                    <div key={lidx} className="flex items-start gap-2 text-xs sm:text-sm text-zinc-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D5A6B5] mt-1.5 shrink-0" />
                      <div className="flex-1 leading-relaxed">
                        {renderFormattedInlineText(line.replace(/^-\s*/, ""), onOpenCitation)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          }

          // POSSIBLE EXPLANATION
          if (trimmed.startsWith("### POSSIBLE EXPLANATION")) {
            const body = trimmed.replace("### POSSIBLE EXPLANATION", "").trim();
            return (
              <div
                key={idx}
                className="p-3.5 sm:p-4 rounded-xl bg-[#181312]/60 border border-[#F3D0C0]/25 shadow-subtle space-y-2"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-[#F3D0C0]/20 flex items-center justify-center text-[#F3D0C0]">
                    <Brain className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-[#F3D0C0] font-mono">
                    Root Cause Analysis & Mechanism
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-zinc-100 leading-relaxed">
                  {renderFormattedInlineText(body, onOpenCitation)}
                </div>
              </div>
            );
          }

          // RECOMMENDED NEXT STEP
          if (trimmed.startsWith("### RECOMMENDED NEXT STEP")) {
            const body = trimmed.replace("### RECOMMENDED NEXT STEP", "").trim();
            const requiresHumanApproval =
              body.toLowerCase().includes("human approval") ||
              body.toLowerCase().includes("requires human");

            return (
              <div
                key={idx}
                className="p-3.5 sm:p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 shadow-subtle space-y-2.5"
              >
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[11px] font-bold tracking-wider uppercase text-emerald-400 font-mono">
                      Recommended Next Action
                    </span>
                  </div>

                  {requiresHumanApproval && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950/50 text-amber-300 border border-amber-500/40">
                      <Lock className="w-2.5 h-2.5" />
                      Human Approval Gate Enforced
                    </span>
                  )}
                </div>
                <div className="text-xs sm:text-sm text-zinc-100 leading-relaxed">
                  {renderFormattedInlineText(body, onOpenCitation)}
                </div>
              </div>
            );
          }

          // EVIDENCE
          if (trimmed.startsWith("### EVIDENCE")) {
            const body = trimmed.replace("### EVIDENCE", "").trim();
            const lines = body.split("\n").filter((l) => l.trim().length > 0);
            const memoryLine = lines.find((l) => l.toLowerCase().includes("historical memory used"));
            const otherLines = lines.filter((l) => !l.toLowerCase().includes("historical memory used"));

            return (
              <div
                key={idx}
                className="p-3.5 sm:p-4 rounded-xl bg-[#111113] border border-white/15 shadow-subtle space-y-2.5"
              >
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-white/15 flex items-center justify-center text-white">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] font-bold tracking-wider uppercase text-white font-mono">
                    Evidentiary Grounding
                  </span>
                </div>

                <div className="space-y-1.5 pl-1">
                  {otherLines.map((line, oidx) => (
                    <div key={oidx} className="flex items-start gap-2 text-xs text-zinc-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/40 mt-1.5 shrink-0" />
                      <div className="flex-1 leading-relaxed">
                        {renderFormattedInlineText(line.replace(/^-\s*/, ""), onOpenCitation)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Expandable Historical Memory Pill */}
                {memoryLine && (
                  <div className="pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => setMemoryExpanded((prev) => !prev)}
                      className="w-full flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-left transition cursor-pointer text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Brain className="w-3.5 h-3.5 text-[#C6B9D8]" />
                        <span className="font-mono text-[11px] text-[#C6B9D8] font-semibold">
                          Historical Memory Used: Hindsight Episodic Bank
                        </span>
                      </div>
                      {memoryExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-zinc-400" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                      )}
                    </button>

                    {memoryExpanded && (
                      <div className="mt-2 p-2.5 rounded-lg bg-[#14121a] border border-[#C6B9D8]/30 text-xs text-zinc-200 leading-relaxed font-sans">
                        {renderFormattedInlineText(
                          memoryLine.replace(/^-\s*/, "").replace(/^Historical memory used:\s*/i, ""),
                          onOpenCitation
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          }

          // Fallback generic section
          return (
            <div key={idx} className="text-xs sm:text-sm text-zinc-100 leading-relaxed">
              {renderFormattedInlineText(trimmed, onOpenCitation)}
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
