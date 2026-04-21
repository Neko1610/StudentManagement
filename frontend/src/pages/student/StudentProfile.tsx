import { Card, Form, Button, Input, message, Spin, Select} from 'antd';
import { useState, useEffect } from 'react';
import { studentService } from '../../api/studentService';
import { Student } from '../../types';
import { auth } from '../../utils/auth';

export default function StudentProfile() {
  const user = auth.getUser();
  const [profile, setProfile] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      if (!user?.id) return;

      const data = await studentService.getProfile(user.id);

      setProfile(data);

      form.setFieldsValue({
        ...data,
        dob: data.dob?.split('T')[0] // fix format date
      });

    } catch (error) {
      message.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (values: any) => {
    try {
      await studentService.updateProfile(Number(user?.id), values);
      message.success('Profile updated successfully');
    } catch (error) {
      message.error('Failed to update profile');
    }
  };

  return (
    <Spin spinning={loading}>
      <Card title="My Profile">

        {/* 🔥 INFO STATIC */}
        <div style={{ marginBottom: 20 }}>
          <p><b>Student Code:</b> {profile?.studentCode}</p>
          <p><b>Email:</b> {profile?.email}</p>
          <p><b>Class:</b> {profile?.className}</p>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSaveProfile}>

          <Form.Item label="Full Name" name="fullName">
            <Input />
          </Form.Item>

          {/* ❌ KHÔNG CHO SỬA EMAIL */}
          <Form.Item label="Email">
            <Input value={profile?.email} disabled />
          </Form.Item>

          <Form.Item label="Phone" name="phone">
            <Input />
          </Form.Item>

          {/* 🔥 FIX DOB */}
          <Form.Item label="Date of Birth" name="dob">
            <Input type="date" />
          </Form.Item>

          <Form.Item label="Gender" name="gender">
            <Select>
              <Select.Option value="MALE">Male</Select.Option>
              <Select.Option value="FEMALE">Female</Select.Option>
            </Select>
          </Form.Item>

          <Button type="primary" htmlType="submit">
            Save Profile
          </Button>
        </Form>
      </Card>
    </Spin>
  );
}