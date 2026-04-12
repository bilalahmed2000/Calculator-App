import React, { useState } from "react";
import "../css/CalcBase.css";

function toBase64(str) {
  try { return btoa(unescape(encodeURIComponent(str))); }
  catch { return "Error: unable to encode input"; }
}
function fromBase64(str) {
  try { return decodeURIComponent(escape(atob(str.trim()))); }
  catch { return "Error: invalid Base64 string"; }
}

export default function Base64Calculator() {
  const [tab, setTab]   = useState("encode");
  const [input, setInput] = useState("");

  const output = tab === "encode" ? toBase64(input) : fromBase64(input);
  const isError = output.startsWith("Error");

  const charTable = [
    { range: "A–Z", values: "0–25" },
    { range: "a–z", values: "26–51" },
    { range: "0–9", values: "52–61" },
    { range: "+",   values: "62" },
    { range: "/",   values: "63" },
    { range: "=",   values: "Padding" },
  ];

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Base64 Encode / Decode</h1>
        <p className="muted">
          Convert plain text or binary data to Base64-encoded format, or decode a
          Base64 string back to its original text.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Mode</h2>

          <div className="tab-row">
            <button className={`tab-btn${tab === "encode" ? " active" : ""}`} onClick={() => setTab("encode")}>Encode → Base64</button>
            <button className={`tab-btn${tab === "decode" ? " active" : ""}`} onClick={() => setTab("decode")}>Decode ← Base64</button>
          </div>

          <div className="field" style={{ marginTop: 12 }}>
            <label>{tab === "encode" ? "Plain Text" : "Base64 String"}</label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              rows={5}
              placeholder={tab === "encode"
                ? "Enter text to encode…"
                : "Enter Base64 string to decode…"}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #d1d5db", fontFamily: "monospace", fontSize: 13, resize: "vertical" }}
            />
          </div>

          {input && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>
                {tab === "encode" ? "Base64 Output" : "Decoded Text"}
              </div>
              <div style={{
                padding: "14px 16px", borderRadius: 12, fontFamily: "monospace", fontSize: 13, wordBreak: "break-all", fontWeight: 600,
                background: isError ? "#fef2f2" : "#f0eeff",
                border: `1px solid ${isError ? "#fca5a5" : "rgba(99,102,241,0.2)"}`,
                color: isError ? "#b91c1c" : "#4f46e5",
              }}>
                {output}
              </div>
              {!isError && (
                <div style={{ marginTop: 8, display: "flex", gap: 10 }}>
                  <button className="btn-primary" style={{ padding: "7px 16px", fontSize: 13, width: "auto" }}
                    onClick={() => navigator.clipboard?.writeText(output)}>
                    Copy Output
                  </button>
                  <button style={{ padding: "7px 16px", fontSize: 13, background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 8, cursor: "pointer" }}
                    onClick={() => { setInput(output); setTab(tab === "encode" ? "decode" : "encode"); }}>
                    Swap & Reverse
                  </button>
                  <button style={{ padding: "7px 16px", fontSize: 13, background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 8, cursor: "pointer" }}
                    onClick={() => setInput("")}>
                    Clear
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="kpi-grid" style={{ marginTop: 14 }}>
            <div className="kpi"><div className="kpi-label">Input chars</div><div className="kpi-value">{input.length}</div></div>
            <div className="kpi"><div className="kpi-label">Input bytes</div><div className="kpi-value">{new TextEncoder().encode(input).length}</div></div>
            <div className="kpi"><div className="kpi-label">Output chars</div><div className="kpi-value">{isError ? "—" : output.length}</div></div>
            <div className="kpi">
              <div className="kpi-label">Size increase</div>
              <div className="kpi-value">{tab === "encode" && !isError && input.length > 0
                ? `${(((output.length / new TextEncoder().encode(input).length) - 1) * 100).toFixed(1)}%`
                : "—"}
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="card-title">How Base64 Works</h2>
          <p className="small">
            Base64 encodes binary data into 64 ASCII characters. Every 3 bytes of input
            produce 4 Base64 characters. If input length is not a multiple of 3, <code>=</code> padding is added.
          </p>

          <h3 className="card-title" style={{ marginTop: 16 }}>Base64 Alphabet</h3>
          <table className="table">
            <thead><tr><th>Character(s)</th><th>Index Value(s)</th></tr></thead>
            <tbody>
              {charTable.map(r => (
                <tr key={r.range}>
                  <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{r.range}</td>
                  <td style={{ fontFamily: "monospace" }}>{r.values}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="card-title" style={{ marginTop: 16 }}>Common Uses</h3>
          <table className="table">
            <thead><tr><th>Use Case</th><th>Description</th></tr></thead>
            <tbody>
              <tr><td>Email attachments</td><td style={{ fontSize: 13 }}>MIME encoding for binary files</td></tr>
              <tr><td>Data URLs</td><td style={{ fontSize: 13 }}>Embed images in HTML/CSS</td></tr>
              <tr><td>JSON / APIs</td><td style={{ fontSize: 13 }}>Transmit binary data in JSON</td></tr>
              <tr><td>HTTP Basic Auth</td><td style={{ fontSize: 13 }}>user:pass encoded in header</td></tr>
              <tr><td>JWT tokens</td><td style={{ fontSize: 13 }}>Header and payload encoding</td></tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
