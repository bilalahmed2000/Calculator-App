import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

/* ===== Helpers ===== */
const toSeconds = (h, m, s) => h * 3600 + m * 60 + s;

const fromSeconds = (t) => ({
  h: Math.floor(t / 3600),
  m: Math.floor((t % 3600) / 60),
  s: Math.floor(t % 60),
});

export default function TimeCalculator() {
  /* ================= ADD / SUBTRACT ================= */
  const [h1, setH1] = useState(0);
  const [m1, setM1] = useState(0);
  const [s1, setS1] = useState(0);

  const [h2, setH2] = useState(0);
  const [m2, setM2] = useState(0);
  const [s2, setS2] = useState(0);

  const [mode, setMode] = useState("add");

  const addResult = useMemo(() => {
    let total =
      mode === "add"
        ? toSeconds(h1, m1, s1) + toSeconds(h2, m2, s2)
        : toSeconds(h1, m1, s1) - toSeconds(h2, m2, s2);

    if (total < 0) total = 0;
    return fromSeconds(total);
  }, [h1, m1, s1, h2, m2, s2, mode]);

  /* ================= TIME BETWEEN ================= */
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const betweenResult = useMemo(() => {
    if (!startTime || !endTime) return null;

    const [sh, sm] = startTime.split(":").map(Number);
    const [eh, em] = endTime.split(":").map(Number);

    let diff = toSeconds(eh, em, 0) - toSeconds(sh, sm, 0);
    if (diff < 0) diff += 86400;

    return fromSeconds(diff);
  }, [startTime, endTime]);

  /* ================= DURATION ================= */
  const [seconds, setSeconds] = useState(0);

  const duration = useMemo(
    () => fromSeconds(Number(seconds)),
    [seconds]
  );

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Time Calculator</h1>
        <p className="muted">
          Add or subtract time, calculate time difference, and convert durations.
        </p>
      </header>

      <div className="calc-grid">
        {/* ================= ADD / SUBTRACT ================= */}
        <section className="card">
          <h2 className="card-title">Add or Subtract Time</h2>

          <div className="row three">
            <div className="field">
              <label>Hours</label>
              <input type="number" value={h1} onChange={(e) => setH1(+e.target.value)} />
            </div>
            <div className="field">
              <label>Minutes</label>
              <input type="number" value={m1} onChange={(e) => setM1(+e.target.value)} />
            </div>
            <div className="field">
              <label>Seconds</label>
              <input type="number" value={s1} onChange={(e) => setS1(+e.target.value)} />
            </div>
          </div>

          <div className="row three">
            <div className="field">
              <label>Hours</label>
              <input type="number" value={h2} onChange={(e) => setH2(+e.target.value)} />
            </div>
            <div className="field">
              <label>Minutes</label>
              <input type="number" value={m2} onChange={(e) => setM2(+e.target.value)} />
            </div>
            <div className="field">
              <label>Seconds</label>
              <input type="number" value={s2} onChange={(e) => setS2(+e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label>Operation</label>
            <select value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="add">Add</option>
              <option value="subtract">Subtract</option>
            </select>
          </div>

          <div className="kpi">
            <div className="kpi-label">Result</div>
            <div className="kpi-value">
              {addResult.h}h {addResult.m}m {addResult.s}s
            </div>
          </div>
        </section>

        {/* ================= TIME BETWEEN ================= */}
        <section className="card">
          <h2 className="card-title">Time Between Two Times</h2>

          <div className="row two">
            <div className="field">
              <label>Start Time</label>
              <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div className="field">
              <label>End Time</label>
              <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
            </div>
          </div>

          {betweenResult ? (
            <div className="kpi">
              <div className="kpi-label">Difference</div>
              <div className="kpi-value">
                {betweenResult.h}h {betweenResult.m}m {betweenResult.s}s
              </div>
            </div>
          ) : (
            <p className="small">Select both times to calculate.</p>
          )}
        </section>

        {/* ================= DURATION ================= */}
        <section className="card">
          <h2 className="card-title">Time Duration</h2>

          <div className="field">
            <label>Total Seconds</label>
            <input
              type="number"
              value={seconds}
              onChange={(e) => setSeconds(e.target.value)}
            />
          </div>

          <div className="kpi">
            <div className="kpi-label">Converted Time</div>
            <div className="kpi-value">
              {duration.h}h {duration.m}m {duration.s}s
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
