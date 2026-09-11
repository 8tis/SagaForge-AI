import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { StartScreen } from './components/StartScreen';
import { CharacterPanel } from './components/CharacterPanel';
import { StoryDisplay } from './components/StoryDisplay';
import { LogPanel } from './components/LogPanel';
import { SettingsModal } from './components/SettingsModal';
import { SponsorModal } from './components/SponsorModal';
import { SaveManagerModal } from './components/SaveManagerModal';
import { AuthModal } from './components/AuthModal';
import { AdminModal } from './components/AdminModal';
import { AboutModal } from './components/AboutModal';
import { BenefitsModal } from './components/BenefitsModal';
import { CartridgeModal } from './components/CartridgeModal';
import { BiographyModal } from './components/BiographyModal';
import { GuideWidget } from './components/GuideWidget';
import { sanitizeApiConfig } from './utils/crypto';
import {
  WorldGenre,
  AdventureSession,
  StoryTurn,
  ApiConfig,
  UserProfile,
  SaveSlot,
  PublicSiteConfig,
  GameCartridge,
} from './types';
import { AlertTriangle, X, Sparkles, Volume2 } from 'lucide-react';

const STORAGE_SESSION_KEY = 'gemini_active_adventure_session';
const STORAGE_CONFIG_KEY = 'text_rpg_custom_api_config';
const STORAGE_SLOTS_KEY = 'text_rpg_saved_slots';
const STORAGE_AUTH_TOKEN = 'text_rpg_auth_token';

const DEFAULT_API_CONFIG: ApiConfig = {
  provider: 'openai',
  baseUrl: 'https://api.deepseek.com/v1',
  apiKey: '',
  model: 'deepseek-chat',
  temperature: 0.8,
  nsfwFilter: false,
};

export default function App() {
  // 1. Core game session
  const [session, setSession] = useState<AdventureSession | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 2. Saved slots
  const [savedSlots, setSavedSlots] = useState<SaveSlot[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_SLOTS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // 3. User & Auth
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // 4. API Config
  const [apiConfig, setApiConfig] = useState<ApiConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CONFIG_KEY);
      if (saved) return JSON.parse(saved);
      // Migration: check old STORAGE_API_KEY
      const oldKey = localStorage.getItem('gemini_custom_api_key');
      if (oldKey) {
        return {
          ...DEFAULT_API_CONFIG,
          provider: 'gemini',
          apiKey: oldKey,
          model: 'gemini-2.5-flash',
        };
      }
      return DEFAULT_API_CONFIG;
    } catch {
      return DEFAULT_API_CONFIG;
    }
  });

  // 5. Public Site Config & Server Status
  const [publicConfig, setPublicConfig] = useState<PublicSiteConfig | null>(null);
  const [serverHasKey, setServerHasKey] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dismissAnnouncement, setDismissAnnouncement] = useState(false);

  // 6. Active Cartridge & DLC features
  const [activeCartridge, setActiveCartridge] = useState<GameCartridge | null>(null);
  const [customActionEnabled, setCustomActionEnabled] = useState<boolean>(true);

  // 7. Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSponsorOpen, setIsSponsorOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isBenefitsOpen, setIsBenefitsOpen] = useState(false);
  const [isCartridgeOpen, setIsCartridgeOpen] = useState(false);
  const [isBiographyOpen, setIsBiographyOpen] = useState(false);

  // 8. Mobile responsive tab
  const [activeMobileTab, setActiveMobileTab] = useState<'status' | 'story' | 'logs'>('story');

  // Load public config & health status
  const fetchPublicConfig = () => {
    fetch('/api/config/public')
      .then((res) => res.json())
      .then((data) => setPublicConfig(data))
      .catch((e) => console.error('Failed to load public config', e));

    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data?.hasServerKey) setServerHasKey(true);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchPublicConfig();

    // Check auth token
    const token = localStorage.getItem(STORAGE_AUTH_TOKEN);
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.user) setCurrentUser(data.user);
        })
        .catch(() => {});
    }
  }, []);

  // Sync session with localStorage
  useEffect(() => {
    try {
      if (session) {
        localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
      } else {
        localStorage.removeItem(STORAGE_SESSION_KEY);
      }
    } catch (e) {
      console.error('Failed to sync session storage', e);
    }
  }, [session]);

  // Sync saved slots with localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SLOTS_KEY, JSON.stringify(savedSlots));
    } catch (e) {
      console.error('Failed to sync slots storage', e);
    }
  }, [savedSlots]);

  // Save API config
  const handleSaveApiConfig = (newConfig: ApiConfig) => {
    setApiConfig(newConfig);
    try {
      localStorage.setItem(STORAGE_CONFIG_KEY, JSON.stringify(newConfig));
    } catch (e) {
      console.error('Failed to save api config', e);
    }
  };

  // Auth login success
  const handleLoginSuccess = (user: UserProfile, token: string) => {
    setCurrentUser(user);
    localStorage.setItem(STORAGE_AUTH_TOKEN, token);
  };

  // Auth logout
  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_AUTH_TOKEN);
  };

  // Redeem success
  const handleRedeemSuccess = (_type: string, _msg: string) => {
    // If user is logged in, refresh user profile
    const token = localStorage.getItem(STORAGE_AUTH_TOKEN);
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.user) setCurrentUser(data.user);
        })
        .catch(() => {});
    } else {
      // For guest, grant guest session permissions
      setCurrentUser((prev) => ({
        id: 'guest',
        email: 'guest@session.local',
        nickname: '旅人貴賓',
        isVip: true,
        hasCustomActionDlc: true,
        redeemedCodes: ['SESSION_REDEEMED'],
      }));
    }
  };

  // Save current adventure into a new slot
  const handleSaveCurrentSlot = (slotName: string) => {
    if (!session) return;
    const newSlot: SaveSlot = {
      id: `slot_${Date.now()}`,
      name: slotName,
      savedAt: Date.now(),
      session: JSON.parse(JSON.stringify(session)),
    };
    setSavedSlots((prev) => [newSlot, ...prev]);
  };

  const handleDeleteSlot = (slotId: string) => {
    setSavedSlots((prev) => prev.filter((s) => s.id !== slotId));
  };

  // Import full game cache
  const handleImportFullCache = (data: { session?: AdventureSession; slots?: SaveSlot[] }) => {
    if (data.session) {
      setSession(data.session);
    }
    if (data.slots && data.slots.length > 0) {
      setSavedSlots((prev) => {
        const existingIds = new Set(prev.map((s) => s.id));
        const newOnes = data.slots!.filter((s) => !existingIds.has(s.id));
        return [...newOnes, ...prev];
      });
    }
  };

  // Start new game
  const handleStartGame = async (world: WorldGenre, character: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/adventure/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          world,
          character,
          apiConfig: sanitizeApiConfig(apiConfig),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401 || (data.error && data.error.includes('API'))) {
          setIsSettingsOpen(true);
        }
        throw new Error(data?.error || '無法開啟冒險，請檢查 API 設定或稍後重試。');
      }

      const initialTurn: StoryTurn = {
        turnNumber: 1,
        chapterTitle: data.chapterTitle || '序章：命運啟程',
        story: data.story,
        timestamp: Date.now(),
        stateSnapshot: data.state,
        imageUrl: data.imageUrl,
        imageModel: data.imageModel,
        imagePrompt: data.visualPrompt,
        miniGame: data.miniGame,
      };

      const newSession: AdventureSession = {
        id: `adv_${Date.now()}`,
        world,
        characterDescription: character,
        turns: [initialTurn],
        currentState: data.state,
        currentOptions: data.options || [],
        isEnding: Boolean(data.isEnding),
        endingType: data.endingType || 'none',
        currentMiniGame: data.miniGame || null,
        startedAt: Date.now(),
        lastPlayedAt: Date.now(),
      };

      setSession(newSession);
      setActiveMobileTab('story');
    } catch (err: any) {
      setErrorMessage(err.message || '連接異界時發生異常，請檢查網絡或 API Key 設定。');
    } finally {
      setIsLoading(false);
    }
  };

  // Act / choose action
  const handleSelectAction = async (actionText: string) => {
    if (!session || isLoading) return;

    setIsLoading(true);
    setErrorMessage(null);

    // Record chosen action
    const updatedTurns = [...session.turns];
    const latestIndex = updatedTurns.length - 1;
    if (latestIndex >= 0) {
      updatedTurns[latestIndex] = {
        ...updatedTurns[latestIndex],
        selectedAction: actionText,
      };
    }

    // Build history summary
    const recentTurns = updatedTurns.slice(-4);
    const historySummary = recentTurns
      .map(
        (t) =>
          `第${t.turnNumber}幕【${t.chapterTitle || '事件'}】：${t.story.slice(0, 100)}... 玩家抉擇：${
            t.selectedAction || '推進'
          }`
      )
      .join('\n');

    try {
      const res = await fetch('/api/adventure/act', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          world: session.world,
          character: session.characterDescription,
          historySummary,
          currentState: session.currentState,
          action: actionText,
          apiConfig: sanitizeApiConfig(apiConfig),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401 || (data.error && data.error.includes('API'))) {
          setIsSettingsOpen(true);
        }
        throw new Error(data?.error || '無法推進劇情，請重試。');
      }

      const nextTurn: StoryTurn = {
        turnNumber: updatedTurns.length + 1,
        chapterTitle: data.chapterTitle || `第 ${updatedTurns.length + 1} 幕`,
        story: data.story,
        timestamp: Date.now(),
        stateSnapshot: data.state,
        imageUrl: data.imageUrl,
        imageModel: data.imageModel,
        imagePrompt: data.visualPrompt,
        miniGame: data.miniGame,
      };

      const nextSession: AdventureSession = {
        ...session,
        turns: [...updatedTurns, nextTurn],
        currentState: data.state,
        currentOptions: data.isEnding ? [] : data.options || [],
        isEnding: Boolean(data.isEnding),
        endingType: data.endingType || 'none',
        currentMiniGame: data.miniGame || null,
        lastPlayedAt: Date.now(),
      };

      setSession(nextSession);
    } catch (err: any) {
      setErrorMessage(err.message || '推演因果時遭遇時空紊亂，請重試。');
    } finally {
      setIsLoading(false);
    }
  };

  // Interactive item usage (cyberhiking backpack mechanics)
  const handleUseItem = (item: string) => {
    if (!session || isLoading || session.isEnding) return;
    handleSelectAction(`【使用道具】使用「${item}」`);
  };

  // Regenerate scene illustration for a specific turn
  const handleRegenerateImage = async (turnIndex: number) => {
    if (!session || !session.turns[turnIndex] || isLoading) return;
    const turn = session.turns[turnIndex];
    try {
      const res = await fetch('/api/adventure/regenerate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visualPrompt: turn.imagePrompt,
          world: session.world,
          chapterTitle: turn.chapterTitle,
          story: turn.story,
          apiConfig: sanitizeApiConfig(apiConfig),
        }),
      });
      const data = await res.json();
      if (data.imageUrl) {
        setSession((prev) => {
          if (!prev) return null;
          const newTurns = [...prev.turns];
          newTurns[turnIndex] = {
            ...newTurns[turnIndex],
            imageUrl: data.imageUrl,
            imageModel: data.model,
            imagePrompt: data.prompt,
          };
          return { ...prev, turns: newTurns };
        });
      }
    } catch (err) {
      console.error('Failed to regenerate scene image', err);
    }
  };

  const handleRestartGame = () => {
    if (session && !session.isEnding) {
      const confirmed = window.confirm('確定要放棄當前的冒險進度並開啟新的世界嗎？');
      if (!confirmed) return;
    }
    setSession(null);
    setErrorMessage(null);
  };

  const hasConfiguredKey = Boolean(apiConfig.apiKey.trim() || serverHasKey);
  const userHasDlc = Boolean(currentUser?.hasCustomActionDlc);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-100">
      {/* Top Announcement Bar (Configurable in admin) */}
      {publicConfig?.announcement && !dismissAnnouncement && (
        <aside
          aria-label="網站公告"
          className="bg-gradient-to-r from-amber-950/70 via-zinc-900 to-amber-950/70 border-b border-amber-500/30 px-4 py-1.5 text-xs text-amber-200 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-2 max-w-5xl mx-auto flex-1 truncate">
            <Volume2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">{publicConfig.announcement}</span>
          </div>
          <button
            onClick={() => setDismissAnnouncement(true)}
            className="text-amber-400/80 hover:text-amber-200 p-0.5"
            title="關閉公告"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </aside>
      )}

      {/* Main Navbar */}
      <Navbar
        currentWorld={session?.world}
        chapterTitle={session?.turns[session.turns.length - 1]?.chapterTitle}
        turnCount={session?.turns.length || 0}
        hasConfiguredKey={hasConfiguredKey}
        currentUser={currentUser}
        onOpenSettingsModal={() => setIsSettingsOpen(true)}
        onOpenSponsorModal={() => setIsSponsorOpen(true)}
        onOpenSaveModal={() => setIsSaveOpen(true)}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onOpenAdminModal={() => setIsAdminOpen(true)}
        onOpenAboutModal={() => setIsAboutOpen(true)}
        onOpenBenefitsModal={() => setIsBenefitsOpen(true)}
        onOpenCartridgeModal={() => setIsCartridgeOpen(true)}
        onOpenBiographyModal={() => setIsBiographyOpen(true)}
        onStartNewAdventure={handleRestartGame}
        activeMobileTab={activeMobileTab}
        onSelectMobileTab={setActiveMobileTab}
        isGameActive={Boolean(session)}
      />

      {/* Global Error Notice */}
      {errorMessage && (
        <div className="bg-rose-950/80 border-b border-rose-800 text-rose-200 px-4 py-2.5 text-xs sm:text-sm flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2 max-w-4xl mx-auto flex-1">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-400 hover:text-rose-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main View Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!session ? (
          /* Start Screen */
          <StartScreen
            onStartGame={handleStartGame}
            isLoading={isLoading}
            hasConfiguredKey={hasConfiguredKey}
            onOpenSettingsModal={() => setIsSettingsOpen(true)}
            onOpenCartridgeModal={() => setIsCartridgeOpen(true)}
            onOpenSponsorModal={() => setIsSponsorOpen(true)}
            onOpenSaveModal={() => setIsSaveOpen(true)}
            hasCustomActionDlc={userHasDlc}
            customActionEnabled={customActionEnabled}
            onToggleCustomAction={() => setCustomActionEnabled(!customActionEnabled)}
            activeCartridge={activeCartridge}
            onClearActiveCartridge={() => setActiveCartridge(null)}
          />
        ) : (
          /* Active Adventure 3-Column Layout */
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-[calc(100vh-4rem)]">
            {/* Left: Character Status Panel (Cols 1-3) */}
            <div
              className={`h-full lg:col-span-3 lg:block min-h-0 overflow-hidden ${
                activeMobileTab === 'status' ? 'block' : 'hidden'
              }`}
            >
              <CharacterPanel
                state={session.currentState}
                characterDescription={session.characterDescription}
                worldGenre={session.world}
                onUseItem={handleUseItem}
                isLoading={isLoading}
                isEnding={session.isEnding}
              />
            </div>

            {/* Middle: Story Display (Cols 4-9) */}
            <div
              className={`h-full lg:col-span-6 lg:block border-x border-zinc-800/80 min-h-0 overflow-hidden ${
                activeMobileTab === 'story' ? 'block' : 'hidden'
              }`}
            >
              <StoryDisplay
                turns={session.turns}
                currentOptions={session.currentOptions}
                isLoading={isLoading}
                isEnding={session.isEnding}
                endingType={session.endingType}
                onSelectAction={handleSelectAction}
                onRestartGame={handleRestartGame}
                hasCustomActionDlc={userHasDlc}
                onOpenSponsorModal={() => setIsSponsorOpen(true)}
                onOpenBiographyModal={() => setIsBiographyOpen(true)}
                onRegenerateImage={handleRegenerateImage}
                currentMiniGame={session.currentMiniGame}
                worldGenre={session.world}
              />
            </div>

            {/* Right: Quest & History Chronicle (Cols 10-12) */}
            <div
              className={`h-full lg:col-span-3 lg:block min-h-0 overflow-hidden ${
                activeMobileTab === 'logs' ? 'block' : 'hidden'
              }`}
            >
              <LogPanel
                quests={session.currentState.quests || []}
                turns={session.turns}
                onOpenBiographyModal={() => setIsBiographyOpen(true)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Floating AI Adventure Guide Chatbot */}
      <GuideWidget
        worldGenre={session?.world}
        characterDesc={session?.characterDescription}
        currentState={session?.currentState}
        apiConfig={apiConfig}
      />

      {/* Modals Container */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={apiConfig}
        onSaveConfig={handleSaveApiConfig}
        serverHasKey={serverHasKey}
      />

      <SponsorModal
        isOpen={isSponsorOpen}
        onClose={() => setIsSponsorOpen(false)}
        publicConfig={publicConfig}
        currentUser={currentUser}
        onRedeemSuccess={handleRedeemSuccess}
      />

      <SaveManagerModal
        isOpen={isSaveOpen}
        onClose={() => setIsSaveOpen(false)}
        currentSession={session}
        savedSlots={savedSlots}
        onLoadSession={(loaded) => setSession(loaded)}
        onSaveCurrentSlot={handleSaveCurrentSlot}
        onDeleteSlot={handleDeleteSlot}
        onImportFullCache={handleImportFullCache}
        currentUser={currentUser}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onLoginSuccess={handleLoginSuccess}
        onLogout={handleLogout}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onConfigUpdated={fetchPublicConfig}
      />

      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        onOpenSponsor={() => setIsSponsorOpen(true)}
      />

      <BenefitsModal
        isOpen={isBenefitsOpen}
        onClose={() => setIsBenefitsOpen(false)}
        onOpenSponsor={() => setIsSponsorOpen(true)}
      />

      <CartridgeModal
        isOpen={isCartridgeOpen}
        onClose={() => setIsCartridgeOpen(false)}
        onSelectCartridge={(cart) => {
          setActiveCartridge(cart);
          if (session) {
            const confirmed = window.confirm('確定要切換卡帶並重置當前冒險嗎？');
            if (confirmed) setSession(null);
          }
        }}
        hasCustomActionDlc={userHasDlc}
        onOpenSponsorModal={() => setIsSponsorOpen(true)}
      />

      {session && (
        <BiographyModal
          isOpen={isBiographyOpen}
          onClose={() => setIsBiographyOpen(false)}
          turns={session.turns}
          worldGenre={session.world}
          characterDesc={session.characterDescription}
          apiConfig={apiConfig}
        />
      )}
    </div>
  );
}
