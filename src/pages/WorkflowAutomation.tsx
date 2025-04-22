import React, { useState, useEffect } from 'react';
import { Table, Card, Typography, Space, Select, message, Flex, Spin, Tag, Modal } from 'antd';
import { Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { fetchCustomers, updateCustomerStatus, createAlert } from '../services/api';
import { CustomerWithRiskScore, StatusType } from '../types/customer';
import { addRiskScoresToCustomers } from '../utils/riskCalculator';

const { Title, Text } = Typography;
const { Option } = Select;

const WorkflowAutomation: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerWithRiskScore[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updatingCustomerId, setUpdatingCustomerId] = useState<string | null>(null);
  const [alertModalVisible, setAlertModalVisible] = useState<boolean>(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithRiskScore | null>(null);
  
  useEffect(() => {
    loadCustomers();
  }, []);
  
  const loadCustomers = async () => {
    try {
      setLoading(true);
      const data = await fetchCustomers();
      setCustomers(addRiskScoresToCustomers(data));
    } catch (error) {
      console.error('Error loading customer data:', error);
      message.error('Failed to load customer data');
    } finally {
      setLoading(false);
    }
  };
  
  const handleStatusChange = async (customerId: string, newStatus: StatusType) => {
    try {
      setUpdatingCustomerId(customerId);
      await updateCustomerStatus(customerId, newStatus);
      
      // Update local state
      setCustomers(prevCustomers => 
        prevCustomers.map(customer => 
          customer.customerId === customerId 
            ? { ...customer, status: newStatus }
            : customer
        )
      );
      
      message.success(`Status updated successfully to ${newStatus}`);
      
      // Check if we need to create an alert for high-risk customers that are approved
      const customer = customers.find(c => c.customerId === customerId);
      if (newStatus === 'Approved' && customer && customer.riskScore >= 70) {
        setSelectedCustomer(customer);
        setAlertModalVisible(true);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Failed to update customer status');
    } finally {
      setUpdatingCustomerId(null);
    }
  };
  
  const createRiskAlert = async () => {
    if (!selectedCustomer) return;
    
    try {
      await createAlert(selectedCustomer.customerId, selectedCustomer.riskScore);
      message.success('High risk alert created successfully');
    } catch (error) {
      console.error('Error creating alert:', error);
      message.error('Failed to create risk alert');
    } finally {
      setAlertModalVisible(false);
      setSelectedCustomer(null);
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Review': return <Clock size={16} color="#1677ff" />;
      case 'Approved': return <CheckCircle size={16} color="#52c41a" />;
      case 'Rejected': return <XCircle size={16} color="#f5222d" />;
      default: return null;
    }
  };
  
  const getStatusTag = (status: StatusType) => {
    let color = 'processing';
    if (status === 'Approved') color = 'success';
    if (status === 'Rejected') color = 'error';
    return <Tag icon={getStatusIcon(status)} color={color}>{status}</Tag>;
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
    },
    {
      title: 'Risk Level',
      key: 'riskLevel',
      render: (text: string, record: CustomerWithRiskScore) => getRiskTag(record.riskScore),
      filters: [
        { text: 'Low Risk', value: 'low' },
        { text: 'Medium Risk', value: 'medium' },
        { text: 'High Risk', value: 'high' },
      ],
      onFilter: (value: string, record: CustomerWithRiskScore) => {
        if (value === 'low') return record.riskScore < 30;
        if (value === 'medium') return record.riskScore >= 30 && record.riskScore < 70;
        return record.riskScore >= 70;
      },
    },
    {
      title: 'Current Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: StatusType) => getStatusTag(status),
      filters: [
        { text: 'Review', value: 'Review' },
        { text: 'Approved', value: 'Approved' },
        { text: 'Rejected', value: 'Rejected' },
      ],
      onFilter: (value: string, record: CustomerWithRiskScore) => record.status === value,
    },
    {
      title: 'Update Status',
      key: 'action',
      render: (text: string, record: CustomerWithRiskScore) => (
        <Space size="middle">
          <Select
            defaultValue={record.status}
            style={{ width: 120 }}
            onChange={(value: StatusType) => handleStatusChange(record.customerId, value)}
            loading={updatingCustomerId === record.customerId}
            disabled={updatingCustomerId === record.customerId}
          >
            <Option value="Review">Review</Option>
            <Option value="Approved">Approve</Option>
            <Option value="Rejected">Reject</Option>
          </Select>
        </Space>
      ),
    },
  ];
  
  const pendingReviewCount = customers.filter(c => c.status === 'Review').length;
  
  if (loading) {
    return (
      <Flex align="center" justify="center" style={{ height: '100%', minHeight: '400px' }}>
        <Spin size="large" />
      </Flex>
    );
  }

  return (
    <div>
      <Title level={2}>Workflow Automation</Title>
      
      <Card 
        title={
          <Flex align="center" gap={8}>
            <Clock size={20} />
            <span>Pending Reviews</span>
          </Flex>
        } 
        extra={<Tag color="blue">{pendingReviewCount} customers</Tag>}
        style={{ marginBottom: 24 }}
      >
        <Text>
          There are currently {pendingReviewCount} customers awaiting review. 
          Update their status to move them through the workflow pipeline.
        </Text>
      </Card>
      
      <Card title="Customer Workflow Management" bordered={false}>
        <Table
          dataSource={customers}
          columns={columns}
          rowKey="customerId"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
        />
      </Card>
      
      <Modal
        title={
          <Flex align="center" gap={8}>
            <AlertTriangle size={20} color="#f5222d" />
            <span>High Risk Alert</span>
          </Flex>
        }
        open={alertModalVisible}
        onOk={createRiskAlert}
        onCancel={() => setAlertModalVisible(false)}
        okText="Create Alert"
        cancelText="Cancel"
      >
        <p>
          Warning: You are approving a high-risk customer 
          ({selectedCustomer?.name}, Risk Score: {selectedCustomer?.riskScore}).
        </p>
        <p>
          Do you want to create a risk alert for the risk officer team?
        </p>
      </Modal>
    </div>
  );
};

export default WorkflowAutomation;