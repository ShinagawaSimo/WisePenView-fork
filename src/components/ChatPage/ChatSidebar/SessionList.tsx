import React from 'react';
import SessionItem from './SessionItem';
import type { SessionItemData } from './SessionItem';
import styles from './style.module.less';

interface SessionListProps {
  sessions: SessionItemData[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onRename: (id: string) => void;
  onDelete: (id: string) => void;
}

const SessionList: React.FC<SessionListProps> = ({
  sessions,
  activeId,
  onSelect,
  onRename,
  onDelete,
}) => {
  return (
    <div className={styles.sessionSection}>
      <div className={styles.sessionLabel}>历史会话</div>
      <div className={styles.sessionList}>
        {sessions.map((session) => (
          <SessionItem
            key={session.id}
            session={session}
            active={session.id === activeId}
            onSelect={onSelect}
            onRename={onRename}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default SessionList;
