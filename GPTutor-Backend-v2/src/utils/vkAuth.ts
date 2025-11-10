import * as crypto from "crypto";
import { UserRepository } from "../repositories/UserRepository";

export function validateVKSignature(
  queryString: string,
  secretKey: string
): boolean {
  console.log({ queryString });
  console.log({ secretKey });
  try {
    // Handle both full URL and query string
    let params: URLSearchParams;

    if (queryString.startsWith("http")) {
      // Full URL
      const url = new URL(queryString);
      params = new URLSearchParams(url.search);
    } else {
      // Query string only
      params = new URLSearchParams(queryString);
    }

    const sign = params.get("sign");
    if (!sign) return false;

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
  } catch (error) {
    console.error("VK signature validation error:", error);
    return false;
  }
}

export function extractVKUserData(queryString: string) {
  try {
    // Handle both full URL and query string
    let params: URLSearchParams;

    if (queryString.startsWith("http")) {
      // Full URL
      const url = new URL(queryString);
      params = new URLSearchParams(url.search);
    } else {
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
  } catch (error) {
    console.error("Error extracting VK user data:", error);
    return null;
  }
}

export interface VKUserData {
  vk_user_id: string | null;
  vk_app_id: string | null;
  vk_is_app_user: string | null;
  vk_language: string | null;
  vk_platform: string | null;
  vk_ts: string | null;
}

export async function validateApiKey(
  apiKey: string,
  userRepository: UserRepository
): Promise<any> {
  try {
    if (!apiKey.startsWith("sk-")) {
      return null;
    }

    const user = await userRepository.findByApiKey(apiKey);

    if (!user || !user.isActive) {
      return null;
    }

    return user;
  } catch (error) {
    console.error("API key validation error:", error);
    return null;
  }
}

export async function authenticateUser(
  authHeader: string | undefined,
  vkSecretKey: string,
  userRepository: UserRepository
): Promise<any> {
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
