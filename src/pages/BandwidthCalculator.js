import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

// Conversion to bits
const SPEED_UNITS = [
  { label: "bps (bits/s)",    factor: 1 },
  { label: "Kbps (Kilobits/s)", factor: 1e3 },
  { label: "Mbps (Megabits/s)", factor: 1e6 },
  { label: "Gbps (Gigabits/s)", factor: 1e9 },
  { label: "Tbps (Terabits/s)", factor: 1e12 },
  { label: "KB/s (Kilobytes/s)", factor: 8e3 },
  { label: "MB/s (Megabytes/s)", factor: 8e6 },
  { label: "GB/s (Gigabytes/s)", factor: 8e9 },
];

const SIZE_UNITS = [
  { label: "Bits (b)",        factor: 1 },
  { label: "Bytes (B)",       factor: 8 },
  { label: "Kilobits (Kb)",   factor: 1e3 },
  { label: "Kilobytes (KB)",  factor: 8e3 },
  { label: "Megabits (Mb)",   factor: 1e6 },
  { label: "Megabytes (MB)",  factor: 8e6 },
  { label: "Gigabits (Gb)",   factor: 1e9 },
  { label: "Gigabytes (GB)",  factor: 8e9 },
  { label: "Terabytes (TB)",  factor: 8e12 },
];

const TIME_UNITS = [
  { label: "Seconds (s)",   factor: 1 },
  { label: "Minutes (min)", factor: 60 },
  { label: "Hours (hr)",    factor: 3600 },
  { label: "Days",          factor: 86400 },
];

function fmtTime(seconds) {
  if (!isFinite(seconds) || seconds < 0) return "—";
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts = [];
  if (d) parts.push(`${d}d`);
  if (h) parts.push(`${h}h`);
  if (m) parts.push(`${m}m`);
  if (s || parts.length === 0) parts.push(`${s}s`);
  return parts.join(" ");
}

function fmtNum(v, d = 4) {
  if (!isFinite(v)) return "—";
  if (v >= 1e12) return (v / 1e12).toFixed(d) + " T";
  if (v >= 1e9)  return (v / 1e9).toFixed(d) + " G";
  if (v >= 1e6)  return (v / 1e6).toFixed(d) + " M";
  if (v >= 1e3)  return (v / 1e3).toFixed(d) + " K";
  return v.toFixed(d);
}

export default function BandwidthCalculator() {
  const [tab, setTab] = useState("download");

  // Download time
  const [fileSize, setFileSize]     = useState("700");
  const [fileSizeUnit, setFileSizeUnit] = useState(6); // MB
  const [speed, setSpeed]           = useState("50");
  const [speedUnit, setSpeedUnit]   = useState(2); // Mbps

  // Data usage
  const [usageSpeed, setUsageSpeed]         = useState("100");
  const [usageSpeedUnit, setUsageSpeedUnit] = useState(2); // Mbps
  const [usageTime, setUsageTime]           = useState("1");
  const [usageTimeUnit, setUsageTimeUnit]   = useState(2); // Hours

  // Unit converter
  const [convVal, setConvVal]   = useState("100");
  const [convFrom, setConvFrom] = useState(2); // Mbps
  const [convTo, setConvTo]     = useState(6); // MB/s

  const downloadResult = useMemo(() => {
    const fs = parseFloat(fileSize), sp = parseFloat(speed);
    if (isNaN(fs) || isNaN(sp) || sp <= 0 || fs <= 0) return null;
    const fileBits = fs * SIZE_UNITS[fileSizeUnit].factor;
    const bps      = sp * SPEED_UNITS[speedUnit].factor;
    const seconds  = fileBits / bps;
    return { seconds, fileBits, bps };
  }, [fileSize, fileSizeUnit, speed, speedUnit]);

  const usageResult = useMemo(() => {
    const sp = parseFloat(usageSpeed), t = parseFloat(usageTime);
    if (isNaN(sp) || isNaN(t) || sp <= 0 || t <= 0) return null;
    const bps      = sp * SPEED_UNITS[usageSpeedUnit].factor;
    const seconds  = t  * TIME_UNITS[usageTimeUnit].factor;
    const totalBits = bps * seconds;
    return {
      bits:  totalBits,
      bytes: totalBits / 8,
      KB:    totalBits / 8e3,
      MB:    totalBits / 8e6,
      GB:    totalBits / 8e9,
    };
  }, [usageSpeed, usageSpeedUnit, usageTime, usageTimeUnit]);

  const convResult = useMemo(() => {
    const v = parseFloat(convVal);
    if (isNaN(v) || v < 0) return null;
    const bits = v * SPEED_UNITS[convFrom].factor;
    return bits / SPEED_UNITS[convTo].factor;
  }, [convVal, convFrom, convTo]);

  const SELECT = (opts, val, setVal) => (
    <select value={val} onChange={e => setVal(parseInt(e.target.value))}>
      {opts.map((u, i) => <option key={i} value={i}>{u.label}</option>)}
    </select>
  );

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Bandwidth Calculator</h1>
        <p className="muted">
          Calculate file download time at a given speed, estimate data usage over time,
          or convert between bandwidth and data size units.
        </p>
      </header>

      <div className="calc-grid">
        <section className="card">
          <h2 className="card-title">Mode</h2>

          <div className="tab-row">
            <button className={`tab-btn${tab === "download" ? " active" : ""}`} onClick={() => setTab("download")}>Download Time</button>
            <button className={`tab-btn${tab === "usage"    ? " active" : ""}`} onClick={() => setTab("usage")}>Data Usage</button>
            <button className={`tab-btn${tab === "convert"  ? " active" : ""}`} onClick={() => setTab("convert")}>Unit Converter</button>
          </div>

          {tab === "download" && (
            <>
              <p className="small">How long will it take to download a file?</p>
              <div className="row two">
                <div className="field">
                  <label>File Size</label>
                  <input type="number" min="0" value={fileSize} onChange={e => setFileSize(e.target.value)} />
                </div>
                <div className="field">
                  <label>File Size Unit</label>
                  {SELECT(SIZE_UNITS, fileSizeUnit, setFileSizeUnit)}
                </div>
              </div>
              <div className="row two">
                <div className="field">
                  <label>Download Speed</label>
                  <input type="number" min="0" value={speed} onChange={e => setSpeed(e.target.value)} />
                </div>
                <div className="field">
                  <label>Speed Unit</label>
                  {SELECT(SPEED_UNITS, speedUnit, setSpeedUnit)}
                </div>
              </div>

              {downloadResult && (
                <div style={{ marginTop: 14, padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>Download Time</div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: "#4f46e5" }}>{fmtTime(downloadResult.seconds)}</div>
                  <div style={{ fontSize: 13, color: "#6b7a9e", marginTop: 4 }}>
                    {downloadResult.seconds.toFixed(2)} seconds &nbsp;·&nbsp; {fmtNum(downloadResult.fileBits)} bits at {fmtNum(downloadResult.bps)} bps
                  </div>
                </div>
              )}
            </>
          )}

          {tab === "usage" && (
            <>
              <p className="small">How much data is transferred at a given speed over time?</p>
              <div className="row two">
                <div className="field">
                  <label>Connection Speed</label>
                  <input type="number" min="0" value={usageSpeed} onChange={e => setUsageSpeed(e.target.value)} />
                </div>
                <div className="field">
                  <label>Speed Unit</label>
                  {SELECT(SPEED_UNITS, usageSpeedUnit, setUsageSpeedUnit)}
                </div>
              </div>
              <div className="row two">
                <div className="field">
                  <label>Time Duration</label>
                  <input type="number" min="0" value={usageTime} onChange={e => setUsageTime(e.target.value)} />
                </div>
                <div className="field">
                  <label>Time Unit</label>
                  {SELECT(TIME_UNITS, usageTimeUnit, setUsageTimeUnit)}
                </div>
              </div>

              {usageResult && (
                <div className="kpi-grid" style={{ marginTop: 14 }}>
                  <div className="kpi"><div className="kpi-label">Megabytes (MB)</div><div className="kpi-value">{usageResult.MB.toFixed(2)}</div></div>
                  <div className="kpi"><div className="kpi-label">Gigabytes (GB)</div><div className="kpi-value">{usageResult.GB.toFixed(4)}</div></div>
                </div>
              )}
            </>
          )}

          {tab === "convert" && (
            <>
              <p className="small">Convert between bandwidth and throughput units.</p>
              <div className="row">
                <div className="field">
                  <label>Value</label>
                  <input type="number" min="0" value={convVal} onChange={e => setConvVal(e.target.value)} />
                </div>
              </div>
              <div className="row two">
                <div className="field">
                  <label>From</label>
                  {SELECT(SPEED_UNITS, convFrom, setConvFrom)}
                </div>
                <div className="field">
                  <label>To</label>
                  {SELECT(SPEED_UNITS, convTo, setConvTo)}
                </div>
              </div>

              {convResult !== null && (
                <div style={{ marginTop: 14, padding: "16px 18px", background: "#f0eeff", borderRadius: 14, border: "1px solid rgba(99,102,241,0.2)" }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: "#6b7a9e", textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: 6 }}>Result</div>
                  <div style={{ fontSize: 28, fontWeight: 900, color: "#4f46e5", fontFamily: "monospace" }}>
                    {convVal} {SPEED_UNITS[convFrom].label} = {convResult.toPrecision(6)} {SPEED_UNITS[convTo].label}
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        <section className="card">
          <h2 className="card-title">Results</h2>

          {tab === "download" && downloadResult && (
            <table className="table" style={{ marginBottom: 14 }}>
              <thead><tr><th>Property</th><th>Value</th></tr></thead>
              <tbody>
                <tr><td>File size</td><td style={{ fontFamily: "monospace" }}>{fileSize} {SIZE_UNITS[fileSizeUnit].label}</td></tr>
                <tr><td>Speed</td><td style={{ fontFamily: "monospace" }}>{speed} {SPEED_UNITS[speedUnit].label}</td></tr>
                <tr style={{ background: "#f0eeff" }}><td><strong>Download time</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{fmtTime(downloadResult.seconds)}</td></tr>
                <tr><td>Seconds</td><td style={{ fontFamily: "monospace" }}>{downloadResult.seconds.toFixed(3)}</td></tr>
              </tbody>
            </table>
          )}

          {tab === "usage" && usageResult && (
            <table className="table" style={{ marginBottom: 14 }}>
              <thead><tr><th>Unit</th><th>Data Transferred</th></tr></thead>
              <tbody>
                <tr><td>Bits</td><td style={{ fontFamily: "monospace" }}>{usageResult.bits.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td></tr>
                <tr><td>Bytes</td><td style={{ fontFamily: "monospace" }}>{usageResult.bytes.toLocaleString("en-US", { maximumFractionDigits: 0 })}</td></tr>
                <tr><td>Kilobytes (KB)</td><td style={{ fontFamily: "monospace" }}>{usageResult.KB.toFixed(2)}</td></tr>
                <tr style={{ background: "#f0eeff" }}><td><strong>Megabytes (MB)</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{usageResult.MB.toFixed(2)}</td></tr>
                <tr style={{ background: "#f0eeff" }}><td><strong>Gigabytes (GB)</strong></td><td style={{ fontFamily: "monospace", fontWeight: 800, color: "#4f46e5" }}>{usageResult.GB.toFixed(4)}</td></tr>
              </tbody>
            </table>
          )}

          {!downloadResult && !usageResult && tab !== "convert" && <p className="small">Enter values to see results.</p>}

          <h3 className="card-title" style={{ marginTop: 16 }}>Common Internet Speeds</h3>
          <table className="table">
            <thead><tr><th>Connection</th><th>Typical Speed</th><th>1 GB Download</th></tr></thead>
            <tbody>
              {[
                ["Dial-up",       "56 Kbps",   "~33 hrs"],
                ["DSL",           "10 Mbps",   "~13 min"],
                ["Cable",         "100 Mbps",  "~1.3 min"],
                ["Fiber (home)",  "1 Gbps",    "~8 sec"],
                ["5G Mobile",     "300 Mbps",  "~27 sec"],
                ["Wi-Fi 6",       "600 Mbps",  "~13 sec"],
              ].map(([conn, sp, dl]) => (
                <tr key={conn}>
                  <td>{conn}</td>
                  <td style={{ fontFamily: "monospace" }}>{sp}</td>
                  <td style={{ fontFamily: "monospace" }}>{dl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  );
}
