import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt2 = v => isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";
const fmt3 = v => isFinite(v) ? v.toFixed(3) : "—";

export default function FuelCostCalculator() {
  const [tab,    setTab]    = useState("trip");
  // Trip cost
  const [dist,   setDist]   = useState("300");
  const [distU,  setDistU]  = useState("mi");
  const [mpg,    setMpg]    = useState("30");
  const [effU,   setEffU]   = useState("mpg");
  const [price,  setPrice]  = useState("3.50");
  const [priceU, setPriceU] = useState("gal");
  // Annual
  const [daysWk, setDaysWk] = useState("5");
  const [distDay,setDistDay]= useState("40");
  // Compare two vehicles
  const [mpg1,   setMpg1]   = useState("20");
  const [mpg2,   setMpg2]   = useState("35");
  const [miles,  setMiles]  = useState("15000");

  const toMiles = (v, u) => u === "mi" ? parseFloat(v) : parseFloat(v) * 0.621371;
  const toMPG   = (v, u) => {
    const n = parseFloat(v);
    if (u === "mpg")   return n;
    if (u === "kml")   return n * 2.35215;
    if (u === "l100k") return 235.215 / n; // L/100km → mpg
    return n;
  };
  const toGalPrice = (v, u) => u === "gal" ? parseFloat(v) : parseFloat(v) * 3.78541;

  const tripResult = useMemo(() => {
    const mi  = toMiles(dist, distU);
    const eff = toMPG(mpg, effU);
    const pp  = toGalPrice(price, priceU);
    if (!isFinite(mi) || !isFinite(eff) || eff <= 0 || !isFinite(pp)) return null;
    const gallons = mi / eff;
    const cost    = gallons * pp;
    const costPerMi = cost / mi;
    return { gallons, cost, costPerMi, mi, eff };
  }, [dist, distU, mpg, effU, price, priceU]);

  const annualResult = useMemo(() => {
    if (!tripResult) return null;
    const dailyMi = toMiles(distDay, distU);
    const daysPerYr = parseFloat(daysWk) * 52;
    const yearMi  = dailyMi * daysPerYr;
    const yearGal = yearMi / tripResult.eff;
    const yearCost = yearGal * toGalPrice(price, priceU);
    return { dailyMi, daysPerYr, yearMi, yearGal, yearCost, monthCost: yearCost / 12 };
  }, [tripResult, distDay, distU, daysWk, price, priceU]);

  const compareResult = useMemo(() => {
    const pp = toGalPrice(price, priceU);
    const mi = parseFloat(miles) || 0;
    const m1 = parseFloat(mpg1), m2 = parseFloat(mpg2);
    if (!isFinite(m1) || !isFinite(m2) || m1 <= 0 || m2 <= 0 || mi <= 0) return null;
    const cost1 = (mi / m1) * pp, cost2 = (mi / m2) * pp;
    return { cost1, cost2, diff: Math.abs(cost1 - cost2), savings: cost1 - cost2 };
  }, [price, priceU, miles, mpg1, mpg2]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Fuel Cost Calculator</h1>
        <p className="muted">Calculate fuel cost for a trip, estimate annual fuel expenses, and compare two vehicles' fuel economy.</p>
      </header>
      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Mode</h2>
          <div className="tab-row">
            <button className={`tab-btn${tab === "trip" ? " active" : ""}`} onClick={() => setTab("trip")}>Trip Cost</button>
            <button className={`tab-btn${tab === "annual" ? " active" : ""}`} onClick={() => setTab("annual")}>Annual Cost</button>
            <button className={`tab-btn${tab === "compare" ? " active" : ""}`} onClick={() => setTab("compare")}>Compare Vehicles</button>
          </div>

          <div className="row two" style={{ marginTop: 12 }}>
            <div className="field"><label>Fuel Price</label>
              <div style={{ display: "flex", gap: 6 }}>
                <input type="number" min="0" step="0.01" value={price} onChange={e => setPrice(e.target.value)} style={{ flex: 1 }} />
                <select value={priceU} onChange={e => setPriceU(e.target.value)} style={{ width: 90 }}>
                  <option value="gal">per gallon</option>
                  <option value="L">per liter</option>
                </select>
              </div>
            </div>
          </div>

          {(tab === "trip" || tab === "annual") && <>
            <div className="row two">
              <div className="field"><label>Fuel Efficiency</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <input type="number" min="0" step="0.5" value={mpg} onChange={e => setMpg(e.target.value)} style={{ flex: 1 }} />
                  <select value={effU} onChange={e => setEffU(e.target.value)} style={{ width: 100 }}>
                    <option value="mpg">MPG</option>
                    <option value="kml">km/L</option>
                    <option value="l100k">L/100km</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="row two">
              <div className="field"><label>Distance</label>
                <div style={{ display: "flex", gap: 6 }}>
                  <input type="number" min="0" step="1" value={dist} onChange={e => setDist(e.target.value)} style={{ flex: 1 }} />
                  <select value={distU} onChange={e => setDistU(e.target.value)} style={{ width: 80 }}>
                    <option value="mi">miles</option>
                    <option value="km">km</option>
                  </select>
                </div>
              </div>
            </div>
          </>}

          {tab === "annual" && <div className="row two">
            <div className="field"><label>Days/Week Driving</label>
              <input type="number" min="1" max="7" value={daysWk} onChange={e => setDaysWk(e.target.value)} /></div>
            <div className="field"><label>Distance per Day ({distU})</label>
              <input type="number" min="0" value={distDay} onChange={e => setDistDay(e.target.value)} /></div>
          </div>}

          {tab === "compare" && <>
            <div className="row two">
              <div className="field"><label>Vehicle 1 (MPG)</label><input type="number" min="0" step="0.5" value={mpg1} onChange={e => setMpg1(e.target.value)} /></div>
              <div className="field"><label>Vehicle 2 (MPG)</label><input type="number" min="0" step="0.5" value={mpg2} onChange={e => setMpg2(e.target.value)} /></div>
            </div>
            <div className="row two">
              <div className="field"><label>Miles per Year</label><input type="number" min="0" value={miles} onChange={e => setMiles(e.target.value)} /></div>
            </div>
          </>}

          {tab === "trip" && tripResult && (
            <div className="kpi-grid" style={{ marginTop: 14 }}>
              <div className="kpi"><div className="kpi-label">Gallons Needed</div><div className="kpi-value">{fmt3(tripResult.gallons)}</div></div>
              <div className="kpi"><div className="kpi-label">Trip Fuel Cost</div><div className="kpi-value" style={{ color: "#4f46e5" }}>${fmt2(tripResult.cost)}</div></div>
              <div className="kpi"><div className="kpi-label">Cost per Mile</div><div className="kpi-value">${fmt3(tripResult.costPerMi)}</div></div>
            </div>
          )}
          {tab === "annual" && annualResult && (
            <div className="kpi-grid" style={{ marginTop: 14 }}>
              <div className="kpi"><div className="kpi-label">Miles/Year</div><div className="kpi-value">{Math.round(annualResult.yearMi).toLocaleString()}</div></div>
              <div className="kpi"><div className="kpi-label">Annual Cost</div><div className="kpi-value" style={{ color: "#4f46e5" }}>${fmt2(annualResult.yearCost)}</div></div>
              <div className="kpi"><div className="kpi-label">Monthly Cost</div><div className="kpi-value">${fmt2(annualResult.monthCost)}</div></div>
              <div className="kpi"><div className="kpi-label">Gallons/Year</div><div className="kpi-value">{fmt2(annualResult.yearGal)}</div></div>
            </div>
          )}
          {tab === "compare" && compareResult && (
            <div className="kpi-grid" style={{ marginTop: 14 }}>
              <div className="kpi"><div className="kpi-label">Vehicle 1 Cost</div><div className="kpi-value">${fmt2(compareResult.cost1)}</div></div>
              <div className="kpi"><div className="kpi-label">Vehicle 2 Cost</div><div className="kpi-value">${fmt2(compareResult.cost2)}</div></div>
              <div className="kpi"><div className="kpi-label">Annual Savings</div><div className="kpi-value" style={{ color: "#16a34a" }}>${fmt2(Math.abs(compareResult.savings))}</div></div>
            </div>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">Typical Fuel Economy (US EPA)</h2>
          <table className="table">
            <thead><tr><th>Vehicle Type</th><th>City MPG</th><th>Hwy MPG</th></tr></thead>
            <tbody>
              {[["Compact sedan","28–32","37–42"],["Midsize sedan","24–28","34–38"],["Full-size sedan","18–22","28–32"],["Compact SUV","24–28","30–35"],["Midsize SUV","18–23","25–30"],["Full-size SUV","14–18","20–25"],["Pickup truck (V8)","13–17","17–22"],["Minivan","19–22","26–28"],["Hybrid sedan","50–55","50–53"],["Plug-in hybrid","40–50","38–45"],["Electric (MPGe)","85–140","80–130"]].map(([v,c,h]) =>
                <tr key={v}><td style={{ fontSize: 13 }}>{v}</td><td style={{ fontFamily: "monospace" }}>{c}</td><td style={{ fontFamily: "monospace" }}>{h}</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
