import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Layout, Menu, Tooltip } from 'antd';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../../utils/auth';
import { menuConfig } from '../menu.config';
import styles from './Sidebar.module.css';

const { Sider } = Layout;

export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const user = auth.getUser();
  const role = user?.role?.toLowerCase() || 'admin';
  const roleLabel = role.charAt(0).toUpperCase() + role.slice(1);

  const filteredMenu = menuConfig.filter((item) => {
    if (!item.roles) return true;
    return item.roles.includes(role);
  });

  const items = filteredMenu.map((item) => ({
    key: item.key === 'dashboard' ? `/${role}` : `/${role}/${item.key}`,
    icon: item.icon,
    label: item.label,
  }));

  const handleClick = (e: any) => {
    navigate(e.key);
  };

  return (
    <Sider
      width={280}
      className={styles.sidebar}
      theme="light"
      breakpoint="lg"
      collapsed={collapsed}
      collapsedWidth={88}
      trigger={null}
      onBreakpoint={(broken) => setCollapsed(broken)}
    >
      <div className={styles.brand}>
        <div className={styles.brandMark}>S</div>
        {!collapsed && (
          <div>
            <div className={styles.brandName}>THPT Nguyễn Trãi</div>
            <div className={styles.brandSub}>Management</div>
          </div>
        )}
      </div>

      <div className={styles.profile}>
        <img
          src={user?.avatar || 'https://i.pravatar.cc/100'}
          alt="avatar"
          className={styles.avatar}
        />
        {!collapsed && (
          <div className={styles.profileText}>
            <div className={styles.name}>{user?.fullName || 'User'}</div>
            <div className={styles.sub}>{roleLabel} dashboard</div>
          </div>
        )}
      </div>

      <Menu
        items={items}
        onClick={handleClick}
        selectedKeys={[location.pathname]}
        mode="inline"
        className={styles.menu}
      />

      <Tooltip title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} placement="right">
        <Button
          type="text"
          className={styles.collapseButton}
          icon={collapsed ? <RightOutlined /> : <LeftOutlined />}
          onClick={() => setCollapsed((value) => !value)}
        />
      </Tooltip>
    </Sider>
  );
}
