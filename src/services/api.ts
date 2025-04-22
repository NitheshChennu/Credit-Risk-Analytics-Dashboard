import axios from 'axios';
import { Customer, StatusType } from '../types/customer';

const API_URL = 'http://localhost:3001/api';

export const fetchCustomers = async (): Promise<Customer[]> => {
  const response = await axios.get(`${API_URL}/customers`);
  return response.data;
};

export const updateCustomerStatus = async (customerId: string, status: StatusType): Promise<Customer> => {
  const response = await axios.patch(`${API_URL}/customers/${customerId}`, { status });
  return response.data;
};

export const createAlert = async (customerId: string, riskScore: number): Promise<void> => {
  await axios.post(`${API_URL}/alerts`, { customerId, riskScore });
};