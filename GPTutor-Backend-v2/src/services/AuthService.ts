import {
  validateVKSignature,
  extractVKUserData,
  VKUserData,
} from "../utils/vkAuth";
import { UserRepository } from "../repositories/UserRepository";
import { User } from "@prisma/client";

export class AuthService {
  private userRepository: UserRepository;
  private vkAppId: string;
  private vkSecretKey: string;

  constructor(
    userRepository: UserRepository,
    vkAppId: string,
    vkSecretKey: string
  ) {
    this.userRepository = userRepository;
    this.vkAppId = vkAppId;
    this.vkSecretKey = vkSecretKey;
  }

  async authorizeVKUser(
    token: string
  ): Promise<{ vkData: VKUserData; dbUser: User }> {
    if (!validateVKSignature(token, this.vkSecretKey)) {
      throw new Error("Invalid VK signature");
    }

    const userData = extractVKUserData(token);
    if (!userData || !userData.vk_user_id) {
      throw new Error("Invalid VK user data");
    }

    console.log(userData.vk_app_id);
    console.log(this.vkAppId);

    if (userData.vk_app_id !== this.vkAppId) {
      throw new Error("Invalid VK app ID");
    }

    let user = await this.userRepository.findByVkId(userData.vk_user_id);

    if (!user) {
      user = await this.userRepository.create({ vkId: userData.vk_user_id });
      console.log(`Created new user with VK ID: ${userData.vk_user_id}`);
    }

    return { vkData: userData, dbUser: user };
  }

  async updateUserToken(userId: string): Promise<User> {
    const user = await this.userRepository.updateApiKey(userId);
    console.log(`Updated API key for user: ${userId}`);
    return user;
  }
}
