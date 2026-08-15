import { Check, Download, Keyboard, MoonStar, RotateCcw, Share, Smartphone, Trash2, Wifi, WifiOff } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { BottomSheet } from "../components/BottomSheet";
import { OfflineBadge } from "../components/PwaNotice";
import { RegisterSwitch } from "../components/RegisterSwitch";
import { ScreenHeader } from "../components/ScreenHeader";
import { useLanguagePack } from "../languages/LanguagePackContext";
import { usePwaState } from "../pwa/PwaState";
import { resetLanguageProgress } from "../storage/db";

export function SettingsPage() {
  const { pack } = useLanguagePack();
  const pwa = usePwaState();
  const [installOpen, setInstallOpen] = useState(false);
  const [resetDone, setResetDone] = useState(false);
  const resetDialog = useRef<HTMLDialogElement>(null);

  const reset = async () => {
    await resetLanguageProgress(pack.code);
    resetDialog.current?.close();
    setResetDone(true);
  };

  return (
    <div className="page settings-page">
      <ScreenHeader title="Settings" description="Language, display, installation, and data on this device." showRegister={false} actions={<OfflineBadge />} />

      <section className="settings-section" aria-labelledby="language-title">
        <h2 id="language-title">Learning</h2>
        <div className="setting-row">
          <div><strong>Language</strong><p>{pack.name} is the active installed language pack.</p></div>
          <span className="setting-value" lang={pack.locale}>{pack.nativeName}</span>
        </div>
        {pack.speechVariants.length > 1 ? <div className="setting-row setting-row--stack">
          <div><strong>Speech style</strong><p>This applies to lessons and the next unanswered quiz question. Polite is safest with staff and strangers.</p></div>
          <RegisterSwitch />
        </div> : null}
        <Link className="setting-action" to="/"><span><span><strong>Choose another language</strong><small>Return to the installed language packs.</small></span></span></Link>
      </section>

      <section className="settings-section" aria-labelledby="display-title">
        <h2 id="display-title">Display</h2>
        <div className="setting-row">
          <div><strong>Appearance</strong><p>Always matches your device’s light or dark setting, including changes while the app is open.</p></div>
          <span className="setting-value setting-value--icon"><MoonStar aria-hidden="true" /> System</span>
        </div>
      </section>

      <section className="settings-section" aria-labelledby="device-title">
        <h2 id="device-title">This device</h2>
        <div className="setting-row">
          <div><strong>Offline app</strong><p>{pwa.offlineReady ? "The app shell and registered language packs are cached." : "Keep this page open while the app finishes caching."}</p></div>
          {pwa.offlineReady ? <Wifi aria-hidden="true" /> : <WifiOff aria-hidden="true" />}
        </div>
        <button className="setting-action" type="button" onClick={() => setInstallOpen(true)}>
          <span><Smartphone aria-hidden="true" /><span><strong>Install Language Learner</strong><small>Launch full-screen from your home screen.</small></span></span>
          <Download aria-hidden="true" />
        </button>
        <div className="setting-row">
          <Keyboard aria-hidden="true" />
          <div><strong>{pack.presentation.keyboardTitle}</strong><p>{pack.presentation.keyboardHelp}</p></div>
        </div>
      </section>

      <section className="settings-section settings-section--danger" aria-labelledby="data-title">
        <h2 id="data-title">Progress data</h2>
        <p>Progress is stored only in this browser. Clearing site data or deleting the app can remove it permanently.</p>
        {resetDone ? <p className="inline-status"><Check aria-hidden="true" /> Progress has been reset on this device.</p> : null}
        <button className="button button--danger" type="button" onClick={() => resetDialog.current?.showModal()}>
          <Trash2 aria-hidden="true" /> Reset progress
        </button>
      </section>

      <footer className="settings-footer">
        <p>Language Learner · {pack.name} pack · Works without an account</p>
      </footer>

      <BottomSheet open={installOpen} onClose={() => setInstallOpen(false)} title="Install Language Learner">
        <div className="install-sheet">
          {pwa.canInstall ? (
            <>
              <p>Your browser can install this app directly. It will open in its own window and keep working offline.</p>
              <button className="button button--wide" type="button" onClick={() => void pwa.install().then((installed) => installed && setInstallOpen(false))}>
                <Download aria-hidden="true" /> Install app
              </button>
            </>
          ) : pwa.isIos ? (
            <ol>
              <li><Share aria-hidden="true" /><span>Tap the Share button in Safari.</span></li>
              <li><Smartphone aria-hidden="true" /><span>Choose “Add to Home Screen.”</span></li>
              <li><Check aria-hidden="true" /><span>Confirm “Language Learner.”</span></li>
            </ol>
          ) : (
            <>
              <p>Open your browser menu and choose “Install app” or “Add to home screen.”</p>
              <p className="install-sheet__note">Installation becomes available after the first complete online load.</p>
            </>
          )}
        </div>
      </BottomSheet>

      <dialog className="confirm-dialog" ref={resetDialog} onCancel={(event) => { event.preventDefault(); resetDialog.current?.close(); }}>
        <RotateCcw aria-hidden="true" />
        <h2>Reset all progress?</h2>
        <p>This removes {pack.name} quiz history, character progress, confidence scores, saved sessions, and tier unlocks from this device. It cannot be undone.</p>
        <div className="confirm-dialog__actions">
          <button className="button button--secondary" type="button" onClick={() => resetDialog.current?.close()}>Keep progress</button>
          <button className="button button--danger" type="button" onClick={() => void reset()}>Reset progress</button>
        </div>
      </dialog>
    </div>
  );
}
