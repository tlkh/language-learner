import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from "react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { checkForAppUpdate } from "./update";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface PwaStateValue {
  offlineReady: boolean;
  needRefresh: boolean;
  online: boolean;
  canInstall: boolean;
  isIos: boolean;
  install: () => Promise<boolean>;
  checkForUpdate: () => Promise<boolean>;
  update: () => Promise<void>;
  dismissUpdate: () => void;
}

const PwaStateContext = createContext<PwaStateValue | null>(null);

export function PwaStateProvider({ children }: PropsWithChildren) {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [online, setOnline] = useState(navigator.onLine);
  const [controlled, setControlled] = useState(Boolean(navigator.serviceWorker?.controller));
  const registrationRef = useRef<ServiceWorkerRegistration | undefined>(undefined);
  const {
    offlineReady: [workboxReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker
  } = useRegisterSW({
    onRegisteredSW: (_serviceWorkerUrl, registration) => {
      registrationRef.current = registration;
      void navigator.serviceWorker?.ready.then(() => setControlled(true));
    }
  });

  const checkForUpdate = useCallback(async () => {
    const registration = await checkForAppUpdate(registrationRef.current);
    if (registration) registrationRef.current = registration;
    const required = Boolean(registration?.waiting);
    if (required) setNeedRefresh(true);
    return required;
  }, [setNeedRefresh]);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    const onInstall = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("beforeinstallprompt", onInstall);
    void navigator.serviceWorker?.ready.then(() => setControlled(true));
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("beforeinstallprompt", onInstall);
    };
  }, []);

  const value = useMemo<PwaStateValue>(
    () => ({
      offlineReady: workboxReady || controlled,
      needRefresh,
      online,
      canInstall: Boolean(installPrompt),
      isIos: /iPad|iPhone|iPod/.test(navigator.userAgent),
      install: async () => {
        if (!installPrompt) return false;
        await installPrompt.prompt();
        const choice = await installPrompt.userChoice;
        if (choice.outcome === "accepted") setInstallPrompt(null);
        return choice.outcome === "accepted";
      },
      checkForUpdate,
      update: () => updateServiceWorker(true),
      dismissUpdate: () => setNeedRefresh(false)
    }),
    [checkForUpdate, controlled, installPrompt, needRefresh, online, setNeedRefresh, updateServiceWorker, workboxReady]
  );

  return <PwaStateContext.Provider value={value}>{children}</PwaStateContext.Provider>;
}

export function usePwaState() {
  const context = useContext(PwaStateContext);
  if (!context) throw new Error("usePwaState must be used inside PwaStateProvider");
  return context;
}
