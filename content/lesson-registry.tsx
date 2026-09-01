"use client";
import {
  WhatIsDigital, NumberSystems, Codes, LogicGates, BooleanAlgebra,
  AltSymbolsXor, Adders, TwosComplementArithmetic, ArithmeticCircuits,
} from "./lessons-a";
import {
  MintermsSopPos, KarnaughMaps, TtlCmos, BubbleMatching,
  ElectricalCharacteristics, SchmittPlaFloat,
} from "./lessons-b";

export const LESSON_COMPONENTS: Record<string, React.ComponentType> = {
  "what-is-digital": WhatIsDigital,
  "number-systems": NumberSystems,
  "codes": Codes,
  "logic-gates": LogicGates,
  "boolean-algebra": BooleanAlgebra,
  "alt-symbols-xor": AltSymbolsXor,
  "adders": Adders,
  "twos-complement-arithmetic": TwosComplementArithmetic,
  "arithmetic-circuits": ArithmeticCircuits,
  "minterms-sop-pos": MintermsSopPos,
  "karnaugh-maps": KarnaughMaps,
  "ttl-cmos": TtlCmos,
  "bubble-matching": BubbleMatching,
  "electrical-characteristics": ElectricalCharacteristics,
  "schmitt-pla-float": SchmittPlaFloat,
};
