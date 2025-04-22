import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Table, Badge, Flex, Typography, Spin } from 'antd';
import { AlertCircle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { fetchCustomers } from '../services/api';
import { Customer, CustomerWithRiskScore, ChartDataPoint } from '../types/customer';
import { addRiskScoresToCustomers, getRiskLevel, getRiskColor } from '../utils/riskCalculator';
import IncomeVsExpensesChart from '../components/charts/IncomeVsExpensesChart';
import RiskDistributionChart from '../components/charts/RiskDistributionChart';

const { Title } = Typography;

const Dashboard: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerWithRiskScore[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCustomers();
        setCustomers(addRiskScoresToCustomers(data));
      } catch (error) {
        console.error('Error loading customer data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Calculate total monthly income across all customers
  const totalMonthlyIncome = customers.reduce((sum, customer) => sum + customer.monthlyIncome, 0);
  
  // Calculate total monthly expenses across all customers
  const totalMonthlyExpenses = customers.reduce((sum, customer) => sum + customer.monthlyExpenses, 0);
  
  // Calculate average risk score
  const averageRiskScore = customers.length 
    ? Math.round(customers.reduce((sum, customer) => sum + customer.riskScore, 0) / customers.length) 
    : 0;
  
  // Prepare data for income vs expenses chart
  const incomeVsExpensesData: ChartDataPoint[] = customers.map(customer => ({
    name: customer.name.split(' ')[0], // Use first name for clarity
    income: customer.monthlyIncome,
    expenses: customer.monthlyExpenses
  }));
  
  // Prepare data for risk distribution chart
  const lowRiskCount = customers.filter(c => c.riskScore < 30).length;
  const mediumRiskCount = customers.filter(c => c.riskScore >= 30 && c.riskScore < 70).length;
  const highRiskCount = customers.filter(c => c.riskScore >= 70).length;
  
  const riskDistributionData = [
    { name: 'Low Risk', value: lowRiskCount, color: '#52c41a' },
    { name: 'Medium Risk', value: mediumRiskCount, color: '#faad14' },
    { name: 'High Risk', value: highRiskCount, color: '#f5222d' }
  ];
  
  // Table columns
  const columns = [
    {
      title: 'Customer ID',
      dataIndex: 'customerId',
      key: 'customerId',
      width: 120,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Customer, b: Customer) => a.name.localeCompare(b.name),
    },
    {
      title: 'Monthly Income',
      dataIndex: 'monthlyIncome',
      key: 'monthlyIncome',
      render: (income: number) => `$${income.toLocaleString()}`,
      sorter: (a: Customer, b: Customer) => a.monthlyIncome - b.monthlyIncome,
    },
    {
      title: 'Credit Score',
      dataIndex: 'creditScore',
      key: 'creditScore',
      sorter: (a: Customer, b: Customer) => a.creditScore - b.creditScore,
    },
    {
      title: 'Risk Score',
      dataIndex: 'riskScore',
      key: 'riskScore',
      render: (score: number) => {
        const level = getRiskLevel(score);
        return (
          <Badge 
            count={score} 
            style={{ 
              backgroundColor: getRiskColor(score),
              fontSize: '14px',
              minWidth: '42px',
              height: '22px',
              lineHeight: '22px',
              padding: '0 8px',
            }} 
          />
        );
      },
      sorter: (a: CustomerWithRiskScore, b: CustomerWithRiskScore) => a.riskScore - b.riskScore,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'blue';
        if (status === 'Approved') color = 'green';
        if (status === 'Rejected') color = 'red';
        return <Badge status={color as any} text={status} />;
      },
      filters: [
        { text: 'Review', value: 'Review' },
        { text: 'Approved', value: 'Approved' },
        { text: 'Rejected', value: 'Rejected' },
      ],
      onFilter: (value: string, record: Customer) => record.status === value,
    },
  ];

  if (loading) {
    return (
      <Flex align="center" justify="center" style={{ height: '100%', minHeight: '400px' }}>
        <Spin size="large" />
      </Flex>
    );
  }

  return (
    <div>
      <Title level={2}>Dashboard Overview</Title>
      
      {/* Stats Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic
              title="Total Monthly Income"
              value={totalMonthlyIncome}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<DollarSign size={24} />}
              formatter={(value) => `$${Number(value).toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic
              title="Total Monthly Expenses"
              value={totalMonthlyExpenses}
              precision={0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<DollarSign size={24} />}
              formatter={(value) => `$${Number(value).toLocaleString()}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic
              title="Savings Rate"
              value={(1 - (totalMonthlyExpenses / totalMonthlyIncome)) * 100}
              precision={1}
              valueStyle={{ 
                color: totalMonthlyIncome > totalMonthlyExpenses ? '#3f8600' : '#cf1322' 
              }}
              prefix={totalMonthlyIncome > totalMonthlyExpenses ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
              suffix="%"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic
              title="Average Risk Score"
              value={averageRiskScore}
              valueStyle={{ 
                color: getRiskColor(averageRiskScore)
              }}
              prefix={<AlertCircle size={24} />}
            />
          </Card>
        </Col>
      </Row>
      
      {/* Charts Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title="Income vs Expenses" bordered={false}>
            <IncomeVsExpensesChart data={incomeVsExpensesData} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Risk Distribution" bordered={false}>
            <RiskDistributionChart data={riskDistributionData} />
          </Card>
        </Col>
      </Row>
      
      {/* Customers Table */}
      <Card title="Customer Overview" bordered={false}>
        <Table
          dataSource={customers}
          columns={columns}
          rowKey="customerId"
          pagination={{ pageSize: 5 }}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
};

export default Dashboard;