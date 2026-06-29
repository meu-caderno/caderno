export interface NavItem {
  to: string;
  icon: string;
  label: string;
}

export function useNav(): NavItem[] {
  return [
    { to: "/", icon: "☀️", label: "Hoje" },
    { to: "/caderno", icon: "🧠", label: "Caderno" },
    { to: "/agenda", icon: "🗓️", label: "Agenda" },
    { to: "/acervo", icon: "📚", label: "Acervo" },
    { to: "/ajustes", icon: "⚙️", label: "Ajustes" },
  ];
}
