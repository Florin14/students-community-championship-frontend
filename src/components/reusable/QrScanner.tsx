import { Alert, Button, Stack } from "@mui/material";
import { Camera, ImageUp } from "lucide-react";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import styled from "styled-components";
import type { IScannerControls } from "@zxing/browser";

import { t } from "../../i18n";
import { useAppSelector } from "../../store/hooks";

const Video = styled.video`
  width: 100%;
  max-height: 360px;
  border-radius: 16px;
  background: var(--bg-surface);
  object-fit: cover;
`;

interface Props {
  disabled: boolean;
  onScan: (token: string) => void;
}

const QrScanner = ({ disabled, onScan }: Props) => {
  const language = useAppSelector((state) => state.i18n.language);
  const [active, setActive] = useState(false);
  const [readingImage, setReadingImage] = useState(false);
  const [error, setError] = useState<"attendance.cameraError" | "attendance.imageError" | null>(null);
  const video = useRef<HTMLVideoElement>(null);
  const controls = useRef<IScannerControls | null>(null);
  const latestOnScan = useRef(onScan);
  latestOnScan.current = onScan;

  useEffect(() => {
    if (!active || disabled) return;
    let disposed = false;
    let found = false;
    const start = async () => {
      try {
        const { BrowserQRCodeReader } = await import("@zxing/browser");
        if (disposed || !video.current) return;
        const reader = new BrowserQRCodeReader();
        const scanner = await reader.decodeFromConstraints(
          { audio: false, video: { facingMode: { ideal: "environment" } } },
          video.current,
          (result) => {
            if (!result || found || disposed) return;
            found = true;
            setActive(false);
            latestOnScan.current(result.getText());
          }
        );
        if (disposed) scanner.stop();
        else controls.current = scanner;
      } catch {
        if (!disposed) { setError("attendance.cameraError"); setActive(false); }
      }
    };
    void start();
    const onVisibility = () => {
      if (document.visibilityState === "hidden") setActive(false);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      disposed = true;
      controls.current?.stop();
      controls.current = null;
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [active, disabled]);

  const mounted = useRef(true);
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);

  const readImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || disabled) return;
    setActive(false);
    setError(null);
    setReadingImage(true);
    const url = URL.createObjectURL(file);
    try {
      if (file.size > 10 * 1024 * 1024) throw new Error("Image too large");
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const result = await new BrowserQRCodeReader().decodeFromImageUrl(url);
      if (mounted.current) latestOnScan.current(result.getText());
    } catch {
      if (mounted.current) setError("attendance.imageError");
    } finally {
      URL.revokeObjectURL(url);
      if (mounted.current) setReadingImage(false);
    }
  };

  return (
    <Stack spacing={2}>
      {error && <Alert severity="warning">{t(language, error)}</Alert>}
      {active && !disabled && <Video ref={video} muted playsInline autoPlay aria-label={t(language, "attendance.camera")} />}
      <Stack direction="row" gap={1} flexWrap="wrap">
        <Button
          variant="contained"
          startIcon={<Camera size={20} />}
          disabled={disabled || readingImage}
          onClick={() => {
            setError(null);
            if (!window.isSecureContext) { setError("attendance.cameraError"); return; }
            setActive((value) => !value);
          }}
          sx={{ minHeight: 48 }}
        >
          {t(language, active ? "attendance.stopCamera" : "attendance.camera")}
        </Button>
        <Button component="label" variant="outlined" disabled={disabled || readingImage} startIcon={<ImageUp size={20} />} sx={{ minHeight: 48 }}>
          {t(language, "attendance.image")}
          <input hidden type="file" accept="image/*" disabled={disabled || readingImage} onChange={(event) => void readImage(event)} />
        </Button>
      </Stack>
      <small>{t(language, "attendance.cameraHint")}</small>
    </Stack>
  );
};

export default QrScanner;
