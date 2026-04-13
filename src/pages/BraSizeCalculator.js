import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

// Cup sizes
const CUPS = ["AA","A","B","C","D","DD","DDD/E","F","G","H","I","J","K"];

// US band sizes (even numbers 28–50)
function getBandSize(underbust) {
  // Round to nearest even number >= actual
  const rounded = Math.round(underbust / 2) * 2;
  if (underbust < 33) return rounded % 2 === 0 ? rounded + 4 : rounded + 5;
  return underbust % 2 === 0 ? underbust + 4 : underbust + 5;
}

function getCupIndex(band, bust) {
  return Math.max(0, Math.round(bust - band));
}

// Sister sizes: same cup volume, different band
function sisterSizes(band, cupIdx) {
  return [
    { band: band - 2, cup: CUPS[Math.min(CUPS.length - 1, cupIdx + 1)], label: "Smaller band, larger cup" },
    { band: band,     cup: CUPS[cupIdx], label: "Your size" },
    { band: band + 2, cup: CUPS[Math.max(0, cupIdx - 1)], label: "Larger band, smaller cup" },
  ];
}

// Conversion tables
const EU_ADD = 68;
const UK_CUPS = ["AA","A","B","C","D","DD","E","F","FF","G","GG","H","HH"];

export default function BraSizeCalculator() {
  const [underbust, setUnderbust] = useState("30");
  const [bust,      setBust]      = useState("36");
  const [unit,      setUnit]      = useState("in");

  const toInches = v => unit === "in" ? parseFloat(v) : parseFloat(v) / 2.54;

  const result = useMemo(() => {
    const ub = toInches(underbust), b = toInches(bust);
    if (isNaN(ub) || isNaN(b) || ub <= 0 || b <= 0) return null;
    const band    = Math.round(ub) % 2 === 0 ? Math.round(ub) + 4 : Math.round(ub) + 5;
    const diff    = Math.round(b - band);
    const cupIdx  = Math.max(0, diff);
    const cup     = CUPS[Math.min(CUPS.length - 1, cupIdx)];
    const euBand  = Math.round(ub * 2.54) + EU_ADD;
    const euBandRnd = Math.round(euBand / 5) * 5;
    const ukCup   = UK_CUPS[Math.min(UK_CUPS.length - 1, cupIdx)];
    return { band, cup, cupIdx, euBand: euBandRnd, ukCup, sisters: sisterSizes(band, cupIdx), diff };
  }, [underbust, bust, unit]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Bra Size Calculator</h1>
        <p className="muted">Calculate your bra size in US, UK, and EU sizing from your underbust and bust measurements.</p>
      </header>
      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Measurements</h2>
          <div className="row two">
            <div className="field"><label>Unit</label>
              <select value={unit} onChange={e => setUnit(e.target.value)}>
                <option value="in">Inches</option>
                <option value="cm">Centimeters</option>
              </select>
            </div>
          </div>
          <div className="row two">
            <div className="field">
              <label>Underbust ({unit}) — Directly under your bust</label>
              <input type="number" min="0" step="0.5" value={underbust} onChange={e => setUnderbust(e.target.value)} />
            </div>
            <div className="field">
              <label>Bust ({unit}) — Fullest part of your chest</label>
              <input type="number" min="0" step="0.5" value={bust} onChange={e => setBust(e.target.value)} />
            </div>
          </div>

          {result && (
            <>
              <div className="kpi-grid" style={{ marginTop: 14 }}>
                <div className="kpi">
                  <div className="kpi-label">US Size</div>
                  <div className="kpi-value" style={{ color: "#4f46e5", fontSize: 28 }}>{result.band}{result.cup}</div>
                </div>
                <div className="kpi">
                  <div className="kpi-label">UK Size</div>
                  <div className="kpi-value" style={{ fontSize: 24 }}>{result.band}{result.ukCup}</div>
                </div>
                <div className="kpi">
                  <div className="kpi-label">EU Size</div>
                  <div className="kpi-value" style={{ fontSize: 24 }}>{result.euBand}{result.cup}</div>
                </div>
              </div>

              <h3 className="card-title" style={{ marginTop: 16 }}>Sister Sizes</h3>
              <p className="small">Same cup volume, different fit feel:</p>
              <table className="table">
                <thead><tr><th>US Size</th><th>Band</th><th>Cup</th><th>Note</th></tr></thead>
                <tbody>
                  {result.sisters.map((s, i) => (
                    <tr key={i} style={i === 1 ? { background: "#f0eeff" } : {}}>
                      <td style={{ fontWeight: i === 1 ? 800 : 400, color: i === 1 ? "#4f46e5" : undefined }}>{s.band}{s.cup}</td>
                      <td style={{ fontFamily: "monospace" }}>{s.band}</td>
                      <td style={{ fontFamily: "monospace" }}>{s.cup}</td>
                      <td style={{ fontSize: 12 }}>{s.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">Measurement Tips</h2>
          <div style={{ padding: "12px 16px", background: "#f0eeff", borderRadius: 10, marginBottom: 14 }}>
            <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.8 }}>
              <li>Measure <strong>underbust</strong> snugly (not tight) directly under your bust.</li>
              <li>Measure <strong>bust</strong> at the fullest point, keeping the tape horizontal.</li>
              <li>Measure in a non-padded or unlined bra for best accuracy.</li>
              <li>Round to the nearest inch/cm.</li>
            </ol>
          </div>

          <h3 className="card-title">Cup Size by Difference</h3>
          <table className="table" style={{ marginBottom: 14 }}>
            <thead><tr><th>Bust − Band</th><th>US Cup</th><th>UK Cup</th></tr></thead>
            <tbody>
              {CUPS.map((c, i) => (
                <tr key={c} style={result && result.cupIdx === i ? { background: "#f0eeff" } : {}}>
                  <td style={{ fontFamily: "monospace" }}>{i}"</td>
                  <td style={{ fontWeight: result && result.cupIdx === i ? 800 : 400, color: result && result.cupIdx === i ? "#4f46e5" : undefined }}>{c}</td>
                  <td>{UK_CUPS[i] || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="card-title">Band Size Conversion</h3>
          <table className="table">
            <thead><tr><th>US/UK</th><th>EU</th><th>Underbust (in)</th></tr></thead>
            <tbody>
              {[[28,60,"25–27"],[30,65,"27–29"],[32,70,"29–31"],[34,75,"31–33"],[36,80,"33–35"],[38,85,"35–37"],[40,90,"37–39"],[42,95,"39–41"],[44,100,"41–43"],[46,105,"43–45"]].map(([us,eu,range]) =>
                <tr key={us}><td style={{ fontFamily: "monospace" }}>{us}</td><td style={{ fontFamily: "monospace" }}>{eu}</td><td style={{ fontFamily: "monospace" }}>{range}</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
