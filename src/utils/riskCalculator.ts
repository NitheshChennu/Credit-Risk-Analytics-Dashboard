import { Customer, CustomerWithRiskScore } from '../types/customer';

/**
 * Calculate risk score for a customer based on:
 * - Credit score
 * - Loan repayment history
 * - Outstanding loans vs income ratio
 * 
 * Lower score = lower risk, higher score = higher risk
 * Scale: 0-100
 */
export const calculateRiskScore = (customer: Customer): number => {
  // 1. Credit score component (higher credit score = lower risk)
  // Credit scores typically range from 300-850
  const creditScoreMax = 850;
  const creditScoreMin = 300;
  const normalizedCreditScore = 1 - ((customer.creditScore - creditScoreMin) / (creditScoreMax - creditScoreMin));
  const creditScoreComponent = normalizedCreditScore * 40; // 40% weight
  
  // 2. Loan repayment history component (more missed payments = higher risk)
  const repaymentHistory = customer.loanRepaymentHistory;
  const missedPaymentsCount = repaymentHistory.filter(payment => payment === 0).length;
  const missedPaymentsRatio = missedPaymentsCount / repaymentHistory.length;
  const repaymentComponent = missedPaymentsRatio * 30; // 30% weight
  
  // 3. Debt-to-income ratio component (higher ratio = higher risk)
  const monthlyLoanPayment = customer.outstandingLoans * 0.05; // Assuming 5% monthly payment on outstanding loans
  const debtToIncomeRatio = (monthlyLoanPayment + customer.monthlyExpenses) / customer.monthlyIncome;
  const dtiComponent = Math.min(debtToIncomeRatio * 50, 30); // 30% weight, capped at 30
  
  // Calculate final risk score (0-100)
  const riskScore = Math.round(creditScoreComponent + repaymentComponent + dtiComponent);
  
  // Ensure score is within 0-100 range
  return Math.max(0, Math.min(100, riskScore));
};

export const getRiskLevel = (score: number): 'low' | 'medium' | 'high' => {
  if (score < 30) return 'low';
  if (score < 70) return 'medium';
  return 'high';
};

export const getRiskColor = (score: number): string => {
  if (score < 30) return '#52c41a'; // Green
  if (score < 70) return '#faad14'; // Yellow/Orange
  return '#f5222d'; // Red
};

export const addRiskScoresToCustomers = (customers: Customer[]): CustomerWithRiskScore[] => {
  return customers.map(customer => ({
    ...customer,
    riskScore: calculateRiskScore(customer)
  }));
};