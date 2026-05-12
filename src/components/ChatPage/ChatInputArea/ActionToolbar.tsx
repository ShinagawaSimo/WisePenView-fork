import React from 'react';
import styles from './style.module.less';

interface ActionToolbarProps {
  onSkillClick: () => void;
  onDocRefClick: () => void;
  onAttachmentClick: () => void;
}

const ActionToolbar: React.FC<ActionToolbarProps> = ({
  onSkillClick,
  onDocRefClick,
  onAttachmentClick,
}) => {
  return (
    <div className={styles.toolbar}>
      <button type="button" className={styles.toolbarBtn} onClick={onSkillClick}>
        🧩 Skill
      </button>
      <button type="button" className={styles.toolbarBtn} onClick={onDocRefClick}>
        📄 引用文档
      </button>
      <button type="button" className={styles.toolbarBtn} onClick={onAttachmentClick}>
        📎 附件
      </button>
      <span className={styles.toolbarHint}>提示: 输入 @skill:名称 快速调用</span>
    </div>
  );
};

export default ActionToolbar;
