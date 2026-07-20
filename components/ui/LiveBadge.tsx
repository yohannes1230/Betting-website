export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-live/20 px-3 py-1 text-[11px] font-black uppercase tracking-wider text-live animate-live-pulse">
      <span
        className="h-2 w-2 rounded-full bg-live"
        style={{ animation: "pulse-dot 1s infinite" }}
      />
      LIVE
    </span>
  );
}
