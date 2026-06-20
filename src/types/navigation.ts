export interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  badge?: number;
  children?: NavItem[];
}

export interface NavSection {
  title?: string;
  items: NavItem[];
}
