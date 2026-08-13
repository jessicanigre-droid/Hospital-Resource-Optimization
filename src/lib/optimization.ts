export interface OptimizationInput {
  patientArrivalRate: number;
  numDoctors: number;
  numNurses: number;
  numBeds: number;
  numEquipment: number;
  avgTreatmentTime: number;
  shiftLength: number;
  staffCost: number;
  bedCost: number;
  equipmentCost: number;
  weightWaitingTime: number;
  weightUtilization: number;
  weightCost: number;
  weightWorkload: number;
}

export interface OptimizationOutput {
  doctorsAssigned: number;
  nursesAssigned: number;
  bedsAllocated: number;
  equipmentDeployed: number;
  avgWaitingTime: number;
  bedUtilization: number;
  doctorUtilization: number;
  nurseUtilization: number;
  equipmentUtilization: number;
  totalOperationalCost: number;
  avgQueueLength: number;
  objectiveValue: number;
}

function calculateServiceCapacity(doctors: number, nurses: number, avgTreatmentTime: number, shiftLength: number): number {
  const staffHours = (doctors + nurses) * shiftLength;
  const shiftsPerDay = 24 / shiftLength;
  const totalStaffMinutes = staffHours * 60 * shiftsPerDay;
  return totalStaffMinutes / avgTreatmentTime;
}

function calculateUtilization(actual: number, capacity: number): number {
  if (capacity === 0) return 0;
  return Math.min(100, (actual / capacity) * 100);
}

function calculateQueueLength(arrivalRate: number, serviceCapacity: number): number {
  if (serviceCapacity <= arrivalRate) {
    return (arrivalRate / serviceCapacity) * 10;
  }
  const lambda = arrivalRate / 24;
  const mu = serviceCapacity / 24;
  const rho = lambda / mu;
  if (rho >= 1) return arrivalRate;
  return (rho * rho) / (1 - rho);
}

function calculateWaitingTime(queueLength: number, arrivalRate: number): number {
  if (arrivalRate === 0) return 0;
  const lambda = arrivalRate / 24;
  const avgQueue = queueLength;
  return Math.max(0, (avgQueue / lambda) * 60);
}

function optimizeBedAllocation(
  patientArrivalRate: number,
  avgTreatmentTime: number,
  availableBeds: number
): number {
  const patientsPerDay = patientArrivalRate;
  const avgLengthOfStay = avgTreatmentTime / 60;
  const bedsNeeded = (patientsPerDay * avgLengthOfStay) / 24;
  return Math.ceil(Math.min(availableBeds, Math.max(5, bedsNeeded * 1.2)));
}

function optimizeStaffing(
  patientArrivalRate: number,
  avgTreatmentTime: number,
  availableDoctors: number,
  availableNurses: number,
  shiftLength: number,
  doctorRatio: number = 0.33
): { doctors: number; nurses: number } {
  const serviceCapacityNeeded = patientArrivalRate * 1.1;
  const shiftsPerDay = 24 / shiftLength;
  const staffMinutesNeeded = serviceCapacityNeeded * avgTreatmentTime;
  const staffHoursNeeded = staffMinutesNeeded / 60 / shiftsPerDay;

  const doctorsNeeded = Math.ceil((staffHoursNeeded * doctorRatio) / shiftLength);
  const nursesNeeded = Math.ceil((staffHoursNeeded * (1 - doctorRatio)) / shiftLength);

  return {
    doctors: Math.min(availableDoctors, Math.max(2, doctorsNeeded)),
    nurses: Math.min(availableNurses, Math.max(4, nursesNeeded))
  };
}

function optimizeEquipment(patientArrivalRate: number, availableEquipment: number): number {
  const criticalPatientRate = patientArrivalRate * 0.15;
  const equipmentNeeded = Math.ceil(criticalPatientRate / 4);
  return Math.min(availableEquipment, Math.max(1, equipmentNeeded));
}

export function optimizeResourceAllocation(input: OptimizationInput): OptimizationOutput {
  const staffing = optimizeStaffing(
    input.patientArrivalRate,
    input.avgTreatmentTime,
    input.numDoctors,
    input.numNurses,
    input.shiftLength
  );

  const bedsAllocated = optimizeBedAllocation(
    input.patientArrivalRate,
    input.avgTreatmentTime,
    input.numBeds
  );

  const equipmentDeployed = optimizeEquipment(
    input.patientArrivalRate,
    input.numEquipment
  );

  const serviceCapacity = calculateServiceCapacity(
    staffing.doctors,
    staffing.nurses,
    input.avgTreatmentTime,
    input.shiftLength
  );

  const queueLength = calculateQueueLength(input.patientArrivalRate, serviceCapacity);
  const avgWaitingTime = calculateWaitingTime(queueLength, input.patientArrivalRate);

  const doctorUtilization = calculateUtilization(input.patientArrivalRate * 0.3, serviceCapacity);
  const nurseUtilization = calculateUtilization(input.patientArrivalRate * 0.7, serviceCapacity);
  const bedUtilization = calculateUtilization(input.patientArrivalRate, bedsAllocated * 24);
  const equipmentUtilization = calculateUtilization(input.patientArrivalRate * 0.15, equipmentDeployed * 24);

  const shiftCost = (staffing.doctors + staffing.nurses) * input.staffCost;
  const bedMaintenanceCost = bedsAllocated * input.bedCost;
  const equipmentCost = equipmentDeployed * input.equipmentCost;
  const totalOperationalCost = shiftCost + bedMaintenanceCost + equipmentCost;

  const avgWorkload = (doctorUtilization + nurseUtilization) / 2;
  const workloadBalance = 100 - Math.abs(doctorUtilization - nurseUtilization);

  const normalizedWaitingTime = Math.min(100, avgWaitingTime / 5);
  const normalizedCost = Math.min(100, totalOperationalCost / 1000);
  const normalizedUtilization = 100 - Math.min(100, (100 - bedUtilization) / 2);
  const normalizedWorkload = workloadBalance;

  const objectiveValue =
    (input.weightWaitingTime * (100 - normalizedWaitingTime) +
      input.weightUtilization * normalizedUtilization +
      input.weightCost * (100 - normalizedCost) +
      input.weightWorkload * normalizedWorkload) /
    (input.weightWaitingTime + input.weightUtilization + input.weightCost + input.weightWorkload);

  return {
    doctorsAssigned: staffing.doctors,
    nursesAssigned: staffing.nurses,
    bedsAllocated,
    equipmentDeployed,
    avgWaitingTime: Math.round(avgWaitingTime * 10) / 10,
    bedUtilization: Math.round(bedUtilization * 10) / 10,
    doctorUtilization: Math.round(doctorUtilization * 10) / 10,
    nurseUtilization: Math.round(nurseUtilization * 10) / 10,
    equipmentUtilization: Math.round(equipmentUtilization * 10) / 10,
    totalOperationalCost: Math.round(totalOperationalCost * 100) / 100,
    avgQueueLength: Math.round(queueLength * 10) / 10,
    objectiveValue: Math.round(objectiveValue * 100) / 100
  };
}
