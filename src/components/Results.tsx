import React from 'react';
import { OptimizationResult } from '../lib/supabase';
import { TrendingUp, TrendingDown, Clock, DollarSign, Users, Activity } from 'lucide-react';

interface ResultsProps {
  result: OptimizationResult | null;
  isLoading: boolean;
}

interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  color: 'blue' | 'green' | 'orange' | 'red' | 'purple';
}

function KPICard({ title, value, unit, icon, trend, color }: KPICardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-900',
    green: 'bg-green-50 text-green-900',
    orange: 'bg-orange-50 text-orange-900',
    red: 'bg-red-50 text-red-900',
    purple: 'bg-purple-50 text-purple-900'
  };

  const iconColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    orange: 'text-orange-600',
    red: 'text-red-600',
    purple: 'text-purple-600'
  };

  return (
    <div className={`${colorClasses[color]} rounded-lg p-4 border border-current border-opacity-10`}>
      <div className="flex items-start justify-between mb-2">
        <div className={`${iconColors[color]} p-2 bg-white bg-opacity-50 rounded`}>
          {icon}
        </div>
        {trend && (
          <div className={`text-xs font-semibold ${trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'}`}>
            {trend === 'up' && <TrendingUp className="w-4 h-4" />}
            {trend === 'down' && <TrendingDown className="w-4 h-4" />}
          </div>
        )}
      </div>
      <p className="text-xs font-medium text-opacity-70 mb-1">{title}</p>
      <p className="text-2xl font-bold">
        {value}{unit && <span className="text-lg ml-1">{unit}</span>}
      </p>
    </div>
  );
}

export function Results({ result, isLoading }: ResultsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Optimizing resource allocation...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Run optimization to see results</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Optimal Resource Allocation</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title="Doctors Assigned"
            value={result.doctors_assigned}
            unit="staff"
            icon={<Users className="w-5 h-5" />}
            color="blue"
          />
          <KPICard
            title="Nurses Assigned"
            value={result.nurses_assigned}
            unit="staff"
            icon={<Users className="w-5 h-5" />}
            color="blue"
          />
          <KPICard
            title="Beds Allocated"
            value={result.beds_allocated}
            unit="beds"
            icon={<Activity className="w-5 h-5" />}
            color="green"
          />
          <KPICard
            title="Equipment Deployed"
            value={result.equipment_deployed}
            unit="units"
            icon={<Activity className="w-5 h-5" />}
            color="green"
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Performance Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard
            title="Avg Patient Wait Time"
            value={result.avg_waiting_time}
            unit="min"
            icon={<Clock className="w-5 h-5" />}
            trend={result.avg_waiting_time > 30 ? 'down' : 'up'}
            color="orange"
          />
          <KPICard
            title="Avg Queue Length"
            value={result.avg_queue_length}
            unit="patients"
            icon={<Users className="w-5 h-5" />}
            color="orange"
          />
          <KPICard
            title="Daily Operational Cost"
            value={`$${result.total_operational_cost.toLocaleString()}`}
            icon={<DollarSign className="w-5 h-5" />}
            color="red"
          />
          <KPICard
            title="Optimization Score"
            value={result.objective_value}
            unit="/100"
            icon={<TrendingUp className="w-5 h-5" />}
            trend={result.objective_value > 75 ? 'up' : 'down'}
            color="purple"
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Resource Utilization</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <UtilizationBar label="Doctor Utilization" value={result.doctor_utilization} />
          <UtilizationBar label="Nurse Utilization" value={result.nurse_utilization} />
          <UtilizationBar label="Bed Utilization" value={result.bed_utilization} />
          <UtilizationBar label="Equipment Utilization" value={result.equipment_utilization} />
        </div>
      </div>
    </div>
  );
}

function UtilizationBar({ label, value }: { label: string; value: number }) {
  const getColor = (val: number) => {
    if (val < 50) return 'bg-green-500';
    if (val < 75) return 'bg-yellow-500';
    if (val < 90) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <p className="text-xs font-medium text-gray-600 mb-2">{label}</p>
      <div className="w-full bg-gray-200 rounded-full h-2 mb-2 overflow-hidden">
        <div
          className={`h-full ${getColor(value)} rounded-full transition-all`}
          style={{ width: `${Math.min(100, value)}%` }}
        />
      </div>
      <p className="text-lg font-bold text-gray-900">{value.toFixed(1)}%</p>
    </div>
  );
}
