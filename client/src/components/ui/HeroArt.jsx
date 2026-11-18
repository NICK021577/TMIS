/** HeroArt — decorative 3D-style shapes for banner cards, drawn with CSS only (no images, no WebGL). */
export function HeroArt() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 hidden h-full w-[46%] sm:block">
      {/* torus */}
      <span className="absolute -right-[4%] bottom-[-14%] h-[230px] w-[230px] rounded-full bg-[radial-gradient(circle_at_30%_25%,#d9c8ff,#8a63f0_55%,#5b36c9)] shadow-[0_24px_40px_rgba(106,67,216,0.35)]">
        <span className="absolute left-1/2 top-1/2 h-[96px] w-[96px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_70%_70%,#eef3ff,#d3e0fb)] shadow-[inset_0_10px_18px_rgba(91,54,201,0.4)]" />
      </span>
      {/* cube */}
      <span className="absolute right-[10%] top-[10%] h-[52px] w-[52px] rotate-12 rounded-xl bg-gradient-to-br from-[#ff9a76] to-[#e84a4a] shadow-[0_12px_20px_rgba(232,74,74,0.35)]" />
      {/* cone */}
      <span className="absolute right-[44%] top-[44%] h-0 w-0 -rotate-12 border-x-[26px] border-b-[46px] border-x-transparent border-b-[#f25f7a] drop-shadow-[0_10px_12px_rgba(242,95,122,0.4)]" />
      {/* spheres */}
      <span className="absolute right-[30%] top-[-6%] h-[46px] w-[46px] rounded-full bg-[radial-gradient(circle_at_30%_30%,#d9c8ff,#8a63f0)] shadow-[0_10px_16px_rgba(106,67,216,0.3)]" />
      <span className="absolute right-[52%] top-[14%] h-[16px] w-[16px] rounded-full bg-[radial-gradient(circle_at_30%_30%,#bcd6ff,#4a82ee)]" />
      <span className="absolute right-[24%] top-[62%] h-[12px] w-[12px] rounded-full bg-[#fbbf24]/80" />
    </div>
  );
}
