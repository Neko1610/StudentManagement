import { Button, Form, Input, message, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { auth } from '../utils/auth';
import type { User } from '../types';

const { Title } = Typography;

export default function Login() {
  const navigate = useNavigate();

  const onFinish = async (values: { username: string; password: string }) => {
    try {
      const response = await api.post('/auth/login', values);
      const sessionUser: User = response.data.user ?? {
        id: response.data.id ?? values.username,
        email: response.data.email ?? `${values.username}@local`,
        fullName: response.data.fullName ?? values.username,
        role: response.data.role ?? 'ADMIN',
      };

      auth.setToken(response.data.token);
      auth.setUser(sessionUser);
      message.success('Login successful');
      navigate(`/${sessionUser.role.toLowerCase()}`);
    } catch (error: any) {
      message.error(error?.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '100px auto', padding: 24, background: '#fff', borderRadius: 8 }}>
      <Title level={3}>School Portal Login</Title>
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item label="Username" name="username" rules={[{ required: true, message: 'Please enter your username' }]}> 
          <Input />
        </Form.Item>
        <Form.Item label="Password" name="password" rules={[{ required: true, message: 'Please enter your password' }]}> 
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}
