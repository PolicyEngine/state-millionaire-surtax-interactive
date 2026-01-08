'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart,
} from 'recharts';
import { HouseholdImpactResponse, StateOption, STATE_LABELS } from '@/lib/types';

interface ImpactChartProps {
  data: HouseholdImpactResponse;
  income: number;
  state: StateOption;
}

function formatCurrency(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

function formatCurrencyFull(value: number): string {
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export default function ImpactChart({ data, income, state }: ImpactChartProps) {
  // Transform data for chart
  const chartData = data.income_range.map((inc, i) => ({
    income: inc,
    baseline: data.net_income_baseline[i],
    reform: data.net_income_reform[i],
    surtax: data.surtax_amount_range[i],
    difference: data.net_income_reform[i] - data.net_income_baseline[i],
  }));

  // Filter to x_axis_max
  const filteredData = chartData.filter((d) => d.income <= data.x_axis_max);

  return (
    <div className="space-y-8">
      {/* Net Income Comparison Chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h4 className="font-semibold text-gray-900 mb-4">
          Net Income: Baseline vs. With Surtax
        </h4>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={filteredData}
            margin={{ left: 20, right: 20, top: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="income"
              tickFormatter={formatCurrency}
              stroke="#666"
              label={{
                value: `${STATE_LABELS[state]} Taxable Income`,
                position: 'insideBottom',
                offset: -5,
              }}
            />
            <YAxis
              tickFormatter={formatCurrency}
              stroke="#666"
              width={80}
              label={{
                value: 'Net Income',
                angle: -90,
                position: 'insideLeft',
              }}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                formatCurrencyFull(value),
                name,
              ]}
              labelFormatter={(value: number) =>
                `Income: ${formatCurrencyFull(value)}`
              }
            />
            <Legend />
            <ReferenceLine
              x={income}
              stroke="#9333ea"
              strokeDasharray="5 5"
              label={{
                value: 'Your Income',
                fill: '#9333ea',
                fontSize: 11,
              }}
            />
            <Line
              type="monotone"
              dataKey="baseline"
              stroke="#64748B"
              strokeWidth={2}
              name="Baseline Net Income"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="reform"
              stroke="#319795"
              strokeWidth={2}
              name="Net Income with Surtax"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Surtax Amount Chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h4 className="font-semibold text-gray-900 mb-4">
          Surtax Amount by Income
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart
            data={filteredData}
            margin={{ left: 20, right: 20, top: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="income"
              tickFormatter={formatCurrency}
              stroke="#666"
              label={{
                value: `${STATE_LABELS[state]} Taxable Income`,
                position: 'insideBottom',
                offset: -5,
              }}
            />
            <YAxis
              tickFormatter={formatCurrency}
              stroke="#666"
              width={80}
              label={{
                value: 'Surtax Amount',
                angle: -90,
                position: 'insideLeft',
              }}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrencyFull(value), 'Surtax']}
              labelFormatter={(value: number) =>
                `Income: ${formatCurrencyFull(value)}`
              }
            />
            <ReferenceLine
              x={income}
              stroke="#9333ea"
              strokeDasharray="5 5"
            />
            <ReferenceLine y={0} stroke="#666" />
            <Area
              type="monotone"
              dataKey="surtax"
              fill="#EF4444"
              fillOpacity={0.2}
              stroke="#EF4444"
              strokeWidth={2}
              name="Surtax Amount"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Change in Net Income Chart */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h4 className="font-semibold text-gray-900 mb-4">
          Change in Net Income (Negative = Tax Increase)
        </h4>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart
            data={filteredData}
            margin={{ left: 20, right: 20, top: 5, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="income"
              tickFormatter={formatCurrency}
              stroke="#666"
            />
            <YAxis
              tickFormatter={formatCurrency}
              stroke="#666"
              width={80}
            />
            <Tooltip
              formatter={(value: number) => [
                formatCurrencyFull(value),
                'Change in Net Income',
              ]}
              labelFormatter={(value: number) =>
                `Income: ${formatCurrencyFull(value)}`
              }
            />
            <ReferenceLine y={0} stroke="#666" strokeWidth={2} />
            <ReferenceLine
              x={income}
              stroke="#9333ea"
              strokeDasharray="5 5"
            />
            <Area
              type="monotone"
              dataKey="difference"
              fill="#EF4444"
              fillOpacity={0.3}
              stroke="#EF4444"
              strokeWidth={2}
              name="Change in Net Income"
            />
          </ComposedChart>
        </ResponsiveContainer>
        <p className="text-sm text-gray-500 mt-4 text-center">
          The area shows how much less net income you would have with the surtax
          at each income level.
        </p>
      </div>
    </div>
  );
}
