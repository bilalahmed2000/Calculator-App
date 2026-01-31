import React, { useState, useMemo } from "react";
import "../css/CalcBase.css";

export default function PaceCalculator() {
  const [units, setUnits] = useState("km"); // km or miles

  const [distance, setDistance] = useState(5);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(30);
  const [seconds, setSeconds] = useState(0);

  const totalSeconds = useMemo(() => {
    return hours * 3600 + minutes * 60 + seconds;
  }, [hours, minutes, seconds]);

  // Pace (sec per unit)
  const paceSeconds = useMemo(() => {
    if (!distance || !totalSeconds) return 0;
    return totalSeconds / distance;
  }, [distance, totalSeconds]);

  const pace = useMemo(() => {
    if (!paceSeconds) return null;
    const pMin = Math.floor(paceSeconds / 60);
    const pSec = Math.round(paceSeconds % 60);
    return `${pMin}:${pSec.toString().padStart(2, "0")}`;
  }, [paceSeconds]);

  const speed = useMemo(() => {
    if (!paceSeconds) return 0;
    // speed = distance / hours
    const hrs = totalSeconds / 3600;
    return hrs ? (distance / hrs).toFixed(2) : 0;
  }, [distance, totalSeconds]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Pace Calculator</h1>
        <p className="muted">
          Calculate your pace and speed based on distance & time.
        </p>
      </header>

      <div className="calc-grid">
        {/* INPUT CARD */}
        <section className="card">
          <h2 className="card-title">Your Run Details</h2>

          {/* Distance & Units */}
          <div className="row two">
            <div className="field">
              <label>Units</label>
              <select value={units} onChange={(e) => setUnits(e.target.value)}>
                <option value="km">Kilometers</option>
                <option value="miles">Miles</option>
              </select>
            </div>

            <div className="field">
              <label>Distance ({units})</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
              />
            </div>
          </div>

          {/* Time Inputs */}
          <div className="row three">
            <div className="field">
              <label>Hours</label>
              <input
                type="number"
                min="0"
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
              />
            </div>
            <div className="field">
              <label>Minutes</label>
              <input
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
              />
            </div>
            <div className="field">
              <label>Seconds</label>
              <input
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(Number(e.target.value))}
              />
            </div>
          </div>
        </section>

        {/* RESULT CARD */}
        <section className="card">
          <h2 className="card-title">Results</h2>

          {paceSeconds ? (
            <>
              <div className="kpi-grid">
                <div className="kpi">
                  <div className="kpi-label">Pace</div>
                  <div className="kpi-value">{pace || "-"}</div>
                  <div className="kpi-sub">
                    min/{units === "km" ? "km" : "mi"}
                  </div>
                </div>

                <div className="kpi">
                  <div className="kpi-label">Speed</div>
                  <div className="kpi-value">{speed}</div>
                  <div className="kpi-sub">
                    {units === "km" ? "km/h" : "mph"}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="small">Enter valid time and distance to see results.</p>
          )}
        </section>
      </div>
    </div>
  );
}
