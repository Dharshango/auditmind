"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Bot,
  User,
  Send,
  Sparkles,
  Layers,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  FileText,
  Brain,
  Hash,
  Terminal,
  Activity,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Cpu,
  Trash2,
  Database,
  ShieldAlert,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  Plus,
  ExternalLink,
  Pin,
  Edit3,
  X,
  Filter,
  ArrowUpRight,
  History,
  Building2,
  Paperclip,
  HelpCircle,
  Info,
  RotateCcw,
  Calendar,
  MapPin,
} from "lucide-react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface ToolExecution {
  tool?: string;
  tool_name?: string;
  name?: string;
  args?: Record<string, any>;
  arguments?: Record<string, any>;
  output?: any;
}

interface CitationItem {
  type: "finding" | "audit" | "facility" | "evidence";
  label: string;
  id?: string;
  link: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  facilityScope?: string;
  auditScope?: string;
  attachedEvidence?: string;
  structuredReport?: any;
  toolCalls?: ToolExecution[];
  hindsightUsed?: boolean;
  citations?: CitationItem[];
  suggestedFollowUps?: string[];
  feedback?: "up" | "down" | null;
}

interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  pinned?: boolean;
  messages: Message[];
}

const STORAGE_KEY = "auditmind_agent_sessions_v3";

const BENCHMARK_SCENARIOS = [
  {
    id: "scenario-a",
    title: "Systemic Recurrence Vectors",
    badge: "Failure Recurrence",
    facility: "All facilities",
    prompt: "Identify systemic egress and fire safety recurrence vectors across manufacturing and warehouse facilities.",
    followUps: [
      "What was the root cause of the egress blockages?",
      "Why did the earlier corrective action fail to hold?",
      "Compare fire safety compliance between Plant A and Plant B",
    ],
  },
  {
    id: "scenario-b",
    title: "CAPA Mitigation Durability",
    badge: "90-Day Verification",
    facility: "All facilities",
    prompt: "Evaluate CAPA durability: Why did stamping press interlock mitigations fail in subsequent audits?",
    followUps: [
      "Show 90-day verification outcomes for press interlocks",
      "What physical engineering control is recommended?",
      "How many total machine guarding findings recurred?",
    ],
  },
  {
    id: "scenario-c",
    title: "Cross-Facility Risk Topology",
    badge: "Regulatory Vulnerability",
    facility: "5 Sites",
    prompt: "Synthesize cross-facility risk exposure and regulatory vulnerability rankings between Plant A and Warehouse B.",
    followUps: [
      "Which facility has the highest critical finding count?",
      "Compare Plant A and Plant B recurring rates",
      "Show historical audit scores for Warehouse A",
    ],
  },
  {
    id: "scenario-d",
    title: "Forensic Non-Conformance Analysis",
    badge: "Statutory Citation",
    facility: "Plant A",
    prompt: "Analyze root-cause failure and statutory liability behind critical non-conformance FIND-2026-001.",
    followUps: [
      "Inspect photographic evidence for FIND-2026-001",
      "What NFPA standard was cited?",
      "Show previous corrective actions for this finding",
    ],
  },
];

export default function AgentPage() {
  // --- Sessions & State ---
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string>("");
  const [searchSessionQuery, setSearchSessionQuery] = useState("");

  // --- UI Panes ---
  const [isLeftRailOpen, setIsLeftRailOpen] = useState(true);
  const [isRightInspectorOpen, setIsRightInspectorOpen] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<"context" | "memory" | "activity">("context");
  const [mobileLeftOpen, setMobileLeftOpen] = useState(false);
  const [mobileRightOpen, setMobileRightOpen] = useState(false);

  // --- Session Management Editing ---
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitleInput, setEditTitleInput] = useState("");
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  // --- Live Data for Scope Selectors ---
  const [availableFacilities, setAvailableFacilities] = useState<any[]>([]);
  const [availableAudits, setAvailableAudits] = useState<any[]>([]);
  const [availableEvidence, setAvailableEvidence] = useState<any[]>([]);

  // --- Composer Scope & Attachment State ---
  const [input, setInput] = useState("");
  const [selectedFacility, setSelectedFacility] = useState("ALL");
  const [selectedAudit, setSelectedAudit] = useState("ALL");
  const [attachedEvidenceName, setAttachedEvidenceName] = useState<string | null>(null);
  const [inquestDepth, setInquestDepth] = useState<"standard" | "deep">("standard");
  const [showScopePicker, setShowScopePicker] = useState(false);
  const [showEvidencePicker, setShowEvidencePicker] = useState(false);

  // --- Execution & Loading ---
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState("Analyzing compliance query...");
  const [expandedToolTraces, setExpandedToolTraces] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // --- Live Agent Events & Inspector Modal ---
  const [agentEvents, setAgentEvents] = useState<any[]>([]);
  const [refreshingEvents, setRefreshingEvents] = useState(false);
  const [activeModalCitation, setActiveModalCitation] = useState<CitationItem | null>(null);
  const [modalDetails, setModalDetails] = useState<any | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --- Load Live Facilities, Audits & Evidence for Context Picker ---
  useEffect(() => {
    async function loadScopeData() {
      try {
        const [facData, audData, fndData] = await Promise.all([
          api.getFacilities().catch(() => ({ facilities: [] })),
          api.getAudits("limit=30").catch(() => ({ audits: [] })),
          api.getFindings("limit=15").catch(() => ({ findings: [] })),
        ]);

        if (facData.facilities) setAvailableFacilities(facData.facilities);
        if (audData.audits) setAvailableAudits(audData.audits);

        // Gather sample evidence files from findings
        const sampleFiles: any[] = [];
        const findings = fndData.findings || [];
        findings.forEach((f: any) => {
          if (f.evidence && f.evidence.length > 0) {
            f.evidence.forEach((ev: any) => {
              sampleFiles.push({
                name: ev.file_name || "Inspection_Photo.jpg",
                path: ev.file_path,
                finding: f.finding_code,
              });
            });
          } else {
            sampleFiles.push({
              name: `${f.finding_code}_Report.pdf`,
              path: `/evidence/${f.finding_code}.pdf`,
              finding: f.finding_code,
            });
          }
        });
        setAvailableEvidence(sampleFiles.slice(0, 6));
      } catch (err) {
        console.warn("Could not preload scope picker data:", err);
      }
    }
    loadScopeData();
  }, []);

  // --- Session Initialization from localStorage ---
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: Conversation[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setConversations(parsed);
          setActiveSessionId(parsed[0].id);
          return;
        }
      }
    } catch (e) {
      console.warn("Could not load stored agent sessions:", e);
    }

    // Default first session
    const initialSession: Conversation = {
      id: "session-" + Date.now(),
      title: "New compliance investigation",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    setConversations([initialSession]);
    setActiveSessionId(initialSession.id);
  }, []);

  // --- Save to localStorage ---
  useEffect(() => {
    if (conversations.length > 0) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
      } catch (e) {
        console.warn("Could not persist agent sessions:", e);
      }
    }
  }, [conversations]);

  // --- Load live agent events from backend ---
  useEffect(() => {
    loadAgentEvents();
  }, []);

  // --- Auto-scroll to latest message ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, activeSessionId, loading]);

  // --- Auto-resize textarea ---
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [input]);

  const activeSession = useMemo(() => {
    return conversations.find((c) => c.id === activeSessionId) || conversations[0];
  }, [conversations, activeSessionId]);

  const activeMessages = useMemo(() => {
    return activeSession?.messages || [];
  }, [activeSession]);

  async function loadAgentEvents() {
    try {
      setRefreshingEvents(true);
      const data = await api.getAgentEvents(10);
      setAgentEvents(data.events || data || []);
    } catch (err) {
      console.error("Failed to load agent audit events:", err);
    } finally {
      setRefreshingEvents(false);
    }
  }

  // --- Citation & Hindsight Extraction ---
  function parseCitationsAndHindsight(text: string, toolsUsed: ToolExecution[] = []) {
    const citations: CitationItem[] = [];
    const seen = new Set<string>();

    // 1. Findings (e.g. FIND-2026-TEST-01, FND-001)
    const findingMatches = text.match(/\b(FIND-[A-Z0-9-]+|FND-[A-Z0-9-]+)\b/g);
    if (findingMatches) {
      findingMatches.forEach((code) => {
        if (!seen.has(code)) {
          seen.add(code);
          citations.push({
            type: "finding",
            label: code,
            id: code,
            link: `/findings?search=${encodeURIComponent(code)}`,
          });
        }
      });
    }

    // 2. Audits (e.g. AUD-2026-TEST-INGEST-01, AUD-2024-001)
    const auditMatches = text.match(/\b(AUD-[A-Z0-9-]+)\b/g);
    if (auditMatches) {
      auditMatches.forEach((code) => {
        if (!seen.has(code)) {
          seen.add(code);
          citations.push({
            type: "audit",
            label: code,
            id: code,
            link: `/audits?search=${encodeURIComponent(code)}`,
          });
        }
      });
    }

    // 3. Facilities
    const facilityMatches = text.match(/\b(FAC-00[1-5]|FAC-0[1-5])\b/g);
    if (facilityMatches) {
      facilityMatches.forEach((code) => {
        if (!seen.has(code)) {
          seen.add(code);
          citations.push({
            type: "facility",
            label: code,
            id: code,
            link: `/facilities`,
          });
        }
      });
    }

    // Check if Hindsight memory was recalled
    const hindsightUsed =
      toolsUsed.some((t: any) => {
        const name = (t.tool || t.tool_name || t.name || "").toLowerCase();
        return name.includes("recall") || name.includes("memory") || name.includes("hindsight");
      }) ||
      text.toLowerCase().includes("hindsight") ||
      text.toLowerCase().includes("recalled") ||
      text.toLowerCase().includes("memory bank");

    return { citations, hindsightUsed };
  }

  // --- Generate Smart Follow-up Questions ---
  function generateFollowUps(query: string, responseText: string): string[] {
    const qLower = query.toLowerCase();
    const rLower = responseText.toLowerCase();

    if (qLower.includes("fire") || rLower.includes("egress") || rLower.includes("fire")) {
      return [
        "Why did the earlier corrective action fail to hold?",
        "Compare fire safety compliance between Plant A and Plant B",
        "Draft an engineered physical barrier specification",
      ];
    }
    if (qLower.includes("guard") || rLower.includes("interlock") || rLower.includes("machine")) {
      return [
        "Show 90-day verification records for machine interlocks",
        "What physical engineering control prevents bypasses?",
        "Show all past audits citing stamping press line #4",
      ];
    }
    if (qLower.includes("forklift") || rLower.includes("training") || rLower.includes("certification")) {
      return [
        "Did certification lapses correlate with peak production?",
        "Show all employees with expired forklift certifications",
        "Set up an automated 60-day recertification alert",
      ];
    }
    if (qLower.includes("berm") || rLower.includes("containment") || rLower.includes("chemical")) {
      return [
        "Show photographic evidence of the reconstructed berm",
        "Check environmental inspection logs for Plant B",
        "Compare secondary containment systems across all plants",
      ];
    }

    return [
      "What was the root cause of this compliance failure?",
      "Did this problem recur at any other facility?",
      "Generate an executive compliance briefing",
    ];
  }

  // --- Session CRUD Operations ---
  const handleNewSession = () => {
    const newSession: Conversation = {
      id: "session-" + Date.now(),
      title: "New compliance investigation",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: [],
    };
    setConversations((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setInput("");
    setSelectedFacility("ALL");
    setSelectedAudit("ALL");
    setAttachedEvidenceName(null);
    setMobileLeftOpen(false);
  };

  const handleTogglePin = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConversations((prev) =>
      prev.map((c) => (c.id === sessionId ? { ...c, pinned: !c.pinned } : c))
    );
  };

  const handleStartRename = (session: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSessionId(session.id);
    setEditTitleInput(session.title);
  };

  const handleSaveRename = (sessionId: string, e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!editTitleInput.trim()) return;

    setConversations((prev) =>
      prev.map((c) =>
        c.id === sessionId
          ? { ...c, title: editTitleInput.trim(), updatedAt: new Date().toISOString() }
          : c
      )
    );
    setEditingSessionId(null);
  };

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const remaining = conversations.filter((c) => c.id !== sessionId);
    if (remaining.length === 0) {
      const fresh: Conversation = {
        id: "session-" + Date.now(),
        title: "New compliance investigation",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        messages: [],
      };
      setConversations([fresh]);
      setActiveSessionId(fresh.id);
    } else {
      setConversations(remaining);
      if (activeSessionId === sessionId) {
        setActiveSessionId(remaining[0].id);
      }
    }
    setDeletingSessionId(null);
  };

  // --- Date Grouping Helper ---
  const groupedSessions = useMemo(() => {
    const query = searchSessionQuery.toLowerCase().trim();
    const filtered = conversations.filter((c) =>
      query ? c.title.toLowerCase().includes(query) : true
    );

    const now = new Date();
    const today: Conversation[] = [];
    const yesterday: Conversation[] = [];
    const previousWeek: Conversation[] = [];
    const older: Conversation[] = [];

    const pinned = filtered.filter((c) => c.pinned);
    const unpinned = filtered.filter((c) => !c.pinned);

    unpinned.forEach((c) => {
      const date = new Date(c.updatedAt || c.createdAt);
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays === 0) today.push(c);
      else if (diffDays === 1) yesterday.push(c);
      else if (diffDays <= 7) previousWeek.push(c);
      else older.push(c);
    });

    return { pinned, today, yesterday, previousWeek, older };
  }, [conversations, searchSessionQuery]);

  // --- Message Sending Execution ---
  async function handleSend(queryOverride?: string, customFacility?: string) {
    const textToSend = (queryOverride || input).trim();
    if (!textToSend || loading) return;

    const facilityToUse = customFacility || selectedFacility;
    const auditToUse = selectedAudit;
    const evidenceToUse = attachedEvidenceName;

    const userMessage: Message = {
      id: "msg-" + Date.now(),
      role: "user",
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      facilityScope: facilityToUse !== "ALL" ? facilityToUse : undefined,
      auditScope: auditToUse !== "ALL" ? auditToUse : undefined,
      attachedEvidence: evidenceToUse || undefined,
    };

    // Update conversation with user message & auto-generate title if first message
    const currentSession = activeSession;
    const isFirstMessage = currentSession ? currentSession.messages.length === 0 : true;
    const autoTitle =
      isFirstMessage && currentSession?.title === "New compliance investigation"
        ? textToSend.slice(0, 38) + (textToSend.length > 38 ? "..." : "")
        : currentSession?.title || "Compliance inquiry";

    const updatedMessages = [...(currentSession?.messages || []), userMessage];

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeSessionId
          ? {
              ...c,
              title: autoTitle,
              messages: updatedMessages,
              updatedAt: new Date().toISOString(),
            }
          : c
      )
    );

    if (!queryOverride) setInput("");
    setLoading(true);
    setLoadingStep("Searching audit database records...");

    try {
      // Step feedback animation
      const timer1 = setTimeout(() => {
        setLoadingStep("Recalling Hindsight organizational memory...");
      }, 700);
      const timer2 = setTimeout(() => {
        setLoadingStep("Verifying 90-day CAPA durability outcomes...");
      }, 1400);
      const timer3 = setTimeout(() => {
        setLoadingStep("Synthesizing compliance findings with Groq LLaMA 3.3 70B...");
      }, 2100);

      // Context prefix if facility, audit, or evidence attached
      let finalMessage = textToSend;
      if (facilityToUse !== "ALL") {
        finalMessage = `[Scope: Target Facility ${facilityToUse}] ${finalMessage}`;
      }
      if (auditToUse !== "ALL") {
        finalMessage = `[Scope: Reference Audit ${auditToUse}] ${finalMessage}`;
      }
      if (evidenceToUse) {
        finalMessage = `[Attached Evidence Artifact: ${evidenceToUse}] ${finalMessage}`;
      }
      if (inquestDepth === "deep") {
        finalMessage = `[Mode: Deep Cross-Facility Investigation] ${finalMessage}`;
      }

      const historyPayload = (currentSession?.messages || []).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const response = await api.chatWithAgent(finalMessage, historyPayload);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      const rawResponseText =
        response.response ||
        response.content ||
        response.message ||
        "Investigation complete.";

      const toolsUsed = response.tools_used || response.tool_calls || [];
      const { citations, hindsightUsed } = parseCitationsAndHindsight(rawResponseText, toolsUsed);
      const followUps = generateFollowUps(textToSend, rawResponseText);

      const assistantMessage: Message = {
        id: "msg-" + (Date.now() + 1),
        role: "assistant",
        content: rawResponseText,
        structuredReport: response.structured_report || response.data || null,
        toolCalls: toolsUsed,
        hindsightUsed,
        citations,
        suggestedFollowUps: followUps,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeSessionId
            ? {
                ...c,
                messages: [...c.messages, assistantMessage],
                updatedAt: new Date().toISOString(),
              }
            : c
        )
      );

      await loadAgentEvents();
    } catch (err: any) {
      console.error("Agent chat failed:", err);
      const errorMessage: Message = {
        id: "msg-" + (Date.now() + 1),
        role: "assistant",
        content: `**Agent Execution Note**: ${
          err.message || "Failed to reach compliance agent backend."
        }\n\nPlease verify backend service is running on port 8000.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeSessionId
            ? {
                ...c,
                messages: [...c.messages, errorMessage],
                updatedAt: new Date().toISOString(),
              }
            : c
        )
      );
    } finally {
      setLoading(false);
      setLoadingStep("Analyzing compliance query...");
    }
  }

  // --- Keyboard Handling (Enter to Send, Shift+Enter for Newline) ---
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleFeedback = (messageId: string, type: "up" | "down") => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeSessionId
          ? {
              ...c,
              messages: c.messages.map((m) =>
                m.id === messageId ? { ...m, feedback: m.feedback === type ? null : type } : m
              ),
            }
          : c
      )
    );
  };

  const toggleToolTrace = (messageId: string) => {
    setExpandedToolTraces((prev) => ({
      ...prev,
      [messageId]: !prev[messageId],
    }));
  };

  // --- Open Citation Modal Inspector ---
  async function handleOpenCitation(cit: CitationItem) {
    setActiveModalCitation(cit);
    setModalLoading(true);
    setModalDetails(null);

    try {
      if (cit.type === "finding" && cit.id) {
        const data = await api.getFinding(cit.id);
        setModalDetails(data);
      } else if (cit.type === "audit" && cit.id) {
        const data = await api.getAudit(cit.id);
        setModalDetails(data);
      } else {
        setModalDetails({ label: cit.label, type: cit.type });
      }
    } catch (e) {
      console.warn("Could not load citation details:", e);
      setModalDetails({ label: cit.label, note: "Loaded via search index" });
    } finally {
      setModalLoading(false);
    }
  }

  // --- Context Inspector Derived Data ---
  const conversationContextData = useMemo(() => {
    const facilitiesSet = new Set<string>();
    const auditsSet = new Set<string>();
    const findingsSet = new Set<string>();
    let totalToolsCalled = 0;
    let hindsightRecalls = 0;

    activeMessages.forEach((m) => {
      if (m.facilityScope) facilitiesSet.add(m.facilityScope);
      if (m.auditScope) auditsSet.add(m.auditScope);
      m.citations?.forEach((cit) => {
        if (cit.type === "facility") facilitiesSet.add(cit.label);
        if (cit.type === "audit") auditsSet.add(cit.label);
        if (cit.type === "finding") findingsSet.add(cit.label);
      });
      if (m.toolCalls) {
        totalToolsCalled += m.toolCalls.length;
        m.toolCalls.forEach((t: any) => {
          const name = (t.tool || t.tool_name || t.name || "").toLowerCase();
          if (name.includes("recall") || name.includes("memory")) {
            hindsightRecalls++;
          }
        });
      }
    });

    return {
      facilities: Array.from(facilitiesSet),
      audits: Array.from(auditsSet),
      findings: Array.from(findingsSet),
      totalToolsCalled,
      hindsightRecalls,
    };
  }, [activeMessages]);

  return (
    <div className="space-y-4 pb-6 max-w-[1600px] mx-auto">
      {/* =========================================================================
          TOP APPLICATION HEADER (Crisp, Purpose-Built)
          ========================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono font-semibold text-white uppercase tracking-[0.12em] flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              COGNITIVE REASONING ENGINE • HINDSIGHT v1.2 ACTIVE
            </span>
            <span className="text-white/20">•</span>
            <span className="text-[11px] text-[#A3A3A3] font-mono">
              Groq LLaMA 3.3 70B Versatile
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-sans font-semibold text-white tracking-[-0.03em] flex items-center gap-2.5">
            <Bot className="w-7 h-7 text-white" />
            Autonomous Compliance &amp; Forensic Investigation Agent
          </h1>
          <p className="text-sm text-[#A3A3A3] mt-1 leading-relaxed max-w-3xl">
            Autonomous statutory compliance reasoning, episodic institutional memory recall, cross-facility recurrence diagnosis, and 90-day CAPA durability verification.
          </p>
        </div>

        {/* Top Control Bar */}
        <div className="flex items-center gap-2">
          {/* Quick New Inquiry Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={handleNewSession}
            icon={<Plus className="w-4 h-4" />}
          >
            New inquiry
          </Button>

          {/* Toggle History on Desktop */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsLeftRailOpen((v) => !v)}
            className="hidden lg:flex"
            icon={isLeftRailOpen ? <PanelLeftClose className="w-3.5 h-3.5" /> : <PanelLeftOpen className="w-3.5 h-3.5" />}
            title="Toggle conversation history"
          >
            {isLeftRailOpen ? "Hide history" : "History"}
          </Button>

          {/* Toggle Inspector on Desktop */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsRightInspectorOpen((v) => !v)}
            className="hidden lg:flex"
            icon={isRightInspectorOpen ? <PanelRightClose className="w-3.5 h-3.5" /> : <PanelRightOpen className="w-3.5 h-3.5" />}
            title="Toggle context inspector"
          >
            Context
          </Button>

          {/* Mobile Buttons */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setMobileLeftOpen(true)}
            className="lg:hidden"
            icon={<History className="w-3.5 h-3.5" />}
          >
            History
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setMobileRightOpen(true)}
            className="lg:hidden"
            icon={<Layers className="w-3.5 h-3.5" />}
          >
            Context
          </Button>
        </div>
      </div>

      {/* =========================================================================
          3-AREA MAIN WORKSPACE
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* =========================================================================
            AREA 1: Left Rail — Conversation History & Session Management
            ========================================================================= */}
        {isLeftRailOpen && (
          <div className="hidden lg:block lg:col-span-3 space-y-3">
            <Card className="p-3 space-y-3 bg-black border border-white/10 shadow-subtle">
              {/* Search Past Sessions */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-[#8E8E8E] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search past inquiries..."
                  value={searchSessionQuery}
                  onChange={(e) => setSearchSessionQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-[#101010] border border-white/10 rounded-lg text-xs text-white placeholder:text-[#71717A] focus:outline-none focus:border-white/15 transition"
                />
                {searchSessionQuery && (
                  <button
                    onClick={() => setSearchSessionQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E8E8E] hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Grouped Session List */}
              <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
                {/* Pinned Section */}
                {groupedSessions.pinned.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E8E] px-2 py-0.5 flex items-center gap-1 font-mono">
                      <Pin className="w-3 h-3 text-white rotate-45" />
                      Pinned
                    </div>
                    {groupedSessions.pinned.map((session) => renderSessionItem(session))}
                  </div>
                )}

                {/* Today */}
                {groupedSessions.today.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E8E] px-2 py-0.5 font-mono">
                      Today
                    </div>
                    {groupedSessions.today.map((session) => renderSessionItem(session))}
                  </div>
                )}

                {/* Yesterday */}
                {groupedSessions.yesterday.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E8E] px-2 py-0.5 font-mono">
                      Yesterday
                    </div>
                    {groupedSessions.yesterday.map((session) => renderSessionItem(session))}
                  </div>
                )}

                {/* Previous 7 Days */}
                {groupedSessions.previousWeek.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E8E] px-2 py-0.5 font-mono">
                      Previous 7 Days
                    </div>
                    {groupedSessions.previousWeek.map((session) => renderSessionItem(session))}
                  </div>
                )}

                {/* Older */}
                {groupedSessions.older.length > 0 && (
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E8E] px-2 py-0.5 font-mono">
                      Older
                    </div>
                    {groupedSessions.older.map((session) => renderSessionItem(session))}
                  </div>
                )}

                {conversations.length === 0 && (
                  <div className="text-center py-8 text-xs text-[#8E8E8E]">
                    No investigations yet.
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}

        {/* =========================================================================
            AREA 2: Center Workspace — Main Inquest Conversation & Composer
            ========================================================================= */}
        <div
          className={`${
            isLeftRailOpen && isRightInspectorOpen
              ? "lg:col-span-6"
              : isLeftRailOpen || isRightInspectorOpen
              ? "lg:col-span-9"
              : "lg:col-span-12"
          } bg-black border border-white/10 rounded-2xl flex flex-col h-[750px] overflow-hidden shadow-subtle transition-all`}
        >
          {/* Active Conversation Sub-header */}
          <div className="p-3 px-5 bg-[#101010]/80 border-b border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
              <h2 className="text-xs font-semibold text-white truncate font-sans">
                {activeSession?.title || "New compliance investigation"}
              </h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Badge variant="neutral" size="sm" className="font-mono text-[10px]">
                {activeMessages.length} message{activeMessages.length === 1 ? "" : "s"}
              </Badge>
            </div>
          </div>

          {/* Conversation Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {activeMessages.length === 0 ? (
              // Empty State / Welcome Screen
              <div className="h-full flex flex-col items-center justify-center max-w-xl mx-auto text-center space-y-6 py-8 px-4">
                <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white shadow-subtle">
                  <Brain className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-sans font-semibold text-white tracking-[-0.03em]">
                    What statutory deviation or compliance pattern would you like to investigate?
                  </h3>
                  <p className="text-xs sm:text-sm text-[#A3A3A3] max-w-lg mx-auto leading-relaxed">
                    Select a strategic compliance inquiry below, or pose an open question to traverse cross-facility audit ledgers, episodic incident history, and Hindsight institutional memory.
                  </p>
                </div>

                {/* 4 Benchmark Scenario Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full text-left pt-1">
                  {BENCHMARK_SCENARIOS.map((sc) => (
                    <button
                      key={sc.id}
                      onClick={() => handleSend(sc.prompt)}
                      disabled={loading}
                      className="p-3.5 bg-[#101010]/80 hover:bg-[#101010] border border-white/10 hover:border-white/15 rounded-xl transition-all space-y-2 group shadow-subtle text-left"
                    >
                      <div className="flex items-center justify-between">
                        <Badge variant="neutral" size="sm" className="text-[10px]">
                          {sc.badge}
                        </Badge>
                        <ArrowUpRight className="w-3.5 h-3.5 text-[#8E8E8E] group-hover:text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                      <div className="text-xs font-semibold text-white group-hover:text-white transition-colors leading-snug">
                        {sc.title}
                      </div>
                      <p className="text-[11px] text-[#8E8E8E] line-clamp-2 leading-relaxed">
                        {sc.prompt}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              // Message List
              activeMessages.map((m) => {
                const isUser = m.role === "user";

                return (
                  <div
                    key={m.id}
                    className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 mt-0.5 text-white shadow-subtle">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[85%] rounded-2xl p-4 sm:p-5 text-xs sm:text-sm leading-relaxed space-y-3.5 shadow-subtle ${
                        isUser
                          ? "bg-[#171717] text-white rounded-tr-none border border-white/10"
                          : "bg-[#101010] border border-white/10 text-zinc-100 rounded-tl-none"
                      }`}
                    >
                      {/* Message Meta Header */}
                      <div className="flex items-center justify-between text-[11px] opacity-80 border-b border-white/10 pb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold font-sans">
                            {isUser ? "Safety Director" : "AUDITMIND Agent"}
                          </span>

                          {/* Scope Badges on User Message */}
                          {isUser && m.facilityScope && (
                            <Badge variant="neutral" size="sm" className="text-[10px] py-0 px-1.5 font-mono">
                              🏢 {m.facilityScope}
                            </Badge>
                          )}
                          {isUser && m.auditScope && (
                            <Badge variant="neutral" size="sm" className="text-[10px] py-0 px-1.5 font-mono">
                              📋 {m.auditScope}
                            </Badge>
                          )}
                          {isUser && m.attachedEvidence && (
                            <Badge variant="neutral" size="sm" className="text-[10px] py-0 px-1.5 font-mono">
                              📎 {m.attachedEvidence}
                            </Badge>
                          )}

                          {/* Hindsight Badge on Assistant Message */}
                          {!isUser && m.hindsightUsed && (
                            <button
                              onClick={() => {
                                setIsRightInspectorOpen(true);
                                setInspectorTab("memory");
                              }}
                              className="inline-flex items-center gap-1 text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/20 hover:bg-white/20 transition cursor-pointer"
                              title="Click to inspect Hindsight memory recall"
                            >
                              <Brain className="w-3 h-3 text-[#C6B9D8]" />
                              Hindsight memory recalled
                            </button>
                          )}
                        </div>
                        <span className="font-mono tabular-nums text-[10px] text-[#8E8E8E]">{m.timestamp}</span>
                      </div>

                      {/* Tool Execution Accordion Trace */}
                      {!isUser && m.toolCalls && m.toolCalls.length > 0 && (
                        <div className="rounded-xl border border-white/10 bg-black overflow-hidden text-xs">
                          <button
                            onClick={() => toggleToolTrace(m.id)}
                            className="w-full p-2.5 px-3 flex items-center justify-between text-left hover:bg-[#101010] transition text-[#C8C8C8]"
                          >
                            <span className="flex items-center gap-2 font-mono text-[11px] font-medium text-white">
                              <Wrench className="w-3.5 h-3.5 text-[#D5A6B5]" />
                              Agent activity: {m.toolCalls.length} tool{m.toolCalls.length > 1 ? "s" : ""} executed
                            </span>
                            {expandedToolTraces[m.id] ? (
                              <ChevronUp className="w-3.5 h-3.5 text-[#8E8E8E]" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5 text-[#8E8E8E]" />
                            )}
                          </button>

                          {expandedToolTraces[m.id] && (
                            <div className="p-3 border-t border-white/10 space-y-2 bg-black/80 font-mono text-[11px]">
                              {m.toolCalls.map((t, tidx) => (
                                <div
                                  key={tidx}
                                  className="p-2 bg-[#101010] rounded border border-white/10 space-y-1"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-bold text-white">
                                      {t.tool || t.tool_name || t.name || `Tool #${tidx + 1}`}
                                    </span>
                                    <span className="text-[10px] text-emerald-400 font-bold">
                                      Success
                                    </span>
                                  </div>
                                  {(t.args || t.arguments) && (
                                    <div className="text-[10px] text-[#8E8E8E] truncate">
                                      args: {JSON.stringify(t.args || t.arguments)}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Main Message Content */}
                      <div className="whitespace-pre-wrap leading-relaxed font-sans text-xs sm:text-sm text-white">
                        {m.content}
                      </div>

                      {/* Citations & Evidence Pills (Clickable) */}
                      {!isUser && m.citations && m.citations.length > 0 && (
                        <div className="pt-2 border-t border-white/10 space-y-2">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E8E] flex items-center gap-1.5 font-mono">
                            <ExternalLink className="w-3 h-3 text-white" />
                            Verified references ({m.citations.length})
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {m.citations.map((c, cidx) => (
                              <button
                                key={cidx}
                                onClick={() => handleOpenCitation(c)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-[#171717] hover:bg-zinc-700 border border-white/15 text-[#C6B9D8] transition shadow-subtle cursor-pointer hover:border-zinc-500"
                              >
                                {c.type === "facility" && <Building2 className="w-3 h-3 text-white" />}
                                {c.type === "finding" && <AlertTriangle className="w-3 h-3 text-[#D5A6B5]" />}
                                {c.type === "audit" && <FileText className="w-3 h-3 text-white" />}
                                {c.label}
                                <ArrowUpRight className="w-2.5 h-2.5 opacity-60" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Smart Follow-Up Suggestions */}
                      {!isUser && m.suggestedFollowUps && m.suggestedFollowUps.length > 0 && (
                        <div className="pt-2 border-t border-white/10 space-y-1.5">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E8E] flex items-center gap-1 font-mono">
                            <Sparkles className="w-3 h-3 text-white" />
                            Suggested follow-ups
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {m.suggestedFollowUps.map((fu, fidx) => (
                              <button
                                key={fidx}
                                onClick={() => handleSend(fu)}
                                disabled={loading}
                                className="text-[11px] px-2.5 py-1 rounded-lg bg-[#171717]/80 hover:bg-zinc-700 border border-white/15 hover:border-zinc-500 text-white transition shadow-subtle text-left flex items-center gap-1.5 disabled:opacity-50"
                              >
                                <span>{fu}</span>
                                <ArrowUpRight className="w-3 h-3 text-[#8E8E8E] shrink-0" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Action Toolbar */}
                      {!isUser && (
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 text-xs text-[#8E8E8E]">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => copyToClipboard(m.id, m.content)}
                              className="p-1.5 hover:bg-[#171717] rounded-lg transition text-[#8E8E8E] hover:text-white flex items-center gap-1 text-[11px]"
                              title="Copy answer"
                            >
                              {copiedId === m.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-400 font-medium">Copied</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy</span>
                                </>
                              )}
                            </button>

                            <button
                              onClick={() => toggleFeedback(m.id, "up")}
                              className={`p-1.5 rounded-lg transition ${
                                m.feedback === "up"
                                  ? "bg-emerald-950/40 text-emerald-400"
                                  : "hover:bg-[#171717] text-[#8E8E8E]"
                              }`}
                              title="Helpful response"
                            >
                              <ThumbsUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => toggleFeedback(m.id, "down")}
                              className={`p-1.5 rounded-lg transition ${
                                m.feedback === "down"
                                  ? "bg-rose-950/40 text-rose-400"
                                  : "hover:bg-[#171717] text-[#8E8E8E]"
                              }`}
                              title="Needs improvement"
                            >
                              <ThumbsDown className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="flex items-center gap-2">
                            <Link href="/capa">
                              <span className="text-[11px] text-[#C6B9D8] hover:underline font-medium inline-flex items-center gap-1">
                                Create action
                                <ArrowUpRight className="w-3 h-3" />
                              </span>
                            </Link>
                            <span className="text-zinc-700">•</span>
                            <Link href="/evidence">
                              <span className="text-[11px] text-[#8E8E8E] hover:text-white hover:underline inline-flex items-center gap-1">
                                View evidence
                                <ArrowUpRight className="w-3 h-3" />
                              </span>
                            </Link>
                          </div>
                        </div>
                      )}
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-xl bg-[#171717] border border-white/15 flex items-center justify-center shrink-0 mt-0.5 text-[#C8C8C8] shadow-subtle">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {/* Live Loading Indicator with Multi-step Message */}
            {loading && (
              <div className="flex gap-3 items-center text-xs text-white bg-[#101010] p-3.5 rounded-xl border border-white/10 shadow-subtle w-fit animate-pulse">
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                <span className="font-medium font-sans">{loadingStep}</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* =========================================================================
              COMPOSER CONSOLE (Scope Selector, Evidence Attachment, Textarea)
              ========================================================================= */}
          <div className="p-3 sm:p-4 bg-[var(--surface-secondary)] border-t border-[var(--border-subtle)] space-y-2.5">
            {/* Scope & Attachment Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                {/* Facility Scope Selector */}
                <div className="relative">
                  <select
                    value={selectedFacility}
                    onChange={(e) => setSelectedFacility(e.target.value)}
                    className="bg-[#101010] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-white/15 transition"
                  >
                    <option value="ALL">🏢 All facilities (5)</option>
                    {availableFacilities.map((f) => (
                      <option key={f.id} value={f.facility_code}>
                        {f.name} ({f.facility_code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Audit Scope Selector */}
                <div className="relative">
                  <select
                    value={selectedAudit}
                    onChange={(e) => setSelectedAudit(e.target.value)}
                    className="bg-[#101010] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-white/15 transition max-w-[160px] truncate"
                  >
                    <option value="ALL">📋 All audits ({availableAudits.length || 41})</option>
                    {availableAudits.slice(0, 15).map((a) => (
                      <option key={a.id} value={a.audit_number}>
                        {a.audit_number} ({a.facility_code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Evidence Attachment Picker */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEvidencePicker((v) => !v)}
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs border transition ${
                      attachedEvidenceName
                        ? "bg-white/20 border-white/40 text-white font-semibold"
                        : "bg-[#101010] border border-white/10 text-[#C8C8C8] hover:text-white"
                    }`}
                  >
                    <Paperclip className="w-3 h-3" />
                    <span>{attachedEvidenceName ? attachedEvidenceName : "Attach evidence"}</span>
                  </button>

                  {/* Evidence Dropdown Popover */}
                  {showEvidencePicker && (
                    <div className="absolute left-0 bottom-full mb-2 w-72 bg-black border border-white/10 rounded-xl shadow-2xl p-2 space-y-1 z-30">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E8E] px-2 py-1 flex items-center justify-between border-b border-white/10">
                        <span>Select evidence artifact</span>
                        <button onClick={() => setShowEvidencePicker(false)}>
                          <X className="w-3 h-3 text-[#8E8E8E]" />
                        </button>
                      </div>

                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        <button
                          onClick={() => {
                            setAttachedEvidenceName(null);
                            setShowEvidencePicker(false);
                          }}
                          className="w-full text-left p-1.5 px-2 rounded-lg text-xs hover:bg-[#101010] text-[#8E8E8E]"
                        >
                          None (No attachment)
                        </button>
                        {availableEvidence.map((ev, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setAttachedEvidenceName(ev.name);
                              setShowEvidencePicker(false);
                            }}
                            className="w-full text-left p-1.5 px-2 rounded-lg text-xs hover:bg-[#101010] text-white truncate flex items-center gap-1.5"
                          >
                            <FileText className="w-3 h-3 text-white shrink-0" />
                            <span className="truncate">{ev.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Investigation Depth Toggle */}
                <select
                  value={inquestDepth}
                  onChange={(e) => setInquestDepth(e.target.value as any)}
                  className="bg-[#101010] border border-white/10 rounded-lg px-2 py-1 text-xs text-[#C8C8C8] focus:outline-none transition"
                >
                  <option value="standard">Standard inquiry</option>
                  <option value="deep">Deep recurrence investigation</option>
                </select>

                {/* Reset Filters Chip */}
                {(selectedFacility !== "ALL" || selectedAudit !== "ALL" || attachedEvidenceName) && (
                  <button
                    onClick={() => {
                      setSelectedFacility("ALL");
                      setSelectedAudit("ALL");
                      setAttachedEvidenceName(null);
                    }}
                    className="text-[11px] text-[#8E8E8E] hover:text-white underline ml-1"
                  >
                    Reset
                  </button>
                )}
              </div>

              <div className="hidden sm:block text-[11px] text-[#8E8E8E] font-mono">
                Enter to send • Shift+Enter for new line
              </div>
            </div>

            {/* Input Form with Expanding Textarea */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-end gap-2"
            >
              <textarea
                ref={textareaRef}
                rows={1}
                placeholder="Ask AUDITMIND about audits, recurring defects, or CAPA effectiveness..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm bg-[#101010] border border-white/10 rounded-xl text-white placeholder:text-[#71717A] focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-white/20 disabled:opacity-50 transition resize-none leading-relaxed min-h-[44px] max-h-[180px]"
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!input.trim() || loading}
                loading={loading}
                icon={<Send className="w-3.5 h-3.5" />}
                className="h-[44px] px-4 shrink-0 font-medium"
              >
                Inquire
              </Button>
            </form>
          </div>
        </div>

        {/* =========================================================================
            AREA 3: Right Rail — Context & Evidence Inspector (Collapsible)
            ========================================================================= */}
        {isRightInspectorOpen && (
          <div className="hidden lg:block lg:col-span-3 space-y-3">
            <Card className="p-3.5 space-y-3.5 bg-black border border-white/10 shadow-subtle">
              {/* Tab Selector */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setInspectorTab("context")}
                    className={`px-2.5 py-1 text-xs rounded-lg transition font-medium ${
                      inspectorTab === "context"
                        ? "bg-white/10 text-white font-medium"
                        : "text-[#8E8E8E] hover:text-white"
                    }`}
                  >
                    Context
                  </button>
                  <button
                    onClick={() => setInspectorTab("memory")}
                    className={`px-2.5 py-1 text-xs rounded-lg transition font-medium ${
                      inspectorTab === "memory"
                        ? "bg-white/10 text-white font-medium"
                        : "text-[#8E8E8E] hover:text-white"
                    }`}
                  >
                    Memory
                  </button>
                  <button
                    onClick={() => setInspectorTab("activity")}
                    className={`px-2.5 py-1 text-xs rounded-lg transition font-medium ${
                      inspectorTab === "activity"
                        ? "bg-white/10 text-white font-medium"
                        : "text-[#8E8E8E] hover:text-white"
                    }`}
                  >
                    Events
                  </button>
                </div>
                <button
                  onClick={() => setIsRightInspectorOpen(false)}
                  className="p-1 text-[#8E8E8E] hover:text-white"
                  title="Close context panel"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* TAB 1: Context Snapshot */}
              {inspectorTab === "context" && (
                <div className="space-y-3">
                  {/* Facilities In Scope */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-[#8E8E8E]">
                      Active Facilities ({conversationContextData.facilities.length || "All"})
                    </div>
                    {conversationContextData.facilities.length === 0 ? (
                      <div className="text-[11px] text-[#71717A] italic">All plants in portfolio</div>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {conversationContextData.facilities.map((f, idx) => (
                          <Badge key={idx} variant="neutral" size="sm" className="font-mono text-[10px]">
                            {f}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Audits Cited */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-[#8E8E8E]">
                      Audits Referenced ({conversationContextData.audits.length})
                    </div>
                    {conversationContextData.audits.length === 0 ? (
                      <div className="text-[11px] text-[#71717A] italic">None referenced yet</div>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {conversationContextData.audits.map((a, idx) => (
                          <button
                            key={idx}
                            onClick={() =>
                              handleOpenCitation({
                                type: "audit",
                                label: a,
                                id: a,
                                link: `/audits?search=${encodeURIComponent(a)}`,
                              })
                            }
                            className="inline-block"
                          >
                            <Badge variant="neutral" size="sm" className="font-mono text-[10px] hover:underline cursor-pointer">
                              {a}
                            </Badge>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Findings Cited */}
                  <div className="space-y-1">
                    <div className="text-[11px] font-semibold text-[#8E8E8E]">
                      Findings Cited ({conversationContextData.findings.length})
                    </div>
                    {conversationContextData.findings.length === 0 ? (
                      <div className="text-[11px] text-[#71717A] italic">None cited yet</div>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {conversationContextData.findings.map((f, idx) => (
                          <button
                            key={idx}
                            onClick={() =>
                              handleOpenCitation({
                                type: "finding",
                                label: f,
                                id: f,
                                link: `/findings?search=${encodeURIComponent(f)}`,
                              })
                            }
                            className="inline-block"
                          >
                            <Badge variant="neutral" size="sm" className="font-mono text-[10px] hover:underline cursor-pointer">
                              {f}
                            </Badge>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: Hindsight Memory Bank */}
              {inspectorTab === "memory" && (
                <div className="space-y-3">
                  <div className="p-3 bg-[#101010] rounded-xl border border-white/10 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white text-[11px] flex items-center gap-1">
                        <Brain className="w-3.5 h-3.5 text-white" />
                        Memory Bank Status
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-400">
                        Online
                      </span>
                    </div>
                    <div className="text-[11px] text-[#8E8E8E] font-mono">Tenant: meridian-bank</div>
                    <div className="text-[10px] text-[#8E8E8E]">
                      Hindsight maintains cross-facility experiential memory, preventing repeat failures across multi-year audit cycles.
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="text-[11px] font-semibold text-[#C8C8C8]">
                      Recalled Memories in Session: {conversationContextData.hindsightRecalls}
                    </div>
                    <p className="text-[11px] text-[#8E8E8E]">
                      Every inquiry queries Hindsight cosine-similarity indexes to detect related historical failures.
                    </p>
                    <Link href="/memory">
                      <Button variant="secondary" size="sm" className="w-full text-[11px] justify-center mt-2">
                        Open Organizational Memory
                      </Button>
                    </Link>
                  </div>
                </div>
              )}

              {/* TAB 3: Activity & Event Ledger */}
              {inspectorTab === "activity" && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-[#8E8E8E]">Live Event Stream</span>
                    <button
                      onClick={loadAgentEvents}
                      disabled={refreshingEvents}
                      className="text-[10px] text-white hover:underline font-mono"
                    >
                      {refreshingEvents ? "Syncing..." : "Refresh"}
                    </button>
                  </div>

                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {agentEvents.length === 0 ? (
                      <div className="text-[11px] text-[#71717A] italic p-3 text-center">
                        No events logged yet.
                      </div>
                    ) : (
                      agentEvents.slice(0, 8).map((evt, idx) => (
                        <div
                          key={idx}
                          className="p-2 bg-[#101010] border border-white/10 rounded-lg text-[11px] space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-white text-[10px]">
                              {evt.event_type || "TOOL_CALL"}
                            </span>
                            <span className="text-[#8E8E8E] font-mono text-[10px] tabular-nums">
                              {evt.created_at
                                ? new Date(evt.created_at).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : ""}
                            </span>
                          </div>
                          <p className="text-[#C8C8C8] truncate text-[10px]">
                            {evt.query || evt.event_payload || evt.details || "Dispatched tool call"}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>
        )}
      </div>

      {/* =========================================================================
          CITATION INSPECTOR MODAL (Inline detail view for findings/audits)
          ========================================================================= */}
      {activeModalCitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
            onClick={() => setActiveModalCitation(null)}
          />
          <div className="relative w-full max-w-lg bg-black border border-white/10 rounded-2xl p-6 shadow-2xl z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                {activeModalCitation.type === "finding" && (
                  <AlertTriangle className="w-5 h-5 text-[#D5A6B5]" />
                )}
                {activeModalCitation.type === "audit" && (
                  <FileText className="w-5 h-5 text-white" />
                )}
                {activeModalCitation.type === "facility" && (
                  <Building2 className="w-5 h-5 text-white" />
                )}
                <h3 className="font-sans font-semibold text-base text-white tracking-[-0.02em]">
                  {activeModalCitation.label}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalCitation(null)}
                className="p-1 text-[#8E8E8E] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {modalLoading ? (
              <div className="py-8 text-center text-xs text-[#8E8E8E] flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-white" />
                <span>Loading record metadata...</span>
              </div>
            ) : modalDetails ? (
              <div className="space-y-3 text-xs">
                {modalDetails.title && (
                  <div>
                    <span className="font-semibold text-[#8E8E8E] text-[11px] uppercase font-mono">Title</span>
                    <div className="text-sm font-semibold text-white mt-0.5">{modalDetails.title}</div>
                  </div>
                )}

                {modalDetails.description && (
                  <div>
                    <span className="font-semibold text-[#8E8E8E] text-[11px] uppercase font-mono">Description</span>
                    <p className="text-[#C8C8C8] mt-0.5 leading-relaxed bg-[#101010]/80 p-2.5 rounded-lg border border-white/10">
                      {modalDetails.description}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                  {modalDetails.facility_name && (
                    <div className="p-2 bg-[#101010] rounded-lg border border-white/10">
                      <span className="text-[#8E8E8E] block text-[10px]">FACILITY</span>
                      <span className="font-bold text-white">{modalDetails.facility_name}</span>
                    </div>
                  )}
                  {modalDetails.compliance_score !== undefined && (
                    <div className="p-2 bg-[#101010] rounded-lg border border-white/10">
                      <span className="text-[#8E8E8E] block text-[10px]">SCORE</span>
                      <span className="font-bold text-emerald-400">{modalDetails.compliance_score}%</span>
                    </div>
                  )}
                  {modalDetails.severity && (
                    <div className="p-2 bg-[#101010] rounded-lg border border-white/10">
                      <span className="text-[#8E8E8E] block text-[10px]">SEVERITY</span>
                      <span className="font-bold text-[#D5A6B5]">{modalDetails.severity}</span>
                    </div>
                  )}
                  {modalDetails.status && (
                    <div className="p-2 bg-[#101010] rounded-lg border border-white/10">
                      <span className="text-[#8E8E8E] block text-[10px]">STATUS</span>
                      <span className="font-bold text-white">{modalDetails.status}</span>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <Link href={activeModalCitation.link}>
                    <Button variant="primary" size="sm" icon={<ExternalLink className="w-3.5 h-3.5" />}>
                      Open full ledger record
                    </Button>
                  </Link>
                  <Button variant="secondary" size="sm" onClick={() => setActiveModalCitation(null)}>
                    Close
                  </Button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* =========================================================================
          MOBILE DRAWERS (History & Context)
          ========================================================================= */}
      {/* Mobile History Drawer */}
      {mobileLeftOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileLeftOpen(false)}
          />
          <div className="relative w-80 max-w-[85%] bg-surface border-r border-border-subtle h-full p-4 overflow-y-auto space-y-3 z-10 shadow-elevated">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="font-semibold text-sm text-ink-primary">Past investigations</h3>
              <button onClick={() => setMobileLeftOpen(false)} className="p-1 text-ink-muted hover:text-ink-primary">
                <X className="w-4 h-4" />
              </button>
            </div>
            <Button
              variant="citron"
              size="sm"
              onClick={handleNewSession}
              className="w-full justify-center"
              icon={<Plus className="w-4 h-4" />}
            >
              New inquiry
            </Button>
            <div className="space-y-2">
              {conversations.map((session) => renderSessionItem(session, true))}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Context Drawer */}
      {mobileRightOpen && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setMobileRightOpen(false)}
          />
          <div className="relative w-80 max-w-[85%] bg-surface border-l border-border-subtle h-full p-4 overflow-y-auto space-y-4 z-10 shadow-elevated">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <h3 className="font-semibold text-sm text-ink-primary">Inquest context</h3>
              <button onClick={() => setMobileRightOpen(false)} className="p-1 text-ink-muted hover:text-ink-primary">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="font-semibold text-ink-secondary">
                Facilities in scope ({conversationContextData.facilities.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {conversationContextData.facilities.map((f, idx) => (
                  <Badge key={idx} variant="neutral" size="sm" className="font-mono text-[10px]">
                    {f}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="p-3 bg-[var(--surface-secondary)] rounded-xl border border-[var(--border-subtle)] space-y-1 text-xs">
              <div className="font-semibold text-ink-primary text-[11px]">Hindsight memory</div>
              <div className="text-[10px] text-ink-muted">Bank: meridian-bank (Online)</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // --- Helper to Render Individual Session Row in Left Rail ---
  function renderSessionItem(session: Conversation, isMobile = false) {
    const isActive = session.id === activeSessionId;
    const isEditing = editingSessionId === session.id;
    const isDeleting = deletingSessionId === session.id;

    return (
      <div
        key={session.id}
        onClick={() => {
          if (!isEditing && !isDeleting) {
            setActiveSessionId(session.id);
            if (isMobile) setMobileLeftOpen(false);
          }
        }}
        className={`group relative p-2.5 rounded-xl border cursor-pointer transition text-xs space-y-1 ${
          isActive
            ? "bg-white/[0.08] border-white/40 shadow-sm ring-1 ring-white/20"
            : "bg-[#101010]/40 border-transparent hover:border-white/10 hover:bg-[#101010]"
        }`}
      >
        {isEditing ? (
          <form
            onSubmit={(e) => handleSaveRename(session.id, e)}
            className="flex items-center gap-1"
          >
            <input
              type="text"
              value={editTitleInput}
              onChange={(e) => setEditTitleInput(e.target.value)}
              autoFocus
              className="w-full text-xs bg-[#101010] border border-white/15 rounded px-2 py-1 text-white focus:outline-none"
            />
            <button
              type="submit"
              className="p-1 text-emerald-400 hover:text-emerald-300"
              title="Save title"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setEditingSessionId(null);
              }}
              className="p-1 text-[#8E8E8E] hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : isDeleting ? (
          <div className="p-1 space-y-1.5" onClick={(e) => e.stopPropagation()}>
            <div className="text-[11px] font-semibold text-rose-400">Delete this chat?</div>
            <div className="flex items-center gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={(e) => handleDeleteSession(session.id, e)}
                className="py-0.5 px-2 text-[10px] h-6"
              >
                Delete
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDeletingSessionId(null)}
                className="py-0.5 px-2 text-[10px] h-6"
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-2 truncate">
              {session.pinned && (
                <Pin className="w-3 h-3 text-white rotate-45 shrink-0" />
              )}
              <span
                className={`truncate font-medium ${
                  isActive
                    ? "text-white font-semibold"
                    : "text-[#C8C8C8]"
                }`}
              >
                {session.title}
              </span>
            </div>

            {/* Action Buttons (Show on hover or active) */}
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition shrink-0">
              <button
                onClick={(e) => handleTogglePin(session.id, e)}
                className="p-1 hover:bg-[#171717] rounded text-[#8E8E8E] hover:text-white"
                title={session.pinned ? "Unpin chat" : "Pin chat"}
              >
                <Pin className={`w-3 h-3 ${session.pinned ? "text-white rotate-45" : ""}`} />
              </button>
              <button
                onClick={(e) => handleStartRename(session, e)}
                className="p-1 hover:bg-[#171717] rounded text-[#8E8E8E] hover:text-white"
                title="Rename chat"
              >
                <Edit3 className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setDeletingSessionId(session.id);
                }}
                className="p-1 hover:bg-[#171717] rounded text-[#8E8E8E] hover:text-rose-400"
                title="Delete chat"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }
}
