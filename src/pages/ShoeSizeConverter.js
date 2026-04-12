import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

// Shoe size data: each row = [US Men, US Women, UK, EU, CM (foot length)]
const SIZE_DATA = [
  [3,    4.5,  2.5, 35,   21.6],
  [3.5,  5,    3,   35.5, 22.2],
  [4,    5.5,  3.5, 36,   22.5],
  [4.5,  6,    4,   36.5, 22.9],
  [5,    6.5,  4.5, 37,   23.5],
  [5.5,  7,    5,   37.5, 23.8],
  [6,    7.5,  5.5, 38,   24.1],
  [6.5,  8,    6,   38.5, 24.4],
  [7,    8.5,  6.5, 39,   24.8],
  [7.5,  9,    7,   40,   25.1],
  [8,    9.5,  7.5, 41,   25.4],
  [8.5,  10,   8,   41.5, 25.7],
  [9,    10.5, 8.5, 42,   26.0],
  [9.5,  11,   9,   42.5, 26.3],
  [10,   11.5, 9.5, 43,   26.7],
  [10.5, 12,   10,  43.5, 27.0],
  [11,   12.5, 10.5,44,   27.3],
  [11.5, 13,   11,  44.5, 27.6],
  [12,   13.5, 11.5,45,   27.9],
  [12.5, 14,   12,  45.5, 28.3],
  [13,   14.5, 12.5,46,   28.6],
  [14,   15.5, 13.5,47,   29.2],
  [15,   16.5, 14.5,48,   29.8],
];

const SYSTEMS = [
  { label: "US Men",    key: 0, step: 0.5 },
  { label: "US Women",  key: 1, step: 0.5 },
  { label: "UK",        key: 2, step: 0.5 },
  { label: "EU",        key: 3, step: 0.5 },
  { label: "CM (foot)", key: 4, step: 0.1 },
];

function findClosestRow(val, colIdx) {
  let best = null, bestDiff = Infinity;
  for (const row of SIZE_DATA) {
    const diff = Math.abs(row[colIdx] - val);
    if (diff < bestDiff) { bestDiff = diff; best = row; }
  }
  return best;
}

export default function ShoeSizeConverter() {
  const [fromSys, setFromSys] = useState(0); // US Men
  const [inputVal, setInputVal] = useState("10");

  const result = useMemo(() => {
    const v = parseFloat(inputVal);
    if (isNaN(v)) return null;
    const row = findClosestRow(v, fromSys);
    if (!row) return null;
    return row;
  }, [inputVal, fromSys]);

  // Build a highlight range for close matches (±1 size)
  const nearbyRows = useMemo(() => {
    const v = parseFloat(inputVal);
    if (isNaN(v)) return SIZE_DATA;
    return SIZE_DATA.filter(row => Math.abs(row[fromSys] - v) <= 1);
  }, [inputVal, fromSys]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Shoe Size Conversion</h1>
        <p className="muted">
          Convert shoe sizes between US Men's, US Women's, UK, EU, and foot length (cm).
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Convert Size</h2>

          <div className="row two">
            <div className="field">
              <label>From System</label>
              <select value={fromSys} onChange={e => { setFromSys(parseInt(e.target.value)); }}>
                {SYSTEMS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Size</label>
              <input type="number" step={SYSTEMS[fromSys].step} min="1" value={inputVal} onChange={e => setInputVal(e.target.value)} />
            </div>
          </div>

          {result && (
            <div style={{ marginTop: 14, padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 10 }}>Equivalent Sizes</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 10 }}>
                {SYSTEMS.map(s => (
                  <div key={s.key} style={{ textAlign: "center", padding: "10px 8px", background: s.key === fromSys ? "#4f46e5" : "white", borderRadius: 10, border: "1px solid rgba(99,102,241,0.2)" }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: s.key === fromSys ? "rgba(255,255,255,0.8)" : "#6b7a9e", marginBottom: 4 }}>{s.label}</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: s.key === fromSys ? "white" : "#4f46e5" }}>{result[s.key]}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: 16 }}>
            <h3 className="card-title">Nearby Sizes</h3>
            <div style={{ overflowX: "auto" }}>
              <table className="table">
                <thead>
                  <tr>
                    {SYSTEMS.map(s => <th key={s.key}>{s.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {nearbyRows.map((row, i) => {
                    const isExact = result && Math.abs(row[fromSys] - parseFloat(inputVal)) < 0.01;
                    return (
                      <tr key={i} style={isExact ? { background: "#f0eeff" } : {}}>
                        {SYSTEMS.map(s => (
                          <td key={s.key} style={{
                            fontFamily: "monospace",
                            fontWeight: isExact ? 800 : 400,
                            color: isExact ? "#4f46e5" : undefined,
                          }}>{row[s.key]}</td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="card">
          <h2 className="card-title">Full Size Chart</h2>
          <div style={{ overflowX: "auto" }}>
            <table className="table">
              <thead>
                <tr>
                  {SYSTEMS.map(s => <th key={s.key}>{s.label}</th>)}
                </tr>
              </thead>
              <tbody>
                {SIZE_DATA.map((row, i) => {
                  const isMatch = result && row === result;
                  return (
                    <tr key={i} style={isMatch ? { background: "#f0eeff" } : {}}>
                      {SYSTEMS.map(s => (
                        <td key={s.key} style={{
                          fontFamily: "monospace",
                          fontWeight: isMatch ? 800 : 400,
                          color: isMatch ? "#4f46e5" : undefined,
                        }}>{row[s.key]}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 14, padding: "12px 14px", background: "#f8f9ff", borderRadius: 10, fontSize: 12, color: "#6b7a9e" }}>
            <strong>Note:</strong> Sizes vary by brand and style. This chart uses standard average conversions.
            Always try shoes on when possible. Women's sizes are typically 1.5 sizes larger than Men's US sizes.
          </div>
        </section>
      </div>
    </div>
  );
}
