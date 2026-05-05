import {
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Row,
  Select,
  Spin,
  Table,
  Tag,
  message,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { teacherService } from '../../api/teacherService';
import { Attendance, Clazz } from '../../types';
import { auth } from '../../utils/auth';
import { filterAttendanceByPeriod, PERIODS } from '../../utils/attendance';

export default function TeacherAttendance() {
  const user = auth.getUser();

  const [classes, setClasses] = useState<Clazz[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>();
  const [studentStatus, setStudentStatus] = useState<Record<string, Attendance['status']>>({});
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  const filteredAttendance = useMemo(
    () => filterAttendanceByPeriod(attendance, selectedPeriod),
    [attendance, selectedPeriod]
  );

  useEffect(() => {
    loadInit();
  }, []);

  const loadInit = async () => {
    try {
      const classRes = await teacherService.getClasses(user?.email || '');
      setClasses(classRes);
    } catch {
      message.error('Init load failed');
    }
  };

  const handleClassSelect = async (classId: string) => {
    try {
      setLoading(true);
      setSelectedClass(classId);
      setSelectedPeriod(undefined);

      const [studentsRes, attendanceRes] = await Promise.all([
        teacherService.getStudentsByClass(Number(classId)),
        teacherService.getAttendance(classId),
      ]);

      setStudents(studentsRes || []);
      setAttendance(attendanceRes);

      const initStatus: Record<string, Attendance['status']> = {};
      (studentsRes || []).forEach((student: any) => {
        initStatus[String(student.id)] = 'PRESENT';
      });
      setStudentStatus(initStatus);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (values: any) => {
    try {
      setLoading(true);
      const period = String(values.period);

      const payloads = students.map((student: any) => ({
        studentId: student.id,
        classId: selectedClass,
        period,
        date: values.date.format('YYYY-MM-DD'),
        status: studentStatus[String(student.id)] || 'PRESENT',
      }));

      await Promise.all(payloads.map((payload) => teacherService.markAttendance(payload)));

      const attendanceRes = await teacherService.getAttendance(selectedClass);
      setAttendance(attendanceRes);
      setSelectedPeriod(period);
      message.success('Attendance marked!');
    } catch (error) {
      console.error(error);
      message.error('Failed to mark attendance');
    } finally {
      setLoading(false);
    }
  };

  const studentColumns = [
    {
      title: 'Student',
      dataIndex: 'fullName',
    },
    {
      title: 'Status',
      width: 160,
      render: (_: any, record: any) => (
        <Select
          value={studentStatus[String(record.id)]}
          onChange={(value) =>
            setStudentStatus((current) => ({
              ...current,
              [String(record.id)]: value,
            }))
          }
          options={[
            { label: 'Present', value: 'PRESENT' },
            { label: 'Absent', value: 'ABSENT' },
            { label: 'Late', value: 'LATE' },
          ]}
          style={{ width: 130 }}
        />
      ),
    },
  ];

  const columns = [
    {
      title: 'Student',
      render: (_: any, record: any) => record.student?.fullName || record.studentId,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      width: 140,
    },
    {
      title: 'Period',
      dataIndex: 'period',
      width: 120,
      render: (period: string) => `Period ${period || '-'}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      width: 120,
      render: (status: Attendance['status']) => (
        <Tag color={status === 'PRESENT' ? 'green' : status === 'LATE' ? 'gold' : 'red'}>
          {status}
        </Tag>
      ),
    },
  ];

  return (
    <Spin spinning={loading}>
      <Card title="Mark Attendance" className="mb-4">
        <Form form={form} layout="vertical" onFinish={handleMarkAttendance}>
          <Row gutter={12}>
            <Col xs={24} md={8}>
              <Form.Item label="Class" name="classId" rules={[{ required: true }]}>
                <Select
                  placeholder="Select class"
                  onChange={handleClassSelect}
                  options={classes.map((clazz) => ({
                    label: clazz.name,
                    value: String(clazz.id),
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="Date" name="date" rules={[{ required: true }]}>
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="Period" name="period" rules={[{ required: true }]}>
                <Select
                  placeholder="Select period"
                  options={PERIODS.map((period) => ({
                    label: `Period ${period}`,
                    value: period,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Button type="primary" htmlType="submit" disabled={!selectedClass || students.length === 0}>
            Mark Attendance
          </Button>
        </Form>
      </Card>

      {students.length > 0 && (
        <Card title="Select Attendance">
          <Table
            dataSource={students}
            columns={studentColumns}
            rowKey="id"
            pagination={false}
            size="middle"
          />
        </Card>
      )}

      {selectedClass && (
        <Card title="Attendance Records" className="mt-4">
          <Select
            allowClear
            placeholder="All periods"
            value={selectedPeriod}
            onChange={setSelectedPeriod}
            options={PERIODS.map((period) => ({
              label: `Period ${period}`,
              value: period,
            }))}
            style={{ width: 180, marginBottom: 12 }}
          />

          <Table
            dataSource={filteredAttendance}
            columns={columns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            size="middle"
          />
        </Card>
      )}
    </Spin>
  );
}
