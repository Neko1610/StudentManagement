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
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { adminService } from '../../api/adminService';
import { Teacher } from '../../types';

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
        .replace(/Đ/g, 'd')
        .toLowerCase()
        .replace(/\s+/g, '') +
      'tn@gmail.com'
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
      message.error('Failed to load subjects/classes');
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
    try {
      await adminService.deleteTeacher(id);
      message.success('Teacher deleted');
      loadTeachers();
    } catch {
      message.error('Failed to delete teacher');
    }
  };

  const handleSave = async (values: any) => {
    try {
      setLoading(true);

      console.log("SUBMIT:", values); // 🔥 debug

      if (editingTeacher) {
        await adminService.updateTeacher(
          editingTeacher.id,
          values,
          Number(values.subjectId),
          Number(values.classId) 
        );
        message.success('Teacher updated');
      } else {
        await adminService.createTeacher(values);
        message.success('Teacher created');
      }

      setModalVisible(false);
      loadTeachers();
    } catch {
      message.error('Failed to save teacher');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'fullName',
    },
    {
      title: 'Email',
      dataIndex: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      render: (text: string) => text || '—',
    },
    {
      title: 'Subject',
      dataIndex: 'subjectName',
      render: (text: string) => text || '—',
    },

    {
      title: 'Homeroom',
      dataIndex: 'homeroomClassName',
      render: (text: string) => text || '—',
    },
    {
      title: 'Actions',
      render: (_: any, record: Teacher) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Delete Teacher"
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
        title="Teachers"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add Teacher
          </Button>
        }
      >
        <Table
          dataSource={teachers}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingTeacher ? 'Edit Teacher' : 'Add Teacher'}
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
            <Space>
              <span>gv</span>

              <Input
                placeholder="nhập tên"
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

          <Form.Item label="Phone" name="phone">
            <Input />
          </Form.Item>

          <Form.Item label="Date of Birth" name="dateOfBirth">
            <Input type="date" />
          </Form.Item>

          <Form.Item label="Address" name="address">
            <Input />
          </Form.Item>

          {/* 🔥 SUBJECT */}
          <Form.Item
            label="Subject"
            name="subjectId"
            rules={[{ required: true, message: 'Please select subject' }]}
          >
            <Select placeholder="Select subject">
              {subjects.map((s) => (
                <Select.Option key={s.id} value={s.id}>
                  {s.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* 🔥 HOMEROOM */}
          <Form.Item label="Homeroom Class" name="classId">
            <Select placeholder="Select class (optional)" allowClear>
              {classes.map((c) => (
                <Select.Option key={c.id} value={c.id}>
                  {c.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="Qualifications" name="qualifications">
            <Input.TextArea />
          </Form.Item>
        </Form>
      </Modal>
    </Spin>
  );
}