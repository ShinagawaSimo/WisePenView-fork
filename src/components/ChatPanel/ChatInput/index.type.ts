import type { ChatAttachmentMeta, Model } from '@/components/ChatPanel/index.type';

export interface ChatInputProps {
  sessionId?: string;
  onSend: (text: string, attachmentMetas: ChatAttachmentMeta[]) => void;
  sending: boolean;
  currentModelId: string;
  onModelChange: (model: Model) => void;
  hasSelectedContext: boolean;
  selectedContextText: string;
  onClearSelectedContext: () => void;
}

export interface ActionToolbarProps {
  modelValue: string;
  onModelChange: (model: Model) => void;
  onSend: () => void;
  disabledSend: boolean;
  onUpload?: () => void;
}

export interface UploadingFile {
  id: string;
  file: File;
  objectKey?: string;
  status: 'init' | 'uploading' | 'done' | 'error' | 'deleting';
  errorMsg?: string;
}

export interface AttachmentChipsProps {
  files: UploadingFile[];
  onRemove: (id: string) => void;
}
