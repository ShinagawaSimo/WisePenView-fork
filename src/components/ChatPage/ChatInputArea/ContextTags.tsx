import React from 'react';
import { useChatPageStore } from '@/store/zustand';
import styles from './style.module.less';

const ContextTags: React.FC = () => {
  const activeSkill = useChatPageStore((s) => s.activeSkill);
  const activeDocRefs = useChatPageStore((s) => s.activeDocRefs);
  const activeAttachments = useChatPageStore((s) => s.activeAttachments);
  const setActiveSkill = useChatPageStore((s) => s.setActiveSkill);
  const removeDocRef = useChatPageStore((s) => s.removeDocRef);
  const removeAttachment = useChatPageStore((s) => s.removeAttachment);

  const hasAny = Boolean(activeSkill) || activeDocRefs.length > 0 || activeAttachments.length > 0;
  if (!hasAny) return null;

  return (
    <div className={styles.tags}>
      {activeSkill && (
        <span className={`${styles.tag} ${styles.skillTag}`}>
          🧩 {activeSkill.name}
          <span className={styles.tagRemove} onClick={() => setActiveSkill(null)}>
            ✕
          </span>
        </span>
      )}
      {activeDocRefs.map((ref) => (
        <span key={ref.resourceId} className={`${styles.tag} ${styles.docTag}`}>
          📄 {ref.resourceName}
          <span className={styles.tagRemove} onClick={() => removeDocRef(ref.resourceId)}>
            ✕
          </span>
        </span>
      ))}
      {activeAttachments.map((att) => (
        <span key={att.attachmentId} className={`${styles.tag} ${styles.attachmentTag}`}>
          📎 {att.filename}
          <span className={styles.tagRemove} onClick={() => removeAttachment(att.attachmentId)}>
            ✕
          </span>
        </span>
      ))}
    </div>
  );
};

export default ContextTags;
