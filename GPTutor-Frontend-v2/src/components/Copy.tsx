import { FC, useState } from "react";
import { Button } from "@vkontakte/vkui";
import { Icon28CopyOutline } from "@vkontakte/icons";
import bridge from "@vkontakte/vk-bridge";

interface CopyProps {
  copyText: string;
  textToClickBoard: string;
  mode?: "primary" | "secondary" | "tertiary" | "outline" | "link";
  isButton?: boolean;
}

export const Copy: FC<CopyProps> = ({ 
  copyText, 
  textToClickBoard, 
  mode = "secondary", 
  isButton = false 
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await bridge.send("VKWebAppCopyText", { text: textToClickBoard });
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (isButton) {
    return (
      <Button
        size="s"
        mode={mode}
        before={<Icon28CopyOutline />}
        onClick={handleCopy}
      >
        {copied ? 'Скопировано!' : copyText}
      </Button>
    );
  }

  return (
    <div onClick={handleCopy} style={{ cursor: 'pointer' }}>
      {copied ? 'Скопировано!' : copyText}
    </div>
  );
};






