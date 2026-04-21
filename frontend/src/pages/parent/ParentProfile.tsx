import { Card, Form, Button, Input, message, Spin } from 'antd';
import { useState, useEffect } from 'react';
import { parentService } from '../../api/parentService';
import { Parent } from '../../types';
import { auth } from '../../utils/auth';

export default function ParentProfile() {
  const user = auth.getUser();

  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await parentService.getProfile(user?.email || '');
      form.setFieldsValue(data);
    } catch (error) {
      message.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (values: any) => {
    try {
      await parentService.updateProfile(user?.email || '', values);
      message.success('Profile updated successfully');
    } catch (error) {
      message.error('Failed to update profile');
    }
  };

  return (
    <Spin spinning={loading}>
      <Card title="My Profile">
        <Form form={form} layout="vertical" onFinish={handleSaveProfile}>

          <Form.Item label="Full Name" name="fullName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Email">
            <Input value={user?.email} disabled />
          </Form.Item>

          <Form.Item label="Phone" name="phone">
            <Input />
          </Form.Item>

          <Form.Item label="Occupation" name="job">
            <Input />
          </Form.Item>

          <Button type="primary" htmlType="submit">
            Save Profile
          </Button>
        </Form>
      </Card>
    </Spin>
  );
}