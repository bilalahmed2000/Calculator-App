import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

/**
 * Percentage Calculator (calculator.net replica behavior)
 * - 4 blocks:
 *   1) % of:      A% of B = C  (any two values -> compute the third)
 *   2) Common phrases:
 *        a) what is A% of B
 *        b) X is what % of Y
 *        c) X is A% of what
 *   3) Percentage difference: compare two values
 *   4) Percentage change: increase/decrease by %
 *
 * Results are shown ONLY after Calculate is clicked for that block.
 * Clear resets inputs to blank blocks (empty strings) and hides the result for that block.
 */

// ---------- helpers ----------
const toNum = (v) => {
  if (v === "" || v === null || v === undefined) return null; // IMPORTANT: null means "missing"
  const s = String(v).replace(/[, %]/g, "").trim();
  if (s === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

const isCloseToInt = (n) => Math.abs(n - Math.round(n)) < 1e-12;

const fmt = (n) => {
  if (!Number.isFinite(n)) return "";
  if (isCloseToInt(n)) return String(Math.round(n));
  // show like calculator.net (can be long). We'll cap, but keep meaningful.
  // 15 significant digits, strip trailing zeros
  const s = Number(n).toPrecision(15);
  // Convert possible scientific notation to normal if small
  const num = Number(s);
  let out = String(num);
  if (out.includes("e")) {
    // fallback to fixed
    out = num.toFixed(12);
  }
  // strip trailing zeros
  if (out.includes(".")) out = out.replace(/\.?0+$/, "");
  return out;
};

const fmtPercent = (n) => `${fmt(n)}%`;

const GreenResultBar = ({ title }) => (
  <div
    style={{
      background: "rgba(16, 185, 129, 0.12)",
      border: "1px solid rgba(16, 185, 129, 0.35)",
      padding: "10px 12px",
      borderRadius: 12,
      margin: "6px 0 10px",
      fontWeight: 900,
      fontSize: 18,
      color: "#065f46",
    }}
  >
    {title}
  </div>
);

const Panel = ({ children }) => (
  <div
    style={{
      background: "#f5f3ff",
      border: "1px solid rgba(99, 102, 241, 0.18)",
      borderRadius: 12,
      padding: 14,
      maxWidth: 520,
      color: "#1e1b4b",
    }}
  >
    {children}
  </div>
);

const InlineInput = ({ value, onChange, placeholder, style }) => (
  <input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    style={{
      width: 120,
      ...style,
    }}
  />
);

const ActionRow = ({ onCalc, onClear, calcLabel = "Calculate" }) => (
  <div className="row" style={{ gap: 10, marginTop: 10 }}>
    <button type="button" className="btn" onClick={onCalc}>
      {calcLabel}
    </button>
    <button type="button" className="btn btn-secondary" onClick={onClear}>
      Clear
    </button>
  </div>
);

export default function PercentageCalculator() {
  // -------------------------
  // Block 1: A% of B = C
  // -------------------------
  const [p1, setP1] = useState("");
  const [b1, setB1] = useState("");
  const [r1, setR1] = useState("");
  const [show1, setShow1] = useState(false);
  const [res1, setRes1] = useState(null); // { title, line, steps }

  const calcBlock1 = () => {
    const P = toNum(p1);
    const B = toNum(b1);
    const R = toNum(r1);

    const filled = [P, B, R].filter((x) => x !== null).length;
    if (filled < 2) {
      setRes1({
        title: "Result: —",
        line: "Please provide any two values.",
        steps: [],
      });
      setShow1(true);
      return;
    }

    // Compute missing:
    // If R missing: R = (P/100)*B
    // If B missing: B = R / (P/100)
    // If P missing: P = (R/B)*100
    let outP = P;
    let outB = B;
    let outR = R;

    if (R === null) {
      outR = (P / 100) * B;
      setR1(fmt(outR));
    } else if (B === null) {
      if (P === 0) {
        setRes1({
          title: "Result: —",
          line: "Cannot compute because percent is 0.",
          steps: [],
        });
        setShow1(true);
        return;
      }
      outB = R / (P / 100);
      setB1(fmt(outB));
    } else if (P === null) {
      if (B === 0) {
        setRes1({
          title: "Result: —",
          line: "Cannot compute because the base value is 0.",
          steps: [],
        });
        setShow1(true);
        return;
      }
      outP = (R / B) * 100;
      setP1(fmt(outP));
    }

    const step = `${fmt(outP)}% of ${fmt(outB)} = ${fmt(outP / 100)} × ${fmt(outB)} = ${fmt(outR)}`;

    setRes1({
      title: `Result: ${fmt(outR)}`,
      line: `${fmt(outP)}% of ${fmt(outB)} = `,
      highlight: fmt(outR),
      steps: [step],
    });
    setShow1(true);
  };

  const clearBlock1 = () => {
    setP1("");
    setB1("");
    setR1("");
    setShow1(false);
    setRes1(null);
  };

  // -------------------------
  // Block 2: Common Phrases
  // (a) what is P% of B
  // (b) X is what % of Y
  // (c) X is P% of what
  // -------------------------
  const [p2a, setP2a] = useState("");
  const [b2a, setB2a] = useState("");
  const [show2a, setShow2a] = useState(false);
  const [res2a, setRes2a] = useState(null);

  const calc2a = () => {
    const P = toNum(p2a);
    const B = toNum(b2a);
    if (P === null || B === null) {
      setRes2a({ title: "Result: —", line: "Please enter both values.", steps: [] });
      setShow2a(true);
      return;
    }
    const R = (P / 100) * B;
    setRes2a({
      title: `Result: ${fmt(R)}`,
      line: `${fmt(R)} is ${fmt(P)}% of ${fmt(B)}.`,
      steps: [`${fmt(P)}% × ${fmt(B)} = ${fmt(R)}`],
    });
    setShow2a(true);
  };

  const clear2a = () => {
    setP2a("");
    setB2a("");
    setShow2a(false);
    setRes2a(null);
  };

  const [x2b, setX2b] = useState("");
  const [y2b, setY2b] = useState("");
  const [show2b, setShow2b] = useState(false);
  const [res2b, setRes2b] = useState(null);

  const calc2b = () => {
    const X = toNum(x2b);
    const Y = toNum(y2b);
    if (X === null || Y === null) {
      setRes2b({ title: "Result: —", line: "Please enter both values.", steps: [] });
      setShow2b(true);
      return;
    }
    if (Y === 0) {
      setRes2b({ title: "Result: —", line: "Cannot divide by 0.", steps: [] });
      setShow2b(true);
      return;
    }
    const P = (X / Y) * 100;
    setRes2b({
      title: `Result: ${fmtPercent(P)}`,
      line: `${fmt(X)} is ${fmtPercent(P)} of ${fmt(Y)}.`,
      steps: [`${fmt(X)} ÷ ${fmt(Y)} = ${fmt(X / Y)} = ${fmtPercent(P)}`],
    });
    setShow2b(true);
  };

  const clear2b = () => {
    setX2b("");
    setY2b("");
    setShow2b(false);
    setRes2b(null);
  };

  const [x2c, setX2c] = useState("");
  const [p2c, setP2c] = useState("");
  const [show2c, setShow2c] = useState(false);
  const [res2c, setRes2c] = useState(null);

  const calc2c = () => {
    const X = toNum(x2c);
    const P = toNum(p2c);
    if (X === null || P === null) {
      setRes2c({ title: "Result: —", line: "Please enter both values.", steps: [] });
      setShow2c(true);
      return;
    }
    if (P === 0) {
      setRes2c({ title: "Result: —", line: "Cannot compute with 0%.", steps: [] });
      setShow2c(true);
      return;
    }
    const W = X / (P / 100);
    setRes2c({
      title: `Result: ${fmt(W)}`,
      line: `${fmt(X)} is ${fmt(P)}% of ${fmt(W)}.`,
      steps: [`${fmt(X)} ÷ ${fmt(P / 100)} = ${fmt(W)}`],
    });
    setShow2c(true);
  };

  const clear2c = () => {
    setX2c("");
    setP2c("");
    setShow2c(false);
    setRes2c(null);
  };

  // -------------------------
  // Block 3: Percentage Difference
  // -------------------------
  const [a3, setA3] = useState("");
  const [b3, setB3] = useState("");
  const [show3, setShow3] = useState(false);
  const [res3, setRes3] = useState(null);

  const calc3 = () => {
    const A = toNum(a3);
    const B = toNum(b3);
    if (A === null || B === null) {
      setRes3({ title: "Result: —", line: "Please enter both values.", steps: [] });
      setShow3(true);
      return;
    }
    const denom = (A + B) / 2;
    if (denom === 0) {
      setRes3({ title: "Result: —", line: "Cannot compute because average is 0.", steps: [] });
      setShow3(true);
      return;
    }
    const diff = Math.abs(A - B);
    const pd = (diff / denom) * 100;

    const inc = B === 0 ? null : ((A - B) / B) * 100; // percent change from B to A
    const incText =
      inc === null
        ? null
        : inc === 0
          ? `${fmt(A)} is the same as ${fmt(B)}.`
          : inc > 0
            ? `${fmt(A)} is a ${fmtPercent(inc)} increase of ${fmt(B)}.`
            : `${fmt(A)} is a ${fmtPercent(Math.abs(inc))} decrease of ${fmt(B)}.`;

    setRes3({
      title: `Result: ${fmtPercent(pd)}`,
      line: `Difference of ${fmt(A)} and ${fmt(B)} are ${fmtPercent(pd)}.`,
      steps: [
        `Difference of ${fmt(A)} and ${fmt(B)} = |${fmt(A)} - ${fmt(B)}| ÷ ((${fmt(A)} + ${fmt(B)}) ÷ 2)`,
        `= ${fmt(diff)} ÷ ${fmt(denom)}`,
        `= ${fmt(diff / denom)}`,
        `= ${fmtPercent(pd)}`,
      ],
      extra: incText ? [incText, `Steps:`, `Percentage of increase = |${fmt(A)} - ${fmt(B)}| ÷ ${fmt(B)}`, `= ${fmt(diff)} ÷ ${fmt(B)}`, `= ${fmt(diff / B)}`, `= ${fmtPercent(Math.abs(inc))}`] : [],
    });
    setShow3(true);
  };

  const clear3 = () => {
    setA3("");
    setB3("");
    setShow3(false);
    setRes3(null);
  };

  // -------------------------
  // Block 4: Percentage Change
  // -------------------------
  const [v4, setV4] = useState("");
  const [mode4, setMode4] = useState("Increase"); // Increase | Decrease
  const [p4, setP4] = useState("");
  const [show4, setShow4] = useState(false);
  const [res4, setRes4] = useState(null);

  const calc4 = () => {
    const V = toNum(v4);
    const P = toNum(p4);
    if (V === null || P === null) {
      setRes4({ title: "Result: —", line: "Please enter both values.", steps: [] });
      setShow4(true);
      return;
    }
    const factor = mode4 === "Increase" ? 1 + P / 100 : 1 - P / 100;
    const R = V * factor;

    const sign = mode4 === "Increase" ? "+" : "-";
    setRes4({
      title: `Result: ${fmt(R)}`,
      line: `${fmt(V)} ${mode4 === "Increase" ? "increase" : "decrease"} ${fmt(P)}% = ${fmt(R)}`,
      steps: [
        `${fmt(V)} ${mode4 === "Increase" ? "increase" : "decrease"} ${fmt(P)}% =`,
        `${fmt(V)} × (1 ${sign} ${fmt(P)}%) = ${fmt(V)} × (1 ${sign} ${fmt(P / 100)}) = ${fmt(R)}`,
      ],
    });
    setShow4(true);
  };

  const clear4 = () => {
    setV4("");
    setMode4("Increase");
    setP4("");
    setShow4(false);
    setRes4(null);
  };

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Percentage Calculator</h1>
        <p className="muted">
          Please provide any two values below and click the <b>Calculate</b> button to get the third value.
        </p>
      </header>

      {/* ---------------- Block 1 ---------------- */}
      {show1 && res1 && (
        <section className="card" style={{ marginBottom: 16 }}>
          <GreenResultBar title={res1.title} />
          <div style={{ fontSize: 22, marginBottom: 10 }}>
            {res1.line}
            <span style={{ color: "rgb(60, 180, 75)", fontWeight: 900 }}>{res1.highlight}</span>
          </div>

          {res1.steps?.length > 0 && (
            <>
              <div style={{ fontWeight: 900, marginTop: 6 }}>Steps:</div>
              <div style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>
                {res1.steps.map((s, i) => (
                  <div key={i}>{s}</div>
                ))}
              </div>
            </>
          )}
        </section>
      )}

      <section className="card" style={{ marginBottom: 22 }}>
        <Panel>
          <div className="row" style={{ gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <InlineInput value={p1} onChange={setP1} placeholder="" />
            <div style={{ fontWeight: 800 }}>%</div>
            <div style={{ fontWeight: 800 }}>of</div>
            <InlineInput value={b1} onChange={setB1} placeholder="" />
            <div style={{ fontWeight: 900 }}>=</div>
            <InlineInput value={r1} onChange={setR1} placeholder="" />
          </div>

          <ActionRow onCalc={calcBlock1} onClear={clearBlock1} />
        </Panel>
      </section>

      {/* ---------------- Block 2 ---------------- */}
      <h2 style={{ margin: "8px 0 10px" }}>Percentage Calculator in Common Phrases</h2>

      {/* 2a */}
      {show2a && res2a && (
        <section className="card" style={{ marginBottom: 12 }}>
          <GreenResultBar title={res2a.title} />
          <div style={{ fontSize: 22, marginBottom: 10 }}>
            <span style={{ color: "rgb(60, 180, 75)", fontWeight: 900 }}>{res2a.title.replace("Result: ", "")}</span>
            {" "}is {fmt(toNum(p2a) ?? 0)}% of {fmt(toNum(b2a) ?? 0)}.
          </div>
          <div style={{ fontWeight: 900, marginTop: 6 }}>Steps:</div>
          <div style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>
            {res2a.steps.map((s, i) => (
              <div key={i}>{s}</div>
            ))}
          </div>
        </section>
      )}

      <section className="card" style={{ marginBottom: 12 }}>
        <Panel>
          <div className="row" style={{ gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ fontWeight: 900 }}>what is</div>
            <InlineInput value={p2a} onChange={setP2a} placeholder="" />
            <div style={{ fontWeight: 800 }}>%</div>
            <div style={{ fontWeight: 800 }}>of</div>
            <InlineInput value={b2a} onChange={setB2a} placeholder="" />
            <button type="button" className="btn" onClick={calc2a}>
              Calculate
            </button>
          </div>
          <div className="row" style={{ gap: 10, marginTop: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={clear2a}>
              Clear
            </button>
          </div>
        </Panel>
      </section>

      {/* 2b */}
      {show2b && res2b && (
        <section className="card" style={{ marginBottom: 12 }}>
          <GreenResultBar title={res2b.title} />
          <div style={{ fontSize: 22, marginBottom: 10 }}>
            {fmt(toNum(x2b) ?? 0)} is{" "}
            <span style={{ color: "rgb(60, 180, 75)", fontWeight: 900 }}>
              {res2b.title.replace("Result: ", "")}
            </span>{" "}
            of {fmt(toNum(y2b) ?? 0)}.
          </div>
          <div style={{ fontWeight: 900, marginTop: 6 }}>Steps:</div>
          <div style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>
            {res2b.steps.map((s, i) => (
              <div key={i}>{s}</div>
            ))}
          </div>
        </section>
      )}

      <section className="card" style={{ marginBottom: 12 }}>
        <Panel>
          <div className="row" style={{ gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <InlineInput value={x2b} onChange={setX2b} placeholder="" />
            <div style={{ fontWeight: 900 }}>is what % of</div>
            <InlineInput value={y2b} onChange={setY2b} placeholder="" />
            <button type="button" className="btn" onClick={calc2b}>
              Calculate
            </button>
          </div>
          <div className="row" style={{ gap: 10, marginTop: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={clear2b}>
              Clear
            </button>
          </div>
        </Panel>
      </section>

      {/* 2c */}
      {show2c && res2c && (
        <section className="card" style={{ marginBottom: 22 }}>
          <GreenResultBar title={res2c.title} />
          <div style={{ fontSize: 22, marginBottom: 10 }}>
            {fmt(toNum(x2c) ?? 0)} is {fmt(toNum(p2c) ?? 0)}% of{" "}
            <span style={{ color: "rgb(60, 180, 75)", fontWeight: 900 }}>
              {res2c.title.replace("Result: ", "")}
            </span>
            .
          </div>
          <div style={{ fontWeight: 900, marginTop: 6 }}>Steps:</div>
          <div style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>
            {res2c.steps.map((s, i) => (
              <div key={i}>{s}</div>
            ))}
          </div>
        </section>
      )}

      <section className="card" style={{ marginBottom: 28 }}>
        <Panel>
          <div className="row" style={{ gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <InlineInput value={x2c} onChange={setX2c} placeholder="" />
            <div style={{ fontWeight: 900 }}>is</div>
            <InlineInput value={p2c} onChange={setP2c} placeholder="" />
            <div style={{ fontWeight: 800 }}>%</div>
            <div style={{ fontWeight: 900 }}>of what</div>
            <button type="button" className="btn" onClick={calc2c}>
              Calculate
            </button>
          </div>
          <div className="row" style={{ gap: 10, marginTop: 10 }}>
            <button type="button" className="btn btn-secondary" onClick={clear2c}>
              Clear
            </button>
          </div>
        </Panel>
      </section>

      {/* ---------------- Block 3 ---------------- */}
      <h2 style={{ margin: "8px 0 10px" }}>Percentage Difference Calculator</h2>

      {show3 && res3 && (
        <section className="card" style={{ marginBottom: 16 }}>
          <GreenResultBar title={res3.title} />
          <div style={{ fontSize: 20, marginBottom: 6 }}>{res3.line}</div>

          <div style={{ fontWeight: 900, marginTop: 6 }}>Steps:</div>
          <div style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>
            {res3.steps.map((s, i) => (
              <div key={i}>{s}</div>
            ))}
          </div>

          {res3.extra?.length > 0 && (
            <div style={{ whiteSpace: "pre-wrap", marginTop: 16 }}>
              {res3.extra.map((s, i) => (
                <div key={i} style={{ fontWeight: s === "Steps:" ? 900 : 400 }}>
                  {s}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="card" style={{ marginBottom: 28 }}>
        <Panel>
          <div className="row" style={{ gap: 12, alignItems: "center" }}>
            <div style={{ minWidth: 70 }}>Value 1</div>
            <InlineInput value={a3} onChange={setA3} placeholder="" style={{ width: 240 }} />
          </div>
          <div className="row" style={{ gap: 12, alignItems: "center", marginTop: 10 }}>
            <div style={{ minWidth: 70 }}>Value 2</div>
            <InlineInput value={b3} onChange={setB3} placeholder="" style={{ width: 240 }} />
          </div>

          <ActionRow onCalc={calc3} onClear={clear3} />
        </Panel>
      </section>

      {/* ---------------- Block 4 ---------------- */}
      <h2 style={{ margin: "8px 0 10px" }}>Percentage Change Calculator</h2>

      {show4 && res4 && (
        <section className="card" style={{ marginBottom: 16 }}>
          <GreenResultBar title={res4.title} />
          <div style={{ fontSize: 22, marginBottom: 10 }}>
            {res4.line.split("=")[0]}= <span style={{ color: "rgb(60, 180, 75)", fontWeight: 900 }}>{res4.title.replace("Result: ", "")}</span>
          </div>

          <div style={{ fontWeight: 900, marginTop: 6 }}>Steps:</div>
          <div style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>
            {res4.steps.map((s, i) => (
              <div key={i}>{s}</div>
            ))}
          </div>
        </section>
      )}

      <section className="card">
        <Panel>
          <div className="row" style={{ gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <InlineInput value={v4} onChange={setV4} placeholder="" />
            <select value={mode4} onChange={(e) => setMode4(e.target.value)} style={{ width: 140 }}>
              <option value="Increase">Increase</option>
              <option value="Decrease">Decrease</option>
            </select>
            <InlineInput value={p4} onChange={setP4} placeholder="" />
            <div style={{ fontWeight: 900 }}>%</div>
            <div style={{ fontWeight: 900 }}>=</div>
            <InlineInput value={show4 && res4 ? res4.title.replace("Result: ", "") : ""} onChange={() => {}} placeholder="" style={{ background: "#f0eeff", color: "#1e1b4b" }} />
          </div>

          <ActionRow onCalc={calc4} onClear={clear4} />
        </Panel>
      </section>
    </div>
  );
}