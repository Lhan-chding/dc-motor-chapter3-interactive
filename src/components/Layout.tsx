import { ReactNode } from "react";
import { Header } from "./Header";
import { StudyMode } from "./ModeToggle";

type LayoutProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  mode: StudyMode;
  onModeChange: (mode: StudyMode) => void;
};

export function Layout({ children, title, subtitle, mode, onModeChange }: LayoutProps) {
  return (
    <div className="app-shell">
      <Header title={title} subtitle={subtitle} mode={mode} onModeChange={onModeChange} />
      {children}
    </div>
  );
}
