import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const ELEMENTS = {
  H:{name:"Hydrogen",   w:1.008},   He:{name:"Helium",      w:4.0026},
  Li:{name:"Lithium",   w:6.941},   Be:{name:"Beryllium",   w:9.0122},
  B:{name:"Boron",      w:10.811},  C:{name:"Carbon",       w:12.011},
  N:{name:"Nitrogen",   w:14.007},  O:{name:"Oxygen",       w:15.999},
  F:{name:"Fluorine",   w:18.998},  Ne:{name:"Neon",        w:20.180},
  Na:{name:"Sodium",    w:22.990},  Mg:{name:"Magnesium",   w:24.305},
  Al:{name:"Aluminum",  w:26.982},  Si:{name:"Silicon",     w:28.086},
  P:{name:"Phosphorus", w:30.974},  S:{name:"Sulfur",       w:32.065},
  Cl:{name:"Chlorine",  w:35.453},  Ar:{name:"Argon",       w:39.948},
  K:{name:"Potassium",  w:39.098},  Ca:{name:"Calcium",     w:40.078},
  Sc:{name:"Scandium",  w:44.956},  Ti:{name:"Titanium",    w:47.867},
  V:{name:"Vanadium",   w:50.942},  Cr:{name:"Chromium",    w:51.996},
  Mn:{name:"Manganese", w:54.938},  Fe:{name:"Iron",        w:55.845},
  Co:{name:"Cobalt",    w:58.933},  Ni:{name:"Nickel",      w:58.693},
  Cu:{name:"Copper",    w:63.546},  Zn:{name:"Zinc",        w:65.38},
  Ga:{name:"Gallium",   w:69.723},  Ge:{name:"Germanium",   w:72.64},
  As:{name:"Arsenic",   w:74.922},  Se:{name:"Selenium",    w:78.96},
  Br:{name:"Bromine",   w:79.904},  Kr:{name:"Krypton",     w:83.798},
  Rb:{name:"Rubidium",  w:85.468},  Sr:{name:"Strontium",   w:87.62},
  Y:{name:"Yttrium",    w:88.906},  Zr:{name:"Zirconium",   w:91.224},
  Mo:{name:"Molybdenum",w:95.96},   Ag:{name:"Silver",      w:107.87},
  Cd:{name:"Cadmium",   w:112.41},  In:{name:"Indium",      w:114.82},
  Sn:{name:"Tin",       w:118.71},  Sb:{name:"Antimony",    w:121.76},
  I:{name:"Iodine",     w:126.90},  Xe:{name:"Xenon",       w:131.29},
  Cs:{name:"Cesium",    w:132.91},  Ba:{name:"Barium",      w:137.33},
  La:{name:"Lanthanum", w:138.91},  Ce:{name:"Cerium",      w:140.12},
  Pt:{name:"Platinum",  w:195.08},  Au:{name:"Gold",        w:196.97},
  Hg:{name:"Mercury",   w:200.59},  Pb:{name:"Lead",        w:207.2},
  Bi:{name:"Bismuth",   w:208.98},  U:{name:"Uranium",      w:238.03},
};

function parseFormula(formula) {
  // Recursive parser supporting parentheses: e.g. Ca(OH)2, H2SO4, (NH4)2SO4
  function parse(str, pos) {
    const result = {};
    while (pos < str.length) {
      if (str[pos] === ')') { return { result, pos }; }
      if (str[pos] === '(') {
        const inner = parse(str, pos + 1);
        pos = inner.pos + 1; // skip ')'
        let numStr = '';
        while (pos < str.length && /\d/.test(str[pos])) { numStr += str[pos]; pos++; }
        const mult = numStr ? parseInt(numStr) : 1;
        for (const [el, cnt] of Object.entries(inner.result)) {
          result[el] = (result[el] || 0) + cnt * mult;
        }
      } else if (/[A-Z]/.test(str[pos])) {
        let sym = str[pos]; pos++;
        while (pos < str.length && /[a-z]/.test(str[pos])) { sym += str[pos]; pos++; }
        let numStr = '';
        while (pos < str.length && /\d/.test(str[pos])) { numStr += str[pos]; pos++; }
        const cnt = numStr ? parseInt(numStr) : 1;
        result[sym] = (result[sym] || 0) + cnt;
      } else {
        pos++;
      }
    }
    return { result, pos };
  }
  try {
    const { result } = parse(formula.trim(), 0);
    const unknowns = Object.keys(result).filter(el => !ELEMENTS[el]);
    if (unknowns.length > 0) return { error: `Unknown element(s): ${unknowns.join(", ")}` };
    return { elements: result };
  } catch { return { error: "Invalid formula" }; }
}

const COMMON = ["H2O","CO2","NaCl","H2SO4","HCl","NH3","CH4","C6H12O6","C2H5OH","Ca(OH)2","(NH4)2SO4","CaCO3","Fe2O3","Al2O3","H2O2"];

export default function MolecularWeightCalculator() {
  const [formula, setFormula] = useState("H2O");

  const result = useMemo(() => {
    if (!formula.trim()) return null;
    const parsed = parseFormula(formula);
    if (parsed.error) return { error: parsed.error };
    const elements = parsed.elements;
    let mw = 0;
    const breakdown = Object.entries(elements).map(([sym, cnt]) => {
      const el = ELEMENTS[sym];
      const contrib = el.w * cnt;
      mw += contrib;
      return { sym, name: el.name, atomicW: el.w, count: cnt, contrib };
    });
    return { mw, breakdown, formula: formula.trim() };
  }, [formula]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Molecular Weight Calculator</h1>
        <p className="muted">Enter a chemical formula to calculate its molecular weight (molar mass) in g/mol. Supports parentheses, e.g. Ca(OH)₂.</p>
      </header>
      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Chemical Formula</h2>
          <div className="field">
            <label>Formula</label>
            <input type="text" value={formula} onChange={e=>setFormula(e.target.value)} placeholder="e.g. H2O, H2SO4, Ca(OH)2" style={{ fontFamily:"monospace", fontSize:18, letterSpacing:1 }} />
          </div>
          <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:10 }}>
            {COMMON.map(f => (
              <button key={f} onClick={() => setFormula(f)} style={{ padding:"4px 10px", borderRadius:6, border:"1px solid rgba(99,102,241,0.3)", background: formula===f?"#4f46e5":"#f0eeff", color: formula===f?"white":"#4f46e5", cursor:"pointer", fontFamily:"monospace", fontSize:12, fontWeight:600 }}>{f}</button>
            ))}
          </div>
          {result && (
            result.error ? (
              <div style={{ marginTop:14, padding:"12px 16px", background:"#fef2f2", borderRadius:10, border:"1px solid #fca5a5", color:"#b91c1c", fontWeight:600 }}>{result.error}</div>
            ) : (
              <div style={{ marginTop:14, padding:"16px 18px", background:"#f0eeff", borderRadius:14, border:"1px solid rgba(99,102,241,0.2)" }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#6b7a9e", textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:6 }}>Molecular Weight</div>
                <div style={{ fontSize:36, fontWeight:900, color:"#4f46e5" }}>{result.mw.toFixed(4)} <span style={{ fontSize:18 }}>g/mol</span></div>
                <div style={{ fontSize:13, color:"#6b7a9e", marginTop:4 }}>Formula: {result.formula}</div>
              </div>
            )
          )}
        </section>
        <section className="card">
          <h2 className="card-title">Element Breakdown</h2>
          {result && !result.error ? (
            <>
              <table className="table" style={{ marginBottom:14 }}>
                <thead><tr><th>Symbol</th><th>Element</th><th>Count</th><th>Atomic Wt</th><th>Contribution</th><th>%</th></tr></thead>
                <tbody>
                  {result.breakdown.map(r => (
                    <tr key={r.sym}>
                      <td style={{ fontFamily:"monospace", fontWeight:800, color:"#4f46e5" }}>{r.sym}</td>
                      <td style={{ fontSize:13 }}>{r.name}</td>
                      <td style={{ fontFamily:"monospace" }}>{r.count}</td>
                      <td style={{ fontFamily:"monospace" }}>{r.atomicW.toFixed(4)}</td>
                      <td style={{ fontFamily:"monospace", fontWeight:700 }}>{r.contrib.toFixed(4)}</td>
                      <td style={{ fontFamily:"monospace" }}>{((r.contrib/result.mw)*100).toFixed(1)}%</td>
                    </tr>
                  ))}
                  <tr style={{ background:"#f0eeff" }}>
                    <td colSpan={4}><strong>Total</strong></td>
                    <td style={{ fontFamily:"monospace", fontWeight:800, color:"#4f46e5" }}>{result.mw.toFixed(4)}</td>
                    <td style={{ fontFamily:"monospace", fontWeight:700 }}>100%</td>
                  </tr>
                </tbody>
              </table>
            </>
          ) : <p className="small">Enter a valid chemical formula.</p>}
          <h3 className="card-title" style={{ marginTop:16 }}>Common Molecular Weights</h3>
          <table className="table">
            <thead><tr><th>Compound</th><th>Formula</th><th>MW (g/mol)</th></tr></thead>
            <tbody>
              {[["Water","H2O",18.015],["Carbon Dioxide","CO2",44.010],["Salt (NaCl)","NaCl",58.443],["Sulfuric Acid","H2SO4",98.079],["Glucose","C6H12O6",180.16],["Ethanol","C2H5OH",46.068],["Ammonia","NH3",17.031],["Methane","CH4",16.043]].map(([n,f,m])=>(
                <tr key={f} style={formula===f?{background:"#f0eeff"}:{}} onClick={()=>setFormula(f)} style={{ cursor:"pointer", ...(formula===f?{background:"#f0eeff"}:{}) }}>
                  <td style={{ fontSize:13 }}>{n}</td>
                  <td style={{ fontFamily:"monospace", color:"#4f46e5", fontWeight:600 }}>{f}</td>
                  <td style={{ fontFamily:"monospace" }}>{m}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
