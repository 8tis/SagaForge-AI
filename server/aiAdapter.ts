import { GoogleGenAI, Type } from "@google/genai";
import { storage } from "./storage";

export interface AIRequestConfig {
  provider?: "openai" | "gemini";
  baseUrl?: string;
  apiKey?: string;
  keyCipher?: string;
  model?: string;
  temperature?: number;
  enableImageGen?: boolean;
  imageProvider?: "pollinations" | "openai";
  imageModel?: string;
  imageApiBase?: string;
  imageApiKey?: string;
  imageKeyCipher?: string;
  imageStyle?: string;
}

// -------------------------------------------------------------
// Secure API Key Encryption / Decryption Utilities
// Prevents plaintext API keys from being exposed in HTTP payloads
// -------------------------------------------------------------

const SALT_SECRET = "RPG_AI_SECURE_TOKEN_SALT_2026_xK9";

function rc4(key: string, bytes: number[]): number[] {
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

export function decryptApiKey(cipher?: string): string {
  if (!cipher || typeof cipher !== "string") return "";
  if (!cipher.startsWith("enc:v1:")) return cipher;
  try {
    const parts = cipher.split(":");
    if (parts.length !== 4) return "";
    const salt = parts[2];
    const cipherHex = parts[3];
    const key = SALT_SECRET + "_" + salt;
    const encBytes: number[] = [];
    for (let i = 0; i < cipherHex.length; i += 2) {
      encBytes.push(parseInt(cipherHex.substring(i, i + 2), 16));
    }
    const decBytes = rc4(key, encBytes);
    return new TextDecoder().decode(new Uint8Array(decBytes));
  } catch (err) {
    console.error("Failed to decrypt API key:", err);
    return "";
  }
}

export function encryptApiKey(apiKey?: string): string {
  if (!apiKey || typeof apiKey !== "string" || !apiKey.trim()) return "";
  const randomSalt = Math.random().toString(36).substring(2, 10);
  const key = SALT_SECRET + "_" + randomSalt;
  const textBytes = new TextEncoder().encode(apiKey.trim());
  const encBytes = rc4(key, Array.from(textBytes));
  let hex = "";
  for (let i = 0; i < encBytes.length; i++) {
    hex += encBytes[i].toString(16).padStart(2, "0");
  }
  return `enc:v1:${randomSalt}:${hex}`;
}

export interface SanitizedAdventureResponse {
  story: string;
  chapterTitle: string;
  options: string[];
  state: {
    hp: number;
    maxHp: number;
    mp: number;
    maxMp: number;
    equipment: string[];
    skills: string[];
    inventory: string[];
    quests: { id: string; title: string; description: string; status: "in_progress" | "completed" | "failed" }[];
    flags: Record<string, any>;
  };
  isEnding: boolean;
  endingType: string;
  visualPrompt?: string;
  imageUrl?: string;
  imageModel?: string;
  miniGame?: any;
}

// Structured JSON Schema for Gemini SDK
const adventureGeminiSchema = {
  type: Type.OBJECT,
  properties: {
    story: {
      type: Type.STRING,
      description: "200至400字左右的高品质第二人称叙事（必须使用'你'），描述场景感官、冲突挑战与当前局面。",
    },
    chapterTitle: {
      type: Type.STRING,
      description: "当前小节或场景标题，例如'破晓前的客栈'、'废土避难所的警报'。",
    },
    visualPrompt: {
      type: Type.STRING,
      description: "A vivid English description (25-45 words) capturing key environment, lighting, character pose, mood, weather for scene illustration. No text or dialogue.",
    },
    options: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "3到4个富有策略性、不同风险与风格的行动选项。若触发最终结局则为空数组[]。",
    },
    state: {
      type: Type.OBJECT,
      properties: {
        hp: { type: Type.INTEGER, description: "当前生命值（0至100）" },
        maxHp: { type: Type.INTEGER, description: "生命值上限（通常为100）" },
        mp: { type: Type.INTEGER, description: "当前魔法/内力/精力/理智值（0至100）" },
        maxMp: { type: Type.INTEGER, description: "精力上限（通常为50-100）" },
        equipment: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "当前装备与服饰武器列表",
        },
        skills: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "主角掌握的技能或法门列表",
        },
        inventory: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "背包中的随身物品及道具列表",
        },
        quests: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING, description: "任务名" },
              description: { type: Type.STRING, description: "任务目标说明" },
              status: { type: Type.STRING, description: "状态：in_progress, completed, failed" },
            },
            required: ["title", "description", "status"],
          },
          description: "当前进行中或已完成的任务日志",
        },
        flags: {
          type: Type.OBJECT,
          description: "记录关键剧情或状态标记的对象",
          properties: {
            event_flag: { type: Type.STRING },
          },
        },
      },
      required: ["hp", "maxHp", "mp", "maxMp", "equipment", "skills", "inventory", "quests"],
    },
    isEnding: {
      type: Type.BOOLEAN,
      description: "是否触发终局结局（死亡、达成史诗成就或游戏结束）",
    },
    endingType: {
      type: Type.STRING,
      description: "结局类型：none（继续冒险）、victory（光荣胜利）、defeat（战败身亡或陷落）、open（开放结局）",
    },
  },
  required: ["story", "chapterTitle", "options", "state", "isEnding"],
};

export function sanitizeAdventureOutput(raw: any, fallbackWorld: string = "未知纪元"): SanitizedAdventureResponse {
  const hp = typeof raw?.state?.hp === "number" ? Math.max(0, Math.min(raw.state.hp, raw.state.maxHp || 100)) : 100;
  const maxHp = typeof raw?.state?.maxHp === "number" ? Math.max(1, raw.state.maxHp) : 100;
  const mp = typeof raw?.state?.mp === "number" ? Math.max(0, Math.min(raw.state.mp, raw.state.maxMp || 80)) : 80;
  const maxMp = typeof raw?.state?.maxMp === "number" ? Math.max(1, raw.state.maxMp) : 80;

  // Optional mini-game challenge verification
  let miniGame = undefined;
  if (raw?.miniGame && typeof raw.miniGame === "object" && raw.miniGame.title) {
    const mg = raw.miniGame;
    const validTypes = ["password_lock", "equation_puzzle", "lockpick_qte", "wire_circuit"];
    const type = validTypes.includes(mg.type) ? mg.type : "password_lock";

    // Ensure targetAnswer is non-empty and non-hardcoded
    const dynamicRandomFallback = String(Math.floor(1000 + Math.random() * 9000));
    const targetAnswer = mg.targetAnswer
      ? String(mg.targetAnswer)
      : mg.equationData?.correctValue !== undefined
      ? String(mg.equationData.correctValue)
      : dynamicRandomFallback;

    miniGame = {
      id: mg.id || `mg_${Date.now()}`,
      type,
      title: String(mg.title || "神秘机关"),
      description: String(mg.description || "眼前出现了一处精密的机关暗锁，解开它或许能获得突破或宝藏。"),
      difficulty: ["easy", "normal", "hard"].includes(mg.difficulty) ? mg.difficulty : "normal",
      clue: mg.clue ? String(mg.clue) : undefined,
      targetAnswer,
      equationData: mg.equationData
        ? {
            question: String(mg.equationData.question || "2X + 4 = 16，求解 X 的数值"),
            variableName: String(mg.equationData.variableName || "X"),
            leftSideExpr: mg.equationData.leftSideExpr ? String(mg.equationData.leftSideExpr) : undefined,
            rightSideValue: typeof mg.equationData.rightSideValue === "number" ? mg.equationData.rightSideValue : 16,
            correctValue: mg.equationData.correctValue !== undefined ? mg.equationData.correctValue : 6,
            hint: mg.equationData.hint ? String(mg.equationData.hint) : undefined,
          }
        : undefined,
      lockData: mg.lockData
        ? {
            length: typeof mg.lockData.length === "number" ? mg.lockData.length : 4,
            codeType: mg.lockData.codeType || "number",
            hint: mg.lockData.hint ? String(mg.lockData.hint) : undefined,
          }
        : undefined,
      qteData: mg.qteData
        ? {
            targetZoneStart: typeof mg.qteData.targetZoneStart === "number" ? mg.qteData.targetZoneStart : 40,
            targetZoneWidth: typeof mg.qteData.targetZoneWidth === "number" ? mg.qteData.targetZoneWidth : 20,
            speed: typeof mg.qteData.speed === "number" ? mg.qteData.speed : 1,
            requiredHits: typeof mg.qteData.requiredHits === "number" ? mg.qteData.requiredHits : 2,
          }
        : undefined,
      wireData: mg.wireData
        ? {
            wires: Array.isArray(mg.wireData.wires)
              ? mg.wireData.wires
              : [
                  { id: "w1", color: "rose", label: "红色灵流回路", isCorrect: false },
                  { id: "w2", color: "cyan", label: "蓝色灵流回路", isCorrect: true },
                  { id: "w3", color: "emerald", label: "绿色灵流回路", isCorrect: false },
                ],
            hint: mg.wireData.hint ? String(mg.wireData.hint) : "依据线索切断正确的一根导线",
          }
        : undefined,
      rewardAction: mg.rewardAction
        ? String(mg.rewardAction)
        : "【机关破解成功】你凭借敏锐的洞察力解开了机关，密室大门应声开启，获得其中机缘！",
      penaltyAction: mg.penaltyAction
        ? String(mg.penaltyAction)
        : "【机关破解失误】警报骤响触发防御自卫反制，暗箭射出，你狼狈翻滚闪避！",
    };
  }

  // Contextual random event detection: if AI did not output explicit miniGame structure,
  // but the generated story explicitly narrates encountering a locked chest, cipher door, equation barrier, etc.
  if (!miniGame && typeof raw?.story === "string") {
    const storyText = raw.story;
    const isSciFi = fallbackWorld.includes("赛博") || fallbackWorld.includes("科幻") || fallbackWorld.includes("废土");

    if (
      (storyText.includes("密码") || storyText.includes("暗号") || storyText.includes("四位密码") || storyText.includes("天机锁") || storyText.includes("数字锁")) &&
      (storyText.includes("箱") || storyText.includes("门") || storyText.includes("暗格") || storyText.includes("石碑") || storyText.includes("终端") || storyText.includes("锁住"))
    ) {
      const d1 = Math.floor(Math.random() * 9) + 1;
      const d2 = Math.floor(Math.random() * 10);
      const d3 = Math.floor(Math.random() * 10);
      const d4 = Math.floor(Math.random() * 10);
      const randomPass = `${d1}${d2}${d3}${d4}`;

      miniGame = {
        id: `mg_detect_${Date.now()}`,
        type: "password_lock",
        title: isSciFi ? "战术终端/防爆舱加密锁" : "上古机关天机四象暗锁",
        description: "剧情中遭遇了紧闭的机关暗锁，需根据现场环境推演线索破译密码。",
        difficulty: "normal",
        clue: isSciFi
          ? `终端边缘用激光蚀刻着一组应急覆盖序列编号：“${randomPass}”。`
          : `石壁周围镌刻着天地玄黄卦象，隐现四象灵数印记：“${d1} · ${d2} · ${d3} · ${d4}”。`,
        targetAnswer: randomPass,
        lockData: { length: 4, codeType: "number", hint: isSciFi ? `序列编号 ${randomPass}` : `四象灵数 ${d1} ${d2} ${d3} ${d4}` },
        rewardAction: `【机关破解成功】伴随清脆的机括咬合声，密码 ${randomPass} 验证成功，暗锁应声开启，你获得了内部的丰厚机缘！`,
        penaltyAction: "【机关破解失误】密码错误警报骤响，防御暗箭射出，你翻滚闪避受了轻伤！",
      };
    } else if (
      (storyText.includes("方程") || storyText.includes("算式") || storyText.includes("配平") || storyText.includes("代数") || storyText.includes("天平")) &&
      (storyText.includes("结界") || storyText.includes("法阵") || storyText.includes("石碑") || storyText.includes("封印") || storyText.includes("平衡"))
    ) {
      const A = Math.floor(Math.random() * 4) + 2; // 2 to 5
      const X_ans = Math.floor(Math.random() * 7) + 3; // 3 to 9
      const B = Math.floor(Math.random() * 8) + 2; // 2 to 9
      const isAddition = Math.random() > 0.4;
      const C = isAddition ? A * X_ans + B : A * X_ans - B;
      const sign = isAddition ? "+" : "-";
      const expr = `${A}X ${sign} ${B}`;
      const question = `${expr} = ${C}，求解未知数 X 的整数值`;
      const hint = isAddition
        ? `两端同减 ${B} 得到 ${A}X = ${C - B}，两端除以 ${A} 即可算出 X = ${X_ans}`
        : `两端同加 ${B} 得到 ${A}X = ${C + B}，两端除以 ${A} 即可算出 X = ${X_ans}`;

      miniGame = {
        id: `mg_detect_${Date.now()}`,
        type: "equation_puzzle",
        title: isSciFi ? "反应堆能量配平方程" : "天平魔导灵能配平阵法",
        description: "眼前横亘着需要解出未知数配平的奇特机关，求解未知数 X 使其重归平衡。",
        difficulty: "normal",
        clue: `石碑或基准显示屏上浮现出古铭文：“${expr} = ${C}”，求解未知数 X。`,
        targetAnswer: String(X_ans),
        equationData: {
          question,
          variableName: "X",
          leftSideExpr: expr,
          rightSideValue: C,
          correctValue: X_ans,
          hint,
        },
        rewardAction: `【配平成功】你将未知数调节为 ${X_ans}，符文光芒大盛，法阵两极精准归平，阻挡在前的封印轰然消散！`,
        penaltyAction: "【配平失误】失衡的能量倒灌冲撞，强烈的气浪将你掀翻在地，内息受阻！",
      };
    } else if (
      (storyText.includes("撬锁") || storyText.includes("锁孔") || storyText.includes("锁芯") || storyText.includes("探针") || storyText.includes("机括暗孔") || storyText.includes("发条破绽")) &&
      (storyText.includes("门") || storyText.includes("宝箱") || storyText.includes("铁锁") || storyText.includes("铜锁") || storyText.includes("暗格"))
    ) {
      const speeds = [0.9, 1.1, 1.3];
      const speed = speeds[Math.floor(Math.random() * speeds.length)];
      const targetZoneStart = Math.floor(Math.random() * 35) + 30; // 30 to 65%
      const targetZoneWidth = Math.floor(Math.random() * 8) + 20; // 20 to 28%
      const requiredHits = Math.floor(Math.random() * 2) + 2; // 2 or 3

      miniGame = {
        id: `mg_detect_${Date.now()}`,
        type: "lockpick_qte",
        title: "锁芯微操破绽截停",
        description: "锁芯发条正在急速回旋振荡，需找准破绽卡位的瞬间精准截停锁定。",
        difficulty: "normal",
        qteData: {
          targetZoneStart,
          targetZoneWidth,
          speed,
          requiredHits,
        },
        rewardAction: "【撬锁成功】随着连续几声清脆脆响，弹子精准落入凹槽，铜锁应声弹开！",
        penaltyAction: "【撬锁失误】发条崩断反震，触发了防盗警铃，刺耳蜂鸣响彻四周！",
      };
    } else if (
      (storyText.includes("导线") || storyText.includes("灵流回路") || storyText.includes("自毁回路") || storyText.includes("剪断")) &&
      (storyText.includes("陷阱") || storyText.includes("回路") || storyText.includes("引线") || storyText.includes("炸药") || storyText.includes("核心"))
    ) {
      const wirePool = isSciFi
        ? [
            { color: "rose", label: "赤红高压主电缆", trait: "火" },
            { color: "cyan", label: "蔚蓝冷却灵流回路", trait: "水" },
            { color: "emerald", label: "青翠传感反馈回路", trait: "木" },
            { color: "amber", label: "金黄备用跳线导轨", trait: "金" },
            { color: "purple", label: "幽紫脉冲点火引线", trait: "雷" },
          ]
        : [
            { color: "rose", label: "烈火赤炎引线（火脉）", trait: "火" },
            { color: "cyan", label: "玄冥玄水引线（水脉）", trait: "水" },
            { color: "emerald", label: "万木青藤引线（木脉）", trait: "木" },
            { color: "amber", label: "厚土戊己引线（土脉）", trait: "土" },
            { color: "purple", label: "九天紫电引线（雷脉）", trait: "雷" },
          ];

      const shuffled = [...wirePool].sort(() => Math.random() - 0.5);
      const selected = shuffled.slice(0, 3);
      const correctIdx = Math.floor(Math.random() * 3);
      const correctWire = selected[correctIdx];

      const wires = selected.map((w, idx) => ({
        id: `w_${idx + 1}`,
        color: w.color,
        label: w.label,
        isCorrect: idx === correctIdx,
      }));

      const clue = isSciFi
        ? `战术手册记录：“当前核心过载，必须切断第 ${correctIdx + 1} 根【${correctWire.label}】方能平息能量！”`
        : `残卷秘箓提示：“生克有数，必须斩断第 ${correctIdx + 1} 根【${correctWire.label}】以破杀阵！”`;

      miniGame = {
        id: `mg_detect_${Date.now()}`,
        type: "wire_circuit",
        title: isSciFi ? "战术回路导线拆解" : "五行灵能回路抉择",
        description: "混乱的能量回路交错闪烁，需依据生克原理剪断正确的一根导线。",
        difficulty: "normal",
        clue,
        wireData: {
          wires,
          hint: `剪断第 ${correctIdx + 1} 根【${correctWire.label}】`,
        },
        rewardAction: `【拆解成功】随着第 ${correctIdx + 1} 根【${correctWire.label}】断开，回路火花瞬间平息，致命危机化险为夷！`,
        penaltyAction: "【拆解失误】短路电弧暴起，冲击波将你震退，受了外伤！",
      };
    }
  }

  return {
    story:
      typeof raw?.story === "string" && raw.story.trim().length > 0
        ? raw.story.trim()
        : "命运的齿轮悄然转动，四周的气氛变得诡谲而深邃，你的冒险已然开启……",
    chapterTitle: typeof raw?.chapterTitle === "string" ? raw.chapterTitle : "序章：初涉风云",
    visualPrompt: typeof raw?.visualPrompt === "string" && raw.visualPrompt.trim().length > 0 ? raw.visualPrompt.trim() : undefined,
    imageUrl: typeof raw?.imageUrl === "string" && raw.imageUrl.trim().length > 0 ? raw.imageUrl.trim() : undefined,
    options:
      Array.isArray(raw?.options) && raw.options.length > 0
        ? raw.options.map((o: any) => String(o).trim()).filter(Boolean)
        : ["仔细检视周遭环境与潜在危机", "整备身畔器物与符咒，蓄势以待", "寻觅同路之人或探查暗中动静"],
    state: {
      hp,
      maxHp,
      mp,
      maxMp,
      equipment: Array.isArray(raw?.state?.equipment) ? raw.state.equipment.map(String) : ["粗布行装"],
      skills: Array.isArray(raw?.state?.skills) ? raw.state.skills.map(String) : ["洞察敏锐"],
      inventory: Array.isArray(raw?.state?.inventory) ? raw.state.inventory.map(String) : ["随身干粮", "净水袋"],
      quests: Array.isArray(raw?.state?.quests)
        ? raw.state.quests.map((q: any) => ({
            id: q?.id || `q_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            title: q?.title ? String(q.title) : "初探险境",
            description: q?.description ? String(q.description) : "了解你身处的世界并寻找安全据点。",
            status: ["in_progress", "completed", "failed"].includes(q?.status) ? q.status : "in_progress",
          }))
        : [{ id: "q1", title: "初探险境", description: "了解你身处的世界并寻找安全据点。", status: "in_progress" }],
      flags: raw?.state?.flags && typeof raw.state.flags === "object" ? raw.state.flags : { world: fallbackWorld },
    },
    isEnding: Boolean(raw?.isEnding),
    endingType: raw?.endingType || "none",
    miniGame,
  };
}

export function extractJsonFromText(text: string): any {
  if (!text || typeof text !== "string") {
    throw new Error("模型未返回任何文本内容");
  }

  // Remove thinking process for reasoning models like DeepSeek-R1
  let clean = text.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();

  // Try direct parse first
  try {
    return JSON.parse(clean);
  } catch {
    // Look for markdown ```json blocks
    const match = clean.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1]);
      } catch {
        clean = match[1];
      }
    }

    // Try finding outer curly braces
    const firstBrace = clean.indexOf("{");
    const lastBrace = clean.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const candidate = clean.slice(firstBrace, lastBrace + 1);
      try {
        return JSON.parse(candidate);
      } catch (innerErr) {
        // Simple repair for trailing commas
        const repaired = candidate
          .replace(/,\s*([\]}])/g, "$1")
          .replace(/[\u201C\u201D]/g, '"') // Replace smart quotes
          .replace(/\n/g, " ");
        try {
          return JSON.parse(repaired);
        } catch {
          // fall through
        }
      }
    }
  }

  throw new Error(`无法从模型响应中提取出合法 JSON 结构：${text.slice(0, 150)}...`);
}

/**
 * Universal AI Caller: supports OpenAI-compatible endpoints & Google Gemini SDK
 */
export async function callAI(
  systemInstruction: string,
  userPrompt: string,
  customConfig?: AIRequestConfig
): Promise<string> {
  const adminConfig = storage.getAdminConfig();

  // Determine provider: priority: custom > adminConfig > env
  const provider =
    customConfig?.provider ||
    adminConfig.defaultProvider ||
    (process.env.GEMINI_API_KEY ? "gemini" : "openai");

  // Determine API Key: priority: custom (decrypted keyCipher or apiKey) > adminConfig > env
  let apiKey = customConfig?.apiKey?.trim();
  if (customConfig?.keyCipher) {
    const decrypted = decryptApiKey(customConfig.keyCipher);
    if (decrypted) {
      apiKey = decrypted.trim();
    }
  }

  if (!apiKey) {
    if (provider === "gemini") {
      apiKey = adminConfig.defaultApiKey?.trim() || process.env.GEMINI_API_KEY;
    } else {
      apiKey = adminConfig.defaultApiKey?.trim() || process.env.OPENAI_API_KEY || process.env.DEEPSEEK_API_KEY;
    }
  }

  if (!apiKey) {
    throw new Error(
      `未找到可用的 ${provider === "gemini" ? "Gemini" : "第三方"} API Key。请在设置面板中填入您的专属 Key，或由管理员在后台配置默认密钥。`
    );
  }

  const temperature =
    typeof customConfig?.temperature === "number"
      ? customConfig.temperature
      : adminConfig.defaultTemperature || 0.8;

  // 1. Google Gemini Native Protocol
  if (provider === "gemini") {
    const modelName = customConfig?.model?.trim() || adminConfig.defaultModel || "gemini-2.5-flash";
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: { "User-Agent": "text-rpg-generator" },
      },
    });

    const response = await ai.models.generateContent({
      model: modelName,
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature,
        responseMimeType: "application/json",
        responseSchema: adventureGeminiSchema,
      },
    });

    return response.text || "{}";
  }

  // 2. OpenAI-compatible Protocol (DeepSeek / OpenRouter / SiliconFlow / OpenAI / Ollama etc.)
  let baseUrl = (customConfig?.baseUrl?.trim() || adminConfig.defaultApiBase || "https://api.deepseek.com/v1").replace(
    /\/+$/,
    ""
  );

  // If user entered only base host without /v1, add /v1 if typical
  if (!baseUrl.includes("/v1") && !baseUrl.endsWith("/chat/completions")) {
    baseUrl = `${baseUrl}/v1`;
  }

  const targetUrl = baseUrl.endsWith("/chat/completions") ? baseUrl : `${baseUrl}/chat/completions`;
  const modelName = customConfig?.model?.trim() || adminConfig.defaultModel || "deepseek-chat";

  const systemContent = `${systemInstruction}\n\n【重要规范】：你必须且只能输出合法的 JSON 对象，不带有任何前言或总结！结构必须包含 story, chapterTitle, visualPrompt, options, state (hp, maxHp, mp, maxMp, equipment, skills, inventory, quests, flags), isEnding, endingType。`;

  const requestBody: any = {
    model: modelName,
    messages: [
      { role: "system", content: systemContent },
      { role: "user", content: userPrompt },
    ],
    temperature,
  };

  // Attempt json_object response format if model supports it
  if (!modelName.includes("deepseek-reasoner")) {
    requestBody.response_format = { type: "json_object" };
  }

  const response = await fetch(targetUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    let parsedErr = errorText;
    try {
      const errJson = JSON.parse(errorText);
      parsedErr = errJson.error?.message || errJson.message || errorText;
    } catch {
      // ignore
    }
    throw new Error(`第三方 API 请求失败 (${response.status}): ${parsedErr}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0];
  const content = choice?.message?.content;

  if (!content) {
    throw new Error("第三方 API 返回的消息体内容为空");
  }

  return content;
}

/**
 * Fetch available models from upstream API provider (OpenAI-compatible or Gemini)
 */
export async function fetchProviderModels(
  provider?: "openai" | "gemini",
  baseUrl?: string,
  apiKey?: string
): Promise<string[]> {
  const adminConfig = storage.getAdminConfig();
  const effectiveProvider = provider || adminConfig.defaultProvider || "openai";

  let effectiveKey = apiKey?.trim();
  if (!effectiveKey) {
    if (effectiveProvider === "gemini") {
      effectiveKey = adminConfig.defaultApiKey?.trim() || process.env.GEMINI_API_KEY;
    } else {
      effectiveKey =
        adminConfig.defaultApiKey?.trim() ||
        process.env.OPENAI_API_KEY ||
        process.env.DEEPSEEK_API_KEY;
    }
  }

  if (!effectiveKey) {
    throw new Error("未提供可用的 API Key，请先输入 Key 或在后台配置默认密钥。");
  }

  if (effectiveProvider === "gemini") {
    // Call Gemini models list API
    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${effectiveKey}`;
    const res = await fetch(targetUrl);
    if (!res.ok) {
      const errData: any = await res.json().catch(() => ({}));
      throw new Error(errData?.error?.message || `Gemini API 响应异常: ${res.statusText}`);
    }
    const data: any = await res.json();
    const models: string[] = (data.models || [])
      .filter(
        (m: any) =>
          m.supportedGenerationMethods?.includes("generateContent") ||
          (typeof m.name === "string" && m.name.includes("gemini"))
      )
      .map((m: any) => m.name.replace(/^models\//, ""));

    return models.length > 0
      ? models
      : ["gemini-2.5-flash", "gemini-2.5-pro", "gemini-2.0-flash", "gemini-1.5-pro"];
  } else {
    // OpenAI-compatible /v1/models
    const effectiveBase = (
      baseUrl?.trim() ||
      adminConfig.defaultApiBase ||
      "https://api.deepseek.com/v1"
    ).replace(/\/+$/, "");

    const targetUrl = `${effectiveBase}/models`;
    const res = await fetch(targetUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${effectiveKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      const errData: any = await res.json().catch(() => ({}));
      throw new Error(
        errData?.error?.message ||
          errData?.message ||
          `模型接口响应异常 (${res.status}): ${res.statusText}`
      );
    }

    const data: any = await res.json();
    const rawList = Array.isArray(data) ? data : data?.data || data?.models || [];
    const modelIds: string[] = rawList
      .map((item: any) => (typeof item === "string" ? item : item.id || item.name))
      .filter(Boolean);

    // Deduplicate and prioritize chat / instruct / flash models
    const unique = Array.from(new Set(modelIds)).sort((a, b) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      const aScore = aLower.includes("chat") || aLower.includes("instruct") || aLower.includes("flash") || aLower.includes("deepseek") ? 1 : 0;
      const bScore = bLower.includes("chat") || bLower.includes("instruct") || bLower.includes("flash") || bLower.includes("deepseek") ? 1 : 0;
      return bScore - aScore || a.localeCompare(b);
    });

    return unique.length > 0 ? unique : ["deepseek-chat", "deepseek-reasoner"];
  }
}

/**
 * World genre style descriptors to ensure extreme consistency with story atmosphere
 */
const WORLD_ART_STYLES: Record<string, string> = {
  奇幻: "epic high fantasy concept art, mystical ethereal lighting, majestic scenery, intricate digital painting, atmospheric, octane render, masterpiece, 8k",
  科幻: "cinematic science fiction, futuristic tech, volumetric neon lighting, unreal engine 5 render, sharp focus, atmospheric depth, 8k wallpaper",
  武侠: "traditional Chinese wuxia, mist-shrouded bamboo forest and mountains, ancient architecture, dynamic martial arts atmosphere, ink wash aesthetic",
  仙侠: "ethereal Chinese xianxia cultivation, floating celestial peaks, glowing dao spiritual aura, heavenly clouds, majestic grand fantasy painting",
  克苏鲁: "Lovecraftian cosmic dread, eldritch horror, ominous sickly green and deep purple fog, non-euclidean monolithic ancient ruins, dark concept art",
  赛博朋克: "cyberpunk 2077 aesthetic, rainy night neon-lit city, reflective asphalt, holographic displays, high-tech cybernetics, volumetric fog",
  末日生存: "cyberhiking desolate survival aesthetic, treacherous rugged wilderness, blizzard or arid wasteland ruins, weathered survivor gear, cinematic photography",
  悬疑侦探: "noir detective mystery, 1940s film composition, venetian shadows, misty lamplight, smoky moody interior, cinematic crime scene",
  宫斗: "grand imperial forbidden city court, intricate golden embroidery, silk robes, dramatic royal palace lighting, cinematic costume drama",
};

/**
 * High-aesthetic Art Style Presets
 */
const STYLE_PRESETS: Record<string, string> = {
  cinematic: "award-winning 35mm cinematic film photography, 8k resolution, photorealistic, dramatic natural lighting, volumetric fog, Unreal Engine 5 render, extremely detailed, depth of field, sharp focus, masterpiece",
  anime: "Makoto Shinkai style, Kyoto Animation aesthetic, vibrant glowing colors, stunning clouds, dynamic rim lighting, high quality anime visual novel CG, clean crisp lineart, masterpiece",
  ink_painting: "traditional Chinese ink wash painting, Shan Shui aesthetic, elegant brush strokes, poetic misty atmosphere, gold leaf accents, masterpiece, Xuan paper texture",
  cyberpunk: "cyberpunk 2077 aesthetic, octane render, neon pink and cyan illumination, rainy wet asphalt reflections, futuristic concept art, 8k wallpaper",
  dark_fantasy: "dark fantasy oil painting by Greg Rutkowski and Frank Frazetta, dramatic chiaroscuro lighting, epic atmosphere, hyperdetailed texture, museum masterpiece",
};

/**
 * Clean English concepts for each genre to prevent raw Chinese strings from creating deformed graphics
 */
const GENRE_ENGLISH_CONCEPT: Record<string, string> = {
  奇幻: "epic high fantasy realm, mystical glowing ancient forest, arcane crystalline ruins, dramatic sky",
  科幻: "futuristic science fiction world, deep space outpost, glowing high-tech interfaces, sleek starships",
  武侠: "ancient Chinese misty bamboo valley, mountain martial pavilion, tranquil waterfalls",
  仙侠: "ethereal Chinese celestial realm, floating mountain peaks, glowing spiritual dao energy, sea of clouds",
  克苏鲁: "Lovecraftian cosmic mystery, eerie dark green ocean fog, monolithic eldritch ruins, psychological dread",
  赛博朋克: "Blade Runner aesthetic neon rain metropolis, towering holographic skyscrapers, reflective wet streets",
  末日生存: "harsh desolate wilderness, treacherous icy mountain pass blizzard, rugged survival encampment, gritty realism",
  悬疑侦探: "1940s noir mystery, misty streetlamp, dramatic dark shadows, wet cobblestone alley",
  宫斗: "grand imperial Forbidden City courtyard, ornate red and gold palaces, majestic royal architecture",
};

/**
 * Generate Scene Image based on story context, world style, and model settings
 */
export async function generateSceneImage(
  visualPrompt: string | undefined,
  world: string,
  chapterTitle: string,
  storySnippet: string,
  customConfig?: AIRequestConfig
): Promise<{ imageUrl: string; prompt: string; model: string }> {
  const adminConfig = storage.getAdminConfig();

  // Determine style: custom preset > world default style
  const requestedStyle = customConfig?.imageStyle || "cinematic";
  const presetEnhancement = STYLE_PRESETS[requestedStyle] || STYLE_PRESETS.cinematic;
  const worldStyle = WORLD_ART_STYLES[world] || "cinematic atmosphere, detailed concept art, 8k, masterpiece";

  // Sanitize visual prompt: strip any Chinese characters to avoid FLUX text/distortion glitches
  let sanitizedPrompt = "";
  if (visualPrompt && typeof visualPrompt === "string") {
    sanitizedPrompt = visualPrompt.replace(/[\u4e00-\u9fa5]/g, " ").replace(/\s+/g, " ").trim();
  }

  // If sanitized prompt has too few words or was mostly Chinese, supplement with rich English genre concept
  const genreConcept = GENRE_ENGLISH_CONCEPT[world] || "dramatic adventure scene, brave explorer in treacherous realm";
  const sceneDescription =
    sanitizedPrompt.length > 15
      ? `${sanitizedPrompt}, ${genreConcept}`
      : `${genreConcept}, scene of adventure, cinematic perspective`;

  // Quality booster: guarantees composition quality and excludes text/watermarks
  const qualityBooster = "masterpiece, 8k resolution, photorealistic textures, dynamic composition, no text, no watermark, no logo, no bad anatomy, no blur";

  const finalPrompt = `${sceneDescription}, ${presetEnhancement}, ${worldStyle}, ${qualityBooster}`;
  const promptSeed = Math.floor(Math.random() * 1000000);

  // Auto-detect provider & model
  let provider = customConfig?.imageProvider || adminConfig.defaultImageProvider || "pollinations";
  const imageModel = customConfig?.imageModel?.trim() || adminConfig.defaultImageModel || "flux";

  const isSiliconFlow =
    imageModel.startsWith("black-forest-labs/") ||
    imageModel.includes("siliconflow") ||
    imageModel.startsWith("stabilityai/");
  const isOpenAI = imageModel.startsWith("dall-e");

  if (isSiliconFlow || isOpenAI) {
    provider = "openai";
  }

  // If OpenAI-compatible endpoint is configured and model is not pollinations flux
  if (provider === "openai" && (isSiliconFlow || isOpenAI || customConfig?.imageApiBase)) {
    try {
      // 1. Resolve API Key
      let apiKey = "";
      if (customConfig?.imageKeyCipher) {
        apiKey = decryptApiKey(customConfig.imageKeyCipher).trim();
      } else if (customConfig?.imageApiKey?.trim()) {
        apiKey = customConfig.imageApiKey.trim();
      }

      if (!apiKey && customConfig?.keyCipher) {
        apiKey = decryptApiKey(customConfig.keyCipher).trim();
      } else if (!apiKey && customConfig?.apiKey?.trim()) {
        apiKey = customConfig.apiKey.trim();
      }

      if (!apiKey) {
        apiKey =
          adminConfig.defaultImageApiKey?.trim() ||
          (isSiliconFlow ? process.env.SILICONFLOW_API_KEY : undefined) ||
          adminConfig.defaultApiKey?.trim() ||
          process.env.OPENAI_API_KEY ||
          "";
      }

      // 2. Resolve Base URL
      let baseUrl = "";
      if (customConfig?.imageApiBase?.trim()) {
        baseUrl = customConfig.imageApiBase.trim();
      } else if (isSiliconFlow) {
        baseUrl = "https://api.siliconflow.cn/v1";
      } else if (isOpenAI) {
        baseUrl = "https://api.openai.com/v1";
      } else if (customConfig?.baseUrl?.trim() && !customConfig.baseUrl.includes("deepseek")) {
        baseUrl = customConfig.baseUrl.trim();
      } else {
        baseUrl = adminConfig.defaultImageApiBase?.trim() || "https://api.openai.com/v1";
      }

      baseUrl = baseUrl.replace(/\/+$/, "");
      if (!baseUrl.includes("/v1") && !baseUrl.endsWith("/images/generations")) {
        baseUrl = `${baseUrl}/v1`;
      }
      const targetUrl = baseUrl.endsWith("/images/generations") ? baseUrl : `${baseUrl}/images/generations`;

      if (apiKey) {
        const payload: any = {
          model: imageModel,
          prompt: finalPrompt.slice(0, 800),
          n: 1,
        };

        if (imageModel === "dall-e-3") {
          payload.size = "1024x1024";
          payload.quality = "standard";
        } else if (isSiliconFlow || baseUrl.includes("siliconflow")) {
          payload.image_size = "1024x576";
        } else {
          payload.size = "1024x1024";
        }

        const res = await fetch(targetUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          const data = await res.json();
          const item = data.data?.[0];
          if (item?.url) {
            return { imageUrl: item.url, prompt: finalPrompt, model: imageModel };
          } else if (item?.b64_json) {
            return { imageUrl: `data:image/png;base64,${item.b64_json}`, prompt: finalPrompt, model: imageModel };
          }
        } else {
          const errText = await res.text();
          console.warn(`[ImageGen] External image API call failed (${targetUrl}):`, errText);
        }
      } else {
        console.warn(`[ImageGen] Missing API Key for image model ${imageModel}, falling back to Pollinations`);
      }
    } catch (err) {
      console.warn(`[ImageGen] Error calling external API for ${imageModel}:`, err);
    }
  }

  // Pollinations.ai with configured model
  let targetPollModel = "flux";
  const validPollModels = ["flux", "flux-realism", "flux-anime", "flux-3d", "flux-cablyai", "turbo", "midjourney"];
  const lower = imageModel.toLowerCase();
  if (validPollModels.includes(lower)) {
    targetPollModel = lower;
  } else if (!imageModel.includes("/") && !imageModel.startsWith("dall-e")) {
    targetPollModel = imageModel;
  }

  const encoded = encodeURIComponent(finalPrompt.slice(0, 420));
  const pollinationsUrl = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=576&nologo=true&model=${encodeURIComponent(targetPollModel)}&enhance=true&seed=${promptSeed}`;

  return { imageUrl: pollinationsUrl, prompt: finalPrompt, model: targetPollModel };
}

