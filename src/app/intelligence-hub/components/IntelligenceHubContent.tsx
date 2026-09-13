'use client';

import React, { useState, useEffect } from 'react';
import {
  Brain,
  Zap,
  ShieldAlert,
  MapPin,
  ShoppingCart,
  Database,
  Cpu,
  ArrowRight,
  CheckCircle2,
  GitBranch,
  Activity,
  AlertTriangle,
  Mail,
  Copy,
  Send,
  Layers,
  Radar,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const CONTACT_EMAIL = 'rtoshield.pat@gmail.com';

const fraudTypes = [
  {
    id: 'intentional', icon: ShieldAlert, color: '#ef4444', tag: 'High Severity',
    title: 'Intentional Sabotage', subtitle: 'Deliberate fraud by repeat offenders',
    description: 'Customers who deliberately place orders with no intention of accepting delivery. They exploit COD policies, forcing the seller to absorb shipping costs both ways.',
    stats: [{ label: 'Avg RTO Count', value: '8.4×' }, { label: 'Detection Rate', value: '96%' }],
    signals: ['High past RTO count (>5)', 'New account with bulk orders', 'COD-only payment pattern'],
  },
  {
    id: 'incomplete', icon: MapPin, color: '#f59e0b', tag: 'Medium Severity',
    title: 'Incomplete Addresses', subtitle: 'Undeliverable due to bad address data',
    description: 'Orders with vague, incomplete, or incorrect delivery addresses that make it impossible for logistics partners to complete last-mile delivery.',
    stats: [{ label: 'Pincode Risk Flag', value: '31%' }, { label: 'Address Accuracy', value: '78%' }],
    signals: ['High-risk pincode flag', 'Missing landmark/flat no.', 'Rural delivery zone'],
  },
  {
    id: 'impulse', icon: ShoppingCart, color: '#a78bfa', tag: 'Low–Medium Severity',
    title: 'Impulse Buying', subtitle: "Buyer's remorse leading to refusal",
    description: 'Customers who place orders impulsively and then refuse delivery or become unreachable. Often triggered by flash sales or late-night browsing sessions.',
    stats: [{ label: 'Account Age', value: '<30d' }, { label: 'Order Hour Risk', value: '04%' }],
    signals: ['Very new account (<30 days)', 'Late-night order time', 'First-time COD buyer'],
  },
];

const archSteps = [
  {
    key: 'arch-ingestion', icon: Database, color: '#60a5fa', title: 'Data Ingestion', subtitle: 'Order & Customer Signals',
    description: 'Raw order data is collected — customer metadata, delivery address, pincode, historical RTO events, and payment method.',
    features: ['Customer account age extraction', 'Historical RTO count aggregation', 'Pincode risk registry lookup', 'Real-time order payload parsing'],
    endpoint: 'POST /predict',
  },
  {
    key: 'arch-features', icon: GitBranch, color: '#a78bfa', title: 'Feature Engineering', subtitle: 'Signal Transformation',
    description: 'Raw inputs are transformed into ML-ready feature vectors. Account age is normalized, RTO count is binned into risk tiers.',
    features: ['Normalization of account age', 'RTO count risk tier encoding', 'Binary pincode risk flag', 'Feature weighting'],
    endpoint: 'Internal transform layer',
  },
  {
    key: 'arch-scoring', icon: Cpu, color: '#00D4AA', title: 'Risk Scoring', subtitle: 'Scikit-Learn Inference',
    description: 'A scikit-learn model served by FastAPI produces a 0–100 risk score with an associated confidence value.',
    features: ['Model inference via FastAPI', 'Confidence score alongside risk score', 'Threshold-based dispatch rules', 'Heuristic fallback scorer'],
    endpoint: 'Returns { risk_score, confidence }',
  },
];

const featureData = [
  { id: 'feat-rto', feature: 'Past RTO Count', importance: 0.42, label: 'Past RTO Count', color: '#ef4444' },
  { id: 'feat-pincode', feature: 'High-Risk Pincode', importance: 0.31, label: 'High-Risk Pincode', color: '#f59e0b' },
  { id: 'feat-age', feature: 'Account Age', importance: 0.18, label: 'Account Age (Days)', color: '#00D4AA' },
  { id: 'feat-payment', feature: 'Payment Method', importance: 0.05, label: 'Payment Method', color: '#60a5fa' },
  { id: 'feat-time', feature: 'Order Hour', importance: 0.04, label: 'Order Hour of Day', color: '#a78bfa' },
];

interface TooltipProps { active?: boolean; payload?: Array<{ value: number; payload: typeof featureData[0] }>; }

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg px-3 py-2 text-xs bg-slate-900/95 border border-slate-800">
      <p className="font-semibold text-white mb-0.5">{d.label}</p>
      <p style={{ color: d.color }}>
        Importance: <span className="font-mono font-bold">{(d.importance * 100).toFixed(0)}%</span>
      </p>
    </div>
  );
}

function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [target]);
  return <span>{count}{suffix}</span>;
}

function ContactPanel() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard unavailable — mailto button below still works
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    const subject = encodeURIComponent(`RTOShield inquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="rounded-xl h-full flex flex-col bg-slate-900/60 border border-slate-800/70 backdrop-blur-md p-6">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-md flex items-center justify-center bg-emerald-400/10 border border-emerald-400/25">
          <Mail size={13} className="text-[#00D4AA]" />
        </div>
        <h3 className="font-semibold text-sm text-white">Talk to the Team</h3>
      </div>
      <p className="text-xs mb-5 text-slate-500">Questions about the model, integration, or a pilot? Reach out directly.</p>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-3">
        <input
          value={name} onChange={(e) => setName(e.target.value)}
          className="w-full h-11 px-3 rounded-lg bg-black/25 border border-slate-800/70 text-white text-sm placeholder:text-slate-600 outline-none focus:border-[#00D4AA] focus:ring-2 focus:ring-[#00D4AA]/20 transition-all duration-150"
          placeholder="Your name"
        />
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="w-full h-11 px-3 rounded-lg bg-black/25 border border-slate-800/70 text-white text-sm placeholder:text-slate-600 outline-none focus:border-[#00D4AA] focus:ring-2 focus:ring-[#00D4AA]/20 transition-all duration-150"
          placeholder="you@company.com"
        />
        <textarea
          value={message} onChange={(e) => setMessage(e.target.value)} rows={4}
          className="w-full px-3 py-2.5 rounded-lg bg-black/25 border border-slate-800/70 text-white text-sm placeholder:text-slate-600 outline-none focus:border-[#00D4AA] focus:ring-2 focus:ring-[#00D4AA]/20 transition-all duration-150 resize-none"
          placeholder="Tell us what you're building…"
        />
        <button
          type="submit"
          className="w-full h-11 flex items-center justify-center gap-2 rounded-lg text-sm font-semibold text-[#04120e] bg-gradient-to-r from-[#00D4AA] to-[#00a389] shadow-[0_0_20px_rgba(0,212,170,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 mt-1"
        >
          <Send size={13} />
          Send Message
        </button>

        <div className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 mt-1 bg-emerald-400/5 border border-emerald-400/20">
          <div className="flex items-center gap-2 min-w-0">
            <Mail size={12} className="text-[#00D4AA] shrink-0" />
            <span className="text-xs font-mono truncate text-white">{CONTACT_EMAIL}</span>
          </div>
          <button
            type="button" onClick={handleCopy}
            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center border border-slate-800/70 text-slate-400 hover:text-white hover:scale-[1.05] active:scale-[0.95] transition-all duration-200"
          >
            {copied ? <CheckCircle2 size={12} className="text-[#00D4AA]" /> : <Copy size={12} />}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function IntelligenceHubContent() {
  const [expandedArch, setExpandedArch] = useState<string | null>('arch-ingestion');
  const [hoveredFraud, setHoveredFraud] = useState<string | null>(null);

  return (
    <div className="max-w-screen-2xl mx-auto space-y-8">
      {/* Hero */}
      <div
        className="relative rounded-2xl overflow-hidden p-9 border border-emerald-400/20"
        style={{ background: 'linear-gradient(135deg, rgba(0,212,170,0.08) 0%, rgba(96,165,250,0.06) 50%, rgba(167,139,250,0.08) 100%)' }}
      >
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-400/15 border border-emerald-400/30">
                <Brain size={16} className="text-[#00D4AA]" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#00D4AA]">Intelligence Hub</span>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/25 text-[11px] font-semibold text-[#00D4AA]">
                <Zap size={10} />
                Model v2.4
              </div>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-3 leading-tight text-white">
              How RTOShield Stops Fraud Before It Ships
            </h1>
            <p className="text-sm leading-relaxed text-slate-400">
              A deep-dive into the 3 fraud archetypes, the ML pipeline that detects them, and the signal weights that drive every prediction.
            </p>
          </div>

          <div className="flex flex-row lg:flex-col gap-4 lg:gap-3 shrink-0">
            {[
              { icon: Activity, label: 'Model Accuracy', value: 94, suffix: '%', color: '#00D4AA' },
              { icon: Radar, label: 'F1 Score', value: 91, suffix: '%', color: '#60a5fa' },
              { icon: Layers, label: 'Orders Analyzed', value: 180, suffix: 'K', color: '#a78bfa' },
            ].map((stat) => {
              const StatIcon = stat.icon;
              return (
                <div key={stat.label} className="flex items-center gap-3 rounded-xl px-4 py-3 bg-white/5 border border-white/10">
                  <StatIcon size={14} style={{ color: stat.color }} />
                  <div>
                    <p className="text-xs text-slate-500">{stat.label}</p>
                    <p className="font-mono font-bold text-sm" style={{ color: stat.color }}>
                      <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fraud archetypes bento */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <AlertTriangle size={15} className="text-amber-400" />
          <h2 className="font-semibold text-base text-white">The 3 RTO Fraud Archetypes</h2>
          <div className="flex-1 h-px ml-3 bg-slate-800/70" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Bento Intelligence Grid</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fraudTypes.map((fraud) => {
            const FraudIcon = fraud.icon;
            const isHovered = hoveredFraud === fraud.id;
            return (
              <div
                key={fraud.id}
                className="rounded-2xl cursor-pointer transition-all duration-300 flex flex-col p-6 border"
                style={{
                  background: isHovered ? `${fraud.color}0f` : 'rgba(255,255,255,0.03)',
                  borderColor: isHovered ? `${fraud.color}40` : 'rgba(255,255,255,0.08)',
                  transform: isHovered ? 'translateY(-4px)' : 'none',
                }}
                onMouseEnter={() => setHoveredFraud(fraud.id)}
                onMouseLeave={() => setHoveredFraud(null)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: `${fraud.color}18`, border: `1px solid ${fraud.color}40` }}>
                    <FraudIcon size={20} style={{ color: fraud.color }} />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: `${fraud.color}18`, color: fraud.color, border: `1px solid ${fraud.color}40` }}>
                    {fraud.tag}
                  </span>
                </div>

                <h3 className="font-bold text-base text-white mb-1">{fraud.title}</h3>
                <p className="text-xs mb-3 font-medium" style={{ color: fraud.color }}>{fraud.subtitle}</p>
                <p className="text-xs leading-relaxed mb-5 text-slate-400">{fraud.description}</p>

                <div className="grid grid-cols-2 gap-3 mb-5">
                  {fraud.stats.map((stat) => (
                    <div key={stat.label} className="rounded-lg px-3 py-2.5 text-center bg-white/5 border border-white/10">
                      <p className="font-mono font-bold text-lg" style={{ color: fraud.color }}>{stat.value}</p>
                      <p className="text-xs mt-0.5 text-slate-500">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-auto space-y-2">
                  <p className="text-xs font-semibold mb-2 text-slate-500">Key Signals</p>
                  {fraud.signals.map((signal, si) => (
                    <div key={`${fraud.id}-signal-${si}`} className="flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: fraud.color }} />
                      <span className="text-xs text-white">{signal}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Architecture pipeline */}
      <div>
        <div className="flex items-center gap-2 mb-5">
          <Cpu size={15} className="text-[#00D4AA]" />
          <h2 className="font-semibold text-base text-white">System Architecture</h2>
          <div className="flex-1 h-px ml-3 bg-slate-800/70" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">3-stage ML pipeline</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {archSteps.map((step, i) => {
            const StepIcon = step.icon;
            const isExpanded = expandedArch === step.key;
            return (
              <div
                key={step.key}
                className="cursor-pointer select-none transition-all duration-300 rounded-xl p-5 border bg-white/[0.03]"
                style={{ borderColor: isExpanded ? `${step.color}50` : 'rgba(255,255,255,0.08)' }}
                onClick={() => setExpandedArch(isExpanded ? null : step.key)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${step.color}18`, border: `1px solid ${step.color}40` }}>
                    <StepIcon size={18} style={{ color: step.color }} />
                  </div>
                  <div className="font-mono font-bold text-2xl" style={{ color: `${step.color}50` }}>0{i + 1}</div>
                </div>

                <h3 className="font-bold text-sm text-white mb-0.5">{step.title}</h3>
                <p className="text-xs mb-3" style={{ color: step.color }}>{step.subtitle}</p>
                <p className="text-xs leading-relaxed mb-4 text-slate-400">{step.description}</p>

                {isExpanded && (
                  <div className="space-y-2 mb-4">
                    {step.features.map((f, fi) => (
                      <div key={`feature-${step.key}-${fi}`} className="flex items-start gap-2">
                        <CheckCircle2 size={12} className="shrink-0 mt-0.5" style={{ color: step.color }} />
                        <span className="text-xs text-white">{f}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="text-xs font-mono px-2 py-1 rounded-md w-fit" style={{ background: `${step.color}18`, color: step.color, border: `1px solid ${step.color}40` }}>
                  {step.endpoint}
                </div>
              </div>
            );
          })}
        </div>

        <div className="hidden md:flex items-center justify-center gap-4 mt-4">
          {archSteps.map((step, i) => (
            <React.Fragment key={`connector-${step.key}`}>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ background: step.color }} />
                <span className="text-xs font-mono" style={{ color: step.color }}>Stage {i + 1}</span>
              </div>
              {i < archSteps.length - 1 && (
                <div className="flex items-center gap-1 text-slate-600">
                  <div className="w-8 h-px bg-slate-800/70" />
                  <ArrowRight size={12} />
                  <div className="w-8 h-px bg-slate-800/70" />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Feature importance + contact */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-3">
          <div className="rounded-xl h-full p-6 bg-slate-900/60 border border-slate-800/70 backdrop-blur-md">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Activity size={16} className="text-[#00D4AA]" />
                <h3 className="font-semibold text-sm text-white">Feature Importance</h3>
              </div>
              <p className="text-xs text-slate-500">Signal weights — which inputs drive RTO predictions most</p>
            </div>

            <div style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={featureData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }} barSize={18}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis type="number" domain={[0, 0.5]} tickFormatter={(v) => `${(v * 100).toFixed(0)}%`} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="feature" width={110} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,212,170,0.04)' }} />
                  <Bar dataKey="importance" radius={[0, 4, 4, 0]}>
                    {featureData.map((entry) => <Cell key={entry.id} fill={entry.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-5 rounded-lg px-3 py-2.5 text-xs bg-emerald-400/5 border border-emerald-400/15">
              <p className="text-slate-400">
                <span className="font-semibold text-[#00D4AA]">Model:</span>{' '}
                Scikit-Learn · Trained on 180,000 orders · Accuracy 94.2% · F1 Score 0.91 · Served via FastAPI
              </p>
            </div>
          </div>
        </div>

        <div className="xl:col-span-2">
          <ContactPanel />
        </div>
      </div>
    </div>
  );
}