import {
  Avatar,
  Button,
  Card,
  Form,
  Spin,
  Tag,
  Typography,
} from 'antd';
import { EditOutlined, SaveOutlined, UserOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface Props {
  loading: boolean;
  form: any;
  fullName?: string;
  role?: string;
  description?: string;
  avatarSrc?: string;
  stats?: { label: string; value: string }[];
  editing: boolean;
  onEdit: () => void;
  onFinish: (values: any) => void;
  children: React.ReactNode;
  profile?: any;
}

export default function ProfileDashboardLayout({
  loading,
  form,
  fullName,
  role,
  description,
  avatarSrc,
  stats = [],
  editing,
  onEdit,
  onFinish,
  profile,
  children,
}: Props) {
  return (
    <Spin spinning={loading}>
      <div
        style={{
          display: 'flex',
          gap: 24,
          width: '100%',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
        }}
      >
        {/* LEFT */}
        <div style={{ width: 280 }}>
          <Card style={{ borderRadius: 16 }} bodyStyle={{ padding: 20 }}>

            {/* Avatar */}
            <div
              style={{
                width: 120,
                height: 120,
                margin: '0 auto',
                borderRadius: 16,
                border: '3px solid #6366f1',
                padding: 6,
              }}
            >
              <Avatar
                src={avatarSrc}
                icon={<UserOutlined />}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: 12,
                }}
              />
            </div>

            <Title level={5} style={{ marginTop: 16, textAlign: 'center' }}>
              {fullName}
            </Title>

            <div style={{ textAlign: 'center' }}>
              <Tag color="purple">{role}</Tag>
            </div>

            <Text type="secondary" style={{ display: 'block', marginTop: 10 }}>
              {description}
            </Text>

            {/* Stats */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-around',
                marginTop: 20,
              }}
            >
              {stats.map((s, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 600 }}>{s.value}</div>
                  <div style={{ fontSize: 12, color: '#888' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Certificates */}
            <div style={{ marginTop: 20 }}>
              <Text strong>Chứng chỉ chuyên môn</Text>

              <ul style={{ paddingLeft: 16, marginTop: 8 }}>
                {(profile?.qualifications || "")
                  .split(',')
                  .filter(Boolean)
                  .map((q: string, i: number) => (
                    <li key={i}>{q.trim()}</li>
                  ))}
              </ul>
            </div>
          </Card>
        </div>

        {/* RIGHT */}
        <div style={{ flex: 1 }}>
          <Card style={{ borderRadius: 16 }} bodyStyle={{ padding: 24 }}>

            {/* Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  borderLeft: '4px solid #6366f1',
                  paddingLeft: 10,
                  fontWeight: 600,
                }}
              >
                Thông tin chi tiết
              </div>

              {editing ? (
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  onClick={() => form.submit()}
                >
                  Lưu
                </Button>
              ) : (
                <Button icon={<EditOutlined />} onClick={onEdit}>
                  Chỉnh sửa
                </Button>
              )}
            </div>

            {/* FORM */}
            <Form form={form} layout="vertical" onFinish={onFinish}>
              {children}
            </Form>

            {/* Notice */}
            <div
              style={{
                marginTop: 20,
                background: '#fff4e5',
                padding: 16,
                borderRadius: 12,
                color: '#ad6800',
              }}
            >
              Một số thông tin chỉ hiển thị nội bộ trong trường học.
            </div>
          </Card>
        </div>
      </div>
    </Spin>
  );
}