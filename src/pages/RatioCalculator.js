import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }
const fmt = (v, d = 6) => (Math.round(v * 10 ** d) / 10 ** d).toString();

export default function RatioCalculator() {
  const [tab, setTab] = useState("simplify");
  // Simplify
  const [sA, setSA] = useState("15");
  const [sB, setSB] = useState("25");
  // Proportion a:b = c:?
  const [pA, setPA] = useState("3");
  const [pB, setPB] = useState("4");
  const [pC, setPC] = useState("9");
  // Scale ratio
  const [scA, setScA] = useState("1");
  const [scB, setScB] = useState("500");
  const [scReal, setScReal] = useState("7.5");
  // Compare 3 ratios
  const [r1A, setR1A] = useState("2"); const [r1B, setR1B] = useState("3");
  const [r2A, setR2A] = useState("4"); const [r2B, setR2B] = useState("6");
  const [r3A, setR3A] = useState("6"); const [r3B, setR3B] = useState("9");

  const simplified = useMemo(() => {
    const a = Math.round(Math.abs(parseFloat(sA))), b = Math.round(Math.abs(parseFloat(sB)));
    if (!a || !b || isNaN(a) || isNaN(b)) return null;
    const g = gcd(a, b);
    const ra = a / g, rb = b / g;
    const total = a + b;
    return {
      ra, rb, g,
      pctA: (a / total * 100).toFixed(2),
      pctB: (b / total * 100).toFixed(2),
      fracA: `${a}/${total}`,
      fracB: `${b}/${total}`,
      decA: fmt(a / b),
    };
  }, [sA, sB]);

  const proportion = useMemo(() => {
    const a = parseFloat(pA), b = parseFloat(pB), c = parseFloat(pC);
    if (isNaN(a) || isNaN(b) || isNaN(c) || a === 0) return null;
    const d = (b * c) / a;
    return { d, check: `${fmt(a)}:${fmt(b)} = ${fmt(c)}:${fmt(d)}` };
  }, [pA, pB, pC]);

  const scale = useMemo(() => {
    const a = parseFloat(scA), b = parseFloat(scB), real = parseFloat(scReal);
    if (isNaN(a) || isNaN(b) || isNaN(real) || a === 0) return null;
    const actual = real * (b / a);
    return { actual };
  }, [scA, scB, scReal]);

  const compared = useMemo(() => {
    const ratios = [
      { a: parseFloat(r1A), b: parseFloat(r1B) },
      { a: parseFloat(r2A), b: parseFloat(r2B) },
      { a: parseFloat(r3A), b: parseFloat(r3B) },
    ];
    return ratios.map(r => {
      if (isNaN(r.a) || isNaN(r.b) || r.b === 0) return null;
      const g = gcd(Math.round(r.a), Math.round(r.b));
      return { ...r, dec: r.a / r.b, pct: (r.a / (r.a + r.b) * 100).toFixed(2), simp: `${r.a / g}:${r.b / g}` };
    });
  }, [r1A, r1B, r2A, r2B, r3A, r3B]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Ratio Calculator</h1>
        <p className="muted">
          Simplify ratios, solve proportions (a:b = c:?), scale ratios, and compare multiple ratios.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Mode</h2>
          <div className="tab-row" style={{ flexWrap: "wrap" }}>
            <button className={`tab-btn${tab === "simplify" ? " active" : ""}`} onClick={() => setTab("simplify")}>Simplify</button>
            <button className={`tab-btn${tab === "proportion" ? " active" : ""}`} onClick={() => setTab("proportion")}>Proportion</button>
            <button className={`tab-btn${tab === "scale" ? " active" : ""}`} onClick={() => setTab("scale")}>Scale</button>
            <button className={`tab-btn${tab === "compare" ? " active" : ""}`} onClick={() => setTab("compare")}>Compare</button>
          </div>

          {tab === "simplify" && (
            <>
              <p className="small">Reduce a ratio A : B to its simplest form.</p>
              <div className="row two">
                <div className="field"><label>A</label><input type="number" min="0" value={sA} onChange={e => setSA(e.target.value)} /></div>
                <div className="field"><label>B</label><input type="number" min="0" value={sB} onChange={e => setSB(e.target.value)} /></div>
              </div>
              {simplified && (
                <>
                  <div style={{ padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)", marginTop: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>Simplified Ratio</div>
                    <div style={{ fontSize: 32, fontWeight: 900, color: "#4f46e5" }}>{simplified.ra} : {simplified.rb}</div>
                    <div style={{ fontSize: 12, color: "#6b7a9e", marginTop: 4 }}>GCD = {simplified.g}</div>
                  </div>
                  <table className="table" style={{ marginTop: 14 }}>
                    <tbody>
                      <tr><td>Original ratio</td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>{sA} : {sB}</td></tr>
                      <tr style={{ background: "#f0eeff" }}><td><strong>Simplified</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{simplified.ra} : {simplified.rb}</td></tr>
                      <tr><td>As decimal</td><td style={{ fontFamily: "monospace" }}>1 : {fmt(parseFloat(sB) / parseFloat(sA))}</td></tr>
                      <tr><td>A as fraction of total</td><td style={{ fontFamily: "monospace" }}>{simplified.fracA} ({simplified.pctA}%)</td></tr>
                      <tr><td>B as fraction of total</td><td style={{ fontFamily: "monospace" }}>{simplified.fracB} ({simplified.pctB}%)</td></tr>
                    </tbody>
                  </table>
                </>
              )}
            </>
          )}

          {tab === "proportion" && (
            <>
              <p className="small">Solve: A : B = C : ? &nbsp; Find the missing value D.</p>
              <div className="row two">
                <div className="field"><label>A</label><input type="number" value={pA} onChange={e => setPA(e.target.value)} /></div>
                <div className="field"><label>B</label><input type="number" value={pB} onChange={e => setPB(e.target.value)} /></div>
              </div>
              <div className="row two">
                <div className="field"><label>C</label><input type="number" value={pC} onChange={e => setPC(e.target.value)} /></div>
                <div className="field"><label>D = ?</label><input type="text" value={proportion ? fmt(proportion.d) : "—"} readOnly style={{ background: "#f0eeff", fontWeight: 800, color: "#4f46e5" }} /></div>
              </div>
              {proportion && (
                <div style={{ marginTop: 10, padding: "10px 14px", background: "#f0eeff", borderRadius: 10, fontFamily: "monospace", fontSize: 14, color: "#4f46e5", fontWeight: 700 }}>
                  {proportion.check}
                </div>
              )}
              <table className="table" style={{ marginTop: 14 }}>
                <tbody>
                  <tr><td>Formula</td><td style={{ fontFamily: "monospace" }}>D = (B × C) / A</td></tr>
                  <tr><td>Cross-multiply</td><td style={{ fontFamily: "monospace" }}>A × D = B × C</td></tr>
                </tbody>
              </table>
            </>
          )}

          {tab === "scale" && (
            <>
              <p className="small">Convert between map/model scale and real-world dimensions.</p>
              <div className="row two">
                <div className="field"><label>Scale (map)</label><input type="number" min="0" value={scA} onChange={e => setScA(e.target.value)} /></div>
                <div className="field"><label>Scale (real)</label><input type="number" min="0" value={scB} onChange={e => setScB(e.target.value)} /></div>
              </div>
              <div style={{ textAlign: "center", fontSize: 12, color: "#6b7a9e", marginBottom: 8 }}>Scale Ratio: {scA} : {scB}</div>
              <div className="row">
                <div className="field"><label>Measurement on map / model</label><input type="number" min="0" value={scReal} onChange={e => setScReal(e.target.value)} /></div>
              </div>
              {scale && (
                <div style={{ marginTop: 12, padding: "14px 16px", background: "#f0eeff", borderRadius: 12, border: "1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 4 }}>Real-world measurement</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#4f46e5" }}>{fmt(scale.actual)}</div>
                  <div style={{ fontSize: 12, color: "#6b7a9e", marginTop: 2 }}>{scReal} × ({scB} / {scA})</div>
                </div>
              )}
            </>
          )}

          {tab === "compare" && (
            <>
              <p className="small">Compare up to three ratios.</p>
              {[[r1A, setR1A, r1B, setR1B], [r2A, setR2A, r2B, setR2B], [r3A, setR3A, r3B, setR3B]].map(([a, sa, b, sb], i) => (
                <div className="row two" key={i}>
                  <div className="field"><label>Ratio {i + 1} — A</label><input type="number" value={a} onChange={e => sa(e.target.value)} /></div>
                  <div className="field"><label>Ratio {i + 1} — B</label><input type="number" value={b} onChange={e => sb(e.target.value)} /></div>
                </div>
              ))}
            </>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">Results</h2>

          {tab === "compare" && (
            <table className="table">
              <thead><tr><th>Ratio</th><th>Simplified</th><th>Decimal</th><th>A%</th></tr></thead>
              <tbody>
                {compared.map((r, i) => r ? (
                  <tr key={i} style={i === 0 ? { background: "#f0eeff" } : {}}>
                    <td>{[r1A, r2A, r3A][i]} : {[r1B, r2B, r3B][i]}</td>
                    <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{r.simp}</td>
                    <td style={{ fontFamily: "monospace" }}>{fmt(r.dec)}</td>
                    <td style={{ fontFamily: "monospace" }}>{r.pct}%</td>
                  </tr>
                ) : <tr key={i}><td colSpan={4} style={{ color: "#9ca3af" }}>Invalid</td></tr>)}
              </tbody>
            </table>
          )}

          {tab !== "compare" && (
            <table className="table">
              <thead><tr><th>Property</th><th>Formula</th></tr></thead>
              <tbody>
                <tr><td>Simplify A:B</td><td style={{ fontFamily: "monospace" }}>divide by GCD(A, B)</td></tr>
                <tr><td>Proportion</td><td style={{ fontFamily: "monospace" }}>A:B = C:D → D = BC/A</td></tr>
                <tr><td>Part of total</td><td style={{ fontFamily: "monospace" }}>A/(A+B) × 100%</td></tr>
                <tr><td>As decimal</td><td style={{ fontFamily: "monospace" }}>A ÷ B</td></tr>
                <tr><td>Equivalent</td><td style={{ fontFamily: "monospace" }}>A:B = kA:kB (any k)</td></tr>
              </tbody>
            </table>
          )}

          <h3 className="card-title" style={{ marginTop: 18 }}>Common Ratios</h3>
          <table className="table">
            <thead><tr><th>Ratio</th><th>Simplified</th><th>Decimal</th><th>Use</th></tr></thead>
            <tbody>
              {[
                ["16:9", "16:9", "1.778", "Widescreen"],
                ["4:3", "4:3", "1.333", "Standard screen"],
                ["1:1", "1:1", "1.000", "Square"],
                ["3:2", "3:2", "1.500", "Camera sensor"],
                ["2:1", "2:1", "2.000", "Panoramic"],
                ["1:1.618", "1:φ", "0.618", "Golden ratio"],
                ["1:2", "1:2", "0.500", "Half"],
              ].map(([r, s, d, u]) => (
                <tr key={r}><td>{r}</td><td style={{ fontFamily: "monospace" }}>{s}</td><td style={{ fontFamily: "monospace" }}>{d}</td><td>{u}</td></tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
