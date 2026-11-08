import {
  Play,
  Settings,
  Gift,
  Coins,
  Gem,
} from 'lucide-react';
import { GameMode, CharacterDef, WorldDef, PlayerSaveData } from '../game/types';
import { soundEngine } from '../game/audio';
import { CharacterLogo } from './CharacterLogo';
import {
  HeroesNavIcon,
  WorldsNavIcon,
  MissionsNavIcon,
  BadgesNavIcon,
  ShopNavIcon,
  StatsNavIcon,
} from './GameIcons';

interface TitleScreenProps {
  onStart: () => void;
  onOpenModal: (modal: string) => void;
  saveData: PlayerSaveData;
  activeCharacter: CharacterDef;
  activeWorld: WorldDef;
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onClaimDaily: () => void;
  canClaimDaily: boolean;
}

const MODES: { id: GameMode; label: string; desc: string; badge?: string }[] = [
  { id: 'classic', label: 'Classic', desc: 'Standard arcade flying' },
  { id: 'zen', label: 'Zen', desc: 'Wider gaps, gentle physics' },
  { id: 'hardcore', label: 'Hardcore', desc: 'Faster speed, narrow gaps' },
  { id: 'coin_rush', label: 'Coin Rush', desc: 'Dense coin patterns' },
  { id: 'time_attack', label: 'Time Attack', desc: 'Race against the clock' },
  { id: 'boss_challenge', label: 'Boss Battle', desc: 'Dodge Sky Titan lasers' },
];

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  onOpenModal,
  saveData,
  activeCharacter,
  activeWorld,
  selectedMode,
  onSelectMode,
  onClaimDaily,
  canClaimDaily,
}) => {
  return (
    <div className="absolute inset-0 flex flex-col justify-between p-4 sm:p-6 md:p-8 pointer-events-none select-none z-10">
      {/* Top Bar: Currencies, Daily Reward & Quick Utility */}
      <div className="flex items-center justify-between w-full max-w-5xl mx-auto pointer-events-auto">
        <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-slate-700/60 shadow-lg">
          <div className="flex items-center gap-1.5 text-amber-400 font-semibold text-sm tabular-nums">
            <Coins className="w-4 h-4" />
            <span>{saveData.coins.toLocaleString()}</span>
          </div>
          <span className="text-slate-600">·</span>
          <div className="flex items-center gap-1.5 text-cyan-400 font-semibold text-sm tabular-nums">
            <Gem className="w-4 h-4" />
            <span>{saveData.gems}</span>
          </div>
          <span className="text-slate-600">·</span>
          <div className="text-xs text-indigo-300 font-medium">
            LVL <span className="font-bold text-white tabular-nums">{saveData.level}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canClaimDaily && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onClaimDaily();
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              title="Claim Daily Login Gift"
            >
              <Gift className="w-4 h-4 animate-bounce" />
              <span>Daily Gift</span>
            </button>
          )}

          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenModal('settings');
            }}
            className="p-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700/60 shadow-lg transition-colors cursor-pointer"
            aria-label="Game Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center Hero: Game Title Lockup & Character Tag */}
      <div className="flex flex-col items-center justify-center text-center my-auto pointer-events-auto">
        <div className="relative mb-2">
          {/* Decorative Wings Emblem SVG */}
          <div className="inline-flex items-center gap-3">
            <svg className="w-8 h-8 text-sky-400 opacity-90 drop-shadow-md" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 9l10 4 10-4-10-7zm0 6l-6-2.4L12 3.8l6 1.8L12 8zm0 7.5L4 10.7V17l8 5 8-5v-6.3l-8 4.8z" />
            </svg>
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
              SKY <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-amber-300">HOP</span>
            </h1>
            <svg className="w-8 h-8 text-amber-400 opacity-90 drop-shadow-md transform scale-x-[-1]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 9l10 4 10-4-10-7zm0 6l-6-2.4L12 3.8l6 1.8L12 8zm0 7.5L4 10.7V17l8 5 8-5v-6.3l-8 4.8z" />
            </svg>
          </div>

          {/* Active Pilot Showcase Card */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenModal('characters');
            }}
            className="mt-3 inline-flex items-center gap-3 bg-slate-900/85 hover:bg-slate-800/95 border border-slate-700/80 hover:border-sky-400/80 px-4 py-2 rounded-2xl shadow-xl transition-all hover:scale-103 cursor-pointer group"
          >
            <CharacterLogo
              characterId={activeCharacter.id}
              size={48}
              rarity={activeCharacter.rarity}
              showGlow={true}
              primaryColor={activeCharacter.skins[0]?.primaryColor}
              secondaryColor={activeCharacter.skins[0]?.secondaryColor}
            />
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm group-hover:text-sky-300 transition-colors">
                  {activeCharacter.name}
                </span>
                <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/40">
                  {activeCharacter.rarity}
                </span>
              </div>
              <span className="text-[11px] text-slate-300 font-medium">
                {activeCharacter.species} · <span className="text-amber-400">{activeCharacter.abilityName}</span>
              </span>
            </div>
            <span className="text-[11px] font-bold text-sky-400 ml-2 group-hover:translate-x-0.5 transition-transform">
              Change →
            </span>
          </button>
        </div>

        {/* Big Start Button */}
        <div className="mt-6">
          <button
            data-start="true"
            onClick={() => {
              soundEngine.playClick();
              onStart();
            }}
            className="group relative flex items-center gap-3 px-8 sm:px-10 py-3.5 sm:py-4 bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 hover:from-sky-400 hover:via-cyan-300 hover:to-emerald-300 text-slate-950 font-extrabold text-xl sm:text-2xl rounded-2xl shadow-[0_8px_30px_rgba(14,165,233,0.4)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Play className="w-7 h-7 fill-slate-950 text-slate-950" />
            <span>PLAY NOW</span>
          </button>
        </div>

        <p className="text-xs text-white/70 mt-3 drop-shadow font-mono">
          Tap anywhere or press Space / Up Arrow to fly
        </p>

        {/* Game Mode Selector Bar */}
        <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-lg bg-slate-900/70 p-1.5 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
          {MODES.map((mode) => {
            const isSelected = selectedMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => {
                  soundEngine.playClick();
                  onSelectMode(mode.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-sky-500 text-slate-950 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
                title={mode.desc}
              >
                {mode.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Dock: Feature Navigation */}
      <div className="w-full max-w-3xl mx-auto pointer-events-auto">
        <div className="grid grid-cols-6 gap-2 bg-slate-900/90 backdrop-blur-md p-2 rounded-2xl border border-slate-700/70 shadow-2xl">
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenModal('characters');
            }}
            className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-slate-800/90 text-slate-300 hover:text-sky-300 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
          >
            <HeroesNavIcon size={26} className="group-hover:scale-110 transition-transform filter drop-shadow-md" />
            <span className="text-[11px] font-bold mt-1 text-slate-200 group-hover:text-sky-300 truncate">Heroes</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenModal('worlds');
            }}
            className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-slate-800/90 text-slate-300 hover:text-emerald-300 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
          >
            <WorldsNavIcon size={26} className="group-hover:scale-110 transition-transform filter drop-shadow-md" />
            <span className="text-[11px] font-bold mt-1 text-slate-200 group-hover:text-emerald-300 truncate">Worlds</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenModal('missions');
            }}
            className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-slate-800/90 text-slate-300 hover:text-amber-300 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
          >
            <MissionsNavIcon size={26} className="group-hover:scale-110 transition-transform filter drop-shadow-md" />
            <span className="text-[11px] font-bold mt-1 text-slate-200 group-hover:text-amber-300 truncate">Missions</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenModal('achievements');
            }}
            className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-slate-800/90 text-slate-300 hover:text-purple-300 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
          >
            <BadgesNavIcon size={26} className="group-hover:scale-110 transition-transform filter drop-shadow-md" />
            <span className="text-[11px] font-bold mt-1 text-slate-200 group-hover:text-purple-300 truncate">Badges</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenModal('shop');
            }}
            className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-slate-800/90 text-slate-300 hover:text-rose-300 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
          >
            <ShopNavIcon size={26} className="group-hover:scale-110 transition-transform filter drop-shadow-md" />
            <span className="text-[11px] font-bold mt-1 text-slate-200 group-hover:text-rose-300 truncate">Shop</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenModal('records');
            }}
            className="flex flex-col items-center justify-center p-2 rounded-xl hover:bg-slate-800/90 text-slate-300 hover:text-indigo-300 transition-all hover:scale-105 active:scale-95 cursor-pointer group"
          >
            <StatsNavIcon size={26} className="group-hover:scale-110 transition-transform filter drop-shadow-md" />
            <span className="text-[11px] font-bold mt-1 text-slate-200 group-hover:text-indigo-300 truncate">Stats</span>
          </button>
        </div>
      </div>
    </div>
  );
};
