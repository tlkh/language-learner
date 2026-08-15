import type { PropsWithChildren, ReactNode } from "react";
import { RegisterSwitch } from "./RegisterSwitch";

export function ScreenHeader({
  title,
  description,
  actions,
  showRegister = true,
  children
}: PropsWithChildren<{
  title: string;
  description?: string;
  actions?: ReactNode;
  showRegister?: boolean;
}>) {
  return (
    <header className="screen-header">
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
