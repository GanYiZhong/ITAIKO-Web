import { useTranslation } from "react-i18next";
import { useDevice } from "@/context/DeviceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { NumberInput } from "@/components/ui/numberinput";
import { ROLL_BOOST_MIN, ROLL_BOOST_MAX } from "@/types";

// 連打增速 (drumroll boost) — single global window in ms, 0 = off.
export function RollBoostSettings() {
  const { t } = useTranslation("config");
  const { config, setRollBoostMs, setBufferedInput, isConnected } = useDevice();

  const value = config.rollBoostMs ?? 0;

  const handleSliderChange = (v: number[]) => setRollBoostMs(v[0], false);
  const handleSliderCommit = (v: number[]) => setRollBoostMs(v[0], true);
  const handleNumberChange = (v: number | undefined) => {
    if (v !== undefined) setRollBoostMs(v, true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          {t("rollBoost.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{t("rollBoost.description")}</p>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">{t("rollBoost.label")}</Label>
            <div className="flex items-center gap-2">
              {value === 0 && (
                <span className="text-xs text-muted-foreground">{t("rollBoost.off")}</span>
              )}
              <NumberInput
                value={value}
                onValueChange={handleNumberChange}
                className="w-24"
                min={ROLL_BOOST_MIN}
                max={ROLL_BOOST_MAX}
                disabled={!isConnected}
                suffix=" ms"
              />
            </div>
          </div>
          <Slider
            value={[value]}
            onValueChange={handleSliderChange}
            onValueCommit={handleSliderCommit}
            min={ROLL_BOOST_MIN}
            max={ROLL_BOOST_MAX}
            step={1}
            disabled={!isConnected}
          />
        </div>

        <div className="flex items-center justify-between border-t pt-4">
          <div className="space-y-0.5 pr-4">
            <Label htmlFor="buffered-input">{t("rollBoost.bufferedInput")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("rollBoost.bufferedInputDescription")}
            </p>
          </div>
          <Switch
            id="buffered-input"
            checked={config.bufferedInput ?? false}
            onCheckedChange={(v) => setBufferedInput(v)}
            disabled={!isConnected}
          />
        </div>
      </CardContent>
    </Card>
  );
}
