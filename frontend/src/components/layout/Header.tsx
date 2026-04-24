import {
  Avatar,
  Badge,
  Drawer,
  Dropdown,
  Input,
  Layout,
  Space,
  Typography,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  BellOutlined,
  LogoutOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../utils/auth';
import { useEffect, useState } from 'react';
import { commonService } from '../../api/commonService';
import { Notification } from '../../types';
import styles from './Header.module.css';

const { Header } = Layout;
const { Text } = Typography;

export default function AppHeader() {
  const navigate = useNavigate();
  const user = auth.getUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [drawerVisible, setDrawerVisible] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await commonService.getNotifications();
      setNotifications(data);
      setUnreadCount(data.filter((n) => !n.isRead).length);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  const userMenu: MenuProps = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: user?.fullName || 'Account',
        disabled: true,
      },
      {
        type: 'divider',
      } as const,
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Logout',
        onClick: handleLogout,
      },
    ],
  };

  return (
    <>
      <Header className={styles.header}>
        <div className={styles.container}>
          <div className={styles.titleBlock}>
            <Text className={styles.eyebrow}>Student Management System</Text>
            <div className={styles.logo}>Dashboard</div>
          </div>

          <Input
            className={styles.search}
            prefix={<SearchOutlined />}
            placeholder="Search students, classes, tuition..."
            allowClear
          />

          <div className={styles.right}>
            <Badge count={unreadCount} size="small">
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => setDrawerVisible(true)}
                aria-label="Open notifications"
              >
                <BellOutlined />
              </button>
            </Badge>

            <Dropdown menu={userMenu} trigger={['click']}>
              <button type="button" className={styles.userButton}>
                <Avatar
                  src={user?.avatar}
                  icon={!user?.avatar && <UserOutlined />}
                  className={styles.avatar}
                />
                <span className={styles.userText}>
                  <span>{user?.fullName || 'User'}</span>
                  <small>{user?.role || 'Account'}</small>
                </span>
              </button>
            </Dropdown>
          </div>
        </div>
      </Header>

      <Drawer
        title="Notifications"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        width={420}
      >
        {notifications.length === 0 ? (
          <div className={styles.emptyState}>No notifications</div>
        ) : (
          <Space direction="vertical" size={12} className={styles.notifications}>
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`${styles.notification} ${
                  notification.isRead ? '' : styles.unread
                }`}
              >
                <h4>{notification.title}</h4>
                <p>{notification.content}</p>
                <small>{new Date(notification.createdAt).toLocaleString()}</small>
              </div>
            ))}
          </Space>
        )}
      </Drawer>
    </>
  );
}
