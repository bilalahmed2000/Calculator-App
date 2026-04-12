import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const LN2 = Math.LN2;
const fmt = (v, d = 6) => isFinite(v) && v >= 0 ? (Math.round(v * 10 ** d) / 10 ** d).toLocaleString("en-US", { maximumSignificantDigits: 10 }) : "—";

const ISOTOPES = [
  { name: "Carbon-14",    symbol: "¹⁴C",   half: "5,730 years",    use: "Radiocarbon dating" },
  { name: "Uranium-235",  symbol: "²³⁵U",  half: "703.8 million yr", use: "Nuclear fuel/dating" },
  { name: "Uranium-238",  symbol: "²³⁸U",  half: "4.47 billion yr",  use: "Rock age dating" },
  { name: "Potassium-40", symbol: "⁴⁰K",   half: "1.25 billion yr",  use: "Geologic dating" },
  { name: "Cobalt-60",    symbol: "⁶⁰Co",  half: "5.27 years",       use: "Medical/industrial" },
  { name: "Iodine-131",   symbol: "¹³¹I",  half: "8.02 days",        use: "Thyroid therapy" },
  { name: "Cesium-137",   symbol: "¹³⁷Cs", half: "30.17 years",      use: "Industrial gauges" },
  { name: "Radon-222",    symbol: "²²²Rn", half: "3.82 days",        use: "Indoor air quality" },
  { name: "Tritium (³H)", symbol: "³H",    half: "12.32 years",      use: "Self-lit devices" },
  { name: "Strontium-90", symbol: "⁹⁰Sr",  half: "28.8 years",       use: "Beta source, RTGs" },
];

export default function HalfLifeCalculator() {
  const [mode, setMode] = useState("remaining"); // "remaining" | "elapsed" | "halflife"
  const [n0, setN0]       = useState("1000");
  const [nt, setNt]       = useState("250");
  const [t, setT]         = useState("2");
  const [t12, setT12]     = useState("1");

  const result = useMemo(() => {
    const vN0  = parseFloat(n0);
    const vNt  = parseFloat(nt);
    const vT   = parseFloat(t);
    const vT12 = parseFloat(t12);

    if (mode === "remaining") {
      if (isNaN(vN0) || isNaN(vT) || isNaN(vT12)) return null;
      if (vN0 <= 0 || vT < 0 || vT12 <= 0) return null;
      const lambda = LN2 / vT12;
      const remaining = vN0 * Math.pow(0.5, vT / vT12);
      const decayed   = vN0 - remaining;
      const pctLeft   = (remaining / vN0) * 100;
      const nHalves   = vT / vT12;
      const meanLife  = vT12 / LN2;
      return { remaining, decayed, pctLeft, nHalves, lambda, meanLife };
    }

    if (mode === "elapsed") {
      if (isNaN(vN0) || isNaN(vNt) || isNaN(vT12)) return null;
      if (vN0 <= 0 || vNt <= 0 || vNt > vN0 || vT12 <= 0) return null;
      const tElapsed = vT12 * Math.log(vN0 / vNt) / LN2;
      const lambda   = LN2 / vT12;
      const nHalves  = tElapsed / vT12;
      const pctLeft  = (vNt / vN0) * 100;
      return { tElapsed, lambda, nHalves, pctLeft };
    }

    if (mode === "halflife") {
      if (isNaN(vN0) || isNaN(vNt) || isNaN(vT)) return null;
      if (vN0 <= 0 || vNt <= 0 || vNt > vN0 || vT <= 0) return null;
      const t12v   = vT * LN2 / Math.log(vN0 / vNt);
      const lambda = LN2 / t12v;
      const meanLife = t12v / LN2;
      return { t12v, lambda, meanLife };
    }
    return null;
  }, [mode, n0, nt, t, t12]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Half-Life Calculator</h1>
        <p className="muted">
          Calculate radioactive decay: find remaining quantity, time elapsed, or half-life
          using the formula N(t) = N₀ × (½)^(t/t½).
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Mode</h2>

          <div className="tab-row">
            <button className={`tab-btn${mode === "remaining" ? " active" : ""}`} onClick={() => setMode("remaining")}>Find N(t)</button>
            <button className={`tab-btn${mode === "elapsed"   ? " active" : ""}`} onClick={() => setMode("elapsed")}>Find Time</button>
            <button className={`tab-btn${mode === "halflife"  ? " active" : ""}`} onClick={() => setMode("halflife")}>Find Half-Life</button>
          </div>

          {/* Remaining quantity */}
          {mode === "remaining" && (
            <>
              <p className="small">Given N₀, half-life t½, and time t → find remaining N(t).</p>
              <div className="row two">
                <div className="field"><label>Initial quantity N₀</label><input type="number" min="0" value={n0} onChange={e => setN0(e.target.value)} /></div>
                <div className="field"><label>Half-life (t½)</label><input type="number" min="0" value={t12} onChange={e => setT12(e.target.value)} /></div>
              </div>
              <div className="row">
                <div className="field"><label>Elapsed time (t) — same unit as t½</label><input type="number" min="0" value={t} onChange={e => setT(e.target.value)} /></div>
              </div>
              {result && (
                <div style={{ marginTop: 14, padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>Remaining quantity N(t)</div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: "#4f46e5" }}>{fmt(result.remaining)}</div>
                  <div style={{ fontSize: 13, color: "#6b7a9e", marginTop: 4 }}>{fmt(result.pctLeft, 2)}% remains &nbsp;|&nbsp; {fmt(result.decayed)} decayed</div>
                </div>
              )}
            </>
          )}

          {/* Elapsed time */}
          {mode === "elapsed" && (
            <>
              <p className="small">Given N₀, N(t), and half-life → find time elapsed.</p>
              <div className="row two">
                <div className="field"><label>Initial quantity N₀</label><input type="number" min="0" value={n0} onChange={e => setN0(e.target.value)} /></div>
                <div className="field"><label>Current quantity N(t)</label><input type="number" min="0" value={nt} onChange={e => setNt(e.target.value)} /></div>
              </div>
              <div className="row">
                <div className="field"><label>Half-life (t½)</label><input type="number" min="0" value={t12} onChange={e => setT12(e.target.value)} /></div>
              </div>
              {result && (
                <div style={{ marginTop: 14, padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>Time elapsed (t)</div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: "#4f46e5" }}>{fmt(result.tElapsed)}</div>
                  <div style={{ fontSize: 13, color: "#6b7a9e", marginTop: 4 }}>{fmt(result.nHalves, 4)} half-lives elapsed</div>
                </div>
              )}
            </>
          )}

          {/* Find half-life */}
          {mode === "halflife" && (
            <>
              <p className="small">Given N₀, N(t), and time → find the half-life.</p>
              <div className="row two">
                <div className="field"><label>Initial quantity N₀</label><input type="number" min="0" value={n0} onChange={e => setN0(e.target.value)} /></div>
                <div className="field"><label>Current quantity N(t)</label><input type="number" min="0" value={nt} onChange={e => setNt(e.target.value)} /></div>
              </div>
              <div className="row">
                <div className="field"><label>Elapsed time (t)</label><input type="number" min="0" value={t} onChange={e => setT(e.target.value)} /></div>
              </div>
              {result && (
                <div style={{ marginTop: 14, padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>Half-life (t½)</div>
                  <div style={{ fontSize: 32, fontWeight: 900, color: "#4f46e5" }}>{fmt(result.t12v)}</div>
                </div>
              )}
            </>
          )}

          {result && !result.error && (
            <table className="table" style={{ marginTop: 14 }}>
              <thead><tr><th>Property</th><th>Value</th></tr></thead>
              <tbody>
                {mode === "remaining" && <>
                  <tr style={{ background: "#f0eeff" }}><td><strong>Remaining N(t)</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(result.remaining)}</td></tr>
                  <tr><td>Decayed</td><td style={{ fontFamily: "monospace" }}>{fmt(result.decayed)}</td></tr>
                  <tr><td>% Remaining</td><td style={{ fontFamily: "monospace" }}>{fmt(result.pctLeft, 2)}%</td></tr>
                  <tr><td>Half-lives elapsed</td><td style={{ fontFamily: "monospace" }}>{fmt(result.nHalves, 4)}</td></tr>
                  <tr><td>Decay constant λ</td><td style={{ fontFamily: "monospace" }}>{fmt(result.lambda, 8)}</td></tr>
                  <tr><td>Mean lifetime τ</td><td style={{ fontFamily: "monospace" }}>{fmt(result.meanLife)}</td></tr>
                </>}
                {mode === "elapsed" && <>
                  <tr style={{ background: "#f0eeff" }}><td><strong>Time elapsed (t)</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(result.tElapsed)}</td></tr>
                  <tr><td>Half-lives elapsed</td><td style={{ fontFamily: "monospace" }}>{fmt(result.nHalves, 4)}</td></tr>
                  <tr><td>% Remaining</td><td style={{ fontFamily: "monospace" }}>{fmt(result.pctLeft, 2)}%</td></tr>
                  <tr><td>Decay constant λ</td><td style={{ fontFamily: "monospace" }}>{fmt(result.lambda, 8)}</td></tr>
                </>}
                {mode === "halflife" && <>
                  <tr style={{ background: "#f0eeff" }}><td><strong>Half-life (t½)</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(result.t12v)}</td></tr>
                  <tr><td>Decay constant λ</td><td style={{ fontFamily: "monospace" }}>{fmt(result.lambda, 8)}</td></tr>
                  <tr><td>Mean lifetime τ</td><td style={{ fontFamily: "monospace" }}>{fmt(result.meanLife)}</td></tr>
                </>}
              </tbody>
            </table>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">Formulas</h2>
          <table className="table" style={{ marginBottom: 16 }}>
            <thead><tr><th>Property</th><th>Formula</th></tr></thead>
            <tbody>
              <tr><td>Remaining quantity</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>N(t) = N₀ × (½)^(t/t½)</td></tr>
              <tr><td>Exponential form</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>N(t) = N₀ × e^(−λt)</td></tr>
              <tr><td>Decay constant</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>λ = ln(2) / t½</td></tr>
              <tr><td>Half-life</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>t½ = ln(2) / λ</td></tr>
              <tr><td>Mean lifetime</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>τ = 1/λ = t½ / ln(2)</td></tr>
              <tr><td>Time elapsed</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>t = t½ × log₂(N₀/N(t))</td></tr>
            </tbody>
          </table>

          <h3 className="card-title">Common Radioactive Isotopes</h3>
          <table className="table">
            <thead><tr><th>Isotope</th><th>Half-Life</th><th>Application</th></tr></thead>
            <tbody>
              {ISOTOPES.map(iso => (
                <tr key={iso.name}>
                  <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{iso.symbol}</td>
                  <td style={{ fontSize: 12 }}>{iso.half}</td>
                  <td style={{ fontSize: 12 }}>{iso.use}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
