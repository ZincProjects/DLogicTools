"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { Panel, Field, Seg, Label, Result, Callout, Table, Chip, Bit, NumberStepper, Steps } from "@/components/UI";
import { GateSymbol } from "@/components/Gates";

/* ========================================================================== */
/* Voltage levels                                                             */
/* ========================================================================== */

const FAMILIES = {
  "TTL (5 V)": { vcc: 5, voh: 2.4, vih: 2.0, vil: 0.8, vol: 0.4, ioh: -0.4, iol: 16, iih: 0.04, iil: -1.6 },
  "CMOS 4000 (5 V)": { vcc: 5, voh: 4.95, vih: 3.5, vil: 1.5, vol: 0.05, ioh: -0.51, iol: 0.51, iih: 0.001, iil: -0.001 },
  "LVCMOS (3.3 V)": { vcc: 3.3, voh: 2.4, vih: 2.0, vil: 0.8, vol: 0.4, ioh: -8, iol: 8, iih: 0.01, iil: -0.01 },
  "LVCMOS (1.8 V)": { vcc: 1.8, voh: 1.35, vih: 1.17, vil: 0.63, vol: 0.45, ioh: -4, iol: 4, iih: 0.01, iil: -0.01 },
};
type FamKey = keyof typeof FAMILIES;

export function VoltageLevels() {
  const [fam, setFam] = useState<FamKey>("TTL (5 V)");
  const [v, setV] = useState(3.2);
  const f = FAMILIES[fam];
  const region = v >= f.vih ? "high" : v <= f.vil ? "low" : "undefined";

  return (
    <div className="space-y-5">
      <Callout kind="key" title="The single idea">
        A digital circuit does not really work with 0s and 1s. It works with <em>voltages</em>, and it
        <strong> rounds them off</strong>. Anything above V<sub>IH</sub> counts as 1; anything below V<sub>IL</sub>{" "}
        counts as 0. That rounding is why digital signals survive noise that would destroy an analog signal.
      </Callout>

      <Panel>
        <div className="flex flex-wrap gap-6 items-end">
          <div>
            <Label>Logic family</Label>
            <Seg options={(Object.keys(FAMILIES) as FamKey[]).map((k) => ({ v: k, label: k }))} value={fam} onChange={(k) => { setFam(k); setV(FAMILIES[k].vcc * 0.6); }} size="sm" />
          </div>
          <div className="flex-1 min-w-[240px]">
            <Label>Input voltage on the pin</Label>
            <input type="range" min={0} max={f.vcc} step={0.01} value={Math.min(v, f.vcc)} onChange={(e) => setV(+e.target.value)} className="w-full accent-[var(--color-accent)]" />
            <div className="font-mono text-lg mt-1">{v.toFixed(2)} V</div>
          </div>
          <div>
            <Chip tone={region === "high" ? "good" : region === "low" ? "accent" : "bad"}>
              {region === "high" ? "read as LOGIC 1" : region === "low" ? "read as LOGIC 0" : "UNDEFINED — forbidden zone"}
            </Chip>
          </div>
        </div>
      </Panel>

      <Panel>
        <h3 className="font-bold mb-4">The voltage bands</h3>
        <div className="grid sm:grid-cols-2 gap-8">
          <VoltageBar f={f} v={v} which="input" />
          <VoltageBar f={f} v={v} which="output" />
        </div>
      </Panel>

      <Panel>
        <h3 className="font-bold mb-3">What each symbol means</h3>
        <Table
          head={["Symbol", "Full name", "Meaning in one sentence", `${fam}`]}
          rows={[
            ["V_OH", "Output HIGH voltage (min)", "The lowest voltage a driving gate promises to produce for a logic 1.", `${f.voh} V`],
            ["V_IH", "Input HIGH voltage (min)", "The lowest voltage a receiving gate promises to interpret as a logic 1.", `${f.vih} V`],
            ["V_IL", "Input LOW voltage (max)", "The highest voltage a receiving gate promises to interpret as a logic 0.", `${f.vil} V`],
            ["V_OL", "Output LOW voltage (max)", "The highest voltage a driving gate promises to produce for a logic 0.", `${f.vol} V`],
          ]}
        />
        <Callout kind="tip" title="How to keep the four straight">
          <strong>O</strong> = output, <strong>I</strong> = input. The outputs are always more extreme than the inputs
          need — V<sub>OH</sub> &gt; V<sub>IH</sub> and V<sub>OL</sub> &lt; V<sub>IL</sub>. That deliberate gap is the
          noise margin, and it is the entire reason digital logic is reliable.
        </Callout>
      </Panel>

      <Panel>
        <h3 className="font-bold mb-3">Why we threw away the analog world</h3>
        <div className="grid sm:grid-cols-2 gap-5 text-sm text-[var(--color-ink-dim)]">
          <div>
            <div className="font-semibold text-[var(--color-ink)] mb-1.5">Analog</div>
            Every voltage means something, so <em>every</em> bit of noise, every degree of temperature drift and
            every ageing component changes the value. Copy it ten times and it is mush.
          </div>
          <div>
            <div className="font-semibold text-[var(--color-ink)] mb-1.5">Digital</div>
            Only two ranges mean anything. Noise up to the margin is simply erased at every gate,
            because the gate re-drives a clean V<sub>OH</sub> or V<sub>OL</sub>. Copy it a billion times, still perfect.
          </div>
        </div>
        <p className="text-sm text-[var(--color-ink-dim)] mt-4">
          The price: you need many bits to represent something a single analog voltage could carry.
          An ADC with n bits splits its input range into 2ⁿ steps, so its <strong>resolution</strong> is
          (V<sub>max</sub> − V<sub>min</sub>)/2ⁿ. That is the trade you accept for noise immunity.
        </p>
      </Panel>
    </div>
  );
}

function VoltageBar({ f, v, which }: { f: typeof FAMILIES[FamKey]; v: number; which: "input" | "output" }) {
  const H = 260;
  const y = (volt: number) => H - (volt / f.vcc) * H;
  const bands = which === "input"
    ? [
        { from: f.vih, to: f.vcc, label: "logic 1", color: "#4ade80" },
        { from: f.vil, to: f.vih, label: "UNDEFINED", color: "#f87171" },
        { from: 0, to: f.vil, label: "logic 0", color: "#60a5fa" },
      ]
    : [
        { from: f.voh, to: f.vcc, label: "logic 1 out", color: "#4ade80" },
        { from: f.vol, to: f.voh, label: "never produced", color: "#334155" },
        { from: 0, to: f.vol, label: "logic 0 out", color: "#60a5fa" },
      ];

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-faint)] mb-3">
        {which === "input" ? "What an INPUT accepts" : "What an OUTPUT produces"}
      </div>
      <div className="relative" style={{ height: H }}>
        {bands.map((b) => (
          <div key={b.label} className="absolute left-14 right-0 rounded border flex items-center px-3"
            style={{ top: y(b.to), height: y(b.from) - y(b.to), background: b.color + "1a", borderColor: b.color + "66" }}>
            <span className="text-[11px] font-semibold" style={{ color: b.color }}>{b.label}</span>
          </div>
        ))}
        {[f.vcc, which === "input" ? f.vih : f.voh, which === "input" ? f.vil : f.vol, 0].map((volt, i) => (
          <div key={i} className="absolute left-0 w-14 text-right pr-2 text-[10px] font-mono text-[var(--color-ink-faint)]" style={{ top: y(volt) - 6 }}>
            {volt.toFixed(2)}V
          </div>
        ))}
        {which === "input" && (
          <div className="absolute left-10 right-0 flex items-center" style={{ top: y(Math.min(v, f.vcc)) - 1 }}>
            <div className="h-0.5 flex-1 bg-[var(--color-warn)]" />
            <span className="text-[10px] font-mono text-[var(--color-warn)] bg-[var(--color-bg)] px-1">{v.toFixed(2)}V</span>
          </div>
        )}
      </div>
    </div>
  );
}

/* ========================================================================== */
/* Serial vs parallel                                                         */
/* ========================================================================== */

export function SerialParallel() {
  const [byte, setByte] = useState<(0 | 1)[]>([1, 0, 1, 1, 0, 0, 1, 0]);
  const [t, setT] = useState(0);
  const [run, setRun] = useState(true);

  useEffect(() => {
    if (!run) return;
    const id = setInterval(() => setT((x) => (x + 1) % 12), 420);
    return () => clearInterval(id);
  }, [run]);

  return (
    <div className="space-y-5">
      <Callout kind="key">
        Same 8 bits, two ways to move them. <strong>Parallel</strong> = 8 wires, all bits at once, 1 clock tick.
        <strong> Serial</strong> = 1 wire, one bit per tick, 8 ticks. Neither is &ldquo;better&rdquo; — it is a trade
        between wires and time.
      </Callout>

      <Panel>
        <div className="flex flex-wrap gap-6 items-end">
          <div>
            <Label>The byte to send (click bits)</Label>
            <div className="flex gap-1">
              {byte.map((b, i) => <Bit key={i} v={b} onClick={() => setByte(byte.map((x, j) => (i === j ? ((x ^ 1) as 0 | 1) : x)))} />)}
            </div>
          </div>
          <button onClick={() => setRun(!run)} className="px-4 py-2.5 text-sm rounded-lg border border-[var(--color-line)] hover:border-[var(--color-accent)]">
            {run ? "⏸ pause" : "▶ play"}
          </button>
          <div className="font-mono text-sm text-[var(--color-ink-faint)] pb-2">clock tick {t}</div>
        </div>
      </Panel>

      <div className="grid md:grid-cols-2 gap-4">
        <Panel>
          <h3 className="font-bold mb-1">Parallel transfer</h3>
          <p className="text-[13px] text-[var(--color-ink-dim)] mb-4">All 8 bits travel simultaneously on 8 separate wires.</p>
          <svg viewBox="0 0 320 200" className="w-full">
            <rect x="6" y="20" width="60" height="160" rx="6" fill="#151c28" stroke="#38455c" strokeWidth="1.5" />
            <text x="36" y="105" textAnchor="middle" fill="#98a3b8" fontSize="10" fontFamily="monospace">SENDER</text>
            <rect x="254" y="20" width="60" height="160" rx="6" fill="#151c28" stroke="#38455c" strokeWidth="1.5" />
            <text x="284" y="105" textAnchor="middle" fill="#98a3b8" fontSize="10" fontFamily="monospace">RECEIVER</text>
            {byte.map((b, i) => {
              const y = 32 + i * 19;
              const arrived = t >= 1;
              return (
                <g key={i}>
                  <line x1="66" y1={y} x2="254" y2={y} stroke={b ? "#4ade80" : "#3a465e"} strokeWidth="2" />
                  <text x="72" y={y - 4} fill="#667085" fontSize="8" fontFamily="monospace">D{7 - i}</text>
                  {arrived && <circle cx={160} cy={y} r="4" fill={b ? "#4ade80" : "#4a5568"} />}
                </g>
              );
            })}
          </svg>
          <div className="mt-3 space-y-1.5 text-[13px] text-[var(--color-ink-dim)]">
            <div>✓ Fast — one clock period for the whole byte.</div>
            <div>✗ 8 wires (plus ground). Expensive in connectors and PCB area.</div>
            <div>✗ At high speed the wires <strong>skew</strong>: bits arrive at slightly different times and the word is corrupted. This is why parallel buses stopped scaling.</div>
          </div>
        </Panel>

        <Panel>
          <h3 className="font-bold mb-1">Serial transfer</h3>
          <p className="text-[13px] text-[var(--color-ink-dim)] mb-4">One wire. LSB first, one bit per clock tick.</p>
          <svg viewBox="0 0 320 200" className="w-full">
            <rect x="6" y="60" width="60" height="80" rx="6" fill="#151c28" stroke="#38455c" strokeWidth="1.5" />
            <text x="36" y="104" textAnchor="middle" fill="#98a3b8" fontSize="10" fontFamily="monospace">SENDER</text>
            <rect x="254" y="60" width="60" height="80" rx="6" fill="#151c28" stroke="#38455c" strokeWidth="1.5" />
            <text x="284" y="104" textAnchor="middle" fill="#98a3b8" fontSize="10" fontFamily="monospace">RX</text>
            <line x1="66" y1="100" x2="254" y2="100" stroke="#3a465e" strokeWidth="2" />
            {t < 8 && (
              <>
                <circle cx={66 + (188 * ((t % 8) + 0.5)) / 8} cy="100" r="7"
                  fill={byte[7 - (t % 8)] ? "#4ade80" : "#4a5568"} stroke="#0b0e14" strokeWidth="2" />
                <text x={66 + (188 * ((t % 8) + 0.5)) / 8} y="104" textAnchor="middle" fill="#0b0e14" fontSize="9" fontWeight="700" fontFamily="monospace">
                  {byte[7 - (t % 8)]}
                </text>
              </>
            )}
            {/* shift register contents at receiver */}
            <g>
              {byte.map((b, i) => {
                const got = 7 - i < t;
                return (
                  <rect key={i} x={120 + i * 14} y="150" width="12" height="16" rx="2"
                    fill={got ? (b ? "#10301f" : "#0d1219") : "#0d1219"} stroke={got ? (b ? "#4ade80" : "#3a465e") : "#232b3a"} strokeWidth="1.5" />
                );
              })}
              <text x="176" y="182" textAnchor="middle" fill="#667085" fontSize="9" fontFamily="monospace">receiver shift register</text>
            </g>
          </svg>
          <div className="mt-3 space-y-1.5 text-[13px] text-[var(--color-ink-dim)]">
            <div>✓ One wire. Cheap cables, small connectors, easy isolation.</div>
            <div>✓ No skew — with only one line there is nothing to skew against, so the clock rate can go far higher. USB, SATA and PCIe are all serial for exactly this reason.</div>
            <div>✗ Needs 8 clock ticks, plus shift registers at both ends, plus a way to agree where a byte starts.</div>
          </div>
        </Panel>
      </div>

      <Panel>
        <h3 className="font-bold mb-3">Which one wins?</h3>
        <p className="text-sm text-[var(--color-ink-dim)]">
          Parallel wins <em>inside</em> a chip, where wires are almost free and distances are microns —
          that is why a CPU’s internal buses are 64 bits wide. Serial wins <em>between</em> chips, boards and boxes,
          where each wire costs money and skew becomes fatal above a few hundred MHz. A modern system is parallel
          on-chip, serial off-chip, with serialiser/deserialiser (SerDes) blocks at the boundary.
        </p>
      </Panel>
    </div>
  );
}

/* ========================================================================== */
/* Timing / propagation delay lab                                             */
/* ========================================================================== */

export function TimingLab() {
  const [tr, setTr] = useState(6);
  const [tf, setTf] = useState(4);
  const [tphl, setTphl] = useState(9);
  const [tplh, setTplh] = useState(13);

  const W = 640, H = 210, T = 60;
  const inX = (t: number) => 40 + (t / T) * (W - 60);

  // Input: rises at t=8, falls at t=34.  Output (an inverter) mirrors it, delayed.
  const inputPath = () => {
    const y0 = 62, y1 = 22;
    return `M ${inX(0)} ${y0} L ${inX(8)} ${y0} L ${inX(8 + tr / 2)} ${y1} L ${inX(34)} ${y1} L ${inX(34 + tf / 2)} ${y0} L ${inX(T)} ${y0}`;
  };
  const outPath = () => {
    const y0 = 172, y1 = 132;
    // inverter: input rising ⇒ output falling after tPHL
    return `M ${inX(0)} ${y1} L ${inX(8 + tphl)} ${y1} L ${inX(8 + tphl + tf / 2)} ${y0} L ${inX(34 + tplh)} ${y0} L ${inX(34 + tplh + tr / 2)} ${y1} L ${inX(T)} ${y1}`;
  };
  const tpd = (tphl + tplh) / 2;

  return (
    <div className="space-y-5">
      <Callout kind="key" title="Real signals are not vertical">
        Every wire has capacitance. Charging it takes time, so edges are sloped, not instant.
        We measure the slope between the <strong>10% and 90%</strong> points, and we measure delay between the
        <strong> 50%</strong> points. Those percentages are conventions — but they are the conventions the exam uses.
      </Callout>

      <Panel>
        <h3 className="font-bold mb-4">An inverter, with realistic edges</h3>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
          {/* reference lines */}
          {[["90%", 26], ["50%", 42], ["10%", 58]].map(([l, y]) => (
            <g key={l as string}>
              <line x1="40" y1={y as number} x2={W - 20} y2={y as number} stroke="#232b3a" strokeWidth="1" strokeDasharray="3 4" />
              <text x="4" y={(y as number) + 4} fill="#667085" fontSize="9" fontFamily="monospace">{l}</text>
            </g>
          ))}
          {[["90%", 136], ["50%", 152], ["10%", 168]].map(([l, y]) => (
            <g key={"o" + l}>
              <line x1="40" y1={y as number} x2={W - 20} y2={y as number} stroke="#232b3a" strokeWidth="1" strokeDasharray="3 4" />
              <text x="4" y={(y as number) + 4} fill="#667085" fontSize="9" fontFamily="monospace">{l}</text>
            </g>
          ))}

          <text x="4" y="16" fill="#98a3b8" fontSize="11" fontFamily="monospace">IN</text>
          <text x="4" y="126" fill="#60a5fa" fontSize="11" fontFamily="monospace">OUT</text>

          <path d={inputPath()} fill="none" stroke="#4ade80" strokeWidth="2.5" />
          <path d={outPath()} fill="none" stroke="#60a5fa" strokeWidth="2.5" />

          {/* rise time marker */}
          <line x1={inX(8 + tr * 0.1)} y1="58" x2={inX(8 + tr * 0.45)} y2="26" stroke="#fbbf24" strokeWidth="0" />
          <g>
            <line x1={inX(8)} y1="72" x2={inX(8 + tr / 2)} y2="72" stroke="#fbbf24" strokeWidth="1.5" />
            <line x1={inX(8)} y1="68" x2={inX(8)} y2="76" stroke="#fbbf24" strokeWidth="1.5" />
            <line x1={inX(8 + tr / 2)} y1="68" x2={inX(8 + tr / 2)} y2="76" stroke="#fbbf24" strokeWidth="1.5" />
            <text x={inX(8) + 4} y="88" fill="#fbbf24" fontSize="10" fontFamily="monospace">t_r = {tr} ns</text>
          </g>
          <g>
            <line x1={inX(34)} y1="72" x2={inX(34 + tf / 2)} y2="72" stroke="#fbbf24" strokeWidth="1.5" />
            <line x1={inX(34)} y1="68" x2={inX(34)} y2="76" stroke="#fbbf24" strokeWidth="1.5" />
            <line x1={inX(34 + tf / 2)} y1="68" x2={inX(34 + tf / 2)} y2="76" stroke="#fbbf24" strokeWidth="1.5" />
            <text x={inX(34) + 4} y="88" fill="#fbbf24" fontSize="10" fontFamily="monospace">t_f = {tf} ns</text>
          </g>

          {/* propagation delay markers (50% to 50%) */}
          <line x1={inX(8 + tr / 4)} y1="42" x2={inX(8 + tr / 4)} y2="152" stroke="#a78bfa" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={inX(8 + tphl + tf / 4)} y1="42" x2={inX(8 + tphl + tf / 4)} y2="152" stroke="#a78bfa" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={inX(8 + tr / 4)} y1="196" x2={inX(8 + tphl + tf / 4)} y2="196" stroke="#a78bfa" strokeWidth="1.5" />
          <text x={inX(8) + 4} y="192" fill="#a78bfa" fontSize="10" fontFamily="monospace">t_PHL = {tphl} ns</text>

          <line x1={inX(34 + tf / 4)} y1="42" x2={inX(34 + tf / 4)} y2="152" stroke="#a78bfa" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={inX(34 + tplh + tr / 4)} y1="42" x2={inX(34 + tplh + tr / 4)} y2="152" stroke="#a78bfa" strokeWidth="1" strokeDasharray="3 3" />
          <line x1={inX(34 + tf / 4)} y1="196" x2={inX(34 + tplh + tr / 4)} y2="196" stroke="#a78bfa" strokeWidth="1.5" />
          <text x={inX(34) + 4} y="192" fill="#a78bfa" fontSize="10" fontFamily="monospace">t_PLH = {tplh} ns</text>
        </svg>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
          {([["Rise time t_r", tr, setTr], ["Fall time t_f", tf, setTf], ["t_PHL (out H→L)", tphl, setTphl], ["t_PLH (out L→H)", tplh, setTplh]] as const).map(([l, v, set]) => (
            <div key={l}>
              <Label>{l}</Label>
              <input type="range" min={1} max={20} value={v} onChange={(e) => (set as any)(+e.target.value)} className="w-full accent-[var(--color-accent)]" />
              <div className="font-mono text-sm mt-1">{v} ns</div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid md:grid-cols-2 gap-4">
        <Panel>
          <h3 className="font-bold mb-3">The definitions, exactly</h3>
          <Table
            head={["Quantity", "Measured between", "What it depends on"]}
            rows={[
              ["Rise time t_r", "10% → 90% of a rising edge", "Load capacitance and how much current the output can source"],
              ["Fall time t_f", "90% → 10% of a falling edge", "Load capacitance and sink current"],
              ["t_PHL", "50% of input → 50% of output, output going HIGH to LOW", "Internal gate structure + load"],
              ["t_PLH", "50% of input → 50% of output, output going LOW to HIGH", "Usually slower than t_PHL in CMOS (PMOS is weaker)"],
              ["t_pd", "average of t_PHL and t_PLH", "The single number on a datasheet"],
            ]}
          />
        </Panel>
        <Panel>
          <h3 className="font-bold mb-3">Numbers from this waveform</h3>
          <div className="space-y-3">
            <Result label="Average propagation delay t_pd" value={`${tpd.toFixed(1)} ns`} sub={`(${tphl} + ${tplh}) / 2`} tone="accent" />
            <Result label="Max clock through 4 such gates" value={`${(1000 / (4 * tpd)).toFixed(1)} MHz`} sub={`4 × ${tpd.toFixed(1)} ns = ${(4 * tpd).toFixed(1)} ns per path`} />
            <Result label="Edge rate (rise)" value={`${(0.8 / tr * 1000).toFixed(0)} mV/ns`} sub="for a 1 V swing, 10%→90%" />
          </div>
          <Callout kind="warn">
            Delay is <strong>not</strong> the same thing as rise time. A gate can have razor-sharp edges and still be
            slow to react, or be quick to react but drive a big capacitive load sluggishly. Datasheets list both,
            and exam questions like to mix them up.
          </Callout>
        </Panel>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* CMOS transistor lab                                                        */
/* ========================================================================== */

const CMOS_CIRCUITS = {
  Inverter: { inputs: ["A"], f: (i: (0 | 1)[]) => (i[0] ? 0 : 1) as 0 | 1, pun: "1 PMOS to VDD", pdn: "1 NMOS to GND", expr: "Y = A′", nT: 2 },
  NAND2: { inputs: ["A", "B"], f: (i: (0 | 1)[]) => (i[0] && i[1] ? 0 : 1) as 0 | 1, pun: "2 PMOS in PARALLEL", pdn: "2 NMOS in SERIES", expr: "Y = (A·B)′", nT: 4 },
  NOR2: { inputs: ["A", "B"], f: (i: (0 | 1)[]) => (i[0] || i[1] ? 0 : 1) as 0 | 1, pun: "2 PMOS in SERIES", pdn: "2 NMOS in PARALLEL", expr: "Y = (A+B)′", nT: 4 },
  "AND-OR-Invert": { inputs: ["A", "B", "C"], f: (i: (0 | 1)[]) => ((i[0] && i[1]) || i[2] ? 0 : 1) as 0 | 1, pun: "(A,B series) in series with C — dual of the PDN", pdn: "A,B in SERIES, that pair in PARALLEL with C", expr: "Y = (A·B + C)′", nT: 6 },
};
type CKey = keyof typeof CMOS_CIRCUITS;

export function CmosLab() {
  const [ck, setCk] = useState<CKey>("NAND2");
  const c = CMOS_CIRCUITS[ck];
  const [ins, setIns] = useState<(0 | 1)[]>([0, 0, 0]);
  const I = ins.slice(0, c.inputs.length) as (0 | 1)[];
  while (I.length < c.inputs.length) I.push(0);
  const out = c.f(I);

  return (
    <div className="space-y-5">
      <Callout kind="key" title="A MOSFET is a voltage-controlled switch">
        <p><strong>NMOS</strong> conducts when its gate is <strong>HIGH</strong>. It is good at pulling a node down to 0 V.</p>
        <p><strong>PMOS</strong> conducts when its gate is <strong>LOW</strong> (marked with a bubble). It is good at pulling a node up to V<sub>DD</sub>.</p>
        <p className="mt-2">Every CMOS gate is one <em>pull-up network</em> of PMOS to V<sub>DD</sub> and one <em>pull-down network</em> of NMOS to ground. Exactly one of them conducts at a time — which is why CMOS burns almost no power when it is sitting still.</p>
      </Callout>

      <Panel>
        <div className="flex flex-wrap gap-6 items-end">
          <div>
            <Label>Circuit</Label>
            <Seg options={(Object.keys(CMOS_CIRCUITS) as CKey[]).map((k) => ({ v: k, label: k }))} value={ck} onChange={setCk} size="sm" />
          </div>
          <div>
            <Label>Inputs</Label>
            <div className="flex gap-2">
              {c.inputs.map((name, i) => (
                <div key={name} className="text-center">
                  <div className="text-[10px] font-mono text-[var(--color-ink-faint)] mb-1">{name}</div>
                  <Bit v={I[i]} size="lg" onClick={() => setIns(ins.map((x, j) => (i === j ? ((x ^ 1) as 0 | 1) : x)))} />
                </div>
              ))}
            </div>
          </div>
          <div className="pb-1">
            <div className="text-[10px] font-mono text-[var(--color-ink-faint)] mb-1">OUT</div>
            <Bit v={out} size="lg" tone="accent" />
          </div>
        </div>
      </Panel>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-4">
        <Panel>
          <h3 className="font-bold mb-4">Transistor-level view</h3>
          <CmosSchematic ck={ck} ins={I} out={out} />
        </Panel>

        <div className="space-y-4">
          <Panel>
            <h3 className="font-bold mb-3">How to analyse any CMOS gate in 4 steps</h3>
            <Steps items={[
              { title: "Look only at the pull-down (NMOS) network", body: "Series NMOS = AND. Parallel NMOS = OR. Write that expression — call it F." },
              { title: "The output is F inverted", body: <>The PDN pulls the output to 0 when F is true, so <code>Y = F′</code>. CMOS is <strong>always</strong> naturally inverting — you can never build a plain AND with a single CMOS stage.</> },
              { title: "Check the pull-up is the dual", body: "Wherever the NMOS are in series, the PMOS must be in parallel, and vice versa. If it isn't the dual, the circuit is broken." },
              { title: "Sanity-check one input case", body: "Set all inputs to 1 and confirm exactly one network conducts." },
            ]} />
          </Panel>
          <Panel>
            <div className="grid sm:grid-cols-2 gap-3">
              <Result label="Function" value={c.expr} tone="accent" />
              <Result label="Transistor count" value={c.nT} sub="2 per input for a simple gate" />
            </div>
            <div className="mt-4 text-sm space-y-2 text-[var(--color-ink-dim)]">
              <div><strong className="text-[var(--color-ink)]">Pull-down (NMOS):</strong> {c.pdn}</div>
              <div><strong className="text-[var(--color-ink)]">Pull-up (PMOS):</strong> {c.pun}</div>
            </div>
          </Panel>
        </div>
      </div>

      <Panel>
        <h3 className="font-bold mb-3">TTL vs CMOS — the comparison you will be asked for</h3>
        <Table
          head={["", "TTL (bipolar)", "CMOS"]}
          rows={[
            ["Built from", "Bipolar junction transistors (BJTs)", "MOSFETs (NMOS + PMOS pairs)"],
            ["Static power", "High — current flows continuously through the internal resistors", "Almost zero — one network is always off, so no path from VDD to GND"],
            ["Dynamic power", "Relatively less significant", "Dominant — P = C·V²·f, so it grows with clock speed"],
            ["Input current", "Significant (mA range) — inputs actually draw current", "Effectively zero (µA or less) — a gate is a capacitor"],
            ["Fan-out", "Limited (~10) by input current", "Very high in DC terms, limited in practice by capacitance and hence speed"],
            ["Noise margin", "Smaller (≈0.4 V for 5 V TTL)", "Larger (≈1.45 V for 5 V CMOS) — thresholds sit near VDD/2"],
            ["Speed", "Historically faster", "Now faster, and far denser"],
            ["Supply", "5 V, fairly strict", "Wide range: 1.2 V to 15 V depending on the family"],
            ["Static sensitivity", "Robust", "Fragile — the thin gate oxide can be punched through by static"],
          ]}
        />
      </Panel>
    </div>
  );
}

function CmosSchematic({ ck, ins, out }: { ck: CKey; ins: (0 | 1)[]; out: 0 | 1 }) {
  // NMOS conducts on 1, PMOS on 0.
  const nOn = (i: number) => ins[i] === 1;
  const pOn = (i: number) => ins[i] === 0;
  const ON = "#4ade80", OFF = "#3a465e";
  const Tr = ({ x, y, on, label, p }: { x: number; y: number; on: boolean; label: string; p?: boolean }) => (
    <g>
      <line x1={x - 22} y1={y} x2={x - 8} y2={y} stroke="#8fa2bd" strokeWidth="1.8" />
      {p && <circle cx={x - 4} cy={y} r="3.5" fill="#0d1219" stroke="#8fa2bd" strokeWidth="1.5" />}
      <line x1={x - 1} y1={y - 12} x2={x - 1} y2={y + 12} stroke="#8fa2bd" strokeWidth="2" />
      <line x1={x + 4} y1={y - 12} x2={x + 4} y2={y + 12} stroke={on ? ON : OFF} strokeWidth="3" />
      <line x1={x + 4} y1={y - 12} x2={x + 20} y2={y - 12} stroke={on ? ON : OFF} strokeWidth="1.8" />
      <line x1={x + 4} y1={y + 12} x2={x + 20} y2={y + 12} stroke={on ? ON : OFF} strokeWidth="1.8" />
      <text x={x - 38} y={y + 4} fill="#98a3b8" fontSize="10" fontFamily="monospace">{label}</text>
      <text x={x + 24} y={y + 4} fill={on ? ON : "#4a5568"} fontSize="8" fontFamily="monospace">{on ? "ON" : "off"}</text>
    </g>
  );

  const rail = (y: number, label: string, color: string) => (
    <g>
      <line x1="60" y1={y} x2="240" y2={y} stroke={color} strokeWidth="2" />
      <text x="246" y={y + 4} fill={color} fontSize="10" fontFamily="monospace">{label}</text>
    </g>
  );

  if (ck === "Inverter") {
    return (
      <svg viewBox="0 0 300 230" className="w-full max-w-[320px]">
        {rail(16, "VDD", "#f87171")}
        <line x1="150" y1="16" x2="150" y2="42" stroke={pOn(0) ? ON : OFF} strokeWidth="2" />
        <Tr x={150} y={56} on={pOn(0)} label="A" p />
        <line x1="150" y1="70" x2="150" y2="110" stroke={pOn(0) ? ON : OFF} strokeWidth="2" />
        <line x1="150" y1="110" x2="150" y2="150" stroke={nOn(0) ? ON : OFF} strokeWidth="2" />
        <Tr x={150} y={164} on={nOn(0)} label="A" />
        <line x1="150" y1="178" x2="150" y2="204" stroke={nOn(0) ? ON : OFF} strokeWidth="2" />
        {rail(204, "GND", "#60a5fa")}
        <line x1="150" y1="110" x2="250" y2="110" stroke={out ? ON : OFF} strokeWidth="2" />
        <text x="256" y="106" fill={out ? ON : "#8fa2bd"} fontSize="11" fontFamily="monospace">Y={out}</text>
      </svg>
    );
  }

  if (ck === "NAND2") {
    return (
      <svg viewBox="0 0 320 250" className="w-full max-w-[340px]">
        {rail(16, "VDD", "#f87171")}
        {/* PMOS in parallel */}
        <line x1="110" y1="16" x2="110" y2="42" stroke={pOn(0) ? ON : OFF} strokeWidth="2" />
        <line x1="190" y1="16" x2="190" y2="42" stroke={pOn(1) ? ON : OFF} strokeWidth="2" />
        <Tr x={110} y={56} on={pOn(0)} label="A" p />
        <Tr x={190} y={56} on={pOn(1)} label="B" p />
        <line x1="110" y1="70" x2="110" y2="96" stroke={pOn(0) ? ON : OFF} strokeWidth="2" />
        <line x1="190" y1="70" x2="190" y2="96" stroke={pOn(1) ? ON : OFF} strokeWidth="2" />
        <line x1="110" y1="96" x2="190" y2="96" stroke={pOn(0) || pOn(1) ? ON : OFF} strokeWidth="2" />
        <line x1="150" y1="96" x2="150" y2="130" stroke={out ? ON : OFF} strokeWidth="2" />
        {/* NMOS in series */}
        <line x1="150" y1="130" x2="150" y2="150" stroke={nOn(0) && nOn(1) ? ON : OFF} strokeWidth="2" />
        <Tr x={150} y={164} on={nOn(0)} label="A" />
        <line x1="150" y1="178" x2="150" y2="196" stroke={nOn(0) && nOn(1) ? ON : OFF} strokeWidth="2" />
        <Tr x={150} y={210} on={nOn(1)} label="B" />
        <line x1="150" y1="224" x2="150" y2="236" stroke={nOn(0) && nOn(1) ? ON : OFF} strokeWidth="2" />
        {rail(236, "GND", "#60a5fa")}
        <line x1="150" y1="130" x2="262" y2="130" stroke={out ? ON : OFF} strokeWidth="2" />
        <text x="266" y="126" fill={out ? ON : "#8fa2bd"} fontSize="11" fontFamily="monospace">Y={out}</text>
        <text x="16" y="112" fill="#667085" fontSize="9" fontFamily="monospace">PMOS ∥</text>
        <text x="16" y="192" fill="#667085" fontSize="9" fontFamily="monospace">NMOS series</text>
      </svg>
    );
  }

  if (ck === "NOR2") {
    return (
      <svg viewBox="0 0 320 250" className="w-full max-w-[340px]">
        {rail(16, "VDD", "#f87171")}
        <line x1="150" y1="16" x2="150" y2="30" stroke={pOn(0) && pOn(1) ? ON : OFF} strokeWidth="2" />
        <Tr x={150} y={44} on={pOn(0)} label="A" p />
        <line x1="150" y1="58" x2="150" y2="76" stroke={pOn(0) && pOn(1) ? ON : OFF} strokeWidth="2" />
        <Tr x={150} y={90} on={pOn(1)} label="B" p />
        <line x1="150" y1="104" x2="150" y2="134" stroke={pOn(0) && pOn(1) ? ON : OFF} strokeWidth="2" />
        {/* NMOS parallel */}
        <line x1="110" y1="134" x2="190" y2="134" stroke={nOn(0) || nOn(1) ? ON : OFF} strokeWidth="2" />
        <line x1="110" y1="134" x2="110" y2="156" stroke={nOn(0) ? ON : OFF} strokeWidth="2" />
        <line x1="190" y1="134" x2="190" y2="156" stroke={nOn(1) ? ON : OFF} strokeWidth="2" />
        <Tr x={110} y={170} on={nOn(0)} label="A" />
        <Tr x={190} y={170} on={nOn(1)} label="B" />
        <line x1="110" y1="184" x2="110" y2="222" stroke={nOn(0) ? ON : OFF} strokeWidth="2" />
        <line x1="190" y1="184" x2="190" y2="222" stroke={nOn(1) ? ON : OFF} strokeWidth="2" />
        {rail(222, "GND", "#60a5fa")}
        <line x1="150" y1="134" x2="262" y2="134" stroke={out ? ON : OFF} strokeWidth="2" />
        <text x="266" y="130" fill={out ? ON : "#8fa2bd"} fontSize="11" fontFamily="monospace">Y={out}</text>
        <text x="16" y="80" fill="#667085" fontSize="9" fontFamily="monospace">PMOS series</text>
        <text x="16" y="200" fill="#667085" fontSize="9" fontFamily="monospace">NMOS ∥</text>
      </svg>
    );
  }

  // AOI
  const pdnOn = (nOn(0) && nOn(1)) || nOn(2);
  return (
    <svg viewBox="0 0 340 300" className="w-full max-w-[360px]">
      {rail(16, "VDD", "#f87171")}
      <line x1="150" y1="16" x2="150" y2="30" stroke={(pOn(0) || pOn(1)) && pOn(2) ? ON : OFF} strokeWidth="2" />
      <line x1="110" y1="30" x2="190" y2="30" stroke={pOn(0) || pOn(1) ? ON : OFF} strokeWidth="2" />
      <line x1="110" y1="30" x2="110" y2="44" stroke={pOn(0) ? ON : OFF} strokeWidth="2" />
      <line x1="190" y1="30" x2="190" y2="44" stroke={pOn(1) ? ON : OFF} strokeWidth="2" />
      <Tr x={110} y={58} on={pOn(0)} label="A" p />
      <Tr x={190} y={58} on={pOn(1)} label="B" p />
      <line x1="110" y1="72" x2="110" y2="88" stroke={pOn(0) ? ON : OFF} strokeWidth="2" />
      <line x1="190" y1="72" x2="190" y2="88" stroke={pOn(1) ? ON : OFF} strokeWidth="2" />
      <line x1="110" y1="88" x2="190" y2="88" stroke={pOn(0) || pOn(1) ? ON : OFF} strokeWidth="2" />
      <line x1="150" y1="88" x2="150" y2="104" stroke={pOn(0) || pOn(1) ? ON : OFF} strokeWidth="2" />
      <Tr x={150} y={118} on={pOn(2)} label="C" p />
      <line x1="150" y1="132" x2="150" y2="164" stroke={(pOn(0) || pOn(1)) && pOn(2) ? ON : OFF} strokeWidth="2" />

      <line x1="110" y1="164" x2="190" y2="164" stroke={pdnOn ? ON : OFF} strokeWidth="2" />
      <line x1="110" y1="164" x2="110" y2="182" stroke={nOn(0) && nOn(1) ? ON : OFF} strokeWidth="2" />
      <line x1="190" y1="164" x2="190" y2="182" stroke={nOn(2) ? ON : OFF} strokeWidth="2" />
      <Tr x={110} y={196} on={nOn(0)} label="A" />
      <line x1="110" y1="210" x2="110" y2="226" stroke={nOn(0) && nOn(1) ? ON : OFF} strokeWidth="2" />
      <Tr x={110} y={240} on={nOn(1)} label="B" />
      <Tr x={190} y={196} on={nOn(2)} label="C" />
      <line x1="110" y1="254" x2="110" y2="278" stroke={nOn(0) && nOn(1) ? ON : OFF} strokeWidth="2" />
      <line x1="190" y1="210" x2="190" y2="278" stroke={nOn(2) ? ON : OFF} strokeWidth="2" />
      {rail(278, "GND", "#60a5fa")}
      <line x1="150" y1="164" x2="282" y2="164" stroke={out ? ON : OFF} strokeWidth="2" />
      <text x="286" y="160" fill={out ? ON : "#8fa2bd"} fontSize="11" fontFamily="monospace">Y={out}</text>
    </svg>
  );
}

/* ========================================================================== */
/* Active high / low                                                          */
/* ========================================================================== */

export function ActiveLevels() {
  const [level, setLevel] = useState<0 | 1>(0);
  const [kind, setKind] = useState<"high" | "low">("low");
  const asserted = kind === "high" ? level === 1 : level === 0;

  return (
    <div className="space-y-5">
      <Callout kind="key" title="Voltage vs meaning — keep them separate in your head">
        <p><strong>HIGH / LOW</strong> describe the <em>voltage</em> on the wire. Physical.</p>
        <p><strong>Asserted / negated</strong> describe whether the signal is <em>doing its job</em>. Logical.</p>
        <p className="mt-2">Which voltage means &ldquo;doing its job&rdquo; is the signal’s <strong>active level</strong>, and it is a design
        choice, written into the signal’s name. RESET̅ asserted means RESET̅ is LOW.</p>
      </Callout>

      <Panel>
        <div className="flex flex-wrap gap-8 items-end">
          <div>
            <Label>Signal’s active level</Label>
            <Seg options={[{ v: "high" as const, label: "Active-HIGH (e.g. ENABLE)" }, { v: "low" as const, label: "Active-LOW (e.g. RESET̅)" }]} value={kind} onChange={setKind} />
          </div>
          <div>
            <Label>Voltage on the wire</Label>
            <div className="flex items-center gap-3">
              <Bit v={level} size="lg" onClick={() => setLevel((level ^ 1) as 0 | 1)} />
              <span className="font-mono text-sm text-[var(--color-ink-dim)]">{level ? "HIGH (near VDD)" : "LOW (near 0 V)"}</span>
            </div>
          </div>
          <div className="pb-1">
            <Chip tone={asserted ? "good" : "n"}>{asserted ? "ASSERTED — action happening" : "NEGATED — idle"}</Chip>
          </div>
        </div>
      </Panel>

      <Panel>
        <h3 className="font-bold mb-3">The four combinations</h3>
        <Table
          head={["Active level", "Wire voltage", "State", "Reads as"]}
          rows={[
            ["Active-HIGH", "HIGH (1)", <Chip key="a" tone="good">asserted</Chip>, "The thing is happening"],
            ["Active-HIGH", "LOW (0)", <Chip key="b">negated</Chip>, "Idle"],
            ["Active-LOW", "LOW (0)", <Chip key="c" tone="good">asserted</Chip>, "The thing is happening"],
            ["Active-LOW", "HIGH (1)", <Chip key="d">negated</Chip>, "Idle"],
          ]}
          highlight={(i) => i === (kind === "high" ? (level ? 0 : 1) : (level ? 3 : 2))}
        />
      </Panel>

      <Panel>
        <h3 className="font-bold mb-3">How active-low signals are written</h3>
        <div className="grid sm:grid-cols-2 gap-4 text-sm">
          {[
            ["Overbar: R̅E̅S̅E̅T̅", "The formal notation used in lecture slides and datasheets."],
            ["Trailing apostrophe: RESET'", "What you type when you cannot draw a bar."],
            ["Slash prefix: /RESET", "Common in schematics and code."],
            ["_n or _L suffix: reset_n", "Standard in Verilog and VHDL."],
          ].map(([a, b]) => (
            <div key={a} className="rounded-lg border border-[var(--color-line)] bg-[#0d1219] p-3.5">
              <div className="font-mono text-[var(--color-accent)] font-semibold">{a}</div>
              <div className="text-[13px] text-[var(--color-ink-dim)] mt-1">{b}</div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <h3 className="font-bold mb-1">Why active-LOW is so common</h3>
        <ul className="text-sm text-[var(--color-ink-dim)] space-y-2 list-disc pl-5 mt-3">
          <li><strong>Historical, and still true:</strong> TTL outputs can sink far more current than they can source, so a LOW is the &ldquo;strong&rdquo; state. Put the important, must-work event on the strong level.</li>
          <li><strong>Wired-AND buses:</strong> with open-drain outputs, any device can pull the line low and none can force it high. An active-low interrupt line lets many devices share one wire.</li>
          <li><strong>Fail-safe:</strong> a pull-up resistor holds an unconnected active-low input negated. A broken wire means &ldquo;idle&rdquo;, not &ldquo;reset the system&rdquo;.</li>
        </ul>
      </Panel>

      <Panel>
        <h3 className="font-bold mb-3">The bubble on a symbol says the active level</h3>
        <div className="flex flex-wrap gap-8">
          <div>
            <div className="text-xs text-[var(--color-ink-faint)] mb-2 font-mono">no bubble → active-HIGH pin</div>
            <GateSymbol kind="AND" labels={["A", "B"]} width={140} />
          </div>
          <div>
            <div className="text-xs text-[var(--color-ink-faint)] mb-2 font-mono">output bubble → active-LOW output</div>
            <GateSymbol kind="NAND" labels={["A", "B"]} width={140} />
          </div>
          <div>
            <div className="text-xs text-[var(--color-ink-faint)] mb-2 font-mono">input bubbles → active-LOW inputs</div>
            <GateSymbol kind="NOR" alt labels={["A̅", "B̅"]} width={140} />
          </div>
        </div>
        <p className="text-sm text-[var(--color-ink-dim)] mt-4">
          The third symbol reads: &ldquo;output goes HIGH when both A̅ and B̅ are asserted (i.e. both are LOW)&rdquo;.
          Electrically it is a NOR gate — but drawn this way, its <em>purpose</em> is obvious at a glance.
        </p>
      </Panel>
    </div>
  );
}

/* ========================================================================== */
/* Noise margin                                                               */
/* ========================================================================== */

export function NoiseMargin() {
  const [voh, setVoh] = useState(2.4);
  const [vih, setVih] = useState(2.0);
  const [vil, setVil] = useState(0.8);
  const [vol, setVol] = useState(0.4);
  const [vcc, setVcc] = useState(5);
  const [noise, setNoise] = useState(0.3);

  const nmh = voh - vih;
  const nml = vil - vol;
  const worst = Math.min(nmh, nml);
  const survivesH = noise <= nmh;
  const survivesL = noise <= nml;

  const preset = (k: FamKey) => { const f = FAMILIES[k]; setVoh(f.voh); setVih(f.vih); setVil(f.vil); setVol(f.vol); setVcc(f.vcc); };

  return (
    <div className="space-y-5">
      <Callout kind="key" title="The two formulas">
        <p className="font-mono text-[15px] my-1"><strong>NM<sub>H</sub> = V<sub>OH</sub> − V<sub>IH</sub></strong></p>
        <p className="font-mono text-[15px] my-1"><strong>NM<sub>L</sub> = V<sub>IL</sub> − V<sub>OL</sub></strong></p>
        <p className="mt-2">In words: how much the HIGH can droop before the receiver stops believing it, and how much the LOW
        can be lifted before the same. The circuit’s real noise immunity is the <strong>smaller</strong> of the two.</p>
      </Callout>

      <Panel>
        <div className="mb-4">
          <Label>Load a real family</Label>
          <Seg options={(Object.keys(FAMILIES) as FamKey[]).map((k) => ({ v: k, label: k }))} value={"" as any} onChange={preset} size="sm" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {([["V_OH (min output high)", voh, setVoh], ["V_IH (min input high)", vih, setVih], ["V_IL (max input low)", vil, setVil], ["V_OL (max output low)", vol, setVol]] as const).map(([l, v, set]) => (
            <div key={l}>
              <Label>{l}</Label>
              <input type="number" step={0.05} value={v} onChange={(e) => (set as any)(+e.target.value)}
                className="w-full rounded-lg bg-[#0d1219] border border-[var(--color-line)] px-3 py-2 font-mono focus:border-[var(--color-accent)] outline-none" />
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid lg:grid-cols-[1fr_1fr] gap-4">
        <Panel>
          <h3 className="font-bold mb-4">Drawn to scale</h3>
          <NoiseDiagram vcc={vcc} voh={voh} vih={vih} vil={vil} vol={vol} />
        </Panel>

        <div className="space-y-4">
          <Panel>
            <h3 className="font-bold mb-3">Results</h3>
            <div className="space-y-3">
              <Result label="High-state noise margin NM_H" value={`${nmh.toFixed(2)} V`} sub={`${voh} − ${vih}`} tone={nmh > 0 ? "good" : "bad"} />
              <Result label="Low-state noise margin NM_L" value={`${nml.toFixed(2)} V`} sub={`${vil} − ${vol}`} tone={nml > 0 ? "good" : "bad"} />
              <Result label="Worst-case (what actually matters)" value={`${worst.toFixed(2)} V`} tone={worst > 0 ? "accent" : "bad"} sub="the smaller of the two" />
            </div>
            {(nmh <= 0 || nml <= 0) && (
              <div className="mt-3 text-sm text-[var(--color-bad)]">
                A negative or zero margin means these two families cannot be connected directly at all — the driver
                does not produce a level the receiver is guaranteed to understand. You would need a level shifter.
              </div>
            )}
          </Panel>

          <Panel>
            <h3 className="font-bold mb-3">Try some noise</h3>
            <Label>Noise amplitude coupled onto the wire</Label>
            <input type="range" min={0} max={2} step={0.05} value={noise} onChange={(e) => setNoise(+e.target.value)} className="w-full accent-[var(--color-accent)]" />
            <div className="font-mono text-lg mt-1">{noise.toFixed(2)} V</div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-3">
                <Chip tone={survivesH ? "good" : "bad"}>{survivesH ? "HIGH survives" : "HIGH corrupted"}</Chip>
                <span className="text-xs font-mono text-[var(--color-ink-dim)]">{voh.toFixed(2)} − {noise.toFixed(2)} = {(voh - noise).toFixed(2)} V {survivesH ? "≥" : "<"} V_IH {vih}</span>
              </div>
              <div className="flex items-center gap-3">
                <Chip tone={survivesL ? "good" : "bad"}>{survivesL ? "LOW survives" : "LOW corrupted"}</Chip>
                <span className="text-xs font-mono text-[var(--color-ink-dim)]">{vol.toFixed(2)} + {noise.toFixed(2)} = {(vol + noise).toFixed(2)} V {survivesL ? "≤" : ">"} V_IL {vil}</span>
              </div>
            </div>
          </Panel>
        </div>
      </div>

      <Panel>
        <h3 className="font-bold mb-3">Family comparison</h3>
        <Table
          head={["Family", "V_OH", "V_IH", "V_IL", "V_OL", "NM_H", "NM_L", "Worst"]}
          rows={(Object.keys(FAMILIES) as FamKey[]).map((k) => {
            const f = FAMILIES[k];
            const h = f.voh - f.vih, l = f.vil - f.vol;
            return [k, f.voh, f.vih, f.vil, f.vol,
              h.toFixed(2), l.toFixed(2),
              <span key="w" className="font-bold text-[var(--color-accent)]">{Math.min(h, l).toFixed(2)} V</span>];
          })}
        />
        <p className="text-sm text-[var(--color-ink-dim)] mt-4">
          Notice 5 V CMOS has a huge margin (about 1.45 V) because its thresholds sit near V<sub>DD</sub>/2 and its
          outputs go almost rail to rail. TTL gets only about 0.4 V. Also notice what happens as supplies drop to
          1.8 V and below: the absolute margin shrinks with the supply, which is exactly why modern low-voltage
          boards need much more careful layout and decoupling.
        </p>
      </Panel>
    </div>
  );
}

function NoiseDiagram({ vcc, voh, vih, vil, vol }: { vcc: number; voh: number; vih: number; vil: number; vol: number }) {
  const H = 300, W = 300;
  const y = (v: number) => H - (v / vcc) * H;
  return (
    <svg viewBox={`0 0 ${W + 90} ${H + 30}`} className="w-full">
      {/* output side */}
      <text x="30" y="12" fill="#98a3b8" fontSize="11" fontFamily="monospace">DRIVER out</text>
      <rect x="20" y={y(vcc)} width="110" height={y(voh) - y(vcc)} fill="#4ade8022" stroke="#4ade8066" />
      <text x="26" y={(y(vcc) + y(voh)) / 2 + 4} fill="#4ade80" fontSize="10">logic 1</text>
      <rect x="20" y={y(voh)} width="110" height={y(vol) - y(voh)} fill="#33415522" stroke="#33415566" />
      <text x="26" y={(y(voh) + y(vol)) / 2 + 4} fill="#667085" fontSize="9">not produced</text>
      <rect x="20" y={y(vol)} width="110" height={y(0) - y(vol)} fill="#60a5fa22" stroke="#60a5fa66" />
      <text x="26" y={(y(vol) + y(0)) / 2 + 4} fill="#60a5fa" fontSize="10">logic 0</text>

      {/* input side */}
      <text x="200" y="12" fill="#98a3b8" fontSize="11" fontFamily="monospace">RECEIVER in</text>
      <rect x="200" y={y(vcc)} width="110" height={y(vih) - y(vcc)} fill="#4ade8022" stroke="#4ade8066" />
      <text x="206" y={(y(vcc) + y(vih)) / 2 + 4} fill="#4ade80" fontSize="10">reads 1</text>
      <rect x="200" y={y(vih)} width="110" height={y(vil) - y(vih)} fill="#f8717122" stroke="#f8717166" />
      <text x="206" y={(y(vih) + y(vil)) / 2 + 4} fill="#f87171" fontSize="10">undefined</text>
      <rect x="200" y={y(vil)} width="110" height={y(0) - y(vil)} fill="#60a5fa22" stroke="#60a5fa66" />
      <text x="206" y={(y(vil) + y(0)) / 2 + 4} fill="#60a5fa" fontSize="10">reads 0</text>

      {/* margins */}
      <line x1="130" y1={y(voh)} x2="200" y2={y(voh)} stroke="#4ade80" strokeWidth="1.5" strokeDasharray="3 3" />
      <line x1="130" y1={y(vih)} x2="200" y2={y(vih)} stroke="#4ade80" strokeWidth="1.5" strokeDasharray="3 3" />
      <line x1="165" y1={y(voh)} x2="165" y2={y(vih)} stroke="#4ade80" strokeWidth="2" />
      <text x="140" y={(y(voh) + y(vih)) / 2 - 4} fill="#4ade80" fontSize="10" fontFamily="monospace">NM_H</text>
      <text x="140" y={(y(voh) + y(vih)) / 2 + 9} fill="#4ade80" fontSize="10" fontFamily="monospace">{(voh - vih).toFixed(2)}V</text>

      <line x1="130" y1={y(vil)} x2="200" y2={y(vil)} stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="3 3" />
      <line x1="130" y1={y(vol)} x2="200" y2={y(vol)} stroke="#60a5fa" strokeWidth="1.5" strokeDasharray="3 3" />
      <line x1="165" y1={y(vil)} x2="165" y2={y(vol)} stroke="#60a5fa" strokeWidth="2" />
      <text x="140" y={(y(vil) + y(vol)) / 2 - 4} fill="#60a5fa" fontSize="10" fontFamily="monospace">NM_L</text>
      <text x="140" y={(y(vil) + y(vol)) / 2 + 9} fill="#60a5fa" fontSize="10" fontFamily="monospace">{(vil - vol).toFixed(2)}V</text>

      {[[vcc, "VDD"], [voh, "V_OH"], [vih, "V_IH"], [vil, "V_IL"], [vol, "V_OL"], [0, "GND"]].map(([v, l], i) => (
        <text key={i} x={W + 16} y={y(v as number) + 4} fill="#667085" fontSize="9" fontFamily="monospace">{l} {(v as number).toFixed(2)}</text>
      ))}
    </svg>
  );
}

/* ========================================================================== */
/* Fan-out                                                                    */
/* ========================================================================== */

export function Fanout() {
  const [ioh, setIoh] = useState(0.4);   // mA the driver can SOURCE
  const [iol, setIol] = useState(16);    // mA the driver can SINK
  const [iih, setIih] = useState(0.04);  // mA one load draws when high
  const [iil, setIil] = useState(1.6);   // mA one load pushes back when low

  const fh = Math.floor(ioh / iih);
  const fl = Math.floor(iol / iil);
  const fanout = Math.min(fh, fl);

  const preset = (k: FamKey) => { const f = FAMILIES[k]; setIoh(Math.abs(f.ioh)); setIol(f.iol); setIih(Math.abs(f.iih)); setIil(Math.abs(f.iil)); };

  return (
    <div className="space-y-5">
      <Callout kind="key" title="Fan-out in one line">
        <p className="font-mono text-[15px] my-1"><strong>fan-out = min( I<sub>OH</sub>/I<sub>IH</sub> , I<sub>OL</sub>/I<sub>IL</sub> )</strong>, rounded DOWN.</p>
        <p className="mt-2">One output has a current budget. Each input it drives spends some of it. When you run out, the
        output voltage sags out of spec and the logic starts failing. You must check <em>both</em> states, because
        a driver is usually much better at one of them.</p>
      </Callout>

      <Panel>
        <div className="mb-4">
          <Label>Load a real family</Label>
          <Seg options={(Object.keys(FAMILIES) as FamKey[]).map((k) => ({ v: k, label: k }))} value={"" as any} onChange={preset} size="sm" />
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {([["I_OH — driver can source (mA)", ioh, setIoh], ["I_IH — one load draws (mA)", iih, setIih], ["I_OL — driver can sink (mA)", iol, setIol], ["I_IL — one load pushes back (mA)", iil, setIil]] as const).map(([l, v, set]) => (
            <div key={l}>
              <Label>{l}</Label>
              <input type="number" step={0.01} value={v} onChange={(e) => (set as any)(+e.target.value)}
                className="w-full rounded-lg bg-[#0d1219] border border-[var(--color-line)] px-3 py-2 font-mono focus:border-[var(--color-accent)] outline-none" />
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid md:grid-cols-3 gap-4">
        <Panel>
          <div className="text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-faint)]">HIGH state</div>
          <div className="mt-3 text-sm text-[var(--color-ink-dim)]">
            The driver <strong>sources</strong> current out into every input it feeds.
          </div>
          <Result label="Loads it can drive HIGH" value={isFinite(fh) ? fh : "∞"} sub={`${ioh} mA ÷ ${iih} mA`} tone="accent" />
        </Panel>
        <Panel>
          <div className="text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-faint)]">LOW state</div>
          <div className="mt-3 text-sm text-[var(--color-ink-dim)]">
            The driver <strong>sinks</strong> current flowing back out of every input.
          </div>
          <Result label="Loads it can drive LOW" value={isFinite(fl) ? fl : "∞"} sub={`${iol} mA ÷ ${iil} mA`} tone="accent" />
        </Panel>
        <Panel className="border-[var(--color-hi)]">
          <div className="text-xs font-semibold uppercase tracking-widest text-[var(--color-ink-faint)]">Answer</div>
          <div className="mt-3 text-sm text-[var(--color-ink-dim)]">Whichever state runs out first is the limit.</div>
          <Result label="Fan-out" value={isFinite(fanout) ? fanout : "∞"} sub={fh < fl ? "limited by the HIGH state" : fl < fh ? "limited by the LOW state" : "both states equal"} tone="good" />
        </Panel>
      </div>

      <Panel>
        <h3 className="font-bold mb-4">What that looks like</h3>
        <svg viewBox="0 0 620 150" className="w-full">
          <rect x="10" y="52" width="80" height="46" rx="6" fill="#12253a" stroke="#60a5fa" strokeWidth="1.5" />
          <text x="50" y="72" textAnchor="middle" fill="#60a5fa" fontSize="10" fontFamily="monospace">DRIVER</text>
          <text x="50" y="88" textAnchor="middle" fill="#667085" fontSize="9" fontFamily="monospace">{iol} mA</text>
          <line x1="90" y1="75" x2="150" y2="75" stroke="#4ade80" strokeWidth="2" />
          <line x1="150" y1="18" x2="150" y2="132" stroke="#4ade80" strokeWidth="2" />
          {Array.from({ length: Math.min(isFinite(fanout) ? fanout : 8, 8) }, (_, i) => {
            const y = 18 + i * 16.3;
            return (
              <g key={i}>
                <line x1="150" y1={y} x2="180" y2={y} stroke="#4ade80" strokeWidth="1.6" />
                <rect x="180" y={y - 6} width="52" height="12" rx="3" fill="#151c28" stroke="#38455c" strokeWidth="1" />
                <text x="206" y={y + 3.5} textAnchor="middle" fill="#98a3b8" fontSize="7" fontFamily="monospace">LOAD {i + 1}</text>
              </g>
            );
          })}
          <text x="250" y="40" fill="#98a3b8" fontSize="11" fontFamily="monospace">
            {isFinite(fanout) ? `${fanout} loads max` : "essentially unlimited (DC)"}
          </text>
          <text x="250" y="60" fill="#667085" fontSize="10" fontFamily="monospace">
            each load costs {iil} mA in the LOW state
          </text>
          <text x="250" y="78" fill="#667085" fontSize="10" fontFamily="monospace">
            budget: {iol} mA → {fl} loads
          </text>
          {isFinite(fanout) && fanout > 8 && <text x="250" y="98" fill="#667085" fontSize="10" fontFamily="monospace">(only 8 drawn)</text>}
        </svg>
      </Panel>

      <Panel>
        <h3 className="font-bold mb-1">The CMOS twist</h3>
        <p className="text-sm text-[var(--color-ink-dim)]">
          A CMOS input is a capacitor — it draws essentially <strong>no DC current</strong>. So the formula above gives
          a fan-out of thousands, which is technically true and practically useless. What actually limits CMOS
          fan-out is <strong>capacitance</strong>: each extra input adds a few pF, the driver has to charge all of it,
          and the rise time stretches:
        </p>
        <div className="font-mono text-sm rounded-lg bg-[#0d1219] border border-[var(--color-line)] p-4 mt-3">
          t<sub>r</sub> ∝ C<sub>total</sub> / I<sub>drive</sub>   where C<sub>total</sub> = N × C<sub>in</sub> + C<sub>wire</sub>
        </div>
        <p className="text-sm text-[var(--color-ink-dim)] mt-3">
          So in CMOS, fan-out is a <em>speed</em> limit, not a <em>voltage</em> limit. In TTL it is a current
          limit and the voltage really does fail. Know which family a question is about before you answer it.
        </p>
      </Panel>
    </div>
  );
}

/* ========================================================================== */
/* Power & speed                                                              */
/* ========================================================================== */

export function PowerCalc() {
  const [vdd, setVdd] = useState(3.3);
  const [c, setC] = useState(15);      // pF
  const [f, setF] = useState(100);     // MHz
  const [icc, setIcc] = useState(10);  // µA quiescent
  const [n, setN] = useState(1000);    // gates switching
  const [tpd, setTpd] = useState(2);   // ns

  const pDyn = n * c * 1e-12 * vdd * vdd * f * 1e6;   // watts
  const pStat = vdd * icc * 1e-6;
  const pTot = pDyn + pStat;
  const spd = pTot / n * tpd * 1e-9;   // J per gate — speed-power product

  return (
    <div className="space-y-5">
      <Callout kind="key" title="Two kinds of power">
        <p><strong>Static (quiescent):</strong> P = V<sub>DD</sub> × I<sub>CC</sub>. What the chip burns just sitting there.
        Tiny in CMOS, significant in TTL.</p>
        <p><strong>Dynamic (switching):</strong> P = C × V<sub>DD</sub>² × f. Every 0→1→0 cycle charges and then dumps
        the load capacitance. This dominates in any modern CMOS chip.</p>
        <p className="mt-2">The V² is why lowering the supply voltage is the single most effective power saving there is —
        halving V<sub>DD</sub> quarters the dynamic power.</p>
      </Callout>

      <Panel>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {([
            ["Supply V_DD (V)", vdd, setVdd, 0.1, 0.8, 5],
            ["Load per gate C (pF)", c, setC, 1, 1, 100],
            ["Clock frequency f (MHz)", f, setF, 1, 1, 3000],
            ["Quiescent current I_CC (µA)", icc, setIcc, 1, 0, 5000],
            ["Gates switching", n, setN, 100, 1, 100000],
            ["Gate delay t_pd (ns)", tpd, setTpd, 0.1, 0.1, 30],
          ] as const).map(([l, v, set, step, min, max]) => (
            <div key={l}>
              <Label>{l}</Label>
              <input type="range" min={min} max={max} step={step} value={v} onChange={(e) => (set as any)(+e.target.value)} className="w-full accent-[var(--color-accent)]" />
              <div className="font-mono text-sm mt-1">{v}</div>
            </div>
          ))}
        </div>
      </Panel>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Result label="Dynamic power" value={pDyn < 1 ? `${(pDyn * 1000).toFixed(2)} mW` : `${pDyn.toFixed(3)} W`} sub={`N·C·V²·f`} tone="bad" />
        <Result label="Static power" value={pStat < 0.001 ? `${(pStat * 1e6).toFixed(1)} µW` : `${(pStat * 1000).toFixed(3)} mW`} sub="V_DD × I_CC" />
        <Result label="Total" value={pTot < 1 ? `${(pTot * 1000).toFixed(2)} mW` : `${pTot.toFixed(3)} W`} tone="accent" />
        <Result label="Dynamic share" value={`${((pDyn / pTot) * 100).toFixed(1)}%`} sub="of the total" />
      </div>

      <Panel>
        <h3 className="font-bold mb-3">Speed-power product (the figure of merit)</h3>
        <p className="text-sm text-[var(--color-ink-dim)] mb-4">
          Power alone is a bad way to compare logic families — a slow chip burns less power simply by doing less.
          The <strong>speed-power product</strong> = P × t<sub>pd</sub> measures energy per operation, which is what
          you actually want to minimise. Its unit is the joule (usually picojoules).
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <Result label="Energy per gate-operation" value={`${(spd * 1e12).toFixed(3)} pJ`} sub={`P/gate × t_pd`} tone="accent" />
          <Result label="Max clock from t_pd alone" value={`${(1000 / tpd).toFixed(0)} MHz`} sub="one gate delay per cycle — real logic needs several" />
        </div>
        <Callout kind="tip">
          Watch what happens when you drag V<sub>DD</sub> down: power falls fast (V²), but in a real chip the
          transistors also get slower, so t<sub>pd</sub> rises. That tension — lower voltage saves power but costs
          speed — is the central engineering trade-off in every processor design.
        </Callout>
      </Panel>

      <Panel>
        <h3 className="font-bold mb-3">Worked example, the way an exam asks it</h3>
        <Steps items={[
          { title: "Read the numbers off the datasheet", body: <>V<sub>DD</sub> = {vdd} V, C<sub>L</sub> = {c} pF per gate, f = {f} MHz, {n} gates switching.</> },
          { title: "Dynamic power per gate", body: <>P = C·V²·f = {c}×10⁻¹² × {vdd}² × {f}×10⁶ = {((c * 1e-12 * vdd * vdd * f * 1e6) * 1e6).toFixed(2)} µW</> },
          { title: "Multiply by the number switching", body: <>{n} × that = {(pDyn * 1000).toFixed(2)} mW</> },
          { title: "Add static power", body: <>{(pStat * 1e6).toFixed(1)} µW, giving {(pTot * 1000).toFixed(2)} mW total.</> },
          { title: "State the assumption", body: "This assumes every gate switches once per clock. Real activity factors are more like 0.1–0.3, so divide by 3–10 for a realistic estimate — say so if the question asks for an estimate." },
        ]} />
      </Panel>
    </div>
  );
}

/* ========================================================================== */
/* Tri-state & open-drain                                                     */
/* ========================================================================== */

export function TristateLab() {
  const [drivers, setDrivers] = useState([{ en: 1, d: 1 }, { en: 0, d: 0 }, { en: 0, d: 1 }]);
  const [mode, setMode] = useState<"tristate" | "opendrain">("tristate");

  const enabled = drivers.filter((d) => d.en);
  let busState: string, tone: "good" | "bad" | "warn" | "n";
  if (mode === "tristate") {
    if (enabled.length === 0) { busState = "floating (Hi-Z) — undefined"; tone = "warn"; }
    else if (enabled.length === 1) { busState = String(enabled[0].d); tone = "good"; }
    else if (enabled.every((d) => d.d === enabled[0].d)) { busState = `${enabled[0].d} (but you got lucky)`; tone = "warn"; }
    else { busState = "CONTENTION — short circuit"; tone = "bad"; }
  } else {
    // open drain: any enabled driver outputting 0 pulls the line low; pull-up gives 1
    const anyLow = enabled.some((d) => d.d === 0);
    busState = anyLow ? "0" : "1 (via the pull-up)";
    tone = "good";
  }

  return (
    <div className="space-y-5">
      <Callout kind="key" title="The problem being solved">
        A normal (totem-pole) output always drives — it is either pushing the wire to V<sub>DD</sub> or pulling it to
        ground. Connect two of them together with different values and you create a direct short from V<sub>DD</sub> to
        ground through the two transistors. Smoke. But shared buses are essential, so two solutions exist.
      </Callout>

      <Panel>
        <div className="flex flex-wrap gap-6 items-end">
          <div>
            <Label>Output type</Label>
            <Seg options={[{ v: "tristate" as const, label: "Tri-state" }, { v: "opendrain" as const, label: "Open-drain / open-collector" }]} value={mode} onChange={setMode} />
          </div>
          <div>
            <Label>Bus state</Label>
            <Chip tone={tone}>{busState}</Chip>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {drivers.map((d, i) => (
            <div key={i} className="flex flex-wrap items-center gap-4 rounded-lg border border-[var(--color-line)] bg-[#0d1219] p-3">
              <span className="font-mono text-sm text-[var(--color-ink-faint)] w-16">Driver {i + 1}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[var(--color-ink-faint)]">{mode === "tristate" ? "ENABLE" : "active"}</span>
                <Bit v={d.en as 0 | 1} onClick={() => setDrivers(drivers.map((x, j) => (i === j ? { ...x, en: x.en ^ 1 } : x)))} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[var(--color-ink-faint)]">DATA</span>
                <Bit v={d.d as 0 | 1} tone="accent" onClick={() => setDrivers(drivers.map((x, j) => (i === j ? { ...x, d: x.d ^ 1 } : x)))} />
              </div>
              <span className="text-xs font-mono text-[var(--color-ink-dim)] ml-auto">
                → drives {d.en ? (mode === "opendrain" && d.d === 1 ? "nothing (transistor off)" : d.d) : "Hi-Z (disconnected)"}
              </span>
            </div>
          ))}
        </div>
      </Panel>

      <Panel>
        <h3 className="font-bold mb-4">{mode === "tristate" ? "Tri-state buffers on a shared bus" : "Open-drain wired-AND bus"}</h3>
        <svg viewBox="0 0 560 210" className="w-full">
          {mode === "opendrain" && (
            <>
              <line x1="500" y1="20" x2="500" y2="50" stroke="#f87171" strokeWidth="2" />
              <text x="508" y="24" fill="#f87171" fontSize="10" fontFamily="monospace">VDD</text>
              <rect x="493" y="50" width="14" height="34" fill="#151c28" stroke="#fbbf24" strokeWidth="1.5" />
              <text x="514" y="72" fill="#fbbf24" fontSize="9" fontFamily="monospace">pull-up R</text>
              <line x1="500" y1="84" x2="500" y2="110" stroke="#fbbf24" strokeWidth="2" />
            </>
          )}
          <line x1="60" y1="110" x2="520" y2="110" stroke={tone === "bad" ? "#f87171" : tone === "warn" ? "#fbbf24" : "#4ade80"} strokeWidth="3" />
          <text x="250" y="102" fill="#98a3b8" fontSize="11" fontFamily="monospace">SHARED BUS = {busState}</text>

          {drivers.map((d, i) => {
            const x = 100 + i * 150;
            const active = d.en === 1 && !(mode === "opendrain" && d.d === 1);
            return (
              <g key={i}>
                <path d={`M ${x - 26} 150 L ${x + 14} 170 L ${x - 26} 190 Z`} fill="#151c28"
                  stroke={d.en ? "#60a5fa" : "#3a465e"} strokeWidth="2" />
                <line x1={x - 46} y1="170" x2={x - 26} y2="170" stroke={d.d ? "#4ade80" : "#4a5568"} strokeWidth="2" />
                <text x={x - 62} y="174" fill="#98a3b8" fontSize="9" fontFamily="monospace">D={d.d}</text>
                {mode === "tristate" && (
                  <>
                    <line x1={x - 6} y1="196" x2={x - 6} y2="206" stroke={d.en ? "#fbbf24" : "#3a465e"} strokeWidth="2" />
                    <text x={x - 22} y="206" fill={d.en ? "#fbbf24" : "#4a5568"} fontSize="9" fontFamily="monospace">EN={d.en}</text>
                  </>
                )}
                <line x1={x + 14} y1="170" x2={x + 14} y2="110" stroke={active ? "#4ade80" : "#2a3446"} strokeWidth="2"
                  strokeDasharray={active ? "" : "4 4"} />
                {!active && <text x={x + 20} y="140" fill="#4a5568" fontSize="9" fontFamily="monospace">Hi-Z</text>}
              </g>
            );
          })}
        </svg>
      </Panel>

      <div className="grid md:grid-cols-2 gap-4">
        <Panel>
          <h3 className="font-bold mb-2">Tri-state output</h3>
          <p className="text-sm text-[var(--color-ink-dim)]">
            A third state on top of 0 and 1: <strong>high impedance (Hi-Z)</strong>, where both output transistors are
            off and the pin is electrically disconnected from the wire.
          </p>
          <ul className="text-sm text-[var(--color-ink-dim)] mt-3 space-y-1.5 list-disc pl-5">
            <li>Full drive strength in both directions ⇒ fast edges.</li>
            <li><strong>Exactly one</strong> driver may be enabled at a time. Enforcing that is the designer’s job — usually with a decoder that can only assert one enable.</li>
            <li>Two enabled drivers disagreeing = <strong>bus contention</strong>: a short circuit that can destroy the chips.</li>
            <li>Zero enabled drivers = a <strong>floating</strong> bus, which drifts and can put a CMOS input into its forbidden region, wasting power and reading randomly.</li>
          </ul>
        </Panel>
        <Panel>
          <h3 className="font-bold mb-2">Open-drain (CMOS) / open-collector (TTL)</h3>
          <p className="text-sm text-[var(--color-ink-dim)]">
            The pull-up transistor is simply <em>not there</em>. The output can only pull down, or let go.
            An external <strong>pull-up resistor</strong> supplies the 1.
          </p>
          <ul className="text-sm text-[var(--color-ink-dim)] mt-3 space-y-1.5 list-disc pl-5">
            <li>Any number of drivers can be tied together safely — nobody can ever fight, because nobody can push high.</li>
            <li>This gives a free <strong>wired-AND</strong>: the line is 1 only if <em>every</em> driver lets go. Perfect for shared interrupt and I²C lines.</li>
            <li>Slow rising edge — the resistor has to charge the bus capacitance, so t<sub>r</sub> = RC. Small R is faster but wastes more current.</li>
            <li>Also handy for level shifting: pull up to 5 V from a 3.3 V driver.</li>
          </ul>
        </Panel>
      </div>
    </div>
  );
}

/* ========================================================================== */
/* Schmitt trigger                                                            */
/* ========================================================================== */

export function SchmittLab() {
  const [noise, setNoise] = useState(0.35);
  const [vt, setVt] = useState(1.65);
  const [vtp, setVtp] = useState(2.1);
  const [vtn, setVtn] = useState(1.2);
  const [seed, setSeed] = useState(1);

  const N = 240, VDD = 3.3;
  const sig = useMemo(() => {
    let s = seed * 9301;
    const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280 - 0.5; };
    return Array.from({ length: N }, (_, i) => {
      const base = VDD * 0.5 * (1 + Math.sin((i / N) * Math.PI * 3));
      return Math.max(0, Math.min(VDD, base + rnd() * noise * 2));
    });
  }, [noise, seed]);

  const plain = sig.map((v) => (v > vt ? 1 : 0) as 0 | 1);
  const schmitt = useMemo(() => {
    let state: 0 | 1 = 0;
    return sig.map((v) => { if (state === 0 && v > vtp) state = 1; else if (state === 1 && v < vtn) state = 0; return state; });
  }, [sig, vtp, vtn]);

  const count = (a: (0 | 1)[]) => a.reduce<number>((n, v, i) => n + (i > 0 && v !== a[i - 1] ? 1 : 0), 0);

  const W = 660, H = 120;
  const path = (vals: number[], scale: number, off: number) =>
    vals.map((v, i) => `${i === 0 ? "M" : "L"} ${(i / N) * W} ${off + (1 - v / scale) * H}`).join(" ");
  const digital = (vals: (0 | 1)[], off: number) => {
    let d = "";
    vals.forEach((v, i) => {
      const y = off + (v ? 6 : 46), x = (i / N) * W;
      if (i === 0) d += `M ${x} ${y}`;
      else { if (vals[i - 1] !== v) d += ` L ${x} ${y}`; }
      d += ` L ${((i + 1) / N) * W} ${y}`;
    });
    return d;
  };

  return (
    <div className="space-y-5">
      <Callout kind="key" title="What a Schmitt trigger fixes">
        An ordinary input has <strong>one</strong> threshold. A slow or noisy signal crossing it wobbles back and
        forth, and the output produces a burst of spurious edges. A Schmitt-trigger input has <strong>two</strong>
        thresholds — a higher one for going up, a lower one for coming down. Once it has switched, the signal must
        travel all the way back past the other threshold to switch again. That gap is called <strong>hysteresis</strong>,
        and it swallows the noise.
      </Callout>

      <Panel>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 items-end">
          <div>
            <Label>Noise amplitude (V)</Label>
            <input type="range" min={0} max={1} step={0.02} value={noise} onChange={(e) => setNoise(+e.target.value)} className="w-full accent-[var(--color-accent)]" />
            <div className="font-mono text-sm mt-1">{noise.toFixed(2)} V</div>
          </div>
          <div>
            <Label>Plain threshold V_T</Label>
            <input type="range" min={0.3} max={3} step={0.05} value={vt} onChange={(e) => setVt(+e.target.value)} className="w-full accent-[var(--color-accent)]" />
            <div className="font-mono text-sm mt-1">{vt.toFixed(2)} V</div>
          </div>
          <div>
            <Label>Schmitt V_T+ (rising)</Label>
            <input type="range" min={0.5} max={3.2} step={0.05} value={vtp} onChange={(e) => setVtp(Math.max(+e.target.value, vtn + 0.1))} className="w-full accent-[var(--color-hi)]" />
            <div className="font-mono text-sm mt-1">{vtp.toFixed(2)} V</div>
          </div>
          <div>
            <Label>Schmitt V_T− (falling)</Label>
            <input type="range" min={0.1} max={2.8} step={0.05} value={vtn} onChange={(e) => setVtn(Math.min(+e.target.value, vtp - 0.1))} className="w-full accent-[var(--color-hi)]" />
            <div className="font-mono text-sm mt-1">{vtn.toFixed(2)} V</div>
          </div>
        </div>
        <button onClick={() => setSeed(seed + 1)} className="mt-4 px-3 py-2 text-sm rounded-lg border border-[var(--color-line)] hover:border-[var(--color-accent)]">↻ new noise</button>
      </Panel>

      <Panel>
        <svg viewBox={`0 0 ${W} 400`} className="w-full">
          <text x="0" y="12" fill="#98a3b8" fontSize="11" fontFamily="monospace">noisy input</text>
          <line x1="0" y1={20 + (1 - vt / VDD) * H} x2={W} y2={20 + (1 - vt / VDD) * H} stroke="#f87171" strokeWidth="1" strokeDasharray="4 4" />
          <text x={W - 60} y={16 + (1 - vt / VDD) * H} fill="#f87171" fontSize="9" fontFamily="monospace">V_T</text>
          <line x1="0" y1={20 + (1 - vtp / VDD) * H} x2={W} y2={20 + (1 - vtp / VDD) * H} stroke="#4ade80" strokeWidth="1" strokeDasharray="4 4" />
          <text x={W - 60} y={16 + (1 - vtp / VDD) * H} fill="#4ade80" fontSize="9" fontFamily="monospace">V_T+</text>
          <line x1="0" y1={20 + (1 - vtn / VDD) * H} x2={W} y2={20 + (1 - vtn / VDD) * H} stroke="#4ade80" strokeWidth="1" strokeDasharray="4 4" />
          <text x={W - 60} y={16 + (1 - vtn / VDD) * H} fill="#4ade80" fontSize="9" fontFamily="monospace">V_T−</text>
          <rect x="0" y={20 + (1 - vtp / VDD) * H} width={W} height={((vtp - vtn) / VDD) * H} fill="#4ade8012" />
          <path d={path(sig, VDD, 20)} fill="none" stroke="#fbbf24" strokeWidth="1.4" />

          <text x="0" y="188" fill="#f87171" fontSize="11" fontFamily="monospace">ordinary input → {count(plain)} edges</text>
          <path d={digital(plain, 196)} fill="none" stroke="#f87171" strokeWidth="2" />

          <text x="0" y="288" fill="#4ade80" fontSize="11" fontFamily="monospace">Schmitt input → {count(schmitt)} edges</text>
          <path d={digital(schmitt, 296)} fill="none" stroke="#4ade80" strokeWidth="2" />
        </svg>

        <div className="grid sm:grid-cols-3 gap-3 mt-4">
          <Result label="Hysteresis V_H" value={`${(vtp - vtn).toFixed(2)} V`} sub="V_T+ − V_T−" tone="accent" />
          <Result label="Ordinary input transitions" value={count(plain)} tone={count(plain) > count(schmitt) ? "bad" : undefined} />
          <Result label="Schmitt input transitions" value={count(schmitt)} tone="good" sub={count(schmitt) < count(plain) ? `${count(plain) - count(schmitt)} false edges removed` : "clean"} />
        </div>
      </Panel>

      <div className="grid md:grid-cols-2 gap-4">
        <Panel>
          <h3 className="font-bold mb-3">The transfer characteristic</h3>
          <svg viewBox="0 0 260 200" className="w-full max-w-[280px]">
            <line x1="30" y1="170" x2="240" y2="170" stroke="#38455c" strokeWidth="1.5" />
            <line x1="30" y1="20" x2="30" y2="170" stroke="#38455c" strokeWidth="1.5" />
            <text x="130" y="192" fill="#667085" fontSize="10" fontFamily="monospace">V_in</text>
            <text x="2" y="96" fill="#667085" fontSize="10" fontFamily="monospace">V_out</text>
            {(() => {
              const x = (v: number) => 30 + (v / VDD) * 210;
              return (
                <>
                  <path d={`M 30 170 L ${x(vtp)} 170 L ${x(vtp)} 34 L 240 34`} fill="none" stroke="#4ade80" strokeWidth="2.5" />
                  <path d={`M 240 34 L ${x(vtn)} 34 L ${x(vtn)} 170 L 30 170`} fill="none" stroke="#60a5fa" strokeWidth="2.5" strokeDasharray="5 3" />
                  <text x={x(vtp) + 3} y="120" fill="#4ade80" fontSize="9" fontFamily="monospace">V_T+</text>
                  <text x={x(vtn) - 32} y="84" fill="#60a5fa" fontSize="9" fontFamily="monospace">V_T−</text>
                  <text x="150" y="150" fill="#4ade80" fontSize="9" fontFamily="monospace">→ rising</text>
                  <text x="60" y="56" fill="#60a5fa" fontSize="9" fontFamily="monospace">falling ←</text>
                </>
              );
            })()}
          </svg>
          <p className="text-sm text-[var(--color-ink-dim)] mt-3">
            The loop is the giveaway: the output depends not only on the input <em>now</em> but on which direction it
            arrived from. That is memory, of a sort — and it is why the symbol for a Schmitt input is a tiny
            hysteresis loop drawn inside the gate.
          </p>
        </Panel>
        <Panel>
          <h3 className="font-bold mb-3">Where you meet one</h3>
          <ul className="text-sm text-[var(--color-ink-dim)] space-y-2 list-disc pl-5">
            <li><strong>Mechanical switch debouncing</strong> — contacts physically bounce for milliseconds; a Schmitt input plus an RC turns that into one clean edge.</li>
            <li><strong>Slow-rising signals</strong> — anything coming through an RC filter or a long cable crosses the threshold sluggishly. Feeding that into an ordinary gate can even damage it, because both transistors conduct at once for a long time.</li>
            <li><strong>Recovering a signal from a noisy line</strong> — sensors, long ribbon cables, anything near a motor.</li>
            <li><strong>Relaxation oscillators</strong> — a Schmitt inverter with an RC feedback loop oscillates all by itself.</li>
          </ul>
          <Callout kind="warn">
            Hysteresis is not free: the input needs a larger swing to register at all, and the switching point is no
            longer symmetric, which adds duty-cycle distortion. Use Schmitt inputs where signals are ugly, not everywhere.
          </Callout>
        </Panel>
      </div>
    </div>
  );
}
