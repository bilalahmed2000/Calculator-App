import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const fmt = (v, d = 2) => isFinite(v) ? v.toFixed(d) : "—";

function parseTire(str) {
  // e.g. P205/55R16, 205/55R16, 205/55/16
  const m = str.trim().toUpperCase().match(/^[A-Z]?(\d+)[\/\-](\d+)[R\/\-](\d+(?:\.\d+)?)$/);
  if (!m) return null;
  const width = parseFloat(m[1]);   // mm
  const aspect = parseFloat(m[2]);  // %
  const rim    = parseFloat(m[3]);  // inches
  if (!isFinite(width) || !isFinite(aspect) || !isFinite(rim)) return null;
  const sidewall = width * (aspect / 100) / 25.4;  // inches
  const diameter = rim + 2 * sidewall;             // inches
  const circumference = Math.PI * diameter;
  const revPerMile = 63360 / circumference;
  return { width, aspect, rim, sidewall, diameter, circumference, revPerMile };
}

export default function TireSizeCalculator() {
  const [tire1, setTire1] = useState("205/55R16");
  const [tire2, setTire2] = useState("225/45R17");
  const [speed, setSpeed] = useState("60"); // mph shown on speedometer

  const t1 = useMemo(() => parseTire(tire1), [tire1]);
  const t2 = useMemo(() => parseTire(tire2), [tire2]);

  const comparison = useMemo(() => {
    if (!t1 || !t2) return null;
    const sp = parseFloat(speed) || 60;
    const actualSpeed = sp * (t2.circumference / t1.circumference);
    const diamDiff = ((t2.diameter - t1.diameter) / t1.diameter) * 100;
    const revDiff  = ((t2.revPerMile - t1.revPerMile) / t1.revPerMile) * 100;
    return { actualSpeed, diamDiff, revDiff };
  }, [t1, t2, speed]);

  const TireCard = ({ label, data }) => {
    if (!data) return <p className="small" style={{ color: "#dc2626" }}>Invalid tire size. Use format: 205/55R16</p>;
    return (
      <table className="table" style={{ marginBottom: 10 }}>
        <thead><tr><th colSpan={2} style={{ background: "#f0eeff", color: "#4f46e5" }}>{label}</th></tr></thead>
        <tbody>
          {[["Width", `${data.width} mm`],["Aspect Ratio", `${data.aspect}%`],["Rim Diameter", `${data.rim}"`],["Sidewall Height", `${fmt(data.sidewall, 3)}"`],["Overall Diameter", `${fmt(data.diameter, 3)}"`],["Circumference", `${fmt(data.circumference, 3)}"`],["Revolutions/Mile", `${fmt(data.revPerMile, 1)}`]].map(([l,v]) =>
            <tr key={l}><td style={{ fontSize: 13 }}>{l}</td><td style={{ fontFamily: "monospace", fontWeight: 600 }}>{v}</td></tr>
          )}
        </tbody>
      </table>
    );
  };

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Tire Size Calculator</h1>
        <p className="muted">Calculate tire dimensions and compare two tire sizes to check speedometer accuracy and clearance compatibility.</p>
      </header>
      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Tire Sizes</h2>
          <p className="small">Enter tire size in format: <strong>205/55R16</strong> (Width/Aspect Ratio R Rim)</p>
          <div className="row two">
            <div className="field"><label>Original / Tire 1</label>
              <input type="text" value={tire1} onChange={e => setTire1(e.target.value)} placeholder="e.g. 205/55R16" /></div>
            <div className="field"><label>New / Tire 2 (compare)</label>
              <input type="text" value={tire2} onChange={e => setTire2(e.target.value)} placeholder="e.g. 225/45R17" /></div>
          </div>

          <TireCard label={`Tire 1: ${tire1.toUpperCase()}`} data={t1} />
          <TireCard label={`Tire 2: ${tire2.toUpperCase()}`} data={t2} />

          {comparison && (
            <>
              <h3 className="card-title" style={{ marginTop: 16 }}>Speedometer Correction</h3>
              <div className="row two">
                <div className="field"><label>Speedometer Reading (mph)</label>
                  <input type="number" min="0" value={speed} onChange={e => setSpeed(e.target.value)} /></div>
              </div>
              <div className="kpi-grid" style={{ marginTop: 10 }}>
                <div className="kpi"><div className="kpi-label">Actual Speed</div><div className="kpi-value" style={{ color: Math.abs(comparison.actualSpeed - parseFloat(speed)) > 2 ? "#dc2626" : "#16a34a" }}>{fmt(comparison.actualSpeed, 1)} mph</div></div>
                <div className="kpi"><div className="kpi-label">Diameter Diff</div><div className="kpi-value">{comparison.diamDiff > 0 ? "+" : ""}{fmt(comparison.diamDiff, 2)}%</div></div>
                <div className="kpi"><div className="kpi-label">Rev/Mile Diff</div><div className="kpi-value">{comparison.revDiff > 0 ? "+" : ""}{fmt(comparison.revDiff, 2)}%</div></div>
              </div>
            </>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">How to Read a Tire Size</h2>
          <div style={{ padding: "12px 16px", background: "#f0eeff", borderRadius: 10, marginBottom: 14, fontFamily: "monospace", fontSize: 18, fontWeight: 800, color: "#4f46e5", textAlign: "center" }}>P205/55R16</div>
          <table className="table" style={{ marginBottom: 14 }}>
            <tbody>
              {[["P","Vehicle type (P=Passenger, LT=Light Truck)"],["205","Section width in mm"],["55","Aspect ratio (sidewall % of width)"],["R","Construction (R=Radial)"],["16","Rim diameter in inches"]].map(([c,d]) =>
                <tr key={c}><td style={{ fontFamily: "monospace", fontWeight: 700, color: "#4f46e5" }}>{c}</td><td style={{ fontSize: 13 }}>{d}</td></tr>
              )}
            </tbody>
          </table>
          <h3 className="card-title">Popular OEM Tire Sizes</h3>
          <table className="table">
            <thead><tr><th>Size</th><th>Common Vehicles</th></tr></thead>
            <tbody>
              {[["205/55R16","Honda Civic, Toyota Corolla"],["215/60R16","Honda Accord, Toyota Camry"],["225/65R17","Honda CR-V, RAV4"],["235/55R18","Ford F-150, Chevy Equinox"],["245/45R18","BMW 3 Series, Audi A4"],["255/50R19","Range Rover Sport"],["265/70R17","F-150, Silverado"],["275/55R20","RAM 1500, Tundra"]].map(([s,v]) =>
                <tr key={s}><td style={{ fontFamily: "monospace", fontSize: 13 }}>{s}</td><td style={{ fontSize: 12 }}>{v}</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
