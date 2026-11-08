import React from 'react';
import { Pause, Volume2, VolumeX, Coins, Gem, Shield, Zap, Compass, Skull } from 'lucide-react';
import { ActivePowerup, GameMode, BossEntity, CharacterDef } from '../game/types';
import { soundEngine } from '../game/audio';
import { CharacterLogo } from './CharacterLogo';

interface GameHUDProps {
  score: number;
  combo: number;
  distanceMeters: number;
  coinsEarned: number;
  gemsEarned: number;
  activePowerups: ActivePowerup[];
  boss: BossEntity | null;
  mode: GameMode;
  timeLeft?: number; // for time_attack
  isMuted: boolean;
  character?: CharacterDef;
  skinId?: string;
  onToggleMute: () => void;
  onPause: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  combo,
  distanceMeters,
  coinsEarned,
  gemsEarned,
  activePowerups,
  boss,
  mode,
  timeLeft,
  isMuted,
  character,
  skinId,
  onToggleMute,
  onPause,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none select-none p-4 sm:p-6 flex flex-col justify-between z-10">
      {/* Top HUD Cluster */}
      <div className="flex items-start justify-between w-full">
        {/* Left: Score & Active Pilot Avatar */}
        <div className="flex items-center gap-3">
          {character && (
            <div className="hidden sm:flex items-center gap-2 bg-slate-900/80 backdrop-blur-md p-1.5 pr-3 rounded-2xl border border-slate-700/80 shadow-lg pointer-events-auto">
              <CharacterLogo
                characterId={character.id}
                skinId={skinId}
                size={38}
                rarity={character.rarity}
                showGlow={true}
                primaryColor={character.skins.find(s => s.id === skinId)?.primaryColor}
                secondaryColor={character.skins.find(s => s.id === skinId)?.secondaryColor}
              />
              <div className="flex flex-col text-left">
                <span className="text-xs font-black text-white leading-tight">{character.name}</span>
                <span className="text-[9px] uppercase font-bold text-sky-400">{character.species}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col items-start gap-0.5">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] font-display tabular-nums">
                {score}
              </span>
              {combo > 1 && (
                <span className="text-xs sm:text-sm font-black px-2 py-0.5 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 uppercase tracking-wider animate-pulse drop-shadow">
                  {combo}X COMBO
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-sky-200/90 drop-shadow">
              <Compass className="w-3.5 h-3.5" />
              <span className="tabular-nums">{Math.round(distanceMeters)}m</span>
              <span>·</span>
              <span className="uppercase text-[10px] tracking-wider text-white/80">{mode.replace('_', ' ')}</span>
            </div>
          </div>
        </div>

        {/* Center: Boss Bar or Time Attack Timer */}
        {boss && boss.hp > 0 && (
          <div className="flex flex-col items-center max-w-xs sm:max-w-md w-full px-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-red-400 mb-1 drop-shadow">
              <Skull className="w-4 h-4 animate-bounce" />
              <span>SKY TITAN (PHASE {boss.phase})</span>
            </div>
            <div className="w-full h-3 bg-slate-900/80 rounded-full border border-red-500/50 p-0.5 overflow-hidden shadow-lg">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full transition-all duration-150"
                style={{ width: `${Math.max(0, (boss.hp / boss.maxHp) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {mode === 'time_attack' && timeLeft !== undefined && (
          <div className="flex flex-col items-center bg-slate-900/80 px-4 py-1.5 rounded-2xl border border-amber-500/50 backdrop-blur-sm shadow-md">
            <span className="text-[10px] uppercase tracking-wider text-amber-300 font-bold">TIME LEFT</span>
            <span className={`text-2xl font-black tabular-nums font-mono ${timeLeft < 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
              {Math.max(0, timeLeft).toFixed(1)}s
            </span>
          </div>
        )}

        {/* Right: Currency & Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* In-run currency indicators */}
          <div className="hidden sm:flex items-center gap-2.5 bg-slate-900/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/60 shadow">
            <div className="flex items-center gap-1 text-amber-400 text-xs font-bold tabular-nums">
              <Coins className="w-3.5 h-3.5" />
              <span>+{coinsEarned}</span>
            </div>
            {gemsEarned > 0 && (
              <div className="flex items-center gap-1 text-cyan-400 text-xs font-bold tabular-nums">
                <Gem className="w-3.5 h-3.5" />
                <span>+{gemsEarned}</span>
              </div>
            )}
          </div>

          {/* Sound Mute Toggle */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onToggleMute();
            }}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700/60 shadow transition-colors cursor-pointer"
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Pause Button */}
          <button
            onClick={() => {
              soundEngine.playClick();
              onPause();
            }}
            className="p-2 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-700/60 shadow transition-colors cursor-pointer"
            aria-label="Pause Game"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Area: Active Power-up Timers */}
      <div className="flex flex-col items-center gap-2 max-w-sm mx-auto mb-1">
        {activePowerups.map((pu) => {
          const ratio = Math.max(0, pu.remainingMs / pu.totalMs);
          return (
            <div
              key={pu.type}
              className="flex items-center gap-2.5 bg-slate-950/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-sky-500/40 shadow-lg min-w-[190px]"
            >
              {pu.type === 'shield' && <Shield className="w-4 h-4 text-sky-400 shrink-0" />}
              {pu.type !== 'shield' && <Zap className="w-4 h-4 text-amber-400 shrink-0" />}
              <div className="flex-1 flex flex-col gap-1">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-white">
                  <span>{pu.type.replace('_', ' ')}</span>
                  <span className="tabular-nums font-mono font-normal text-slate-300">
                    {(pu.remainingMs / 1000).toFixed(1)}s
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-sky-400 to-cyan-300 transition-all duration-75"
                    style={{ width: `${ratio * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
