export interface NavItem {
  key: string;
  to: string;
  icon: string;
  label: string;
}

export const NAV_ITEMS: NavItem[] = [
  { key: "home", to: "/", icon: "☀️", label: "Hoje" },
  { key: "caderno", to: "/caderno", icon: "🧠", label: "Caderno" },
  { key: "agenda", to: "/agenda", icon: "🗓️", label: "Agenda" },
  { key: "acervo", to: "/acervo", icon: "📚", label: "Acervo" },
  { key: "ajustes", to: "/ajustes", icon: "⚙️", label: "Ajustes" },
];

export const PINNED_NAV_KEYS = ["home", "ajustes"];

export function useNav(): NavItem[] {
  return NAV_ITEMS;
}
