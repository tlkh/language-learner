import { useAppState } from "../state/AppState";

export function RegisterSwitch({ compact = false }: { compact?: boolean }) {
  const { register, setRegister } = useAppState();
  return (
    <fieldset className={`register-switch${compact ? " register-switch--compact" : ""}`}>
      <legend className="sr-only">Speech style</legend>
      <button
        type="button"
        aria-pressed={register === "formal"}
        className="register-switch__option"
        onClick={() => setRegister("formal")}
      >
        <span lang="ja">丁寧</span>
        <span className={compact ? "sr-only" : undefined}>Formal</span>
      </button>
      <button
        type="button"
        aria-pressed={register === "informal"}
        className="register-switch__option"
        onClick={() => setRegister("informal")}
      >
        <span lang="ja">{compact ? "普通" : "カジュアル"}</span>
        <span className={compact ? "sr-only" : undefined}>Casual</span>
      </button>
    </fieldset>
  );
}
