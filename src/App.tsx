import { HashRouter, Link, Navigate, Route, Routes, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import DcMotorOverviewDemo from "./animations/DcMotorOverviewDemo";
import HandRuleDemo from "./animations/HandRuleDemo";
import TorqueProductionDemo from "./animations/TorqueProductionDemo";
import CommutatorRoleDemo from "./animations/CommutatorRoleDemo";
import CommutationProcessDemo from "./animations/CommutationProcessDemo";
import MotionEmfDemo from "./animations/MotionEmfDemo";
import EquivalentCircuitDemo from "./animations/EquivalentCircuitDemo";
import SteadyStateCurveDemo from "./animations/SteadyStateCurveDemo";
import NoLoadSpeedDemo from "./animations/NoLoadSpeedDemo";
import PerformanceCalculatorDemo from "./animations/PerformanceCalculatorDemo";
import LoadStepDemo from "./animations/LoadStepDemo";
import WeakFieldDemo from "./animations/WeakFieldDemo";
import ArmatureReactionDemo from "./animations/ArmatureReactionDemo";
import MaxPowerDemo from "./animations/MaxPowerDemo";
import TransientResponseDemo from "./animations/TransientResponseDemo";
import TimeConstantExplorer from "./animations/TimeConstantExplorer";
import FourQuadrantDemo from "./animations/FourQuadrantDemo";
import RegenerativeBrakingDemo from "./animations/RegenerativeBrakingDemo";
import DynamicBrakingDemo from "./animations/DynamicBrakingDemo";
import ShuntSeriesCompareDemo from "./animations/ShuntSeriesCompareDemo";
import ShuntMotorDemo from "./animations/ShuntMotorDemo";
import SeriesMotorDemo from "./animations/SeriesMotorDemo";
import UniversalMotorDemo from "./animations/UniversalMotorDemo";
import SelfExcitationDemo from "./animations/SelfExcitationDemo";
import MicroMotorDemo from "./animations/MicroMotorDemo";
import { Layout } from "./components/Layout";
import { StudyMode } from "./components/ModeToggle";
import { Sidebar } from "./components/Sidebar";
import { SectionCard } from "./components/SectionCard";
import { FormulaBlock } from "./components/FormulaBlock";
import { FormulaStrip } from "./components/FormulaStrip";
import { ConceptPill } from "./components/ConceptPill";
import { MiniConclusion } from "./components/MiniConclusion";
import { FoldableNote } from "./components/FoldableNote";
import { SpeakerNotes } from "./components/SpeakerNotes";
import { QuizCard } from "./components/QuizCard";
import { allSections, chapterSections, quizSection, SectionData } from "./data/chapter3";
import { getFormula } from "./data/formulas";
import { quizzes } from "./data/quizzes";
import { ArrowDefs, MotorSketch } from "./animations/shared";

const demos: Record<string, React.ComponentType> = {
  DcMotorOverviewDemo,
  HandRuleDemo,
  TorqueProductionDemo,
  CommutatorRoleDemo,
  CommutationProcessDemo,
  MotionEmfDemo,
  EquivalentCircuitDemo,
  SteadyStateCurveDemo,
  NoLoadSpeedDemo,
  PerformanceCalculatorDemo,
  LoadStepDemo,
  WeakFieldDemo,
  ArmatureReactionDemo,
  MaxPowerDemo,
  TransientResponseDemo,
  TimeConstantExplorer,
  FourQuadrantDemo,
  RegenerativeBrakingDemo,
  DynamicBrakingDemo,
  ShuntSeriesCompareDemo,
  ShuntMotorDemo,
  SeriesMotorDemo,
  UniversalMotorDemo,
  SelfExcitationDemo,
  MicroMotorDemo
};

function HeroMotor() {
  return (
    <div className="hero-visual" aria-label="简化直流电机动态图">
      <MotorSketch angle={28} current={1} phi={1} torque={1} labels={false} />
      <div className="hero-visual__tags">
        <span>磁通</span>
        <span>电流</span>
        <span>转矩</span>
      </div>
    </div>
  );
}

function CausalChain() {
  const [active, setActive] = useState("电枢电压 V");
  const nodes = [
    ["电枢电压 V", "端电压改变电流余量"],
    ["电枢电流 I", "电流直接形成转矩"],
    ["电磁转矩 T", "转矩推动机械运动"],
    ["转速 ω", "转速决定切割磁场速度"],
    ["反电动势 E", "E 会反过来限制电流"],
    ["影响电流 I", "闭环自调节形成"]
  ];

  return (
    <section className="home-section" aria-labelledby="chain-title">
      <div className="section-heading">
        <p className="eyebrow">Causal Chain</p>
        <h2 id="chain-title">直流电机因果链</h2>
      </div>
      <div className="causal-chain">
        <svg viewBox="0 0 900 210" role="img" aria-label="直流电机因果链总图">
          <ArrowDefs />
          {nodes.map(([node], index) => {
            const x = 80 + index * 145;
            return (
              <g key={node} onMouseEnter={() => setActive(node)} tabIndex={0} aria-label={node}>
                <rect x={x - 58} y="72" width="116" height="54" rx="16" className={active === node ? "chain-node is-active" : "chain-node"} />
                <text x={x} y="104" textAnchor="middle" className="chain-text">{node}</text>
                {index < nodes.length - 1 ? <line x1={x + 62} y1="99" x2={x + 83} y2="99" className="chain-arrow is-active" markerEnd="url(#arrow-green)" /> : null}
              </g>
            );
          })}
        </svg>
        <p>{nodes.find(([node]) => node === active)?.[1]}</p>
      </div>
    </section>
  );
}

function Home({ mode, onModeChange }: { mode: StudyMode; onModeChange: (mode: StudyMode) => void }) {
  return (
    <Layout mode={mode} onModeChange={onModeChange}>
      <main className="home">
        <section className="hero">
          <div className="hero__copy">
            <p className="eyebrow">Interactive Courseware</p>
            <h2>第 3 章：直流电机交互式学习系统</h2>
            <p>从转矩、反电动势、等效电路到四象限运行</p>
            <div className="hero__pills">
              <ConceptPill tone="green">转矩控制</ConceptPill>
              <ConceptPill tone="purple">反电动势</ConceptPill>
              <ConceptPill tone="blue">四象限运行</ConceptPill>
            </div>
            <Link className="hero__cta" to="/section/3-1">
              开始学习
              <ArrowRight size={18} />
            </Link>
          </div>
          <HeroMotor />
        </section>
        <section className="home-section" aria-labelledby="path-title">
          <div className="section-heading">
            <p className="eyebrow">Learning Path</p>
            <h2 id="path-title">全章学习路径</h2>
          </div>
          <div className="section-grid">
            {allSections.map((section) => (
              <SectionCard key={section.id} section={section} />
            ))}
          </div>
        </section>
        <FormulaStrip />
        <CausalChain />
      </main>
    </Layout>
  );
}

function FormulaPanel({ section, mode }: { section: SectionData; mode: StudyMode }) {
  const formulas = section.coreFormulas.map(getFormula);

  return (
    <aside className="formula-panel" aria-label="关键公式和参数">
      <div className="formula-panel__header">
        <p className="eyebrow">Key Panel</p>
        <h2>公式与参数</h2>
      </div>
      <div className="keyword-stack">
        {section.keywords.map((keyword, index) => (
          <ConceptPill key={keyword} tone={["blue", "red", "green", "purple"][index % 4] as "blue" | "red" | "green" | "purple"}>
            {keyword}
          </ConceptPill>
        ))}
      </div>
      <div className="formula-stack">
        {formulas.slice(0, 2).map((formula) => (
          <FormulaBlock key={formula.id} latex={formula.latex} meaning={formula.meaning} tag={formula.tag} />
        ))}
      </div>
      {mode === "study" ? (
        <FoldableNote title="公式解释" variant="formula">
          <ul className="compact-list">
            {formulas.map((formula) => (
              <li key={formula.id}>{formula.meaning}</li>
            ))}
          </ul>
        </FoldableNote>
      ) : null}
    </aside>
  );
}

function StudyNotes({ section }: { section: SectionData }) {
  return (
    <section className="notes-area" aria-label="折叠学习材料">
      <FoldableNote title="展开讲义">
        <div className="brief-grid">
          {section.briefConcepts.map((concept) => (
            <article key={concept.title}>
              <strong>{concept.title}</strong>
              <p>{concept.oneLine}</p>
            </article>
          ))}
        </div>
      </FoldableNote>
      {section.cautionNotes?.length ? (
        <FoldableNote title="注意事项" variant="mistake">
          <ul className="caution-list">
            {section.cautionNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </FoldableNote>
      ) : null}
      <FoldableNote title="易错点" variant="mistake">
        <ul className="mistake-list">
          {section.commonMistakes.map((mistake) => (
            <li key={mistake.wrong}>
              <span>误：{mistake.wrong}</span>
              <strong>正：{mistake.correct}</strong>
            </li>
          ))}
        </ul>
      </FoldableNote>
      <SpeakerNotes notes={section.speakerNotes} />
    </section>
  );
}

function QuizCenter({ mode }: { mode: StudyMode }) {
  return (
    <div className="quiz-center">
      <div className="quiz-center__header">
        <h2>练习中心</h2>
        <p>短题、短选项、点击反馈</p>
      </div>
      <div className="quiz-grid">
        {quizzes.map((quiz) => (
          <QuizCard key={quiz.id} quiz={quiz} />
        ))}
      </div>
      {mode === "lecture" ? <p className="quiet-hint">讲解模式下建议只展示题干和答案反馈。</p> : null}
    </div>
  );
}

function SectionPage({ mode, onModeChange }: { mode: StudyMode; onModeChange: (mode: StudyMode) => void }) {
  const params = useParams();
  const section = useMemo(() => allSections.find((item) => item.id === params.id), [params.id]);

  if (!section) {
    return <Navigate to="/" replace />;
  }

  const Demo = demos[section.demo];

  return (
    <Layout title={section.title} subtitle={section.subtitle} mode={mode} onModeChange={onModeChange}>
      <main className="lesson-layout">
        <Sidebar activeId={section.id} />
        <section className="lesson-main" aria-labelledby="lesson-question">
          <div className="question-card">
            <p className="eyebrow">Core Question</p>
            <h2 id="lesson-question">{section.bigQuestion}</h2>
          </div>
          {section.id === quizSection.id ? <QuizCenter mode={mode} /> : Demo ? <Demo /> : null}
        </section>
        <FormulaPanel section={section} mode={mode} />
        <div className="lesson-bottom">
          <MiniConclusion items={section.takeaways} />
          {mode === "study" ? <StudyNotes section={section} /> : null}
        </div>
      </main>
    </Layout>
  );
}

export default function App() {
  const [mode, setMode] = useState<StudyMode>("lecture");

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home mode={mode} onModeChange={setMode} />} />
        <Route path="/section/:id" element={<SectionPage mode={mode} onModeChange={setMode} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
