export type Quiz = {
  id: string;
  type: "formula" | "state" | "calculation" | "quadrant";
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
  detail: string[];
};

export const quizzes: Quiz[] = [
  {
    id: "q-state-1",
    type: "state",
    prompt: "V=200V，E=240V，R>0，此时？",
    options: ["电动运行", "理想空载", "再生发电"],
    answer: 2,
    explanation: "E 大于 V，电流反向，机械能可回馈。",
    detail: ["I=(V-E)/R 为负。", "若转速仍为正，则转矩反向，表现为制动。"]
  },
  {
    id: "q-start-1",
    type: "calculation",
    prompt: "V=120V，R=2Ω，起动电流为？",
    options: ["30A", "60A", "240A"],
    answer: 1,
    explanation: "起动时 E≈0，所以 I=V/R=60A。",
    detail: ["起动瞬间转速为零。", "反电动势 E=kω 也近似为零。"]
  },
  {
    id: "q-torque-1",
    type: "formula",
    prompt: "恒磁通时，转矩与哪项成正比？",
    options: ["电枢电流", "电枢电阻", "机械损耗"],
    answer: 0,
    explanation: "恒磁通下 T=kI，电流直接决定转矩。",
    detail: ["k 已包含磁通影响。", "若弱磁，k 会随磁通改变。"]
  },
  {
    id: "q-quadrant-1",
    type: "quadrant",
    prompt: "ω>0，T<0，运行状态是？",
    options: ["正转电动", "正转制动", "反转电动"],
    answer: 1,
    explanation: "转速与转矩异号，机械能被取走。",
    detail: ["位于第二象限。", "若能量回到电源，就是再生制动。"]
  },
  {
    id: "q-field-1",
    type: "state",
    prompt: "磁通减小，最高转速和最大转矩如何变？",
    options: ["转速升，转矩降", "转速降，转矩升", "都升高"],
    answer: 0,
    explanation: "弱磁可升速，但同电流转矩下降。",
    detail: ["空载速度约为 V/(K_EΦ)。", "转矩约为 K_TΦI。"]
  }
];
