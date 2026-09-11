/**
 * Client-side cryptographic helper for obfuscating/encrypting API keys
 * Ensures keys are never transmitted as raw plaintext in network requests.
 * Uses RC4-with-dynamic-salt stream cipher compatible with Node backend.
 */

const SALT_SECRET = "RPG_AI_SECURE_TOKEN_SALT_2026_xK9";

function rc4(key: string, bytes: Uint8Array | number[]): number[] {
  const s: number[] = [];
  for (let i = 0; i < 256; i++) s[i] = i;
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
    const tmp = s[i];
    s[i] = s[j];
    s[j] = tmp;
  }
  let i = 0;
  j = 0;
  const out: number[] = [];
  for (let k = 0; k < bytes.length; k++) {
    i = (i + 1) % 256;
    j = (j + s[i]) % 256;
    const tmp = s[i];
    s[i] = s[j];
    s[j] = tmp;
    out.push(bytes[k] ^ s[(s[i] + s[j]) % 256]);
  }
  return out;
}

/**
 * Encrypt an API key with a random salt. Output format: enc:v1:<salt>:<hexCipher>
 */
export function encryptApiKey(apiKey?: string): string {
  if (!apiKey || typeof apiKey !== 'string' || !apiKey.trim()) return '';
  const randomSalt = Math.random().toString(36).substring(2, 10);
  const key = SALT_SECRET + '_' + randomSalt;
  const textBytes = new TextEncoder().encode(apiKey.trim());
  const encBytes = rc4(key, textBytes);
  let hex = '';
  for (let i = 0; i < encBytes.length; i++) {
    hex += encBytes[i].toString(16).padStart(2, '0');
  }
  return `enc:v1:${randomSalt}:${hex}`;
}

/**
 * Sanitize apiConfig before sending across network:
 * 1. Strips plaintext apiKey completely!
 * 2. If user provided a personal key, converts it to encrypted keyCipher.
 * 3. If no personal key is provided, transmits clean config without any key fields.
 */
export function sanitizeApiConfig(config?: any): any {
  if (!config) return undefined;
  const {
    provider,
    baseUrl,
    model,
    temperature,
    apiKey,
    nsfwFilter,
    enableImageGen,
    imageProvider,
    imageModel,
    imageApiBase,
    imageApiKey,
    imageStyle,
  } = config;

  const clean: any = {
    provider,
    baseUrl,
    model,
    temperature,
    nsfwFilter,
    enableImageGen,
    imageProvider,
    imageModel,
    imageApiBase,
    imageStyle,
  };

  // 严格安全保障：明文 API Key 绝不上传网络请求，仅使用动态加盐混淆密文瞬时中转
  if (apiKey && typeof apiKey === 'string' && apiKey.trim()) {
    clean.keyCipher = encryptApiKey(apiKey.trim());
  }

  if (imageApiKey && typeof imageApiKey === 'string' && imageApiKey.trim()) {
    clean.imageKeyCipher = encryptApiKey(imageApiKey.trim());
  }

  return clean;
}
