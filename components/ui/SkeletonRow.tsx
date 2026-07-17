export function SkeletonRow({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-20 rounded-xl"
          style={{
            background: "linear-gradient(90deg, #f4f6f9 25%, #e8ebf0 50%, #f4f6f9 75%)",
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
      className="h-32 rounded-xl"
      style={{
        background: "linear-gradient(90deg, #f4f6f9 25%, #e8ebf0 50%, #f4f6f9 75%)",
        backgroundSize: "400% 100%",
        animation: "shimmer 1.5s infinite",
      }}
    />
  );
}
