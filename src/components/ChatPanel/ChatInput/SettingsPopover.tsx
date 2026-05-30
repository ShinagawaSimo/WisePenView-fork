import { useDocumentLibraryStore } from '@/store/useDocumentLibraryStore';
import { Switch } from 'antd';
import styles from './style.module.less';

/** 设置面板——可扩展更多设置项 */
export function SettingsContent() {
  const { enabled, setEnabled } = useDocumentLibraryStore();

  return (
    <div className={styles.settingsPanel}>
      <div className={styles.settingsRow}>
        <span className={styles.settingsLabel}>聊天附件自动存入个人云盘</span>
        <Switch checked={enabled} onChange={setEnabled} size="small" />
      </div>
      <p className={styles.settingsHint}>仅支持PDF、office文档自动存入个人云盘。</p>
    </div>
  );
}
