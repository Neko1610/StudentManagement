import { Col, Form, Input, Row, Select, message } from 'antd';
import { useEffect, useState } from 'react';
import ProfileDashboardLayout from '../../components/ProfileDashboardLayout';
import { parentService } from '../../api/parentService';
import { Parent } from '../../types';
import { auth } from '../../utils/auth';
import { requestService } from '../../api/requestService';

const inputStyle = { borderRadius: 12, minHeight: 42 };

export default function ParentProfile() {
  const user = auth.getUser();

  const [profile, setProfile] = useState<Parent | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();
  const [childrenCount, setChildrenCount] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  useEffect(() => {
    if (!user?.email) return;

    const init = async () => {
      try {
        setLoading(true);

        // profile
        const data = await parentService.getProfile(user.email);
        setProfile(data);

        form.setFieldsValue({
          fullName: data.fullName,
          phone: data.phone,
          email: data.email || user.email,
          address: data.address,
          gender: data.gender,
        });

        // stats
        const children = await parentService.getChildren(user.email);
        setChildrenCount(children?.length || 0);

        const requests = await requestService.getMine();
        setRequestCount(requests?.length || 0);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [user?.email]);

  const loadProfile = async () => {
    try {
      const data = await parentService.getProfile(user?.email || '');
      setProfile(data);

      form.setFieldsValue({
        fullName: data.fullName,
        phone: data.phone,
        email: data.email || user?.email,
        address: data.address,
        gender: data.gender,
      });
    } catch (error) {
      message.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (values: any) => {
    try {
      await parentService.updateProfile(user?.email || '', values); // ✅ luôn dùng email

      message.success('Profile updated successfully');
      setEditing(false);
      loadProfile();
    } catch (error) {
      message.error('Failed to update profile');
    }
  };

  return (
    <ProfileDashboardLayout
      loading={loading}
      form={form}
      fullName={profile?.fullName}
      role="Parent"
      description={
        profile?.relationship ||
        profile?.email ||
        'Phụ huynh theo dõi học tập'
      }
      avatarSrc={profile?.avatar}
      stats={[
        { label: 'Children', value: childrenCount.toString() },
        { label: 'Requests', value: requestCount.toString() },
        { label: 'Status', value: 'Active' },
      ]}
      editing={editing}
      onEdit={() => setEditing(true)}
      onFinish={handleSaveProfile}
    >
      <Row gutter={[18, 8]}>
        <Col xs={24} md={12}>
          <Form.Item label="Full Name" name="fullName" rules={[{ required: true }]}>
            <Input disabled={!editing} style={inputStyle} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="Phone" name="phone">
            <Input disabled={!editing} style={inputStyle} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="Email" name="email">
            <Input disabled style={inputStyle} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="Address" name="address">
            <Input disabled={!editing} style={inputStyle} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item label="Gender" name="gender">
            <Select disabled={!editing} style={{ minHeight: 42 }} placeholder="Select gender">
              <Select.Option value="MALE">Male</Select.Option>
              <Select.Option value="FEMALE">Female</Select.Option>
              <Select.Option value="OTHER">Other</Select.Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>
    </ProfileDashboardLayout>
  );
}
