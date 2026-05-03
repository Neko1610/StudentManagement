import { Col, Form, Input, Row, Select, message } from 'antd';
import { useEffect, useState } from 'react';
import ProfileDashboardLayout from '../../components/ProfileDashboardLayout';
import { studentService } from '../../api/studentService';
import { Student } from '../../types';
import { auth } from '../../utils/auth';

const inputStyle = { borderRadius: 12, minHeight: 42 };

export default function StudentProfile() {
  const user = auth.getUser();
  const [profile, setProfile] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const email = (user as any)?.email || (user as any)?.username;

      if (!email) return;

      const data = await studentService.getProfile(email);

      setProfile(data);

      form.setFieldsValue({
        fullName: data.fullName,
        studentCode: data.studentCode,
        className: data.className,
        dob: data.dob?.split('T')[0],
        gender: data.gender,
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
      if (!profile?.classId) {
        message.error("ClassId không hợp lệ");
        return;
      }

      const { studentCode, className, ...cleanValues } = values;

      await studentService.updateProfile(
        profile.id,
        cleanValues,
        profile.classId
      );
      message.success('Profile updated successfully');
      setEditing(false);
      loadProfile();

    } catch (error: any) {
      console.log("❌ ERROR:", error.response?.data || error);
      message.error('Failed to update profile');
    }
  };
  return (
    <ProfileDashboardLayout
      loading={loading}
      form={form}
      fullName={profile?.fullName}
      role="Student"
      description={profile?.className || profile?.studentCode || 'Học sinh đang theo học'}
      stats={[
        { label: 'Class', value: profile?.className || '--' },
        { label: 'Code', value: profile?.studentCode || '--' },
        { label: 'GPA', value: '--' },
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
          <Form.Item label="Student Code" name="studentCode">
            <Input disabled style={inputStyle} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="Class" name="className">
            <Input disabled style={inputStyle} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="Date of Birth" name="dob">
            <Input disabled={!editing} type="date" style={inputStyle} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="Gender" name="gender">
            <Select
              disabled={!editing}
              style={{ minHeight: 42 }}
              options={[
                { value: 'MALE', label: 'Male' },
                { value: 'FEMALE', label: 'Female' },
              ]}
            />
          </Form.Item>
        </Col>
      </Row>
    </ProfileDashboardLayout>
  );
}
