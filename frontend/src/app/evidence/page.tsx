"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  FileSearch,
  ShieldCheck,
  FileText,
  Image as ImageIcon,
  Database,
  Search,
  Filter,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Lock,
  Calendar,
  AlertTriangle,
  Hash,
  Eye,
  Building2,
  Sparkles,
  ArrowUpRight,
  Maximize2,
  CheckCircle2,
  XCircle,
  Clock,
  Scan,
  X,
  UserCheck,
  Layers,
} from "lucide-react";
import { api } from "@/lib/api";

export interface EvidenceRecord {
  id: string;
  file_name: string;
  file_type: string;
  file_path: string;
  hash_sha256: string;
  description: string;
  captured_at: string;
  finding_code: string;
  finding_title: string;
  facility_code: string;
  audit_number: string;
  audit_date: string;
  category: string;
  severity: "CRITICAL" | "MAJOR" | "MINOR";
  image_kind: "egress_obstruction" | "interlock_tamper" | "containment_liner" | "manometer_drift" | "calibration_cert";
  photographer: string;
  gps_coords: string;
  review_status: "CERTIFIED" | "PENDING_REVIEW" | "REJECTED";
  reviewed_by?: string;
  review_notes?: string;
  review_timestamp?: string;
}

const INITIAL_EVIDENCE: EvidenceRecord[] = [
  {
    id: "ev-01",
    file_name: "plant_a_fire_exit_obstruction.jpg",
    file_type: "image/jpeg",
    file_path: "/evidence/egress_obstruction.jpg",
    hash_sha256: "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    description: "Three wooden staging pallet stacks placed across South emergency exit door corridor in fulfillment bay, violating 36-inch clearance.",
    captured_at: "2026-08-14T11:23:00Z",
    finding_code: "FIND-2026-001",
    finding_title: "Emergency Exit Corridors Obstructed by Staging Pallets",
    facility_code: "FAC-001 (Apex Detroit)",
    audit_number: "AUD-2026-001",
    audit_date: "2026-08-14",
    category: "Fire Safety & Egress (NFPA 101 §7.1.10.1)",
    severity: "CRITICAL",
    image_kind: "egress_obstruction",
    photographer: "Marcus Vance, CSP (Lead Auditor)",
    gps_coords: "42.3314° N, 83.0458° W — Bay 4 South Egress Corridor",
    review_status: "PENDING_REVIEW",
  },
  {
    id: "ev-02",
    file_name: "press_04_interlock_tamper_bypass.jpg",
    file_type: "image/jpeg",
    file_path: "/evidence/press_interlock.jpg",
    hash_sha256: "3b9a5c88e91d64c121e7845f7478021d746569113670984992520377cf6619fc",
    description: "Safety switch actuator secured with heavy-duty zip-ties allowing cycle activation with safety gate door fully open.",
    captured_at: "2026-06-20T14:10:00Z",
    finding_code: "FIND-2026-033",
    finding_title: "Stamping Press Machine Guarding Interlock Bypass",
    facility_code: "FAC-002 (Vanguard Austin)",
    audit_number: "AUD-2026-012",
    audit_date: "2026-06-20",
    category: "Machine Guarding (OSHA 1910.212(a)(1))",
    severity: "CRITICAL",
    image_kind: "interlock_tamper",
    photographer: "Dr. Elena Rostova, PE",
    gps_coords: "30.2672° N, 97.7431° W — Stamping Cell Line 2",
    review_status: "CERTIFIED",
    reviewed_by: "Sarah Jenkins, Lead Auditor",
    review_notes: "Physical verification completed. Actuator wire was tethered with heavy zip-tie. CAPA-2026-003 escalated to engineering for keyed trapped-key interlocks.",
    review_timestamp: "2026-06-22T09:14:00Z",
  },
  {
    id: "ev-03",
    file_name: "berm_hdpe_liner_thermal_weld_defect.jpg",
    file_type: "image/jpeg",
    file_path: "/evidence/berm_liner.jpg",
    hash_sha256: "b45cffe084dd3d20d928bee85e7b0f21422791bfb260906eb4126749ec60a6e8",
    description: "140mm thermal wedge extrusion weld seam fracture observed along secondary containment sump pit berm wall.",
    captured_at: "2026-09-02T16:45:00Z",
    finding_code: "FIND-2026-058",
    finding_title: "Chemical Containment Berm HDPE Liner Reconstruction",
    facility_code: "FAC-003 (Keystone Columbus)",
    audit_number: "AUD-2026-018",
    audit_date: "2026-09-02",
    category: "Hazardous Waste Containment (EPA 40 CFR §264.175)",
    severity: "MAJOR",
    image_kind: "containment_liner",
    photographer: "Tyler Brooks, CHMM",
    gps_coords: "39.9612° N, 82.9988° W — Hazmat Tank Yard Berm #2",
    review_status: "CERTIFIED",
    reviewed_by: "Sarah Jenkins, Lead Auditor",
    review_notes: "Ultrasonic vacuum box seam test verified. Geomembrane extrusion weld patch passed 15 psi non-destructive hold.",
    review_timestamp: "2026-09-05T14:30:00Z",
  },
  {
    id: "ev-04",
    file_name: "spray_booth_exhaust_manometer_drift.jpg",
    file_type: "image/jpeg",
    file_path: "/evidence/exhaust_manometer.jpg",
    hash_sha256: "e4a2d8810fc6b63f25c7e14a87c12658a9e1d871fb246199042b5884a44f80e9",
    description: "Dwyer Magnehelic differential manometer reading 0.12 in. w.g., indicating exhaust face velocity dropped below 100 FPM statutory requirement.",
    captured_at: "2026-10-04T09:15:00Z",
    finding_code: "FIND-2026-077",
    finding_title: "Spray Booth Exhaust Differential Pressure Drift",
    facility_code: "FAC-005 (Atlanta Hub)",
    audit_number: "AUD-2026-029",
    audit_date: "2026-10-04",
    category: "Flammable Finishes & Ventilation (OSHA 1910.107(b)(5))",
    severity: "CRITICAL",
    image_kind: "manometer_drift",
    photographer: "K. Chen, CIH",
    gps_coords: "33.7490° N, 84.3880° W — Finishing Booth Bay 3",
    review_status: "PENDING_REVIEW",
  },
  {
    id: "ev-05",
    file_name: "press_hydraulic_relief_valve_calibration_cert.pdf",
    file_type: "application/pdf",
    file_path: "/evidence/calibration_cert.pdf",
    hash_sha256: "8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d",
    description: "NIST-traceable annual calibration certificate for hydraulic primary pressure relief valves, serial #TR-8812-P.",
    captured_at: "2026-07-18T13:30:00Z",
    finding_code: "FIND-2026-015",
    finding_title: "Hydraulic Relief Valve Annual NIST Traceability Certificate",
    facility_code: "FAC-001 (Apex Detroit)",
    audit_number: "AUD-2026-003",
    audit_date: "2026-07-18",
    category: "Quality Management & Calibration (ISO 9001:2015 §7.1.5)",
    severity: "MINOR",
    image_kind: "calibration_cert",
    photographer: "Detroit Calibration Metrology Lab",
    gps_coords: "42.3314° N, 83.0458° W — QC Metrology Lab Room 104",
    review_status: "CERTIFIED",
    reviewed_by: "Sarah Jenkins, Lead Auditor",
    review_notes: "Certificate verified against NIST standard reference database. Pressure linearity verified ±0.2% full scale.",
    review_timestamp: "2026-07-20T11:00:00Z",
  },
];

/**
 * High-definition visual photographic canvas for forensic exhibits
 */
function ForensicPhotoCanvas({
  evidence,
  showAnnotations = true,
  onOpenReview,
}: {
  evidence: EvidenceRecord;
  showAnnotations?: boolean;
  onOpenReview?: () => void;
}) {
  return (
    <div className="relative w-full h-[340px] rounded-xl overflow-hidden bg-gradient-to-b from-[#121318] to-[#0A0A0C] border border-white/10 select-none flex flex-col justify-between group">
      {/* 1. PHOTOGRAPHIC SCENE RENDER */}
      <div className="absolute inset-0">
        {evidence.image_kind === "egress_obstruction" && (
          <svg className="w-full h-full object-cover" viewBox="0 0 600 340" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="wallGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#252730" />
                <stop offset="100%" stopColor="#14151C" />
              </linearGradient>
              <linearGradient id="doorGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#3A3D4A" />
                <stop offset="50%" stopColor="#4A4E5E" />
                <stop offset="100%" stopColor="#2C2E38" />
              </linearGradient>
              <pattern id="warningStripes" width="20" height="20" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                <rect width="10" height="20" fill="#EAB308" />
                <rect x="10" width="10" height="20" fill="#18181B" />
              </pattern>
            </defs>

            {/* Warehouse concrete wall */}
            <rect width="600" height="340" fill="url(#wallGrad)" />

            {/* Floor with caution line */}
            <polygon points="0,270 600,270 600,340 0,340" fill="#181920" />
            <line x1="0" y1="270" x2="600" y2="270" stroke="#333644" strokeWidth="2" />
            <rect x="120" y="266" width="360" height="8" fill="url(#warningStripes)" opacity="0.75" />

            {/* Emergency Egress Door Frame */}
            <rect x="180" y="60" width="240" height="210" fill="#1C1E26" stroke="#5A5E70" strokeWidth="4" rx="2" />
            {/* Double Door Leaf */}
            <rect x="184" y="64" width="116" height="202" fill="url(#doorGrad)" />
            <rect x="300" y="64" width="116" height="202" fill="url(#doorGrad)" />
            {/* Crash Push Bars */}
            <rect x="195" y="160" width="94" height="8" fill="#D4D4D8" rx="2" />
            <rect x="311" y="160" width="94" height="8" fill="#D4D4D8" rx="2" />
            {/* Door Vision Panels */}
            <rect x="210" y="90" width="64" height="48" fill="#60A5FA" opacity="0.3" rx="2" />
            <rect x="326" y="90" width="64" height="48" fill="#60A5FA" opacity="0.3" rx="2" />

            {/* EXIT Sign Illuminated */}
            <rect x="255" y="24" width="90" height="28" fill="#7F1D1D" stroke="#EF4444" strokeWidth="1.5" rx="4" />
            <text x="300" y="43" fill="#FCA5A5" fontSize="13" fontWeight="bold" fontFamily="monospace" textAnchor="middle" letterSpacing="3">
              EXIT
            </text>

            {/* Staged Obstructing Pallets & Boxes (The Non-Conformance) */}
            <g transform="translate(210, 180)">
              {/* Wooden Pallet 1 */}
              <rect x="0" y="60" width="180" height="12" fill="#78350F" stroke="#92400E" strokeWidth="1" />
              <rect x="10" y="52" width="20" height="8" fill="#B45309" />
              <rect x="80" y="52" width="20" height="8" fill="#B45309" />
              <rect x="150" y="52" width="20" height="8" fill="#B45309" />
              {/* Cardboard Box Stack */}
              <rect x="10" y="-10" width="80" height="62" fill="#92400E" stroke="#B45309" strokeWidth="1.5" rx="1" />
              <line x1="10" y1="20" x2="90" y2="20" stroke="#78350F" strokeWidth="1" strokeDasharray="3 2" />
              <rect x="85" y="5" width="85" height="47" fill="#A16207" stroke="#CA8A04" strokeWidth="1.5" rx="1" />
              {/* Upper Box */}
              <rect x="35" y="-50" width="70" height="40" fill="#78350F" stroke="#92400E" strokeWidth="1" rx="1" />
              <text x="70" y="-26" fill="#FDE68A" fontSize="8" fontFamily="monospace" textAnchor="middle">RUSH SHIP</text>
            </g>

            {/* AI Bounding Box & HUD Telemetry */}
            {showAnnotations && (
              <g className="animate-reveal">
                {/* Pulsing red/amber defect bounding box */}
                <rect x="190" y="115" width="220" height="150" fill="#EF4444" fillOpacity="0.12" stroke="#EF4444" strokeWidth="2" strokeDasharray="6 3" rx="4" />
                {/* Corner reticles */}
                <path d="M 190 130 L 190 115 L 205 115" fill="none" stroke="#EF4444" strokeWidth="3" />
                <path d="M 395 115 L 410 115 L 410 130" fill="none" stroke="#EF4444" strokeWidth="3" />
                <path d="M 190 250 L 190 265 L 205 265" fill="none" stroke="#EF4444" strokeWidth="3" />
                <path d="M 395 265 L 410 265 L 410 250" fill="none" stroke="#EF4444" strokeWidth="3" />
                {/* Defect Tag Badge */}
                <rect x="190" y="93" width="220" height="20" fill="#EF4444" rx="3" />
                <text x="200" y="107" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                  ⚠️ STATUTORY OBSTRUCTION: NFPA 101 §7.1.10.1
                </text>
              </g>
            )}
          </svg>
        )}

        {evidence.image_kind === "interlock_tamper" && (
          <svg className="w-full h-full object-cover" viewBox="0 0 600 340" preserveAspectRatio="xMidYMid slice">
            <defs>
              <linearGradient id="metalGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1E2028" />
                <stop offset="100%" stopColor="#0F1015" />
              </linearGradient>
            </defs>
            <rect width="600" height="340" fill="url(#metalGrad)" />

            {/* Heavy Hydraulic Press Frame */}
            <rect x="60" y="30" width="480" height="280" fill="#181A22" stroke="#373B4D" strokeWidth="3" rx="4" />
            <rect x="80" y="50" width="440" height="240" fill="#12131A" stroke="#252836" strokeWidth="2" />

            {/* Stamping Die Plate (Yellow safety border) */}
            <rect x="140" y="110" width="320" height="140" fill="#1F212D" stroke="#EAB308" strokeWidth="2" />
            <line x1="140" y1="180" x2="460" y2="180" stroke="#474C64" strokeWidth="3" />

            {/* Safety Interlock Switch Housing */}
            <g transform="translate(360, 90)">
              <rect x="0" y="0" width="60" height="90" fill="#DC2626" stroke="#991B1B" strokeWidth="2" rx="4" />
              <circle cx="30" cy="25" r="10" fill="#7F1D1D" stroke="#F87171" strokeWidth="1" />
              {/* Lever Arm */}
              <line x1="30" y1="35" x2="15" y2="70" stroke="#E2E8F0" strokeWidth="5" strokeLinecap="round" />
              {/* Tamper Nylon Zip-Tie */}
              <ellipse cx="20" cy="65" rx="12" ry="7" fill="none" stroke="#FDE047" strokeWidth="3" strokeDasharray="3 2" />
              <text x="35" y="80" fill="#FEF08A" fontSize="8" fontFamily="monospace" fontWeight="bold">ZIP-TIE</text>
            </g>

            {/* AI Bounding Box */}
            {showAnnotations && (
              <g className="animate-reveal">
                <rect x="330" y="65" width="120" height="140" fill="#EF4444" fillOpacity="0.16" stroke="#EF4444" strokeWidth="2" strokeDasharray="6 3" rx="4" />
                <rect x="330" y="42" width="210" height="20" fill="#DC2626" rx="3" />
                <text x="336" y="56" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                  CRITICAL: INTERLOCK BYPASS TAMPER DETECTED
                </text>
                <circle cx="380" cy="155" r="8" fill="none" stroke="#EF4444" strokeWidth="2" className="animate-ping" />
              </g>
            )}
          </svg>
        )}

        {evidence.image_kind === "containment_liner" && (
          <svg className="w-full h-full object-cover" viewBox="0 0 600 340" preserveAspectRatio="xMidYMid slice">
            <rect width="600" height="340" fill="#0C0D12" />
            {/* Textured HDPE Geomembrane Surface */}
            <path d="M 0 0 L 600 0 L 600 340 L 0 340 Z" fill="#1A1C24" />
            <path d="M 0 160 Q 300 190 600 150 L 600 340 L 0 340 Z" fill="#13141B" />

            {/* Extrusion Weld Bead */}
            <path d="M 50 180 Q 280 200 550 170" fill="none" stroke="#333748" strokeWidth="18" strokeLinecap="round" />
            <path d="M 50 180 Q 280 200 550 170" fill="none" stroke="#4B516A" strokeWidth="6" strokeLinecap="round" />

            {/* Thermal Seam Fracture / Fissure (Defect) */}
            <path d="M 230 192 Q 280 198 330 188" fill="none" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" />
            <circle cx="280" cy="195" r="14" fill="#EF4444" fillOpacity="0.2" />

            {showAnnotations && (
              <g className="animate-reveal">
                <rect x="180" y="145" width="200" height="90" fill="#EF4444" fillOpacity="0.14" stroke="#EF4444" strokeWidth="2" strokeDasharray="5 3" rx="4" />
                <rect x="180" y="122" width="230" height="20" fill="#DC2626" rx="3" />
                <text x="188" y="136" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                  EPA 40 CFR 264.175: 140mm WELD FRACTURE
                </text>
              </g>
            )}
          </svg>
        )}

        {evidence.image_kind === "manometer_drift" && (
          <svg className="w-full h-full object-cover" viewBox="0 0 600 340" preserveAspectRatio="xMidYMid slice">
            <rect width="600" height="340" fill="#121319" />
            {/* Ventilation Plenum Panel */}
            <rect x="120" y="30" width="360" height="280" fill="#1C1E26" stroke="#2E3244" strokeWidth="3" rx="8" />

            {/* Magnehelic Differential Gauge Dial */}
            <circle cx="300" cy="170" r="100" fill="#F8FAFC" stroke="#64748B" strokeWidth="6" />
            <circle cx="300" cy="170" r="92" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1" />

            {/* Scale markings */}
            <path d="M 230 170 A 70 70 0 0 1 370 170" fill="none" stroke="#0F172A" strokeWidth="2" strokeDasharray="2 6" />
            {/* Red Zone (Low velocity < 0.20 in w.g.) */}
            <path d="M 230 170 A 70 70 0 0 1 270 115" fill="none" stroke="#EF4444" strokeWidth="5" />
            {/* Green Permissible Zone */}
            <path d="M 270 115 A 70 70 0 0 1 360 150" fill="none" stroke="#22C55E" strokeWidth="5" />

            {/* Gauge Needle indicating 0.12 in w.g. (FAIL) */}
            <line x1="300" y1="170" x2="252" y2="128" stroke="#DC2626" strokeWidth="3" strokeLinecap="round" />
            <circle cx="300" cy="170" r="7" fill="#0F172A" />

            <text x="300" y="210" fill="#0F172A" fontSize="9" fontWeight="bold" fontFamily="sans-serif" textAnchor="middle">
              MAGNEHELIC® INCHES OF WATER
            </text>
            <text x="300" y="226" fill="#DC2626" fontSize="11" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
              0.12 in. w.g. (FAIL)
            </text>

            {showAnnotations && (
              <g className="animate-reveal">
                <rect x="175" y="55" width="250" height="230" fill="#EF4444" fillOpacity="0.12" stroke="#EF4444" strokeWidth="2" strokeDasharray="5 3" rx="6" />
                <rect x="175" y="32" width="250" height="20" fill="#DC2626" rx="3" />
                <text x="182" y="46" fill="#FFFFFF" fontSize="9" fontWeight="bold" fontFamily="sans-serif">
                  OSHA 1910.107: VELOCITY BELOW 100 FPM
                </text>
              </g>
            )}
          </svg>
        )}

        {evidence.image_kind === "calibration_cert" && (
          <div className="w-full h-full bg-[#1A1C24] p-6 flex flex-col justify-between text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                  <FileText className="w-4 h-4 text-[#C6B9D8]" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-white font-sans">NIST Traceable Calibration Certificate</div>
                  <div className="text-[10px] font-mono text-[#8E8E93]">Certificate ID: NIST-TR-2026-8812-P</div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                ACTIVE VALIDATION
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 py-3 text-[11px] font-mono">
              <div className="p-2.5 rounded bg-black/40 border border-white/5 space-y-1">
                <div className="text-[#8E8E93] text-[9px] uppercase">Equipment Inspected</div>
                <div className="text-white font-medium">Stamping Ram Relief Valve #4</div>
                <div className="text-[#A1A1AA] text-[10px]">Serial: 8812-PRV-99</div>
              </div>
              <div className="p-2.5 rounded bg-black/40 border border-white/5 space-y-1">
                <div className="text-[#8E8E93] text-[9px] uppercase">Calibration Accuracy</div>
                <div className="text-emerald-400 font-medium">±0.18% FS (Pass)</div>
                <div className="text-[#A1A1AA] text-[10px]">Standard: ISO 9001:2015 §7.1.5</div>
              </div>
            </div>
            <div className="text-[10px] text-[#A1A1AA] border-t border-white/10 pt-2 flex items-center justify-between font-mono">
              <span>Sign-off: Lead Metrologist D. Chen, PE</span>
              <span>Valid Thru: 2027-07-18</span>
            </div>
          </div>
        )}
      </div>

      {/* 2. HUD CAMERA TELEMETRY OVERLAY BAR */}
      <div className="relative z-10 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center justify-between text-[11px] font-mono text-[#A1A1AA]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white font-medium">{evidence.finding_code}</span>
          <span className="text-white/40">|</span>
          <span className="text-white/80 truncate max-w-[200px] sm:max-w-xs">{evidence.gps_coords}</span>
        </div>

        {onOpenReview && (
          <button
            onClick={onOpenReview}
            className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-sans font-medium flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            title="Inspect in Forensic Reviewer"
          >
            <Scan className="w-3.5 h-3.5 text-[#C6B9D8]" />
            <span>Inspect &amp; Review</span>
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Interactive Forensic Review & Certification Modal
 */
function ReviewExhibitModal({
  evidence,
  onClose,
  onSaveReview,
}: {
  evidence: EvidenceRecord;
  onClose: () => void;
  onSaveReview: (status: "CERTIFIED" | "REJECTED", notes: string, reviewer: string) => void;
}) {
  const [status, setStatus] = useState<"CERTIFIED" | "REJECTED">(
    evidence.review_status === "REJECTED" ? "REJECTED" : "CERTIFIED"
  );
  const [reviewerName, setReviewerName] = useState(evidence.reviewed_by || "Sarah Jenkins, Lead Auditor");
  const [reviewNotes, setReviewNotes] = useState(
    evidence.review_notes ||
      `Forensic inspection exhibit verified against ${evidence.category}. Physical and photographic evidence corroborates statutory non-conformance severity rating ${evidence.severity}.`
  );
  const [showAnnotations, setShowAnnotations] = useState(true);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-reveal">
      <div className="relative w-full max-w-4xl bg-[#121318] border border-white/15 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-[#C6B9D8]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white font-sans flex items-center gap-2">
                <span>Forensic Exhibit Review &amp; Certification</span>
                <span className="text-xs font-mono font-normal text-[#8E8E93]">({evidence.finding_code})</span>
              </h2>
              <p className="text-xs text-[#A1A1AA]">{evidence.finding_title}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Top Controls: Toggle Annotations */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
              <Calendar className="w-3.5 h-3.5" />
              <span>Captured: {new Date(evidence.captured_at).toLocaleString()}</span>
              <span className="text-white/20">•</span>
              <span>Photographer: {evidence.photographer}</span>
            </div>

            <button
              onClick={() => setShowAnnotations((prev) => !prev)}
              className={`px-3 py-1 rounded-full text-xs font-sans transition flex items-center gap-1.5 ${
                showAnnotations
                  ? "bg-[#C6B9D8]/20 border border-[#C6B9D8]/40 text-[#C6B9D8]"
                  : "bg-white/5 border border-white/10 text-[#8E8E93] hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{showAnnotations ? "AI Annotations Active" : "Annotations Hidden"}</span>
            </button>
          </div>

          {/* Photo Canvas */}
          <ForensicPhotoCanvas evidence={evidence} showAnnotations={showAnnotations} />

          {/* Review Decision Form */}
          <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-4">
            <div className="text-xs font-semibold text-white font-sans uppercase tracking-wider flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#C6B9D8]" />
              <span>Auditor Attestation &amp; Certification Sign-Off</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setStatus("CERTIFIED")}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                  status === "CERTIFIED"
                    ? "bg-emerald-950/40 border-emerald-500/50 text-white shadow-sm"
                    : "bg-white/5 border-white/10 text-[#8E8E93] hover:text-white"
                }`}
              >
                <CheckCircle2 className={`w-5 h-5 ${status === "CERTIFIED" ? "text-emerald-400" : "text-[#8E8E93]"}`} />
                <div>
                  <div className="text-xs font-semibold">Certify &amp; Validate Exhibit</div>
                  <div className="text-[10px] text-[#A1A1AA]">Conforms to statutory audit chain of custody</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setStatus("REJECTED")}
                className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
                  status === "REJECTED"
                    ? "bg-rose-950/40 border-rose-500/50 text-white shadow-sm"
                    : "bg-white/5 border-white/10 text-[#8E8E93] hover:text-white"
                }`}
              >
                <XCircle className={`w-5 h-5 ${status === "REJECTED" ? "text-rose-400" : "text-[#8E8E93]"}`} />
                <div>
                  <div className="text-xs font-semibold">Flag Non-Compliant / Request Retest</div>
                  <div className="text-[10px] text-[#A1A1AA]">Evidence insufficient or requires re-inspection</div>
                </div>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-[#8E8E93] uppercase">Lead Auditor Name</label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#181920] border border-white/10 text-white text-xs outline-none focus:border-white/30"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-mono text-[#8E8E93] uppercase">Remediation &amp; Certification Directives</label>
                <input
                  type="text"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-[#181920] border border-white/10 text-white text-xs outline-none focus:border-white/30"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-white/[0.02] flex items-center justify-between">
          <span className="text-[11px] font-mono text-[#8E8E93]">
            SHA-256 Hash: {evidence.hash_sha256.slice(0, 16)}...
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs text-[#A1A1AA] hover:text-white hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => onSaveReview(status, reviewNotes, reviewerName)}
              className="px-5 py-2 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition shadow-sm cursor-pointer"
            >
              Save Certification Record
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EvidenceExplorerPage() {
  const [evidenceList, setEvidenceList] = useState<EvidenceRecord[]>(INITIAL_EVIDENCE);
  const [selectedEvidence, setSelectedEvidence] = useState<EvidenceRecord>(INITIAL_EVIDENCE[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [reviewingEvidence, setReviewingEvidence] = useState<EvidenceRecord | null>(null);
  const [showAnnotations, setShowAnnotations] = useState(true);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load reviews persisted in localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("auditmind_evidence_reviews");
      if (stored) {
        const reviews = JSON.parse(stored) as Record<
          string,
          { status: "CERTIFIED" | "REJECTED"; notes: string; reviewer: string; timestamp: string }
        >;
        setEvidenceList((prev) =>
          prev.map((item) => {
            if (reviews[item.id]) {
              return {
                ...item,
                review_status: reviews[item.id].status,
                review_notes: reviews[item.id].notes,
                reviewed_by: reviews[item.id].reviewer,
                review_timestamp: reviews[item.id].timestamp,
              };
            }
            return item;
          })
        );
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleSaveReview = (
    status: "CERTIFIED" | "REJECTED",
    notes: string,
    reviewer: string
  ) => {
    if (!reviewingEvidence) return;

    const timestamp = new Date().toISOString();
    const updated = evidenceList.map((item) => {
      if (item.id === reviewingEvidence.id) {
        return {
          ...item,
          review_status: status,
          review_notes: notes,
          reviewed_by: reviewer,
          review_timestamp: timestamp,
        };
      }
      return item;
    });

    setEvidenceList(updated);
    const targetUpdated = updated.find((item) => item.id === reviewingEvidence.id);
    if (targetUpdated) setSelectedEvidence(targetUpdated);

    // Persist
    try {
      const stored = localStorage.getItem("auditmind_evidence_reviews");
      const currentReviews = stored ? JSON.parse(stored) : {};
      currentReviews[reviewingEvidence.id] = { status, notes, reviewer, timestamp };
      localStorage.setItem("auditmind_evidence_reviews", JSON.stringify(currentReviews));
    } catch (e) {
      // ignore
    }

    setReviewingEvidence(null);
  };

  const filteredItems = useMemo(() => {
    return evidenceList.filter((item) => {
      const matchType =
        typeFilter === "ALL" ||
        (typeFilter === "IMAGE" && item.file_type.includes("image")) ||
        (typeFilter === "PDF" && item.file_type.includes("pdf")) ||
        (typeFilter === "CERTIFIED" && item.review_status === "CERTIFIED") ||
        (typeFilter === "PENDING" && item.review_status === "PENDING_REVIEW");

      const matchSearch =
        searchQuery === "" ||
        item.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.finding_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.facility_code.toLowerCase().includes(searchQuery.toLowerCase());

      return matchType && matchSearch;
    });
  }, [evidenceList, typeFilter, searchQuery]);

  return (
    <div className="space-y-8 pb-16 animate-reveal select-none">
      {/* 1. TOP HERO AREA — Sleek Executive Typography */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-white/10">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl md:text-[42px] text-white tracking-tight leading-tight font-normal">
            Evidence Explorer
          </h1>
          <p className="text-sm text-[#C8C8C8] mt-1.5 max-w-2xl leading-relaxed">
            Forensic inspection photographs, calibrated instrument exhibits, and certified regulatory proofs.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setReviewingEvidence(selectedEvidence)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition shadow-sm cursor-pointer"
            title="Review & Sign Off Current Exhibit"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Review Exhibit</span>
          </button>
        </div>
      </div>

      {/* 2. THREE-PANE DELIBERATE SPLIT WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* PANE 1 (LEFT, 4 cols): Document Navigation & List */}
        <div className="lg:col-span-4 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-sans font-semibold text-sm tracking-wide text-white">
              Forensic Manifest ({filteredItems.length})
            </h3>
            <span className="text-[10px] font-mono text-[#8E8E8E] uppercase tracking-wider">
              TAMPER-EVIDENT
            </span>
          </div>

          {/* Search & Type filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8E8E8E]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exhibit ID, standard..."
                className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-[#8E8E8E] outline-none focus:border-white/30"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { label: "All Exhibits", val: "ALL" },
                { label: "Photos", val: "IMAGE" },
                { label: "Certificates", val: "PDF" },
                { label: "Certified", val: "CERTIFIED" },
                { label: "Pending", val: "PENDING" },
              ].map((tab) => (
                <button
                  key={tab.val}
                  onClick={() => setTypeFilter(tab.val)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-mono transition shrink-0 cursor-pointer ${
                    typeFilter === tab.val
                      ? "bg-white text-black font-semibold"
                      : "bg-white/5 text-[#8E8E93] hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Exhibit List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredItems.map((item) => {
              const isSelected = selectedEvidence?.id === item.id;
              const isPdf = item.file_type.includes("pdf");

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedEvidence(item)}
                  className={`p-3 rounded-xl border transition cursor-pointer space-y-1.5 ${
                    isSelected
                      ? "bg-white/[0.08] border-white/30 shadow-md"
                      : "bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.05]"
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-white font-semibold flex items-center gap-1.5">
                      {isPdf ? (
                        <FileText className="w-3 h-3 text-[#C6B9D8]" />
                      ) : (
                        <ImageIcon className="w-3 h-3 text-[#D5A6B5]" />
                      )}
                      {item.finding_code}
                    </span>
                    <span className="text-[#8E8E8E]">{item.facility_code.split(" ")[0]}</span>
                  </div>

                  <div className="text-xs font-medium text-white truncate font-sans">
                    {item.file_name}
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-[#8E8E93] truncate max-w-[150px]">
                      {item.category.split("(")[0]}
                    </span>

                    {item.review_status === "CERTIFIED" ? (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-2.5 h-2.5" />
                        CERTIFIED
                      </span>
                    ) : item.review_status === "REJECTED" ? (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                        RETEST
                      </span>
                    ) : (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                        PENDING
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PANE 2 (CENTER, 5 cols): Photographic Viewer & Review Trigger */}
        <div className="lg:col-span-5 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.12em] text-[#8E8E8E]">
                FORENSIC PHOTOGRAPHIC EXHIBIT
              </div>
              <h3 className="text-base font-semibold text-white tracking-tight truncate max-w-xs font-sans">
                {selectedEvidence.file_name}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAnnotations((prev) => !prev)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono transition flex items-center gap-1 border ${
                  showAnnotations
                    ? "bg-[#C6B9D8]/20 border-[#C6B9D8]/40 text-[#C6B9D8]"
                    : "bg-white/5 border-white/10 text-[#8E8E93]"
                }`}
                title="Toggle AI Defect Annotations"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>AI HUD</span>
              </button>

              <button
                onClick={() => setReviewingEvidence(selectedEvidence)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-sans transition flex items-center gap-1"
                title="Full Screen Review"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Inspect</span>
              </button>
            </div>
          </div>

          {/* High-fidelity Photographic Scene */}
          <ForensicPhotoCanvas
            evidence={selectedEvidence}
            showAnnotations={showAnnotations}
            onOpenReview={() => setReviewingEvidence(selectedEvidence)}
          />

          {/* Review & Certification Status Card */}
          <div className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-mono text-[#8E8E8E] uppercase tracking-[0.12em] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C6B9D8]" />
                <span>AUDIT ATTESTATION &amp; REVIEW STATUS</span>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                  selectedEvidence.review_status === "CERTIFIED"
                    ? "bg-emerald-950/60 text-emerald-400 border border-emerald-500/30"
                    : selectedEvidence.review_status === "REJECTED"
                    ? "bg-rose-950/60 text-rose-400 border border-rose-500/30"
                    : "bg-amber-950/60 text-amber-400 border border-amber-500/30"
                }`}
              >
                {selectedEvidence.review_status === "CERTIFIED"
                  ? "✓ CERTIFIED BY LEAD AUDITOR"
                  : selectedEvidence.review_status === "REJECTED"
                  ? "⚠ FLAGGED NON-COMPLIANT"
                  : "AWAITING AUDITOR REVIEW"}
              </span>
            </div>

            <p className="text-xs text-[#C8C8C8] leading-relaxed font-sans">
              {selectedEvidence.review_notes ||
                "Exhibit has been ingested with SHA-256 cryptographic verification. Pending lead auditor forensic sign-off."}
            </p>

            {selectedEvidence.reviewed_by && (
              <div className="text-[10px] font-mono text-[#8E8E93] pt-1 border-t border-white/5 flex items-center justify-between">
                <span>Signed: {selectedEvidence.reviewed_by}</span>
                <span>{selectedEvidence.review_timestamp ? new Date(selectedEvidence.review_timestamp).toLocaleDateString() : ""}</span>
              </div>
            )}
          </div>
        </div>

        {/* PANE 3 (RIGHT, 3 cols): Metadata & Cryptographic Proof */}
        <div className="lg:col-span-3 bg-[#101010]/80 backdrop-blur-md border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="font-sans font-semibold text-sm tracking-wide text-white">
              Cryptographic Proof
            </h3>
            <span className="text-[10px] font-mono text-[#8E8E8E] uppercase tracking-wider">
              TAMPER-EVIDENT
            </span>
          </div>

          <div className="space-y-4 text-xs font-sans">
            {/* SHA-256 Proof */}
            <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
              <div className="text-[10px] font-mono text-[#8E8E8E] uppercase flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-400" /> SHA-256 Hash
                </span>
                <button
                  onClick={() => handleCopyHash(selectedEvidence.hash_sha256)}
                  className="hover:text-white transition flex items-center gap-1 text-[9px] cursor-pointer"
                >
                  {copiedHash === selectedEvidence.hash_sha256 ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copiedHash === selectedEvidence.hash_sha256 ? "Copied" : "Copy"}</span>
                </button>
              </div>
              <div className="p-2 rounded bg-black/60 font-mono text-[9px] text-[#A1A1AA] break-all border border-white/5">
                {selectedEvidence.hash_sha256}
              </div>
            </div>

            {/* Linked Non-Conformance */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono text-[#8E8E8E] uppercase tracking-wider">
                Linked Non-Conformance
              </span>
              <div className="font-semibold text-white">{selectedEvidence.finding_title}</div>
              <div className="text-[11px] font-mono text-[#C6B9D8]">
                Deviation ID: {selectedEvidence.finding_code}
              </div>
            </div>

            {/* Facility & Audit Context */}
            <div className="space-y-1.5 pt-2 border-t border-white/10 text-[11px] font-mono text-[#A1A1AA]">
              <div>Operating Facility: <span className="text-white">{selectedEvidence.facility_code}</span></div>
              <div>Inspection Protocol: <span className="text-white">{selectedEvidence.audit_number}</span></div>
              <div>Statutory Framework: <span className="text-white">{selectedEvidence.category}</span></div>
              <div>Captured By: <span className="text-white">{selectedEvidence.photographer}</span></div>
            </div>

            {/* Review Exhibit CTA Button */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <button
                onClick={() => setReviewingEvidence(selectedEvidence)}
                className="w-full py-2.5 rounded-xl bg-white text-black font-semibold text-xs hover:bg-neutral-200 transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Review &amp; Certify Exhibit</span>
              </button>

              <Link
                href="/agent"
                className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-medium transition flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-3 h-3 text-[#C6B9D8]" />
                <span>Investigate with Agent</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. FORENSIC REVIEW MODAL */}
      {reviewingEvidence && (
        <ReviewExhibitModal
          evidence={reviewingEvidence}
          onClose={() => setReviewingEvidence(null)}
          onSaveReview={handleSaveReview}
        />
      )}
    </div>
  );
}
