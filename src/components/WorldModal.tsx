import { X, Check, Lock, CloudRain, Sun, Cloud, Sparkles, Coins } from 'lucide-react';
import { WorldDef, PlayerSaveData } from '../game/types';
import { WORLDS } from '../game/constants';
import { soundEngine } from '../game/audio';
import { WorldsNavIcon } from './GameIcons';

interface WorldModalProps {
  onClose: () => void;
  saveData: PlayerSaveData;
  onSelectWorld: (worldId: string) => void;
  onUnlockWorld: (worldId: string, costCoins: number) => void;
}

export const WorldModal: React.FC<WorldModalProps> = ({
  onClose,
  saveData,
  onSelectWorld,
  onUnlockWorld,
}) => {
  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 z-30 select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full max-h-[85vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display flex items-center gap-2.5">
              <WorldsNavIcon size={28} className="filter drop-shadow-md" />
              World Atmospheres
            </h2>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close Worlds"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* World Grid */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {WORLDS.map((world) => {
            const unlocked = saveData.unlockedWorlds.includes(world.id);
            const isSelected = saveData.selectedWorldId === world.id;
            const canUnlockLevel = saveData.level >= world.unlockLevel;

            return (
              <div
                key={world.id}
                className={`flex flex-col justify-between p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-slate-800/90 border-emerald-500 shadow-lg'
                    : 'bg-slate-950/50 border-slate-800 hover:bg-slate-800/40'
                }`}
              >
                {/* World Sky Preview Banner */}
                <div
                  className="w-full h-20 rounded-xl mb-3 p-3 flex flex-col justify-between relative overflow-hidden shadow-inner"
                  style={{
                    background: `linear-gradient(to bottom, ${world.skyTop}, ${world.skyBottom})`,
                  }}
                >
                  <div className="flex justify-between items-center text-xs font-bold text-white drop-shadow">
                    <span className="flex items-center gap-1">
                      {world.weather === 'rain' && <CloudRain className="w-3.5 h-3.5" />}
                      {world.weather === 'stars' && <Sparkles className="w-3.5 h-3.5" />}
                      {world.weather === 'clouds' && <Cloud className="w-3.5 h-3.5" />}
                      {world.weather === 'clear' && <Sun className="w-3.5 h-3.5" />}
                      <span className="capitalize">{world.weather.replace('_', ' ')}</span>
                    </span>
                    <span className="text-[10px] uppercase tracking-wider bg-black/40 px-2 py-0.5 rounded-full">
                      Theme: {world.theme}
                    </span>
                  </div>

                  <div className="flex items-baseline justify-between text-white drop-shadow">
                    <h3 className="font-extrabold text-base">{world.name}</h3>
                  </div>
                </div>

                <p className="text-xs text-slate-400 mb-4">{world.description}</p>

                {/* Footer status / button */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                  <div className="text-[11px] text-slate-400">
                    {!unlocked && (
                      <span className="font-medium">
                        Requires Level {world.unlockLevel}
                      </span>
                    )}
                  </div>

                  <div>
                    {isSelected ? (
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl border border-emerald-500/40 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        Selected
                      </span>
                    ) : unlocked ? (
                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          onSelectWorld(world.id);
                        }}
                        className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl shadow transition-colors cursor-pointer"
                      >
                        Fly Here
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          soundEngine.playClick();
                          onUnlockWorld(world.id, world.costCoins);
                        }}
                        disabled={!canUnlockLevel}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          canUnlockLevel
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        {world.costCoins > 0 ? (
                          <span className="flex items-center gap-1">
                            <Coins className="w-3 h-3" />
                            {world.costCoins}
                          </span>
                        ) : (
                          <span>Level {world.unlockLevel}</span>
                        )}
                      </button>
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
