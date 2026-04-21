import {
  Card, Row, Col, Statistic, Spin, Empty, List, Tag
} from 'antd';
import {
  FileTextOutlined, BellOutlined
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { studentService } from '../../api/studentService';
import { commonService } from '../../api/commonService';
import { auth } from '../../utils/auth';
import dayjs from 'dayjs';

export default function StudentDashboard() {

  const user = auth.getUser();

  const [student, setStudent] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // ===== LOAD STUDENT =====
  useEffect(() => {
    if (!user?.id) return;

    const fetchStudent = async () => {
      try {
        setLoading(true);
        const res = await studentService.getProfile(user.id);
        setStudent(res);
      } catch (err) {
        console.error("Load student lỗi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [user?.id]);

  // ===== LOAD DASHBOARD =====
  useEffect(() => {
    if (!student?.classId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [aRes, nRes, sRes] = await Promise.all([
          studentService.getAssignmentsByClass(student.classId),
          commonService.getNotifications(),
          studentService.getSubmissions(student.id)
        ]);

        console.log("Assignments:", aRes);
        console.log("Submissions:", sRes);

        setAssignments(aRes || []);
        setNotifications((nRes || []).slice(0, 5));
        setSubmissions(sRes || []);

      } catch (err) {
        console.error("Load dashboard lỗi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [student]);

  // ===== LOGIC =====
  const isSubmitted = (assignmentId: number) => {
    return submissions.some(s => {
      const id =
        s.assignmentId ??
        s.assignment?.id ??
        s.assignment_id;

      return id === assignmentId;
    });
  };
  const isLate = (deadline: string) => {
    return dayjs(deadline).isBefore(dayjs());
  };

  const pendingAssignments = assignments.filter(a => {
    return !isSubmitted(a.id) && !isLate(a.deadline);
  });

  // ===== UI =====
  return (
    <Spin spinning={loading}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* HEADER */}
        <div>
          <h2>Welcome, {user?.fullName}</h2>
          <div style={{ color: '#888' }}>
            Class: {student?.className || '---'}
          </div>
        </div>

        {/* STATS */}
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Pending Assignments"
                value={pendingAssignments.length}
                prefix={<FileTextOutlined />}
              />
            </Card>
          </Col>

          <Col span={6}>
            <Card>
              <Statistic
                title="Unread Notifications"
                value={notifications.filter(n => !n.isRead).length}
                prefix={<BellOutlined />}
              />
            </Card>
          </Col>
        </Row>

        {/* CONTENT */}
        <Row gutter={16}>

          {/* ASSIGNMENTS */}
          <Col span={12}>
            <Card title="My Assignments">
              {assignments.length === 0 ? (
                <Empty description="No assignments" />
              ) : (
                <List
                  dataSource={assignments}
                  renderItem={(a) => {
                    const submitted = isSubmitted(a.id);
                    const late = isLate(a.deadline);

                    return (
                      <List.Item>
                        <List.Item.Meta
                          title={a.title}
                          description={
                            <>
                              <div>
                                Due: {dayjs(a.deadline).format('DD/MM/YYYY')}
                              </div>

                              {/* STATUS */}
                              {submitted && <Tag color="green">Submitted</Tag>}
                              {!submitted && !late && <Tag color="blue">Pending</Tag>}
                              {!submitted && late && <Tag color="red">Late</Tag>}

                              {/* DOWNLOAD */}
                              {a.filePath && (
                                <div>
                                  <a
                                    href={studentService.downloadAssignment(a.filePath)}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    Download file
                                  </a>
                                </div>
                              )}
                            </>
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
              )}
            </Card>
          </Col>

          {/* NOTIFICATIONS */}
          <Col span={12}>
            <Card title="Recent Notifications">
              {notifications.length === 0 ? (
                <Empty description="No notifications" />
              ) : (
                <List
                  dataSource={notifications}
                  renderItem={(n) => (
                    <List.Item>
                      <List.Item.Meta
                        title={n.title}
                        description={n.content}
                      />
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </Col>

        </Row>
      </div>
    </Spin>
  );
}