import React from 'react';
import { X, Settings, Volume2, VolumeX, Eye, Sparkles, Vibrate, Keyboard } from 'lucide-react';
import { GameSettings } from '../game/types';
import { soundEngine } from '../game/audio';

interface SettingsModalProps {
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  settings,
  onUpdateSettings,
}) => {
  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 z-30 select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-lg w-full max-h-[85vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-sky-400" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display">
              Game Settings
            </h2>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close Settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Form */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 text-sm">
          {/* Audio Controls */}
          <div className="flex flex-col gap-3 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-1.5">
              <Volume2 className="w-4 h-4 text-sky-400" />
              Audio Synthesizer
            </h3>

            {/* Sound FX Slider */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const next = !settings.sfxEnabled;
                    soundEngine.setSfxEnabled(next);
                    onUpdateSettings({ sfxEnabled: next });
                    soundEngine.playClick();
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                >
                  {settings.sfxEnabled ? (
                    <Volume2 className="w-4 h-4 text-sky-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-500" />
                  )}
                </button>
                <span className="font-medium text-slate-200">Sound Effects</span>
              </div>
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
                className="w-32 accent-sky-400 cursor-pointer"
              />
            </div>

            {/* Ambient Background Music */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const next = !settings.musicEnabled;
                    soundEngine.setMusicEnabled(next);
                    onUpdateSettings({ musicEnabled: next });
                    soundEngine.playClick();
                  }}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white cursor-pointer"
                >
                  {settings.musicEnabled ? (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-500" />
                  )}
                </button>
                <span className="font-medium text-slate-200">Ambient Music</span>
              </div>
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
                className="w-32 accent-emerald-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Visuals & Accessibility */}
          <div className="flex flex-col gap-3 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
            <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-400 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-amber-400" />
              Visuals & Accessibility
            </h3>

            {/* Screen Shake Toggle */}
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-200 flex items-center gap-2">
                <Vibrate className="w-4 h-4 text-rose-400" />
                Screen Shake on Impact
              </span>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onUpdateSettings({ screenShake: !settings.screenShake });
                }}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.screenShake ? 'bg-sky-500' : 'bg-slate-800'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                    settings.screenShake ? 'right-1' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Particle Density */}
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                Particle Density
              </span>
              <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
                {(['low', 'medium', 'high'] as const).map((density) => (
                  <button
                    key={density}
                    onClick={() => {
                      soundEngine.playClick();
                      onUpdateSettings({ particleDensity: density });
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                      settings.particleDensity === density
                        ? 'bg-sky-500 text-slate-950'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {density}
                  </button>
                ))}
              </div>
            </div>

            {/* Colorblind Palette Mode */}
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-200">Color Palette Filter</span>
              <select
                value={settings.colorblindMode}
                onChange={(e) => {
                  soundEngine.playClick();
                  onUpdateSettings({
                    colorblindMode: e.target.value as GameSettings['colorblindMode'],
                  });
                }}
                className="bg-slate-900 text-slate-200 text-xs font-medium px-3 py-1.5 rounded-xl border border-slate-700 cursor-pointer"
              >
                <option value="none">Standard Color</option>
                <option value="deuteranopia">Deuteranopia</option>
                <option value="protanopia">Protanopia</option>
                <option value="tritanopia">Tritanopia</option>
                <option value="high_contrast">High Contrast</option>
              </select>
            </div>
          </div>

          {/* Key Bindings Help */}
          <div className="flex flex-col gap-2 bg-slate-950/40 p-4 rounded-2xl border border-slate-800/80 text-xs text-slate-400">
            <span className="text-slate-300 font-bold flex items-center gap-1.5">
              <Keyboard className="w-4 h-4 text-emerald-400" />
              Supported Controls
            </span>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span>Fly / Flap Upward</span>
              <span className="font-mono text-slate-200 font-semibold">Space / Up Arrow / W / Tap Screen</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span>Pause / Resume</span>
              <span className="font-mono text-slate-200 font-semibold">Escape / P</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Quick Restart</span>
              <span className="font-mono text-slate-200 font-semibold">R</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
