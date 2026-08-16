import type { PropsWithChildren, ReactNode } from "react";
import { RegisterSwitch } from "./RegisterSwitch";

export function ScreenHeader({
  title,
  description,
  leading,
  actions,
  showRegister = true,
  children
}: PropsWithChildren<{
  title: string;
  description?: string;
  leading?: ReactNode;
  actions?: ReactNode;
  showRegister?: boolean;
}>) {
  return (
    <header className={`screen-header${leading ? " screen-header--with-leading" : ""}`}>
      {leading ? <div className="screen-header__leading">{leading}</div> : null}
      <div className="screen-header__text">
        <h1>{title}</h1>
        {description ? <p>{description}</p> : null}
        {children}
      </div>
      <div className="screen-header__actions">
        {actions}
        {showRegister ? <RegisterSwitch compact /> : null}
      </div>
    </header>
  );
}
