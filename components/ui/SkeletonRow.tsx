export function SkeletonRow({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-20 rounded-2xl"
          style={{
            background: "linear-gradient(90deg, #111827 25%, #1a2235 50%, #111827 75%)",
            backgroundSize: "400% 100%",
            animation: "shimmer 1.5s infinite",
          }}
        />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div
      className="h-32 rounded-2xl"
      style={{
        background: "linear-gradient(90deg, #111827 25%, #1a2235 50%, #111827 75%)",
        backgroundSize: "400% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}
