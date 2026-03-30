import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

/* ── Letter grade table ── */
const LETTER_GRADES = [
  { letter: "A+", gpa: 4.0, min: 97,  max: 100 },
  { letter: "A",  gpa: 4.0, min: 93,  max: 96  },
  { letter: "A-", gpa: 3.7, min: 90,  max: 92  },
  { letter: "B+", gpa: 3.3, min: 87,  max: 89  },
  { letter: "B",  gpa: 3.0, min: 83,  max: 86  },
  { letter: "B-", gpa: 2.7, min: 80,  max: 82  },
  { letter: "C+", gpa: 2.3, min: 77,  max: 79  },
  { letter: "C",  gpa: 2.0, min: 73,  max: 76  },
  { letter: "C-", gpa: 1.7, min: 70,  max: 72  },
  { letter: "D+", gpa: 1.3, min: 67,  max: 69  },
  { letter: "D",  gpa: 1.0, min: 63,  max: 66  },
  { letter: "D-", gpa: 0.7, min: 60,  max: 62  },
  { letter: "F",  gpa: 0.0, min: 0,   max: 59  },
];

function percentToLetter(pct) {
  for (const row of LETTER_GRADES) {
    if (pct >= row.min) return row;
  }
  return LETTER_GRADES[LETTER_GRADES.length - 1];
}

const SIDEBAR_LINKS = [
  { label: "Grade Calculator",       to: "/grade-calculator" },
  { label: "GPA Calculator",         to: "/gpa-calculator" },
  { label: "Percentage Calculator",  to: "/percentage-calculator" },
  { label: "Age Calculator",         to: "/age" },
  { label: "Time Calculator",        to: "/time" },
  { label: "Hours Calculator",       to: "/hours-calculator" },
  { label: "BMI Calculator",         to: "/bmi" },
  { label: "Loan Calculator",        to: "/loan" },
  { label: "Mortgage Calculator",    to: "/mortgage" },
];

let nextRowId = 6;
function defaultRows() {
  return [
    { id: 1, name: "Assignment 1", grade: "85",  weight: "20" },
    { id: 2, name: "Assignment 2", grade: "90",  weight: "20" },
    { id: 3, name: "Midterm Exam", grade: "78",  weight: "25" },
    { id: 4, name: "Final Exam",   grade: "88",  weight: "35" },
    { id: 5, name: "",             grade: "",    weight: ""   },
  ];
}

/* ── Shared inline styles ── */
const thSt = {
  padding: "9px 12px",
  background: "#f0f0f0",
  color: "#444",
  fontWeight: 700,
  fontSize: 13,
  border: "1px solid #ccc",
  textAlign: "left",
};
const tdSt = { padding: "5px 8px", border: "1px solid #ddd", verticalAlign: "middle" };
const cellInput = {
  width: "100%", background: "#fff", color: "#222",
  border: "1px solid #ccc", borderRadius: 4,
  padding: "6px 8px", fontSize: 13, outline: "none",
  boxSizing: "border-box", fontFamily: "inherit",
};
const planInput = {
  width: "100%", background: "#f8f9ff", color: "#1e1b4b",
  border: "1.5px solid rgba(99,102,241,0.2)", borderRadius: 12,
  padding: "11px 14px", fontSize: 15, outline: "none",
  boxSizing: "border-box", fontFamily: "inherit",
};
const fieldLabel = {
  display: "block", fontSize: 11.5, fontWeight: 700,
  color: "#6b7a9e", marginBottom: 7, letterSpacing: "0.4px",
  textTransform: "uppercase",
};

export default function GradeCalculator() {
  /* ── Section 1: weighted grade ── */
  const [rows, setRows]       = useState(defaultRows);
  const [result1, setResult1] = useState(null);
  const [error1, setError1]   = useState("");

  /* ── Section 2: final grade ── */
  const [finals, setFinals]   = useState({ current: "", desired: "", weight: "" });
  const [result2, setResult2] = useState(null);
  const [error2, setError2]   = useState("");

  /* ── Sidebar search ── */
  const [search, setSearch]   = useState("");

  const updateRow = (id, field, val) =>
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));

  const addRow = () =>
    setRows(prev => [...prev, { id: nextRowId++, name: "", grade: "", weight: "" }]);

  /* ── Section 1 calculate ── */
  const calculate1 = () => {
    const valid = rows.filter(r => {
      const g = parseFloat(r.grade);
      const w = parseFloat(r.weight);
      return !isNaN(g) && !isNaN(w) && w > 0 && g >= 0 && g <= 100;
    });
    if (valid.length === 0) {
      setError1("Please enter at least one row with a grade (0–100) and weight (> 0).");
      setResult1(null); return;
    }
    const totalWeight  = valid.reduce((s, r) => s + parseFloat(r.weight), 0);
    const weightedSum  = valid.reduce((s, r) => s + parseFloat(r.grade) * parseFloat(r.weight), 0);
    const average      = weightedSum / totalWeight;
    const letterInfo   = percentToLetter(average);
    setError1("");
    setResult1({ average, letterInfo, totalWeight, rows: valid });
  };

  const clear1 = () => { setRows(defaultRows()); setResult1(null); setError1(""); };

  /* ── Section 2 calculate ── */
  const calculate2 = () => {
    const cur = parseFloat(finals.current);
    const des = parseFloat(finals.desired);
    const wt  = parseFloat(finals.weight);
    if (isNaN(cur) || cur < 0 || cur > 100) { setError2("Current grade must be 0–100."); setResult2(null); return; }
    if (isNaN(des) || des < 0 || des > 100) { setError2("Desired grade must be 0–100."); setResult2(null); return; }
    if (isNaN(wt)  || wt  <= 0 || wt > 100){ setError2("Final exam weight must be 1–100%."); setResult2(null); return; }
    // desired = current*(1 - wt/100) + final*(wt/100)
    const needed = (des - cur * (1 - wt / 100)) / (wt / 100);
    setError2("");
    setResult2({ needed, des, wt, impossible: needed > 100, easy: needed <= 0 });
  };

  const clear2 = () => { setFinals({ current: "", desired: "", weight: "" }); setResult2(null); setError2(""); };

  /* ── Section 3: Final Grade Planning (Optional) ── */
  const [plan3, setPlan3]     = useState({ goal: "", remainingWeight: "" });
  const [result3, setResult3] = useState(null);
  const [error3, setError3]   = useState("");

  const calculate3 = () => {
    /* Derive current average directly from rows (no need to press Calculate first) */
    const valid = rows.filter(r => {
      const g = parseFloat(r.grade);
      const w = parseFloat(r.weight);
      return !isNaN(g) && !isNaN(w) && w > 0 && g >= 0 && g <= 100;
    });
    if (valid.length === 0) {
      setError3("Please fill in at least one valid row in the Grade Calculator above first.");
      setResult3(null); return;
    }
    const totalWeight = valid.reduce((s, r) => s + parseFloat(r.weight), 0);
    const weightedSum = valid.reduce((s, r) => s + parseFloat(r.grade) * parseFloat(r.weight), 0);
    const current = weightedSum / totalWeight;

    const goal            = parseFloat(plan3.goal);
    const remainingWeight = parseFloat(plan3.remainingWeight);

    if (isNaN(goal) || goal < 0 || goal > 100) {
      setError3("Final Grade Goal must be between 0 and 100.");
      setResult3(null); return;
    }
    if (isNaN(remainingWeight) || remainingWeight < 1 || remainingWeight > 100) {
      setError3("Weight of Remaining Tasks must be between 1 and 100%.");
      setResult3(null); return;
    }

    const completedWeight = 100 - remainingWeight;
    const required = (goal * 100 - current * completedWeight) / remainingWeight;

    setError3("");
    setResult3({
      current,
      goal,
      remainingWeight,
      required,
      impossible: required > 100,
      alreadyMet: required <= 0,
    });
  };

  const clear3 = () => {
    setPlan3({ goal: "", remainingWeight: "" });
    setResult3(null);
    setError3("");
  };

  const filteredLinks = SIDEBAR_LINKS.filter(l =>
    l.label.toLowerCase().includes(search.toLowerCase())
  );

  const blueBar = {
    background: "#dbeafe", border: "1px solid #93c5fd",
    borderRadius: 6, padding: "9px 14px", marginBottom: 14,
    color: "#1d4ed8", fontSize: 13.5, fontWeight: 500,
    display: "flex", alignItems: "center", gap: 8,
  };
  const grayBox = {
    background: "#f5f5f5", border: "1px solid #ddd",
    borderRadius: 8, padding: "14px",
  };

  return (
    <div className="calc-wrap">

      {/* Breadcrumb */}
      <div style={{ maxWidth: 1100, margin: "0 auto 14px", fontSize: 12.5, color: "#888" }}>
        <Link to="/" style={{ color: "#6366f1", textDecoration: "none" }}>home</Link>
        <span style={{ margin: "0 5px" }}>/</span>
        <span>other</span>
        <span style={{ margin: "0 5px" }}>/</span>
        <span style={{ color: "#444" }}>grade calculator</span>
      </div>

      {/* Title */}
      <div style={{ maxWidth: 1100, margin: "0 auto 22px" }}>
        <h1 style={{
          fontSize: "clamp(22px, 3.5vw, 30px)", fontWeight: 800, margin: "0 0 8px",
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
        }}>
          Grade Calculator
        </h1>
        <p className="muted" style={{ maxWidth: 720 }}>
          Calculate your weighted average grade from assignments and exams. Use the Final
          Grade Calculator to find the score you need on your final exam to achieve a
          desired overall grade.
        </p>
      </div>

      <div className="rng-layout">
        <div className="rng-main">

          {/* ── Result 1 ── */}
          {result1 && (
            <section className="card" style={{ marginBottom: 18 }}>
              <div className="result-header"><span>Result</span></div>

              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
                <div className="kpi" style={{ flex: 1, minWidth: 130 }}>
                  <div className="kpi-label">Average Grade</div>
                  <div className="kpi-value" style={{ color: "#065f46" }}>
                    {result1.average.toFixed(2)}%
                  </div>
                </div>
                <div className="kpi" style={{ flex: 1, minWidth: 130 }}>
                  <div className="kpi-label">Letter Grade</div>
                  <div className="kpi-value" style={{ color: "#4f46e5" }}>
                    {result1.letterInfo.letter}
                  </div>
                </div>
                <div className="kpi" style={{ flex: 1, minWidth: 130 }}>
                  <div className="kpi-label">GPA Points</div>
                  <div className="kpi-value">{result1.letterInfo.gpa.toFixed(1)}</div>
                </div>
                <div className="kpi" style={{ flex: 1, minWidth: 130 }}>
                  <div className="kpi-label">Total Weight</div>
                  <div className="kpi-value">{result1.totalWeight}%</div>
                </div>
              </div>

              <div className="table-scroll">
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr>
                      <th style={thSt}>Assignment / Exam</th>
                      <th style={{ ...thSt, width: 90 }}>Grade (%)</th>
                      <th style={{ ...thSt, width: 90 }}>Weight (%)</th>
                      <th style={{ ...thSt, width: 130 }}>Weighted Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result1.rows.map((r, i) => {
                      const weighted = parseFloat(r.grade) * parseFloat(r.weight) / 100;
                      return (
                        <tr key={r.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                          <td style={tdSt}>{r.name || `Item ${i + 1}`}</td>
                          <td style={tdSt}>{r.grade}%</td>
                          <td style={tdSt}>{r.weight}%</td>
                          <td style={{ ...tdSt, fontFamily: "monospace" }}>{weighted.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                    <tr style={{ background: "#f0fdf4", fontWeight: 800 }}>
                      <td colSpan={2} style={{ ...tdSt, color: "#065f46" }}>Weighted Average</td>
                      <td style={{ ...tdSt, color: "#065f46" }}>{result1.totalWeight}%</td>
                      <td style={{ ...tdSt, fontFamily: "monospace", color: "#065f46", fontSize: 15 }}>
                        {result1.average.toFixed(2)}% — {result1.letterInfo.letter}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ── Section 1 Input ── */}
          <section className="card" style={{ marginBottom: 18 }}>
            <h2 className="card-title">Grade Calculator</h2>
            <p className="rng-desc">
              Enter each assignment or exam with its grade percentage and weight. Rows
              without a grade or weight are ignored. Weights do not need to sum to 100%.
            </p>

            <div style={blueBar}>
              <span style={{ fontSize: 16 }}>&#9660;</span>
              Modify the values and click the <strong style={{ marginLeft: 3 }}>Calculate</strong> button to use
            </div>

            <div style={grayBox}>
              <div className="table-scroll" style={{ marginBottom: 10 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={thSt}>Assignment / Exam (optional)</th>
                      <th style={{ ...thSt, width: 110 }}>Grade (%)</th>
                      <th style={{ ...thSt, width: 110 }}>Weight (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, idx) => (
                      <tr key={row.id} style={{ background: idx % 2 === 0 ? "#fff" : "#fafafa" }}>
                        <td style={{ padding: "5px 8px" }}>
                          <input
                            type="text"
                            placeholder={`Item ${idx + 1}`}
                            value={row.name}
                            onChange={e => updateRow(row.id, "name", e.target.value)}
                            style={cellInput}
                          />
                        </td>
                        <td style={{ padding: "5px 8px" }}>
                          <input
                            type="number"
                            placeholder="0"
                            min="0" max="100" step="0.1"
                            value={row.grade}
                            onChange={e => updateRow(row.id, "grade", e.target.value)}
                            style={cellInput}
                          />
                        </td>
                        <td style={{ padding: "5px 8px" }}>
                          <input
                            type="number"
                            placeholder="0"
                            min="0" max="100" step="0.5"
                            value={row.weight}
                            onChange={e => updateRow(row.id, "weight", e.target.value)}
                            style={cellInput}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginBottom: 14 }}>
                <button type="button" className="link-btn" onClick={addRow}>+ add more rows</button>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 90 }}>
                  <button type="button" className="btn-primary" onClick={calculate1}>Calculate</button>
                </div>
                <div style={{ flex: 1, minWidth: 90 }}>
                  <button type="button" className="btn-secondary" onClick={clear1}>Clear</button>
                </div>
              </div>
            </div>

            {error1 && <div className="rng-error" style={{ marginTop: 14 }}>{error1}</div>}
          </section>

          {/* ── Result 2 ── */}
          {result2 && (
            <section className="card" style={{ marginBottom: 18 }}>
              <div className="result-header"><span>Result</span></div>
              {result2.easy ? (
                <div style={{
                  padding: "14px 16px", background: "#f0fdf4",
                  border: "1px solid #bbf7d0", borderRadius: 10,
                  color: "#065f46", fontSize: 14, fontWeight: 600,
                }}>
                  You have already achieved your desired grade! Any score on the final
                  will get you at least <strong>{result2.des}%</strong>.
                </div>
              ) : result2.impossible ? (
                <div style={{
                  padding: "14px 16px", background: "#fff5f5",
                  border: "1px solid #fecaca", borderRadius: 10,
                  color: "#dc2626", fontSize: 14, fontWeight: 600,
                }}>
                  It is not possible to achieve <strong>{result2.des}%</strong> — the required
                  final exam score would be <strong>{result2.needed.toFixed(2)}%</strong>,
                  which exceeds 100%.
                </div>
              ) : (
                <>
                  <div className="kpi" style={{ marginBottom: 14 }}>
                    <div className="kpi-label">Required Final Exam Score</div>
                    <div className="kpi-value" style={{ color: "#065f46" }}>
                      {result2.needed.toFixed(2)}%
                    </div>
                    <div className="kpi-sub">{percentToLetter(result2.needed).letter}</div>
                  </div>
                  <p style={{ color: "#374151", fontSize: 14, margin: 0, lineHeight: 1.65 }}>
                    To achieve a final grade of <strong>{result2.des}%</strong>, you need to score at
                    least <strong style={{ color: "#065f46" }}>{result2.needed.toFixed(2)}%</strong>{" "}
                    ({percentToLetter(result2.needed).letter}) on your final exam
                    (worth <strong>{result2.wt}%</strong> of your grade).
                  </p>
                </>
              )}
            </section>
          )}

          {/* ── Section 2 Input ── */}
          <section className="card" style={{ marginBottom: 18 }}>
            <h2 className="card-title">Final Grade Calculator</h2>
            <p className="rng-desc">
              Enter your current grade, your desired final grade, and the weight of the
              final exam. The calculator will tell you the minimum score you need on
              your final.
            </p>

            <div style={blueBar}>
              <span style={{ fontSize: 16 }}>&#9660;</span>
              Modify the values and click the <strong style={{ marginLeft: 3 }}>Calculate</strong> button to use
            </div>

            <div style={grayBox}>
              <div className="row two" style={{ gap: 14, marginBottom: 14 }}>
                <div className="field">
                  <label style={fieldLabel}>Current Grade (%)</label>
                  <input
                    type="number" placeholder="e.g. 82" min="0" max="100" step="0.1"
                    value={finals.current}
                    onChange={e => setFinals(p => ({ ...p, current: e.target.value }))}
                    style={planInput}
                  />
                </div>
                <div className="field">
                  <label style={fieldLabel}>Desired Grade (%)</label>
                  <input
                    type="number" placeholder="e.g. 85" min="0" max="100" step="0.1"
                    value={finals.desired}
                    onChange={e => setFinals(p => ({ ...p, desired: e.target.value }))}
                    style={planInput}
                  />
                </div>
                <div className="field">
                  <label style={fieldLabel}>Final Exam Weight (%)</label>
                  <input
                    type="number" placeholder="e.g. 30" min="1" max="100" step="1"
                    value={finals.weight}
                    onChange={e => setFinals(p => ({ ...p, weight: e.target.value }))}
                    style={planInput}
                  />
                </div>
              </div>

              <div className="row two rng-btn-row" style={{ marginBottom: 14 }}>
                <button type="button" className="btn-primary" onClick={calculate2}>Calculate</button>
                <button type="button" className="btn-secondary" onClick={clear2}>Clear</button>
              </div>
            </div>

            {error2 && <div className="rng-error" style={{ marginTop: 10 }}>{error2}</div>}
          </section>

          {/* ── Result 3 ── */}
          {result3 && (
            <section className="card" style={{ marginBottom: 18 }}>
              <div className="result-header"><span>Result</span></div>

              {result3.alreadyMet ? (
                <div style={{
                  padding: "14px 16px", background: "#f0fdf4",
                  border: "1px solid #bbf7d0", borderRadius: 10,
                  color: "#065f46", fontSize: 14, fontWeight: 600, lineHeight: 1.65,
                }}>
                  You need an average of <strong>0%</strong> on the remaining tasks to reach
                  a final grade of <strong>{result3.goal}%</strong>. You have already met
                  this goal with your current average of{" "}
                  <strong>{result3.current.toFixed(2)}%</strong>.
                </div>
              ) : result3.impossible ? (
                <>
                  <div className="kpi" style={{ marginBottom: 14 }}>
                    <div className="kpi-label">Required Average on Remaining Tasks</div>
                    <div className="kpi-value" style={{ color: "#dc2626" }}>
                      {result3.required.toFixed(2)}%
                    </div>
                    <div className="kpi-sub">exceeds 100%</div>
                  </div>
                  <div style={{
                    padding: "12px 16px", background: "#fff5f5",
                    border: "1px solid #fecaca", borderRadius: 10,
                    color: "#dc2626", fontSize: 14, fontWeight: 600, lineHeight: 1.65,
                  }}>
                    This goal may be unattainable with the remaining weight. You would need{" "}
                    <strong>{result3.required.toFixed(2)}%</strong> on the remaining{" "}
                    <strong>{result3.remainingWeight}%</strong> of tasks — which exceeds 100%.
                  </div>
                </>
              ) : (
                <>
                  <div className="kpi" style={{ marginBottom: 14 }}>
                    <div className="kpi-label">Required Average on Remaining Tasks</div>
                    <div className="kpi-value" style={{ color: "#065f46" }}>
                      {result3.required.toFixed(2)}%
                    </div>
                    <div className="kpi-sub">{percentToLetter(result3.required).letter}</div>
                  </div>
                  <p style={{ color: "#374151", fontSize: 14, margin: 0, lineHeight: 1.65 }}>
                    You need an average of{" "}
                    <strong style={{ color: "#065f46" }}>
                      {result3.required.toFixed(2)}% ({percentToLetter(result3.required).letter})
                    </strong>{" "}
                    on the remaining tasks (worth{" "}
                    <strong>{result3.remainingWeight}%</strong> of your grade) to reach a
                    final grade of <strong>{result3.goal}%</strong>. Your current average
                    is <strong>{result3.current.toFixed(2)}%</strong>.
                  </p>
                </>
              )}
            </section>
          )}

          {/* ── Section 3 Input: Final Grade Planning (Optional) ── */}
          <section className="card" style={{ marginBottom: 18 }}>
            <h2 className="card-title">
              Final Grade Planning{" "}
              <span style={{ fontWeight: 400, fontSize: 14, color: "#9ca3af" }}>(Optional)</span>
            </h2>
            <p className="rng-desc">
              Uses your current weighted average from the grade table above. Enter your
              target final grade and how much of your grade is still left to complete —
              the calculator will tell you the average score you need on the remaining tasks.
            </p>

            <div style={blueBar}>
              <span style={{ fontSize: 16 }}>&#9660;</span>
              Rows in the grade table above are used as your current average
            </div>

            <div style={grayBox}>
              <div className="row two" style={{ gap: 14, marginBottom: 14 }}>
                <div className="field">
                  <label style={fieldLabel}>Final Grade Goal (%)</label>
                  <input
                    type="number"
                    placeholder="e.g. 90"
                    min="0" max="100" step="0.1"
                    value={plan3.goal}
                    onChange={e => setPlan3(p => ({ ...p, goal: e.target.value }))}
                    style={planInput}
                  />
                </div>
                <div className="field">
                  <label style={fieldLabel}>Weight of Remaining Tasks (%)</label>
                  <input
                    type="number"
                    placeholder="e.g. 30"
                    min="1" max="100" step="1"
                    value={plan3.remainingWeight}
                    onChange={e => setPlan3(p => ({ ...p, remainingWeight: e.target.value }))}
                    style={planInput}
                  />
                </div>
              </div>

              <div className="row two rng-btn-row" style={{ marginBottom: 14 }}>
                <button type="button" className="btn-primary" onClick={calculate3}>Calculate</button>
                <button type="button" className="btn-secondary" onClick={clear3}>Clear</button>
              </div>
            </div>

            {error3 && <div className="rng-error" style={{ marginTop: 10 }}>{error3}</div>}
          </section>

          {/* ── Letter Grade Table ── */}
          <section className="card">
            <h2 className="card-title">Letter Grade Equivalence</h2>
            <div className="table-scroll">
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
                <thead>
                  <tr>
                    <th style={thSt}>Letter Grade</th>
                    <th style={thSt}>GPA Points</th>
                    <th style={thSt}>Percentage Range</th>
                  </tr>
                </thead>
                <tbody>
                  {LETTER_GRADES.map((row, i) => (
                    <tr key={row.letter} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                      <td style={{ ...tdSt, fontWeight: 800, color: "#4f46e5" }}>{row.letter}</td>
                      <td style={{ ...tdSt, fontFamily: "monospace" }}>{row.gpa.toFixed(1)}</td>
                      <td style={tdSt}>
                        {row.letter === "F"
                          ? `Below ${row.min + 1}%`
                          : `${row.min}% – ${row.max}%`}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>

        {/* ── Sidebar ── */}
        <aside className="rng-sidebar">
          <div className="card rng-sidebar-card" style={{ marginBottom: 16 }}>
            <h3 className="rng-sidebar-title">Search</h3>
            <input
              type="text"
              placeholder="Search calculators..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: "100%", boxSizing: "border-box",
                border: "1.5px solid rgba(99,102,241,0.2)", borderRadius: 8,
                padding: "8px 10px", fontSize: 13, color: "#1e1b4b",
                background: "#f8f9ff", outline: "none",
              }}
            />
          </div>

          <div className="card rng-sidebar-card">
            <h3 className="rng-sidebar-title">Other Calculators</h3>
            <ul className="rng-sidebar-list">
              {filteredLinks.map(lnk => (
                <li key={lnk.to}>
                  <Link
                    to={lnk.to}
                    className={
                      lnk.to === "/grade-calculator"
                        ? "rng-sidebar-link rng-sidebar-link--active"
                        : "rng-sidebar-link"
                    }
                  >
                    {lnk.label}
                  </Link>
                </li>
              ))}
              {filteredLinks.length === 0 && (
                <li style={{ fontSize: 12, color: "#aaa", padding: "8px 10px" }}>No results</li>
              )}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
