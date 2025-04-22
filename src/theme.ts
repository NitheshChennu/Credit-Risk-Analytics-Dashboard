import type { ThemeConfig } from 'antd';

const theme: ThemeConfig = {
  token: {
    colorPrimary: '#1677ff',
    colorSuccess: '#52c41a',
    colorWarning: '#faad14',
    colorError: '#f5222d',
    colorInfo: '#1677ff',
    borderRadius: 6,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
  },
  components: {
    Card: {
      colorBorderSecondary: '#f0f0f0',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
    },
    Table: {
      colorBgContainer: '#ffffff',
      headerBg: '#fafafa',
    },
  },
};

export default theme;