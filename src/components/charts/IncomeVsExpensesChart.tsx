import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ChartDataPoint } from '../../types/customer';

interface IncomeVsExpensesChartProps {
  data: ChartDataPoint[];
}

const IncomeVsExpensesChart: React.FC<IncomeVsExpensesChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip 
          formatter={(value: number) => [`$${value.toLocaleString()}`, undefined]}
          labelFormatter={(name) => `Customer: ${name}`}
        />
        <Legend />
        <Bar dataKey="income" fill="#1677ff" name="Monthly Income" />
        <Bar dataKey="expenses" fill="#ff7875" name="Monthly Expenses" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default IncomeVsExpensesChart;