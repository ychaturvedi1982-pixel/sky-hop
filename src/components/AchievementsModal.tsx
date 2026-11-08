import React from 'react';
import { X, Check, Award, Trophy, Zap, Shield, Crown, Coins, Gem, Feather, Compass, Flame } from 'lucide-react';
import { PlayerSaveData } from '../game/types';
import { soundEngine } from '../game/audio';
import { BadgesNavIcon } from './GameIcons';

interface AchievementsModalProps {
  onClose: () => void;
  saveData: PlayerSaveData;
  onClaimAchievement: (achId: string) => void;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  Feather: <Feather className="w-5 h-5 text-sky-400" />,
  Compass: <Compass className="w-5 h-5 text-emerald-400" />,
  Award: <Award className="w-5 h-5 text-amber-400" />,
  Crown: <Crown className="w-5 h-5 text-yellow-300" />,
  Zap: <Zap className="w-5 h-5 text-cyan-400" />,
  Flame: <Flame className="w-5 h-5 text-rose-400" />,
  Coins: <Coins className="w-5 h-5 text-amber-400" />,
  Gem: <Gem className="w-5 h-5 text-cyan-400" />,
  Shield: <Shield className="w-5 h-5 text-sky-400" />,
  Skull: <Trophy className="w-5 h-5 text-purple-400" />,
};

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  onClose,
  saveData,
  onClaimAchievement,
}) => {
  const totalCompleted = saveData.achievements.filter((a) => a.completed).length;

  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 z-30 select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full max-h-[85vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <BadgesNavIcon size={26} className="filter drop-shadow-md" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display">
              Achievements
            </h2>
            <span className="text-xs font-semibold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              {totalCompleted} / {saveData.achievements.length} Unlocked
            </span>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close Achievements"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Achievement List */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {saveData.achievements.map((ach) => {
            const icon = ICON_MAP[ach.icon] || <Award className="w-5 h-5 text-sky-400" />;
            const ratio = Math.min(1, ach.current / ach.target);

            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-all ${
                  ach.completed
                    ? 'bg-slate-950/60 border-slate-700/70'
                    : 'bg-slate-950/30 border-slate-800/60 opacity-80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                    {icon}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-white leading-snug">{ach.title}</span>
                    <span className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                      {ach.description}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                    <Coins className="w-3.5 h-3.5" />
                    <span>+{ach.rewardCoins}</span>
                  </div>

                  <div>
                    {ach.claimed ? (
                      <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Done
                      </span>
                    ) : ach.completed ? (
                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          soundEngine.playPowerup();
                          onClaimAchievement(ach.id);
                        }}
                        className="px-3 py-1 bg-yellow-400 hover:bg-yellow-300 text-slate-950 text-xs font-extrabold rounded-lg shadow transition-transform hover:scale-105 active:scale-95 cursor-pointer animate-pulse"
                      >
                        Claim
                      </button>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-500 tabular-nums">
                        {ach.current} / {ach.target}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
