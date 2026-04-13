import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const CYCLE = 90; // minutes per sleep cycle
const FALL_ASLEEP = 14; // avg minutes to fall asleep

function addMinutes(timeStr, mins) {
  const [h, m] = timeStr.split(":").map(Number);
  const total  = h * 60 + m + mins;
  const hh = Math.floor(((total % 1440) + 1440) % 1440 / 60);
  const mm = ((total % 1440) + 1440) % 1440 % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
}

function to12h(t24) {
  const [h, m] = t24.split(":").map(Number);
  const ampm = h < 12 ? "AM" : "PM";
  const h12  = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

function diffMins(from, to) {
  const [fh,fm] = from.split(":").map(Number);
  const [th,tm] = to.split(":").map(Number);
  let diff = (th * 60 + tm) - (fh * 60 + fm);
  if (diff < 0) diff += 1440;
  return diff;
}

const qualityLabels = [
  { cycles: 6, label: "Optimal (9h)", color: "#16a34a" },
  { cycles: 5, label: "Great (7.5h)",  color: "#4f46e5" },
  { cycles: 4, label: "Good (6h)",     color: "#4f46e5" },
  { cycles: 3, label: "Minimum (4.5h)",color: "#d97706" },
  { cycles: 2, label: "Poor (3h)",     color: "#dc2626" },
];

export default function SleepCalculator() {
  const [mode,    setMode]    = useState("wakeup");  // wakeup | bedtime
  const [time,    setTime]    = useState("06:30");
  const [now,     setNow]     = useState(() => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  });

  const times = useMemo(() => {
    if (mode === "wakeup") {
      // I want to wake up at [time] — when should I go to sleep?
      return qualityLabels.map(q => ({
        ...q,
        bedtime: addMinutes(time, -(q.cycles * CYCLE + FALL_ASLEEP)),
        wakeup:  time,
        sleepMins: q.cycles * CYCLE,
      }));
    } else {
      // I need to fall asleep at [time] — when will I wake up?
      const actualSleep = addMinutes(time, FALL_ASLEEP);
      return qualityLabels.map(q => ({
        ...q,
        bedtime:  time,
        wakeup:   addMinutes(actualSleep, q.cycles * CYCLE),
        sleepMins: q.cycles * CYCLE,
      }));
    }
  }, [mode, time]);

  const nowSuggestion = useMemo(() => {
    // If sleeping now, when to wake up
    const actualSleep = addMinutes(now, FALL_ASLEEP);
    return qualityLabels.map(q => ({
      ...q,
      wakeup: addMinutes(actualSleep, q.cycles * CYCLE),
      sleepMins: q.cycles * CYCLE,
    }));
  }, [now]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Sleep Calculator</h1>
        <p className="muted">Calculate the best bedtimes and wake-up times based on 90-minute sleep cycles to wake up feeling refreshed.</p>
      </header>
      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Sleep Schedule</h2>
          <div className="tab-row">
            <button className={`tab-btn${mode === "wakeup" ? " active" : ""}`} onClick={() => setMode("wakeup")}>I want to wake up at…</button>
            <button className={`tab-btn${mode === "bedtime" ? " active" : ""}`} onClick={() => setMode("bedtime")}>I plan to sleep at…</button>
          </div>

          <div className="row two" style={{ marginTop: 14 }}>
            <div className="field">
              <label>{mode === "wakeup" ? "Wake-up Time" : "Bedtime (lights out)"}</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)} />
            </div>
          </div>

          <table className="table" style={{ marginTop: 14 }}>
            <thead>
              <tr>
                <th>{mode === "wakeup" ? "Go to Sleep At" : "Wake Up At"}</th>
                <th>Sleep Duration</th>
                <th>Cycles</th>
                <th>Quality</th>
              </tr>
            </thead>
            <tbody>
              {times.map((t, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700, fontSize: 15, color: "#4f46e5" }}>
                    {to12h(mode === "wakeup" ? t.bedtime : t.wakeup)}
                  </td>
                  <td style={{ fontFamily: "monospace" }}>{Math.floor(t.sleepMins / 60)}h {t.sleepMins % 60}m</td>
                  <td style={{ fontFamily: "monospace", textAlign: "center" }}>{t.cycles}</td>
                  <td style={{ color: t.color, fontWeight: 700, fontSize: 12 }}>{t.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="small" style={{ marginTop: 8 }}>* Assumes ~{FALL_ASLEEP} minutes to fall asleep. Times based on 90-minute sleep cycles.</p>
        </section>

        <section className="card">
          <h2 className="card-title">If I Sleep Right Now…</h2>
          <div className="row two">
            <div className="field"><label>Current Time</label>
              <input type="time" value={now} onChange={e => setNow(e.target.value)} /></div>
          </div>
          <table className="table" style={{ marginTop: 14, marginBottom: 14 }}>
            <thead><tr><th>Wake Up At</th><th>Sleep</th><th>Quality</th></tr></thead>
            <tbody>
              {nowSuggestion.map((t, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 700, fontSize: 15, color: "#4f46e5" }}>{to12h(t.wakeup)}</td>
                  <td style={{ fontFamily: "monospace" }}>{Math.floor(t.sleepMins / 60)}h {t.sleepMins % 60}m</td>
                  <td style={{ color: t.color, fontWeight: 700, fontSize: 12 }}>{t.label}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3 className="card-title">Sleep Recommendations by Age</h3>
          <table className="table">
            <thead><tr><th>Age Group</th><th>Recommended Sleep</th></tr></thead>
            <tbody>
              {[["Newborn (0–3 mo)","14–17 hours"],["Infant (4–11 mo)","12–15 hours"],["Toddler (1–2 yr)","11–14 hours"],["Preschool (3–5 yr)","10–13 hours"],["School age (6–13)","9–11 hours"],["Teen (14–17)","8–10 hours"],["Young adult (18–25)","7–9 hours"],["Adult (26–64)","7–9 hours"],["Older adult (65+)","7–8 hours"]].map(([a,r]) =>
                <tr key={a}><td style={{ fontSize: 13 }}>{a}</td><td style={{ fontFamily: "monospace" }}>{r}</td></tr>
              )}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
