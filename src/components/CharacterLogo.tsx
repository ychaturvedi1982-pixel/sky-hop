import React from 'react';

export interface CharacterLogoProps {
  characterId: string;
  size?: number;
  className?: string;
  skinId?: string;
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  showGlow?: boolean;
}

export const CharacterLogo: React.FC<CharacterLogoProps> = ({
  characterId,
  size = 48,
  className = '',
  skinId,
  primaryColor,
  secondaryColor,
  accentColor,
  rarity,
  showGlow = false,
}) => {
  // Resolve skin-specific overrides if skinId is provided
  let pCol = primaryColor;
  let sCol = secondaryColor;
  let aCol = accentColor;

  if (skinId) {
    if (skinId === 'pip_ruby') {
      pCol = pCol || '#ef4444';
      sCol = sCol || '#f97316';
      aCol = aCol || '#18181b';
    } else if (skinId === 'pip_phoenix') {
      pCol = pCol || '#f59e0b';
      sCol = sCol || '#ea580c';
      aCol = aCol || '#fef08a';
    } else if (skinId === 'bolt_stealth') {
      pCol = pCol || '#1e293b';
      sCol = sCol || '#a855f7';
      aCol = aCol || '#0f172a';
    } else if (skinId === 'bolt_gold') {
      pCol = pCol || '#eab308';
      sCol = sCol || '#06b6d4';
      aCol = aCol || '#fef08a';
    } else if (skinId === 'ignis_frost') {
      pCol = pCol || '#0284c7';
      sCol = sCol || '#38bdf8';
      aCol = aCol || '#e0f2fe';
    } else if (skinId === 'ignis_void') {
      pCol = pCol || '#581c87';
      sCol = sCol || '#c084fc';
      aCol = aCol || '#f43f5e';
    } else if (skinId === 'aura_emerald') {
      pCol = pCol || '#10b981';
      sCol = sCol || '#059669';
      aCol = aCol || '#6ee7b7';
    } else if (skinId === 'aura_celestial') {
      pCol = pCol || '#c084fc';
      sCol = sCol || '#38bdf8';
      aCol = aCol || '#ffffff';
    } else if (skinId === 'waddles_aviator') {
      pCol = pCol || '#78350f';
      sCol = sCol || '#d97706';
      aCol = aCol || '#38bdf8';
    } else if (skinId === 'cosmo_hyper') {
      pCol = pCol || '#ec4899';
      sCol = sCol || '#8b5cf6';
      aCol = aCol || '#67e8f9';
    }
  }

  // Rarity border color
  let borderColor = 'rgba(56, 189, 248, 0.4)';
  let bgGradient = 'from-slate-900 via-sky-950 to-slate-900';
  let glowStyle = '';

  if (rarity === 'legendary') {
    borderColor = 'rgba(245, 158, 11, 0.8)';
    bgGradient = 'from-amber-950 via-slate-900 to-amber-950';
    if (showGlow) glowStyle = 'shadow-[0_0_15px_rgba(245,158,11,0.45)]';
  } else if (rarity === 'epic') {
    borderColor = 'rgba(168, 85, 247, 0.75)';
    bgGradient = 'from-purple-950 via-slate-900 to-purple-950';
    if (showGlow) glowStyle = 'shadow-[0_0_15px_rgba(168,85,247,0.4)]';
  } else if (rarity === 'rare') {
    borderColor = 'rgba(6, 182, 212, 0.7)';
    bgGradient = 'from-cyan-950 via-slate-900 to-cyan-950';
    if (showGlow) glowStyle = 'shadow-[0_0_12px_rgba(6,182,212,0.35)]';
  }

  const renderVector = () => {
    switch (characterId) {
      case 'bolt': {
        const primary = pCol || '#64748b';
        const visor = sCol || '#06b6d4';
        const isGold = skinId === 'bolt_gold';
        const isStealth = skinId === 'bolt_stealth';

        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
          >
            {/* Background container */}
            <rect width="64" height="64" rx="18" fill="#090d16" />
            <rect x="1.5" y="1.5" width="61" height="61" rx="16.5" stroke={borderColor} strokeWidth="1.5" />

            {/* Glowing Tech Circuit Accents */}
            <circle cx="10" cy="10" r="1.5" fill={visor} fillOpacity="0.8" />
            <circle cx="54" cy="10" r="1.5" fill={visor} fillOpacity="0.8" />
            <line x1="10" y1="10" x2="18" y2="10" stroke={visor} strokeWidth="1" strokeOpacity="0.4" />
            <line x1="54" y1="10" x2="46" y2="10" stroke={visor} strokeWidth="1" strokeOpacity="0.4" />

            {/* Dual Rotor Mast */}
            <line x1="32" y1="9" x2="32" y2="18" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
            {/* Rotor blade ellipse */}
            <ellipse cx="32" cy="9" rx="22" ry="3.5" fill="#f1f5f9" fillOpacity="0.85" />
            <ellipse cx="32" cy="9" rx="14" ry="2" fill={visor} fillOpacity="0.6" />
            <circle cx="32" cy="9" r="3" fill="#334155" />
            <circle cx="32" cy="9" r="1.5" fill="#f8fafc" />

            {/* Jet Flame below */}
            <path d="M26 48L32 58L38 48Z" fill="#f97316" />
            <path d="M29 48L32 54L35 48Z" fill="#fef08a" />

            {/* Robot Head Chassis with Chamfered Corners */}
            <rect
              x="14"
              y="18"
              width="36"
              height="30"
              rx="9"
              fill={primary}
              stroke={isGold ? '#fef08a' : isStealth ? '#64748b' : '#cbd5e1'}
              strokeWidth="2"
            />
            {/* Chassis Top Highlight */}
            <path d="M19 20H45" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.5" />

            {/* Antenna / Sensor Pods */}
            <rect x="10" y="27" width="4" height="12" rx="2" fill="#1e293b" />
            <rect x="50" y="27" width="4" height="12" rx="2" fill="#1e293b" />
            <circle cx="12" cy="25" r="2" fill={visor} />
            <circle cx="52" cy="25" r="2" fill={visor} />

            {/* Digital Eye Visor Window */}
            <rect x="18" y="26" width="28" height="13" rx="5" fill="#020617" stroke="#334155" strokeWidth="1" />
            {/* Visor Glow */}
            <rect x="20" y="28" width="24" height="9" rx="3.5" fill={visor} />
            {/* Scanning line and pupil nodes */}
            <line x1="23" y1="32.5" x2="41" y2="32.5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
            <circle cx="26" cy="32.5" r="2.5" fill="#ffffff" />
            <circle cx="38" cy="32.5" r="2.5" fill="#ffffff" />

            {/* Chest Plate Vent */}
            <line x1="26" y1="44" x2="38" y2="44" stroke="#0f172a" strokeWidth="2" strokeLinecap="round" />
          </svg>
        );
      }

      case 'ignis': {
        const primary = pCol || '#dc2626';
        const secondary = sCol || '#f97316';
        const isFrost = skinId === 'ignis_frost';
        const isVoid = skinId === 'ignis_void';

        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
          >
            <rect width="64" height="64" rx="18" fill={isVoid ? '#150524' : isFrost ? '#041624' : '#1f0606'} />
            <rect x="1.5" y="1.5" width="61" height="61" rx="16.5" stroke={borderColor} strokeWidth="1.5" />

            {/* Fiery Embers Background Glow */}
            <circle cx="32" cy="34" r="22" fill={secondary} fillOpacity="0.18" />

            {/* Dragon Curved Horns */}
            <path
              d="M18 24C13 14 6 11 3 13C10 18 14 25 16 29Z"
              fill={isFrost ? '#7dd3fc' : isVoid ? '#c084fc' : '#f59e0b'}
              stroke="#ffffff"
              strokeWidth="0.8"
              strokeOpacity="0.4"
            />
            <path
              d="M46 24C51 14 58 11 61 13C54 18 50 25 48 29Z"
              fill={isFrost ? '#7dd3fc' : isVoid ? '#c084fc' : '#f59e0b'}
              stroke="#ffffff"
              strokeWidth="0.8"
              strokeOpacity="0.4"
            />

            {/* Dragon Head Shell */}
            <path
              d="M16 25C16 17 48 17 48 25C48 35 44 47 32 52C20 47 16 35 16 25Z"
              fill={primary}
              stroke={secondary}
              strokeWidth="1.5"
            />

            {/* Scaled Crest / Ridge */}
            <path d="M25 24C25 18 39 18 39 24C39 36 36 46 32 50C28 46 25 36 25 24Z" fill={secondary} />

            {/* Brow Ridges */}
            <path d="M19 23L27 26" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M45 23L37 26" stroke="#000000" strokeWidth="2.5" strokeLinecap="round" />

            {/* Piercing Dragon Eyes */}
            <ellipse cx="23" cy="30" rx="4.5" ry="5.5" fill={isFrost ? '#ffffff' : isVoid ? '#f43f5e' : '#fde047'} />
            <ellipse cx="41" cy="30" rx="4.5" ry="5.5" fill={isFrost ? '#ffffff' : isVoid ? '#f43f5e' : '#fde047'} />
            {/* Slit Pupils */}
            <line x1="23" y1="26" x2="23" y2="34" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
            <line x1="41" y1="26" x2="41" y2="34" stroke="#000000" strokeWidth="2" strokeLinecap="round" />
            {/* Eye Highlight dots */}
            <circle cx="21.5" cy="28.5" r="1" fill="#ffffff" />
            <circle cx="39.5" cy="28.5" r="1" fill="#ffffff" />

            {/* Dragon Snout & Nostril Flare */}
            <circle cx="28.5" cy="42" r="1.8" fill="#18181b" />
            <circle cx="35.5" cy="42" r="1.8" fill="#18181b" />

            {/* Flame Breath Tongue */}
            <path d="M30 45C30 45 32 58 32 58C32 58 34 45 34 45Z" fill={secondary} />
            <circle cx="32" cy="55" r="3" fill="#fef08a" />
          </svg>
        );
      }

      case 'aura': {
        const primary = pCol || '#ec4899';
        const secondary = sCol || '#8b5cf6';
        const isEmerald = skinId === 'aura_emerald';
        const isCelestial = skinId === 'aura_celestial';

        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
          >
            <rect width="64" height="64" rx="18" fill={isEmerald ? '#021a12' : '#140520'} />
            <rect x="1.5" y="1.5" width="61" height="61" rx="16.5" stroke={borderColor} strokeWidth="1.5" />

            {/* Shimmering Aura Halo */}
            <circle cx="32" cy="32" r="22" fill={primary} fillOpacity="0.22" />

            {/* Left Upper Butterfly Wing */}
            <path
              d="M30 28C14 8 2 17 6 32C10 41 28 34 30 28Z"
              fill={primary}
              stroke="#fdf2f8"
              strokeWidth="1.5"
            />
            {/* Right Upper Butterfly Wing */}
            <path
              d="M34 28C50 8 62 17 58 32C54 41 36 34 34 28Z"
              fill={primary}
              stroke="#fdf2f8"
              strokeWidth="1.5"
            />

            {/* Lower Wings */}
            <path
              d="M31 32C18 38 10 49 18 56C25 60 31 46 31 32Z"
              fill={secondary}
              stroke="#e9d5ff"
              strokeWidth="1.3"
            />
            <path
              d="M33 32C46 38 54 49 46 56C39 60 33 46 33 32Z"
              fill={secondary}
              stroke="#e9d5ff"
              strokeWidth="1.3"
            />

            {/* Wing Spots / Jewels */}
            <circle cx="15" cy="23" r="3.5" fill="#ffffff" fillOpacity="0.9" />
            <circle cx="15" cy="23" r="2" fill={secondary} />
            <circle cx="49" cy="23" r="3.5" fill="#ffffff" fillOpacity="0.9" />
            <circle cx="49" cy="23" r="2" fill={secondary} />

            <circle cx="19" cy="46" r="2.5" fill="#fde047" />
            <circle cx="45" cy="46" r="2.5" fill="#fde047" />

            {/* Sprite Body & Head */}
            <ellipse cx="32" cy="36" rx="3.5" ry="13" fill="#0f172a" stroke="#ffffff" strokeWidth="0.8" />
            <circle cx="32" cy="21" r="4.5" fill="#0f172a" stroke="#ffffff" strokeWidth="0.8" />

            {/* Curly Antennae with Glowing Orbs */}
            <path d="M30 18C26 12 21 11 19 13" stroke="#fbcfe8" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M34 18C38 12 43 11 45 13" stroke="#fbcfe8" strokeWidth="1.8" strokeLinecap="round" />
            <circle cx="18" cy="13" r="2" fill="#fde047" />
            <circle cx="46" cy="13" r="2" fill="#fde047" />
          </svg>
        );
      }

      case 'waddles': {
        const primary = pCol || '#0f172a';
        const secondary = sCol || '#f8fafc';
        const isAviator = skinId === 'waddles_aviator';

        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
          >
            <rect width="64" height="64" rx="18" fill="#0b1329" />
            <rect x="1.5" y="1.5" width="61" height="61" rx="16.5" stroke={borderColor} strokeWidth="1.5" />

            {/* Propeller Beanie on top or Aviator Cap */}
            {isAviator ? (
              <>
                {/* Leather Pilot Helmet */}
                <path d="M19 32C19 16 45 16 45 32V38H19V32Z" fill="#78350f" />
                {/* Brass Goggles */}
                <rect x="20" y="24" width="10" height="8" rx="3" fill="#38bdf8" stroke="#ca8a04" strokeWidth="1.8" />
                <rect x="34" y="24" width="10" height="8" rx="3" fill="#38bdf8" stroke="#ca8a04" strokeWidth="1.8" />
                <line x1="30" y1="28" x2="34" y2="28" stroke="#ca8a04" strokeWidth="2" />
                <circle cx="23" cy="27" r="1" fill="#ffffff" />
                <circle cx="37" cy="27" r="1" fill="#ffffff" />
              </>
            ) : (
              <>
                {/* Propeller Blade & Shaft */}
                <line x1="20" y1="10" x2="44" y2="10" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
                <circle cx="32" cy="10" r="3" fill="#fbbf24" />
                <line x1="32" y1="10" x2="32" y2="16" stroke="#94a3b8" strokeWidth="2.5" />
                {/* Beanie Cap (Red & Yellow) */}
                <path d="M24 18C24 13 40 13 40 18Z" fill="#ef4444" />
                <path d="M28 18C28 14 36 14 36 18Z" fill="#facc15" />
              </>
            )}

            {/* Plump Penguin Body */}
            <ellipse cx="32" cy="38" rx="19" ry="20" fill={primary} />

            {/* Flippers / Wings on sides */}
            <ellipse cx="14" cy="40" rx="4.5" ry="8" fill={primary} transform="rotate(20 14 40)" />
            <ellipse cx="50" cy="40" rx="4.5" ry="8" fill={primary} transform="rotate(-20 50 40)" />

            {/* Snowy White Belly Patch */}
            <ellipse cx="32" cy="42" rx="13" ry="15" fill={secondary} />

            {/* Cute Big Sparkling Eyes */}
            <ellipse cx="25.5" cy="30" rx="4" ry="5.5" fill="#ffffff" />
            <ellipse cx="38.5" cy="30" rx="4" ry="5.5" fill="#ffffff" />
            <circle cx="26.5" cy="30" r="2.5" fill="#0f172a" />
            <circle cx="37.5" cy="30" r="2.5" fill="#0f172a" />
            {/* Eye Glimmer highlights */}
            <circle cx="27.5" cy="29" r="1" fill="#ffffff" />
            <circle cx="38.5" cy="29" r="1" fill="#ffffff" />
            <circle cx="25.5" cy="31.5" r="0.6" fill="#ffffff" />
            <circle cx="36.5" cy="31.5" r="0.6" fill="#ffffff" />

            {/* Rosy Blushing Cheeks */}
            <ellipse cx="20" cy="36" rx="3" ry="2" fill="#f43f5e" fillOpacity="0.65" />
            <ellipse cx="44" cy="36" rx="3" ry="2" fill="#f43f5e" fillOpacity="0.65" />

            {/* Orange Penguin Beak */}
            <polygon points="27.5,33.5 36.5,33.5 32,41" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
          </svg>
        );
      }

      case 'cosmo': {
        const primary = pCol || '#059669';
        const secondary = sCol || '#10b981';
        const isHyper = skinId === 'cosmo_hyper';

        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
          >
            <rect width="64" height="64" rx="18" fill="#041416" />
            <rect x="1.5" y="1.5" width="61" height="61" rx="16.5" stroke={borderColor} strokeWidth="1.5" />

            {/* Cosmic Energy Glow */}
            <circle cx="32" cy="32" r="22" fill={secondary} fillOpacity="0.2" />

            {/* Anti-Gravity Ion Rings below */}
            <ellipse cx="32" cy="47" rx="15" ry="4.5" stroke="#34d399" strokeWidth="2" strokeDasharray="3 2" />
            <ellipse cx="32" cy="53" rx="9" ry="3" stroke="#38bdf8" strokeWidth="1.8" />

            {/* Glass Cockpit Dome */}
            <path
              d="M21 27C21 14 43 14 43 27Z"
              fill={isHyper ? '#e9d5ff' : '#a7f3d0'}
              fillOpacity="0.75"
              stroke="#ffffff"
              strokeWidth="1.5"
            />
            {/* Dome Glass Glare Line */}
            <path d="M26 24C26 18 33 17 38 18" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.8" />

            {/* Cute Little Alien Inside Cockpit */}
            <ellipse cx="32" cy="22" rx="5.5" ry="4.5" fill={isHyper ? '#ec4899' : '#10b981'} />
            <circle cx="30" cy="22" r="1.5" fill="#022c22" />
            <circle cx="34" cy="22" r="1.5" fill="#022c22" />
            {/* Alien Antenna */}
            <line x1="32" y1="18" x2="32" y2="13" stroke={isHyper ? '#ec4899' : '#10b981'} strokeWidth="1.5" strokeLinecap="round" />
            <circle cx="32" cy="13" r="2" fill="#fde047" />

            {/* Saucer Hull Metallic Disc */}
            <ellipse
              cx="32"
              cy="34"
              rx="25"
              ry="9.5"
              fill={primary}
              stroke={isHyper ? '#f472b6' : '#6ee7b7'}
              strokeWidth="1.8"
            />
            {/* Disc Top Ridge */}
            <ellipse cx="32" cy="32" rx="18" ry="5.5" fill="#ffffff" fillOpacity="0.25" />

            {/* Hull Porthole LEDs */}
            <circle cx="14" cy="34" r="2.2" fill="#fef08a" />
            <circle cx="23" cy="36.5" r="2.2" fill="#67e8f9" />
            <circle cx="32" cy="37.5" r="2.5" fill="#f472b6" />
            <circle cx="41" cy="36.5" r="2.2" fill="#67e8f9" />
            <circle cx="50" cy="34" r="2.2" fill="#fef08a" />
          </svg>
        );
      }

      case 'pip':
      default: {
        const primary = pCol || '#38bdf8';
        const secondary = sCol || '#f59e0b';
        const isPhoenix = skinId === 'pip_phoenix';
        const isRuby = skinId === 'pip_ruby';

        return (
          <svg
            width={size}
            height={size}
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
          >
            <rect width="64" height="64" rx="18" fill={isPhoenix ? '#1e0c03' : isRuby ? '#180305' : '#07243d'} />
            <rect x="1.5" y="1.5" width="61" height="61" rx="16.5" stroke={borderColor} strokeWidth="1.5" />

            {/* Soft Ambient Glow */}
            <circle cx="32" cy="32" r="22" fill={primary} fillOpacity="0.2" />

            {/* Tail Feathers */}
            <path d="M14 36L4 30L8 42Z" fill="#0284c7" />
            <path d="M12 37L6 35L9 40Z" fill={secondary} />

            {/* Main Round Songbird Body */}
            <ellipse cx="31" cy="35" rx="19" ry="17" fill={primary} stroke="#ffffff" strokeWidth="0.8" strokeOpacity="0.4" />

            {/* Golden Sunlight Belly */}
            <ellipse cx="35" cy="41" rx="13" ry="9.5" fill={secondary} />

            {/* Layered Flight Wing */}
            <path
              d="M19 33C17 28 27 26 33 29C38 31 36 38 29 40C24 41 19 38 19 33Z"
              fill="#0284c7"
              stroke="#bae6fd"
              strokeWidth="1.5"
            />
            {/* Inner Wing Feather Highlight */}
            <path d="M23 34C24 31 29 30 32 32" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.7" />

            {/* Sharp Curved Flying Beak */}
            <polygon points="46,31 59,36 46,42" fill="#f97316" stroke="#ea580c" strokeWidth="1" />
            <polygon points="46,36 57,36 46,41" fill="#ea580c" />

            {/* Big Friendly Finch Eye */}
            <circle cx="41" cy="27" r="5.5" fill="#ffffff" />
            <circle cx="42.5" cy="27" r="3" fill="#0f172a" />
            {/* Sparkle Highlights */}
            <circle cx="43.5" cy="26" r="1.2" fill="#ffffff" />
            <circle cx="41.5" cy="28.5" r="0.6" fill="#ffffff" />

            {/* Finch Head Feather Crest */}
            {isPhoenix ? (
              <>
                <path d="M24 18C26 10 33 11 32 19Z" fill="#f59e0b" />
                <path d="M29 16C32 8 38 9 37 18Z" fill="#fde047" />
                <path d="M34 18C37 11 42 12 40 20Z" fill="#ea580c" />
              </>
            ) : (
              <path d="M26 18C28 13 36 15 34 21Z" fill={primary} />
            )}
          </svg>
        );
      }
    }
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${glowStyle} ${className}`}>
      {renderVector()}
    </div>
  );
};

interface TrailLogoProps {
  trailType: string;
  size?: number;
  className?: string;
}

export const TrailLogo: React.FC<TrailLogoProps> = ({ trailType, size = 32, className = '' }) => {
  switch (trailType) {
    case 'rainbow':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`shrink-0 ${className}`}>
          <circle cx="16" cy="16" r="15" fill="#1e1b4b" stroke="#818cf8" strokeWidth="1.2" />
          <path d="M6 24A10 10 0 0 1 26 24" stroke="#ef4444" strokeWidth="2.5" />
          <path d="M8.5 24A7.5 7.5 0 0 1 23.5 24" stroke="#f59e0b" strokeWidth="2.5" />
          <path d="M11 24A5 5 0 0 1 21 24" stroke="#10b981" strokeWidth="2.5" />
          <path d="M13.5 24A2.5 2.5 0 0 1 18.5 24" stroke="#06b6d4" strokeWidth="2.5" />
        </svg>
      );
    case 'stardust':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`shrink-0 ${className}`}>
          <circle cx="16" cy="16" r="15" fill="#2e1065" stroke="#facc15" strokeWidth="1.2" />
          <path d="M16 6L18 13L25 15L18 17L16 24L14 17L7 15L14 13Z" fill="#fde047" />
          <circle cx="8" cy="8" r="1.5" fill="#ffffff" />
          <circle cx="24" cy="22" r="2" fill="#ffffff" />
        </svg>
      );
    case 'neon':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`shrink-0 ${className}`}>
          <circle cx="16" cy="16" r="15" fill="#082f49" stroke="#06b6d4" strokeWidth="1.2" />
          <path d="M18 5L9 18H16L14 27L23 14H16L18 5Z" fill="#06b6d4" stroke="#67e8f9" strokeWidth="1" />
        </svg>
      );
    case 'fire':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`shrink-0 ${className}`}>
          <circle cx="16" cy="16" r="15" fill="#450a0a" stroke="#f97316" strokeWidth="1.2" />
          <path
            d="M16 6C16 11 23 15 23 20C23 24 19.5 26 16 26C12.5 26 9 24 9 20C9 15 14 11 16 6Z"
            fill="#ea580c"
          />
          <path
            d="M16 13C16 16 20 18 20 21C20 23 18 24 16 24C14 24 12 23 12 21C12 18 15 16 16 13Z"
            fill="#facc15"
          />
        </svg>
      );
    case 'bubbles':
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`shrink-0 ${className}`}>
          <circle cx="16" cy="16" r="15" fill="#082f49" stroke="#38bdf8" strokeWidth="1.2" />
          <circle cx="13" cy="18" r="6" fill="#38bdf8" fillOpacity="0.4" stroke="#7dd3fc" strokeWidth="1.5" />
          <circle cx="11" cy="16" r="1.5" fill="#ffffff" />
          <circle cx="21" cy="11" r="4" fill="#38bdf8" fillOpacity="0.4" stroke="#7dd3fc" strokeWidth="1.5" />
          <circle cx="20" cy="9.5" r="1" fill="#ffffff" />
        </svg>
      );
    case 'clouds':
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={`shrink-0 ${className}`}>
          <circle cx="16" cy="16" r="15" fill="#0f172a" stroke="#94a3b8" strokeWidth="1.2" />
          <path
            d="M10 21C8 21 7 19.5 7 18C7 16.5 8.5 15.5 10 15.5C10.5 13.5 12.5 12 15 12C18 12 20 13.5 20.5 15.5C21.5 15.5 23 16.5 23 18C23 19.5 21.5 21 20 21Z"
            fill="#e2e8f0"
          />
        </svg>
      );
  }
};
