import {
  Card,
  Row,
  Col,
  Spin,
  Empty,
  List,
  Typography,
  Tag,
  Button
} from 'antd';
import {
  TeamOutlined,
  CalendarOutlined,
  BellOutlined,
  BookOutlined
} from '@ant-design/icons';
import { useEffect, useState } from 'react';
import { teacherService } from '../../api/teacherService';
import { commonService } from '../../api/commonService';
import { auth } from '../../utils/auth';
import { Clazz, Schedule, Notification } from '../../types';

const { Title, Text } = Typography;

const PERIOD_TIME: any = {
  1: "07:00 - 07:45",
  2: "07:50 - 08:35",
  3: "08:40 - 09:25",
  4: "09:35 - 10:20",
  5: "10:30 - 11:15",
  6: "12:45 - 13:30",
  7: "13:35 - 14:20",
  8: "14:25 - 15:10",
  9: "15:15 - 16:45"
};

export default function TeacherDashboard() {
  const user = auth.getUser();

  const [classes, setClasses] = useState<Clazz[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<Schedule[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.email) loadDashboardData();
  }, [user?.email]);

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

      // 🔥 THÊM DÒNG NÀY
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
        const res = await teacherService.getStudentsByClass(String(c.id));

        const mapped = res.map((s: any) => ({
          id: s.id,
          fullName: s.fullName,
          email: s.email,
          phone: s.phone,
          className: s.studentClass?.name // 🔥 đúng
        }));

        all = [...all, ...mapped];
      }

      console.log("STUDENTS:", all); // debug

      setStudents(all);
    } catch (err) {
      console.error(err);
    }
  };
  const getStatus = (s: Schedule) => {
    const currentHour = new Date().getHours();

    if (currentHour > 12 && s.period <= 5) return "done";
    if (currentHour < 12 && s.period > 5) return "upcoming";

    return "ongoing";
  };

  return (
    <Spin spinning={loading}>
      <div style={{ padding: 20 }}>

        {/* HEADER */}
        <Title level={3}>
          Chào buổi sáng, {user?.fullName}
        </Title>
        <Text type="secondary">
          Chúc bạn một ngày làm việc hiệu quả 🚀
        </Text>

        {/* STATS */}
        <Row gutter={16} style={{ marginTop: 20 }}>
          <Col span={6}>
            <Card>
              <Text type="secondary">TỔNG SỐ LỚP</Text>
              <Title>{classes.length}</Title>
            </Card>
          </Col>

          <Col span={6}>
            <Card>
              <Text type="secondary">HỌC SINH</Text>
              <Title>{students.length}</Title>
            </Card>
          </Col>

          <Col span={6}>
            <Card>
              <Text type="secondary">LỚP HÔM NAY</Text>
              <Title>{todaySchedule.length}</Title>
            </Card>
          </Col>

          <Col span={6}>
            <Card>
              <Text type="secondary">THÔNG BÁO</Text>
              <Title>
                {notifications.filter((n) => !n.isRead).length}
              </Title>
            </Card>
          </Col>
        </Row>

        {/* MAIN */}
        <Row gutter={16} style={{ marginTop: 20 }}>

          {/* LEFT */}
          <Col span={16}>

            {/* SCHEDULE */}
            <Card
              title="Lịch dạy hôm nay"
              extra={<a>Xem lịch chi tiết</a>}
            >
              {todaySchedule.length === 0 ? (
                <Empty />
              ) : (
                <List
                  dataSource={todaySchedule}
                  renderItem={(s) => {
                    const status = getStatus(s);

                    return (
                      <List.Item
                        style={{
                          border: "1px solid #eee",
                          borderRadius: 10,
                          marginBottom: 10,
                          padding: 15
                        }}
                      >
                        <Row style={{ width: "100%" }}>
                          <Col span={4}>
                            <Text strong>
                              {PERIOD_TIME[s.period]}
                            </Text>
                          </Col>

                          <Col span={14}>
                            <Text strong>{s.subjectName}</Text>
                            <br />
                            <Text type="secondary">
                              {s.className} - {s.room}
                            </Text>
                          </Col>

                          <Col span={6} style={{ textAlign: "right" }}>
                            {status === "done" && <Tag color="green">Đã xong</Tag>}
                            {status === "ongoing" && (
                              <Button type="primary">Điểm danh</Button>
                            )}
                            {status === "upcoming" && (
                              <Tag>Chưa bắt đầu</Tag>
                            )}
                          </Col>
                        </Row>
                      </List.Item>
                    );
                  }}
                />
              )}
            </Card>
          </Col>

          {/* RIGHT */}
          <Col span={8}>
            <Card
              title="Thông báo mới"
              extra={<a>Xem tất cả</a>}
            >
              {notifications.length === 0 ? (
                <Empty />
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