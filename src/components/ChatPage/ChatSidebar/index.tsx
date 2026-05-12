import React from 'react';
import NewChatButton from './NewChatButton';
import SessionList from './SessionList';
import type { SessionItemData } from './SessionItem';
import styles from './style.module.less';

interface ChatSidebarProps {
  sessions: SessionItemData[];
  activeSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  onRenameSession: (id: string) => void;
  onDeleteSession: (id: string) => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  sessions,
  activeSessionId,
  onNewChat,
  onSelectSession,
  onRenameSession,
  onDeleteSession,
}) => {
  return (
    <div className={styles.sidebar}>
      <NewChatButton onClick={onNewChat} />
      <SessionList
        sessions={sessions}
        activeId={activeSessionId}
        onSelect={onSelectSession}
        onRename={onRenameSession}
        onDelete={onDeleteSession}
      />
    </div>
  );
};

export default ChatSidebar;
export type { SessionItemData };
