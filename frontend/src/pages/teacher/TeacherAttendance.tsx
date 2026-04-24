import {
  Card, Form, Button, Select, DatePicker,
  Table, message, Spin
} from 'antd';
import { useState, useEffect } from 'react';
import { teacherService } from '../../api/teacherService';
import client from '../../api/client';
import { Clazz } from '../../types';
import { auth } from '../../utils/auth';

export default function TeacherAttendance() {
  const user = auth.getUser();

  const [classes, setClasses] = useState<Clazz[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);

  const [selectedClass, setSelectedClass] = useState<string>('');
  const [studentStatus, setStudentStatus] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  // 🔥 LOAD INIT
  useEffect(() => {
    loadInit();
  }, []);

  const loadInit = async () => {
    try {
      const [classRes, subjectRes] = await Promise.all([
        teacherService.getClasses(user?.email || ''),
        client.get('/subjects').then(r => r.data),
      ]);

      setClasses(classRes);
      setSubjects(subjectRes);
    } catch {
      message.error('Init load failed');
    }
  };

  // 🔥 SELECT CLASS
  const handleClassSelect = async (classId: string) => {
    try {
      setLoading(true);
      setSelectedClass(classId);

      const [studentsRes, attendanceRes] = await Promise.all([
        teacherService.getStudentsByClass(Number(classId)),
        teacherService.getAttendance(classId)
      ]);

      setStudents(studentsRes);
      setAttendance(attendanceRes);

      // reset status
      const initStatus: any = {};
      studentsRes.forEach((s: any) => {
        initStatus[s.id] = 'PRESENT';
      });
      setStudentStatus(initStatus);

    } finally {
      setLoading(false);
    }
  };

  // 🔥 MARK ATTENDANCE
  const handleMarkAttendance = async (values: any) => {
    try {
      setLoading(true);

      const payloads = students.map((s: any) => ({
        studentId: s.id,
        classId: selectedClass,
        period: values.period, // AM4 / AM5 / PM
        date: values.date.format('YYYY-MM-DD'),
        status: studentStatus[s.id] || 'PRESENT'
      }));

      for (let p of payloads) {
        await teacherService.markAttendance(p);
      }

      message.success('Attendance marked!');
      handleClassSelect(selectedClass);

    } catch (error) {
      console.error(error);
      message.error('Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  // 🔥 TABLE CHỌN STATUS
  const studentColumns = [
    {
      title: 'Student',
      dataIndex: 'fullName'
    },
    {
      title: 'Status',
      render: (_: any, r: any) => (
        <Select
          value={studentStatus[r.id]}
          onChange={(value) =>
            setStudentStatus({
              ...studentStatus,
              [r.id]: value
            })
          }
          options={[
            { label: 'Present', value: 'PRESENT' },
            { label: 'Absent', value: 'ABSENT' }
          ]}
          style={{ width: 120 }}
        />
      )
    }
  ];

  const columns = [
    {
      title: 'Student',
      render: (_: any, r: any) => r.student?.fullName || r.studentId,
    },
    {
      title: 'Date',
      dataIndex: 'date',
    },
    {
      title: 'Session',
      dataIndex: 'period',
      render: (p: string) => {
        if (p === 'AM4') return 'AM (Tiết 1-4)';
        if (p === 'AM5') return 'AM (Tiết 1-5)';
        return 'PM (Tiết 6-9)';
      }
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status: string) => (
        <span style={{ color: status === 'PRESENT' ? 'green' : 'red' }}>
          {status}
        </span>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      {/* FORM */}
      <Card title="Mark Attendance" className="mb-4">
        <Form form={form} layout="vertical" onFinish={handleMarkAttendance}>

          <Form.Item label="Class" name="classId" rules={[{ required: true }]}>
            <Select
              placeholder="Select class"
              onChange={handleClassSelect}
              options={classes.map(c => ({
                label: c.name,
                value: c.id
              }))}
            />
          </Form.Item>

          <Form.Item label="Date" name="date" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Session" name="period" rules={[{ required: true }]}>
            <Select
              placeholder="Select session"
              options={[
                { label: 'AM4 (Tiết 1-4)', value: 'AM4' },
                { label: 'AM5 (Tiết 1-5)', value: 'AM5' },
                { label: 'PM (Tiết 6-9)', value: 'PM' }
              ]}
            />
          </Form.Item>

          <Button type="primary" htmlType="submit">
            Mark Attendance
          </Button>
        </Form>
      </Card>

      {/* CHỌN STATUS */}
      {students.length > 0 && (
        <Card title="Select Attendance">
          <Table
            dataSource={students}
            columns={studentColumns}
            rowKey="id"
            pagination={false}
          />
        </Card>
      )}

      {/* RECORD */}
      {selectedClass && (
        <Card title="Attendance Records" className="mt-4">
          <Table
            dataSource={attendance}
            columns={columns}
            rowKey="id"
          />
        </Card>
      )}
    </Spin>
  );
}
