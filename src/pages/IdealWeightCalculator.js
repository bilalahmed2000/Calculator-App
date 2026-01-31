import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

export default function IdealWeightCalculator() {
  const [units, setUnits] = useState("metric");
  const [gender, setGender] = useState("male");
  const [age, setAge] = useState(25);

  const [cm, setCm] = useState(170);
  const [ft, setFt] = useState(5);
  const [inch, setInch] = useState(7);

  // height in inches (all formulas use inches)
  const heightInches = useMemo(() => {
    if (units === "metric") return cm / 2.54;
    return ft * 12 + inch;
  }, [units, cm, ft, inch]);

  const results = useMemo(() => {
    if (!heightInches || heightInches < 48 || age < 18) return null;

    const h = heightInches - 60;

    const data = {
      Devine:
        gender === "male"
          ? 50 + 2.3 * h
          : 45.5 + 2.3 * h,

      Robinson:
        gender === "male"
          ? 52 + 1.9 * h
          : 49 + 1.7 * h,

      Miller:
        gender === "male"
          ? 56.2 + 1.41 * h
          : 53.1 + 1.36 * h,

      Hamwi:
        gender === "male"
          ? 48 + 2.7 * h
          : 45.5 + 2.2 * h,
    };

    Object.keys(data).forEach(
      (k) => (data[k] = Math.round(data[k] * 10) / 10)
    );

    return data;
  }, [heightInches, gender, age]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Ideal Weight Calculator</h1>
        <p className="muted">
          Estimate ideal body weight using popular medical formulas.
        </p>
      </header>

      <div className="calc-grid">
        {/* INPUT CARD */}
        <section className="card">
          <h2 className="card-title">Your Details</h2>

          <div className="row two">
            <div className="field">
              <label>Units</label>
              <select value={units} onChange={(e) => setUnits(e.target.value)}>
                <option value="metric">Metric (cm)</option>
                <option value="us">US (ft / in)</option>
              </select>
            </div>

            <div className="field">
              <label>Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="row two">
            <div className="field">
              <label>Age</label>
              <input
                type="number"
                min={18}
                max={120}
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
              />
            </div>
          </div>

          {units === "metric" ? (
            <div className="row">
              <div className="field">
                <label>Height (cm)</label>
                <input
                  type="number"
                  min={120}
                  max={230}
                  value={cm}
                  onChange={(e) => setCm(Number(e.target.value))}
                />
              </div>
            </div>
          ) : (
            <div className="row two">
              <div className="field">
                <label>Height (ft)</label>
                <input
                  type="number"
                  min={4}
                  max={7}
                  value={ft}
                  onChange={(e) => setFt(Number(e.target.value))}
                />
              </div>
              <div className="field">
                <label>Height (in)</label>
                <input
                  type="number"
                  min={0}
                  max={11}
                  value={inch}
                  onChange={(e) => setInch(Number(e.target.value))}
                />
              </div>
            </div>
          )}

          <div className="small">
            Height: {Math.round(heightInches)} in &nbsp;•&nbsp; Age: {age} years
          </div>
        </section>

        {/* RESULT CARD */}
        <section className="card">
          <h2 className="card-title">Results</h2>

          {results ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Formula</th>
                  <th>Ideal Weight (kg)</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(results).map(([key, value]) => (
                  <tr key={key}>
                    <td>{key}</td>
                    <td>{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="small">
              Enter valid height and age (18+) to see results.
            </p>
          )}

          <p className="small" style={{ marginTop: 10 }}>
            These formulas are intended for adults (18+). Ideal weight estimates
            do not account for muscle mass, body composition, or medical
            conditions.
          </p>
        </section>
      </div>
    </div>
  );
}
