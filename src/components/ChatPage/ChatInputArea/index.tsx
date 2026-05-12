import React, { useState, useRef, useCallback } from 'react';
import { useMount, useUpdateEffect } from 'ahooks';
import { Button } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import ActionToolbar from './ActionToolbar';
import ContextTags from './ContextTags';
import SkillPicker from './SkillPicker';
import { useChatPageStore } from '@/store/zustand';
import type { SkillSummary } from '@/domains';
import styles from './style.module.less';

interface ChatInputAreaProps {
  onSend: (text: string) => void;
  sending: boolean;
}

const ChatInputArea: React.FC<ChatInputAreaProps> = ({ onSend, sending }) => {
  const [text, setText] = useState('');
  const [skillPickerOpen, setSkillPickerOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const setActiveSkill = useChatPageStore((s) => s.setActiveSkill);

  useMount(() => {
    textareaRef.current?.focus();
  });

  useUpdateEffect(() => {
    if (!sending) {
      textareaRef.current?.focus();
    }
  }, [sending]);

  const handleSend = useCallback(() => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    onSend(trimmed);
    setText('');
  }, [text, sending, onSend]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

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
    <div className={styles.inputArea}>
      <ActionToolbar
        onSkillClick={() => setSkillPickerOpen(true)}
        onDocRefClick={() => {}}
        onAttachmentClick={() => {}}
      />
      <ContextTags />
      <div className={styles.inputRow}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          placeholder="输入消息，或输入 @skill:名称 调用 Skill..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sending}
          rows={1}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          loading={sending}
          disabled={!text.trim()}
          className={styles.sendBtn}
        >
          发送
        </Button>
      </div>
      <SkillPicker
        open={skillPickerOpen}
        onClose={() => setSkillPickerOpen(false)}
        onSelect={handleSkillSelect}
      />
    </div>
  );
};

export default ChatInputArea;
