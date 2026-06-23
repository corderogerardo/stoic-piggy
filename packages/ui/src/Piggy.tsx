export type PiggyMood = 'zen' | 'happy' | 'tempted' | 'thinking';

export interface PiggyProps {
  mood?: PiggyMood;
  size?: number;
}

/**
 * Stoic Piggy mascot. Shared across landing, dashboard, and (mirrored) the app.
 * Faithful port of the Claude Design `Piggy.dc.html` component.
 */
export function Piggy({ mood = 'zen', size = 96 }: PiggyProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        lineHeight: 0,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 120 124"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: 'visible' }}
        role="img"
        aria-label="Stoic Piggy"
      >
        {/* zen aura ring */}
        {mood === 'zen' && (
          <circle
            cx="60"
            cy="66"
            r="54"
            fill="none"
            stroke="#A8DADC"
            strokeWidth="2"
            strokeDasharray="3 7"
            opacity="0.55"
          />
        )}

        {/* ears */}
        <path d="M34 44 L24 18 Q23 13 29 16 L52 33 Z" fill="#EFA59E" />
        <path d="M86 44 L96 18 Q97 13 91 16 L68 33 Z" fill="#EFA59E" />
        <path d="M36 40 L30 24 L48 35 Z" fill="#E63946" opacity="0.3" />
        <path d="M84 40 L90 24 L72 35 Z" fill="#E63946" opacity="0.3" />

        {/* head */}
        <circle cx="60" cy="66" r="41" fill="#F4ACA4" />
        {/* blush */}
        <circle cx="32" cy="74" r="7.5" fill="#E63946" opacity="0.16" />
        <circle cx="88" cy="74" r="7.5" fill="#E63946" opacity="0.16" />

        {/* snout */}
        <ellipse cx="60" cy="78" rx="21" ry="14.5" fill="#ED968E" />
        <ellipse cx="52" cy="78" rx="3.4" ry="5.4" fill="#1D3557" opacity="0.62" />
        <ellipse cx="68" cy="78" rx="3.4" ry="5.4" fill="#1D3557" opacity="0.62" />

        {/* eyes — zen: serene closed */}
        {mood === 'zen' && (
          <g stroke="#1D3557" strokeWidth="3.2" strokeLinecap="round" fill="none">
            <path d="M39 58 Q46.5 64 54 58" />
            <path d="M66 58 Q73.5 64 81 58" />
          </g>
        )}

        {/* eyes — happy: smiling arcs */}
        {mood === 'happy' && (
          <g stroke="#1D3557" strokeWidth="3.4" strokeLinecap="round" fill="none">
            <path d="M39 60 Q46.5 52 54 60" />
            <path d="M66 60 Q73.5 52 81 60" />
          </g>
        )}

        {/* eyes — tempted: wide + sweat */}
        {mood === 'tempted' && (
          <g>
            <circle cx="46.5" cy="57" r="7" fill="#FFFFFF" stroke="#1D3557" strokeWidth="2.2" />
            <circle cx="73.5" cy="57" r="7" fill="#FFFFFF" stroke="#1D3557" strokeWidth="2.2" />
            <circle cx="48" cy="58.5" r="3.4" fill="#1D3557" />
            <circle cx="75" cy="58.5" r="3.4" fill="#1D3557" />
            <path d="M95 50 Q99 58 95 62 Q91 58 95 50 Z" fill="#A8DADC" />
          </g>
        )}

        {/* eyes — thinking: looking up + dots */}
        {mood === 'thinking' && (
          <g>
            <circle cx="46.5" cy="57" r="6.4" fill="#FFFFFF" stroke="#1D3557" strokeWidth="2.2" />
            <circle cx="73.5" cy="57" r="6.4" fill="#FFFFFF" stroke="#1D3557" strokeWidth="2.2" />
            <circle cx="46.5" cy="53.5" r="3" fill="#1D3557" />
            <circle cx="73.5" cy="53.5" r="3" fill="#1D3557" />
            <g fill="#457B9D">
              <circle cx="96" cy="40" r="2.4" />
              <circle cx="104" cy="34" r="3.1" />
              <circle cx="113" cy="27" r="3.8" />
            </g>
          </g>
        )}
      </svg>
    </span>
  );
}
