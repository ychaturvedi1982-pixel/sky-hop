import React from 'react';
import { X, Coins, Gem, Sparkles, Check, Lock, Award } from 'lucide-react';
import { PlayerSaveData, TrailType } from '../game/types';
import { CHARACTERS, TRAILS } from '../game/constants';
import { soundEngine } from '../game/audio';
import { CharacterLogo, TrailLogo } from './CharacterLogo';
import { ShopNavIcon } from './GameIcons';

interface ShopModalProps {
  onClose: () => void;
  saveData: PlayerSaveData;
  onUnlockCharacter: (charId: string) => void;
  onUnlockSkin: (skinId: string, costCoins: number) => void;
  onUnlockTrail: (trail: TrailType, costCoins: number) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  onClose,
  saveData,
  onUnlockCharacter,
  onUnlockSkin,
  onUnlockTrail,
}) => {
  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 z-30 select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full max-h-[85vh] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <ShopNavIcon size={28} className="filter drop-shadow-md" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display">
              Aviation Shop
            </h2>
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-xl border border-slate-800 text-xs font-bold">
              <span className="text-amber-400 tabular-nums flex items-center gap-1">
                <Coins className="w-3.5 h-3.5" />
                {saveData.coins}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-cyan-400 tabular-nums flex items-center gap-1">
                <Gem className="w-3.5 h-3.5" />
                {saveData.gems}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close Shop"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shop Sections */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Character Recruits */}
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-sky-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Pilot Roster
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CHARACTERS.map((char) => {
                const unlocked = saveData.unlockedCharacters.includes(char.id);
                const canAfford = saveData.coins >= char.costCoins && saveData.gems >= char.costGems;

                return (
                  <div
                    key={char.id}
                    className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 flex items-center justify-between shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <CharacterLogo
                        characterId={char.id}
                        size={52}
                        rarity={char.rarity}
                        showGlow={unlocked}
                        primaryColor={char.skins[0].primaryColor}
                        secondaryColor={char.skins[0].secondaryColor}
                      />
                      <div className="flex flex-col text-left">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-white">{char.name}</span>
                          <span className={`text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded ${
                            char.rarity === 'legendary' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                            char.rarity === 'epic' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                            char.rarity === 'rare' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {char.species}
                          </span>
                        </div>
                        <span className="text-[11px] text-sky-400 font-medium">{char.abilityName}</span>
                      </div>
                    </div>

                    <div>
                      {unlocked ? (
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/30">
                          <Check className="w-3.5 h-3.5" /> Owned
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            soundEngine.playClick();
                            soundEngine.playPowerup();
                            onUnlockCharacter(char.id);
                          }}
                          disabled={!canAfford}
                          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
                            canAfford
                              ? 'bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 shadow-md'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <Coins className="w-3.5 h-3.5 fill-slate-950" />
                          <span>{char.costCoins}</span>
                          {char.costGems > 0 && <span>+{char.costGems}💎</span>}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pilot Skins & Outfits Boutique */}
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-400 mb-3 flex items-center gap-1.5">
              <Award className="w-4 h-4" />
              Pilot Wardrobe & Outfits
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {CHARACTERS.flatMap((char) =>
                char.skins
                  .filter((s) => s.costCoins > 0)
                  .map((skin) => {
                    const unlocked = saveData.unlockedSkins.includes(skin.id);
                    const canAfford = saveData.coins >= skin.costCoins;

                    return (
                      <div
                        key={skin.id}
                        className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <CharacterLogo
                            characterId={char.id}
                            skinId={skin.id}
                            size={42}
                            rarity={skin.rarity}
                            primaryColor={skin.primaryColor}
                            secondaryColor={skin.secondaryColor}
                          />
                          <div className="flex flex-col text-left">
                            <span className="font-bold text-xs text-white truncate max-w-[90px]">{skin.name}</span>
                            <span className="text-[10px] text-slate-400">{char.name}</span>
                          </div>
                        </div>

                        <div>
                          {unlocked ? (
                            <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                              <Check className="w-3 h-3" /> In Locker
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                soundEngine.playClick();
                                soundEngine.playPowerup();
                                onUnlockSkin(skin.id, skin.costCoins);
                              }}
                              disabled={!canAfford}
                              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                canAfford
                                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow'
                                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                              }`}
                            >
                              <Coins className="w-3 h-3" />
                              <span>{skin.costCoins}</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* Flight Trails */}
          <div>
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-rose-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" />
              Cosmetic Flight Trails
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {TRAILS.map((trail) => {
                const unlocked = saveData.unlockedTrails.includes(trail.id);
                const canAfford = saveData.coins >= trail.costCoins;

                return (
                  <div
                    key={trail.id}
                    className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800 flex flex-col justify-between"
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <TrailLogo trailType={trail.id} size={32} />
                      <span className="font-bold text-xs text-white truncate">{trail.name}</span>
                    </div>

                    <div>
                      {unlocked ? (
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                          <Check className="w-3 h-3" /> In Locker
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            soundEngine.playClick();
                            soundEngine.playPowerup();
                            onUnlockTrail(trail.id, trail.costCoins);
                          }}
                          disabled={!canAfford}
                          className={`w-full py-1 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                            canAfford
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <Coins className="w-3 h-3" />
                          <span>{trail.costCoins}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
