from fastapi import APIRouter, HTTPException
from ..models.requests import HouseholdRequest
from ..models.responses import HouseholdImpactResponse
from ...services.calculator import calculate_household_impact
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/household-impact", response_model=HouseholdImpactResponse)
async def household_impact(request: HouseholdRequest):
    """Calculate household surtax impact across income range."""
    try:
        result = await calculate_household_impact(
            state=request.state.value,
            filing_status=request.filing_status.value,
            income=request.income,
            surtax_rate=request.surtax_params.rate,
            thresholds=request.surtax_params.thresholds.model_dump(),
            use_single_threshold=request.surtax_params.use_single_threshold,
        )
        return result
    except Exception as e:
        logger.exception(f"Error calculating household impact: {e}")
        raise HTTPException(status_code=500, detail=str(e))
