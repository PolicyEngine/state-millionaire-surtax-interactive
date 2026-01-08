from pydantic import BaseModel
from typing import List, Optional


class BenefitAtIncome(BaseModel):
    baseline_net_income: float
    reform_net_income: float
    surtax_amount: float
    effective_rate_change: float


class HouseholdImpactResponse(BaseModel):
    income_range: List[float]
    net_income_baseline: List[float]
    net_income_reform: List[float]
    surtax_amount_range: List[float]
    benefit_at_income: BenefitAtIncome
    x_axis_max: float


class IncomeBracketImpact(BaseModel):
    bracket: str
    avg_tax_increase: float
    percent_affected: float
    total_revenue: float


class AggregateImpactResponse(BaseModel):
    total_revenue: float
    households_affected: int
    percent_affected: float
    average_tax_increase: float
    by_income_bracket: List[IncomeBracketImpact]


class HealthResponse(BaseModel):
    status: str
    version: str
