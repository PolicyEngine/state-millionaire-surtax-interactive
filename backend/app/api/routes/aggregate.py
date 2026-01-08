from fastapi import APIRouter, HTTPException
from ..models.requests import AggregateRequest
from ..models.responses import AggregateImpactResponse
from ...services.calculator import calculate_aggregate_impact
import logging

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/aggregate-impact", response_model=AggregateImpactResponse)
async def aggregate_impact(request: AggregateRequest):
    """Calculate statewide aggregate surtax impact."""
    try:
        result = await calculate_aggregate_impact(
            state=request.state.value,
            surtax_rate=request.surtax_params.rate,
            thresholds=request.surtax_params.thresholds.model_dump(),
            use_single_threshold=request.surtax_params.use_single_threshold,
        )
        return result
    except Exception as e:
        logger.exception(f"Error calculating aggregate impact: {e}")
        raise HTTPException(status_code=500, detail=str(e))
