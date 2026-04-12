import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt = (v, d = 6) => isFinite(v) ? (Math.round(v * 10 ** d) / 10 ** d).toString() : "—";
const pct = v => fmt(v * 100, 4) + "%";

function fact(n) { let r = 1; for (let i = 2; i <= n; i++) r *= i; return r; }
function comb(n, k) { if (k > n || k < 0) return 0; return fact(n) / (fact(k) * fact(n - k)); }

export default function ProbabilityCalculator() {
  const [tab, setTab] = useState("basic");
  // Basic
  const [fav, setFav]   = useState("3");
  const [total, setTotal] = useState("10");
  // Combined
  const [pA, setPA] = useState("0.4");
  const [pB, setPB] = useState("0.3");
  const [pAB, setPAB] = useState("0.12"); // P(A∩B)
  const [eventType, setEventType] = useState("independent");
  // Binomial
  const [bn, setBn] = useState("10");
  const [bk, setBk] = useState("3");
  const [bp, setBp] = useState("0.5");

  const basic = useMemo(() => {
    const f = parseFloat(fav), t = parseFloat(total);
    if (isNaN(f) || isNaN(t) || t <= 0 || f < 0 || f > t) return null;
    const p = f / t;
    return { p, pNot: 1 - p, odds: `${f} : ${t - f}` };
  }, [fav, total]);

  const combined = useMemo(() => {
    const a = parseFloat(pA), b = parseFloat(pB);
    if (isNaN(a) || isNaN(b) || a < 0 || a > 1 || b < 0 || b > 1) return null;
    let intersection;
    if (eventType === "independent")  intersection = a * b;
    else if (eventType === "mutually") intersection = 0;
    else { intersection = parseFloat(pAB); if (isNaN(intersection)) return null; }
    const union = a + b - intersection;
    const pAgivenB = b > 0 ? intersection / b : null;
    const pBgivenA = a > 0 ? intersection / a : null;
    return { union: Math.min(union, 1), intersection, pAgivenB, pBgivenA, pNotA: 1 - a, pNotB: 1 - b };
  }, [pA, pB, pAB, eventType]);

  const binomial = useMemo(() => {
    const nv = parseInt(bn), kv = parseInt(bk), pv = parseFloat(bp);
    if (isNaN(nv) || isNaN(kv) || isNaN(pv) || nv < 0 || kv < 0 || kv > nv || pv < 0 || pv > 1) return null;
    const exact = comb(nv, kv) * Math.pow(pv, kv) * Math.pow(1 - pv, nv - kv);
    let cumLe = 0, cumLt = 0;
    for (let i = 0; i <= nv; i++) {
      const val = comb(nv, i) * Math.pow(pv, i) * Math.pow(1 - pv, nv - i);
      if (i <= kv) cumLe += val;
      if (i < kv)  cumLt += val;
    }
    const mean = nv * pv, variance = nv * pv * (1 - pv);
    return { exact, cumLe, cumGe: 1 - cumLt, mean, variance, stdDev: Math.sqrt(variance) };
  }, [bn, bk, bp]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Probability Calculator</h1>
        <p className="muted">
          Calculate basic probability, combined event probability (union, intersection, conditional),
          and binomial distribution probabilities.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Type</h2>
          <div className="tab-row">
            <button className={`tab-btn${tab === "basic"    ? " active" : ""}`} onClick={() => setTab("basic")}>Basic</button>
            <button className={`tab-btn${tab === "combined" ? " active" : ""}`} onClick={() => setTab("combined")}>Combined Events</button>
            <button className={`tab-btn${tab === "binomial" ? " active" : ""}`} onClick={() => setTab("binomial")}>Binomial</button>
          </div>

          {tab === "basic" && (
            <>
              <p className="small">P(A) = Favorable outcomes / Total outcomes</p>
              <div className="row two">
                <div className="field"><label>Favorable outcomes</label><input type="number" min="0" value={fav} onChange={e => setFav(e.target.value)} /></div>
                <div className="field"><label>Total outcomes</label><input type="number" min="1" value={total} onChange={e => setTotal(e.target.value)} /></div>
              </div>
              {basic && (
                <div className="kpi-grid" style={{ marginTop: 14 }}>
                  <div className="kpi"><div className="kpi-label">P(A)</div><div className="kpi-value">{fmt(basic.p, 6)}</div><div className="kpi-sub">{pct(basic.p)}</div></div>
                  <div className="kpi"><div className="kpi-label">P(not A)</div><div className="kpi-value">{fmt(basic.pNot, 6)}</div><div className="kpi-sub">{pct(basic.pNot)}</div></div>
                  <div className="kpi"><div className="kpi-label">Odds for A</div><div className="kpi-value" style={{ fontSize: 16 }}>{basic.odds}</div></div>
                </div>
              )}
            </>
          )}

          {tab === "combined" && (
            <>
              <div className="row two">
                <div className="field"><label>P(A)</label><input type="number" min="0" max="1" step="0.01" value={pA} onChange={e => setPA(e.target.value)} /></div>
                <div className="field"><label>P(B)</label><input type="number" min="0" max="1" step="0.01" value={pB} onChange={e => setPB(e.target.value)} /></div>
              </div>
              <div className="row">
                <div className="field">
                  <label>Relationship</label>
                  <select value={eventType} onChange={e => setEventType(e.target.value)}>
                    <option value="independent">Independent events</option>
                    <option value="mutually">Mutually exclusive</option>
                    <option value="custom">Custom P(A∩B)</option>
                  </select>
                </div>
              </div>
              {eventType === "custom" && (
                <div className="row"><div className="field"><label>P(A ∩ B)</label><input type="number" min="0" max="1" step="0.01" value={pAB} onChange={e => setPAB(e.target.value)} /></div></div>
              )}
              {combined && (
                <div className="kpi-grid" style={{ marginTop: 14 }}>
                  <div className="kpi"><div className="kpi-label">P(A ∪ B)</div><div className="kpi-value">{fmt(combined.union)}</div><div className="kpi-sub">A or B</div></div>
                  <div className="kpi"><div className="kpi-label">P(A ∩ B)</div><div className="kpi-value">{fmt(combined.intersection)}</div><div className="kpi-sub">A and B</div></div>
                </div>
              )}
            </>
          )}

          {tab === "binomial" && (
            <>
              <p className="small">P(X=k) — probability of exactly k successes in n trials with success prob. p</p>
              <div className="row two">
                <div className="field"><label>Trials (n)</label><input type="number" min="0" value={bn} onChange={e => setBn(e.target.value)} /></div>
                <div className="field"><label>Successes (k)</label><input type="number" min="0" value={bk} onChange={e => setBk(e.target.value)} /></div>
              </div>
              <div className="row"><div className="field"><label>Probability of success (p)</label><input type="number" min="0" max="1" step="0.01" value={bp} onChange={e => setBp(e.target.value)} /></div></div>
              {binomial && (
                <div className="kpi-grid" style={{ marginTop: 14 }}>
                  <div className="kpi"><div className="kpi-label">P(X = {bk})</div><div className="kpi-value" style={{ fontSize: 18 }}>{fmt(binomial.exact)}</div><div className="kpi-sub">{pct(binomial.exact)}</div></div>
                  <div className="kpi"><div className="kpi-label">P(X ≤ {bk})</div><div className="kpi-value" style={{ fontSize: 18 }}>{fmt(binomial.cumLe)}</div></div>
                  <div className="kpi"><div className="kpi-label">P(X ≥ {bk})</div><div className="kpi-value" style={{ fontSize: 18 }}>{fmt(binomial.cumGe)}</div></div>
                </div>
              )}
            </>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">Results</h2>

          {tab === "basic" && basic && (
            <table className="table">
              <thead><tr><th>Property</th><th>Value</th></tr></thead>
              <tbody>
                <tr><td>Favorable outcomes</td><td style={{ fontFamily: "monospace" }}>{fav}</td></tr>
                <tr><td>Total outcomes</td><td style={{ fontFamily: "monospace" }}>{total}</td></tr>
                <tr style={{ background: "#f0eeff" }}><td><strong>P(A)</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(basic.p)} = {pct(basic.p)}</td></tr>
                <tr><td>P(not A) = P(A')</td><td style={{ fontFamily: "monospace" }}>{fmt(basic.pNot)} = {pct(basic.pNot)}</td></tr>
                <tr><td>Odds for A</td><td style={{ fontFamily: "monospace" }}>{basic.odds}</td></tr>
                <tr><td>Fraction</td><td style={{ fontFamily: "monospace" }}>{fav}/{total}</td></tr>
              </tbody>
            </table>
          )}

          {tab === "combined" && combined && (
            <table className="table">
              <thead><tr><th>Event</th><th>Probability</th></tr></thead>
              <tbody>
                <tr><td>P(A)</td><td style={{ fontFamily: "monospace" }}>{pA}</td></tr>
                <tr><td>P(B)</td><td style={{ fontFamily: "monospace" }}>{pB}</td></tr>
                <tr style={{ background: "#f0eeff" }}><td><strong>P(A ∪ B) — A or B</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(combined.union)}</td></tr>
                <tr style={{ background: "#f0eeff" }}><td><strong>P(A ∩ B) — A and B</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(combined.intersection)}</td></tr>
                <tr><td>P(not A)</td><td style={{ fontFamily: "monospace" }}>{fmt(combined.pNotA)}</td></tr>
                <tr><td>P(not B)</td><td style={{ fontFamily: "monospace" }}>{fmt(combined.pNotB)}</td></tr>
                {combined.pAgivenB !== null && <tr><td>P(A|B) — A given B</td><td style={{ fontFamily: "monospace" }}>{fmt(combined.pAgivenB)}</td></tr>}
                {combined.pBgivenA !== null && <tr><td>P(B|A) — B given A</td><td style={{ fontFamily: "monospace" }}>{fmt(combined.pBgivenA)}</td></tr>}
              </tbody>
            </table>
          )}

          {tab === "binomial" && binomial && (
            <table className="table">
              <thead><tr><th>Property</th><th>Value</th></tr></thead>
              <tbody>
                <tr style={{ background: "#f0eeff" }}><td><strong>P(X = {bk})</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt(binomial.exact)} ({pct(binomial.exact)})</td></tr>
                <tr><td>P(X ≤ {bk})</td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>{fmt(binomial.cumLe)}</td></tr>
                <tr><td>P(X ≥ {bk})</td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>{fmt(binomial.cumGe)}</td></tr>
                <tr><td>P(X &lt; {bk})</td><td style={{ fontFamily: "monospace" }}>{fmt(binomial.cumLe - binomial.exact)}</td></tr>
                <tr><td>P(X &gt; {bk})</td><td style={{ fontFamily: "monospace" }}>{fmt(binomial.cumGe - binomial.exact)}</td></tr>
                <tr><td>Mean (np)</td><td style={{ fontFamily: "monospace" }}>{fmt(binomial.mean)}</td></tr>
                <tr><td>Variance (npq)</td><td style={{ fontFamily: "monospace" }}>{fmt(binomial.variance)}</td></tr>
                <tr><td>Std Dev</td><td style={{ fontFamily: "monospace" }}>{fmt(binomial.stdDev)}</td></tr>
              </tbody>
            </table>
          )}

          <h3 className="card-title" style={{ marginTop: 18 }}>Key Formulas</h3>
          <table className="table">
            <thead><tr><th>Rule</th><th>Formula</th></tr></thead>
            <tbody>
              <tr><td>Addition rule</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>P(A∪B) = P(A)+P(B)−P(A∩B)</td></tr>
              <tr><td>Multiplication (indep.)</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>P(A∩B) = P(A)·P(B)</td></tr>
              <tr><td>Conditional</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>P(A|B) = P(A∩B)/P(B)</td></tr>
              <tr><td>Complement</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>P(A') = 1 − P(A)</td></tr>
              <tr><td>Binomial</td><td style={{ fontFamily: "monospace", fontSize: 12 }}>C(n,k)·pᵏ·(1−p)ⁿ⁻ᵏ</td></tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
