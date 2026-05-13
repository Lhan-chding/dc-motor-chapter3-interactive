export type Formula = {
  id: string;
  latex: string;
  meaning: string;
  usedIn: string[];
  tag?: string;
};

export const formulas: Formula[] = [
  { id: "f-bil", latex: "F = B I l", meaning: "载流导体在磁场中受力", usedIn: ["3-2"], tag: "力" },
  { id: "t-kt-phi-i", latex: "T = K_T \\Phi I", meaning: "磁通和电枢电流共同决定转矩", usedIn: ["3-2"], tag: "转矩" },
  { id: "e-ke-phi-n", latex: "E = K_E \\Phi n", meaning: "磁通和转速决定感应电动势", usedIn: ["3-3"], tag: "反电动势" },
  { id: "t-kt-i", latex: "T = k_t I", meaning: "恒磁通时，转矩正比于电流", usedIn: ["3-2", "3-7-1"], tag: "恒磁通" },
  { id: "e-ke-w", latex: "E = k_e \\omega", meaning: "恒磁通时，反电动势正比于角速度", usedIn: ["3-3", "3-3-1"], tag: "速度" },
  { id: "kt-eq-ke", latex: "k_t = k_e = k", meaning: "国际单位制下常数可统一", usedIn: ["3-3", "3-4"], tag: "常数" },
  { id: "t-ki", latex: "T = kI", meaning: "直流电机转矩方程", usedIn: ["3-4", "3-6"], tag: "转矩" },
  { id: "e-kw", latex: "E = k\\omega", meaning: "直流电机反电动势方程", usedIn: ["3-3-1", "3-4"], tag: "反电动势" },
  { id: "v-dynamic", latex: "V = E + IR + L\\frac{dI}{dt}", meaning: "电枢动态电压方程", usedIn: ["3-3-1", "3-5"], tag: "动态" },
  { id: "v-steady", latex: "V = E + IR", meaning: "稳态电枢电压方程", usedIn: ["3-3-1", "3-4"], tag: "稳态" },
  { id: "i-ve-r", latex: "I = \\frac{V-E}{R}", meaning: "电压差决定电枢电流", usedIn: ["3-3-1", "3-6-1"], tag: "电流" },
  { id: "n-no-load", latex: "n = \\frac{V}{K_E \\Phi}", meaning: "理想空载转速", usedIn: ["3-4-1"], tag: "空载" },
  { id: "w-v-k", latex: "\\omega = \\frac{V}{k}", meaning: "恒磁通理想空载角速度", usedIn: ["3-4-1"], tag: "空载" },
  { id: "w-load", latex: "\\omega = \\frac{V}{k} - \\frac{R}{k^2}T_L", meaning: "负载使转速下降", usedIn: ["3-4", "3-4-3"], tag: "机械特性" },
  { id: "p-mech", latex: "P_{\\text{mech}} = T\\omega", meaning: "机械功率", usedIn: ["3-4-2", "3-6"], tag: "功率" },
  { id: "p-conv", latex: "P_{\\text{conv}} = EI", meaning: "电磁转换功率", usedIn: ["3-4-2"], tag: "能量" },
  { id: "p-cu", latex: "P_{\\text{cu}} = I^2R", meaning: "电枢铜耗", usedIn: ["3-4-2", "3-6-2"], tag: "损耗" },
  { id: "p-max", latex: "P_{\\max} = \\frac{V^2}{4R}", meaning: "理论最大输出功率", usedIn: ["3-4-6"], tag: "极值" },
  { id: "tau-em", latex: "\\tau = \\frac{RJ}{k^2}", meaning: "机电时间常数", usedIn: ["3-5", "3-5-1"], tag: "时间常数" },
  { id: "tau-arm", latex: "T_a = \\frac{L}{R}", meaning: "电枢时间常数", usedIn: ["3-5", "3-5-1"], tag: "时间常数" },
  { id: "phi-series", latex: "\\Phi \\propto I", meaning: "串励电机磁通随电流变化", usedIn: ["3-7-2"], tag: "串励" },
  { id: "t-series-i2", latex: "T \\propto I^2", meaning: "串励电机低饱和区转矩近似", usedIn: ["3-7-2"], tag: "串励" },
  { id: "t-series-vn", latex: "T \\propto \\left(\\frac{V}{n}\\right)^2", meaning: "串励近似转矩-转速关系", usedIn: ["3-7-2"], tag: "串励" },
  { id: "if-shunt", latex: "I_f = \\frac{V}{R_f}", meaning: "并励励磁电流", usedIn: ["3-7-1"], tag: "并励" },
  { id: "i-start", latex: "I_{\\text{start}} = \\frac{V}{R}", meaning: "起动时反电动势为零", usedIn: ["3-7", "3-10"], tag: "起动" }
];

export function getFormula(id: string): Formula {
  const formula = formulas.find((item) => item.id === id);
  if (!formula) {
    throw new Error(`Unknown formula: ${id}`);
  }
  return formula;
}
