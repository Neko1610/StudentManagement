import { Card, Table, Button, Modal, Form, Input, Select, message, Spin, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { adminService } from '../../api/adminService';
import { Student } from '../../types';

export default function AdminStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [form] = Form.useForm();
  const [classes, setClasses] = useState<any[]>([]);
  const [parents, setParents] = useState<any[]>([]);
  useEffect(() => {
    loadStudents();
    loadClasses();
    loadParents();
  }, []);
  const loadClasses = async () => {
    const res = await adminService.getClasses();
    setClasses(res);
  };

  const loadParents = async () => {
    const res = await adminService.getParents();
    setParents(res);
  };
  const loadStudents = async () => {
    try {
      setLoading(true);
      const data = await adminService.getStudents();
      setStudents(data);
    } catch (error) {
      message.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingStudent(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);

    form.setFieldsValue({
      ...student,
      classId: student.classId,
      parentIds: student.parents?.map((p: any) => p.id), // 🔥 FIX
    });

    setModalVisible(true);
  };
  const handleDelete = async (id: string) => {
    try {
      await adminService.deleteStudent(id);
      message.success('Student deleted');
      loadStudents();
    } catch (error) {
      message.error('Failed to delete student');
    }
  };

  const handleSave = async (values: any) => {
    try {
      setLoading(true);

      console.log("VALUES:", values);

      // 🔥 FIX: convert dateOfBirth → dob
      const payload = {
        ...values,
        dob: values.dateOfBirth,
      };

      delete payload.dateOfBirth;

      if (editingStudent) {
        await adminService.updateStudent(
          String(editingStudent.id),
          payload, // 🔥 dùng payload
          Number(values.classId),
          values.parentIds?.map((id: string) => Number(id))
        );
        message.success('Student updated');
      } else {
        await adminService.createStudent(
          {
            ...payload, // 🔥 dùng payload
            parentIds: values.parentIds
          },
          Number(values.classId),
          values.parentIds?.map((id: string) => Number(id))
        );
        message.success('Student created');
      }

      setModalVisible(false);
      loadStudents();
    } catch {
      message.error('Failed to save student');
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
      title: 'Class',
      dataIndex: 'className', // 🔥
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Student) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete Student"
            description="Are you sure you want to delete this student?"
            onConfirm={() => handleDelete(String(record.id))}
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
        title="Students"
        extra={<Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>Add Student</Button>}
      >
        <Table
          dataSource={students}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingStudent ? 'Edit Student' : 'Add Student'}
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
              <span>hs</span>

              <Input
                placeholder="nhập SBD"
                onChange={(e) => {
                  const value = e.target.value;
                  form.setFieldsValue({
                    email: `hs${value}nt@gmail.com`,
                  });
                }}
              />

              <span>nt@gmail.com</span>
            </Space>
          </Form.Item>

          <Form.Item label="Phone" name="phone">
            <Input />
          </Form.Item>

          <Form.Item label="Date of Birth" name="dateOfBirth">
            <Input type="date" />
          </Form.Item>

          <Form.Item label="Gender" name="gender">
            <Select placeholder="Select gender">
              <Select.Option value="MALE">Male</Select.Option>
              <Select.Option value="FEMALE">Female</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="Address" name="address">
            <Input />
          </Form.Item>

          <Form.Item
            label="Class"
            name="classId"
            rules={[{ required: true, message: 'Chọn lớp' }]}
          >
            <Select placeholder="Chọn lớp">
              {classes.map((c) => (
                <Select.Option key={c.id} value={c.id}>
                  {c.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="Parent"
            name="parentIds"
            rules={[{ required: true, message: 'Chọn phụ huynh' }]}
          >
            <Select mode="multiple" placeholder="Chọn phụ huynh">
              {parents.map((p) => (
                <Select.Option key={p.id} value={p.id}>
                  {p.fullName} ({p.phone})
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}
