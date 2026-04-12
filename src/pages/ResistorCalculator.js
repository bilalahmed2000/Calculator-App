import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const COLORS = [
  { name:"Black",  digit:0, mult:1,       tol:null,  hex:"#1a1a1a", text:"white" },
  { name:"Brown",  digit:1, mult:10,       tol:1,     hex:"#7b3f00", text:"white" },
  { name:"Red",    digit:2, mult:100,      tol:2,     hex:"#c0392b", text:"white" },
  { name:"Orange", digit:3, mult:1e3,      tol:null,  hex:"#e67e22", text:"white" },
  { name:"Yellow", digit:4, mult:1e4,      tol:null,  hex:"#f1c40f", text:"black" },
  { name:"Green",  digit:5, mult:1e5,      tol:0.5,   hex:"#27ae60", text:"white" },
  { name:"Blue",   digit:6, mult:1e6,      tol:0.25,  hex:"#2980b9", text:"white" },
  { name:"Violet", digit:7, mult:1e7,      tol:0.1,   hex:"#8e44ad", text:"white" },
  { name:"Gray",   digit:8, mult:1e8,      tol:0.05,  hex:"#7f8c8d", text:"white" },
  { name:"White",  digit:9, mult:1e9,      tol:null,  hex:"#ecf0f1", text:"black" },
  { name:"Gold",   digit:null, mult:0.1,   tol:5,     hex:"#d4af37", text:"black" },
  { name:"Silver", digit:null, mult:0.01,  tol:10,    hex:"#bdc3c7", text:"black" },
  { name:"None",   digit:null, mult:null,  tol:20,    hex:"transparent", text:"#666", border:"1px dashed #999" },
];

const DIGIT_COLORS  = COLORS.filter(c => c.digit !== null);
const MULT_COLORS   = COLORS.filter(c => c.mult !== null);
const TOL_COLORS    = COLORS.filter(c => c.tol  !== null);

function fmtOhm(v) {
  if (!isFinite(v)) return "—";
  if (v >= 1e9)  return (v/1e9).toFixed(3)  + " GΩ";
  if (v >= 1e6)  return (v/1e6).toFixed(3)  + " MΩ";
  if (v >= 1e3)  return (v/1e3).toFixed(3)  + " kΩ";
  return v.toFixed(3) + " Ω";
}

const ColorBand = ({ colors, selected, onChange, label }) => (
  <div className="field">
    <label>{label}</label>
    <select value={selected} onChange={e => onChange(parseInt(e.target.value))}
      style={{ background: COLORS[selected].hex, color: COLORS[selected].text, fontWeight:700, border: COLORS[selected].border||"1px solid #d1d5db" }}>
      {colors.map((c, i) => {
        const idx = COLORS.indexOf(c);
        return <option key={idx} value={idx} style={{ background:c.hex, color:c.text }}>{c.name}</option>;
      })}
    </select>
  </div>
);

export default function ResistorCalculator() {
  const [tab, setTab] = useState("decoder");
  const [bands, setBands] = useState(4);
  // Band indices into COLORS array: d1, d2, d3(5-band), mult, tol
  const [b1, setB1] = useState(3);  // Orange = 3
  const [b2, setB2] = useState(4);  // Yellow = 4
  const [b3, setB3] = useState(0);  // Black = 0 (5-band only)
  const [bm, setBm] = useState(2);  // Red   = ×100
  const [bt, setBt] = useState(10); // Gold  = ±5%

  // Series/Parallel
  const [rList, setRList] = useState(["100", "220", "470"]);

  const decoded = useMemo(() => {
    const c1 = COLORS[b1], c2 = COLORS[b2], c3 = COLORS[b3], cm = COLORS[bm], ct = COLORS[bt];
    const digits = bands === 4 ? c1.digit * 10 + c2.digit : c1.digit * 100 + c2.digit * 10 + c3.digit;
    const resistance = digits * cm.mult;
    const tol = ct.tol;
    const low  = resistance * (1 - tol/100);
    const high = resistance * (1 + tol/100);
    return { resistance, tol, low, high };
  }, [b1, b2, b3, bm, bt, bands]);

  const spResult = useMemo(() => {
    const nums = rList.map(r => parseFloat(r)).filter(r => !isNaN(r) && r > 0);
    if (nums.length < 2) return null;
    const series   = nums.reduce((a, b) => a + b, 0);
    const parallel = 1 / nums.reduce((a, b) => a + 1/b, 0);
    return { series, parallel, nums };
  }, [rList]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Resistor Calculator</h1>
        <p className="muted">Decode resistor color bands to find resistance value, and calculate series or parallel combinations.</p>
      </header>
      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Mode</h2>
          <div className="tab-row">
            <button className={`tab-btn${tab==="decoder"?"active":""}`} onClick={()=>setTab("decoder")}>Color Code Decoder</button>
            <button className={`tab-btn${tab==="sp"?"active":""}`} onClick={()=>setTab("sp")}>Series / Parallel</button>
          </div>

          {tab === "decoder" && (
            <>
              <div className="row">
                <div className="field"><label>Number of Bands</label>
                  <select value={bands} onChange={e => setBands(parseInt(e.target.value))}>
                    <option value={4}>4-Band</option>
                    <option value={5}>5-Band</option>
                  </select>
                </div>
              </div>
              <div className="row two">
                <ColorBand colors={DIGIT_COLORS} selected={b1} onChange={setB1} label="Band 1 (1st digit)" />
                <ColorBand colors={DIGIT_COLORS} selected={b2} onChange={setB2} label="Band 2 (2nd digit)" />
              </div>
              {bands === 5 && (
                <div className="row">
                  <ColorBand colors={DIGIT_COLORS} selected={b3} onChange={setB3} label="Band 3 (3rd digit)" />
                </div>
              )}
              <div className="row two">
                <ColorBand colors={MULT_COLORS} selected={bm} onChange={setBm} label={`Band ${bands===4?3:4} (Multiplier)`} />
                <ColorBand colors={TOL_COLORS}  selected={bt} onChange={setBt} label={`Band ${bands===4?4:5} (Tolerance)`} />
              </div>
              {/* Visual resistor bands */}
              <div style={{ marginTop:14, display:"flex", alignItems:"center", gap:0, height:40, justifyContent:"center" }}>
                <div style={{ width:40, height:8, background:"#c8a96e", borderRadius:"4px 0 0 4px" }}/>
                {[b1,b2,...(bands===5?[b3]:[]),bm,bt].map((ci,i) => (
                  <div key={i} style={{ width:18, height:40, background:COLORS[ci].hex, border:COLORS[ci].border||"none", margin:"0 3px" }}/>
                ))}
                <div style={{ width:40, height:8, background:"#c8a96e", borderRadius:"0 4px 4px 0" }}/>
              </div>
              <div style={{ marginTop:14, padding:"16px 18px", background:"#f0eeff", borderRadius:14, border:"1px solid rgba(99,102,241,0.2)" }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#6b7a9e", textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:6 }}>Resistance</div>
                <div style={{ fontSize:32, fontWeight:900, color:"#4f46e5", fontFamily:"monospace" }}>{fmtOhm(decoded.resistance)}</div>
                <div style={{ fontSize:13, color:"#6b7a9e", marginTop:4 }}>±{decoded.tol}% → {fmtOhm(decoded.low)} – {fmtOhm(decoded.high)}</div>
              </div>
            </>
          )}

          {tab === "sp" && (
            <>
              <p className="small">Enter resistor values (Ω) to calculate series and parallel combinations.</p>
              {rList.map((r, i) => (
                <div key={i} className="field" style={{ marginBottom:8 }}>
                  <label style={{ display:"flex", justifyContent:"space-between" }}>
                    R{i+1} (Ω)
                    {rList.length > 2 && <button onClick={() => setRList(p => p.filter((_,j)=>j!==i))} style={{ background:"none", border:"none", color:"#ef4444", cursor:"pointer", fontWeight:700 }}>✕</button>}
                  </label>
                  <input type="number" min="0" value={r} onChange={e => setRList(p => { const n=[...p]; n[i]=e.target.value; return n; })} />
                </div>
              ))}
              <button className="btn-primary" style={{ width:"auto", padding:"8px 16px", fontSize:13 }} onClick={() => setRList(p => [...p, "100"])}>+ Add Resistor</button>
              {spResult && (
                <div className="kpi-grid" style={{ marginTop:14 }}>
                  <div className="kpi"><div className="kpi-label">Series (R_total)</div><div className="kpi-value" style={{ fontSize:18 }}>{fmtOhm(spResult.series)}</div></div>
                  <div className="kpi"><div className="kpi-label">Parallel (R_total)</div><div className="kpi-value" style={{ fontSize:18 }}>{fmtOhm(spResult.parallel)}</div></div>
                </div>
              )}
            </>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">Color Code Chart</h2>
          <table className="table">
            <thead><tr><th>Color</th><th>Digit</th><th>Multiplier</th><th>Tolerance</th></tr></thead>
            <tbody>
              {COLORS.filter(c=>c.name!=="None").map(c => (
                <tr key={c.name}>
                  <td><span style={{ display:"inline-block", width:14, height:14, background:c.hex, border:"1px solid #ddd", borderRadius:2, verticalAlign:"middle", marginRight:6 }}/>{c.name}</td>
                  <td style={{ fontFamily:"monospace" }}>{c.digit ?? "—"}</td>
                  <td style={{ fontFamily:"monospace" }}>{c.mult !== null ? (c.mult >= 1 ? "×"+c.mult.toExponential(0).replace("e+","e") : "×"+c.mult) : "—"}</td>
                  <td style={{ fontFamily:"monospace" }}>{c.tol !== null ? "±"+c.tol+"%" : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
