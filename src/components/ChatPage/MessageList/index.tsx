import React from 'react';
import MessageList from '@/components/ChatPanel/MessageList';
import type { Message } from '@/components/ChatPanel/index.type';
import styles from './style.module.less';

interface ChatPageMessageListProps {
  messages: Message[];
  canLoadMoreHistory: boolean;
  loadingMoreHistory: boolean;
  onLoadMoreHistory: () => Promise<void>;
}

const ChatPageMessageList: React.FC<ChatPageMessageListProps> = (props) => {
  return (
    <div className={styles.messageList}>
      <MessageList {...props} />
    </div>
  );
};

export default ChatPageMessageList;
