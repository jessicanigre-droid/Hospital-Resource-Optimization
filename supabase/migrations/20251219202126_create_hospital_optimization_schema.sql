/*
  # Hospital Resource Allocation Optimization Schema

  1. New Tables
    - `scenarios` - Store configured scenarios for hospital resource allocation
      - `id` (uuid, primary key)
      - `name` (text) - Scenario name
      - `demand_level` (text) - 'low', 'medium', 'high'
      - `patient_arrival_rate` (numeric) - Daily arrivals
      - `num_doctors` (integer) - Number of doctors available
      - `num_nurses` (integer) - Number of nurses available
      - `num_beds` (integer) - Hospital beds available
      - `num_equipment` (integer) - Critical equipment units
      - `avg_treatment_time` (numeric) - Minutes per patient
      - `shift_length` (numeric) - Hours
      - `staff_cost` (numeric) - Cost per shift
      - `bed_cost` (numeric) - Cost per day
      - `equipment_cost` (numeric) - Cost per usage
      - `weight_waiting_time` (numeric) - Optimization weight (0-1)
      - `weight_utilization` (numeric) - Optimization weight (0-1)
      - `weight_cost` (numeric) - Optimization weight (0-1)
      - `weight_workload` (numeric) - Optimization weight (0-1)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `optimization_results` - Store optimization results
      - `id` (uuid, primary key)
      - `scenario_id` (uuid, foreign key)
      - `doctors_assigned` (integer) - Optimal doctors per shift
      - `nurses_assigned` (integer) - Optimal nurses per shift
      - `beds_allocated` (integer) - Optimal beds allocated
      - `equipment_deployed` (integer) - Optimal equipment units
      - `avg_waiting_time` (numeric) - Minutes
      - `bed_utilization` (numeric) - Percentage
      - `doctor_utilization` (numeric) - Percentage
      - `nurse_utilization` (numeric) - Percentage
      - `equipment_utilization` (numeric) - Percentage
      - `total_operational_cost` (numeric) - Daily cost
      - `avg_queue_length` (numeric) - Average patients waiting
      - `objective_value` (numeric) - Weighted objective value
      - `created_at` (timestamptz)

    - `simulation_results` - Store simulation data for visualization
      - `id` (uuid, primary key)
      - `optimization_result_id` (uuid, foreign key)
      - `time_step` (integer) - Hour of day
      - `queue_length` (integer) - Patients in queue
      - `beds_occupied` (integer) - Beds in use
      - `avg_wait_time` (numeric) - Current average wait time
      - `staff_utilization` (numeric) - Current staff utilization
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Public read access for viewing scenarios and results
    - Anonymous insert/update for creating scenarios (for demo purposes)
*/

CREATE TABLE IF NOT EXISTS scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  demand_level text NOT NULL CHECK (demand_level IN ('low', 'medium', 'high')),
  patient_arrival_rate numeric NOT NULL DEFAULT 50,
  num_doctors integer NOT NULL DEFAULT 10,
  num_nurses integer NOT NULL DEFAULT 20,
  num_beds integer NOT NULL DEFAULT 100,
  num_equipment integer NOT NULL DEFAULT 5,
  avg_treatment_time numeric NOT NULL DEFAULT 120,
  shift_length numeric NOT NULL DEFAULT 8,
  staff_cost numeric NOT NULL DEFAULT 200,
  bed_cost numeric NOT NULL DEFAULT 50,
  equipment_cost numeric NOT NULL DEFAULT 100,
  weight_waiting_time numeric NOT NULL DEFAULT 0.25 CHECK (weight_waiting_time >= 0 AND weight_waiting_time <= 1),
  weight_utilization numeric NOT NULL DEFAULT 0.25 CHECK (weight_utilization >= 0 AND weight_utilization <= 1),
  weight_cost numeric NOT NULL DEFAULT 0.25 CHECK (weight_cost >= 0 AND weight_cost <= 1),
  weight_workload numeric NOT NULL DEFAULT 0.25 CHECK (weight_workload >= 0 AND weight_workload <= 1),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS optimization_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scenario_id uuid NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  doctors_assigned integer NOT NULL,
  nurses_assigned integer NOT NULL,
  beds_allocated integer NOT NULL,
  equipment_deployed integer NOT NULL,
  avg_waiting_time numeric NOT NULL,
  bed_utilization numeric NOT NULL,
  doctor_utilization numeric NOT NULL,
  nurse_utilization numeric NOT NULL,
  equipment_utilization numeric NOT NULL,
  total_operational_cost numeric NOT NULL,
  avg_queue_length numeric NOT NULL,
  objective_value numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS simulation_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  optimization_result_id uuid NOT NULL REFERENCES optimization_results(id) ON DELETE CASCADE,
  time_step integer NOT NULL,
  queue_length integer NOT NULL,
  beds_occupied integer NOT NULL,
  avg_wait_time numeric NOT NULL,
  staff_utilization numeric NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE optimization_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read scenarios"
  ON scenarios FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert scenarios"
  ON scenarios FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update scenarios"
  ON scenarios FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can read optimization results"
  ON optimization_results FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert optimization results"
  ON optimization_results FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read simulation results"
  ON simulation_results FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert simulation results"
  ON simulation_results FOR INSERT
  WITH CHECK (true);
