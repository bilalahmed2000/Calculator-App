import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

// AWG resistance (Ω/1000 ft) for copper and aluminum
const AWG_DATA = [
  { awg:"4/0",  area:211600, cu:0.04901, al:0.08050 },
  { awg:"3/0",  area:167800, cu:0.06180, al:0.1015  },
  { awg:"2/0",  area:133100, cu:0.07793, al:0.1280  },
  { awg:"1/0",  area:105600, cu:0.09827, al:0.1615  },
  { awg:"1",    area:83690,  cu:0.1239,  al:0.2036  },
  { awg:"2",    area:66360,  cu:0.1563,  al:0.2567  },
  { awg:"3",    area:52620,  cu:0.1970,  al:0.3237  },
  { awg:"4",    area:41740,  cu:0.2485,  al:0.4082  },
  { awg:"6",    area:26250,  cu:0.3951,  al:0.6491  },
  { awg:"8",    area:16510,  cu:0.6282,  al:1.032   },
  { awg:"10",   area:10380,  cu:0.9989,  al:1.641   },
  { awg:"12",   area:6530,   cu:1.588,   al:2.608   },
  { awg:"14",   area:4107,   cu:2.525,   al:4.148   },
  { awg:"16",   area:2583,   cu:4.016,   al:6.595   },
  { awg:"18",   area:1624,   cu:6.385,   al:10.49   },
  { awg:"20",   area:1022,   cu:10.15,   al:16.68   },
];

const fmt = (v, d=4) => isFinite(v) ? (Math.round(v*10**d)/10**d).toString() : "—";

export default function VoltageDropCalculator() {
  const [phase,    setPhase]    = useState("single");
  const [material, setMaterial] = useState("cu");
  const [awgIdx,   setAwgIdx]   = useState(10); // AWG 12
  const [length,   setLength]   = useState("100");
  const [current,  setCurrent]  = useState("15");
  const [voltage,  setVoltage]  = useState("120");
  const [lengthUnit, setLengthUnit] = useState("ft");

  const result = useMemo(() => {
    const row = AWG_DATA[awgIdx];
    const I = parseFloat(current), V = parseFloat(voltage);
    let L = parseFloat(length);
    if (lengthUnit === "m") L = L * 3.28084;
    if (!row || isNaN(I) || isNaN(V) || isNaN(L) || I <= 0 || V <= 0 || L <= 0) return null;

    // Resistance per 1000 ft → per ft → × one-way length × 2 (round trip)
    const rPer1000 = material === "cu" ? row.cu : row.al;
    const wireR    = rPer1000 / 1000 * L * 2; // round-trip resistance
    const vdrop    = phase === "single" ? I * wireR : Math.sqrt(3) * I * wireR;
    const pct      = (vdrop / V) * 100;
    const recommended = pct <= 3;

    return { vdrop, pct, wireR, rPer1000, recommended };
  }, [awgIdx, material, length, current, voltage, phase, lengthUnit]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Voltage Drop Calculator</h1>
        <p className="muted">Calculate wire voltage drop based on wire gauge (AWG), length, current, and material. NEC recommends keeping voltage drop below 3%.</p>
      </header>
      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Inputs</h2>
          <div className="row two">
            <div className="field"><label>Phase</label>
              <select value={phase} onChange={e => setPhase(e.target.value)}>
                <option value="single">Single-phase (AC) / DC</option>
                <option value="three">Three-phase (AC)</option>
              </select>
            </div>
            <div className="field"><label>Material</label>
              <select value={material} onChange={e => setMaterial(e.target.value)}>
                <option value="cu">Copper</option>
                <option value="al">Aluminum</option>
              </select>
            </div>
          </div>
          <div className="row two">
            <div className="field"><label>Wire Gauge (AWG)</label>
              <select value={awgIdx} onChange={e => setAwgIdx(parseInt(e.target.value))}>
                {AWG_DATA.map((r, i) => <option key={i} value={i}>AWG {r.awg}</option>)}
              </select>
            </div>
            <div className="field"><label style={{ display:"flex", justifyContent:"space-between" }}>
              One-way Length
              <select value={lengthUnit} onChange={e => setLengthUnit(e.target.value)} style={{ fontSize:12, padding:"2px 4px" }}>
                <option value="ft">ft</option><option value="m">m</option>
              </select></label>
              <input type="number" min="0" value={length} onChange={e => setLength(e.target.value)} />
            </div>
          </div>
          <div className="row two">
            <div className="field"><label>Current (A)</label><input type="number" min="0" value={current} onChange={e => setCurrent(e.target.value)} /></div>
            <div className="field"><label>Source Voltage (V)</label><input type="number" min="0" value={voltage} onChange={e => setVoltage(e.target.value)} /></div>
          </div>
          {result && (
            <div style={{ marginTop:14, padding:"16px 18px", background: result.recommended ? "#f0fdf4" : "#fef2f2", borderRadius:14, border:`1px solid ${result.recommended ? "#86efac" : "#fca5a5"}` }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#6b7a9e", textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:6 }}>Voltage Drop</div>
              <div style={{ fontSize:36, fontWeight:900, color: result.recommended ? "#16a34a" : "#dc2626" }}>{fmt(result.vdrop, 3)} V</div>
              <div style={{ fontSize:14, marginTop:4, color: result.recommended ? "#15803d" : "#b91c1c", fontWeight:700 }}>
                {fmt(result.pct, 2)}% — {result.recommended ? "✓ Within NEC 3% limit" : "⚠ Exceeds NEC 3% limit"}
              </div>
            </div>
          )}
        </section>
        <section className="card">
          <h2 className="card-title">Results</h2>
          {result ? (
            <table className="table" style={{ marginBottom:14 }}>
              <thead><tr><th>Property</th><th>Value</th></tr></thead>
              <tbody>
                <tr><td>Wire gauge</td><td style={{ fontFamily:"monospace" }}>AWG {AWG_DATA[awgIdx].awg}</td></tr>
                <tr><td>Resistance ({material === "cu" ? "Copper" : "Aluminum"})</td><td style={{ fontFamily:"monospace" }}>{result.rPer1000} Ω/1000ft</td></tr>
                <tr><td>Round-trip resistance</td><td style={{ fontFamily:"monospace" }}>{fmt(result.wireR, 4)} Ω</td></tr>
                <tr style={{ background:"#f0eeff" }}><td><strong>Voltage drop</strong></td><td style={{ fontFamily:"monospace", fontWeight:800, color:"#4f46e5" }}>{fmt(result.vdrop, 3)} V</td></tr>
                <tr style={{ background:"#f0eeff" }}><td><strong>% Voltage drop</strong></td><td style={{ fontFamily:"monospace", fontWeight:800, color:"#4f46e5" }}>{fmt(result.pct, 2)}%</td></tr>
                <tr><td>End voltage</td><td style={{ fontFamily:"monospace" }}>{fmt(parseFloat(voltage) - result.vdrop, 2)} V</td></tr>
              </tbody>
            </table>
          ) : <p className="small">Enter values to calculate voltage drop.</p>}
          <h3 className="card-title" style={{ marginTop:16 }}>Copper Wire Resistance (Ω/1000 ft)</h3>
          <table className="table">
            <thead><tr><th>AWG</th><th>Copper</th><th>Aluminum</th><th>Area (cmil)</th></tr></thead>
            <tbody>
              {AWG_DATA.map((r, i) => (
                <tr key={i} style={i === awgIdx ? { background:"#f0eeff" } : {}}>
                  <td style={{ fontFamily:"monospace", fontWeight: i===awgIdx ? 800 : 400, color: i===awgIdx ? "#4f46e5":undefined }}>{r.awg}</td>
                  <td style={{ fontFamily:"monospace" }}>{r.cu}</td>
                  <td style={{ fontFamily:"monospace" }}>{r.al}</td>
                  <td style={{ fontFamily:"monospace" }}>{r.area.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
