import { useEffect, useState } from 'react';
import { Button, Form, InputNumber, Modal, Select, Table, message, Typography } from 'antd';
import api from '../api/axios';

const { Title } = Typography;

interface Schedule {
  id: number;
  clazz: { name: string };
  subject: { name: string };
  teacher: { fullName: string };
  dayOfWeek: string;
  period: number;
}

const options = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY'];

const SchedulePage = () => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const loadData = async () => {
    try {
      const [scheduleRes, classesRes, subjectsRes, teachersRes] = await Promise.all([
        api.get('/schedules'),
        api.get('/classes'),
        api.get('/subjects'),
        api.get('/teachers'),
      ]);
      setSchedules(scheduleRes.data);
      setClasses(classesRes.data);
      setSubjects(subjectsRes.data);
      setTeachers(teachersRes.data);
    } catch (error) {
      message.error('Unable to load schedule data');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const createSchedule = async (values: any) => {
    try {
      await api.post('/schedules', values);
      message.success('Schedule created');
      setOpen(false);
      loadData();
    } catch (error: any) {
      message.error(error?.response?.data?.error || 'Failed to create schedule');
    }
  };

  const columns = [
    { title: 'Class', dataIndex: ['clazz', 'name'], key: 'clazz' },
    { title: 'Subject', dataIndex: ['subject', 'name'], key: 'subject' },
    { title: 'Teacher', dataIndex: ['teacher', 'fullName'], key: 'teacher' },
    { title: 'Day', dataIndex: 'dayOfWeek', key: 'dayOfWeek' },
    { title: 'Period', dataIndex: 'period', key: 'period' },
  ];

  return (
    <div>
      <Title level={2}>Schedule Management</Title>
      <Button type="primary" onClick={() => setOpen(true)} style={{ marginBottom: 16 }}>
        Add Schedule
      </Button>
      <Table rowKey="id" columns={columns} dataSource={schedules} />
      <Modal title="Add Schedule" open={open} onCancel={() => setOpen(false)} footer={null}>
        <Form layout="vertical" onFinish={createSchedule} initialValues={{ period: 1, dayOfWeek: 'MONDAY' }}>
          <Form.Item name="classId" label="Class" rules={[{ required: true }]}> 
            <Select options={classes.map((clazz) => ({ label: clazz.name, value: clazz.id }))} />
          </Form.Item>
          <Form.Item name="subjectId" label="Subject" rules={[{ required: true }]}> 
            <Select options={subjects.map((subject) => ({ label: subject.name, value: subject.id }))} />
          </Form.Item>
          <Form.Item name="teacherId" label="Teacher" rules={[{ required: true }]}> 
            <Select options={teachers.map((teacher) => ({ label: teacher.fullName, value: teacher.id }))} />
          </Form.Item>
          <Form.Item name="dayOfWeek" label="Day of Week" rules={[{ required: true }]}> 
            <Select options={options.map((day) => ({ label: day, value: day }))} />
          </Form.Item>
          <Form.Item name="period" label="Period" rules={[{ required: true, type: 'number', min: 1, max: 8 }]}> 
            <InputNumber min={1} max={8} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">Create</Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SchedulePage;
