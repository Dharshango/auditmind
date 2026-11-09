const fs = require('fs');
let code = fs.readFileSync('AUDITMIND/frontend/src/app/agent/page.tsx', 'utf8');

// 1. Replace font-serif with font-display
code = code.replace(/font-serif/g, 'font-display');

// 2. Replace welcome text
code = code.replace('Where would you like to begin?', 'What would you like to investigate?');

// 3. Update benchmark scenarios to include requested core queries
const oldScenariosRegex = /const BENCHMARK_SCENARIOS = \[[\s\S]*?\];/;
const newScenarios = `const BENCHMARK_SCENARIOS = [
  {
    id: "scenario-a",
    title: "Find recurring issues",
    badge: "Recurring Drift",
    facility: "All facilities",
    prompt: "Find recurring compliance issues and chronic failure traps across all facilities.",
    followUps: [
      "What was the root cause of the egress blockages?",
      "Why did the earlier corrective action fail to hold?",
      "Compare fire safety compliance between Plant A and Plant B",
    ],
  },
  {
    id: "scenario-b",
    title: "Review overdue actions",
    badge: "CAPA Durability",
    facility: "All facilities",
    prompt: "Review all overdue corrective actions awaiting 90-day verification.",
    followUps: [
      "Show 90-day verification outcomes for press interlocks",
      "What physical engineering control is recommended?",
      "How many total machine guarding findings recurred?",
    ],
  },
  {
    id: "scenario-c",
    title: "Compare facilities",
    badge: "Risk Ranking",
    facility: "5 Sites",
    prompt: "Compare compliance performance and risk scores across all 5 facilities.",
    followUps: [
      "Which facility has the highest critical finding count?",
      "Compare Plant A and Plant B recurring rates",
      "Show historical audit scores for Warehouse A",
    ],
  },
  {
    id: "scenario-d",
    title: "Explain an audit finding",
    badge: "Regulatory Citation",
    facility: "Plant A",
    prompt: "Explain the root cause and regulatory standard behind critical finding FIND-2026-001.",
    followUps: [
      "Inspect photographic evidence for FIND-2026-001",
      "What NFPA standard was cited?",
      "Show previous corrective actions for this finding",
    ],
  },
];`;

code = code.replace(oldScenariosRegex, newScenarios);

// 4. Replace zinc tokens with obsidian command center tokens
code = code.replace(/bg-zinc-950/g, 'bg-black');
code = code.replace(/bg-zinc-900\/60/g, 'bg-[#101010]/80');
code = code.replace(/bg-zinc-900/g, 'bg-[#101010]');
code = code.replace(/bg-zinc-800/g, 'bg-[#171717]');
code = code.replace(/border-zinc-800/g, 'border-white/10');
code = code.replace(/border-zinc-700/g, 'border-white/15');
code = code.replace(/text-zinc-400/g, 'text-[#8E8E8E]');
code = code.replace(/text-zinc-500/g, 'text-[#71717A]');
code = code.replace(/text-zinc-300/g, 'text-[#C8C8C8]');
code = code.replace(/text-zinc-200/g, 'text-white');

fs.writeFileSync('AUDITMIND/frontend/src/app/agent/page.tsx', code, 'utf8');
console.log('Agent page updated successfully.');
