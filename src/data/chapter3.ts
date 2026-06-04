export type FormulaRef = {
  id: string;
};

export type SectionData = {
  id: string;
  title: string;
  subtitle: string;
  route: string;
  bigQuestion: string;
  keywords: string[];
  coreFormulas: string[];
  demo: string;
  takeaways: string[];
  briefConcepts: {
    title: string;
    oneLine: string;
  }[];
  speakerNotes: string[];
  cautionNotes?: string[];
  commonMistakes: {
    wrong: string;
    correct: string;
  }[];
};

const mistakes = {
  direction: { wrong: "只看电压正负判断运行", correct: "要同时看 E、I、T 与转速" },
  noLoad: { wrong: "串励电机可以空载试车", correct: "串励空载有飞车风险" },
  formula: { wrong: "把 k 当作固定万能常数", correct: "k 与磁通条件绑定" }
};

export const chapterSections: SectionData[] = [
  {
    id: "3-1",
    title: "3.1 简介",
    subtitle: "直流电机的结构入口",
    route: "/section/3-1",
    bigQuestion: "直流电机由哪些关键部件完成能量转换？",
    keywords: ["励磁", "电枢", "换向器", "电刷"],
    coreFormulas: ["t-kt-phi-i", "e-ke-phi-n"],
    demo: "DcMotorOverviewDemo",
    takeaways: ["励磁建立磁场", "电枢电流产生转矩", "换向器带来维护问题"],
    briefConcepts: [
      { title: "励磁", oneLine: "建立主磁通，提供力的环境" },
      { title: "电枢", oneLine: "承载电流，参与能量转换" },
      { title: "换向器", oneLine: "机械整流，维持转矩方向" }
    ],
    speakerNotes: ["直流电机适合作为入门模型，因为转矩、电流、速度之间的因果链非常直观。", "电刷和换向器让控制简单，但也带来磨损、火花和维护需求。"],
    commonMistakes: [mistakes.formula]
  },
  {
    id: "3-1-1",
    title: "3.1.1 左右手定则",
    subtitle: "电动机与发电机的判向工具",
    route: "/section/3-1-1",
    bigQuestion: "什么时候用左手，什么时候用右手？",
    keywords: ["左手定则", "右手定则", "磁场", "电流方向"],
    coreFormulas: ["f-bil", "e-ke-phi-n"],
    demo: "HandRuleDemo",
    takeaways: ["左手判断电磁力", "右手判断感应电势", "先定 B 再定方向"],
    briefConcepts: [
      { title: "左手", oneLine: "用于电动机：B 与 I 决定 F" },
      { title: "右手", oneLine: "用于发电机：v 与 B 决定 E" },
      { title: "磁场", oneLine: "外磁场方向默认从 N 指向 S" }
    ],
    speakerNotes: [
      "先让学生只记用途：左手看电流受力，右手看运动感应。",
      "讲电动机时不要混入右手定则；讲反电动势时再切到右手定则。",
      "点表示电流或电势出纸面，叉表示入纸面。"
    ],
    commonMistakes: [
      { wrong: "电动机转矩用右手判", correct: "载流导体受力用左手定则" },
      { wrong: "看到导体运动就用左手", correct: "运动感应电势用右手定则" }
    ]
  },
  {
    id: "3-2",
    title: "3.2 转矩产生机理",
    subtitle: "从载流导体到电磁转矩",
    route: "/section/3-2",
    bigQuestion: "为什么电枢电流会变成旋转转矩？",
    keywords: ["磁通", "电枢电流", "力方向", "转矩"],
    coreFormulas: ["f-bil", "t-kt-phi-i", "t-kt-i"],
    demo: "TorqueProductionDemo",
    takeaways: ["磁通和电流缺一不可", "电流方向决定转矩方向", "恒磁通时转矩正比电流"],
    briefConcepts: [
      { title: "力", oneLine: "导体受力方向由磁场和电流决定" },
      { title: "力偶", oneLine: "两侧导体形成旋转力矩" },
      { title: "比例关系", oneLine: "磁通固定时，T 与 I 同步变化" }
    ],
    speakerNotes: ["课堂上可先固定磁通，只改变电流方向，让学生观察转矩符号翻转。"],
    commonMistakes: [mistakes.formula]
  },
  {
    id: "3-2-1",
    title: "3.2.1 换向器的作用",
    subtitle: "半周后仍保持同向转矩",
    route: "/section/3-2-1",
    bigQuestion: "转子转过半圈后，转矩为何不反向？",
    keywords: ["换向器", "电刷", "同向转矩"],
    coreFormulas: ["t-kt-phi-i"],
    demo: "CommutatorRoleDemo",
    takeaways: ["换向器自动换接线圈", "电刷位置固定", "目标是维持转矩方向"],
    briefConcepts: [
      { title: "无换向", oneLine: "线圈电流不换向，转矩会交替" },
      { title: "有换向", oneLine: "半周换接，端部电流翻转" }
    ],
    speakerNotes: ["强调换向器不是额外提供能量，而是改变连接关系。"],
    commonMistakes: [{ wrong: "换向器产生转矩", correct: "转矩来自磁场和电流作用" }]
  },
  {
    id: "3-2-2",
    title: "3.2.2 换向器的工作原理",
    subtitle: "电流反转的短暂过程",
    route: "/section/3-2-2",
    bigQuestion: "为什么换向过程会出现火花？",
    keywords: ["短接", "电感", "火花", "换向极"],
    coreFormulas: ["v-dynamic"],
    demo: "CommutationProcessDemo",
    takeaways: ["电感阻碍换向", "换向不良会火花", "换向极帮助电流反转"],
    briefConcepts: [
      { title: "换向时间", oneLine: "转速越高，允许时间越短" },
      { title: "电感", oneLine: "电流不能突变，易滞后" },
      { title: "换向极", oneLine: "补偿电势，帮助过渡" }
    ],
    speakerNotes: ["火花可作为换向不完全的视觉信号，不必展开复杂电磁推导。"],
    commonMistakes: [{ wrong: "火花只由电压高造成", correct: "换向滞后和接触状态也关键" }]
  },
  {
    id: "3-3",
    title: "3.3 运动电动势",
    subtitle: "转速带来的反向电压",
    route: "/section/3-3",
    bigQuestion: "电机转起来后为什么会反抗电源？",
    keywords: ["反电动势", "切割磁场", "机械整流"],
    coreFormulas: ["e-ke-phi-n", "e-ke-w"],
    demo: "MotionEmfDemo",
    takeaways: ["转起来才有反电动势", "磁通越强，E 越大", "转速越高，E 越大"],
    briefConcepts: [
      { title: "导体运动", oneLine: "切割磁场产生感应电势" },
      { title: "端口表现", oneLine: "电刷端看到近似直流" }
    ],
    cautionNotes: [
      "转子导体有感应电动势，转子铁心本身也会感应电动势。",
      "相邻转子齿电势方向相反，导电铁心中会形成涡流。",
      "铁心用绝缘薄硅钢片叠压，可减少涡流发热和制动转矩。",
      "薄片通常小于 1mm，目的不是承力，而是切断涡流通路。"
    ],
    speakerNotes: ["可将换向器解释为机械整流器，把内部交变电势变成端口直流。"],
    commonMistakes: [{ wrong: "静止时也有反电动势", correct: "静止时 E 近似为零" }]
  },
  {
    id: "3-3-1",
    title: "3.3.1 等效电路",
    subtitle: "V、E、R、L 的端口模型",
    route: "/section/3-3-1",
    bigQuestion: "电压差如何决定电枢电流？",
    keywords: ["等效电路", "电压差", "再生"],
    coreFormulas: ["v-dynamic", "v-steady", "i-ve-r"],
    demo: "EquivalentCircuitDemo",
    takeaways: ["V 与 E 的差决定电流", "E 反抗外加电压", "E > V 时能量回馈"],
    briefConcepts: [
      { title: "电动", oneLine: "V 大于 E，电源送能" },
      { title: "再生", oneLine: "E 大于 V，机械能回馈" }
    ],
    speakerNotes: ["用 I=(V-E)/R 统一解释电动、空载、发电三个状态。"],
    commonMistakes: [mistakes.direction]
  },
  {
    id: "3-4",
    title: "3.4 稳态性能",
    subtitle: "转矩-转速直线",
    route: "/section/3-4",
    bigQuestion: "负载改变时速度为什么下跌？",
    keywords: ["稳态", "机械特性", "工作点"],
    coreFormulas: ["w-load", "t-ki", "e-kw"],
    demo: "SteadyStateCurveDemo",
    takeaways: ["电压决定空载转速", "负载决定电枢电流", "电阻越大，转速跌落越大"],
    briefConcepts: [
      { title: "空载截距", oneLine: "主要由 V/k 决定" },
      { title: "斜率", oneLine: "由 R/k² 决定速度跌落" }
    ],
    speakerNotes: ["把机械特性看作电路方程与转矩方程合并后的结果。"],
    commonMistakes: [mistakes.formula]
  },
  {
    id: "3-4-1",
    title: "3.4.1 空载转速",
    subtitle: "V 约等于 E 的极限状态",
    route: "/section/3-4-1",
    bigQuestion: "为什么弱磁会升速？",
    keywords: ["空载", "弱磁", "限速"],
    coreFormulas: ["n-no-load", "w-v-k"],
    demo: "NoLoadSpeedDemo",
    takeaways: ["空载时 V≈E", "电压升高，转速升高", "弱磁会升速"],
    briefConcepts: [
      { title: "电压", oneLine: "电压越高，目标速度越高" },
      { title: "磁通", oneLine: "磁通越小，同一 E 需更高速度" }
    ],
    speakerNotes: ["弱磁升速必须与机械限速和换向能力一起讨论。"],
    commonMistakes: [{ wrong: "弱磁总是安全升速", correct: "弱磁会降低最大转矩并带来超速风险" }]
  },
  {
    id: "3-4-2",
    title: "3.4.2 性能计算示例",
    subtitle: "从电压电流到效率",
    route: "/section/3-4-2",
    bigQuestion: "输入功率如何分配到损耗和输出？",
    keywords: ["铜耗", "转换功率", "效率"],
    coreFormulas: ["p-cu", "p-conv", "p-mech"],
    demo: "PerformanceCalculatorDemo",
    takeaways: ["V-E 很小但很关键", "铜耗等于 I²R", "输出需扣除损耗"],
    briefConcepts: [
      { title: "输入", oneLine: "电源功率为 VI" },
      { title: "铜耗", oneLine: "电枢电阻消耗 I²R" },
      { title: "输出", oneLine: "转换功率扣除机械损耗" }
    ],
    speakerNotes: ["避免长例题，把计算拆成仪表盘式步骤。"],
    commonMistakes: [{ wrong: "把 EI 直接当轴输出", correct: "轴输出还要扣除机械损耗" }]
  },
  {
    id: "3-4-3",
    title: "3.4.3 负载运行",
    subtitle: "负载阶跃后的自调节",
    route: "/section/3-4-3",
    bigQuestion: "负载突然增加后电机如何找到新平衡？",
    keywords: ["负载阶跃", "反电动势", "自调节"],
    coreFormulas: ["i-ve-r", "w-load"],
    demo: "LoadStepDemo",
    takeaways: ["负载增加先使电机减速", "E 下降使电流上升", "电流上升带来更大转矩"],
    briefConcepts: [
      { title: "第一步", oneLine: "机械负载先拉低转速" },
      { title: "反馈", oneLine: "E 下降让 I 自动上升" }
    ],
    speakerNotes: ["这是直流电机自然负反馈的核心演示。"],
    commonMistakes: [mistakes.direction]
  },
  {
    id: "3-4-4",
    title: "3.4.4 额定转速和弱磁",
    subtitle: "恒转矩区与恒功率区",
    route: "/section/3-4-4",
    bigQuestion: "高于额定转速时为什么要弱磁？",
    keywords: ["额定点", "弱磁", "恒功率"],
    coreFormulas: ["t-kt-phi-i", "p-mech"],
    demo: "WeakFieldDemo",
    takeaways: ["低速靠调电压", "高速靠弱磁", "弱磁牺牲转矩"],
    briefConcepts: [
      { title: "低速", oneLine: "电压可调，电流限转矩" },
      { title: "高速", oneLine: "电压到顶后只能减磁通" }
    ],
    speakerNotes: ["强调弱磁不是免费升速，它会降低 k 和可用转矩。"],
    commonMistakes: [{ wrong: "弱磁后转矩不变", correct: "同样电流下转矩会下降" }]
  },
  {
    id: "3-4-5",
    title: "3.4.5 电枢反应",
    subtitle: "电枢磁场扭曲主磁场",
    route: "/section/3-4-5",
    bigQuestion: "电枢电流为什么会影响主磁场？",
    keywords: ["电枢反应", "磁场畸变", "饱和"],
    coreFormulas: ["t-kt-phi-i"],
    demo: "ArmatureReactionDemo",
    takeaways: ["电枢电流也产生磁场", "它会畸变主磁场", "饱和时影响更明显"],
    briefConcepts: [
      { title: "畸变", oneLine: "气隙磁密分布不再对称" },
      { title: "饱和", oneLine: "一侧增强受限，等效磁通下降" }
    ],
    speakerNotes: ["不需要推磁路方程，只需说明它改变有效磁通和换向条件。"],
    commonMistakes: [{ wrong: "电枢只负责导电", correct: "电枢电流也会产生磁场" }]
  },
  {
    id: "3-4-6",
    title: "3.4.6 最大输出功率",
    subtitle: "理论极值与实际限制",
    route: "/section/3-4-6",
    bigQuestion: "为什么半空载转速附近功率最大？",
    keywords: ["最大功率", "堵转", "热限制"],
    coreFormulas: ["p-max", "p-mech"],
    demo: "MaxPowerDemo",
    takeaways: ["空载功率为零", "堵转功率为零", "半空载转速附近功率最大"],
    briefConcepts: [
      { title: "理论点", oneLine: "E=V/2 时转换功率最大" },
      { title: "实际限制", oneLine: "电流和发热不允许长期运行" }
    ],
    speakerNotes: ["最大功率点常有大电流，课堂上必须标注不宜长期运行。"],
    commonMistakes: [{ wrong: "最大功率点适合长期额定", correct: "额定点由热和效率共同限制" }]
  },
  {
    id: "3-5",
    title: "3.5 瞬态过程",
    subtitle: "电流与转速的阶跃响应",
    route: "/section/3-5",
    bigQuestion: "为什么电机不能瞬间到达新速度？",
    keywords: ["阶跃响应", "电枢时间常数", "机电时间常数"],
    coreFormulas: ["tau-em", "tau-arm", "v-dynamic"],
    demo: "TransientResponseDemo",
    takeaways: ["电流不能瞬间变", "转速不能瞬间变", "4～5τ 后近似稳定"],
    briefConcepts: [
      { title: "电气惯性", oneLine: "L 让电流变化有斜率限制" },
      { title: "机械惯性", oneLine: "J 让转速变化有滞后" }
    ],
    speakerNotes: ["用同一时间轴比较电流快过程和转速慢过程。"],
    commonMistakes: [{ wrong: "稳态公式能描述刚起动瞬间", correct: "瞬态需包含 L 和 J" }]
  },
  {
    id: "3-5-1",
    title: "3.5.1 动态响应和时间常数",
    subtitle: "参数如何改变响应速度",
    route: "/section/3-5-1",
    bigQuestion: "哪些参数让响应变快或变慢？",
    keywords: ["J", "L", "k", "时间常数"],
    coreFormulas: ["tau-em", "tau-arm"],
    demo: "TimeConstantExplorer",
    takeaways: ["J 越大，响应越慢", "L 越大，电流越慢", "k 越大，耦合越强"],
    briefConcepts: [
      { title: "机械", oneLine: "惯量大，速度响应慢" },
      { title: "电气", oneLine: "电感大，电流响应慢" }
    ],
    speakerNotes: ["让学生拖动 J 和 L，分别观察两条响应曲线。"],
    commonMistakes: [{ wrong: "所有时间常数含义相同", correct: "电气和机电时间常数描述不同过程" }]
  },
  {
    id: "3-6",
    title: "3.6 四象限运行和再生制动",
    subtitle: "转矩与转速符号决定能量方向",
    route: "/section/3-6",
    bigQuestion: "如何一眼判断电动还是制动？",
    keywords: ["四象限", "再生", "制动"],
    coreFormulas: ["p-mech", "i-ve-r"],
    demo: "FourQuadrantDemo",
    takeaways: ["转速和转矩同号是电动", "转速和转矩异号是制动", "再生需要能量接收端"],
    briefConcepts: [
      { title: "电动", oneLine: "T 与 ω 同号，机械功率为正" },
      { title: "制动", oneLine: "T 与 ω 异号，机械能被取走" }
    ],
    speakerNotes: ["把四象限作为后续再生、能耗制动的统一地图。"],
    commonMistakes: [mistakes.direction]
  },
  {
    id: "3-6-1",
    title: "3.6.1 全速再生制动",
    subtitle: "降低端电压引起电流反向",
    route: "/section/3-6-1",
    bigQuestion: "怎样让动能回到电源？",
    keywords: ["E>V", "电流反向", "能量回馈"],
    coreFormulas: ["i-ve-r", "p-conv"],
    demo: "RegenerativeBrakingDemo",
    takeaways: ["E > V 时电流反向", "电机变成发电机", "动能回到电源"],
    briefConcepts: [
      { title: "触发", oneLine: "端电压低于反电动势" },
      { title: "前提", oneLine: "电源或电池能接收能量" }
    ],
    speakerNotes: ["再生不是简单刹车电阻，它需要电能接收路径。"],
    commonMistakes: [{ wrong: "所有电源都能吸收再生能量", correct: "需要可回馈或可充电端" }]
  },
  {
    id: "3-6-2",
    title: "3.6.2 能耗制动",
    subtitle: "动能变成电阻热",
    route: "/section/3-6-2",
    bigQuestion: "没有回馈电源时如何制动？",
    keywords: ["制动电阻", "热量", "非节能"],
    coreFormulas: ["p-cu"],
    demo: "DynamicBrakingDemo",
    takeaways: ["电机发电", "电阻耗能", "简单但不节能"],
    briefConcepts: [
      { title: "连接", oneLine: "电枢接入制动电阻" },
      { title: "能量", oneLine: "机械能最终变成热" }
    ],
    speakerNotes: ["能耗制动结构简单，适合说明能量去向。"],
    commonMistakes: [{ wrong: "能耗制动把能量送回电源", correct: "能量主要在电阻中耗散" }]
  },
  {
    id: "3-7",
    title: "3.7 并励和串励直流电机",
    subtitle: "两类励磁连接的性格差异",
    route: "/section/3-7",
    bigQuestion: "并励和串励为何表现差异很大？",
    keywords: ["并励", "串励", "恒速", "大转矩"],
    coreFormulas: ["if-shunt", "phi-series", "i-start"],
    demo: "ShuntSeriesCompareDemo",
    takeaways: ["并励适合恒速", "串励起动转矩大", "串励禁止空载"],
    briefConcepts: [
      { title: "并励", oneLine: "励磁支路近似独立" },
      { title: "串励", oneLine: "磁通随负载电流变化" }
    ],
    speakerNotes: ["两种电机的核心差异是磁通是否随电枢电流强烈变化。"],
    commonMistakes: [mistakes.noLoad]
  },
  {
    id: "3-7-1",
    title: "3.7.1 并励稳态性能",
    subtitle: "近似恒磁通的稳态特性",
    route: "/section/3-7-1",
    bigQuestion: "并励电机为什么近似恒速？",
    keywords: ["并励", "励磁电流", "恒速"],
    coreFormulas: ["if-shunt", "w-load"],
    demo: "ShuntMotorDemo",
    takeaways: ["励磁近似恒定", "转速随负载略降", "可弱磁升速"],
    briefConcepts: [
      { title: "励磁", oneLine: "由 V/Rf 决定，变化较小" },
      { title: "速度", oneLine: "负载增加仅带来轻微跌落" }
    ],
    speakerNotes: ["并励电机适合作为恒速驱动的基准案例。"],
    commonMistakes: [{ wrong: "并励完全不掉速", correct: "电枢电阻仍会造成速度跌落" }]
  },
  {
    id: "3-7-2",
    title: "3.7.2 串励稳态性能",
    subtitle: "大起动转矩与空载风险",
    route: "/section/3-7-2",
    bigQuestion: "串励电机为何低速转矩很大？",
    keywords: ["串励", "I²转矩", "飞车"],
    coreFormulas: ["phi-series", "t-series-i2", "t-series-vn"],
    demo: "SeriesMotorDemo",
    takeaways: ["电流越大磁通越强", "起动转矩很大", "空载可能飞车"],
    briefConcepts: [
      { title: "低饱和", oneLine: "磁通随电流近似线性上升" },
      { title: "空载", oneLine: "负载小会导致速度显著升高" }
    ],
    speakerNotes: ["空载禁止要作为安全规则突出呈现。"],
    commonMistakes: [mistakes.noLoad]
  },
  {
    id: "3-7-3",
    title: "3.7.3 通用电机",
    subtitle: "串励结构的交直流两用",
    route: "/section/3-7-3",
    bigQuestion: "交流供电时转矩为何仍同向？",
    keywords: ["通用电机", "交流", "高速"],
    coreFormulas: ["phi-series", "t-series-i2"],
    demo: "UniversalMotorDemo",
    takeaways: ["串励可交直流两用", "电流反向磁通也反向", "小型高速应用常见"],
    briefConcepts: [
      { title: "同步反向", oneLine: "I 与 Φ 同时反向，T 仍同向" },
      { title: "应用", oneLine: "常见于小功率高速场景" }
    ],
    speakerNotes: ["用波形说明两个负号相乘后转矩仍为正。"],
    commonMistakes: [{ wrong: "电流反向一定导致转矩反向", correct: "串励中磁通也同步反向" }]
  },
  {
    id: "3-8",
    title: "3.8 自励直流电机",
    subtitle: "剩磁、磁化曲线与工作点",
    route: "/section/3-8",
    bigQuestion: "自励电机为什么需要剩磁？",
    keywords: ["自励", "剩磁", "磁化曲线"],
    coreFormulas: ["if-shunt"],
    demo: "SelfExcitationDemo",
    takeaways: ["剩磁是起点", "电阻线决定工作点", "电阻过大不能自励"],
    briefConcepts: [
      { title: "剩磁", oneLine: "提供最初的小电压" },
      { title: "交点", oneLine: "磁化曲线与电阻线相交" }
    ],
    speakerNotes: ["把自励看作正反馈建立电压，电阻线太陡会失败。"],
    commonMistakes: [{ wrong: "无剩磁也能自然建压", correct: "没有初始磁通就难以起励" }]
  },
  {
    id: "3-9",
    title: "3.9 微型电机",
    subtitle: "低成本永磁直流电机",
    route: "/section/3-9",
    bigQuestion: "小电机为什么常有转矩脉动？",
    keywords: ["永磁", "槽数", "斜槽", "脉动"],
    coreFormulas: ["t-ki", "e-kw"],
    demo: "MicroMotorDemo",
    takeaways: ["成本优先", "槽数少，转矩脉动大", "高速运行可减弱脉动影响"],
    briefConcepts: [
      { title: "槽数", oneLine: "槽数少，空间谐波更明显" },
      { title: "斜槽", oneLine: "可降低定位转矩" }
    ],
    speakerNotes: ["以玩具电机作为直观例子，说明工程取舍。"],
    commonMistakes: [{ wrong: "微型电机原理不同", correct: "核心方程仍是 T=kI 与 E=kω" }]
  }
];

export const quizSection: SectionData = {
  id: "3-10",
  title: "3.10 习题",
  subtitle: "短题快练与状态判断",
  route: "/section/3-10",
  bigQuestion: "能否用公式快速判断工作状态？",
  keywords: ["公式选择", "状态判断", "四象限"],
  coreFormulas: ["i-ve-r", "i-start", "t-ki", "p-mech"],
  demo: "QuizCenter",
  takeaways: ["先判方向", "再代公式", "最后查能量流"],
  briefConcepts: [
    { title: "判断", oneLine: "V、E、R 先决定电流方向" },
    { title: "象限", oneLine: "ω 和 T 的符号决定运行区" }
  ],
  speakerNotes: ["习题中心只给短反馈，详细推导默认折叠。"],
  commonMistakes: [mistakes.direction, mistakes.noLoad]
};

export const allSections = [...chapterSections, quizSection];
