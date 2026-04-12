import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

/* ── Standard drink definitions ── */
const DRINK_TYPES = [
  { label: "Beer — Regular (12 fl oz, 5% ABV)",         oz: 12,  abv: 0.05  },
  { label: "Beer — Light (12 fl oz, 4.2% ABV)",         oz: 12,  abv: 0.042 },
  { label: "Beer — Craft/IPA (12 fl oz, 7% ABV)",       oz: 12,  abv: 0.07  },
  { label: "Wine — Table (5 fl oz, 12% ABV)",           oz: 5,   abv: 0.12  },
  { label: "Wine — Sparkling (5 fl oz, 12% ABV)",       oz: 5,   abv: 0.12  },
  { label: "Wine — Fortified (3.5 fl oz, 17% ABV)",     oz: 3.5, abv: 0.17  },
  { label: "Shot / Spirit (1.5 fl oz, 40% ABV)",        oz: 1.5, abv: 0.40  },
  { label: "Mixed Drink (2 fl oz spirit, 40% ABV)",     oz: 2.0, abv: 0.40  },
  { label: "Malt Liquor (8 fl oz, 7% ABV)",             oz: 8,   abv: 0.07  },
  { label: "Hard Seltzer (12 fl oz, 5% ABV)",           oz: 12,  abv: 0.05  },
];

/* ── BAC impairment levels ── */
const IMPAIRMENT = [
  { max: 0.020, label: "Subtle effects",  color: "#4ade80", desc: "Slight mood elevation. Relaxation. Minor impairment of reasoning." },
  { max: 0.050, label: "Mild impairment", color: "#a3e635", desc: "Euphoria. Mild impairment of judgment, memory, and attention." },
  { max: 0.080, label: "Legal limit (US)", color: "#facc15", desc: "Balance and speech impairment. Poor judgment. Legally drunk in the US." },
  { max: 0.100, label: "Significant impairment", color: "#fb923c", desc: "Clearly impaired. Slurred speech. Poor coordination. Reaction time slowed." },
  { max: 0.150, label: "Serious impairment", color: "#f87171", desc: "Gross motor impairment. Possible nausea and vomiting." },
  { max: 0.300, label: "Severe impairment", color: "#e879f9", desc: "Stupor. Loss of consciousness possible. Alcohol poisoning risk." },
  { max: Infinity, label: "Potentially fatal", color: "#9333ea", desc: "Coma. Respiratory depression. Life-threatening. Call emergency services." },
];

function getImpairment(bac) {
  return IMPAIRMENT.find(i => bac < i.max) || IMPAIRMENT[IMPAIRMENT.length - 1];
}

// Widmark formula
// BAC (%) = [alcohol (g) / (body weight (g) × r)] × 100 − (0.015 × hours)
// r = 0.68 for men, 0.55 for women
// alcohol (g) = volume (oz) × 29.5735 × ABV × 0.789 (ethanol density)

const WIDMARK_R = { male: 0.68, female: 0.55 };
const OZ_TO_ML = 29.5735;
const ETHANOL_DENSITY = 0.789; // g/mL
const ELIMINATION_RATE = 0.015; // % BAC per hour

export default function BACCalculator() {
  const [sex, setSex]         = useState("male");
  const [units, setUnits]     = useState("us");
  const [lb, setLb]           = useState(160);
  const [kg, setKg]           = useState(73);
  const [hours, setHours]     = useState(2);
  const [mins, setMins]       = useState(0);

  // Drinks list: [{drinkIdx, count}]
  const [drinks, setDrinks]   = useState([{ drinkIdx: 0, count: 2 }]);

  const weightKg = useMemo(
    () => units === "metric" ? Number(kg) : Number(lb) * 0.453592,
    [units, kg, lb]
  );

  const totalAlcoholG = useMemo(() => {
    return drinks.reduce((sum, d) => {
      const drink = DRINK_TYPES[d.drinkIdx];
      const ml = drink.oz * OZ_TO_ML;
      const alcoholMl = ml * drink.abv;
      const alcoholG = alcoholMl * ETHANOL_DENSITY;
      return sum + alcoholG * Number(d.count);
    }, 0);
  }, [drinks]);

  const elapsedHrs = useMemo(() => Number(hours) + Number(mins) / 60, [hours, mins]);

  const bac = useMemo(() => {
    if (!weightKg || weightKg <= 0) return 0;
    const r = WIDMARK_R[sex];
    const rawBAC = (totalAlcoholG / (weightKg * 1000 * r)) * 100;
    const adjustedBAC = rawBAC - (ELIMINATION_RATE * elapsedHrs);
    return Math.max(0, Math.round(adjustedBAC * 1000) / 1000);
  }, [totalAlcoholG, weightKg, sex, elapsedHrs]);

  const impairment = useMemo(() => getImpairment(bac), [bac]);

  // Time until sober (BAC reaches 0)
  const sobHrs = useMemo(() => {
    if (!bac) return 0;
    return Math.ceil((bac / ELIMINATION_RATE) * 10) / 10;
  }, [bac]);

  const addDrink = () => setDrinks(prev => [...prev, { drinkIdx: 0, count: 1 }]);
  const removeDrink = (i) => setDrinks(prev => prev.filter((_, idx) => idx !== i));
  const updateDrink = (i, key, val) => setDrinks(prev =>
    prev.map((d, idx) => idx === i ? { ...d, [key]: key === "count" ? Math.max(0.5, Number(val)) : Number(val) } : d)
  );

  const pinLeft = useMemo(() => {
    const clamped = Math.max(0, Math.min(0.30, bac));
    return (clamped / 0.30) * 100;
  }, [bac]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>BAC Calculator</h1>
        <p className="muted">
          Estimate your Blood Alcohol Content (BAC) using the Widmark formula. Enter your
          weight, sex, drinks consumed, and time elapsed since drinking.
        </p>
      </header>

      <div className="calc-grid">
        {/* Input */}
        <section className="card">
          <h2 className="card-title">Your Information</h2>

          <div className="row two">
            <div className="field">
              <label>Sex</label>
              <select value={sex} onChange={e => setSex(e.target.value)}>
                <option value="male">Male (r = 0.68)</option>
                <option value="female">Female (r = 0.55)</option>
              </select>
            </div>
            <div className="field">
              <label>Weight Units</label>
              <select value={units} onChange={e => setUnits(e.target.value)}>
                <option value="us">US (lb)</option>
                <option value="metric">Metric (kg)</option>
              </select>
            </div>
          </div>

          <div className="row">
            {units === "us" ? (
              <div className="field">
                <label>Body Weight (lb)</label>
                <input type="number" min={66} max={500} value={lb}
                  onChange={e => setLb(e.target.value)} />
              </div>
            ) : (
              <div className="field">
                <label>Body Weight (kg)</label>
                <input type="number" min={30} max={230} value={kg}
                  onChange={e => setKg(e.target.value)} />
              </div>
            )}
          </div>

          <div className="row two">
            <div className="field">
              <label>Hours since first drink</label>
              <input type="number" min={0} max={24} value={hours}
                onChange={e => setHours(e.target.value)} />
            </div>
            <div className="field">
              <label>Additional minutes</label>
              <input type="number" min={0} max={59} value={mins}
                onChange={e => setMins(e.target.value)} />
            </div>
          </div>

          <h3 className="card-title" style={{ marginTop: 16 }}>Drinks Consumed</h3>

          {drinks.map((d, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 8, marginBottom: 10, alignItems: "end" }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>Drink Type</label>
                <select value={d.drinkIdx} onChange={e => updateDrink(i, "drinkIdx", e.target.value)}>
                  {DRINK_TYPES.map((dt, di) => <option key={di} value={di}>{dt.label}</option>)}
                </select>
              </div>
              <div className="field" style={{ marginBottom: 0, maxWidth: 72 }}>
                <label>Count</label>
                <input type="number" min={0.5} max={30} step={0.5} value={d.count}
                  onChange={e => updateDrink(i, "count", e.target.value)}
                  style={{ textAlign: "center" }} />
              </div>
              <button onClick={() => removeDrink(i)}
                style={{ padding: "10px 14px", borderRadius: 10, border: "1.5px solid rgba(220,38,38,0.3)", background: "#fff", color: "#dc2626", cursor: "pointer", fontWeight: 700, fontSize: 16, marginBottom: 0, height: "fit-content", alignSelf: "end" }}>
                ×
              </button>
            </div>
          ))}

          <button onClick={addDrink}
            style={{ width: "100%", padding: "10px", borderRadius: 10, border: "1.5px dashed rgba(99,102,241,0.4)", background: "#f8f9ff", color: "#6366f1", cursor: "pointer", fontWeight: 700, fontSize: 14, marginTop: 4 }}>
            + Add Another Drink
          </button>

          <div style={{ marginTop: 12, padding: "10px 14px", background: "#f0eeff", borderRadius: 10, fontSize: 12, color: "#4b5280" }}>
            Total pure alcohol consumed: <strong>{Math.round(totalAlcoholG * 10) / 10}g</strong>
            &nbsp;({Math.round(totalAlcoholG / (14 * 10)) / 10} standard drinks)
          </div>
        </section>

        {/* Results */}
        <section className="card">
          <h2 className="card-title">Results</h2>

          {/* BAC banner */}
          <div style={{
            padding: "18px 20px",
            borderRadius: 14,
            background: impairment.color + "22",
            border: `2px solid ${impairment.color}88`,
            marginBottom: 18,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
              Estimated Blood Alcohol Content
            </div>
            <div style={{ fontSize: 48, fontWeight: 900, color: "#312e81", letterSpacing: "-1px", lineHeight: 1 }}>
              {bac.toFixed(3)}
            </div>
            <div style={{ fontSize: 13, color: "#6b7a9e", marginTop: 4 }}>% BAC (g/100mL)</div>
            <div style={{
              display: "inline-block",
              marginTop: 10,
              padding: "5px 14px",
              borderRadius: 999,
              background: impairment.color,
              color: "#fff",
              fontWeight: 800,
              fontSize: 13,
            }}>
              {impairment.label}
            </div>
          </div>

          <p style={{ fontSize: 13.5, color: "#4b5280", lineHeight: 1.65, marginBottom: 14 }}>
            {impairment.desc}
          </p>

          {/* BAC scale */}
          <div className="scale" style={{ gridTemplateColumns: "2fr 3fr 3fr 6fr 6fr 30fr" }}>
            {[0,1,2,3,4,5].map(i => <span key={i} />)}
          </div>
          <div className="pin" style={{ left: `${pinLeft}%` }} />
          <div className="small" style={{ marginBottom: 12 }}>Scale: 0.000 – 0.300+ % BAC</div>

          <div className="kpi-grid">
            <div className="kpi">
              <div className="kpi-label">Time Until Sober</div>
              <div className="kpi-value">{bac > 0 ? `~${sobHrs}h` : "Sober"}</div>
              <div className="kpi-sub">at ~0.015%/hr elimination</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Legal Limit (US)</div>
              <div className="kpi-value" style={{ color: bac >= 0.08 ? "#dc2626" : "#16a34a" }}>
                {bac >= 0.08 ? "OVER" : "UNDER"}
              </div>
              <div className="kpi-sub">0.08% for drivers</div>
            </div>
          </div>

          <table className="table" style={{ marginTop: 16 }}>
            <thead>
              <tr><th>BAC Level</th><th>Effects</th></tr>
            </thead>
            <tbody>
              {IMPAIRMENT.slice(0, 6).map((imp, i) => (
                <tr key={i} style={bac < imp.max && (i === 0 || bac >= IMPAIRMENT[i-1].max) ? { background: imp.color + "22" } : {}}>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <span style={{ display:"inline-block", width:8, height:8, borderRadius:"50%", background:imp.color, marginRight:6 }} />
                    {i === 0 ? "< 0.020" : `${IMPAIRMENT[i-1].max.toFixed(3)}–${imp.max.toFixed(3)}`}%
                  </td>
                  <td style={{ fontSize: 12 }}>{imp.label}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: 14, padding: "12px 16px", background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 10, fontSize: 12.5, color: "#b91c1c", lineHeight: 1.65 }}>
            <strong>Warning:</strong> This calculator provides estimates only. Never drink and drive.
            Individual BAC varies significantly with food intake, medications, tolerance, and metabolism.
            This tool is not a substitute for a breathalyzer. If impaired — do not drive.
          </div>
        </section>
      </div>
    </div>
  );
}
