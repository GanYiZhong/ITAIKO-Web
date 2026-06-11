import { useMemo, useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Download, RefreshCcw, ShieldCheck, Upload } from "lucide-react";
import { useDevice } from "@/context/DeviceContext";
import {
  buildPs4AuthDebugPreview,
  formatCArray,
  formatCArrayWrapped,
  generatePs4AuthData,
  toBackupData,
  type Ps4AuthGeneratedData,
} from "@/lib/ps4-auth-generator";

function timestampForFilename(): string {
  return new Date().toISOString().replace(/[:.]/g, "-");
}

export function PS4AuthGenerator() {
  const { t } = useTranslation("setup");
  const { isConnected, uploadPs4Auth, clearPs4Auth, readPs4AuthStatus, disconnect } = useDevice();
  const [keyPemFile, setKeyPemFile] = useState<File | null>(null);
  const [serialFile, setSerialFile] = useState<File | null>(null);
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [generated, setGenerated] = useState<Ps4AuthGeneratedData | null>(null);
  const [debugPreview, setDebugPreview] = useState<string>("");

  const canGenerate = useMemo(
    () => Boolean(keyPemFile && serialFile && signatureFile && !isGenerating),
    [keyPemFile, serialFile, signatureFile, isGenerating]
  );

  const clearAll = () => {
    setKeyPemFile(null);
    setSerialFile(null);
    setSignatureFile(null);
    setGenerated(null);
    setDebugPreview("");
    setError(null);
    setStatusMessage(null);
  };

  const generate = async () => {
    if (!keyPemFile || !serialFile || !signatureFile) {
      setError(t("ps4AuthGenerator.errors.selectFiles"));
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const [keyPemText, serialText, signatureArrayBuffer] = await Promise.all([
        keyPemFile.text(),
        serialFile.text(),
        signatureFile.arrayBuffer(),
      ]);

      const generatedData = generatePs4AuthData({
        keyPemText,
        serialText,
        signatureBytes: new Uint8Array(signatureArrayBuffer),
      });

      setGenerated(generatedData);
      setDebugPreview(buildPs4AuthDebugPreview(generatedData));
      setStatusMessage(null);
    } catch (err) {
      setGenerated(null);
      setDebugPreview("");
      setError(err instanceof Error ? err.message : t("ps4AuthGenerator.errors.generateFailed"));
    } finally {
      setIsGenerating(false);
    }
  };

  const checkDeviceStatus = async () => {
    if (!isConnected) {
      setStatusMessage(t("ps4AuthGenerator.errors.connectToCheck"));
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const hasAuth = await readPs4AuthStatus();
      setStatusMessage(hasAuth ? t("ps4AuthGenerator.status.authPresent") : t("ps4AuthGenerator.status.authAbsent"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("ps4AuthGenerator.errors.queryFailed"));
    } finally {
      setIsUploading(false);
    }
  };

  const uploadToDevice = async () => {
    if (!generated) {
      setError(t("ps4AuthGenerator.errors.generateFirst"));
      return;
    }
    if (!isConnected) {
      setError(t("ps4AuthGenerator.errors.connectBeforeUpload"));
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const ok = await uploadPs4Auth(toBackupData(generated));
      if (ok) {
        setStatusMessage(t("ps4AuthGenerator.status.uploadedRebooting"));
        await disconnect();
      } else {
        setError(t("ps4AuthGenerator.errors.uploadFailed"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("ps4AuthGenerator.errors.uploadFailedGeneric"));
    } finally {
      setIsUploading(false);
    }
  };

  const clearDeviceAuth = async () => {
    if (!isConnected) {
      setError(t("ps4AuthGenerator.errors.connectBeforeClear"));
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const ok = await clearPs4Auth();
      if (ok) {
        setStatusMessage(t("ps4AuthGenerator.status.clearedRebooting"));
        await disconnect();
      } else {
        setError(t("ps4AuthGenerator.errors.clearFailed"));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("ps4AuthGenerator.errors.clearFailedGeneric"));
    } finally {
      setIsUploading(false);
    }
  };

  const downloadDebugOutput = () => {
    if (!debugPreview) {
      return;
    }

    const blob = new Blob([debugPreview], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = `itaiko-ps4-auth-debug-${timestampForFilename()}.txt`;

    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <ShieldCheck className="h-4 w-4" />
          {t("ps4AuthGenerator.title")}
        </CardTitle>
        <CardDescription>
          <Trans i18nKey="ps4AuthGenerator.description" ns="setup">
            Upload <code>key.pem</code>, <code>serial.txt</code>, and <code>sig.bin</code> to generate canonical auth
            bytes for comparison with <code>generateAuthConfig.py</code>, then upload them directly to the board.
          </Trans>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="ps4-key-pem">key.pem</Label>
            <Input
              id="ps4-key-pem"
              type="file"
              accept=".pem,text/plain"
              onChange={(event) => setKeyPemFile(event.target.files?.[0] ?? null)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ps4-serial">serial.txt</Label>
            <Input
              id="ps4-serial"
              type="file"
              accept=".txt,text/plain"
              onChange={(event) => setSerialFile(event.target.files?.[0] ?? null)}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="ps4-signature">sig.bin</Label>
            <Input
              id="ps4-signature"
              type="file"
              accept=".bin,application/octet-stream"
              onChange={(event) => setSignatureFile(event.target.files?.[0] ?? null)}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={generate} disabled={!canGenerate || isUploading}>
            {isGenerating ? t("ps4AuthGenerator.buttons.generating") : t("ps4AuthGenerator.buttons.generate")}
          </Button>
          <Button variant="outline" onClick={downloadDebugOutput} disabled={!generated}>
            <Download className="h-4 w-4 mr-2" />
            {t("ps4AuthGenerator.buttons.downloadOutput")}
          </Button>
          <Button variant="secondary" onClick={uploadToDevice} disabled={!generated || !isConnected || isUploading}>
            <Upload className="h-4 w-4 mr-2" />
            {t("ps4AuthGenerator.buttons.uploadToDevice")}
          </Button>
          <Button variant="outline" onClick={checkDeviceStatus} disabled={!isConnected || isUploading}>
            {t("ps4AuthGenerator.buttons.checkDeviceStatus")}
          </Button>
          <Button variant="outline" onClick={clearDeviceAuth} disabled={!isConnected || isUploading}>
            {t("ps4AuthGenerator.buttons.clearDeviceAuth")}
          </Button>
          <Button variant="ghost" onClick={clearAll}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            {t("ps4AuthGenerator.buttons.clear")}
          </Button>
        </div>

        {error && (
          <div className="rounded-md border border-destructive/50 bg-destructive/10 text-destructive px-3 py-2 text-sm">
            {error}
          </div>
        )}

        {statusMessage && (
          <div className="rounded-md border border-emerald-500/40 bg-emerald-500/10 text-emerald-700 px-3 py-2 text-sm">
            {statusMessage}
          </div>
        )}

        {generated && (
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              {t("ps4AuthGenerator.output.generatedSummary", {
                serialBytes: generated.serialBytes.length,
                signatureBytes: generated.signatureBytes.length,
                keyPemChars: generated.keyPemText.length,
              })}
            </div>

            <div className="space-y-1">
              <Label>{t("ps4AuthGenerator.output.serialCArray")}</Label>
              <pre className="rounded-md border bg-muted/40 p-3 text-xs overflow-x-auto">{`{ ${formatCArray(
                generated.serialBytes
              )} }`}</pre>
            </div>

            <div className="space-y-1">
              <Label>{t("ps4AuthGenerator.output.signatureCArray")}</Label>
              <pre className="rounded-md border bg-muted/40 p-3 text-xs overflow-auto max-h-64">{`{\n  ${formatCArrayWrapped(
                generated.signatureBytes
              ).replace(/\n/g, "\n  ")}\n}`}</pre>
            </div>

            <div className="space-y-1">
              <Label>{t("ps4AuthGenerator.output.keyPem")}</Label>
              <pre className="rounded-md border bg-muted/40 p-3 text-xs overflow-auto max-h-56">{generated.keyPemText}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
