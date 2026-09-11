import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { storage } from "./server/storage";
import {
  callAI,
  extractJsonFromText,
  sanitizeAdventureOutput,
  AIRequestConfig,
  fetchProviderModels,
  decryptApiKey,
  generateSceneImage,
} from "./server/aiAdapter";

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: "10mb" }));

// Helper to extract bearer token or custom header
function getAuthToken(req: Request): string | undefined {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) {
    return auth.slice(7).trim();
  }
  return req.headers["x-access-token"] as string | undefined;
}

// -------------------------------------------------------------
// Public & Config Endpoints
// -------------------------------------------------------------

app.get("/api/health", (_req: Request, res: Response) => {
  const adminConfig = storage.getAdminConfig();
  res.json({
    status: "ok",
    hasServerKey: !!(adminConfig.defaultApiKey || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY),
    defaultProvider: adminConfig.defaultProvider,
    defaultModel: adminConfig.defaultModel,
  });
});

app.get("/api/config/public", (_req: Request, res: Response) => {
  res.json(storage.getPublicConfig());
});

app.post("/api/models/fetch", async (req: Request, res: Response) => {
  try {
    const { provider, baseUrl, apiKey, keyCipher } = req.body;
    let resolvedKey = apiKey;
    if (keyCipher) {
      resolvedKey = decryptApiKey(keyCipher);
    }
    const models = await fetchProviderModels(provider, baseUrl, resolvedKey);
    return res.json({ status: "ok", models, count: models.length });
  } catch (err: any) {
    return res.status(400).json({ error: err?.message || "拉取模型列表失败" });
  }
});

// -------------------------------------------------------------
// User Authentication Endpoints
// -------------------------------------------------------------

app.post("/api/auth/register", (req: Request, res: Response) => {
  try {
    const { email, password, nickname } = req.body;
    if (!email || !password || password.length < 6) {
      return res.status(400).json({ error: "请提供合法的邮箱与至少6位的密码" });
    }
    const user = storage.createUser(email, password, nickname || "");
    const token = `usr_${user.id}_${Date.now()}`;
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        isVip: user.isVip,
        hasCustomActionDlc: user.hasCustomActionDlc,
        redeemedCodes: user.redeemedCodes,
      },
    });
  } catch (err: any) {
    return res.status(400).json({ error: err.message || "注册失败" });
  }
});

app.post("/api/auth/login", (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "请输入邮箱与密码" });
    }
    const user = storage.verifyUser(email, password);
    if (!user) {
      return res.status(401).json({ error: "邮箱或密码错误" });
    }
    const token = `usr_${user.id}_${Date.now()}`;
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        isVip: user.isVip,
        hasCustomActionDlc: user.hasCustomActionDlc,
        redeemedCodes: user.redeemedCodes,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "登录异常" });
  }
});

app.get("/api/auth/me", (req: Request, res: Response) => {
  const token = getAuthToken(req);
  if (!token || !token.startsWith("usr_")) {
    return res.json({ user: null });
  }
  const parts = token.split("_");
  const userId = parts.slice(1, -1).join("_");
  const user = storage.findUserById(userId);
  if (!user) {
    return res.json({ user: null });
  }
  return res.json({
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      isVip: user.isVip,
      hasCustomActionDlc: user.hasCustomActionDlc,
      redeemedCodes: user.redeemedCodes,
    },
  });
});

// -------------------------------------------------------------
// Sponsor & Code Redemption Endpoints
// -------------------------------------------------------------

app.post("/api/sponsor/redeem", (req: Request, res: Response) => {
  const { code, email } = req.body;
  if (!code || typeof code !== "string") {
    return res.status(400).json({ error: "请提供合法的赞助码" });
  }
  const result = storage.redeemSponsorCode(code, email);
  if (!result.success) {
    return res.status(400).json({ error: result.message });
  }

  let updatedUser = null;
  if (email) {
    const user = storage.findUserByEmail(email);
    if (user) {
      updatedUser = {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        isVip: user.isVip,
        hasCustomActionDlc: user.hasCustomActionDlc,
        redeemedCodes: user.redeemedCodes,
      };
    }
  }

  return res.json({
    message: result.message,
    codeType: result.codeType,
    user: updatedUser,
  });
});

// -------------------------------------------------------------
// Admin Management Endpoints
// -------------------------------------------------------------

function requireAdmin(req: Request, res: Response, next: () => void) {
  const auth = req.headers["x-admin-key"] as string | undefined;
  if (auth && storage.verifyAdminPassword(auth)) {
    return next();
  }
  return res.status(403).json({ error: "管理权限校验失败，请提供正确的管理员密钥" });
}

app.post("/api/admin/login", (req: Request, res: Response) => {
  const { password } = req.body;
  if (!password || !storage.verifyAdminPassword(password)) {
    return res.status(401).json({ error: "管理员密码错误" });
  }
  return res.json({ status: "ok", token: password });
});

app.get("/api/admin/config", requireAdmin, (_req: Request, res: Response) => {
  const cfg = storage.getAdminConfig();
  const { adminPasswordHash, ...safeCfg } = cfg;
  res.json(safeCfg);
});

app.post("/api/admin/config", requireAdmin, (req: Request, res: Response) => {
  try {
    const { newPassword, ...updates } = req.body;
    const updated = storage.updateAdminConfig(updates, newPassword);
    const { adminPasswordHash, ...safeCfg } = updated;
    res.json({ message: "配置更新成功", config: safeCfg });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "更新配置失败" });
  }
});

app.get("/api/admin/codes", requireAdmin, (_req: Request, res: Response) => {
  res.json(storage.getAllSponsorCodes());
});

app.post("/api/admin/codes", requireAdmin, (req: Request, res: Response) => {
  try {
    const { count = 1, type = "vip", note } = req.body;
    const created = storage.createSponsorCodes(
      Math.min(50, Math.max(1, parseInt(count, 10))),
      type,
      note
    );
    res.json({ message: `成功生成 ${created.length} 个赞助码`, codes: created });
  } catch (err: any) {
    res.status(500).json({ error: err.message || "生成赞助码失败" });
  }
});

app.delete("/api/admin/codes/:code", requireAdmin, (req: Request, res: Response) => {
  const success = storage.revokeSponsorCode(req.params.code);
  res.json({ success });
});

app.get("/api/admin/users", requireAdmin, (_req: Request, res: Response) => {
  res.json(storage.getAllUsers());
});

app.post("/api/admin/users/:userId", requireAdmin, (req: Request, res: Response) => {
  try {
    const { isVip, hasCustomActionDlc } = req.body;
    const updated = storage.updateUserPermissions(req.params.userId, { isVip, hasCustomActionDlc });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message || "更新用户权限失败" });
  }
});

// -------------------------------------------------------------
// Cloud / Game Cache Saves Endpoints
// -------------------------------------------------------------

app.get("/api/saves", (req: Request, res: Response) => {
  const token = getAuthToken(req);
  if (!token || !token.startsWith("usr_")) {
    return res.json({ saves: [] });
  }
  const userId = token.split("_").slice(1, -1).join("_");
  const user = storage.findUserById(userId);
  if (!user) return res.json({ saves: [] });
  return res.json({ saves: storage.getCloudSaves(user.email) });
});

app.post("/api/saves", (req: Request, res: Response) => {
  const token = getAuthToken(req);
  if (!token || !token.startsWith("usr_")) {
    return res.status(401).json({ error: "请登录后同步云端存档" });
  }
  const userId = token.split("_").slice(1, -1).join("_");
  const user = storage.findUserById(userId);
  if (!user) return res.status(401).json({ error: "用户不存在" });

  const { saves } = req.body;
  if (!Array.isArray(saves)) {
    return res.status(400).json({ error: "存档数据格式不正确" });
  }
  storage.saveCloudSaves(user.email, saves);
  return res.json({ message: "云端存档已成功同步" });
});

// -------------------------------------------------------------
// Adventure Endpoints (Universal AI support)
// -------------------------------------------------------------

app.post("/api/adventure/start", async (req: Request, res: Response) => {
  try {
    const { world, character, apiConfig } = req.body as {
      world: string;
      character: string;
      apiConfig?: AIRequestConfig;
    };

    if (!world || !character) {
      return res.status(400).json({ error: "请提供世界观设定与角色描述" });
    }

    const systemPrompt = `你是一个大师级互动文字冒险游戏主持人（GM）与奇幻小说作家。
必须使用第二人称叙事（“你……”），行文沉浸感强、文学张力丰沛，注重感官刻画。
严格遵守世界观设定，根据角色的身份、特质与宿命生成专属于TA的震撼开局。
设计合理的基础数值、初始装备、习得技能、物品栏、主线任务及命运印记。
故事正文长度在 250 至 450 字之间。末尾提供 3 到 4 个有深度、各具风险与策略的下一步行动选项。
必须且只能输出严格合法的 JSON 对象！结构：
{
  "chapterTitle": "场景或章节小标题",
  "visualPrompt": "A vivid 25-word English visual scene description of the environment, lighting, weather, camera angle and main subject. MUST BE ENGLISH ONLY, NO CHINESE.",
  "story": "250-450字第二人称叙述",
  "options": ["选项1", "选项2", "选项3"],
  "state": {
    "hp": 100, "maxHp": 100,
    "mp": 80, "maxMp": 80,
    "equipment": ["装备1", "装备2"],
    "skills": ["技能1", "技能2"],
    "inventory": ["物品1", "物品2"],
    "quests": [{"id": "q1", "title": "任务名", "description": "说明", "status": "in_progress"}],
    "flags": {"world": "${world}"}
  },
  "isEnding": false,
  "endingType": "none"
}`;

    const userPrompt = `【开局启程】：
- 故事世界观：${world}
- 角色设定与特质：${character}

请立即构筑开局，赋予主角初始状态、行装与目标，并给出行动抉择。严格以 JSON 格式输出。`;

    const rawOutput = await callAI(systemPrompt, userPrompt, apiConfig);
    const parsed = extractJsonFromText(rawOutput);
    const sanitized = sanitizeAdventureOutput(parsed, world);

    // Optional scene image generation
    const adminCfg = storage.getAdminConfig();
    const shouldGenImage =
      apiConfig?.enableImageGen !== undefined ? apiConfig.enableImageGen : adminCfg.enableImageGen !== false;
    if (shouldGenImage) {
      try {
        const imgResult = await generateSceneImage(
          sanitized.visualPrompt,
          world,
          sanitized.chapterTitle,
          sanitized.story,
          apiConfig
        );
        sanitized.imageUrl = imgResult.imageUrl;
        sanitized.imageModel = imgResult.model;
      } catch (imgErr) {
        console.warn("Failed to generate scene image for start:", imgErr);
      }
    }

    return res.json(sanitized);
  } catch (error: any) {
    console.error("Adventure Start Error:", error);
    return res.status(500).json({
      error: error?.message || "开启新冒险时遭遇时空紊乱，请检查 API 配置或重试。",
    });
  }
});

app.post("/api/adventure/act", async (req: Request, res: Response) => {
  try {
    const { world, character, historySummary, currentState, action, apiConfig } = req.body as {
      world: string;
      character: string;
      historySummary?: string;
      currentState: any;
      action: string;
      apiConfig?: AIRequestConfig;
    };

    if (!world || !character || !action) {
      return res.status(400).json({ error: "缺少推动剧情所需的必要信息" });
    }

    const systemPrompt = `你是一个大师级互动文字冒险游戏主持人（GM）。
第二人称叙事（“你……”），笔触紧凑生动，充满博弈感与戏剧性。
严格根据玩家的选择或自定义行动推进故事：
- 细致描写行动的结果、周围环境的反馈与意外事件。
- 动态调整生命值 (hp)、能量 (mp)，合理消耗或获得装备 (equipment)、物品 (inventory)、领悟技能 (skills)。
- 推进或结案任务 (quests: in_progress / completed / failed)。
- 若玩家达成最终胜利、不幸死亡或尘埃落定，将 isEnding 置为 true，endingType 置为 victory/defeat/open。若游戏继续，给出 3-4 个新行动选项。
- 包含 "visualPrompt": 一段精炼优美的 25 词英文场景画面描述（环境、光影、天气、构图与主体状态，用于 AI 绘画），必须纯英文！
- 【突发机关随机事件机制（重要）】：
  小游戏绝非每一幕都出现，而是作为【探索途中的突发随机奇遇/险境事件】！
  当且仅当本幕情节刚好触发了相符的随机奇遇（例如在遗迹/密室/宝库中偶遇封印暗锁、发现密码箱、触动陷阱需要截停撬锁、面临失控法阵回路需要剪线）时，才触发小游戏并在 JSON 中附加 "miniGame" 字段。
  【解密内容严禁固定硬编码，每次都必须由你动态构思独特专属内容】：
  * password_lock: 密码暗锁。必须由你构思一个全新的随机数字密码 targetAnswer（如 "4826"、"7193" 等），并在 clue 和 story 中巧妙给出提示（例如诗歌藏字、生辰八字、纪年残碑、刻在刀柄侧面的暗号代号等，让玩家可以通过观察故事与推理得出答案！），包含 lockData { length: 4, codeType: "number", hint }。
  * equation_puzzle: 方程配平/代数封印。由你动态设计一道有唯一整数解的一元一次方程（例如 "3X + 7 = 28" 求 X=7，或者 "4X - 8 = 16" 求 X=6），提供 equationData { question, variableName: "X", leftSideExpr: "3X + 7", rightSideValue: 28, correctValue: 7, hint }，并在 story 中生动描绘法阵石碑或天平两臂铭文！
  * lockpick_qte: 锁芯微操破绽截停。动态配置 qteData { targetZoneStart, targetZoneWidth, speed, requiredHits }。
  * wire_circuit: 灵脉/导线回路拆解。动态生成 3-4 根不同属性或颜色的导线 wireData { wires: [{ id, color, label, isCorrect }], hint }，其中仅有一根为正解，并在 story 和 clue 中依据相生相克或战术手册给出推理线索！
  每次附带专属的 rewardAction（解开机关的丰厚收获抉择）与 penaltyAction（触发机关反噬的剧情惩罚抉择）。
  触发时，story 正文必须紧密描写该机关并在剧情中融入解谜线索！
  若本幕属于普通的交谈、赶路、常规战斗、客栈休整等未遭遇此类机关的情节，绝对不要附加 miniGame 字段（设为 undefined 或不返回）！
故事长度在 250 至 450 字之间。必须且只能输出严格合法的 JSON 对象！`;

    const userPrompt = `【剧情演进】：
- 世界观：${world}
- 主角设定：${character}
- 前情提要：
${historySummary || "初入险境，风云初起。"}
- 当前角色状态：
${JSON.stringify(currentState || {}, null, 2)}
- 玩家决定的行动：
"${action}"

请演进故事并更新状态，严格以 JSON 格式输出。`;

    const rawOutput = await callAI(systemPrompt, userPrompt, apiConfig);
    const parsed = extractJsonFromText(rawOutput);
    const sanitized = sanitizeAdventureOutput(parsed, world);

    // Optional scene image generation
    const adminCfg = storage.getAdminConfig();
    const shouldGenImage =
      apiConfig?.enableImageGen !== undefined ? apiConfig.enableImageGen : adminCfg.enableImageGen !== false;
    if (shouldGenImage) {
      try {
        const imgResult = await generateSceneImage(
          sanitized.visualPrompt,
          world,
          sanitized.chapterTitle,
          sanitized.story,
          apiConfig
        );
        sanitized.imageUrl = imgResult.imageUrl;
        sanitized.imageModel = imgResult.model;
      } catch (imgErr) {
        console.warn("Failed to generate scene image for act:", imgErr);
      }
    }

    return res.json(sanitized);
  } catch (error: any) {
    console.error("Adventure Act Error:", error);
    return res.status(500).json({
      error: error?.message || "推演因果时遭遇未知阻碍，请检查 API 配置或重试。",
    });
  }
});

app.post("/api/adventure/regenerate-image", async (req: Request, res: Response) => {
  try {
    const { visualPrompt, world, chapterTitle, story, apiConfig } = req.body;
    const imgResult = await generateSceneImage(
      visualPrompt,
      world || "奇幻",
      chapterTitle || "场景",
      story || "",
      apiConfig
    );
    return res.json({ imageUrl: imgResult.imageUrl, prompt: imgResult.prompt, model: imgResult.model });
  } catch (error: any) {
    console.error("Regenerate Image Error:", error);
    return res.status(500).json({ error: error?.message || "重新生成插画失败" });
  }
});

// -------------------------------------------------------------
// Adventure Biography & Novel Generation Endpoint
// -------------------------------------------------------------

app.post("/api/adventure/biography", async (req: Request, res: Response) => {
  try {
    const { world, character, turns, apiConfig } = req.body;
    if (!Array.isArray(turns) || turns.length === 0) {
      return res.status(400).json({ error: "没有足够的冒险记录可供编撰传记" });
    }

    const turnsSummary = turns
      .map(
        (t: any, idx: number) =>
          `【第${idx + 1}幕 - ${t.chapterTitle || "历程"}】\n故事概要：${t.story.slice(0, 150)}...\n选择行动：${
            t.selectedAction || "推进"
          }`
      )
      .join("\n\n");

    const systemPrompt = `你是一位享誉大陆的传奇史官与传记文学巨匠。
你的任务是将玩家的文字冒险记录提炼、升华为一部文笔优美、荡气回肠的短篇传奇小说（分5个篇章）。
请以具有史诗质感的第三人称或第一人称回忆体撰写，突出主角的坚韧、困境与抉择。
必须且只能返回 JSON 格式：
{
  "title": "史诗书名（例如《银月与断剑之歌》）",
  "preface": "序言或卷首语（100字左右）",
  "chapters": [
    { "chapterNumber": 1, "title": "第一章标题", "content": "200-300字精彩正文" },
    { "chapterNumber": 2, "title": "第二章标题", "content": "200-300字精彩正文" },
    { "chapterNumber": 3, "title": "第三章标题", "content": "200-300字精彩正文" },
    { "chapterNumber": 4, "title": "第四章标题", "content": "200-300字精彩正文" },
    { "chapterNumber": 5, "title": "第五章标题（终章或启示）", "content": "200-300字精彩正文" }
  ],
  "epilogue": "终卷题记与史诗评价（80字左右）"
}`;

    const userPrompt = `世界观：${world}
主角背景：${character}
冒险历程摘要：
${turnsSummary}

请将这段历程编织为一部荡气回肠的五章传记小说，严格以 JSON 格式输出。`;

    const rawOutput = await callAI(systemPrompt, userPrompt, apiConfig);
    const parsed = extractJsonFromText(rawOutput);
    return res.json(parsed);
  } catch (error: any) {
    console.error("Biography Error:", error);
    return res.status(500).json({ error: error?.message || "生成传记时遭遇文思阻滞，请重试。" });
  }
});

// -------------------------------------------------------------
// Floating AI Adventure Guide Chatbot Endpoint
// -------------------------------------------------------------

app.post("/api/adventure/guide", async (req: Request, res: Response) => {
  try {
    const { question, world, character, currentState, apiConfig } = req.body;
    if (!question) {
      return res.status(400).json({ error: "请输入你想咨询的问题" });
    }

    const systemPrompt = `你是文字冒险游戏里的“随行精灵嚮導 / 异界导师”。
你的职责是解答玩家在当前世界观规则、策略规划、数值机制或背景设定上的疑问。
语调亲切、风趣且富有代入感。回复简明扼要，控制在 150 字以内。`;

    const userPrompt = `当前世界观：${world || "通用"}
当前主角描述：${character || "冒险者"}
当前状态：${JSON.stringify(currentState || {})}
玩家咨询的问题：
"${question}"

请给出富有沉浸感且实用建议的解答。`;

    const answer = await callAI(systemPrompt, userPrompt, apiConfig);
    return res.json({ answer: answer.replace(/```json/gi, "").replace(/```/g, "").trim() });
  } catch (error: any) {
    return res.status(500).json({ error: error?.message || "向导暂时打盹了，请稍候再试。" });
  }
});

// -------------------------------------------------------------
// Vite Dev Server / Static Hosting
// -------------------------------------------------------------

async function startServer() {
  const isProduction =
    process.env.NODE_ENV === "production" ||
    (process.argv[1] && (process.argv[1].endsWith(".cjs") || process.argv[1].includes("dist")));

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Adventure RPG Server running on http://localhost:${PORT}`);
  });
}

startServer();
