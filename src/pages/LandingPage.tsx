import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Drum, Settings, Activity, Usb } from "lucide-react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function LandingPage() {
  const { t } = useTranslation("pages");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Wave Border */}
      <div className="seigaiha-border" />

      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center gap-12 p-8">
        <div className="text-center space-y-4 items-center flex flex-col">
          <img src="itaiko.png" className="pixelated w-96 drag-none" />
          <p className="text-xl text-muted-foreground max-w-lg mx-auto">
            {t("landing.hero.subtitle")}
          </p>
          <div className="flex gap-2 justify-center">
            <Badge variant="secondary">{t("landing.hero.badgeWebserial")}</Badge>
            <Badge variant="secondary">{t("landing.hero.badgeRealtime")}</Badge>
            <Badge variant="secondary">{t("landing.hero.badgeNoDownload")}</Badge>
          </div>
        </div>

        <div className="flex gap-4">
          <Button asChild size="lg">
            <Link to="/configure">{t("landing.cta.configure")}</Link>
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 rounded-full bg-muted">
                  <Activity className="h-6 w-6" />
                </div>
                <h3 className="font-semibold">{t("landing.features.liveMonitor.title")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("landing.features.liveMonitor.description")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 rounded-full bg-muted">
                  <Settings className="h-6 w-6" />
                </div>
                <h3 className="font-semibold">{t("landing.features.easyConfig.title")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("landing.features.easyConfig.description")}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="p-3 rounded-full bg-muted">
                  <Drum className="h-6 w-6" />
                </div>
                <h3 className="font-semibold">{t("landing.features.visualFeedback.title")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t("landing.features.visualFeedback.description")}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="px-16 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground w-full">
          <div className="flex items-center gap-2">
            <Usb className="h-4 w-4" />
            <span>{t("landing.footer.browserRequirement")}</span>
          </div>
          <div>ITAIKO</div>
        </div>
      </footer>
    </div>
  );
}
