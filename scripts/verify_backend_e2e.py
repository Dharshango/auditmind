import asyncio
import httpx

BASE_URL = "http://localhost:8000/api"
ORG_ID = "00000000-0000-0000-0000-000000000001"

async def test_all_apis():
    print("=== STARTING FULL BACKEND & HINDSIGHT VERIFICATION ===")
    headers = {"X-Organization-Id": ORG_ID}
    
    async with httpx.AsyncClient(base_url=BASE_URL, headers=headers, timeout=20.0) as client:
        # 1. Health
        print("[1/8] Verifying Health API...")
        r = await client.get("/health")
        assert r.status_code == 200, f"Health check failed: {r.status_code}"
        data = r.json()
        print(f"  -> Health OK: service='{data.get('service')}', status='{data.get('status')}'")

        # 2. Authentication
        print("[2/8] Verifying Real Authentication API...")
        login_res = await client.post("/auth/login", json={
            "email": "compliance@meridianindustrial.com",
            "password": "compliance123"
        })
        assert login_res.status_code == 200, f"Login failed: {login_res.status_code} - {login_res.text}"
        auth_data = login_res.json()
        token = auth_data["access_token"]
        user = auth_data["user"]
        print(f"  -> Login OK: User='{user['full_name']}', Role='{user['role']}'")
        assert user["organization_id"] == ORG_ID, "Organization mismatch in auth response"

        # Auth profile check
        auth_headers = {"Authorization": f"Bearer {token}", "X-Organization-Id": ORG_ID}
        me_res = await client.get("/auth/me", headers=auth_headers)
        assert me_res.status_code == 200, f"/auth/me failed: {me_res.status_code}"
        print(f"  -> /auth/me OK: email='{me_res.json()['email']}'")

        # 3. Dashboard Overview & Drift Matrix
        print("[3/8] Verifying Dashboard Overview & Compliance Drift APIs...")
        ov_res = await client.get("/dashboard/overview")
        assert ov_res.status_code == 200, f"Overview failed: {ov_res.status_code}"
        ov = ov_res.json()
        print(f"  -> Dashboard Overview OK: {ov['total_audits']} audits, {ov['open_findings']} open findings, {ov['recurrence_rate_percent']}% recurrence rate")
        assert len(ov["facilities_ranking"]) == 5, f"Expected 5 facilities ranking, got {len(ov['facilities_ranking'])}"

        drift_res = await client.get("/dashboard/drift-matrix")
        assert drift_res.status_code == 200, f"Drift matrix failed: {drift_res.status_code}"
        drift = drift_res.json()
        print(f"  -> Drift Matrix OK: {len(drift['drift_matrix'])} categories tracked")

        # 4. Facilities Network
        print("[4/8] Verifying Facility Network API...")
        fac_res = await client.get("/facilities")
        assert fac_res.status_code == 200, f"Facilities failed: {fac_res.status_code}"
        fac_json = fac_res.json()
        facs = fac_json.get("facilities", [])
        print(f"  -> Facilities OK: {len(facs)} facilities retrieved")
        assert len(facs) == 5, f"Expected 5 facilities, got {len(facs)}"

        # 5. Audits & Findings
        print("[5/8] Verifying Audits and Findings Ledgers...")
        aud_res = await client.get("/audits")
        assert aud_res.status_code == 200, f"Audits failed: {aud_res.status_code}"
        aud_json = aud_res.json()
        audits = aud_json.get("audits", [])
        print(f"  -> Audits OK: {len(audits)} audits retrieved (Total in DB: {aud_json.get('total')})")
        assert aud_json.get("total", 0) >= 40

        find_res = await client.get("/findings")
        assert find_res.status_code == 200, f"Findings failed: {find_res.status_code}"
        find_json = find_res.json()
        findings = find_json.get("findings", [])
        print(f"  -> Findings OK: {len(findings)} findings retrieved (Total in DB: {find_json.get('total')})")
        assert find_json.get("total", 0) >= 50

        # 6. Corrective Actions (CAPA)
        print("[6/8] Verifying Corrective Actions & Verification Protocol...")
        ca_res = await client.get("/actions")
        assert ca_res.status_code == 200, f"Actions failed: {ca_res.status_code}"
        ca_json = ca_res.json()
        cas = ca_json.get("corrective_actions", [])
        print(f"  -> CAPA OK: {len(cas)} corrective actions retrieved (Total in DB: {ca_json.get('total')})")
        assert ca_json.get("total", 0) >= 75

        # 7. Hindsight Organizational Memory Engine
        print("[7/8] Verifying Hindsight Memory Subsystem (Status, Search, Mental Models)...")
        mem_status = await client.get("/memory/status")
        assert mem_status.status_code == 200, f"Memory status failed: {mem_status.status_code}"
        ms = mem_status.json()
        print(f"  -> Hindsight Bank Status: {ms.get('status')}, bank_id='{ms.get('bank_id')}'")

        mem_search = await client.get("/memory/search", params={"query": "fire safety egress obstruction"})
        assert mem_search.status_code == 200, f"Memory search failed: {mem_search.status_code}"
        search_res = mem_search.json()
        print(f"  -> Memory Search OK: Retrieved {len(search_res.get('memories', []))} memories for 'fire safety'")

        mental_res = await client.get("/memory/mental-models")
        assert mental_res.status_code == 200, f"Mental models failed: {mental_res.status_code}"
        mm = mental_res.json()
        print(f"  -> Mental Models OK: {len(mm.get('mental_models', []))} active models synthesized")

        # 8. Cognitive Agent (Chat, Recall, Reflect)
        print("[8/8] Verifying Cognitive Agent Subsystem...")
        recall_res = await client.post("/agent/recall", json={
            "query": "fire safety documentation failures at Meridian",
            "tags": ["fire-safety"]
        })
        assert recall_res.status_code == 200, f"Agent recall failed: {recall_res.status_code}"
        print(f"  -> Agent Recall OK: {len(recall_res.json().get('memories', []))} memories retrieved")

        reflect_res = await client.post("/agent/reflect", json={
            "query": "Why did fire safety documentation recur across plants?"
        })
        assert reflect_res.status_code == 200, f"Agent reflect failed: {reflect_res.status_code}"
        reflect_text = reflect_res.json().get("reflection", "")
        print(f"  -> Agent Reflect OK: length={len(reflect_text)} chars")

        chat_res = await client.post("/agent/chat", json={
            "message": "Summarize the recurrence rate across Meridian facilities.",
            "history": []
        })
        assert chat_res.status_code == 200, f"Agent chat failed: {chat_res.status_code}"
        chat_data = chat_res.json()
        print(f"  -> Agent Chat OK: agent replied ({len(chat_data.get('response', ''))} chars)")

    print("\n==================================================")
    print("ALL 8 BACKEND API & HINDSIGHT CHECKS PASSED (100%)")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(test_all_apis())
