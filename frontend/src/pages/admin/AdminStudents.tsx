import {
  Card,
  Table,
  Button,
  Space,
  Typography,
  Tag,
  Avatar,
  Input,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { adminService } from '../../api/adminService';

const { Title, Text } = Typography;

export default function StudentUI() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await adminService.getStudents();
      setStudents(res);
    } catch {
      console.log('load error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const columns = [
    {
      title: 'NAME',
      dataIndex: 'fullName',
      render: (text: string) => (
        <Space>
          <Avatar
            style={{
              background: '#E2DFFF',
              color: '#3525CD',
              fontWeight: 'bold',
            }}
          >
            {text?.charAt(0)}
          </Avatar>
          <Text strong style={{ color: '#1B1B24' }}>
            {text}
          </Text>
        </Space>
      ),
    },
    {
      title: 'EMAIL',
      dataIndex: 'email',
      render: (email: string) => (
        <Text type="secondary">{email}</Text>
      ),
    },
    {
      title: 'PHONE',
      dataIndex: 'phone',
    },
    {
      title: 'CLASS',
      dataIndex: 'className',
      render: (c: string) => (
        <Tag
          style={{
            borderRadius: 20,
            padding: '0 12px',
            fontWeight: 'bold',
          }}
          color="blue"
        >
          {c}
        </Tag>
      ),
    },
    {
      title: 'STATUS',
      dataIndex: 'status',
      render: (s: string) => (
        <Tag
          color={s === 'ACTIVE' ? 'green' : 'orange'}
          style={{ borderRadius: 20 }}
        >
          {s || 'ACTIVE'}
        </Tag>
      ),
    },
    {
      title: 'ACTIONS',
      align: 'right' as const,
      render: (_: any, record: any) => (
        <Space>
          <Button
            icon={<EditOutlined style={{ color: '#3525CD' }} />}
            type="text"
            className="hover:bg-indigo-50"
          />
          <Button
            danger
            icon={<DeleteOutlined />}
            type="text"
            className="hover:bg-red-50"
          />
        </Space>
      ),
    },
  ];

  return (
    <div
      style={{
        padding: 32,
        background: '#F8F9FA',
        minHeight: '100vh',
      }}
    >
      {/* HEADER */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <Title
            level={2}
            style={{
              margin: 0,
              fontWeight: 800,
              color: '#1E00A9',
            }}
          >
            Student Directory
          </Title>
          <Text type="secondary">
            Manage and monitor academic records for all students
          </Text>
        </div>

        <Space size="middle">
          <Input
            prefix={<SearchOutlined />}
            placeholder="Search student..."
            style={{
              width: 260,
              borderRadius: 20,
            }}
          />

          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{
              background: '#3525CD',
              borderRadius: 10,
              height: 40,
              fontWeight: 'bold',
              boxShadow: '0 4px 10px rgba(53,37,205,0.2)',
            }}
          >
            Add Student
          </Button>
        </Space>
      </div>

      {/* TABLE CARD */}
      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          borderLeft: '4px solid #3525CD',
        }}
        title={
          <div>
            <div
              style={{
                fontWeight: 700,
                fontSize: 16,
                color: '#1B1B24',
              }}
            >
              Students
            </div>
            <div
              style={{
                fontSize: 10,
                color: '#999',
                fontWeight: 'bold',
                letterSpacing: 1,
              }}
            >
              ACADEMIC YEAR 2023-2024
            </div>
          </div>
        }
      >
        <Table
          dataSource={students}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 5,
            style: { marginTop: 16 },
          }}
        />
      </Card>

      {/* STYLE FIX TABLE */}
      <style>{`
        .ant-table-thead > tr > th {
          background: #f8fafc !important;
          font-size: 11px !important;
          font-weight: 700 !important;
          color: #64748b !important;
          letter-spacing: 0.08em;
        }
      `}</style>
    </div>
  );
}