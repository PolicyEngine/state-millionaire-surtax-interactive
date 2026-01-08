// State options for the calculator
export type StateOption = 'NYC' | 'MI' | 'RI' | 'HI';

export const STATE_LABELS: Record<StateOption, string> = {
  NYC: 'New York City',
  MI: 'Michigan',
  RI: 'Rhode Island',
  HI: 'Hawaii',
};

export const STATE_TAXABLE_INCOME_VARS: Record<StateOption, string> = {
  NYC: 'nyc_taxable_income',
  MI: 'mi_taxable_income',
  RI: 'ri_taxable_income',
  HI: 'hi_taxable_income',
};

// Filing status options
export type FilingStatus = 'SINGLE' | 'JOINT' | 'HEAD_OF_HOUSEHOLD' | 'SEPARATE' | 'SURVIVING_SPOUSE';

export const FILING_STATUS_LABELS: Record<FilingStatus, string> = {
  SINGLE: 'Single',
  JOINT: 'Married Filing Jointly',
  HEAD_OF_HOUSEHOLD: 'Head of Household',
  SEPARATE: 'Married Filing Separately',
  SURVIVING_SPOUSE: 'Qualifying Surviving Spouse',
};

// Reform parameters for surtax
export interface SurtaxParams {
  rate: number; // e.g., 0.05 for 5%
  thresholds: {
    single: number;
    joint: number;
    head_of_household: number;
    separate: number;
    surviving_spouse: number;
  };
  use_single_threshold: boolean; // if true, use single threshold for all
}

// Request models
export interface HouseholdRequest {
  state: StateOption;
  filing_status: FilingStatus;
  income: number;
  surtax_params: SurtaxParams;
}

export interface AggregateRequest {
  state: StateOption;
  surtax_params: SurtaxParams;
}

// Response models
export interface HouseholdImpactResponse {
  income_range: number[];
  net_income_baseline: number[];
  net_income_reform: number[];
  surtax_amount_range: number[];
  benefit_at_income: {
    baseline_net_income: number;
    reform_net_income: number;
    surtax_amount: number;
    effective_rate_change: number;
  };
  x_axis_max: number;
}

export interface AggregateImpactResponse {
  total_revenue: number;
  households_affected: number;
  percent_affected: number;
  average_tax_increase: number;
  by_income_bracket: {
    bracket: string;
    avg_tax_increase: number;
    percent_affected: number;
    total_revenue: number;
  }[];
}

export interface HealthResponse {
  status: string;
  version: string;
}

// Default surtax parameters
export const DEFAULT_SURTAX_PARAMS: SurtaxParams = {
  rate: 0.05, // 5%
  thresholds: {
    single: 500_000,
    joint: 1_000_000,
    head_of_household: 500_000,
    separate: 500_000,
    surviving_spouse: 1_000_000,
  },
  use_single_threshold: true, // default to single threshold of $1M
};

// Pre-computed examples for story
export interface PrecomputedExample {
  state: StateOption;
  name: string;
  description: string;
  rate: number;
  threshold_single: number;
  threshold_joint: number;
  example_incomes: number[];
  example_taxes: number[];
  revenue_estimate?: number;
}

export const PRECOMPUTED_EXAMPLES: PrecomputedExample[] = [
  {
    state: 'NYC',
    name: 'NYC Mamdani Proposal',
    description: 'A 2% surtax on income over $1 million for NYC residents',
    rate: 0.02,
    threshold_single: 1_000_000,
    threshold_joint: 1_000_000,
    example_incomes: [500_000, 1_000_000, 2_000_000, 5_000_000, 10_000_000],
    example_taxes: [0, 0, 20_000, 80_000, 180_000],
  },
  {
    state: 'MI',
    name: 'Michigan Invest in Our Kids Initiative',
    description: 'A 5% surtax on income over $500k (single) / $1M (joint)',
    rate: 0.05,
    threshold_single: 500_000,
    threshold_joint: 1_000_000,
    example_incomes: [500_000, 1_000_000, 2_000_000, 5_000_000, 10_000_000],
    example_taxes: [0, 25_000, 75_000, 225_000, 475_000], // single filer
  },
];
