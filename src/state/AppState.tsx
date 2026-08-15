import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import type { Register } from "../content/types";
import { db } from "../storage/db";

interface AppStateValue {
  register: Register;
  setRegister: (register: Register) => void;
  welcomeDismissed: boolean;
  dismissWelcome: () => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

const storedRegister = (): Register => (localStorage.getItem("ll-register") === "informal" ? "informal" : "formal");
function applySystemTheme(query: MediaQueryList) {
  const dark = query.matches;
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

export function AppStateProvider({ children }: PropsWithChildren) {
  const [register, setRegisterState] = useState<Register>(storedRegister);
  const [welcomeDismissed, setWelcomeDismissed] = useState(localStorage.getItem("ll-welcome") === "1");

  useEffect(() => {
    const query = matchMedia("(prefers-color-scheme: dark)");
    const update = () => applySystemTheme(query);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const value = useMemo<AppStateValue>(
    () => ({
      register,
      setRegister: (next) => {
        setRegisterState(next);
        localStorage.setItem("ll-register", next);
        void db.preferences.put({ key: "register", value: next });
      },
      welcomeDismissed,
      dismissWelcome: () => {
        setWelcomeDismissed(true);
        localStorage.setItem("ll-welcome", "1");
        void db.preferences.put({ key: "welcomeDismissed", value: "true" });
      }
    }),
    [register, welcomeDismissed]
  );

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error("useAppState must be used inside AppStateProvider");
  return context;
}
