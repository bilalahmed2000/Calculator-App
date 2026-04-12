import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt2 = v => isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";
const fmt4 = v => isFinite(v) ? v.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : "—";

const COMMON_APPLIANCES = [
  { name: "LED Bulb",              watts: 10 },
  { name: "Incandescent Bulb",     watts: 60 },
  { name: "CFL Bulb",              watts: 15 },
  { name: "Ceiling Fan",           watts: 75 },
  { name: "Window AC (10,000 BTU)",watts: 1000 },
  { name: "Central AC (3 ton)",    watts: 3500 },
  { name: "Space Heater",          watts: 1500 },
  { name: "Electric Water Heater", watts: 4000 },
  { name: "Refrigerator",          watts: 150 },
  { name: "Chest Freezer",         watts: 100 },
  { name: "Microwave",             watts: 1200 },
  { name: "Electric Oven",         watts: 2400 },
  { name: "Dishwasher",            watts: 1800 },
  { name: "Clothes Washer",        watts: 500 },
  { name: "Electric Dryer",        watts: 5000 },
  { name: "Desktop Computer",      watts: 200 },
  { name: "Laptop Computer",       watts: 50 },
  { name: "TV (50-inch LED)",      watts: 100 },
  { name: "Game Console",          watts: 150 },
  { name: "Phone Charger",         watts: 5 },
  { name: "Hair Dryer",            watts: 1800 },
  { name: "Vacuum Cleaner",        watts: 1400 },
  { name: "Electric Vehicle (L2)", watts: 7200 },
  { name: "Pool Pump",             watts: 1500 },
  { name: "Treadmill",             watts: 600 },
];

const ENERGY_UNITS = [
  { l: "Watt-hour (Wh)",      toWh: 1 },
  { l: "Kilowatt-hour (kWh)", toWh: 1000 },
  { l: "Megawatt-hour (MWh)", toWh: 1e6 },
  { l: "Joule (J)",           toWh: 1 / 3600 },
  { l: "Kilojoule (kJ)",      toWh: 1000 / 3600 },
  { l: "Megajoule (MJ)",      toWh: 1e6 / 3600 },
  { l: "BTU",                 toWh: 0.293071 },
  { l: "Calorie (cal)",       toWh: 0.001163 },
  { l: "Kilocalorie (kcal)",  toWh: 1.163 },
  { l: "Therm",               toWh: 29307.1 },
];

let nextId = 1;

export default function ElectricityCalculator() {
  const [tab, setTab] = useState("cost");

  // Single device
  const [watts,    setWatts]    = useState("1000");
  const [hoursDay, setHoursDay] = useState("8");
  const [daysYear, setDaysYear] = useState("365");
  const [rate,     setRate]     = useState("0.13");

  // Multi-device list
  const [devices, setDevices] = useState([
    { id: nextId++, name: "Air Conditioner",  watts: "1000", hoursDay: "8",  daysYear: "120" },
    { id: nextId++, name: "Refrigerator",     watts: "150",  hoursDay: "24", daysYear: "365" },
    { id: nextId++, name: "LED Lights (10x)", watts: "100",  hoursDay: "5",  daysYear: "365" },
  ]);
  const [multiRate, setMultiRate] = useState("0.13");

  // Energy converter
  const [convVal,  setConvVal]  = useState("1");
  const [convFrom, setConvFrom] = useState(1); // kWh index
  const [convTo,   setConvTo]   = useState(0); // Wh index

  // --- single device result ---
  const single = useMemo(() => {
    const w = parseFloat(watts), h = parseFloat(hoursDay), d = parseFloat(daysYear), r = parseFloat(rate);
    if ([w, h, d, r].some(isNaN) || w < 0 || h < 0 || d < 0 || r < 0) return null;
    const kwhPerDay = (w * h) / 1000;
    const kwhPerMonth = kwhPerDay * (d / 12);
    const kwhPerYear = kwhPerDay * d;
    return {
      kwhPerDay,
      kwhPerMonth,
      kwhPerYear,
      costPerDay:   kwhPerDay   * r,
      costPerMonth: kwhPerMonth * r,
      costPerYear:  kwhPerYear  * r,
    };
  }, [watts, hoursDay, daysYear, rate]);

  // --- multi device ---
  const multiResults = useMemo(() => {
    const r = parseFloat(multiRate) || 0;
    return devices.map(d => {
      const w = parseFloat(d.watts) || 0;
      const h = parseFloat(d.hoursDay) || 0;
      const dy = parseFloat(d.daysYear) || 0;
      const kwhYear = (w * h * dy) / 1000;
      return { ...d, kwhYear, costYear: kwhYear * r };
    });
  }, [devices, multiRate]);

  const multiTotal = useMemo(() => ({
    kwhYear:  multiResults.reduce((s, d) => s + d.kwhYear, 0),
    costYear: multiResults.reduce((s, d) => s + d.costYear, 0),
  }), [multiResults]);

  // --- energy converter ---
  const convResult = useMemo(() => {
    const v = parseFloat(convVal);
    if (isNaN(v)) return null;
    const wh = v * ENERGY_UNITS[convFrom].toWh;
    return ENERGY_UNITS.map(u => wh / u.toWh);
  }, [convVal, convFrom]);

  function addDevice() {
    setDevices(prev => [...prev, { id: nextId++, name: "New Device", watts: "100", hoursDay: "4", daysYear: "365" }]);
  }
  function removeDevice(id) {
    setDevices(prev => prev.filter(d => d.id !== id));
  }
  function updateDevice(id, field, val) {
    setDevices(prev => prev.map(d => d.id === id ? { ...d, [field]: val } : d));
  }

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Electricity Calculator</h1>
        <p className="muted">Calculate electricity cost for a single device or an entire household, and convert between energy units.</p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Mode</h2>
          <div className="tab-row">
            <button className={`tab-btn${tab === "cost" ? " active" : ""}`} onClick={() => setTab("cost")}>Single Device</button>
            <button className={`tab-btn${tab === "multi" ? " active" : ""}`} onClick={() => setTab("multi")}>Multi-Device</button>
            <button className={`tab-btn${tab === "convert" ? " active" : ""}`} onClick={() => setTab("convert")}>Energy Converter</button>
          </div>

          {/* ---- SINGLE DEVICE ---- */}
          {tab === "cost" && (
            <>
              <div className="row two">
                <div className="field">
                  <label>Power Consumption (Watts)</label>
                  <input type="number" min="0" value={watts} onChange={e => setWatts(e.target.value)} />
                </div>
                <div className="field">
                  <label>Electricity Rate ($/kWh)</label>
                  <input type="number" min="0" step="0.01" value={rate} onChange={e => setRate(e.target.value)} />
                </div>
              </div>
              <div className="row two">
                <div className="field">
                  <label>Hours Used Per Day</label>
                  <input type="number" min="0" max="24" step="0.5" value={hoursDay} onChange={e => setHoursDay(e.target.value)} />
                </div>
                <div className="field">
                  <label>Days Used Per Year</label>
                  <input type="number" min="0" max="365" value={daysYear} onChange={e => setDaysYear(e.target.value)} />
                </div>
              </div>
              <div className="field" style={{ marginTop: 6 }}>
                <label>Quick-select appliance</label>
                <select onChange={e => { if (e.target.value) setWatts(e.target.value); }}>
                  <option value="">— choose —</option>
                  {COMMON_APPLIANCES.map(a => (
                    <option key={a.name} value={a.watts}>{a.name} ({a.watts}W)</option>
                  ))}
                </select>
              </div>

              {single && (
                <div className="kpi-grid" style={{ marginTop: 14 }}>
                  <div className="kpi">
                    <div className="kpi-label">Daily Cost</div>
                    <div className="kpi-value">${fmt2(single.costPerDay)}</div>
                    <div style={{ fontSize: 12, color: "#6b7a9e" }}>{fmt4(single.kwhPerDay)} kWh</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-label">Monthly Cost</div>
                    <div className="kpi-value">${fmt2(single.costPerMonth)}</div>
                    <div style={{ fontSize: 12, color: "#6b7a9e" }}>{fmt4(single.kwhPerMonth)} kWh</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-label">Yearly Cost</div>
                    <div className="kpi-value" style={{ color: "#4f46e5" }}>${fmt2(single.costPerYear)}</div>
                    <div style={{ fontSize: 12, color: "#6b7a9e" }}>{fmt4(single.kwhPerYear)} kWh</div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ---- MULTI DEVICE ---- */}
          {tab === "multi" && (
            <>
              <div className="row two" style={{ marginBottom: 10 }}>
                <div className="field">
                  <label>Electricity Rate ($/kWh)</label>
                  <input type="number" min="0" step="0.01" value={multiRate} onChange={e => setMultiRate(e.target.value)} />
                </div>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table className="table" style={{ minWidth: 560 }}>
                  <thead>
                    <tr>
                      <th>Device Name</th>
                      <th>Watts</th>
                      <th>Hrs/Day</th>
                      <th>Days/Yr</th>
                      <th>kWh/Yr</th>
                      <th>Cost/Yr</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {multiResults.map(d => (
                      <tr key={d.id}>
                        <td>
                          <input
                            type="text"
                            value={d.name}
                            onChange={e => updateDevice(d.id, "name", e.target.value)}
                            style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 6px", fontSize: 13 }}
                          />
                        </td>
                        <td>
                          <input
                            type="number" min="0" value={d.watts}
                            onChange={e => updateDevice(d.id, "watts", e.target.value)}
                            style={{ width: 70, border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 6px", fontSize: 13 }}
                          />
                        </td>
                        <td>
                          <input
                            type="number" min="0" max="24" value={d.hoursDay}
                            onChange={e => updateDevice(d.id, "hoursDay", e.target.value)}
                            style={{ width: 60, border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 6px", fontSize: 13 }}
                          />
                        </td>
                        <td>
                          <input
                            type="number" min="0" max="365" value={d.daysYear}
                            onChange={e => updateDevice(d.id, "daysYear", e.target.value)}
                            style={{ width: 60, border: "1px solid #d1d5db", borderRadius: 6, padding: "4px 6px", fontSize: 13 }}
                          />
                        </td>
                        <td style={{ fontFamily: "monospace" }}>{fmt4(d.kwhYear)}</td>
                        <td style={{ fontFamily: "monospace", color: "#4f46e5", fontWeight: 700 }}>${fmt2(d.costYear)}</td>
                        <td>
                          <button onClick={() => removeDevice(d.id)} style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer", fontSize: 16, padding: "2px 6px" }}>✕</button>
                        </td>
                      </tr>
                    ))}
                    <tr style={{ background: "#f0eeff", fontWeight: 800 }}>
                      <td colSpan={4}><strong>Total</strong></td>
                      <td style={{ fontFamily: "monospace", color: "#4f46e5" }}>{fmt4(multiTotal.kwhYear)}</td>
                      <td style={{ fontFamily: "monospace", color: "#4f46e5" }}>${fmt2(multiTotal.costYear)}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <button className="btn-primary" onClick={addDevice} style={{ marginTop: 10 }}>+ Add Device</button>
              {multiTotal.costYear > 0 && (
                <div className="kpi-grid" style={{ marginTop: 14 }}>
                  <div className="kpi">
                    <div className="kpi-label">Annual Cost</div>
                    <div className="kpi-value" style={{ color: "#4f46e5" }}>${fmt2(multiTotal.costYear)}</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-label">Monthly Avg</div>
                    <div className="kpi-value">${fmt2(multiTotal.costYear / 12)}</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-label">Total kWh/Yr</div>
                    <div className="kpi-value">{Math.round(multiTotal.kwhYear).toLocaleString()}</div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* ---- ENERGY CONVERTER ---- */}
          {tab === "convert" && (
            <>
              <div className="row two">
                <div className="field">
                  <label>Value</label>
                  <input type="number" min="0" value={convVal} onChange={e => setConvVal(e.target.value)} />
                </div>
                <div className="field">
                  <label>From Unit</label>
                  <select value={convFrom} onChange={e => setConvFrom(parseInt(e.target.value))}>
                    {ENERGY_UNITS.map((u, i) => <option key={i} value={i}>{u.l}</option>)}
                  </select>
                </div>
              </div>
              {convResult && (
                <table className="table" style={{ marginTop: 14 }}>
                  <thead><tr><th>Unit</th><th>Value</th></tr></thead>
                  <tbody>
                    {ENERGY_UNITS.map((u, i) => (
                      <tr key={i} style={i === convTo ? { background: "#f0eeff" } : {}}>
                        <td style={{ fontSize: 13 }}>{u.l}</td>
                        <td style={{ fontFamily: "monospace", fontWeight: i === convTo ? 800 : 400, color: i === convTo ? "#4f46e5" : undefined }}>
                          {convResult[i] >= 1e-9 && convResult[i] < 1e12
                            ? convResult[i].toPrecision(6)
                            : convResult[i].toExponential(4)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </>
          )}
        </section>

        <section className="card">
          {tab === "cost" && single && (
            <>
              <h2 className="card-title">Cost Breakdown</h2>
              <table className="table" style={{ marginBottom: 14 }}>
                <thead><tr><th>Period</th><th>Energy (kWh)</th><th>Cost ($)</th></tr></thead>
                <tbody>
                  <tr><td>Per Hour</td><td style={{ fontFamily: "monospace" }}>{fmt4(parseFloat(watts) / 1000)}</td><td style={{ fontFamily: "monospace" }}>${fmt4(parseFloat(watts) / 1000 * parseFloat(rate))}</td></tr>
                  <tr><td>Per Day</td><td style={{ fontFamily: "monospace" }}>{fmt4(single.kwhPerDay)}</td><td style={{ fontFamily: "monospace" }}>${fmt2(single.costPerDay)}</td></tr>
                  <tr><td>Per Week</td><td style={{ fontFamily: "monospace" }}>{fmt4(single.kwhPerDay * 7)}</td><td style={{ fontFamily: "monospace" }}>${fmt2(single.costPerDay * 7)}</td></tr>
                  <tr><td>Per Month</td><td style={{ fontFamily: "monospace" }}>{fmt4(single.kwhPerMonth)}</td><td style={{ fontFamily: "monospace" }}>${fmt2(single.costPerMonth)}</td></tr>
                  <tr style={{ background: "#f0eeff" }}>
                    <td><strong>Per Year</strong></td>
                    <td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt4(single.kwhPerYear)}</td>
                    <td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>${fmt2(single.costPerYear)}</td>
                  </tr>
                </tbody>
              </table>
              <h3 className="card-title">Formula Used</h3>
              <table className="table">
                <tbody>
                  <tr><td style={{ fontSize: 13 }}>Energy (kWh)</td><td style={{ fontFamily: "monospace" }}>Watts × Hours ÷ 1000</td></tr>
                  <tr><td style={{ fontSize: 13 }}>Cost ($)</td><td style={{ fontFamily: "monospace" }}>kWh × Rate ($/kWh)</td></tr>
                </tbody>
              </table>
            </>
          )}

          {tab !== "cost" && (
            <>
              <h2 className="card-title">Common Appliance Wattages</h2>
              <table className="table">
                <thead><tr><th>Appliance</th><th>Typical Watts</th><th>Monthly Cost*</th></tr></thead>
                <tbody>
                  {COMMON_APPLIANCES.map(a => {
                    const r = parseFloat(tab === "multi" ? multiRate : "0.13") || 0.13;
                    const hrs = a.watts > 2000 ? 2 : a.watts > 500 ? 4 : a.watts > 100 ? 8 : 24;
                    const cost = (a.watts * hrs * 30) / 1000 * r;
                    return (
                      <tr key={a.name}>
                        <td style={{ fontSize: 13 }}>{a.name}</td>
                        <td style={{ fontFamily: "monospace" }}>{a.watts}W</td>
                        <td style={{ fontFamily: "monospace" }}>${fmt2(cost)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <p className="small" style={{ marginTop: 6 }}>* Estimated at $0.13/kWh with typical daily usage hours.</p>
            </>
          )}

          {tab === "cost" && !single && (
            <>
              <h2 className="card-title">Common Appliance Wattages</h2>
              <table className="table">
                <thead><tr><th>Appliance</th><th>Watts</th></tr></thead>
                <tbody>
                  {COMMON_APPLIANCES.slice(0, 14).map(a => (
                    <tr key={a.name}><td style={{ fontSize: 13 }}>{a.name}</td><td style={{ fontFamily: "monospace" }}>{a.watts}W</td></tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
