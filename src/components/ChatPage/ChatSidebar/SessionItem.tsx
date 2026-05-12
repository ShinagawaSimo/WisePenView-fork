import React from 'react';
import { Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import styles from './style.module.less';

export interface SessionItemData {
  id: string;
  title: string;
}

interface SessionItemProps {
  session: SessionItemData;
  active: boolean;
  onSelect: (id: string) => void;
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
}

const SessionItem: React.FC<SessionItemProps> = ({
  session,
  active,
  onSelect,
  onRename,
  onDelete,
}) => {
  const menuItems: MenuProps['items'] = [
    { key: 'rename', label: '重命名' },
    { key: 'delete', label: '删除', danger: true },
  ];

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'rename') onRename(session.id);
    if (key === 'delete') onDelete(session.id);
  };

  return (
    <Dropdown menu={{ items: menuItems, onClick: handleMenuClick }} trigger={['contextMenu']}>
      <div
        className={`${styles.sessionItem} ${active ? styles.active : ''}`}
        onClick={() => onSelect(session.id)}
      >
        <span className={styles.sessionTitle}>{session.title || '新对话'}</span>
      </div>
    </Dropdown>
  );
};

export default SessionItem;
