import { useLanguagePack } from "../languages/LanguagePackContext";

export function RegisterSwitch({ compact = false }: { compact?: boolean }) {
  const { pack, variantId, setVariantId } = useLanguagePack();
  if (pack.speechVariants.length < 2) return null;
  return (
    <fieldset className={`register-switch${compact ? " register-switch--compact" : ""}`}>
      <legend className="sr-only">Speech style</legend>
      {pack.speechVariants.map((variant) => (
        <button
          key={variant.id}
          type="button"
          aria-pressed={variantId === variant.id}
          className="register-switch__option"
          onClick={() => setVariantId(variant.id)}
        >
          {variant.nativeLabel ? (
            <span lang={pack.locale}>{compact ? variant.compactNativeLabel ?? variant.nativeLabel : variant.nativeLabel}</span>
          ) : null}
          <span className={compact && variant.nativeLabel ? "sr-only" : undefined}>{variant.label}</span>
        </button>
      ))}
    </fieldset>
  );
}
