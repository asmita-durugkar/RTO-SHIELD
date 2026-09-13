import React from 'react';

interface AppLogoProps {
  size?: number;
  className?: string;
}

export default function AppLogo({ size = 32, className = '' }: AppLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="RTOShield logo"
    >
      <defs>
        <linearGradient id="rtoshield-logo-grad" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00d4aa" />
          <stop offset="100%" stopColor="#007a63" />
        </linearGradient>
        <filter id="rtoshield-logo-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M16 2.5 L27.5 6.5 V15.2 C27.5 22.4 22.7 27.9 16 29.5 C9.3 27.9 4.5 22.4 4.5 15.2 V6.5 L16 2.5Z"
        fill="url(#rtoshield-logo-grad)"
        fillOpacity="0.16"
        stroke="url(#rtoshield-logo-grad)"
        strokeWidth="1.6"
        filter="url(#rtoshield-logo-glow)"
      />
      <path
        d="M11.5 16.2 L14.4 19.1 L20.6 12.6"
        stroke="#00d4aa"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="url(#rtoshield-logo-glow)"
      />
    </svg>
  );
}
