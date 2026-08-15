import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { db } from "../storage/db";

interface AppStateValue {
  speechVariantByLanguage: Record<string, string>;
  setSpeechVariant: (languageCode: string, variantId: string) => void;
  welcomeDismissedByLanguage: Record<string, boolean>;
  dismissWelcome: (languageCode: string) => void;
}

const AppStateContext = createContext<AppStateValue | null>(null);

function readStoredMap<T>(key: string): Record<string, T> {
  try {
    return JSON.parse(localStorage.getItem(key) ?? "{}") as Record<string, T>;
  } catch {
    return {};
  }
}

function applySystemTheme(query: MediaQueryList) {
  const dark = query.matches;
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

export function AppStateProvider({ children }: PropsWithChildren) {
  const [speechVariantByLanguage, setSpeechVariantByLanguage] = useState<Record<string, string>>(() => {
    const stored = readStoredMap<string>("ll-speech-variants");
    const legacy = localStorage.getItem("ll-register");
    if (!stored.ja && (legacy === "formal" || legacy === "informal")) stored.ja = legacy;
    return stored;
  });
  const [welcomeDismissedByLanguage, setWelcomeDismissedByLanguage] = useState<Record<string, boolean>>(() => {
    const stored = readStoredMap<boolean>("ll-welcome-by-language");
    if (localStorage.getItem("ll-welcome") === "1") stored.ja = true;
    return stored;
  });

  useEffect(() => {
    const query = matchMedia("(prefers-color-scheme: dark)");
    const update = () => applySystemTheme(query);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  const value = useMemo<AppStateValue>(() => ({
    speechVariantByLanguage,
    setSpeechVariant: (languageCode, variantId) => {
      setSpeechVariantByLanguage((current) => {
        const next = { ...current, [languageCode]: variantId };
        localStorage.setItem("ll-speech-variants", JSON.stringify(next));
        return next;
      });
      void db.preferences.put({ key: `language:${languageCode}:speechVariant`, value: variantId });
    },
    welcomeDismissedByLanguage,
    dismissWelcome: (languageCode) => {
      setWelcomeDismissedByLanguage((current) => {
        const next = { ...current, [languageCode]: true };
        localStorage.setItem("ll-welcome-by-language", JSON.stringify(next));
        return next;
      });
      void db.preferences.put({ key: `language:${languageCode}:welcomeDismissed`, value: "true" });
    }
  }), [speechVariantByLanguage, welcomeDismissedByLanguage]);

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) throw new Error("useAppState must be used inside AppStateProvider");
  return context;
}
