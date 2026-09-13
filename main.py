"""
RTOShield — FastAPI inference backend.

Serves a scikit-learn model trained to predict Return-to-Origin (RTO) fraud
risk for e-commerce orders. Exposes:

  POST /predict        -> full risk assessment payload for the dashboard
  POST /trigger_agent    -> stub address-verification agent trigger
  GET  /health           -> liveness check

Run locally:
    uvicorn main:app --reload --port 8000
"""

from __future__ import annotations

import logging
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from joblib import load
from pydantic import BaseModel, Field

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("rtoshield")

app = FastAPI(
    title="RTOShield Inference API",
    description="Real-time RTO fraud risk scoring for e-commerce dispatch pipelines.",
    version="2.4.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

try:
    model = load("fraud_detection_model.pkl")
    logger.info("Loaded fraud_detection_model.pkl")
except FileNotFoundError:
    model = None
    logger.warning(
        "fraud_detection_model.pkl not found — /predict will fall back to a "
        "deterministic heuristic scorer so the API still runs end-to-end."
    )


# ── Schemas ──────────────────────────────────────────────────────────────
class OrderPayload(BaseModel):
    user_account_age_days: float = Field(..., ge=0, description="Days since account creation")
    is_high_risk_pincode: int = Field(..., ge=0, le=1, description="1 if delivery pincode is flagged")
    past_rto_count: int = Field(..., ge=0, description="Number of prior RTO events for this customer")
    address: str = Field(default="N/A", description="Delivery address for agent verification")
    phone: str = Field(default="N/A", description="Customer phone for history check")
    amount: float = Field(default=0.0, description="Order value")


class RiskResponse(BaseModel):
    risk_score: int
    risk_label: str
    confidence: float
    recommendation: str
    is_fraud: bool
    workflow: str = "standard_ml"
    agent_reasoning: Optional[str] = None


class AgentTriggerRequest(BaseModel):
    customer_id: str
    order_id: int
    address: str


class AgentTriggerResponse(BaseModel):
    order_id: int
    agent_status: str
    message: str


# ── Helpers ──────────────────────────────────────────────────────────────
def heuristic_score(item: OrderPayload) -> float:
    """Deterministic fallback probability in [0, 1] when no model is loaded."""
    score = 0.0
    score += min(item.past_rto_count, 10) * 0.08
    score += 0.35 if item.is_high_risk_pincode else 0.0
    score += 0.25 if item.user_account_age_days < 30 else 0.0
    return max(0.0, min(1.0, score))


def label_for(score: int) -> str:
    if score >= 75:
        return "HIGH"
    if score >= 50:
        return "MEDIUM"
    return "LOW"


def recommendation_for(score: int) -> str:
    if score >= 75:
        return "Block dispatch — escalate to fraud team"
    if score >= 50:
        return "Require COD verification before dispatch"
    return "Clear for dispatch"


# ── Routes ───────────────────────────────────────────────────────────────
@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": model is not None}


@app.post("/predict", response_model=RiskResponse)
def predict(item: OrderPayload):
    try:
        input_data = [[
            item.user_account_age_days,
            item.is_high_risk_pincode,
            item.past_rto_count,
        ]]

        if model is not None:
            if hasattr(model, "predict_proba"):
                fraud_probability = float(model.predict_proba(input_data)[0][1])
            else:
                fraud_probability = float(model.predict(input_data)[0])
        else:
            fraud_probability = heuristic_score(item)

        base_risk_score = round(fraud_probability * 100)
        base_risk_score = max(0, min(100, base_risk_score))
        confidence = round(max(fraud_probability, 1 - fraud_probability), 2)

        # ── Agentic Routing Logic ─────────────────────────────────────────
        final_risk_score = base_risk_score
        workflow = "agentic_intervention"
        agent_reasoning = None
        risk_label = label_for(base_risk_score)

        # Always trigger agentic loop for demonstration & testing
        try:
            from agent import run_rto_agent

            order_dict = item.dict()
            agent_result = run_rto_agent(order_dict, base_risk_score)

            final_risk_score = agent_result.get("final_score", base_risk_score)
            risk_label = agent_result.get("threat_level", label_for(final_risk_score))
            agent_reasoning = agent_result.get("agent_reasoning", "Agent verified order.")

            confidence = 0.95

        except ImportError:
            logger.warning("agent.py not found. Skipping agentic intervention.")
            workflow = "standard_ml"
            agent_reasoning = "agent.py module not found in directory"
        except Exception as e:
            logger.error(f"Agent execution failed: {e}")
            agent_reasoning = f"Agent failed: {str(e)}"

        return RiskResponse(
            risk_score=final_risk_score,
            risk_label=risk_label,
            confidence=confidence,
            recommendation=recommendation_for(final_risk_score),
            is_fraud=final_risk_score >= 50,
            workflow=workflow,
            agent_reasoning=agent_reasoning,
        )

    except Exception as exc:  # noqa: BLE001
        logger.exception("Prediction failed")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {exc}") from exc


@app.post("/trigger_agent", response_model=AgentTriggerResponse)
def trigger_agent(payload: AgentTriggerRequest):
    agent_prompt = (
        f"Verifying address '{payload.address}' for customer {payload.customer_id} "
        f"(order #{payload.order_id})"
    )
    logger.info(agent_prompt)
    return AgentTriggerResponse(
        order_id=payload.order_id,
        agent_status="Agent triggered for address verification",
        message=agent_prompt,
    )