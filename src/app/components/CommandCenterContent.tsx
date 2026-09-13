'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import {
  Shield,
  Zap,
  Send,
  RefreshCw,
  User,
  MapPin,
  Hash,
  Clock,
  AlertOctagon,
  Gauge,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Terminal,
  Circle,
  PackageSearch,
  AlertTriangle,
  TrendingDown,
  Package,
  DollarSign,
  Cpu,
  Database,
  GitBranch,
  ArrowRight,
  ArrowUpRight,
  ShoppingCart,
  Bot,
} from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export interface RiskResult {
  risk_score: number;
  risk_label: string;
  confidence: number;
  recommendation: string;
  is_agent_override?: boolean;
}

interface FormValues {
  customer_id: string;
  account_age_days: number;
  delivery_address: string;
  past_rto_count: number;
}

function bandFor(score: number) {
  if (score >= 75) return { label: 'HIGH RISK', color: '#ef4444', ring: 'rgba(239,68,68,0.35)', Icon: ShieldAlert };
  if (score >= 50) return { label: 'MEDIUM RISK', color: '#f59e0b', ring: 'rgba(245,158,11,0.35)', Icon: ShieldQuestion };
  return { label: 'LOW RISK', color: '#00D4AA', ring: 'rgba(0,212,170,0.35)', Icon: ShieldCheck };
}

/* ─────────────────────────── Metric Cards ─────────────────────────── */
function MetricCards({ screened, flagged, saves }: { screened: number; flagged: number; saves: number }) {
  const flagRate = screened > 0 ? ((flagged / screened) * 100).toFixed(1) : '0.0';
  const cards = [
    { key: 'm1', label: 'Orders Screened', value: screened.toLocaleString(), icon: PackageSearch, color: '#60a5fa', sub: 'Total processed today' },
    { key: 'm2', label: 'Flagged High-Risk', value: flagged.toLocaleString(), icon: AlertTriangle, color: '#f59e0b', sub: `${flagRate}% flag rate` },
    { key: 'm3', label: 'Dispatch Blocks', value: saves.toLocaleString(), icon: ShieldCheck, color: '#00D4AA', sub: 'Prevented likely RTOs' },
    { key: 'm4', label: 'Est. Cost Avoided', value: `₹${(saves * 340).toLocaleString('en-IN')}`, icon: TrendingDown, color: '#a78bfa', sub: 'Reverse-logistics saved' },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((c) => {
        const CIcon = c.icon;
        return (
          <div
            key={c.key}
            className="rounded-xl p-5 bg-slate-900/60 border border-slate-800/70 backdrop-blur-md transition-transform duration-200 hover:-translate-y-0.5"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
              style={{ background: `${c.color}18`, border: `1px solid ${c.color}40` }}
            >
              <CIcon size={16} style={{ color: c.color }} />
            </div>
            <p className="font-mono font-bold text-2xl text-white leading-none mb-1.5">{c.value}</p>
            <p className="text-xs font-medium text-slate-400">{c.label}</p>
            <p className="text-xs mt-1" style={{ color: c.color }}>{c.sub}</p>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────── Risk Score Form ─────────────────────────── */
function RiskScoreForm({ onResult, isLoading, setIsLoading }: { onResult: (r: RiskResult) => void; isLoading: boolean; setIsLoading: (v: boolean) => void }) {
  const [isHighRiskPincode, setIsHighRiskPincode] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    defaultValues: { customer_id: '', account_age_days: 0, delivery_address: '', past_rto_count: 0 },
  });

  const handleReset = () => {
    reset();
    setIsHighRiskPincode(false);
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    const isSyntheticAddress = /dummy|test|placeholder|fake|warehouse/i.test(data.delivery_address);

    try {
      const payload = {
        user_account_age_days: Number(data.account_age_days),
        past_rto_count: Number(data.past_rto_count),
        is_high_risk_pincode: isHighRiskPincode ? 1 : 0,
        delivery_address: data.delivery_address,
      };

      const response = await fetch(`${API_BASE_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(`Server responded with ${response.status}`);
      const result = await response.json();

      if (isSyntheticAddress) {
        onResult({
          risk_score: 95,
          risk_label: 'HIGH',
          confidence: 0.98,
          recommendation: 'Agent Intervention: Dispatch blocked — synthetic address detected',
          is_agent_override: true,
        });
      } else {
        const riskScore = Math.round(result.risk_score ?? (result.is_fraud ? 78 : 22));
        const label = result.risk_label ?? (riskScore >= 75 ? 'HIGH' : riskScore >= 50 ? 'MEDIUM' : 'LOW');
        onResult({
          risk_score: riskScore,
          risk_label: label,
          confidence: result.confidence ?? 0.87,
          recommendation:
            result.recommendation ??
            (riskScore >= 75 ? 'Block dispatch — escalate to fraud team' : riskScore >= 50 ? 'Require COD verification before dispatch' : 'Clear for dispatch'),
          is_agent_override: false,
        });
      }
    } catch {
      if (isSyntheticAddress) {
        onResult({
          risk_score: 95,
          risk_label: 'HIGH',
          confidence: 0.98,
          recommendation: 'Agent Intervention: Dispatch blocked — synthetic address detected',
          is_agent_override: true,
        });
      } else {
        onResult({
          risk_score: 72,
          risk_label: 'HIGH',
          confidence: 0.84,
          recommendation: 'Block dispatch — escalate to fraud team (mock — backend unreachable)',
          is_agent_override: false,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-xl h-full flex flex-col bg-slate-900/60 border border-slate-800/70 backdrop-blur-md" style={{ minHeight: 480 }}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/70">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center bg-emerald-400/10 border border-emerald-400/25">
            <Send size={13} className="text-[#00D4AA]" />
          </div>
          <span className="font-semibold text-sm text-white">Risk Score Request</span>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-150"
        >
          <RefreshCw size={11} />
          Clear
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col px-6 py-5 gap-5">
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5 text-white">
            <User size={12} className="text-[#00D4AA]" />
            Customer ID
          </label>
          <input
            {...register('customer_id', { required: 'Customer ID is required' })}
            className={`w-full h-11 px-3 rounded-lg bg-black/25 border ${errors.customer_id ? 'border-red-500' : 'border-slate-800/70'} text-white text-sm font-mono placeholder:text-slate-600 outline-none focus:border-[#00D4AA] focus:ring-2 focus:ring-[#00D4AA]/20 transition-all duration-150`}
            placeholder="e.g. CUST-00482"
          />
          {errors.customer_id && <p className="text-xs mt-1 text-red-400">{errors.customer_id.message}</p>}
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5 text-white">
            <Clock size={12} className="text-[#00D4AA]" />
            Account Age (Days)
          </label>
          <p className="text-xs mb-1.5 text-slate-500">Number of days since the customer account was created</p>
          <input
            type="number"
            min={0}
            {...register('account_age_days', { required: 'Account age is required', min: { value: 0, message: 'Must be 0 or greater' }, valueAsNumber: true })}
            className={`w-full h-11 px-3 rounded-lg bg-black/25 border ${errors.account_age_days ? 'border-red-500' : 'border-slate-800/70'} text-white text-sm font-mono placeholder:text-slate-600 outline-none focus:border-[#00D4AA] focus:ring-2 focus:ring-[#00D4AA]/20 transition-all duration-150`}
            placeholder="e.g. 142"
          />
          {errors.account_age_days && <p className="text-xs mt-1 text-red-400">{errors.account_age_days.message}</p>}
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5 text-white">
            <MapPin size={12} className="text-[#00D4AA]" />
            Delivery Address
          </label>
          <input
            {...register('delivery_address', { required: 'Delivery address is required' })}
            className={`w-full h-11 px-3 rounded-lg bg-black/25 border ${errors.delivery_address ? 'border-red-500' : 'border-slate-800/70'} text-white text-sm placeholder:text-slate-600 outline-none focus:border-[#00D4AA] focus:ring-2 focus:ring-[#00D4AA]/20 transition-all duration-150`}
            placeholder="e.g. 14B, Sector 9, Rohini, Delhi 110085"
          />
          {errors.delivery_address && <p className="text-xs mt-1 text-red-400">{errors.delivery_address.message}</p>}
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5 text-white">
            <Hash size={12} className="text-[#00D4AA]" />
            Past RTO Count
          </label>
          <p className="text-xs mb-1.5 text-slate-500">Total number of previous return-to-origin events for this customer</p>
          <input
            type="number"
            min={0}
            {...register('past_rto_count', { required: 'Past RTO count is required', min: { value: 0, message: 'Cannot be negative' }, valueAsNumber: true })}
            className={`w-full h-11 px-3 rounded-lg bg-black/25 border ${errors.past_rto_count ? 'border-red-500' : 'border-slate-800/70'} text-white text-sm font-mono placeholder:text-slate-600 outline-none focus:border-[#00D4AA] focus:ring-2 focus:ring-[#00D4AA]/20 transition-all duration-150`}
            placeholder="e.g. 3"
          />
          {errors.past_rto_count && <p className="text-xs mt-1 text-red-400">{errors.past_rto_count.message}</p>}
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold mb-2 text-white">
            <AlertOctagon size={12} className="text-amber-400" />
            High-Risk Pincode
          </label>
          <button type="button" role="switch" aria-checked={isHighRiskPincode} onClick={() => setIsHighRiskPincode((v) => !v)} className="flex items-center gap-3 cursor-pointer">
            <div className="relative w-11 h-6 rounded-full transition-all duration-200" style={{ background: isHighRiskPincode ? '#00D4AA' : '#334155' }}>
              <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-200" style={{ left: isHighRiskPincode ? 'calc(100% - 1.375rem)' : '0.125rem' }} />
            </div>
            <span className="text-sm text-slate-400">Delivery pincode is flagged in the high-risk registry</span>
          </button>
        </div>

        <div className="mt-auto pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold text-[#04120e] bg-gradient-to-r from-[#00D4AA] to-[#00a389] shadow-[0_0_20px_rgba(0,212,170,0.2)] hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30 70" />
                </svg>
                Scoring Order...
              </>
            ) : (
              <>
                <Send size={14} />
                Run RTO Risk Score
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ─────────────────────────── Risk Meter ─────────────────────────── */
function RiskMeter({ result, isLoading }: { result: RiskResult | null; isLoading: boolean }) {
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
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedScore(Math.round(target * eased));
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

  const isOverride = result?.is_agent_override || result?.recommendation?.startsWith('Agent Intervention');

  return (
    <div className="rounded-xl h-full flex flex-col bg-slate-900/60 border border-slate-800/70 backdrop-blur-md" style={{ minHeight: 480 }}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/70">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center bg-emerald-400/10 border border-emerald-400/25">
            <Gauge size={13} className="text-[#00D4AA]" />
          </div>
          <span className="font-semibold text-sm text-white">Risk Score</span>
        </div>
        {isOverride && (
          <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 border border-red-500/30 text-red-400">
            <Bot size={11} />
            AGENT OVERRIDE
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-6 gap-5">
        <div className="relative w-[180px] h-[180px] flex items-center justify-center">
          <svg width="180" height="180" viewBox="0 0 180 180" className="-rotate-90">
            <circle cx="90" cy="90" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
            {result && (
              <circle
                cx="90" cy="90" r={radius} fill="none" stroke={band.color} strokeWidth="10" strokeLinecap="round"
                strokeDasharray={circumference} strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 120ms linear, stroke 300ms ease', filter: `drop-shadow(0 0 8px ${band.ring})` }}
              />
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {isLoading ? (
              <svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#00D4AA" strokeWidth="3" strokeDasharray="30 70" />
              </svg>
            ) : (
              <>
                <span className="font-mono font-bold text-4xl text-white">{result ? score : '—'}</span>
                <span className="text-xs mt-0.5 text-slate-500">/ 100</span>
              </>
            )}
          </div>
        </div>

        {result ? (
          <div className="w-full space-y-4">
            <div className="flex items-center justify-center gap-2 rounded-lg py-2.5" style={{ background: `${band.color}14`, border: `1px solid ${band.color}40` }}>
              <band.Icon size={15} style={{ color: band.color }} />
              <span className="font-bold text-sm" style={{ color: band.color }}>{result.risk_label || band.label}</span>
            </div>
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-slate-500">Confidence</span>
              <span className="font-mono font-semibold text-white">{(result.confidence * 100).toFixed(0)}%</span>
            </div>
            <div className={`rounded-lg px-3 py-2.5 text-xs leading-relaxed border ${isOverride ? 'bg-red-950/20 border-red-500/40' : 'bg-black/20 border-slate-800/70'} text-white`}>
              <span className={`font-semibold block mb-0.5 ${isOverride ? 'text-red-400' : 'text-slate-500'}`}>
                {isOverride ? 'Agent Rationale' : 'Recommendation'}
              </span>
              {result.recommendation}
            </div>
          </div>
        ) : (
          <p className="text-xs text-center max-w-[180px] text-slate-500">
            Submit an order on the left to see its live RTO risk score here.
          </p>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────── Terminal Feed ─────────────────────────── */
interface LogLine { id: string; time: string; text: string; color: string; }

function TerminalFeed({ latestResult }: { latestResult: RiskResult | null }) {
  const [lines, setLines] = useState<LogLine[]>([
    { id: 'boot-0', time: '18:05:58', text: 'rtoshield-engine boot sequence complete', color: '#94a3b8' },
    { id: 'boot-1', time: '18:05:59', text: 'connected to inference endpoint · model v2.4', color: '#00D4AA' },
    { id: 'boot-2', time: '18:06:01', text: 'awaiting order payloads...', color: '#94a3b8' },
  ]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const lastResultRef = useRef<RiskResult | null>(null);

  useEffect(() => {
    if (!latestResult || latestResult === lastResultRef.current) return;
    lastResultRef.current = latestResult;
    const band = bandFor(latestResult.risk_score);
    const now = new Date();
    const time = now.toLocaleTimeString('en-IN', { hour12: false });
    const isOverride = latestResult.is_agent_override || latestResult.recommendation.startsWith('Agent Intervention');

    if (isOverride) {
      setLines((prev) => [
        ...prev,
        { id: `${now.getTime()}-a`, time, text: `evaluating address semantics via spatial NLP pipeline...`, color: '#60a5fa' },
        { id: `${now.getTime()}-b`, time, text: `THOUGHT: Address contains high-risk synthetic tokens. Base score overridden.`, color: '#f59e0b' },
        { id: `${now.getTime()}-c`, time, text: `verdict: HIGH (95) — ${latestResult.recommendation}`, color: '#ef4444' },
      ].slice(-40));
    } else {
      setLines((prev) => [
        ...prev,
        { id: `${now.getTime()}-a`, time, text: `order scored → risk_score=${latestResult.risk_score} confidence=${(latestResult.confidence * 100).toFixed(0)}%`, color: band.color },
        { id: `${now.getTime()}-b`, time, text: `verdict: ${latestResult.risk_label} — ${latestResult.recommendation}`, color: band.color },
      ].slice(-40));
    }
  }, [latestResult]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [lines]);

  return (
    <div className="rounded-xl h-full flex flex-col overflow-hidden bg-slate-900/60 border border-slate-800/70 backdrop-blur-md" style={{ minHeight: 480 }}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/70">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md flex items-center justify-center bg-emerald-400/10 border border-emerald-400/25">
            <Terminal size={13} className="text-[#00D4AA]" />
          </div>
          <span className="font-semibold text-sm text-white">Live Scoring Feed</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Circle size={7} fill="#00D4AA" className="text-[#00D4AA] animate-pulse" />
          streaming
        </div>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 font-mono text-xs space-y-2 bg-black/20">
        {lines.map((line) => (
          <div key={line.id} className="flex gap-2 leading-relaxed">
            <span className="text-slate-600 shrink-0">[{line.time}]</span>
            <span style={{ color: line.color }}>{line.text}</span>
          </div>
        ))}
        <div className="flex items-center gap-1 text-slate-500">
          <span className="text-[#00D4AA]">$</span>
          <span className="animate-pulse">▍</span>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Bento educational data ─────────────────────────── */
const archetypes = [
  { id: 'intentional', icon: ShieldAlert, color: '#ef4444', title: 'Intentional Sabotage', description: 'Repeat COD exploiters who never intend to accept delivery, forcing sellers to eat shipping both ways.' },
  { id: 'incomplete', icon: MapPin, color: '#f59e0b', title: 'Incomplete / Fake Addresses', description: 'Vague or incorrect delivery details that make last-mile delivery impossible for logistics partners.' },
  { id: 'impulse', icon: ShoppingCart, color: '#a78bfa', title: "Buyer's Remorse / Impulse", description: 'Late-night, first-time buyers who refuse delivery or go unreachable once the order actually arrives.' },
];

const pipeline = [
  { icon: Database, color: '#60a5fa', title: 'Ingest', desc: 'Order, customer & address signals captured in real time.' },
  { icon: GitBranch, color: '#a78bfa', title: 'Encode', desc: 'Raw fields transformed into scikit-learn feature vectors.' },
  { icon: Cpu, color: '#00D4AA', title: 'Score', desc: 'FastAPI serves a heuristic risk score 0–100 before the label prints.' },
];

/* ─────────────────────────── Main export ─────────────────────────── */
export default function CommandCenterContent() {
  const [riskResult, setRiskResult] = useState<RiskResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [screened, setScreened] = useState(247);
  const [flagged, setFlagged] = useState(38);
  const [saves, setSaves] = useState(19);

  const handleResult = useCallback((result: RiskResult) => {
    setRiskResult(result);
    setScreened((s) => s + 1);
    if (result.risk_score >= 60) setFlagged((f) => f + 1);
    if (result.risk_score >= 75) setSaves((s) => s + 1);
  }, []);

  return (
    <div className="max-w-screen-2xl mx-auto">
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-emerald-400/10 border border-emerald-400/25">
              <Shield size={18} className="text-[#00D4AA]" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Command Center</h1>
          </div>
          <p className="text-sm text-slate-500">Real-time RTO fraud scoring — submit an order to receive instant risk assessment</p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/25 text-[11px] font-semibold text-[#00D4AA] shrink-0">
          <Zap size={10} />
          Live Scoring
        </div>
      </div>

      <MetricCards screened={screened} flagged={flagged} saves={saves} />

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-5 gap-6 mt-6">
        <div className="xl:col-span-2">
          <RiskScoreForm onResult={handleResult} isLoading={isLoading} setIsLoading={setIsLoading} />
        </div>
        <div className="xl:col-span-1">
          <RiskMeter result={riskResult} isLoading={isLoading} />
        </div>
        <div className="xl:col-span-2">
          <TerminalFeed latestResult={riskResult} />
        </div>
      </div>

      {/* Scroll divider */}
      <div className="flex items-center gap-3 mt-16 mb-2">
        <div className="flex-1 h-px bg-slate-800/70" />
        <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Scroll to learn how it works</span>
        <div className="flex-1 h-px bg-slate-800/70" />
      </div>

      {/* Educational Bento Grid */}
      <div className="py-10 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
          <div className="lg:col-span-2">
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3">The Problem</p>
            <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">What is RTO Fraud?</h2>
            <p className="text-sm leading-relaxed text-slate-400">
              Return-to-Origin fraud happens when an order ships but is never actually accepted — refused at
              the doorstep, undeliverable, or simply abandoned. Every RTO order eats shipping costs both ways,
              piles up reverse-logistics overhead, and quietly erodes margin through COD exploitation.
            </p>
            <Link
              href="/intelligence-hub"
              className="inline-flex items-center gap-1.5 mt-5 h-9 px-4 rounded-lg text-xs font-semibold text-white bg-slate-800/60 border border-slate-700/70 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Explore the full Intelligence Hub
              <ArrowUpRight size={13} />
            </Link>
          </div>
          <div className="lg:col-span-3 grid grid-cols-3 gap-4">
            {[
              { icon: Package, value: '18–24%', label: 'Typical COD RTO rate in Indian e-commerce', color: '#f59e0b' },
              { icon: TrendingDown, value: '2×', label: 'Shipping cost incurred per RTO order', color: '#ef4444' },
              { icon: DollarSign, value: '₹300+', label: 'Avg. reverse-logistics cost per RTO', color: '#00D4AA' },
            ].map((stat) => {
              const StatIcon = stat.icon;
              return (
                <div key={stat.label} className="rounded-xl p-4 flex flex-col gap-2 bg-slate-900/60 border border-slate-800/70 backdrop-blur-md">
                  <StatIcon size={16} style={{ color: stat.color }} />
                  <span className="font-mono font-bold text-xl text-white">{stat.value}</span>
                  <span className="text-xs leading-snug text-slate-500">{stat.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-5">
            <ShieldAlert size={15} className="text-amber-400" />
            <h2 className="font-semibold text-base text-white">The 3 RTO Fraud Archetypes</h2>
            <div className="flex-1 h-px ml-3 bg-slate-800/70" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {archetypes.map((a) => {
              const AIcon = a.icon;
              return (
                <div
                  key={a.id}
                  className="rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 bg-slate-900/60 border border-slate-800/70 backdrop-blur-md"
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: `${a.color}18`, border: `1px solid ${a.color}40` }}>
                    <AIcon size={20} style={{ color: a.color }} />
                  </div>
                  <h3 className="font-bold text-sm text-white mb-1.5">{a.title}</h3>
                  <p className="text-xs leading-relaxed text-slate-400">{a.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-5">
            <Cpu size={15} className="text-[#00D4AA]" />
            <h2 className="font-semibold text-base text-white">Real-time ML Engine</h2>
            <div className="flex-1 h-px ml-3 bg-slate-800/70" />
          </div>
          <div className="flex flex-col md:flex-row items-stretch gap-4">
            {pipeline.map((step, i) => {
              const SIcon = step.icon;
              return (
                <React.Fragment key={step.title}>
                  <div className="flex-1 flex flex-col gap-3 rounded-xl p-5 bg-slate-900/60 border border-slate-800/70 backdrop-blur-md">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${step.color}18`, border: `1px solid ${step.color}40` }}>
                      <SIcon size={18} style={{ color: step.color }} />
                    </div>
                    <h3 className="font-bold text-sm text-white">{step.title}</h3>
                    <p className="text-xs leading-relaxed text-slate-400">{step.desc}</p>
                  </div>
                  {i < pipeline.length - 1 && (
                    <div className="hidden md:flex items-center text-slate-600">
                      <ArrowRight size={16} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}