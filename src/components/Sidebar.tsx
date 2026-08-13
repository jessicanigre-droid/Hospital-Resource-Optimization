import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Scenario } from '../lib/supabase';

interface SidebarProps {
  scenario: Scenario | null;
  onScenarioChange: (updates: Partial<Scenario>) => void;
  onOptimize: () => void;
  isOptimizing: boolean;
  scenarios: Scenario[];
  onLoadScenario: (scenario: Scenario) => void;
}

export function Sidebar({
  scenario,
  onScenarioChange,
  onOptimize,
  isOptimizing,
  scenarios,
  onLoadScenario
}: SidebarProps) {
  if (!scenario) return null;

  return (
    <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-6 border-b border-gray-200 sticky top-0 bg-white">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Hospital Dashboard</h1>
        <p className="text-sm text-gray-600">Resource Allocation Optimizer</p>
      </div>

      <div className="p-6 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Load Saved Scenario</label>
          <select
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            onChange={(e) => {
              const selected = scenarios.find(s => s.id === e.target.value);
              if (selected) onLoadScenario(selected);
            }}
          >
            <option value="">Recent Scenarios</option>
            {scenarios.slice(0, 10).map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Scenario Name</label>
          <input
            type="text"
            value={scenario.name}
            onChange={(e) => onScenarioChange({ name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Winter Outbreak"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">Demand Level</label>
          <select
            value={scenario.demand_level}
            onChange={(e) => onScenarioChange({ demand_level: e.target.value as 'low' | 'medium' | 'high' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="low">Low Demand (30/day)</option>
            <option value="medium">Medium Demand (75/day)</option>
            <option value="high">High Demand (150/day)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Daily Patient Arrival Rate
          </label>
          <input
            type="range"
            min="10"
            max="300"
            step="5"
            value={scenario.patient_arrival_rate}
            onChange={(e) => onScenarioChange({ patient_arrival_rate: parseFloat(e.target.value) })}
            className="w-full"
          />
          <div className="mt-2 text-sm text-gray-600">{scenario.patient_arrival_rate} patients/day</div>
        </div>

        <hr className="border-gray-200" />

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Available Resources</h3>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Doctors</label>
            <input
              type="range"
              min="2"
              max="50"
              step="1"
              value={scenario.num_doctors}
              onChange={(e) => onScenarioChange({ num_doctors: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="mt-1 text-xs text-gray-600">{scenario.num_doctors} doctors</div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Nurses</label>
            <input
              type="range"
              min="5"
              max="100"
              step="1"
              value={scenario.num_nurses}
              onChange={(e) => onScenarioChange({ num_nurses: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="mt-1 text-xs text-gray-600">{scenario.num_nurses} nurses</div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Hospital Beds</label>
            <input
              type="range"
              min="20"
              max="500"
              step="5"
              value={scenario.num_beds}
              onChange={(e) => onScenarioChange({ num_beds: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="mt-1 text-xs text-gray-600">{scenario.num_beds} beds</div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Critical Equipment</label>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={scenario.num_equipment}
              onChange={(e) => onScenarioChange({ num_equipment: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="mt-1 text-xs text-gray-600">{scenario.num_equipment} units</div>
          </div>
        </div>

        <hr className="border-gray-200" />

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Operational Parameters</h3>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">
              Avg Treatment Time
            </label>
            <input
              type="range"
              min="30"
              max="480"
              step="15"
              value={scenario.avg_treatment_time}
              onChange={(e) => onScenarioChange({ avg_treatment_time: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="mt-1 text-xs text-gray-600">{scenario.avg_treatment_time} minutes</div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Shift Length</label>
            <input
              type="range"
              min="4"
              max="12"
              step="1"
              value={scenario.shift_length}
              onChange={(e) => onScenarioChange({ shift_length: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="mt-1 text-xs text-gray-600">{scenario.shift_length} hours</div>
          </div>
        </div>

        <hr className="border-gray-200" />

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Cost Parameters</h3>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Staff Cost/Shift</label>
            <input
              type="number"
              value={scenario.staff_cost}
              onChange={(e) => onScenarioChange({ staff_cost: parseFloat(e.target.value) })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="mt-1 text-xs text-gray-600">${scenario.staff_cost}</div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Bed Cost/Day</label>
            <input
              type="number"
              value={scenario.bed_cost}
              onChange={(e) => onScenarioChange({ bed_cost: parseFloat(e.target.value) })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="mt-1 text-xs text-gray-600">${scenario.bed_cost}</div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2">Equipment Cost/Use</label>
            <input
              type="number"
              value={scenario.equipment_cost}
              onChange={(e) => onScenarioChange({ equipment_cost: parseFloat(e.target.value) })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="mt-1 text-xs text-gray-600">${scenario.equipment_cost}</div>
          </div>
        </div>

        <hr className="border-gray-200" />

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Optimization Weights</h3>
          <p className="text-xs text-gray-600">Adjust priorities for multi-objective optimization</p>

          <div>
            <label className="flex items-center justify-between text-xs font-medium text-gray-600 mb-2">
              <span>Minimize Waiting Time</span>
              <span className="text-blue-600">{Math.round(scenario.weight_waiting_time * 100)}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={scenario.weight_waiting_time}
              onChange={(e) => onScenarioChange({ weight_waiting_time: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="flex items-center justify-between text-xs font-medium text-gray-600 mb-2">
              <span>Maximize Utilization</span>
              <span className="text-green-600">{Math.round(scenario.weight_utilization * 100)}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={scenario.weight_utilization}
              onChange={(e) => onScenarioChange({ weight_utilization: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="flex items-center justify-between text-xs font-medium text-gray-600 mb-2">
              <span>Minimize Cost</span>
              <span className="text-orange-600">{Math.round(scenario.weight_cost * 100)}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={scenario.weight_cost}
              onChange={(e) => onScenarioChange({ weight_cost: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>

          <div>
            <label className="flex items-center justify-between text-xs font-medium text-gray-600 mb-2">
              <span>Balance Workload</span>
              <span className="text-purple-600">{Math.round(scenario.weight_workload * 100)}%</span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={scenario.weight_workload}
              onChange={(e) => onScenarioChange({ weight_workload: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>

        <button
          onClick={onOptimize}
          disabled={isOptimizing}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors"
        >
          {isOptimizing ? 'Optimizing...' : 'Run Optimization'}
        </button>
      </div>
    </div>
  );
}
