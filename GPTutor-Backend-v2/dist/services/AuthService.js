"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const vkAuth_1 = require("../utils/vkAuth");
class AuthService {
    constructor(userRepository, vkAppId, vkSecretKey) {
        this.userRepository = userRepository;
        this.vkAppId = vkAppId;
        this.vkSecretKey = vkSecretKey;
    }
    async authorizeVKUser(token) {
        if (!(0, vkAuth_1.validateVKSignature)(token, this.vkSecretKey)) {
            throw new Error("Invalid VK signature");
        }
        const userData = (0, vkAuth_1.extractVKUserData)(token);
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
    async updateUserToken(userId) {
        const user = await this.userRepository.updateApiKey(userId);
        console.log(`Updated API key for user: ${userId}`);
        return user;
    }
}
exports.AuthService = AuthService;
