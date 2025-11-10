import { MessageModel } from "./models";
import { UserViewModel } from "../../viewModels/UserViewModel";
import { FileInfo } from "../../api/filesApi";

/**
 * Типы для компонентов чата
 */

export interface ChatHeaderProps {
  isTyping: boolean;
  onBack: () => void;
}

export interface MessageListProps {
  messages: MessageModel[];
  userViewModel: UserViewModel;
  getUserName: () => string;
  onStartChat: () => void;
  isUploadingFiles?: boolean;
}

export interface MessageItemProps {
  message: MessageModel;
  userViewModel: UserViewModel;
  getUserName: () => string;
}

export interface UploadingFile {
  id: string;
  file: File;
  progress?: number;
}

export interface ChatInputProps {
  message: string;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  disabled?: boolean;
  currentModel: string;
  isOnlineMode?: boolean;
  onModelSelect: () => void;
  onOnlineModeToggle?: () => void;
  onClearMessages: () => void;
  attachedFiles?: FileInfo[];
  uploadingFiles?: UploadingFile[];
  onFileUpload?: (file: File) => void;
  onFileRemove?: (fileId: string) => void;
  onCancelUpload?: (uploadId: string) => void;
}
