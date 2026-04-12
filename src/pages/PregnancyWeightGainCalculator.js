import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../css/CalcBase.css";

/* ── IOM 2009 guidelines ── */
const BMI_CATEGORIES = [
  { label: "Underweight (BMI < 18.5)",       bmiMax: 18.49, single: { min: 28, max: 40 }, twin: { min: 50, max: 62 } },
  { label: "Normal weight (BMI 18.5–24.9)",  bmiMax: 24.99, single: { min: 25, max: 35 }, twin: { min: 37, max: 54 } },
  { label: "Overweight (BMI 25–29.9)",       bmiMax: 29.99, single: { min: 15, max: 25 }, twin: { min: 31, max: 50 } },
  { label: "Obese (BMI ≥ 30)",               bmiMax: 999,   single: { min: 11, max: 20 }, twin: { min: 25, max: 42 } },
];

function getBmiCategory(bmi) {
  return BMI_CATEGORIES.find(c => bmi <= c.bmiMax) || BMI_CATEGORIES[3];
}

// Typical weekly gain by trimester (lb)
const WEEKLY_GAIN = {
  normal:  { t1: 1, t2: 1, t3: 1 },
  under:   { t1: 1.5, t2: 1.5, t3: 1.5 },
  over:    { t1: 0.7, t2: 0.7, t3: 0.7 },
  obese:   { t1: 0.5, t2: 0.5, t3: 0.5 },
};

export default function PregnancyWeightGainCalculator() {
  const [units, setUnits]   = useState("metric");
  const [pregnType, setPregnType] = useState("single");
  const [kg, setKg]         = useState(65);
  const [lb, setLb]         = useState(143);
  const [cm, setCm]         = useState(165);
  const [ft, setFt]         = useState(5);
  const [inch, setInch]     = useState(5);
  const [week, setWeek]     = useState(0); // current gestational week (0 = pre-pregnancy)

  const weightKg = useMemo(() => units === "metric" ? Number(kg) : Number(lb) * 0.453592, [units, kg, lb]);
  const heightM  = useMemo(() => units === "metric"
    ? Number(cm) / 100
    : ((Number(ft) * 12 + Number(inch)) * 2.54) / 100,
    [units, cm, ft, inch]);

  const bmi = useMemo(() => {
    if (!weightKg || !heightM) return 0;
    return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
  }, [weightKg, heightM]);

  const category = useMemo(() => bmi ? getBmiCategory(bmi) : null, [bmi]);
  const rec = useMemo(() => category ? category[pregnType] : null, [category, pregnType]);

  // Recommended gain at current week (lb) — simplified linear model
  const gainAtWeek = useMemo(() => {
    if (!rec || !week) return null;
    const w = Number(week);
    const totalMidpoint = (rec.min + rec.max) / 2;
    // ~20% in first trimester (13 wks), ~80% in remainder
    if (w <= 13) return Math.round((totalMidpoint * 0.2 / 13) * w * 10) / 10;
    return Math.round((totalMidpoint * 0.2 + (totalMidpoint * 0.8 / 27) * (w - 13)) * 10) / 10;
  }, [rec, week]);

  const lbToKg = (v) => Math.round(v * 0.453592 * 10) / 10;

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Pregnancy Weight Gain Calculator</h1>
        <p className="muted">
          Find out how much weight you should gain during pregnancy based on your
          pre-pregnancy BMI and current gestational week, per IOM 2009 guidelines.
        </p>
      </header>

      <div style={{ maxWidth:780, margin:"0 auto", display:"flex", flexDirection:"column", gap:20 }}>
        <div className="calc-grid" style={{ maxWidth:"none" }}>
          <section className="card">
            <h2 className="card-title">Your Information</h2>

            <div className="row two">
              <div className="field">
                <label>Units</label>
                <select value={units} onChange={e => setUnits(e.target.value)}>
                  <option value="metric">Metric (kg / cm)</option>
                  <option value="us">US (lb / ft-in)</option>
                </select>
              </div>
              <div className="field">
                <label>Pregnancy Type</label>
                <select value={pregnType} onChange={e => setPregnType(e.target.value)}>
                  <option value="single">Single (one baby)</option>
                  <option value="twin">Twins</option>
                </select>
              </div>
            </div>

            {units === "metric" ? (
              <div className="row two">
                <div className="field">
                  <label>Pre-pregnancy Weight (kg)</label>
                  <input type="number" min={30} max={300} value={kg} onChange={e => setKg(e.target.value)} />
                </div>
                <div className="field">
                  <label>Height (cm)</label>
                  <input type="number" min={100} max={250} value={cm} onChange={e => setCm(e.target.value)} />
                </div>
              </div>
            ) : (
              <>
                <div className="row two">
                  <div className="field">
                    <label>Pre-pregnancy Weight (lb)</label>
                    <input type="number" min={66} max={660} value={lb} onChange={e => setLb(e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Height (ft)</label>
                    <input type="number" min={3} max={8} value={ft} onChange={e => setFt(e.target.value)} />
                  </div>
                </div>
                <div className="row">
                  <div className="field">
                    <label>Height (in)</label>
                    <input type="number" min={0} max={11} value={inch} onChange={e => setInch(e.target.value)} />
                  </div>
                </div>
              </>
            )}

            <div className="row">
              <div className="field">
                <label>Current Gestational Week (0 = pre-pregnancy)</label>
                <input type="number" min={0} max={42} value={week} onChange={e => setWeek(e.target.value)} />
              </div>
            </div>
          </section>

          <section className="card">
            <h2 className="card-title">Results</h2>

            {bmi && category ? (
              <>
                <div className="kpi-grid">
                  <div className="kpi">
                    <div className="kpi-label">Pre-pregnancy BMI</div>
                    <div className="kpi-value">{bmi}</div>
                    <div className="kpi-sub">kg/m²</div>
                  </div>
                  <div className="kpi">
                    <div className="kpi-label">BMI Category</div>
                    <div className="kpi-value" style={{ fontSize:15 }}>{category.label.split("(")[0].trim()}</div>
                    <div className="kpi-sub">{pregnType === "twin" ? "Twin pregnancy" : "Singleton"}</div>
                  </div>
                </div>

                <div className="bar-title" style={{ marginTop:14 }}>
                  Recommended Total Weight Gain: <strong>{rec.min}–{rec.max} lb ({lbToKg(rec.min)}–{lbToKg(rec.max)} kg)</strong>
                </div>

                {gainAtWeek !== null && Number(week) > 0 && (
                  <div style={{ marginTop:12, padding:"12px 16px", background:"#f0eeff", borderRadius:10, fontSize:14, color:"#4f46e5", fontWeight:700 }}>
                    At week {week}: recommended gain ≈ <strong>{gainAtWeek} lb ({lbToKg(gainAtWeek)} kg)</strong>
                  </div>
                )}

                <table className="table" style={{ marginTop:16 }}>
                  <thead>
                    <tr><th>Trimester</th><th>Period</th><th>Approx. Gain</th></tr>
                  </thead>
                  <tbody>
                    <tr><td>1st Trimester</td><td>Weeks 1–13</td><td>1–4.5 lb (0.5–2 kg)</td></tr>
                    <tr><td>2nd Trimester</td><td>Weeks 14–26</td><td>~1 lb/week</td></tr>
                    <tr><td>3rd Trimester</td><td>Weeks 27–40</td><td>~1 lb/week</td></tr>
                  </tbody>
                </table>
              </>
            ) : (
              <p className="small">Enter your pre-pregnancy weight and height to see recommendations.</p>
            )}
          </section>
        </div>

        <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
          <span style={{ fontSize:13, fontWeight:700, color:"#6b7a9e" }}>Related:</span>
          {[
            { label:"Pregnancy Calculator",   to:"/pregnancy" },
            { label:"Due Date Calculator",    to:"/due-date" },
            { label:"BMI Calculator",         to:"/bmi" },
          ].map(({ label, to }) => (
            <Link key={to} to={to}
              style={{ padding:"7px 16px", borderRadius:999, border:"1.5px solid rgba(99,102,241,0.28)", fontSize:13, fontWeight:600, color:"#4f46e5", textDecoration:"none", background:"#f5f3ff" }}>
              {label}
            </Link>
          ))}
        </div>

        <section className="card" style={{ lineHeight:1.75, color:"#374151", fontSize:14 }}>
          <h2 className="card-title">IOM Pregnancy Weight Gain Guidelines</h2>
          <p>
            The Institute of Medicine (IOM) 2009 guidelines recommend different amounts of total weight
            gain depending on your pre-pregnancy Body Mass Index (BMI).
          </p>
          <table className="table" style={{ marginTop:14 }}>
            <thead>
              <tr><th>Pre-pregnancy BMI</th><th>Single Baby (lb)</th><th>Twins (lb)</th></tr>
            </thead>
            <tbody>
              <tr><td>Underweight (&lt; 18.5)</td><td>28–40 lb</td><td>50–62 lb</td></tr>
              <tr><td>Normal (18.5–24.9)</td><td>25–35 lb</td><td>37–54 lb</td></tr>
              <tr><td>Overweight (25–29.9)</td><td>15–25 lb</td><td>31–50 lb</td></tr>
              <tr><td>Obese (≥ 30)</td><td>11–20 lb</td><td>25–42 lb</td></tr>
            </tbody>
          </table>
          <p style={{ marginTop:14, padding:"12px 16px", background:"#f0eeff", borderRadius:10, fontSize:13, color:"#4b5280" }}>
            <strong>Note:</strong> These are general recommendations. Always consult your healthcare
            provider for personalized guidance during pregnancy.
          </p>
        </section>
      </div>
    </div>
  );
}
