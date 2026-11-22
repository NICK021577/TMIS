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

/**
 * HeroArtAgency — the Agency Admin dashboard banner art. Same soft, glossy CSS-only style as HeroArt,
 * but built from different shapes: a rising set of pill bars, an arch, a capsule and a diamond.
 */
export function HeroArtAgency() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 hidden h-full w-[46%] sm:block">
      {/* arch */}
      <span className="absolute -right-[3%] bottom-[-6%] h-[150px] w-[250px] rounded-t-[125px] bg-[radial-gradient(circle_at_30%_20%,#c7f0e4,#34d3a6_55%,#12a27a)] shadow-[0_22px_38px_rgba(18,162,122,0.32)]">
        <span className="absolute bottom-0 left-1/2 h-[72px] w-[124px] -translate-x-1/2 rounded-t-[62px] bg-[radial-gradient(circle_at_50%_100%,#eef9f6,#d3efe6)] shadow-[inset_0_10px_16px_rgba(18,162,122,0.32)]" />
      </span>
      {/* rising pill bars */}
      <span className="absolute bottom-[4%] right-[44%] h-[70px] w-[26px] rounded-full bg-gradient-to-b from-[#bcd6ff] to-[#4a82ee] shadow-[0_12px_18px_rgba(59,114,230,0.3)]" />
      <span className="absolute bottom-[4%] right-[37%] h-[112px] w-[26px] rounded-full bg-gradient-to-b from-[#d6e4ff] to-[#2f5fcc] shadow-[0_12px_18px_rgba(47,95,204,0.3)]" />
      <span className="absolute bottom-[4%] right-[30%] h-[156px] w-[26px] rounded-full bg-gradient-to-b from-[#9cc2ff] to-[#1f4bb0] shadow-[0_12px_18px_rgba(31,75,176,0.32)]" />
      {/* diamond */}
      <span className="absolute right-[8%] top-[12%] h-[48px] w-[48px] rotate-45 rounded-[10px] bg-gradient-to-br from-[#ffe08a] to-[#f59e0b] shadow-[0_12px_20px_rgba(245,158,11,0.35)]" />
      {/* capsule */}
      <span className="absolute right-[40%] top-[10%] h-[62px] w-[24px] -rotate-[28deg] rounded-full bg-gradient-to-b from-[#ffd0e1] to-[#ee6fa0] shadow-[0_10px_16px_rgba(238,111,160,0.35)]" />
      {/* dots */}
      <span className="absolute right-[26%] top-[26%] h-[14px] w-[14px] rounded-full bg-[radial-gradient(circle_at_30%_30%,#fff,#9cc2ff)]" />
      <span className="absolute right-[18%] top-[48%] h-[10px] w-[10px] rounded-full bg-[#34d3a6]/80" />
    </div>
  );
}
