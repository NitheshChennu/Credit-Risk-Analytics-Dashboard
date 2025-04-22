import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Layout, Menu, theme, Typography, Avatar, Flex, Drawer } from 'antd';
import { 
  LayoutDashboard, 
  AlertTriangle, 
  ListChecks, 
  BarChart3, 
  LogOut,
  Menu as MenuIcon
} from 'lucide-react';
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const DashboardLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const location = useLocation();
  const screens = useBreakpoint();
  const isMobile = !screens.lg;

  const {
    token: { colorBgContainer, colorBorderSecondary },
  } = theme.useToken();

  const menuItems = [
    {
      key: '/',
      icon: <LayoutDashboard size={18} />,
      label: <Link to="/">Dashboard</Link>,
    },
    {
      key: '/risk',
      icon: <AlertTriangle size={18} />,
      label: <Link to="/risk">Risk Assessment</Link>,
    },
    {
      key: '/workflow',
      icon: <ListChecks size={18} />,
      label: <Link to="/workflow">Workflow</Link>,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {isMobile ? (
        <Drawer
          closable={false}
          onClose={() => setDrawerVisible(false)}
          open={drawerVisible}
          placement="left"
          bodyStyle={{ padding: 0 }}
        >
          <Menu
            theme="dark"
            selectedKeys={[location.pathname]}
            mode="inline"
            items={menuItems}
            onClick={() => setDrawerVisible(false)}
          />
          <Menu
            theme="dark"
            mode="inline"
            selectable={false}
            items={[{
              key: 'logout',
              icon: <LogOut size={18} />,
              label: 'Log Out',
            }]}
          />
        </Drawer>
      ) : (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          breakpoint="lg"
          collapsedWidth={80}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
            zIndex: 10,
          }}
        >
          <div style={{ padding: '16px', textAlign: 'center', marginBottom: '24px' }}>
            {collapsed ? (
              <Avatar 
                shape="square" 
                icon={<BarChart3 size={24} />} 
                style={{ background: '#1677ff' }} 
              />
            ) : (
              <Title level={4} style={{ color: 'white', margin: 0 }}>
                FinRisk <span style={{ color: '#1677ff' }}>Pro</span>
              </Title>
            )}
          </div>
          <Menu
            theme="dark"
            selectedKeys={[location.pathname]}
            mode="inline"
            items={menuItems}
          />
          <div 
            style={{ 
              position: 'absolute', 
              bottom: 0, 
              width: '100%', 
              padding: '16px', 
              borderTop: '1px solid rgba(255, 255, 255, 0.1)' 
            }}
          >
            <Menu
              theme="dark"
              mode="inline"
              selectable={false}
              items={[{
                key: 'logout',
                icon: <LogOut size={18} />,
                label: 'Log Out',
              }]}
            />
          </div>
        </Sider>
      )}

      <Layout style={{ marginLeft: isMobile ? 0 : collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Header style={{ 
          padding: '0 24px', 
          background: colorBgContainer,
          position: 'sticky',
          top: 0,
          zIndex: 1,
          width: '100%',
          display: 'flex', 
          alignItems: 'center', 
          borderBottom: `1px solid ${colorBorderSecondary}`,
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
        }}>
          <Flex align="center" justify="space-between" style={{ width: '100%' }}>
            <div 
              onClick={() => isMobile ? setDrawerVisible(true) : setCollapsed(!collapsed)} 
              style={{ cursor: 'pointer', padding: '8px' }}
            >
              <MenuIcon size={20} />
            </div>
            <Flex align="center" gap={8}>
              <Avatar style={{ backgroundColor: '#1677ff' }}>RM</Avatar>
              <div>Risk Manager</div>
            </Flex>
          </Flex>
        </Header>

        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: 8,
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardLayout;
