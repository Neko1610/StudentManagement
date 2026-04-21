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
          colorPrimary: '#1890ff',
          borderRadius: 6,
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
