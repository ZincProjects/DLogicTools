// Number-system helpers shared by the converter, arithmetic and code tools.

export const DIGITS = "0123456789ABCDEF";

export function parseInBase(text: string, base: number): { value: number; frac: string } | null {
  const s = text.trim().toUpperCase().replace(/\s+/g, "");
  if (!s) return null;
  const [ip, fp = ""] = s.split(".");
  if (s.split(".").length > 2) return null;
  const valid = DIGITS.slice(0, base);
  if (!ip && !fp) return null;
  for (const c of ip + fp) if (!valid.includes(c)) return null;
  let value = 0;
  for (const c of ip) value = value * base + valid.indexOf(c);
  let f = 0;
  for (let i = 0; i < fp.length; i++) f += valid.indexOf(fp[i]) / Math.pow(base, i + 1);
  return { value: value + f, frac: fp };
}

export function toBase(value: number, base: number, fracDigits = 12): string {
  if (!isFinite(value)) return "—";
  const neg = value < 0;
  value = Math.abs(value);
  let ip = Math.floor(value);
  let fp = value - ip;
  let out = ip === 0 ? "0" : "";
  while (ip > 0) { out = DIGITS[ip % base] + out; ip = Math.floor(ip / base); }
  if (fp > 1e-12) {
    out += ".";
    let guard = 0;
    while (fp > 1e-12 && guard < fracDigits) {
      fp *= base;
      const d = Math.floor(fp);
      out += DIGITS[d];
      fp -= d;
      guard++;
    }
  }
  return (neg ? "-" : "") + out;
}

/** The repeated-division working students are asked to show in exams. */
export function divisionSteps(value: number, base: number) {
  const steps: { n: number; q: number; r: string }[] = [];
  let n = Math.floor(Math.abs(value));
  if (n === 0) steps.push({ n: 0, q: 0, r: "0" });
  while (n > 0) {
    const q = Math.floor(n / base);
    steps.push({ n, q, r: DIGITS[n % base] });
    n = q;
  }
  return steps;
}

export function multiplicationSteps(frac: number, base: number, max = 10) {
  const steps: { f: number; prod: number; digit: string }[] = [];
  let f = frac;
  let i = 0;
  while (f > 1e-12 && i < max) {
    const prod = f * base;
    const digit = Math.floor(prod);
    steps.push({ f, prod, digit: DIGITS[digit] });
    f = prod - digit;
    i++;
  }
  return steps;
}

// --- signed representations -------------------------------------------------

export function toBinaryWidth(value: number, width: number): string {
  const mask = value & ((1 << width) - 1);
  return (mask >>> 0).toString(2).padStart(width, "0").slice(-width);
}

export function twosComplement(value: number, width: number): string {
  const max = (1 << (width - 1)) - 1;
  const min = -(1 << (width - 1));
  if (value > max || value < min) return "";
  return toBinaryWidth(value < 0 ? (1 << width) + value : value, width);
}

export function fromTwosComplement(bits: string): number {
  const w = bits.length;
  const v = parseInt(bits, 2);
  return bits[0] === "1" ? v - (1 << w) : v;
}

export function signMagnitude(value: number, width: number): string {
  const mag = Math.abs(value);
  if (mag > (1 << (width - 1)) - 1) return "";
  return (value < 0 ? "1" : "0") + mag.toString(2).padStart(width - 1, "0");
}

export function onesComplement(value: number, width: number): string {
  if (value >= 0) return toBinaryWidth(value, width);
  const pos = toBinaryWidth(-value, width);
  return [...pos].map((b) => (b === "0" ? "1" : "0")).join("");
}

// --- codes ------------------------------------------------------------------

export function toBCD(n: number): string[] {
  return String(Math.floor(Math.abs(n))).split("").map((d) => Number(d).toString(2).padStart(4, "0"));
}

export function toGray(bits: string): string {
  let out = bits[0];
  for (let i = 1; i < bits.length; i++) out += String(Number(bits[i - 1]) ^ Number(bits[i]));
  return out;
}

export function fromGray(gray: string): string {
  let out = gray[0];
  for (let i = 1; i < gray.length; i++) out += String(Number(out[i - 1]) ^ Number(gray[i]));
  return out;
}

export function parityBit(bits: string, kind: "even" | "odd"): "0" | "1" {
  const count = [...bits].filter((b) => b === "1").length;
  const isEven = count % 2 === 0;
  if (kind === "even") return isEven ? "0" : "1";
  return isEven ? "1" : "0";
}

// --- IEEE-754 ---------------------------------------------------------------

export function floatBits(value: number, double: boolean) {
  const buf = new ArrayBuffer(8);
  const dv = new DataView(buf);
  if (double) {
    dv.setFloat64(0, value);
    let s = "";
    for (let i = 0; i < 8; i++) s += dv.getUint8(i).toString(2).padStart(8, "0");
    return { bits: s, sign: s.slice(0, 1), exp: s.slice(1, 12), mant: s.slice(12), bias: 1023, actual: dv.getFloat64(0) };
  }
  dv.setFloat32(0, value);
  let s = "";
  for (let i = 0; i < 4; i++) s += dv.getUint8(i).toString(2).padStart(8, "0");
  return { bits: s, sign: s.slice(0, 1), exp: s.slice(1, 9), mant: s.slice(9), bias: 127, actual: dv.getFloat32(0) };
}
