import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { Navigate, Outlet, useParams } from "react-router-dom";
import { useAppState } from "../state/AppState";
import { db } from "../storage/db";
import { buildPackIndexes, getLanguageCatalogEntry, loadLanguagePack } from "./registry";
import type { LanguagePack, LanguagePackIndexes } from "./types";

interface LanguagePackContextValue {
  pack: LanguagePack;
  indexes: LanguagePackIndexes;
  variantId: string;
  setVariantId: (variantId: string) => void;
  welcomeDismissed: boolean;
  dismissWelcome: () => void;
  characterCalloutDismissed: boolean;
  dismissCharacterCallout: () => void;
  safetyKitDismissed: boolean;
  dismissSafetyKit: () => void;
}

const LanguagePackContext = createContext<LanguagePackContextValue | null>(null);

export function LanguagePackRoute() {
  const { languageCode } = useParams();
  const catalogEntry = getLanguageCatalogEntry(languageCode);
  const [pack, setPack] = useState<LanguagePack | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!catalogEntry) return;
    let cancelled = false;
    setPack(null);
    setError(false);
    void loadLanguagePack(catalogEntry.code)
      .then((loaded) => {
        if (cancelled) return;
        setPack(loaded);
        localStorage.setItem("ll-last-language", loaded.code);
        void db.preferences.put({ key: "activeLanguage", value: loaded.code });
      })
      .catch(() => !cancelled && setError(true));
    return () => {
      cancelled = true;
    };
  }, [catalogEntry]);

  if (!catalogEntry) return <Navigate to={`/?unknown=${encodeURIComponent(languageCode ?? "")}`} replace />;
  if (error) return <Navigate to={`/?error=${encodeURIComponent(catalogEntry.code)}`} replace />;
  if (!pack || pack.code !== catalogEntry.code) {
    return <div className="page route-loading" role="status"><span className="spinner" /> Loading language pack…</div>;
  }

  return <LanguagePackProvider pack={pack}><Outlet /></LanguagePackProvider>;
}

export function LanguagePackProvider({ pack, children }: PropsWithChildren<{ pack: LanguagePack }>) {
  const appState = useAppState();
  useEffect(() => {
    document.documentElement.lang = "en";
    document.documentElement.style.setProperty("--font-target", pack.targetFontFamily);
    document.documentElement.dataset.language = pack.code;
    return () => {
      document.documentElement.style.removeProperty("--font-target");
      delete document.documentElement.dataset.language;
    };
  }, [pack]);
  useEffect(() => {
    if (pack.presentation.speechVariantMode !== "primary-with-reference") return;
    try {
      const stored = JSON.parse(localStorage.getItem("ll-speech-variants") ?? "{}") as Record<string, string>;
      if (stored[pack.code]) {
        delete stored[pack.code];
        localStorage.setItem("ll-speech-variants", JSON.stringify(stored));
      }
      if (pack.code === "ja") localStorage.removeItem("ll-register");
    } catch {
      localStorage.removeItem("ll-speech-variants");
    }
    void db.preferences.delete(`language:${pack.code}:speechVariant`);
  }, [pack.code, pack.presentation.speechVariantMode]);
  const indexes = useMemo(() => buildPackIndexes(pack), [pack]);
  const storedVariant = appState.speechVariantByLanguage[pack.code];
  const variantId = pack.presentation.speechVariantMode === "primary-with-reference"
    ? pack.defaultSpeechVariantId
    : pack.speechVariants.some((variant) => variant.id === storedVariant)
    ? storedVariant
    : pack.defaultSpeechVariantId;
  const value: LanguagePackContextValue = {
    pack,
    indexes,
    variantId,
    setVariantId: (next) => appState.setSpeechVariant(pack.code, next),
    welcomeDismissed: Boolean(appState.welcomeDismissedByLanguage[pack.code]),
    dismissWelcome: () => appState.dismissWelcome(pack.code),
    characterCalloutDismissed: Boolean(appState.characterCalloutDismissedByLanguage[pack.code]),
    dismissCharacterCallout: () => appState.dismissCharacterCallout(pack.code),
    safetyKitDismissed: Boolean(appState.safetyKitDismissedByLanguage[pack.code]),
    dismissSafetyKit: () => appState.dismissSafetyKit(pack.code)
  };

  return <LanguagePackContext.Provider value={value}>{children}</LanguagePackContext.Provider>;
}

export function useLanguagePack() {
  const context = useContext(LanguagePackContext);
  if (!context) throw new Error("useLanguagePack must be used inside LanguagePackRoute");
  return context;
}

export function useOptionalLanguagePack() {
  return useContext(LanguagePackContext);
}
