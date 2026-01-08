"""
Calculator service for millionaire surtax simulations.
Uses PolicyEngine US for accurate tax calculations.
"""

import numpy as np
from typing import Dict, List, Any
from policyengine_us import Simulation
from policyengine_core.model_api import Reform, Variable
from policyengine_us.model_api import YEAR, TaxUnit, USD
import logging

logger = logging.getLogger(__name__)

# State codes mapping
STATE_CODES = {
    "NYC": "NY",  # NYC uses NY state code
    "MI": "MI",
    "RI": "RI",
    "HI": "HI",
}

# State taxable income variable names
STATE_TAXABLE_INCOME_VARS = {
    "NYC": "nyc_taxable_income",
    "MI": "mi_taxable_income",
    "RI": "ri_taxable_income",
    "HI": "hi_taxable_income",
}

# Filing status mapping to PolicyEngine
FILING_STATUS_MAP = {
    "SINGLE": "SINGLE",
    "JOINT": "JOINT",
    "HEAD_OF_HOUSEHOLD": "HEAD_OF_HOUSEHOLD",
    "SEPARATE": "SEPARATE",
    "SURVIVING_SPOUSE": "SURVIVING_SPOUSE",
}


def create_surtax_reform(
    state: str,
    surtax_rate: float,
    thresholds: Dict[str, float],
    use_single_threshold: bool,
) -> Reform:
    """
    Create a dynamic reform for the millionaire surtax.
    """
    taxable_income_var = STATE_TAXABLE_INCOME_VARS[state]
    state_code = STATE_CODES[state]

    class surtax(Variable):
        value_type = float
        entity = TaxUnit
        label = f"{state} millionaire surtax"
        unit = USD
        definition_period = YEAR

        def formula(tax_unit, period, parameters):
            # Get state taxable income
            if state == "NYC":
                taxable_income = tax_unit("nyc_taxable_income", period)
            else:
                taxable_income = tax_unit(taxable_income_var, period)

            # Determine threshold based on filing status
            if use_single_threshold:
                threshold = thresholds["single"]
            else:
                joint = tax_unit("tax_unit_is_joint", period)
                # Use where to select threshold
                threshold = np.where(
                    joint, thresholds["joint"], thresholds["single"]
                )

            # Calculate surtax
            excess_income = np.maximum(taxable_income - threshold, 0)
            return excess_income * surtax_rate

    class reform(Reform):
        def apply(self):
            self.add_variable(surtax)

    return reform


def build_household_situation(
    state: str,
    filing_status: str,
    year: int = 2026,
    income_range: List[float] = None,
) -> Dict[str, Any]:
    """
    Build a household situation for PolicyEngine simulation.
    Uses axes for income sweep.
    """
    state_code = STATE_CODES[state]
    is_married = filing_status in ["JOINT", "SEPARATE", "SURVIVING_SPOUSE"]

    if income_range is None:
        # Default: 0 to 5M in 100 steps
        income_range = list(np.linspace(0, 5_000_000, 101))

    # Build the situation
    people = {
        "adult": {
            "age": {year: 40},
            "employment_income": {year: income_range[0]},
        }
    }

    if is_married:
        people["spouse"] = {
            "age": {year: 40},
            "employment_income": {year: 0},
        }

    tax_unit_members = ["adult", "spouse"] if is_married else ["adult"]

    situation = {
        "people": people,
        "tax_units": {
            "tax_unit": {
                "members": tax_unit_members,
                "filing_status": {year: filing_status},
            }
        },
        "families": {"family": {"members": tax_unit_members}},
        "spm_units": {"spm_unit": {"members": tax_unit_members}},
        "households": {
            "household": {
                "members": tax_unit_members,
                "state_code": {year: state_code},
            }
        },
        # Add axes for income sweep
        "axes": [
            [
                {
                    "name": "employment_income",
                    "period": year,
                    "min": 0,
                    "max": 5_000_000,
                    "count": 101,
                }
            ]
        ],
    }

    # For NYC, need to indicate in_nyc
    if state == "NYC":
        situation["households"]["household"]["in_nyc"] = {year: True}

    return situation


async def calculate_household_impact(
    state: str,
    filing_status: str,
    income: float,
    surtax_rate: float,
    thresholds: Dict[str, float],
    use_single_threshold: bool,
) -> Dict[str, Any]:
    """
    Calculate household surtax impact across income range.
    """
    year = 2026

    # Build situation with income axes
    situation = build_household_situation(
        state=state,
        filing_status=filing_status,
        year=year,
    )

    # Create reform
    reform_class = create_surtax_reform(
        state=state,
        surtax_rate=surtax_rate,
        thresholds=thresholds,
        use_single_threshold=use_single_threshold,
    )

    # Run baseline simulation
    sim_baseline = Simulation(situation=situation)

    # Run reform simulation
    sim_reform = Simulation(situation=situation, reform=reform_class)

    # Get income range
    income_range = sim_baseline.calculate(
        "employment_income", map_to="household", period=year
    ).tolist()

    # Get net income (baseline and reform)
    net_income_baseline = sim_baseline.calculate(
        "household_net_income", map_to="household", period=year
    ).tolist()

    net_income_reform = sim_reform.calculate(
        "household_net_income", map_to="household", period=year
    ).tolist()

    # Calculate surtax amount
    surtax_amount_range = sim_reform.calculate(
        "surtax", map_to="tax_unit", period=year
    ).tolist()

    # Find the index closest to the specified income
    income_array = np.array(income_range)
    idx = np.argmin(np.abs(income_array - income))

    # Calculate benefit at specified income
    baseline_at_income = net_income_baseline[idx]
    reform_at_income = net_income_reform[idx]
    surtax_at_income = surtax_amount_range[idx]

    effective_rate_change = surtax_at_income / income if income > 0 else 0

    return {
        "income_range": income_range,
        "net_income_baseline": net_income_baseline,
        "net_income_reform": net_income_reform,
        "surtax_amount_range": surtax_amount_range,
        "benefit_at_income": {
            "baseline_net_income": baseline_at_income,
            "reform_net_income": reform_at_income,
            "surtax_amount": surtax_at_income,
            "effective_rate_change": effective_rate_change,
        },
        "x_axis_max": 5_000_000,
    }


async def calculate_aggregate_impact(
    state: str,
    surtax_rate: float,
    thresholds: Dict[str, float],
    use_single_threshold: bool,
) -> Dict[str, Any]:
    """
    Calculate statewide aggregate surtax impact.
    Note: This requires state microdata which may not be available.
    Returns placeholder data for now.
    """
    # Placeholder - would need state microdata
    # For now, return estimated data based on state population and income distribution
    logger.warning(
        f"Aggregate calculations for {state} using placeholder data. "
        "Full microsimulation requires state-specific microdata."
    )

    # Estimated values (these would come from actual microsimulation)
    state_estimates = {
        "NYC": {
            "total_revenue": 2_500_000_000,
            "households_affected": 35_000,
            "percent_affected": 0.8,
            "average_tax_increase": 71_428,
        },
        "MI": {
            "total_revenue": 800_000_000,
            "households_affected": 25_000,
            "percent_affected": 0.5,
            "average_tax_increase": 32_000,
        },
        "RI": {
            "total_revenue": 150_000_000,
            "households_affected": 5_000,
            "percent_affected": 1.0,
            "average_tax_increase": 30_000,
        },
        "HI": {
            "total_revenue": 250_000_000,
            "households_affected": 8_000,
            "percent_affected": 1.2,
            "average_tax_increase": 31_250,
        },
    }

    estimates = state_estimates.get(state, state_estimates["MI"])

    # Scale by rate difference from default (5%)
    rate_multiplier = surtax_rate / 0.05
    threshold_factor = 1_000_000 / thresholds["single"]

    return {
        "total_revenue": estimates["total_revenue"]
        * rate_multiplier
        * threshold_factor,
        "households_affected": int(
            estimates["households_affected"] * threshold_factor
        ),
        "percent_affected": estimates["percent_affected"] * threshold_factor,
        "average_tax_increase": estimates["average_tax_increase"]
        * rate_multiplier,
        "by_income_bracket": [
            {
                "bracket": "$500K-$1M",
                "avg_tax_increase": 10_000 * rate_multiplier,
                "percent_affected": 5.0 * threshold_factor,
                "total_revenue": 50_000_000 * rate_multiplier * threshold_factor,
            },
            {
                "bracket": "$1M-$2M",
                "avg_tax_increase": 40_000 * rate_multiplier,
                "percent_affected": 80.0,
                "total_revenue": 200_000_000 * rate_multiplier,
            },
            {
                "bracket": "$2M-$5M",
                "avg_tax_increase": 100_000 * rate_multiplier,
                "percent_affected": 100.0,
                "total_revenue": 300_000_000 * rate_multiplier,
            },
            {
                "bracket": "$5M+",
                "avg_tax_increase": 500_000 * rate_multiplier,
                "percent_affected": 100.0,
                "total_revenue": 500_000_000 * rate_multiplier,
            },
        ],
    }
