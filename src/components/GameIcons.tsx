import React from 'react';

interface GameIconProps {
  className?: string;
  size?: number;
}

/**
 * Handcrafted vector game icons for SKY HOP navigation, modals, and achievements.
 * Designed with authentic aviation arcade aesthetic (gradients, highlights, and depth),
 * completely avoiding generic AI-slop outline icons.
 */

// 1. HEROES / HANGAR ICON: Winged Aviator Pilot Helmet with Glass Goggles & Flight Wings
export const HeroesNavIcon: React.FC<GameIconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    className={className}
    style={size ? { width: size, height: size } : undefined}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="heroHelmetGrad" x1="24" y1="6" x2="24" y2="38" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38bdf8" />
        <stop offset="0.6" stopColor="#0284c7" />
        <stop offset="1" stopColor="#0369a1" />
      </linearGradient>
      <linearGradient id="heroWingGrad" x1="4" y1="18" x2="44" y2="32" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fde047" />
        <stop offset="0.5" stopColor="#f59e0b" />
        <stop offset="1" stopColor="#d97706" />
      </linearGradient>
      <linearGradient id="heroGoggleGrad" x1="14" y1="18" x2="34" y2="28" gradientUnits="userSpaceOnUse">
        <stop stopColor="#67e8f9" />
        <stop offset="1" stopColor="#0891b2" />
      </linearGradient>
    </defs>
    {/* Left Flight Wing */}
    <path
      d="M12 24C6 24 2 21 2 17C2 13 8 16 14 19L12 24Z"
      fill="url(#heroWingGrad)"
      filter="drop-shadow(0 2px 3px rgba(0,0,0,0.4))"
    />
    <path d="M14 26C8 28 3 26 3 23C3 20 9 22 15 23L14 26Z" fill="#f59e0b" />
    {/* Right Flight Wing */}
    <path
      d="M36 24C42 24 46 21 46 17C46 13 40 16 34 19L36 24Z"
      fill="url(#heroWingGrad)"
      filter="drop-shadow(0 2px 3px rgba(0,0,0,0.4))"
    />
    <path d="M34 26C40 28 45 26 45 23C45 20 39 22 33 23L34 26Z" fill="#f59e0b" />
    {/* Aviator Helmet Shell */}
    <circle cx="24" cy="22" r="14" fill="url(#heroHelmetGrad)" filter="drop-shadow(0 3px 4px rgba(0,0,0,0.5))" />
    <path d="M12 22C12 15.3726 17.3726 10 24 10C30.6274 10 36 15.3726 36 22H12Z" fill="#7dd3fc" fillOpacity="0.3" />
    {/* Helmet Ridge Crest */}
    <path d="M22 8C22 7 23 6 24 6C25 6 26 7 26 8V18H22V8Z" fill="#fde047" />
    {/* Twin Aviator Goggles */}
    <rect x="13" y="18" width="10" height="9" rx="4.5" fill="#0f172a" stroke="#fbbf24" strokeWidth="1.5" />
    <rect x="14" y="19" width="8" height="7" rx="3.5" fill="url(#heroGoggleGrad)" />
    <ellipse cx="16.5" cy="21" rx="2" ry="1" fill="#ffffff" fillOpacity="0.8" />
    <rect x="25" y="18" width="10" height="9" rx="4.5" fill="#0f172a" stroke="#fbbf24" strokeWidth="1.5" />
    <rect x="26" y="19" width="8" height="7" rx="3.5" fill="url(#heroGoggleGrad)" />
    <ellipse cx="28.5" cy="21" rx="2" ry="1" fill="#ffffff" fillOpacity="0.8" />
    {/* Goggle Bridge Strap */}
    <rect x="22" y="21" width="4" height="3" rx="1.5" fill="#fbbf24" />
    {/* Leather Chin Strap Buckle */}
    <path d="M16 30C16 34.4183 19.5817 38 24 38C28.4183 38 32 34.4183 32 30" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);

// 2. WORLDS / ATMOSPHERES ICON: Floating Celestial Globe with Planetary Ring & Sky Cloud
export const WorldsNavIcon: React.FC<GameIconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    className={className}
    style={size ? { width: size, height: size } : undefined}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="worldGlobeGrad" x1="12" y1="10" x2="36" y2="38" gradientUnits="userSpaceOnUse">
        <stop stopColor="#34d399" />
        <stop offset="0.5" stopColor="#059669" />
        <stop offset="1" stopColor="#064e3b" />
      </linearGradient>
      <linearGradient id="worldRingGrad" x1="4" y1="18" x2="44" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#67e8f9" />
        <stop offset="0.5" stopColor="#38bdf8" />
        <stop offset="1" stopColor="#0284c7" />
      </linearGradient>
    </defs>
    {/* Behind planet ring arc */}
    <path
      d="M7 28C6 24 10 20 20 18C28 16.5 38 18 43 21"
      stroke="url(#worldRingGrad)"
      strokeWidth="3.5"
      strokeLinecap="round"
      opacity="0.4"
    />
    {/* Planet Sphere */}
    <circle cx="24" cy="24" r="14" fill="url(#worldGlobeGrad)" filter="drop-shadow(0 3px 5px rgba(0,0,0,0.5))" />
    {/* Continents / Atmospheres */}
    <path
      d="M17 17C19 15 23 16 25 18C27 20 28 22 26 25C24 28 20 28 17 26C15 24 15 19 17 17Z"
      fill="#6ee7b7"
      fillOpacity="0.5"
    />
    <circle cx="31" cy="29" r="4" fill="#a7f3d0" fillOpacity="0.4" />
    {/* Foreground Floating Cloud */}
    <g filter="drop-shadow(0 2px 4px rgba(0,0,0,0.4))">
      <ellipse cx="22" cy="33" rx="10" ry="4" fill="#ffffff" fillOpacity="0.9" />
      <circle cx="18" cy="30" r="4.5" fill="#ffffff" fillOpacity="0.95" />
      <circle cx="24" cy="29" r="5.5" fill="#ffffff" />
      <circle cx="28" cy="31" r="3.5" fill="#ffffff" fillOpacity="0.9" />
    </g>
    {/* Front Planetary Ring Arc */}
    <path
      d="M5 24C4 28 9 32 20 33C31 34 40 31 43 26"
      stroke="url(#worldRingGrad)"
      strokeWidth="3.5"
      strokeLinecap="round"
      filter="drop-shadow(0 1px 2px rgba(6,182,212,0.6))"
    />
    {/* Orbit Sparkle Stars */}
    <circle cx="10" cy="12" r="1.5" fill="#fde047" />
    <circle cx="38" cy="11" r="2" fill="#fde047" />
  </svg>
);

// 3. MISSIONS ICON: Royal Navigator Flight Scroll with Crimson Wax Seal & Gold Compass
export const MissionsNavIcon: React.FC<GameIconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    className={className}
    style={size ? { width: size, height: size } : undefined}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="missionScrollGrad" x1="12" y1="8" x2="36" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fef3c7" />
        <stop offset="0.7" stopColor="#fde68a" />
        <stop offset="1" stopColor="#f59e0b" />
      </linearGradient>
    </defs>
    {/* Parchment Body */}
    <rect
      x="12"
      y="8"
      width="24"
      height="32"
      rx="4"
      fill="url(#missionScrollGrad)"
      stroke="#b45309"
      strokeWidth="1.5"
      filter="drop-shadow(0 3px 5px rgba(0,0,0,0.4))"
    />
    {/* Top and Bottom Scroll Rolls */}
    <rect x="9" y="6" width="30" height="5" rx="2.5" fill="#d97706" stroke="#78350f" strokeWidth="1" />
    <rect x="9" y="37" width="30" height="5" rx="2.5" fill="#d97706" stroke="#78350f" strokeWidth="1" />
    {/* Mission Objective Lines */}
    <line x1="16" y1="16" x2="32" y2="16" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
    <line x1="16" y1="21" x2="28" y2="21" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
    <line x1="16" y1="26" x2="30" y2="26" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
    {/* Crimson Wax Seal Badge at bottom right */}
    <circle cx="31" cy="31" r="6" fill="#dc2626" stroke="#991b1b" strokeWidth="1.5" filter="drop-shadow(0 2px 3px rgba(0,0,0,0.4))" />
    {/* Golden Compass Needle inside Seal */}
    <polygon points="31,27 33,31 31,35 29,31" fill="#fde047" />
  </svg>
);

// 4. BADGES / ACHIEVEMENTS ICON: Golden Winged Hero Star Trophy Medal with Laurel
export const BadgesNavIcon: React.FC<GameIconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    className={className}
    style={size ? { width: size, height: size } : undefined}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="badgeGoldGrad" x1="12" y1="8" x2="36" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fef08a" />
        <stop offset="0.4" stopColor="#facc15" />
        <stop offset="0.8" stopColor="#eab308" />
        <stop offset="1" stopColor="#ca8a04" />
      </linearGradient>
      <linearGradient id="badgeRibbonGrad" x1="14" y1="4" x2="34" y2="22" gradientUnits="userSpaceOnUse">
        <stop stopColor="#a855f7" />
        <stop offset="1" stopColor="#6b21a8" />
      </linearGradient>
    </defs>
    {/* Royal Ribbon V-Ties */}
    <polygon points="16,6 20,20 12,20 8,10" fill="url(#badgeRibbonGrad)" />
    <polygon points="32,6 28,20 36,20 40,10" fill="url(#badgeRibbonGrad)" />
    {/* Golden Medal Ring Body */}
    <circle cx="24" cy="26" r="14" fill="url(#badgeGoldGrad)" stroke="#a16207" strokeWidth="1.5" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))" />
    <circle cx="24" cy="26" r="11" fill="#713f12" />
    <circle cx="24" cy="26" r="9.5" fill="url(#badgeGoldGrad)" />
    {/* 5-Pointed Victory Star */}
    <polygon
      points="24,19 26,23.5 31,24 27.5,27.5 28.5,32.5 24,30 19.5,32.5 20.5,27.5 17,24 22,23.5"
      fill="#ffffff"
      filter="drop-shadow(0 1px 2px rgba(0,0,0,0.3))"
    />
    <circle cx="24" cy="26" r="2.5" fill="#0284c7" />
  </svg>
);

// 5. SHOP / HANGAR ICON: Aviator Treasure Chest Strongbox Overflowing with Gold & Gems
export const ShopNavIcon: React.FC<GameIconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    className={className}
    style={size ? { width: size, height: size } : undefined}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="shopChestGrad" x1="8" y1="16" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f43f5e" />
        <stop offset="0.6" stopColor="#e11d48" />
        <stop offset="1" stopColor="#9f1239" />
      </linearGradient>
      <linearGradient id="shopGoldGrad" x1="10" y1="14" x2="38" y2="30" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fef08a" />
        <stop offset="0.5" stopColor="#f59e0b" />
        <stop offset="1" stopColor="#b45309" />
      </linearGradient>
    </defs>
    {/* Chest Lower Box */}
    <rect
      x="8"
      y="22"
      width="32"
      height="18"
      rx="4"
      fill="url(#shopChestGrad)"
      stroke="#4c0519"
      strokeWidth="1.5"
      filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))"
    />
    {/* Golden Corner Trims */}
    <path d="M8 25V37C8 38.5 9.5 40 11 40H14V22H8V25Z" fill="url(#shopGoldGrad)" />
    <path d="M40 25V37C40 38.5 38.5 40 37 40H34V22H40V25Z" fill="url(#shopGoldGrad)" />
    {/* Chest Arched Lid (Open) */}
    <path
      d="M7 21C7 15 13 12 24 12C35 12 41 15 41 21H7Z"
      fill="url(#shopChestGrad)"
      stroke="#4c0519"
      strokeWidth="1.5"
    />
    {/* Golden Center Lock Clasp */}
    <rect x="21" y="20" width="6" height="8" rx="2" fill="url(#shopGoldGrad)" stroke="#78350f" strokeWidth="1" />
    <circle cx="24" cy="24" r="1.5" fill="#451a03" />
    {/* Glowing Gems & Coins Sparkling from inside */}
    <circle cx="16" cy="18" r="4.5" fill="#facc15" stroke="#ca8a04" strokeWidth="1" />
    <polygon points="32,15 36,19 32,23 28,19" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
    <polygon points="24,9 26,13 24,17 22,13" fill="#a855f7" />
    <circle cx="24" cy="10" r="1" fill="#ffffff" />
  </svg>
);

// 6. STATS / RECORDS ICON: Cockpit Altimeter Radar Compass Flight Dial
export const StatsNavIcon: React.FC<GameIconProps> = ({ className = 'w-6 h-6', size }) => (
  <svg
    className={className}
    style={size ? { width: size, height: size } : undefined}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="statsDialGrad" x1="10" y1="8" x2="38" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#1e293b" />
        <stop offset="1" stopColor="#020617" />
      </linearGradient>
      <linearGradient id="statsRimGrad" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#818cf8" />
        <stop offset="0.5" stopColor="#6366f1" />
        <stop offset="1" stopColor="#3730a3" />
      </linearGradient>
    </defs>
    {/* Dial Outer Bezel Ring */}
    <circle cx="24" cy="24" r="17" fill="url(#statsRimGrad)" stroke="#1e1b4b" strokeWidth="1.5" filter="drop-shadow(0 3px 5px rgba(0,0,0,0.5))" />
    {/* Dial Instrument Face */}
    <circle cx="24" cy="24" r="13.5" fill="url(#statsDialGrad)" />
    {/* Instrument Degree Ticks */}
    <line x1="24" y1="12" x2="24" y2="15" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="24" y1="33" x2="24" y2="36" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="12" y1="24" x2="15" y2="24" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="33" y1="24" x2="36" y2="24" stroke="#a5b4fc" strokeWidth="1.5" strokeLinecap="round" />
    {/* Radar Sweep Arc */}
    <path d="M24 24L33 18A12 12 0 0 0 24 12V24Z" fill="#6366f1" fillOpacity="0.3" />
    {/* Golden Altimeter Flight Needle */}
    <polygon points="24,14 26.5,23 21.5,23" fill="#facc15" />
    <polygon points="24,31 26,25 22,25" fill="#f43f5e" />
    <circle cx="24" cy="24" r="3" fill="#ffffff" stroke="#1e293b" strokeWidth="1.5" />
  </svg>
);
