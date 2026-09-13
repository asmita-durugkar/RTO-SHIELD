import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface AppIconProps {
  icon: LucideIcon;
  size?: number;
  color?: string;
  background?: string;
  border?: string;
  tileSize?: number;
  className?: string;
}

/**
 * Consistent "icon inside a rounded glowing tile" primitive used across
 * metric cards, bento grids, and the sidebar.
 */
export default function AppIcon({
  icon: Icon,
  size = 16,
  color = 'var(--primary)',
  background = 'rgba(0,212,170,0.1)',
  border = '1px solid rgba(0,212,170,0.22)',
  tileSize = 32,
  className = '',
}: AppIconProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-lg shrink-0 ${className}`}
      style={{ width: tileSize, height: tileSize, background, border }}
    >
      <Icon size={size} style={{ color }} />
    </div>
  );
}
