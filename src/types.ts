export type WorldGenre =
  | '奇幻'
  | '科幻'
  | '武侠'
  | '仙侠'
  | '克苏鲁'
  | '宫斗'
  | '赛博朋克'
  | '末日生存'
  | '悬疑侦探';

export interface Quest {
  id?: string;
  title: string;
  description: string;
  status: 'in_progress' | 'completed' | 'failed';
}

export interface CharacterState {
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  equipment: string[];
  skills: string[];
  inventory: string[];
  quests: Quest[];
  flags: Record<string, any>;
}

export type MiniGameType = 'password_lock' | 'equation_puzzle' | 'lockpick_qte' | 'wire_circuit';

export interface MiniGameChallenge {
  id: string;
  type: MiniGameType;
  title: string;
  description: string;
  difficulty?: 'easy' | 'normal' | 'hard';
  clue?: string;
  targetAnswer?: string;
  equationData?: {
    question: string;
    variableName?: string;
    leftSideExpr?: string;
    rightSideValue?: number;
    correctValue: number | string;
    hint?: string;
  };
  lockData?: {
    length?: number;
    codeType?: 'number' | 'text' | 'rune';
    hint?: string;
  };
  qteData?: {
    targetZoneStart: number;
    targetZoneWidth: number;
    speed?: number;
    requiredHits?: number;
  };
  wireData?: {
    wires: { id: string; color: string; label: string; isCorrect: boolean }[];
    hint: string;
  };
  rewardAction: string;
  penaltyAction: string;
  isCompleted?: boolean;
}

export interface StoryTurn {
  turnNumber: number;
  chapterTitle?: string;
  story: string;
  selectedAction?: string;
  timestamp: number;
  stateSnapshot: CharacterState;
  imageUrl?: string;
  imagePrompt?: string;
  imageModel?: string;
  miniGame?: MiniGameChallenge;
}

export interface AdventureResponseData {
  story: string;
  chapterTitle?: string;
  options: string[];
  state: CharacterState;
  isEnding: boolean;
  endingType?: 'none' | 'victory' | 'defeat' | 'open' | string;
  imageUrl?: string;
  imagePrompt?: string;
  imageModel?: string;
  visualPrompt?: string;
  miniGame?: MiniGameChallenge;
}

export interface AdventureSession {
  id: string;
  world: WorldGenre;
  characterDescription: string;
  turns: StoryTurn[];
  currentState: CharacterState;
  currentOptions: string[];
  isEnding: boolean;
  endingType?: string;
  currentMiniGame?: MiniGameChallenge | null;
  startedAt?: number;
  lastPlayedAt?: number;
}

export type ImageStylePreset =
  | 'cinematic'
  | 'anime'
  | 'ink_painting'
  | 'cyberpunk'
  | 'dark_fantasy';

export interface ApiConfig {
  provider: 'openai' | 'gemini';
  baseUrl: string;
  apiKey: string;
  keyCipher?: string;
  model: string;
  temperature: number;
  nsfwFilter: boolean;
  enableImageGen?: boolean;
  imageProvider?: 'pollinations' | 'openai';
  imageModel?: string;
  imageApiBase?: string;
  imageApiKey?: string;
  imageKeyCipher?: string;
  imageStyle?: ImageStylePreset;
}

export interface UserProfile {
  id: string;
  email: string;
  nickname: string;
  isVip: boolean;
  hasCustomActionDlc: boolean;
  redeemedCodes: string[];
}

export interface SaveSlot {
  id: string;
  name: string;
  savedAt: number;
  session: AdventureSession;
}

export interface GameCartridge {
  id: string;
  title: string;
  genre: WorldGenre;
  tagline: string;
  description: string;
  characterPreset: string;
  difficulty: '初阶' | '标准' | '硬核' | '极限' | '初階' | '標準' | '極限';
  badge?: string;
  author?: string;
}

export interface BiographyChapter {
  chapterNumber: number;
  title: string;
  content: string;
}

export interface BiographyData {
  title: string;
  preface: string;
  chapters: BiographyChapter[];
  epilogue: string;
}

export interface PublicSiteConfig {
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

export interface SponsorCodeItem {
  code: string;
  type: 'vip' | 'custom_action_dlc' | 'all_access';
  isUsed: boolean;
  usedByEmail?: string;
  usedAt?: number;
  createdAt: number;
  note?: string;
}
