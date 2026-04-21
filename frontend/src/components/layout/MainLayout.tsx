import { Layout } from 'antd';
import AppHeader from './Header';
import AppSidebar from './Sidebar';
import styles from './MainLayout.module.css';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <Layout className={styles.layout}>
      <AppHeader />
      <Layout className={styles.content}>
        <AppSidebar />
        <Layout.Content className={styles.main}>
          <div className={styles.container}>{children}</div>
        </Layout.Content>
      </Layout>
    </Layout>
  );
}
