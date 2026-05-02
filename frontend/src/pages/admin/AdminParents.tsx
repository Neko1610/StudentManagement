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
  Typography,
  Avatar,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { adminService } from '../../api/adminService';
import { Parent } from '../../types';

const { Title, Text } = Typography;

export default function AdminParents() {
  const [parents, setParents] = useState<Parent[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingParent, setEditingParent] = useState<Parent | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadParents();
  }, []);

  const loadParents = async () => {
    try {
      setLoading(true);
      const data = await adminService.getParents();
      setParents(data);
    } catch {
      message.error('Failed to load parents');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingParent(null);
    form.resetFields();
    form.setFieldsValue({
      emailPrefix: "",
      email: ""
    });
    setModalVisible(true);
  };

  const handleEdit = (parent: Parent) => {
    setEditingParent(parent);

    const email = parent.email || "";

    const prefix = email
      .replace("ph", "")
      .replace("nt@gmail.com", "");

    form.setFieldsValue({
      ...parent,
      emailPrefix: prefix,
      email: email
    });

    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    await adminService.deleteParent(id);
    loadParents();
  };

  const handleSave = async (values: any) => {
    try {
      setLoading(true);

      values.email = form.getFieldValue("email");

      if (editingParent) {
        await adminService.updateParent(editingParent.id, values);
        message.success('Updated');
      } else {
        await adminService.createParent(values);
        message.success('Created');
      }

      setModalVisible(false);
      loadParents();
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
      render: (text: string) => {
        const letter = text
          ?.trim()
          ?.split(' ')
          ?.pop()
          ?.charAt(0)
          ?.toUpperCase();

        return (
          <Space>
            <Avatar style={{ background: '#E2DFFF', color: '#3525CD' }}>
              {letter || '?'}
            </Avatar>
            <Text strong>{text}</Text>
          </Space>
        );
      },
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
      title: 'JOB',
      dataIndex: 'job',
      render: (t: string) => t || '—',
    },
    {
      title: 'ACTIONS',
      align: 'right' as const,
      render: (_: any, record: Parent) => (
        <Space>
          <Button
            icon={<EditOutlined style={{ color: '#3525CD' }} />}
            type="text"
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete parent?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger icon={<DeleteOutlined />} type="text" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 32, background: '#F8F9FA', minHeight: '100vh' }}>
      <Spin spinning={loading}>
        {/* HEADER */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Title level={2} style={{ margin: 0, color: '#1E00A9' }}>
              Parents
            </Title>
            <Text type="secondary">
              Manage parent and guardian information
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
              boxShadow: '0 4px 10px rgba(53,37,205,0.2)',
            }}
          >
            Add Parent
          </Button>
        </div>

        {/* TABLE */}
        <Card
          bordered={false}
          style={{
            borderRadius: 16,
            borderLeft: '4px solid #3525CD',
            boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
          }}
        >
          <Table
            dataSource={parents}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 5 }}
          />
        </Card>

        {/* MODAL */}
        <Modal
          title={editingParent ? 'Edit Parent' : 'Add Parent'}
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          onOk={() => form.submit()}
        >
          <Form form={form} layout="vertical" onFinish={handleSave}>
            <Form.Item
              label="Full Name"
              name="fullName"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item label="Email">
              <Space direction="vertical" style={{ width: "100%" }}>

                <Space.Compact>
                  {/* prefix cố định */}
                  <Input disabled value="ph" style={{ width: 60 }} />

                  {/* input user nhập */}
                  <Form.Item name="emailPrefix" noStyle>
                    <Input
                      placeholder="nhập tên"
                      onChange={(e) => {
                        const value = e.target.value;

                        const prefix = value
                          .normalize("NFD")
                          .replace(/[\u0300-\u036f]/g, "")
                          .replace(/đ/g, "d")
                          .toLowerCase()
                          .replace(/\s+/g, "")
                          .replace(/[^a-z0-9]/g, "");

                        const email = `ph${prefix}nt@gmail.com`;

                        form.setFieldsValue({
                          emailPrefix: prefix,
                          email: email
                        });
                      }}
                    />
                  </Form.Item>

                  {/* suffix cố định */}
                  <Input disabled value="nt@gmail.com" style={{ width: 140 }} />
                </Space.Compact>

                {/* preview email */}
                <Form.Item shouldUpdate noStyle>
                  {() => (
                    <div style={{ fontSize: 12, color: "#888" }}>
                      {form.getFieldValue("email") || ""}
                    </div>
                  )}
                </Form.Item>

              </Space>
            </Form.Item>

            {/* email thật (hidden gửi backend) */}
            <Form.Item name="email" hidden>
              <Input />
            </Form.Item>

            <Form.Item name="phone" label="Phone">
              <Input />
            </Form.Item>

            <Form.Item name="job" label="Job">
              <Input />
            </Form.Item>
          </Form>
        </Modal>
      </Spin>
    </div>
  );
}