import { API_BASE_URL } from './config';

export interface FileInfo {
  id: string;
  name: string;
  type: string;
  url: string;
  size: number;
  createdAt: string;
}

export interface UploadFileResponse {
  message: string;
  file: FileInfo;
  timestamp: string;
}

export interface FilesListResponse {
  success: boolean;
  data: {
    message: string;
    files: FileInfo[];
    total: number;
    timestamp: string;
  };
}

export interface DeleteFileResponse {
  success: boolean;
  data: {
    message: string;
    fileId: string;
    timestamp: string;
  };
}

class FilesApi {
  private baseUrl = API_BASE_URL;

  async uploadFile(file: File): Promise<UploadFileResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseUrl}/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Upload response:', result); // Для отладки
    
    return result;
  }

  async getFiles(): Promise<FilesListResponse> {
    const response = await fetch(`${this.baseUrl}/files`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  async deleteFile(fileId: string): Promise<DeleteFileResponse> {
    const response = await fetch(`${this.baseUrl}/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.getAuthToken()}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  private getAuthToken(): string {
    // Используем тот же подход, что и в profileApi
    return window.location.toString();
  }
}

export const filesApi = new FilesApi();
