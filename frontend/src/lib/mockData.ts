export const MOCK_FACILITIES = [
  {
    id: "fac-001",
    facility_code: "FAC-001",
    name: "Apex Manufacturing Plant A",
    facility_type: "Manufacturing Plant",
    location: "Detroit, MI",
    metadata: { sqft: 450000, shifts: 3, primary_ops: "Heavy stamping, CNC machining, chemical surface finishing" },
    audit_count: 9,
    findings_count: 26,
    critical_count: 9,
    recurring_count: 7,
    risk_score: 48,
  },
  {
    id: "fac-002",
    facility_code: "FAC-002",
    name: "Vanguard Manufacturing Plant B",
    facility_type: "Manufacturing Plant",
    location: "Austin, TX",
    metadata: { sqft: 280000, shifts: 2, primary_ops: "Electronics assembly, cleanroom robotics, packaging" },
    audit_count: 9,
    findings_count: 24,
    critical_count: 9,
    recurring_count: 6,
    risk_score: 51,
  },
  {
    id: "fac-003",
    facility_code: "FAC-003",
    name: "Keystone Warehouse A",
    facility_type: "Warehouse",
    location: "Columbus, OH",
    metadata: { sqft: 600000, shifts: 2, primary_ops: "High-bay bulk pallet storage, cold storage, AGV fleet" },
    audit_count: 8,
    findings_count: 24,
    critical_count: 8,
    recurring_count: 5,
    risk_score: 48,
  },
  {
    id: "fac-004",
    facility_code: "FAC-004",
    name: "Summit Warehouse B",
    facility_type: "Warehouse",
    location: "Reno, NV",
    metadata: { sqft: 520000, shifts: 2, primary_ops: "Hazmat storage, forklift cross-docking, battery charging bays" },
    audit_count: 8,
    findings_count: 24,
    critical_count: 8,
    recurring_count: 5,
    risk_score: 48,
  },
  {
    id: "fac-005",
    facility_code: "FAC-005",
    name: "Metro Distribution Center C",
    facility_type: "Distribution Center",
    location: "Atlanta, GA",
    metadata: { sqft: 750000, shifts: 3, primary_ops: "High-speed conveyor sorting, parcel fulfillment, high agency labor" },
    audit_count: 7,
    findings_count: 24,
    critical_count: 8,
    recurring_count: 5,
    risk_score: 48,
  },
];

export const MOCK_OVERVIEW = {
  organization_id: "00000000-0000-0000-0000-000000000001",
  total_audits: 41,
  avg_compliance_score: 89.9,
  total_findings: 122,
  open_findings: 47,
  recurring_findings: 28,
  recurrence_rate_percent: 23.0,
  total_capas: 94,
  completed_capas: 60,
  effective_capas: 28,
  failed_recurred_capas: 32,
  effectiveness_rate_percent: 46.7,
  facilities_ranking: MOCK_FACILITIES,
};

export const MOCK_DRIFT_MATRIX = {
  drift_matrix: [
    {
      category: "Fire Safety (NFPA 101)",
      total_findings: 21,
      total_recurrences: 14,
      facilities: { "FAC-001": { count: 8, recurrences: 6 }, "FAC-004": { count: 7, recurrences: 5 }, "FAC-005": { count: 6, recurrences: 3 } },
    },
    {
      category: "Machine Safety (OSHA 1910.212)",
      total_findings: 18,
      total_recurrences: 9,
      facilities: { "FAC-001": { count: 10, recurrences: 6 }, "FAC-002": { count: 8, recurrences: 3 } },
    },
    {
      category: "Chemical Safety (EPA 40 CFR)",
      total_findings: 18,
      total_recurrences: 3,
      facilities: { "FAC-002": { count: 10, recurrences: 0 }, "FAC-004": { count: 8, recurrences: 3 } },
    },
    {
      category: "Electrical Safety (OSHA 1910.303)",
      total_findings: 11,
      total_recurrences: 1,
      facilities: { "FAC-001": { count: 6, recurrences: 1 }, "FAC-003": { count: 5, recurrences: 0 } },
    },
    {
      category: "PPE Conformance (OSHA 1910.133)",
      total_findings: 10,
      total_recurrences: 1,
      facilities: { "FAC-001": { count: 5, recurrences: 0 }, "FAC-005": { count: 5, recurrences: 1 } },
    },
    {
      category: "Quality Management (ISO 9001)",
      total_findings: 10,
      total_recurrences: 0,
      facilities: { "FAC-002": { count: 5, recurrences: 0 }, "FAC-003": { count: 5, recurrences: 0 } },
    },
  ],
};

export const MOCK_RECURRENCE_ANALYTICS = {
  total_findings: 122,
  recurring_count: 28,
  recurrence_rate_percent: 23.0,
  recurrence_intervals: {
    within_30_days: 6,
    between_31_60_days: 12,
    between_61_90_days: 18,
    between_91_180_days: 8,
    over_180_days: 3,
  },
  chronic_clusters: [
    {
      cluster_id: "cluster-a",
      title: "Staging Pallets Obstructing Primary Exit Corridors",
      category: "Fire Safety (NFPA 101 / OSHA 1910.37)",
      affected_facilities: ["FAC-001 (Detroit)", "FAC-004 (Reno)", "FAC-005 (Atlanta)"],
      recurrence_count: 14,
      root_cause: "Warehouse overflow during quarter-end shipping surges without designated buffer staging bays.",
      durability_recommendation: "Floor-mounted laser projection barriers with automated real-time optical alert beacons.",
    },
    {
      cluster_id: "cluster-b",
      title: "Machine Tooling Safety Interlock Bypass During Changeover",
      category: "Machine Safety (OSHA 1910.212)",
      affected_facilities: ["FAC-001 (Detroit)", "FAC-002 (Austin)"],
      recurrence_count: 9,
      root_cause: "Operators manual override using zip-ties during rapid tooling swaps to avoid multi-stage calibration re-initialization.",
      durability_recommendation: "Replace software bypass toggle with physical trapped-key captive interlock sequencing.",
    },
  ],
};

const AUDIT_TYPES = [
  "Safety & OSHA Compliance",
  "Periodic Operational SOP & 5S",
  "Environmental & Hazmat (EPA)",
  "Periodic Quality Management (ISO 9001)",
];

export const MOCK_AUDITS = Array.from({ length: 41 }, (_, i) => {
  const num = 41 - i;
  const fac = MOCK_FACILITIES[i % MOCK_FACILITIES.length];
  const aType = AUDIT_TYPES[i % AUDIT_TYPES.length];
  const d = new Date(2026, 9, 25 - i * 6);
  return {
    id: `audit-${num}`,
    audit_number: `AUD-2026-${String(num).padStart(3, "0")}`,
    title: `${fac.name} - Periodic ${aType} Inspection`,
    facility_code: fac.facility_code,
    facility_name: fac.name,
    audit_type: aType,
    auditor_name: ["Marcus Vance (Lead)", "Elena Rostova", "David Sterling", "Rachel Thorne"][i % 4],
    audit_date: d.toISOString().split("T")[0],
    status: "COMPLETED",
    compliance_score: Math.round((82 + ((num * 3) % 17)) * 10) / 10,
    findings_count: (num % 3) + 1,
    summary: `Comprehensive evaluation of operational conformance at ${fac.name}. Verification of physical barriers, emergency egress corridors, chemical containment, and statutory training logs.`,
  };
});

const FINDING_TEMPLATES = [
  {
    code_prefix: "FS-EGRESS",
    title: "Emergency exit route obstructed by staging pallets",
    category: "Fire Safety (OSHA 1910.37)",
    severity: "CRITICAL",
    is_recurring: true,
    repeat_count: 3,
    standard: "OSHA 1910.37 / NFPA 101",
    description: "Main emergency exit door in high-traffic bay blocked by wooden pallets and shrink-wrapped overflow stock. Path clearance reduced to under 18 inches.",
  },
  {
    code_prefix: "MG-INTERLOCK",
    title: "Interlock bypass switch engaged on mechanical stamping press",
    category: "Machine Safety (OSHA 1910.212)",
    severity: "CRITICAL",
    is_recurring: true,
    repeat_count: 2,
    standard: "OSHA 1910.212",
    description: "Safety interlock gate on primary stamping press was manually overridden with zip ties to allow continuous feeding during shift ramp-up.",
  },
  {
    code_prefix: "CH-CONTAIN",
    title: "Secondary chemical containment berm cracked and leaking",
    category: "Chemical Safety (EPA 40 CFR 264.175)",
    severity: "CRITICAL",
    is_recurring: false,
    repeat_count: 1,
    standard: "EPA 40 CFR 264.175",
    description: "Liquid collection sump in plating washroom showed concrete fissure. Sump capacity compromised below 110% of largest vessel requirement.",
  },
  {
    code_prefix: "FS-EXTINGUISH",
    title: "Fire extinguisher annual inspection tag expired",
    category: "Fire Safety (OSHA 1910.37)",
    severity: "MAJOR",
    is_recurring: true,
    repeat_count: 2,
    standard: "OSHA 1910.37",
    description: "Fire extinguishers located in production corridor showed last inspection tag dated over 14 months prior without documented hydrostatic testing.",
  },
  {
    code_prefix: "TR-FORKLIFT",
    title: "Forklift operators missing mandatory 3-year recertification",
    category: "Training & Certification (OSHA 1910.178)",
    severity: "MAJOR",
    is_recurring: false,
    repeat_count: 1,
    standard: "OSHA 1910.178",
    description: "Audit of active equipment logs identified four warehouse operators operating Class IV powered industrial trucks with expired training credentials.",
  },
  {
    code_prefix: "VT-HYDROGEN",
    title: "Improper ventilation in battery charging bay",
    category: "Ventilation (OSHA 1910.94)",
    severity: "CRITICAL",
    is_recurring: true,
    repeat_count: 2,
    standard: "OSHA 1910.94",
    description: "Hydrogen gas detection sensor triggered intermittent alerts during concurrent charging of 12 electric forklift battery packs.",
  },
  {
    code_prefix: "PPE-EYE",
    title: "Operators not wearing required Z87+ impact goggles",
    category: "PPE Conformance (OSHA 1910.133)",
    severity: "MINOR",
    is_recurring: false,
    repeat_count: 1,
    standard: "OSHA 1910.133",
    description: "Employees in metal deburring cell observed wearing prescription glasses without certified side shields.",
  },
  {
    code_prefix: "EL-PANEL",
    title: "36-inch electrical panel clearance violated",
    category: "Electrical Safety (OSHA 1910.303)",
    severity: "MAJOR",
    is_recurring: false,
    repeat_count: 1,
    standard: "OSHA 1910.303",
    description: "Distribution panel 4B obstructed by rolling maintenance tool carts and cardboard bin containers.",
  },
];

export const MOCK_FINDINGS = Array.from({ length: 50 }, (_, i) => {
  const num = 50 - i;
  const tmpl = FINDING_TEMPLATES[i % FINDING_TEMPLATES.length];
  const fac = MOCK_FACILITIES[i % MOCK_FACILITIES.length];
  const audit = MOCK_AUDITS[i % MOCK_AUDITS.length];
  return {
    id: `finding-${num}`,
    finding_code: `FIND-2026-${String(num).padStart(3, "0")}`,
    title: `[${tmpl.code_prefix}] ${tmpl.title}`,
    description: tmpl.description,
    category: tmpl.category,
    severity: tmpl.severity,
    status: i < 5 ? "CLOSED" : i < 20 ? "IN_REMEDIATION" : "OPEN",
    is_recurring: tmpl.is_recurring,
    recurrence_count: tmpl.is_recurring ? tmpl.repeat_count : 1,
    facility_id: fac.id,
    facility_code: fac.facility_code,
    facility_name: fac.name,
    audit_id: audit.id,
    audit_number: audit.audit_number,
    regulatory_standard: tmpl.standard,
  };
});

export const MOCK_ACTIONS = Array.from({ length: 50 }, (_, i) => {
  const num = 50 - i;
  const finding = MOCK_FINDINGS[i % MOCK_FINDINGS.length];
  const status = i < 15 ? "COMPLETED" : i < 35 ? "IN_PROGRESS" : "ASSIGNED";
  const effStatus =
    status === "COMPLETED"
      ? i % 3 === 0
        ? "FAILED_RECURRED"
        : "EFFECTIVE"
      : "PENDING_VERIFICATION";

  return {
    id: `capa-${num}`,
    capa_code: `CAPA-2026-${String(num).padStart(3, "0")}`,
    title: `Remediation action for ${finding.finding_code}`,
    action_description: `Implement permanent engineering controls and procedural verification checklist for ${finding.title}.`,
    action_type: i % 2 === 0 ? "ENGINEERING" : "PROCEDURAL",
    status,
    effectiveness_status: effStatus,
    assigned_to: `Maintenance Lead ${(i % 5) + 1}`,
    finding_id: finding.id,
    finding: {
      id: finding.id,
      finding_code: finding.finding_code,
      title: finding.title,
      severity: finding.severity,
      category: finding.category,
      is_recurring: finding.is_recurring,
    },
    facility_code: finding.facility_code,
  };
});

export const MOCK_MEMORY_MODELS = [
  {
    model_id: "mm-1",
    name: "Organizational Compliance Profile",
    category: "GOVERNANCE",
    relevance: 98,
    tags: ["governance", "baseline"],
    summary:
      "Enterprise compliance baseline across all 5 operating sites exhibits high statutory adherence (89.9% index) but reveals seasonal drift during quarter-end production peaks.",
    reflection:
      "Synthesized from 41 historical audits. Peak non-conformance incidence occurs in distribution bays and machine changeover areas during high-tempo throughput windows.",
  },
  {
    model_id: "mm-2",
    name: "Recurring Compliance Failures",
    category: "RECURRENCE",
    relevance: 96,
    tags: ["recurrence", "velocity"],
    summary:
      "Identifies that 64% of recurring non-conformances happen between 61–90 days following administrative training sign-offs. Physical engineering controls demonstrate 100% durability.",
    reflection:
      "Procedural memos and signage provide an average of 42 days of compliance durability before human behavioral reversion occurs. Physical interlocks and laser barriers yield zero recurrences.",
  },
  {
    model_id: "mm-3",
    name: "Facility-Level Weaknesses",
    category: "FACILITY",
    relevance: 95,
    tags: ["facility", "topography"],
    summary:
      "Plant A (Detroit) and Warehouse B (Reno) exhibit shared vulnerability to emergency exit route obstructions caused by pallet staging overflow.",
    reflection:
      "Cross-site topology reveals identical root-cause dynamics: lack of designated overflow buffer staging zones forces material handlers to stage overflow inventory in marked egress corridors.",
  },
  {
    model_id: "mm-4",
    name: "Corrective-Action Effectiveness",
    category: "CAPA",
    relevance: 95,
    tags: ["capa", "durability"],
    summary:
      "Evaluates CAPA durability beyond procedural completion: 53.3% of corrective actions recur within 90 days when relying exclusively on procedural training.",
    reflection:
      "Empirical verification confirms that only mechanical interlocks, HDPE physical liners, and automated sensor gates survive the 90-day verification horizon without defect return.",
  },
  {
    model_id: "mm-5",
    name: "Emerging Operational Risks",
    category: "RISK",
    relevance: 94,
    tags: ["risk", "predictive"],
    summary:
      "Early warning indicators highlight battery charging hydrogen gas accumulation at Warehouse B during concurrent charging of Class IV forklift fleets.",
    reflection:
      "Correlates ventilation fan duty cycles with multi-bay charging schedules. Automated interlocking between battery chargers and exhaust fans recommended.",
  },
  {
    model_id: "mm-6",
    name: "Organizational Lessons Learned",
    category: "LESSONS",
    relevance: 95,
    tags: ["lessons", "institutional"],
    summary:
      "Distills multi-year compliance wisdom: Chemical containment berms require ultrasonic seam-tested HDPE liners rather than topical epoxy sealants.",
    reflection:
      "Historic epoxy coatings cracked under thermal expansion within 14 months; HDPE ultrasonic welded liners deployed in 2026 show zero degradation over 180-day stress cycle.",
  },
];

export const MOCK_MEMORY_STATUS = {
  bank_id: "auditmind-org-meridian-01",
  organization_id: "00000000-0000-0000-0000-000000000001",
  is_live_hindsight: true,
  hindsight_base_url: "https://hindsight.meridian.internal",
  total_memories: 142,
  category_breakdown: {
    AUDIT_FACT: 52,
    INSPECTION_EXPERIENCE: 38,
    CAPA_DECISION: 32,
    VERIFIED_OUTCOME: 20,
  },
  facility_breakdown: {
    "FAC-001": 38,
    "FAC-002": 32,
    "FAC-003": 26,
    "FAC-004": 24,
    "FAC-005": 22,
  },
  mental_models: MOCK_MEMORY_MODELS.map((m) => m.name),
  last_synced: new Date().toISOString(),
};

export const MOCK_AGENT_EVENTS = [
  {
    event_type: "TOOL_CALL",
    created_at: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    query: "recall_organizational_memory('emergency exit egress blockage', tags=['recurrence'])",
  },
  {
    event_type: "TOOL_CALL",
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    query: "search_audits(facility_code='FAC-001', category='Machine Safety')",
  },
  {
    event_type: "HINDSIGHT_RECALL",
    created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    query: "Retrieved 6 episodic nodes for stamping press interlock bypass history",
  },
  {
    event_type: "VERIFICATION",
    created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    query: "CAPA-2026-018 HDPE berm liner verified durable (90-day observation window)",
  },
];
