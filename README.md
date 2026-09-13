# RTOShield — Autonomous Hybrid Fraud Mitigation Engine

> **High-Throughput Machine Learning Meets Autonomous Agentic Reasoning to Mitigate E-Commerce Return-to-Origin (RTO) Fraud.**

---

## Executive Summary

In the Indian e-commerce ecosystem, **25% to 30% of total logistics budgets** are lost to Return-to-Origin (RTO) fraud, caused primarily by Cash on Delivery (COD) abuse, ghost delivery locations, and coordinated return exploitation.

Existing fraud systems face a fundamental dilemma:
1. **Deterministic ML / Rule Engines:** Fast (<20ms), but brittle. They struggle with ambiguous edge cases, causing high false-positive rejections of legitimate customers.
2. **Pure LLM Pipelines:** Deep contextual reasoning, but introduce 2–4 seconds of checkout latency and unsustainable token costs when applied to all transactions.

**RTOShield** introduces a **Tiered Hybrid Architecture**:
- **Tier 1 (High-Throughput ML):** Evaluates 90% of routine checkouts using a trained scikit-learn model in under 20ms.
- **Tier 2 (Autonomous Agentic Core):** Routes ambiguous "grey-zone" orders (40%–75% baseline risk) to an autonomous LLM agent equipped with investigative verification tools.

---

## System Architecture

```text
[ E-Commerce Checkout / Dispatch Pipeline ]
                   │
                   ▼
       [ Next.js 14 Dashboard ]
       (Command Center & Intelligence Hub)
                   │ (HTTP POST /predict)
                   ▼
     [ FastAPI Backend (Inference Engine) ]
                   │
       [ scikit-learn Model (.pkl) ]
                   │
       ┌───────────┴────────────────────────┐
       ▼                                    ▼
[ Clear Case (<40% or >75%) ]    [ Ambiguous Grey-Zone (40% - 75%) ]
       │                                    │
       │ (Sub-20ms Fast Path)               ▼
       │                          [ Autonomous RTO Agent ]
       │                               (Groq Engine)
       │                         ┌──────────┴──────────┐
       │                         ▼                     ▼
       │              [ verify_address_fuzzy ] [ check_buyer_history ]
       │              (Ghost Address Check)    (Carrier Return Pattern)
       │                         └──────────┬──────────┘
       │                                    │ (Evaluation & Adaptation)
       ▼                                    ▼
[ Instant Dispatch Clearance ]     [ Adapted Score & Reasoning Trace ]
                   └───────────┬────────────┘
                               ▼
            [ Real-time Fraud Dashboard Update ]
