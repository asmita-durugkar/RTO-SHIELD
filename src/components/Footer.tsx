'use client';

import React from 'react';
import { toast } from 'sonner';
import { Mail, Copy, Shield, Terminal } from 'lucide-react';

const CONTACT_EMAIL = 'rtoshield.pat@gmail.com';

export default function Footer() {
  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      toast.success('Email copied to clipboard', {
        description: CONTACT_EMAIL,
      });
    } catch {
      toast.error('Could not copy — please copy manually', {
        description: CONTACT_EMAIL,
      });
    }
  };

  return (
    <footer
      className="relative mt-12 px-6 lg:px-8 xl:px-10 2xl:px-12 py-10"
      style={{ borderTop: '1px solid var(--border)', background: 'rgba(255,255,255,0.015)' }}
    >
      <div className="max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Brand block */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(0,212,170,0.12)', border: '1px solid rgba(0,212,170,0.25)' }}
              >
                <Shield size={15} style={{ color: 'var(--primary)' }} />
              </div>
              <span className="font-bold text-sm neon-text">RTOShield</span>
            </div>
            <p className="text-xs leading-relaxed max-w-xs" style={{ color: 'var(--muted-foreground)' }}>
              AI-driven Return-to-Origin fraud detection for e-commerce dispatch pipelines. Score orders
              in real time, stop bad deliveries before they ship.
            </p>
            <div className="flex items-center gap-2 mt-4">
              <a
                href="#"
                className="btn-ghost w-8 h-8 flex items-center justify-center"
                aria-label="GitHub"
                onClick={(e) => e.preventDefault()}
              >
                <svg
                  className="w-3.5 h-3.5 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              </a>
              <a
                href="#"
                className="btn-ghost w-8 h-8 flex items-center justify-center"
                aria-label="LinkedIn"
                onClick={(e) => e.preventDefault()}
              >
                <svg
                  className="w-3.5 h-3.5 fill-current"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.45a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2z" />
                </svg>
              </a>
            </div>
          </div>

          {/* System status / terminal block */}
          <div>
            <p className="section-label mb-3 flex items-center gap-1.5">
              <Terminal size={11} />
              System Status
            </p>
            <div
              className="rounded-lg px-4 py-3 font-mono-data text-xs space-y-1.5"
              style={{ background: 'rgba(0,0,0,0.35)', border: '1px solid var(--border)' }}
            >
              <p style={{ color: 'var(--muted-foreground)' }}>
                <span style={{ color: 'var(--primary)' }}>$</span> model --status
              </p>
              <p style={{ color: 'var(--primary)' }}>
                ✓ inference-engine online · v2.4 · 18ms avg
              </p>
              <p style={{ color: 'var(--muted-foreground)' }}>
                <span style={{ color: 'var(--primary)' }}>$</span> uptime --check
                <span className="blink-cursor">▍</span>
              </p>
            </div>
          </div>

          {/* Contact block */}
          <div>
            <p className="section-label mb-3 flex items-center gap-1.5">
              <Mail size={11} />
              Get In Touch
            </p>
            <div
              className="rounded-lg px-4 py-3.5 flex items-center justify-between gap-3"
              style={{ background: 'rgba(0,212,170,0.05)', border: '1px solid rgba(0,212,170,0.15)' }}
            >
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-xs font-mono-data truncate hover:underline"
                style={{ color: 'var(--foreground)' }}
              >
                {CONTACT_EMAIL}
              </a>
              <button
                type="button"
                onClick={handleCopyEmail}
                className="btn-secondary shrink-0 w-8 h-8"
                aria-label="Copy email to clipboard"
                title="Copy to clipboard"
              >
                <Copy size={13} />
              </button>
            </div>
            <a href={`mailto:${CONTACT_EMAIL}`} className="btn-primary w-full mt-3 text-xs" style={{ height: 38 }}>
              <Mail size={13} className="mr-2" />
              Send us a message
            </a>
          </div>
        </div>

        <div
          className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-10 pt-6 text-xs"
          style={{ borderTop: '1px solid var(--border)', color: 'var(--muted-foreground)' }}
        >
          <p>© {new Date().getFullYear()} RTOShield. All systems nominal.</p>
          <p className="font-mono-data">build 2.4.0 · fastapi + scikit-learn · next.js 16</p>
        </div>
      </div>
    </footer>
  );
}