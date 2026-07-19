import React, { useState, useRef } from "react";

const DEVICES = [
  "Ventilator",
  "Infusion Pump",
  "Patient Monitor",
  "Defibrillator",
  "Dialysis Machine",
  "ECG Machine",
  "Anesthesia Machine",
  "Syringe Pump",
  "Other",
];

const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
`;

function ticketSeed() {
  const d = new Date();
  const base =
    (d.getFullYear() % 100) * 10000 +
    (d.getMonth() + 1) * 100 +
    d.getDate();
  return (base % 9000) + 1000;
}

export default function BMETConsole() {
  const [device, setDevice] = useState(null);
  const [customDevice, setCustomDevice] = useState("");
  const [symptom, setSymptom] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);
  const ticketCount = useRef(0);
  const [ticketId, setTicketId] = useState(null);

  const activeDevice = device === "Other" ? customDevice : device;

  async function runDiagnosis() {
    if (!activeDevice || !symptom.trim()) return;
    setLoading(true);
    setErr(null);
    setResult(null);
    ticketCount.current += 1;
    setTicketId(`BMET-${ticketSeed()}-${String(ticketCount.current).padStart(3, "0")}`);

    try {
      const response = await fetch("/api/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ device: activeDevice, symptom: symptom.trim() }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || `Request failed (${response.status})`);
      }
      const parsed = await response.json();
      setResult(parsed);
    } catch (e) {
      setErr("Diagnostic run failed — check connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        "--bg": "#FFFFFF",
        "--panel": "#F1FAFC",
        "--panel-alt": "#E2F5F9",
        "--border": "#B9E7EE",
        "--text": "#0B1E24",
        "--muted": "#5B7982",
        "--accent": "#00A9C7",
        "--accent-dim": "rgba(0,169,199,0.12)",
        "--warn": "#C97A0A",
        "--danger": "#D6402F",
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: "'IBM Plex Sans', sans-serif",
        minHeight: "100vh",
        padding: "24px 16px 40px",
        boxSizing: "border-box",
      }}
    >
      <style>{`
        ${FONT_IMPORT}
        .mono { font-family: 'IBM Plex Mono', monospace; }
        .chip {
          border: 1px solid var(--border);
          background: var(--panel-alt);
          color: var(--muted);
          padding: 7px 12px;
          border-radius: 3px;
          font-size: 12.5px;
          cursor: pointer;
          transition: border-color .15s, color .15s, background .15s;
          font-family: 'IBM Plex Mono', monospace;
        }
        .chip:hover { border-color: var(--accent); color: var(--text); }
        .chip.active {
          border-color: var(--accent);
          background: var(--accent-dim);
          color: var(--accent);
        }
        .console-input:focus, .console-btn:focus, .chip:focus {
          outline: 2px solid var(--accent);
          outline-offset: 2px;
        }
        @keyframes blink { 50% { opacity: 0; } }
        .cursor { animation: blink 1s step-start infinite; }
      `}</style>

      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            borderBottom: "1px solid var(--border)",
            paddingBottom: 16,
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div>
            <div
              className="mono"
              style={{ fontSize: 11, color: "var(--accent)", letterSpacing: 2 }}
            >
              CLINICAL ENGINEERING · DIAGNOSTIC AID
            </div>
            <h1
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 22,
                fontWeight: 600,
                margin: "4px 0 0",
                color: "var(--text)",
              }}
            >
              BMET Console
            </h1>
          </div>
          <div
            style={{
              border: "1px dashed var(--border)",
              borderRadius: 6,
              padding: "8px 12px",
              transform: "rotate(1.5deg)",
              background: "var(--panel)",
              minWidth: 150,
            }}
          >
            <div className="mono" style={{ fontSize: 9, color: "var(--muted)" }}>
              TICKET
            </div>
            <div className="mono" style={{ fontSize: 14, color: "var(--text)" }}>
              {ticketId || "— pending —"}
            </div>
          </div>
        </div>

        {/* Device select */}
        <div style={{ marginBottom: 16 }}>
          <div className="mono" style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>
            01 / EQUIPMENT
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {DEVICES.map((d) => (
              <button
                key={d}
                className={`chip ${device === d ? "active" : ""}`}
                onClick={() => setDevice(d)}
              >
                {d}
              </button>
            ))}
          </div>
          {device === "Other" && (
            <input
              className="console-input mono"
              placeholder="Specify device"
              value={customDevice}
              onChange={(e) => setCustomDevice(e.target.value)}
              style={{
                marginTop: 8,
                width: "100%",
                background: "var(--panel-alt)",
                border: "1px solid var(--border)",
                borderRadius: 3,
                color: "var(--text)",
                padding: "8px 10px",
                fontSize: 13,
                boxSizing: "border-box",
              }}
            />
          )}
        </div>

        {/* Symptom input */}
        <div style={{ marginBottom: 16 }}>
          <div className="mono" style={{ fontSize: 11, color: "var(--muted)", marginBottom: 8 }}>
            02 / SYMPTOM OR ERROR CODE
          </div>
          <textarea
            className="console-input"
            value={symptom}
            onChange={(e) => setSymptom(e.target.value)}
            placeholder="e.g. E-042 low pressure alarm during inspiration, intermittent"
            rows={3}
            style={{
              width: "100%",
              background: "var(--panel-alt)",
              border: "1px solid var(--border)",
              borderRadius: 3,
              color: "var(--text)",
              padding: "10px",
              fontSize: 13.5,
              fontFamily: "'IBM Plex Sans', sans-serif",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          className="console-btn mono"
          onClick={runDiagnosis}
          disabled={!activeDevice || !symptom.trim() || loading}
          style={{
            background: !activeDevice || !symptom.trim() ? "var(--panel-alt)" : "var(--accent)",
            color: !activeDevice || !symptom.trim() ? "var(--muted)" : "#FFFFFF",
            border: "none",
            borderRadius: 3,
            padding: "10px 20px",
            fontSize: 13,
            fontWeight: 600,
            cursor: !activeDevice || !symptom.trim() ? "not-allowed" : "pointer",
            marginBottom: 24,
          }}
        >
          {loading ? "Running diagnostic…" : "Run diagnostic"}
        </button>

        {/* Output console */}
        {(loading || result || err) && (
          <div
            style={{
              background: "var(--panel)",
              border: "1px solid var(--border)",
              borderRadius: 4,
              padding: 18,
            }}
          >
            <div
              className="mono"
              style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12 }}
            >
              &gt; SERVICE LOG {loading && <span className="cursor">▌</span>}
            </div>

            {loading && (
              <div className="mono" style={{ fontSize: 13, color: "var(--muted)" }}>
                Cross-referencing fault patterns for {activeDevice}...
              </div>
            )}

            {err && (
              <div className="mono" style={{ fontSize: 13, color: "var(--danger)" }}>
                {err}
              </div>
            )}

            {result && (
              <>
                <LogSection
                  label="LIKELY CAUSES"
                  items={result.likely_causes}
                  color="var(--text)"
                />
                <LogSection
                  label="CHECKS TO RUN"
                  items={result.checks}
                  color="var(--accent)"
                />
                <LogSection
                  label="SAFETY NOTES"
                  items={result.safety_notes}
                  color="var(--warn)"
                />
                <div style={{ marginTop: 14 }}>
                  <div
                    className="mono"
                    style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 4 }}
                  >
                    ESCALATE WHEN
                  </div>
                  <div style={{ fontSize: 13.5, color: "var(--text)" }}>{result.escalate}</div>
                </div>
                <div
                  className="mono"
                  style={{
                    fontSize: 10,
                    color: "var(--muted)",
                    marginTop: 14,
                    textTransform: "uppercase",
                  }}
                >
                  Confidence: {result.confidence}
                </div>
              </>
            )}
          </div>
        )}

        {/* Disclaimer strip */}
        <div
          style={{
            marginTop: 24,
            borderLeft: "3px solid var(--warn)",
            paddingLeft: 12,
            fontSize: 11.5,
            color: "var(--muted)",
            lineHeight: 1.5,
          }}
        >
          Decision-support prototype only. Always follow OEM service manuals, hospital
          protocols, and lockout/tagout procedures. Not a substitute for manufacturer
          documentation or clinical engineering sign-off.
        </div>

        <div
          className="mono"
          style={{
            marginTop: 20,
            fontSize: 11,
            color: "var(--muted)",
            letterSpacing: 0.5,
            textAlign: "right",
          }}
        >
          Done by: Eng Mohammed Fatihelrahman Mahgoub Ahmed
        </div>
      </div>
    </div>
  );
}

function LogSection({ label, items, color }) {
  if (!items || !items.length) return null;
  return (
    <div style={{ marginBottom: 14 }}>
      <div
        className="mono"
        style={{ fontSize: 10.5, color: "var(--muted)", marginBottom: 6 }}
      >
        {label}
      </div>
      {items.map((it, i) => (
        <div
          key={i}
          className="mono"
          style={{ fontSize: 13, color, marginBottom: 3, display: "flex", gap: 8 }}
        >
          <span style={{ color: "var(--muted)" }}>·</span>
          <span style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>{it}</span>
        </div>
      ))}
    </div>
  );
}
