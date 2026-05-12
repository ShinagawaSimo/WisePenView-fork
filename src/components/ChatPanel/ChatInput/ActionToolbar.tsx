import React from 'react';
import { Button, Tooltip } from 'antd';
import { LuSend, LuPuzzle, LuFileText, LuPaperclip } from 'react-icons/lu';

import ModelSelector from '../ModelSelector';
import type { Model } from '@/components/ChatPanel/index.type';
import styles from './style.module.less';

interface ActionToolbarProps {
  modelValue: string;
  onModelChange: (model: Model) => void;
  onSend: () => void;
  disabledSend: boolean;
  onSkillClick: () => void;
  onDocRefClick: () => void;
  onAttachmentClick: () => void;
}

const ActionToolbar: React.FC<ActionToolbarProps> = ({
  modelValue,
  onModelChange,
  onSend,
  disabledSend,
  onSkillClick,
  onDocRefClick,
  onAttachmentClick,
}) => {
  return (
    <div className={styles.actionToolbar}>
      <div className={styles.toolsLeft}>
        <Tooltip title="选择 Skill">
          <Button
            type="text"
            size="small"
            shape="circle"
            className={styles.toolBtn}
            icon={<LuPuzzle size={16} />}
            onClick={onSkillClick}
          />
        </Tooltip>

        <Tooltip title="引用文档">
          <Button
            type="text"
            size="small"
            shape="circle"
            className={styles.toolBtn}
            icon={<LuFileText size={16} />}
            onClick={onDocRefClick}
          />
        </Tooltip>

        <Tooltip title="添加附件">
          <Button
            type="text"
            size="small"
            shape="circle"
            className={styles.toolBtn}
            icon={<LuPaperclip size={16} />}
            onClick={onAttachmentClick}
          />
        </Tooltip>

        <span className={styles.skillHint}>@skill:名称 快速调用</span>
      </div>

      <div className={styles.toolsRight}>
        <ModelSelector value={modelValue} onChange={onModelChange} />

        <Button
          type="primary"
          shape="circle"
          size="small"
          onClick={onSend}
          disabled={disabledSend}
          className={styles.sendBtn}
          icon={<LuSend size={14} />}
        />
      </div>
    </div>
  );
};

export default ActionToolbar;
