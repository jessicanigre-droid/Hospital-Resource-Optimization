export interface SimulationInput {
  patientArrivalRate: number;
  avgTreatmentTime: number;
  numStaff: number;
  numBeds: number;
  numEquipment: number;
  shiftLength: number;
}

export interface SimulationSnapshot {
  timeStep: number;
  queueLength: number;
  bedsOccupied: number;
  avgWaitTime: number;
  staffUtilization: number;
  bedsUtilization: number;
}

function generateArrivalTimes(totalPatients: number, period: number): number[] {
  const arrivals: number[] = [];
  let currentTime = 0;
  for (let i = 0; i < totalPatients; i++) {
    const interArrivalTime = -Math.log(Math.random()) * (period / totalPatients);
    currentTime += interArrivalTime;
    if (currentTime < period * 60) {
      arrivals.push(currentTime);
    }
  }
  return arrivals.sort(() => Math.random() - 0.5).slice(0, Math.min(totalPatients, arrivals.length));
}

function generateServiceTimes(count: number, meanTime: number): number[] {
  return Array.from({ length: count }, () => {
    return Math.max(5, -Math.log(Math.random()) * meanTime);
  });
}

export function simulatePatientFlow(input: SimulationInput, hoursToSimulate: number = 24): SimulationSnapshot[] {
  const results: SimulationSnapshot[] = [];
  const patientsPerHour = input.patientArrivalRate / 24;
  const totalPatients = Math.ceil(patientsPerHour * hoursToSimulate);

  const arrivals = generateArrivalTimes(totalPatients, hoursToSimulate);
  const serviceTimes = generateServiceTimes(totalPatients, input.avgTreatmentTime);

  const queue: { arrivalTime: number; serviceTime: number }[] = [];
  const staffBusyUntil: number[] = Array(input.numStaff).fill(0);
  const bedsOccupiedUntil: number[] = Array(input.numBeds).fill(0);
  const waitTimes: number[] = [];

  for (let patientIdx = 0; patientIdx < arrivals.length; patientIdx++) {
    const arrivalTime = arrivals[patientIdx];
    const serviceTime = serviceTimes[patientIdx];

    const nextAvailableStaff = Math.min(...staffBusyUntil);
    const staffStartTime = Math.max(arrivalTime, nextAvailableStaff);
    const staffEndTime = staffStartTime + serviceTime;

    const nextAvailableBed = Math.min(...bedsOccupiedUntil);
    const bedStartTime = Math.max(arrivalTime, nextAvailableBed);
    const bedEndTime = bedStartTime + serviceTime / 60;

    const waitTime = Math.max(0, Math.max(staffStartTime, bedStartTime) - arrivalTime);
    waitTimes.push(waitTime);

    const staffIdx = staffBusyUntil.indexOf(nextAvailableStaff);
    const bedIdx = bedsOccupiedUntil.indexOf(nextAvailableBed);

    staffBusyUntil[staffIdx] = staffEndTime;
    bedsOccupiedUntil[bedIdx] = bedEndTime;
  }

  for (let hour = 0; hour < hoursToSimulate; hour++) {
    const currentTime = hour * 60;
    const nextTime = (hour + 1) * 60;

    const queueLength = arrivals.filter(
      (a, idx) => a < nextTime && staffBusyUntil[Math.floor(idx % input.numStaff)] > currentTime
    ).length;

    const bedsOccupied = bedsOccupiedUntil.filter(t => t > currentTime && t < nextTime).length;
    const staffUtilization = (staffBusyUntil.filter(t => t > currentTime).length / input.numStaff) * 100;

    const recentWaitTimes = waitTimes.filter((_, idx) => arrivals[idx] >= currentTime && arrivals[idx] < nextTime);
    const avgWaitTime = recentWaitTimes.length > 0
      ? recentWaitTimes.reduce((a, b) => a + b, 0) / recentWaitTimes.length
      : 0;

    const bedsUtilization = (bedsOccupied / input.numBeds) * 100;

    results.push({
      timeStep: hour,
      queueLength: Math.max(0, queueLength),
      bedsOccupied,
      avgWaitTime: Math.round(avgWaitTime * 10) / 10,
      staffUtilization: Math.round(staffUtilization * 10) / 10,
      bedsUtilization: Math.round(bedsUtilization * 10) / 10
    });
  }

  return results;
}

export function calculateUtilizationHeatmap(
  arrivalRates: number[],
  staffLevels: number[],
  avgTreatmentTime: number
): number[][] {
  const heatmap: number[][] = [];

  for (const staffLevel of staffLevels) {
    const row: number[] = [];
    for (const arrivalRate of arrivalRates) {
      const serviceCapacity = (staffLevel * 24) / (avgTreatmentTime / 60);
      const utilization = Math.min(100, (arrivalRate / serviceCapacity) * 100);
      row.push(Math.round(utilization * 10) / 10);
    }
    heatmap.push(row);
  }

  return heatmap;
}
