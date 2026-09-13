'use client';

import React from 'react';
import { PackageSearch, AlertTriangle, ShieldCheck, TrendingDown } from 'lucide-react';

interface MetricCardsProps {
  screened: number;
  flagged: number;
  saves: number;
}

export default function MetricCards({ screened, flagged, saves }: MetricCardsProps) {
  const flagRate = screened > 0 ? ((flagged / screened) * 100).toFixed(1) : '0.0';

  const cards = [
    {
      key: 'metric-screened',
      label: 'Orders Screened',
      value: screened.toLocaleString(),
      icon: PackageSearch,
      color: 'var(--info)',
      glow: 'rgba(96,165,250,0.25)',
      bg: 'rgba(96,165,250,0.08)',
      border: 'rgba(96,165,250,0.2)',
      sub: 'Total processed today',
    },
    {
      key: 'metric-flagged',
      label: 'Flagged High-Risk',
      value: flagged.toLocaleString(),
      icon: AlertTriangle,
      color: 'var(--accent)',
      glow: 'rgba(245,158,11,0.25)',
      bg: 'rgba(245,158,11,0.08)',
      border: 'rgba(245,158,11,0.2)',
      sub: `${flagRate}% flag rate`,
    },
    {
      key: 'metric-saves',
      label: 'Dispatch Blocks',
      value: saves.toLocaleString(),
      icon: ShieldCheck,
      color: 'var(--primary)',
      glow: 'rgba(0,212,170,0.25)',
      bg: 'rgba(0,212,170,0.08)',
      border: 'rgba(0,212,170,0.2)',
      sub: 'Prevented likely RTOs',
    },
    {
      key: 'metric-savings',
      label: 'Est. Cost Avoided',
      value: `₹${(saves * 340).toLocaleString('en-IN')}`,
      icon: TrendingDown,
      color: 'var(--violet)',
      glow: 'rgba(167,139,250,0.25)',
      bg: 'rgba(167,139,250,0.08)',
      border: 'rgba(167,139,250,0.2)',
      sub: 'Reverse-logistics saved',
    },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const CardIcon = card.icon;
        return (
          <div
            key={card.key}
            className="glass-card rounded-xl p-4 lg:p-5 animate-fade-in-up transition-transform duration-200 hover:-translate-y-0.5"
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: card.bg, border: `1px solid ${card.border}` }}
              >
                <CardIcon size={16} style={{ color: card.color }} />
              </div>
            </div>
            <p className="font-mono-data font-bold text-2xl text-foreground leading-none mb-1.5">{card.value}</p>
            <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
              {card.label}
            </p>
            <p className="text-xs mt-1" style={{ color: card.color }}>
              {card.sub}
            </p>
          </div>
        );
      })}
    </div>
  );
}
