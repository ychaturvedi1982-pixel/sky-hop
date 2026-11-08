import React from 'react';
import { X, Check, Coins, Gem } from 'lucide-react';
import { PlayerSaveData } from '../game/types';
import { soundEngine } from '../game/audio';
import { MissionsNavIcon } from './GameIcons';

interface MissionsModalProps {
  onClose: () => void;
  saveData: PlayerSaveData;
  onClaimMission: (missionId: string) => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  onClose,
  saveData,
  onClaimMission,
}) => {
  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 z-30 select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-xl w-full max-h-[85vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <MissionsNavIcon size={26} className="filter drop-shadow-md" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display">
              Pilot Missions
            </h2>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close Missions"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mission List */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
          {saveData.missions.map((mission) => {
            const progressRatio = Math.min(1, mission.current / mission.target);

            return (
              <div
                key={mission.id}
                className="p-4 rounded-2xl bg-slate-950/50 border border-slate-800 flex flex-col gap-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-extrabold text-amber-400 tracking-wider">
                        {mission.type}
                      </span>
                      <span className="text-sm font-bold text-white">{mission.title}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{mission.description}</p>
                  </div>

                  {/* Rewards */}
                  <div className="flex items-center gap-2 text-xs font-bold shrink-0">
                    <span className="flex items-center gap-1 text-amber-400 tabular-nums">
                      <Coins className="w-3.5 h-3.5" />
                      +{mission.rewardCoins}
                    </span>
                    {mission.rewardGems > 0 && (
                      <span className="flex items-center gap-1 text-cyan-400 tabular-nums">
                        <Gem className="w-3.5 h-3.5" />
                        +{mission.rewardGems}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar + Claim CTA */}
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex-1 flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Progress</span>
                      <span className="tabular-nums">
                        {mission.current} / {mission.target}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-300"
                        style={{ width: `${progressRatio * 100}%` }}
                      />
                    </div>
                  </div>

                  <div>
                    {mission.claimed ? (
                      <span className="text-xs text-slate-500 font-bold px-3 py-1 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Claimed
                      </span>
                    ) : mission.completed ? (
                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          soundEngine.playPowerup();
                          onClaimMission(mission.id);
                        }}
                        className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 text-xs font-extrabold rounded-xl shadow-md transition-transform hover:scale-105 active:scale-95 cursor-pointer animate-pulse"
                      >
                        Claim Reward
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500 font-semibold px-2">In Progress</span>
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
