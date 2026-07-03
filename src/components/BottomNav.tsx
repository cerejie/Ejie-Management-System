import type { CSSProperties } from "react";
import { Link } from "@tanstack/react-router";
import type { NavItem } from "@/lib/nav-items";
import { vars } from "@/styles/theme.css";
import {
  bar,
  track,
  indicator,
  item,
  itemActive,
  icon,
  NAV_ITEM_GAP,
  NAV_END_RADIUS,
} from "@/styles/bottomNav.css";

// Round the outer corners of an end tab to match the pill's edge; keep inner
// corners (and every middle tab) on the standard radius. A single tab is an
// end on both sides.
function cornerRadius(index: number, count: number): CSSProperties {
  const isFirst = index === 0;
  const isLast = index === count - 1;
  const end = NAV_END_RADIUS;
  const inner = vars.radius.lg;
  return {
    borderTopLeftRadius: isFirst ? end : inner,
    borderBottomLeftRadius: isFirst ? end : inner,
    borderTopRightRadius: isLast ? end : inner,
    borderBottomRightRadius: isLast ? end : inner,
  };
}

export function BottomNav({ items, pathname }: { items: NavItem[]; pathname: string }) {
  const count = items.length;
  const activeIndex = Math.max(
    0,
    items.findIndex((navItem) => navItem.key === pathname),
  );

  // Tabs are equal-width flex children, so the indicator is one share of the
  // track and slides by whole tab-widths (plus the gap). Percent-based so it
  // tracks whatever width the pill settles at.
  const indicatorStyle: CSSProperties = {
    width: `calc((100% - ${(count - 1) * NAV_ITEM_GAP}px) / ${count})`,
    transform: `translateX(calc(${activeIndex} * (100% + ${NAV_ITEM_GAP}px)))`,
    ...cornerRadius(activeIndex, count),
  };

  return (
    <nav className={bar}>
      <div className={track}>
        <div className={indicator} style={indicatorStyle} />
        {items.map((navItem, index) => (
          <Link
            key={navItem.key}
            to={navItem.key}
            aria-label={navItem.label}
            className={`${item} ${pathname === navItem.key ? itemActive : ""}`}
            style={cornerRadius(index, count)}
          >
            <span className={icon}>{navItem.icon}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
