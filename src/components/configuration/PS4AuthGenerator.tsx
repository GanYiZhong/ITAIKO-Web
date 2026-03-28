import { useMemo, useState } from "react";
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
      setError("Please select key.pem, serial.txt, and sig.bin.");
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
      setError(err instanceof Error ? err.message : "Failed to generate PS4 auth data.");
    } finally {
      setIsGenerating(false);
    }
  };

  const checkDeviceStatus = async () => {
    if (!isConnected) {
      setStatusMessage("Connect a device to check PS4 auth status.");
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const hasAuth = await readPs4AuthStatus();
      setStatusMessage(hasAuth ? "Device status: PS4 auth is present." : "Device status: no PS4 auth stored.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to query PS4 auth status.");
    } finally {
      setIsUploading(false);
    }
  };

  const uploadToDevice = async () => {
    if (!generated) {
      setError("Generate data first.");
      return;
    }
    if (!isConnected) {
      setError("Connect a device before uploading.");
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const ok = await uploadPs4Auth(toBackupData(generated));
      if (ok) {
        setStatusMessage("PS4 auth uploaded. Device is rebooting — reconnect when it comes back.");
        await disconnect();
      } else {
        setError("Upload failed. Check serial connection and try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const clearDeviceAuth = async () => {
    if (!isConnected) {
      setError("Connect a device before clearing PS4 auth.");
      return;
    }

    setIsUploading(true);
    setError(null);
    try {
      const ok = await clearPs4Auth();
      if (ok) {
        setStatusMessage("PS4 auth cleared. Device is rebooting — reconnect when it comes back.");
        await disconnect();
      } else {
        setError("Clear failed. Check serial connection and try again.");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Clear failed.");
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
          PS4 Auth Generator (Debug)
        </CardTitle>
        <CardDescription>
          Upload <code>key.pem</code>, <code>serial.txt</code>, and <code>sig.bin</code> to generate canonical auth
          bytes for comparison with <code>generateAuthConfig.py</code>, then upload them directly to the board.
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
            {isGenerating ? "Generating..." : "Generate Debug Data"}
          </Button>
          <Button variant="outline" onClick={downloadDebugOutput} disabled={!generated}>
            <Download className="h-4 w-4 mr-2" />
            Download Output
          </Button>
          <Button variant="secondary" onClick={uploadToDevice} disabled={!generated || !isConnected || isUploading}>
            <Upload className="h-4 w-4 mr-2" />
            Upload To Device
          </Button>
          <Button variant="outline" onClick={checkDeviceStatus} disabled={!isConnected || isUploading}>
            Check Device Status
          </Button>
          <Button variant="outline" onClick={clearDeviceAuth} disabled={!isConnected || isUploading}>
            Clear Device Auth
          </Button>
          <Button variant="ghost" onClick={clearAll}>
            <RefreshCcw className="h-4 w-4 mr-2" />
            Clear
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
              <span className="font-medium text-foreground">Generated:</span> serial {generated.serialBytes.length} bytes,
              signature {generated.signatureBytes.length} bytes, key.pem {generated.keyPemText.length} chars.
            </div>

            <div className="space-y-1">
              <Label>Serial C Array (16 bytes)</Label>
              <pre className="rounded-md border bg-muted/40 p-3 text-xs overflow-x-auto">{`{ ${formatCArray(
                generated.serialBytes
              )} }`}</pre>
            </div>

            <div className="space-y-1">
              <Label>Signature C Array (256 bytes)</Label>
              <pre className="rounded-md border bg-muted/40 p-3 text-xs overflow-auto max-h-64">{`{\n  ${formatCArrayWrapped(
                generated.signatureBytes
              ).replace(/\n/g, "\n  ")}\n}`}</pre>
            </div>

            <div className="space-y-1">
              <Label>key.pem</Label>
              <pre className="rounded-md border bg-muted/40 p-3 text-xs overflow-auto max-h-56">{generated.keyPemText}</pre>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
