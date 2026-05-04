import { Card, Form, Input, Button, message } from 'antd';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/authService';
import { auth } from '../utils/auth';

export default function ResetPassword() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    try {
      setLoading(true);

      await authService.resetPassword({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      message.success('Đổi mật khẩu thành công, vui lòng đăng nhập lại');

      // 👉 logout (client interceptor cũng xử lý nhưng nên chủ động)
      auth.logout();
      navigate('/login');

    } catch (err: any) {
      message.error(err?.response?.data || 'Đổi mật khẩu thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
   <Card className="reset-card">
  <div className="reset-header">
    <h2>Reset Password</h2>
    <p>Update your password to keep your account secure</p>
  </div>

  <Form form={form} layout="vertical" onFinish={onFinish}>
    <Form.Item
      name="oldPassword"
      label="Old Password"
      rules={[{ required: true, message: 'Enter old password' }]}
    >
      <Input.Password placeholder="Enter old password" />
    </Form.Item>

    <Form.Item
      name="newPassword"
      label="New Password"
      rules={[
        { required: true },
        { min: 6, message: 'Min 6 characters' },
      ]}
    >
      <Input.Password placeholder="Enter new password" />
    </Form.Item>

    <Form.Item
      name="confirmPassword"
      label="Confirm Password"
      dependencies={['newPassword']}
      rules={[
        { required: true },
        ({ getFieldValue }) => ({
          validator(_, value) {
            if (!value || getFieldValue('newPassword') === value) {
              return Promise.resolve();
            }
            return Promise.reject('Password not match');
          },
        }),
      ]}
    >
      <Input.Password placeholder="Confirm password" />
    </Form.Item>

    <Button
      type="primary"
      htmlType="submit"
      loading={loading}
      className="reset-btn"
      block
    >
      Reset Password
    </Button>
  </Form>
</Card>
  );
}