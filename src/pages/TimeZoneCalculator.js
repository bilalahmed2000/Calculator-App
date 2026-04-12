import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

const ZONES = [
  { label: "UTC",                       tz: "UTC" },
  { label: "London (GMT/BST)",          tz: "Europe/London" },
  { label: "Paris / Berlin (CET)",      tz: "Europe/Paris" },
  { label: "Helsinki (EET)",            tz: "Europe/Helsinki" },
  { label: "Moscow (MSK)",              tz: "Europe/Moscow" },
  { label: "Dubai (GST)",               tz: "Asia/Dubai" },
  { label: "Karachi (PKT)",             tz: "Asia/Karachi" },
  { label: "Kolkata (IST)",             tz: "Asia/Kolkata" },
  { label: "Dhaka (BST)",               tz: "Asia/Dhaka" },
  { label: "Bangkok (ICT)",             tz: "Asia/Bangkok" },
  { label: "Singapore / Beijing (SGT)", tz: "Asia/Singapore" },
  { label: "Tokyo (JST)",               tz: "Asia/Tokyo" },
  { label: "Sydney (AEST)",             tz: "Australia/Sydney" },
  { label: "Auckland (NZST)",           tz: "Pacific/Auckland" },
  { label: "Honolulu (HST)",            tz: "Pacific/Honolulu" },
  { label: "Los Angeles (PT)",          tz: "America/Los_Angeles" },
  { label: "Denver (MT)",               tz: "America/Denver" },
  { label: "Chicago (CT)",              tz: "America/Chicago" },
  { label: "New York (ET)",             tz: "America/New_York" },
  { label: "São Paulo (BRT)",           tz: "America/Sao_Paulo" },
];

function formatInZone(date, tz) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      weekday: "short", year: "numeric", month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true,
    }).format(date);
  } catch { return "—"; }
}

function getOffset(tz) {
  try {
    const d = new Date();
    const utcStr = new Intl.DateTimeFormat("en-CA", { timeZone: "UTC", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(d);
    const tzStr  = new Intl.DateTimeFormat("en-CA", { timeZone: tz,    year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }).format(d);
    const parse = s => { const [dt, tm] = s.split(", "); const [y,mo,da] = dt.split("-"); const [h,mi,se] = tm.split(":"); return new Date(Date.UTC(+y,+mo-1,+da,+h,+mi,+se)); };
    const diff = (parse(tzStr) - parse(utcStr)) / 60000;
    const sign = diff >= 0 ? "+" : "-";
    const h = Math.floor(Math.abs(diff) / 60).toString().padStart(2, "0");
    const m = (Math.abs(diff) % 60).toString().padStart(2, "0");
    return `UTC${sign}${h}:${m}`;
  } catch { return ""; }
}

const nowLocal = () => {
  const n = new Date();
  const pad = v => v.toString().padStart(2, "0");
  return `${n.getFullYear()}-${pad(n.getMonth()+1)}-${pad(n.getDate())}T${pad(n.getHours())}:${pad(n.getMinutes())}`;
};

export default function TimeZoneCalculator() {
  const [fromTz, setFromTz] = useState("America/New_York");
  const [toTz,   setToTz]   = useState("Europe/London");
  const [datetime, setDatetime] = useState(nowLocal);

  const result = useMemo(() => {
    if (!datetime) return null;
    try {
      // Parse the local datetime string as if it's in fromTz
      const [datePart, timePart] = datetime.split("T");
      const [y, mo, da] = datePart.split("-").map(Number);
      const [h, mi] = timePart.split(":").map(Number);

      // Create a Date object representing that moment in fromTz
      const fmt = new Intl.DateTimeFormat("en-CA", {
        timeZone: fromTz,
        year: "numeric", month: "2-digit", day: "2-digit",
        hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
      });

      // We need to find the UTC time that corresponds to the entered local time in fromTz.
      // Use a binary search approach: estimate, then adjust.
      let estimate = new Date(Date.UTC(y, mo - 1, da, h, mi, 0));
      for (let i = 0; i < 3; i++) {
        const parts = fmt.formatToParts(estimate);
        const get = type => parseInt(parts.find(p => p.type === type).value);
        const diff = estimate - new Date(Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second")));
        estimate = new Date(Date.UTC(y, mo - 1, da, h, mi, 0) + diff);
      }

      const converted = formatInZone(estimate, toTz);
      const fromStr   = formatInZone(estimate, fromTz);
      const fromOff   = getOffset(fromTz);
      const toOff     = getOffset(toTz);

      return { converted, fromStr, fromOff, toOff };
    } catch { return null; }
  }, [datetime, fromTz, toTz]);

  const allOffsets = useMemo(() => ZONES.map(z => ({ ...z, converted: result ? formatInZone(
    (() => {
      try {
        const [datePart, timePart] = datetime.split("T");
        const [y, mo, da] = datePart.split("-").map(Number);
        const [h, mi] = timePart.split(":").map(Number);
        const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: fromTz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
        let estimate = new Date(Date.UTC(y, mo - 1, da, h, mi, 0));
        for (let i = 0; i < 3; i++) {
          const parts = fmt.formatToParts(estimate);
          const get = type => parseInt(parts.find(p => p.type === type).value);
          const diff = estimate - new Date(Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second")));
          estimate = new Date(Date.UTC(y, mo - 1, da, h, mi, 0) + diff);
        }
        return estimate;
      } catch { return new Date(); }
    })(), z.tz
  ) : "—", offset: getOffset(z.tz) })), [result, datetime, fromTz]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Time Zone Calculator</h1>
        <p className="muted">
          Convert time between any two time zones and view the equivalent time across
          major cities worldwide.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Convert Time</h2>

          <div className="row">
            <div className="field">
              <label>Date & Time</label>
              <input type="datetime-local" value={datetime} onChange={e => setDatetime(e.target.value)} />
            </div>
          </div>

          <div className="row two">
            <div className="field">
              <label>From Time Zone</label>
              <select value={fromTz} onChange={e => setFromTz(e.target.value)}>
                {ZONES.map(z => <option key={z.tz} value={z.tz}>{z.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label>To Time Zone</label>
              <select value={toTz} onChange={e => setToTz(e.target.value)}>
                {ZONES.map(z => <option key={z.tz} value={z.tz}>{z.label}</option>)}
              </select>
            </div>
          </div>

          {result && (
            <div style={{ marginTop: 14, padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>Converted Time</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: "#4f46e5", fontFamily: "monospace" }}>{result.converted}</div>
              <div style={{ fontSize: 12, color: "#6b7a9e", marginTop: 6 }}>
                {ZONES.find(z => z.tz === toTz)?.label} &nbsp;·&nbsp; {result.toOff}
              </div>
            </div>
          )}

          <table className="table" style={{ marginTop: 16 }}>
            <thead><tr><th>Zone</th><th>From (input)</th><th>UTC Offset</th></tr></thead>
            <tbody>
              {result && (
                <>
                  <tr style={{ background: "#f0eeff" }}>
                    <td><strong>{ZONES.find(z => z.tz === fromTz)?.label}</strong></td>
                    <td style={{ fontFamily: "monospace", fontSize: 12 }}>{result.fromStr}</td>
                    <td style={{ fontFamily: "monospace" }}>{result.fromOff}</td>
                  </tr>
                  <tr style={{ background: "#f0eeff" }}>
                    <td><strong>{ZONES.find(z => z.tz === toTz)?.label}</strong></td>
                    <td style={{ fontFamily: "monospace", fontSize: 12 }}>{result.converted}</td>
                    <td style={{ fontFamily: "monospace" }}>{result.toOff}</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>
        </section>

        <section className="card">
          <h2 className="card-title">World Clock</h2>
          <p className="small">Equivalent time in major cities for the entered time.</p>
          <table className="table">
            <thead><tr><th>City / Zone</th><th>Time</th><th>Offset</th></tr></thead>
            <tbody>
              {allOffsets.map(z => (
                <tr key={z.tz} style={z.tz === toTz ? { background: "#f0eeff" } : {}}>
                  <td style={{ fontSize: 13 }}>{z.label}</td>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{z.converted}</td>
                  <td style={{ fontFamily: "monospace", fontSize: 12 }}>{z.offset}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
