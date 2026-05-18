import React from 'react';
import ReactDOM from 'react-dom/client';
import { App as AntApp, ConfigProvider, theme } from 'antd';
import { App } from './App';
import 'antd/dist/reset.css';
import './global.less';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#f43f5e',
          colorInfo: '#38bdf8',
          colorSuccess: '#22c55e',
          colorWarning: '#f59e0b',
          colorError: '#f43f5e',
          borderRadius: 18,
          colorBgLayout: '#050816',
          colorBgContainer: '#0f172a',
          colorText: '#f8fafc',
          colorTextSecondary: '#94a3b8',
          colorBorderSecondary: 'rgba(148, 163, 184, 0.18)',
          fontFamily: '"Fira Sans", -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
        },
        components: {
          Card: {
            colorBgContainer: 'rgba(15, 23, 42, 0.78)',
          },
          Table: {
            colorBgContainer: 'transparent',
            headerBg: 'rgba(15, 23, 42, 0.92)',
            headerColor: '#cbd5e1',
            rowHoverBg: 'rgba(30, 41, 59, 0.78)',
            borderColor: 'rgba(148, 163, 184, 0.14)',
          },
          Modal: {
            contentBg: '#0f172a',
            headerBg: '#0f172a',
          },
        },
      }}
    >
      <AntApp>
        <App />
      </AntApp>
    </ConfigProvider>
  </React.StrictMode>,
);
