import type { ChatAttachmentMeta } from '@/components/ChatPanel/index.type';
import { useChatService } from '@/domains';
import { useDocumentLibraryStore } from '@/store/useDocumentLibraryStore';
import { parseErrorMessage } from '@/utils/error';
import { Button, Modal } from '@heroui/react';
import { useRequest } from 'ahooks';
import { Checkbox, Input } from 'antd';
import React, { useCallback, useRef, useState } from 'react';
import { LuX } from 'react-icons/lu';
import ActionToolbar from './ActionToolbar';
import AttachmentChips from './AttachmentChips';
import type { ChatInputProps, UploadingFile } from './index.type';
import styles from './style.module.less';

const { TextArea } = Input;

/** 生成前端临时 ID，无需服务端生成 */
let _id = 0;
const nextId = () => `att-${Date.now()}-${++_id}`;

/** 提取文件扩展名（不带点） */
const getExtension = (name: string): string => {
  const i = name.lastIndexOf('.');
  return i > 0 ? name.slice(i + 1) : '';
};

function ChatInput({
  sessionId,
  onSend,
  sending,
  currentModelId,
  onModelChange,
  hasSelectedContext,
  selectedContextText,
  onClearSelectedContext,
}: ChatInputProps) {
  const [value, setValue] = useState('');
  const [isComposing, setIsComposing] = useState(false);
  const [attachments, setAttachments] = useState<UploadingFile[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatService = useChatService();
  const {
    enabled: libraryEnabled,
    skipDeleteConfirm,
    setSkipDeleteConfirm,
  } = useDocumentLibraryStore();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    filename: string;
    objectKey?: string;
  } | null>(null);

  const { runAsync: runUploadAttachment } = useRequest(chatService.uploadAttachment, {
    manual: true,
  });
  const { runAsync: runDeleteAttachment } = useRequest(chatService.deleteAttachment, {
    manual: true,
  });

  const selectedPreviewChars = Array.from(selectedContextText);
  const selectedPreview =
    selectedPreviewChars.length <= 10
      ? selectedContextText
      : `${selectedPreviewChars.slice(0, 5).join('')}...${selectedPreviewChars.slice(-5).join('')}`;

  const handleSend = () => {
    if (!value.trim() || sending || !currentModelId) return;
    // 仅携带已上传成功的附件
    const done = attachments.filter((a) => a.status === 'done');
    const metas: ChatAttachmentMeta[] = done.map((a) => ({
      name: a.file.name,
      size: a.file.size,
      extension: getExtension(a.file.name),
      objectKey: a.objectKey,
    }));
    onSend(value.trim(), metas);
    setValue('');
    // 清理已发送的附件，未完成上传的保留
    setAttachments((prev) => prev.filter((a) => a.status !== 'done'));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleUploadClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const updateFile = (id: string, patch: Partial<UploadingFile>) => {
    setAttachments((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const doRemoveFile = async (id: string, filename: string, objectKey?: string) => {
    if (!objectKey) {
      setAttachments((prev) => prev.filter((x) => x.id !== id));
      return;
    }
    setAttachments((prev) =>
      prev.map((x) => (x.id === id ? { ...x, status: 'deleting' as const } : x))
    );
    try {
      await runDeleteAttachment(sessionId ?? '', filename);
      setAttachments((prev) => prev.filter((x) => x.id !== id));
    } catch (err: unknown) {
      const message = parseErrorMessage(err);
      console.warn(`attachment delete failed filename="${filename}" error="${message}"`);
      updateFile(id, { status: 'error', errorMsg: message });
    }
  };

  const removeFile = async (id: string) => {
    const file = attachments.find((x) => x.id === id);
    if (!file) return;
    if (libraryEnabled && !skipDeleteConfirm) {
      setDeleteTarget({ id, filename: file.file.name, objectKey: file.objectKey });
      setDeleteConfirmOpen(true);
      return;
    }
    await doRemoveFile(id, file.file.name, file.objectKey);
  };

  const uploadOne = async (file: File) => {
    const id = nextId();
    const entry: UploadingFile = { id, file, status: 'init' };
    setAttachments((prev) => [...prev, entry]);

    try {
      updateFile(id, { status: 'uploading' });

      const resp = await runUploadAttachment(sessionId ?? '', file, libraryEnabled);
      updateFile(id, { objectKey: `${resp.session_id}/${resp.filename}` });
      updateFile(id, { status: 'done' });

      if (resp.doc_error) {
        console.warn(`documentUpload failed error="${resp.doc_error}"`);
      }
    } catch (err: unknown) {
      const message = parseErrorMessage(err);
      console.warn(`attachmentUpload failed filename="${file.name}" error="${message}"`);
      updateFile(id, { status: 'error', errorMsg: message });
    }
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (let i = 0; i < files.length; i++) {
      uploadOne(files[i]);
    }
    // 清空 input，允许重复选择同一文件
    e.target.value = '';
  };

  return (
    <div className={styles.container}>
      {/* 隐藏的文件选择器 */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className={styles.hiddenFileInput}
        onChange={handleFilesSelected}
      />

      <Modal isOpen={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <Modal.Backdrop isDismissable={false}>
          <Modal.Container>
            <Modal.Dialog>
              <Modal.Header>
                <Modal.Heading>删除附件</Modal.Heading>
              </Modal.Header>
              <Modal.Body>
                <p>此文件在文档库中的副本不会被删除。</p>
                <Checkbox
                  checked={skipDeleteConfirm}
                  onChange={(e) => setSkipDeleteConfirm(e.target.checked)}
                >
                  下次不再提示
                </Checkbox>
              </Modal.Body>
              <Modal.Footer>
                <Button
                  onPress={() => {
                    setDeleteConfirmOpen(false);
                    setDeleteTarget(null);
                  }}
                >
                  取消
                </Button>
                <Button
                  variant="primary"
                  onPress={async () => {
                    setDeleteConfirmOpen(false);
                    if (deleteTarget)
                      await doRemoveFile(
                        deleteTarget.id,
                        deleteTarget.filename,
                        deleteTarget.objectKey
                      );
                    setDeleteTarget(null);
                  }}
                >
                  确认删除
                </Button>
              </Modal.Footer>
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>

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
        <TextArea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="输入消息..."
          autoSize={{ minRows: 1, maxRows: 8 }}
          className={styles.textarea}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
        />

        <AttachmentChips files={attachments} onRemove={removeFile} />

        <ActionToolbar
          modelValue={currentModelId}
          onModelChange={onModelChange}
          onSend={handleSend}
          disabledSend={!value.trim() || sending || !currentModelId}
          onUpload={handleUploadClick}
        />
      </div>

      <div className={styles.footerTip}>AI 内容仅供参考，请仔细甄别</div>
    </div>
  );
}

export default ChatInput;
