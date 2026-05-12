import React from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useChatPageStore } from '@/store/zustand';
import ModelSelector from '@/components/ChatPanel/ModelSelector';
import type { Model } from '@/components/ChatPanel/index.type';
import styles from './style.module.less';

interface ChatTopBarProps {
  currentModelId: string;
  onModelChange: (model: Model) => void;
  onNewChat: () => void;
}

const ChatTopBar: React.FC<ChatTopBarProps> = ({ currentModelId, onModelChange, onNewChat }) => {
  const activeAttachments = useChatPageStore((s) => s.activeAttachments);
  const activeDocRefs = useChatPageStore((s) => s.activeDocRefs);
  const activeSkill = useChatPageStore((s) => s.activeSkill);

  return (
    <div className={styles.topBar}>
      <ModelSelector value={currentModelId} onChange={onModelChange} />
      <Button type="text" icon={<PlusOutlined />} className={styles.newChatBtn} onClick={onNewChat}>
        新建对话
      </Button>
      <div className={styles.topBarRight}>
        {activeAttachments.length > 0 && (
          <span className={styles.statusIcon}>📎 {activeAttachments.length}</span>
        )}
        {activeDocRefs.length > 0 && (
          <span className={styles.statusIcon}>📄 {activeDocRefs.length}</span>
        )}
        {activeSkill ? (
          <span className={styles.statusIcon}>🧩 {activeSkill.name}</span>
        ) : (
          <span className={styles.statusIcon}>🧩 无</span>
        )}
      </div>
    </div>
  );
};

export default ChatTopBar;
