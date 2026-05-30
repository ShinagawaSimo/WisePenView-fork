import { formatFileSize } from '@/utils/format/formatFileSize';
import { Spin } from 'antd';
import { LuCheck, LuCircleAlert, LuFile, LuX } from 'react-icons/lu';
import type { AttachmentChipsProps, UploadingFile } from './index.type';
import styles from './style.module.less';

const statusIcon = (f: UploadingFile) => {
  switch (f.status) {
    case 'init':
    case 'uploading':
    case 'deleting':
      return <Spin size="small" />;
    case 'done':
      return <LuCheck className={styles.chipIconDone} />;
    case 'error':
      return <LuCircleAlert className={styles.chipIconError} />;
  }
};

function AttachmentChips({ files, onRemove }: AttachmentChipsProps) {
  if (files.length === 0) return null;

  return (
    <div className={styles.chipList}>
      {files.map((f) => (
        <div key={f.id} className={`${styles.chip} ${styles[`chip_${f.status}`]}`}>
          <LuFile className={styles.chipFileIcon} />
          <div className={styles.chipInfo}>
            <span className={styles.chipName}>{f.file.name}</span>
            <span className={styles.chipSize}>{formatFileSize(f.file.size)}</span>
          </div>
          <span className={styles.chipStatus}>{statusIcon(f)}</span>
          {f.status === 'done' && (
            <button
              className={styles.chipRemove}
              onClick={() => onRemove(f.id)}
              aria-label="移除附件"
            >
              <LuX size={12} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

export default AttachmentChips;
