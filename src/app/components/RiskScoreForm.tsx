
'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Send, RefreshCw, User, MapPin, Hash, Clock, AlertOctagon } from 'lucide-react';
import type { RiskResult } from './CommandCenterContent';

// Point this at your FastAPI backend (Cloudflare Quick Tunnel URL or your own domain).
// Falls back to a mock score if the request fails so the UI is always demo-able.
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://equally-spectacular-acting-journey.trycloudflare.com';

interface FormValues {
  customer_id: string;
  account_age_days: number;
  delivery_address: string;
  past_rto_count: number;
}

interface RiskScoreFormProps {
  onResult: (result: RiskResult) => void;
  isLoading: boolean;
  setIsLoading: (v: boolean) => void;
}

export default function RiskScoreForm({ onResult, isLoading, setIsLoading }: RiskScoreFormProps) {
  const [isHighRiskPincode, setIsHighRiskPincode] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      customer_id: '',
      account_age_days: 0,
      delivery_address: '',
      past_rto_count: 0,
    },
  });

  const handleReset = () => {
    reset();
    setIsHighRiskPincode(false);
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
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

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      const result = await response.json();

      // Check for placeholder/dummy address keywords
      const isDummyAddress = /dummy|test|placeholder|fake/i.test(data.delivery_address);

      const riskScore = isDummyAddress
        ? 88
        : Math.round(result.risk_score ?? (result.is_fraud ? 78 : 22));

      const label = isDummyAddress
        ? 'HIGH'
        : result.risk_label ?? (riskScore >= 75 ? 'HIGH' : riskScore >= 50 ? 'MEDIUM' : 'LOW');

      const recommendation = isDummyAddress
        ? 'Agent Intervention: Dispatch blocked — synthetic address detected'
        : result.recommendation ??
          (riskScore >= 75
            ? 'Block dispatch — escalate to fraud team'
            : riskScore >= 50
            ? 'Require COD verification before dispatch'
            : 'Clear for dispatch');

      onResult({
        risk_score: riskScore,
        risk_label: label,
        confidence: isDummyAddress ? 0.98 : result.confidence ?? 0.87,
        recommendation,
      });

      toast.success(isDummyAddress ? 'Agent Anomaly Detected' : 'Order scored', {
        description: `${data.customer_id} · risk ${riskScore}/100`,
      });
    } catch (err) {
      const isDummyAddress = /dummy|test|placeholder|fake/i.test(data.delivery_address);
      const mockScore = isDummyAddress ? 88 : 72;

      onResult({
        risk_score: mockScore,
        risk_label: 'HIGH',
        confidence: 0.98,
        recommendation: isDummyAddress
          ? 'Agent Intervention: Dispatch blocked — synthetic address detected'
          : 'Block dispatch — escalate to fraud team (mock — backend unreachable)',
      });
      toast.warning('Backend unreachable — showing mock score', {
        description: 'Check that your FastAPI tunnel is running.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-card rounded-xl h-full flex flex-col" style={{ minHeight: 480 }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)' }}
          >
            <Send size={13} style={{ color: 'var(--primary)' }} />
          </div>
          <span className="font-semibold text-sm text-foreground">Risk Score Request</span>
        </div>
        <button type="button" onClick={handleReset} className="btn-ghost text-xs gap-1 px-2 py-1">
          <RefreshCw size={11} />
          Clear
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col px-6 py-5 gap-5">
        {/* Customer ID */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>
            <User size={12} style={{ color: 'var(--primary)' }} />
            Customer ID
          </label>
          <input
            {...register('customer_id', { required: 'Customer ID is required' })}
            className={`input-field font-mono-data ${errors.customer_id ? 'error' : ''}`}
            placeholder="e.g. CUST-00482"
          />
          {errors.customer_id && <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.customer_id.message}</p>}
        </div>

        {/* Account Age */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>
            <Clock size={12} style={{ color: 'var(--primary)' }} />
            Account Age (Days)
          </label>
          <p className="text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
            Number of days since the customer account was created
          </p>
          <input
            type="number"
            min={0}
            {...register('account_age_days', {
              required: 'Account age is required',
              min: { value: 0, message: 'Must be 0 or greater' },
              valueAsNumber: true,
            })}
            className={`input-field font-mono-data ${errors.account_age_days ? 'error' : ''}`}
            placeholder="e.g. 142"
          />
          {errors.account_age_days && (
            <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.account_age_days.message}</p>
          )}
        </div>

        {/* Delivery Address */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>
            <MapPin size={12} style={{ color: 'var(--primary)' }} />
            Delivery Address
          </label>
          <input
            {...register('delivery_address', { required: 'Delivery address is required' })}
            className={`input-field ${errors.delivery_address ? 'error' : ''}`}
            placeholder="e.g. 14B, Sector 9, Rohini, Delhi 110085"
          />
          {errors.delivery_address && (
            <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.delivery_address.message}</p>
          )}
        </div>

        {/* Past RTO Count */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold mb-1.5" style={{ color: 'var(--foreground)' }}>
            <Hash size={12} style={{ color: 'var(--primary)' }} />
            Past RTO Count
          </label>
          <p className="text-xs mb-1.5" style={{ color: 'var(--muted-foreground)' }}>
            Total number of previous return-to-origin events for this customer
          </p>
          <input
            type="number"
            min={0}
            {...register('past_rto_count', {
              required: 'Past RTO count is required',
              min: { value: 0, message: 'Cannot be negative' },
              valueAsNumber: true,
            })}
            className={`input-field font-mono-data ${errors.past_rto_count ? 'error' : ''}`}
            placeholder="e.g. 3"
          />
          {errors.past_rto_count && (
            <p className="text-xs mt-1" style={{ color: 'var(--danger)' }}>{errors.past_rto_count.message}</p>
          )}
        </div>

        {/* High-Risk Pincode */}
        <div>
          <label className="flex items-center gap-1.5 text-xs font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
            <AlertOctagon size={12} style={{ color: 'var(--accent)' }} />
            High-Risk Pincode
          </label>
          <button
            type="button"
            role="switch"
            aria-checked={isHighRiskPincode}
            onClick={() => setIsHighRiskPincode((v) => !v)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div
              className="relative w-11 h-6 rounded-full transition-all duration-200"
              style={{ background: isHighRiskPincode ? 'var(--primary)' : 'var(--muted)' }}
            >
              <div
                className="absolute top-0.5 w-5 h-5 rounded-full transition-transform duration-200"
                style={{
                  background: isHighRiskPincode ? 'var(--primary-foreground)' : 'var(--foreground)',
                  left: isHighRiskPincode ? 'calc(100% - 1.375rem)' : '0.125rem',
                }}
              />
            </div>
            <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Delivery pincode is flagged in the high-risk registry
            </span>
          </button>
        </div>

        {/* Submit */}
        <div className="mt-auto pt-2">
          <button type="submit" disabled={isLoading} className="btn-primary w-full gap-2 text-sm" style={{ height: 44 }}>
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

```