import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt = (v,d=2) => isFinite(v) ? v.toLocaleString("en-US",{minimumFractionDigits:d,maximumFractionDigits:d}) : "—";
const fmtB = v => isFinite(v) ? (v>=1e12 ? "$"+(v/1e12).toFixed(3)+"T" : v>=1e9 ? "$"+(v/1e9).toFixed(3)+"B" : v>=1e6 ? "$"+(v/1e6).toFixed(3)+"M" : "$"+fmt(v,2)) : "—";

const GDP_COUNTRIES = [
  ["United States",    27360, 336],
  ["China",            17790, 1410],
  ["Germany",          4460,  84],
  ["Japan",            4210,  124],
  ["India",            3740,  1440],
  ["United Kingdom",   3090,  68],
  ["France",           2920,  68],
  ["Brazil",           2130,  216],
  ["Canada",           2140,  40],
  ["Italy",            2170,  59],
  ["Australia",        1720,  26],
  ["South Korea",      1710,  52],
];

export default function GDPCalculator() {
  const [tab, setTab] = useState("expenditure");

  // Expenditure approach: GDP = C + I + G + (X - M)
  const [C, setC] = useState("14000"); // household consumption
  const [I, setI] = useState("4000");  // investment
  const [G, setG] = useState("5000");  // govt spending
  const [X, setX] = useState("3000");  // exports
  const [M, setM] = useState("3500");  // imports
  const [pop, setPop] = useState("336"); // population millions

  // Income approach: GDP = W + P + R + T - S + D
  const [wages, setWages]   = useState("18000");
  const [profit, setProfit] = useState("5000");
  const [rent,   setRent]   = useState("2000");
  const [indirect, setIndirect] = useState("1500");
  const [subsidies, setSubsidies] = useState("200");
  const [depreciation, setDepreciation] = useState("2000");

  // Growth
  const [gdp1, setGdp1] = useState("20000");
  const [gdp2, setGdp2] = useState("21000");
  const [deflator1, setDeflator1] = useState("100");
  const [deflator2, setDeflator2] = useState("103");

  const exResult = useMemo(() => {
    const c=parseFloat(C)||0, i=parseFloat(I)||0, g=parseFloat(G)||0, x=parseFloat(X)||0, m=parseFloat(M)||0, p=parseFloat(pop)||1;
    const gdp = c + i + g + (x - m);
    const netExports = x - m;
    const gdpPerCapita = p > 0 ? gdp / p * 1e6 : null; // billions / millions people = thousands
    return { gdp, c, i, g, netExports, gdpPerCapita, total: gdp };
  }, [C, I, G, X, M, pop]);

  const incResult = useMemo(() => {
    const w=parseFloat(wages)||0, p=parseFloat(profit)||0, r=parseFloat(rent)||0,
          t=parseFloat(indirect)||0, s=parseFloat(subsidies)||0, d=parseFloat(depreciation)||0;
    const ni  = w + p + r;                 // National Income
    const gdp = ni + t - s + d;            // Approximate GDP
    return { ni, t, s, d, gdp };
  }, [wages, profit, rent, indirect, subsidies, depreciation]);

  const growthResult = useMemo(() => {
    const g1=parseFloat(gdp1), g2=parseFloat(gdp2), d1=parseFloat(deflator1), d2=parseFloat(deflator2);
    if ([g1,g2,d1,d2].some(isNaN)||d1===0||d2===0) return null;
    const nominal_growth = (g2 - g1) / g1 * 100;
    const real1 = g1 / d1 * 100, real2 = g2 / d2 * 100;
    const real_growth = (real2 - real1) / real1 * 100;
    const inflation = (d2 - d1) / d1 * 100;
    return { nominal_growth, real_growth, inflation, real1, real2 };
  }, [gdp1, gdp2, deflator1, deflator2]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>GDP Calculator</h1>
        <p className="muted">Calculate Gross Domestic Product using the Expenditure or Income approach, compute real GDP growth, and explore per-capita comparisons.</p>
      </header>
      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Approach</h2>
          <div className="tab-row">
            <button className={`tab-btn${tab==="expenditure"?"active":""}`} onClick={()=>setTab("expenditure")}>Expenditure</button>
            <button className={`tab-btn${tab==="income"?"active":""}`} onClick={()=>setTab("income")}>Income</button>
            <button className={`tab-btn${tab==="growth"?"active":""}`} onClick={()=>setTab("growth")}>Real Growth</button>
          </div>

          {tab === "expenditure" && (
            <>
              <p className="small">GDP = C + I + G + (X − M) &nbsp; (values in billions $)</p>
              <div className="row two">
                <div className="field"><label>Consumption (C) — Household spending</label><input type="number" min="0" value={C} onChange={e=>setC(e.target.value)} /></div>
                <div className="field"><label>Investment (I) — Business & residential</label><input type="number" min="0" value={I} onChange={e=>setI(e.target.value)} /></div>
              </div>
              <div className="row two">
                <div className="field"><label>Government Spending (G)</label><input type="number" min="0" value={G} onChange={e=>setG(e.target.value)} /></div>
                <div className="field"><label>Exports (X)</label><input type="number" min="0" value={X} onChange={e=>setX(e.target.value)} /></div>
              </div>
              <div className="row two">
                <div className="field"><label>Imports (M)</label><input type="number" min="0" value={M} onChange={e=>setM(e.target.value)} /></div>
                <div className="field"><label>Population (millions)</label><input type="number" min="0" value={pop} onChange={e=>setPop(e.target.value)} /></div>
              </div>
              <div style={{ marginTop:14, padding:"16px 18px", background:"#f0eeff", borderRadius:14, border:"1px solid rgba(99,102,241,0.2)" }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#6b7a9e", textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:6 }}>GDP</div>
                <div style={{ fontSize:36, fontWeight:900, color:"#4f46e5" }}>${fmt(exResult.gdp, 2)}B</div>
                {exResult.gdpPerCapita && <div style={{ fontSize:14, color:"#6b7a9e", marginTop:4 }}>Per Capita: ${fmt(exResult.gdpPerCapita * 1000, 0)} / person</div>}
              </div>
            </>
          )}

          {tab === "income" && (
            <>
              <p className="small">GDP ≈ Wages + Profit + Rent + Indirect Taxes − Subsidies + Depreciation &nbsp; (values in billions $)</p>
              <div className="row two">
                <div className="field"><label>Wages & Salaries (W)</label><input type="number" min="0" value={wages} onChange={e=>setWages(e.target.value)} /></div>
                <div className="field"><label>Corporate Profit (P)</label><input type="number" min="0" value={profit} onChange={e=>setProfit(e.target.value)} /></div>
              </div>
              <div className="row two">
                <div className="field"><label>Rent Income (R)</label><input type="number" min="0" value={rent} onChange={e=>setRent(e.target.value)} /></div>
                <div className="field"><label>Indirect Taxes (T)</label><input type="number" min="0" value={indirect} onChange={e=>setIndirect(e.target.value)} /></div>
              </div>
              <div className="row two">
                <div className="field"><label>Subsidies (S)</label><input type="number" min="0" value={subsidies} onChange={e=>setSubsidies(e.target.value)} /></div>
                <div className="field"><label>Depreciation / CCA (D)</label><input type="number" min="0" value={depreciation} onChange={e=>setDepreciation(e.target.value)} /></div>
              </div>
              <div style={{ marginTop:14, padding:"16px 18px", background:"#f0eeff", borderRadius:14, border:"1px solid rgba(99,102,241,0.2)" }}>
                <div style={{ fontSize:11, fontWeight:700, color:"#6b7a9e", textTransform:"uppercase", letterSpacing:"0.4px", marginBottom:6 }}>GDP (Income)</div>
                <div style={{ fontSize:36, fontWeight:900, color:"#4f46e5" }}>${fmt(incResult.gdp, 2)}B</div>
                <div style={{ fontSize:13, color:"#6b7a9e", marginTop:4 }}>National Income: ${fmt(incResult.ni, 2)}B</div>
              </div>
            </>
          )}

          {tab === "growth" && (
            <>
              <p className="small">Real GDP adjusts for inflation using the GDP deflator. (values in billions $)</p>
              <div className="row two">
                <div className="field"><label>Nominal GDP — Year 1</label><input type="number" min="0" value={gdp1} onChange={e=>setGdp1(e.target.value)} /></div>
                <div className="field"><label>GDP Deflator — Year 1 (base=100)</label><input type="number" min="0" value={deflator1} onChange={e=>setDeflator1(e.target.value)} /></div>
              </div>
              <div className="row two">
                <div className="field"><label>Nominal GDP — Year 2</label><input type="number" min="0" value={gdp2} onChange={e=>setGdp2(e.target.value)} /></div>
                <div className="field"><label>GDP Deflator — Year 2</label><input type="number" min="0" value={deflator2} onChange={e=>setDeflator2(e.target.value)} /></div>
              </div>
              {growthResult && (
                <div className="kpi-grid" style={{ marginTop:14 }}>
                  <div className="kpi"><div className="kpi-label">Nominal Growth</div><div className="kpi-value" style={{ color:growthResult.nominal_growth>=0?"#16a34a":"#dc2626" }}>{growthResult.nominal_growth.toFixed(2)}%</div></div>
                  <div className="kpi"><div className="kpi-label">Real Growth</div><div className="kpi-value" style={{ color:growthResult.real_growth>=0?"#16a34a":"#dc2626" }}>{growthResult.real_growth.toFixed(2)}%</div></div>
                  <div className="kpi"><div className="kpi-label">Inflation Rate</div><div className="kpi-value">{growthResult.inflation.toFixed(2)}%</div></div>
                </div>
              )}
            </>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">{tab==="expenditure"?"GDP Breakdown":"Results"}</h2>
          {tab === "expenditure" && (
            <>
              <table className="table" style={{ marginBottom:14 }}>
                <thead><tr><th>Component</th><th>Value ($B)</th><th>% of GDP</th></tr></thead>
                <tbody>
                  {[["Consumption (C)",exResult.c],["Investment (I)",exResult.i],["Gov. Spending (G)",exResult.g],["Net Exports (X−M)",exResult.netExports]].map(([label,val])=>(
                    <tr key={label} style={label.startsWith("Net")&&exResult.netExports<0?{color:"#dc2626"}:{}}>
                      <td style={{ fontSize:13 }}>{label}</td>
                      <td style={{ fontFamily:"monospace" }}>{fmt(val,2)}</td>
                      <td style={{ fontFamily:"monospace" }}>{exResult.gdp>0?fmt(val/exResult.gdp*100,1)+"%":"—"}</td>
                    </tr>
                  ))}
                  <tr style={{ background:"#f0eeff" }}><td><strong>GDP Total</strong></td><td style={{ fontFamily:"monospace", fontWeight:800, color:"#4f46e5" }}>{fmt(exResult.gdp,2)}</td><td style={{ fontFamily:"monospace", fontWeight:700 }}>100%</td></tr>
                </tbody>
              </table>
            </>
          )}
          {tab === "growth" && growthResult && (
            <table className="table" style={{ marginBottom:14 }}>
              <thead><tr><th>Metric</th><th>Year 1</th><th>Year 2</th></tr></thead>
              <tbody>
                <tr><td>Nominal GDP ($B)</td><td style={{ fontFamily:"monospace" }}>{gdp1}</td><td style={{ fontFamily:"monospace" }}>{gdp2}</td></tr>
                <tr><td>GDP Deflator</td><td style={{ fontFamily:"monospace" }}>{deflator1}</td><td style={{ fontFamily:"monospace" }}>{deflator2}</td></tr>
                <tr style={{ background:"#f0eeff" }}><td><strong>Real GDP ($B)</strong></td><td style={{ fontFamily:"monospace", fontWeight:800, color:"#4f46e5" }}>{fmt(growthResult.real1,2)}</td><td style={{ fontFamily:"monospace", fontWeight:800, color:"#4f46e5" }}>{fmt(growthResult.real2,2)}</td></tr>
                <tr><td>Real Growth Rate</td><td colSpan={2} style={{ fontFamily:"monospace", fontWeight:700, color:growthResult.real_growth>=0?"#16a34a":"#dc2626" }}>{growthResult.real_growth.toFixed(3)}%</td></tr>
              </tbody>
            </table>
          )}

          <h3 className="card-title" style={{ marginTop:16 }}>GDP by Country (2024, $B)</h3>
          <table className="table">
            <thead><tr><th>Country</th><th>GDP ($B)</th><th>Pop (M)</th><th>Per Capita</th></tr></thead>
            <tbody>
              {GDP_COUNTRIES.map(([c, gdp, pop]) => (
                <tr key={c}>
                  <td style={{ fontSize:13 }}>{c}</td>
                  <td style={{ fontFamily:"monospace" }}>{fmtB(gdp*1e9)}</td>
                  <td style={{ fontFamily:"monospace" }}>{pop}</td>
                  <td style={{ fontFamily:"monospace" }}>${(gdp*1e9/pop/1e6).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,",")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
