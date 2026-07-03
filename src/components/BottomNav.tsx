import { Link } from "@tanstack/react-router";
import type { NavItem } from "@/lib/nav-items";
import { bar, track, indicator, item, itemActive, icon, NAV_ITEM_SIZE, NAV_ITEM_GAP } from "@/styles/bottomNav.css";

export function BottomNav({ items, pathname }: { items: NavItem[]; pathname: string }) {
  const activeIndex = Math.max(
    0,
    items.findIndex((navItem) => navItem.key === pathname),
  );

  return (
    <nav className={bar}>
      <div className={track}>
        <div
          className={indicator}
          style={{ transform: `translateX(${activeIndex * (NAV_ITEM_SIZE + NAV_ITEM_GAP)}px)` }}
        />
        {items.map((navItem) => (
          <Link
            key={navItem.key}
            to={navItem.key}
            aria-label={navItem.label}
            className={`${item} ${pathname === navItem.key ? itemActive : ""}`}
          >
            <span className={icon}>{navItem.icon}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
