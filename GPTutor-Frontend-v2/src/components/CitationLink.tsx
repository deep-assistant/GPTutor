import React from "react";
import { Link } from "@vkontakte/vkui";
import { Icon16LinkOutline } from "@vkontakte/icons";

interface CitationLinkProps {
  url: string;
  domain: string;
}

export const CitationLink: React.FC<CitationLinkProps> = ({ url, domain }) => {
  const getFaviconUrl = (url: string): string => {
    try {
      const urlObj = new URL(url);
      return `https://www.google.com/s2/favicons?domain=${urlObj.hostname}&sz=32`;
    } catch {
      return "";
    }
  };

  const faviconUrl = getFaviconUrl(url);

  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      after={<Icon16LinkOutline />}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "4px 8px",
        borderRadius: "8px",
        background: "var(--vkui--color_background)",
        border: "1px solid var(--vkui--color_separator_primary)",
        textDecoration: "none",
        transition: "all 0.2s ease",
      }}
    >
      {faviconUrl && (
        <img
          src={faviconUrl}
          alt=""
          style={{
            width: "16px",
            height: "16px",
            borderRadius: "2px",
          }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      )}
      <span
        style={{
          flex: 1,
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          fontSize: "14px",
          color: "var(--vkui--color_text_link)",
        }}
      >
        {domain}
      </span>
    </Link>
  );
};
