import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Spin,
  Space,
  Popconfirm,
  Select,
  Typography,
  Avatar,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { adminService } from '../../api/adminService';
import { Teacher } from '../../types';

const { Title, Text } = Typography;

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [emailName, setEmailName] = useState('');
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const [form] = Form.useForm();

  useEffect(() => {
    loadTeachers();
    loadExtraData();
  }, []);

  const loadTeachers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getTeachers();
      setTeachers(data);
    } catch {
      message.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const generateEmail = (name: string) => {
    if (!name) return '';
    return (
      'gv' +
      name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .toLowerCase()
        .replace(/\s+/g, '') +
      'nt@gmail.com'
    );
  };

  const loadExtraData = async () => {
    try {
      const [subjectData, classData] = await Promise.all([
        adminService.getSubjects(),
        adminService.getClasses(),
      ]);
      setSubjects(subjectData);
      setClasses(classData);
    } catch {
      message.error('Failed to load data');
    }
  };

  const handleAdd = () => {
    setEditingTeacher(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    form.setFieldsValue({
      ...teacher,
      subjectId: teacher.subjectId,
      classId: teacher.homeroomClassId || undefined,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    await adminService.deleteTeacher(id);
    loadTeachers();
  };

  const handleSave = async (values: any) => {
    try {
      setLoading(true);

      if (editingTeacher) {
        await adminService.updateTeacher(
          editingTeacher.id,
          values,
          Number(values.subjectId),
          Number(values.classId)
        );
        message.success('Updated');
      } else {
        await adminService.createTeacher(values);
        message.success('Created');
      }

      setModalVisible(false);
      loadTeachers();
    } catch {
      message.error('Error');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'NAME',
      dataIndex: 'fullName',
      render: (text: string) => (
        <Space>
          <Avatar style={{ background: '#E2DFFF', color: '#3525CD' }}>
            {text?.charAt(0)}
          </Avatar>
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: 'EMAIL',
      dataIndex: 'email',
      render: (text: string) => <Text type="secondary">{text}</Text>,
    },
    {
      title: 'PHONE',
      dataIndex: 'phone',
      render: (t: string) => t || '—',
    },
    {
      title: 'SUBJECT',
      dataIndex: 'subjectName',
      render: (t: string) => (
        <Tag color="blue" style={{ borderRadius: 20 }}>
          {t || 'N/A'}
        </Tag>
      ),
    },
    {
      title: 'HOMEROOM',
      dataIndex: 'homeroomClassName',
      render: (t: string) => t || '—',
    },
    {
      title: 'ACTIONS',
      align: 'right' as const,
      render: (_: any, record: Teacher) => (
        <Space>
          <Button
            icon={<EditOutlined style={{ color: '#3525CD' }} />}
            type="text"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete teacher?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger icon={<DeleteOutlined />} type="text" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 32, background: '#F8F9FA' }}>
      <Spin spinning={loading}>
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Title level={2} style={{ margin: 0, color: '#1E00A9' }}>
              Teachers
            </Title>
            <Text type="secondary">
              Manage academic staff records
            </Text>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
            style={{
              background: '#3525CD',
              borderRadius: 10,
              height: 40,
              fontWeight: 'bold',
            }}
          >
            Add Teacher
          </Button>
        </div>

        {/* TABLE */}
        <Card
          style={{
            borderRadius: 16,
            borderLeft: '4px solid #3525CD',
          }}
        >
          <Table
            dataSource={teachers}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 5 }}
          />
        </Card>

        {/* MODAL */}
        <Modal
          title={editingTeacher ? 'Edit Teacher' : 'Add Teacher'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={() => form.submit()}
        >
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Form.Item name="fullName" label="Full Name" rules={[{ required: true }]}>
              <Input />
            </Form.Item>

            <Form.Item label="Email">
              <Space>
                <span>gv</span>
                <Input
                  value={emailName}
                  onChange={(e) => {
                    const value = e.target.value;
                    setEmailName(value);
                    form.setFieldsValue({
                      email: generateEmail(value),
                    });
                  }}
                />
                <span>tn@gmail.com</span>
              </Space>
            </Form.Item>

            <Form.Item name="email" hidden>
              <Input />
            </Form.Item>

            <Form.Item name="phone" label="Phone">
              <Input />
            </Form.Item>

            <Form.Item name="dateOfBirth" label="Date of Birth">
              <Input type="date" />
            </Form.Item>

            <Form.Item name="address" label="Address">
              <Input />
            </Form.Item>

            <Form.Item name="subjectId" label="Subject" rules={[{ required: true }]}>
              <Select>
                {subjects.map((s) => (
                  <Select.Option key={s.id} value={s.id}>
                    {s.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="classId" label="Homeroom">
              <Select allowClear>
                {classes.map((c) => (
                  <Select.Option key={c.id} value={c.id}>
                    {c.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item name="qualifications" label="Qualifications">
              <Input.TextArea />
            </Form.Item>
          </Form>
        </Modal>
      </Spin>
    </div>
  );
}