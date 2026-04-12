import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

/* ─── helpers ─── */
function cmToFtIn(cm) {
  const totalIn = cm / 2.54;
  const ft = Math.floor(totalIn / 12);
  const inch = Math.round(totalIn % 12 * 10) / 10;
  return { ft, inch };
}
function ftInToCm(ft, inch) {
  return (parseFloat(ft) * 12 + parseFloat(inch)) * 2.54;
}
function fmt1(v) { return isFinite(v) ? v.toFixed(1) : "—"; }
function fmtFtIn(cm) {
  const { ft, inch } = cmToFtIn(cm);
  return `${ft}′ ${inch}″`;
}

/* ─── CDC 50th-percentile heights (cm) by age for boys and girls ─── */
// Ages 2–20 step 1 year — 50th percentile from CDC 2000 growth charts
const CDC50_BOYS = {
   2:87.1,  3:95.3,  4:102.3, 5:109.2, 6:115.6, 7:121.7, 8:127.3,
   9:132.6, 10:137.5,11:143.5,12:149.1,13:156.2,14:163.8,15:170.1,
  16:173.4, 17:175.3,18:176.5,19:177.0,20:177.0
};
const CDC50_GIRLS = {
   2:86.0,  3:94.4,  4:101.3, 5:108.3, 6:115.0, 7:120.9, 8:126.6,
   9:132.4,10:138.2, 11:144.2,12:149.9,13:156.7,14:159.7,15:161.8,
  16:162.4, 17:162.9,18:163.1,19:163.2,20:163.2
};
// Adult 50th percentile at age 20
const ADULT50 = { male: 177.0, female: 163.2 };
// Approximate SD at adult (age 20)
const ADULT_SD = { male: 7.6, female: 6.4 };

/* ─── Khamis-Roche coefficients [b0, b1_ht, b2_wt, b3_midpar, SE] ─── */
// Source: Khamis & Roche (1994). Ages 4–17.5 by 0.5 yr
const KR_BOYS = {
   4.0:[9.490,0.670,0.145,0.219,2.704], 4.5:[4.840,0.691,0.165,0.212,2.526],
   5.0:[10.522,0.651,0.157,0.187,2.361],5.5:[7.773,0.651,0.170,0.211,2.184],
   6.0:[12.147,0.622,0.149,0.191,2.059],6.5:[7.602,0.646,0.148,0.199,1.939],
   7.0:[7.064,0.638,0.165,0.213,1.832], 7.5:[11.476,0.601,0.157,0.212,1.721],
   8.0:[11.461,0.584,0.175,0.212,1.627],8.5:[10.484,0.600,0.159,0.192,1.533],
   9.0:[10.111,0.606,0.169,0.182,1.454],9.5:[9.258,0.617,0.173,0.162,1.376],
  10.0:[9.021,0.619,0.160,0.165,1.316],10.5:[10.476,0.603,0.158,0.159,1.254],
  11.0:[9.551,0.615,0.149,0.140,1.212],11.5:[11.036,0.601,0.137,0.131,1.175],
  12.0:[13.454,0.572,0.128,0.134,1.148],12.5:[14.069,0.566,0.117,0.132,1.127],
  13.0:[16.234,0.547,0.124,0.115,1.115],13.5:[20.564,0.509,0.111,0.104,1.097],
  14.0:[18.647,0.532,0.103,0.095,1.093],14.5:[22.119,0.507,0.089,0.081,1.085],
  15.0:[28.117,0.471,0.069,0.069,1.085],15.5:[30.952,0.457,0.055,0.057,1.089],
  16.0:[39.905,0.396,0.037,0.050,1.101],16.5:[33.851,0.446,0.027,0.041,1.126],
  17.0:[30.993,0.464,0.015,0.044,1.158],17.5:[25.786,0.507,0.007,0.046,1.174],
};
const KR_GIRLS = {
   4.0:[1.153,0.715,0.102,0.245,2.694], 4.5:[5.107,0.682,0.091,0.227,2.469],
   5.0:[4.360,0.688,0.083,0.228,2.270], 5.5:[6.266,0.670,0.086,0.221,2.101],
   6.0:[10.540,0.636,0.076,0.213,1.954],6.5:[12.024,0.624,0.072,0.198,1.827],
   7.0:[13.022,0.611,0.085,0.194,1.714],7.5:[15.000,0.600,0.079,0.183,1.617],
   8.0:[14.986,0.600,0.073,0.182,1.536],8.5:[13.568,0.611,0.074,0.183,1.450],
   9.0:[11.829,0.628,0.074,0.187,1.377],9.5:[10.832,0.635,0.065,0.181,1.302],
  10.0:[11.050,0.626,0.066,0.178,1.239],10.5:[10.940,0.629,0.059,0.161,1.183],
  11.0:[12.484,0.608,0.064,0.145,1.145],11.5:[12.040,0.611,0.050,0.146,1.109],
  12.0:[18.344,0.551,0.044,0.145,1.073],12.5:[22.018,0.519,0.032,0.136,1.058],
  13.0:[29.099,0.455,0.023,0.132,1.050],13.5:[35.538,0.399,0.012,0.134,1.055],
  14.0:[40.948,0.354,0.007,0.142,1.064],14.5:[42.956,0.341,0.001,0.148,1.073],
  15.0:[42.837,0.341,-0.002,0.157,1.078],15.5:[44.825,0.327,-0.005,0.162,1.081],
  16.0:[46.031,0.318,-0.006,0.166,1.085],
};

function getKRCoeffs(age, gender) {
  const table = gender === "male" ? KR_BOYS : KR_GIRLS;
  // Round to nearest 0.5
  const rounded = Math.round(age * 2) / 2;
  const maxAge = gender === "male" ? 17.5 : 16.0;
  const clampedAge = Math.min(Math.max(rounded, 4.0), maxAge);
  return table[clampedAge] ?? null;
}

/* ─── CDC percentile (normal approx): given height at age → percentile ─── */
// Using LMS method approximated by mean±SD. SD varies by age ~3.5cm for ages 4-10, ~5cm for teens
function getPercentile(heightCm, ageFull, gender) {
  const ageInt = Math.round(ageFull);
  const cdc50 = gender === "male" ? CDC50_BOYS : CDC50_GIRLS;
  const mean = cdc50[Math.min(Math.max(ageInt, 2), 20)];
  if (!mean) return null;
  // Approximate SD ~ 5cm children, 6.5cm teen boys, 5.5cm teen girls
  const sd = (ageInt >= 13 && gender === "male") ? 6.8 : (ageInt >= 11 && gender === "female") ? 5.8 : 5.0;
  const z = (heightCm - mean) / sd;
  // Normal CDF
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.8212560 + t * 1.3302745))));
  const cdf = z >= 0 ? 1 - p : p;
  return Math.round(cdf * 100);
}

/* ─── average height table (adult 19–25 yo) by country ─── */
const AVG_HEIGHTS = [
  ["Netherlands",   183.8, 171.1],
  ["Montenegro",    183.2, 169.4],
  ["Denmark",       181.9, 167.2],
  ["Norway",        181.7, 167.0],
  ["Germany",       180.6, 166.3],
  ["Sweden",        179.9, 166.1],
  ["Australia",     179.2, 165.5],
  ["United States", 177.1, 163.5],
  ["United Kingdom",177.0, 163.7],
  ["Canada",        177.0, 163.9],
  ["France",        176.5, 163.0],
  ["Brazil",        173.5, 160.9],
  ["Japan",         172.0, 158.8],
  ["China",         171.8, 159.7],
  ["India",         165.3, 152.6],
];

export default function HeightCalculator() {
  const [tab, setTab] = useState("predictor");

  /* ── Predictor inputs ── */
  const [gender, setGender]     = useState("male");
  const [ageYrs, setAgeYrs]     = useState("10");
  const [ageMos, setAgeMos]     = useState("0");
  const [unit, setUnit]         = useState("cm");        // child height unit
  const [htCm, setHtCm]         = useState("140");
  const [htFt, setHtFt]         = useState("4");
  const [htIn, setHtIn]         = useState("7");
  const [wtUnit, setWtUnit]     = useState("kg");
  const [weight, setWeight]     = useState("32");
  const [dadUnit, setDadUnit]   = useState("cm");
  const [dadCm, setDadCm]       = useState("178");
  const [dadFt, setDadFt]       = useState("5"); const [dadIn, setDadIn] = useState("10");
  const [momUnit, setMomUnit]   = useState("cm");
  const [momCm, setMomCm]       = useState("165");
  const [momFt, setMomFt]       = useState("5"); const [momIn, setMomIn] = useState("5");

  /* ── Converter inputs ── */
  const [cvFrom, setCvFrom]     = useState("cm");
  const [cvCm, setCvCm]         = useState("175");
  const [cvFt, setCvFt]         = useState("5");
  const [cvIn, setCvIn]         = useState("9");
  const [cvM, setCvM]           = useState("1.75");

  /* ─── Predictor calculation ─── */
  const predictResult = useMemo(() => {
    const age = parseFloat(ageYrs) + parseFloat(ageMos || 0) / 12;
    const childHt = unit === "cm" ? parseFloat(htCm) : ftInToCm(htFt, htIn);
    const wtKg    = wtUnit === "kg" ? parseFloat(weight) : parseFloat(weight) * 0.453592;
    const dadHt   = dadUnit === "cm" ? parseFloat(dadCm) : ftInToCm(dadFt, dadIn);
    const momHt   = momUnit === "cm" ? parseFloat(momCm) : ftInToCm(momFt, momIn);

    if ([age, childHt, dadHt, momHt].some(v => isNaN(v) || v <= 0)) return null;
    if (age < 2 || age > 18) return null;

    // Mid-Parental Height
    const midpar = gender === "male"
      ? (dadHt + momHt + 13) / 2
      : (dadHt + momHt - 13) / 2;
    const mph = { pred: midpar, low: midpar - 8.5, high: midpar + 8.5 };

    // Khamis-Roche (requires age 4–17.5, weight)
    let kr = null;
    if (age >= 4 && !isNaN(wtKg) && wtKg > 0) {
      const coeffs = getKRCoeffs(age, gender);
      if (coeffs) {
        const [b0, b1, b2, b3, se] = coeffs;
        const pred = b0 + b1 * childHt + b2 * wtKg + b3 * midpar;
        kr = { pred, low: pred - se * 1.645, high: pred + se * 1.645 };
      }
    }

    // CDC projection (same percentile at adult)
    const pct = getPercentile(childHt, age, gender);
    let cdcProj = null;
    if (pct !== null) {
      const adultSd = ADULT_SD[gender];
      const adultMean = ADULT50[gender];
      // Back-convert percentile to z, then apply to adult distribution
      const z = pct === 50 ? 0 : (pct > 50 ? 1 : -1) * Math.sqrt(2) * erfInv(Math.abs(pct / 100 - 0.5) * 2);
      const adultHt = adultMean + z * adultSd;
      cdcProj = { pred: adultHt, pct };
    }

    const heightPctile = getPercentile(childHt, age, gender);

    return { mph, kr, cdcProj, heightPctile, childHt, age, gender };
  }, [gender, ageYrs, ageMos, unit, htCm, htFt, htIn, wtUnit, weight, dadUnit, dadCm, dadFt, dadIn, momUnit, momCm, momFt, momIn]);

  /* ─── Converter ─── */
  const cvResult = useMemo(() => {
    let cm;
    if (cvFrom === "cm")       cm = parseFloat(cvCm);
    else if (cvFrom === "ftIn") cm = ftInToCm(cvFt, cvIn);
    else                        cm = parseFloat(cvM) * 100;
    if (isNaN(cm) || cm <= 0) return null;
    const { ft, inch } = cmToFtIn(cm);
    return { cm, ft, inch, m: cm / 100 };
  }, [cvFrom, cvCm, cvFt, cvIn, cvM]);

  const HEIGHT_INPUT = (u, setU, cm, setCm, ft, setFt, inch, setIn, label) => (
    <div className="field">
      <label style={{ display: "flex", justifyContent: "space-between" }}>
        <span>{label}</span>
        <select value={u} onChange={e => setU(e.target.value)} style={{ fontSize: 12, padding: "2px 4px", marginBottom: 0 }}>
          <option value="cm">cm</option>
          <option value="ftIn">ft / in</option>
        </select>
      </label>
      {u === "cm"
        ? <input type="number" min="0" value={cm} onChange={e => setCm(e.target.value)} placeholder="cm" />
        : <div style={{ display: "flex", gap: 6 }}>
            <input type="number" min="0" value={ft}   onChange={e => setFt(e.target.value)}  placeholder="ft" style={{ width: "50%" }} />
            <input type="number" min="0" max="11.9" value={inch} onChange={e => setIn(e.target.value)} placeholder="in" style={{ width: "50%" }} />
          </div>
      }
    </div>
  );

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Height Calculator</h1>
        <p className="muted">
          Predict a child's adult height using Mid-Parental and Khamis-Roche methods,
          convert between height units, and compare against average heights worldwide.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Mode</h2>

          <div className="tab-row">
            <button className={`tab-btn${tab === "predictor" ? " active" : ""}`} onClick={() => setTab("predictor")}>Height Predictor</button>
            <button className={`tab-btn${tab === "converter" ? " active" : ""}`} onClick={() => setTab("converter")}>Unit Converter</button>
          </div>

          {tab === "predictor" && (
            <>
              <p className="small">Predict a child's adult height based on current measurements and parent heights.</p>

              <div className="row two">
                <div className="field">
                  <label>Child's Gender</label>
                  <select value={gender} onChange={e => setGender(e.target.value)}>
                    <option value="male">Boy</option>
                    <option value="female">Girl</option>
                  </select>
                </div>
                <div className="field">
                  <label>Child's Age</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    <input type="number" min="2" max="18" value={ageYrs} onChange={e => setAgeYrs(e.target.value)} placeholder="yrs" style={{ width: "50%" }} />
                    <input type="number" min="0" max="11" value={ageMos} onChange={e => setAgeMos(e.target.value)} placeholder="mo" style={{ width: "50%" }} />
                  </div>
                  <span className="small">Years &nbsp;·&nbsp; Months (age 2–18)</span>
                </div>
              </div>

              <div className="row two">
                {HEIGHT_INPUT(unit, setUnit, htCm, setHtCm, htFt, setHtFt, htIn, setHtIn, "Child's Current Height")}
                <div className="field">
                  <label style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Child's Weight</span>
                    <select value={wtUnit} onChange={e => setWtUnit(e.target.value)} style={{ fontSize: 12, padding: "2px 4px" }}>
                      <option value="kg">kg</option>
                      <option value="lb">lb</option>
                    </select>
                  </label>
                  <input type="number" min="0" value={weight} onChange={e => setWeight(e.target.value)} placeholder={wtUnit} />
                  <span className="small">Required for Khamis-Roche</span>
                </div>
              </div>

              <div className="row two">
                {HEIGHT_INPUT(dadUnit, setDadUnit, dadCm, setDadCm, dadFt, setDadFt, dadIn, setDadIn, "Father's Height")}
                {HEIGHT_INPUT(momUnit, setMomUnit, momCm, setMomCm, momFt, setMomFt, momIn, setMomIn, "Mother's Height")}
              </div>

              {predictResult && (
                <>
                  <div style={{ marginTop: 14, padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 10 }}>
                      Predicted Adult Height
                    </div>
                    {predictResult.kr ? (
                      <>
                        <div style={{ fontSize: 36, fontWeight: 900, color: "#4f46e5" }}>
                          {fmt1(predictResult.kr.pred)} cm &nbsp; <span style={{ fontSize: 20 }}>{fmtFtIn(predictResult.kr.pred)}</span>
                        </div>
                        <div style={{ fontSize: 13, color: "#6b7a9e", marginTop: 4 }}>
                          Khamis-Roche 90% range: {fmt1(predictResult.kr.low)} – {fmt1(predictResult.kr.high)} cm
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: 36, fontWeight: 900, color: "#4f46e5" }}>
                          {fmt1(predictResult.mph.pred)} cm &nbsp; <span style={{ fontSize: 20 }}>{fmtFtIn(predictResult.mph.pred)}</span>
                        </div>
                        <div style={{ fontSize: 13, color: "#6b7a9e", marginTop: 4 }}>
                          Mid-Parental range: {fmt1(predictResult.mph.low)} – {fmt1(predictResult.mph.high)} cm
                          {predictResult.age < 4 && " · Add weight for Khamis-Roche method"}
                        </div>
                      </>
                    )}
                  </div>

                  {predictResult.heightPctile !== null && (
                    <div style={{ marginTop: 10, padding: "12px 16px", background: "#f8f9ff", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 13, color: "#374151" }}>
                      Current height <strong>{fmt1(predictResult.childHt)} cm</strong> is at approximately the <strong>{predictResult.heightPctile}th percentile</strong> for {gender === "male" ? "boys" : "girls"} aged {ageYrs} years on the CDC growth chart.
                    </div>
                  )}
                </>
              )}

              {!predictResult && (
                <p className="small" style={{ marginTop: 12 }}>Enter child's age (2–18), height, and both parent heights to predict adult height.</p>
              )}
            </>
          )}

          {tab === "converter" && (
            <>
              <p className="small">Convert height between centimeters, feet & inches, and meters.</p>

              <div className="row">
                <div className="field">
                  <label>Input Unit</label>
                  <select value={cvFrom} onChange={e => setCvFrom(e.target.value)}>
                    <option value="cm">Centimeters (cm)</option>
                    <option value="ftIn">Feet & Inches (ft, in)</option>
                    <option value="m">Meters (m)</option>
                  </select>
                </div>
              </div>

              {cvFrom === "cm" && (
                <div className="row"><div className="field"><label>Height (cm)</label><input type="number" min="0" value={cvCm} onChange={e => setCvCm(e.target.value)} /></div></div>
              )}
              {cvFrom === "ftIn" && (
                <div className="row two">
                  <div className="field"><label>Feet</label><input type="number" min="0" value={cvFt} onChange={e => setCvFt(e.target.value)} /></div>
                  <div className="field"><label>Inches</label><input type="number" min="0" max="11.9" step="0.1" value={cvIn} onChange={e => setCvIn(e.target.value)} /></div>
                </div>
              )}
              {cvFrom === "m" && (
                <div className="row"><div className="field"><label>Height (m)</label><input type="number" min="0" step="0.01" value={cvM} onChange={e => setCvM(e.target.value)} /></div></div>
              )}

              {cvResult && (
                <div style={{ marginTop: 14 }}>
                  <div className="kpi-grid">
                    <div className="kpi"><div className="kpi-label">Centimeters</div><div className="kpi-value">{fmt1(cvResult.cm)} cm</div></div>
                    <div className="kpi"><div className="kpi-label">Meters</div><div className="kpi-value">{cvResult.m.toFixed(3)} m</div></div>
                    <div className="kpi"><div className="kpi-label">Feet & Inches</div><div className="kpi-value">{cvResult.ft}′ {cvResult.inch}″</div></div>
                    <div className="kpi"><div className="kpi-label">Inches only</div><div className="kpi-value">{fmt1(cvResult.cm / 2.54)}″</div></div>
                  </div>
                </div>
              )}

              <h3 className="card-title" style={{ marginTop: 16 }}>Quick Reference</h3>
              <table className="table">
                <thead><tr><th>cm</th><th>ft &amp; in</th><th>m</th></tr></thead>
                <tbody>
                  {[150,155,160,163,165,170,175,177,180,183,185,190,195,200].map(c => {
                    const { ft, inch } = cmToFtIn(c);
                    const highlighted = cvResult && Math.abs(cvResult.cm - c) < 3;
                    return (
                      <tr key={c} style={highlighted ? { background: "#f0eeff" } : {}}>
                        <td style={{ fontFamily: "monospace", fontWeight: highlighted ? 800 : 400, color: highlighted ? "#4f46e5" : undefined }}>{c}</td>
                        <td style={{ fontFamily: "monospace", fontWeight: highlighted ? 800 : 400, color: highlighted ? "#4f46e5" : undefined }}>{ft}′ {inch}″</td>
                        <td style={{ fontFamily: "monospace", fontWeight: highlighted ? 800 : 400, color: highlighted ? "#4f46e5" : undefined }}>{(c / 100).toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">Results</h2>

          {tab === "predictor" && predictResult && (
            <table className="table" style={{ marginBottom: 14 }}>
              <thead><tr><th>Method</th><th>Predicted Height</th><th>Range</th></tr></thead>
              <tbody>
                <tr style={{ background: "#f0eeff" }}>
                  <td><strong>Khamis-Roche</strong> {!predictResult.kr && <span style={{ fontSize: 11, color: "#9ca3af" }}>(n/a)</span>}</td>
                  <td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>
                    {predictResult.kr ? `${fmt1(predictResult.kr.pred)} cm / ${fmtFtIn(predictResult.kr.pred)}` : "Need age 4+ & weight"}
                  </td>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>
                    {predictResult.kr ? `${fmt1(predictResult.kr.low)}–${fmt1(predictResult.kr.high)} cm` : "—"}
                  </td>
                </tr>
                <tr>
                  <td><strong>Mid-Parental</strong></td>
                  <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{fmt1(predictResult.mph.pred)} cm / {fmtFtIn(predictResult.mph.pred)}</td>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{fmt1(predictResult.mph.low)}–{fmt1(predictResult.mph.high)} cm</td>
                </tr>
              </tbody>
            </table>
          )}

          {tab === "predictor" && !predictResult && (
            <p className="small">Enter child details and parent heights to see prediction.</p>
          )}

          {tab === "converter" && cvResult && (
            <table className="table" style={{ marginBottom: 14 }}>
              <thead><tr><th>Unit</th><th>Value</th></tr></thead>
              <tbody>
                <tr style={{ background: "#f0eeff" }}><td><strong>Centimeters</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmt1(cvResult.cm)} cm</td></tr>
                <tr><td>Meters</td><td style={{ fontFamily: "monospace" }}>{cvResult.m.toFixed(3)} m</td></tr>
                <tr style={{ background: "#f0eeff" }}><td><strong>Feet &amp; Inches</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{cvResult.ft}′ {cvResult.inch}″</td></tr>
                <tr><td>Total inches</td><td style={{ fontFamily: "monospace" }}>{fmt1(cvResult.cm / 2.54)}</td></tr>
                <tr><td>Millimeters</td><td style={{ fontFamily: "monospace" }}>{Math.round(cvResult.cm * 10)}</td></tr>
              </tbody>
            </table>
          )}

          <h3 className="card-title" style={{ marginTop: 16 }}>Average Adult Height by Country</h3>
          <table className="table">
            <thead><tr><th>Country</th><th>Men (cm)</th><th>Women (cm)</th></tr></thead>
            <tbody>
              {AVG_HEIGHTS.map(([country, men, women]) => (
                <tr key={country}>
                  <td style={{ fontSize: 13 }}>{country}</td>
                  <td style={{ fontFamily: "monospace" }}>{men} / {fmtFtIn(men)}</td>
                  <td style={{ fontFamily: "monospace" }}>{women} / {fmtFtIn(women)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}

/* tiny inverse error function used for CDC percentile projection */
function erfInv(x) {
  const a = 0.147;
  const b = (2 / (Math.PI * a) + Math.log(1 - x * x) / 2);
  return Math.sign(x) * Math.sqrt(Math.sqrt(b * b - Math.log(1 - x * x) / a) - b);
}
