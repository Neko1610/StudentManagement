import { Col, Form, Input, Row, Select, message } from 'antd';
import { useEffect, useState } from 'react';
import ProfileDashboardLayout from '../../components/ProfileDashboardLayout';
import { teacherService } from '../../api/teacherService';
import { auth } from '../../utils/auth';
import client from '../../api/client';

export default function TeacherProfile() {
  const user = auth.getUser();
  const email = user?.email;

  const [profile, setProfile] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();
  
  const inputStyle = (disabled: boolean): React.CSSProperties => ({
    borderRadius: 12,
    height: 42,
    background: disabled ? '#f5f6fa' : '#fff',
  });

  useEffect(() => {
    if (!email) return;
    loadAll(email);
  }, [email]);

  const loadAll = async (email: string) => {
    try {
      setLoading(true);

      const profileData = await teacherService.getProfile(email);

      setProfile(profileData);

      form.setFieldsValue({
        ...profileData
      });

    } catch (err) {
      console.log(err);
      message.error('Load failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (values: any) => {
    if (!profile?.id) return;

    try {
      const { email, subject, ...cleanValues } = values;

      await client.put(`/teachers/${profile.id}`, cleanValues, {
        params: {
          subjectId: profile?.subject?.id // 🔥 QUAN TRỌNG NHẤT
        }
      });

      message.success('Cập nhật thành công');
      setEditing(false);
      loadAll(email!);

    } catch (err: any) {
      console.log("❌ ERROR:", err.response?.data || err);
      message.error('Update failed');
    }
  };

  return (
    <ProfileDashboardLayout
      loading={loading}
      form={form}
      fullName={profile?.fullName}
      role="Giáo viên"
      description={
        subjects.find(s => s.id === profile?.subjectId)?.name
      }
      avatarSrc={profile?.avatar}
      editing={editing}
      onEdit={() => setEditing(true)}
      onFinish={handleSave}
      profile={profile}
    >
      <Row gutter={[20, 14]}>
        <Col span={12}>
          <Form.Item label="Họ và tên" name="fullName">
            <Input disabled={!editing} style={inputStyle(!editing)} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label="Email" name="email">
            <Input disabled style={inputStyle(true)} />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item label="Số điện thoại" name="phone">
            <Input disabled={!editing} style={inputStyle(!editing)} />
          </Form.Item>
        </Col>

        {/* 🔥 SUBJECT GIỐNG ADD SCORE */}
        <Col span={12}>
          <Form.Item label="Bộ môn">
            <Input value={profile?.subject?.name} disabled />
          </Form.Item>
        </Col>

        <Col span={24}>
          <Form.Item label="Chứng chỉ" name="qualifications">
            <Input.TextArea rows={4} disabled={!editing} />
          </Form.Item>
        </Col>
      </Row>
    </ProfileDashboardLayout>
  );
}