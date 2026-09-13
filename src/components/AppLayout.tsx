'use client';

import React, { useState } from 'react';
import Sidebar from './Sidebar';
import { Mail, Copy, CheckCircle2, Shield, Terminal } from 'lucide-react';

const CONTACT_EMAIL = 'rtoshield.pat@gmail.com';

interface AppLayoutProps {
  children: React.ReactNode;
  activeRoute: string;
}

export default function AppLayout({ children, activeRoute }: AppLayoutProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable — no-op, mailto link below still works
    }
  };

  return (
    <div className="min-h-screen bg-[#080C14]">
      <Sidebar activeRoute={activeRoute} />

      {/* Main content — offset by fixed sidebar width, natural page scroll */}
      <main className="pl-64 min-h-screen flex flex-col">
        <div className="flex-1 pt-8 px-8 pb-8">{children}</div>

        {/* Footer */}
        <footer className="mt-8 px-8 py-10 border-t border-slate-800/70 bg-slate-900/30">
          <div className="max-w-screen-2xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-emerald-400/10 border border-emerald-400/25">
                  <Shield size={15} className="text-[#00D4AA]" />
                </div>
                <span className="font-bold text-sm text-white">RTOShield</span>
              </div>
              <p className="text-xs leading-relaxed max-w-xs text-slate-500">
                AI-driven Return-to-Origin fraud detection for e-commerce dispatch pipelines. Score orders
                in real time, stop bad deliveries before they ship.
              </p>
            </div>

            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
                <Terminal size={11} />
                System Status
              </p>
              <div className="rounded-lg px-4 py-3 font-mono text-xs space-y-1.5 bg-black/30 border border-slate-800/70">
                <p className="text-slate-500">
                  <span className="text-[#00D4AA]">$</span> model --status
                </p>
                <p className="text-[#00D4AA]">✓ inference-engine online · v2.4 · 18ms avg</p>
              </div>
            </div>

            <div>
              <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mb-3 flex items-center gap-1.5">
                <Mail size={11} />
                Get In Touch
              </p>
              <div className="rounded-lg px-4 py-3 flex items-center justify-between gap-3 bg-emerald-400/5 border border-emerald-400/20">
                <a href={`mailto:${CONTACT_EMAIL}`} className="text-xs font-mono truncate text-white hover:underline">
                  {CONTACT_EMAIL}
                </a>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border border-slate-800/70 bg-slate-900/60 text-slate-400 hover:text-white hover:scale-[1.05] active:scale-[0.95] transition-all duration-200"
                  aria-label="Copy email to clipboard"
                >
                  {copied ? <CheckCircle2 size={13} className="text-[#00D4AA]" /> : <Copy size={13} />}
                </button>
              </div>
              
              <a 
                href={`mailto:${CONTACT_EMAIL}`}
                className="mt-3 w-full h-10 flex items-center justify-center gap-2 rounded-lg text-xs font-semibold text-[#04120e] bg-gradient-to-r from-[#00D4AA] to-[#00a389] shadow-[0_0_20px_rgba(0,212,170,0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <Mail size={13} />
                Send us a message
              </a>
            </div>
          </div>

          <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 mt-8 pt-6 border-t border-slate-800/70 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} RTOShield. All systems nominal.</p>
            <p className="font-mono">build 2.4.0 · fastapi + scikit-learn · next.js 16</p>
          </div>
        </footer>
      </main>
    </div>
  );
}