import { BarChart3, BookOpen, Languages, Library, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useLanguagePack } from "../languages/LanguagePackContext";

export function AppNav() {
  const { pack } = useLanguagePack();
  const base = `/${pack.code}`;
  const links = [
    { to: `${base}/learn`, label: "Learn", Icon: BookOpen },
    { to: `${base}/characters`, label: pack.characterCourse.navLabel, Icon: Languages },
    { to: `${base}/topics`, label: "Topics", Icon: Library },
    { to: `${base}/progress`, label: "Progress", Icon: BarChart3 },
    { to: `${base}/settings`, label: "Settings", Icon: Settings }
  ];
  return (
    <>
      <nav className="desktop-nav" aria-label="Primary">
        <NavLink to={`${base}/learn`} className="wordmark" aria-label={`${pack.name} learning home`}>
          <span className="wordmark__mark" lang={pack.locale}>{pack.mark}</span>
          <span>Language Learner</span>
        </NavLink>
        <div className="desktop-nav__links">
          {links.map(({ to, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => (isActive ? "is-active" : undefined)}>
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
      <div className="mobile-nav-backdrop" aria-hidden="true" />
      <nav className="mobile-nav" aria-label="Primary">
        {links.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => (isActive ? "is-active" : undefined)}>
            <Icon aria-hidden="true" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
