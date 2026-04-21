import { Button, Form, Input, Checkbox, Typography, Alert } from 'antd';
import { MailOutlined, LockOutlined, EyeInvisibleOutlined, EyeTwoTone, LoginOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { auth } from '../utils/auth';
import type { User } from '../types';
import { useState } from 'react';

const { Title, Text, Link } = Typography;

export default function Login() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
      navigate(`/${sessionUser.role.toLowerCase()}`);
    } catch (error: any) {
      setErrorMsg(error?.response?.data?.error || 'The credentials provided do not match our records.');
    }
  };

  return (
    <div style={{ 
      backgroundColor: '#f8f9fa', 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: '"Inter", sans-serif'
    }}>
      {/* Decorative Background Elements */}
      <div style={{ position: 'absolute', top: '-10%', left: '-10%', width: '40%', height: '40%', borderRadius: '50%', background: 'rgba(53, 37, 205, 0.05)', filter: 'blur(120px)' }}></div>
      <div style={{ position: 'absolute', bottom: '-10%', right: '-10%', width: '40%', height: '40%', borderRadius: '50%', background: 'rgba(88, 87, 155, 0.05)', filter: 'blur(120px)' }}></div>

      <div style={{ width: '100%', maxWidth: 440, zIndex: 10 }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ 
            backgroundColor: '#3525cd', 
            width: 64, 
            height: 64, 
            borderRadius: 12, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 24px',
            boxShadow: '0 10px 15px -3px rgba(53, 37, 205, 0.2)'
          }}>
            <span style={{ color: 'white', fontSize: 32 }}>🎓</span>
          </div>
          <Title level={1} style={{ 
            margin: '0 0 8px', 
            fontWeight: 800, 
            fontSize: 30, 
            letterSpacing: '-0.025em',
            fontFamily: '"Manrope", sans-serif'
          }}>
            Scholastic Sanctuary
          </Title>
          <Text style={{ color: '#464555', fontWeight: 500 }}>Academic Atelier Administrative Portal</Text>
        </div>

        {/* Main Login Card (Glass Panel) */}
        <div style={{ 
          background: 'rgba(255, 255, 255, 0.7)', 
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          padding: '40px', 
          borderRadius: 16, 
          border: '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: '0 20px 40px rgba(25, 28, 29, 0.06)'
        }}>
          
          {errorMsg && (
            <Alert
              message={<Text strong style={{ color: '#93000a', fontSize: 14 }}>Authentication Failed</Text>}
              description={<Text style={{ color: '#93000a', opacity: 0.8, fontSize: 12 }}>{errorMsg}</Text>}
              type="error"
              showIcon
              style={{ 
                marginBottom: 24, 
                backgroundColor: 'rgba(255, 218, 214, 0.5)', 
                border: 'none', 
                borderLeft: '4px solid #ba1a1a',
                borderRadius: 4 
              }}
            />
          )}

          <Form layout="vertical" onFinish={onFinish} requiredMark={false} size="large">
            <Form.Item 
              label={<Text strong style={{ fontSize: 11, color: '#464555', letterSpacing: '0.1em' }}>INSTITUTIONAL EMAIL</Text>} 
              name="username"
              rules={[{ required: true, message: 'Please enter your email' }]}
            >
              <Input 
                prefix={<MailOutlined style={{ color: '#777587', marginRight: 8 }} />} 
                placeholder="admin@sanctuary.edu" 
                style={{ 
                  backgroundColor: 'rgba(225, 227, 228, 0.5)', 
                  border: 'none', 
                  borderRadius: 8,
                  padding: '12px 16px'
                }}
              />
            </Form.Item>

            <Form.Item 
              label={
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <Text strong style={{ fontSize: 11, color: '#464555', letterSpacing: '0.1em' }}>ACCESS PASSWORD</Text>
                  <Link href="#" style={{ fontSize: 12, color: '#3525cd', fontWeight: 600 }}>Forgot password?</Link>
                </div>
              } 
              name="password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password 
                prefix={<LockOutlined style={{ color: '#777587', marginRight: 8 }} />}
                placeholder="••••••••"
                iconRender={visible => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                style={{ 
                  backgroundColor: 'rgba(225, 227, 228, 0.5)', 
                  border: 'none', 
                  borderRadius: 8,
                  padding: '12px 16px'
                }}
              />
            </Form.Item>

            <Form.Item name="remember" valuePropName="checked">
              <Checkbox><Text style={{ color: '#464555', fontSize: 14, fontWeight: 500 }}>Maintain session for 30 days</Text></Checkbox>
            </Form.Item>

            <Button 
              type="primary" 
              htmlType="submit" 
              block 
              style={{ 
                height: 56, 
                backgroundColor: '#3525cd', 
                borderRadius: 8, 
                fontSize: 16, 
                fontWeight: 700,
                boxShadow: '0 10px 20px rgba(53, 37, 205, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                border: 'none'
              }}
            >
              <span>Secure Sign In</span>
              <LoginOutlined style={{ fontSize: 18 }} />
            </Button>
          </Form>

          <div style={{ textAlign: 'center', marginTop: 32, paddingTop: 32, borderTop: '1px solid rgba(119, 117, 135, 0.1)' }}>
            <Text style={{ fontSize: 14, color: '#464555', fontWeight: 500 }}>Need technical assistance? </Text>
            <Link href="#" style={{ color: '#3525cd', fontWeight: 700, fontSize: 14, textDecoration: 'underline', textUnderlineOffset: '4px' }}>Contact Support</Link>
          </div>
        </div>

        {/* Footer Branding */}
        <div style={{ marginTop: 48, textAlign: 'center' }}>
           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: 24, opacity: 0.3, userSelect: 'none' }}>
              <span style={{ fontSize: 48, fontWeight: 900, fontFamily: '"Manrope", sans-serif' }}>AA</span>
              <div style={{ height: 40, width: 1, backgroundColor: '#777587' }}></div>
              <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em' }}>ESTABLISHED</div>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em' }}>MMXXIV</div>
              </div>
           </div>
           <Text style={{ fontSize: 11, color: '#777587', fontWeight: 700, letterSpacing: '0.2em', opacity: 0.5 }}>
             © 2024 SCHOLASTIC SANCTUARY • V2.4.1
           </Text>
        </div>
      </div>
    </div>
  );
}