import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';
import { soundEngine } from '../game/audio';
import { GameSettings } from '../game/types';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onHome,
  settings,
  onUpdateSettings,
}) => {
  return (
    <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 z-30 select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl flex flex-col items-center text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2 font-display">
          GAME PAUSED
        </h2>
        <p className="text-xs text-slate-400 mb-6">Take a breath, pilot!</p>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full mb-6">
          <button
            onClick={() => {
              soundEngine.playClick();
              onResume();
            }}
            className="flex items-center justify-center gap-2.5 w-full py-3.5 bg-gradient-to-r from-sky-500 to-cyan-400 hover:from-sky-400 hover:to-cyan-300 text-slate-950 font-bold rounded-2xl shadow-lg transition-transform hover:scale-102 active:scale-98 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>RESUME</span>
          </button>

          <button
            data-start="true"
            onClick={() => {
              soundEngine.playClick();
              onRestart();
            }}
            className="flex items-center justify-center gap-2.5 w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold rounded-2xl border border-slate-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESTART</span>
          </button>

          <button
            onClick={() => {
              soundEngine.playClick();
              onHome();
            }}
            className="flex items-center justify-center gap-2.5 w-full py-2.5 bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-white text-sm font-medium rounded-xl transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>MAIN MENU</span>
          </button>
        </div>

        {/* Quick Audio Controls */}
        <div className="w-full bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800 flex flex-col gap-3">
          <div className="flex items-center justify-between text-xs font-medium text-slate-300">
            <span className="flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-sky-400" />
              Sound FX
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.sfxVolume}
              onChange={(e) => {
                const vol = parseFloat(e.target.value);
                soundEngine.setSfxVolume(vol);
                onUpdateSettings({ sfxVolume: vol });
              }}
              className="w-24 accent-sky-400 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between text-xs font-medium text-slate-300">
            <span className="flex items-center gap-1.5">
              {settings.musicEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
              Music
            </span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.musicVolume}
              onChange={(e) => {
                const vol = parseFloat(e.target.value);
                soundEngine.setMusicVolume(vol);
                onUpdateSettings({ musicVolume: vol });
              }}
              className="w-24 accent-emerald-400 cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
