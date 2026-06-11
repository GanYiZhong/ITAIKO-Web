import { useTranslation } from "react-i18next";
import { useDevice } from "@/context/DeviceContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { NumberInput } from "@/components/ui/numberinput";
import type { PadName } from "@/types";
import { PAD_COLORS } from "@/types";
import { usePadLabels } from "@/i18n/pad-labels";
import { THRESHOLD_MIN, THRESHOLD_MAX } from "@/lib/default-config";

interface PadConfigGroupProps {
  pad: PadName;
  simpleMode?: boolean;
}

interface PadThresholdSettingProps {
  label: string;
  id: string;
  value: number;
  onChange: (value: number, commit?: boolean) => void;
  disabled: boolean;
}

function PadThresholdSetting({
  label,
  id,
  value,
  onChange,
  disabled,
}: PadThresholdSettingProps) {
  const handleValueChange = (val: number | undefined) => {
    if (val !== undefined) {
      onChange(val, true);
    }
  };

  const handleSliderChange = (newValue: number[]) => {
    onChange(newValue[0], false);
  };

  const handleSliderCommit = (newValue: number[]) => {
    onChange(newValue[0], true);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={id} className="text-sm">
          {label}
        </Label>
        <NumberInput
          id={id}
          value={value}
          onValueChange={handleValueChange}
          className="w-24"
          min={THRESHOLD_MIN}
          max={THRESHOLD_MAX}
          disabled={disabled}
        />
      </div>
      <Slider
        value={[value]}
        onValueChange={handleSliderChange}
        onValueCommit={handleSliderCommit}
        min={THRESHOLD_MIN}
        max={THRESHOLD_MAX}
        step={5}
        disabled={disabled}
      />
    </div>
  );
}

export function PadConfigGroup({ pad, simpleMode = false }: PadConfigGroupProps) {
  const { t } = useTranslation("config");
  const padLabels = usePadLabels();
  const { config, updatePadThreshold, isConnected } = useDevice();
  const thresholds = config.pads[pad];
  const showHeavy = config.doubleInputMode && !simpleMode;

  return (
    <Card>
      <CardHeader className="">
        <CardTitle className="flex items-center gap-2 text-base">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: PAD_COLORS[pad] }}
          />
          {padLabels[pad]}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Light Threshold */}
        <PadThresholdSetting
          label={t("padConfig.lightTrigger")}
          id={`${pad}-light`}
          value={thresholds.light}
          onChange={(val, commit) => updatePadThreshold(pad, "light", val, commit)}
          disabled={!isConnected}
        />

        {/* Heavy Threshold (only when double mode enabled) */}
        {showHeavy && (
          <PadThresholdSetting
            label={t("padConfig.heavyTrigger")}
            id={`${pad}-heavy`}
            value={thresholds.heavy}
            onChange={(val, commit) => updatePadThreshold(pad, "heavy", val, commit)}
            disabled={!isConnected}
          />
        )}

        {/* Cutoff Threshold - Advanced only */}
        {!simpleMode && (
          <PadThresholdSetting
            label={t("padConfig.cutoff")}
            id={`${pad}-cutoff`}
            value={thresholds.cutoff}
            onChange={(val, commit) => updatePadThreshold(pad, "cutoff", val, commit)}
            disabled={!isConnected}
          />
        )}
      </CardContent>
    </Card>
  );
}