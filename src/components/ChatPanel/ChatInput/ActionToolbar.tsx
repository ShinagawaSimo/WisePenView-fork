import { Button, Tooltip } from '@heroui/react';
import { Popover } from 'antd';
import { useState } from 'react';
import {
  LuHistory,
  LuPlus, // 对应搜索/历史
  LuSend, // 对应上传
  LuSettings, // 对应设置
} from 'react-icons/lu';

import ModelSelector from '../ModelSelector';
import type { ActionToolbarProps } from './index.type';
import { SettingsContent } from './SettingsPopover';
import styles from './style.module.less';

function ActionToolbar({
  modelValue,
  onModelChange,
  onSend,
  disabledSend,
  onUpload,
}: ActionToolbarProps) {
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className={styles.actionToolbar}>
      {/* 左侧功能区 */}
      <div className={styles.toolsLeft}>
        <Tooltip>
          <Tooltip.Trigger>
            <Button
              variant="ghost"
              isIconOnly
              size="sm"
              className={styles.toolBtn}
              onPress={onUpload}
            >
              <LuPlus />
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content>上传文件</Tooltip.Content>
        </Tooltip>

        <Popover
          content={<SettingsContent />}
          trigger="click"
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
          placement="bottom"
          arrow={false}
        >
          <Button variant="ghost" isIconOnly size="sm" className={styles.toolBtn}>
            <LuSettings />
          </Button>
        </Popover>

        <Tooltip>
          <Tooltip.Trigger>
            <Button variant="ghost" isIconOnly size="sm" className={styles.toolBtn}>
              <LuHistory />
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content>历史记录</Tooltip.Content>
        </Tooltip>
      </div>

      {/* 右侧功能区 */}
      <div className={styles.toolsRight}>
        <ModelSelector value={modelValue} onChange={onModelChange} />

        <Button
          variant="primary"
          isIconOnly
          size="sm"
          onPress={onSend}
          isDisabled={disabledSend}
          className={styles.sendBtn}
        >
          <LuSend size={14} />
        </Button>
      </div>
    </div>
  );
}

export default ActionToolbar;
