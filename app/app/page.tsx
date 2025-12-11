"use client";
import { useMemo, useState } from "react";

const ALPHA = process.env.NEXT_PUBLIC_ALPHA_CODE;

export default function Page() {
  const [alpha, setAlpha] = useState("");
  const [text, setText] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const gateOk = useMemo(() => {
    if (!ALPHA) return true;         // if no alpha code configured, allow anyone
    return alpha.trim() === ALPHA;   // else require the correct code
  }, [alpha]);

  async function run() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      const data = await res.json();
      setResult(data);
    } catch (e: any) {
      setResult({ error: e?.message || "Failed" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 960, margin: "40px auto", padding: "0 16px" }}>
      <h1 style={{ marginBottom: 8 }}>RiskLens</h1>
      <div style={{ opacity: 0.8, marginBottom: 18 }}>
        Paste contract text → instant flags and a simple risk score.
      </div>

      {ALPHA && (
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", marginBottom: 6 }}>Alpha code</label>
          <input
            value={alpha}
            onChange={(e) => setAlpha(e.target.value)}
            placeholder="predict-alpha"
            style={{ width: "100%", padding: 10, borderRadius: 8 }}
          />
          {!gateOk && (
            <div style={{ color: "#ff9f9f", marginTop: 6 }}>
              Enter the correct alpha code to unlock the tool.
            </div>
          )}
        </div>
      )}

      <label style={{ display: "block", marginBottom: 6 }}>Contract text</label>
      <textarea
        rows={12}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste the clause or contract here…"
        style={{
          width: "100%",
          padding: 12,
          borderRadius: 8,
          resize: "vertical",
          fontFamily: "ui-monospace, Menlo, Consolas, monospace"
        }}
      />

      <div style={{ marginTop: 14, display: "flex", gap: 10 }}>
        <button
          onClick={run}
          disabled={!gateOk || !text.trim() || loading}
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            background: gateOk ? "#7c5cff" : "#444",
            color: "white",
            border: "none",
            cursor: gateOk ? "pointer" : "not-allowed"
          }}
        >
          {loading ? "Analyzing…" : "Run checker"}
        </button>

        <a
          href="/api/export/demo/pdf"
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            background: "#1f2937",
            color: "white",
            textDecoration: "none"
          }}
        >
          Demo PDF
        </a>
      </div>

      {result && (
        <div
          style={{
            marginTop: 20,
            background: "#12182a",
            padding: 16,
            borderRadius: 10
          }}
        >
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
