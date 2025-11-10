import React from "react";

interface InlineCitationProps {
  index: number;
  url: string;
}

/**
 * Компонент для отображения inline citation [N] в тексте
 */
export const InlineCitation: React.FC<InlineCitationProps> = ({
  index,
  url,
}) => {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-citation"
      title={url}
    >
      [{index}]
    </a>
  );
};





