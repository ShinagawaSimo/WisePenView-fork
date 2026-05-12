import React, { useState, useCallback } from 'react';
import { Input } from 'antd';
import { LuX } from 'react-icons/lu';
import ActionToolbar from './ActionToolbar';
import SkillPicker from '@/components/ChatPage/ChatInputArea/SkillPicker';
import ContextTags from '@/components/ChatPage/ChatInputArea/ContextTags';
import { useChatPageStore } from '@/store/zustand';
import type { Model } from '@/components/ChatPanel/index.type';
import type { SkillSummary } from '@/domains';
import styles from './style.module.less';

const { TextArea } = Input;

interface ChatInputProps {
  onSend: (text: string) => void;
  sending: boolean;
  currentModelId: string;
  onModelChange: (model: Model) => void;
  hasSelectedContext: boolean;
  selectedContextText: string;
  onClearSelectedContext: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  sending,
  currentModelId,
  onModelChange,
  hasSelectedContext,
  selectedContextText,
  onClearSelectedContext,
}) => {
  const [value, setValue] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [skillPickerOpen, setSkillPickerOpen] = useState(false);
  const setActiveSkill = useChatPageStore((s) => s.setActiveSkill);

  const selectedPreviewChars = Array.from(selectedContextText);
  const selectedPreview =
    selectedPreviewChars.length <= 10
      ? selectedContextText
      : `${selectedPreviewChars.slice(0, 5).join('')}...${selectedPreviewChars.slice(-5).join('')}`;

  const handleSend = () => {
    if (!value.trim() || sending || !currentModelId) return;
    onSend(value.trim());
    setValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSkillSelect = useCallback(
    (skill: SkillSummary) => {
      setActiveSkill({
        skillId: skill.skillId,
        name: skill.displayName,
        version: skill.currentVersionId ?? 'latest',
      });
    },
    [setActiveSkill]
  );

  return (
    <div className={styles.container}>
      <div className={styles.inputCard}>
        {hasSelectedContext ? (
          <div className={styles.selectedHint}>
            <button
              type="button"
              className={styles.clearSelectedHintBtn}
              onClick={onClearSelectedContext}
              aria-label="清除已选内容"
            >
              <LuX size={12} />
            </button>
            <span className={styles.selectedHintText} title={selectedContextText}>
              选中内容：&ldquo;{selectedPreview}&rdquo;
            </span>
          </div>
        ) : null}

        <ContextTags />

        <TextArea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="输入消息，或输入 @skill:名称 调用 Skill..."
          autoSize={{ minRows: 1, maxRows: 8 }}
          className={styles.textarea}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
        />

        <ActionToolbar
          modelValue={currentModelId}
          onModelChange={onModelChange}
          onSend={handleSend}
          disabledSend={!value.trim() || sending || !currentModelId}
          onSkillClick={() => setSkillPickerOpen(true)}
          onDocRefClick={() => {}}
          onAttachmentClick={() => {}}
        />
      </div>

      <div className={styles.footerTip}>AI 内容仅供参考，请仔细甄别</div>

      <SkillPicker
        open={skillPickerOpen}
        onClose={() => setSkillPickerOpen(false)}
        onSelect={handleSkillSelect}
      />
    </div>
  );
};

export default ChatInput;
