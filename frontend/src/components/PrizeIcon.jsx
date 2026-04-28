/**
 * PrizeIcon.jsx — minimalist SVG icons per prize type.
 *
 * Inherits currentColor for fills/strokes so each prize's color theme can
 * tint the icon via wrapping container's text-* class.
 */

const baseProps = (className) => ({
  viewBox: '0 0 32 32',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className,
  'aria-hidden': true,
});

/* Grand prize → tray (صينية) with two wing handles + steam plume */
export function IconGrandPrize({ className = 'w-6 h-6' }) {
  return (
    <svg {...baseProps(className)}>
      {/* steam */}
      <path d="M11 5c0 1.5 1 1.5 1 3" />
      <path d="M16 4c0 1.5 1 1.5 1 3" />
      <path d="M21 5c0 1.5 1 1.5 1 3" />
      {/* tray body */}
      <path
        d="M5 11h22a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-1a1 1 0 0 1 1-1Z"
        fill="currentColor"
        fillOpacity="0.18"
      />
      <path d="M5 11h22a1 1 0 0 1 1 1v1a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-1a1 1 0 0 1 1-1Z" />
      {/* wing handles */}
      <path d="M3 13c-1 0-2 1-2 2" />
      <path d="M29 13c1 0 2 1 2 2" />
      {/* base */}
      <path d="M9 21h14" strokeWidth="2.5" />
      <path d="M16 17v4" />
    </svg>
  );
}

/* Free meal → plate with dome cover */
export function IconFreeMeal({ className = 'w-6 h-6' }) {
  return (
    <svg {...baseProps(className)}>
      <path
        d="M5 17a11 11 0 0 1 22 0H5Z"
        fill="currentColor"
        fillOpacity="0.18"
      />
      <path d="M5 17a11 11 0 0 1 22 0H5Z" />
      <path d="M16 6v-2" />
      <circle cx="16" cy="4" r="0.6" fill="currentColor" />
      <path d="M3 20h26" strokeWidth="2.5" />
      <path d="M5 23h22" />
    </svg>
  );
}

/* Discount → percent badge */
export function IconDiscount({ className = 'w-6 h-6' }) {
  return (
    <svg {...baseProps(className)}>
      {/* tag shape */}
      <path
        d="M14 4h11a3 3 0 0 1 3 3v11a2 2 0 0 1-.6 1.4l-9 9a2 2 0 0 1-2.8 0L4.6 17.4A2 2 0 0 1 4 16V5a1 1 0 0 1 1-1Z"
        fill="currentColor"
        fillOpacity="0.14"
      />
      <path d="M14 4h11a3 3 0 0 1 3 3v11a2 2 0 0 1-.6 1.4l-9 9a2 2 0 0 1-2.8 0L4.6 17.4A2 2 0 0 1 4 16V5a1 1 0 0 1 1-1Z" />
      <circle cx="22" cy="10" r="1.4" fill="currentColor" />
      {/* % */}
      <path d="M11 22l8-8" strokeWidth="2.5" />
      <circle cx="11.5" cy="14.5" r="1.6" />
      <circle cx="18.5" cy="21.5" r="1.6" />
    </svg>
  );
}

/* Free delivery → scooter / moped */
export function IconFreeDelivery({ className = 'w-6 h-6' }) {
  return (
    <svg {...baseProps(className)}>
      {/* box */}
      <path
        d="M11 12h7l3 6"
        fill="currentColor"
        fillOpacity="0.14"
      />
      <path d="M11 12h7l3 6" />
      <path d="M11 12V8h-3" />
      {/* body / handle */}
      <path d="M14 18l5-1" />
      <path d="M21 18h2a3 3 0 0 1 3 3" />
      {/* wheels */}
      <circle cx="9" cy="22" r="3" fill="currentColor" fillOpacity="0.18" />
      <circle cx="9" cy="22" r="3" />
      <circle cx="24" cy="22" r="3" fill="currentColor" fillOpacity="0.18" />
      <circle cx="24" cy="22" r="3" />
      {/* speed lines */}
      <path d="M2 14h4" />
      <path d="M3 18h3" />
    </svg>
  );
}

export default {
  IconGrandPrize,
  IconFreeMeal,
  IconDiscount,
  IconFreeDelivery,
};
