import { Home } from "lucide-react";
import { Link } from "react-router-dom";
import { ModeToggle, StudyMode } from "./ModeToggle";

type HeaderProps = {
  title?: string;
  subtitle?: string;
  mode: StudyMode;
  onModeChange: (mode: StudyMode) => void;
};

export function Header({ title, subtitle, mode, onModeChange }: HeaderProps) {
  return (
    <header className="app-header">
      <div>
        <p className="eyebrow">DC Motor Chapter 3</p>
        <h1>{title ?? "第 3 章：直流电机交互式学习系统"}</h1>
        {subtitle ? <p className="header-subtitle">{subtitle}</p> : null}
      </div>
      <div className="header-actions">
        <ModeToggle mode={mode} onChange={onModeChange} />
        <Link className="icon-link" to="/" title="返回首页" aria-label="返回首页">
          <Home size={19} />
        </Link>
      </div>
    </header>
  );
}
