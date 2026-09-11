import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface PublicConfig {
  siteTitle: string;
  announcement: string;
  sponsorQrUrl: string;
  sponsorLink: string;
  sponsorTitle: string;
  sponsorNotice: string;
  recommendedModels: { label: string; value: string; provider: 'openai' | 'gemini' }[];
  enableCustomActionDlc: boolean;
  enableCartridges: boolean;
  defaultEnableImageGen?: boolean;
  defaultImageModel?: string;
}

export interface AdminConfig {
  adminPasswordHash: string;
  siteTitle: string;
  announcement: string;
  sponsorQrUrl: string;
  sponsorLink: string;
  sponsorTitle: string;
  sponsorNotice: string;
  defaultProvider: 'openai' | 'gemini';
  defaultApiBase: string;
  defaultApiKey: string;
  defaultModel: string;
  defaultTemperature: number;
  enableImageGen?: boolean;
  defaultImageProvider?: 'pollinations' | 'openai';
  defaultImageModel?: string;
  defaultImageApiBase?: string;
  defaultImageApiKey?: string;
}

export interface UserRecord {
  id: string;
  email: string;
  nickname: string;
  passwordHash: string;
  isVip: boolean;
  hasCustomActionDlc: boolean;
  createdAt: number;
  redeemedCodes: string[];
}

export interface SponsorCodeRecord {
  code: string;
  type: 'vip' | 'custom_action_dlc' | 'all_access';
  isUsed: boolean;
  usedByEmail?: string;
  usedAt?: number;
  createdAt: number;
  note?: string;
}

export interface DatabaseSchema {
  adminConfig: AdminConfig;
  users: UserRecord[];
  sponsorCodes: SponsorCodeRecord[];
  cloudSaves: Record<string, any[]>; // email -> saves
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const DEFAULT_ADMIN_PASSWORD_HASH = hashPassword('admin123456');

const DEFAULT_DB: DatabaseSchema = {
  adminConfig: {
    adminPasswordHash: DEFAULT_ADMIN_PASSWORD_HASH,
    siteTitle: 'AI 文字冒險遊戲產生器',
    announcement: '🌟 歡迎來到文字冒險世界！支援自由配置第三方 API（DeepSeek / OpenRouter / OpenAI 等）與 Google Gemini，可自由匯入匯出遊戲進度！',
    sponsorQrUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=400&q=80',
    sponsorLink: 'https://buymeacoffee.com/arvincreator',
    sponsorTitle: '贊助開發者，解鎖專屬冒險特權',
    sponsorNotice: '贊助完成後，可在下方輸入發放的【贊助碼】即時啟動贊助會員或「自訂動作 DLC」權限！',
    defaultProvider: 'openai',
    defaultApiBase: 'https://api.deepseek.com/v1',
    defaultApiKey: '',
    defaultModel: 'deepseek-chat',
    defaultTemperature: 0.8,
    enableImageGen: true,
    defaultImageProvider: 'pollinations',
    defaultImageModel: 'flux',
    defaultImageApiBase: '',
    defaultImageApiKey: '',
  },
  users: [
    {
      id: 'usr_demo_admin',
      email: 'admin@rpg.com',
      nickname: '首席GM管理者',
      passwordHash: DEFAULT_ADMIN_PASSWORD_HASH,
      isVip: true,
      hasCustomActionDlc: true,
      createdAt: Date.now(),
      redeemedCodes: ['INITIAL_ADMIN'],
    }
  ],
  sponsorCodes: [
    {
      code: 'VIP-HERO-8888',
      type: 'vip',
      isUsed: false,
      createdAt: Date.now(),
      note: '新手贊助會員體驗碼',
    },
    {
      code: 'DLC-ACTION-9999',
      type: 'custom_action_dlc',
      isUsed: false,
      createdAt: Date.now(),
      note: '自訂動作DLC激活碼',
    },
    {
      code: 'ALL-ACCESS-VIP',
      type: 'all_access',
      isUsed: false,
      createdAt: Date.now(),
      note: '全功能解鎖神聖通行碼',
    }
  ],
  cloudSaves: {},
};

class StorageManager {
  private db: DatabaseSchema;

  constructor() {
    this.ensureDir();
    this.db = this.load();
  }

  private ensureDir() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private load(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          ...DEFAULT_DB,
          ...parsed,
          adminConfig: { ...DEFAULT_DB.adminConfig, ...(parsed.adminConfig || {}) },
        };
      }
    } catch (e) {
      console.error('Failed to read db.json, initializing default:', e);
    }
    this.save(DEFAULT_DB);
    return JSON.parse(JSON.stringify(DEFAULT_DB));
  }

  private save(data?: DatabaseSchema) {
    this.ensureDir();
    fs.writeFileSync(DB_FILE, JSON.stringify(data || this.db, null, 2), 'utf-8');
  }

  // Admin config
  public getAdminConfig(): AdminConfig {
    return this.db.adminConfig;
  }

  public getPublicConfig(): PublicConfig {
    const { adminConfig } = this.db;
    return {
      siteTitle: adminConfig.siteTitle,
      announcement: adminConfig.announcement,
      sponsorQrUrl: adminConfig.sponsorQrUrl,
      sponsorLink: adminConfig.sponsorLink,
      sponsorTitle: adminConfig.sponsorTitle,
      sponsorNotice: adminConfig.sponsorNotice,
      enableCustomActionDlc: true,
      enableCartridges: true,
      defaultEnableImageGen: adminConfig.enableImageGen !== false,
      defaultImageModel: adminConfig.defaultImageModel || 'flux',
      recommendedModels: [
        { label: 'DeepSeek-V3 (推荐，高智商高性价比)', value: 'deepseek-chat', provider: 'openai' },
        { label: 'DeepSeek-R1 (深度推理神作)', value: 'deepseek-reasoner', provider: 'openai' },
        { label: 'Gemini 2.5 Flash (快速稳定)', value: 'gemini-2.5-flash', provider: 'gemini' },
        { label: 'Gemini 2.5 Pro (深度叙事)', value: 'gemini-2.5-pro', provider: 'gemini' },
        { label: 'GPT-4o Mini (OpenAI)', value: 'gpt-4o-mini', provider: 'openai' },
        { label: 'Claude 3.5 Sonnet (OpenRouter)', value: 'anthropic/claude-3.5-sonnet', provider: 'openai' },
        { label: 'Qwen 2.5 72B (硅基流动/阿里)', value: 'Qwen/Qwen2.5-72B-Instruct', provider: 'openai' },
      ],
    };
  }

  public updateAdminConfig(updates: Partial<AdminConfig>, newPassword?: string): AdminConfig {
    if (newPassword && newPassword.trim().length >= 6) {
      updates.adminPasswordHash = hashPassword(newPassword.trim());
    }
    this.db.adminConfig = {
      ...this.db.adminConfig,
      ...updates,
    };
    this.save();
    return this.db.adminConfig;
  }

  public verifyAdminPassword(password: string): boolean {
    return hashPassword(password) === this.db.adminConfig.adminPasswordHash;
  }

  // User management
  public findUserByEmail(email: string): UserRecord | undefined {
    return this.db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  public findUserById(id: string): UserRecord | undefined {
    return this.db.users.find((u) => u.id === id);
  }

  public createUser(email: string, password: string, nickname: string): UserRecord {
    const existing = this.findUserByEmail(email);
    if (existing) {
      throw new Error('该邮箱已注册');
    }
    const user: UserRecord = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      email: email.trim().toLowerCase(),
      nickname: nickname.trim() || email.split('@')[0],
      passwordHash: hashPassword(password),
      isVip: false,
      hasCustomActionDlc: false,
      createdAt: Date.now(),
      redeemedCodes: [],
    };
    this.db.users.push(user);
    this.save();
    return user;
  }

  public verifyUser(email: string, password: string): UserRecord | null {
    const user = this.findUserByEmail(email);
    if (!user) return null;
    if (user.passwordHash !== hashPassword(password)) return null;
    return user;
  }

  public getAllUsers(): UserRecord[] {
    return this.db.users.map(({ passwordHash, ...safe }) => safe as UserRecord);
  }

  public updateUserPermissions(userId: string, updates: { isVip?: boolean; hasCustomActionDlc?: boolean }): UserRecord {
    const user = this.findUserById(userId);
    if (!user) throw new Error('未找到用户');
    if (typeof updates.isVip === 'boolean') user.isVip = updates.isVip;
    if (typeof updates.hasCustomActionDlc === 'boolean') user.hasCustomActionDlc = updates.hasCustomActionDlc;
    this.save();
    return user;
  }

  // Sponsor codes
  public getAllSponsorCodes(): SponsorCodeRecord[] {
    return this.db.sponsorCodes;
  }

  public createSponsorCodes(count: number, type: 'vip' | 'custom_action_dlc' | 'all_access', note?: string): SponsorCodeRecord[] {
    const created: SponsorCodeRecord[] = [];
    const prefix = type === 'vip' ? 'VIP' : type === 'custom_action_dlc' ? 'DLC' : 'ALL';
    for (let i = 0; i < count; i++) {
      const randomStr = crypto.randomBytes(4).toString('hex').toUpperCase();
      const code = `${prefix}-${randomStr}`;
      const record: SponsorCodeRecord = {
        code,
        type,
        isUsed: false,
        createdAt: Date.now(),
        note: note || `批量生成 ${type}`,
      };
      this.db.sponsorCodes.push(record);
      created.push(record);
    }
    this.save();
    return created;
  }

  public revokeSponsorCode(code: string): boolean {
    const idx = this.db.sponsorCodes.findIndex((c) => c.code.toUpperCase() === code.toUpperCase());
    if (idx !== -1) {
      this.db.sponsorCodes.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  public redeemSponsorCode(code: string, userEmail?: string): { success: boolean; message: string; codeType?: string } {
    const cleanCode = code.trim().toUpperCase();
    const record = this.db.sponsorCodes.find((c) => c.code.toUpperCase() === cleanCode);

    if (!record) {
      return { success: false, message: '无效的赞助码，请确认输入是否正确' };
    }
    if (record.isUsed) {
      return { success: false, message: `该赞助码已于 ${new Date(record.usedAt || 0).toLocaleString()} 被兑换使用` };
    }

    record.isUsed = true;
    record.usedAt = Date.now();
    record.usedByEmail = userEmail || 'guest';

    // If user is registered, grant perks
    if (userEmail) {
      const user = this.findUserByEmail(userEmail);
      if (user) {
        if (!user.redeemedCodes.includes(cleanCode)) {
          user.redeemedCodes.push(cleanCode);
        }
        if (record.type === 'vip' || record.type === 'all_access') {
          user.isVip = true;
        }
        if (record.type === 'custom_action_dlc' || record.type === 'all_access') {
          user.hasCustomActionDlc = true;
        }
      }
    }

    this.save();
    const typeLabel =
      record.type === 'vip'
        ? '赞助会员特权'
        : record.type === 'custom_action_dlc'
        ? '自订动作 DLC 权限'
        : '赞助会员 + 自订动作 DLC 全功能';

    return {
      success: true,
      message: `恭喜！已成功兑换 ${typeLabel}！`,
      codeType: record.type,
    };
  }

  // Cloud saves (严格保证零云端存储个人 API 密钥)
  public getCloudSaves(email: string): any[] {
    return this.db.cloudSaves[email.toLowerCase()] || [];
  }

  public saveCloudSaves(email: string, saves: any[]): void {
    // 强制递归过滤：绝不将任何用户的 API Key、配置、密文或令牌持久化至服务端数据库
    const sanitizeSaves = (obj: any): any => {
      if (!obj || typeof obj !== 'object') return obj;
      if (Array.isArray(obj)) return obj.map(sanitizeSaves);
      const clean: Record<string, any> = {};
      for (const [k, v] of Object.entries(obj)) {
        if (['apiKey', 'apiConfig', 'keyCipher', 'key_cipher', 'secretKey', 'token'].includes(k)) {
          continue;
        }
        clean[k] = sanitizeSaves(v);
      }
      return clean;
    };

    this.db.cloudSaves[email.toLowerCase()] = sanitizeSaves(saves);
    this.save();
  }
}

export const storage = new StorageManager();
