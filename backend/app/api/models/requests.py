from pydantic import BaseModel, Field
from typing import Literal
from enum import Enum


class StateOption(str, Enum):
    NYC = "NYC"
    MI = "MI"
    RI = "RI"
    HI = "HI"


class FilingStatus(str, Enum):
    SINGLE = "SINGLE"
    JOINT = "JOINT"
    HEAD_OF_HOUSEHOLD = "HEAD_OF_HOUSEHOLD"
    SEPARATE = "SEPARATE"
    SURVIVING_SPOUSE = "SURVIVING_SPOUSE"


class SurtaxThresholds(BaseModel):
    single: float = Field(1_000_000, ge=0)
    joint: float = Field(1_000_000, ge=0)
    head_of_household: float = Field(1_000_000, ge=0)
    separate: float = Field(1_000_000, ge=0)
    surviving_spouse: float = Field(1_000_000, ge=0)


class SurtaxParams(BaseModel):
    rate: float = Field(0.05, ge=0, le=1.0)
    thresholds: SurtaxThresholds
    use_single_threshold: bool = True


class HouseholdRequest(BaseModel):
    state: StateOption
    filing_status: FilingStatus
    income: float = Field(..., ge=0)
    surtax_params: SurtaxParams


class AggregateRequest(BaseModel):
    state: StateOption
    surtax_params: SurtaxParams
