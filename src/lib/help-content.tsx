import { registerHelp } from "@/components/ui/help-modal";
import { LucideAlertTriangle } from "lucide-react";
import i18n from "@/i18n";

// Register all help content on module load
export function initializeHelpContent() {
  const t = (key: string) => i18n.t(key, { ns: "help" });

  // Global Settings
  registerHelp("global-settings", {
    title: t("globalSettings.title"),
    description: t("globalSettings.description"),
    content: (
      <div className="space-y-4">
        <section>
          <h4 className="font-semibold">{t("globalSettings.allowDoubleInputs.heading")}</h4>
          <p className="text-muted-foreground">
            {t("globalSettings.allowDoubleInputs.body")}
          </p>
        </section>
      </div>
    ),
  });

  // Pad Thresholds
  registerHelp("pad-thresholds", {
    title: t("padThresholds.title"),
    description: t("padThresholds.description"),
    content: (
      <div className="space-y-4">
        <section>
          <h4 className="font-semibold">{t("padThresholds.lightTrigger.heading")}</h4>
          <p className="text-muted-foreground">
            {t("padThresholds.lightTrigger.body")}
          </p>
        </section>
        <section>
          <h4 className="font-semibold">{t("padThresholds.heavyTrigger.heading")}</h4>
          <p className="text-muted-foreground">
            {t("padThresholds.heavyTrigger.body")}
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h4 className="font-semibold">{t("padThresholds.cutoff.heading")}</h4>
          <div className="container border-destructive border-2 p-4 bg-destructive/5  text-destructive rounded-xl">
            <LucideAlertTriangle className="inline" />
            {t("padThresholds.cutoff.warning")}
          </div>
          <p className="text-muted-foreground">
            {t("padThresholds.cutoff.body")}
          </p>
        </section>
      </div>
    ),
  });

  // Timing Settings
  registerHelp("timing-settings", {
    title: t("timingSettings.title"),
    description: t("timingSettings.description"),
    content: (
      <div className="space-y-4">
        <section>
          <h4 className="font-semibold">{t("timingSettings.debounceTime.heading")}</h4>
          <p className="text-muted-foreground">
            {t("timingSettings.debounceTime.body")}
          </p>
        </section>
        <section>
          <h4 className="font-semibold">{t("timingSettings.sampleCount.heading")}</h4>
          <p className="text-muted-foreground">
            {t("timingSettings.sampleCount.body")}
          </p>
        </section>
      </div>
    ),
  });

  // ADC Channel Settings
  registerHelp("adc-channels", {
    title: t("adcChannels.title"),
    description: t("adcChannels.description"),
    content: (
      <div className="space-y-4">
        <section>
          <h4 className="font-semibold">{t("adcChannels.whatAreAdcChannels.heading")}</h4>
          <p className="text-muted-foreground">
            {t("adcChannels.whatAreAdcChannels.body")}
          </p>
        </section>
        <section>
          <h4 className="font-semibold">{t("adcChannels.channelAssignment.heading")}</h4>
          <p className="text-muted-foreground">
            {t("adcChannels.channelAssignment.body")}
          </p>
        </section>
      </div>
    ),
  });

  // Key Mapping Settings
  registerHelp("key-mappings", {
    title: t("keyMappings.title"),
    description: t("keyMappings.description"),
    content: (
      <div className="space-y-4">
        <section>
          <h4 className="font-semibold">{t("keyMappings.gamepadButtons.heading")}</h4>
          <p className="text-muted-foreground">
            {t("keyMappings.gamepadButtons.body")}
          </p>
        </section>
        <section>
          <h4 className="font-semibold">{t("keyMappings.keyboardKeys.heading")}</h4>
          <p className="text-muted-foreground">
            {t("keyMappings.keyboardKeys.body")}
          </p>
        </section>
      </div>
    ),
  });

  // Boot Screen
  registerHelp("boot-screen", {
    title: t("bootScreen.title"),
    description: t("bootScreen.description"),
    content: (
      <div className="space-y-4">
        <section>
          <h4 className="font-semibold">{t("bootScreen.imageRequirements.heading")}</h4>
          <p className="text-muted-foreground">
            {t("bootScreen.imageRequirements.intro")}
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>{t("bootScreen.imageRequirements.formatItem")}</li>
              <li>{t("bootScreen.imageRequirements.aspectRatioItem")}</li>
              <li>{t("bootScreen.imageRequirements.colorsItem")}</li>
            </ul>
          </p>
        </section>
        <section>
          <h4 className="font-semibold">{t("bootScreen.howToUse.heading")}</h4>
          <p className="text-muted-foreground">
            {t("bootScreen.howToUse.step1")}<br />
            {t("bootScreen.howToUse.step2")}<br />
            {t("bootScreen.howToUse.step3")}<br />
            {t("bootScreen.howToUse.step4")}
          </p>
        </section>
        <section>
          <h4 className="font-semibold">{t("bootScreen.restoringDefault.heading")}</h4>
          <p className="text-muted-foreground">
            {t("bootScreen.restoringDefault.body")}
          </p>
        </section>
      </div>
    ),
  });

  // Live Monitor
  registerHelp("live-monitor", {
    title: t("liveMonitor.title"),
    description: t("liveMonitor.description"),
    content: (
      <div className="space-y-4">
        <section>
          <h4 className="font-semibold">{t("liveMonitor.graphDisplay.heading")}</h4>
          <p className="text-muted-foreground">
            {t("liveMonitor.graphDisplay.body")}
          </p>
        </section>
        <section>
          <h4 className="font-semibold">{t("liveMonitor.triggerIndicators.heading")}</h4>
          <p className="text-muted-foreground">
            {t("liveMonitor.triggerIndicators.body")}
          </p>
        </section>
      </div>
    ),
  });

  // Visual Drum
  registerHelp("visual-drum", {
    title: t("visualDrum.title"),
    description: t("visualDrum.description"),
    content: (
      <div className="space-y-4">
        <section>
          <h4 className="font-semibold">{t("visualDrum.howToUse.heading")}</h4>
          <p className="text-muted-foreground">
            {t("visualDrum.howToUse.body")}
          </p>
        </section>
      </div>
    ),
  });
}

// Re-register help content when the language changes so consumers
// always get translated strings. Guard against duplicate listeners
// by removing before adding (i18next de-dupes by function reference).
const _onLanguageChanged = () => initializeHelpContent();
i18n.off("languageChanged", _onLanguageChanged);
i18n.on("languageChanged", _onLanguageChanged);
