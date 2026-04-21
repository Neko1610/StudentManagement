import {
  Card, Table, Button, Space, Modal,
  Form, Input, message, Spin
} from 'antd';
import { useEffect, useState } from 'react';
import { teacherService } from '../../api/teacherService';
import { Clazz, Student } from '../../types';
import { auth } from '../../utils/auth';

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
}, [user?.email]); // 🔥 chỉ theo dõi email

  const loadClasses = async () => {
    try {
      if (!user?.email) return;

      setLoading(true);
      console.log("EMAIL:", user.email);

      const data = await teacherService.getClasses(user.email);
      console.log("CLASSES:", data);

      setClasses(data || []);
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
            <Space direction="vertical" style={{ width: '100%' }}>
              {classes.map((clazz) => (
                <Card
                  key={clazz.id}
                  hoverable
                  onClick={() => handleSelectClass(clazz.id)}
                  style={{
                    cursor: 'pointer',
                    backgroundColor:
                      selectedClass === clazz.id ? '#e6f7ff' : 'transparent',
                  }}
                >
                  <h3>{clazz.name}</h3>
                  <p>Students: {clazz.studentCount}</p>
                </Card>
              ))}
            </Space>
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