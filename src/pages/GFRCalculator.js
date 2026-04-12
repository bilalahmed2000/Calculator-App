import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

/* ── CKD Staging ── */
const CKD_STAGES = [
  { stage: "G1",  min: 90,  max: Infinity, label: "Normal or High",                     color: "#4ade80", risk: "Normal kidney function. Monitor if underlying kidney disease present." },
  { stage: "G2",  min: 60,  max: 89,       label: "Mildly Decreased",                   color: "#a3e635", risk: "Mildly reduced. Usually no symptoms. Regular monitoring recommended." },
  { stage: "G3a", min: 45,  max: 59,       label: "Mildly to Moderately Decreased",     color: "#facc15", risk: "Moderate reduction. Increased risk of cardiovascular disease." },
  { stage: "G3b", min: 30,  max: 44,       label: "Moderately to Severely Decreased",   color: "#fb923c", risk: "Significant reduction. Symptoms may begin. Specialist referral advised." },
  { stage: "G4",  min: 15,  max: 29,       label: "Severely Decreased",                 color: "#f87171", risk: "Severe reduction. Preparation for kidney replacement therapy." },
  { stage: "G5",  min: 0,   max: 14,       label: "Kidney Failure",                     color: "#e879f9", risk: "Kidney failure. Dialysis or kidney transplant required." },
];

function getStage(egfr) {
  return CKD_STAGES.find(s => egfr >= s.min && egfr < (s.max === Infinity ? Infinity : s.max + 1))
    || CKD_STAGES[CKD_STAGES.length - 1];
}

/* ── Formulas ── */
// CKD-EPI 2021 (race-free) — NKF/ASN 2021
function ckdEpi2021(sex, age, scr) {
  const kappa = sex === "female" ? 0.7 : 0.9;
  const alpha = sex === "female" ? -0.241 : -0.302;
  const sexFactor = sex === "female" ? 1.012 : 1.0;
  const ratio = scr / kappa;
  const val = 142
    * Math.pow(Math.min(ratio, 1), alpha)
    * Math.pow(Math.max(ratio, 1), -1.200)
    * Math.pow(0.9938, age)
    * sexFactor;
  return Math.round(val * 10) / 10;
}

// MDRD (4-variable)
function mdrd(sex, age, scr) {
  const sexFactor = sex === "female" ? 0.742 : 1.0;
  const val = 175 * Math.pow(scr, -1.154) * Math.pow(age, -0.203) * sexFactor;
  return Math.round(val * 10) / 10;
}

// Cockcroft-Gault (estimates CrCl, not eGFR, but commonly used)
function cockcroftGault(sex, age, weightKg, scr) {
  const sexFactor = sex === "female" ? 0.85 : 1.0;
  const val = ((140 - age) * weightKg) / (72 * scr) * sexFactor;
  return Math.round(val * 10) / 10;
}

export default function GFRCalculator() {
  const [sex, setSex]         = useState("male");
  const [age, setAge]         = useState(45);
  const [units, setUnits]     = useState("metric");
  const [kg, setKg]           = useState(70);
  const [lb, setLb]           = useState(154);
  const [creatUnits, setCreatUnits] = useState("mg"); // "mg" = mg/dL, "umol" = μmol/L
  const [creatinine, setCreatinine] = useState(1.0);

  const weightKg = useMemo(
    () => units === "metric" ? Number(kg) : Number(lb) * 0.453592,
    [units, kg, lb]
  );

  // Convert creatinine to mg/dL for formulas
  const scrMgDl = useMemo(() => {
    const v = Number(creatinine);
    return creatUnits === "umol" ? v / 88.42 : v;
  }, [creatinine, creatUnits]);

  const a = Number(age);

  const results = useMemo(() => {
    if (!scrMgDl || scrMgDl <= 0 || !a || !weightKg) return null;
    return {
      ckdEpi: ckdEpi2021(sex, a, scrMgDl),
      mdrd:   mdrd(sex, a, scrMgDl),
      cg:     cockcroftGault(sex, a, weightKg, scrMgDl),
    };
  }, [sex, a, scrMgDl, weightKg]);

  const stage = useMemo(() => results ? getStage(results.ckdEpi) : null, [results]);

  const normalRange = creatUnits === "mg"
    ? (sex === "male" ? "0.7–1.2 mg/dL" : "0.5–1.0 mg/dL")
    : (sex === "male" ? "62–106 μmol/L" : "44–88 μmol/L");

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>GFR Calculator</h1>
        <p className="muted">
          Estimate your Glomerular Filtration Rate (eGFR) — the best overall measure of kidney
          function — using the CKD-EPI 2021, MDRD, and Cockcroft-Gault equations.
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
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div className="field">
              <label>Age (years)</label>
              <input type="number" min={18} max={110} value={age}
                onChange={e => setAge(e.target.value)} />
            </div>
          </div>

          <div className="row two">
            <div className="field">
              <label>Weight Units</label>
              <select value={units} onChange={e => setUnits(e.target.value)}>
                <option value="metric">Metric (kg)</option>
                <option value="us">US (lb)</option>
              </select>
            </div>
            {units === "metric" ? (
              <div className="field">
                <label>Weight (kg)</label>
                <input type="number" min={30} max={300} value={kg}
                  onChange={e => setKg(e.target.value)} />
              </div>
            ) : (
              <div className="field">
                <label>Weight (lb)</label>
                <input type="number" min={66} max={660} value={lb}
                  onChange={e => setLb(e.target.value)} />
              </div>
            )}
          </div>

          <div className="row two">
            <div className="field">
              <label>Creatinine Units</label>
              <select value={creatUnits} onChange={e => setCreatUnits(e.target.value)}>
                <option value="mg">mg/dL</option>
                <option value="umol">μmol/L</option>
              </select>
            </div>
            <div className="field">
              <label>Serum Creatinine ({creatUnits === "mg" ? "mg/dL" : "μmol/L"})</label>
              <input
                type="number"
                min={creatUnits === "mg" ? 0.1 : 8}
                max={creatUnits === "mg" ? 30 : 2650}
                step={creatUnits === "mg" ? 0.1 : 1}
                value={creatinine}
                onChange={e => setCreatinine(e.target.value)}
              />
            </div>
          </div>

          <p className="small" style={{ marginTop: 4 }}>
            Normal creatinine: <strong>{normalRange}</strong>. Values from a standard blood test (CMP or BMP).
          </p>

          <table className="table" style={{ marginTop: 16 }}>
            <thead>
              <tr><th>Equation</th><th>Best Used For</th></tr>
            </thead>
            <tbody>
              <tr><td><strong>CKD-EPI 2021</strong></td><td>Current standard; race-free; most accurate for adults</td></tr>
              <tr><td><strong>MDRD</strong></td><td>Historical standard; less accurate at higher GFR</td></tr>
              <tr><td><strong>Cockcroft-Gault</strong></td><td>Drug dosing; estimates creatinine clearance (CrCl)</td></tr>
            </tbody>
          </table>
        </section>

        {/* Results */}
        <section className="card">
          <h2 className="card-title">Results</h2>

          {results && stage ? (
            <>
              {/* Stage banner */}
              <div style={{
                padding: "16px 20px",
                borderRadius: 14,
                background: stage.color + "22",
                border: `2px solid ${stage.color}88`,
                marginBottom: 18,
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>
                  CKD Stage (CKD-EPI 2021)
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: "#312e81", letterSpacing: "-0.5px" }}>
                  Stage {stage.stage} — {stage.label}
                </div>
                <div style={{ fontSize: 13, color: "#4b5280", marginTop: 6, lineHeight: 1.5 }}>
                  {stage.risk}
                </div>
              </div>

              <div className="kpi-grid">
                <div className="kpi">
                  <div className="kpi-label">CKD-EPI 2021 eGFR</div>
                  <div className="kpi-value">{results.ckdEpi}</div>
                  <div className="kpi-sub">mL/min/1.73 m²</div>
                </div>
                <div className="kpi">
                  <div className="kpi-label">MDRD eGFR</div>
                  <div className="kpi-value">{results.mdrd}</div>
                  <div className="kpi-sub">mL/min/1.73 m²</div>
                </div>
              </div>

              <div className="kpi" style={{ marginTop: 10 }}>
                <div className="kpi-label">Cockcroft-Gault CrCl</div>
                <div className="kpi-value">{results.cg}</div>
                <div className="kpi-sub">mL/min (used for drug dosing)</div>
              </div>

              {/* CKD stage bar */}
              <h3 className="card-title" style={{ marginTop: 18 }}>CKD Staging Reference</h3>
              <table className="table">
                <thead>
                  <tr><th>Stage</th><th>eGFR</th><th>Description</th></tr>
                </thead>
                <tbody>
                  {CKD_STAGES.map(s => (
                    <tr key={s.stage}
                      style={s.stage === stage.stage ? { background: stage.color + "22" } : {}}>
                      <td>
                        <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: s.color, marginRight: 6 }} />
                        <strong>{s.stage}</strong>
                      </td>
                      <td>{s.max === Infinity ? "≥ 90" : `${s.min}–${s.max}`}</td>
                      <td style={{ fontSize: 12 }}>{s.label}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          ) : (
            <p className="small">Enter your information to calculate your eGFR.</p>
          )}

          <p className="small" style={{ marginTop: 12 }}>
            <strong>Important:</strong> This calculator is for informational purposes only. eGFR
            should be interpreted by a healthcare professional alongside other clinical information.
            A single eGFR value does not diagnose CKD — diagnosis requires persistently low eGFR
            for ≥ 3 months.
          </p>
        </section>
      </div>
    </div>
  );
}
