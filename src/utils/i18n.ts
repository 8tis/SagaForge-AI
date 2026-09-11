import { WorldGenre } from '../types';

export type AppLanguage = 'zh' | 'en';

export const I18N_TEXTS = {
  zh: {
    appTitle: 'SagaForge AI · 互动文字冒险引擎',
    appSubtitle: '自订第三方 API · 自由编织命运与冒险',
    tagline: '多世界线',
    cartridges: '卡带库',
    about: '关于网站',
    benefits: '会员福利',
    apiSettings: 'API 设置',
    saveLoad: '存档/读档',
    sponsor: '赞助支持',
    loginRegister: '登录 / 注册',
    adminPanel: '管理后台',
    logout: '登出',
    guestUser: '旅人贵宾',
    newAdventure: '开启新冒险',
    restartConfirm: '当前冒险尚未结束，重新开始将放弃当前未保存进度。确定要重新启程吗？',
    
    // Start Screen
    chooseWorld: '抉择世界观与时代背景',
    customWorldHint: '或自定义任何奇思妙想的世界观',
    characterSetting: '主角身世、动机与特征设定',
    presetCharacters: '推荐角色出身',
    customCharacterPlaceholder: '在此自由描绘你的主角：身世背景、性格特质、独有能力或宿命渊源...',
    startAdventureBtn: '凝铸世界线 · 踏入征程',
    generatingWorld: '时空法则交织中，正在推演世界线...',
    dlcEnabledNotice: '已激活自订奇思动作 DLC',
    dlcDisabledNotice: '自订动作 DLC 未激活',
    
    // Story Display
    turnPrefix: '第',
    turnSuffix: '幕',
    turnTotal: '共',
    turnsLabel: '幕',
    focusMode: '单幕翻页',
    timelineMode: '折叠长卷',
    prevTurn: '上一幕',
    nextTurn: '下一幕',
    jumpToLatest: '最新幕 ⚡',
    jumpToLatestAction: '跳回最新幕做抉择',
    viewingHistoryBanner: '正在回顾第 {turn} 幕历史档案（只读回顾模式）',
    returnToLatest: '返回最新第 {turn} 幕 ⏩',
    consequenceInherit: '承接抉择：',
    yourChoiceWas: '你当时做出的抉择：',
    chooseNextAction: '请抉择你的下一步行动：',
    keyHint: '（键盘数字键 1-{count}）',
    customActionPlaceholderDlc: '✨ 自订动作：自由输入任何奇思妙想行动（如：趁守卫分心时偷换钥匙...）',
    customActionPlaceholderLocked: '🔒 自订动作 DLC（赞助会员专属特权，点击右侧解锁）',
    executeAction: '执行',
    unlockDlc: '解锁DLC',
    copyStory: '复制全篇冒险文本',
    copiedSuccess: '已复制全篇史诗',
    copyStoryBtn: '复制历程文字',
    zoomInImage: '查看大图',
    redrawScene: '重新绘制本幕场景',
    sceneIllustration: '场景意境插画',
    imagePromptLabel: '意境提示词：',
    solveMiniGameBtn: '破解机关 / 小游戏',
    randomMechanismEvent: '随机机关事件',
    
    // Loading Experience
    deductionStageTitle: '阶段 {stage}/5：{name}',
    deductionTime: '推演耗时 {sec}s',
    survivalQuoteSource: '生存箴言轮播',
    diceWaitingPrompt: '等待片刻？点击右侧掷一枚「命运 D20 骰子」测手气',
    diceResultLabel: '本次掷骰点数：D20 = {val} / 20',
    rollDiceBtn: '掷命运检定骰',
    rollDiceAgain: '再掷一次',
    
    // Ending Card
    defeatTitle: '身死道消 · 冒险终局',
    victoryTitle: '加冕登峰 · 凯旋成就',
    openTitle: '天地浩瀚 · 余音开放结局',
    endingSubtitle: '你在此方世界线的历程已画下句点。你可以将本篇历程提炼为小说传记，或重开一段新的轮回。',
    generateBiographyBtn: '生成史诗冒险传记',
    restartNewAdventureBtn: '重开新冒险',
    
    // Character Panel
    characterStatus: '主角状态与行囊',
    hpLabel: '生命体征 (HP)',
    mpDefaultLabel: '法力 / 精神 (MP)',
    equippedGear: '当前装备与宝物',
    learnedSkills: '已习得技能与法诀',
    bagInventory: '随身物品栏',
    noItemsYet: '暂无随身携带物品',
    noSkillsYet: '尚未习得特殊技能',
    noGearYet: '身无长物，空手前行',
    useItemBtn: '使用道具',
    
    // Log Panel
    chronicleTitle: '世界线编年史',
    questLog: '主线与分支任务',
    activeQuests: '进行中任务',
    completedQuests: '已完成任务',
    failedQuests: '已失败',
    noQuests: '暂无任务记录',
    chronicleHistory: '各幕纪事',
    generateBiographyCard: '传记提炼',
    generateBiographyDesc: '将至今的所有剧情幕次交由 AI 撰写为一篇文采斐然、扣人心弦的个人史诗传记。',
    
    // Mini-Game
    puzzleTitle: '机关解谜挑战',
    submitAnswer: '验证解密',
    closePuzzle: '暂时关闭',
    successReward: '破解成功！获取丰厚奖励',
    failPenalty: '破解受挫！面临环境惩罚',
    inputPlaceholder: '请输入破解答案...',
    
    // Settings Modal
    settingsTitle: 'AI 模型与个人 API 密钥配置',
    settingsNotice: '🛡️ 隐私与安全保障：您配置的所有个人 API 密钥均通过高强度盐值加密【仅保存在您本地浏览器缓存】，绝不上传任何云端数据库！',
    apiProvider: 'AI 供应商',
    apiBaseUrl: 'API Base URL',
    apiKeyLabel: 'API Key',
    apiKeyPlaceholder: '输入个人 API Key（留空将尝试使用服务器公用配额）',
    fetchModelsBtn: '自动获取可用模型',
    fetchingModels: '正在拉取模型列表...',
    modelSelect: '选择使用模型',
    temperatureLabel: '创意发散度 (Temperature)',
    imageGenSettings: 'AI 场景绘图配置',
    enableImageGen: '开启场景沉浸配图',
    imageProviderLabel: '绘图服务商',
    imageModelLabel: '生图模型',
    saveSettingsBtn: '保存本地配置',
    settingsSaved: '配置已安全存入本地浏览器缓存',
    
    // Languages
    switchLang: 'Language / 语言',
  },
  en: {
    appTitle: 'SagaForge AI · Generative RPG Engine',
    appSubtitle: 'BYO API Keys · Forge Infinite Living Adventures',
    tagline: 'Multi-Lore',
    cartridges: 'Cartridges',
    about: 'About',
    benefits: 'Perks & DLC',
    apiSettings: 'API Settings',
    saveLoad: 'Save / Load',
    sponsor: 'Sponsor',
    loginRegister: 'Sign In / Register',
    adminPanel: 'Admin Panel',
    logout: 'Sign Out',
    guestUser: 'Guest Adventurer',
    newAdventure: 'New Journey',
    restartConfirm: 'Current adventure is ongoing. Restarting will discard unsaved progress. Are you sure you want to embark anew?',
    
    // Start Screen
    chooseWorld: 'Choose World Setting & Genre',
    customWorldHint: 'Or custom-craft any imaginative world lore',
    characterSetting: 'Protagonist Background & Identity',
    presetCharacters: 'Suggested Character Origins',
    customCharacterPlaceholder: 'Describe your hero: background origins, traits, unique abilities, or destiny vows...',
    startAdventureBtn: 'Forge Worldline · Embark on Journey',
    generatingWorld: 'Weaving cosmic laws, shaping the universe...',
    dlcEnabledNotice: 'Custom Imagination Action DLC Active',
    dlcDisabledNotice: 'Custom Action DLC Inactive',
    
    // Story Display
    turnPrefix: 'Act ',
    turnSuffix: '',
    turnTotal: 'Total ',
    turnsLabel: ' Acts',
    focusMode: 'Focus View',
    timelineMode: 'Timeline View',
    prevTurn: 'Prev Act',
    nextTurn: 'Next Act',
    jumpToLatest: 'Latest ⚡',
    jumpToLatestAction: 'Jump to Latest to Make Choices',
    viewingHistoryBanner: 'Reviewing Act {turn} Chronicles (Read-Only Archive)',
    returnToLatest: 'Return to Latest Act {turn} ⏩',
    consequenceInherit: 'Following Choice:',
    yourChoiceWas: 'Your Choice at that Moment:',
    chooseNextAction: 'Choose Your Next Action:',
    keyHint: '(Keys 1-{count})',
    customActionPlaceholderDlc: '✨ Custom Action: Type any creative action (e.g., steal keys while guards are distracted...)',
    customActionPlaceholderLocked: '🔒 Custom Action DLC (Exclusive sponsor perk, click right to unlock)',
    executeAction: 'Execute',
    unlockDlc: 'Unlock DLC',
    copyStory: 'Copy Full Epic Story',
    copiedSuccess: 'Epic Tale Copied to Clipboard',
    copyStoryBtn: 'Copy Chronicles',
    zoomInImage: 'Zoom In',
    redrawScene: 'Redraw Scene',
    sceneIllustration: 'Scene Illustration',
    imagePromptLabel: 'Visual Prompt:',
    solveMiniGameBtn: 'Solve Puzzle / Mini-Game',
    randomMechanismEvent: 'Sudden Encounter Mechanism',
    
    // Loading Experience
    deductionStageTitle: 'Stage {stage}/5: {name}',
    deductionTime: 'Deduction time {sec}s',
    survivalQuoteSource: 'Survival Axioms',
    diceWaitingPrompt: 'Waiting a moment? Roll a Destiny D20 to test your fortune',
    diceResultLabel: 'Destiny Check: D20 = {val} / 20',
    rollDiceBtn: 'Roll Destiny D20',
    rollDiceAgain: 'Roll Again',
    
    // Ending Card
    defeatTitle: 'Fallen Hero · Adventure Concluded',
    victoryTitle: 'Apex Triumph · Glorious Victory',
    openTitle: 'Vast Horizon · Open Destiny',
    endingSubtitle: 'Your chronicle in this realm has reached its turning point. You can distill this journey into an epic biography or begin a new reincarnation.',
    generateBiographyBtn: 'Generate Epic Biography',
    restartNewAdventureBtn: 'Start New Adventure',
    
    // Character Panel
    characterStatus: 'Character Stats & Pack',
    hpLabel: 'Vigor / Vitality (HP)',
    mpDefaultLabel: 'Mana / Energy (MP)',
    equippedGear: 'Equipped Gear & Relics',
    learnedSkills: 'Learned Skills & Spells',
    bagInventory: 'Inventory Pack',
    noItemsYet: 'No items in pack',
    noSkillsYet: 'No special skills acquired',
    noGearYet: 'Unarmed and unarmored',
    useItemBtn: 'Use Item',
    
    // Log Panel
    chronicleTitle: 'Worldline Chronicle',
    questLog: 'Quests & Objectives',
    activeQuests: 'Active Quests',
    completedQuests: 'Completed',
    failedQuests: 'Failed',
    noQuests: 'No active quest logs',
    chronicleHistory: 'Acts History',
    generateBiographyCard: 'Biographic Distillation',
    generateBiographyDesc: 'Synthesize all past journey turns into a breathtaking personal saga crafted by AI.',
    
    // Mini-Game
    puzzleTitle: 'Puzzle Mechanism Challenge',
    submitAnswer: 'Verify Solution',
    closePuzzle: 'Dismiss',
    successReward: 'Solved! Gained bountiful reward',
    failPenalty: 'Failed! Environmental penalty applied',
    inputPlaceholder: 'Type your solution here...',
    
    // Settings Modal
    settingsTitle: 'AI Model & Personal API Key Configuration',
    settingsNotice: '🛡️ Privacy & Security First: All personal API keys are encrypted with salted ciphers and stored EXCLUSIVELY in your local browser storage. Never sent to any cloud database!',
    apiProvider: 'AI Provider',
    apiBaseUrl: 'API Base URL',
    apiKeyLabel: 'API Key',
    apiKeyPlaceholder: 'Enter personal API key (leave blank to try public server quota)',
    fetchModelsBtn: 'Auto-Fetch Available Models',
    fetchingModels: 'Fetching available models...',
    modelSelect: 'Select AI Model',
    temperatureLabel: 'Creativity (Temperature)',
    imageGenSettings: 'AI Scene Illustration Settings',
    enableImageGen: 'Enable Scene Illustrations',
    imageProviderLabel: 'Image Provider',
    imageModelLabel: 'Image Model',
    saveSettingsBtn: 'Save Local Settings',
    settingsSaved: 'Settings safely saved to local browser storage',
    
    // Languages
    switchLang: 'Language / 语言',
  },
};

export const WORLD_GENRES_EN: Record<WorldGenre, { name: string; tagline: string; description: string; energyName: string }> = {
  奇幻: {
    name: 'High Fantasy & Sorcery',
    tagline: 'Ancient dragons awaken, lost runes glow, and chivalric oaths clash',
    description: 'A grand realm of ancient wyrms, arcane spires, and exotic kingdoms. Magic courses through the air as forgotten ruins await courageous explorers.',
    energyName: 'Mana (MP)',
  },
  科幻: {
    name: 'Hard Space Sci-Fi',
    tagline: 'Warp drives roar in the deafening silence of the interstellar void',
    description: 'Humanity has colonized the Orion Arm. Mega-corporations and orbital alliances vie across the stars, unraveling singularities and enigmatic alien relics.',
    energyName: 'Shield / Reactor',
  },
  武侠: {
    name: 'Wuxia Martial Realm',
    tagline: 'A blade unsheathed, Jianghu grievances settled under moonlit rivers',
    description: 'A world of wandering martial artists, hidden martial manual scriptures, honor, revenge, and breath-taking internal arts in ancient dynastic realms.',
    energyName: 'Inner Qi (Qi)',
  },
  仙侠: {
    name: 'Xianxia Cultivation',
    tagline: 'Defying mortal heavens, traversing lightning tribulations to immortality',
    description: 'A mystical universe of spiritual roots, flying swords, ancient sects, alchemy cauldrons, and the eternal quest to transcend mortality.',
    energyName: 'Spiritual Energy',
  },
  克苏鲁: {
    name: 'Lovecraftian Cosmic Horror',
    tagline: 'Ancient Old Ones stir; every whisper erodes mortal sanity',
    description: 'Fog-shrouded coastal hamlets, forbidden grim tomes, and cosmic entities beyond human comprehension. Knowledge is your greatest terror.',
    energyName: 'Sanity (SAN)',
  },
  宫斗: {
    name: 'Imperial Palace Intrigue',
    tagline: 'Silken robes hide poisoned daggers amidst gilded imperial courtyards',
    description: 'A perilous imperial court where smiles mask deadly conspiracy. Political factions, royal concubines, and court ministers contest the jade throne.',
    energyName: 'Favor & Influence',
  },
  赛博朋克: {
    name: 'Cyberpunk Neon Dystopia',
    tagline: 'High tech, low life. Neural cyberware glints under acid rain',
    description: 'Corporate conglomerates rule towering skyscrapers while rogue deckers and cyber-samurai roam rain-slicked alleyways beneath dazzling neon signs.',
    energyName: 'Computing Overclock',
  },
  末日生存: {
    name: 'Post-Apocalyptic Wasteland',
    tagline: 'Nuclear winter lingers; every drop of clean water is paid in blood',
    description: 'Civilization has collapsed into ash and irradiated ruins. Scavenge rusty scrap, ward off mutated horrors, and battle for the last remnants of survival.',
    energyName: 'Endurance / Stamina',
  },
  悬疑侦探: {
    name: 'Noir Mystery & Detective',
    tagline: 'Smoke and rain outside windowpanes, bloodstains on cold parquet floors',
    description: 'Victorian gaslight or 1940s noir cities. Untangle locked-room homicides, deceitful alibis, and insidious masterminds in a web of deduction.',
    energyName: 'Deduction Focus',
  },
};

export const SURVIVAL_QUOTES_EN = [
  { quote: 'A choice is a stone cast into time; ripples shape the cosmos.', source: 'Cyberhiking Survival Records' },
  { quote: 'Hypothermia strikes the instant wind spikes. Beware every unnoticed chill.', source: 'Wilderness Survival Codex' },
  { quote: 'Every gram of weight in your pack is a heavy stake wagered against death.', source: 'Extreme Expedition Fieldnotes' },
  { quote: 'In blinding fog, stopping to find your bearings demands far more grit than blind sprint.', source: 'Mist Crossing Guide' },
  { quote: 'When a blade leaves its sheath, destiny echoes. Subtle thoughts reshape causality.', source: 'Law of Causal Weave' },
  { quote: 'In dire peril, a scrap of dry bread and clean bandage saves you far better than a legendary blade.', source: 'Wanderer Reminiscence' },
  { quote: 'When gazing into the abyss, never forget to inspect your sanity and gas mask filters.', source: 'Old Investigator Testament' },
  { quote: 'True survivors do not gamble blindly; they simply brace for the coldest frost.', source: 'Explorer Inscriptions' },
];

export const DEDUCTION_STAGES_EN = [
  { icon: '🎲', title: 'Destiny Check', desc: 'Rolling D20 dice to determine fate branches and anomalous shifts...' },
  { icon: '🌌', title: 'Worldline Weaving', desc: 'Simulating environmental changes, faction dynamics, and evolving situations...' },
  { icon: '⚖️', title: 'Stats Resolution', desc: 'Calculating HP, Energy/Mana, gear durability, and inventory checks...' },
  { icon: '🎨', title: 'Scene Brushwork', desc: 'Visual diffusion artist is drafting and painting the scene illustration...' },
  { icon: '📜', title: 'Chronicle Inscription', desc: 'Destiny is sealed. Recording your choices and consequences into the saga...' },
];

export function getAppLanguage(): AppLanguage {
  if (typeof window === 'undefined') return 'zh';
  const saved = localStorage.getItem('app_language');
  if (saved === 'en' || saved === 'zh') return saved;
  if (typeof navigator !== 'undefined' && navigator.language && navigator.language.startsWith('en')) {
    return 'en';
  }
  return 'zh';
}

export function setAppLanguage(lang: AppLanguage) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('app_language', lang);
  }
}
