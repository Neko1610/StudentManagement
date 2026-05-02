import {
  Button,
  Card,
  Col,
  Empty,
  List,
  Row,
  Space,
  Spin,
  Statistic,
  Tag,
  Typography,
} from 'antd';
import {
  BellOutlined,
  BookOutlined,
  CalendarOutlined,
  TeamOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { teacherService } from '../../api/teacherService';
import { commonService } from '../../api/commonService';
import { auth } from '../../utils/auth';
import { Clazz, Schedule, Notification } from '../../types';

const { Title, Text } = Typography;

const PERIOD_TIME: any = {
  1: '07:00 - 07:45',
  2: '07:50 - 08:35',
  3: '08:40 - 09:25',
  4: '09:35 - 10:20',
  5: '10:30 - 11:15',
  6: '12:45 - 13:30',
  7: '13:35 - 14:20',
  8: '14:25 - 15:10',
  9: '15:15 - 16:45',
};

export default function TeacherDashboard() {
  const user = auth.getUser();
  const [profile, setProfile] = useState<any>(null);
  const [classes, setClasses] = useState<Clazz[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<Schedule[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [, setSelectedClass] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) {
      loadDashboardData();
      loadProfile(); // 🔥 thêm dòng này
    }
  }, [user?.email]);

  const loadProfile = async () => {
    if (!user?.email) return;

    const data = await teacherService.getProfile(user.email);
    setProfile(data);
  };
  const loadDashboardData = async () => {
    try {
      setLoading(true);

      const [classesData, scheduleData, notificationsData] =
        await Promise.all([
          teacherService.getClasses(user!.email),
          teacherService.getTodaySchedule(user!.email),
          commonService.getNotifications(),
        ]);

      setClasses(classesData);
      setTodaySchedule(scheduleData);
      setNotifications(notificationsData.slice(0, 5));
      await loadStudents(classesData);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async (classesData: any[]) => {
    try {
      let all: any[] = [];

      for (const c of classesData) {
        const res = await teacherService.getStudentsByClass(Number(c.id));

        const mapped = res.map((s: any) => ({
          id: s.id,
          fullName: s.fullName,
          email: s.email,
          phone: s.phone,
          className: s.studentClass?.name,
        }));

        all = [...all, ...mapped];
      }

      setStudents(all);
    } catch (err) {
      console.error(err);
    }
  };

  const getStatus = (s: Schedule) => {
    const currentHour = new Date().getHours();

    if (currentHour > 12 && s.period <= 5) return 'done';
    if (currentHour < 12 && s.period > 5) return 'upcoming';

    return 'ongoing';
  };

  const stats = [
    { title: 'Classes', value: classes.length, icon: <TeamOutlined />, color: '#4f46e5', bg: '#eef2ff' },
    { title: 'Students', value: students.length, icon: <UsergroupAddOutlined />, color: '#2563eb', bg: '#dbeafe' },
    { title: 'Today Lessons', value: todaySchedule.length, icon: <CalendarOutlined />, color: '#0f766e', bg: '#ccfbf1' },
    { title: 'Unread Alerts', value: notifications.filter((n) => !n.isRead).length, icon: <BellOutlined />, color: '#9333ea', bg: '#f3e8ff' },
  ];

  return (
    <Spin spinning={loading}>
      <div className="page-stack">
        <div className="page-heading">
          <div>
            <Title level={2} className="page-title">Hello, {profile?.fullName}</Title>
            <div className="page-subtitle">
              Today's classes, attendance actions, and school updates are ready.
            </div>
          </div>
        </div>

        <Row gutter={[24, 24]}>
          {stats.map((item) => (
            <Col xs={24} sm={12} xl={6} key={item.title}>
              <Card className="stat-card">
                <div className="stat-icon" style={{ color: item.color, background: item.bg }}>
                  {item.icon}
                </div>
                <Statistic title={item.title} value={item.value} />
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[24, 24]}>
          <Col xs={24} xl={16}>
            <Card title="Today's Teaching Schedule" extra={<a href="/teacher/schedule">View schedule</a>}>
              {todaySchedule.length === 0 ? (
                <Empty description="No classes today" />
              ) : (
                <List
                  dataSource={todaySchedule}
                  renderItem={(s) => {
                    const status = getStatus(s);

                    return (
                      <List.Item className="soft-list-item">
                        <Row gutter={[16, 16]} align="middle" style={{ width: '100%' }}>
                          <Col xs={24} md={5}>
                            <Text strong>{PERIOD_TIME[s.period]}</Text>
                            <br />
                            <Text type="secondary">Period {s.period}</Text>
                          </Col>

                          <Col xs={24} md={13}>
                            <Text strong>{s.subjectName}</Text>
                            <br />
                            <Text type="secondary">{s.className} - {s.room}</Text>
                          </Col>

                          <Col xs={24} md={6} style={{ textAlign: 'right' }}>
                            {status === 'done' && <Tag color="green">Done</Tag>}
                            {status === 'ongoing' && (
                              <Button type="primary" onClick={() => setSelectedClass(s.className)}>
                                Attendance
                              </Button>
                            )}
                            {status === 'upcoming' && <Tag color="default">Upcoming</Tag>}
                          </Col>
                        </Row>
                      </List.Item>
                    );
                  }}
                />
              )}
            </Card>
          </Col>

          <Col xs={24} xl={8}>
            <Card title="Latest Notifications" extra={<a href="/teacher/notifications">View all</a>}>
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
