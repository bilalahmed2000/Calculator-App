import React, { useState, useCallback } from "react";
import "../css/CalcBase.css";

export default function EmbedCalculatorPage({ title, description, calcPath, CalculatorComponent }) {
  const [width,  setWidth]  = useState(640);
  const [height, setHeight] = useState(520);
  const [copied, setCopied] = useState(false);

  const origin = window.location.origin;
  const iframeCode = `<iframe\n  src="${origin}${calcPath}"\n  width="${width}"\n  height="${height}"\n  frameborder="0"\n  scrolling="auto"\n  title="${title}"\n></iframe>`;

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(iframeCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [iframeCode]);

  return (
    <div className="calc-wrap" style={{ maxWidth: 1100 }}>
      <header className="calc-hero">
        <h1>{title}</h1>
        <p className="muted">{description}</p>
      </header>

      {/* Embed Code Section */}
      <section className="card" style={{ marginBottom: 24 }}>
        <h2 className="card-title">Embed This Calculator on Your Website</h2>
        <p className="small" style={{ marginBottom: 14 }}>
          Copy the code below and paste it into your website's HTML. The calculator will appear exactly as shown below.
        </p>

        {/* Size controls */}
        <div className="row two" style={{ marginBottom: 14 }}>
          <div className="field">
            <label>Width (px): <strong>{width}</strong></label>
            <input type="range" min="300" max="1200" step="10" value={width}
              onChange={e => setWidth(parseInt(e.target.value))}
              style={{ width: "100%", accentColor: "#4f46e5" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9ca3af" }}>
              <span>300px</span><span>1200px</span>
            </div>
          </div>
          <div className="field">
            <label>Height (px): <strong>{height}</strong></label>
            <input type="range" min="300" max="1200" step="10" value={height}
              onChange={e => setHeight(parseInt(e.target.value))}
              style={{ width: "100%", accentColor: "#4f46e5" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9ca3af" }}>
              <span>300px</span><span>1200px</span>
            </div>
          </div>
        </div>

        {/* Code box */}
        <div style={{ position: "relative" }}>
          <pre style={{
            background: "#1e1e2e", color: "#cdd6f4", borderRadius: 12,
            padding: "16px 20px", fontSize: 13, fontFamily: "monospace",
            overflowX: "auto", margin: 0, lineHeight: 1.7,
            border: "1px solid #313244"
          }}>
            <span style={{ color: "#89dceb" }}>&lt;iframe</span>{"\n"}
            {"  "}<span style={{ color: "#a6e3a1" }}>src</span><span style={{ color: "#cdd6f4" }}>="</span><span style={{ color: "#fab387" }}>{origin}{calcPath}</span><span style={{ color: "#cdd6f4" }}>"</span>{"\n"}
            {"  "}<span style={{ color: "#a6e3a1" }}>width</span><span style={{ color: "#cdd6f4" }}>="</span><span style={{ color: "#fab387" }}>{width}</span><span style={{ color: "#cdd6f4" }}>"</span>{"\n"}
            {"  "}<span style={{ color: "#a6e3a1" }}>height</span><span style={{ color: "#cdd6f4" }}>="</span><span style={{ color: "#fab387" }}>{height}</span><span style={{ color: "#cdd6f4" }}>"</span>{"\n"}
            {"  "}<span style={{ color: "#a6e3a1" }}>frameborder</span><span style={{ color: "#cdd6f4" }}>="</span><span style={{ color: "#fab387" }}>0</span><span style={{ color: "#cdd6f4" }}>"</span>{"\n"}
            {"  "}<span style={{ color: "#a6e3a1" }}>scrolling</span><span style={{ color: "#cdd6f4" }}>="</span><span style={{ color: "#fab387" }}>auto</span><span style={{ color: "#cdd6f4" }}>"</span>{"\n"}
            {"  "}<span style={{ color: "#a6e3a1" }}>title</span><span style={{ color: "#cdd6f4" }}>="</span><span style={{ color: "#fab387" }}>{title}</span><span style={{ color: "#cdd6f4" }}>"</span>{"\n"}
            <span style={{ color: "#89dceb" }}>&gt;&lt;/iframe&gt;</span>
          </pre>
          <button onClick={handleCopy} style={{
            position: "absolute", top: 10, right: 10,
            padding: "6px 14px", borderRadius: 8,
            background: copied ? "#16a34a" : "#4f46e5",
            color: "white", border: "none", cursor: "pointer",
            fontWeight: 700, fontSize: 12, transition: "background 0.2s"
          }}>
            {copied ? "✓ Copied!" : "Copy Code"}
          </button>
        </div>

        {/* Instructions */}
        <div style={{ marginTop: 16, padding: "14px 18px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
          <div style={{ fontWeight: 700, fontSize: 13, color: "#374151", marginBottom: 8 }}>How to embed:</div>
          <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: "#6b7a9e", lineHeight: 2 }}>
            <li>Click <strong>Copy Code</strong> above to copy the embed snippet.</li>
            <li>Open your website's HTML editor or CMS (WordPress, Wix, Squarespace, etc.).</li>
            <li>Paste the code where you want the calculator to appear.</li>
            <li>Adjust <strong>width</strong> and <strong>height</strong> above to fit your layout.</li>
            <li>Save and publish — the calculator will be live on your page.</li>
          </ol>
        </div>
      </section>

      {/* Live Preview */}
      <section className="card">
        <h2 className="card-title">Live Preview</h2>
        <p className="small" style={{ marginBottom: 14 }}>This is exactly what your visitors will see when the calculator is embedded.</p>
        <div style={{
          border: "2px dashed #d1d5db", borderRadius: 12, padding: 16,
          background: "#fafafa", overflowX: "auto"
        }}>
          <CalculatorComponent />
        </div>
      </section>
    </div>
  );
}
