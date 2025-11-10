import { API_BASE_URL } from "./config.js";

export interface UserProfile {
  id: number;
  vkId: number;
  balance: number;
  apiKey: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VkData {
  id: number;
  first_name: string;
  last_name: string;
  photo_200: string;
}

export interface ProfileResponse {
  message: string;
  vkData: VkData;
  user: UserProfile;
  timestamp: string;
}

export interface UpdateTokenResponse {
  message: string;
  newApiKey: string;
  user: Omit<UserProfile, "apiKey">;
  timestamp: string;
}

class ProfileApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${window.location}`,
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  async getProfile(): Promise<ProfileResponse> {
    return this.makeRequest<ProfileResponse>("/user");
  }

  async updateToken(): Promise<UpdateTokenResponse> {
    return this.makeRequest<UpdateTokenResponse>("/update-token", {
      method: "POST",
    });
  }
}

export const profileApi = new ProfileApiService();
