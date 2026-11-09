import json
import urllib.request
import os

queries = [
    "Find recurring compliance issues and chronic failure traps across all facilities.",
    "Evaluate CAPA durability: Why did stamping press interlock mitigations fail in subsequent audits?",
    "Compare compliance performance and risk scores across all 5 facilities.",
    "Explain the root cause and regulatory standard behind critical finding FIND-2026-001.",
    "Which facility has the highest critical finding count and why?"
]

results = []
for q in queries:
    req = urllib.request.Request(
        "http://localhost:8000/api/agent/chat",
        data=json.dumps({"message": q}).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "X-Organization-Id": "00000000-0000-0000-0000-000000000001"
        }
    )
    try:
        with urllib.request.urlopen(req, timeout=45) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            response_text = data.get("response") or data.get("reply") or ""
            tools_used = data.get("tools_used", [])
            mode = data.get("mode", "unknown")
            results.append({
                "query": q,
                "response": response_text,
                "char_count": len(response_text),
                "word_count": len(response_text.split()),
                "tools_used": tools_used,
                "mode": mode,
                "raw_keys": list(data.keys())
            })
            print(f"[OK] '{q[:35]}...' -> {len(response_text)} chars, {len(response_text.split())} words, mode={mode}, tools={len(tools_used)}")
    except Exception as e:
        print(f"[ERROR] '{q[:35]}...' -> {e}")

out_path = os.path.join(os.path.dirname(__file__), "..", "docs", "agent_sample_responses.json")
with open(out_path, "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)

print(f"Successfully collected {len(results)} responses to {out_path}")
