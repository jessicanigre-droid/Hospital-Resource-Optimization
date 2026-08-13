import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Results } from './components/Results';
import { Charts } from './components/Charts';
import { Comparison } from './components/Comparison';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/Tabs';
import { Scenario, OptimizationResult, SimulationResult, saveScenario, updateScenario, getScenarios, getOptimizationResult, saveOptimizationResult, saveSimulationResults, getSimulationResults } from './lib/supabase';
import { optimizeResourceAllocation, OptimizationInput } from './lib/optimization';
import { simulatePatientFlow, SimulationSnapshot } from './lib/simulation';
import { Settings } from 'lucide-react';

export default function App() {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [simulationData, setSimulationData] = useState<SimulationSnapshot[]>([]);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [savedScenarios, setSavedScenarios] = useState<Array<{ name: string; result: OptimizationResult }>>([]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  const demandLevelRates: { [key: string]: number } = {
    low: 30,
    medium: 75,
    high: 150
  };

  useEffect(() => {
    initializeApp();
  }, []);

  async function initializeApp() {
    try {
      const savedScenarios = await getScenarios();
      setScenarios(savedScenarios);

      if (savedScenarios.length > 0) {
        const recent = savedScenarios[0];
        setScenario(recent);
        await loadScenarioData(recent);
      } else {
        const newScenario: Omit<Scenario, 'id' | 'created_at' | 'updated_at'> = {
          name: 'Initial Scenario',
          demand_level: 'medium',
          patient_arrival_rate: 75,
          num_doctors: 10,
          num_nurses: 20,
          num_beds: 100,
          num_equipment: 5,
          avg_treatment_time: 120,
          shift_length: 8,
          staff_cost: 200,
          bed_cost: 50,
          equipment_cost: 100,
          weight_waiting_time: 0.25,
          weight_utilization: 0.25,
          weight_cost: 0.25,
          weight_workload: 0.25
        };

        const created = await saveScenario(newScenario);
        setScenario(created);
        setScenarios([created]);
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadScenarioData(scen: Scenario) {
    try {
      const result = await getOptimizationResult(scen.id);
      if (result) {
        setOptimizationResult(result);
        const simResults = await getSimulationResults(result.id);
        setSimulationData(simResults as SimulationSnapshot[]);
      }
    } catch (error) {
      console.error('Failed to load scenario data:', error);
    }
  }

  async function handleScenarioChange(updates: Partial<Scenario>) {
    if (!scenario) return;

    const updatedScenario = { ...scenario, ...updates };
    setScenario(updatedScenario);

    if (updates.demand_level && demandLevelRates[updates.demand_level]) {
      updatedScenario.patient_arrival_rate = demandLevelRates[updates.demand_level];
      setScenario(updatedScenario);
    }

    try {
      await updateScenario(scenario.id, updates);
    } catch (error) {
      console.error('Failed to update scenario:', error);
    }
  }

  async function handleOptimize() {
    if (!scenario) return;

    setIsOptimizing(true);
    try {
      const input: OptimizationInput = {
        patientArrivalRate: scenario.patient_arrival_rate,
        numDoctors: scenario.num_doctors,
        numNurses: scenario.num_nurses,
        numBeds: scenario.num_beds,
        numEquipment: scenario.num_equipment,
        avgTreatmentTime: scenario.avg_treatment_time,
        shiftLength: scenario.shift_length,
        staffCost: scenario.staff_cost,
        bedCost: scenario.bed_cost,
        equipmentCost: scenario.equipment_cost,
        weightWaitingTime: scenario.weight_waiting_time,
        weightUtilization: scenario.weight_utilization,
        weightCost: scenario.weight_cost,
        weightWorkload: scenario.weight_workload
      };

      const result = optimizeResourceAllocation(input);

      const savedResult = await saveOptimizationResult({
        scenario_id: scenario.id,
        doctors_assigned: result.doctorsAssigned,
        nurses_assigned: result.nursesAssigned,
        beds_allocated: result.bedsAllocated,
        equipment_deployed: result.equipmentDeployed,
        avg_waiting_time: result.avgWaitingTime,
        bed_utilization: result.bedUtilization,
        doctor_utilization: result.doctorUtilization,
        nurse_utilization: result.nurseUtilization,
        equipment_utilization: result.equipmentUtilization,
        total_operational_cost: result.totalOperationalCost,
        avg_queue_length: result.avgQueueLength,
        objective_value: result.objectiveValue
      });

      const simResults = simulatePatientFlow({
        patientArrivalRate: scenario.patient_arrival_rate,
        avgTreatmentTime: scenario.avg_treatment_time,
        numStaff: result.doctorsAssigned + result.nursesAssigned,
        numBeds: result.bedsAllocated,
        numEquipment: result.equipmentDeployed,
        shiftLength: scenario.shift_length
      });

      await saveSimulationResults(
        simResults.map(sim => ({
          optimization_result_id: savedResult.id,
          time_step: sim.timeStep,
          queue_length: sim.queueLength,
          beds_occupied: sim.bedsOccupied,
          avg_wait_time: sim.avgWaitTime,
          staff_utilization: sim.staffUtilization
        }))
      );

      setOptimizationResult(savedResult);
      setSimulationData(simResults);
      setActiveTab('overview');

      const updatedScenarios = await getScenarios();
      setScenarios(updatedScenarios);
    } catch (error) {
      console.error('Optimization failed:', error);
      alert('Optimization failed. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  }

  function handleLoadScenario(scen: Scenario) {
    setScenario(scen);
    loadScenarioData(scen);
  }

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      <Sidebar
        scenario={scenario}
        onScenarioChange={handleScenarioChange}
        onOptimize={handleOptimize}
        isOptimizing={isOptimizing}
        scenarios={scenarios}
        onLoadScenario={handleLoadScenario}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{scenario?.name || 'Hospital Dashboard'}</h2>
            <p className="text-sm text-gray-600">
              {scenario?.demand_level && `${scenario.demand_level.charAt(0).toUpperCase() + scenario.demand_level.slice(1)} demand scenario`}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Settings className="w-4 h-4" />
            <span>Last updated: {optimizationResult?.created_at ? new Date(optimizationResult.created_at).toLocaleDateString() : 'Never'}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-8">
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="simulation">Simulation</TabsTrigger>
                <TabsTrigger value="comparison">Comparison</TabsTrigger>
                <TabsTrigger value="documentation">Documentation</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Results result={optimizationResult} isLoading={isOptimizing} />
              </TabsContent>

              <TabsContent value="simulation" className="mt-6">
                <Charts simulationData={simulationData} isLoading={isOptimizing} />
              </TabsContent>

              <TabsContent value="comparison" className="mt-6">
                <div className="space-y-6">
                  <button
                    onClick={() => {
                      if (optimizationResult) {
                        setSavedScenarios([
                          ...savedScenarios,
                          { name: scenario?.name || 'Scenario', result: optimizationResult }
                        ]);
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                  >
                    Add Current to Comparison
                  </button>
                  <Comparison scenarios={savedScenarios} />
                </div>
              </TabsContent>

              <TabsContent value="documentation" className="mt-6">
                <Documentation />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

function Documentation() {
  return (
    <div className="max-w-4xl space-y-8">
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Model Assumptions</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Patient arrivals follow a Poisson distribution (M/M/s queueing model)</li>
          <li>Service times are exponentially distributed</li>
          <li>Staff can be flexibly allocated between shifts</li>
          <li>Equipment availability is the bottleneck during critical patient surges</li>
          <li>Treatment time is independent of patient severity</li>
          <li>Hospital operates 24/7 with configurable shift lengths</li>
          <li>No patient abandonment due to wait times</li>
        </ul>
      </section>

      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Decision Variables</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• <strong>Doctors Assigned</strong>: Number of physicians per shift</li>
          <li>• <strong>Nurses Assigned</strong>: Number of nursing staff per shift</li>
          <li>• <strong>Beds Allocated</strong>: Hospital capacity in use (0 to max beds)</li>
          <li>• <strong>Equipment Deployed</strong>: Critical equipment units assigned (0 to max equipment)</li>
        </ul>
      </section>

      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Constraints</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Staff capacity: Assigned staff ≤ Available staff</li>
          <li>• Bed capacity: Allocated beds ≤ Total hospital beds</li>
          <li>• Equipment capacity: Deployed units ≤ Available equipment</li>
          <li>• Service requirement: Total service capacity ≥ Daily patient arrivals × (1 + safety margin)</li>
          <li>• Minimum resources: Maintain minimum staffing levels for safety</li>
        </ul>
      </section>

      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Objective Function</h3>
        <p className="text-sm text-gray-700 mb-4">
          The optimizer minimizes a weighted combination of four objectives:
        </p>
        <div className="space-y-3 text-sm text-gray-700">
          <div className="p-3 bg-blue-50 rounded border border-blue-200">
            <strong>Waiting Time</strong>: Minimize average patient wait time through adequate staffing and bed capacity
          </div>
          <div className="p-3 bg-green-50 rounded border border-green-200">
            <strong>Resource Utilization</strong>: Maximize the efficiency of allocated resources
          </div>
          <div className="p-3 bg-orange-50 rounded border border-orange-200">
            <strong>Operational Cost</strong>: Minimize daily operational expenses (staff, beds, equipment)
          </div>
          <div className="p-3 bg-purple-50 rounded border border-purple-200">
            <strong>Workload Balance</strong>: Balance workload between doctors and nurses to prevent burnout
          </div>
        </div>
      </section>

      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">How to Use</h3>
        <ol className="space-y-3 text-sm text-gray-700">
          <li><strong>1. Configure Scenario:</strong> Set up demand level, available resources, and costs in the sidebar</li>
          <li><strong>2. Adjust Weights:</strong> Use the optimization weights to prioritize your objectives</li>
          <li><strong>3. Run Optimization:</strong> Click "Run Optimization" to compute optimal resource allocation</li>
          <li><strong>4. Review Results:</strong> Check the optimal staffing, bed allocation, and KPIs</li>
          <li><strong>5. Analyze Simulation:</strong> View 24-hour patient flow simulation and utilization patterns</li>
          <li><strong>6. Compare Scenarios:</strong> Run multiple scenarios and compare their outcomes</li>
        </ol>
      </section>
    </div>
  );
}
