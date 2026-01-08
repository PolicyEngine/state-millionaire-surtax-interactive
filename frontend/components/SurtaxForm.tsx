'use client';

import {
  StateOption,
  FilingStatus,
  SurtaxParams,
  STATE_LABELS,
  FILING_STATUS_LABELS,
} from '@/lib/types';

interface SurtaxFormProps {
  state: StateOption;
  setState: (state: StateOption) => void;
  filingStatus: FilingStatus;
  setFilingStatus: (status: FilingStatus) => void;
  income: number;
  setIncome: (income: number) => void;
  surtaxParams: SurtaxParams;
  setSurtaxParams: (params: SurtaxParams) => void;
  onCalculate: () => void;
  isLoading: boolean;
}

function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

function parseNumber(str: string): number {
  const cleaned = str.replace(/,/g, '');
  const num = Number(cleaned);
  return isNaN(num) ? 0 : num;
}

export default function SurtaxForm({
  state,
  setState,
  filingStatus,
  setFilingStatus,
  income,
  setIncome,
  surtaxParams,
  setSurtaxParams,
  onCalculate,
  isLoading,
}: SurtaxFormProps) {
  const handleThresholdChange = (
    key: keyof SurtaxParams['thresholds'],
    value: number
  ) => {
    setSurtaxParams({
      ...surtaxParams,
      thresholds: {
        ...surtaxParams.thresholds,
        [key]: value,
      },
    });
  };

  const handleUseSingleThresholdToggle = (checked: boolean) => {
    if (checked) {
      // Set all thresholds to the single threshold value
      const singleValue = surtaxParams.thresholds.single;
      setSurtaxParams({
        ...surtaxParams,
        use_single_threshold: true,
        thresholds: {
          single: singleValue,
          joint: singleValue,
          head_of_household: singleValue,
          separate: singleValue,
          surviving_spouse: singleValue,
        },
      });
    } else {
      setSurtaxParams({
        ...surtaxParams,
        use_single_threshold: false,
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Configure Surtax</h2>

      {/* State Selector */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          State
        </label>
        <select
          value={state}
          onChange={(e) => setState(e.target.value as StateOption)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
        >
          {(Object.keys(STATE_LABELS) as StateOption[]).map((s) => (
            <option key={s} value={s}>
              {STATE_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {/* Filing Status */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Filing Status
        </label>
        <select
          value={filingStatus}
          onChange={(e) => setFilingStatus(e.target.value as FilingStatus)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
        >
          {(Object.keys(FILING_STATUS_LABELS) as FilingStatus[]).map((fs) => (
            <option key={fs} value={fs}>
              {FILING_STATUS_LABELS[fs]}
            </option>
          ))}
        </select>
      </div>

      {/* Income Input */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Annual Income
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
            $
          </span>
          <input
            type="text"
            value={formatNumber(income)}
            onChange={(e) => setIncome(parseNumber(e.target.value))}
            className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Enter your annual {STATE_LABELS[state]} taxable income
        </p>
      </div>

      {/* Divider */}
      <hr className="border-gray-200" />

      {/* Reform Parameters */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Surtax Parameters
        </h3>

        {/* Rate */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Surtax Rate
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={(surtaxParams.rate * 100).toFixed(1)}
              onChange={(e) =>
                setSurtaxParams({
                  ...surtaxParams,
                  rate: parseFloat(e.target.value) / 100,
                })
              }
              min="0"
              max="100"
              step="0.1"
              className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <span className="text-gray-600">%</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Additional tax rate on income above threshold
          </p>
        </div>

        {/* Single Threshold Toggle */}
        <div className="mb-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={surtaxParams.use_single_threshold}
              onChange={(e) => handleUseSingleThresholdToggle(e.target.checked)}
              className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">
              Use single threshold for all filing statuses
            </span>
          </label>
        </div>

        {/* Thresholds */}
        {surtaxParams.use_single_threshold ? (
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Income Threshold
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="text"
                value={formatNumber(surtaxParams.thresholds.single)}
                onChange={(e) => {
                  const value = parseNumber(e.target.value);
                  setSurtaxParams({
                    ...surtaxParams,
                    thresholds: {
                      single: value,
                      joint: value,
                      head_of_household: value,
                      separate: value,
                      surviving_spouse: value,
                    },
                  });
                }}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Surtax applies to income above this amount
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-gray-700">
              Thresholds by Filing Status
            </label>
            {(
              [
                ['single', 'Single'],
                ['joint', 'Married Filing Jointly'],
                ['head_of_household', 'Head of Household'],
                ['separate', 'Married Filing Separately'],
                ['surviving_spouse', 'Surviving Spouse'],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 w-40">{label}</span>
                <div className="relative flex-1 ml-4">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    type="text"
                    value={formatNumber(surtaxParams.thresholds[key])}
                    onChange={(e) =>
                      handleThresholdChange(key, parseNumber(e.target.value))
                    }
                    className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Calculate Button */}
      <button
        onClick={onCalculate}
        disabled={isLoading}
        className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-primary-600 hover:bg-primary-700'
        }`}
      >
        {isLoading ? 'Calculating...' : 'Calculate Impact'}
      </button>

      {/* Preset Buttons */}
      <div className="pt-4 border-t border-gray-200">
        <p className="text-sm font-semibold text-gray-700 mb-3">
          Load Preset:
        </p>
        <div className="space-y-2">
          <button
            onClick={() => {
              setState('NYC');
              setSurtaxParams({
                rate: 0.02,
                thresholds: {
                  single: 1_000_000,
                  joint: 1_000_000,
                  head_of_household: 1_000_000,
                  separate: 1_000_000,
                  surviving_spouse: 1_000_000,
                },
                use_single_threshold: true,
              });
            }}
            className="w-full py-2 px-3 text-sm border border-gray-300 rounded-md hover:bg-gray-50 text-left"
          >
            NYC Mamdani (2% over $1M)
          </button>
          <button
            onClick={() => {
              setState('MI');
              setSurtaxParams({
                rate: 0.05,
                thresholds: {
                  single: 500_000,
                  joint: 1_000_000,
                  head_of_household: 500_000,
                  separate: 500_000,
                  surviving_spouse: 1_000_000,
                },
                use_single_threshold: false,
              });
            }}
            className="w-full py-2 px-3 text-sm border border-gray-300 rounded-md hover:bg-gray-50 text-left"
          >
            Michigan (5% over $500K/$1M)
          </button>
        </div>
      </div>
    </div>
  );
}
