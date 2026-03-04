// src/pages/InflationCalculator.js
import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

/**
 * Inflation Calculator (calculator.net style, with your theme)
 * - Horizontal inline inputs (done)
 * - Clear makes fields BLANK (done)
 * - Results formatted + calculated like calculator.net (this version)
 *
 * Key detail to match calculator.net “average inflation rate per year”:
 * They compute CAGR using an elapsed-year value based on MONTH difference.
 * For "Average" they treat it as mid-year (July). Example:
 * 2016 (Average) -> Jan 2026 => 114 months => 9.5 years => 3.25% CAGR (matches screenshot).
 */

/** --------- CPI DATA (minimal, but exact for your screenshot) ----------
 * calculator.net uses monthly CPI-U (BLS). To match exactly for all years/months
 * you’d load a full CPI dataset.
 *
 * For now, I’m including:
 * - 2016 annual average CPI = 240.007 (exact from your screenshot)
 * - Jan 2026 CPI = 325.252 (exact from your screenshot)
 *
 * You can extend CPI_MONTHLY with more year-months as you add them.
 */
const CPI_YEAR_AVG = {
  2016: 240.007,
};

const CPI_MONTHLY = {
  "2026-01": 325.252, // Jan 2026 (exact from your screenshot)
};

const MONTHS = [
  "Average",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTH_ABBR = {
  January: "Jan.",
  February: "Feb.",
  March: "Mar.",
  April: "Apr.",
  May: "May",
  June: "Jun.",
  July: "Jul.",
  August: "Aug.",
  September: "Sep.",
  October: "Oct.",
  November: "Nov.",
  December: "Dec.",
  Average: "Average",
};

// month index used to compute elapsed time
// IMPORTANT: "Average" is treated as mid-year (July) to match calculator.net CAGR behavior.
const MONTH_INDEX = {
  Average: 6, // July (0-based)
  January: 0,
  February: 1,
  March: 2,
  April: 3,
  May: 4,
  June: 5,
  July: 6,
  August: 7,
  September: 8,
  October: 9,
  November: 10,
  December: 11,
};

function isBlank(v) {
  return v === "" || v === null || v === undefined;
}

function fmtMoneyUSD(x) {
  if (!isFinite(x)) return "-";
  return x.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmtPct2(x) {
  if (!isFinite(x)) return "-";
  return `${x.toFixed(2)}%`;
}

function fmtPct3(x) {
  if (!isFinite(x)) return "-";
  return `${x.toFixed(3)}%`;
}

function getCpiValue(yearStr, monthLabel) {
  const year = Number(yearStr);
  if (!Number.isFinite(year)) return null;

  if (monthLabel === "Average") {
    return CPI_YEAR_AVG[year] ?? null;
  }

  const mm = String(MONTH_INDEX[monthLabel] + 1).padStart(2, "0");
  const key = `${year}-${mm}`;
  return CPI_MONTHLY[key] ?? null;
}

function elapsedYears(fromYearStr, fromMonth, toYearStr, toMonth) {
  const fy = Number(fromYearStr);
  const ty = Number(toYearStr);
  if (!Number.isFinite(fy) || !Number.isFinite(ty)) return null;

  const fm = MONTH_INDEX[fromMonth];
  const tm = MONTH_INDEX[toMonth];
  if (fm === undefined || tm === undefined) return null;

  const months = (ty - fy) * 12 + (tm - fm);
  return months / 12;
}

function ResultBar({ children }) {
  // Uses your theme (card), mimics calculator.net “Result” header area
  return (
    <div
      style={{
        marginTop: 14,
        border: "1px solid rgba(99, 102, 241, 0.15)",
        borderRadius: 14,
        overflow: "hidden",
        background: "#f8f9ff",
      }}
    >
      <div
        style={{
          padding: "10px 12px",
          fontWeight: 800,
          background: "rgba(16, 185, 129, 0.10)",
          borderBottom: "1px solid rgba(16, 185, 129, 0.20)",
          color: "#065f46",
        }}
      >
        Result
      </div>
      <div style={{ padding: "12px 12px 14px" }}>{children}</div>
    </div>
  );
}

export default function InflationCalculator() {
  // Use string state so Clear can make fields truly blank
  const [cpiAmount, setCpiAmount] = useState("100");
  const [fromMonth, setFromMonth] = useState("Average");
  const [fromYear, setFromYear] = useState("2016");
  const [toMonth, setToMonth] = useState("January");
  const [toYear, setToYear] = useState("2026");

  const [fwdAmount, setFwdAmount] = useState("100");
  const [fwdRate, setFwdRate] = useState("3");
  const [fwdYears, setFwdYears] = useState("10");

  const [bwdAmount, setBwdAmount] = useState("100");
  const [bwdRate, setBwdRate] = useState("3");
  const [bwdYears, setBwdYears] = useState("10");

  // Years shown in dropdown (like calculator.net). We’ll generate 1913..2026.
  const yearOptions = useMemo(() => {
    const arr = [];
    for (let y = 1913; y <= 2026; y++) arr.push(String(y));
    return arr;
  }, []);

  const cpiCalc = useMemo(() => {
    // Require all fields to be present
    if (
      isBlank(cpiAmount) ||
      isBlank(fromYear) ||
      isBlank(toYear) ||
      isBlank(fromMonth) ||
      isBlank(toMonth)
    ) {
      return { valid: false };
    }

    const amt = Number(cpiAmount);
    if (!isFinite(amt) || amt <= 0) return { valid: false };

    const cpiFrom = getCpiValue(fromYear, fromMonth);
    const cpiTo = getCpiValue(toYear, toMonth);
    if (!cpiFrom || !cpiTo) return { valid: false, missingCpi: true };

    const out = amt * (cpiTo / cpiFrom);
    const totalInflPct = ((cpiTo / cpiFrom) - 1) * 100;

    // calculator.net “average inflation rate” = CAGR using elapsed years by month difference
    const tYears = elapsedYears(fromYear, fromMonth, toYear, toMonth);
    const avgInflPct =
      tYears && tYears > 0 ? (Math.pow(cpiTo / cpiFrom, 1 / tYears) - 1) * 100 : null;

    return {
      valid: true,
      amt,
      out,
      totalInflPct,
      avgInflPct,
      cpiFrom,
      cpiTo,
      tYears,
    };
  }, [cpiAmount, fromMonth, fromYear, toMonth, toYear]);

  const fwdCalc = useMemo(() => {
    if (isBlank(fwdAmount) || isBlank(fwdRate) || isBlank(fwdYears)) return { valid: false };
    const p = Number(fwdAmount);
    const r = Number(fwdRate) / 100;
    const t = Number(fwdYears);
    if (!isFinite(p) || !isFinite(r) || !isFinite(t) || p <= 0) return { valid: false };

    const out = p * Math.pow(1 + r, t);
    return { valid: true, p, rPct: Number(fwdRate), t, out };
  }, [fwdAmount, fwdRate, fwdYears]);

  const bwdCalc = useMemo(() => {
    if (isBlank(bwdAmount) || isBlank(bwdRate) || isBlank(bwdYears)) return { valid: false };
    const p = Number(bwdAmount);
    const r = Number(bwdRate) / 100;
    const t = Number(bwdYears);
    if (!isFinite(p) || !isFinite(r) || !isFinite(t) || p <= 0) return { valid: false };

    const out = p / Math.pow(1 + r, t);
    return { valid: true, p, rPct: Number(bwdRate), t, out };
  }, [bwdAmount, bwdRate, bwdYears]);

  const fromLabel = `${fromYear} (${fromMonth})`;
  const toLabel = `${MONTH_ABBR[toMonth]} ${toYear}`;

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Inflation Calculator</h1>
        <p className="muted">
          Matches calculator.net result formatting and average inflation rate math (CAGR by month difference).
        </p>
      </header>

      {/* ----------------- SECTION 1 ----------------- */}
      <section className="card" style={{ marginBottom: 16 }}>
        <h2 className="card-title">Inflation Calculator with U.S. CPI Data</h2>
        <p className="small" style={{ opacity: 0.85, marginTop: 6 }}>
          This version uses CPI values you provide. Currently includes exact CPI values for:
          <b> 2016 (Average) = 240.007</b> and <b>Jan. 2026 = 325.252</b>.
          Add more CPI values to match every month/year.
        </p>

        {/* Inline controls like calculator.net */}
        <div className="row" style={{ marginTop: 12 }}>
          <div
            className="field"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <span className="small" style={{ opacity: 0.85 }}>$</span>
            <input
              style={{ width: 130 }}
              type="number"
              value={cpiAmount}
              onChange={(e) => setCpiAmount(e.target.value)}
              placeholder=""
            />

            <span className="small" style={{ opacity: 0.85 }}>in</span>

            <select style={{ width: 150 }} value={fromMonth} onChange={(e) => setFromMonth(e.target.value)}>
              {MONTHS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <select style={{ width: 110 }} value={fromYear} onChange={(e) => setFromYear(e.target.value)}>
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <span className="small" style={{ opacity: 0.85 }}>=</span>
            <span className="small" style={{ fontWeight: 800, opacity: 0.9 }}>
              {cpiCalc.valid ? fmtMoneyUSD(cpiCalc.out) : "?"}
            </span>

            <span className="small" style={{ opacity: 0.85 }}>in</span>

            <select style={{ width: 150 }} value={toMonth} onChange={(e) => setToMonth(e.target.value)}>
              {MONTHS.filter((m) => m !== "Average").map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>

            <select style={{ width: 110 }} value={toYear} onChange={(e) => setToYear(e.target.value)}>
              {yearOptions.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="actions">
          <button type="button" className="btn primary">
            Calculate
          </button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              // blank values (as you requested)
              setCpiAmount("");
              setFromMonth("Average");
              setFromYear("");
              setToMonth("January");
              setToYear("");
            }}
          >
            Clear
          </button>
        </div>

        {/* Result block like calculator.net */}
        <ResultBar>
          {!cpiCalc.valid ? (
            <div className="small" style={{ opacity: 0.85 }}>
              {cpiCalc.missingCpi
                ? "CPI value not found for the selected months/years. Add it to CPI_MONTHLY / CPI_YEAR_AVG."
                : "Enter values to see result."}
            </div>
          ) : (
            <>
              <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 10 }}>
                <span style={{ color: "rgba(90,255,190,0.95)" }}>
                  {fmtMoneyUSD(cpiCalc.out)}
                </span>{" "}
                in <b>{toLabel}</b> equals{" "}
                <b>{fmtMoneyUSD(cpiCalc.amt)}</b> of buying power in{" "}
                <b>{fromLabel}</b>.
              </div>

              <div className="small" style={{ lineHeight: 1.6 }}>
                The total inflation rate from <b>{fromLabel}</b> to <b>{toLabel}</b> is{" "}
                <b>{fmtPct2(cpiCalc.totalInflPct)}</b>.
                {" "}
                The average inflation rate is{" "}
                <b>{fmtPct2(cpiCalc.avgInflPct ?? NaN)}</b> per year.
              </div>

              <div className="small" style={{ marginTop: 8, lineHeight: 1.6 }}>
                The CPI of <b>{fromLabel}</b> is <b>{cpiCalc.cpiFrom.toFixed(3)}</b> and the CPI of{" "}
                <b>{toLabel}</b> is <b>{cpiCalc.cpiTo.toFixed(3)}</b>.
              </div>
            </>
          )}
        </ResultBar>
      </section>

      {/* ----------------- SECTION 2 ----------------- */}
      <section className="card" style={{ marginBottom: 16 }}>
        <h2 className="card-title">Forward Flat Rate Inflation Calculator</h2>

        <div className="row" style={{ marginTop: 12 }}>
          <div className="field" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <input
              style={{ width: 130 }}
              type="number"
              value={fwdAmount}
              onChange={(e) => setFwdAmount(e.target.value)}
              placeholder=""
            />

            <span className="small" style={{ opacity: 0.85 }}>with inflation rate</span>

            <input
              style={{ width: 90 }}
              type="number"
              value={fwdRate}
              onChange={(e) => setFwdRate(e.target.value)}
              placeholder=""
            />
            <span className="small" style={{ opacity: 0.85 }}>%</span>

            <span className="small" style={{ opacity: 0.85 }}>after</span>

            <input
              style={{ width: 90 }}
              type="number"
              value={fwdYears}
              onChange={(e) => setFwdYears(e.target.value)}
              placeholder=""
            />
            <span className="small" style={{ opacity: 0.85 }}>years</span>

            <span className="small" style={{ opacity: 0.85 }}>=</span>
            <span className="small" style={{ fontWeight: 800, opacity: 0.9 }}>
              {fwdCalc.valid ? fmtMoneyUSD(fwdCalc.out) : "?"}
            </span>
          </div>
        </div>

        <div className="actions">
          <button type="button" className="btn primary">Calculate</button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setFwdAmount("");
              setFwdRate("");
              setFwdYears("");
            }}
          >
            Clear
          </button>
        </div>

        <ResultBar>
          {!fwdCalc.valid ? (
            <div className="small" style={{ opacity: 0.85 }}>Enter values to see result.</div>
          ) : (
            <div style={{ fontSize: 18, fontWeight: 800 }}>
              {fmtMoneyUSD(fwdCalc.p)} now equals{" "}
              <span style={{ color: "rgba(90,255,190,0.95)" }}>
                {fmtMoneyUSD(fwdCalc.out)}
              </span>{" "}
              after <b>{fwdCalc.t}</b> years in purchasing power with an average inflation rate of{" "}
              <b>{Number(fwdCalc.rPct).toString()}%</b>.
            </div>
          )}
        </ResultBar>
      </section>

      {/* ----------------- SECTION 3 ----------------- */}
      <section className="card">
        <h2 className="card-title">Backward Flat Rate Inflation Calculator</h2>

        <div className="row" style={{ marginTop: 12 }}>
          <div className="field" style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <input
              style={{ width: 130 }}
              type="number"
              value={bwdAmount}
              onChange={(e) => setBwdAmount(e.target.value)}
              placeholder=""
            />

            <span className="small" style={{ opacity: 0.85 }}>with inflation rate</span>

            <input
              style={{ width: 90 }}
              type="number"
              value={bwdRate}
              onChange={(e) => setBwdRate(e.target.value)}
              placeholder=""
            />
            <span className="small" style={{ opacity: 0.85 }}>%</span>

            <span className="small" style={{ opacity: 0.85 }}>=</span>
            <span className="small" style={{ fontWeight: 800, opacity: 0.9 }}>
              {bwdCalc.valid ? fmtMoneyUSD(bwdCalc.out) : "?"}
            </span>

            <input
              style={{ width: 90 }}
              type="number"
              value={bwdYears}
              onChange={(e) => setBwdYears(e.target.value)}
              placeholder=""
            />
            <span className="small" style={{ opacity: 0.85 }}>years ago</span>
          </div>
        </div>

        <div className="actions">
          <button type="button" className="btn primary">Calculate</button>
          <button
            type="button"
            className="btn"
            onClick={() => {
              setBwdAmount("");
              setBwdRate("");
              setBwdYears("");
            }}
          >
            Clear
          </button>
        </div>

        <ResultBar>
          {!bwdCalc.valid ? (
            <div className="small" style={{ opacity: 0.85 }}>Enter values to see result.</div>
          ) : (
            <div style={{ fontSize: 18, fontWeight: 800 }}>
              {fmtMoneyUSD(bwdCalc.p)} now equals{" "}
              <span style={{ color: "rgba(90,255,190,0.95)" }}>
                {fmtMoneyUSD(bwdCalc.out)}
              </span>{" "}
              of purchasing power <b>{bwdCalc.t}</b> years ago with an average inflation rate of{" "}
              <b>{Number(bwdCalc.rPct).toString()}%</b>.
            </div>
          )}
        </ResultBar>
      </section>
    </div>
  );
}