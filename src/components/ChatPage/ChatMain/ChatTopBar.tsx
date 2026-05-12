import React from 'react';
import { useChatPageStore } from '@/store/zustand';
import ModelSelector from '@/components/ChatPanel/ModelSelector';
import type { Model } from '@/components/ChatPanel/index.type';
import styles from './style.module.less';

interface ChatTopBarProps {
  currentModel: Model | null;
  onModelChange: (model: Model) => void;
  sending: boolean;
}

const ChatTopBar: React.FC<ChatTopBarProps> = ({ currentModel, onModelChange, sending }) => {
  const activeAttachments = useChatPageStore((s) => s.activeAttachments);
  const activeDocRefs = useChatPageStore((s) => s.activeDocRefs);
  const activeSkill = useChatPageStore((s) => s.activeSkill);

  return (
    <div className={styles.topBar}>
      <ModelSelector currentModel={currentModel} onModelChange={onModelChange} sending={sending} />
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
