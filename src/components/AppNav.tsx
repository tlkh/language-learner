import { BarChart3, BookOpen, Library, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/learn", label: "Learn", Icon: BookOpen },
  { to: "/topics", label: "Topics", Icon: Library },
  { to: "/progress", label: "Progress", Icon: BarChart3 },
  { to: "/settings", label: "Settings", Icon: Settings }
];

export function AppNav() {
  return (
    <>
      <nav className="desktop-nav" aria-label="Primary">
        <NavLink to="/learn" className="wordmark" aria-label="Language Learner home">
          <span className="wordmark__mark" lang="ja">あ</span>
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
