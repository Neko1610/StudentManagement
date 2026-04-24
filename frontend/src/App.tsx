import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Button, ConfigProvider, Result } from 'antd';
import AppRoutes from './routes';
import './App.css';

interface AppErrorBoundaryState {
  hasError: boolean;
}

class AppErrorBoundary extends React.Component<React.PropsWithChildren, AppErrorBoundaryState> {
  public state: AppErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error) {
    console.error('App render failed:', error);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Result
          status="error"
          title="The application could not load"
          subTitle="Please refresh the page. If the problem continues, check the route and API configuration."
          extra={
            <Button type="primary" onClick={() => window.location.reload()}>
              Reload
            </Button>
          }
        />
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#635bff',
          colorInfo: '#3b82f6',
          colorSuccess: '#16a34a',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',
          colorText: '#172033',
          colorTextSecondary: '#667085',
          colorBgLayout: '#f5f7fb',
          colorBgContainer: '#ffffff',
          colorBorder: '#e7ebf3',
          borderRadius: 12,
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          boxShadow:
            '0 16px 40px rgba(23, 32, 51, 0.08), 0 2px 8px rgba(23, 32, 51, 0.04)',
        },
        components: {
          Button: {
            borderRadius: 10,
            controlHeight: 40,
            fontWeight: 600,
          },
          Card: {
            borderRadiusLG: 16,
            paddingLG: 24,
          },
          Table: {
            headerBg: '#f8fafc',
            headerColor: '#667085',
            rowHoverBg: '#f7f9ff',
          },
        },
      }}
    >
      <AppErrorBoundary>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AppErrorBoundary>
    </ConfigProvider>
  );
}

export default App;
