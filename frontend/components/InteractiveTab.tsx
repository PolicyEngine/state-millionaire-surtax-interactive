'use client';

import { useState, useMemo } from 'react';
import {
  StateOption,
  FilingStatus,
  SurtaxParams,
  STATE_LABELS,
  FILING_STATUS_LABELS,
  DEFAULT_SURTAX_PARAMS,
} from '@/lib/types';
import { useHouseholdImpact } from '@/hooks/useHouseholdImpact';
import SurtaxForm from './SurtaxForm';
import ImpactChart from './ImpactChart';

export default function InteractiveTab() {
  // Form state
  const [state, setState] = useState<StateOption>('MI');
  const [filingStatus, setFilingStatus] = useState<FilingStatus>('SINGLE');
  const [income, setIncome] = useState<number>(1_500_000);
  const [surtaxParams, setSurtaxParams] = useState<SurtaxParams>({
    ...DEFAULT_SURTAX_PARAMS,
    thresholds: {
      ...DEFAULT_SURTAX_PARAMS.thresholds,
      single: 1_000_000,
      joint: 1_000_000,
      head_of_household: 1_000_000,
      separate: 1_000_000,
      surviving_spouse: 1_000_000,
    },
  });

  // Track if calculation has been triggered
  const [calculationTriggered, setCalculationTriggered] = useState(false);

  // Build request
  const request = useMemo(
    () => ({
      state,
      filing_status: filingStatus,
      income,
      surtax_params: surtaxParams,
    }),
    [state, filingStatus, income, surtaxParams]
  );

  // Fetch data
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useHouseholdImpact(request, calculationTriggered);

  const handleCalculate = () => {
    setCalculationTriggered(true);
    if (calculationTriggered) {
      refetch();
    }
  };

  // Calculate simple estimate for preview (client-side)
  const simpleEstimate = useMemo(() => {
    const threshold = surtaxParams.use_single_threshold
      ? surtaxParams.thresholds.single
      : surtaxParams.thresholds[filingStatus.toLowerCase() as keyof typeof surtaxParams.thresholds];

    if (income <= threshold) {
      return { surtax: 0, effectiveRate: 0 };
    }

    const surtax = (income - threshold) * surtaxParams.rate;
    const effectiveRate = (surtax / income) * 100;

    return { surtax, effectiveRate };
  }, [income, filingStatus, surtaxParams]);

  return (
    <div className="flex flex-col lg:flex-row min-h-[calc(100vh-200px)]">
      {/* Left Sidebar - Inputs */}
      <div className="lg:w-1/3 xl:w-1/4 bg-gray-50 border-r border-gray-200 p-6">
        <div className="sticky top-4">
          <SurtaxForm
            state={state}
            setState={setState}
            filingStatus={filingStatus}
            setFilingStatus={setFilingStatus}
            income={income}
            setIncome={setIncome}
            surtaxParams={surtaxParams}
            setSurtaxParams={setSurtaxParams}
            onCalculate={handleCalculate}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Right Side - Output */}
      <div className="lg:w-2/3 xl:w-3/4 p-6">
        {/* Quick Preview (always visible) */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Estimate
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-primary-50 rounded-lg p-4 border border-primary-200">
              <p className="text-sm text-gray-600 mb-1">Additional Surtax</p>
              <p className="text-2xl font-bold text-primary-700">
                ${simpleEstimate.surtax.toLocaleString('en-US', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </p>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Effective Surtax Rate</p>
              <p className="text-2xl font-bold text-gray-700">
                {simpleEstimate.effectiveRate.toFixed(2)}%
              </p>
            </div>
            <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Threshold</p>
              <p className="text-2xl font-bold text-gray-700">
                $
                {(surtaxParams.use_single_threshold
                  ? surtaxParams.thresholds.single
                  : surtaxParams.thresholds[
                      filingStatus.toLowerCase() as keyof typeof surtaxParams.thresholds
                    ]
                ).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <h3 className="text-red-800 font-semibold mb-2">
              Calculation Error
            </h3>
            <p className="text-red-700">{(error as Error).message}</p>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary-500 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">
              Calculating impact across income range...
            </p>
          </div>
        )}

        {/* Results */}
        {data && !isLoading && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Net Income Impact
            </h3>
            <ImpactChart data={data} income={income} state={state} />

            {/* Detailed Results */}
            <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
              <h4 className="font-semibold text-gray-900 mb-4">
                At Your Income (${income.toLocaleString()})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Baseline Net Income</p>
                  <p className="text-lg font-semibold text-gray-900">
                    $
                    {data.benefit_at_income.baseline_net_income.toLocaleString(
                      'en-US',
                      { maximumFractionDigits: 0 }
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    Net Income with Surtax
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    $
                    {data.benefit_at_income.reform_net_income.toLocaleString(
                      'en-US',
                      { maximumFractionDigits: 0 }
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Surtax Amount</p>
                  <p className="text-lg font-semibold text-red-600">
                    -$
                    {data.benefit_at_income.surtax_amount.toLocaleString(
                      'en-US',
                      { maximumFractionDigits: 0 }
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Effective Rate Change</p>
                  <p className="text-lg font-semibold text-gray-900">
                    +{(data.benefit_at_income.effective_rate_change * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Placeholder when not calculated */}
        {!calculationTriggered && !isLoading && (
          <div className="bg-gray-100 rounded-lg p-12 text-center">
            <p className="text-gray-500 text-lg">
              Click &ldquo;Calculate Impact&rdquo; to see detailed results with
              PolicyEngine simulations.
            </p>
            <p className="text-gray-400 text-sm mt-2">
              The quick estimate above is calculated client-side. Full
              calculations account for state tax interactions.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
