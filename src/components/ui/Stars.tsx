export function Stars({
  value = 5,
  size = 14,
  className = "",
}: {
  value?: number;
  size?: number;
  className?: string;
}) {
  const rounded = Math.round(value);
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={`${value.toFixed(1)} de 5 estrellas`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          width={size}
          height={size}
          viewBox="0 0 20 20"
          aria-hidden="true"
          fill={star <= rounded ? "#C7A66A" : "none"}
          stroke="#C7A66A"
          strokeWidth="1.2"
        >
          <path d="M10 1.8l2.47 5.01 5.53.8-4 3.9.94 5.5L10 14.4l-4.94 2.6.94-5.5-4-3.9 5.53-.8L10 1.8z" />
        </svg>
      ))}
    </span>
  );
}
