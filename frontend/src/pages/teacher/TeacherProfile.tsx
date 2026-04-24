import { Col, Form, Input, Row, message } from 'antd';
import { useEffect, useState } from 'react';
import ProfileDashboardLayout from '../../components/ProfileDashboardLayout';
import { teacherService } from '../../api/teacherService';
import { Teacher } from '../../types';
import { auth } from '../../utils/auth';

const inputStyle = { borderRadius: 12, minHeight: 42 };

export default function TeacherProfile() {
  const user = auth.getUser();

  const [profile, setProfile] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await teacherService.getProfile(user?.email || '');
      setProfile(data);

      form.setFieldsValue({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        specialization: data.specialization,
        qualifications: data.qualifications,
      });
    } catch (error) {
      console.error(error);
      message.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (values: any) => {
    try {
      await teacherService.updateProfile(user?.id || '', values);
      message.success('Profile updated successfully');
      setEditing(false);
      loadProfile();
    } catch (error) {
      console.error(error);
      message.error('Failed to update profile');
    }
  };

  return (
    <ProfileDashboardLayout
      loading={loading}
      form={form}
      fullName={profile?.fullName}
      role="Teacher"
      description={profile?.specialization || profile?.email || 'Giáo viên phụ trách giảng dạy'}
      avatarSrc={profile?.avatar}
      stats={[
        { label: 'Classes', value: profile?.homeroomClassName ? '1' : '0' },
        { label: 'Students', value: '--' },
        { label: 'Rating', value: '4.9' },
      ]}
      editing={editing}
      onEdit={() => setEditing(true)}
      onFinish={handleSaveProfile}
    >
      <Row gutter={[18, 8]}>
        <Col xs={24} md={12}>
          <Form.Item label="Full Name" name="fullName">
            <Input disabled={!editing} style={inputStyle} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="Email" name="email">
            <Input disabled style={inputStyle} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="Phone" name="phone">
            <Input disabled={!editing} style={inputStyle} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="Address" name="address">
            <Input disabled={!editing} style={inputStyle} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="Specialization" name="specialization">
            <Input disabled={!editing} style={inputStyle} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="Qualifications" name="qualifications">
            <Input disabled={!editing} style={inputStyle} />
          </Form.Item>
        </Col>
      </Row>
    </ProfileDashboardLayout>
  );
}
