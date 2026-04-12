import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

// Body shape classification based on measurements
function classifyBodyShape(sex, shoulders, bust, waist, hips) {
  if (!shoulders || !bust || !waist || !hips) return null;

  if (sex === "female") {
    const bustHipDiff  = Math.abs(bust - hips);
    const bustWaistDiff = bust - waist;
    const hipWaistDiff  = hips - waist;

    // Hourglass: bust ≈ hips, waist noticeably smaller
    if (bustHipDiff <= 3.5 && bustWaistDiff >= 9 && hipWaistDiff >= 10) {
      return { shape: "Hourglass", desc: "Bust and hips are roughly equal with a well-defined waist. This is considered a balanced, symmetrical body shape." };
    }
    // Bottom hourglass: hips > bust
    if (hips > bust && bustHipDiff <= 3.5 && hipWaistDiff >= 9) {
      return { shape: "Bottom Hourglass", desc: "Similar to hourglass but hips are slightly larger than bust with a defined waist." };
    }
    // Top hourglass: bust > hips
    if (bust > hips && bustHipDiff <= 3.5 && bustWaistDiff >= 9) {
      return { shape: "Top Hourglass", desc: "Similar to hourglass but bust is slightly larger than hips with a defined waist." };
    }
    // Pear (triangle): hips > bust + 3.5
    if (hips - bust > 3.5) {
      return { shape: "Pear (Triangle)", desc: "Hips are notably wider than shoulders and bust. Weight tends to accumulate in the lower body." };
    }
    // Inverted triangle: bust > hips + 3.5
    if (bust - hips > 3.5) {
      return { shape: "Inverted Triangle", desc: "Shoulders and bust are wider than hips. Typically found in athletic builds." };
    }
    // Rectangle/banana: waist difference is small
    if (bustHipDiff < 3.5 && (bustWaistDiff < 9 || hipWaistDiff < 9)) {
      return { shape: "Rectangle", desc: "Bust, waist, and hips are roughly the same width. Also known as a 'banana' or 'straight' shape." };
    }
    // Diamond: waist wider relative to bust and hips
    if (waist >= bust && waist >= hips) {
      return { shape: "Diamond", desc: "Waist is wider than bust and hips. Weight tends to accumulate around the midsection." };
    }
    return { shape: "Rectangle", desc: "Proportions are fairly even across bust, waist, and hips." };
  } else {
    // Male body types based on shoulder-to-waist and waist-to-hip ratios
    const swr = shoulders / waist; // shoulder-waist ratio
    if (swr >= 1.35) return { shape: "Inverted Triangle (V-shape)", desc: "Broad shoulders tapering to a narrow waist. Often considered the classic athletic male physique." };
    if (swr >= 1.2) return { shape: "Trapezoid", desc: "Shoulders wider than waist but not dramatically so. A balanced, athletic appearance." };
    if (swr >= 1.05 && swr < 1.2) return { shape: "Rectangle", desc: "Shoulders, chest, and waist are roughly the same width. A straight, column-like shape." };
    if (waist > shoulders) return { shape: "Oval (Apple)", desc: "Waist wider than shoulders. Weight tends to accumulate around the midsection." };
    return { shape: "Rectangle", desc: "Balanced proportions across shoulders, chest, and waist." };
  }
}

export default function BodyTypeCalculator() {
  const [units, setUnits]     = useState("metric");
  const [sex, setSex]         = useState("female");
  const [shoulders, setShoulds] = useState(units === "metric" ? 91 : 36);
  const [bust, setBust]       = useState(units === "metric" ? 89 : 35);
  const [waist, setWaist]     = useState(units === "metric" ? 69 : 27);
  const [hips, setHips]       = useState(units === "metric" ? 94 : 37);

  const unit = units === "metric" ? "cm" : "in";

  const result = useMemo(
    () => classifyBodyShape(sex, Number(shoulders), Number(bust), Number(waist), Number(hips)),
    [sex, shoulders, bust, waist, hips]
  );

  const ratios = useMemo(() => {
    const s = Number(shoulders), b = Number(bust), w = Number(waist), h = Number(hips);
    if (!s || !w || !h) return null;
    return {
      whr: Math.round((w / h) * 100) / 100,
      swr: Math.round((s / w) * 100) / 100,
      bmi_ratio: Math.round((b / h) * 100) / 100,
    };
  }, [shoulders, bust, waist, hips]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Body Type Calculator</h1>
        <p className="muted">
          Determine your body shape based on your measurements. Enter your shoulder, bust/chest,
          waist, and hip measurements to discover your body type.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Your Measurements</h2>

          <div className="row two">
            <div className="field">
              <label>Units</label>
              <select value={units} onChange={e => {
                setUnits(e.target.value);
                if (e.target.value === "us") {
                  setShoulds(36); setBust(35); setWaist(27); setHips(37);
                } else {
                  setShoulds(91); setBust(89); setWaist(69); setHips(94);
                }
              }}>
                <option value="metric">Metric (cm)</option>
                <option value="us">US (inches)</option>
              </select>
            </div>
            <div className="field">
              <label>Sex</label>
              <select value={sex} onChange={e => setSex(e.target.value)}>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
            </div>
          </div>

          <div className="row two">
            <div className="field">
              <label>Shoulders ({unit})</label>
              <input type="number" min={40} max={200} value={shoulders}
                onChange={e => setShoulds(e.target.value)} />
            </div>
            <div className="field">
              <label>{sex === "female" ? "Bust" : "Chest"} ({unit})</label>
              <input type="number" min={40} max={200} value={bust}
                onChange={e => setBust(e.target.value)} />
            </div>
          </div>

          <div className="row two">
            <div className="field">
              <label>Waist ({unit})</label>
              <input type="number" min={40} max={200} value={waist}
                onChange={e => setWaist(e.target.value)} />
            </div>
            <div className="field">
              <label>Hips ({unit})</label>
              <input type="number" min={40} max={200} value={hips}
                onChange={e => setHips(e.target.value)} />
            </div>
          </div>

          <p className="small" style={{ marginTop: 10 }}>
            Measure at the fullest point of each area. Shoulders: across the widest point.
            Bust/Chest: fullest point. Waist: narrowest point. Hips: fullest point.
          </p>
        </section>

        <section className="card">
          <h2 className="card-title">Results</h2>

          {result ? (
            <>
              <div className="kpi" style={{ marginBottom: 16 }}>
                <div className="kpi-label">Your Body Shape</div>
                <div className="kpi-value" style={{ fontSize: 22, marginTop: 8 }}>{result.shape}</div>
              </div>

              <div style={{
                padding: "14px 18px",
                background: "#f0eeff",
                borderRadius: 12,
                border: "1px solid rgba(99,102,241,0.15)",
                fontSize: 14,
                color: "#312e81",
                lineHeight: 1.6,
                marginBottom: 16,
              }}>
                {result.desc}
              </div>

              {ratios && (
                <>
                  <h3 className="card-title">Key Ratios</h3>
                  <div className="kpi-grid">
                    <div className="kpi">
                      <div className="kpi-label">Waist-to-Hip Ratio</div>
                      <div className="kpi-value">{ratios.whr}</div>
                      <div className="kpi-sub">
                        {sex === "female"
                          ? ratios.whr < 0.8 ? "Low risk" : ratios.whr < 0.85 ? "Moderate risk" : "High risk"
                          : ratios.whr < 0.9 ? "Low risk" : ratios.whr < 1.0 ? "Moderate risk" : "High risk"}
                      </div>
                    </div>
                    <div className="kpi">
                      <div className="kpi-label">Shoulder-to-Waist Ratio</div>
                      <div className="kpi-value">{ratios.swr}</div>
                      <div className="kpi-sub">
                        {ratios.swr >= 1.35 ? "Athletic" : ratios.swr >= 1.2 ? "Fit" : "Average"}
                      </div>
                    </div>
                  </div>
                </>
              )}

              <table className="table" style={{ marginTop: 14 }}>
                <thead>
                  <tr>
                    <th>Shape</th>
                    <th>Characteristic</th>
                  </tr>
                </thead>
                <tbody>
                  {sex === "female" ? (
                    <>
                      <tr><td>Hourglass</td><td>Bust ≈ Hips, narrow waist</td></tr>
                      <tr><td>Pear (Triangle)</td><td>Hips &gt; Bust by 3.5+ {unit}</td></tr>
                      <tr><td>Inverted Triangle</td><td>Bust &gt; Hips by 3.5+ {unit}</td></tr>
                      <tr><td>Rectangle</td><td>Bust, waist, hips similar</td></tr>
                      <tr><td>Diamond</td><td>Waist widest overall</td></tr>
                    </>
                  ) : (
                    <>
                      <tr><td>Inverted Triangle</td><td>Shoulder/Waist ≥ 1.35</td></tr>
                      <tr><td>Trapezoid</td><td>Shoulder/Waist 1.2–1.35</td></tr>
                      <tr><td>Rectangle</td><td>Shoulder/Waist 1.05–1.2</td></tr>
                      <tr><td>Oval (Apple)</td><td>Waist ≥ Shoulders</td></tr>
                    </>
                  )}
                </tbody>
              </table>
            </>
          ) : (
            <p className="small">Enter all four measurements to determine your body type.</p>
          )}
        </section>
      </div>
    </div>
  );
}
