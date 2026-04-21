import { Layout, Menu } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { auth } from '../../utils/auth';
import { menuConfig } from '../menu.config';
import { HomeFilled } from '@ant-design/icons';
import styles from './Sidebar.module.css';

const { Sider } = Layout;

export default function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const user = auth.getUser();
  const role = user?.role?.toLowerCase() || 'admin';

  // 🔥 FILTER ROLE
  const filteredMenu = menuConfig.filter(item => {
    if (!item.roles) return true;
    return item.roles.includes(role);
  });

  // 🔥 BUILD MENU
const items = filteredMenu.map(item => ({
  key: item.key === 'dashboard'
    ? `/${role}` // 🔥 FIX
    : `/${role}/${item.key}`,
  icon: item.icon,
  label: item.label,
}));
  // 🔥 FIX ACTIVE KEY (quan trọng)
  const getSelectedKey = () => {
    const path = location.pathname;
    return [path];
  };

  const handleClick = (e: any) => {
    navigate(e.key);
  };

  return (
    <Sider
      width={250}
      className={styles.sidebar}
      theme="light"
      breakpoint="lg"
      collapsedWidth={0}
    >
      <div className={styles.logo}>
        <HomeFilled /> SMS
      </div>

      <Menu
        items={items}
        onClick={handleClick}
        selectedKeys={getSelectedKey()}
        mode="inline"
      />
    </Sider>
  );
}