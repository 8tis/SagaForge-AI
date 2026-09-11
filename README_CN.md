# 🌌 SagaForge AI (星历工坊)

<div align="center">

<p align="center">
  <strong>无限流生成式 AI 文字冒险与沉浸式 RPG 引擎</strong><br/>
  <em>自带 API Key · 实时场景意境生图 · 突发解谜小游戏 · 零云端私钥安全</em>
</p>

[![License: MIT](https://img.shields.io/badge/License-MIT-amber.svg)](LICENSE)
[![React 18](https://img.shields.io/badge/React-18-blue.svg)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.x-black.svg)](https://expressjs.com/)
[![Bilingual](https://img.shields.io/badge/%E8%AF%AD%E8%A8%80-EN%20%7C%20%E4%B8%AD%E6%96%87-emerald.svg)](README.md)

[**English**](README.md) | [**简体中文**](README_CN.md)

</div>

---

## 📖 项目简介

**SagaForge AI (星历工坊)** 是一款开源的下一代生成式文字冒险 RPG 引擎与智能游戏主持人（AI Game Master）平台。

项目灵感汲取自《赛博徒步》硬核生存玩法、经典互动式游戏书（Gamebook）与跑团跑单机制，利用大语言模型让每一次抉择都产生真正的时空因果涟漪。

与传统“回复多了页面无限向下变长”的文字冒险不同，SagaForge AI 首创了**电子书式单幕专注翻页机制**、**意境级 AI 场景绘画**、**突发机关随机解谜小游戏**以及**绝对零上云的浏览器本地私钥加密体系**。

---

## ✨ 核心特色

### 1. 📖 单幕翻页专注模式（类似《赛博徒步》体验）
- **单幕专注呈现**：一页只聚焦当前幕次，告别无限向下滚动的阅读疲劳。
- **翻页控制器**：顶部导航栏清晰配备 `[◀ 上一幕]` `第 X 幕 / 共 Y 幕` `[下一幕 ▶]`。
- **一键回跳最新幕**：向前翻看历史档案时，右侧与底部浮现高亮脉冲 `[最新幕 ⚡]` 按钮，一键瞬间跳转回最新活动幕。
- **全键盘快捷键**：
  - `←` / `→` 方向键：极速前后翻阅各幕；
  - `1`, `2`, `3`, `4` 数字键：直接决定下一步战略抉择。
- **双模式自由切换**：支持在 **单幕翻页专注** 与 **时间轴折叠长卷** 之间一键切换。

### 2. 🎨 意境级场景 AI 绘画生图
- **高度契合剧情意境**：根据每一幕的环境、光影、天气与人物状态动态生成 25 词英文 Prompt 实时着色。
- **丰富模型支持**：无缝支持 Pollinations、Flux、SDXL、OpenAI DALL-E 及自定义绘图模型与风格。
- **场景灯箱与重绘**：支持点击放大查看大图、查看提示词，且支持对最新一幕随时重新研墨重绘。

### 3. 🎲 突发机关随机事件与 D20 命运骰
- **随机奇遇事件机制**：小游戏绝非每一幕都强制出现，而是作为探索途中的突发偶遇！
- **AI 动态构思（严禁固定写死）**：
  - 🔢 **密码暗锁**：全新随机密码，线索巧妙融入诗歌藏字、生辰八字、残碑或剧情暗示中，可观察推理破解。
  - ⚖️ **方程代数封印**：一元一次方程配平石碑铭文，解封密室。
  - ⚡ **灵脉导线拆解**：根据五行相生相克或战术手册拆解正确灵脉导线。
  - 🎯 **微操破绽截停 QTE**：快速反应截停锁芯脆弱破绽。
- **D20 命运检定骰**：在 AI 推演等待阶段，可随时掷一枚 D20 检定骰（大成功、大失败、吉兆），并伴随经典生存箴言轮播。

### 4. 🛡️ 100% 浏览器本地私钥加密（绝对零上云）
- **无云端密钥泄露风险**：用户的 OpenAI、Gemini、DeepSeek、OpenRouter 等 API 密钥**绝不存入任何服务器数据库**。
- **高强度加盐加密**：使用带盐值的散列对称加密，**仅保存在用户当前浏览器的 localStorage 中**。
- **安全传输**：请求时仅经由内存解密发往大模型，完全杜绝第三方明文泄露。

### 5. 🌐 全功能国际化（中英双语）
- 顶部导航栏提供一键双语切换（`[🇨🇳 中文 / 🇺🇸 EN]`）。
- 支持纯正的英文 GM 提示词架构，生成纯英文故事、选项、装备名与角色卡。
- 内置 9 大预设世界观（中英文双语）：
  - ⚔️ **剑与魔法奇幻** (High Fantasy)
  - 🚀 **硬核太空科幻** (Hard Space Sci-Fi)
  - 🗡️ **传统热血武侠** (Wuxia Martial Realm)
  - ☯️ **修仙寻道仙侠** (Xianxia Cultivation)
  - 🐙 **克苏鲁神话探秘** (Cosmic Horror)
  - 👑 **古代宫廷权谋** (Imperial Palace Intrigue)
  - 🦾 **赛博朋克霓虹** (Cyberpunk Dystopia)
  - ☢️ **废土末日求生** (Post-Apocalyptic)
  - 🔍 **悬疑本格侦探** (Noir Detective)

### 6. 💾 游戏卡带库与史诗传记提炼
- **卡带系统**：支持将自定义的世界观与角色保存为卡带分享给其他玩家。
- **本地多存档位**：随时备份与导出/导入游戏进度。
- **AI 史诗传记生成**：通关或回顾时，可一键将全篇历程提炼为文采斐然的五章传奇传记小说。

---

## 🛠️ 技术架构

```
sagaforge-ai/
├── server.ts              # Express 服务端与 Vite SSR 集成
├── server/
│   ├── aiAdapter.ts       # 统一大模型适配层 (Gemini SDK, OpenAI兼容接口, Pollinations绘图)
│   └── storage.ts         # 本地配置存储 (lowdb)
├── src/
│   ├── components/
│   │   ├── Navbar.tsx           # 全局顶栏、双语切换、快捷弹窗入口
│   │   ├── StartScreen.tsx      # 世界观抉择、角色设定与快捷原型
│   │   ├── StoryDisplay.tsx     # 单幕翻页、插画展示、D20骰子、行动抉择
│   │   ├── CharacterPanel.tsx   # 生命/能量槽、装备物品、技能功法、道具使用
│   │   ├── LogPanel.tsx         # 任务日志追踪、历程编年史、传记小说导出
│   │   ├── MiniGameWidget.tsx   # 突发解谜小游戏 (密码锁, 方程, 导线, QTE)
│   │   └── SettingsModal.tsx    # 模型选择、自动拉取、绘图模型配置
│   ├── utils/
│   │   ├── i18n.ts              # 中英双语国际化词典与助手
│   │   └── crypto.ts            # 客户端加盐加密工具
│   └── types.ts                 # 核心 TypeScript 类型定义
```

---

## 🚀 快速启动

### 环境准备
- [Node.js](https://nodejs.org/) (推荐 18.x 或更高版本)
- npm 或 yarn

### 1. 克隆项目并安装依赖
```bash
git clone https://github.com/your-username/sagaforge-ai.git
cd sagaforge-ai
npm install
```

### 2. 本地环境变量（可选）
如果希望服务器提供默认公用 API Key，可在根目录新建 `.env`：
```env
PORT=3000
GEMINI_API_KEY=你的GeminiKey
# 可选:
OPENAI_API_KEY=你的OpenAIKey
```
> *注：玩家亦可直接在网页前端【API 设置】中填入个人 Key，无需改动代码。*

### 3. 运行开发模式
```bash
npm run dev
```
打开浏览器访问 `http://localhost:3000`。

### 4. 生产环境打包构建
```bash
npm run build
npm start
```

---

## 🔒 隐私与安全性保障

- **零遥测上传**：用户的个人 API Key 绝不上传至任何中心化云端数据库。
- **开源可审计**：所有密钥加盐与脱敏逻辑均在 `src/utils/crypto.ts` 中完全开源，接受社区审查。

---

## 📄 开源许可证

本项目采用 **MIT 许可证** 开源。详情参见 `LICENSE` 文件。
