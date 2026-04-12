import React, { useState } from "react";
import "../css/CalcBase.css";

function encodeURL(str) {
  try { return encodeURIComponent(str); } catch { return "Error encoding input"; }
}
function decodeURL(str) {
  try { return decodeURIComponent(str); } catch { return "Error: invalid encoded string"; }
}

export default function UrlEncodeDecodeCalculator() {
  const [tab, setTab] = useState("encode");
  const [input, setInput] = useState("");

  const output = tab === "encode" ? encodeURL(input) : decodeURL(input);

  const specialChars = [
    { char: " ", encoded: "%20", desc: "Space" },
    { char: "!", encoded: "%21", desc: "Exclamation" },
    { char: "#", encoded: "%23", desc: "Hash / Fragment" },
    { char: "$", encoded: "%24", desc: "Dollar" },
    { char: "&", encoded: "%26", desc: "Ampersand" },
    { char: "'", encoded: "%27", desc: "Apostrophe" },
    { char: "(", encoded: "%28", desc: "Left paren" },
    { char: ")", encoded: "%29", desc: "Right paren" },
    { char: "*", encoded: "%2A", desc: "Asterisk" },
    { char: "+", encoded: "%2B", desc: "Plus" },
    { char: ",", encoded: "%2C", desc: "Comma" },
    { char: "/", encoded: "%2F", desc: "Forward slash" },
    { char: ":", encoded: "%3A", desc: "Colon" },
    { char: ";", encoded: "%3B", desc: "Semicolon" },
    { char: "=", encoded: "%3D", desc: "Equals" },
    { char: "?", encoded: "%3F", desc: "Question mark" },
    { char: "@", encoded: "%40", desc: "At sign" },
    { char: "[", encoded: "%5B", desc: "Left bracket" },
    { char: "]", encoded: "%5D", desc: "Right bracket" },
  ];

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>URL Encode / Decode</h1>
        <p className="muted">
          Encode special characters in a URL string to percent-encoded format,
          or decode a percent-encoded URL back to plain text.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Mode</h2>

          <div className="tab-row">
            <button className={`tab-btn${tab === "encode" ? " active" : ""}`} onClick={() => setTab("encode")}>Encode</button>
            <button className={`tab-btn${tab === "decode" ? " active" : ""}`} onClick={() => setTab("decode")}>Decode</button>
          </div>

          <div className="field" style={{ marginTop: 12 }}>
            <label>{tab === "encode" ? "Text to Encode" : "URL-encoded String to Decode"}</label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              rows={5}
              placeholder={tab === "encode"
                ? "e.g. https://example.com/path?name=hello world&lang=en"
                : "e.g. https%3A%2F%2Fexample.com%2Fpath%3Fname%3Dhello%20world"}
              style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #d1d5db", fontFamily: "monospace", fontSize: 13, resize: "vertical" }}
            />
          </div>

          {input && (
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>
                {tab === "encode" ? "Encoded Output" : "Decoded Output"}
              </div>
              <div style={{ padding: "14px 16px", background: "#f0eeff", borderRadius: 12, border: "1px solid rgba(99,102,241,0.2)", fontFamily: "monospace", fontSize: 13, wordBreak: "break-all", color: "#4f46e5", fontWeight: 600 }}>
                {output}
              </div>
              <div style={{ marginTop: 8, display: "flex", gap: 10 }}>
                <button className="btn-primary" style={{ padding: "7px 16px", fontSize: 13, width: "auto" }}
                  onClick={() => navigator.clipboard?.writeText(output)}>
                  Copy Output
                </button>
                <button style={{ padding: "7px 16px", fontSize: 13, background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 8, cursor: "pointer" }}
                  onClick={() => { setInput(output); }}>
                  Use as Input
                </button>
                <button style={{ padding: "7px 16px", fontSize: 13, background: "#f3f4f6", border: "1px solid #d1d5db", borderRadius: 8, cursor: "pointer" }}
                  onClick={() => setInput("")}>
                  Clear
                </button>
              </div>
            </div>
          )}

          <div className="kpi-grid" style={{ marginTop: 14 }}>
            <div className="kpi"><div className="kpi-label">Input length</div><div className="kpi-value">{input.length}</div></div>
            <div className="kpi"><div className="kpi-label">Output length</div><div className="kpi-value">{output.length}</div></div>
          </div>
        </section>

        <section className="card">
          <h2 className="card-title">URL Encoding Reference</h2>
          <p className="small">Characters that must be percent-encoded in URLs:</p>
          <table className="table">
            <thead><tr><th>Character</th><th>Encoded</th><th>Description</th></tr></thead>
            <tbody>
              {specialChars.map(r => (
                <tr key={r.char}>
                  <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{r.char}</td>
                  <td style={{ fontFamily: "monospace", color: "#4f46e5" }}>{r.encoded}</td>
                  <td style={{ fontSize: 13 }}>{r.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
