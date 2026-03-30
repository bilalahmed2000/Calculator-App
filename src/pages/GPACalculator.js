import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

/* ---------- Grade scale (standard 4.0) ---------- */
const GRADE_SCALE = {
  "A":  4.0,
  "A-": 3.7,
  "B+": 3.3,
  "B":  3.0,
  "B-": 2.7,
  "C+": 2.3,
  "C":  2.0,
  "C-": 1.7,
  "D+": 1.3,
  "D":  1.0,
  "D-": 0.7,
  "F":  0.0,
};

const GRADE_OPTIONS = Object.keys(GRADE_SCALE);

/* ---------- Sidebar links ---------- */
const SIDEBAR_LINKS = [
  { label: "GPA Calculator",         to: "/gpa-calculator" },
  { label: "Age Calculator",         to: "/age" },
  { label: "Time Calculator",        to: "/time" },
  { label: "Hours Calculator",       to: "/hours-calculator" },
  { label: "Percentage Calculator",  to: "/percentage-calculator" },
  { label: "Password Generator",     to: "/password" },
  { label: "BMI Calculator",         to: "/bmi" },
  { label: "Loan Calculator",        to: "/loan" },
  { label: "Mortgage Calculator",    to: "/mortgage" },
  { label: "Scientific Calculator",  to: "/scientific" },
];

/* ---------- Default rows ---------- */
function getDefaultCourses() {
  return [
    { id: 1, name: "Math",    credits: "3", grade: "A"  },
    { id: 2, name: "English", credits: "3", grade: "B+" },
    { id: 3, name: "History", credits: "2", grade: "A-" },
    { id: 4, name: "",        credits: "",  grade: ""   },
    { id: 5, name: "",        credits: "",  grade: ""   },
  ];
}

let nextId = 6;

/* ---------- Inline styles ---------- */
const thStyle = {
  padding: "9px 12px",
  background: "#f0f0f0",
  color: "#444",
  fontWeight: 700,
  fontSize: 13,
  border: "1px solid #ccc",
  textAlign: "left",
};

const tdStyle = {
  padding: "5px 8px",
  border: "1px solid #ddd",
  verticalAlign: "middle",
};

const cellInputStyle = {
  width: "100%",
  background: "#fff",
  color: "#222",
  border: "1px solid #ccc",
  borderRadius: 4,
  padding: "6px 8px",
  fontSize: 13,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const cellSelectStyle = {
  width: "100%",
  background: "#fff",
  color: "#222",
  border: "1px solid #ccc",
  borderRadius: 4,
  padding: "6px 6px",
  fontSize: 13,
  cursor: "pointer",
  outline: "none",
};

const planInputStyle = {
  width: "100%",
  background: "#f8f9ff",
  color: "#1e1b4b",
  border: "1.5px solid rgba(99,102,241,0.2)",
  borderRadius: 12,
  padding: "11px 14px",
  fontSize: 15,
  outline: "none",
  boxSizing: "border-box",
  fontFamily: "inherit",
};

const fieldLabelStyle = {
  display: "block",
  fontSize: 11.5,
  fontWeight: 700,
  color: "#6b7a9e",
  marginBottom: 7,
  letterSpacing: "0.4px",
  textTransform: "uppercase",
};

/* ---------- Component ---------- */
export default function GPACalculator() {
  /* Section 1 */
  const [courses, setCourses]         = useState(getDefaultCourses);
  const [result1, setResult1]         = useState(null);
  const [error1,  setError1]          = useState("");
  const [showSettings, setShowSettings] = useState(false);

  /* Section 2 */
  const [plan, setPlan]       = useState({ currentGPA: "", targetGPA: "", currentCredits: "", additionalCredits: "" });
  const [result2, setResult2] = useState(null);
  const [error2,  setError2]  = useState("");

  /* Sidebar search */
  const [searchQuery, setSearchQuery] = useState("");

  /* ---- Course row handlers ---- */
  const updateCourse = (id, field, value) =>
    setCourses(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));

  const addRow = () =>
    setCourses(prev => [...prev, { id: nextId++, name: "", credits: "", grade: "" }]);

  /* ---- Section 1: Calculate GPA ---- */
  const calculate1 = () => {
    const valid = courses.filter(c => {
      const cr = parseFloat(c.credits);
      return cr > 0 && c.grade !== "" && c.grade in GRADE_SCALE;
    });

    if (valid.length === 0) {
      setError1("Please fill in at least one row with credits and a grade.");
      setResult1(null);
      return;
    }

    const totalCredits     = valid.reduce((s, c) => s + parseFloat(c.credits), 0);
    const totalGradePoints = valid.reduce((s, c) => s + parseFloat(c.credits) * GRADE_SCALE[c.grade], 0);
    const gpa = totalGradePoints / totalCredits;

    setError1("");
    setResult1({
      gpa,
      totalCredits,
      totalGradePoints,
      rows: valid.map(c => ({
        name:        c.name.trim() || `Course ${c.id}`,
        credits:     parseFloat(c.credits),
        grade:       c.grade,
        gradeValue:  GRADE_SCALE[c.grade],
        gradePoints: parseFloat(c.credits) * GRADE_SCALE[c.grade],
      })),
    });
  };

  const clear1 = () => {
    setCourses(getDefaultCourses());
    setResult1(null);
    setError1("");
    setShowSettings(false);
  };

  /* ---- Section 2: GPA Planning ---- */
  const calculate2 = () => {
    const cGPA  = parseFloat(plan.currentGPA);
    const tGPA  = parseFloat(plan.targetGPA);
    const cCred = parseFloat(plan.currentCredits);
    const aCred = parseFloat(plan.additionalCredits);

    if (isNaN(cGPA)  || cGPA  < 0 || cGPA  > 4)  { setError2("Current GPA must be between 0 and 4.");       setResult2(null); return; }
    if (isNaN(tGPA)  || tGPA  < 0 || tGPA  > 4)  { setError2("Target GPA must be between 0 and 4.");        setResult2(null); return; }
    if (isNaN(cCred) || cCred < 0)                { setError2("Current credits must be 0 or more.");         setResult2(null); return; }
    if (isNaN(aCred) || aCred <= 0)               { setError2("Additional credits must be greater than 0."); setResult2(null); return; }

    const required = (tGPA * (cCred + aCred) - cGPA * cCred) / aCred;

    setError2("");
    setResult2({ targetGPA: tGPA, additionalCredits: aCred, required, impossible: required > 4.0 });
  };

  const clear2 = () => {
    setPlan({ currentGPA: "", targetGPA: "", currentCredits: "", additionalCredits: "" });
    setResult2(null);
    setError2("");
  };

  /* ---- Sidebar filtered links ---- */
  const filteredLinks = SIDEBAR_LINKS.filter(lnk =>
    lnk.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ---- Render ---- */
  return (
    <div className="calc-wrap">

      {/* Breadcrumb */}
      <div style={{ maxWidth: 1100, margin: "0 auto 14px", fontSize: 12.5, color: "#888" }}>
        <Link to="/" style={{ color: "#6366f1", textDecoration: "none" }}>home</Link>
        <span style={{ margin: "0 5px" }}>/</span>
        <span>other</span>
        <span style={{ margin: "0 5px" }}>/</span>
        <span style={{ color: "#444" }}>gpa calculator</span>
      </div>

      {/* Page title block */}
      <div style={{ maxWidth: 1100, margin: "0 auto 22px" }}>
        <h1 style={{
          fontSize: "clamp(22px, 3.5vw, 30px)",
          fontWeight: 800,
          margin: "0 0 8px",
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          GPA Calculator
        </h1>
        <p className="muted" style={{ maxWidth: 720 }}>
          Use this calculator to calculate grade point average (GPA) and generate a GPA
          report. If you use percentage grades, have grades on a different scale or in
          high school with AP/IB classes, please change the Settings to input specific
          values. Also use the settings to group courses into semesters or to include
          past GPA.
        </p>
      </div>

      <div className="rng-layout">
        <div className="rng-main">

          {/* ===== Section 1 — Result (shown ABOVE calculator after Calculate) ===== */}
          {result1 && (
            <section className="card" style={{ marginBottom: 18 }}>
              <div className="result-header">
                <span>Result</span>
                <button
                  type="button"
                  onClick={() => window.print()}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    color: "#065f46", fontWeight: 700, fontSize: 13,
                    textDecoration: "underline", padding: 0,
                  }}
                >
                  Print
                </button>
              </div>

              {/* KPI summary */}
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
                <div className="kpi" style={{ flex: 1, minWidth: 140 }}>
                  <div className="kpi-label">GPA</div>
                  <div className="kpi-value" style={{ color: "#065f46" }}>
                    {result1.gpa.toFixed(3)}
                  </div>
                </div>
                <div className="kpi" style={{ flex: 1, minWidth: 140 }}>
                  <div className="kpi-label">Total Credits</div>
                  <div className="kpi-value">{result1.totalCredits}</div>
                </div>
              </div>

              {/* Detail table */}
              <div className="table-scroll">
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Course</th>
                      <th style={{ ...thStyle, width: 80 }}>Credit</th>
                      <th style={{ ...thStyle, width: 80 }}>Grade</th>
                      <th style={{ ...thStyle, width: 170 }}>Grade Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result1.rows.map((row, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                        <td style={tdStyle}>{row.name}</td>
                        <td style={tdStyle}>{row.credits}</td>
                        <td style={{ ...tdStyle, fontWeight: 700 }}>{row.grade}</td>
                        <td style={{ ...tdStyle, fontFamily: "monospace" }}>
                          {row.credits} &times; {row.gradeValue.toFixed(1)} = {row.gradePoints.toFixed(3)}
                        </td>
                      </tr>
                    ))}

                    {/* Total Credits row */}
                    <tr style={{ background: "#f5f3ff", fontWeight: 700 }}>
                      <td style={tdStyle}>Total Credits</td>
                      <td style={{ ...tdStyle }}>{result1.totalCredits}</td>
                      <td style={tdStyle}></td>
                      <td style={{ ...tdStyle, fontFamily: "monospace" }}>
                        {result1.totalGradePoints.toFixed(3)}
                      </td>
                    </tr>

                    {/* Overall GPA row */}
                    <tr style={{ background: "#f0fdf4", fontWeight: 800 }}>
                      <td colSpan={3} style={{ ...tdStyle, color: "#065f46" }}>Overall GPA</td>
                      <td style={{ ...tdStyle, fontFamily: "monospace", color: "#065f46", fontSize: 16 }}>
                        {result1.gpa.toFixed(3)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ===== Section 1 — GPA Calculator Input ===== */}
          <section className="card" style={{ marginBottom: 18 }}>
            <h2 className="card-title">GPA Calculator</h2>
            <p className="rng-desc">
              Enter each course name (optional), its credit hours, and your letter grade.
              Rows without credits or a grade are ignored automatically.
            </p>

            {/* Blue instruction bar */}
            <div style={{
              background: "#dbeafe",
              border: "1px solid #93c5fd",
              borderRadius: 6,
              padding: "9px 14px",
              marginBottom: 14,
              color: "#1d4ed8",
              fontSize: 13.5,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              <span style={{ fontSize: 16 }}>&#9660;</span>
              Modify the values and click the <strong style={{ marginLeft: 3 }}>Calculate</strong> button to use
            </div>

            {/* Gray input box */}
            <div style={{
              background: "#f5f5f5",
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: "14px",
            }}>
              {/* Course input table */}
              <div className="table-scroll" style={{ marginBottom: 10 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th style={thStyle}>Course (optional)</th>
                      <th style={{ ...thStyle, width: 100 }}>Credits</th>
                      <th style={{ ...thStyle, width: 120 }}>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((row, idx) => (
                      <tr
                        key={row.id}
                        style={{
                          background: idx % 2 === 0 ? "#fff" : "#fafafa",
                          borderBottom: "1px solid #e5e7eb",
                        }}
                      >
                        <td style={{ padding: "5px 8px" }}>
                          <input
                            type="text"
                            placeholder={`Course ${idx + 1}`}
                            value={row.name}
                            onChange={(e) => updateCourse(row.id, "name", e.target.value)}
                            style={cellInputStyle}
                          />
                        </td>
                        <td style={{ padding: "5px 8px" }}>
                          <input
                            type="number"
                            placeholder="0"
                            min="0"
                            step="0.5"
                            value={row.credits}
                            onChange={(e) => updateCourse(row.id, "credits", e.target.value)}
                            style={cellInputStyle}
                          />
                        </td>
                        <td style={{ padding: "5px 8px" }}>
                          <select
                            value={row.grade}
                            onChange={(e) => updateCourse(row.id, "grade", e.target.value)}
                            style={cellSelectStyle}
                          >
                            <option value="">—</option>
                            {GRADE_OPTIONS.map(g => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add row link */}
              <div style={{ marginBottom: 14 }}>
                <button type="button" className="link-btn" onClick={addRow}>
                  + add more courses
                </button>
              </div>

              {/* Buttons */}
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 90 }}>
                  <button type="button" className="btn-primary" onClick={calculate1}>
                    Calculate
                  </button>
                </div>
                <div style={{ flex: 1, minWidth: 90 }}>
                  <button type="button" className="btn-secondary" onClick={clear1}>
                    Clear
                  </button>
                </div>
                <button
                  type="button"
                  className="link-btn"
                  style={{ fontSize: 13.5, whiteSpace: "nowrap" }}
                  onClick={() => setShowSettings(s => !s)}
                >
                  {showSettings ? "▾" : "▸"} Settings
                </button>
              </div>
            </div>

            {/* Settings panel */}
            {showSettings && (
              <div style={{
                marginTop: 12,
                padding: "14px 16px",
                background: "#f5f3ff",
                borderRadius: 10,
                border: "1px solid rgba(99,102,241,0.15)",
              }}>
                <div style={{ fontWeight: 700, fontSize: 13.5, color: "#312e81", marginBottom: 10 }}>
                  Grade Scale — Standard 4.0
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 28px" }}>
                  {Object.entries(GRADE_SCALE).map(([g, v]) => (
                    <span key={g} style={{ fontSize: 13, color: "#4b5280", minWidth: 72 }}>
                      <strong style={{ color: "#312e81" }}>{g}</strong>
                      &nbsp;= {v.toFixed(1)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {error1 && <div className="rng-error" style={{ marginTop: 14 }}>{error1}</div>}
          </section>

          {/* ===== Section 2 — Planning Result ===== */}
          {result2 && (
            <section className="card" style={{ marginBottom: 18 }}>
              <div className="result-header">
                <span>Result</span>
              </div>

              {result2.impossible ? (
                <div style={{
                  padding: "14px 16px",
                  background: "#fff5f5",
                  border: "1px solid #fecaca",
                  borderRadius: 10,
                  color: "#dc2626",
                  fontSize: 14,
                  fontWeight: 600,
                  lineHeight: 1.65,
                }}>
                  A target GPA of <strong>{result2.targetGPA}</strong> is{" "}
                  <strong>not achievable</strong> in the next{" "}
                  <strong>{result2.additionalCredits}</strong> credits on a 4.0 scale —
                  the required GPA would be{" "}
                  <strong>{result2.required.toFixed(3)}</strong>, which exceeds 4.0.
                </div>
              ) : (
                <>
                  <div className="kpi" style={{ marginBottom: 14 }}>
                    <div className="kpi-label">
                      Required GPA for next {result2.additionalCredits} credits
                    </div>
                    <div className="kpi-value" style={{ color: "#065f46" }}>
                      {result2.required.toFixed(3)}
                    </div>
                  </div>
                  <p style={{ color: "#374151", fontSize: 14, margin: 0, lineHeight: 1.65 }}>
                    To achieve a target GPA of{" "}
                    <strong>{result2.targetGPA}</strong>, the GPA for the next{" "}
                    <strong>{result2.additionalCredits}</strong> credits needs to be{" "}
                    <strong style={{ color: "#065f46" }}>
                      {result2.required.toFixed(3)}
                    </strong>{" "}
                    or higher.
                  </p>
                </>
              )}
            </section>
          )}

          {/* ===== Section 2 — GPA Planning Calculator ===== */}
          <section className="card">
            <h2 className="card-title">GPA Planning Calculator</h2>
            <p className="rng-desc">
              Know your current GPA and want to hit a target? Enter your current GPA,
              total completed credits, your target GPA, and the number of additional
              credits you plan to take. The calculator tells you the minimum GPA needed
              for those upcoming credits.
            </p>

            {/* Blue instruction bar */}
            <div style={{
              background: "#dbeafe",
              border: "1px solid #93c5fd",
              borderRadius: 6,
              padding: "9px 14px",
              marginBottom: 14,
              color: "#1d4ed8",
              fontSize: 13.5,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}>
              <span style={{ fontSize: 16 }}>&#9660;</span>
              Modify the values and click the <strong style={{ marginLeft: 3 }}>Calculate</strong> button to use
            </div>

            {/* Gray input box */}
            <div style={{
              background: "#f5f5f5",
              border: "1px solid #ddd",
              borderRadius: 8,
              padding: "14px 14px 6px",
            }}>
              <div className="row two" style={{ gap: 14, marginBottom: 0 }}>
                <div className="field">
                  <label style={fieldLabelStyle}>Current GPA</label>
                  <input
                    type="number"
                    placeholder="e.g. 3.20"
                    min="0" max="4" step="0.01"
                    value={plan.currentGPA}
                    onChange={(e) => setPlan(p => ({ ...p, currentGPA: e.target.value }))}
                    style={planInputStyle}
                  />
                </div>
                <div className="field">
                  <label style={fieldLabelStyle}>Target GPA</label>
                  <input
                    type="number"
                    placeholder="e.g. 3.50"
                    min="0" max="4" step="0.01"
                    value={plan.targetGPA}
                    onChange={(e) => setPlan(p => ({ ...p, targetGPA: e.target.value }))}
                    style={planInputStyle}
                  />
                </div>
                <div className="field">
                  <label style={fieldLabelStyle}>Current Credits Completed</label>
                  <input
                    type="number"
                    placeholder="e.g. 45"
                    min="0" step="1"
                    value={plan.currentCredits}
                    onChange={(e) => setPlan(p => ({ ...p, currentCredits: e.target.value }))}
                    style={planInputStyle}
                  />
                </div>
                <div className="field">
                  <label style={fieldLabelStyle}>Additional Credits Planned</label>
                  <input
                    type="number"
                    placeholder="e.g. 15"
                    min="1" step="1"
                    value={plan.additionalCredits}
                    onChange={(e) => setPlan(p => ({ ...p, additionalCredits: e.target.value }))}
                    style={planInputStyle}
                  />
                </div>
              </div>

              <div className="row two rng-btn-row" style={{ marginTop: 14, marginBottom: 14 }}>
                <button type="button" className="btn-primary" onClick={calculate2}>Calculate</button>
                <button type="button" className="btn-secondary" onClick={clear2}>Clear</button>
              </div>
            </div>

            {error2 && <div className="rng-error" style={{ marginTop: 10 }}>{error2}</div>}
          </section>

        </div>

        {/* ===== Sidebar ===== */}
        <aside className="rng-sidebar">
          {/* Search box */}
          <div className="card rng-sidebar-card" style={{ marginBottom: 16 }}>
            <h3 className="rng-sidebar-title">Search</h3>
            <input
              type="text"
              placeholder="Search calculators..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                border: "1.5px solid rgba(99,102,241,0.2)",
                borderRadius: 8,
                padding: "8px 10px",
                fontSize: 13,
                color: "#1e1b4b",
                background: "#f8f9ff",
                outline: "none",
              }}
            />
          </div>

          {/* Other Calculators */}
          <div className="card rng-sidebar-card">
            <h3 className="rng-sidebar-title">Other Calculators</h3>
            <ul className="rng-sidebar-list">
              {filteredLinks.map((lnk) => (
                <li key={lnk.to}>
                  <Link
                    to={lnk.to}
                    className={
                      lnk.to === "/gpa-calculator"
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
