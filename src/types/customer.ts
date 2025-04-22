export interface Customer {
  customerId: string;
  name: string;
  monthlyIncome: number;
  monthlyExpenses: number;
  creditScore: number;
  outstandingLoans: number;
  loanRepaymentHistory: number[];
  accountBalance: number;
  status: 'Review' | 'Approved' | 'Rejected';
  riskScore?: number;
}

export interface CustomerWithRiskScore extends Customer {
  riskScore: number;
}

export interface ChartDataPoint {
  name: string;
  income: number;
  expenses: number;
}

export type StatusType = 'Review' | 'Approved' | 'Rejected';