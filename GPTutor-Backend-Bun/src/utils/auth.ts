import { createHmac } from 'crypto';
import { config } from '../config/env';

export interface AuthResult {
  vkUserId: string;
  vkAppId: string;
  isTG: boolean;
}

/**
 * Check VK Mini Apps authorization
 */
export function checkVKAuth(queryString: string): AuthResult | null {
  try {
    const params = new URLSearchParams(queryString);
    const sign = params.get('sign');

    if (!sign) {
      return null;
    }

    params.delete('sign');

    // Sort parameters
    const sortedParams = Array.from(params.entries())
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

    // Build query string
    const queryStringForSign = sortedParams
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    // Calculate HMAC
    const secret = config.masterToken;
    const hash = createHmac('sha256', secret)
      .update(queryStringForSign)
      .digest('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    if (hash !== sign) {
      return null;
    }

    return {
      vkUserId: params.get('vk_user_id') || '0',
      vkAppId: params.get('vk_app_id') || '',
      isTG: false,
    };
  } catch (error) {
    console.error('VK auth check failed:', error);
    return null;
  }
}

/**
 * Check Telegram Mini Apps authorization
 */
export function checkTGAuth(initData: string): AuthResult | null {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');

    if (!hash) {
      return null;
    }

    params.delete('hash');

    // Sort parameters
    const sortedParams = Array.from(params.entries())
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB));

    // Build data check string
    const dataCheckString = sortedParams
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Calculate secret key
    const secretKey = createHmac('sha256', 'WebAppData')
      .update(config.tgToken)
      .digest();

    // Calculate hash
    const calculatedHash = createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (calculatedHash !== hash) {
      return null;
    }

    // Extract user ID
    const userJson = params.get('user');
    if (!userJson) {
      return null;
    }

    const user = JSON.parse(userJson);

    return {
      vkUserId: `tg${user.id}`,
      vkAppId: 'tg',
      isTG: true,
    };
  } catch (error) {
    console.error('TG auth check failed:', error);
    return null;
  }
}

/**
 * Parse authorization header
 */
export function parseAuthHeader(authHeader: string | null): AuthResult | null {
  if (!authHeader) {
    return null;
  }

  if (config.skipAuth) {
    // In skip auth mode, parse but don't validate
    if (authHeader.startsWith('Bearer ')) {
      const queryString = authHeader.substring(7);
      const params = new URLSearchParams(queryString);
      return {
        vkUserId: params.get('vk_user_id') || '0',
        vkAppId: params.get('vk_app_id') || '',
        isTG: false,
      };
    } else if (authHeader.startsWith('tma ')) {
      const initData = authHeader.substring(4);
      try {
        const params = new URLSearchParams(initData);
        const userJson = params.get('user');
        if (userJson) {
          const user = JSON.parse(userJson);
          return {
            vkUserId: `tg${user.id}`,
            vkAppId: 'tg',
            isTG: true,
          };
        }
      } catch (error) {
        // Fallback
      }
      return {
        vkUserId: '0',
        vkAppId: 'tg',
        isTG: true,
      };
    }
    return null;
  }

  // Normal auth mode
  if (authHeader.startsWith('Bearer ')) {
    const queryString = authHeader.substring(7);
    return checkVKAuth(queryString);
  } else if (authHeader.startsWith('tma ')) {
    const initData = authHeader.substring(4);
    return checkTGAuth(initData);
  }

  return null;
}
