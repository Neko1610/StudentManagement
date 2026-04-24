import { BellOutlined, CalendarOutlined, FileTextOutlined, TrophyOutlined } from '@ant-design/icons';
import { Card, Col, Empty, List, Row, Space, Spin, Statistic, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { studentService } from '../../api/studentService';
import { commonService } from '../../api/commonService';
import { auth } from '../../utils/auth';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

export default function StudentDashboard() {
  const user = auth.getUser();

  const [student, setStudent] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    const fetchStudent = async () => {
      try {
        setLoading(true);
        const res = await studentService.getProfile(user.id);
        setStudent(res);
      } catch (err) {
        console.error('Load student error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [user?.id]);

  useEffect(() => {
    if (!student?.classId) return;

    const fetchData = async () => {
      try {
        setLoading(true);

        const [aRes, nRes, sRes] = await Promise.all([
          studentService.getAssignmentsByClass(student.classId),
          commonService.getNotifications(),
          studentService.getSubmissions(student.id),
        ]);

        setAssignments(aRes || []);
        setNotifications((nRes || []).slice(0, 5));
        setSubmissions(sRes || []);
      } catch (err) {
        console.error('Load dashboard error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [student]);

  const isSubmitted = (assignmentId: number) => {
    return submissions.some((s) => {
      const id = s.assignmentId ?? s.assignment?.id ?? s.assignment_id;
      return id === assignmentId;
    });
  };

  const isLate = (deadline: string) => {
    return dayjs(deadline).isBefore(dayjs());
  };

  const pendingAssignments = assignments.filter((a) => {
    return !isSubmitted(a.id) && !isLate(a.deadline);
  });

  return (
    <Spin spinning={loading}>
      <div className="page-stack">
        <div className="page-heading">
          <div>
            <Title level={2} className="page-title">Welcome, {user?.fullName}</Title>
            <div className="page-subtitle">
              Class: {student?.className || '---'} - Keep track of assignments and school updates.
            </div>
          </div>
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <div className="stat-icon" style={{ color: '#4f46e5', background: '#eef2ff' }}>
                <FileTextOutlined />
              </div>
              <Statistic title="Pending Assignments" value={pendingAssignments.length} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <div className="stat-icon" style={{ color: '#2563eb', background: '#dbeafe' }}>
                <BellOutlined />
              </div>
              <Statistic title="Unread Notifications" value={notifications.filter((n) => !n.isRead).length} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <div className="stat-icon" style={{ color: '#0f766e', background: '#ccfbf1' }}>
                <CalendarOutlined />
              </div>
              <Statistic title="Class" value={student?.className || '---'} />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="stat-card">
              <div className="stat-icon" style={{ color: '#9333ea', background: '#f3e8ff' }}>
                <TrophyOutlined />
              </div>
              <Statistic title="Submitted" value={submissions.length} />
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={13}>
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
                      <List.Item className="soft-list-item">
                        <List.Item.Meta
                          title={<Text strong>{a.title}</Text>}
                          description={
                            <Space direction="vertical" size={6}>
                              <Text type="secondary">Due: {dayjs(a.deadline).format('DD/MM/YYYY')}</Text>
                              <Space wrap>
                                {submitted && <Tag color="green">Submitted</Tag>}
                                {!submitted && !late && <Tag color="blue">Pending</Tag>}
                                {!submitted && late && <Tag color="red">Late</Tag>}
                                {a.filePath && (
                                  <a
                                    href={studentService.downloadAssignment(a.filePath)}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    Download file
                                  </a>
                                )}
                              </Space>
                            </Space>
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
              )}
            </Card>
          </Col>

          <Col xs={24} lg={11}>
            <Card title="Recent Notifications">
              {notifications.length === 0 ? (
                <Empty description="No notifications" />
              ) : (
                <List
                  dataSource={notifications}
                  renderItem={(n) => (
                    <List.Item className="soft-list-item">
                      <List.Item.Meta
                        title={
                          <Space>
                            <Text strong>{n.title}</Text>
                            {!n.isRead && <Tag color="blue">New</Tag>}
                          </Space>
                        }
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
