import { CameraOutlined, EditOutlined, SaveOutlined, UserOutlined } from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd';
import type { FormInstance } from 'antd';
import type { ReactNode } from 'react';

const { Text, Title } = Typography;

export interface ProfileStat {
  label: string;
  value: ReactNode;
}

interface ProfileDashboardLayoutProps {
  loading: boolean;
  form: FormInstance;
  fullName?: string;
  role: 'Teacher' | 'Student' | 'Parent';
  description?: string;
  avatarSrc?: string;
  stats: ProfileStat[];
  editing: boolean;
  onEdit: () => void;
  onFinish: (values: any) => void;
  children: ReactNode;
}

const roleColors: Record<ProfileDashboardLayoutProps['role'], string> = {
  Teacher: 'geekblue',
  Student: 'blue',
  Parent: 'purple',
};

export default function ProfileDashboardLayout({
  loading,
  form,
  fullName,
  role,
  description,
  avatarSrc,
  stats,
  editing,
  onEdit,
  onFinish,
  children,
}: ProfileDashboardLayoutProps) {
  const displayName = fullName || 'Profile';

  return (
    <Spin spinning={loading}>
      <Row gutter={[24, 24]} align="stretch">
        <Col xs={24} lg={8}>
          <Card
            bordered={false}
            style={{
              height: '100%',
              borderRadius: 20,
              boxShadow: '0 18px 45px rgba(23, 32, 51, 0.08)',
            }}
            bodyStyle={{ padding: 28, textAlign: 'center' }}
          >
            <Avatar
              size={132}
              src={avatarSrc}
              icon={!fullName ? <UserOutlined /> : undefined}
              style={{
                background: 'linear-gradient(135deg, #eef2ff 0%, #dbeafe 100%)',
                border: '6px solid #ffffff',
                boxShadow: '0 16px 32px rgba(59, 130, 246, 0.18)',
                color: '#3525cd',
                fontSize: 48,
                fontWeight: 700,
              }}
            >
              {fullName?.charAt(0).toUpperCase()}
            </Avatar>

            <div style={{ marginTop: 18 }}>
              <Button icon={<CameraOutlined />} style={{ borderRadius: 999 }}>
                Change Avatar
              </Button>
            </div>

            <Title level={3} style={{ marginBottom: 8, marginTop: 22 }}>
              {displayName}
            </Title>

            <Tag
              color={roleColors[role]}
              style={{ borderRadius: 999, fontWeight: 700, padding: '4px 14px' }}
            >
              {role}
            </Tag>

            <div style={{ margin: '16px auto 0', maxWidth: 280 }}>
              <Text type="secondary">{description}</Text>
            </div>

            <Divider style={{ margin: '28px 0 20px' }} />

            <Row gutter={[12, 12]}>
              {stats.map((item) => (
                <Col xs={8} key={item.label}>
                  <div
                    style={{
                      minHeight: 86,
                      borderRadius: 16,
                      background: '#f7f9ff',
                      border: '1px solid #e7ebf3',
                      padding: '14px 8px',
                    }}
                  >
                    <div style={{ color: '#172033', fontSize: 20, fontWeight: 800 }}>
                      {item.value}
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {item.label}
                    </Text>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card
            bordered={false}
            title={
              <Space direction="vertical" size={2}>
                <Title level={4} style={{ margin: 0 }}>
                  Thông tin chi tiết
                </Title>
                <Text type="secondary">Cập nhật thông tin hồ sơ cá nhân</Text>
              </Space>
            }
            extra={
              <Space wrap>
                <Button icon={<EditOutlined />} onClick={onEdit} disabled={editing}>
                  Chỉnh sửa
                </Button>
                <Button type="primary" icon={<SaveOutlined />} htmlType="submit" form="profile-detail-form">
                  Lưu
                </Button>
              </Space>
            }
            style={{
              minHeight: '100%',
              borderRadius: 20,
              boxShadow: '0 18px 45px rgba(23, 32, 51, 0.08)',
            }}
            bodyStyle={{ padding: 28 }}
          >
            <Form
              id="profile-detail-form"
              form={form}
              layout="vertical"
              onFinish={onFinish}
              requiredMark={false}
            >
              {children}
            </Form>
          </Card>
        </Col>
      </Row>
    </Spin>
  );
}
