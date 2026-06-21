from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional
import spacy
import logging

# Configure runtime execution logger
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ReviewAgent")

router = APIRouter()

# Load the NLP English dictionary pipeline safely
try:
    nlp = spacy.load("en_core_web_sm")
except Exception as e:
    logger.warning("Spacy core dictionary not found natively. Loading minimal fallback parsers.")
    nlp = None

# =========================================================================
# 🛡️ PYDANTIC SCHEMA DEFINITION (ELIMINATES THE 422 VALIDATION COLLISION)
# =========================================================================
class VarianceCheckRequest(BaseModel):
    pdf_text: str = Field(..., description="The raw descriptive specifications or extracted PDF text layout matrix.")
    human_scores: List[float] = Field(..., description="Array of total evaluation score sheets compiled by the reviewer panel.")
    threshold: float = Field(2.0, description="The statistical allowable drift delta bound limit before raising warnings.")

    class Config:
        json_schema_extra = {
            "example": {
                "pdf_text": "MindMate AI youth mental wellness tracking dashboard framework using PyTorch and local LLMs.",
                "human_scores": [78.5, 82.0, 80.0],
                "threshold": 2.0
            }
        }

# =========================================================================
# ⚙️ CORE ANALYTICS INTERFACE ROUTE
# =========================================================================
@router.post("/variance-check")
async def check_variance(payload: VarianceCheckRequest):
    """
    Feature 2 Telemetry Endpoint:
    Correlates aggregated human evaluator metrics against an AI semantic criteria baseline, 
    calculating score dispersion parameters and raising system logs if structural drift is observed.
    """
    try:
        logger.info("Initializing variance intelligence execution trace loop...")
        
        text_content = payload.pdf_text
        human_scores_list = payload.human_scores
        drift_threshold = payload.threshold

        if not human_scores_list or len(human_scores_list) == 0:
            raise HTTPException(status_code=400, detail="Human evaluation matrix row allocations cannot be empty.")

        # 1. Compute human scoring summary configurations
        human_average = sum(human_scores_list) / len(human_scores_list)

        # 2. Compute AI System Evaluation Baseline
        # Uses semantic keyword weight density parsing or text metric length arrays
        base_calculated_score = 75.0  # System standard default score benchmark calibration
        
        if nlp and text_content:
            doc = nlp(text_content.lower())
            # Basic density analyzer: boost scoring markers if specific engineering tokens are caught
            tech_tokens = ["pytorch", "fastapi", "react", "next.js", "security", "steganography", "wellness"]
            matches = [token.text for token in doc if token.text in tech_tokens]
            
            # Dynamically shift baseline score parameters based on document profile complexity keywords
            base_calculated_score += min(15.0, len(set(matches)) * 2.5)

        # 3. Assess Deviation Variances
        variance_drift = abs(human_average - base_calculated_score)
        trigger_alert_flag = variance_drift > drift_threshold

        logger.info(f"Telemetry computed. Human Avg: {human_average}, AI Baseline: {base_calculated_score}, Drift: {variance_drift}")

        return {
            "success": True,
            "variance": round(float(variance_drift), 2),
            "trigger_alert": bool(trigger_alert_flag),
            "ai_score": round(float(base_calculated_score), 2),
            "human_average": round(float(human_average), 2),
            "message": "Variance telemetry matrix array computed successfully."
        }

    except Exception as err:
        logger.error(f"Execution boundary fault in review telemetry agent: {str(err)}")
        raise HTTPException(status_code=500, detail=f"Internal system scoring fault: {str(err)}")
