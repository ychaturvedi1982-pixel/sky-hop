import React from 'react';
import { X, Trophy, Compass, Zap, Flame, Clock, Award, BarChart3 } from 'lucide-react';
import { PlayerSaveData, GameMode } from '../game/types';
import { soundEngine } from '../game/audio';
import { CHARACTERS } from '../game/constants';
import { CharacterLogo, TrailLogo } from './CharacterLogo';
import { StatsNavIcon } from './GameIcons';

interface RecordsModalProps {
  onClose: () => void;
  saveData: PlayerSaveData;
}

const MODE_LABELS: Record<GameMode, string> = {
  classic: 'Classic Mode',
  zen: 'Zen Mode',
  hardcore: 'Hardcore Mode',
  coin_rush: 'Coin Rush',
  time_attack: 'Time Attack',
  boss_challenge: 'Boss Battle',
};

export const RecordsModal: React.FC<RecordsModalProps> = ({ onClose, saveData }) => {
  const stats = saveData.stats;
  const character =
    CHARACTERS.find((c) => c.id === saveData.selectedCharacterId) || CHARACTERS[0];
  const activeSkinId =
    saveData.selectedSkinId[character.id] || character.defaultSkinId;

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    if (mins < 60) return `${mins}m ${remainingSecs}s`;
    const hrs = Math.floor(mins / 60);
    return `${hrs}h ${mins % 60}m`;
  };

  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 z-30 select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full max-h-[85vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <StatsNavIcon size={26} className="filter drop-shadow-md" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display">
              Flight Records & Stats
            </h2>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close Records"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Active Pilot Profile Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <CharacterLogo
                characterId={character.id}
                skinId={activeSkinId}
                size={52}
                rarity={character.rarity}
                showGlow={true}
                primaryColor={character.skins.find(s => s.id === activeSkinId)?.primaryColor}
                secondaryColor={character.skins.find(s => s.id === activeSkinId)?.secondaryColor}
              />
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                  Active Pilot
                </span>
                <span className="font-extrabold text-white text-base leading-tight">
                  {character.name} <span className="text-xs font-normal text-slate-400">({character.species})</span>
                </span>
                <span className="text-xs text-sky-400 font-semibold">{character.abilityName}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <TrailLogo trailType={saveData.selectedTrail} size={36} />
            </div>
          </div>
          {/* Best Scores by Game Mode */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" />
              High Scores by Mode
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {(Object.keys(MODE_LABELS) as GameMode[]).map((mode) => (
                <div
                  key={mode}
                  className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800 flex flex-col"
                >
                  <span className="text-[10px] text-slate-400 uppercase font-bold truncate">
                    {MODE_LABELS[mode]}
                  </span>
                  <span className="text-2xl font-black text-sky-400 tabular-nums font-display mt-0.5">
                    {stats.highScores[mode] || 0}
                  </span>
                  <span className="text-[10px] text-slate-500 tabular-nums mt-0.5">
                    Best Dist: {stats.bestDistance[mode] || 0}m
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* All-Time Career Statistics */}
          <div>
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2.5 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-sky-400" />
              Career Summary
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>Total Distance</span>
                </div>
                <span className="font-bold text-white tabular-nums font-mono">
                  {Math.round(stats.totalDistanceMeters).toLocaleString()}m
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Obstacles Cleared</span>
                </div>
                <span className="font-bold text-white tabular-nums font-mono">
                  {stats.totalObstaclesPassed.toLocaleString()}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <span>Near-Miss Glides</span>
                </div>
                <span className="font-bold text-white tabular-nums font-mono">
                  {stats.totalNearMisses.toLocaleString()}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>Peak Combo</span>
                </div>
                <span className="font-bold text-white tabular-nums font-mono">
                  {stats.bestCombo}x
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>Flight Time</span>
                </div>
                <span className="font-bold text-white tabular-nums font-mono">
                  {formatTime(stats.totalPlayTimeSeconds)}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-300">
                  <BarChart3 className="w-4 h-4 text-cyan-400" />
                  <span>Total Sorties</span>
                </div>
                <span className="font-bold text-white tabular-nums font-mono">
                  {stats.totalRuns.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
