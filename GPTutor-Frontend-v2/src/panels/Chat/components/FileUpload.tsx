import React, { useRef, useState, useCallback } from "react";
import { WriteBarIcon } from "@vkontakte/vkui";
import { Icon28PictureOutline } from "@vkontakte/icons";
import "./FileUpload.css";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  accept?: string;
  multiple?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  onFileSelect,
  disabled = false,
  accept = "*/*",
  multiple = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach(file => {
      onFileSelect(file);
    });
  }, [onFileSelect]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(event.target.files);
    // Очищаем input для возможности повторного выбора того же файла
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = event.dataTransfer.files;
    handleFileSelect(files);
  }, [disabled, handleFileSelect]);

  return (
    <div 
      className={`file-upload-container ${isDragOver ? 'drag-over' : ''} ${disabled ? 'disabled' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleInputChange}
        style={{ display: 'none' }}
        disabled={disabled}
      />
      
      <WriteBarIcon
       mode="attach"
        onClick={handleButtonClick}
        disabled={disabled}
        className="file-upload-button"
        title="Прикрепить файл"
      >
      </WriteBarIcon>
      
      {isDragOver && (
        <div className="drag-overlay">
          <div className="drag-overlay-content">
            <Icon28PictureOutline />
            <span>Отпустите файлы для загрузки</span>
          </div>
        </div>
      )}
    </div>
  );
};
