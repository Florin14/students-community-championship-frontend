import { Button, Dialog } from "@mui/material";
import { X } from "lucide-react";
import { useEffect, useId, useState } from "react";
import type { ReactEventHandler } from "react";
import styled from "styled-components";

import { t } from "../../i18n";
import { useAppSelector } from "../../store/hooks";

interface Props {
  src?: string;
  name: string;
  className?: string;
  onLoad?: ReactEventHandler<HTMLImageElement>;
  onError?: ReactEventHandler<HTMLImageElement>;
}

const Trigger = styled.button`
  display: block;
  width: 100%;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: zoom-in;
  overflow: hidden;

  &:disabled { cursor: default; }
  &:focus-visible { outline: 3px solid var(--accent); outline-offset: -3px; }

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const Viewer = styled(Dialog)`
  .MuiDialog-paper {
    background: var(--bg-default);
    color: var(--text-primary);
  }
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
  padding: calc(12px + env(safe-area-inset-top)) max(16px, env(safe-area-inset-right))
    12px max(16px, env(safe-area-inset-left));
  border-bottom: 1px solid var(--border);
`;

const Title = styled.h2`
  min-width: 0;
  font-family: var(--font-heading);
  font-size: 1rem;
  overflow-wrap: anywhere;
`;

const ImageArea = styled.div`
  flex: 1;
  min-height: 0;
  min-width: 0;
  padding: 16px max(16px, env(safe-area-inset-right))
    max(16px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left));

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`;

const ExpandablePlayerPhoto = ({ src, name, className, onLoad, onError }: Props) => {
  const language = useAppSelector((state) => state.i18n.language);
  const titleId = useId();
  const [open, setOpen] = useState(false);
  const [loadedSrc, setLoadedSrc] = useState<string | undefined>();
  const ready = Boolean(src && loadedSrc === src);

  useEffect(() => { setOpen(false); }, [src, name]);

  return (
    <>
      <Trigger
        type="button"
        className={className}
        aria-label={t(language, "playerPhoto.open", { name })}
        aria-haspopup="dialog"
        disabled={!ready}
        onClick={() => setOpen(true)}
      >
        <img
          src={src}
          alt={name}
          onLoad={(event) => { setLoadedSrc(src); onLoad?.(event); }}
          onError={(event) => { setLoadedSrc(undefined); setOpen(false); onError?.(event); }}
        />
      </Trigger>
      <Viewer fullScreen open={open && ready} onClose={() => setOpen(false)} aria-labelledby={titleId}>
        <Toolbar>
          <Title id={titleId}>{t(language, "playerPhoto.title", { name })}</Title>
          <Button
            variant="outlined"
            startIcon={<X size={22} />}
            onClick={() => setOpen(false)}
            sx={{ minHeight: 48, minWidth: 108, flexShrink: 0 }}
          >
            {t(language, "playerPhoto.close")}
          </Button>
        </Toolbar>
        <ImageArea><img src={src} alt={name} /></ImageArea>
      </Viewer>
    </>
  );
};

export default ExpandablePlayerPhoto;
