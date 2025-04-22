import React, { useState, useEffect } from 'react';
import { Table, Progress, Card, Typography, Row, Col, Space, Input, Button, Flex, Spin, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { fetchCustomers } from '../services/api';
import { CustomerWithRiskScore } from '../types/customer';
import { addRiskScoresToCustomers, getRiskColor } from '../utils/riskCalculator';

const { Title, Text } = Typography;

const RiskAssessment: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerWithRiskScore[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<CustomerWithRiskScore[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchText, setSearchText] = useState<string>('');
  
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchCustomers();
        const customersWithRisk = addRiskScoresToCustomers(data);
        setCustomers(customersWithRisk);
        setFilteredCustomers(customersWithRisk);
      } catch (error) {
        console.error('Error loading customer data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  const handleSearch = () => {
    const filtered = customers.filter(customer => 
      customer.name.toLowerCase().includes(searchText.toLowerCase()) ||
      customer.customerId.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredCustomers(filtered);
  };
  
  const resetSearch = () => {
    setSearchText('');
    setFilteredCustomers(customers);
  };
  
  const getRiskTag = (score: number) => {
    let color = 'success';
    let text = 'Low Risk';
    
    if (score >= 30 && score < 70) {
      color = 'warning';
      text = 'Medium Risk';
    } else if (score >= 70) {
      color = 'error';
      text = 'High Risk';
    }
    
    return <Tag color={color}>{text}</Tag>;
  };
  
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
      sorter: (a: CustomerWithRiskScore, b: CustomerWithRiskScore) => a.name.localeCompare(b.name),
    },
    {
      title: 'Credit Score',
      dataIndex: 'creditScore',
      key: 'creditScore',
      sorter: (a: CustomerWithRiskScore, b: CustomerWithRiskScore) => a.creditScore - b.creditScore,
    },
    {
      title: 'Debt to Income Ratio',
      key: 'dti',
      render: (text: string, record: CustomerWithRiskScore) => {
        const totalDebt = record.outstandingLoans;
        const annualIncome = record.monthlyIncome * 12;
        const ratio = (totalDebt / annualIncome) * 100;
        return `${ratio.toFixed(1)}%`;
      },
      sorter: (a: CustomerWithRiskScore, b: CustomerWithRiskScore) => {
        const ratioA = a.outstandingLoans / (a.monthlyIncome * 12);
        const ratioB = b.outstandingLoans / (b.monthlyIncome * 12);
        return ratioA - ratioB;
      },
    },
    {
      title: 'Missed Payments',
      key: 'missedPayments',
      render: (text: string, record: CustomerWithRiskScore) => {
        const missedCount = record.loanRepaymentHistory.filter(payment => payment === 0).length;
        const total = record.loanRepaymentHistory.length;
        return `${missedCount}/${total}`;
      },
    },
    {
      title: 'Risk Level',
      key: 'riskLevel',
      render: (text: string, record: CustomerWithRiskScore) => getRiskTag(record.riskScore),
      sorter: (a: CustomerWithRiskScore, b: CustomerWithRiskScore) => a.riskScore - b.riskScore,
    },
    {
      title: 'Risk Score',
      key: 'riskScore',
      render: (text: string, record: CustomerWithRiskScore) => (
        <div style={{ width: 170 }}>
          <Progress 
            percent={record.riskScore} 
            size="small"
            strokeColor={getRiskColor(record.riskScore)}
            format={percent => `${percent}`}
          />
        </div>
      ),
      sorter: (a: CustomerWithRiskScore, b: CustomerWithRiskScore) => a.riskScore - b.riskScore,
    },
  ];
  
  if (loading) {
    return (
      <Flex align="center" justify="center" style={{ height: '100%', minHeight: '400px' }}>
        <Spin size="large" />
      </Flex>
    );
  }
  
  // Count customers by risk level
  const highRiskCount = filteredCustomers.filter(c => c.riskScore >= 70).length;
  const mediumRiskCount = filteredCustomers.filter(c => c.riskScore >= 30 && c.riskScore < 70).length;
  const lowRiskCount = filteredCustomers.filter(c => c.riskScore < 30).length;

  return (
    <div>
      <Title level={2}>Risk Assessment</Title>
      
      {/* Risk Summary */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ backgroundColor: '#f6ffed', borderColor: '#b7eb8f' }}>
            <Statistic title="Low Risk Customers" value={lowRiskCount} />
            <Text type="secondary">Risk Score &lt; 30</Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ backgroundColor: '#fffbe6', borderColor: '#ffe58f' }}>
            <Statistic title="Medium Risk Customers" value={mediumRiskCount} />
            <Text type="secondary">Risk Score 30-70</Text>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} style={{ backgroundColor: '#fff2f0', borderColor: '#ffccc7' }}>
            <Statistic title="High Risk Customers" value={highRiskCount} />
            <Text type="secondary">Risk Score &gt; 70</Text>
          </Card>
        </Col>
      </Row>
      
      {/* Search and Filters */}
      <Card bordered={false} style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Text strong>Search Customers</Text>
          <Space>
            <Input
              placeholder="Search by name or ID"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 240 }}
              prefix={<SearchOutlined />}
              onPressEnter={handleSearch}
            />
            <Button type="primary" onClick={handleSearch}>Search</Button>
            <Button onClick={resetSearch}>Reset</Button>
          </Space>
        </Space>
      </Card>
      
      {/* Customer Risk Table */}
      <Card title="Customer Risk Analysis" bordered={false}>
        <Table
          dataSource={filteredCustomers}
          columns={columns}
          rowKey="customerId"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  );
};

const Statistic = ({ title, value }: { title: string, value: number }) => (
  <div>
    <Text>{title}</Text>
    <div>
      <Title level={3} style={{ margin: '8px 0' }}>{value}</Title>
    </div>
  </div>
);

export default RiskAssessment;