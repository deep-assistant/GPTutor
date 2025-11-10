import { VKUserData } from "../utils/vkAuth";
import { UserRepository } from "../repositories/UserRepository";
import { User } from "@prisma/client";
export declare class AuthService {
    private userRepository;
    private vkAppId;
    private vkSecretKey;
    constructor(userRepository: UserRepository, vkAppId: string, vkSecretKey: string);
    authorizeVKUser(token: string): Promise<{
        vkData: VKUserData;
        dbUser: User;
    }>;
    updateUserToken(userId: string): Promise<User>;
}
