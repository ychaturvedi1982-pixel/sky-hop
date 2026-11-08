import React, { useState, useEffect } from 'react';
import { Heart, Sparkles, Gem, Coins, ArrowRight, Shield } from 'lucide-react';
import { soundEngine } from '../game/audio';
import { PlayerSaveData } from '../game/types';
import { CHARACTERS } from '../game/constants';
import { CharacterLogo } from './CharacterLogo';

interface ReviveModalProps {
  score: number;
  distanceMeters: number;
  cause: string;
  saveData: PlayerSaveData;
  onRevive: (paymentType: 'gem' | 'coins' | 'free') => void;
  onSkip: () => void;
}

export const ReviveModal: React.FC<ReviveModalProps> = ({
  score,
  distanceMeters,
  cause,
  saveData,
  onRevive,
  onSkip,
}) => {
  const [timeLeft, setTimeLeft] = useState(5);

  const character =
    CHARACTERS.find((c) => c.id === saveData.selectedCharacterId) || CHARACTERS[0];
  const activeSkinId =
    saveData.selectedSkinId[character.id] || character.defaultSkinId;

  useEffect(() => {
    if (timeLeft <= 0) {
      onSkip();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onSkip]);

  const canAffordGem = saveData.gems >= 1;
  const canAffordCoins = saveData.coins >= 50;

  return (
    <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 z-30 select-none animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-amber-500/60 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-[0_0_50px_rgba(245,158,11,0.25)] flex flex-col items-center text-center relative overflow-hidden">
        {/* Pulsing Aura Rings */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl" />
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-sky-500/20 rounded-full blur-2xl" />

        {/* Character Photo in Resurrection Golden Shield Aura */}
        <div className="relative mb-3 flex items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500/30 via-yellow-500/20 to-sky-500/30 border-2 border-amber-400 p-1 flex items-center justify-center shadow-lg shadow-amber-500/30 animate-pulse">
            <CharacterLogo
              characterId={character.id}
              skinId={activeSkinId}
              size={64}
              rarity={character.rarity}
              showGlow={true}
              primaryColor={character.skins.find(s => s.id === activeSkinId)?.primaryColor}
              secondaryColor={character.skins.find(s => s.id === activeSkinId)?.secondaryColor}
            />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-400 border-2 border-slate-900 flex items-center justify-center shadow">
            <Shield className="w-4 h-4 text-slate-950" />
          </div>
        </div>

        <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 mb-0.5">
          {cause}
        </span>
        <h2 className="text-2xl sm:text-3xl font-black text-white font-display tracking-tight">
          SECOND CHANCE?
        </h2>
        <p className="text-xs text-slate-300 mt-1 mb-4">
          Revive with a 3.5s Golden Shield & continue your flight!
        </p>

        {/* Current Score Pill */}
        <div className="flex items-center gap-3 bg-slate-900/90 px-4 py-1.5 rounded-xl border border-slate-800 text-xs font-semibold mb-5">
          <span className="text-slate-400">Score: <strong className="text-sky-400 font-display tabular-nums">{score}</strong></span>
          <span className="text-slate-600">·</span>
          <span className="text-slate-400">Distance: <strong className="text-white font-display tabular-nums">{Math.round(distanceMeters)}m</strong></span>
        </div>

        {/* Revive Buttons */}
        <div className="flex flex-col gap-2.5 w-full mb-4">
          {canAffordGem ? (
            <button
              onClick={() => {
                soundEngine.playClick();
                onRevive('gem');
              }}
              className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-sm rounded-2xl shadow-lg transition-transform hover:scale-102 active:scale-98 cursor-pointer"
            >
              <Gem className="w-4 h-4 fill-slate-950" />
              <span>REVIVE (1 Gem)</span>
              <Sparkles className="w-4 h-4" />
            </button>
          ) : canAffordCoins ? (
            <button
              onClick={() => {
                soundEngine.playClick();
                onRevive('coins');
              }}
              className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-sm rounded-2xl shadow-lg transition-transform hover:scale-102 active:scale-98 cursor-pointer"
            >
              <Coins className="w-4 h-4" />
              <span>REVIVE (50 Coins)</span>
              <Sparkles className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                soundEngine.playClick();
                onRevive('free');
              }}
              className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-emerald-400 to-teal-400 hover:from-emerald-300 hover:to-teal-300 text-slate-950 font-extrabold text-sm rounded-2xl shadow-lg transition-transform hover:scale-102 active:scale-98 cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-slate-950" />
              <span>FREE EMERGENCY REVIVE!</span>
            </button>
          )}

          <button
            onClick={() => {
              soundEngine.playClick();
              onSkip();
            }}
            className="flex items-center justify-center gap-1.5 w-full py-2 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-semibold rounded-xl border border-slate-800 transition-colors cursor-pointer"
          >
            <span>End Flight</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Countdown Ring */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
          <span>Auto ending in</span>
          <span className="font-bold text-amber-400 text-xs w-4 tabular-nums">{timeLeft}s</span>
        </div>
      </div>
    </div>
  );
};
