'use client';

import React from 'react';
import Link from 'next/link';
import {
  Shield,
  Terminal,
  Brain,
  Activity,
  AlertTriangle,
  Settings,
  HelpCircle,
  Radar,
} from 'lucide-react';

interface SidebarProps {
  activeRoute: string;
}

const navItems = [
  { key: 'nav-command-center', label: 'Command Center', href: '/', icon: Terminal },
  { key: 'nav-intelligence-hub', label: 'Intelligence Hub', href: '/intelligence-hub', icon: Brain },
];

const bottomItems = [
  { key: 'nav-settings', label: 'Settings', href: '#', icon: Settings },
  { key: 'nav-help', label: 'Help & Docs', href: '#', icon: HelpCircle },
];

export default function Sidebar({ activeRoute }: SidebarProps) {
  return (
    <aside className="w-64 fixed inset-y-0 left-0 z-30 flex flex-col bg-[#0a0f1a]/95 border-r border-slate-800/70 backdrop-blur-md">
      {/* Logo */}
      <div className="flex items-center h-16 px-5 shrink-0 border-b border-slate-800/70">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-emerald-400/10 border border-emerald-400/30 shadow-[0_0_16px_rgba(0,212,170,0.25)]">
            <Shield size={18} className="text-[#00D4AA]" />
          </div>
          <span className="font-bold text-base text-white tracking-tight">RTOShield</span>
        </div>
      </div>

      {/* Status */}
      <div className="px-5 py-4 border-b border-slate-800/70">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/25 text-[11px] font-semibold text-[#00D4AA]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-400" />
          </span>
          System Online
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto">
        <p className="px-2 mb-2 text-[10px] font-mono uppercase tracking-widest text-slate-500">Navigation</p>
        {navItems.map((item) => {
          const ItemIcon = item.icon;
          const isActive = activeRoute === item.href;
          return (
            <Link
              key={item.key}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                isActive
                  ? 'bg-emerald-400/10 border border-emerald-400/25 text-[#00D4AA]'
                  : 'text-slate-400 border border-transparent hover:bg-white/5 hover:text-white'
              }`}
            >
              <ItemIcon size={18} className="shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}

        <p className="px-2 mt-7 mb-2 text-[10px] font-mono uppercase tracking-widest text-slate-500">Monitoring</p>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400">
          <AlertTriangle size={18} className="shrink-0 text-amber-400" />
          <span className="flex-1 truncate">Threat Level</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400">
            MED
          </span>
        </div>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400">
          <Activity size={18} className="shrink-0" />
          <span className="flex-1 truncate">Live Feed</span>
        </div>
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400">
          <Radar size={18} className="shrink-0" />
          <span className="flex-1 truncate">Risk Shield</span>
        </div>
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-5 pt-3 border-t border-slate-800/70 space-y-1.5">
        {bottomItems.map((item) => {
          const ItemIcon = item.icon;
          return (
            <Link
              key={item.key}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-150"
            >
              <ItemIcon size={18} className="shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}

        <div className="mt-3 px-3 py-2.5 rounded-lg flex items-center gap-3 bg-emerald-400/5 border border-emerald-400/10">
          <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold text-[#04120e] bg-gradient-to-br from-[#00D4AA] to-[#007a63]">
            RA
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold truncate text-white">Rahul Anand</p>
            <p className="text-xs truncate text-slate-500">Fraud Analyst</p>
          </div>
        </div>
      </div>
    </aside>
  );
}