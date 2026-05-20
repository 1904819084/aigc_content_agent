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
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#0891B2',
          colorInfo: '#22D3EE',
          colorSuccess: '#22c55e',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',
          borderRadius: 20,
          colorBgLayout: '#ecfeff',
          colorBgContainer: '#ffffff',
          colorBgElevated: '#ffffff',
          colorText: '#164E63',
          colorTextSecondary: '#527589',
          colorBorder: 'rgba(14, 116, 144, 0.14)',
          colorBorderSecondary: 'rgba(14, 116, 144, 0.08)',
          boxShadowSecondary: '0 18px 48px rgba(8, 145, 178, 0.12)',
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "PingFang SC", sans-serif',
        },
        components: {
          Card: {
            colorBgContainer: '#ffffff',
            headerFontSize: 16,
          },
          Table: {
            colorBgContainer: 'transparent',
            headerBg: '#f4fbfc',
            headerColor: '#527589',
            rowHoverBg: '#f0fdff',
            borderColor: 'rgba(14, 116, 144, 0.08)',
          },
          Modal: {
            contentBg: '#ffffff',
            headerBg: '#ffffff',
          },
          Button: {
            primaryShadow: '0 12px 30px rgba(8, 145, 178, 0.24)',
          },
          Input: {
            activeBorderColor: '#22D3EE',
            hoverBorderColor: '#22D3EE',
          },
          Collapse: {
            headerBg: '#ffffff',
            contentBg: '#fbfeff',
          },
          Tag: {
            defaultBg: '#f4fbfc',
            defaultColor: '#164E63',
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
