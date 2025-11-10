import React, { FC, useState } from "react";
import { IconButton } from "@vkontakte/vkui";
import { Icon16CopyOutline, Icon16CheckCircle } from "@vkontakte/icons";
import bridge from "@vkontakte/vk-bridge";

import classes from "./components.module.css";

interface CopyButtonProps {
  textToCopy: string;
  style?: React.CSSProperties;
  onCopySuccess?: () => void;
  onCopyError?: (error: Error) => void;
  successDuration?: number;
  size?: number;
  disabled?: boolean;
}

export const CopyButton: FC<CopyButtonProps> = ({
  textToCopy,
  style,
  onCopySuccess,
  onCopyError,
  successDuration = 1500,
  size,
  disabled = false,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (isCopied || disabled) return;

    try {
      await bridge.send("VKWebAppCopyText", { text: textToCopy });

      setIsCopied(true);
      onCopySuccess?.();

      setTimeout(() => setIsCopied(false), successDuration);
    } catch (error) {
      onCopyError?.(error as Error);
    }
  };

  const disabledStyles: React.CSSProperties = disabled
    ? {
        opacity: 0.4,
        cursor: "not-allowed",
      }
    : {};

  const buttonStyle: React.CSSProperties = {
    borderRadius: "50%",
    ...style,
    ...disabledStyles,
  };

  const buttonClassName = `${classes.copyButton} ${
    isCopied ? classes.copied : ""
  }`;

  return (
    <IconButton
      className={buttonClassName}
      onClick={handleCopy}
      style={buttonStyle}
      disabled={disabled}
    >
      {isCopied ? (
        <Icon16CheckCircle
          color="var(--vkui--color_background_accent_themed)"
          width={size}
          height={size}
        />
      ) : (
        <Icon16CopyOutline
          color="var(--vkui--color_background_accent_themed)"
          width={size}
          height={size}
        />
      )}
    </IconButton>
  );
};
