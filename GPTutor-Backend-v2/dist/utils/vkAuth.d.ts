import { UserRepository } from "../repositories/UserRepository";
export declare function validateVKSignature(queryString: string, secretKey: string): boolean;
export declare function extractVKUserData(queryString: string): {
    vk_user_id: string | null;
    vk_app_id: string | null;
    vk_is_app_user: string | null;
    vk_language: string | null;
    vk_platform: string | null;
    vk_ts: string | null;
} | null;
export interface VKUserData {
    vk_user_id: string | null;
    vk_app_id: string | null;
    vk_is_app_user: string | null;
    vk_language: string | null;
    vk_platform: string | null;
    vk_ts: string | null;
}
export declare function validateApiKey(apiKey: string, userRepository: UserRepository): Promise<any>;
export declare function authenticateUser(authHeader: string | undefined, vkSecretKey: string, userRepository: UserRepository): Promise<any>;
