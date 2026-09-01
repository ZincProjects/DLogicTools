"use client";
import { BaseConverter, CodeExplorer, ParityLab, FloatLab } from "./Numbers";
import { GateLab, TruthTableTool, BooleanLaws, UniversalGates, AltSymbols, EnableLab } from "./Logic";
import { AdderLab, SignedNumbers, TwosCalc, AddSubCircuit, Multiplier, BcdAdder } from "./Arithmetic";
import { KmapSolver, PlaBuilder } from "./Simplify";
import {
  VoltageLevels, SerialParallel, TimingLab, CmosLab, ActiveLevels,
  NoiseMargin, Fanout, PowerCalc, TristateLab, SchmittLab,
} from "./Hardware";

export const TOOL_COMPONENTS: Record<string, React.ComponentType> = {
  "base-converter": BaseConverter,
  "code-explorer": CodeExplorer,
  "parity-lab": ParityLab,
  "float-lab": FloatLab,
  "gate-lab": GateLab,
  "truth-table": TruthTableTool,
  "boolean-laws": BooleanLaws,
  "universal-gates": UniversalGates,
  "alt-symbols": AltSymbols,
  "enable-lab": EnableLab,
  "adder-lab": AdderLab,
  "signed-numbers": SignedNumbers,
  "twos-calc": TwosCalc,
  "addsub-circuit": AddSubCircuit,
  "multiplier": Multiplier,
  "bcd-adder": BcdAdder,
  "kmap": KmapSolver,
  "pla-builder": PlaBuilder,
  "voltage-levels": VoltageLevels,
  "serial-parallel": SerialParallel,
  "timing-lab": TimingLab,
  "cmos-lab": CmosLab,
  "active-levels": ActiveLevels,
  "noise-margin": NoiseMargin,
  "fanout": Fanout,
  "power-calc": PowerCalc,
  "tristate-lab": TristateLab,
  "schmitt-lab": SchmittLab,
};
