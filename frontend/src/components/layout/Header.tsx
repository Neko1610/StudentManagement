import { Layout, Button, Dropdown, Space, Badge, Drawer } from 'antd';
import type { MenuProps } from 'antd';
import { LogoutOutlined, BellOutlined, UserOutlined, MenuOutlined, CloseOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../utils/auth';
import { useState, useEffect } from 'react';
import { commonService } from '../../api/commonService';
import { Notification } from '../../types';
import styles from './Header.module.css';

const { Header } = Layout;

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
        label: 'Profile',
        onClick: () => {
          navigate(`/${user?.role.toLowerCase()}/profile`);
        },
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
        <div className={styles.headerContainer}>
          <div className={styles.headerLeft}>
            <h1 className={styles.logo}>School Management</h1>
          </div>
          <div className={styles.headerRight}>
            <Space>
              <Badge count={unreadCount}>
                <Button
                  type="text"
                  icon={<BellOutlined style={{ fontSize: 18 }} />}
                  onClick={() => setDrawerVisible(true)}
                />
              </Badge>
              <Dropdown menu={userMenu} trigger={['click']}>
                <Button type="text" icon={<UserOutlined />}>
                  {user?.fullName}
                </Button>
              </Dropdown>
            </Space>
          </div>
        </div>
      </Header>

      <Drawer
        title="Notifications"
        placement="right"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {notifications.length === 0 ? (
          <p>No notifications</p>
        ) : (
          <div className={styles.notifications}>
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
          </div>
        )}
      </Drawer>
    </>
  );
}
