'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { Mail, Send, Copy, MessageSquare } from 'lucide-react';

const CONTACT_EMAIL = 'rtoshield.pat@gmail.com';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      toast.success('Email copied to clipboard', { description: CONTACT_EMAIL });
    } catch {
      toast.error('Could not copy — please copy manually', { description: CONTACT_EMAIL });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      toast.error('Please fill in every field before sending');
      return;
    }
    setIsSubmitting(true);
    const subject = encodeURIComponent(`RTOShield inquiry from ${name}`);
    const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`);
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success('Opening your email client…');
    }, 400);
  };

  return (
    <div className="glass-card rounded-xl h-full flex flex-col" style={{ padding: '24px' }}>
      <div className="flex items-center gap-2 mb-1">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center"
          style={{ background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)' }}
        >
          <MessageSquare size={13} style={{ color: 'var(--primary)' }} />
        </div>
        <h3 className="font-semibold text-sm text-foreground">Talk to the Team</h3>
      </div>
      <p className="text-xs mb-5" style={{ color: 'var(--muted-foreground)' }}>
        Questions about the model, integration, or a pilot? Reach out directly.
      </p>

      <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input-field"
          placeholder="Your name"
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="input-field"
          placeholder="you@company.com"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className="input-field"
          style={{ height: 'auto', paddingTop: 10, paddingBottom: 10, resize: 'none' }}
          placeholder="Tell us what you're building…"
        />

        <button type="submit" disabled={isSubmitting} className="btn-primary w-full gap-2 text-sm mt-1" style={{ height: 42 }}>
          <Send size={13} />
          {isSubmitting ? 'Opening mail client…' : 'Send Message'}
        </button>

        <div
          className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 mt-1"
          style={{ background: 'rgba(0,212,170,0.05)', border: '1px solid rgba(0,212,170,0.15)' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Mail size={12} style={{ color: 'var(--primary)' }} className="shrink-0" />
            <span className="text-xs font-mono-data truncate" style={{ color: 'var(--foreground)' }}>
              {CONTACT_EMAIL}
            </span>
          </div>
          <button
            type="button"
            onClick={handleCopyEmail}
            className="btn-ghost shrink-0 w-7 h-7"
            aria-label="Copy email"
            title="Copy to clipboard"
          >
            <Copy size={12} />
          </button>
        </div>
      </form>
    </div>
  );
}
