import React, { useCallback, useEffect, useMemo, useState } from "react";
import "../css/CalcBase.css";

/**
 * Scientific Calculator (calculator.net style)
 * - No external libs (no eval). Uses tokenizer + shunting-yard parser.
 * - Supports: + - * / ^, parentheses
 * - Functions: sin cos tan, asin acos atan, ln log
 * - Constants: pi, e
 * - Postfix: factorial !
 * - Percent: % => /100
 * - EXP: scientific notation like 1E3
 * - Deg/Rad toggle affects trig + inverse trig outputs
 */

const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

const isDigit = (c) => c >= "0" && c <= "9";
const isAlpha = (c) => (c >= "a" && c <= "z") || (c >= "A" && c <= "Z");
const isSpace = (c) => c === " " || c === "\t" || c === "\n" || c === "\r";

const fmt = (n) => {
  if (!Number.isFinite(n)) return "Error";
  // calculator.net shows compact-ish results; avoid long floats
  const abs = Math.abs(n);
  if (abs !== 0 && (abs >= 1e12 || abs < 1e-9)) return n.toExponential(10).replace(/\.?0+e/, "e");
  // trim floating noise
  const s = String(Number(n.toPrecision(12)));
  return s;
};

function factorial(x) {
  // calculator.net factorial is for integers; we’ll keep it integer-only
  if (!Number.isFinite(x)) return NaN;
  const n = Math.floor(x);
  if (n !== x) return NaN;
  if (n < 0) return NaN;
  if (n > 170) return Infinity; // beyond JS float factorial range
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

/** DEG/RAD wrappers */
const toRad = (deg) => (deg * Math.PI) / 180;
const toDeg = (rad) => (rad * 180) / Math.PI;

function makeFns(angleMode) {
  const degMode = angleMode === "DEG";
  return {
    sin: (x) => Math.sin(degMode ? toRad(x) : x),
    cos: (x) => Math.cos(degMode ? toRad(x) : x),
    tan: (x) => Math.tan(degMode ? toRad(x) : x),
    asin: (x) => (degMode ? toDeg(Math.asin(x)) : Math.asin(x)),
    acos: (x) => (degMode ? toDeg(Math.acos(x)) : Math.acos(x)),
    atan: (x) => (degMode ? toDeg(Math.atan(x)) : Math.atan(x)),
    ln: (x) => Math.log(x),
    log: (x) => Math.log10(x),
    sqrt: (x) => Math.sqrt(x),
  };
}

/**
 * Tokenizer:
 * numbers: 12, 12.3, .5
 * scientific: 1E3, 1e-3 (we store as NUMBER directly)
 * identifiers: sin, cos, pi, e, ans
 * operators: + - * / ^ ( ) ! %
 */
function tokenize(src) {
  const s = src.trim();
  const out = [];
  let i = 0;

  const push = (t) => out.push(t);

  while (i < s.length) {
    const c = s[i];
    if (isSpace(c)) {
      i++;
      continue;
    }

    // number
    if (isDigit(c) || c === ".") {
      let j = i;
      let seenDot = false;
      if (s[j] === ".") {
        seenDot = true;
        j++;
      }
      while (j < s.length && isDigit(s[j])) j++;
      if (j < s.length && s[j] === "." && !seenDot) {
        seenDot = true;
        j++;
        while (j < s.length && isDigit(s[j])) j++;
      }

      // exponent part: E or e
      if (j < s.length && (s[j] === "E" || s[j] === "e")) {
        let k = j + 1;
        if (k < s.length && (s[k] === "+" || s[k] === "-")) k++;
        let hasExpDigits = false;
        while (k < s.length && isDigit(s[k])) {
          hasExpDigits = true;
          k++;
        }
        if (hasExpDigits) j = k; // include exponent
      }

      const raw = s.slice(i, j);
      const num = Number(raw);
      push({ type: "NUMBER", value: num });
      i = j;
      continue;
    }

    // identifiers (functions/constants)
    if (isAlpha(c)) {
      let j = i;
      while (j < s.length && (isAlpha(s[j]) || isDigit(s[j]) || s[j] === "_")) j++;
      const id = s.slice(i, j).toLowerCase();
      push({ type: "ID", value: id });
      i = j;
      continue;
    }

    // operators / parens
    if ("+-*/^()!%".includes(c)) {
      push({ type: "OP", value: c });
      i++;
      continue;
    }

    // unknown
    push({ type: "BAD", value: c });
    i++;
  }
  return out;
}

/** Shunting-yard to RPN + eval RPN */
function evaluateExpression(expr, { angleMode, ansValue }) {
  const fns = makeFns(angleMode);
  const tokens = tokenize(expr);

  // Reject BAD tokens early
  if (tokens.some((t) => t.type === "BAD")) return { ok: false, value: NaN };

  // Insert implicit multiplication:
  // e.g. "2pi" => "2 * pi", ")(" => ")*(", "2(" => "2*("
  const withImplicit = [];
  const canEndTerm = (t) =>
    (t.type === "NUMBER") ||
    (t.type === "ID") ||
    (t.type === "OP" && (t.value === ")" || t.value === "!" || t.value === "%"));

  const canStartTerm = (t) =>
    (t.type === "NUMBER") ||
    (t.type === "ID") ||
    (t.type === "OP" && t.value === "(");

  for (let k = 0; k < tokens.length; k++) {
    const prev = withImplicit[withImplicit.length - 1];
    const cur = tokens[k];
    if (prev && canEndTerm(prev) && canStartTerm(cur)) {
      // But don't do ID ID without operator if first is a function name and second is "(" (handled by function call)
      // Example: "sin(" should not become "sin*("
      const prevIsFunc = prev.type === "ID" && ["sin", "cos", "tan", "asin", "acos", "atan", "ln", "log", "sqrt"].includes(prev.value);
      if (!(prevIsFunc && cur.type === "OP" && cur.value === "(")) {
        withImplicit.push({ type: "OP", value: "*" });
      }
    }
    withImplicit.push(cur);
  }

  // Handle unary minus by converting to "u-" operator
  const normalized = [];
  for (let k = 0; k < withImplicit.length; k++) {
    const t = withImplicit[k];
    if (t.type === "OP" && t.value === "-") {
      const prev = normalized[normalized.length - 1];
      const isUnary =
        !prev ||
        (prev.type === "OP" && (prev.value === "(" || "+-*/^".includes(prev.value)));
      if (isUnary) {
        normalized.push({ type: "OP", value: "u-" });
        continue;
      }
    }
    normalized.push(t);
  }

  // Operator precedence/associativity
  const prec = {
    "u-": 5,
    "!": 5,
    "%": 5,
    "^": 4,
    "*": 3,
    "/": 3,
    "+": 2,
    "-": 2,
  };
  const rightAssoc = { "^": true, "u-": true };

  const isFunc = (id) => ["sin", "cos", "tan", "asin", "acos", "atan", "ln", "log", "sqrt"].includes(id);

  // Shunting-yard
  const output = [];
  const stack = [];

  for (let k = 0; k < normalized.length; k++) {
    const t = normalized[k];

    if (t.type === "NUMBER") {
      output.push(t);
      continue;
    }

    if (t.type === "ID") {
      const v = t.value;
      if (v === "pi") output.push({ type: "NUMBER", value: Math.PI });
      else if (v === "e") output.push({ type: "NUMBER", value: Math.E });
      else if (v === "ans") output.push({ type: "NUMBER", value: Number(ansValue ?? 0) });
      else if (isFunc(v)) stack.push({ type: "FUNC", value: v });
      else return { ok: false, value: NaN }; // unknown identifier
      continue;
    }

    if (t.type === "OP") {
      const op = t.value;

      if (op === "(") {
        stack.push(t);
        continue;
      }
      if (op === ")") {
        while (stack.length && stack[stack.length - 1].value !== "(") {
          output.push(stack.pop());
        }
        if (!stack.length) return { ok: false, value: NaN }; // mismatched
        stack.pop(); // pop "("
        // if function on top, pop it
        if (stack.length && stack[stack.length - 1].type === "FUNC") {
          output.push(stack.pop());
        }
        continue;
      }

      // postfix operators (! and %) go straight to output
      if (op === "!" || op === "%") {
        output.push({ type: "OP", value: op });
        continue;
      }

      // normal operators (+-*/^ and u-)
      while (
        stack.length &&
        (stack[stack.length - 1].type === "OP" || stack[stack.length - 1].type === "FUNC") &&
        stack[stack.length - 1].value !== "("
      ) {
        const top = stack[stack.length - 1];
        if (top.type === "FUNC") {
          output.push(stack.pop());
          continue;
        }
        const topOp = top.value;
        const pTop = prec[topOp] ?? 0;
        const pCur = prec[op] ?? 0;
        if (pTop > pCur || (pTop === pCur && !rightAssoc[op])) {
          output.push(stack.pop());
        } else break;
      }
      stack.push({ type: "OP", value: op });
      continue;
    }

    return { ok: false, value: NaN };
  }

  while (stack.length) {
    const t = stack.pop();
    if (t.value === "(" || t.value === ")") return { ok: false, value: NaN };
    output.push(t);
  }

  // Eval RPN
  const st = [];
  for (const t of output) {
    if (t.type === "NUMBER") {
      st.push(t.value);
      continue;
    }
    if (t.type === "FUNC") {
      const a = st.pop();
      if (a === undefined) return { ok: false, value: NaN };
      const fn = fns[t.value];
      const r = fn ? fn(a) : NaN;
      st.push(r);
      continue;
    }
    if (t.type === "OP") {
      const op = t.value;

      if (op === "u-") {
        const a = st.pop();
        if (a === undefined) return { ok: false, value: NaN };
        st.push(-a);
        continue;
      }
      if (op === "!") {
        const a = st.pop();
        if (a === undefined) return { ok: false, value: NaN };
        st.push(factorial(a));
        continue;
      }
      if (op === "%") {
        const a = st.pop();
        if (a === undefined) return { ok: false, value: NaN };
        st.push(a / 100);
        continue;
      }

      const b = st.pop();
      const a = st.pop();
      if (a === undefined || b === undefined) return { ok: false, value: NaN };

      let r = NaN;
      if (op === "+") r = a + b;
      else if (op === "-") r = a - b;
      else if (op === "*") r = a * b;
      else if (op === "/") r = a / b;
      else if (op === "^") r = Math.pow(a, b);
      else return { ok: false, value: NaN };

      st.push(r);
      continue;
    }
    return { ok: false, value: NaN };
  }

  if (st.length !== 1) return { ok: false, value: NaN };
  return { ok: true, value: st[0] };
}

export default function ScientificCalculator() {
  const [angleMode, setAngleMode] = useState("DEG"); // DEG | RAD
  const [expr, setExpr] = useState(""); // input expression
  const [display, setDisplay] = useState("0"); // top display
  const [ans, setAns] = useState(0);
  const [memory, setMemory] = useState(0);
  const [error, setError] = useState(false);

  const show = useCallback(
    (txt) => {
      setDisplay(txt);
    },
    [setDisplay]
  );

  const preview = useCallback(() => {
    if (!expr.trim()) {
      setError(false);
      show("0");
      return;
    }
    const res = evaluateExpression(expr, { angleMode, ansValue: ans });
    if (!res.ok || !Number.isFinite(res.value)) {
      setError(true);
      show("Error");
      return;
    }
    setError(false);
    show(fmt(res.value));
  }, [expr, angleMode, ans, show]);

  useEffect(() => {
    // calculator.net shows live-ish display; we’ll preview on every change
    preview();
  }, [preview]);

  const append = (s) => setExpr((p) => p + s);

  const backspace = () => setExpr((p) => (p.length ? p.slice(0, -1) : ""));

  const ac = () => {
    setExpr("");
    setDisplay("0");
    setError(false);
  };

  const toggleSign = () => {
    // If expr empty => "-"
    if (!expr) {
      setExpr("-");
      return;
    }
    // Try to toggle last number segment
    // Find last token boundary (after last operator or '(')
    const p = expr;
    let i = p.length - 1;

    // skip trailing spaces
    while (i >= 0 && isSpace(p[i])) i--;

    // if ends with ')' or '!' or '%' -> wrap whole expression
    if (i >= 0 && (p[i] === ")" || p[i] === "!" || p[i] === "%")) {
      setExpr(`-(${p})`);
      return;
    }

    // find start of last number/identifier
    let j = i;
    while (j >= 0 && (isDigit(p[j]) || p[j] === "." || p[j] === "E" || p[j] === "e" || p[j] === "+" || p[j] === "-")) {
      // break carefully for signs that belong to exponent
      // keep scanning; we’ll fix below
      j--;
    }
    j++;

    // If we didn't land on a number, just wrap
    const tail = p.slice(j);
    if (!tail || (!/[0-9.]/.test(tail) && tail.toLowerCase() !== "ans" && tail.toLowerCase() !== "pi" && tail.toLowerCase() !== "e")) {
      setExpr(`-(${p})`);
      return;
    }

    // Toggle by wrapping last segment
    const head = p.slice(0, j);
    if (tail.startsWith("(-") && tail.endsWith(")")) {
      setExpr(head + tail.slice(2, -1));
    } else {
      setExpr(head + `(-${tail})`);
    }
  };

  const pressEquals = () => {
    const res = evaluateExpression(expr, { angleMode, ansValue: ans });
    if (!res.ok || !Number.isFinite(res.value)) {
      setError(true);
      setDisplay("Error");
      return;
    }
    setError(false);
    setAns(res.value);
    // calculator.net effectively replaces with result
    setExpr(fmt(res.value));
  };

  const pressFunc = (name) => {
    // calculator.net: pressing sin inserts "sin("
    append(`${name}(`);
  };

  const pressConst = (c) => {
    if (c === "pi") append("pi");
    else if (c === "e") append("e");
  };

  const pressExp = () => {
    // Insert exponent notation "E"
    // If expression ends with nothing/ops, start with "1E"
    setExpr((p) => {
      const t = p.trimEnd();
      if (!t) return "1E";
      const last = t[t.length - 1];
      if ("+-*/^(".includes(last)) return p + "1E";
      // prevent multiple E on same number chunk (soft)
      return p + "E";
    });
  };

  const pressRnd = () => {
    const r = Math.random();
    // show as 0.xxx similar feel
    append(fmt(Number(r.toFixed(10))));
  };

  const pressAns = () => append("ans");

  const mPlus = () => {
    const res = evaluateExpression(expr || "0", { angleMode, ansValue: ans });
    if (!res.ok || !Number.isFinite(res.value)) return;
    setMemory((m) => m + res.value);
  };

  const mMinus = () => {
    const res = evaluateExpression(expr || "0", { angleMode, ansValue: ans });
    if (!res.ok || !Number.isFinite(res.value)) return;
    setMemory((m) => m - res.value);
  };

  const mRecall = () => {
    append(fmt(memory));
  };

  // keyboard support
  useEffect(() => {
    const onKeyDown = (e) => {
      const k = e.key;
      if (k === "Enter") {
        e.preventDefault();
        pressEquals();
        return;
      }
      if (k === "Backspace") {
        e.preventDefault();
        backspace();
        return;
      }
      if (k === "Escape") {
        e.preventDefault();
        ac();
        return;
      }
      // allow typing numbers and operators
      if (/^[0-9]$/.test(k)) return append(k);
      if (k === ".") return append(".");
      if (k === "+") return append("+");
      if (k === "-") return append("-");
      if (k === "*") return append("*");
      if (k === "/") return append("/");
      if (k === "(") return append("(");
      if (k === ")") return append(")");
      if (k === "%") return append("%");
      if (k === "^") return append("^");
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expr, angleMode, ans, memory]);

  const buttons = useMemo(
    () => [
      // row 1
      [
        { t: "sin", on: () => pressFunc("sin") },
        { t: "cos", on: () => pressFunc("cos") },
        { t: "tan", on: () => pressFunc("tan") },
        { t: "Deg", kind: "toggle", on: () => setAngleMode("DEG") },
        { t: "Rad", kind: "toggle", on: () => setAngleMode("RAD") },
      ],
      // row 2
      [
        { t: "sin⁻¹", on: () => pressFunc("asin") },
        { t: "cos⁻¹", on: () => pressFunc("acos") },
        { t: "tan⁻¹", on: () => pressFunc("atan") },
        { t: "π", on: () => pressConst("pi") },
        { t: "e", on: () => pressConst("e") },
      ],
      // row 3
      [
        { t: "xʸ", on: () => append("^") },
        { t: "x³", on: () => append("^3") },
        { t: "x²", on: () => append("^2") },
        { t: "eˣ", on: () => append("e^") },
        { t: "10ˣ", on: () => append("10^") },
      ],
      // row 4
      [
        { t: "ʸ√x", on: () => append("^(1/") }, // user can finish like ^(1/3)
        { t: "³√x", on: () => append("^(1/3)") },
        { t: "√x", on: () => append("sqrt(") },
        { t: "ln", on: () => pressFunc("ln") },
        { t: "log", on: () => pressFunc("log") },
      ],
      // row 5
      [
        { t: "(", on: () => append("(") },
        { t: ")", on: () => append(")") },
        { t: "1/x", on: () => append("^( -1 )") }, // quick reciprocal; user can also use / ( )
        { t: "%", on: () => append("%") },
        { t: "n!", on: () => append("!") },
      ],
      // row 6
      [
        { t: "7", on: () => append("7"), kind: "num" },
        { t: "8", on: () => append("8"), kind: "num" },
        { t: "9", on: () => append("9"), kind: "num" },
        { t: "+", on: () => append("+"), kind: "op" },
        { t: "Back", on: backspace, kind: "soft" },
      ],
      // row 7
      [
        { t: "4", on: () => append("4"), kind: "num" },
        { t: "5", on: () => append("5"), kind: "num" },
        { t: "6", on: () => append("6"), kind: "num" },
        { t: "−", on: () => append("-"), kind: "op" },
        { t: "Ans", on: pressAns, kind: "soft" },
      ],
      // row 8
      [
        { t: "1", on: () => append("1"), kind: "num" },
        { t: "2", on: () => append("2"), kind: "num" },
        { t: "3", on: () => append("3"), kind: "num" },
        { t: "×", on: () => append("*"), kind: "op" },
        { t: "M+", on: mPlus, kind: "soft" },
      ],
      // row 9
      [
        { t: "0", on: () => append("0"), kind: "num" },
        { t: ".", on: () => append("."), kind: "num" },
        { t: "EXP", on: pressExp, kind: "soft" },
        { t: "÷", on: () => append("/"), kind: "op" },
        { t: "M-", on: mMinus, kind: "soft" },
      ],
      // row 10
      [
        { t: "±", on: toggleSign, kind: "soft" },
        { t: "RND", on: pressRnd, kind: "soft" },
        { t: "AC", on: ac, kind: "danger" },
        { t: "=", on: pressEquals, kind: "equal" },
        { t: "MR", on: mRecall, kind: "soft" },
      ],
    ],
    [angleMode, expr, ans, memory]
  );

  const btnClass = (b) => {
    const base = "sc-btn";
    if (b.kind === "num") return `${base} sc-num`;
    if (b.kind === "op") return `${base} sc-op`;
    if (b.kind === "equal") return `${base} sc-eq`;
    if (b.kind === "danger") return `${base} sc-ac`;
    if (b.kind === "toggle") return `${base} sc-toggle`;
    return `${base} sc-soft`;
  };

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Scientific Calculator</h1>
        <p className="muted">
          Click the buttons or type to perform calculations (Deg/Rad, trig, logs, powers, factorial, EXP, memory).
        </p>
      </header>

      <div className="calc-grid" style={{ gridTemplateColumns: "1fr" }}>
        <section className="card" style={{ maxWidth: 520, marginInline: "auto" }}>
          {/* Display */}
          <div
            style={{
              borderRadius: 14,
              padding: 12,
              border: "1px solid rgba(15, 26, 44, 0.25)",
              background: "#1a2540",
              color: "#e8f0ff",
              boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.25)",
              marginBottom: 10,
            }}
          >
            <div style={{ fontSize: 12, opacity: 0.8, display: "flex", justifyContent: "space-between" }}>
              <span>Expr: {expr || " "}</span>
              <span>
                Mode: <b>{angleMode}</b> • Ans: <b>{fmt(ans)}</b> • M: <b>{fmt(memory)}</b>
              </span>
            </div>
            <div
              style={{
                fontSize: 34,
                fontWeight: 800,
                textAlign: "right",
                paddingTop: 6,
                color: error ? "#ff8a8a" : "inherit",
              }}
            >
              {display}
            </div>
          </div>

          {/* Buttons grid */}
          <div className="sc-grid">
            {buttons.flat().map((b, idx) => (
              <button
                key={`${b.t}-${idx}`}
                type="button"
                className={btnClass(b)}
                onClick={b.on}
                aria-label={b.t}
                data-active={
                  b.kind === "toggle" &&
                  ((b.t === "Deg" && angleMode === "DEG") || (b.t === "Rad" && angleMode === "RAD"))
                    ? "true"
                    : "false"
                }
              >
                {b.t}
              </button>
            ))}
          </div>

          <div className="small" style={{ marginTop: 10, opacity: 0.85 }}>
            Tips: Use <b>^</b> for power, <b>!</b> for factorial, <b>%</b> for percent, <b>EXP</b> for scientific notation.
            Press <b>Enter</b> for =, <b>Esc</b> for AC.
          </div>
        </section>
      </div>

      {/* Local styles (kept inside component so you don't need a new CSS file) */}
      <style>{`
        .sc-grid{
          display:grid;
          grid-template-columns: repeat(5, 1fr);
          gap:8px;
        }
        .sc-btn{
          border-radius: 10px;
          padding: 10px 8px;
          border: 1px solid rgba(99,102,241,0.18);
          background: #f5f3ff;
          color: #1e1b4b;
          font-weight: 700;
          cursor: pointer;
          transition: transform .05s ease, background .15s ease, border-color .15s ease;
          user-select: none;
        }
        .sc-btn:hover{ background: #ede9fe; border-color: rgba(99,102,241,0.35); }
        .sc-btn:active{ transform: translateY(1px); }
        .sc-soft{ background: #f5f3ff; color: #1e1b4b; }
        .sc-num{ background: rgba(99,102,241,0.10); color: #312e81; border-color: rgba(99,102,241,0.20); }
        .sc-op{ background: rgba(16,185,129,0.10); color: #065f46; border-color: rgba(16,185,129,0.25); }
        .sc-ac{ background: rgba(239,68,68,0.09); color: #991b1b; border-color: rgba(239,68,68,0.25); }
        .sc-eq{ background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; border-color: transparent; box-shadow: 0 3px 10px rgba(99,102,241,0.3); }
        .sc-eq:hover{ filter: brightness(1.08); }
        .sc-toggle[data-active="true"]{
          background: rgba(16,185,129,0.15);
          border-color: rgba(16,185,129,0.40);
          color: #065f46;
        }
        @media (max-width: 520px){
          .sc-btn{ padding: 10px 6px; font-weight: 700; }
        }
      `}</style>
    </div>
  );
}