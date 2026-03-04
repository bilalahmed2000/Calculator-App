import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

/**
 * Fraction Calculator (calculator.net style) — safe build:
 * - NO BigInt/globalThis/global
 * - Pure JS number math with gcd reduction
 * - Result only after Calculate
 * - "Show further explanation" collapsible section
 */

/* ------------------------- helpers ------------------------- */
const toIntSafe = (v) => {
  if (v === "" || v === null || v === undefined) return null;
  // allow leading +/-, disallow decimals for fraction parts
  const s = String(v).trim();
  if (!/^[+-]?\d+$/.test(s)) return NaN;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
};

const toNumSafe = (v) => {
  if (v === "" || v === null || v === undefined) return null;
  const s = String(v).trim();
  if (!/^[+-]?\d+(\.\d+)?$/.test(s)) return NaN;
  const n = Number(s);
  return Number.isFinite(n) ? n : NaN;
};

const abs = (n) => Math.abs(n);

const gcd = (a, b) => {
  let x = abs(a);
  let y = abs(b);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return 1;
  x = Math.trunc(x);
  y = Math.trunc(y);
  while (y !== 0) {
    const t = x % y;
    x = y;
    y = t;
  }
  return x === 0 ? 1 : x;
};

const lcm = (a, b) => {
  const g = gcd(a, b);
  return Math.trunc((a / g) * b);
};

const normalizeSign = (n, d) => {
  if (d < 0) return [-n, -d];
  return [n, d];
};

const reduceFrac = (n, d) => {
  if (d === 0) return { n, d, ok: false };
  if (n === 0) return { n: 0, d: 1, ok: true };
  const g = gcd(n, d);
  let nn = Math.trunc(n / g);
  let dd = Math.trunc(d / g);
  [nn, dd] = normalizeSign(nn, dd);
  return { n: nn, d: dd, ok: true };
};

const fracToDecimal = (n, d) => {
  if (d === 0) return NaN;
  return n / d;
};

const formatDecimal = (x) => {
  if (!Number.isFinite(x)) return "—";
  // calculator.net prints many decimals; we show up to 13-15 without trailing zeros explosion
  return String(Number(x.toPrecision(15))).replace(/\.0+$/, "");
};

const fracToMixed = (n, d) => {
  if (d === 0) return { w: 0, rn: n, rd: d };
  const sign = n < 0 ? -1 : 1;
  const nn = abs(n);
  const w = Math.trunc(nn / d);
  const r = nn % d;
  return { w: w * sign, rn: r, rd: d };
};

const mixedToImproper = (w, n, d) => {
  // w can be negative; numerator n assumed >=0
  const sign = w < 0 ? -1 : 1;
  const ww = abs(w);
  const num = sign * (ww * d + n);
  return { n: num, d };
};

const opLabel = (op) => {
  switch (op) {
    case "+":
      return "+";
    case "-":
      return "−";
    case "*":
      return "×";
    case "/":
      return "÷";
    default:
      return op;
  }
};

const calcFrac = (aN, aD, op, bN, bD) => {
  // returns reduced fraction
  if (aD === 0 || bD === 0) return { ok: false, n: 0, d: 0 };
  let n = 0;
  let d = 1;

  if (op === "+") {
    n = aN * bD + bN * aD;
    d = aD * bD;
  } else if (op === "-") {
    n = aN * bD - bN * aD;
    d = aD * bD;
  } else if (op === "*") {
    n = aN * bN;
    d = aD * bD;
  } else if (op === "/") {
    // a/b ÷ c/d = a/b * d/c
    n = aN * bD;
    d = aD * bN;
  } else {
    return { ok: false, n: 0, d: 0 };
  }

  return reduceFrac(n, d);
};

const prettyFrac = (n, d) => {
  if (d === 0) return "undefined";
  if (d === 1) return `${n}`;
  return `${n}/${d}`;
};

/* ------------------------- UI helpers for "fraction layout" ------------------------- */
function FractionView({ n, d }) {
  // simple stacked fraction look
  if (d === 0) return <span>—</span>;
  if (d === 1) return <span>{n}</span>;
  return (
    <span style={{ display: "inline-block", verticalAlign: "middle", textAlign: "center", lineHeight: 1.1 }}>
      <span style={{ display: "block", padding: "0 4px" }}>{n}</span>
      <span style={{ display: "block", borderTop: "2px solid currentColor", margin: "2px 0" }} />
      <span style={{ display: "block", padding: "0 4px" }}>{d}</span>
    </span>
  );
}

function SmallCardTitle({ children }) {
  return (
    <h2 style={{ margin: "0 0 10px", fontSize: 24, fontWeight: 800 }}>
      {children}
    </h2>
  );
}

/* ------------------------- Page ------------------------- */
export default function FractionCalculator() {
  /* ---------- 1) Fraction Calculator ---------- */
  const [aTop, setATop] = useState("2");
  const [aBot, setABot] = useState("7");
  const [op, setOp] = useState("+");
  const [bTop, setBTop] = useState("3");
  const [bBot, setBBot] = useState("8");

  const [showResult1, setShowResult1] = useState(false);
  const [showExplain1, setShowExplain1] = useState(false);

  /* ---------- 2) Mixed Numbers Calculator ---------- */
  const [m1, setM1] = useState("-2 3/4");
  const [mOp, setMOp] = useState("+");
  const [m2, setM2] = useState("3 5/7");

  const [showResult2, setShowResult2] = useState(false);
  const [showExplain2, setShowExplain2] = useState(false);

  /* ---------- 3) Simplify ---------- */
  const [sTop, setSTop] = useState("2");
  const [sBot, setSBot] = useState("98");
  const [showResult3, setShowResult3] = useState(false);
  const [showExplain3, setShowExplain3] = useState(false);

  /* ---------- 4) Decimal -> Fraction ---------- */
  const [decIn, setDecIn] = useState("1.375");
  const [showResult4, setShowResult4] = useState(false);
  const [showExplain4, setShowExplain4] = useState(false);

  /* ---------- 5) Fraction -> Decimal ---------- */
  const [fdTop, setFDTop] = useState("2");
  const [fdBot, setFDBot] = useState("7");
  const [showResult5, setShowResult5] = useState(false);

  /* ---------- 6) Big Number Fraction (no BigInt) ---------- */
  const [bnTop1, setBnTop1] = useState("1234");
  const [bnBot1, setBnBot1] = useState("748892928829");
  const [bnOp, setBnOp] = useState("+");
  const [bnTop2, setBnTop2] = useState("33434421132232234333");
  const [bnBot2, setBnBot2] = useState("8877277388288288288");
  const [showResult6, setShowResult6] = useState(false);

  /* ------------------- computations ------------------- */

  const frac1 = useMemo(() => {
    const n1 = toIntSafe(aTop);
    const d1 = toIntSafe(aBot);
    const n2 = toIntSafe(bTop);
    const d2 = toIntSafe(bBot);

    if ([n1, d1, n2, d2].some((x) => x === null)) {
      return { ok: false, err: "Please fill all fields." };
    }
    if ([n1, d1, n2, d2].some((x) => Number.isNaN(x))) {
      return { ok: false, err: "Please enter valid integers." };
    }
    if (d1 === 0 || d2 === 0) return { ok: false, err: "Denominator cannot be 0." };

    const res = calcFrac(n1, d1, op, n2, d2);
    if (!res.ok) return { ok: false, err: "Invalid operation." };

    const dec = fracToDecimal(res.n, res.d);
    const mixed = fracToMixed(res.n, res.d);

    // Steps (calculator.net style)
    const common = lcm(d1, d2);
    const s = [];
    if (op === "+" || op === "-") {
      const aMul = common / d1;
      const bMul = common / d2;
      const aN2 = n1 * aMul;
      const bN2 = n2 * bMul;
      const sumN = op === "+" ? aN2 + bN2 : aN2 - bN2;

      s.push({
        kind: "line",
        left: (
          <>
            <FractionView n={n1} d={d1} /> <span style={{ padding: "0 6px" }}>{opLabel(op)}</span>{" "}
            <FractionView n={n2} d={d2} />
          </>
        ),
        right: <span>= ?</span>,
      });

      s.push({
        kind: "line",
        left: (
          <>
            ={" "}
            <FractionView n={n1} d={d1} />{" "}
            <span style={{ padding: "0 6px" }}>×</span>
            <FractionView n={aMul} d={aMul} />{" "}
            <span style={{ padding: "0 10px" }}>{opLabel(op)}</span>
            <FractionView n={n2} d={d2} />{" "}
            <span style={{ padding: "0 6px" }}>×</span>
            <FractionView n={bMul} d={bMul} />
          </>
        ),
      });

      s.push({
        kind: "line",
        left: (
          <>
            = <FractionView n={aN2} d={common} />{" "}
            <span style={{ padding: "0 10px" }}>{opLabel(op)}</span>{" "}
            <FractionView n={bN2} d={common} />
          </>
        ),
      });

      s.push({
        kind: "line",
        left: (
          <>
            = <FractionView n={sumN} d={common} />
          </>
        ),
      });

      if (!(res.n === sumN && res.d === common)) {
        s.push({
          kind: "line",
          left: (
            <>
              = <FractionView n={res.n} d={res.d} />
            </>
          ),
        });
      }
    } else if (op === "*") {
      s.push({
        kind: "line",
        left: (
          <>
            <FractionView n={n1} d={d1} /> <span style={{ padding: "0 6px" }}>{opLabel(op)}</span>{" "}
            <FractionView n={n2} d={d2} />
          </>
        ),
        right: <span>= ?</span>,
      });
      s.push({
        kind: "line",
        left: (
          <>
            = <FractionView n={n1 * n2} d={d1 * d2} />
          </>
        ),
      });
      if (!(res.n === n1 * n2 && res.d === d1 * d2)) {
        s.push({
          kind: "line",
          left: (
            <>
              = <FractionView n={res.n} d={res.d} />
            </>
          ),
        });
      }
    } else if (op === "/") {
      s.push({
        kind: "line",
        left: (
          <>
            <FractionView n={n1} d={d1} /> <span style={{ padding: "0 6px" }}>{opLabel(op)}</span>{" "}
            <FractionView n={n2} d={d2} />
          </>
        ),
        right: <span>= ?</span>,
      });
      s.push({
        kind: "line",
        left: (
          <>
            = <FractionView n={n1} d={d1} /> <span style={{ padding: "0 6px" }}>×</span>{" "}
            <FractionView n={d2} d={n2} />
          </>
        ),
      });
      s.push({
        kind: "line",
        left: (
          <>
            = <FractionView n={n1 * d2} d={d1 * n2} />
          </>
        ),
      });
      if (!(res.n === n1 * d2 && res.d === d1 * n2)) {
        s.push({
          kind: "line",
          left: (
            <>
              = <FractionView n={res.n} d={res.d} />
            </>
          ),
        });
      }
    }

    // Further explanation text (collapsible)
    const further = {
      lcm: common,
      d1,
      d2,
      op,
    };

    return {
      ok: true,
      input: { n1, d1, n2, d2 },
      res,
      dec,
      mixed,
      steps: s,
      further,
    };
  }, [aTop, aBot, bTop, bBot, op]);

  // Mixed parse: "-2 3/4" or "3 5/7" or "-2" or "5/7"
  const parseMixed = (txt) => {
    const s = String(txt).trim();
    if (!s) return { ok: false, err: "Please enter a mixed number." };

    // Try "w n/d"
    const m = s.match(/^([+-]?\d+)\s+(\d+)\s*\/\s*(\d+)$/);
    if (m) {
      const w = Number(m[1]);
      const n = Number(m[2]);
      const d = Number(m[3]);
      if (![w, n, d].every(Number.isFinite)) return { ok: false, err: "Invalid mixed number." };
      if (d === 0) return { ok: false, err: "Denominator cannot be 0." };
      const imp = mixedToImproper(w, n, d);
      return { ok: true, n: imp.n, d: imp.d };
    }

    // Try "n/d"
    const f = s.match(/^([+-]?\d+)\s*\/\s*(\d+)$/);
    if (f) {
      const n = Number(f[1]);
      const d = Number(f[2]);
      if (!Number.isFinite(n) || !Number.isFinite(d)) return { ok: false, err: "Invalid fraction." };
      if (d === 0) return { ok: false, err: "Denominator cannot be 0." };
      return { ok: true, n, d };
    }

    // Try integer
    if (/^[+-]?\d+$/.test(s)) {
      const w = Number(s);
      return { ok: true, n: w, d: 1 };
    }

    return { ok: false, err: "Format examples: -2 3/4, 3 5/7, 5/7, 10" };
  };

  const mixedRes = useMemo(() => {
    const A = parseMixed(m1);
    const B = parseMixed(m2);
    if (!A.ok) return { ok: false, err: A.err };
    if (!B.ok) return { ok: false, err: B.err };

    const r = calcFrac(A.n, A.d, mOp, B.n, B.d);
    if (!r.ok) return { ok: false, err: "Invalid operation." };
    const dec = fracToDecimal(r.n, r.d);

    // steps: show conversion + operation
    const steps = [];
    steps.push({
      left: (
        <>
          {m1} <span style={{ padding: "0 6px" }}>{opLabel(mOp)}</span> {m2}
        </>
      ),
    });
    steps.push({
      left: (
        <>
          = <FractionView n={A.n} d={A.d} /> <span style={{ padding: "0 6px" }}>{opLabel(mOp)}</span>{" "}
          <FractionView n={B.n} d={B.d} />
        </>
      ),
    });
    steps.push({
      left: (
        <>
          = <FractionView n={r.n} d={r.d} />
        </>
      ),
    });

    return { ok: true, A, B, r, dec, steps };
  }, [m1, m2, mOp]);

  const simpRes = useMemo(() => {
    const n = toIntSafe(sTop);
    const d = toIntSafe(sBot);
    if (n === null || d === null) return { ok: false, err: "Please fill both fields." };
    if (Number.isNaN(n) || Number.isNaN(d)) return { ok: false, err: "Please enter valid integers." };
    if (d === 0) return { ok: false, err: "Denominator cannot be 0." };
    const r = reduceFrac(n, d);
    const dec = fracToDecimal(r.n, r.d);
    const g = gcd(n, d);
    return { ok: true, r, dec, g, n, d };
  }, [sTop, sBot]);

  const decToFracRes = useMemo(() => {
    const x = toNumSafe(decIn);
    if (x === null) return { ok: false, err: "Please enter a decimal." };
    if (Number.isNaN(x)) return { ok: false, err: "Please enter a valid decimal number." };

    // Convert decimal to fraction by scaling with 10^k up to 12 decimals
    const s = String(decIn).trim();
    const parts = s.split(".");
    if (parts.length === 1) {
      const n = Number(parts[0]);
      const r = reduceFrac(n, 1);
      return { ok: true, r, steps: [`${s} = ${r.n}/${r.d}`] };
    }

    const fracDigits = parts[1].length;
    const k = Math.min(fracDigits, 12);
    const scale = Math.pow(10, k);
    const n = Math.round(x * scale);
    const d = scale;
    const r = reduceFrac(n, d);

    const steps = [
      `${s}`,
      `= (${s} × ${scale}) / ${scale}`,
      `= ${n} / ${d}`,
      `= ${r.n} / ${r.d}`,
    ];

    // mixed if improper
    const mixed = fracToMixed(r.n, r.d);

    return { ok: true, r, mixed, steps };
  }, [decIn]);

  const fracToDecRes = useMemo(() => {
    const n = toIntSafe(fdTop);
    const d = toIntSafe(fdBot);
    if (n === null || d === null) return { ok: false, err: "Please fill both fields." };
    if (Number.isNaN(n) || Number.isNaN(d)) return { ok: false, err: "Please enter valid integers." };
    if (d === 0) return { ok: false, err: "Denominator cannot be 0." };
    const r = reduceFrac(n, d);
    const dec = fracToDecimal(r.n, r.d);
    return { ok: true, r, dec };
  }, [fdTop, fdBot]);

  const bigFracRes = useMemo(() => {
    // We keep it safe: parse as Number (may lose precision for extremely large inputs).
    // But it won't crash / blank the page.
    const n1 = toNumSafe(bnTop1);
    const d1 = toNumSafe(bnBot1);
    const n2 = toNumSafe(bnTop2);
    const d2 = toNumSafe(bnBot2);

    if ([n1, d1, n2, d2].some((x) => x === null)) return { ok: false, err: "Please fill all fields." };
    if ([n1, d1, n2, d2].some((x) => Number.isNaN(x))) return { ok: false, err: "Please enter valid numbers." };
    if (d1 === 0 || d2 === 0) return { ok: false, err: "Denominator cannot be 0." };

    // convert to integer-like by truncating (calculator.net expects big integers)
    const A = reduceFrac(Math.trunc(n1), Math.trunc(d1));
    const B = reduceFrac(Math.trunc(n2), Math.trunc(d2));
    const r = calcFrac(A.n, A.d, bnOp, B.n, B.d);
    if (!r.ok) return { ok: false, err: "Invalid operation." };

    return { ok: true, A, B, r, dec: fracToDecimal(r.n, r.d) };
  }, [bnTop1, bnBot1, bnTop2, bnBot2, bnOp]);

  /* ------------------- handlers ------------------- */
  const clearToBlanks = (setters) => setters.forEach((fn) => fn(""));

  const onClear1 = () => {
    clearToBlanks([setATop, setABot, setBTop, setBBot]);
    setOp("+");
    setShowResult1(false);
    setShowExplain1(false);
  };

  const onClear2 = () => {
    clearToBlanks([setM1, setM2]);
    setMOp("+");
    setShowResult2(false);
    setShowExplain2(false);
  };

  const onClear3 = () => {
    clearToBlanks([setSTop, setSBot]);
    setShowResult3(false);
    setShowExplain3(false);
  };

  const onClear4 = () => {
    setDecIn("");
    setShowResult4(false);
    setShowExplain4(false);
  };

  const onClear5 = () => {
    clearToBlanks([setFDTop, setFDBot]);
    setShowResult5(false);
  };

  const onClear6 = () => {
    clearToBlanks([setBnTop1, setBnBot1, setBnTop2, setBnBot2]);
    setBnOp("+");
    setShowResult6(false);
  };

  /* ------------------- reusable result header like calculator.net ------------------- */
  const ResultHeader = ({ title = "Result" }) => (
    <div
      style={{
        background: "rgba(16, 185, 129, 0.10)",
        border: "1px solid rgba(16, 185, 129, 0.30)",
        padding: "10px 12px",
        borderRadius: 12,
        fontWeight: 900,
        marginBottom: 10,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        color: "#065f46",
      }}
    >
      <span>{title}</span>
      <span className="small" style={{ opacity: 0.8 }}>
        save
      </span>
    </div>
  );

  const ExplanationToggle = ({ open, onToggle }) => (
    <button
      type="button"
      onClick={onToggle}
      className="btn btn-secondary"
      style={{
        padding: "6px 10px",
        fontSize: 13,
        marginTop: 8,
      }}
    >
      {open ? "Hide further explanation" : "+ Show further explanation"}
    </button>
  );

  /* ------------------- render ------------------- */
  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Fraction Calculator</h1>
        <p className="muted">
          Multiple fraction calculators for addition, subtraction, multiplication, division, simplification,
          and conversion between fractions and decimals — styled to match your theme.
        </p>
      </header>

      {/* 1) Fraction Calculator */}
      <section className="card">
        <SmallCardTitle>Fraction Calculator</SmallCardTitle>
        <p className="muted">
          Fields above represent numerators; fields below represent denominators.
        </p>

        {showResult1 && (
          <>
            <ResultHeader title="Result" />

            {frac1.ok ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>
                    <FractionView n={frac1.input.n1} d={frac1.input.d1} />{" "}
                    <span style={{ padding: "0 8px" }}>{opLabel(op)}</span>{" "}
                    <FractionView n={frac1.input.n2} d={frac1.input.d2} />{" "}
                    <span style={{ padding: "0 8px" }}>=</span>{" "}
                    <FractionView n={frac1.res.n} d={frac1.res.d} />
                  </div>
                </div>

                <div style={{ marginTop: 10 }}>
                  Result in decimals: <b>{formatDecimal(frac1.dec)}</b>
                </div>

                <div style={{ marginTop: 18, display: "flex", gap: 18, justifyContent: "center" }}>
                  {/* simple pie-ish visual (like calculator.net) */}
                  {[1, 2, 3].map((k) => (
                    <div
                      key={k}
                      style={{
                        width: 72,
                        height: 72,
                        borderRadius: 999,
                        border: "2px solid rgba(255,255,255,0.15)",
                        background: "#ede9fe",
                      }}
                    />
                  ))}
                </div>

                <div style={{ marginTop: 20 }}>
                  <b>Calculation steps:</b>
                  <div style={{ marginTop: 10, lineHeight: 2 }}>
                    {frac1.steps.map((row, idx) => (
                      <div key={idx} style={{ fontSize: 16 }}>
                        {row.left} {row.right ? <span style={{ marginLeft: 8 }}>{row.right}</span> : null}
                      </div>
                    ))}
                  </div>

                  <ExplanationToggle open={showExplain1} onToggle={() => setShowExplain1((s) => !s)} />

                  {showExplain1 && (
                    <div style={{ marginTop: 14 }}>
                      <b>Further explanation</b>
                      <div className="muted" style={{ marginTop: 8, lineHeight: 1.7 }}>
                        For the problem:
                        <div style={{ marginTop: 10, textAlign: "center", fontSize: 18, fontWeight: 800 }}>
                          <FractionView n={frac1.input.n1} d={frac1.input.d1} />{" "}
                          <span style={{ padding: "0 8px" }}>{opLabel(op)}</span>{" "}
                          <FractionView n={frac1.input.n2} d={frac1.input.d2} />{" "}
                          <span style={{ padding: "0 8px" }}>= ?</span>
                        </div>

                        {(op === "+" || op === "-") && (
                          <>
                            <p style={{ marginTop: 12 }}>
                              The Least Common Multiple (LCM) of {frac1.further.d1} and {frac1.further.d2} is{" "}
                              <b>{frac1.further.lcm}</b>. Multiply each fraction so the denominators match the LCM,
                              then add/subtract the numerators.
                            </p>
                          </>
                        )}

                        {op === "*" && (
                          <p style={{ marginTop: 12 }}>
                            Multiply numerators together and denominators together, then simplify the fraction.
                          </p>
                        )}

                        {op === "/" && (
                          <p style={{ marginTop: 12 }}>
                            Dividing by a fraction is the same as multiplying by its reciprocal. Then simplify.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="muted" style={{ padding: "8px 0" }}>
                {frac1.err}
              </div>
            )}
          </>
        )}

        {/* Input block (calculator.net layout) */}
        <div
          style={{
            marginTop: 14,
            display: "inline-block",
            padding: 14,
            border: "1px solid rgba(99, 102, 241, 0.15)",
            borderRadius: 12,
            background: "#f8f9ff",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "96px 50px 96px 60px 50px 96px", gap: 8, alignItems: "center" }}>
            <input value={aTop} onChange={(e) => setATop(e.target.value)} placeholder="" />
            <div />
            <input value={bTop} onChange={(e) => setBTop(e.target.value)} placeholder="" />
            <div style={{ fontWeight: 900, fontSize: 20, textAlign: "center" }}>=</div>
            <div style={{ fontWeight: 900, fontSize: 20, textAlign: "center" }}>?</div>
            <div />

            <input value={aBot} onChange={(e) => setABot(e.target.value)} placeholder="" />
            <select value={op} onChange={(e) => setOp(e.target.value)} style={{ height: 38 }}>
              <option value="+">+</option>
              <option value="-">−</option>
              <option value="*">×</option>
              <option value="/">÷</option>
            </select>
            <input value={bBot} onChange={(e) => setBBot(e.target.value)} placeholder="" />
            <div />
            <div />
            <div />
          </div>

          <div className="row" style={{ marginTop: 12, gap: 10 }}>
            <button type="button" className="btn" onClick={() => setShowResult1(true)}>
              Calculate
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClear1}>
              Clear
            </button>
          </div>
        </div>
      </section>

      {/* 2) Mixed Numbers */}
      <section className="card" style={{ marginTop: 16 }}>
        <SmallCardTitle>Mixed Numbers Calculator</SmallCardTitle>

        {showResult2 && (
          <>
            <ResultHeader title="Result" />
            {mixedRes.ok ? (
              <>
                <div style={{ fontSize: 18, fontWeight: 800 }}>
                  {m1} <span style={{ padding: "0 8px" }}>{opLabel(mOp)}</span> {m2}{" "}
                  <span style={{ padding: "0 8px" }}>=</span>{" "}
                  <FractionView n={mixedRes.r.n} d={mixedRes.r.d} />
                </div>
                <div style={{ marginTop: 10 }}>Result in decimals: <b>{formatDecimal(mixedRes.dec)}</b></div>

                <div style={{ marginTop: 16 }}>
                  <b>Calculation steps:</b>
                  <div style={{ marginTop: 8, lineHeight: 2 }}>
                    {mixedRes.steps.map((st, i) => (
                      <div key={i}>{st.left}</div>
                    ))}
                  </div>

                  <ExplanationToggle open={showExplain2} onToggle={() => setShowExplain2((s) => !s)} />
                  {showExplain2 && (
                    <div style={{ marginTop: 12 }} className="muted">
                      Convert mixed numbers to improper fractions, perform the operation, then simplify.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="muted">{mixedRes.err}</div>
            )}
          </>
        )}

        <div
          style={{
            marginTop: 12,
            display: "inline-block",
            padding: 14,
            border: "1px solid rgba(99, 102, 241, 0.15)",
            borderRadius: 12,
            background: "#f8f9ff",
            minWidth: 520,
            maxWidth: "100%",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 1fr 60px 40px", gap: 10, alignItems: "center" }}>
            <input value={m1} onChange={(e) => setM1(e.target.value)} placeholder="-2 3/4" />
            <select value={mOp} onChange={(e) => setMOp(e.target.value)} style={{ height: 38 }}>
              <option value="+">+</option>
              <option value="-">−</option>
              <option value="*">×</option>
              <option value="/">÷</option>
            </select>
            <input value={m2} onChange={(e) => setM2(e.target.value)} placeholder="3 5/7" />
            <div style={{ fontWeight: 900, fontSize: 20, textAlign: "center" }}>=</div>
            <div style={{ fontWeight: 900, fontSize: 20, textAlign: "center" }}>?</div>
          </div>

          <div className="row" style={{ marginTop: 12, gap: 10 }}>
            <button type="button" className="btn" onClick={() => setShowResult2(true)}>
              Calculate
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClear2}>
              Clear
            </button>
          </div>
        </div>
      </section>

      {/* 3) Simplify */}
      <section className="card" style={{ marginTop: 16 }}>
        <SmallCardTitle>Simplify Fractions Calculator</SmallCardTitle>

        {showResult3 && (
          <>
            <ResultHeader title="Result" />
            {simpRes.ok ? (
              <>
                <div style={{ fontSize: 18, fontWeight: 800 }}>
                  <FractionView n={simpRes.n} d={simpRes.d} />{" "}
                  <span style={{ padding: "0 8px" }}>=</span>{" "}
                  <FractionView n={simpRes.r.n} d={simpRes.r.d} />
                </div>
                <div style={{ marginTop: 10 }}>Result in decimals: <b>{formatDecimal(simpRes.dec)}</b></div>

                <div style={{ marginTop: 16 }}>
                  <b>Calculation steps:</b>
                  <div style={{ marginTop: 8, lineHeight: 2 }}>
                    <div>
                      gcd({simpRes.n}, {simpRes.d}) = <b>{simpRes.g}</b>
                    </div>
                    <div>
                      = <FractionView n={simpRes.n} d={simpRes.d} />{" "}
                      <span style={{ padding: "0 8px" }}>=</span>{" "}
                      <FractionView n={Math.trunc(simpRes.n / simpRes.g)} d={Math.trunc(simpRes.d / simpRes.g)} />
                    </div>
                  </div>

                  <ExplanationToggle open={showExplain3} onToggle={() => setShowExplain3((s) => !s)} />
                  {showExplain3 && (
                    <div style={{ marginTop: 12 }} className="muted">
                      Divide numerator and denominator by their greatest common divisor (GCD).
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="muted">{simpRes.err}</div>
            )}
          </>
        )}

        <div
          style={{
            marginTop: 12,
            display: "inline-block",
            padding: 14,
            border: "1px solid rgba(99, 102, 241, 0.15)",
            borderRadius: 12,
            background: "#f8f9ff",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "140px 60px 140px", gap: 10, alignItems: "center" }}>
            <input value={sTop} onChange={(e) => setSTop(e.target.value)} placeholder="2" />
            <div style={{ fontWeight: 900, fontSize: 20, textAlign: "center" }} />
            <input value={sBot} onChange={(e) => setSBot(e.target.value)} placeholder="98" />
          </div>

          <div className="row" style={{ marginTop: 12, gap: 10 }}>
            <button type="button" className="btn" onClick={() => setShowResult3(true)}>
              Calculate
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClear3}>
              Clear
            </button>
          </div>
        </div>
      </section>

      {/* 4) Decimal -> Fraction */}
      <section className="card" style={{ marginTop: 16 }}>
        <SmallCardTitle>Decimal to Fraction Calculator</SmallCardTitle>

        {showResult4 && (
          <>
            <ResultHeader title="Result" />
            {decToFracRes.ok ? (
              <>
                <div style={{ fontSize: 18, fontWeight: 800 }}>
                  {decIn || "—"} <span style={{ padding: "0 8px" }}>=</span>{" "}
                  <FractionView n={decToFracRes.r.n} d={decToFracRes.r.d} />
                </div>

                <div style={{ marginTop: 16 }}>
                  <b>Calculation steps:</b>
                  <div style={{ marginTop: 8, lineHeight: 2 }}>
                    {decToFracRes.steps.map((t, i) => (
                      <div key={i}>{t}</div>
                    ))}
                  </div>

                  <ExplanationToggle open={showExplain4} onToggle={() => setShowExplain4((s) => !s)} />
                  {showExplain4 && (
                    <div style={{ marginTop: 12 }} className="muted">
                      Move the decimal by multiplying by a power of 10, then reduce the fraction.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="muted">{decToFracRes.err}</div>
            )}
          </>
        )}

        <div
          style={{
            marginTop: 12,
            display: "inline-block",
            padding: 14,
            border: "1px solid rgba(99, 102, 241, 0.15)",
            borderRadius: 12,
            background: "#f8f9ff",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "220px 60px 40px 40px", gap: 10, alignItems: "center" }}>
            <input value={decIn} onChange={(e) => setDecIn(e.target.value)} placeholder="1.375" />
            <div style={{ fontWeight: 900, fontSize: 20, textAlign: "center" }}>=</div>
            <div style={{ fontWeight: 900, fontSize: 20, textAlign: "center" }}>?</div>
            <div style={{ fontWeight: 900, fontSize: 20, textAlign: "center" }}>?</div>
          </div>

          <div className="row" style={{ marginTop: 12, gap: 10 }}>
            <button type="button" className="btn" onClick={() => setShowResult4(true)}>
              Calculate
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClear4}>
              Clear
            </button>
          </div>
        </div>
      </section>

      {/* 5) Fraction -> Decimal */}
      <section className="card" style={{ marginTop: 16 }}>
        <SmallCardTitle>Fraction to Decimal Calculator</SmallCardTitle>

        {showResult5 && (
          <>
            <ResultHeader title="Result" />
            {fracToDecRes.ok ? (
              <div style={{ fontSize: 18, fontWeight: 800 }}>
                <FractionView n={fracToDecRes.r.n} d={fracToDecRes.r.d} />{" "}
                <span style={{ padding: "0 8px" }}>=</span>{" "}
                {formatDecimal(fracToDecRes.dec)}
              </div>
            ) : (
              <div className="muted">{fracToDecRes.err}</div>
            )}
          </>
        )}

        <div
          style={{
            marginTop: 12,
            display: "inline-block",
            padding: 14,
            border: "1px solid rgba(99, 102, 241, 0.15)",
            borderRadius: 12,
            background: "#f8f9ff",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "180px 60px 60px", gap: 10, alignItems: "center" }}>
            <div>
              <input value={fdTop} onChange={(e) => setFDTop(e.target.value)} placeholder="2" />
              <input value={fdBot} onChange={(e) => setFDBot(e.target.value)} placeholder="7" style={{ marginTop: 8 }} />
            </div>
            <div style={{ fontWeight: 900, fontSize: 20, textAlign: "center" }}>=</div>
            <div style={{ fontWeight: 900, fontSize: 20, textAlign: "center" }}>?</div>
          </div>

          <div className="row" style={{ marginTop: 12, gap: 10 }}>
            <button type="button" className="btn" onClick={() => setShowResult5(true)}>
              Calculate
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClear5}>
              Clear
            </button>
          </div>
        </div>
      </section>

      {/* 6) Big Number Fraction */}
      <section className="card" style={{ marginTop: 16 }}>
        <SmallCardTitle>Big Number Fraction Calculator</SmallCardTitle>
        <p className="muted">
          Note: To avoid crashes and eslint issues, this version uses normal number math (very large values may lose precision).
        </p>

        {showResult6 && (
          <>
            <ResultHeader title="Result" />
            {bigFracRes.ok ? (
              <>
                <div style={{ fontSize: 16, fontWeight: 800, lineHeight: 1.8 }}>
                  <FractionView n={bigFracRes.A.n} d={bigFracRes.A.d} />{" "}
                  <span style={{ padding: "0 8px" }}>{opLabel(bnOp)}</span>{" "}
                  <FractionView n={bigFracRes.B.n} d={bigFracRes.B.d} />{" "}
                  <span style={{ padding: "0 8px" }}>=</span>{" "}
                  <FractionView n={bigFracRes.r.n} d={bigFracRes.r.d} />
                </div>
                <div style={{ marginTop: 8 }}>Result in decimals: <b>{formatDecimal(bigFracRes.dec)}</b></div>
              </>
            ) : (
              <div className="muted">{bigFracRes.err}</div>
            )}
          </>
        )}

        <div
          style={{
            marginTop: 12,
            display: "inline-block",
            padding: 14,
            border: "1px solid rgba(99, 102, 241, 0.15)",
            borderRadius: 12,
            background: "#f8f9ff",
            maxWidth: "100%",
          }}
        >
          <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 1fr 60px 40px", gap: 10, alignItems: "center" }}>
            <div>
              <input value={bnTop1} onChange={(e) => setBnTop1(e.target.value)} placeholder="1234" />
              <input value={bnBot1} onChange={(e) => setBnBot1(e.target.value)} placeholder="748892928829" style={{ marginTop: 8 }} />
            </div>

            <select value={bnOp} onChange={(e) => setBnOp(e.target.value)} style={{ height: 38 }}>
              <option value="+">+</option>
              <option value="-">−</option>
              <option value="*">×</option>
              <option value="/">÷</option>
            </select>

            <div>
              <input value={bnTop2} onChange={(e) => setBnTop2(e.target.value)} placeholder="33434421132232234333" />
              <input value={bnBot2} onChange={(e) => setBnBot2(e.target.value)} placeholder="8877277388288288288" style={{ marginTop: 8 }} />
            </div>

            <div style={{ fontWeight: 900, fontSize: 20, textAlign: "center" }}>=</div>
            <div style={{ fontWeight: 900, fontSize: 20, textAlign: "center" }}>?</div>
          </div>

          <div className="row" style={{ marginTop: 12, gap: 10 }}>
            <button type="button" className="btn" onClick={() => setShowResult6(true)}>
              Calculate
            </button>
            <button type="button" className="btn btn-secondary" onClick={onClear6}>
              Clear
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}