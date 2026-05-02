import {
  Avatar,
  Badge,
  Drawer,
  Dropdown,
  Layout,
  Space,
  Typography,
} from 'antd';
import type { MenuProps } from 'antd';
import {
  BellOutlined,
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { commonService } from '../../api/commonService';
import { Notification } from '../../types';
import { useUserProfile } from '../../hooks/useUserProfile'; 
import styles from './Header.module.css';

const { Header } = Layout;
const { Text } = Typography;

export default function AppHeader() {
  const navigate = useNavigate();

  const { user, name, sub } = useUserProfile(); 

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
    localStorage.clear();
    navigate('/login');
  };

  const userMenu: MenuProps = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: name,
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
            <Text className={styles.eyebrow}>Trường THPT Nguyễn Trãi</Text>
            <div className={styles.logo}>Dashboard</div>
          </div>

          <div className={styles.right}>
            <Badge count={unreadCount} size="small">
              <button
                type="button"
                className={styles.iconButton}
                onClick={() => setDrawerVisible(true)}
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
                  <span>{name}</span>
                  <small>{sub}</small>
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