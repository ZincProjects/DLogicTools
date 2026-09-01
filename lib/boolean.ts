// ---------------------------------------------------------------------------
// A tiny Boolean-expression engine: tokenise -> parse -> evaluate.
// Supports:  A B C ...      variables (single letters, case-insensitive)
//            ' or !X or ~X  NOT          (postfix apostrophe OR prefix ! ~)
//            . * & or AB    AND          (juxtaposition = AND)
//            + | or "or"    OR
//            ^ or xor       XOR
//            0 / 1          constants
// ---------------------------------------------------------------------------

export type Node =
  | { t: "var"; name: string }
  | { t: "const"; v: 0 | 1 }
  | { t: "not"; a: Node }
  | { t: "and"; a: Node; b: Node }
  | { t: "or"; a: Node; b: Node }
  | { t: "xor"; a: Node; b: Node }
  | { t: "xnor"; a: Node; b: Node };

type Tok =
  | { k: "var"; v: string }
  | { k: "const"; v: 0 | 1 }
  | { k: "op"; v: "+" | "*" | "^" | "~" | "'" }
  | { k: "("; }
  | { k: ")"; };

const WORDS: Record<string, Tok> = {
  AND: { k: "op", v: "*" },
  OR: { k: "op", v: "+" },
  NOT: { k: "op", v: "~" },
  XOR: { k: "op", v: "^" },
};

export function tokenize(src: string): Tok[] {
  const out: Tok[] = [];
  let i = 0;
  const s = src.replace(/\u2019/g, "'").replace(/\u00b7/g, ".").replace(/\u2295/g, "^");
  while (i < s.length) {
    const c = s[i];
    if (/\s/.test(c)) { i++; continue; }
    if (/[A-Za-z]/.test(c)) {
      // greedily match a keyword, else a single-letter variable
      let word = "";
      let j = i;
      while (j < s.length && /[A-Za-z]/.test(s[j])) { word += s[j]; j++; }
      const up = word.toUpperCase();
      if (WORDS[up]) { out.push(WORDS[up]); i = j; continue; }
      out.push({ k: "var", v: c.toUpperCase() });
      i++;
      continue;
    }
    if (c === "0" || c === "1") { out.push({ k: "const", v: c === "1" ? 1 : 0 }); i++; continue; }
    if (c === "(") { out.push({ k: "(" }); i++; continue; }
    if (c === ")") { out.push({ k: ")" }); i++; continue; }
    if (c === "'") { out.push({ k: "op", v: "'" }); i++; continue; }
    if (c === "!" || c === "~") { out.push({ k: "op", v: "~" }); i++; continue; }
    if (c === "+" || c === "|") { out.push({ k: "op", v: "+" }); i++; continue; }
    if (c === "*" || c === "." || c === "&") { out.push({ k: "op", v: "*" }); i++; continue; }
    if (c === "^") { out.push({ k: "op", v: "^" }); i++; continue; }
    throw new Error(`I don't understand the character "${c}"`);
  }
  return out;
}

export function parse(src: string): Node {
  const toks = tokenize(src);
  let p = 0;
  const peek = () => toks[p];
  const eat = () => toks[p++];

  // primary := var | const | ( expr ) | ~primary   ... then trailing '
  function primary(): Node {
    const t = peek();
    if (!t) throw new Error("The expression ended too early — something is missing.");
    let node: Node;
    if (t.k === "op" && t.v === "~") { eat(); node = { t: "not", a: primary() }; }
    else if (t.k === "var") { eat(); node = { t: "var", name: (t as any).v }; }
    else if (t.k === "const") { eat(); node = { t: "const", v: (t as any).v }; }
    else if (t.k === "(") {
      eat();
      node = orExpr();
      const close = eat();
      if (!close || close.k !== ")") throw new Error("Missing a closing bracket ')'");
    } else throw new Error("Unexpected symbol — check your brackets and operators.");
    // postfix NOT: A'  (A+B)'  can repeat
    while (peek() && peek().k === "op" && (peek() as any).v === "'") { eat(); node = { t: "not", a: node }; }
    return node;
  }

  const startsPrimary = () => {
    const t = peek();
    if (!t) return false;
    return t.k === "var" || t.k === "const" || t.k === "(" || (t.k === "op" && t.v === "~");
  };

  function andExpr(): Node {
    let node = primary();
    for (;;) {
      const t = peek();
      if (t && t.k === "op" && t.v === "*") { eat(); node = { t: "and", a: node, b: primary() }; }
      else if (startsPrimary()) { node = { t: "and", a: node, b: primary() }; } // juxtaposition
      else break;
    }
    return node;
  }

  function xorExpr(): Node {
    let node = andExpr();
    while (peek() && peek().k === "op" && (peek() as any).v === "^") { eat(); node = { t: "xor", a: node, b: andExpr() }; }
    return node;
  }

  function orExpr(): Node {
    let node = xorExpr();
    while (peek() && peek().k === "op" && (peek() as any).v === "+") { eat(); node = { t: "or", a: node, b: xorExpr() }; }
    return node;
  }

  const root = orExpr();
  if (p < toks.length) throw new Error("There is leftover text I couldn't attach — check your brackets.");
  return root;
}

export function varsOf(n: Node, acc = new Set<string>()): string[] {
  switch (n.t) {
    case "var": acc.add(n.name); break;
    case "const": break;
    case "not": varsOf(n.a, acc); break;
    default: varsOf(n.a, acc); varsOf(n.b, acc);
  }
  return [...acc].sort();
}

export function evaluate(n: Node, env: Record<string, 0 | 1>): 0 | 1 {
  switch (n.t) {
    case "var": return env[n.name] ?? 0;
    case "const": return n.v;
    case "not": return evaluate(n.a, env) ? 0 : 1;
    case "and": return evaluate(n.a, env) && evaluate(n.b, env) ? 1 : 0;
    case "or": return evaluate(n.a, env) || evaluate(n.b, env) ? 1 : 0;
    case "xor": return evaluate(n.a, env) !== evaluate(n.b, env) ? 1 : 0;
    case "xnor": return evaluate(n.a, env) === evaluate(n.b, env) ? 1 : 0;
  }
}

/** Full truth table. Row i has variable j's value = bit (n-1-j) of i. */
export function truthTable(node: Node, vars: string[]) {
  const rows: { bits: (0 | 1)[]; out: 0 | 1 }[] = [];
  const total = 1 << vars.length;
  for (let i = 0; i < total; i++) {
    const bits: (0 | 1)[] = [];
    const env: Record<string, 0 | 1> = {};
    for (let j = 0; j < vars.length; j++) {
      const b = ((i >> (vars.length - 1 - j)) & 1) as 0 | 1;
      bits.push(b);
      env[vars[j]] = b;
    }
    rows.push({ bits, out: evaluate(node, env) });
  }
  return rows;
}

export function toStringExpr(n: Node): string {
  const prec = (x: Node) => (x.t === "or" ? 1 : x.t === "xor" ? 2 : x.t === "and" ? 3 : 4);
  const wrap = (child: Node, self: Node) => (prec(child) < prec(self) ? `(${toStringExpr(child)})` : toStringExpr(child));
  switch (n.t) {
    case "var": return n.name;
    case "const": return String(n.v);
    case "not": {
      const inner = toStringExpr(n.a);
      return n.a.t === "var" || n.a.t === "const" ? `${inner}'` : `(${inner})'`;
    }
    case "and": return `${wrap(n.a, n)}${wrap(n.b, n)}`;
    case "or": return `${wrap(n.a, n)} + ${wrap(n.b, n)}`;
    case "xor": return `${wrap(n.a, n)} ⊕ ${wrap(n.b, n)}`;
    case "xnor": return `(${toStringExpr(n.a)} ⊙ ${toStringExpr(n.b)})`;
  }
}
