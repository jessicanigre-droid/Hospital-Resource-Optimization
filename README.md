# Hospital-Resource-Optimization
Multi-objective optimization framework for hospital resource allocation during peak demand using MILP, queueing theory, and genetic algorithms.
# Optimizing Hospital Resource Allocation During Peak Demand
*A Multi-Objective Optimization Approach Using MILP and Genetic Algorithms*

## Introduction
Healthcare systems face severe challenges during peak demand periods such as seasonal outbreaks or pandemics. Sudden surges in patient arrivals strain hospital resources—staff, beds, and equipment—leading to overcrowding, long waiting times, staff burnout, and rising costs.  

This project proposes a **multi-objective optimization framework** that integrates:
- **Mixed-Integer Linear Programming (MILP)**
- **Queueing theory (M/M/c models)**
- **Genetic Algorithms (GA)**
- **Synthetic data simulation**

The framework balances efficiency, cost, and patient experience while remaining interpretable for hospital administrators.

---

## Objectives
1. Minimize patient waiting times  
2. Reduce operational costs  
3. Balance staff workload  
4. Maximize resource utilization  

---

## Methodology
- **MILP Formulation**: Integer-based staffing/resource decisions with linear cost structures.  
- **Queueing Theory**: Patient flow modeled via M/M/c queues, ensuring service capacity stability.  
- **Multi-Objective Optimization**: Conflicting goals solved via Pareto dominance.  
- **Genetic Algorithm**: Tournament selection, two-point crossover, Gaussian mutation, and elitism.  

---

## Case Study (Synthetic Data)
- **Scope**: 7-day hospital operation (168 hours) during outbreak surge.  
- **Patient Arrivals**: Poisson-based with diurnal, weekly, and surge variations.  
- **Resources**: Nurses, doctors, technicians, ICU beds, general beds.  
- **Problem Size**: 840 decision variables, 168 constraints.  

### Key Results:
- **Wait time reduced by 59%** (4.20 → 1.72 hrs)  
- **Cost reduced by 13.5%** ($45,600 → $39,450 daily)  
- **Utilization improved by 15%** (72% → 87%)  
- **Workload variance reduced by 41.8%**  

Statistical validation: *p < 0.001, 95% CI [1.98, 2.97] hrs*  

---

## Sensitivity Analysis
- **Cost-focused strategy**: Lower costs, longer wait times.  
- **Quality-focused strategy**: Shorter wait times, higher costs.  
- **Balanced strategy**: Optimal trade-off between cost and service quality.  
- **Demand shocks**: Framework adapts dynamically to surges (1.0x–2.0x).  

---

## Practical Recommendations
1. Flexible scheduling with 4-hour shift adjustments.  
2. Maintain 75–80% utilization with 15–20% safety buffer.  
3. Nurse-to-doctor ratio ≈ 2:1.  
4. Daily re-optimization with rolling 24–48 hour forecasts.  
5. Cross-train technicians for surge support.  

---

## Implementation
- Python-based GA implementation (NumPy, SciPy, Pandas, Matplotlib).  
- Reproducible with fixed random seed (42).  
- Average runtime: ~250 seconds on Intel i7, 16GB RAM.  
- Ready for deployment with real hospital data (EHR integration).  

---

## Dashboard
A decision-support dashboard (Streamlit/Dash) can visualize:
- Patient arrival scenarios  
- Optimal staffing levels  
- Expected waiting times  
- Cost-quality trade-offs  

---

## References
1. Patel, V., Deodhar, A., & Birru, D. (2025). *A Multi-Objective Genetic Algorithm for Healthcare Workforce Scheduling*. arXiv:2508.20953.  
2. Mohamed, M. F., et al. (2023). *Multi-Objective Genetic Algorithm for Healthcare Supplier Selection*. Mathematics, 11(6), 1537.  
3. Yinusa, A., & Faezipour, M. (2023). *Optimizing Healthcare Delivery*. Applied System Innovation, 6(5), 78.  
4. Salami, A., et al. (2023). *Healthcare Facility Location-Allocation Problems*. Int. J. Public Health.  
5. Green, L. (2006). *Queueing Analysis in Healthcare*. Handbook of Healthcare Operations Management.  
