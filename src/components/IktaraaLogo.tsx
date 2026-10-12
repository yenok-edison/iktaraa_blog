import React from "react";

interface IktaraaLogoProps {
  className?: string;
  variant?: "light" | "dark";
  size?: "sm" | "md" | "lg";
}

export const IktaraaLogo: React.FC<IktaraaLogoProps> = ({
  className = "",
  variant = "light",
  size = "md",
}) => {
  // Height configurations
  const heightClasses = {
    sm: "h-9",
    md: "h-11 sm:h-12",
    lg: "h-14 sm:h-16",
  };

  const taglineColor = variant === "dark" ? "#94A3B8" : "#64748B";

  return (
    <div className={`inline-flex flex-col select-none ${className}`}>
      <svg
        viewBox="0 0 520 180"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${heightClasses[size]} w-auto object-contain transition-transform`}
        aria-label="iktaraa - STRINGING THE WORLD OF MUSIC"
      >
        <defs>
          {/* Vertical linear gradient: Cyan -> Royal Purple -> Crimson Magenta */}
          <linearGradient id="iktaraaBrandGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00B4B4" />
            <stop offset="28%" stopColor="#00838F" />
            <stop offset="55%" stopColor="#283593" />
            <stop offset="78%" stopColor="#7B1FA2" />
            <stop offset="100%" stopColor="#E11D48" />
          </linearGradient>

          {/* Pure glow / string gradient */}
          <linearGradient id="iktaraaStringGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#1E1B4B" />
            <stop offset="60%" stopColor="#4338CA" />
            <stop offset="100%" stopColor="#D946EF" />
          </linearGradient>
        </defs>

        {/* ========================================================= */}
        {/* WORDMARK "iktaraa" with Custom Ligatures & Strings        */}
        {/* ========================================================= */}
        <g strokeLinecap="round" strokeLinejoin="round">
          {/* 'i' */}
          {/* Dot */}
          <circle cx="28" cy="24" r="10" fill="#00B4B4" />
          {/* Stem */}
          <rect x="20" y="46" width="16" height="84" rx="8" fill="url(#iktaraaBrandGradient)" />

          {/* 'k' */}
          {/* Left tall stem */}
          <rect x="56" y="10" width="16" height="120" rx="8" fill="url(#iktaraaBrandGradient)" />
          {/* Upper diagonal arm */}
          <line
            x1="66"
            y1="82"
            x2="114"
            y2="46"
            stroke="url(#iktaraaBrandGradient)"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Lower diagonal leg */}
          <line
            x1="84"
            y1="69"
            x2="124"
            y2="126"
            stroke="url(#iktaraaBrandGradient)"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* 't' */}
          {/* Vertical stem with curved tail */}
          <path
            d="M174 36 V112 C174 124 184 132 198 132 H208"
            stroke="url(#iktaraaBrandGradient)"
            strokeWidth="16"
            strokeLinecap="round"
            fill="none"
          />

          {/* Musical Instrument Strings extending horizontally from 't' across 'a', 'r', 'a', 'a' */}
          {/* Acoustic sound resonance waves under 't' */}
          <path
            d="M188 98 C184 105 184 113 188 120"
            stroke="url(#iktaraaBrandGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.75"
          />
          <path
            d="M194 94 C189 105 189 117 194 126"
            stroke="url(#iktaraaBrandGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.85"
          />

          {/* String 1 (Upper Horizontal String Line) */}
          <line
            x1="150"
            y1="68"
            x2="440"
            y2="68"
            stroke="#1E1B4B"
            strokeWidth="3.2"
          />
          {/* String 2 (Lower Horizontal String Line) */}
          <line
            x1="150"
            y1="75"
            x2="458"
            y2="75"
            stroke="#1E1B4B"
            strokeWidth="3.2"
          />

          {/* String Tuning Peg / Bead 1 (Upper) */}
          <circle cx="440" cy="68" r="6" fill="#C026D3" />
          {/* String Tuning Peg / Bead 2 (Lower end) */}
          <circle cx="462" cy="75" r="9" fill="#E11D48" />

          {/* First 'a' */}
          {/* Circular bowl */}
          <circle
            cx="244"
            cy="90"
            r="38"
            stroke="url(#iktaraaBrandGradient)"
            strokeWidth="15"
            fill="none"
          />
          {/* Right stem */}
          <rect x="274" y="52" width="15" height="78" rx="7.5" fill="url(#iktaraaBrandGradient)" />

          {/* 'r' */}
          {/* Stem */}
          <rect x="314" y="52" width="15" height="78" rx="7.5" fill="url(#iktaraaBrandGradient)" />
          {/* Top curve */}
          <path
            d="M322 72 C330 56 344 50 366 52"
            stroke="url(#iktaraaBrandGradient)"
            strokeWidth="15"
            strokeLinecap="round"
            fill="none"
          />

          {/* Second 'a' */}
          <circle
            cx="398"
            cy="90"
            r="38"
            stroke="url(#iktaraaBrandGradient)"
            strokeWidth="15"
            fill="none"
          />
          <rect x="428" y="52" width="15" height="78" rx="7.5" fill="url(#iktaraaBrandGradient)" />

          {/* Third 'a' */}
          <circle
            cx="472"
            cy="90"
            r="38"
            stroke="url(#iktaraaBrandGradient)"
            strokeWidth="15"
            fill="none"
          />
          <rect x="502" y="52" width="15" height="78" rx="7.5" fill="url(#iktaraaBrandGradient)" />
        </g>

        {/* ========================================================= */}
        {/* TAGLINE: STRINGING THE WORLD OF MUSIC                    */}
        {/* ========================================================= */}
        <text
          x="260"
          y="170"
          textAnchor="middle"
          fill={taglineColor}
          fontSize="24"
          fontWeight="700"
          letterSpacing="0.22em"
          fontFamily="'Outfit', 'Plus Jakarta Sans', sans-serif"
          className="uppercase tracking-widest"
        >
          STRINGING THE WORLD OF MUSIC
        </text>
      </svg>
    </div>
  );
};
