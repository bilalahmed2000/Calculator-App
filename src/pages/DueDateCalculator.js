import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/CalcBase.css";

/* ══════════════════════════════════════════════════════════
   CONSTANTS & HELPERS
══════════════════════════════════════════════════════════ */
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const thisYear = new Date().getFullYear();
// years: 2 back, 2 ahead (covers recent LMP + upcoming transfers)
const YEARS_PAST = Array.from({ length: 3 }, (_, i) => thisYear - 2 + i);

const daysInMonth = (m, y) => new Date(y, m, 0).getDate(); // m is 1-based

const addDays = (date, n) => {
  const d = new Date(date);
  d.setDate(d.getDate() + Math.round(n));
  return d;
};

const today = new Date();

/** Format date as "Mar 15, 2026" */
const fmtDate = (d) =>
  d instanceof Date && isFinite(d)
    ? d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

/** Convert picker state {month, day, year} → JS Date */
const pickerToDate = ({ month, day, year }) => new Date(year, month - 1, day);

/** Default picker state = today */
const defaultPicker = () => ({
  month: today.getMonth() + 1,
  day:   today.getDate(),
  year:  today.getFullYear(),
});

/* ── Build milestone table from LMP (JS Date) ── */
function buildMilestones(lmp) {
  const dueDate          = addDays(lmp, 280);              // 40 weeks
  const conceptionEst    = addDays(lmp, 14);               // ovulation ~day 14
  const t1End            = addDays(lmp, 13 * 7);           // end of week 13
  const t2End            = addDays(lmp, 26 * 7);           // end of week 26
  const t3Start          = addDays(lmp, 27 * 7);           // week 27
  const fullTermStart    = addDays(lmp, 37 * 7);           // 37 weeks
  const latestDue        = addDays(lmp, 42 * 7);           // 42 weeks

  // Gestational age today (days since LMP)
  const gestDays  = Math.max(0, Math.floor((today - lmp) / 86_400_000));
  const gestWeeks = Math.floor(gestDays / 7);
  const gestRem   = gestDays % 7;

  return { dueDate, conceptionEst, lmp, t1End, t2End, t3Start, fullTermStart, latestDue, gestWeeks, gestRem };
}

/* ══════════════════════════════════════════════════════════
   DATE PICKER SUB-COMPONENT
══════════════════════════════════════════════════════════ */
function DatePicker({ label, value, onChange }) {
  const maxDay = daysInMonth(value.month, value.year);
  const days   = Array.from({ length: maxDay }, (_, i) => i + 1);

  const update = (key, val) => {
    const next = { ...value, [key]: Number(val) };
    const limit = daysInMonth(next.month, next.year);
    if (next.day > limit) next.day = limit;
    onChange(next);
  };

  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={LS.label}>{label}</label>}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <select style={LS.sel} value={value.month} onChange={(e) => update("month", e.target.value)}>
          {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
        </select>
        <select style={{ ...LS.sel, maxWidth: 72 }} value={value.day} onChange={(e) => update("day", e.target.value)}>
          {days.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select style={{ ...LS.sel, maxWidth: 88 }} value={value.year} onChange={(e) => update("year", e.target.value)}>
          {YEARS_PAST.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   INLINE STYLES
══════════════════════════════════════════════════════════ */
const LS = {
  label: {
    display: "block", fontSize: 11, fontWeight: 700,
    color: "#6b7a9e", marginBottom: 6,
    letterSpacing: "0.4px", textTransform: "uppercase",
  },
  sel: {
    flex: 1, minWidth: 100,
    padding: "9px 10px", fontSize: 14, fontWeight: 600,
    color: "#1e1b4b", background: "#f8f9ff",
    border: "1.5px solid rgba(99,102,241,0.22)",
    borderRadius: 10, outline: "none", cursor: "pointer",
  },
  numInput: {
    width: 72, padding: "9px 10px", fontSize: 14, fontWeight: 600,
    color: "#1e1b4b", background: "#f8f9ff",
    border: "1.5px solid rgba(99,102,241,0.22)",
    borderRadius: 10, outline: "none", textAlign: "center",
  },
  row: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  unit: { fontSize: 14, fontWeight: 600, color: "#6b7a9e" },
  divider: { height: 1, background: "rgba(99,102,241,0.1)", margin: "18px 0" },
  errBox: {
    background: "#fef2f2", border: "1px solid #fca5a5",
    color: "#dc2626", borderRadius: 10,
    padding: "10px 14px", marginBottom: 14, fontSize: 13.5,
  },
  resultHeader: {
    background: "rgba(16,185,129,0.10)",
    border: "1px solid rgba(16,185,129,0.28)",
    borderRadius: 14, padding: "16px 20px", marginBottom: 20,
  },
  milestoneRow: (highlight) => ({
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "9px 14px",
    background: highlight ? "#f0eeff" : "transparent",
    borderRadius: 8, marginBottom: 4,
  }),
  milestoneLabel: (highlight) => ({
    fontSize: 13.5, color: highlight ? "#4f46e5" : "#4b5280",
    fontWeight: highlight ? 700 : 400,
  }),
  milestoneVal: (highlight) => ({
    fontSize: 13.5, color: highlight ? "#4f46e5" : "#1e1b4b",
    fontWeight: highlight ? 800 : 600,
  }),
};

/* ══════════════════════════════════════════════════════════
   MILESTONE ROW
══════════════════════════════════════════════════════════ */
function MRow({ label, value, highlight }) {
  return (
    <div style={LS.milestoneRow(highlight)}>
      <span style={LS.milestoneLabel(highlight)}>{label}</span>
      <span style={LS.milestoneVal(highlight)}>{value}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   CYCLE LENGTH OPTIONS  (20 – 45 days, like calculator.net)
══════════════════════════════════════════════════════════ */
const CYCLE_OPTIONS = Array.from({ length: 26 }, (_, i) => i + 20);

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
export default function DueDateCalculator() {
  /* ── mode ── */
  const [mode, setMode] = useState("lmp");          // "lmp" | "ultrasound" | "conception"

  /* ── LMP fields ── */
  const [lmpDate,   setLmpDate]   = useState(defaultPicker());
  const [cycleLen,  setCycleLen]  = useState(28);

  /* ── Ultrasound fields ── */
  const [usDate,    setUsDate]    = useState(defaultPicker());
  const [usWeeks,   setUsWeeks]   = useState(20);
  const [usDays,    setUsDays]    = useState(0);

  /* ── Conception / IVF fields ── */
  const [concMode,   setConcMode]   = useState("conception"); // "conception" | "ivf"
  const [concDate,   setConcDate]   = useState(defaultPicker());
  const [ivfDate,    setIvfDate]    = useState(defaultPicker());
  const [embryoDay,  setEmbryoDay]  = useState(5);            // 3 or 5

  /* ── output ── */
  const [result, setResult] = useState(null);
  const [error,  setError]  = useState("");

  /* ══════════════════════════════
     CALCULATE
  ══════════════════════════════ */
  const calculate = () => {
    setError("");
    let lmp;

    try {
      if (mode === "lmp") {
        const base = pickerToDate(lmpDate);
        if (!isFinite(base)) { setError("Please enter a valid last menstrual period date."); return; }
        // Naegele adjusted: LMP + 280 + (cycleLen − 28)
        const totalDays = 280 + (cycleLen - 28);
        lmp = base;
        const milestones = buildMilestones(lmp);
        // Adjust dueDate for cycle length deviation
        milestones.dueDate    = addDays(lmp, totalDays);
        milestones.latestDue  = addDays(lmp, totalDays - 280 + 42 * 7);
        milestones.fullTermStart = addDays(lmp, totalDays - 280 + 37 * 7);
        setResult({ ...milestones, showConception: true });

      } else if (mode === "ultrasound") {
        const usDt = pickerToDate(usDate);
        if (!isFinite(usDt)) { setError("Please enter a valid ultrasound date."); return; }
        if (usWeeks === 0 && usDays === 0) { setError("Please enter gestational age at ultrasound."); return; }
        const gaInDays = usWeeks * 7 + usDays;
        lmp = addDays(usDt, -gaInDays);
        setResult({ ...buildMilestones(lmp), showConception: true });

      } else {
        // Conception / IVF
        if (concMode === "conception") {
          const cDt = pickerToDate(concDate);
          if (!isFinite(cDt)) { setError("Please enter a valid conception date."); return; }
          lmp = addDays(cDt, -14);
        } else {
          const tDt = pickerToDate(ivfDate);
          if (!isFinite(tDt)) { setError("Please enter a valid transfer date."); return; }
          // Fertilization occurred embryoDay days before transfer
          const fertilization = addDays(tDt, -embryoDay);
          lmp = addDays(fertilization, -14);
        }
        setResult({ ...buildMilestones(lmp), showConception: concMode === "ivf" });
      }
    } catch {
      setError("An error occurred. Please check your inputs.");
    }
  };

  /* ══════════════════════════════
     CLEAR
  ══════════════════════════════ */
  const clear = () => {
    setResult(null); setError("");
    setLmpDate(defaultPicker()); setCycleLen(28);
    setUsDate(defaultPicker()); setUsWeeks(20); setUsDays(0);
    setConcDate(defaultPicker()); setIvfDate(defaultPicker()); setEmbryoDay(5);
    setConcMode("conception");
  };

  /* ══════════════════════════════
     RENDER
  ══════════════════════════════ */
  return (
    <div className="calc-wrap">
      {/* ── Hero ── */}
      <header className="calc-hero">
        <h1>Due Date Calculator</h1>
        <p className="muted">
          The Due Date Calculator estimates the delivery date of a pregnant woman
          based on her last menstrual period (LMP), ultrasound, conception date,
          or IVF transfer date.
        </p>
      </header>

      <div style={{ maxWidth: 780, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ══════════════════════════════
            FORM CARD
        ══════════════════════════════ */}
        <section className="card">

          {/* ── Estimate Based On ── */}
          <div style={{ marginBottom: 20 }}>
            <label style={LS.label}>Estimate Based On:</label>
            <select
              style={{ ...LS.sel, width: "100%", flex: "none" }}
              value={mode}
              onChange={(e) => { setMode(e.target.value); setResult(null); setError(""); }}
            >
              <option value="lmp">Last Period (LMP)</option>
              <option value="ultrasound">Ultrasound</option>
              <option value="conception">Conception Date / IVF Transfer Date</option>
            </select>
          </div>

          <div style={LS.divider} />

          {/* ═══════════ MODE: LAST PERIOD ═══════════ */}
          {mode === "lmp" && (
            <>
              <DatePicker
                label="First Day of Your Last Period:"
                value={lmpDate}
                onChange={setLmpDate}
              />
              <div style={{ marginBottom: 16 }}>
                <label style={LS.label}>Average Length of Your Cycles:</label>
                <div style={LS.row}>
                  <select
                    style={{ ...LS.sel, maxWidth: 100 }}
                    value={cycleLen}
                    onChange={(e) => setCycleLen(Number(e.target.value))}
                  >
                    {CYCLE_OPTIONS.map((n) => (
                      <option key={n} value={n}>{n}</option>
                    ))}
                  </select>
                  <span style={LS.unit}>days&nbsp;
                    <span style={{ fontSize: 12, color: "#9ca3af" }}>(default: 28)</span>
                  </span>
                </div>
              </div>
            </>
          )}

          {/* ═══════════ MODE: ULTRASOUND ═══════════ */}
          {mode === "ultrasound" && (
            <>
              <DatePicker
                label="Ultrasound Date:"
                value={usDate}
                onChange={setUsDate}
              />
              <div style={{ marginBottom: 16 }}>
                <label style={LS.label}>Gestational Age at Ultrasound:</label>
                <div style={LS.row}>
                  <input
                    type="number" min="0" max="43"
                    style={LS.numInput}
                    value={usWeeks}
                    onChange={(e) => setUsWeeks(Math.max(0, Math.min(43, Number(e.target.value))))}
                  />
                  <span style={LS.unit}>weeks</span>
                  <input
                    type="number" min="0" max="6"
                    style={LS.numInput}
                    value={usDays}
                    onChange={(e) => setUsDays(Math.max(0, Math.min(6, Number(e.target.value))))}
                  />
                  <span style={LS.unit}>days</span>
                </div>
              </div>
            </>
          )}

          {/* ═══════════ MODE: CONCEPTION / IVF ═══════════ */}
          {mode === "conception" && (
            <>
              {/* Sub-toggle */}
              <div style={{ display: "flex", gap: 0, marginBottom: 18, borderRadius: 10, overflow: "hidden", border: "1.5px solid rgba(99,102,241,0.22)" }}>
                {[
                  { val: "conception", label: "Conception Date" },
                  { val: "ivf",        label: "IVF Transfer Date" },
                ].map((opt) => (
                  <button
                    key={opt.val}
                    onClick={() => setConcMode(opt.val)}
                    style={{
                      flex: 1, padding: "9px 12px", border: "none", cursor: "pointer",
                      fontSize: 13.5, fontWeight: 700,
                      background: concMode === opt.val ? "#4f46e5" : "#f8f9ff",
                      color:      concMode === opt.val ? "#fff"    : "#6b7a9e",
                      transition: "background 0.15s",
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {concMode === "conception" && (
                <DatePicker
                  label="Conception Date:"
                  value={concDate}
                  onChange={setConcDate}
                />
              )}

              {concMode === "ivf" && (
                <>
                  <DatePicker
                    label="IVF Transfer Date:"
                    value={ivfDate}
                    onChange={setIvfDate}
                  />
                  <div style={{ marginBottom: 16 }}>
                    <label style={LS.label}>Embryo Age at Transfer:</label>
                    <div style={LS.row}>
                      {[
                        { val: 3, label: "Day 3 Embryo" },
                        { val: 5, label: "Day 5 Blastocyst" },
                      ].map((opt) => (
                        <label
                          key={opt.val}
                          style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", fontSize: 14, color: "#1e1b4b", fontWeight: 600 }}
                        >
                          <input
                            type="radio"
                            name="embryoDay"
                            value={opt.val}
                            checked={embryoDay === opt.val}
                            onChange={() => setEmbryoDay(opt.val)}
                            style={{ accentColor: "#4f46e5" }}
                          />
                          {opt.label}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          {/* ── Error ── */}
          {error && <div style={LS.errBox}>{error}</div>}

          {/* ── Buttons ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
            <button
              onClick={calculate}
              style={{ padding: "12px", borderRadius: 12, border: "none", cursor: "pointer", fontWeight: 700, fontSize: 14, background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff", boxShadow: "0 4px 14px rgba(79,70,229,0.3)" }}
            >
              Calculate
            </button>
            <button
              onClick={clear}
              style={{ padding: "12px", borderRadius: 12, border: "1.5px solid rgba(99,102,241,0.22)", cursor: "pointer", fontWeight: 700, fontSize: 14, background: "#fff", color: "#6b7a9e" }}
            >
              Clear
            </button>
          </div>
        </section>

        {/* ══════════════════════════════
            RESULTS CARD
        ══════════════════════════════ */}
        {result && (
          <section className="card">

            {/* Green due date header */}
            <div style={LS.resultHeader}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#065f46", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
                Estimated Due Date
              </div>
              <div style={{ fontSize: 30, fontWeight: 900, color: "#065f46", letterSpacing: "-0.5px" }}>
                {fmtDate(result.dueDate)}
              </div>
              <div style={{ marginTop: 10, fontSize: 13.5, color: "#065f46", opacity: 0.85 }}>
                {result.gestWeeks > 0 || result.gestRem > 0
                  ? <>Current gestational age: <strong>{result.gestWeeks} week{result.gestWeeks !== 1 ? "s" : ""} and {result.gestRem} day{result.gestRem !== 1 ? "s" : ""}</strong></>
                  : <em>Conception has not yet occurred based on the dates entered.</em>
                }
              </div>
            </div>

            {/* Milestone dates */}
            <div style={{ marginBottom: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>
                Key Dates
              </div>
              <MRow label="Estimated Due Date"                    value={fmtDate(result.dueDate)}        highlight />
              <MRow label="Last Menstrual Period (LMP)"           value={fmtDate(result.lmp)} />
              {result.showConception && (
                <MRow label="Estimated Conception Date"           value={fmtDate(result.conceptionEst)} />
              )}
              <MRow label="End of 1st Trimester (Week 13)"        value={fmtDate(result.t1End)} />
              <MRow label="End of 2nd Trimester (Week 26)"        value={fmtDate(result.t2End)} />
              <MRow label="Start of 3rd Trimester (Week 27)"      value={fmtDate(result.t3Start)} />
              <MRow label="Baby is Full Term (Week 37)"           value={fmtDate(result.fullTermStart)} />
              <MRow label="Latest Due Date (Week 42)"             value={fmtDate(result.latestDue)} />
            </div>

            {/* Trimester timeline */}
            <div style={{ marginTop: 22 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 10 }}>
                Trimester Timeline (40 weeks)
              </div>
              <div style={{ display: "flex", height: 26, borderRadius: 10, overflow: "hidden", gap: 2 }}>
                {[
                  { label: "1st Trimester (Wks 1–13)", flex: 13, color: "#a5b4fc" },
                  { label: "2nd Trimester (Wks 14–26)", flex: 13, color: "#818cf8" },
                  { label: "3rd Trimester (Wks 27–40)", flex: 14, color: "#4f46e5" },
                ].map((t) => (
                  <div key={t.label} style={{ flex: t.flex, background: t.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: "#fff", textAlign: "center", padding: "0 4px" }}>{t.label}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "#9ca3af" }}>
                <span>{fmtDate(result.lmp)}</span>
                <span>{fmtDate(result.dueDate)}</span>
              </div>
            </div>

            <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 18, lineHeight: 1.65 }}>
              All dates are estimates. Consult your healthcare provider for medical guidance.
              Actual delivery dates vary depending on individual circumstances.
            </p>
          </section>
        )}

        {/* ══════════════════════════════
            RELATED CALCULATORS
        ══════════════════════════════ */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#6b7a9e" }}>Related:</span>
          {[
            { label: "Pregnancy Calculator",             to: "/pregnancy-calculator" },
            { label: "Pregnancy Weight Gain Calculator", to: "/pregnancy-weight-gain-calculator" },
            { label: "Age Calculator",                   to: "/age-calculator" },
          ].map(({ label, to }) => (
            <Link
              key={to} to={to}
              style={{ padding: "7px 16px", borderRadius: 999, border: "1.5px solid rgba(99,102,241,0.28)", fontSize: 13, fontWeight: 600, color: "#4f46e5", textDecoration: "none", background: "#f5f3ff" }}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* ══════════════════════════════
            INFORMATIONAL TEXT
        ══════════════════════════════ */}
        <section className="card" style={{ lineHeight: 1.75, color: "#374151", fontSize: 14 }}>
          <h2 className="card-title">Estimation of Due Date</h2>

          <p>
            Pregnancy is typically measured in gestational age, starting from the first day of the woman's
            last menstrual period (LMP). A full-term pregnancy is considered to be <strong>40 weeks (280 days)</strong>
            from the LMP, which is approximately 38 weeks from conception.
          </p>

          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#312e81", margin: "18px 0 8px" }}>Last Menstrual Period (LMP)</h3>
          <p>
            The most common method for estimating a due date is using Naegele's Rule: add 280 days (40 weeks)
            to the first day of your last menstrual period. This is adjusted when the average cycle length
            differs from the standard 28-day cycle — add or subtract one day for each day the cycle differs
            from 28 days.
          </p>

          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#312e81", margin: "18px 0 8px" }}>Ultrasound</h3>
          <p>
            An ultrasound performed in early pregnancy (ideally before 14 weeks) can measure the size of
            the embryo or fetus to estimate gestational age. The ultrasound date and the reported gestational
            age in weeks and days are used to back-calculate the LMP equivalent, from which the due date is derived.
          </p>

          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#312e81", margin: "18px 0 8px" }}>Conception Date</h3>
          <p>
            If the conception date is known (e.g., from fertility tracking), the due date is estimated as
            <strong> conception date + 266 days</strong> (38 weeks). Conception typically occurs approximately
            14 days after the LMP for a 28-day cycle.
          </p>

          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#312e81", margin: "18px 0 8px" }}>IVF Transfer Date</h3>
          <p>
            For pregnancies achieved through in vitro fertilization (IVF), the due date is calculated from
            the embryo transfer date. A Day-3 embryo transfer adds 263 days (266 − 3); a Day-5 blastocyst
            transfer adds 261 days (266 − 5) to the transfer date.
          </p>

          <p style={{ marginTop: 14, padding: "12px 16px", background: "#f0eeff", borderRadius: 10, fontSize: 13, color: "#4b5280" }}>
            <strong>Note:</strong> Only about 4% of births occur on the estimated due date. The calculator
            provides an estimate — your healthcare provider may adjust dates based on clinical assessments.
          </p>
        </section>

      </div>
    </div>
  );
}
