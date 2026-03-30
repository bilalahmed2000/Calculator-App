import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/CalcBase.css";
import "../css/SharedCalcLayout.css";

/* =====================================================================
   IPv4 HELPERS
   ===================================================================== */

function parseIPv4(ip) {
  const parts = ip.trim().split(".");
  if (parts.length !== 4) return null;
  const nums = parts.map((p) => parseInt(p, 10));
  if (nums.some((n) => isNaN(n) || n < 0 || n > 255)) return null;
  return nums;
}

function ipToNum(octets) {
  return (
    octets[0] * 16777216 +
    octets[1] * 65536 +
    octets[2] * 256 +
    octets[3]
  );
}

function numToIp(n) {
  return [
    Math.floor(n / 16777216) % 256,
    Math.floor(n / 65536) % 256,
    Math.floor(n / 256) % 256,
    n % 256,
  ].join(".");
}

function getMaskNum(prefix) {
  if (prefix === 0) return 0;
  if (prefix === 32) return 4294967295;
  return Math.pow(2, 32) - Math.pow(2, 32 - prefix);
}

/* Convert a 32-bit number to dotted binary: e.g. "11111111.11111111.11111111.11111100" */
function numToBinary32(n) {
  const hex = Math.round(n).toString(16).padStart(8, "0");
  const bits = hex
    .split("")
    .map((h) => parseInt(h, 16).toString(2).padStart(4, "0"))
    .join("");
  return `${bits.slice(0, 8)}.${bits.slice(8, 16)}.${bits.slice(16, 24)}.${bits.slice(24, 32)}`;
}

function getIPClass(o1) {
  if (o1 >= 1 && o1 <= 126) return "A";
  if (o1 === 127) return "Loopback";
  if (o1 >= 128 && o1 <= 191) return "B";
  if (o1 >= 192 && o1 <= 223) return "C";
  if (o1 >= 224 && o1 <= 239) return "D (Multicast)";
  return "E (Reserved)";
}

function getIPType(octets) {
  const [o1, o2] = octets;
  if (o1 === 10) return "Private";
  if (o1 === 172 && o2 >= 16 && o2 <= 31) return "Private";
  if (o1 === 192 && o2 === 168) return "Private";
  if (o1 === 127) return "Loopback";
  if (o1 === 169 && o2 === 254) return "Link-local";
  return "Public";
}

/* Build subnet dropdown: /1 to /32 in "255.x.x.x /N" format */
function buildSubnetOptions() {
  const opts = [];
  for (let p = 1; p <= 32; p++) {
    const maskNum = getMaskNum(p);
    opts.push({ prefix: p, label: `${numToIp(maskNum)} /${p}` });
  }
  return opts;
}

const SUBNET_OPTIONS = buildSubnetOptions();

/* =====================================================================
   IPv6 HELPERS  (no BigInt — uses Uint8Array + decimal string math)
   ===================================================================== */

function parseIPv6(ip) {
  const trimmed = ip.trim().toLowerCase();
  let parts;
  if (trimmed.includes("::")) {
    const halves = trimmed.split("::");
    const left = halves[0] ? halves[0].split(":") : [];
    const right = halves[1] ? halves[1].split(":") : [];
    const missing = 8 - left.length - right.length;
    if (missing < 0) return null;
    parts = [...left, ...Array(missing).fill("0"), ...right];
  } else {
    parts = trimmed.split(":");
  }
  if (parts.length !== 8) return null;
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 8; i++) {
    const val = parseInt(parts[i], 16);
    if (isNaN(val) || val < 0 || val > 65535) return null;
    bytes[i * 2] = (val >> 8) & 0xff;
    bytes[i * 2 + 1] = val & 0xff;
  }
  return bytes;
}

function bytesToHexGroups(bytes) {
  const groups = [];
  for (let i = 0; i < 16; i += 2) {
    groups.push(
      (((bytes[i] & 0xff) << 8) | (bytes[i + 1] & 0xff))
        .toString(16)
        .padStart(4, "0")
    );
  }
  return groups;
}

function compressIPv6(bytes) {
  const groups = bytesToHexGroups(bytes);
  /* find longest run of all-zero groups */
  let bestStart = -1,
    bestLen = 0,
    curStart = -1,
    curLen = 0;
  for (let i = 0; i < 8; i++) {
    if (groups[i] === "0000") {
      if (curStart === -1) {
        curStart = i;
        curLen = 1;
      } else {
        curLen++;
      }
      if (curLen > bestLen) {
        bestLen = curLen;
        bestStart = curStart;
      }
    } else {
      curStart = -1;
      curLen = 0;
    }
  }
  const cleaned = groups.map((g) => g.replace(/^0+/, "") || "0");
  if (bestLen >= 2) {
    const left = cleaned.slice(0, bestStart).join(":");
    const right = cleaned.slice(bestStart + bestLen).join(":");
    if (!left && !right) return "::";
    if (!left) return "::" + right;
    if (!right) return left + "::";
    return left + "::" + right;
  }
  return cleaned.join(":");
}

function applyIPv6Mask(bytes, prefix) {
  const result = new Uint8Array(bytes);
  for (let i = prefix; i < 128; i++) {
    const byteIdx = Math.floor(i / 8);
    const bitMask = 0x80 >> i % 8;
    result[byteIdx] = result[byteIdx] & ~bitMask & 0xff;
  }
  return result;
}

function getIPv6BroadcastBytes(networkBytes, prefix) {
  const result = new Uint8Array(networkBytes);
  for (let i = prefix; i < 128; i++) {
    const byteIdx = Math.floor(i / 8);
    const bitMask = 0x80 >> i % 8;
    result[byteIdx] = (result[byteIdx] | bitMask) & 0xff;
  }
  return result;
}

/* 2^exp as a comma-formatted decimal string (no BigInt) */
function pow2Str(exp) {
  if (exp === 0) return "1";
  const digits = [1]; /* least-significant digit first */
  for (let i = 0; i < exp; i++) {
    let carry = 0;
    for (let j = 0; j < digits.length; j++) {
      const prod = digits[j] * 2 + carry;
      digits[j] = prod % 10;
      carry = Math.floor(prod / 10);
    }
    if (carry) digits.push(carry);
  }
  const s = digits.reverse().join("");
  return s.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/* IPv6 prefix options /1-/128 */
const IPV6_PREFIX_OPTS = Array.from({ length: 128 }, (_, i) => i + 1);

/* =====================================================================
   SIDEBAR
   ===================================================================== */
const SIDEBAR_LINKS = [
  { label: "IP Subnet Calculator",     to: "/ip-subnet-calculator" },
  { label: "GPA Calculator",           to: "/gpa-calculator" },
  { label: "Age Calculator",           to: "/age" },
  { label: "Time Calculator",          to: "/time" },
  { label: "Hours Calculator",         to: "/hours-calculator" },
  { label: "Percentage Calculator",    to: "/percentage-calculator" },
  { label: "BMI Calculator",           to: "/bmi" },
  { label: "Loan Calculator",          to: "/loan" },
  { label: "Mortgage Calculator",      to: "/mortgage" },
  { label: "Random Number Generator",  to: "/random-number-generator" },
];

/* =====================================================================
   COMPONENT
   ===================================================================== */
const DEFAULT_IP4 = "111.88.17.130";
const DEFAULT_PREFIX4 = 30;
const DEFAULT_IP6 = "2001:db8:85a3::8a2e:370:7334";
const DEFAULT_PREFIX6 = 64;

export default function IPSubnetCalculator() {
  /* IPv4 */
  const [ip4, setIp4]             = useState(DEFAULT_IP4);
  const [prefix4, setPrefix4]     = useState(DEFAULT_PREFIX4);
  const [netClass, setNetClass]   = useState("Any");
  const [result4, setResult4]     = useState(null);
  const [error4, setError4]       = useState("");

  /* IPv6 */
  const [ip6, setIp6]             = useState(DEFAULT_IP6);
  const [prefix6, setPrefix6]     = useState(DEFAULT_PREFIX6);
  const [result6, setResult6]     = useState(null);
  const [error6, setError6]       = useState("");

  /* Sidebar search */
  const [search, setSearch]       = useState("");

  /* ------------------------------------------------------------------ */
  /* IPv4 Calculate                                                       */
  /* ------------------------------------------------------------------ */
  function calcIPv4() {
    const octets = parseIPv4(ip4);
    if (!octets) {
      setError4("Invalid IPv4 address. Use format: 192.168.1.0");
      setResult4(null);
      return;
    }
    const [o1] = octets;
    if (netClass === "A" && (o1 < 1 || o1 > 126)) {
      setError4("Class A: first octet must be 1–126.");
      setResult4(null); return;
    }
    if (netClass === "B" && (o1 < 128 || o1 > 191)) {
      setError4("Class B: first octet must be 128–191.");
      setResult4(null); return;
    }
    if (netClass === "C" && (o1 < 192 || o1 > 223)) {
      setError4("Class C: first octet must be 192–223.");
      setResult4(null); return;
    }

    const p        = prefix4;
    const ipNum    = ipToNum(octets);
    const maskNum  = getMaskNum(p);
    const wildNum  = 4294967295 - maskNum;
    const blockSz  = Math.pow(2, 32 - p);
    const netNum   = ipNum - (ipNum % blockSz);
    const bcastNum = netNum + blockSz - 1;
    const firstH   = p >= 31 ? netNum   : netNum   + 1;
    const lastH    = p >= 31 ? bcastNum : bcastNum - 1;
    const total    = blockSz;
    const usable   = p >= 31 ? 0 : blockSz - 2;

    const upper16  = Math.floor(ipNum / 65536);
    const lower16  = ipNum % 65536;

    setError4("");
    setResult4({
      p, octets, ipNum, netNum,
      ipAddress:    ip4,
      networkAddr:  numToIp(netNum),
      firstHost:    numToIp(firstH),
      lastHost:     numToIp(lastH),
      broadcastAddr:numToIp(bcastNum),
      totalHosts:   total.toLocaleString(),
      usableHosts:  usable.toLocaleString(),
      subnetMask:   numToIp(maskNum),
      wildcardMask: numToIp(wildNum),
      binaryMask:   numToBinary32(maskNum),
      ipClass:      getIPClass(o1),
      cidr:         `/${p}`,
      ipType:       getIPType(octets),
      short:        `${ip4} /${p}`,
      binaryId:     numToBinary32(ipNum),
      integerId:    String(ipNum),
      hexId:        "0x" + Math.round(ipNum).toString(16).toUpperCase().padStart(8, "0"),
      inAddrArpa:   `${octets[3]}.${octets[2]}.${octets[1]}.${octets[0]}.in-addr.arpa`,
      ipv4Mapped:   `::ffff:${upper16.toString(16).padStart(4, "0")}.${lower16.toString(16).padStart(4, "0")}`,
      sixToFour:    `2002:${upper16.toString(16).padStart(4, "0")}:${lower16.toString(16).padStart(4, "0")}::/48`,
    });
  }

  function clearIPv4() {
    setIp4(DEFAULT_IP4);
    setPrefix4(DEFAULT_PREFIX4);
    setNetClass("Any");
    setResult4(null);
    setError4("");
  }

  /* ------------------------------------------------------------------ */
  /* Networks table                                                        */
  /* ------------------------------------------------------------------ */
  function buildNetworksTable(r) {
    const { p, octets } = r;
    const blockSz = Math.pow(2, 32 - p);
    let baseNum, count, parentLabel;

    if (p >= 24) {
      baseNum     = octets[0] * 16777216 + octets[1] * 65536 + octets[2] * 256;
      count       = Math.pow(2, p - 24);
      parentLabel = `${octets[0]}.${octets[1]}.${octets[2]}.*`;
    } else if (p >= 16) {
      baseNum     = octets[0] * 16777216 + octets[1] * 65536;
      count       = Math.pow(2, p - 16);
      parentLabel = `${octets[0]}.${octets[1]}.*.*`;
    } else {
      return {
        title: `/${p} networks are too large to enumerate (covers more than a /16).`,
        rows:  null,
      };
    }

    if (count > 1024) {
      return {
        title: `Too many networks to display (${count.toLocaleString()} /${p} networks in that block).`,
        rows:  null,
      };
    }

    const rows = [];
    for (let i = 0; i < count; i++) {
      const ns   = baseNum + i * blockSz;
      const ne   = ns + blockSz - 1;
      const fh   = p >= 31 ? ns : ns + 1;
      const lh   = p >= 31 ? ne : ne - 1;
      rows.push({
        network:   numToIp(ns),
        hostRange: `${numToIp(fh)} - ${numToIp(lh)}`,
        broadcast: numToIp(ne),
      });
    }

    return {
      title: `All ${count} of the Possible /${p} Networks for ${parentLabel}`,
      rows,
    };
  }

  /* ------------------------------------------------------------------ */
  /* IPv6 Calculate                                                        */
  /* ------------------------------------------------------------------ */
  function calcIPv6() {
    const bytes = parseIPv6(ip6);
    if (!bytes) {
      setError6("Invalid IPv6 address. Try: 2001:db8::1");
      setResult6(null);
      return;
    }
    const p          = prefix6;
    const netBytes   = applyIPv6Mask(bytes, p);
    const endBytes   = getIPv6BroadcastBytes(netBytes, p);
    const fullIp     = bytesToHexGroups(bytes).join(":");
    const totalAddrs = pow2Str(128 - p);

    setError6("");
    setResult6({
      ipAddress: `${ip6} /${p}`,
      fullIp,
      total:     totalAddrs,
      network:   `${compressIPv6(netBytes)} /${p}`,
      rangeStart:compressIPv6(netBytes),
      rangeEnd:  compressIPv6(endBytes),
    });
  }

  function clearIPv6() {
    setIp6(DEFAULT_IP6);
    setPrefix6(DEFAULT_PREFIX6);
    setResult6(null);
    setError6("");
  }

  /* ------------------------------------------------------------------ */
  /* Filtered sidebar                                                      */
  /* ------------------------------------------------------------------ */
  const filteredLinks = SIDEBAR_LINKS.filter((l) =>
    l.label.toLowerCase().includes(search.toLowerCase())
  );

  /* ------------------------------------------------------------------ */
  /* Shared inline styles                                                  */
  /* ------------------------------------------------------------------ */
  const grayBox = {
    background: "#f5f5f5",
    border: "1px solid #ddd",
    borderRadius: 8,
    padding: "16px",
  };

  const blueBar = {
    background: "#dbeafe",
    border: "1px solid #93c5fd",
    borderRadius: 6,
    padding: "9px 14px",
    marginBottom: 14,
    color: "#1d4ed8",
    fontSize: 13.5,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    gap: 8,
  };

  const labelSt = {
    display: "block",
    fontSize: 11.5,
    fontWeight: 700,
    color: "#6b7a9e",
    marginBottom: 6,
    letterSpacing: "0.4px",
    textTransform: "uppercase",
  };

  const inputSt = {
    width: "100%",
    boxSizing: "border-box",
    background: "#fff",
    color: "#1e1b4b",
    border: "1px solid #ccc",
    borderRadius: 6,
    padding: "8px 10px",
    fontSize: 14,
    outline: "none",
    fontFamily: "inherit",
  };

  const thSt = {
    padding: "8px 12px",
    background: "#f0f0f0",
    color: "#555",
    fontWeight: 700,
    fontSize: 12,
    border: "1px solid #ccc",
    textAlign: "left",
    whiteSpace: "nowrap",
  };

  const tdLabel = {
    padding: "7px 12px",
    border: "1px solid #e5e7eb",
    fontSize: 13.5,
    fontWeight: 600,
    color: "#555",
    background: "#fafafa",
    width: "42%",
    whiteSpace: "nowrap",
    verticalAlign: "top",
  };

  const tdValue = {
    padding: "7px 12px",
    border: "1px solid #e5e7eb",
    fontSize: 13.5,
    fontFamily: "monospace",
    color: "#1e1b4b",
    wordBreak: "break-all",
    verticalAlign: "top",
  };

  /* Networks table */
  const netTable = result4 ? buildNetworksTable(result4) : null;

  /* ------------------------------------------------------------------ */
  /* Render                                                               */
  /* ------------------------------------------------------------------ */
  return (
    <div className="calc-wrap">

      {/* Breadcrumb */}
      <div style={{ maxWidth: 1100, margin: "0 auto 14px", fontSize: 12.5, color: "#888" }}>
        <Link to="/" style={{ color: "#6366f1", textDecoration: "none" }}>home</Link>
        <span style={{ margin: "0 5px" }}>/</span>
        <span>other</span>
        <span style={{ margin: "0 5px" }}>/</span>
        <span style={{ color: "#444" }}>ip subnet calculator</span>
      </div>

      {/* Title */}
      <div style={{ maxWidth: 1100, margin: "0 auto 22px" }}>
        <h1 style={{
          fontSize: "clamp(22px, 3.5vw, 30px)",
          fontWeight: 800,
          margin: "0 0 8px",
          background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>
          IP Subnet Calculator
        </h1>
        <p className="muted" style={{ maxWidth: 720 }}>
          The IP Subnet Calculator performs subnet calculations for the given network
          address block, subnet mask, and maximum required hosts per subnet. It determines
          the network address, usable host range, broadcast address, subnet mask, wildcard
          mask, binary subnet mask, IP class, CIDR notation, IP type, and more. Both IPv4
          and IPv6 are supported.
        </p>
      </div>

      <div className="rng-layout">
        <div className="rng-main">

          {/* ============================================================
              IPv4 RESULT  (shown above the input when calculated)
              ============================================================ */}
          {result4 && (
            <section className="card" style={{ marginBottom: 18 }}>
              <div className="result-header">
                <span>Result</span>
              </div>

              {/* Primary info table */}
              <div className="table-scroll" style={{ marginBottom: 14 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {[
                      ["IP Address",            result4.ipAddress],
                      ["Network Address",        result4.networkAddr],
                      ["Usable Host IP Range",   `${result4.firstHost} - ${result4.lastHost}`],
                      ["Broadcast Address",      result4.broadcastAddr],
                      ["Total Number of Hosts",  result4.totalHosts],
                      ["Number of Usable Hosts", result4.usableHosts],
                      ["Subnet Mask",            result4.subnetMask],
                      ["Wildcard Mask",          result4.wildcardMask],
                      ["Binary Subnet Mask",     result4.binaryMask],
                      ["IP Class",               result4.ipClass],
                      ["CIDR Notation",          result4.cidr],
                      ["IP Type",                result4.ipType],
                    ].map(([label, value]) => (
                      <tr key={label}>
                        <td style={tdLabel}>{label}:</td>
                        <td style={tdValue}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Secondary info table */}
              <div className="table-scroll" style={{ marginBottom: 18 }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {[
                      ["Short",                result4.short],
                      ["Binary ID",            result4.binaryId],
                      ["Integer ID",           result4.integerId],
                      ["Hex ID",               result4.hexId],
                      ["in-addr.arpa",         result4.inAddrArpa],
                      ["IPv4 Mapped Address",  result4.ipv4Mapped],
                      ["6to4 Prefix",          result4.sixToFour],
                    ].map(([label, value]) => (
                      <tr key={label}>
                        <td style={tdLabel}>{label}:</td>
                        <td style={tdValue}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Networks table */}
              {netTable && (
                <>
                  <h3 style={{ fontSize: 14, fontWeight: 700, color: "#312e81", margin: "0 0 10px" }}>
                    {netTable.title}
                  </h3>
                  {netTable.rows ? (
                    <div className="table-scroll">
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                          <tr>
                            <th style={thSt}>Network Address</th>
                            <th style={thSt}>Usable Host Range</th>
                            <th style={thSt}>Broadcast Address</th>
                          </tr>
                        </thead>
                        <tbody>
                          {netTable.rows.map((row, i) => (
                            <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                              <td style={{ ...tdValue, border: "1px solid #e5e7eb" }}>{row.network}</td>
                              <td style={{ ...tdValue, border: "1px solid #e5e7eb" }}>{row.hostRange}</td>
                              <td style={{ ...tdValue, border: "1px solid #e5e7eb" }}>{row.broadcast}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p style={{ color: "#888", fontSize: 13 }}>{netTable.title}</p>
                  )}
                </>
              )}
            </section>
          )}

          {/* ============================================================
              IPv4 INPUT
              ============================================================ */}
          <section className="card" style={{ marginBottom: 18 }}>
            <h2 className="card-title">IPv4 Subnet Calculator</h2>
            <p className="rng-desc">
              Enter an IPv4 address and select a subnet mask (CIDR prefix) to calculate
              network address, broadcast address, usable host range, and more.
            </p>

            <div style={blueBar}>
              <span style={{ fontSize: 16 }}>&#9660;</span>
              Modify the values and click the{" "}
              <strong style={{ marginLeft: 3 }}>Calculate</strong> button to use
            </div>

            <div style={grayBox}>
              {/* Network class radio */}
              <div style={{ marginBottom: 14 }}>
                <label style={labelSt}>Network Class</label>
                <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginTop: 4 }}>
                  {["Any", "A", "B", "C"].map((cls) => (
                    <label
                      key={cls}
                      style={{
                        display: "flex", alignItems: "center", gap: 6,
                        cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: "#4b5280",
                      }}
                    >
                      <input
                        type="radio"
                        name="netClass"
                        value={cls}
                        checked={netClass === cls}
                        onChange={() => setNetClass(cls)}
                        style={{ accentColor: "#6366f1", width: 15, height: 15, cursor: "pointer" }}
                      />
                      {cls}
                    </label>
                  ))}
                </div>
              </div>

              {/* Subnet + IP */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelSt}>Subnet</label>
                  <select
                    value={prefix4}
                    onChange={(e) => setPrefix4(Number(e.target.value))}
                    style={{ ...inputSt, cursor: "pointer" }}
                  >
                    {SUBNET_OPTIONS.map((opt) => (
                      <option key={opt.prefix} value={opt.prefix}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelSt}>IP Address</label>
                  <input
                    type="text"
                    value={ip4}
                    onChange={(e) => setIp4(e.target.value)}
                    placeholder="e.g. 192.168.1.0"
                    style={inputSt}
                  />
                </div>
              </div>

              {/* Buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button type="button" className="btn-primary" onClick={calcIPv4}>
                  Calculate
                </button>
                <button type="button" className="btn-secondary" onClick={clearIPv4}>
                  Clear
                </button>
              </div>
            </div>

            {error4 && (
              <div className="rng-error" style={{ marginTop: 12 }}>{error4}</div>
            )}
          </section>

          {/* ============================================================
              IPv6 RESULT
              ============================================================ */}
          {result6 && (
            <section className="card" style={{ marginBottom: 18 }}>
              <div className="result-header">
                <span>Result</span>
              </div>
              <div className="table-scroll">
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <tbody>
                    {[
                      ["IP Address",         result6.ipAddress],
                      ["Full IP Address",    result6.fullIp],
                      ["Total IP Addresses", result6.total],
                      ["Network",            result6.network],
                      ["IP Range",           `${result6.rangeStart} - ${result6.rangeEnd}`],
                    ].map(([label, value]) => (
                      <tr key={label}>
                        <td style={tdLabel}>{label}:</td>
                        <td style={tdValue}>{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* ============================================================
              IPv6 INPUT
              ============================================================ */}
          <section className="card">
            <h2 className="card-title">IPv6 Subnet Calculator</h2>
            <p className="rng-desc">
              Enter an IPv6 address and select a prefix length to calculate the network
              range, total number of IP addresses, and full expanded address.
            </p>

            <div style={blueBar}>
              <span style={{ fontSize: 16 }}>&#9660;</span>
              Modify the values and click the{" "}
              <strong style={{ marginLeft: 3 }}>Calculate</strong> button to use
            </div>

            <div style={grayBox}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
                <div>
                  <label style={labelSt}>Prefix Length</label>
                  <select
                    value={prefix6}
                    onChange={(e) => setPrefix6(Number(e.target.value))}
                    style={{ ...inputSt, cursor: "pointer" }}
                  >
                    {IPV6_PREFIX_OPTS.map((p) => (
                      <option key={p} value={p}>/{p}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelSt}>IP Address</label>
                  <input
                    type="text"
                    value={ip6}
                    onChange={(e) => setIp6(e.target.value)}
                    placeholder="e.g. 2001:db8::1"
                    style={inputSt}
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <button type="button" className="btn-primary" onClick={calcIPv6}>
                  Calculate
                </button>
                <button type="button" className="btn-secondary" onClick={clearIPv6}>
                  Clear
                </button>
              </div>
            </div>

            {error6 && (
              <div className="rng-error" style={{ marginTop: 12 }}>{error6}</div>
            )}
          </section>

        </div>

        {/* ============================================================
            SIDEBAR
            ============================================================ */}
        <aside className="rng-sidebar">
          {/* Search */}
          <div className="card rng-sidebar-card" style={{ marginBottom: 16 }}>
            <h3 className="rng-sidebar-title">Search</h3>
            <input
              type="text"
              placeholder="Search calculators..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                border: "1.5px solid rgba(99,102,241,0.2)",
                borderRadius: 8,
                padding: "8px 10px",
                fontSize: 13,
                color: "#1e1b4b",
                background: "#f8f9ff",
                outline: "none",
              }}
            />
          </div>

          {/* Other Calculators */}
          <div className="card rng-sidebar-card">
            <h3 className="rng-sidebar-title">Other Calculators</h3>
            <ul className="rng-sidebar-list">
              {filteredLinks.map((lnk) => (
                <li key={lnk.to}>
                  <Link
                    to={lnk.to}
                    className={
                      lnk.to === "/ip-subnet-calculator"
                        ? "rng-sidebar-link rng-sidebar-link--active"
                        : "rng-sidebar-link"
                    }
                  >
                    {lnk.label}
                  </Link>
                </li>
              ))}
              {filteredLinks.length === 0 && (
                <li style={{ fontSize: 12, color: "#aaa", padding: "8px 10px" }}>
                  No results
                </li>
              )}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
