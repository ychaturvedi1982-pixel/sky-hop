import React, { useState, useEffect, useRef } from 'react';
import { X, Check, Lock, Sparkles, Coins, Gem, Zap } from 'lucide-react';
import { CharacterDef, CharacterSkin, TrailType, PlayerSaveData } from '../game/types';
import { CHARACTERS, TRAILS } from '../game/constants';
import { soundEngine } from '../game/audio';
import { GameRenderer } from '../game/renderer';
import { ParticleSystem } from '../game/particles';
import { WORLDS } from '../game/constants';
import { CharacterLogo, TrailLogo } from './CharacterLogo';
import { HeroesNavIcon } from './GameIcons';

interface CharacterModalProps {
  onClose: () => void;
  saveData: PlayerSaveData;
  onSelectCharacter: (charId: string) => void;
  onSelectSkin: (charId: string, skinId: string) => void;
  onSelectTrail: (trail: TrailType) => void;
  onUnlockCharacter: (charId: string) => void;
  onUnlockSkin: (skinId: string, costCoins: number) => void;
  onUnlockTrail: (trail: TrailType, costCoins: number) => void;
}

export const CharacterModal: React.FC<CharacterModalProps> = ({
  onClose,
  saveData,
  onSelectCharacter,
  onSelectSkin,
  onSelectTrail,
  onUnlockCharacter,
  onUnlockSkin,
  onUnlockTrail,
}) => {
  const [activeTab, setActiveTab] = useState<'characters' | 'trails'>('characters');
  const [selectedCharId, setSelectedCharId] = useState(saveData.selectedCharacterId);
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const character = CHARACTERS.find((c) => c.id === selectedCharId) || CHARACTERS[0];
  const activeSkinId = saveData.selectedSkinId[character.id] || character.defaultSkinId;
  const skin = character.skins.find((s) => s.id === activeSkinId) || character.skins[0];
  const isCharUnlocked = saveData.unlockedCharacters.includes(character.id);

  // Live Canvas Preview Animation
  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const particles = new ParticleSystem();
    const renderer = new GameRenderer(canvas, particles);
    renderer.resize(160, 160);

    let animId: number;
    let t = 0;

    const loop = () => {
      t += 0.02;
      const world = WORLDS[0];

      // Spawn trail particle
      if (Math.random() < 0.3) {
        particles.spawnTrail(80, 80, saveData.selectedTrail);
      }
      particles.update(0.016);

      renderer.render({
        width: 160,
        height: 160,
        playerX: 80,
        playerY: 80 + Math.sin(t * 3) * 8,
        playerVy: Math.sin(t * 3) * 120,
        playerRadius: character.radius,
        character,
        skin,
        trailType: saveData.selectedTrail,
        world,
        obstacles: [],
        coins: [],
        activePowerups: [],
        boss: null,
        scrollSpeed: 0,
        shakeOffset: { x: 0, y: 0 },
        totalTime: t,
        groundY: 155,
        isPlaying: false,
      });

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [character, skin, saveData.selectedTrail]);

  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 z-30 select-none">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl max-w-2xl w-full h-[90vh] max-h-[620px] shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <HeroesNavIcon size={28} className="filter drop-shadow-md" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-display">Hangar & Skins</h2>
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
            aria-label="Close Hangar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 bg-slate-900">
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('characters');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'characters'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Playable Characters
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('trails');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'trails'
                ? 'bg-sky-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            Flight Trails
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col md:flex-row gap-6">
          {activeTab === 'characters' ? (
            <>
              {/* Left Column: Character List */}
              <div className="flex-1 flex flex-col gap-2.5 overflow-y-auto pr-1">
                {CHARACTERS.map((char) => {
                  const unlocked = saveData.unlockedCharacters.includes(char.id);
                  const isSelected = selectedCharId === char.id;
                  const isEquipped = saveData.selectedCharacterId === char.id;

                  return (
                    <div
                      key={char.id}
                      onClick={() => {
                        soundEngine.playClick();
                        setSelectedCharId(char.id);
                      }}
                      className={`flex items-center justify-between p-3 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800/90 border-sky-500 shadow-md'
                          : 'bg-slate-950/40 border-slate-800 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <CharacterLogo
                          characterId={char.id}
                          size={46}
                          rarity={char.rarity}
                          showGlow={isSelected}
                          primaryColor={char.skins[0].primaryColor}
                          secondaryColor={char.skins[0].secondaryColor}
                        />
                        <div className="flex flex-col text-left">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-white">{char.name}</span>
                            <span className={`text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded ${
                              char.rarity === 'legendary' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                              char.rarity === 'epic' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                              char.rarity === 'rare' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' :
                              'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                              {char.rarity}
                            </span>
                          </div>
                          <span className="text-[11px] text-sky-400 flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            {char.abilityName}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {isEquipped ? (
                          <span className="px-2.5 py-1 bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 text-[10px] font-bold rounded-lg flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Active
                          </span>
                        ) : unlocked ? (
                          <span className="text-slate-400 text-xs font-semibold">Unlocked</span>
                        ) : (
                          <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-700">
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>{char.costCoins}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Character Details, Live Preview & Skins */}
              <div className="w-full md:w-68 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex flex-col items-center text-center">
                {/* Hero Portrait & Live Flight Preview Card */}
                <div className="w-full flex items-center justify-center gap-3 p-3 rounded-2xl bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 mb-3 shadow-md">
                  <CharacterLogo
                    characterId={character.id}
                    skinId={activeSkinId}
                    size={70}
                    rarity={character.rarity}
                    showGlow={true}
                    primaryColor={character.skins.find(s => s.id === activeSkinId)?.primaryColor}
                    secondaryColor={character.skins.find(s => s.id === activeSkinId)?.secondaryColor}
                  />
                  <div className="w-22 h-22 rounded-2xl overflow-hidden border border-slate-700 bg-slate-900 shadow-inner">
                    <canvas ref={previewCanvasRef} width={160} height={160} className="w-full h-full" />
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-lg font-bold text-white">{character.name}</h3>
                  <span className={`text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded ${
                    character.rarity === 'legendary' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                    character.rarity === 'epic' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                    character.rarity === 'rare' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' :
                    'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {character.species}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-2">{character.description}</p>

                {/* Ability Card */}
                <div className="w-full bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-left mb-3">
                  <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                    SPECIAL: {character.abilityName}
                  </span>
                  <p className="text-[11px] text-slate-300 mt-0.5">{character.abilityDesc}</p>
                </div>

                {/* Stats */}
                <div className="w-full flex flex-col gap-1.5 text-xs text-slate-300 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-400">Air Speed</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`w-3 h-1.5 rounded-sm ${
                            i <= character.statSpeed ? 'bg-sky-400' : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-400">Control</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`w-3 h-1.5 rounded-sm ${
                            i <= character.statControl ? 'bg-emerald-400' : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[11px] text-slate-400">Magnet Reach</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`w-3 h-1.5 rounded-sm ${
                            i <= character.statMagnet ? 'bg-amber-400' : 'bg-slate-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Skin Selector with Character Portraits */}
                {isCharUnlocked && (
                  <div className="w-full mb-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-1.5 text-left">
                      Pilot Wardrobe & Skins
                    </span>
                    <div className="grid grid-cols-3 gap-2 justify-center">
                      {character.skins.map((s) => {
                        const isSkinUnlocked = saveData.unlockedSkins.includes(s.id);
                        const isCurrentSkin = activeSkinId === s.id;
                        return (
                          <button
                            key={s.id}
                            onClick={() => {
                              soundEngine.playClick();
                              if (isSkinUnlocked) {
                                onSelectSkin(character.id, s.id);
                              } else {
                                onUnlockSkin(s.id, s.costCoins);
                              }
                            }}
                            title={`${s.name} ${!isSkinUnlocked ? `(${s.costCoins} coins)` : ''}`}
                            className={`p-1.5 rounded-2xl border-2 transition-all hover:scale-103 flex flex-col items-center justify-center cursor-pointer relative bg-slate-900/90 ${
                              isCurrentSkin ? 'border-sky-400 ring-2 ring-sky-400/40 shadow-lg' : 'border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <CharacterLogo
                              characterId={character.id}
                              skinId={s.id}
                              size={38}
                              primaryColor={s.primaryColor}
                              secondaryColor={s.secondaryColor}
                            />
                            <span className="text-[9px] font-bold text-slate-200 mt-1 max-w-[60px] truncate">
                              {s.name}
                            </span>
                            {!isSkinUnlocked ? (
                              <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-[1px] rounded-2xl flex flex-col items-center justify-center gap-0.5">
                                <Lock className="w-3.5 h-3.5 text-amber-400 drop-shadow" />
                                <span className="text-[8px] font-extrabold text-amber-400">{s.costCoins}</span>
                              </div>
                            ) : isCurrentSkin ? (
                              <div className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center shadow">
                                <Check className="w-2.5 h-2.5 text-slate-950 stroke-[3]" />
                              </div>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Equip / Unlock CTA */}
                {isCharUnlocked ? (
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onSelectCharacter(character.id);
                    }}
                    disabled={saveData.selectedCharacterId === character.id}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      saveData.selectedCharacterId === character.id
                        ? 'bg-slate-800 text-slate-400 cursor-default'
                        : 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md hover:scale-102'
                    }`}
                  >
                    {saveData.selectedCharacterId === character.id ? 'Equipped' : 'Equip Character'}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      soundEngine.playClick();
                      onUnlockCharacter(character.id);
                    }}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-transform hover:scale-102 active:scale-98 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Coins className="w-4 h-4" />
                    <span>Unlock for {character.costCoins} Coins</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            /* Flight Trails Tab */
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TRAILS.map((trail) => {
                const unlocked = saveData.unlockedTrails.includes(trail.id);
                const isEquipped = saveData.selectedTrail === trail.id;

                return (
                  <div
                    key={trail.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                      isEquipped
                        ? 'bg-slate-800/90 border-sky-500 shadow-md'
                        : 'bg-slate-950/40 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <TrailLogo trailType={trail.id} size={36} />
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-sm text-white">{trail.name}</span>
                        <span className="text-xs text-slate-400">{trail.desc}</span>
                      </div>
                    </div>

                    <div>
                      {isEquipped ? (
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/40 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" />
                          Equipped
                        </span>
                      ) : unlocked ? (
                        <button
                          onClick={() => {
                            soundEngine.playClick();
                            onSelectTrail(trail.id);
                          }}
                          className="px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-bold rounded-xl shadow transition-colors cursor-pointer"
                        >
                          Equip
                        </button>
                      ) : (
                        <button
                          onClick={() => {
                            soundEngine.playClick();
                            onUnlockTrail(trail.id, trail.costCoins);
                          }}
                          className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow transition-colors cursor-pointer"
                        >
                          <Coins className="w-3.5 h-3.5" />
                          <span>{trail.costCoins}</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
