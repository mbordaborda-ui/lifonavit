type ArtKey = "dandelion" | "hibiscus" | "fennel" | "ginger" | "tea";

const keys: Record<string, ArtKey> = {
  "Diente de león": "dandelion",
  Hibisco: "hibiscus",
  Hinojo: "fennel",
  Jengibre: "ginger",
  "Té verde descafeinado": "tea",
};

export function botanicalKey(name: string): ArtKey {
  return keys[name] ?? "dandelion";
}

export function BotanicalArt({
  name,
  className = "",
}: {
  name: string;
  className?: string;
}) {
  const key = botanicalKey(name);

  return (
    <svg
      viewBox="0 0 120 132"
      fill="none"
      aria-hidden="true"
      className={`h-full w-full ${className}`}
      stroke="currentColor"
      strokeWidth="1.05"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {key === "dandelion" ? <Dandelion /> : null}
      {key === "hibiscus" ? <Hibiscus /> : null}
      {key === "fennel" ? <Fennel /> : null}
      {key === "ginger" ? <Ginger /> : null}
      {key === "tea" ? <Tea /> : null}
    </svg>
  );
}

function Dandelion() {
  return (
    <g>
      <path d="M59 122c0-24 1-44-1-62" />
      <path d="M58 94c-9-2-13-8-14-16 8 1 13 6 14 16Z" fill="currentColor" opacity="0.14" />
      <path d="M58 104c8-1 13-6 15-14-8 0-13 5-15 14Z" fill="currentColor" opacity="0.14" />
      <path d="M59 86c-8-4-10-11-9-18 7 3 11 9 9 18Z" />
      <circle cx="58" cy="38" r="17" opacity="0.3" />
      <circle cx="58" cy="38" r="22" opacity="0.18" />
      {Array.from({ length: 16 }).map((_, index) => {
        const angle = (index * Math.PI * 2) / 16;
        const x1 = 58 + Math.cos(angle) * 17;
        const y1 = 38 + Math.sin(angle) * 17;
        const x2 = 58 + Math.cos(angle) * 27;
        const y2 = 38 + Math.sin(angle) * 27;
        return (
          <g key={index} opacity="0.85">
            <path d={`M${x1} ${y1}L${x2} ${y2}`} opacity="0.55" />
            <circle cx={x2} cy={y2} r="1.5" fill="#C7A66A" stroke="none" />
          </g>
        );
      })}
      <circle cx="58" cy="38" r="4.2" fill="#C7A66A" stroke="none" opacity="0.9" />
      <path d="M50 44c-3 2-5 5-6 8" opacity="0.5" />
      <path d="M66 44c3 2 5 5 6 8" opacity="0.5" />
      <circle cx="44" cy="54" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="72" cy="54" r="1.1" fill="currentColor" stroke="none" />
    </g>
  );
}

function Hibiscus() {
  return (
    <g>
      <path d="M60 118V76" />
      <path d="M60 106c-9-1-14-6-16-15 9 0 15 5 16 15Z" fill="currentColor" opacity="0.13" />
      <path d="M60 112c9-1 14-6 16-15-9 0-15 5-16 15Z" fill="currentColor" opacity="0.13" />
      <g transform="translate(60 47)">
        {[0, 72, 144, 216, 288].map((angle) => (
          <path
            key={angle}
            d="M0 0c-14-8-20-24-11-34 4-4 9-4 12-1 2-8 10-12 17-9 8 3 11 12 8 19 8-1 14 4 14 11 0 9-9 15-18 12-4 6-13 8-22 2Z"
            transform={`rotate(${angle}) translate(0 -3)`}
            fill="#C7A66A"
            fillOpacity="0.1"
          />
        ))}
        <circle cx="0" cy="0" r="5.5" fill="#C7A66A" stroke="none" />
        <path d="M0 -2c0-10 2-18 8-25" />
        <circle cx="8.6" cy="-28" r="2" fill="#C7A66A" stroke="none" />
        <circle cx="11.5" cy="-30" r="1.6" fill="#C7A66A" stroke="none" />
        <circle cx="5" cy="-31" r="1.4" fill="#C7A66A" stroke="none" />
        <circle cx="9" cy="-33" r="1.4" fill="#C7A66A" stroke="none" />
      </g>
      <path d="M52 80c-5 2-9 6-10 12 5 1 10-2 13-7" opacity="0.6" />
      <path d="M68 80c5 2 9 6 10 12-5 1-10-2-13-7" opacity="0.6" />
    </g>
  );
}

function Fennel() {
  return (
    <g>
      <path d="M61 120c0-30-1-58-2-82" />
      <path d="M61 114c-9-2-14-7-17-16 9 0 15 5 17 16Z" fill="currentColor" opacity="0.13" />
      <path d="M61 110c9-2 14-7 17-16-9 0-15 5-17 16Z" fill="currentColor" opacity="0.13" />
      {[0, 1, 2].map((index) => (
        <g key={index} opacity={0.95 - index * 0.12}>
          <path
            d={`M58 ${78 - index * 3}C${40 - index * 6} ${66 - index * 6} ${32 - index * 6} ${
              54 - index * 8
            } ${30 - index * 5} ${46 - index * 9}`}
          />
          <path
            d={`M62 ${78 - index * 3}C${80 + index * 6} ${66 - index * 6} ${88 + index * 6} ${
              54 - index * 8
            } ${90 + index * 5} ${46 - index * 9}`}
          />
          {[0, 1, 2, 3, 4].map((n) => (
            <path
              key={`l-${n}`}
              d={`M${44 - index * 4} ${62 - index * 5} l${-5 - n} ${-3 + n}`}
              opacity="0.6"
            />
          ))}
          {[0, 1, 2, 3, 4].map((n) => (
            <path
              key={`r-${n}`}
              d={`M${76 + index * 4} ${62 - index * 5} l${5 + n} ${-3 + n}`}
              opacity="0.6"
            />
          ))}
        </g>
      ))}
      <g>
        {[0, 1, 2, 3, 4, 5].map((n) => {
          const x = 38 + n * 9;
          const y = 34 + (n % 2 === 0 ? 0 : -4);
          return (
            <g key={n}>
              <path d={`M59 46 L${x} ${y}`} opacity="0.5" />
              <circle cx={x} cy={y} r="2.1" fill="#C7A66A" stroke="none" />
              <circle cx={x} cy={y} r="4" opacity="0.35" />
            </g>
          );
        })}
        <circle cx="59" cy="46" r="2.4" fill="#C7A66A" stroke="none" />
      </g>
    </g>
  );
}

function Ginger() {
  return (
    <g>
      <path
        d="M22 92c-5-6-4-12 2-15 3-9 11-12 18-8 5-7 14-8 19-2 8-2 14 2 15 9 6 4 7 11 1 15-3 7-9 10-16 8-6 6-15 6-20 1-8 3-15 0-19-8Z"
        fill="currentColor"
        fillOpacity="0.09"
      />
      <path d="M30 92c5-5 10-6 16-3M52 84c5-4 11-4 16 0M44 97c4 3 9 3 13 0" opacity="0.55" />
      <circle cx="39" cy="88" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="61" cy="84" r="1.2" fill="currentColor" stroke="none" />
      <path d="M62 76c2-10 4-20 3-30" />
      <path
        d="M64 52c-9-3-13-10-12-19 9 1 14 8 12 19Z"
        fill="#C7A66A"
        fillOpacity="0.18"
      />
      <path d="M65 44c8-4 11-11 9-19-8 2-12 9-9 19Z" fill="currentColor" fillOpacity="0.12" />
      <path d="M64 58c7-2 12-7 13-14-7 0-12 5-13 14Z" fill="currentColor" fillOpacity="0.12" />
      <path d="M23 104c4 4 9 6 15 5" opacity="0.4" />
      <path d="M72 102c-3 4-8 6-13 6" opacity="0.4" />
    </g>
  );
}

function Tea() {
  return (
    <g>
      <path d="M58 122c0-32 2-56 6-78" />
      <path d="M60 110c-8-3-12-9-12-18 8 2 12 8 12 18Z" fill="currentColor" fillOpacity="0.1" />
      <g transform="translate(47 68) rotate(-32)">
        <path d="M0 0c0-16 8-26 20-30 1 14-7 25-20 30Z" fill="currentColor" fillOpacity="0.11" />
        <path d="M2 -2c6-10 11-16 17-21" opacity="0.6" />
        <path d="M8-9c-2-4-2-8 0-12M12-15c-2-3-2-7 0-10" opacity="0.35" />
      </g>
      <g transform="translate(66 56) rotate(26)">
        <path d="M0 0c0-16 8-26 20-30 1 14-7 25-20 30Z" fill="currentColor" fillOpacity="0.11" />
        <path d="M2 -2c6-10 11-16 17-21" opacity="0.6" />
        <path d="M8-9c-2-4-2-8 0-12M12-15c-2-3-2-7 0-10" opacity="0.35" />
      </g>
      <g transform="translate(54 44) rotate(-6)">
        <path d="M0 0c0-13 6-21 16-24 0 12-6 20-16 24Z" fill="#C7A66A" fillOpacity="0.22" />
        <path d="M2 -2c4-8 8-13 13-17" opacity="0.5" />
      </g>
      <path d="M64 34c2-6 5-9 9-11" opacity="0.7" />
      <circle cx="74" cy="21" r="1.6" fill="#C7A66A" stroke="none" />
      <circle cx="69" cy="26" r="1.3" fill="#C7A66A" stroke="none" />
    </g>
  );
}
