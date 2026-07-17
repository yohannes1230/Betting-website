export function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-live px-2.5 py-1 text-[11px] font-black text-white">
      <span
        className="h-2 w-2 rounded-full bg-white"
        style={{ animation: "pulse-dot 1s infinite" }}
      />
      LIVE
    </span>
  );
}
