import { Link } from "@tanstack/react-router";
import type { NavItem } from "@/lib/nav-items";
import { bar, item, itemActive, icon } from "@/styles/bottomNav.css";

export function BottomNav({ items, pathname }: { items: NavItem[]; pathname: string }) {
  return (
    <nav className={bar}>
      {items.map((navItem) => (
        <Link
          key={navItem.key}
          to={navItem.key}
          className={`${item} ${pathname === navItem.key ? itemActive : ""}`}
        >
          <span className={icon}>{navItem.icon}</span>
          <span>{navItem.label}</span>
        </Link>
      ))}
    </nav>
  );
}
