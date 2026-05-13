import { NavLink } from "react-router-dom";
import { allSections } from "../data/chapter3";

type SidebarProps = {
  activeId?: string;
};

export function Sidebar({ activeId }: SidebarProps) {
  const active = allSections.find((section) => section.id === activeId);
  const links = allSections.map((section) => (
    <NavLink
      key={section.id}
      className={({ isActive }) =>
        isActive || activeId === section.id ? "sidebar__link is-active" : "sidebar__link"
      }
      to={section.route}
    >
      <span>{section.id}</span>
      <strong>{section.title.replace(/^3\.\d+(\.\d+)?\s*/, "")}</strong>
    </NavLink>
  ));

  return (
    <aside className="sidebar" aria-label="第 3 章小节导航">
      <div className="sidebar__desktop">
        <div className="sidebar__title">小节导航</div>
        <nav className="sidebar__nav">{links}</nav>
      </div>
      <details className="sidebar__mobile">
        <summary>小节导航：{active?.title ?? "本章"}</summary>
        <nav className="sidebar__nav">{links}</nav>
      </details>
    </aside>
  );
}
