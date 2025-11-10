import React, { FC, useState } from "react";
import { Icon16CheckCircle, Icon16CopyOutline } from "@vkontakte/icons";
import bridge from "@vkontakte/vk-bridge";

interface CodeCopyButtonProps {
  code: string;
  style?: React.CSSProperties;
  onCopySuccess?: () => void;
  onCopyError?: (error: Error) => void;
  successDuration?: number;
}

export const CodeCopyButton: FC<CodeCopyButtonProps> = ({
  code,
  style,
  onCopySuccess,
  onCopyError,
  successDuration = 2000,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (isCopied) return;

    try {
      await bridge.send("VKWebAppCopyText", { text: code });
      setIsCopied(true);
      onCopySuccess?.();

      setTimeout(() => setIsCopied(false), successDuration);
    } catch (error) {
      console.error("CodeCopyButton: Failed to copy code:", error);
      onCopyError?.(error as Error);
    }
  };

  const buttonStyle: React.CSSProperties = {
    ...style,
  };

  const buttonClassName = `code-copy-button ${isCopied ? "copied" : ""}`;

  return (
    <button
      className={buttonClassName}
      onClick={handleCopy}
      style={buttonStyle}
      title={isCopied ? "Скопировано!" : "Копировать код"}
    >
      {isCopied ? <Icon16CheckCircle /> : <Icon16CopyOutline />}
    </button>
  );
};



