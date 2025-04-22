import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface RiskDistributionData {
  name: string;
  value: number;
  color: string;
}

interface RiskDistributionChartProps {
  data: RiskDistributionData[];
}

const RiskDistributionChart: React.FC<RiskDistributionChartProps> = ({ data }) => {
  const COLORS = data.map(item => item.color);
  
  // Calculate total for percentage
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [
            `${value} customer${value !== 1 ? 's' : ''} (${((value / total) * 100).toFixed(0)}%)`,
            'Count'
          ]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default RiskDistributionChart;