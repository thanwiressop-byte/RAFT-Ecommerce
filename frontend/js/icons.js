/** Minimal inline SVG icon set — keeps the demo dependency-free and fast. */
const RAFT_ICONS = {
  raft: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M8 36c0 9 8 15 24 15s24-6 24-15"/><path d="M8 36c0-11 10-20 24-20s24 9 24 20"/><path d="M20 30v10M32 26v14M44 30v10"/></svg>',
  kayak: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2"><ellipse cx="32" cy="32" rx="26" ry="8"/><path d="M14 32h36M32 24v16"/><circle cx="22" cy="32" r="1.6" fill="currentColor"/><circle cx="42" cy="32" r="1.6" fill="currentColor"/></svg>',
  paddle: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M16 12l8 8M48 52l-8-8"/><ellipse cx="12" cy="8" rx="7" ry="4" transform="rotate(45 12 8)"/><ellipse cx="52" cy="56" rx="7" ry="4" transform="rotate(45 52 56)"/><path d="M24 20L44 44"/></svg>',
  vest: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M22 10h20l6 10-4 4v26H20V24l-4-4z"/><path d="M32 10v34M22 24h-6M42 24h6"/></svg>',
  bag: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 20h28l4 32H14z"/><path d="M22 20v-6a10 10 0 0120 0v6"/><path d="M14 30h36"/></svg>',
  tent: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M8 50L32 12l24 38z"/><path d="M32 12v38M22 50l10-16 10 16"/></svg>',
  sandal: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.2"><ellipse cx="32" cy="34" rx="18" ry="24"/><path d="M20 20c4 4 20 4 24 0M18 34h28"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="20" r="1.4"/><circle cx="18" cy="20" r="1.4"/><path d="M2.5 3h2.5l2.6 12.4a2 2 0 002 1.6h8.1a2 2 0 002-1.6L20.5 7H6.5"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.6-4 5-6 8-6s6.4 2 8 6"/></svg>',
  shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l8 3v6c0 5-3.4 8.4-8 9-4.6-.6-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
  truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 7h11v9H2z"/><path d="M13 10h5l3 3v3h-8z"/><circle cx="6.5" cy="18" r="1.6"/><circle cx="17.5" cy="18" r="1.6"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="10" width="16" height="10" rx="2"/><path d="M7 10V7a5 5 0 0110 0v3"/></svg>',
  refresh: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 10-3 6.7"/><path d="M21 4v6h-6"/></svg>',
  empty: '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="26" cy="46" r="3"/><circle cx="46" cy="46" r="3"/><path d="M6 8h8l6 30h30l6-20H20"/></svg>',
  chevron: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  logo: '<svg width="26" height="26" viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M4 24c0 7 7 11 16 11s16-4 16-11"/><path d="M4 24c0-9 7-16 16-16s16 7 16 16"/><path d="M20 8v10"/></svg>'
};
function raftIcon(name, cls){
  return `<span class="${cls||''}" aria-hidden="true">${RAFT_ICONS[name]||""}</span>`;
}
