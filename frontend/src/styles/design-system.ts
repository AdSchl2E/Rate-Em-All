export const colors = {
  // Nouveaux dégradés de couleurs
  background: {
    primary: "#0F172A",   // Fond principal (slate-900)
    secondary: "#1E293B", // Fond secondaire (slate-800)
    card: "#334155",      // Fond des cartes (slate-700)
    hover: "#475569"      // État hover (slate-600)
  },
  accent: {
    primary: "#3B82F6",   // Bleu principal (blue-500)
    secondary: "#8B5CF6", // Accent secondaire (violet-500)
    success: "#10B981",   // Vert (emerald-500)
    danger: "#EF4444",    // Rouge (red-500)
    warning: "#F59E0B"    // Jaune (amber-500)
  },
  text: {
    primary: "#F8FAFC",   // Texte principal (slate-50)
    secondary: "#94A3B8", // Texte secondaire (slate-400)
    muted: "#64748B"      // Texte estompé (slate-500)
  },
  // Couleurs des types Pokémon (plus vives)
  types: {
    normal: "#A8A77A",
    fire: "#FF9D55",
    water: "#5090F0",
    electric: "#F8D030",
    grass: "#78C850",
    ice: "#98D8D8",
    fighting: "#C03028",
    poison: "#A33EA1",
    ground: "#E0C068",
    flying: "#A98FF3",
    psychic: "#F85888",
    bug: "#A8B820",
    rock: "#B8A038",
    ghost: "#735797",
    dragon: "#7038F8",
    dark: "#705746",
    steel: "#B8B8D0",
    fairy: "#EE99AC"
  }
};

export const typography = {
  fontFamily: "'Inter', 'system-ui', sans-serif",
  sizes: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem"
  }
};

export const spacing = {
  xs: "0.25rem", // 4px
  sm: "0.5rem",  // 8px
  md: "1rem",    // 16px
  lg: "1.5rem",  // 24px
  xl: "2rem",    // 32px
  "2xl": "2.5rem" // 40px
};

export const borderRadius = {
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  full: "9999px"
};

export const shadows = {
  sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
  md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  highlight: "0 0 15px rgba(59, 130, 246, 0.5)"
};

// Animations standardisées
export const animations = {
  hover: "transition-all duration-300 ease-in-out",
  appear: "animate-fade-in duration-300",
  pulse: "animate-pulse"
};