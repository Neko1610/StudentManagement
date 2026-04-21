import { Card, Form, Button, Input, message, Spin } from 'antd';
import { useState, useEffect } from 'react';
import { teacherService } from '../../api/teacherService';
import { Teacher } from '../../types';
import { auth } from '../../utils/auth';

export default function TeacherProfile() {
  const user = auth.getUser();
  const [profile, setProfile] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await teacherService.getProfile(user?.id || '');
      setProfile(data);
      form.setFieldsValue(data);
    } catch (error) {
      message.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (values: any) => {
    try {
      await teacherService.updateProfile(user?.id || '', values);
      message.success('Profile updated successfully');
    } catch (error) {
      message.error('Failed to update profile');
    }
  };

  return (
    <Spin spinning={loading}>
      <Card title="My Profile">
        <Form form={form} layout="vertical" onFinish={handleSaveProfile}>
          <Form.Item label="Full Name" name="fullName">
            <Input />
          </Form.Item>

          <Form.Item label="Email" name="email">
            <Input type="email" />
          </Form.Item>

          <Form.Item label="Phone" name="phone">
            <Input />
          </Form.Item>

          <Form.Item label="Address" name="address">
            <Input />
          </Form.Item>

          <Form.Item label="Specialization" name="specialization">
            <Input />
          </Form.Item>

          <Form.Item label="Qualifications" name="qualifications">
            <Input.TextArea />
          </Form.Item>

          <Button type="primary" htmlType="submit">
            Save Profile
          </Button>
        </Form>
      </Card>
    </Spin>
  );
}
