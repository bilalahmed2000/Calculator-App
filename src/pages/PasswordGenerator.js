import React, { useMemo, useState } from "react";
import "../css/CalcBase.css";

export default function PasswordGenerator() {
  const [length, setLength] = useState(10);

  const [lower, setLower] = useState(true);
  const [upper, setUpper] = useState(true);
  const [numbers, setNumbers] = useState(true);
  const [symbols, setSymbols] = useState(true);

  const [excludeAmbiguous, setExcludeAmbiguous] = useState(true);
  const [excludeBrackets, setExcludeBrackets] = useState(true);
  const [noRepeat, setNoRepeat] = useState(false);

  const ambiguousChars = "il1Lo0O";
  const bracketChars = "()[]{}<>";

  const charPool = useMemo(() => {
    let chars = "";

    if (lower) chars += "abcdefghijklmnopqrstuvwxyz";
    if (upper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (numbers) chars += "0123456789";
    if (symbols) chars += "!@#$%^&*+=_~`|:;'\"?/.,-";

    if (excludeAmbiguous)
      chars = chars
        .split("")
        .filter((c) => !ambiguousChars.includes(c))
        .join("");

    if (excludeBrackets)
      chars = chars
        .split("")
        .filter((c) => !bracketChars.includes(c))
        .join("");

    return chars;
  }, [lower, upper, numbers, symbols, excludeAmbiguous, excludeBrackets]);

  const generatePassword = () => {
    if (!charPool) return "";

    let result = "";
    let used = new Set();

    while (result.length < length) {
      const char = charPool[Math.floor(Math.random() * charPool.length)];
      if (noRepeat && used.has(char)) continue;
      used.add(char);
      result += char;
    }
    return result;
  };

  const [password, setPassword] = useState(generatePassword);

  const entropy = useMemo(() => {
    if (!charPool) return 0;
    return (Math.log2(charPool.length) * length).toFixed(1);
  }, [charPool, length]);

  const strength = useMemo(() => {
    if (entropy < 40) return "Weak";
    if (entropy < 60) return "Moderate";
    return "Strong";
  }, [entropy]);

  return (
    <div className="calc-wrap">
      <header className="calc-hero">
        <h1>Random Password Generator</h1>
        <p className="muted">
          Generate secure, strong random passwords completely on your device.
        </p>
      </header>

      <div className="calc-grid">
        {/* LEFT PANEL */}
        <section className="card">
          <h2 className="card-title">Password</h2>

          <input value={password} readOnly />

          <div className="small" style={{ marginTop: 8 }}>
            <b>Password Strength:</b>{" "}
            <span style={{ color: strength === "Strong" ? "green" : "orange" }}>
              {strength}
            </span>
            <br />
            <b>Password Entropy:</b> {entropy} bits
          </div>

          <div className="row two" style={{ marginTop: 10 }}>
            <button
              className="btn"
              onClick={() => navigator.clipboard.writeText(password)}
            >
              Copy Password
            </button>
            <button className="btn" onClick={() => setPassword(generatePassword())}>
              Regenerate
            </button>
          </div>
        </section>

        {/* SETTINGS */}
        <section className="card">
          <h2 className="card-title">Settings</h2>

          <div className="field">
            <label>Password Length</label>
            <input
              type="number"
              min="4"
              max="64"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
            />
            <input
              type="range"
              min="4"
              max="64"
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
            />
          </div>

          <div className="field">
            <label><input type="checkbox" checked={lower} onChange={() => setLower(!lower)} /> Include Lower Case (a-z)</label>
          </div>
          <div className="field">
            <label><input type="checkbox" checked={upper} onChange={() => setUpper(!upper)} /> Include Upper Case (A-Z)</label>
          </div>
          <div className="field">
            <label><input type="checkbox" checked={numbers} onChange={() => setNumbers(!numbers)} /> Include Numbers (0-9)</label>
          </div>
          <div className="field">
            <label><input type="checkbox" checked={symbols} onChange={() => setSymbols(!symbols)} /> Include Symbols</label>
          </div>

          <div className="field">
            <label><input type="checkbox" checked={excludeAmbiguous} onChange={() => setExcludeAmbiguous(!excludeAmbiguous)} /> Exclude Ambiguous Characters</label>
          </div>

          <div className="field">
            <label><input type="checkbox" checked={excludeBrackets} onChange={() => setExcludeBrackets(!excludeBrackets)} /> Exclude Brackets</label>
          </div>

          <div className="field">
            <label><input type="checkbox" checked={noRepeat} onChange={() => setNoRepeat(!noRepeat)} /> No Repeated Characters</label>
          </div>

          <button
            className="btn"
            style={{ marginTop: 12 }}
            onClick={() => setPassword(generatePassword())}
          >
            Generate
          </button>
        </section>
      </div>
    </div>
  );
}
