import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

function parseTime(str) {
  if (!str) return null;
  const [h, m] = str.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return null;
  return h * 60 + m;
}

function fmtMinutes(total) {
  if (total < 0) return "—";
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h}h ${m.toString().padStart(2, "0")}m`;
}

function fmtDecimal(total) {
  if (total < 0) return "—";
  return (total / 60).toFixed(2) + " hrs";
}

const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const defaultRows = () => DAYS.map((day, i) => ({
  day,
  clockIn:  i < 5 ? "09:00" : "",
  clockOut: i < 5 ? "17:00" : "",
  break:    i < 5 ? "30"    : "0",
}));

export default function TimeCardCalculator() {
  const [rows, setRows] = useState(defaultRows);
  const [rate, setRate] = useState("15.00");
  const [overtimeAfter, setOvertimeAfter] = useState("8");

  const updateRow = (i, field, value) => {
    setRows(prev => {
      const next = [...prev];
      next[i] = { ...next[i], [field]: value };
      return next;
    });
  };

  const computed = useMemo(() => {
    const rateVal = parseFloat(rate) || 0;
    const otThreshold = parseFloat(overtimeAfter) * 60 || 480;

    let totalRegMins = 0, totalOtMins = 0;

    const rowData = rows.map(row => {
      const inMins  = parseTime(row.clockIn);
      const outMins = parseTime(row.clockOut);
      const brk     = parseInt(row.break) || 0;
      if (inMins === null || outMins === null || row.clockIn === "" || row.clockOut === "") {
        return { worked: null, regular: null, overtime: null };
      }
      let worked = outMins - inMins - brk;
      if (worked < 0) worked += 24 * 60; // overnight
      const regular  = Math.min(worked, otThreshold);
      const overtime = Math.max(0, worked - otThreshold);
      totalRegMins += regular;
      totalOtMins  += overtime;
      return { worked, regular, overtime };
    });

    const totalMins    = totalRegMins + totalOtMins;
    const regPay       = (totalRegMins / 60) * rateVal;
    const otPay        = (totalOtMins  / 60) * rateVal * 1.5;
    const totalPay     = regPay + otPay;

    return { rowData, totalMins, totalRegMins, totalOtMins, regPay, otPay, totalPay };
  }, [rows, rate, overtimeAfter]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Time Card Calculator</h1>
        <p className="muted">
          Enter clock-in and clock-out times for each day of the week to calculate
          total hours worked, overtime, and gross pay.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Time Entries</h2>

          <div className="row two">
            <div className="field">
              <label>Hourly Rate ($)</label>
              <input type="number" min="0" step="0.01" value={rate} onChange={e => setRate(e.target.value)} />
            </div>
            <div className="field">
              <label>Overtime after (hrs/day)</label>
              <input type="number" min="0" step="0.5" value={overtimeAfter} onChange={e => setOvertimeAfter(e.target.value)} />
            </div>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="table" style={{ minWidth: 480 }}>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Clock In</th>
                  <th>Clock Out</th>
                  <th>Break (min)</th>
                  <th>Hours</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const d = computed.rowData[i];
                  return (
                    <tr key={row.day} style={i >= 5 ? { background: "#fef9ff" } : {}}>
                      <td style={{ fontWeight: 600, fontSize: 13 }}>{row.day}</td>
                      <td>
                        <input type="time" value={row.clockIn} onChange={e => updateRow(i, "clockIn", e.target.value)}
                          style={{ padding: "4px 6px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, width: 90 }} />
                      </td>
                      <td>
                        <input type="time" value={row.clockOut} onChange={e => updateRow(i, "clockOut", e.target.value)}
                          style={{ padding: "4px 6px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, width: 90 }} />
                      </td>
                      <td>
                        <input type="number" min="0" value={row.break} onChange={e => updateRow(i, "break", e.target.value)}
                          style={{ padding: "4px 6px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, width: 60 }} />
                      </td>
                      <td style={{ fontFamily: "monospace", fontWeight: d?.worked ? 700 : 400, color: d?.worked ? "#374151" : "#9ca3af" }}>
                        {d?.worked != null ? fmtMinutes(d.worked) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: "#f0eeff" }}>
                  <td colSpan={4} style={{ fontWeight: 700 }}>Total</td>
                  <td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmtMinutes(computed.totalMins)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <section className="card">
          <h2 className="card-title">Summary</h2>

          <div className="kpi-grid">
            <div className="kpi">
              <div className="kpi-label">Total Hours</div>
              <div className="kpi-value">{fmtDecimal(computed.totalMins)}</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Regular Hours</div>
              <div className="kpi-value">{fmtDecimal(computed.totalRegMins)}</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Overtime Hours</div>
              <div className="kpi-value" style={{ color: computed.totalOtMins > 0 ? "#ef4444" : undefined }}>{fmtDecimal(computed.totalOtMins)}</div>
            </div>
            <div className="kpi">
              <div className="kpi-label">Gross Pay</div>
              <div className="kpi-value">${computed.totalPay.toFixed(2)}</div>
            </div>
          </div>

          <table className="table" style={{ marginTop: 14 }}>
            <thead><tr><th>Pay Component</th><th>Hours</th><th>Rate</th><th>Amount</th></tr></thead>
            <tbody>
              <tr>
                <td>Regular pay</td>
                <td style={{ fontFamily: "monospace" }}>{(computed.totalRegMins / 60).toFixed(2)}</td>
                <td style={{ fontFamily: "monospace" }}>${parseFloat(rate || 0).toFixed(2)}/hr</td>
                <td style={{ fontFamily: "monospace" }}>${computed.regPay.toFixed(2)}</td>
              </tr>
              {computed.totalOtMins > 0 && (
                <tr>
                  <td>Overtime pay (×1.5)</td>
                  <td style={{ fontFamily: "monospace" }}>{(computed.totalOtMins / 60).toFixed(2)}</td>
                  <td style={{ fontFamily: "monospace" }}>${(parseFloat(rate || 0) * 1.5).toFixed(2)}/hr</td>
                  <td style={{ fontFamily: "monospace" }}>${computed.otPay.toFixed(2)}</td>
                </tr>
              )}
              <tr style={{ background: "#f0eeff" }}>
                <td><strong>Total</strong></td>
                <td style={{ fontFamily: "monospace", fontWeight: 700 }}>{(computed.totalMins / 60).toFixed(2)}</td>
                <td>—</td>
                <td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>${computed.totalPay.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>

          <p className="small" style={{ marginTop: 12 }}>Overtime rate is 1.5× for hours beyond {overtimeAfter} hrs/day. Taxes and deductions not included.</p>
        </section>
      </div>
    </div>
  );
}
