import {
  Card, Table, Button, Space, Modal,
  Form, Input, message, Spin, Tag, Tabs
} from 'antd';
import { useEffect, useState } from 'react';
import { teacherService } from '../../api/teacherService';
import { Clazz, Student } from '../../types';
import { auth } from '../../utils/auth';
import { CrownOutlined } from '@ant-design/icons';
export default function TeacherClasses() {
  const user = auth.getUser();

  const [classes, setClasses] = useState<Clazz[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [studentsByClass, setStudentsByClass] = useState<{ [key: number]: Student[] }>({});
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 🔥 LOAD CLASSES
  useEffect(() => {
    if (user?.email) {
      loadClasses();
    }
  }, [user?.email]);

  const loadClasses = async () => {
    try {
      if (!user?.email) return;

      setLoading(true);

      const data = await teacherService.getClasses(user.email);

      // 🔥 sort homeroom lên đầu
      const sorted = (data || []).sort(
        (a, b) => Number(b.homeroom) - Number(a.homeroom)
      );

      setClasses(sorted);

    } catch (error) {
      console.error(error);
      message.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 LOAD STUDENTS
  const handleSelectClass = async (classId: number) => {
    try {
      setSelectedClass(classId);
      setLoading(true);

      if (!studentsByClass[classId]) {
        const studentsList = await teacherService.getStudentsByClass(classId);

        setStudentsByClass(prev => ({
          ...prev,
          [classId]: studentsList
        }));

        setStudents(studentsList);
      } else {
        setStudents(studentsByClass[classId]);
      }

    } catch (error) {
      console.error(error);
      message.error('Failed to load students');
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
    },
    {
      title: 'Actions',
      render: (_: any, record: Student) => (
        <Space>
          <Button size="small">View</Button>
          <Button size="small" onClick={() => openModal(record)}>
            Evaluate
          </Button>
        </Space>
      ),
    },
  ];

  const openModal = (student: Student) => {
    setModalVisible(true);

    form.setFieldsValue({
      studentId: student.id
    });
  };

  return (
    <div>

      {/* 🔥 CLASS LIST */}
      <Card title="My Classes" className="mb-4">
        <Spin spinning={loading}>
          {classes.length === 0 ? (
            <p>No classes assigned</p>
          ) : (
            <Tabs
              activeKey={selectedClass?.toString()}
              onChange={(key) => handleSelectClass(Number(key))}
              items={classes.map((clazz) => ({
                key: clazz.id.toString(),
                label: (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {clazz.homeroom && (
                      <CrownOutlined style={{ color: '#faad14', fontSize: 14 }} />
                    )}
                    <span>{clazz.name}</span>
                  </span>
                )
              }))}
            />
          )}
        </Spin>
      </Card>

      {/* 🔥 STUDENTS TABLE */}
      {selectedClass && (
        <Card title="Class Students">
          <Spin spinning={loading}>
            <Table
              dataSource={students}
              columns={columns}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Spin>
        </Card>
      )}

      {/* 🔥 MODAL */}
      <Modal
        title="Add Evaluation"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => {
          message.success("Saved (mock)");
          setModalVisible(false);
        }}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="studentId" hidden>
            <Input />
          </Form.Item>

          <Form.Item label="Evaluation" name="evaluation">
            <Input.TextArea placeholder="Enter evaluation" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}