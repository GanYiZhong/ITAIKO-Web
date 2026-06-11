import { useTranslation } from "react-i18next";
import { PAD_NAMES, type PadName } from "@/types";

// Translated pad labels; falls back to PAD_LABELS-style English via the en locale.
export function usePadLabels(): Record<PadName, string> {
  const { t } = useTranslation("common");
  return Object.fromEntries(
    PAD_NAMES.map((pad) => [pad, t(`pads.${pad}`)])
  ) as Record<PadName, string>;
}
