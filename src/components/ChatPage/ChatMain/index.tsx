import React from 'react';
import ChatTopBar from './ChatTopBar';
import WelcomeCards from './WelcomeCards';
import type { Model } from '@/components/ChatPanel/index.type';
import styles from './style.module.less';

interface ChatMainProps {
  currentModel: Model | null;
  onModelChange: (model: Model) => void;
  sending: boolean;
  hasMessages: boolean;
  children?: React.ReactNode;
}

const ChatMain: React.FC<ChatMainProps> = ({
  currentModel,
  onModelChange,
  sending,
  hasMessages,
  children,
}) => {
  return (
    <div className={styles.main}>
      <ChatTopBar currentModel={currentModel} onModelChange={onModelChange} sending={sending} />
      <div className={styles.content}>
        {children}
        {!hasMessages && (
          <WelcomeCards onSearchDocs={() => {}} onUseSkill={() => {}} onUploadFile={() => {}} />
        )}
      </div>
    </div>
  );
};

export default ChatMain;
