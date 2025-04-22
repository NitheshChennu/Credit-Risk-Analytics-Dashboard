import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Descriptions, Button, Progress, Flex, Divider, Spin, Space, Tag, List } from 'antd';
import { ArrowLeft, DollarSign, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { fetchCustomers } from '../services/api';
import { CustomerWithRiskScore } from '../types/customer';
import { addRiskScoresToCustomers, getRiskColor } from '../utils/riskCalculator';

const { Title, Text } = Typography;

const CustomerDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<CustomerWithRiskScore | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    const loadCustomerDetails = async () => {
      try {
        const data = await fetchCustomers();
        const customersWithRisk = addRiskScoresToCustomers(data);
        const foundCustomer = customersWithRisk.find(c => c.customerId === id);
        setCustomer(foundCustomer || null);
      } catch (error) {
        console.error('Error loading customer details:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCustomerDetails();
  }, [id]);
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Review': 
        return <Tag icon={<AlertTriangle size={14} />} color="processing">Under Review</Tag>;
      case 'Approved': 
        return <Tag icon={<CheckCircle size={14} />} color="success">Approved</Tag>;
      case 'Rejected': 
        return <Tag icon={<XCircle size={14} />} color="error">Rejected</Tag>;
      default: return null;
    }
  };
  
  const getRepaymentHistoryItems = (history: number[]) => {
    return history.map((payment, index) => ({
      key: index.toString(),
      status: payment === 1 ? 'paid' : 'missed',
      month: `Month ${index + 1}`,
    }));
  };
  
  if (loading) {
    return (
      <Flex align="center" justify="center" style={{ height: '100%', minHeight: '400px' }}>
        <Spin size="large" />
      </Flex>
    );
  }
  
  if (!customer) {
    return (
      <div>
        <Button 
          type="primary" 
          icon={<ArrowLeft size={16} />} 
          onClick={() => navigate(-1)} 
          style={{ marginBottom: 16 }}
        >
          Back
        </Button>
        <Card>
          <Flex align="center" justify="center" vertical style={{ padding: 48 }}>
            <Title level={4}>Customer Not Found</Title>
            <Text type="secondary">The customer you're looking for doesn't exist or has been removed.</Text>
          </Flex>
        </Card>
      </div>
    );
  }
  
  const repaymentHistoryItems = getRepaymentHistoryItems(customer.loanRepaymentHistory);
  const missedPayments = customer.loanRepaymentHistory.filter(payment => payment === 0).length;
  const totalPayments = customer.loanRepaymentHistory.length;
  const paymentSuccessRate = ((totalPayments - missedPayments) / totalPayments) * 100;

  return (
    <div>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Flex justify="space-between" align="center">
          <Button 
            type="primary" 
            icon={<ArrowLeft size={16} />} 
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          {getStatusIcon(customer.status)}
        </Flex>
        
        <Card>
          <Title level={2}>{customer.name}</Title>
          <Text type="secondary">Customer ID: {customer.customerId}</Text>
          
          <Divider />
          
          <Flex justify="space-between" wrap="wrap" gap={16}>
            <Descriptions title="Personal Information" column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="Monthly Income">
                <Text strong>${customer.monthlyIncome.toLocaleString()}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Monthly Expenses">
                <Text strong>${customer.monthlyExpenses.toLocaleString()}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Account Balance">
                <Text strong>${customer.accountBalance.toLocaleString()}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Credit Score">
                <Text strong>{customer.creditScore}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Outstanding Loans">
                <Text strong>${customer.outstandingLoans.toLocaleString()}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="DTI Ratio">
                {((customer.monthlyExpenses / customer.monthlyIncome) * 100).toFixed(1)}%
              </Descriptions.Item>
            </Descriptions>
          </Flex>
          
          <Divider />
          
          <Title level={4}>Risk Assessment</Title>
          <Flex align="center" gap={16} wrap="wrap">
            <Card style={{ width: 300, marginBottom: 16 }}>
              <Statistic 
                title="Risk Score" 
                value={customer.riskScore} 
                icon={<AlertTriangle color={getRiskColor(customer.riskScore)} />}
              />
              <Progress 
                percent={customer.riskScore} 
                strokeColor={getRiskColor(customer.riskScore)}
                showInfo={false}
                style={{ marginTop: 8 }}
              />
            </Card>
            
            <Card style={{ width: 300, marginBottom: 16 }}>
              <Statistic 
                title="Payment Success Rate" 
                value={paymentSuccessRate} 
                icon={<DollarSign color={paymentSuccessRate >= 75 ? '#52c41a' : '#f5222d'} />}
                suffix="%"
              />
              <Progress 
                percent={paymentSuccessRate} 
                strokeColor={paymentSuccessRate >= 75 ? '#52c41a' : '#f5222d'}
                showInfo={false}
                style={{ marginTop: 8 }}
              />
            </Card>
          </Flex>
          
          <Divider />
          
          <Title level={4}>Loan Repayment History</Title>
          <List
            grid={{ gutter: 16, column: 8, xs: 2, sm: 3, md: 4, lg: 6, xl: 8 }}
            dataSource={repaymentHistoryItems}
            renderItem={(item) => (
              <List.Item>
                <Card 
                  size="small"
                  style={{ 
                    textAlign: 'center',
                    borderColor: item.status === 'paid' ? '#b7eb8f' : '#ffccc7',
                    backgroundColor: item.status === 'paid' ? '#f6ffed' : '#fff2f0'
                  }}
                >
                  <div>{item.month}</div>
                  {item.status === 'paid' ? (
                    <CheckCircle size={16} color="#52c41a" />
                  ) : (
                    <XCircle size={16} color="#f5222d" />
                  )}
                  <div>{item.status === 'paid' ? 'Paid' : 'Missed'}</div>
                </Card>
              </List.Item>
            )}
          />
        </Card>
      </Space>
    </div>
  );
};

const Statistic = ({ title, value, icon, suffix = '' }: { title: string; value: number; icon: React.ReactNode; suffix?: string }) => (
  <div>
    <Flex align="center" gap={8}>
      {icon}
      <Text>{title}</Text>
    </Flex>
    <Title level={3} style={{ margin: '8px 0' }}>
      {value}{suffix}
    </Title>
  </div>
);

export default CustomerDetail;