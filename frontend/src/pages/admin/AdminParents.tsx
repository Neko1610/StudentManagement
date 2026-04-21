import { Card, Table, Button, Modal, Form, Input, message, Spin, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { adminService } from '../../api/adminService';
import { Parent } from '../../types';

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
    } catch (error) {
      message.error('Failed to load parents');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingParent(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (parent: Parent) => {
    setEditingParent(parent);

    // 🔥 tách email thành phần giữa
    const emailName = parent.email
      ?.replace("ph", "")
      .replace("nt@gmail.com", "");

    form.setFieldsValue({
      ...parent,
      email: parent.email, // 🔥 FIX
    });

    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteParent(id);
      message.success('Parent deleted');
      loadParents();
    } catch (error) {
      message.error('Failed to delete parent');
    }
  };

  const handleSave = async (values: any) => {
    try {
      setLoading(true);
      if (editingParent) {
        await adminService.updateParent(editingParent.id, values);
        message.success('Parent updated');
      } else {
        await adminService.createParent(values);
        message.success('Parent created');
      }
      setModalVisible(false);
      loadParents();
    } catch (error) {
      message.error('Failed to save parent');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Job',
      dataIndex: 'job',
      key: 'job',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Parent) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete Parent"
            description="Are you sure you want to delete this parent?"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <Card
        title="Parents"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Add Parent</Button>}
      >
        <Table
          dataSource={parents}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingParent ? 'Edit Parent' : 'Add Parent'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item label="Full Name" name="fullName" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item label="Email">
            <Space>
              <span>ph</span>

              <Input
                placeholder="nhập tên"
                onChange={(e) => {
                  const value = e.target.value;

                  const email = `ph${value
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/đ/g, "d")
                    .replace(/Đ/g, "d")
                    .toLowerCase()
                    .replace(/\s+/g, "")}nt@gmail.com`;

                  form.setFieldsValue({
                    email,
                  });
                }}
              />

              <span>nt@gmail.com</span>
            </Space>
          </Form.Item>

          <Form.Item name="email" hidden>
            <Input />
          </Form.Item>

          <Form.Item label="Phone" name="phone">
            <Input />
          </Form.Item>

          <Form.Item label="Job" name="job">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}
