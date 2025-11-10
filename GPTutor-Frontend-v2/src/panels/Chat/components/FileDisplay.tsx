import React from "react";
import { IconButton, Spinner } from "@vkontakte/vkui";
import { Icon20Clear } from "@vkontakte/icons";
import { FileInfo } from "../../../api";
import { UploadingFile } from "../types";
import "./AttachedFiles.css";

interface FileDisplayProps {
  file?: FileInfo;
  uploadingFile?: UploadingFile;
  showRemoveButton?: boolean;
  onRemove?: () => void;
  disabled?: boolean;
}

export const FileDisplay: React.FC<FileDisplayProps> = ({
  file,
  uploadingFile,
  showRemoveButton = false,
  onRemove,
  disabled = false,
}) => {
  const currentFile = file || uploadingFile?.file;
  const isUploading = !!uploadingFile;

  if (!currentFile) {
    return null;
  }

  const isImage = currentFile.type.startsWith("image/");

  const getFileExtension = (filename: string) => {
    const extension = filename.split(".").pop()?.toUpperCase() || "FILE";

    if (extension.length > 4) {
      return extension.substring(0, 4);
    }

    return extension;
  };

  const getTruncatedFileName = (filename: string) => {
    const nameWithoutExt = filename.replace(/\.[^/.]+$/, "");

    if (nameWithoutExt.length > 10) {
      return nameWithoutExt.substring(0, 10) + "...";
    }

    return nameWithoutExt;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  const getFileTypeClass = (type: string, filename: string) => {
    if (type.startsWith("image/")) {
      return "file-type-image";
    } else if (type === "application/pdf") {
      return "file-type-pdf";
    } else if (type.includes("text/") || filename.endsWith(".txt")) {
      return "file-type-txt";
    } else if (type.includes("javascript") || filename.endsWith(".js")) {
      return "file-type-js";
    } else if (type.includes("json") || filename.endsWith(".json")) {
      return "file-type-json";
    } else if (type.includes("audio/")) {
      return "file-type-audio";
    } else if (type.includes("video/")) {
      return "file-type-video";
    } else if (type.includes("zip") || type.includes("rar")) {
      return "file-type-archive";
    } else if (filename.endsWith(".doc") || filename.endsWith(".docx")) {
      return "file-type-doc";
    } else if (filename.endsWith(".xls") || filename.endsWith(".xlsx")) {
      return "file-type-xls";
    } else if (filename.endsWith(".html") || filename.endsWith(".htm")) {
      return "file-type-html";
    } else if (filename.endsWith(".css")) {
      return "file-type-css";
    } else {
      return "file-type-default";
    }
  };

  return (
    <div className="attached-file-item">
      <div
        className={`file-preview square-preview ${
          isUploading ? "uploading" : ""
        }`}
      >
        {isImage ? (
          <>
            {isUploading ? (
              <div className="upload-progress">
                <Spinner size="s" />
              </div>
            ) : (
              <img
                src={file?.url}
                alt={currentFile.name}
                className="file-image"
              />
            )}
          </>
        ) : (
          <div
            className={`file-extension ${
              isUploading ? "uploading" : ""
            } ${getFileTypeClass(currentFile.type, currentFile.name)}`}
          >
            <div className="file-content" title={currentFile.name}>
              <span className="extension-text">
                {getFileExtension(currentFile.name)}
              </span>
              <div className="file-details">
                <span className="file-name">
                  {getTruncatedFileName(currentFile.name)}
                </span>
                <span className="file-size">
                  {formatFileSize(currentFile.size)}
                </span>
              </div>
              {isUploading && (
                <div className="upload-progress">
                  <Spinner size="s" />
                </div>
              )}
            </div>
          </div>
        )}
        {showRemoveButton && onRemove && (
          <div className="remove-file-btn">
            <IconButton onClick={onRemove} disabled={disabled}>
              <Icon20Clear />
            </IconButton>
          </div>
        )}
      </div>
    </div>
  );
};
