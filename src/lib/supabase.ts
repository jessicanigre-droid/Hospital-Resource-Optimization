import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Scenario {
  id: string;
  name: string;
  demand_level: 'low' | 'medium' | 'high';
  patient_arrival_rate: number;
  num_doctors: number;
  num_nurses: number;
  num_beds: number;
  num_equipment: number;
  avg_treatment_time: number;
  shift_length: number;
  staff_cost: number;
  bed_cost: number;
  equipment_cost: number;
  weight_waiting_time: number;
  weight_utilization: number;
  weight_cost: number;
  weight_workload: number;
  created_at: string;
  updated_at: string;
}

export interface OptimizationResult {
  id: string;
  scenario_id: string;
  doctors_assigned: number;
  nurses_assigned: number;
  beds_allocated: number;
  equipment_deployed: number;
  avg_waiting_time: number;
  bed_utilization: number;
  doctor_utilization: number;
  nurse_utilization: number;
  equipment_utilization: number;
  total_operational_cost: number;
  avg_queue_length: number;
  objective_value: number;
  created_at: string;
}

export interface SimulationResult {
  id: string;
  optimization_result_id: string;
  time_step: number;
  queue_length: number;
  beds_occupied: number;
  avg_wait_time: number;
  staff_utilization: number;
  created_at: string;
}

export async function saveScenario(scenario: Omit<Scenario, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('scenarios')
    .insert([scenario])
    .select()
    .single();

  if (error) throw error;
  return data as Scenario;
}

export async function updateScenario(id: string, scenario: Partial<Omit<Scenario, 'id' | 'created_at' | 'updated_at'>>) {
  const { data, error } = await supabase
    .from('scenarios')
    .update({ ...scenario, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Scenario;
}

export async function getScenarios() {
  const { data, error } = await supabase
    .from('scenarios')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Scenario[];
}

export async function getScenario(id: string) {
  const { data, error } = await supabase
    .from('scenarios')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data as Scenario | null;
}

export async function saveOptimizationResult(result: Omit<OptimizationResult, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('optimization_results')
    .insert([result])
    .select()
    .single();

  if (error) throw error;
  return data as OptimizationResult;
}

export async function getOptimizationResult(scenarioId: string) {
  const { data, error } = await supabase
    .from('optimization_results')
    .select('*')
    .eq('scenario_id', scenarioId)
    .order('created_at', { ascending: false })
    .maybeSingle();

  if (error) throw error;
  return data as OptimizationResult | null;
}

export async function saveSimulationResults(results: Omit<SimulationResult, 'id' | 'created_at'>[]) {
  const { data, error } = await supabase
    .from('simulation_results')
    .insert(results)
    .select();

  if (error) throw error;
  return data as SimulationResult[];
}

export async function getSimulationResults(optimizationResultId: string) {
  const { data, error } = await supabase
    .from('simulation_results')
    .select('*')
    .eq('optimization_result_id', optimizationResultId)
    .order('time_step', { ascending: true });

  if (error) throw error;
  return data as SimulationResult[];
}
