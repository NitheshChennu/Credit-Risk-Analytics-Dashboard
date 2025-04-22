import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import RiskAssessment from './pages/RiskAssessment';
import WorkflowAutomation from './pages/WorkflowAutomation';
import CustomerDetail from './pages/CustomerDetail';
import theme from './theme';

function App() {
  return (
    <ConfigProvider theme={theme}>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="risk" element={<RiskAssessment />} />
          <Route path="workflow" element={<WorkflowAutomation />} />
          <Route path="customer/:id" element={<CustomerDetail />} />
        </Route>
      </Routes>
    </ConfigProvider>
  );
}

export default App;