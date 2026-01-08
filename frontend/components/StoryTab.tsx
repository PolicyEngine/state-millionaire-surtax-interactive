'use client';

import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
  Cell,
} from 'recharts';
import { PRECOMPUTED_EXAMPLES } from '@/lib/types';

interface ScrollSectionProps {
  children: React.ReactNode;
  delay?: number;
}

function ScrollSection({ children, delay = 0 }: ScrollSectionProps) {
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay }}
      className="mb-16"
    >
      {children}
    </motion.div>
  );
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toLocaleString()}`;
}

export default function StoryTab() {
  // Generate chart data for NYC example
  const nycExample = PRECOMPUTED_EXAMPLES.find((e) => e.state === 'NYC')!;
  const nycChartData = Array.from({ length: 51 }, (_, i) => {
    const income = i * 200_000;
    const threshold = nycExample.threshold_single;
    const surtax =
      income > threshold ? (income - threshold) * nycExample.rate : 0;
    return {
      income,
      surtax,
    };
  });

  // Generate chart data for MI example
  const miExample = PRECOMPUTED_EXAMPLES.find((e) => e.state === 'MI')!;
  const miChartData = Array.from({ length: 51 }, (_, i) => {
    const income = i * 200_000;
    const threshold = miExample.threshold_single;
    const surtax =
      income > threshold ? (income - threshold) * miExample.rate : 0;
    return {
      income,
      surtax,
    };
  });

  // Comparison data
  const comparisonData = [
    { state: 'MA (Enacted)', rate: 4, threshold: 1_000_000 },
    { state: 'Michigan', rate: 5, threshold: 500_000 },
    { state: 'NYC', rate: 2, threshold: 1_000_000 },
  ];

  return (
    <div className="px-4 py-12 max-w-4xl mx-auto">
      {/* Hero Section */}
      <ScrollSection>
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            The Rise of Millionaire Surtaxes
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            States across America are considering additional taxes on
            high-income earners. Here&apos;s what you need to know.
          </p>
        </div>
      </ScrollSection>

      {/* The Landscape */}
      <ScrollSection delay={0.1}>
        <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            The Current Landscape
          </h3>
          <p className="text-gray-700 mb-6">
            Massachusetts became the first state in decades to enact a
            millionaire surtax when voters approved a{' '}
            <strong>4% additional tax</strong> on income over $1 million in
            2022. Now, several other states are considering similar measures:
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">🗽</span>
                <span className="font-semibold text-gray-900">
                  New York City
                </span>
              </div>
              <p className="text-sm text-gray-600">
                The Mamdani proposal would add a 2% surtax on income over $1
                million for NYC residents.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">🚗</span>
                <span className="font-semibold text-gray-900">Michigan</span>
              </div>
              <p className="text-sm text-gray-600">
                The &ldquo;Invest in Our Kids&rdquo; ballot initiative proposes
                a 5% surtax on income over $500K (single) / $1M (joint).
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">🌊</span>
                <span className="font-semibold text-gray-900">Rhode Island</span>
              </div>
              <p className="text-sm text-gray-600">
                Proposals are being considered to add a millionaire surtax to
                fund education and infrastructure.
              </p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-2xl">🌺</span>
                <span className="font-semibold text-gray-900">Hawaii</span>
              </div>
              <p className="text-sm text-gray-600">
                Legislators have proposed additional taxes on high earners to
                address housing and cost-of-living concerns.
              </p>
            </div>
          </div>
        </div>
      </ScrollSection>

      {/* NYC Deep Dive */}
      <ScrollSection delay={0.1}>
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            NYC: The Mamdani Proposal
          </h3>
          <p className="text-gray-700 mb-6">
            New York City Council Member Zohran Mamdani has proposed a{' '}
            <strong>2% surtax</strong> on taxable income exceeding $1 million.
            This would apply to NYC residents on top of existing city, state,
            and federal taxes.
          </p>
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-4">
              How the NYC Surtax Would Work
            </h4>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={nycChartData} margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="income"
                  tickFormatter={formatCurrency}
                  stroke="#666"
                />
                <YAxis tickFormatter={formatCurrency} stroke="#666" width={80} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(value: number) =>
                    `Income: ${formatCurrency(value)}`
                  }
                />
                <ReferenceLine
                  x={1_000_000}
                  stroke="#EF4444"
                  strokeDasharray="5 5"
                  label={{ value: '$1M Threshold', fill: '#EF4444', fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="surtax"
                  stroke="#319795"
                  strokeWidth={3}
                  name="Additional Surtax"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-500 mt-4 text-center">
              Surtax amount based on taxable income. A person earning $2M would
              pay an additional $20,000.
            </p>
          </div>
        </div>
      </ScrollSection>

      {/* Michigan Deep Dive */}
      <ScrollSection delay={0.1}>
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Michigan: Invest in Our Kids
          </h3>
          <p className="text-gray-700 mb-6">
            The proposed ballot initiative would add a <strong>5% surtax</strong>{' '}
            on income over $500,000 for single filers and $1 million for joint
            filers. This is one of the most aggressive proposals currently being
            considered.
          </p>
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h4 className="font-semibold text-gray-900 mb-4">
              How the Michigan Surtax Would Work (Single Filer)
            </h4>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={miChartData} margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis
                  dataKey="income"
                  tickFormatter={formatCurrency}
                  stroke="#666"
                />
                <YAxis tickFormatter={formatCurrency} stroke="#666" width={80} />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(value: number) =>
                    `Income: ${formatCurrency(value)}`
                  }
                />
                <ReferenceLine
                  x={500_000}
                  stroke="#EF4444"
                  strokeDasharray="5 5"
                  label={{ value: '$500K Threshold', fill: '#EF4444', fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="surtax"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  name="Additional Surtax"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-sm text-gray-500 mt-4 text-center">
              Single filer surtax. A person earning $1M would pay an additional
              $25,000 in Michigan taxes.
            </p>
          </div>
        </div>
      </ScrollSection>

      {/* Comparison Chart */}
      <ScrollSection delay={0.1}>
        <div className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            How Do They Compare?
          </h3>
          <p className="text-gray-700 mb-6">
            Different states have proposed different rates and thresholds. Here&apos;s
            how the major proposals stack up:
          </p>
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData} margin={{ left: 20, right: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="state" stroke="#666" />
                <YAxis
                  label={{
                    value: 'Surtax Rate (%)',
                    angle: -90,
                    position: 'insideLeft',
                  }}
                  stroke="#666"
                />
                <Tooltip formatter={(value: number) => `${value}%`} />
                <Bar dataKey="rate" name="Surtax Rate">
                  {comparisonData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        entry.state.includes('Enacted') ? '#10B981' : '#319795'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Table */}
          <div className="mt-8 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold">
                    State
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold">
                    Rate
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold">
                    Threshold (Single)
                  </th>
                  <th className="border border-gray-200 px-4 py-3 text-left font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 px-4 py-3">
                    Massachusetts
                  </td>
                  <td className="border border-gray-200 px-4 py-3">4%</td>
                  <td className="border border-gray-200 px-4 py-3">
                    $1,000,000
                  </td>
                  <td className="border border-gray-200 px-4 py-3">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                      Enacted
                    </span>
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-200 px-4 py-3">Michigan</td>
                  <td className="border border-gray-200 px-4 py-3">5%</td>
                  <td className="border border-gray-200 px-4 py-3">$500,000</td>
                  <td className="border border-gray-200 px-4 py-3">
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-sm">
                      Proposed Ballot
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="border border-gray-200 px-4 py-3">
                    New York City
                  </td>
                  <td className="border border-gray-200 px-4 py-3">2%</td>
                  <td className="border border-gray-200 px-4 py-3">
                    $1,000,000
                  </td>
                  <td className="border border-gray-200 px-4 py-3">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      Proposed
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </ScrollSection>

      {/* Call to Action */}
      <ScrollSection delay={0.1}>
        <div className="bg-primary-600 text-white rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">
            See How It Could Affect You
          </h3>
          <p className="mb-6 text-primary-100">
            Use our interactive calculator to model different surtax scenarios
            and see the impact on your taxes.
          </p>
          <button
            onClick={() => {
              const interactiveTab = document.querySelector(
                'button[class*="Interactive"]'
              );
              if (interactiveTab) {
                (interactiveTab as HTMLButtonElement).click();
              }
            }}
            className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
          >
            Try the Calculator
          </button>
        </div>
      </ScrollSection>
    </div>
  );
}
