'use client';

import React, { useEffect, useRef, useState } from 'react';
import { TerminalSquare, Circle } from 'lucide-react';
import type { RiskResult } from './CommandCenterContent';

interface TerminalFeedProps {
  latestResult: RiskResult | null;
}

interface LogLine {
  id: string;
  time: string;
  text: string;
  color: string;
}

function bandColor(score: number) {
  if (score >= 75) return '#ef4444';
  if (score >= 50) return '#f59e0b';
  return '#00d4aa';
}

const BOOT_LINES: Omit<LogLine, 'id'>[] = [
  { time: '18:05:58', text: 'rtoshield-engine boot sequence complete', color: 'var(--muted-foreground)' },
  { time: '18:05:59', text: 'connected to inference endpoint · model v2.4', color: '#00d4aa' },
  { time: '18:06:01', text: 'awaiting order payloads...', color: 'var(--muted-foreground)' },
];

export default function TerminalFeed({ latestResult }: TerminalFeedProps) {
  const [lines, setLines] = useState<LogLine[]>(
    BOOT_LINES.map((l, i) => ({ ...l, id: `boot-${i}` }))
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastResultRef = useRef<RiskResult | null>(null);

  useEffect(() => {
    if (!latestResult || latestResult === lastResultRef.current) return;
    lastResultRef.current = latestResult;

    const color = bandColor(latestResult.risk_score);
    const now = new Date();
    const time = now.toLocaleTimeString('en-IN', { hour12: false });

    const newLines: LogLine[] = [
      {
        id: `${now.getTime()}-a`,
        time,
        text: `order scored → risk_score=${latestResult.risk_score} confidence=${(latestResult.confidence * 100).toFixed(0)}%`,
        color,
      },
      {
        id: `${now.getTime()}-b`,
        time,
        text: `verdict: ${latestResult.risk_label} — ${latestResult.recommendation}`,
        color,
      },
    ];

    setLines((prev) => [...prev, ...newLines].slice(-40));
  }, [latestResult]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [lines]);

  return (
    <div className="glass-card rounded-xl h-full flex flex-col overflow-hidden" style={{ minHeight: 480 }}>
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)' }}
          >
            <TerminalSquare size={13} style={{ color: 'var(--primary)' }} />
          </div>
          <span className="font-semibold text-sm text-foreground">Live Scoring Feed</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
          <Circle size={7} fill="#00d4aa" style={{ color: '#00d4aa' }} className="pulse-dot" />
          streaming
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-5 py-4 font-mono-data text-xs space-y-2"
        style={{ background: 'rgba(0,0,0,0.25)' }}
      >
        {lines.map((line) => (
          <div key={line.id} className="terminal-line-in flex gap-2 leading-relaxed">
            <span style={{ color: 'var(--muted-foreground)', opacity: 0.6 }} className="shrink-0">
              [{line.time}]
            </span>
            <span style={{ color: line.color }}>{line.text}</span>
          </div>
        ))}
        <div className="flex items-center gap-1" style={{ color: 'var(--muted-foreground)' }}>
          <span style={{ color: 'var(--primary)' }}>$</span>
          <span className="blink-cursor">▍</span>
        </div>
      </div>
    </div>
  );
}
