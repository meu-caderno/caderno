export interface NavItem {
  key: string;
  to: string;
  icon: string;
  label: string;
}

export const NAV_ITEMS: NavItem[] = [
  { key: "home", to: "/", icon: "☀️", label: "Hoje" },
  { key: "disciplinas", to: "/disciplinas", icon: "📘", label: "Disciplinas" },
  { key: "presencas", to: "/presencas", icon: "📋", label: "Presenças" },
  { key: "atividades", to: "/atividades", icon: "📝", label: "Atividades" },
  { key: "caderno", to: "/caderno", icon: "🧠", label: "Caderno" },
  { key: "agenda", to: "/agenda", icon: "🗓️", label: "Agenda" },
  { key: "acervo", to: "/acervo", icon: "📚", label: "Acervo" },
  { key: "contextos", to: "/contextos", icon: "🧭", label: "Contextos" },
  { key: "ajustes", to: "/ajustes", icon: "⚙️", label: "Ajustes" },
];

export const PINNED_NAV_KEYS = ["home", "ajustes"];

export const DEFAULT_TAB_KEYS = [
  "home",
  "caderno",
  "agenda",
  "acervo",
  "ajustes",
];

export function useNav(): NavItem[] {
  return NAV_ITEMS;
}
