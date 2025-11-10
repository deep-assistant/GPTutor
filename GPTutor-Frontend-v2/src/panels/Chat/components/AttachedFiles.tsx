import React, { useState, useEffect } from "react";
import { Div, DropZone, Placeholder } from "@vkontakte/vkui";
import { Icon28DocumentPlusOutline } from "@vkontakte/icons";
import { FileInfo } from "../../../api";
import { UploadingFile } from "../types";
import { FileDisplay } from "./FileDisplay";
import "./AttachedFiles.css";
import { observer } from "mobx-react-lite";

interface AttachedFilesProps {
  files: FileInfo[];
  uploadingFiles?: UploadingFile[];
  onFileRemove: (fileId: string) => void;
  onCancelUpload?: (uploadId: string) => void;
  onFileSelect?: (file: File) => void;
  disabled?: boolean;
}

export const AttachedFiles: React.FC<AttachedFilesProps> = observer(
  ({
    files,
    uploadingFiles = [],
    onFileRemove,
    onCancelUpload,
    onFileSelect,
    disabled = false,
  }) => {
    const [isDraggingOverWindow, setIsDraggingOverWindow] = useState(false);

    console.log("AttachedFiles render:", {
      files: files.length,
      uploadingFiles: uploadingFiles.length,
    });

    useEffect(() => {
      let dragCounter = 0;

      const handleWindowDragEnter = (e: DragEvent) => {
        dragCounter++;
        if (e.dataTransfer?.types.includes("Files")) {
          setIsDraggingOverWindow(true);
        }
      };

      const handleWindowDragLeave = () => {
        dragCounter--;
        if (dragCounter === 0) {
          setIsDraggingOverWindow(false);
        }
      };

      const handleWindowDrop = () => {
        dragCounter = 0;
        setIsDraggingOverWindow(false);
      };

      const handleWindowDragOver = (e: DragEvent) => {
        e.preventDefault();
      };

      window.addEventListener("dragenter", handleWindowDragEnter);
      window.addEventListener("dragleave", handleWindowDragLeave);
      window.addEventListener("drop", handleWindowDrop);
      window.addEventListener("dragover", handleWindowDragOver);

      return () => {
        window.removeEventListener("dragenter", handleWindowDragEnter);
        window.removeEventListener("dragleave", handleWindowDragLeave);
        window.removeEventListener("drop", handleWindowDrop);
        window.removeEventListener("dragover", handleWindowDragOver);
      };
    }, []);

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingOverWindow(false);

      if (disabled || !onFileSelect) return;

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles && droppedFiles.length > 0) {
        Array.from(droppedFiles).forEach((file) => {
          onFileSelect(file);
        });
      }
    };

    const hasFiles = files.length > 0 || uploadingFiles.length > 0;

    if (!hasFiles && !isDraggingOverWindow) {
      return null;
    }

    if (!hasFiles && isDraggingOverWindow) {
      return (
        <DropZone
          onDragOver={(event) => {
            event.preventDefault();
          }}
          onDrop={handleDrop}
        >
          {({ active }) => (
            <Placeholder
              icon={
                <Icon28DocumentPlusOutline
                  fill={active ? "var(--vkui--color_icon_accent)" : undefined}
                />
              }
              title="Загрузка файлов"
            >
              {active ? "Отпустите файлы здесь." : "Перенесите файл сюда."}
            </Placeholder>
          )}
        </DropZone>
      );
    }

    return (
      <DropZone
        onDragOver={(event) => {
          event.preventDefault();
        }}
        onDrop={handleDrop}
      >
        {({ active }) => (
          <>
            {active ? (
              <Placeholder
                icon={
                  <Icon28DocumentPlusOutline
                    fill={active ? "var(--vkui--color_icon_accent)" : undefined}
                  />
                }
                title="Загрузка файлов"
              >
                {active ? "Отпустите файлы здесь." : "Перенесите файл сюда."}
              </Placeholder>
            ) : (
              <Div
                className={`attached-files-container ${
                  active ? "drag-over" : ""
                }`}
              >
                {files.map((file) => (
                  <FileDisplay
                    key={file.id}
                    file={file}
                    showRemoveButton={true}
                    onRemove={() => onFileRemove(file.id)}
                    disabled={disabled}
                  />
                ))}

                {uploadingFiles.map((uploadingFile) => (
                  <FileDisplay
                    key={uploadingFile.id}
                    uploadingFile={uploadingFile}
                    showRemoveButton={true}
                    onRemove={() => onCancelUpload?.(uploadingFile.id)}
                    disabled={disabled}
                  />
                ))}
              </Div>
            )}
          </>
        )}
      </DropZone>
    );
  }
);
