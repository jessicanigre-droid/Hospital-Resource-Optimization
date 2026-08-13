import React from 'react';
import { OptimizationResult } from '../lib/supabase';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface ComparisonProps {
  scenarios: Array<{
    name: string;
    result: OptimizationResult;
  }>;
}

interface MetricChange {
  name: string;
  baseline: number;
  current: number;
  unit: string;
  isPositive: boolean;
}

export function Comparison({ scenarios }: ComparisonProps) {
  if (scenarios.length < 2) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-500">
        <p>Add at least 2 scenarios to compare them.</p>
      </div>
    );
  }

  const baseline = scenarios[0].result;
  const metrics: MetricChange[] = scenarios.slice(1).flatMap(scenario => [
    {
      name: 'Doctors',
      baseline: baseline.doctors_assigned,
      current: scenario.result.doctors_assigned,
      unit: 'staff',
      isPositive: scenario.result.doctors_assigned >= baseline.doctors_assigned
    },
    {
      name: 'Nurses',
      baseline: baseline.nurses_assigned,
      current: scenario.result.nurses_assigned,
      unit: 'staff',
      isPositive: scenario.result.nurses_assigned >= baseline.nurses_assigned
    },
    {
      name: 'Avg Wait Time',
      baseline: baseline.avg_waiting_time,
      current: scenario.result.avg_waiting_time,
      unit: 'min',
      isPositive: scenario.result.avg_waiting_time <= baseline.avg_waiting_time
    },
    {
      name: 'Daily Cost',
      baseline: baseline.total_operational_cost,
      current: scenario.result.total_operational_cost,
      unit: '$',
      isPositive: scenario.result.total_operational_cost <= baseline.total_operational_cost
    },
    {
      name: 'Optimization Score',
      baseline: baseline.objective_value,
      current: scenario.result.objective_value,
      unit: '/100',
      isPositive: scenario.result.objective_value >= baseline.objective_value
    }
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Scenario Comparison</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {scenarios.map((scenario, idx) => (
          <div key={idx} className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {idx === 0 ? '📊 Baseline' : `📈 Scenario ${idx}`}: {scenario.name}
            </h3>
            <dl className="space-y-3">
              <ComparisonRow label="Doctors" value={scenario.result.doctors_assigned} unit="staff" />
              <ComparisonRow label="Nurses" value={scenario.result.nurses_assigned} unit="staff" />
              <ComparisonRow label="Beds" value={scenario.result.beds_allocated} unit="beds" />
              <ComparisonRow label="Avg Wait Time" value={scenario.result.avg_waiting_time} unit="min" />
              <ComparisonRow label="Daily Cost" value={`$${scenario.result.total_operational_cost.toLocaleString()}`} />
              <ComparisonRow label="Score" value={scenario.result.objective_value} unit="/100" />
            </dl>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Impact Analysis</h3>
        <div className="space-y-3">
          {scenarios.slice(1).map((scenario, scenarioIdx) => (
            <div key={scenarioIdx} className="border-t border-gray-200 pt-4 first:border-t-0 first:pt-0">
              <h4 className="font-medium text-gray-800 mb-3">vs Baseline: {scenario.name}</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <MetricChangeCard
                  label="Doctors"
                  baseline={baseline.doctors_assigned}
                  current={scenario.result.doctors_assigned}
                  unit="staff"
                  isGood={scenario.result.doctors_assigned >= baseline.doctors_assigned}
                />
                <MetricChangeCard
                  label="Nurses"
                  baseline={baseline.nurses_assigned}
                  current={scenario.result.nurses_assigned}
                  unit="staff"
                  isGood={scenario.result.nurses_assigned >= baseline.nurses_assigned}
                />
                <MetricChangeCard
                  label="Wait Time"
                  baseline={baseline.avg_waiting_time}
                  current={scenario.result.avg_waiting_time}
                  unit="min"
                  isGood={scenario.result.avg_waiting_time <= baseline.avg_waiting_time}
                />
                <MetricChangeCard
                  label="Cost"
                  baseline={baseline.total_operational_cost}
                  current={scenario.result.total_operational_cost}
                  unit="$"
                  isGood={scenario.result.total_operational_cost <= baseline.total_operational_cost}
                />
                <MetricChangeCard
                  label="Bed Use"
                  baseline={baseline.bed_utilization}
                  current={scenario.result.bed_utilization}
                  unit="%"
                  isGood={scenario.result.bed_utilization <= baseline.bed_utilization}
                />
                <MetricChangeCard
                  label="Score"
                  baseline={baseline.objective_value}
                  current={scenario.result.objective_value}
                  unit="/100"
                  isGood={scenario.result.objective_value >= baseline.objective_value}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComparisonRow({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div className="flex justify-between items-center">
      <dt className="text-sm font-medium text-gray-600">{label}</dt>
      <dd className="text-lg font-semibold text-gray-900">
        {typeof value === 'number' && value.toLocaleString()}
        {typeof value === 'string' && value}
        {unit && <span className="text-sm font-normal text-gray-600 ml-1">{unit}</span>}
      </dd>
    </div>
  );
}

function MetricChangeCard({
  label,
  baseline,
  current,
  unit,
  isGood
}: {
  label: string;
  baseline: number;
  current: number;
  unit: string;
  isGood: boolean;
}) {
  const change = current - baseline;
  const percentChange = baseline !== 0 ? ((change / baseline) * 100).toFixed(1) : '0';
  const isIncrease = change > 0;

  return (
    <div className={`rounded-lg p-3 ${isGood ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
      <p className="text-xs font-medium text-gray-600 mb-1">{label}</p>
      <div className="flex items-center gap-1">
        <span className="text-sm font-bold text-gray-900">
          {Math.abs(change).toFixed(unit === '%' ? 1 : 0)}{unit}
        </span>
        {change !== 0 && (
          <div className={`flex items-center gap-0.5 ${isGood ? 'text-green-600' : 'text-red-600'}`}>
            {isIncrease ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            <span className="text-xs font-medium">{percentChange}%</span>
          </div>
        )}
      </div>
    </div>
  );
}
