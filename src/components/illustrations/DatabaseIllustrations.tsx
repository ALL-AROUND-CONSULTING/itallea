import React from "react";

interface IllustrationProps {
  className?: string;
  style?: React.CSSProperties;
}

/** Scaffale/magazzino con prodotti — per titolo "Il mio database" */
export const WarehouseIllustration: React.FC<IllustrationProps> = ({ className, style }) => (
  <svg viewBox="0 0 80 80" fill="none" className={className} style={style}>
    {/* Scaffale */}
    <rect x="12" y="14" width="56" height="54" rx="6" fill="#D6EEFF" />
    <rect x="12" y="14" width="56" height="54" rx="6" stroke="#4A90D9" strokeWidth="2" />
    {/* Ripiani */}
    <rect x="12" y="30" width="56" height="2" rx="1" fill="#4A90D9" />
    <rect x="12" y="48" width="56" height="2" rx="1" fill="#4A90D9" />
    {/* Prodotti ripiano 1 */}
    <rect x="18" y="17" width="10" height="12" rx="2" fill="#FF8C42" />
    <rect x="31" y="19" width="8" height="10" rx="2" fill="#5CB85C" />
    <rect x="42" y="16" width="10" height="13" rx="2" fill="#4A90D9" />
    <rect x="55" y="18" width="9" height="11" rx="2" fill="#F5A623" />
    {/* Prodotti ripiano 2 */}
    <rect x="18" y="34" width="12" height="12" rx="2" fill="#5CB85C" />
    <rect x="34" y="35" width="8" height="11" rx="2" fill="#FF6B6B" />
    <rect x="46" y="33" width="10" height="13" rx="2" fill="#F5A623" />
    <rect x="59" y="35" width="7" height="11" rx="3" fill="#4A90D9" />
    {/* Prodotti ripiano 3 */}
    <rect x="18" y="52" width="9" height="13" rx="2" fill="#FF8C42" />
    <rect x="30" y="53" width="11" height="12" rx="2" fill="#4A90D9" />
    <rect x="44" y="51" width="10" height="14" rx="2" fill="#5CB85C" />
    <rect x="57" y="53" width="8" height="12" rx="2" fill="#FF6B6B" />
  </svg>
);

/** Cappello da chef con piatto — per card ricettario */
export const RecipeBookIllustration: React.FC<IllustrationProps> = ({ className, style }) => (
  <svg viewBox="0 0 80 80" fill="none" className={className} style={style}>
    {/* Piatto */}
    <ellipse cx="40" cy="58" rx="26" ry="8" fill="#D6EEFF" />
    <ellipse cx="40" cy="56" rx="22" ry="6" fill="#EAF4FF" />
    {/* Cappello chef */}
    <path d="M24 32C24 22 30 16 40 16C50 16 56 22 56 32V42H24V32Z" fill="white" stroke="#4A90D9" strokeWidth="2" />
    <rect x="22" y="40" width="36" height="6" rx="2" fill="#4A90D9" />
    {/* Bolle cappello */}
    <circle cx="28" cy="22" r="6" fill="#EAF4FF" stroke="#4A90D9" strokeWidth="1.5" />
    <circle cx="40" cy="18" r="7" fill="#EAF4FF" stroke="#4A90D9" strokeWidth="1.5" />
    <circle cx="52" cy="22" r="6" fill="#EAF4FF" stroke="#4A90D9" strokeWidth="1.5" />
    {/* Cucchiaio */}
    <rect x="50" y="46" width="3" height="16" rx="1.5" fill="#F5A623" transform="rotate(15, 51, 54)" />
    <ellipse cx="52" cy="47" rx="4" ry="5" fill="#F5A623" transform="rotate(15, 52, 47)" />
  </svg>
);

/** Bottiglia con alimenti — per card prodotti */
export const GroceryIllustration: React.FC<IllustrationProps> = ({ className, style }) => (
  <svg viewBox="0 0 80 80" fill="none" className={className} style={style}>
    {/* Bottiglia */}
    <rect x="18" y="30" width="16" height="34" rx="4" fill="#5CB85C" />
    <rect x="22" y="22" width="8" height="10" rx="2" fill="#5CB85C" />
    <rect x="20" y="40" width="12" height="8" rx="1" fill="white" opacity="0.6" />
    {/* Barattolo */}
    <rect x="38" y="28" width="18" height="36" rx="4" fill="#FF8C42" />
    <rect x="40" y="24" width="14" height="6" rx="2" fill="#E07830" />
    <rect x="41" y="38" width="12" height="10" rx="1" fill="white" opacity="0.6" />
    {/* Mela */}
    <circle cx="66" cy="50" r="10" fill="#FF6B6B" />
    <path d="M66 40C66 40 67 36 70 36" stroke="#5CB85C" strokeWidth="2" strokeLinecap="round" />
    <ellipse cx="68" cy="42" rx="3" ry="2" fill="#5CB85C" />
    {/* Carota */}
    <path d="M12 55L20 68L14 68Z" fill="#FF8C42" />
    <path d="M15 55C15 55 13 52 16 51" stroke="#5CB85C" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

/** Tagliere con spiedini — Antipasti */
export const AntipastiIllustration: React.FC<IllustrationProps> = ({ className, style }) => (
  <svg viewBox="0 0 80 80" fill="none" className={className} style={style}>
    {/* Tagliere */}
    <rect x="10" y="28" width="60" height="36" rx="6" fill="#DEB887" />
    <rect x="10" y="28" width="60" height="36" rx="6" stroke="#C4955A" strokeWidth="1.5" />
    <rect x="62" y="40" width="12" height="8" rx="4" fill="#C4955A" />
    {/* Spiedino 1 */}
    <rect x="20" y="24" width="3" height="38" rx="1.5" fill="#8B7355" />
    <circle cx="21.5" cy="30" r="4" fill="#FF6B6B" />
    <rect x="18" y="37" width="7" height="5" rx="1" fill="#F5A623" />
    <circle cx="21.5" cy="47" r="4" fill="#5CB85C" />
    <circle cx="21.5" cy="55" r="3.5" fill="#FF8C42" />
    {/* Spiedino 2 */}
    <rect x="38" y="24" width="3" height="38" rx="1.5" fill="#8B7355" />
    <rect x="35" y="30" width="9" height="5" rx="1" fill="#F5A623" />
    <circle cx="39.5" cy="40" r="4" fill="#FF6B6B" />
    <circle cx="39.5" cy="49" r="3.5" fill="#5CB85C" />
    <rect x="36" y="54" width="7" height="5" rx="1" fill="#FF8C42" />
    {/* Olive */}
    <circle cx="54" cy="38" r="3" fill="#5CB85C" />
    <circle cx="52" cy="46" r="3" fill="#228B22" />
    <circle cx="56" cy="52" r="3" fill="#5CB85C" />
  </svg>
);

/** Piatto di pasta fumante — Primi */
export const PrimiIllustration: React.FC<IllustrationProps> = ({ className, style }) => (
  <svg viewBox="0 0 80 80" fill="none" className={className} style={style}>
    {/* Vapore */}
    <path d="M30 22C30 22 32 16 30 12" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    <path d="M40 20C40 20 42 14 40 10" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    <path d="M50 22C50 22 52 16 50 12" stroke="#B0B0B0" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    {/* Piatto */}
    <ellipse cx="40" cy="56" rx="30" ry="10" fill="#E8E8E8" />
    <ellipse cx="40" cy="54" rx="28" ry="8" fill="white" stroke="#D0D0D0" strokeWidth="1" />
    {/* Pasta */}
    <path d="M24 46C28 36 36 30 40 30C44 30 52 36 56 46" fill="#F5D680" />
    <path d="M26 44C26 44 32 38 36 42C40 46 44 38 48 42C52 46 54 44 54 44" stroke="#E8C44A" strokeWidth="2" strokeLinecap="round" />
    <path d="M28 48C28 48 34 42 38 46C42 50 46 42 50 46C52 48 52 48 52 48" stroke="#E8C44A" strokeWidth="2" strokeLinecap="round" />
    {/* Salsa */}
    <circle cx="40" cy="38" r="6" fill="#E05040" opacity="0.8" />
    <circle cx="36" cy="42" r="3" fill="#E05040" opacity="0.6" />
    <circle cx="45" cy="41" r="3.5" fill="#E05040" opacity="0.6" />
    {/* Basilico */}
    <ellipse cx="40" cy="34" rx="3" ry="2" fill="#5CB85C" />
    <ellipse cx="43" cy="33" rx="2.5" ry="1.5" fill="#228B22" />
  </svg>
);

/** Bistecca su piatto — Secondi */
export const SecondiIllustration: React.FC<IllustrationProps> = ({ className, style }) => (
  <svg viewBox="0 0 80 80" fill="none" className={className} style={style}>
    {/* Piatto */}
    <ellipse cx="40" cy="56" rx="30" ry="10" fill="#E8E8E8" />
    <ellipse cx="40" cy="54" rx="28" ry="8" fill="white" stroke="#D0D0D0" strokeWidth="1" />
    {/* Bistecca */}
    <ellipse cx="40" cy="44" rx="18" ry="10" fill="#A0522D" />
    <ellipse cx="40" cy="42" rx="16" ry="8" fill="#CD853F" />
    {/* Grill lines */}
    <line x1="28" y1="40" x2="52" y2="40" stroke="#8B4513" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="30" y1="44" x2="50" y2="44" stroke="#8B4513" strokeWidth="1.5" strokeLinecap="round" />
    {/* Osso */}
    <ellipse cx="53" cy="38" rx="3" ry="5" fill="#F5F0E0" stroke="#D0C8B0" strokeWidth="1" />
    {/* Rametto rosmarino */}
    <rect x="20" y="48" width="12" height="1.5" rx="0.75" fill="#228B22" />
    <ellipse cx="22" cy="47" rx="2" ry="1" fill="#5CB85C" />
    <ellipse cx="26" cy="47" rx="2" ry="1" fill="#5CB85C" />
    <ellipse cx="30" cy="47" rx="2" ry="1" fill="#5CB85C" />
    {/* Vapore */}
    <path d="M34 30C34 30 36 24 34 20" stroke="#B0B0B0" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
    <path d="M44 28C44 28 46 22 44 18" stroke="#B0B0B0" strokeWidth="1" strokeLinecap="round" opacity="0.4" />
  </svg>
);

/** Insalata colorata — Contorni */
export const ContorniIllustration: React.FC<IllustrationProps> = ({ className, style }) => (
  <svg viewBox="0 0 80 80" fill="none" className={className} style={style}>
    {/* Ciotola */}
    <path d="M12 44C12 44 16 64 40 64C64 64 68 44 68 44" fill="#D6EEFF" stroke="#4A90D9" strokeWidth="2" />
    <rect x="10" y="42" width="60" height="4" rx="2" fill="#4A90D9" />
    {/* Foglie di lattuga */}
    <ellipse cx="30" cy="38" rx="10" ry="6" fill="#5CB85C" />
    <ellipse cx="48" cy="36" rx="10" ry="7" fill="#228B22" />
    <ellipse cx="38" cy="34" rx="8" ry="5" fill="#7DCE7D" />
    {/* Pomodorini */}
    <circle cx="24" cy="34" r="4" fill="#FF6B6B" />
    <circle cx="52" cy="32" r="3.5" fill="#FF6B6B" />
    <circle cx="36" cy="30" r="3" fill="#E05040" />
    {/* Carota grattugiata */}
    <rect x="42" y="28" width="6" height="2" rx="1" fill="#FF8C42" transform="rotate(-20, 45, 29)" />
    <rect x="46" y="32" width="5" height="2" rx="1" fill="#FF8C42" transform="rotate(10, 48, 33)" />
    {/* Mais */}
    <circle cx="28" cy="30" r="2" fill="#F5D680" />
    <circle cx="32" cy="28" r="2" fill="#F5D680" />
    <circle cx="44" cy="28" r="2" fill="#F5D680" />
  </svg>
);

/** Torta decorata — Dolci */
export const DolciIllustration: React.FC<IllustrationProps> = ({ className, style }) => (
  <svg viewBox="0 0 80 80" fill="none" className={className} style={style}>
    {/* Base torta */}
    <rect x="14" y="44" width="52" height="22" rx="6" fill="#F5A623" />
    <rect x="14" y="44" width="52" height="22" rx="6" stroke="#E0912A" strokeWidth="1.5" />
    {/* Strato crema */}
    <rect x="14" y="44" width="52" height="8" rx="3" fill="#FFE0B2" />
    {/* Strato superiore */}
    <rect x="18" y="30" width="44" height="16" rx="5" fill="#FF8C42" />
    <rect x="18" y="30" width="44" height="6" rx="3" fill="#FFCC80" />
    {/* Glassa */}
    <path d="M18 32C18 32 22 26 28 28C34 30 36 24 40 24C44 24 46 30 52 28C58 26 62 32 62 32" fill="#FF6B6B" />
    {/* Candeline */}
    <rect x="30" y="14" width="3" height="12" rx="1.5" fill="#4A90D9" />
    <rect x="42" y="16" width="3" height="10" rx="1.5" fill="#5CB85C" />
    {/* Fiamme */}
    <ellipse cx="31.5" cy="12" rx="2.5" ry="3.5" fill="#F5D680" />
    <ellipse cx="31.5" cy="11" rx="1.5" ry="2" fill="#FF8C42" />
    <ellipse cx="43.5" cy="14" rx="2.5" ry="3.5" fill="#F5D680" />
    <ellipse cx="43.5" cy="13" rx="1.5" ry="2" fill="#FF8C42" />
    {/* Piatto */}
    <ellipse cx="40" cy="68" rx="28" ry="4" fill="#E8E8E8" />
  </svg>
);
