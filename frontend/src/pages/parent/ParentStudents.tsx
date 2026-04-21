import {
  Card,
  List,
  Empty,
  Spin,
  Button,
  Space,
  message,
  Table,
} from 'antd';
import { useEffect, useState } from 'react';
import { parentService } from '../../api/parentService';
import { auth } from '../../utils/auth';
import { Student } from '../../types';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ParentStudents() {
  const user = auth.getUser();

  const [children, setChildren] = useState<Student[]>([]);
  const [scores, setScores] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const tab = params.get('tab');
  const studentId = params.get('studentId');

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (tab === 'scores' && studentId) {
      loadScores(studentId);
    }

    if (tab === 'attendance' && studentId) {
      loadAttendance(studentId);
    }

    if (tab === 'assignments' && studentId) {
      const student = children.find(s => String(s.id) === studentId);
      if (student?.classId) {
        loadAssignments(student.classId);
      }
    }
  }, [tab, studentId, children]);

  const loadChildren = async () => {
    try {
      const data = await parentService.getChildren(user?.email || '');
      setChildren(data);
    } catch {
      message.error('Failed to load children');
    } finally {
      setLoading(false);
    }
  };

  const loadScores = async (id: string) => {
    try {
      const data = await parentService.getScoresByStudent(Number(id));
      setScores(data);
    } catch {
      message.error('Failed to load scores');
    }
  };

  const loadAttendance = async (id: string) => {
    try {
      const data = await parentService.getAttendanceByStudent(Number(id));
      setAttendance(data);
    } catch {
      message.error('Failed to load attendance');
    }
  };

  const loadAssignments = async (classId: number) => {
    try {
      const data = await parentService.getAssignmentsByClass(classId);
      setAssignments(data);
    } catch {
      message.error('Failed to load assignments');
    }
  };

  return (
    <Spin spinning={loading}>
      <Card title="My Children">

        {/* LIST STUDENTS */}
        {children.length === 0 ? (
          <Empty description="No children" />
        ) : (
          <List
            dataSource={children}
            renderItem={(child) => (
              <List.Item
                style={{
                  background:
                    String(child.id) === studentId
                      ? '#e6f7ff'
                      : undefined,
                  borderRadius: 8,
                  padding: 12,
                  marginBottom: 10,
                }}
              >
                <List.Item.Meta
                  title={child.fullName}
                  description={
                    <>
                      <p>Email: {child.email}</p>
                      <p>
                        Class:{' '}
                        {child.className ||
                          (child as any).studentClass?.name ||
                          'N/A'}
                      </p>
                      <p>Phone: {child.phone || 'N/A'}</p>
                    </>
                  }
                />

                <Space>
                  <Button
                    type="primary"
                    onClick={() =>
                      navigate(`/parent/students?tab=scores&studentId=${child.id}`)
                    }
                  >
                    View Scores
                  </Button>

                  <Button
                    onClick={() =>
                      navigate(`/parent/students?tab=attendance&studentId=${child.id}`)
                    }
                  >
                    View Attendance
                  </Button>

                  <Button
                    onClick={() =>
                      navigate(`/parent/students?tab=assignments&studentId=${child.id}`)
                    }
                  >
                    View Assignments
                  </Button>
                </Space>
              </List.Item>
            )}
          />
        )}

        {/* ================= SCORES ================= */}
        {studentId && tab === 'scores' && (
          <Card title="Scores" style={{ marginTop: 20 }}>
            <Table
              dataSource={scores}
              rowKey="id"
              pagination={false}
              columns={[
                { title: 'Subject', dataIndex: 'subjectName' },
                { title: '15p', dataIndex: 'assignmentScore' },
                { title: 'Mid', dataIndex: 'midtermScore' },
                { title: 'Final', dataIndex: 'finalScore' },
                {
                  title: 'Average',
                  dataIndex: 'averageScore',
                  render: (val) => <b>{val?.toFixed(2)}</b>,
                },
              ]}
            />

            <Button
              style={{ marginTop: 10 }}
              onClick={() => window.open(`/scores/export/${studentId}`)}
            >
              Export Excel
            </Button>
          </Card>
        )}

        {/* ================= ATTENDANCE ================= */}
        {studentId && tab === 'attendance' && (
          <Card title="Attendance" style={{ marginTop: 20 }}>
            <Table
              dataSource={attendance}
              rowKey="id"
              pagination={false}
              columns={[
                { title: 'Date', dataIndex: 'date' },
                { title: 'Period', dataIndex: 'period' },
                { title: 'Status', dataIndex: 'status' },
              ]}
            />
          </Card>
        )}

        {/* ================= ASSIGNMENTS ================= */}
        {studentId && tab === 'assignments' && (
          <Card title="Assignments" style={{ marginTop: 20 }}>
            <Table
              dataSource={assignments}
              rowKey="id"
              pagination={false}
              columns={[
                { title: 'Title', dataIndex: 'title' },
                { title: 'Deadline', dataIndex: 'deadline' },
                {
                  title: 'File',
                  render: (_, record) => (
                    <Button
                      onClick={() =>
                        window.open(`/assignments/download/${record.fileName}`)
                      }
                    >
                      Download
                    </Button>
                  ),
                },
              ]}
            />
          </Card>
        )}

      </Card>
    </Spin>
  );
}