import { NextResponse } from "next/server";

type Flag = { area: string; status: "ok" | "weak" | "red" | "missing"; details: string };

function analyze(text: string) {
  const t = text.toLowerCase();
  const flags: Flag[] = [];

  // Liquidated damages (LDs)
  const ldMatch = t.match(/(\d+(?:\.\d+)?)\s*%[^a-zA-Z]{0,5}(?:per\s*(?:week|day)|weekly|daily)?/);
  if (ldMatch) {
    const pct = parseFloat(ldMatch[1]);
    const ok = pct <= 1.0; // <=1%/week is common cap in many contexts
    flags.push({
      area: "LDs",
      status: ok ? "ok" : "red",
      details: `Found LD percentage: ${pct}%.`
    });
  } else {
    flags.push({ area: "LDs", status: "missing", details: "No clear LD percentage found." });
  }

  // Warranty (months)
  const w = t.match(/(\d+)\s*(?:months?|mth)/) || t.match(/(\d+)\s*year/);
  if (w) {
    const months = w[0].includes("year") ? parseInt(w[1]) * 12 : parseInt(w[1]);
    flags.push({
      area: "Warranty",
      status: months >= 24 ? "ok" : "weak",
      details: `Warranty appears to be ~${months} months.`
    });
  } else {
    flags.push({ area: "Warranty", status: "missing", details: "No explicit warranty term found." });
  }

  // Confidentiality
  flags.push(
    /confidential|non[-\s]?disclosure|nda/.test(t)
      ? { area: "Confidentiality", status: "ok", details: "Confidentiality present." }
      : { area: "Confidentiality", status: "missing", details: "No confidentiality language detected." }
  );

  // IP ownership
  flags.push(
    /intellectual\s*property|ip\s*rights|ownership|assigns|license/.test(t)
      ? { area: "IP", status: "ok", details: "IP/ownership language appears present." }
      : { area: "IP", status: "missing", details: "No clear IP/ownership provisions found." }
  );

  // Basic risk score
  const scoreMap = { ok: 0, weak: 1, red: 3, missing: 2 } as const;
  const score = flags.reduce((s, f) => s + scoreMap[f.status], 0);
  const grade = score <= 2 ? "Low" : score <= 5 ? "Medium" : "High";

  return { risk: { score, band: grade }, flags };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const text = (body?.text || "").toString();
    if (!text.trim()) return NextResponse.json({ error: "No text provided" }, { status: 400 });
    const out = analyze(text);
    return NextResponse.json(out);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
