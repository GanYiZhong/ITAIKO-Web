import { Link, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeviceProvider } from "@/context/DeviceContext";
import { HeaderConnectionStatus } from "@/components/connection/HeaderConnectionStatus";
import { FirmwareUpdatePanel } from "@/components/connection/FirmwareUpdatePanel";
import { FirmwareUpdateModal } from "@/components/connection/FirmwareUpdateModal";
import { ConfigurationTab } from "@/components/configuration/ConfigurationTab";
import { LiveMonitorTab } from "@/components/monitor/LiveMonitorTab";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useDevice } from "@/context/DeviceContext";
import { initializeHelpContent } from "@/lib/help-content";
import { isZhongTaiko } from "@/lib/edition";

// Initialize help content
initializeHelpContent();

function ConfigurePageContent() {
  const { t } = useTranslation("pages");
  const { isConnected, config } = useDevice();
  const showZhongTaiko = isConnected && isZhongTaiko(config.edition);
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get("tab") || "config";
  const advancedMode = searchParams.get("advanced") === "true";

  const onTabChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("tab", value);
    setSearchParams(newParams);
  };

  const handleAdvancedModeChange = (checked: boolean) => {
    const newParams = new URLSearchParams(searchParams);
    if (checked) {
      newParams.set("advanced", "true");
    } else {
      newParams.delete("advanced");
    }
    setSearchParams(newParams);
  };

  return (
    <div className="h-screen flex flex-col w-full">
      <FirmwareUpdateModal />
      {/* Header with connection status - fixed height */}
      <header className="border-b w-full flex-shrink-0">
        <div className="flex h-14 items-center justify-between px-4 max-w-5xl mx-auto w-full">
          <Link to="/" className="font-bold text-xl shrink-0 flex items-center gap-2">
            {showZhongTaiko && (
              <span className="font-extrabold tracking-tight text-lg sm:text-xl whitespace-nowrap">
                ZhongTaiko <span className="text-muted-foreground font-normal">×</span>
              </span>
            )}
            <img src="itaiko.png" className="pixelated drag-none" alt={t("configure.header.logoAlt")} />
          </Link>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <div className="flex items-center gap-2">
              <Label htmlFor="advanced-mode" className="text-sm">{t("configure.advanced.label")}</Label>
              <Switch
                id="advanced-mode"
                checked={advancedMode}
                onCheckedChange={handleAdvancedModeChange}
              />
            </div>
            <HeaderConnectionStatus />
          </div>
        </div>
      </header>

      {/* Main Content - scrollable area (overflow hidden when overlay shown) */}
      <div className="flex-1 relative overflow-auto">

        <main className="px-4 w-full max-w-5xl mx-auto py-6">
          <Tabs
            value={currentTab}
            onValueChange={onTabChange}
            className="flex flex-col"
          >
            <FirmwareUpdatePanel />

            {/* Tab Content */}
            <TabsContent value="config" className="mt-0">

              <ConfigurationTab />
            </TabsContent>

            <TabsContent value="monitor" className="mt-0">
              <LiveMonitorTab />
            </TabsContent>

            {/* Firmware Update Panel */}

            {/* Tabs at bottom */}
            <TabsList className="grid w-full grid-cols-2 mt-6">
              <TabsTrigger value="config">{t("configure.tabs.config")}</TabsTrigger>
              <TabsTrigger value="monitor">{t("configure.tabs.monitor")}</TabsTrigger>
            </TabsList>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

export function ConfigurePage() {
  return (
    <DeviceProvider>
      <ConfigurePageContent />
    </DeviceProvider>
  );
}
