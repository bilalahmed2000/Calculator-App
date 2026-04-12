import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

function fmtNum(n) {
  if (!isFinite(n)) return "∞";
  const s = Math.round(n * 1e10) / 1e10;
  return s.toLocaleString("en-US", { maximumSignificantDigits: 12 });
}

export default function NumberSequenceCalculator() {
  const [type, setType] = useState("arithmetic"); // "arithmetic" | "geometric" | "fibonacci" | "custom"
  const [first, setFirst] = useState("2");
  const [diff, setDiff]   = useState("3");   // common difference (arithmetic) or ratio (geometric)
  const [nthN, setNthN]   = useState("10");
  const [sumN, setSumN]   = useState("10");
  const [terms, setTerms] = useState("10");
  const [customSeq, setCustomSeq] = useState("1, 1, 2, 3, 5, 8");

  const a1 = parseFloat(first);
  const d  = parseFloat(diff);
  const nth = parseInt(nthN);
  const sn  = parseInt(sumN);
  const count = Math.min(Math.max(parseInt(terms) || 10, 1), 50);

  /* ─── Arithmetic ─── */
  const arith = useMemo(() => {
    if (isNaN(a1) || isNaN(d)) return null;
    const nthVal = a1 + (nth - 1) * d;
    const sumVal = (sn / 2) * (2 * a1 + (sn - 1) * d);
    const seq = Array.from({ length: count }, (_, i) => a1 + i * d);
    return { nthVal, sumVal, seq };
  }, [a1, d, nth, sn, count]);

  /* ─── Geometric ─── */
  const geo = useMemo(() => {
    if (isNaN(a1) || isNaN(d)) return null;
    if (d === 0) return { error: "Common ratio cannot be 0" };
    const nthVal = a1 * Math.pow(d, nth - 1);
    const sumVal = Math.abs(d) !== 1
      ? a1 * (1 - Math.pow(d, sn)) / (1 - d)
      : a1 * sn;
    const seq = Array.from({ length: count }, (_, i) => a1 * Math.pow(d, i));
    const infinite = Math.abs(d) < 1
      ? a1 / (1 - d)
      : null;
    return { nthVal, sumVal, seq, infinite };
  }, [a1, d, nth, sn, count]);

  /* ─── Fibonacci ─── */
  const fib = useMemo(() => {
    const seq = [1, 1];
    for (let i = 2; i < count; i++) seq.push(seq[i - 1] + seq[i - 2]);
    const nthVal = (() => {
      let a = 1, b = 1;
      for (let i = 2; i < nth; i++) { [a, b] = [b, a + b]; }
      return nth <= 0 ? null : nth === 1 ? 1 : b;
    })();
    // Sum of first sn Fibonacci numbers
    const sumSeq = [1, 1];
    for (let i = 2; i < sn; i++) sumSeq.push(sumSeq[i - 1] + sumSeq[i - 2]);
    const sumVal = sumSeq.slice(0, sn).reduce((a, b) => a + b, 0);
    return { seq, nthVal, sumVal };
  }, [count, nth, sn]);

  /* ─── Custom ─── */
  const custom = useMemo(() => {
    const parts = customSeq.split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
    if (parts.length < 2) return null;
    // detect arithmetic
    const diffs = parts.slice(1).map((v, i) => v - parts[i]);
    const isArith = diffs.every(d => Math.abs(d - diffs[0]) < 1e-9);
    // detect geometric
    const ratios = parts.slice(1).map((v, i) => (parts[i] !== 0 ? v / parts[i] : NaN));
    const isGeo = parts.every(v => v !== 0) && ratios.every(r => Math.abs(r - ratios[0]) < 1e-9);
    let seqType = "unknown";
    let rule = "";
    if (isArith) { seqType = "Arithmetic"; rule = `d = ${diffs[0]}`; }
    else if (isGeo) { seqType = "Geometric"; rule = `r = ${ratios[0]}`; }
    return { parts, seqType, rule };
  }, [customSeq]);

  const sequence = type === "arithmetic" ? arith?.seq
    : type === "geometric" ? geo?.seq
    : type === "fibonacci" ? fib?.seq
    : custom?.parts;

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Number Sequence Calculator</h1>
        <p className="muted">
          Find the nth term, sum of n terms, and list terms of arithmetic, geometric,
          Fibonacci, and custom sequences.
        </p>
      </header>

      <div className="calc-grid">
        {/* ── LEFT: Input ── */}
        <section className="card">
          <h2 className="card-title">Sequence Type</h2>

          <div className="tab-row" style={{ flexWrap: "wrap" }}>
            {["arithmetic", "geometric", "fibonacci", "custom"].map(t => (
              <button key={t} className={`tab-btn${type === t ? " active" : ""}`}
                onClick={() => setType(t)} style={{ textTransform: "capitalize" }}>
                {t}
              </button>
            ))}
          </div>

          {(type === "arithmetic" || type === "geometric") && (
            <>
              <div className="row two">
                <div className="field">
                  <label>First Term (a₁)</label>
                  <input type="number" value={first} onChange={e => setFirst(e.target.value)} />
                </div>
                <div className="field">
                  <label>{type === "arithmetic" ? "Common Difference (d)" : "Common Ratio (r)"}</label>
                  <input type="number" value={diff} onChange={e => setDiff(e.target.value)} />
                </div>
              </div>
              <div className="row two">
                <div className="field">
                  <label>Find nth Term (n)</label>
                  <input type="number" min={1} value={nthN} onChange={e => setNthN(e.target.value)} />
                </div>
                <div className="field">
                  <label>Sum of First n Terms (n)</label>
                  <input type="number" min={1} value={sumN} onChange={e => setSumN(e.target.value)} />
                </div>
              </div>
            </>
          )}

          {type === "fibonacci" && (
            <div className="row two">
              <div className="field">
                <label>Find nth Term (n)</label>
                <input type="number" min={1} value={nthN} onChange={e => setNthN(e.target.value)} />
              </div>
              <div className="field">
                <label>Sum of First n Terms (n)</label>
                <input type="number" min={1} value={sumN} onChange={e => setSumN(e.target.value)} />
              </div>
            </div>
          )}

          {type === "custom" && (
            <div className="row">
              <div className="field">
                <label>Enter sequence (comma or space separated)</label>
                <input type="text" value={customSeq}
                  onChange={e => setCustomSeq(e.target.value)}
                  placeholder="e.g. 2, 4, 8, 16, 32"
                  style={{ fontFamily: "monospace" }} />
              </div>
            </div>
          )}

          <div className="row">
            <div className="field">
              <label>Number of terms to list (max 50)</label>
              <input type="number" min={1} max={50} value={terms}
                onChange={e => setTerms(e.target.value)} />
            </div>
          </div>

          {/* Formulas reference */}
          <div style={{ marginTop: 18 }}>
            <div className="card-title" style={{ fontSize: 13, marginBottom: 8 }}>Formulas</div>
            {type === "arithmetic" && (
              <table className="table">
                <tbody>
                  <tr><td>nth term</td><td style={{ fontFamily: "monospace" }}>aₙ = a₁ + (n−1)d</td></tr>
                  <tr><td>Sum of n terms</td><td style={{ fontFamily: "monospace" }}>Sₙ = n/2 · (2a₁ + (n−1)d)</td></tr>
                  <tr><td>Or equivalently</td><td style={{ fontFamily: "monospace" }}>Sₙ = n/2 · (a₁ + aₙ)</td></tr>
                </tbody>
              </table>
            )}
            {type === "geometric" && (
              <table className="table">
                <tbody>
                  <tr><td>nth term</td><td style={{ fontFamily: "monospace" }}>aₙ = a₁ · rⁿ⁻¹</td></tr>
                  <tr><td>Sum of n terms</td><td style={{ fontFamily: "monospace" }}>Sₙ = a₁(1−rⁿ)/(1−r)</td></tr>
                  <tr><td>Infinite sum (|r|&lt;1)</td><td style={{ fontFamily: "monospace" }}>S∞ = a₁/(1−r)</td></tr>
                </tbody>
              </table>
            )}
            {type === "fibonacci" && (
              <table className="table">
                <tbody>
                  <tr><td>Rule</td><td style={{ fontFamily: "monospace" }}>F(n) = F(n−1) + F(n−2)</td></tr>
                  <tr><td>Starts with</td><td style={{ fontFamily: "monospace" }}>F(1)=1, F(2)=1</td></tr>
                  <tr><td>Golden ratio</td><td style={{ fontFamily: "monospace" }}>φ ≈ 1.6180339887…</td></tr>
                </tbody>
              </table>
            )}
            {type === "custom" && (
              <table className="table">
                <tbody>
                  <tr><td>Arithmetic check</td><td>Consecutive differences are equal</td></tr>
                  <tr><td>Geometric check</td><td>Consecutive ratios are equal</td></tr>
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* ── RIGHT: Results ── */}
        <section className="card">
          <h2 className="card-title">Results</h2>

          {/* Arithmetic results */}
          {type === "arithmetic" && arith && (
            <>
              <div className="kpi-grid">
                <div className="kpi">
                  <div className="kpi-label">Term {nth}</div>
                  <div className="kpi-value">{fmtNum(arith.nthVal)}</div>
                  <div className="kpi-sub">a₁ + (n−1)d</div>
                </div>
                <div className="kpi">
                  <div className="kpi-label">Sum of {sn} Terms</div>
                  <div className="kpi-value">{fmtNum(arith.sumVal)}</div>
                  <div className="kpi-sub">Sₙ</div>
                </div>
              </div>
              <table className="table" style={{ marginTop: 14 }}>
                <tbody>
                  <tr><td>First term (a₁)</td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>{fmtNum(a1)}</td></tr>
                  <tr><td>Common difference (d)</td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>{fmtNum(d)}</td></tr>
                  <tr style={{ background: "#f0eeff" }}><td><strong>Term {nth} (aₙ)</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmtNum(arith.nthVal)}</td></tr>
                  <tr style={{ background: "#f0eeff" }}><td><strong>Sum of {sn} terms</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmtNum(arith.sumVal)}</td></tr>
                </tbody>
              </table>
            </>
          )}

          {/* Geometric results */}
          {type === "geometric" && (
            geo?.error ? (
              <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, color: "#b91c1c", fontSize: 13.5 }}>
                {geo.error}
              </div>
            ) : geo && (
              <>
                <div className="kpi-grid">
                  <div className="kpi">
                    <div className="kpi-label">Term {nth}</div>
                    <div className="kpi-value">{fmtNum(geo.nthVal)}</div>
                    <div className="kpi-sub">a₁ · rⁿ⁻¹</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-label">Sum of {sn} Terms</div>
                    <div className="kpi-value" style={{ fontSize: 18 }}>{fmtNum(geo.sumVal)}</div>
                    <div className="kpi-sub">Sₙ</div>
                  </div>
                  {geo.infinite !== null && (
                    <div className="kpi">
                      <div className="kpi-label">Infinite Sum (S∞)</div>
                      <div className="kpi-value" style={{ fontSize: 18 }}>{fmtNum(geo.infinite)}</div>
                      <div className="kpi-sub">|r| &lt; 1</div>
                    </div>
                  )}
                </div>
                <table className="table" style={{ marginTop: 14 }}>
                  <tbody>
                    <tr><td>First term (a₁)</td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>{fmtNum(a1)}</td></tr>
                    <tr><td>Common ratio (r)</td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>{fmtNum(d)}</td></tr>
                    <tr style={{ background: "#f0eeff" }}><td><strong>Term {nth}</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmtNum(geo.nthVal)}</td></tr>
                    <tr style={{ background: "#f0eeff" }}><td><strong>Sum of {sn} terms</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmtNum(geo.sumVal)}</td></tr>
                    {geo.infinite !== null && (
                      <tr><td>Infinite sum (converges)</td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>{fmtNum(geo.infinite)}</td></tr>
                    )}
                  </tbody>
                </table>
              </>
            )
          )}

          {/* Fibonacci results */}
          {type === "fibonacci" && (
            <div className="kpi-grid">
              <div className="kpi">
                <div className="kpi-label">Term {nth}</div>
                <div className="kpi-value">{fmtNum(fib.nthVal)}</div>
                <div className="kpi-sub">F({nth})</div>
              </div>
              <div className="kpi">
                <div className="kpi-label">Sum of {sn} Terms</div>
                <div className="kpi-value" style={{ fontSize: 18 }}>{fmtNum(fib.sumVal)}</div>
              </div>
            </div>
          )}

          {/* Custom sequence analysis */}
          {type === "custom" && custom && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ padding: "14px 16px", background: "#f0eeff", borderRadius: 12, border: "1px solid rgba(99,102,241,0.2)", marginBottom: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 4 }}>
                  Sequence Type
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: "#4f46e5" }}>{custom.seqType}</div>
                {custom.rule && <div style={{ fontSize: 13, color: "#6b7a9e", marginTop: 4 }}>{custom.rule}</div>}
              </div>
              <table className="table">
                <tbody>
                  <tr><td>Terms entered</td><td style={{ fontWeight: 700 }}>{custom.parts.length}</td></tr>
                  <tr><td>First term</td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>{fmtNum(custom.parts[0])}</td></tr>
                  <tr><td>Last term entered</td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>{fmtNum(custom.parts[custom.parts.length - 1])}</td></tr>
                  {custom.seqType === "Arithmetic" && (
                    <tr><td>Common difference</td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>{custom.rule.replace("d = ", "")}</td></tr>
                  )}
                  {custom.seqType === "Geometric" && (
                    <tr><td>Common ratio</td><td style={{ fontFamily: "monospace", fontWeight: 700 }}>{custom.rule.replace("r = ", "")}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Sequence listing */}
          {sequence && sequence.length > 0 && (
            <>
              <div className="card-title" style={{ fontSize: 13, marginTop: 18, marginBottom: 8 }}>
                First {sequence.length} Terms
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {sequence.map((v, i) => (
                  <span key={i} style={{
                    display: "inline-block",
                    padding: "3px 10px",
                    background: i % 2 === 0 ? "#f0eeff" : "#f5f3ff",
                    borderRadius: 6,
                    fontFamily: "monospace",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#4f46e5",
                    border: "1px solid rgba(99,102,241,0.15)",
                  }}>
                    {i + 1}: {fmtNum(v)}
                  </span>
                ))}
              </div>
            </>
          )}

          {/* Common sequences reference */}
          <div className="card-title" style={{ fontSize: 13, marginTop: 22, marginBottom: 8 }}>
            Common Sequences
          </div>
          <table className="table">
            <thead><tr><th>Name</th><th>Pattern</th><th>First terms</th></tr></thead>
            <tbody>
              <tr><td>Arithmetic</td><td>a, a+d, a+2d, …</td><td>2, 5, 8, 11, …</td></tr>
              <tr><td>Geometric</td><td>a, ar, ar², …</td><td>3, 6, 12, 24, …</td></tr>
              <tr><td>Fibonacci</td><td>F(n−1)+F(n−2)</td><td>1, 1, 2, 3, 5, 8, …</td></tr>
              <tr><td>Square numbers</td><td>n²</td><td>1, 4, 9, 16, 25, …</td></tr>
              <tr><td>Cube numbers</td><td>n³</td><td>1, 8, 27, 64, 125, …</td></tr>
              <tr><td>Triangular</td><td>n(n+1)/2</td><td>1, 3, 6, 10, 15, …</td></tr>
              <tr><td>Prime numbers</td><td>—</td><td>2, 3, 5, 7, 11, 13, …</td></tr>
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
