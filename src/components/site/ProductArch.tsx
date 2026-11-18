import Image from "next/image";

export function ProductArch({
  src,
  alt,
  priority = false,
  sizes = "(max-width: 768px) 82vw, 460px",
  className = "",
  imageClassName = "",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  className?: string;
  imageClassName?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-x-[8%] bottom-[3%] h-6 rounded-[50%] bg-forest/18 blur-xl" />
      <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[1.6rem] border border-white/60 bg-white shadow-[0_40px_80px_-48px_rgba(22,48,36,0.55)]">
        <div className="absolute inset-x-8 top-0 z-10 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={`object-contain px-5 pb-6 pt-8 mix-blend-multiply ${imageClassName}`}
        />
      </div>
    </div>
  );
}
