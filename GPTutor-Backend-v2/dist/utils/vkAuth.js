"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateVKSignature = validateVKSignature;
exports.extractVKUserData = extractVKUserData;
exports.validateApiKey = validateApiKey;
exports.authenticateUser = authenticateUser;
const crypto = __importStar(require("crypto"));
function validateVKSignature(queryString, secretKey) {
    console.log({ queryString });
    console.log({ secretKey });
    try {
        // Handle both full URL and query string
        let params;
        if (queryString.startsWith("http")) {
            // Full URL
            const url = new URL(queryString);
            params = new URLSearchParams(url.search);
        }
        else {
            // Query string only
            params = new URLSearchParams(queryString);
        }
        const sign = params.get("sign");
        if (!sign)
            return false;
        params.delete("sign");
        const sortedParams = Array.from(params.entries())
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([key, value]) => `${key}=${value}`)
            .join("&");
        const hmac = crypto.createHmac("sha256", secretKey);
        hmac.update(sortedParams);
        const computedSign = hmac.digest("base64url");
        // Debug logging
        console.log("VK Signature validation:");
        console.log("Sorted params:", sortedParams);
        console.log("Received sign:", sign);
        console.log("Computed sign:", computedSign);
        console.log("Signatures match:", computedSign === sign);
        return computedSign === sign;
    }
    catch (error) {
        console.error("VK signature validation error:", error);
        return false;
    }
}
function extractVKUserData(queryString) {
    try {
        // Handle both full URL and query string
        let params;
        if (queryString.startsWith("http")) {
            // Full URL
            const url = new URL(queryString);
            params = new URLSearchParams(url.search);
        }
        else {
            // Query string only
            params = new URLSearchParams(queryString);
        }
        return {
            vk_user_id: params.get("vk_user_id"),
            vk_app_id: params.get("vk_app_id"),
            vk_is_app_user: params.get("vk_is_app_user"),
            vk_language: params.get("vk_language"),
            vk_platform: params.get("vk_platform"),
            vk_ts: params.get("vk_ts"),
        };
    }
    catch (error) {
        console.error("Error extracting VK user data:", error);
        return null;
    }
}
async function validateApiKey(apiKey, userRepository) {
    try {
        if (!apiKey.startsWith("sk-")) {
            return null;
        }
        const user = await userRepository.findByApiKey(apiKey);
        if (!user || !user.isActive) {
            return null;
        }
        return user;
    }
    catch (error) {
        console.error("API key validation error:", error);
        return null;
    }
}
async function authenticateUser(authHeader, vkSecretKey, userRepository) {
    if (authHeader && authHeader.startsWith("Bearer ")) {
        const apiKey = authHeader.substring(7);
        if (apiKey.startsWith("sk-")) {
            const user = await validateApiKey(apiKey, userRepository);
            if (user) {
                return { user, authType: "api_key" };
            }
        }
        if (validateVKSignature(apiKey, vkSecretKey)) {
            const vkData = extractVKUserData(apiKey);
            if (vkData && vkData.vk_user_id) {
                return { user: vkData, authType: "vk" };
            }
        }
    }
    return null;
}
