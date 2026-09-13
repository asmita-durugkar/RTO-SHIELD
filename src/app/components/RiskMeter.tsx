'use client';

import React, { useEffect, useState } from 'react';
import { Gauge, ShieldAlert, ShieldCheck, ShieldQuestion } from 'lucide-react';
import type { RiskResult } from './CommandCenterContent';

interface RiskMeterProps {
  result: RiskResult | null;
  isLoading: boolean;
}

function bandFor(score: number) {
  if (score >= 75) {
    return { label: 'HIGH RISK', color: '#ef4444', glow: 'rgba(239,68,68,0.35)', Icon: ShieldAlert };
  }
  if (score >= 50) {
    return { label: 'MEDIUM RISK', color: '#f59e0b', glow: 'rgba(245,158,11,0.35)', Icon: ShieldQuestion };
  }
  return { label: 'LOW RISK', color: '#00d4aa', glow: 'rgba(0,212,170,0.35)', Icon: ShieldCheck };
}

export default function RiskMeter({ result, isLoading }: RiskMeterProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    if (!result) {
      setAnimatedScore(0);
      return;
    }
    let frame: number;
    const target = result.risk_score;
    const start = performance.now();
    const duration = 800;
    const from = 0;

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(from + (target - from) * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [result]);

  const score = result ? animatedScore : 0;
  const band = bandFor(result ? result.risk_score : 0);

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="glass-card rounded-xl h-full flex flex-col" style={{ minHeight: 480 }}>
      <div className="flex items-center gap-2 px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center"
          style={{ background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)' }}
        >
          <Gauge size={13} style={{ color: 'var(--primary)' }} />
        </div>
        <span className="font-semibold text-sm text-foreground">Risk Score</span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-6 gap-5">
        <div className="relative w-[180px] h-[180px] flex items-center justify-center">
          <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
            <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
            {result && (
              <circle
                cx="90"
                cy="90"
                r={radius}
                fill="none"
                stroke={band.color}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                style={{
                  transition: 'stroke-dashoffset 120ms linear, stroke 300ms ease',
                  filter: `drop-shadow(0 0 8px ${band.glow})`,
                }}
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isLoading ? (
              <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="var(--primary)" strokeWidth="3" strokeDasharray="30 70" />
              </svg>
            ) : (
              <>
                <span className="font-mono-data font-bold text-4xl text-foreground">{result ? score : '—'}</span>
                <span className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                  / 100
                </span>
              </>
            )}
          </div>
        </div>

        {result ? (
          <div className="w-full space-y-4 animate-fade-in-up">
            <div
              className="flex items-center justify-center gap-2 rounded-lg py-2.5"
              style={{ background: `${band.color}14`, border: `1px solid ${band.color}40` }}
            >
              <band.Icon size={15} style={{ color: band.color }} />
              <span className="font-bold text-sm" style={{ color: band.color }}>
                {result.risk_label || band.label}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs px-1">
              <span style={{ color: 'var(--muted-foreground)' }}>Confidence</span>
              <span className="font-mono-data font-semibold text-foreground">
                {(result.confidence * 100).toFixed(0)}%
              </span>
            </div>

            <div
              className="rounded-lg px-3 py-2.5 text-xs leading-relaxed"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            >
              <span className="font-semibold block mb-0.5" style={{ color: 'var(--muted-foreground)' }}>
                Recommendation
              </span>
              {result.recommendation}
            </div>
          </div>
        ) : (
          <p className="text-xs text-center max-w-[180px]" style={{ color: 'var(--muted-foreground)' }}>
            Submit an order on the left to see its live RTO risk score here.
          </p>
        )}
      </div>
    </div>
  );
}
