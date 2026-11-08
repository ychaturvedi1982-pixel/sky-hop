import React from 'react';
import { RotateCcw, Home, Award, Coins, Gem, Compass, Zap, Flame, Trophy } from 'lucide-react';
import { RunSummary, PlayerSaveData } from '../game/types';
import { soundEngine } from '../game/audio';
import { calculateLevelFromXp } from '../game/physics';
import { CHARACTERS } from '../game/constants';
import { CharacterLogo } from './CharacterLogo';

interface GameOverModalProps {
  summary: RunSummary;
  saveData: PlayerSaveData;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  summary,
  saveData,
  onRestart,
  onHome,
}) => {
  const { currentLevelXp, nextLevelXp } = calculateLevelFromXp(saveData.xp);
  const xpRatio = Math.min(1, currentLevelXp / nextLevelXp);

  const character =
    CHARACTERS.find((c) => c.id === saveData.selectedCharacterId) || CHARACTERS[0];
  const activeSkinId =
    saveData.selectedSkinId[character.id] || character.defaultSkinId;

  return (
    <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 z-30 select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center">
        {/* Cause of death or title */}
        <span className="text-[11px] font-bold tracking-widest uppercase text-slate-400 mb-1">
          {summary.causeOfDeath}
        </span>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight mb-2 font-display">
          RUN FINISHED
        </h2>

        {/* Pilot Info Badge with Photo */}
        <div className="flex items-center gap-3 bg-slate-950/60 px-3.5 py-1.5 rounded-2xl border border-slate-800 my-1">
          <CharacterLogo
            characterId={character.id}
            skinId={activeSkinId}
            size={38}
            rarity={character.rarity}
            primaryColor={character.skins.find(s => s.id === activeSkinId)?.primaryColor}
            secondaryColor={character.skins.find(s => s.id === activeSkinId)?.secondaryColor}
          />
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-xs">{character.name}</span>
              <span className="text-[9px] uppercase font-bold text-slate-400">({character.species})</span>
            </div>
            <span className="text-[10px] text-sky-400">{character.abilityName}</span>
          </div>
        </div>

        {/* Score & Best */}
        <div className="relative w-full bg-slate-950/60 p-4 rounded-2xl border border-slate-800 my-3 flex flex-col items-center">
          {summary.isNewRecord && (
            <div className="absolute -top-3 px-3 py-0.5 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-full shadow-md flex items-center gap-1 animate-bounce">
              <Trophy className="w-3 h-3" />
              <span>NEW PERSONAL BEST!</span>
            </div>
          )}

          <div className="flex items-baseline justify-center gap-4 w-full">
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">SCORE</span>
              <span className="text-4xl sm:text-5xl font-black text-sky-400 tabular-nums font-display">
                {summary.score}
              </span>
            </div>
            <div className="h-10 w-px bg-slate-800" />
            <div className="flex flex-col items-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">BEST</span>
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-200 tabular-nums font-display">
                {summary.bestScore}
              </span>
            </div>
          </div>

          {/* Currency Earned Row */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-800/80 text-xs font-bold">
            <div className="flex items-center gap-1 text-amber-400 tabular-nums">
              <Coins className="w-4 h-4" />
              <span>+{summary.coinsEarned} Coins</span>
            </div>
            {summary.gemsEarned > 0 && (
              <div className="flex items-center gap-1 text-cyan-400 tabular-nums">
                <Gem className="w-4 h-4" />
                <span>+{summary.gemsEarned} Gem</span>
              </div>
            )}
            <div className="text-indigo-400 tabular-nums">
              +{summary.xpEarned} XP
            </div>
          </div>
        </div>

        {/* Stat Badges Grid */}
        <div className="grid grid-cols-3 gap-2 w-full mb-4 text-xs">
          <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-800/70 flex flex-col items-center">
            <Compass className="w-3.5 h-3.5 text-sky-400 mb-0.5" />
            <span className="text-[10px] text-slate-400">Distance</span>
            <span className="font-bold text-white tabular-nums">{Math.round(summary.distanceMeters)}m</span>
          </div>

          <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-800/70 flex flex-col items-center">
            <Zap className="w-3.5 h-3.5 text-amber-400 mb-0.5" />
            <span className="text-[10px] text-slate-400">Max Combo</span>
            <span className="font-bold text-white tabular-nums">{summary.maxCombo}x</span>
          </div>

          <div className="bg-slate-950/40 p-2 rounded-xl border border-slate-800/70 flex flex-col items-center">
            <Flame className="w-3.5 h-3.5 text-rose-400 mb-0.5" />
            <span className="text-[10px] text-slate-400">Near Misses</span>
            <span className="font-bold text-white tabular-nums">{summary.nearMisses}</span>
          </div>
        </div>

        {/* Level Progression Bar */}
        <div className="w-full bg-slate-950/40 p-3 rounded-2xl border border-slate-800 mb-5">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
            <span className="text-indigo-300 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" />
              Level {saveData.level}
            </span>
            <span className="text-slate-400 tabular-nums text-[10px] font-mono">
              {currentLevelXp} / {nextLevelXp} XP
            </span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-sky-400 rounded-full transition-all duration-300"
              style={{ width: `${xpRatio * 100}%` }}
            />
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          <button
            data-start="true"
            onClick={() => {
              soundEngine.playClick();
              onRestart();
            }}
            className="flex items-center justify-center gap-2.5 w-full py-3.5 bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400 hover:from-sky-400 hover:via-cyan-300 hover:to-emerald-300 text-slate-950 font-extrabold text-lg rounded-2xl shadow-lg transition-transform hover:scale-102 active:scale-98 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onHome();
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-semibold rounded-xl border border-slate-700/60 transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};
